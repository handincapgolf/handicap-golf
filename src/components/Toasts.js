import React, { useState, useEffect, useRef, memo } from 'react';
import Icon from './Icon';
import Badge from './Badge';

// ========== 通用 Toast ==========
export const Toast = memo(({ message, type, onClose }) => {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  
  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), 2500);
    return () => clearTimeout(timer);
  }, [message]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  const icon = type === 'error' ? <Icon name="alert-circle" size={16} /> : <Icon name="check-circle" size={16} />;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 text-sm`}>
      {icon}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1">
        <Icon name="x" size={12} />
      </button>
    </div>
  );
});

// ========== iOS 风格编辑通知 Toast ==========
export const EditToast = memo(({ log, onClose, onViewDetail, t }) => {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => { setVisible(false); setTimeout(() => onCloseRef.current(), 300); }, 5000);
    return () => clearTimeout(timer);
  }, [log?.id]);

  if (!log) return null;

  const fieldLabel = (f) => {
    const map = { score: t('editLogScore'), putts: t('editLogPutts'), up: t('editLogUp') };
    return map[f] || f;
  };
  const fmtVal = (f, v) => (f === 'up' ? (v ? <Icon name="check" size={13} /> : <Icon name="x" size={13} />) : v);

  return (
    <div className="fixed left-3 right-3 z-50" style={{
      top: visible ? 12 : -200,
      transition: 'top 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
      maxWidth: 400, margin: '0 auto',
    }}>
      <div onClick={() => { onViewDetail(log.hole); onClose(); }} style={{
        background: 'rgba(30, 30, 30, 0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 14, padding: '12px 14px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(255,255,255,0.1)',
        cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #166534, #15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
          }}><Icon name="flag" size={18} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#f5f5f5', fontWeight: 600, fontSize: 13 }}>
                {t('editNotifyTitle').replace('{n}', log.hole)}
              </span>
            </div>
            <div style={{ color: '#aaa', fontSize: 11, marginTop: 1 }}>
              {log.editedByBadge
                ? t('editNotifyBy').split('{who}').flatMap((part, i) =>
                    i === 0 ? [part] : [<Badge key={i} {...log.editedByBadge} size={14} className="inline-flex align-text-bottom mx-0.5" />, part])
                : (log.editedByLabel ? t('editNotifyBy').replace('{who}', log.editedByLabel) : '')}
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label={t('close')}
            style={{ background: 'none', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer', padding: 4 }}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 42 }}>
          {log.changes.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: '#e5e5e5', fontWeight: 500, minWidth: 36 }}>{c.player}</span>
              <span style={{ color: '#999', fontSize: 11, background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 6px' }}>
                {fieldLabel(c.field)}
              </span>
              <span style={{ color: '#ef4444', textDecoration: 'line-through', opacity: 0.7, fontFamily: 'monospace' }}>{fmtVal(c.field, c.from)}</span>
              <span style={{ color: '#666', fontSize: 11 }}><Icon name="arrow-right" size={11} /></span>
              <span style={{ color: '#4ade80', fontWeight: 600, fontFamily: 'monospace' }}>{fmtVal(c.field, c.to)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
