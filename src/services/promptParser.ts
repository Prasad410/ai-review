import type { ParsedPrompt, PlaceType, RankRequest } from '../types/api';

const SPECIALTIES = [
  'allergist',
  'anesthesiologist',
  'cardiologist',
  'dermatologist',
  'endocrinologist',
  'gastroenterologist',
  'geriatrician',
  'hematologist',
  'immunologist',
  'nephrologist',
  'neurologist',
  'obstetrician',
  'gynecologist',
  'oncologist',
  'ophthalmologist',
  'orthopedist',
  'otolaryngologist',
  'pathologist',
  'pediatrician',
  'physiatrist',
  'plastic surgeon',
  'psychiatrist',
  'pulmonologist',
  'radiologist',
  'rheumatologist',
  'urologist',
  'surgeon',
  'family medicine',
  'internal medicine',
] as const;

const ZIP_PATTERN = /\b(?:zip\s*(?:code)?\s*)?(\d{5})(?:-\d{4})?\b/i;
const IN_PLACE_PATTERN = /\bin\s+(?:zip\s*(?:code)?\s*)?(.+?)$/i;
const BEST_PREFIX_PATTERN = /^best\s+/i;

function normalizeSpecialty(match: string): string {
  return match.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findSpecialty(text: string): string | null {
  const lower = text.toLowerCase();

  const sorted = [...SPECIALTIES].sort((a, b) => b.length - a.length);
  for (const specialty of sorted) {
    if (lower.includes(specialty)) {
      return specialty;
    }
  }

  const doctorMatch = lower.match(
    /\b([\w\s-]+?)\s+(?:doctor|physician|specialist)\b/
  );
  if (doctorMatch?.[1]) {
    const candidate = normalizeSpecialty(doctorMatch[1].replace(BEST_PREFIX_PATTERN, ''));
    if (candidate.length > 2) return candidate;
  }

  return null;
}

function findPlace(text: string): { place: string; placeType: PlaceType } | null {
  const zipMatch = text.match(ZIP_PATTERN);
  if (zipMatch?.[1]) {
    return { place: zipMatch[1], placeType: 'zip' };
  }

  const inMatch = text.match(IN_PLACE_PATTERN);
  if (inMatch?.[1]) {
    const raw = inMatch[1]
      .replace(ZIP_PATTERN, '$1')
      .replace(/\bzip\s*(?:code)?\b/gi, '')
      .trim();

    if (raw.length > 0) {
      const isZip = /^\d{5}$/.test(raw);
      return { place: raw, placeType: isZip ? 'zip' : 'city' };
    }
  }

  const nearMatch = text.match(/\bnear\s+(.+?)$/i);
  if (nearMatch?.[1]) {
    const raw = nearMatch[1].trim();
    const isZip = /^\d{5}$/.test(raw);
    return { place: raw, placeType: isZip ? 'zip' : 'city' };
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
  const location = findPlace(trimmed);

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
