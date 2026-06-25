import { Layout } from './components/Layout';
import { SearchForm } from './components/SearchForm';
import { ParsedQueryPreview } from './components/ParsedQueryPreview';
import { DoctorList } from './components/DoctorList';
import { FounderVision } from './components/FounderVision';
import { StatusMessage } from './components/StatusMessage';
import { useDoctorSearch } from './hooks/useDoctorSearch';
import styles from './App.module.css';

const PLACE_SUGGESTIONS = [
  'cardiology',
  'dermatology',
  'pediatrics',
  'neurology',
];

function getSearchSuggestions(parsed: { specialty: string; place: string; placeType: string }) {
  const placeLabel = parsed.placeType === 'zip' ? `zip code ${parsed.place}` : parsed.place;
  const fallbackSpecialties = PLACE_SUGGESTIONS.filter(
    (specialty) => specialty !== parsed.specialty.toLowerCase()
  );

  return [
    `Top ${parsed.specialty} specialists in ${placeLabel}`,
    `Popular ${fallbackSpecialties[0] ?? 'specialists'} in ${placeLabel}`,
    `Best ${fallbackSpecialties[1] ?? 'doctors'} near ${placeLabel}`,
    `Top-rated ${fallbackSpecialties[2] ?? 'providers'} in ${placeLabel}`,
  ];
}

export default function App() {
  const { status, doctors, meta, parsed, error, search } = useDoctorSearch();

  const suggestions = status === 'success' && parsed ? getSearchSuggestions(parsed) : undefined;

  return (
    <Layout>
      <SearchForm
        onSearch={search}
        isLoading={status === 'loading'}
        suggestions={suggestions}
        suggestionLabel={status === 'success' ? 'Suggested searches' : 'Try:'}
      />

      {status === 'idle' && <FounderVision />}

      {parsed && status !== 'idle' && (
        <div className={styles.previewWrap}>
          <ParsedQueryPreview parsed={parsed} />
        </div>
      )}

      {status === 'loading' && (
        <StatusMessage
          type="loading"
          message="Searching physicians by school prestige and experience…"
        />
      )}

      {status === 'error' && error && (
        <StatusMessage type="error" message={error} />
      )}

      {status === 'success' && meta && doctors.length > 0 && (
        <DoctorList doctors={doctors} meta={meta} />
      )}

      {status === 'success' && doctors.length === 0 && (
        <StatusMessage
          type="empty"
          message="No specialists matched that search. Try a different specialty or location."
        />
      )}
    </Layout>
  );
}
