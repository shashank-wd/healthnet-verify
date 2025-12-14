export interface StateZipRange {
  state: string;
  ranges: [number, number][]; // Array of [min, max] ranges
  prefixes?: string[]; // For alphanumeric codes like UK/Canada
}

export interface CountryData {
  name: string;
  code: string;
  flag: string;
  phoneCode: string;
  states: string[];
  pincodePattern: RegExp;
  pincodeLength: number;
  pincodePlaceholder: string;
  stateZipRanges?: StateZipRange[];
}

// US ZIP code ranges by state
const usStateZipRanges: StateZipRange[] = [
  { state: 'Alabama', ranges: [[35000, 36999]] },
  { state: 'Alaska', ranges: [[99500, 99999]] },
  { state: 'Arizona', ranges: [[85000, 86599]] },
  { state: 'Arkansas', ranges: [[71600, 72999]] },
  { state: 'California', ranges: [[90000, 96199]] },
  { state: 'Colorado', ranges: [[80000, 81699]] },
  { state: 'Connecticut', ranges: [[6000, 6999]] },
  { state: 'Delaware', ranges: [[19700, 19999]] },
  { state: 'Florida', ranges: [[32000, 34999]] },
  { state: 'Georgia', ranges: [[30000, 31999], [39800, 39999]] },
  { state: 'Hawaii', ranges: [[96700, 96899]] },
  { state: 'Idaho', ranges: [[83200, 83899]] },
  { state: 'Illinois', ranges: [[60000, 62999]] },
  { state: 'Indiana', ranges: [[46000, 47999]] },
  { state: 'Iowa', ranges: [[50000, 52899]] },
  { state: 'Kansas', ranges: [[66000, 67999]] },
  { state: 'Kentucky', ranges: [[40000, 42799]] },
  { state: 'Louisiana', ranges: [[70000, 71499]] },
  { state: 'Maine', ranges: [[3900, 4999]] },
  { state: 'Maryland', ranges: [[20600, 21999]] },
  { state: 'Massachusetts', ranges: [[1000, 2799]] },
  { state: 'Michigan', ranges: [[48000, 49999]] },
  { state: 'Minnesota', ranges: [[55000, 56799]] },
  { state: 'Mississippi', ranges: [[38600, 39799]] },
  { state: 'Missouri', ranges: [[63000, 65899]] },
  { state: 'Montana', ranges: [[59000, 59999]] },
  { state: 'Nebraska', ranges: [[68000, 69399]] },
  { state: 'Nevada', ranges: [[88900, 89899]] },
  { state: 'New Hampshire', ranges: [[3000, 3899]] },
  { state: 'New Jersey', ranges: [[7000, 8999]] },
  { state: 'New Mexico', ranges: [[87000, 88499]] },
  { state: 'New York', ranges: [[10000, 14999]] },
  { state: 'North Carolina', ranges: [[27000, 28999]] },
  { state: 'North Dakota', ranges: [[58000, 58899]] },
  { state: 'Ohio', ranges: [[43000, 45999]] },
  { state: 'Oklahoma', ranges: [[73000, 74999]] },
  { state: 'Oregon', ranges: [[97000, 97999]] },
  { state: 'Pennsylvania', ranges: [[15000, 19699]] },
  { state: 'Rhode Island', ranges: [[2800, 2999]] },
  { state: 'South Carolina', ranges: [[29000, 29999]] },
  { state: 'South Dakota', ranges: [[57000, 57799]] },
  { state: 'Tennessee', ranges: [[37000, 38599]] },
  { state: 'Texas', ranges: [[75000, 79999], [88500, 88599]] },
  { state: 'Utah', ranges: [[84000, 84799]] },
  { state: 'Vermont', ranges: [[5000, 5999]] },
  { state: 'Virginia', ranges: [[22000, 24699]] },
  { state: 'Washington', ranges: [[98000, 99499]] },
  { state: 'West Virginia', ranges: [[24700, 26899]] },
  { state: 'Wisconsin', ranges: [[53000, 54999]] },
  { state: 'Wyoming', ranges: [[82000, 83199]] },
];

