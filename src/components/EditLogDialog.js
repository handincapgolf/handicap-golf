import React, { memo } from 'react';
import { CheckCircle, X } from 'lucide-react';

// ========== 修改记录弹窗 ==========
export const EditLogDialog = memo(({ isOpen, onClose, logs, filterHole, t }) => {
  if (!isOpen) return null;
  const filtered = filterHole ? logs.filter(l => l.hole === filterHole) : logs;

  const fieldLabel = (f) => {
    const map = { score: t('editLogScore'), putts: t('editLogPutts'), up: t('editLogUp') };
    return map[f] || f;
  };
  const fmtVal = (f, v) => {
    if (f === 'up') {
      if (typeof v === 'string') return v; // 百家乐: 'UP①', '—'
      return v ? '✓' : '✗'; // Win123: true/false
    }
    return v;
  };
  const timeAgo = (ts) => {
    const d = typeof ts === 'string' ? new Date(ts) : new Date(ts);
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return t('editLogScore') === 'Score' ? 'just now' : '刚刚';
    if (mins < 60) return t('editLogScore') === 'Score' ? `${mins}m ago` : `${mins}分钟前`;
    const hrs = Math.floor(mins / 60);
    return t('editLogScore') === 'Score' ? `${hrs}h ago` : `${hrs}小时前`;
  };
  const fmtTime = (ts) => {
    const d = typeof ts === 'string' ? new Date(ts) : new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-5 max-w-sm w-full shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-900">
            📋 {filterHole ? t('editLogHoleTitle').replace('{n}', filterHole) : t('editLogTitle')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          {t('editLogCount').replace('{n}', filtered.length)} · {t('editLogAllRecorded')}
        </p>
        <div className="flex-1 overflow-auto space-y-3 min-h-0">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">{t('editLogEmpty')} ✅</p>
            </div>
          ) : filtered.map((log) => (
            <div key={log.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    {t('hole')} {log.hole}
                  </span>
                  {log.editedByLabel && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{log.editedByLabel}</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{fmtTime(log.timestamp)}</div>
                  <div className="text-xs text-gray-400">{timeAgo(log.timestamp)}</div>
                </div>
              </div>
              <div className="space-y-1.5">
                {log.changes.map((c, ci) => (
                  <div key={ci} className="flex items-center gap-2 bg-white rounded px-2.5 py-1.5 border border-gray-100">
                    <span className="text-sm font-semibold text-gray-800" style={{ minWidth: 40 }}>{c.player}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      c.field === 'score' ? 'bg-green-100 text-green-700' :
                      c.field === 'putts' ? 'bg-purple-100 text-purple-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{fieldLabel(c.field)}</span>
                    <div className="flex-1" />
                    <span className="text-red-500 line-through text-sm" style={{ fontFamily: 'monospace' }}>{fmtVal(c.field, c.from)}</span>
                    <span className="text-gray-400 text-xs">→</span>
                    <span className="text-green-600 font-bold text-sm" style={{ fontFamily: 'monospace' }}>{fmtVal(c.field, c.to)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 mt-4">
          {t('editLogClose')}
        </button>
      </div>
    </div>
  );
});