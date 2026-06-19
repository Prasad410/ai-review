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
    throw new Error(
      `Rank API error ${response.status}${detail ? `: ${detail.slice(0, 120)}` : ''}`
    );
  }

  const data = (await response.json()) as RankApiResponse;

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
