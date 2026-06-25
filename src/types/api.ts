/**
 * Extensible rank API request — add fields here as the API grows.
 * Sent as JSON to POST /v1/rank
 */
export interface RankRequest {
  version: string;
  specialty: string;
  place: string;
  place_type: PlaceType;
  original_query: string;
  /** Reserved for future filters (insurance, gender, language, etc.) */
  [key: string]: string | number | boolean | undefined;
}

export type PlaceType = 'city' | 'zip';

/** @deprecated Use RankRequest — kept as alias for internal compatibility */
export type DoctorSearchRequest = RankRequest;

export interface DoctorSearchResponse {
  doctors: Doctor[];
  meta: SearchMeta;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  university: string;
  universityRank: number;
  yearsOfExperience: number;
  city: string;
  state: string;
  zipCode: string;
  rating: number;
}

export interface ReviewRequest {
  user_name: string;
  user_email: string;
  user_review: string;
}

export interface ReviewResponse {
  id: string;
  user_name: string;
  user_email: string;
  user_review: string;
  created_at: string;
}

export interface SearchMeta {
  specialty: string;
  place: string;
  totalResults: number;
  rankedBy: string[];
}

/** Backend response contract (snake_case) */
export interface RankApiResponse {
  results: RankApiDoctor[];
  meta: RankApiMeta;
}

export interface RankApiDoctor {
  id: string;
  name: string;
  specialty: string;
  university: string;
  university_rank: number;
  years_of_experience: number;
  location: {
    city: string;
    state: string;
    zip_code: string;
  };
  rating: number;
}

export interface RankApiMeta {
  specialty: string;
  place: string;
  total_results: number;
  ranked_by: string[];
}

export interface ParsedPrompt {
  specialty: string;
  place: string;
  placeType: PlaceType;
  raw: string;
  isValid: boolean;
  errors: string[];
}

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface SearchState {
  status: SearchStatus;
  doctors: Doctor[];
  meta: SearchMeta | null;
  parsed: ParsedPrompt | null;
  error: string | null;
}
