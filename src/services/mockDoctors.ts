import type { Doctor, RankRequest } from '../types/api';

interface MockDoctorSeed {
  name: string;
  university: string;
  universityRank: number;
  yearsOfExperience: number;
  city: string;
  state: string;
  zipCode: string;
  rating: number;
}

const UNIVERSITY_POOL = [
  { name: 'Johns Hopkins University', rank: 1 },
  { name: 'Harvard Medical School', rank: 2 },
  { name: 'Stanford University', rank: 3 },
  { name: 'University of Pennsylvania', rank: 4 },
  { name: 'UCSF School of Medicine', rank: 5 },
  { name: 'Columbia University', rank: 6 },
  { name: 'Duke University', rank: 7 },
  { name: 'University of Michigan', rank: 8 },
  { name: 'Washington University', rank: 9 },
  { name: 'Yale University', rank: 10 },
  { name: 'UT Southwestern', rank: 11 },
  { name: 'Northwestern University', rank: 12 },
  { name: 'Vanderbilt University', rank: 13 },
  { name: 'Cornell University', rank: 14 },
  { name: 'Mayo Clinic Alix School', rank: 15 },
];

const FIRST_NAMES = [
  'Elena', 'Raj', 'Margaret', 'James', 'Sofia', 'David', 'Amara', 'Michael',
  'Priya', 'Robert', 'Catherine', 'Daniel', 'Mei', 'Thomas', 'Olivia',
];

const LAST_NAMES = [
  'Chen', 'Patel', 'Williams', 'Nakamura', 'Okafor', 'Sullivan', 'Reyes',
  'Kim', 'Foster', 'Hassan', 'Brooks', 'Nguyen', 'Anderson', 'Sharma', 'Torres',
];

const ZIP_LOCATIONS: Record<string, { city: string; state: string }> = {
  '75024': { city: 'Plano', state: 'TX' },
  '75023': { city: 'Plano', state: 'TX' },
  '75201': { city: 'Dallas', state: 'TX' },
  '78701': { city: 'Austin', state: 'TX' },
  '10001': { city: 'New York', state: 'NY' },
  '94102': { city: 'San Francisco', state: 'CA' },
  '60601': { city: 'Chicago', state: 'IL' },
  '33101': { city: 'Miami', state: 'FL' },
  '02108': { city: 'Boston', state: 'MA' },
  '98101': { city: 'Seattle', state: 'WA' },
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function resolveLocation(place: string): { city: string; state: string; zipCode: string } {
  const zipMatch = place.match(/\d{5}/);
  if (zipMatch) {
    const zip = zipMatch[0];
    const known = ZIP_LOCATIONS[zip];
    if (known) return { ...known, zipCode: zip };
    return { city: 'Your Area', state: 'US', zipCode: zip };
  }

  const normalized = place.toLowerCase();
  for (const [zip, loc] of Object.entries(ZIP_LOCATIONS)) {
    if (loc.city.toLowerCase() === normalized) {
      return { ...loc, zipCode: zip };
    }
  }

  const titleCase = place
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return { city: titleCase, state: 'US', zipCode: '00000' };
}

function titleCaseSpecialty(specialty: string): string {
  return specialty
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function generateMockDoctors(
  specialty: string,
  place: string,
  count = 5
): Doctor[] {
  const location = resolveLocation(place);
  const seed = hashString(`${specialty}-${place}`);
  const displaySpecialty = titleCaseSpecialty(specialty);

  const seeds: MockDoctorSeed[] = Array.from({ length: count }, (_, i) => {
    const uni = UNIVERSITY_POOL[(seed + i * 3) % UNIVERSITY_POOL.length];
    const first = FIRST_NAMES[(seed + i) % FIRST_NAMES.length];
    const last = LAST_NAMES[(seed + i * 2) % LAST_NAMES.length];

    return {
      name: `Dr. ${first} ${last}`,
      university: uni.name,
      universityRank: uni.rank,
      yearsOfExperience: 8 + ((seed + i * 7) % 28),
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
      rating: 4.2 + ((seed + i) % 8) / 10,
    };
  });

  return seeds
    .sort((a, b) => {
      const scoreA = (16 - a.universityRank) * 10 + a.yearsOfExperience;
      const scoreB = (16 - b.universityRank) * 10 + b.yearsOfExperience;
      return scoreB - scoreA;
    })
    .map((doc, index) => ({
      id: `${seed}-${index}`,
      specialty: displaySpecialty,
      ...doc,
    }));
}

export async function fetchDoctorsMock(
  request: RankRequest
): Promise<Doctor[]> {
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
  return generateMockDoctors(request.specialty, request.place);
}
