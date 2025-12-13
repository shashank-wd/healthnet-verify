import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { countries, getCountryByName, validatePincode } from '@/data/countriesAndStates';

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
}

export default function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fullName, setFullName] = useState('');
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const selectedCountry = getCountryByName(country);
  const availableStates = selectedCountry?.states || [];
  const selectedPhoneCountry = countries.find(c => c.phoneCode === phoneCode);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Reset state when country changes
  useEffect(() => {
    if (selectedCountry && state && !selectedCountry.states.includes(state)) {
      setState('');
    }
    // Revalidate pincode when country changes
    if (pincode && selectedCountry) {
      validatePincodeInput(pincode);
    }
  }, [country]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone, address, city, state, pincode')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url);
        // Parse phone number to extract country code
        if (data.phone) {
          const phoneMatch = data.phone.match(/^(\+\d{1,3})\s*(.*)$/);
          if (phoneMatch) {
            setPhoneCode(phoneMatch[1]);
            setPhoneNumber(phoneMatch[2]);
          } else {
            setPhoneNumber(data.phone);
          }
        }
        setAddress(data.address || '');
        setCity(data.city || '');
        setState(data.state || '');
        setPincode(data.pincode || '');
        // Try to detect country from state
        if (data.state) {
          const matchedCountry = countries.find(c => c.states.includes(data.state!));
          if (matchedCountry) {
            setCountry(matchedCountry.name);
          }
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading profile',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please select an image file.',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please select an image under 2MB.',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      toast({
        title: 'Avatar uploaded',
        description: 'Your avatar has been uploaded. Click Save to apply changes.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePincodeChange = (value: string) => {
    // Only allow digits for countries that use numeric pincodes
    const numericOnly = ['United States', 'India', 'Germany', 'France', 'Australia'];
    
    if (numericOnly.includes(country)) {
      // Only allow digits
      const digitsOnly = value.replace(/\D/g, '');
      setPincode(digitsOnly);
      validatePincodeInput(digitsOnly);
    } else {
      // Allow alphanumeric for countries like UK, Canada
      const cleaned = value.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
      setPincode(cleaned);
      validatePincodeInput(cleaned);
    }
  };

  const validatePincodeInput = (value: string) => {
    if (!value) {
      setPincodeError('');
      return true;
    }

    if (!country) {
      setPincodeError('Please select a country first');
      return false;
    }

    if (!validatePincode(value, country)) {
      const countryData = getCountryByName(country);
      setPincodeError(`Invalid format. Example: ${countryData?.pincodePlaceholder || ''}`);
      return false;
    }

    setPincodeError('');
    return true;
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate pincode before saving
    if (pincode && !validatePincodeInput(pincode)) {
      toast({
        variant: 'destructive',
        title: 'Invalid pincode',
        description: 'Please enter a valid pincode for the selected country.',
      });
      return;
    }

    setSaving(true);

    try {
      const fullPhone = phoneNumber ? `${phoneCode} ${phoneNumber}` : '';
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          phone: fullPhone,
          address,
          city,
          state,
          pincode,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const userInitials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your profile picture and personal details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
              <AvatarImage src={avatarUrl || undefined} alt="Profile" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Profile Picture</p>
            <p className="text-xs text-muted-foreground">
              Click the avatar to upload a new photo. Max size: 2MB
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2">
              <Select value={phoneCode} onValueChange={setPhoneCode}>
                <SelectTrigger className="w-[140px]">
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
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="Enter phone number"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your street address"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country">
                    {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : 'Select country'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.name}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select 
                value={state} 
                onValueChange={setState}
                disabled={!country || availableStates.length === 0}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder={country ? "Select state" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableStates.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">
                Pincode / ZIP Code
              </Label>
              <Input
                id="pincode"
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder={selectedCountry?.pincodePlaceholder || "Enter pincode"}
                maxLength={selectedCountry?.pincodeLength ? selectedCountry.pincodeLength + 2 : 10}
                className={pincodeError ? 'border-destructive' : ''}
              />
              {pincodeError && (
                <p className="text-xs text-destructive">{pincodeError}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={handleSave} disabled={saving || !!pincodeError}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
