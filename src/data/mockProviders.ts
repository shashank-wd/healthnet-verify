import { Provider, ProviderStatus, Priority } from '@/types/provider';

// US Names
const usFirstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'
];

const usLastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

// Indian Names
const indianFirstNames = [
  'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anjali', 'Sanjay', 'Kavita',
  'Arun', 'Deepa', 'Suresh', 'Meera', 'Rakesh', 'Pooja', 'Manoj', 'Neha',
  'Rahul', 'Shruti', 'Vivek', 'Anita', 'Ajay', 'Rekha', 'Kiran', 'Swati',
  'Ramesh', 'Geeta', 'Ashok', 'Asha', 'Prakash', 'Lata', 'Dinesh', 'Seema'
];

const indianLastNames = [
  'Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Iyer', 'Nair',
  'Rao', 'Menon', 'Joshi', 'Desai', 'Mehta', 'Shah', 'Verma', 'Agarwal',
  'Kapoor', 'Malhotra', 'Bhat', 'Pillai', 'Chatterjee', 'Mukherjee', 'Banerjee', 'Das',
  'Roy', 'Bose', 'Sen', 'Ghosh', 'Sinha', 'Mishra', 'Pandey', 'Tiwari'
];

const specialties = [
  'Family Medicine', 'Internal Medicine', 'Pediatrics', 'Cardiology', 'Dermatology',
  'Orthopedics', 'Neurology', 'Psychiatry', 'Oncology', 'Radiology', 'Anesthesiology',
  'Emergency Medicine', 'General Surgery', 'Obstetrics & Gynecology', 'Ophthalmology',
  'Urology', 'Gastroenterology', 'Pulmonology', 'Endocrinology', 'Rheumatology',
  'Nephrology', 'Infectious Disease', 'Allergy & Immunology', 'Physical Medicine'
];

// US Cities
const usCities = [
  { city: 'New York', state: 'NY', zip: '10001', country: 'US' },
  { city: 'Los Angeles', state: 'CA', zip: '90001', country: 'US' },
  { city: 'Chicago', state: 'IL', zip: '60601', country: 'US' },
  { city: 'Houston', state: 'TX', zip: '77001', country: 'US' },
  { city: 'Phoenix', state: 'AZ', zip: '85001', country: 'US' },
  { city: 'Philadelphia', state: 'PA', zip: '19101', country: 'US' },
  { city: 'San Antonio', state: 'TX', zip: '78201', country: 'US' },
  { city: 'San Diego', state: 'CA', zip: '92101', country: 'US' },
  { city: 'Dallas', state: 'TX', zip: '75201', country: 'US' },
  { city: 'San Jose', state: 'CA', zip: '95101', country: 'US' },
  { city: 'Austin', state: 'TX', zip: '78701', country: 'US' },
  { city: 'Jacksonville', state: 'FL', zip: '32201', country: 'US' },
  { city: 'Fort Worth', state: 'TX', zip: '76101', country: 'US' },
  { city: 'Columbus', state: 'OH', zip: '43201', country: 'US' },
  { city: 'Charlotte', state: 'NC', zip: '28201', country: 'US' },
  { city: 'Seattle', state: 'WA', zip: '98101', country: 'US' },
  { city: 'Denver', state: 'CO', zip: '80201', country: 'US' },
  { city: 'Boston', state: 'MA', zip: '02101', country: 'US' },
  { city: 'Nashville', state: 'TN', zip: '37201', country: 'US' },
  { city: 'Detroit', state: 'MI', zip: '48201', country: 'US' }
];

