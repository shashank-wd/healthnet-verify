export type ProviderStatus = 'validated' | 'updated' | 'needs_review' | 'pending';

export type Priority = 'high' | 'medium' | 'low';

export interface ProviderAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
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
