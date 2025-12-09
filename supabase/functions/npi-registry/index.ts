import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// US NPI Registry API (CMS NPPES)
const US_NPI_API_BASE_URL = "https://npiregistry.cms.hhs.gov/api";

// India HPR (Health Professional Registry) API
const IN_HPR_BASE_URL = "https://hpr.abdm.gov.in/api/v1";
const IN_HPR_API_KEY = Deno.env.get('IN_HPR_API_KEY') || '';

interface ProviderSearchParams {
  country: 'US' | 'IN';
  npi?: string;
  providerId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  limit?: number;
}

interface NormalizedProvider {
  npi_number?: string;
  provider_id?: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  specialty?: string;
  organization_name?: string;
  taxonomy_code?: string;
  taxonomy_description?: string;
  enumeration_type?: string;
  raw_api_payload: Record<string, unknown>;
  source: 'US_NPI' | 'IN_REGISTRY';
}

// Normalize phone number for comparison
function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)\+\.]/g, '');
}

// Normalize address for comparison
function normalizeAddress(address: string | null | undefined): string {
  if (!address) return '';
  return address.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Calculate field match score (0, 0.5, or 1)
function calculateFieldScore(userValue: string | null | undefined, registryValue: string | null | undefined, isPhone = false): number {
  const normalizedUser = isPhone ? normalizePhone(userValue) : normalizeAddress(userValue);
  const normalizedRegistry = isPhone ? normalizePhone(registryValue) : normalizeAddress(registryValue);
  
  if (!normalizedUser || !normalizedRegistry) return 0;
  if (normalizedUser === normalizedRegistry) return 1;
  
  // Fuzzy matching for partial matches
  if (normalizedUser.includes(normalizedRegistry) || normalizedRegistry.includes(normalizedUser)) {
    return 0.5;
  }
  
  // Levenshtein-like similarity for close matches
  const longer = normalizedUser.length > normalizedRegistry.length ? normalizedUser : normalizedRegistry;
  const shorter = normalizedUser.length > normalizedRegistry.length ? normalizedRegistry : normalizedUser;
  const longerLength = longer.length;
  
  if (longerLength === 0) return 1;
  
  let matchCount = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matchCount++;
  }
  
  const similarity = matchCount / longerLength;
  if (similarity > 0.8) return 0.5;
  
  return 0;
}

// Calculate overall correctness score
function calculateCorrectnessScore(
  userData: Record<string, unknown>,
  registryData: NormalizedProvider
): { overall: number; fieldScores: Record<string, { score: number; userValue: string; registryValue: string; status: string }> } {
  const weights = {
    name: 2,
    phone: 1.5,
    address_line1: 1.5,
    city: 1,
    state: 1,
    postal_code: 1,
    specialty: 1,
  };

  const fieldScores: Record<string, { score: number; userValue: string; registryValue: string; status: string }> = {};
  let totalWeight = 0;
  let totalScore = 0;

  for (const [field, weight] of Object.entries(weights)) {
    const userValue = String(userData[field] || '');
    const registryValue = String(registryData[field as keyof NormalizedProvider] || '');
    const isPhone = field === 'phone';
    const score = calculateFieldScore(userValue, registryValue, isPhone);
    
    fieldScores[field] = {
      score,
      userValue,
      registryValue,
      status: score === 1 ? 'match' : score === 0.5 ? 'partial' : 'mismatch'
    };
    
    totalWeight += weight;
    totalScore += score * weight;
  }

  return {
    overall: Math.round((totalScore / totalWeight) * 100),
    fieldScores
  };
}

// Parse US NPI Registry response
function parseUSNPIResponse(result: Record<string, unknown>): NormalizedProvider {
  const basic = result.basic as Record<string, unknown> || {};
  const addresses = result.addresses as Array<Record<string, unknown>> || [];
  const taxonomies = result.taxonomies as Array<Record<string, unknown>> || [];
  
  const primaryAddress = addresses.find(a => a.address_purpose === 'LOCATION') || addresses[0] || {};
  const primaryTaxonomy = taxonomies.find(t => t.primary) || taxonomies[0] || {};
  
  const firstName = String(basic.first_name || '');
  const lastName = String(basic.last_name || '');
  const orgName = String(basic.organization_name || '');
  
  return {
    npi_number: String(result.number || ''),
    name: orgName || `${firstName} ${lastName}`.trim(),
    first_name: firstName || undefined,
    last_name: lastName || undefined,
    phone: String(primaryAddress.telephone_number || ''),
    address_line1: String(primaryAddress.address_1 || ''),
    address_line2: String(primaryAddress.address_2 || '') || undefined,
    city: String(primaryAddress.city || ''),
    state: String(primaryAddress.state || ''),
    postal_code: String(primaryAddress.postal_code || '').slice(0, 5),
    specialty: String(primaryTaxonomy.desc || ''),
    organization_name: orgName || undefined,
    taxonomy_code: String(primaryTaxonomy.code || '') || undefined,
    taxonomy_description: String(primaryTaxonomy.desc || '') || undefined,
    enumeration_type: String(result.enumeration_type || ''),
    raw_api_payload: result,
    source: 'US_NPI'
  };
}

