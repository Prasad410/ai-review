import { Layout } from './components/Layout';
import { SearchForm } from './components/SearchForm';
import { ParsedQueryPreview } from './components/ParsedQueryPreview';
import { DoctorList } from './components/DoctorList';
import { StatusMessage } from './components/StatusMessage';
import { useDoctorSearch } from './hooks/useDoctorSearch';
import styles from './App.module.css';

export default function App() {
  const { status, doctors, meta, parsed, error, search } = useDoctorSearch();

  return (
    <Layout>
      <SearchForm onSearch={search} isLoading={status === 'loading'} />

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
