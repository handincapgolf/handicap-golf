import React from 'react';
import { Play } from 'lucide-react';
import { LANGUAGES } from '../locales';

// Header bar with language picker (rendered outside flex-1 overflow-auto)
export const HomeLangBar = ({
  lang,
  setLang,
  showLangPicker,
  setShowLangPicker,
  t,
}) => (
  <div className="flex justify-end items-center p-3 bg-white border-b border-gray-200 relative">
    <button
      onClick={() => setShowLangPicker(!showLangPicker)}
      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium shadow-sm"
    >
      {t('switchLang')}
    </button>
    {showLangPicker && (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setShowLangPicker(false)} />
        <div className="absolute right-3 top-12 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-1 min-w-[160px] overflow-hidden" style={{ animation: 'fadeIn 0.15s ease-out' }}>
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => {
                setLang(code);
                try { localStorage.setItem('handincap_lang', code); } catch {}
                setShowLangPicker(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${lang === code ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {lang === code && <span className="mr-1.5">✓</span>}{label}
            </button>
          ))}
        </div>
      </>
    )}
  </div>
);

// Home content (rendered inside max-w-md wrapper)
export const HomeContent = ({
  hasSavedGame,
  resumeGame,
  setSearchQuery,
  setSelectedCourse,
  setCourseApplied,
  setCurrentSection,
  showQrScanner,
  startQrScanner,
  stopQrScanner,
  qrVideoRef,
  mp,
  showToast,
  setFeedbackDialog,
  t,
}) => (
  <div className="h-full flex flex-col items-center justify-center px-4">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-green-600 mb-2">
        {t('title')}
      </h1>
      <p className="text-gray-600">
        {t('subtitle')}
      </p>
    </div>
    
    <div className="w-full max-w-xs space-y-3">
      {hasSavedGame && (
        <button
          onClick={resumeGame}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          {t('resume')}
        </button>
      )}
      <button
        onClick={() => {
          setSearchQuery('');
          setSelectedCourse(null);
          setCourseApplied(false);
          setCurrentSection('course');
        }}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" />
        {t('create')}
      </button>
      
      {/* 加入房间 */}
      <div className="pt-3 border-t border-gray-200 mt-3">
        <p className="text-xs text-gray-500 text-center mb-2">
          {t('mpMultiplayer')}
        </p>
        <div className="flex gap-1.5">
          <input
            type="text"
            maxLength={6}
            value={mp.joinerCode}
            onChange={(e) => mp.setJoinerCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder={t('mpCodePlaceholder')}
            className="w-0 flex-1 min-w-0 text-center text-base font-mono font-bold tracking-wider py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={async () => {
              if (mp.joinerCode.length !== 6) {
                showToast(t('mpEnter6Digit'), 'error');
                return;
              }
              const result = await mp.joinGame(mp.joinerCode);
              if (!result.ok) {
                showToast(result.error || 'Room not found', 'error');
              } else {
                setCurrentSection('mp-role');
              }
            }}
            disabled={mp.joinerCode.length !== 6}
            className={`px-3 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${
              mp.joinerCode.length === 6
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {t('mpJoin')}
          </button>
          <button
            onClick={startQrScanner}
            className="px-2.5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition text-sm"
            title="Scan QR"
          >
            📷
          </button>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center">
          <div className="relative w-72 h-72 rounded-2xl overflow-hidden border-4 border-white">
            <video ref={qrVideoRef} className="w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 border-2 border-green-400 rounded-2xl pointer-events-none" />
          </div>
          <p className="text-white mt-4 text-sm">{t('mpPointQr')}</p>
          <button
            onClick={stopQrScanner}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-semibold"
          >
            {t('close')}
          </button>
        </div>
      )}
    </div>
  
    {/* 页脚版权 */}
    <footer className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3 px-4">
      <button
        onClick={() => setFeedbackDialog(true)}
        style={{ border: '2px dashed #f59e0b', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}
        className="w-full max-w-xs text-amber-800 py-3 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-[15px]"
      >
        {t('feedbackBtn')}
      </button>
      <span className="text-gray-400 text-xs">© 2025 HandinCap. All rights reserved. {window.APP_VERSION}</span>
    </footer>
  </div>
);