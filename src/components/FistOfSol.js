import React, { useEffect, useCallback } from 'react';

/**
 * Fist of Sol effect overlay.
 * Shows the HoN "Fist of Sol" kill effect when an UP player wins in Win123.
 * Renders in a full-screen iframe overlay with semi-transparent dark backdrop.
 * Auto-dismisses after ~3s when the effect completes.
 */
const FistOfSol = React.memo(({ show, onComplete }) => {
  const handleMessage = useCallback((e) => {
    if (e.data && e.data.type === 'fistOfSolDone') {
      // Small delay so the last particles fade naturally
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
    }
  }, [onComplete]);

  useEffect(() => {
    if (!show) return;
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [show, handleMessage]);

  // Fallback: auto-dismiss after 4s even if postMessage fails
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={() => { if (onComplete) onComplete(); }}
    >
      <iframe
        src={`${process.env.PUBLIC_URL}/fist-effect/index.html`}
        title="Fist of Sol"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'transparent',
        }}
        allow="autoplay"
      />
    </div>
  );
});

export default FistOfSol;
