import { useState } from 'react';
import { submitReview } from '../services/doctorApi';
import styles from './ReviewForm.module.css';

export function ReviewForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [review, setReview] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!name.trim() || !email.trim() || !review.trim()) {
            setStatus('error');
            setMessage('Please fill out all review fields before submitting.');
            return;
        }

        setStatus('submitting');
        setMessage('');

        try {
            await submitReview({
                user_name: name.trim(),
                user_email: email.trim(),
                user_review: review.trim(),
            });
            setStatus('success');
            setMessage('Thank you for your review — it has been recorded.');
            setName('');
            setEmail('');
            setReview('');
        } catch {
            setStatus('error');
            setMessage('Something went wrong while submitting your review. Please try again later.');
        }
    };

    return (
        <aside className={styles.reviewCard} aria-labelledby="review-heading">
            <h3 id="review-heading" className={styles.heading}>
                Share your feedback
            </h3>
            <p className={styles.copy}>
                Help us improve Meridian by submitting a short review after using the search results.
            </p>
            <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label} htmlFor="review-name">
                    Name
                </label>
                <input
                    id="review-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                    disabled={status === 'submitting'}
                />

                <label className={styles.label} htmlFor="review-email">
                    Email
                </label>
                <input
                    id="review-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    disabled={status === 'submitting'}
                />

                <label className={styles.label} htmlFor="review-text">
                    Review
                </label>
                <textarea
                    id="review-text"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className={styles.textarea}
                    rows={4}
                    disabled={status === 'submitting'}
                />

                <button type="submit" className={styles.submit} disabled={status === 'submitting'}>
                    {status === 'submitting' ? 'Submitting…' : 'Submit review'}
                </button>
            </form>
            {message && (
                <p className={styles.message} data-status={status === 'error' ? 'error' : 'success'}>
                    {message}
                </p>
            )}
        </aside>
    );
}
