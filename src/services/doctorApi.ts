import { getConfig, getRankEndpoint } from '../config/runtimeConfig';
import type {
  Doctor,
  DoctorSearchResponse,
  RankApiDoctor,
  RankApiResponse,
  RankRequest,
  SearchMeta,
} from '../types/api';
import { fetchDoctorsMock } from './mockDoctors';

function mapDoctor(apiDoctor: RankApiDoctor): Doctor {
  return {
    id: apiDoctor.id,
    name: apiDoctor.name,
    specialty: apiDoctor.specialty,
    university: apiDoctor.university,
    universityRank: apiDoctor.university_rank,
    yearsOfExperience: apiDoctor.years_of_experience,
    city: apiDoctor.location.city,
    state: apiDoctor.location.state,
    zipCode: apiDoctor.location.zip_code,
    rating: apiDoctor.rating,
  };
}

function mapMeta(
  apiMeta: RankApiResponse['meta'],
  fallback: RankRequest
): SearchMeta {
  return {
    specialty: apiMeta?.specialty ?? fallback.specialty,
    place: apiMeta?.place ?? fallback.place,
    totalResults: apiMeta?.total_results ?? 0,
    rankedBy: apiMeta?.ranked_by ?? ['university_prestige', 'years_of_experience'],
  };
}

async function fetchFromRankApi(request: RankRequest): Promise<DoctorSearchResponse> {
  const endpoint = getRankEndpoint();
  console.log('Rank API request:', endpoint, request);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const errorMessage = `Rank API error ${response.status}${detail ? `: ${detail.slice(0, 120)}` : ''}`;
    console.error('Rank API error:', errorMessage);
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as RankApiResponse;
  console.log('Rank API response:', data);

  return {
    doctors: (data.results ?? []).map(mapDoctor),
    meta: mapMeta(data.meta, request),
  };
}

/**
 * Rank physicians via POST /v1/rank.
 * Falls back to mock data when useMockApi is enabled in config.
 */
export async function searchDoctors(
  request: RankRequest
): Promise<DoctorSearchResponse> {
  const { useMockApi } = getConfig();

  if (useMockApi) {
    const doctors = await fetchDoctorsMock(request);
    return {
      doctors,
      meta: {
        specialty: request.specialty,
        place: request.place,
        totalResults: doctors.length,
        rankedBy: ['university_prestige', 'years_of_experience'],
      },
    };
  }

  return fetchFromRankApi(request);
}

// Cache metadata on the frontend runtime to avoid repeated calls
let _metadataCache: { specialties: string[]; zip_codes: string[]; cities: string[] } | null = null;

export async function getSearchMetadata(): Promise<{ specialties: string[]; zip_codes: string[]; cities: string[] }> {
  if (_metadataCache) return _metadataCache;

  const { apiBaseUrl } = getConfig();
  const endpoint = `${apiBaseUrl}/v1/search-metadata`;

  try {
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Metadata fetch failed ${res.status}`);
    const data = await res.json();
    // ensure arrays
    _metadataCache = {
      specialties: Array.isArray(data.specialties) ? data.specialties : [],
      zip_codes: Array.isArray(data.zip_codes) ? data.zip_codes : [],
      cities: Array.isArray(data.cities) ? data.cities : [],
    };
    return _metadataCache;
  } catch (err) {
    console.error('Failed to load search metadata', err);
    return { specialties: [], zip_codes: [], cities: [] };
  }
}
