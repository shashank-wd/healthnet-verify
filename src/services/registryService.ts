import { supabase } from '@/integrations/supabase/client';
import { Country, RegistryProvider, ValidationResult, RegistrySearchResult } from '@/types/provider';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/npi-registry`;

export interface ProviderSearchParams {
  country: Country;
  npi?: string;
  providerId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  city?: string;
  state?: string;
  limit?: number;
}

export interface UserProviderData {
  country: Country;
  npi_number?: string;
  provider_id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  specialty?: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`
  };
}

export const registryService = {
  // Search providers from NPI/India registry
  async searchProviders(params: ProviderSearchParams): Promise<RegistrySearchResult> {
    try {
      const queryParams = new URLSearchParams({ action: 'search' });
      queryParams.append('country', params.country);
      if (params.npi) queryParams.append('npi', params.npi);
      if (params.providerId) queryParams.append('providerId', params.providerId);
      if (params.firstName) queryParams.append('firstName', params.firstName);
      if (params.lastName) queryParams.append('lastName', params.lastName);
      if (params.name) queryParams.append('name', params.name);
      if (params.city) queryParams.append('city', params.city);
      if (params.state) queryParams.append('state', params.state);
      if (params.limit) queryParams.append('limit', String(params.limit));

      const headers = await getAuthHeaders();
      const response = await fetch(`${FUNCTION_URL}?${queryParams.toString()}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Search failed' };
      }

      return await response.json();
    } catch (error) {
      console.error('Registry search error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Search failed' };
    }
  },

  // Validate user data against registry
  async validateProvider(userData: UserProviderData): Promise<ValidationResult> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${FUNCTION_URL}?action=validate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          country: userData.country,
          userData
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, found: false, error: error.error || 'Validation failed' };
      }

      return await response.json();
    } catch (error) {
      console.error('Validation error:', error);
      return { success: false, found: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }
  },

  // Save provider to local database
  async saveProvider(
    provider: RegistryProvider,
    country: Country,
    correctnessScore?: number
  ): Promise<{ success: boolean; provider?: RegistryProvider; error?: string }> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${FUNCTION_URL}?action=save`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          provider,
          country,
          correctnessScore
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Save failed' };
      }

      return await response.json();
    } catch (error) {
      console.error('Save error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Save failed' };
    }
  },

  // Get cached providers from local database
  async getCachedProviders(country?: Country): Promise<RegistryProvider[]> {
    try {
      let query = supabase.from('providers').select('*').order('created_at', { ascending: false });
      
      if (country) {
        query = query.eq('country', country);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch cached providers error:', error);
        return [];
      }

      return data as unknown as RegistryProvider[];
    } catch (error) {
      console.error('Get cached providers error:', error);
      return [];
    }
  },

  // Get provider by NPI or ID from cache, or fetch from registry
  async getProviderByNpiOrId(
    country: Country,
    npiOrId: string,
    forceRefresh = false
  ): Promise<{ provider?: RegistryProvider; fromCache: boolean; error?: string }> {
    try {
      // Check cache first
      if (!forceRefresh) {
        const column = country === 'US' ? 'npi_number' : 'provider_id';
        const { data: cached } = await supabase
          .from('providers')
          .select('*')
          .eq('country', country)
          .eq(column, npiOrId)
          .maybeSingle();

        if (cached) {
          // Check if data is stale (older than 7 days)
          const lastSynced = cached.last_synced_at ? new Date(cached.last_synced_at) : null;
          const isStale = !lastSynced || (Date.now() - lastSynced.getTime()) > 7 * 24 * 60 * 60 * 1000;

          if (!isStale) {
            return { provider: cached as unknown as RegistryProvider, fromCache: true };
          }
        }
      }

      // Fetch from registry
      const searchParams: ProviderSearchParams = {
        country,
        ...(country === 'US' ? { npi: npiOrId } : { providerId: npiOrId })
      };

      const result = await this.searchProviders(searchParams);

      if (!result.success || !result.data || result.data.length === 0) {
        return { fromCache: false, error: result.error || 'Provider not found in registry' };
      }

      const provider = result.data[0];

      // Save to cache
      await this.saveProvider(provider, country);

      return { provider, fromCache: false };
    } catch (error) {
      console.error('Get provider error:', error);
      return { fromCache: false, error: error instanceof Error ? error.message : 'Failed to get provider' };
    }
  }
};
