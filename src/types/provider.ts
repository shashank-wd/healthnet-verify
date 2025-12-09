export type ProviderStatus = 'validated' | 'updated' | 'needs_review' | 'pending';

export type Priority = 'high' | 'medium' | 'low';

export type Country = 'US' | 'IN';

export type ProviderSource = 'US_NPI' | 'IN_REGISTRY' | 'MANUAL';

export interface ProviderAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface DataSource {
  name: string;
  verified: boolean;
  lastChecked: string;
}

export interface Discrepancy {
  field: string;
  originalValue: string;
  newValue: string;
  source: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ConfidenceBreakdown {
  name: number;
  phone: number;
  address: number;
  specialty: number;
  license: number;
  overall: number;
}

export interface Provider {
  id: string;
  name: string;
  npi: string;
  specialty: string;
  phone: string;
  address: ProviderAddress;
  licenseNumber: string;
  certifications: string[];
  status: ProviderStatus;
  confidenceScore: number;
  confidenceBreakdown: ConfidenceBreakdown;
  originalData: {
    name: string;
    phone: string;
    address: ProviderAddress;
    specialty: string;
  };
  validatedData: {
    name: string;
    phone: string;
    address: ProviderAddress;
    specialty: string;
  };
  discrepancies: Discrepancy[];
  dataSources: DataSource[];
  lastUpdated: string;
  priority: Priority;
  memberImpact: number;
  reviewReason?: string;
  country?: Country;
}

// New types for NPI Registry integration
export interface RegistryProvider {
  id?: string;
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
  raw_api_payload?: Record<string, unknown>;
  source: ProviderSource;
  country?: Country;
  correctness_score?: number;
  last_synced_at?: string;
  needs_review?: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface FieldScore {
  score: number;
  userValue: string;
  registryValue: string;
  status: 'match' | 'partial' | 'mismatch';
}

export interface ValidationResult {
  success: boolean;
  found: boolean;
  registryData?: RegistryProvider;
  userData?: Record<string, unknown>;
  correctnessScore?: number;
  fieldScores?: Record<string, FieldScore>;
  message?: string;
  error?: string;
}

export interface RegistrySearchResult {
  success: boolean;
  data?: RegistryProvider[];
  error?: string;
}

export interface ValidationStats {
  total: number;
  validated: number;
  updated: number;
  needsReview: number;
  averageConfidence: number;
  processingTime?: number;
}

export interface FilterOptions {
  status: ProviderStatus | 'all';
  searchQuery: string;
  sortBy: 'name' | 'confidence' | 'status' | 'lastUpdated';
  sortOrder: 'asc' | 'desc';
}
