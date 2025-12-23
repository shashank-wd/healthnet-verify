import { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, Loader2, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { registryService, UserProviderData } from '@/services/registryService';
import { Country, ValidationResult, FieldScore } from '@/types/provider';
import { cn } from '@/lib/utils';
import { countries, getCountryByCode, getCountryByPhoneCode, validatePincode, validatePincodeForState } from '@/data/countriesAndStates';

function FieldComparisonRow({ 
  field, 
  label, 
  fieldScore 
}: { 
  field: string; 
  label: string; 
  fieldScore?: FieldScore;
}) {
  if (!fieldScore) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'match':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'match':
        return 'bg-green-500/10 border-green-500/20';
      case 'partial':
        return 'bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <div className={cn('grid grid-cols-3 gap-4 p-3 rounded-lg border', getStatusColor(fieldScore.status))}>
      <div className="flex items-center gap-2">
        {getStatusIcon(fieldScore.status)}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="text-sm">
        <span className="text-muted-foreground">Your data: </span>
        <span className="font-medium">{fieldScore.userValue || '—'}</span>
      </div>
      <div className="text-sm">
        <span className="text-muted-foreground">Registry: </span>
        <span className="font-medium">{fieldScore.registryValue || '—'}</span>
      </div>
    </div>
  );
}