// Indian Cities
const indianCities = [
  { city: 'Mumbai', state: 'Maharashtra', zip: '400001', country: 'IN' },
  { city: 'Delhi', state: 'Delhi', zip: '110001', country: 'IN' },
  { city: 'Bangalore', state: 'Karnataka', zip: '560001', country: 'IN' },
  { city: 'Chennai', state: 'Tamil Nadu', zip: '600001', country: 'IN' },
  { city: 'Hyderabad', state: 'Telangana', zip: '500001', country: 'IN' },
  { city: 'Kolkata', state: 'West Bengal', zip: '700001', country: 'IN' },
  { city: 'Pune', state: 'Maharashtra', zip: '411001', country: 'IN' },
  { city: 'Ahmedabad', state: 'Gujarat', zip: '380001', country: 'IN' },
  { city: 'Jaipur', state: 'Rajasthan', zip: '302001', country: 'IN' },
  { city: 'Lucknow', state: 'Uttar Pradesh', zip: '226001', country: 'IN' },
  { city: 'Chandigarh', state: 'Punjab', zip: '160001', country: 'IN' },
  { city: 'Kochi', state: 'Kerala', zip: '682001', country: 'IN' },
  { city: 'Thiruvananthapuram', state: 'Kerala', zip: '695001', country: 'IN' },
  { city: 'Coimbatore', state: 'Tamil Nadu', zip: '641001', country: 'IN' },
  { city: 'Indore', state: 'Madhya Pradesh', zip: '452001', country: 'IN' }
];

const streetNames = [
  'Main St', 'Oak Ave', 'Maple Dr', 'Park Blvd', 'Medical Center Pkwy',
  'Healthcare Way', 'Wellness Rd', 'Clinical Dr', 'Hospital Ave', 'Care Lane',
  'Health St', 'Medical Plaza', 'Physician Dr', 'Doctor Blvd', 'Clinic Way'
];

const certifications = [
  'Board Certified', 'ABMS Certified', 'DEA Registered', 'State Licensed',
  'ACLS Certified', 'BLS Certified', 'PALS Certified', 'Fellowship Trained'
];

const usDataSources = [
  { name: 'NPI Registry', icon: 'database' },
  { name: 'Google Maps', icon: 'map' },
  { name: 'State Medical Board', icon: 'shield' },
  { name: 'CMS NPPES', icon: 'file-text' },
  { name: 'Hospital Affiliations', icon: 'building' }
];

const indianDataSources = [
  { name: 'HPR Registry', icon: 'database' },
  { name: 'Google Maps', icon: 'map' },
  { name: 'State Medical Council', icon: 'shield' },
  { name: 'ABDM', icon: 'file-text' },
  { name: 'Hospital Affiliations', icon: 'building' }
];

const reviewReasons = [
  'Phone number disconnected',
  'Address not found in verification',
  'License status uncertain',
  'Multiple NPI matches found',
  'Specialty mismatch detected',
  'Name variation found',
  'Credential verification pending'
];

function generateNPI(): string {
  return '1' + Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
}

function generateHPRId(): string {
  return 'HPR-' + Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
}

function generateIndianPhone(): string {
  const prefixes = ['98', '99', '97', '96', '95', '94', '93', '91', '90', '88', '87', '86', '85', '84', '83', '82', '81', '80', '79', '78', '77', '76', '75', '74', '73', '72', '71', '70'];
  const prefix = randomFromArray(prefixes);
  const rest = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  return `+91 ${prefix}${rest.slice(0, 4)} ${rest.slice(4)}`;
}

function generateMCINumber(state: string): string {
  const stateCode = state.substring(0, 3).toUpperCase();
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `MCI/${stateCode}/${num}`;
}

function generatePhone(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const subscriber = Math.floor(Math.random() * 9000) + 1000;
  return `(${areaCode}) ${exchange}-${subscriber}`;
}

