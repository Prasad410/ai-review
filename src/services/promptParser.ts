import type { ParsedPrompt, PlaceType, RankRequest } from '../types/api';

const SPECIALTY_ALIASES: Record<string, string> = {
  'allergy and immunology': 'allergy and immunology',
  allergist: 'allergy and immunology',
  'allergy specialist': 'allergy and immunology',
  anesthesiology: 'anesthesiology',
  anesthesiologist: 'anesthesiology',
  cardiology: 'cardiology',
  cardiologist: 'cardiology',
  dermatology: 'dermatology',
  dermatologist: 'dermatology',
  endocrinology: 'endocrinology',
  endocrinologist: 'endocrinology',
  gastroenterology: 'gastroenterology',
  gastroenterologist: 'gastroenterology',
  geriatrician: 'geriatric psychiatry',
  hematology: 'hematology',
  hematologist: 'hematology',
  immunology: 'immunology',
  immunologist: 'immunology',
  nephrology: 'nephrology',
  nephrologist: 'nephrology',
  neurology: 'neurology',
  neurologist: 'neurology',
  obstetrics: 'obstetrics and gynecology',
  obstetrician: 'obstetrics and gynecology',
  gynecology: 'gynecology',
  gynecologist: 'gynecology',
  oncology: 'oncology',
  oncologist: 'oncology',
  ophthalmology: 'ophthalmology',
  ophthalmologist: 'ophthalmology',
  orthopedics: 'orthopedics',
  orthopedist: 'orthopedics',
  'orthopedic surgery': 'orthopedic surgery',
  otolaryngology: 'otolaryngology',
  otolaryngologist: 'otolaryngology',
  pathology: 'pathology',
  pediatrician: 'pediatrics',
  pediatrics: 'pediatrics',
  pediatric: 'pediatrics',
  physiatrist: 'physiatrist',
  'plastic surgeon': 'plastic surgery',
  psychiatrist: 'psychiatry',
  pulmonology: 'pulmonology',
  pulmonologist: 'pulmonology',
  radiology: 'radiology',
  radiologist: 'radiology',
  rheumatology: 'rheumatology',
  rheumatologist: 'rheumatology',
  urology: 'urology',
  urologist: 'urology',
  surgery: 'surgery',
  surgeon: 'surgery',
  'family medicine': 'family medicine',
  'family doctor': 'family medicine',
  'family practice': 'family medicine',
  'internal medicine': 'internal medicine',
  'internal doctor': 'internal medicine',
};

const SPECIALTY_KEYS = Object.keys(SPECIALTY_ALIASES).sort((a, b) => b.length - a.length);
const ZIP_PATTERN = /\b(?:zip\s*(?:code)?\s*)?(\d{5})(?:-\d{4})?\b/i;
const IN_PLACE_PATTERN = /\bin\s+(?:zip\s*(?:code)?\s*)?(.+?)$/i;
const NEAR_PLACE_PATTERN = /\bnear\s+(.+?)$/i;
const BEST_PREFIX_PATTERN = /^best\s+/i;
const RESERVED_PLACE_WORDS = /\b(zip|zip code|zipcode|nearby|near|in|at|tx|texas|please|find|show|me|best|top|doctor|physician|specialist)\b/gi;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findSpecialty(text: string): string | null {
  const lower = normalizeText(text);

  for (const specialty of SPECIALTY_KEYS) {
    if (lower.includes(specialty)) {
      return SPECIALTY_ALIASES[specialty];
    }
  }

  const doctorMatch = lower.match(/\b([\w\s-]+?)\s+(?:doctor|physician|specialist)\b/);
  if (doctorMatch?.[1]) {
    const candidate = normalizeText(doctorMatch[1].replace(BEST_PREFIX_PATTERN, ''));
    if (candidate.length > 2) {
      return SPECIALTY_ALIASES[candidate] ?? candidate;
    }
  }

  return null;
}

function normalizePlace(raw: string): string {
  return raw
    .trim()
    .replace(/[.,]$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(tx|texas)\b/gi, '')
    .trim();
}

function stripSpecialty(text: string, specialty: string | null): string {
  let result = text.replace(BEST_PREFIX_PATTERN, '').trim();

  if (specialty) {
    const escaped = escapeRegExp(specialty);
    result = result.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), '');
  }

  return result.replace(RESERVED_PLACE_WORDS, ' ').replace(/\s+/g, ' ').trim();
}

function findPlace(text: string, specialty: string | null): { place: string; placeType: PlaceType } | null {
  const zipMatch = text.match(ZIP_PATTERN);
  if (zipMatch?.[1]) {
    return { place: zipMatch[1], placeType: 'zip' };
  }

  const inMatch = text.match(IN_PLACE_PATTERN);
  if (inMatch?.[1]) {
    const raw = normalizePlace(inMatch[1].replace(ZIP_PATTERN, '$1'));
    if (raw.length > 0) {
      const isZip = /^\d{5}$/.test(raw);
      return { place: raw, placeType: isZip ? 'zip' : 'city' };
    }
  }

  const nearMatch = text.match(NEAR_PLACE_PATTERN);
  if (nearMatch?.[1]) {
    const raw = normalizePlace(nearMatch[1]);
    if (raw.length > 0) {
      const isZip = /^\d{5}$/.test(raw);
      return { place: raw, placeType: isZip ? 'zip' : 'city' };
    }
  }

  const fallback = normalizePlace(stripSpecialty(text, specialty));
  if (fallback.length > 0) {
    const isZip = /^\d{5}$/.test(fallback);
    return { place: fallback, placeType: isZip ? 'zip' : 'city' };
  }

  return null;
}

export function parsePrompt(raw: string): ParsedPrompt {
  const trimmed = raw.trim();
  const errors: string[] = [];

  if (!trimmed) {
    return {
      specialty: '',
      place: '',
      placeType: 'city',
      raw: trimmed,
      isValid: false,
      errors: ['Enter a search like "best cardiologist in Plano"'],
    };
  }

  const specialty = findSpecialty(trimmed);
  const location = findPlace(trimmed, specialty);

  if (!specialty) {
    errors.push('Could not detect a medical specialty');
  }
  if (!location) {
    errors.push('Could not detect a city or zip code');
  }

  return {
    specialty: specialty ?? '',
    place: location?.place ?? '',
    placeType: location?.placeType ?? 'city',
    raw: trimmed,
    isValid: Boolean(specialty && location),
    errors,
  };
}

export function toRankRequest(parsed: ParsedPrompt): RankRequest {
  return {
    version: '1',
    specialty: parsed.specialty,
    place: parsed.place,
    place_type: parsed.placeType,
    original_query: parsed.raw,
  };
}

/** @deprecated Use toRankRequest */
export const toSearchRequest = toRankRequest;
