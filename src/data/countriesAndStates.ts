export interface CountryData {
  name: string;
  code: string;
  flag: string;
  phoneCode: string;
  states: string[];
  pincodePattern: RegExp;
  pincodeLength: number;
  pincodePlaceholder: string;
}

export const countries: CountryData[] = [
  {
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    phoneCode: '+1',
    pincodePattern: /^\d{5}(-\d{4})?$/,
    pincodeLength: 5,
    pincodePlaceholder: '12345',
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

export const validatePincode = (pincode: string, countryName: string): boolean => {
  const country = getCountryByName(countryName);
  if (!country) return true; // If country not found, allow any pincode
  return country.pincodePattern.test(pincode);
};