function generateLicense(state: string): string {
  const num = Math.floor(Math.random() * 900000) + 100000;
  return `${state}${num}`;
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateConfidenceBreakdown(overall: number): {
  name: number;
  phone: number;
  address: number;
  specialty: number;
  license: number;
  overall: number;
} {
  const variance = 15;
  return {
    name: Math.min(100, Math.max(0, overall + (Math.random() * variance * 2 - variance))),
    phone: Math.min(100, Math.max(0, overall + (Math.random() * variance * 2 - variance))),
    address: Math.min(100, Math.max(0, overall + (Math.random() * variance * 2 - variance))),
    specialty: Math.min(100, Math.max(0, overall + (Math.random() * variance * 2 - variance))),
    license: Math.min(100, Math.max(0, overall + (Math.random() * variance * 2 - variance))),
    overall
  };
}

function generateDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

export function generateMockProviders(count: number = 200): Provider[] {
  const providers: Provider[] = [];
  const usCount = Math.floor(count * 0.6); // 60% US providers
  const inCount = count - usCount; // 40% Indian providers
  
  // Generate US providers
  for (let i = 0; i < usCount; i++) {
    const firstName = randomFromArray(usFirstNames);
    const lastName = randomFromArray(usLastNames);
    const name = `Dr. ${firstName} ${lastName}`;
    const specialty = randomFromArray(specialties);
    const location = randomFromArray(usCities);
    const streetNum = Math.floor(Math.random() * 9000) + 1000;
    const street = `${streetNum} ${randomFromArray(streetNames)}`;
    const phone = generatePhone();
    const country = 'US';
    
    // Determine status distribution: 60-70% validated, 15-20% updated, 10-15% needs review
    const statusRoll = Math.random();
    let status: ProviderStatus;
    let confidenceScore: number;
    let priority: Priority;
    
    if (statusRoll < 0.65) {
      status = 'validated';
      confidenceScore = Math.floor(Math.random() * 15) + 85; // 85-100
      priority = 'low';
    } else if (statusRoll < 0.85) {
      status = 'updated';
      confidenceScore = Math.floor(Math.random() * 20) + 70; // 70-90
      priority = 'medium';
    } else {
      status = 'needs_review';
      confidenceScore = Math.floor(Math.random() * 30) + 40; // 40-70
      priority = Math.random() > 0.5 ? 'high' : 'medium';
    }

    const address = {
      street,
      city: location.city,
      state: location.state,
      zip: location.zip,
      country
    };

    // Generate slight variations for "original" vs "validated" data
    const hasNameChange = status === 'updated' && Math.random() > 0.7;
    const hasPhoneChange = status !== 'validated' && Math.random() > 0.6;
    const hasAddressChange = status !== 'validated' && Math.random() > 0.5;

    const originalName = hasNameChange ? `${firstName} ${lastName}, MD` : name;
    const originalPhone = hasPhoneChange ? generatePhone() : phone;
    const originalAddress = hasAddressChange 
      ? { ...address, street: `${Math.floor(Math.random() * 9000) + 1000} ${randomFromArray(streetNames)}` }
      : address;

    const discrepancies = [];
    if (hasNameChange) {
      discrepancies.push({
        field: 'Name',
        originalValue: originalName,
        newValue: name,
        source: 'NPI Registry',
        severity: 'low' as const
      });
    }
    if (hasPhoneChange) {
      discrepancies.push({
        field: 'Phone',
        originalValue: originalPhone,
        newValue: phone,
        source: 'Google Maps',
        severity: 'medium' as const
      });
    }
    if (hasAddressChange) {
      discrepancies.push({
        field: 'Address',
        originalValue: `${originalAddress.street}, ${originalAddress.city}`,
        newValue: `${address.street}, ${address.city}`,
        source: 'State Medical Board',
        severity: 'high' as const
      });
    }

    const provider: Provider = {
      id: `prov-us-${String(i + 1).padStart(5, '0')}`,
      name,
      npi: generateNPI(),
      specialty,
      phone,
      address,
      licenseNumber: generateLicense(location.state),
      certifications: randomSubset(certifications, 2, 5),
      status,
      confidenceScore,
      confidenceBreakdown: generateConfidenceBreakdown(confidenceScore),
      originalData: {
        name: originalName,
        phone: originalPhone,
        address: originalAddress,
        specialty
      },
      validatedData: {
        name,
        phone,
        address,
        specialty
      },
      discrepancies,
      dataSources: randomSubset(usDataSources, 2, 4).map(ds => ({
        name: ds.name,
        verified: Math.random() > 0.2,
        lastChecked: generateDate(30)
      })),
      lastUpdated: generateDate(14),
      priority,
      memberImpact: Math.floor(Math.random() * 5000) + 100,
      reviewReason: status === 'needs_review' ? randomFromArray(reviewReasons) : undefined,
      country: 'US'
    };

    providers.push(provider);
  }

  // Generate Indian providers
  for (let i = 0; i < inCount; i++) {
    const firstName = randomFromArray(indianFirstNames);
    const lastName = randomFromArray(indianLastNames);
    const name = `Dr. ${firstName} ${lastName}`;
    const specialty = randomFromArray(specialties);
    const location = randomFromArray(indianCities);
    const streetNum = Math.floor(Math.random() * 900) + 100;
    const street = `${streetNum}, ${randomFromArray(['MG Road', 'Gandhi Nagar', 'Nehru Street', 'Shanti Nagar', 'Medical Complex', 'Hospital Road', 'Health Centre Lane', 'Clinic Street', 'Doctor Colony', 'Care Avenue'])}`;
    const phone = generateIndianPhone();
    const country = 'IN';
    
    const statusRoll = Math.random();
    let status: ProviderStatus;
    let confidenceScore: number;
    let priority: Priority;
    
    if (statusRoll < 0.65) {
      status = 'validated';
      confidenceScore = Math.floor(Math.random() * 15) + 85;
      priority = 'low';
    } else if (statusRoll < 0.85) {
      status = 'updated';
      confidenceScore = Math.floor(Math.random() * 20) + 70;
      priority = 'medium';
    } else {
      status = 'needs_review';
      confidenceScore = Math.floor(Math.random() * 30) + 40;
      priority = Math.random() > 0.5 ? 'high' : 'medium';
    }

    const address = {
      street,
      city: location.city,
      state: location.state,
      zip: location.zip,
      country
    };

    const hasNameChange = status === 'updated' && Math.random() > 0.7;
    const hasPhoneChange = status !== 'validated' && Math.random() > 0.6;
    const hasAddressChange = status !== 'validated' && Math.random() > 0.5;

    const originalName = hasNameChange ? `${firstName} ${lastName}` : name;
    const originalPhone = hasPhoneChange ? generateIndianPhone() : phone;
    const originalAddress = hasAddressChange 
      ? { ...address, street: `${Math.floor(Math.random() * 900) + 100}, ${randomFromArray(['MG Road', 'Gandhi Nagar', 'Nehru Street'])}` }
      : address;

    const discrepancies = [];
    if (hasNameChange) {
      discrepancies.push({
        field: 'Name',
        originalValue: originalName,
        newValue: name,
        source: 'HPR Registry',
        severity: 'low' as const
      });
    }
    if (hasPhoneChange) {
      discrepancies.push({
        field: 'Phone',
        originalValue: originalPhone,
        newValue: phone,
        source: 'Google Maps',
        severity: 'medium' as const
      });
    }
    if (hasAddressChange) {
      discrepancies.push({
        field: 'Address',
        originalValue: `${originalAddress.street}, ${originalAddress.city}`,
        newValue: `${address.street}, ${address.city}`,
        source: 'State Medical Council',
        severity: 'high' as const
      });
    }

    const provider: Provider = {
      id: `prov-in-${String(i + 1).padStart(5, '0')}`,
      name,
      npi: generateHPRId(), // Using HPR ID for Indian providers
      specialty,
      phone,
      address,
      licenseNumber: generateMCINumber(location.state),
      certifications: randomSubset(certifications, 2, 5),
      status,
      confidenceScore,
      confidenceBreakdown: generateConfidenceBreakdown(confidenceScore),
      originalData: {
        name: originalName,
        phone: originalPhone,
        address: originalAddress,
        specialty
      },
      validatedData: {
        name,
        phone,
        address,
        specialty
      },
      discrepancies,
      dataSources: randomSubset(indianDataSources, 2, 4).map(ds => ({
        name: ds.name,
        verified: Math.random() > 0.2,
        lastChecked: generateDate(30)
      })),
      lastUpdated: generateDate(14),
      priority,
      memberImpact: Math.floor(Math.random() * 5000) + 100,
      reviewReason: status === 'needs_review' ? randomFromArray(reviewReasons) : undefined,
      country: 'IN'
    };

    providers.push(provider);
  }

  return providers;
}

export const mockProviders = generateMockProviders(200);
