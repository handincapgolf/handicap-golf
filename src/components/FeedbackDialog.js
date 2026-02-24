import React, { useState, memo } from 'react';

const CATEGORY_KEYS = [
  'feedbackCatNewModes', 'feedbackCatUI', 'feedbackCatSpeed', 'feedbackCatCourse',
  'feedbackCatScoring', 'feedbackCatMultiplayer', 'feedbackCatBug', 'feedbackCatOther',
];

const WORKER_URL = 'https://handincap.golf'; // ← 改成你的 Worker URL

const FeedbackDialog = memo(({ isOpen, onClose, t, courseName = '' }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [categories, setCategories] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const starLabels = [
    '', t('feedbackStar1'), t('feedbackStar2'), t('feedbackStar3'), t('feedbackStar4'), t('feedbackStar5')
  ];

  const toggleCategory = (key) => {
    setCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        rating,
        categories: categories.map(k => t(k)),
        comment,
        course: courseName,
        lang: document.documentElement.lang || navigator.language || 'en',
        ts: new Date().toISOString(),
        ua: navigator.userAgent,
      };
      await fetch(`${WORKER_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Feedback submit failed:', err);
      // Still show thanks — don't block user
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setRating(0); setHoverRating(0); setCategories([]); setComment(''); setSubmitted(false);
    }, 350);
  };

  if (!isOpen) return null;

  const activeRating = hoverRating || rating;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fbFadeIn 0.25s ease',
      }}
    >
      <style>{`
        @keyframes fbFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fbSlideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes fbPop { from { transform: scale(0.8); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: 480,
          maxHeight: '88vh', overflowY: 'auto',
          animation: 'fbSlideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
        }}
      >
        {submitted ? (
          /* ── Thank you ── */
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 64, animation: 'fbPop 0.5s ease', marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{t('feedbackThanks')}</h2>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32 }}>{t('feedbackThanksDetail')}</p>
            <button onClick={handleClose} style={{
              padding: '14px 48px', borderRadius: 12, border: 'none',
              backgroundColor: '#059669', color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer',
            }}>{t('close')}</button>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 20px 0', position: 'sticky', top: 0, background: 'white', zIndex: 1,
            }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{t('feedbackTitle')}</h2>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '2px 0 0' }}>{t('feedbackSubtitle')}</p>
              </div>
              <button onClick={handleClose} style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                backgroundColor: '#f3f4f6', cursor: 'pointer', fontSize: 18, color: '#6b7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            <div style={{ padding: '16px 20px 24px' }}>
              {/* ── Stars ── */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 15, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 12 }}>
                  ⭐ {t('feedbackRateLabel')}
                </label>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        fontSize: 42, lineHeight: 1, cursor: 'pointer', userSelect: 'none',
                        transition: 'transform 0.15s', display: 'inline-block',
                        transform: activeRating >= star ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {activeRating >= star ? '⭐' : '☆'}
                    </span>
                  ))}
                  {activeRating > 0 && (
                    <span style={{
                      fontSize: 14, color: '#059669', fontWeight: 600, marginLeft: 8,
                      animation: 'fbPop 0.2s ease',
                    }}>
                      {starLabels[activeRating]}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Categories ── */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 15, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 12 }}>
                  📋 {t('feedbackCatLabel')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {CATEGORY_KEYS.map((key) => {
                    const active = categories.includes(key);
                    return (
                      <div
                        key={key}
                        onClick={() => toggleCategory(key)}
                        style={{
                          padding: 12, borderRadius: 12, cursor: 'pointer', userSelect: 'none',
                          border: `2px solid ${active ? '#059669' : '#e5e7eb'}`,
                          background: active ? '#ecfdf5' : 'white',
                          color: active ? '#065f46' : '#374151',
                          fontWeight: active ? 600 : 500, fontSize: 14,
                          display: 'flex', alignItems: 'center', gap: 4,
                          transition: 'all 0.2s',
                        }}
                      >
                        {active && <span style={{ color: '#059669' }}>✓</span>}
                        {t(key)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Comment ── */}
              <div style={{ marginBottom: 24 }}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('feedbackCommentPlaceholder')}
                  rows={3}
                  style={{
                    width: '100%', padding: 14, borderRadius: 12,
                    border: '2px solid #e5e7eb', fontSize: 15, resize: 'vertical',
                    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#059669')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>

              {/* ── Submit ── */}
              <button
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                style={{
                  width: '100%', padding: 16, borderRadius: 14, border: 'none',
                  cursor: submitting || rating === 0 ? 'not-allowed' : 'pointer',
                  background: submitting || rating === 0 ? '#d1d5db' : 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white', fontSize: 17, fontWeight: 700,
                  boxShadow: rating > 0 ? '0 4px 14px rgba(5,150,105,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {submitting ? '⏳ ' + t('feedbackSubmitting') : '📨 ' + t('feedbackSubmit')}
              </button>

              <button onClick={handleClose} style={{
                width: '100%', padding: 12, marginTop: 8, background: 'none',
                border: 'none', color: '#9ca3af', fontSize: 14, cursor: 'pointer',
              }}>{t('feedbackSkip')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default FeedbackDialog;