export default function SingleProviderCheckPage() {
  const { toast } = useToast();
  const [country, setCountry] = useState<Country>('US');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  
  const [formData, setFormData] = useState<UserProviderData>({
    country: 'US',
    npi_number: '',
    provider_id: '',
    name: '',
    first_name: '',
    last_name: '',
    phone: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    specialty: ''
  });

  const selectedPhoneCountry = getCountryByPhoneCode(phoneCode);
  const selectedCountryData = selectedPhoneCountry || getCountryByCode(country);
  const availableStates = selectedPhoneCountry?.states || [];

  const handleCountryChange = (newCountry: Country) => {
    setCountry(newCountry);
    setFormData(prev => ({ ...prev, country: newCountry, state: '', postal_code: '' }));
    setValidationResult(null);
    setPincodeError('');
    // Update phone code based on country
    const countryData = getCountryByCode(newCountry);
    if (countryData) {
      setPhoneCode(countryData.phoneCode);
    }
  };

  const handleStateChange = (newState: string) => {
    setFormData(prev => ({ ...prev, state: newState }));
    // Revalidate pincode when state changes
    if (formData.postal_code && selectedCountryData) {
      const validation = validatePincodeForState(formData.postal_code, newState, selectedCountryData.name);
      if (!validation.valid) {
        setPincodeError(validation.message || 'Invalid pincode for selected state');
      } else {
        setPincodeError('');
      }
    }
  };

  const handleInputChange = (field: keyof UserProviderData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneNumberChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setPhoneNumber(digitsOnly);
    setFormData(prev => ({ ...prev, phone: digitsOnly ? `${phoneCode} ${digitsOnly}` : '' }));
  };

  const handlePostalCodeChange = (value: string) => {
    // Only allow digits for US and India
    const digitsOnly = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, postal_code: digitsOnly }));
    
    // Validate pincode
    if (digitsOnly && selectedCountryData) {
      // First check format
      if (!validatePincode(digitsOnly, selectedCountryData.name)) {
        setPincodeError(`Invalid format. Example: ${selectedCountryData.pincodePlaceholder}`);
      } else if (formData.state) {
        // Then validate against state
        const validation = validatePincodeForState(digitsOnly, formData.state, selectedCountryData.name);
        if (!validation.valid) {
          setPincodeError(validation.message || 'Invalid pincode for selected state');
        } else {
          setPincodeError('');
        }
      } else {
        setPincodeError('');
      }
    } else {
      setPincodeError('');
    }
  };

  const handleValidate = async () => {
    if (!formData.npi_number && !formData.provider_id && !formData.name && !formData.first_name) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please enter an NPI/Provider ID or provider name to search.'
      });
      return;
    }

    setLoading(true);
    setValidationResult(null);

    try {
      const result = await registryService.validateProvider(formData);
      setValidationResult(result);

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Validation failed',
          description: result.error || 'Could not validate provider'
        });
      } else if (!result.found) {
        toast({
          title: 'Provider not found',
          description: 'No matching provider found in the registry.'
        });
      } else {
        toast({
          title: 'Validation complete',
          description: `Correctness score: ${result.correctnessScore}%`
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDirectory = async () => {
    if (!validationResult?.registryData) return;

    setSaving(true);
    try {
      const result = await registryService.saveProvider(
        validationResult.registryData,
        country,
        validationResult.correctnessScore
      );

      if (result.success) {
        toast({
          title: 'Provider saved',
          description: 'Provider has been added to your directory.'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Save failed',
          description: result.error || 'Could not save provider'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred'
      });
    } finally {
      setSaving(false);
    }
  };

  

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Single Provider Check
        </h1>
        <p className="text-muted-foreground">
          Validate provider information against official registries
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Provider Information</CardTitle>
            <CardDescription>
              Enter the provider details you want to validate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={country} onValueChange={(v) => handleCountryChange(v as Country)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">🇺🇸 USA (NPI Registry)</SelectItem>
                  <SelectItem value="IN">🇮🇳 India (Provider Registry)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{country === 'US' ? 'NPI Number' : 'Provider ID'}</Label>
              <Input
                placeholder={country === 'US' ? 'e.g., 1234567890' : 'e.g., IN12345'}
                value={country === 'US' ? formData.npi_number : formData.provider_id}
                onChange={(e) => handleInputChange(
                  country === 'US' ? 'npi_number' : 'provider_id',
                  e.target.value
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  placeholder="Smith"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input
                placeholder="Medical Center"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <div className="flex gap-2">
                <Select value={phoneCode} onValueChange={(v) => {
                  setPhoneCode(v);
                  // Sync country with phone code selection
                  const phoneCountry = getCountryByPhoneCode(v);
                  if (phoneCountry) {
                    const newCountry = phoneCountry.code as Country;
                    setCountry(newCountry);
                    setFormData(prev => ({ 
                      ...prev, 
                      country: newCountry, 
                      state: '', 
                      postal_code: '',
                      phone: phoneNumber ? `${v} ${phoneNumber}` : '' 
                    }));
                    setPincodeError('');
                  } else if (phoneNumber) {
                    setFormData(prev => ({ ...prev, phone: `${v} ${phoneNumber}` }));
                  }
                }}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue>
                      {selectedPhoneCountry ? `${selectedPhoneCountry.flag} ${phoneCode}` : phoneCode}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.phoneCode}>
                        <span className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span>{c.phoneCode}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                placeholder="123 Medical Drive"
                value={formData.address_line1}
                onChange={(e) => handleInputChange('address_line1', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Select 
                  value={formData.state} 
                  onValueChange={handleStateChange}
                  disabled={availableStates.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStates.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{country === 'US' ? 'ZIP Code' : 'PIN Code'}</Label>
                <Input
                  placeholder={selectedCountryData?.pincodePlaceholder || '12345'}
                  value={formData.postal_code}
                  onChange={(e) => handlePostalCodeChange(e.target.value)}
                  maxLength={selectedCountryData?.pincodeLength ? selectedCountryData.pincodeLength + 2 : 10}
                  className={pincodeError ? 'border-destructive' : ''}
                />
                {pincodeError && (
                  <p className="text-xs text-destructive">{pincodeError}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Specialty</Label>
              <Input
                placeholder="e.g., Internal Medicine"
                value={formData.specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
              />
            </div>

            <Button 
              onClick={handleValidate} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Validate Provider
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              Comparison with official registry data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!validationResult ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Search className="h-12 w-12 mb-4 opacity-50" />
                <p>Enter provider information and click validate to see results</p>
              </div>
            ) : !validationResult.found ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <XCircle className="h-12 w-12 mb-4 text-destructive" />
                <p className="text-lg font-medium">Provider Not Found</p>
                <p className="text-muted-foreground">
                  No matching provider was found in the {country === 'US' ? 'NPI' : 'India'} registry
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Score Display */}
                <div className="text-center p-6 rounded-lg bg-muted/50">
                  <div className="text-5xl font-bold mb-2">
                    {validationResult.correctnessScore}%
                  </div>
                  <p className="text-muted-foreground mb-4">Correctness Score</p>
                  <Progress 
                    value={validationResult.correctnessScore} 
                    className="h-3"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Registry Info */}
                {validationResult.registryData && (
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Registry Provider</span>
                      <Badge variant="outline">
                        {validationResult.registryData.source === 'US_NPI' ? 'NPI Registry' : 'India Registry'}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> {validationResult.registryData.name}</p>
                      {validationResult.registryData.npi_number && (
                        <p><span className="text-muted-foreground">NPI:</span> {validationResult.registryData.npi_number}</p>
                      )}
                      {validationResult.registryData.specialty && (
                        <p><span className="text-muted-foreground">Specialty:</span> {validationResult.registryData.specialty}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Field Comparisons */}
                {validationResult.fieldScores && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Field-by-Field Comparison</h4>
                    <FieldComparisonRow field="name" label="Name" fieldScore={validationResult.fieldScores.name} />
                    <FieldComparisonRow field="phone" label="Phone" fieldScore={validationResult.fieldScores.phone} />
                    <FieldComparisonRow field="address_line1" label="Address" fieldScore={validationResult.fieldScores.address_line1} />
                    <FieldComparisonRow field="city" label="City" fieldScore={validationResult.fieldScores.city} />
                    <FieldComparisonRow field="state" label="State" fieldScore={validationResult.fieldScores.state} />
                    <FieldComparisonRow field="postal_code" label="Postal Code" fieldScore={validationResult.fieldScores.postal_code} />
                    <FieldComparisonRow field="specialty" label="Specialty" fieldScore={validationResult.fieldScores.specialty} />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveToDirectory}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save to Directory
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleValidate}
                    disabled={loading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Re-validate
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