// Search US NPI Registry
async function searchUSNPI(params: ProviderSearchParams): Promise<{ success: boolean; data?: NormalizedProvider[]; error?: string }> {
  try {
    const queryParams = new URLSearchParams({ version: '2.1' });
    
    if (params.npi) {
      queryParams.append('number', params.npi);
    } else {
      if (params.firstName) queryParams.append('first_name', params.firstName);
      if (params.lastName) queryParams.append('last_name', params.lastName);
      if (params.name) queryParams.append('organization_name', params.name);
      if (params.city) queryParams.append('city', params.city);
      if (params.state) queryParams.append('state', params.state);
      if (params.postalCode) queryParams.append('postal_code', params.postalCode);
    }
    
    queryParams.append('limit', String(params.limit || 10));
    
    const url = `${US_NPI_API_BASE_URL}/?${queryParams.toString()}`;
    console.log('Fetching US NPI:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: 'Rate limit exceeded. Please try again later.' };
      }
      return { success: false, error: `NPI API error: ${response.status}` };
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return { success: true, data: [] };
    }
    
    const providers = data.results.map(parseUSNPIResponse);
    return { success: true, data: providers };
    
  } catch (error) {
    console.error('US NPI search error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Parse India HPR response
function parseIndiaHPRResponse(result: Record<string, unknown>): NormalizedProvider {
  const professionalName = String(result.name || result.professionalName || '');
  const firstName = String(result.firstName || '');
  const lastName = String(result.lastName || '');
  
  const address = result.address as Record<string, unknown> || {};
  const qualification = (result.qualifications as Array<Record<string, unknown>> || [])[0] || {};
  
  return {
    provider_id: String(result.hprId || result.registrationNumber || result.id || ''),
    name: professionalName || `${firstName} ${lastName}`.trim(),
    first_name: firstName || undefined,
    last_name: lastName || undefined,
    phone: String(result.mobile || result.phone || result.contactNumber || ''),
    address_line1: String(address.line1 || address.addressLine1 || address.address || ''),
    address_line2: String(address.line2 || address.addressLine2 || '') || undefined,
    city: String(address.city || address.district || ''),
    state: String(address.state || address.stateName || ''),
    postal_code: String(address.pincode || address.postalCode || ''),
    specialty: String(qualification.specialty || result.specialty || result.specialization || ''),
    organization_name: String(result.organization || result.hospitalName || '') || undefined,
    taxonomy_code: String(qualification.qualificationCode || '') || undefined,
    taxonomy_description: String(qualification.qualificationName || qualification.degree || '') || undefined,
    enumeration_type: String(result.professionalType || result.category || 'Individual'),
    raw_api_payload: result,
    source: 'IN_REGISTRY'
  };
}

// Search India HPR (Health Professional Registry)
async function searchIndiaRegistry(params: ProviderSearchParams): Promise<{ success: boolean; data?: NormalizedProvider[]; error?: string }> {
  try {
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (IN_HPR_API_KEY) {
      headers['Authorization'] = `Bearer ${IN_HPR_API_KEY}`;
    }

    let url: string;
    
    // Determine which endpoint to use based on params
    if (params.providerId) {
      // Search by registration number
      url = `${IN_HPR_BASE_URL}/search/professionalByRegistrationNumber?registrationNumber=${encodeURIComponent(params.providerId)}`;
      console.log('Fetching India HPR by registration number:', url);
    } else if (params.name || params.firstName || params.lastName) {
      // Search by name
      const searchName = params.name || `${params.firstName || ''} ${params.lastName || ''}`.trim();
      url = `${IN_HPR_BASE_URL}/search/professionalByName?name=${encodeURIComponent(searchName)}`;
      console.log('Fetching India HPR by name:', url);
    } else {
      return { success: true, data: [] };
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: 'Rate limit exceeded. Please try again later.' };
      }
      if (response.status === 404) {
        return { success: true, data: [] };
      }
      console.error('India HPR API error:', response.status, await response.text());
      return { success: false, error: `India HPR API error: ${response.status}` };
    }
    
    const data = await response.json();
    console.log('India HPR response:', JSON.stringify(data).slice(0, 500));
    
    // Handle different response structures
    let results: Array<Record<string, unknown>> = [];
    if (Array.isArray(data)) {
      results = data;
    } else if (data.professionals) {
      results = data.professionals;
    } else if (data.results) {
      results = data.results;
    } else if (data.hprId || data.registrationNumber) {
      // Single result
      results = [data];
    }
    
    const providers = results.map(parseIndiaHPRResponse);
    return { success: true, data: providers };
    
  } catch (error) {
    console.error('India HPR search error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (req.method === 'GET' && action === 'search') {
      // Search providers from registry
      const country = url.searchParams.get('country') as 'US' | 'IN' || 'US';
      const npi = url.searchParams.get('npi') || undefined;
      const providerId = url.searchParams.get('providerId') || undefined;
      const firstName = url.searchParams.get('firstName') || undefined;
      const lastName = url.searchParams.get('lastName') || undefined;
      const name = url.searchParams.get('name') || undefined;
      const city = url.searchParams.get('city') || undefined;
      const state = url.searchParams.get('state') || undefined;
      const limit = parseInt(url.searchParams.get('limit') || '10');

      const searchParams: ProviderSearchParams = {
        country,
        npi,
        providerId,
        firstName,
        lastName,
        name,
        city,
        state,
        limit
      };

      const result = country === 'US' 
        ? await searchUSNPI(searchParams)
        : await searchIndiaRegistry(searchParams);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST' && action === 'validate') {
      // Validate single provider against registry
      const body = await req.json();
      const { country, userData } = body;

      const searchParams: ProviderSearchParams = {
        country,
        npi: userData.npi_number,
        providerId: userData.provider_id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        name: userData.name,
        city: userData.city,
        state: userData.state
      };

      const result = country === 'US'
        ? await searchUSNPI(searchParams)
        : await searchIndiaRegistry(searchParams);

      if (!result.success) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!result.data || result.data.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          found: false,
          message: 'No matching provider found in registry'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const registryProvider = result.data[0];
      const scores = calculateCorrectnessScore(userData, registryProvider);

      // Log the validation in sync_history
      await supabaseClient.from('sync_history').insert({
        user_id: user.id,
        action: 'VALIDATE',
        country,
        npi_or_provider_id: userData.npi_number || userData.provider_id,
        correctness_score: scores.overall,
        field_scores: scores.fieldScores,
        notes: `Validated against ${country === 'US' ? 'NPI Registry' : 'India Registry'}`
      });

      return new Response(JSON.stringify({
        success: true,
        found: true,
        registryData: registryProvider,
        userData,
        correctnessScore: scores.overall,
        fieldScores: scores.fieldScores
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST' && action === 'save') {
      // Save provider to local database
      const body = await req.json();
      const { provider, country, correctnessScore } = body;

      const providerData = {
        user_id: user.id,
        country,
        npi_number: provider.npi_number || null,
        provider_id: provider.provider_id || null,
        name: provider.name,
        first_name: provider.first_name || null,
        last_name: provider.last_name || null,
        phone: provider.phone || null,
        address_line1: provider.address_line1 || null,
        address_line2: provider.address_line2 || null,
        city: provider.city || null,
        state: provider.state || null,
        postal_code: provider.postal_code || null,
        specialty: provider.specialty || null,
        organization_name: provider.organization_name || null,
        taxonomy_code: provider.taxonomy_code || null,
        taxonomy_description: provider.taxonomy_description || null,
        enumeration_type: provider.enumeration_type || null,
        raw_api_payload: provider.raw_api_payload || null,
        source: provider.source || (country === 'US' ? 'US_NPI' : 'IN_REGISTRY'),
        correctness_score: correctnessScore || null,
        last_synced_at: new Date().toISOString(),
        needs_review: correctnessScore && correctnessScore < 80
      };

      const { data: savedProvider, error: saveError } = await supabaseClient
        .from('providers')
        .upsert(providerData, {
          onConflict: country === 'US' ? 'user_id,country,npi_number' : 'user_id,country,provider_id'
        })
        .select()
        .single();

      if (saveError) {
        console.error('Save error:', saveError);
        return new Response(JSON.stringify({ error: saveError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Log the save action
      await supabaseClient.from('sync_history').insert({
        user_id: user.id,
        provider_id: savedProvider.id,
        action: 'SYNC',
        country,
        npi_or_provider_id: provider.npi_number || provider.provider_id,
        new_values: providerData,
        correctness_score: correctnessScore,
        notes: 'Provider saved to directory'
      });

      return new Response(JSON.stringify({ success: true, provider: savedProvider }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