// India PIN code ranges by state (first 2 digits)
const indiaStateZipRanges: StateZipRange[] = [
  { state: 'Andhra Pradesh', ranges: [[500000, 539999]] },
  { state: 'Arunachal Pradesh', ranges: [[790000, 792999]] },
  { state: 'Assam', ranges: [[780000, 788999]] },
  { state: 'Bihar', ranges: [[800000, 855999]] },
  { state: 'Chhattisgarh', ranges: [[490000, 497999]] },
  { state: 'Goa', ranges: [[403000, 403999]] },
  { state: 'Gujarat', ranges: [[360000, 396999]] },
  { state: 'Haryana', ranges: [[121000, 136999]] },
  { state: 'Himachal Pradesh', ranges: [[171000, 177999]] },
  { state: 'Jharkhand', ranges: [[813000, 835999]] },
  { state: 'Karnataka', ranges: [[560000, 591999]] },
  { state: 'Kerala', ranges: [[670000, 695999]] },
  { state: 'Madhya Pradesh', ranges: [[450000, 488999]] },
  { state: 'Maharashtra', ranges: [[400000, 445999]] },
  { state: 'Manipur', ranges: [[795000, 795999]] },
  { state: 'Meghalaya', ranges: [[793000, 794999]] },
  { state: 'Mizoram', ranges: [[796000, 796999]] },
  { state: 'Nagaland', ranges: [[797000, 798999]] },
  { state: 'Odisha', ranges: [[751000, 770999]] },
  { state: 'Punjab', ranges: [[140000, 160999]] },
  { state: 'Rajasthan', ranges: [[301000, 345999]] },
  { state: 'Sikkim', ranges: [[737000, 737999]] },
  { state: 'Tamil Nadu', ranges: [[600000, 643999]] },
  { state: 'Telangana', ranges: [[500000, 509999]] },
  { state: 'Tripura', ranges: [[799000, 799999]] },
  { state: 'Uttar Pradesh', ranges: [[201000, 285999]] },
  { state: 'Uttarakhand', ranges: [[244000, 263999]] },
  { state: 'West Bengal', ranges: [[700000, 743999]] },
  { state: 'Andaman and Nicobar Islands', ranges: [[744000, 744999]] },
  { state: 'Chandigarh', ranges: [[160000, 160999]] },
  { state: 'Dadra and Nagar Haveli and Daman and Diu', ranges: [[396000, 396999]] },
  { state: 'Delhi', ranges: [[110000, 110999]] },
  { state: 'Jammu and Kashmir', ranges: [[180000, 194999]] },
  { state: 'Ladakh', ranges: [[194000, 194999]] },
  { state: 'Lakshadweep', ranges: [[682000, 682999]] },
  { state: 'Puducherry', ranges: [[605000, 605999]] },
];

export const countries: CountryData[] = [
  {
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    phoneCode: '+1',
    pincodePattern: /^\d{5}(-\d{4})?$/,
    pincodeLength: 5,
    pincodePlaceholder: '12345',
    stateZipRanges: usStateZipRanges,
    states: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
      'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
      'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
      'Wisconsin', 'Wyoming'
    ]
  },
  {
    name: 'India',
    code: 'IN',
    flag: '🇮🇳',
    phoneCode: '+91',
    pincodePattern: /^\d{6}$/,
    pincodeLength: 6,
    pincodePlaceholder: '110001',
    stateZipRanges: indiaStateZipRanges,
    states: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
      'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
      'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
      'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ]
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    phoneCode: '+44',
    pincodePattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
    pincodeLength: 8,
    pincodePlaceholder: 'SW1A 1AA',
    states: [
      'England', 'Scotland', 'Wales', 'Northern Ireland'
    ]
  },
  {
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    phoneCode: '+1',
    pincodePattern: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i,
    pincodeLength: 7,
    pincodePlaceholder: 'K1A 0B1',
    states: [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
      'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
      'Quebec', 'Saskatchewan', 'Yukon'
    ]
  },
  {
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    phoneCode: '+61',
    pincodePattern: /^\d{4}$/,
    pincodeLength: 4,
    pincodePlaceholder: '2000',
    states: [
      'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland',
      'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
    ]
  },
  {
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    phoneCode: '+49',
    pincodePattern: /^\d{5}$/,
    pincodeLength: 5,
    pincodePlaceholder: '10115',
    states: [
      'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
      'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia',
      'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'
    ]
  },
  {
    name: 'France',
    code: 'FR',
    flag: '🇫🇷',
    phoneCode: '+33',
    pincodePattern: /^\d{5}$/,
    pincodeLength: 5,
    pincodePlaceholder: '75001',
    states: [
      'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire',
      'Corsica', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandy',
      'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'
    ]
  }
];

export const getCountryByName = (name: string): CountryData | undefined => {
  return countries.find(c => c.name === name);
};

export const getCountryByCode = (code: string): CountryData | undefined => {
  return countries.find(c => c.code === code);
};

export const validatePincode = (pincode: string, countryName: string): boolean => {
  const country = getCountryByName(countryName);
  if (!country) return true; // If country not found, allow any pincode
  return country.pincodePattern.test(pincode);
};

export const validatePincodeForState = (pincode: string, stateName: string, countryName: string): { valid: boolean; message?: string } => {
  const country = getCountryByName(countryName);
  if (!country) return { valid: true };
  
  // First validate format
  if (!country.pincodePattern.test(pincode)) {
    return { valid: false, message: `Invalid format. Example: ${country.pincodePlaceholder}` };
  }
  
  // If no state-zip mapping, just return format validation
  if (!country.stateZipRanges) return { valid: true };
  
  const stateRange = country.stateZipRanges.find(s => s.state === stateName);
  if (!stateRange) return { valid: true }; // State not found in mapping, allow any valid format
  
  // Get numeric value for comparison
  const numericPincode = parseInt(pincode.replace(/\D/g, ''), 10);
  
  // Check if pincode falls within any of the state's ranges
  const isInRange = stateRange.ranges.some(([min, max]) => numericPincode >= min && numericPincode <= max);
  
  if (!isInRange) {
    return { 
      valid: false, 
      message: `This ${country.code === 'US' ? 'ZIP code' : 'PIN code'} doesn't belong to ${stateName}` 
    };
  }
  
  return { valid: true };
};
