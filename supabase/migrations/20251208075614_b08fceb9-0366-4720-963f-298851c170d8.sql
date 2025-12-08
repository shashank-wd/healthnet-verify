-- Create providers table for caching registry data
CREATE TABLE public.providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country TEXT NOT NULL CHECK (country IN ('US', 'IN')),
  npi_number TEXT,
  provider_id TEXT,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  specialty TEXT,
  organization_name TEXT,
  taxonomy_code TEXT,
  taxonomy_description TEXT,
  enumeration_type TEXT,
  status TEXT DEFAULT 'active',
  raw_api_payload JSONB,
  source TEXT NOT NULL CHECK (source IN ('US_NPI', 'IN_REGISTRY', 'MANUAL')),
  correctness_score NUMERIC(5,2),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  needs_review BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, country, npi_number),
  UNIQUE(user_id, country, provider_id)
);

-- Create sync_history table for audit trail
CREATE TABLE public.sync_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('LOOKUP', 'VALIDATE', 'SYNC', 'UPDATE', 'BATCH_VALIDATE')),
  country TEXT NOT NULL,
  npi_or_provider_id TEXT,
  fields_updated TEXT[],
  previous_values JSONB,
  new_values JSONB,
  correctness_score NUMERIC(5,2),
  field_scores JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for providers (per-user access)
CREATE POLICY "Users can view their own providers"
ON public.providers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own providers"
ON public.providers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own providers"
ON public.providers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own providers"
ON public.providers FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for sync_history
CREATE POLICY "Users can view their own sync history"
ON public.sync_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync history"
ON public.sync_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_providers_user_country ON public.providers(user_id, country);
CREATE INDEX idx_providers_npi ON public.providers(npi_number) WHERE npi_number IS NOT NULL;
CREATE INDEX idx_providers_name ON public.providers(name);
CREATE INDEX idx_sync_history_provider ON public.sync_history(provider_id);
CREATE INDEX idx_sync_history_user ON public.sync_history(user_id, created_at DESC);

-- Update trigger for providers
CREATE TRIGGER update_providers_updated_at
BEFORE UPDATE ON public.providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();