import React, { memo } from 'react';
import { AlertCircle, Camera } from 'lucide-react';

// ========== 通用确认弹窗 ==========
export const ConfirmDialog = memo(({ isOpen, onClose, onConfirm, message, t, showScreenshotHint }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-base font-semibold text-gray-900 mb-4 leading-relaxed">{message}</h3>
        {showScreenshotHint && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Camera className="w-5 h-5 text-yellow-600 mt-0.5" />
              <p className="text-xs text-yellow-800">
                {t('screenshotHint')}
              </p>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            {t('yes')}
          </button>
        </div>
      </div>
    </div>
  );
});

// ========== Putts 零值警告弹窗 ==========
export const PuttsWarningDialog = memo(({ isOpen, onClose, onConfirm, players, scores, pars, holes, currentHole, t, lang }) => {
  if (!isOpen || !players || players.length === 0) return null;

  const holeNum = holes[currentHole];
  const par = pars[holeNum] || 4;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 max-w-xs w-full shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">{t('confirmPutts')}</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">{t('zeroPuttsWarning')}</p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
          {players.map(player => {
            const playerScore = scores[player] || par;
            return (
              <div key={player} className="flex items-center justify-between py-1.5 border-b border-yellow-100 last:border-b-0">
                <span className="font-semibold text-gray-900">{player}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600">{t('puttsScore')}: <span className="font-bold text-gray-900">{playerScore}</span></span>
                  <span className="text-red-600 font-bold">{t('puttsPutts')}: 0</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <p className="text-xs text-gray-500 mb-3">
          💡 {t('puttsTip')}
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
          >
            {t('puttsGoBack')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
          >
            {t('puttsConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
});
