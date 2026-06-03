'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Phone, Send, Star, X } from 'lucide-react';
import { addFeedback } from '../../redux/feedbackSlice';
import { AppDispatch } from '../../redux/store';

const terms = `Terms & Conditions

- Provide accurate and truthful information when using the app
- Must be at least 18 years old and medically eligible to donate blood
- The platform connects donors, patients, and blood banks and does not provide medical advice
- You are responsible for your account security
- Misuse may result in suspension`;

const policy = `Privacy Policy

- We collect basic personal details that you choose to share
- Data is used to connect suitable donors, patients, and blood banks
- We do not sell your data
- Information is shared only with consent or when required by law
- You can update or delete your data at any time`;

export default function FeedbackPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [modalContent, setModalContent] = useState<'terms' | 'policy' | null>(null);
  const [status, setStatus] = useState<{ text: string; success: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (!feedback.trim()) {
      setStatus({ text: 'Please enter your feedback.', success: false });
      return;
    }

    if (rating === 0) {
      setStatus({ text: 'Please select a rating.', success: false });
      return;
    }

    setLoading(true);
    dispatch(addFeedback({ userId: 'appfeedback', message: feedback, rating })).unwrap().then(() => {
      setLoading(false);
      setFeedback('');
      setRating(0);
      setStatus({ text: 'Thank you for your feedback.', success: true });
    }).catch((err) => {
      setLoading(false);
      setStatus({ text: err?.message || 'Failed to submit feedback.', success: false });
    });
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '32px 20px' }}>
      <section className="glass-panel" style={{ width: '100%', maxWidth: '720px', padding: '32px', display: 'grid', gap: '24px' }}>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px 16px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            width: 'fit-content',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
          aria-label="Go back to previous page"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', display: 'grid', placeItems: 'center', borderRadius: '10px', background: 'var(--primary-glow)', border: '1px solid rgba(255,59,87,.2)' }}>
            <MessageSquare size={24} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '26px' }}>App Feedback</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Help us improve your experience.</p>
          </div>
        </div>

        {status && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', color: status.success ? 'var(--success)' : '#ef4444', background: status.success ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)' }}>
            {status.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <label style={{ display: 'grid', gap: '8px', color: 'var(--text-secondary)', fontWeight: 700 }}>
            Your Feedback
            <textarea className="form-input-field" rows={7} placeholder="Tell us what you think about the app..." value={feedback} onChange={(event) => setFeedback(event.target.value)} />
          </label>

          <div style={{ display: 'grid', gap: '10px', justifyItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Rate your experience</span>
            <div className="star-rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" className="star-rating-btn" onClick={() => setRating(star)} aria-label={`Rate ${star}`}>
                  <Star size={34} color={star <= rating ? '#FFD700' : 'var(--text-muted)'} fill={star <= rating ? '#FFD700' : 'transparent'} />
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-premium btn-premium-primary">
            <Send size={18} />
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>

        <footer style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
          <button onClick={() => setModalContent('terms')} style={footerButton}>Terms of Service</button>
          <button onClick={() => setModalContent('policy')} style={footerButton}>Privacy Policy</button>
          <a href="tel:1234567890" style={{ ...footerButton, textDecoration: 'none', display: 'inline-flex', gap: '6px', alignItems: 'center' }}><Phone size={15} />Contact Us</a>
        </footer>
      </section>

      {modalContent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'grid', placeItems: 'center', padding: '20px', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '680px', padding: '24px', display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '22px' }}>{modalContent === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}</h2>
              <button onClick={() => setModalContent(null)} className="btn-premium btn-premium-secondary" style={{ padding: '8px' }}><X size={18} /></button>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', lineHeight: 1.7 }}>{modalContent === 'terms' ? terms : policy}</pre>
          </div>
        </div>
      )}
    </main>
  );
}

const footerButton: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: '14px',
};