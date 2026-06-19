import { useCallback, useState } from 'react';
import type { SearchState } from '../types/api';
import { searchDoctors } from '../services/doctorApi';
import { parsePrompt, toRankRequest } from '../services/promptParser';

const initialState: SearchState = {
  status: 'idle',
  doctors: [],
  meta: null,
  parsed: null,
  error: null,
};

export function useDoctorSearch() {
  const [state, setState] = useState<SearchState>(initialState);

  const search = useCallback(async (prompt: string) => {
    const parsed = parsePrompt(prompt);

    if (!parsed.isValid) {
      setState({
        status: 'error',
        doctors: [],
        meta: null,
        parsed,
        error: parsed.errors.join('. '),
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      status: 'loading',
      parsed,
      error: null,
    }));

    try {
      const response = await searchDoctors(toRankRequest(parsed));
      setState({
        status: 'success',
        doctors: response.doctors,
        meta: response.meta,
        parsed,
        error: null,
      });
    } catch {
      setState({
        status: 'error',
        doctors: [],
        meta: null,
        parsed,
        error: 'Could not reach the search service. Try again in a moment.',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return { ...state, search, reset };
}
