import type { FormEvent } from 'react';
import styles from './SearchForm.module.css';

interface SearchFormProps {
  onSearch: (prompt: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

const EXAMPLES = [
  'best cardiologist in Plano',
  'best neurologist in zip code 75024',
  'best dermatologist in Austin',
];

export function SearchForm({ onSearch, isLoading, initialValue = '' }: SearchFormProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('prompt') as HTMLInputElement;
    onSearch(input.value);
  };

  const fillExample = (example: string) => {
    const input = document.getElementById('search-prompt') as HTMLInputElement | null;
    if (input) {
      input.value = example;
      input.focus();
    }
  };

  return (
    <section className={styles.section} aria-labelledby="search-heading">
      <h1 id="search-heading" className={styles.heading}>
        Find the right specialist
      </h1>
      <p className={styles.subheading}>
        Describe who you need and where — we rank physicians by medical school
        prestige and years of experience.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="search-prompt" className="sr-only">
          Search for a doctor
        </label>
        <div className={styles.inputGroup}>
          <input
            id="search-prompt"
            name="prompt"
            type="text"
            className={styles.input}
            placeholder='e.g. "best cardiologist in Plano"'
            defaultValue={initialValue}
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            className={styles.submit}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingDots} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      <div className={styles.examples} role="group" aria-label="Example searches">
        <span className={styles.examplesLabel}>Try:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className={styles.exampleChip}
            onClick={() => fillExample(example)}
            disabled={isLoading}
          >
            {example}
          </button>
        ))}
      </div>
    </section>
  );
}
