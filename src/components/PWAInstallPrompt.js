import React from 'react';

// ========== PWA 安装提示组件 ==========
export const PWAInstallPrompt = ({ lang = 'en' }) => {
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [isIOS, setIsIOS] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const texts = {
    zh: {
      install: '安装 HandinCap',
      domain: 'handincap.golf',
      fastLaunch: '记分卡',
		offlineUse: '球友对战',
		fullScreen: '一键分享',
      installNow: '立即安装',
      later: '暂不安装',
      gotIt: '我知道了',
      iosTitle: '添加到主屏幕：',
      iosStep1: '点击底部',
      iosStep1b: '分享按钮',
      iosStep2: '选择 "添加到主屏幕"',
      iosStep3: '点击 "添加"'
    },
    en: {
      install: 'Install HandinCap',
      domain: 'handincap.golf',
      fastLaunch: 'Scorecard',
		offlineUse: 'Play Together',
		fullScreen: 'Share',
      installNow: 'Install Now',
      later: 'Maybe Later',
      gotIt: 'Got It',
      iosTitle: 'Add to Home Screen:',
      iosStep1: 'Tap the',
      iosStep1b: 'Share button',
      iosStep2: 'Select "Add to Home Screen"',
      iosStep3: 'Tap "Add"'
    }
  };

  const t = texts[lang] || texts.en;

  React.useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    setIsStandalone(standalone);
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) return;
    }
    if (standalone) return;
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 2500);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (iOS && !standalone && isSafari) {
      setTimeout(() => setShowPrompt(true), 2500);
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    handleClose();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPrompt(false);
      setIsClosing(false);
      localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    }, 300);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className={`absolute inset-0 bg-black/30 pointer-events-auto transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} onClick={handleClose} />
      <div className={`absolute bottom-0 left-0 right-0 pointer-events-auto transition-transform duration-300 ease-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`} style={{ animation: isClosing ? 'none' : 'pwaSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
          <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
          <div className="px-5 pb-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900">{t.install}</h3>
                <p className="text-gray-400 text-sm truncate">{t.domain}</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 mb-4">
              <div className="flex justify-around">
  <div className="flex flex-col items-center">
    <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center mb-1.5 shadow-sm">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>
      </svg>
    </div>
    <span className="text-xs text-gray-600 font-medium">{t.fastLaunch}</span>
  </div>
  <div className="flex flex-col items-center">
    <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center mb-1.5 shadow-sm">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    </div>
    <span className="text-xs text-gray-600 font-medium">{t.offlineUse}</span>
  </div>
  <div className="flex flex-col items-center">
    <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center mb-1.5 shadow-sm">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
      </svg>
    </div>
    <span className="text-xs text-gray-600 font-medium">{t.fullScreen}</span>
  </div>
</div>
            </div>
            {isIOS ? (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2l-2 4h1.5v6h1V6H14L12 2z"/><rect x="4" y="14" width="16" height="2" rx="1"/><path d="M6 18h12v2H6z"/></svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 font-semibold mb-2">{t.iosTitle}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold">1</span>
                          <span>{t.iosStep1} <span className="inline-flex items-center bg-blue-200 px-1.5 py-0.5 rounded"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></span> {t.iosStep1b}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold">2</span>
                          <span>{t.iosStep2}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold">3</span>
                          <span>{t.iosStep3}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={handleClose} className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg active:scale-[0.98] transition-transform">{t.gotIt}</button>
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={handleInstall} className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all active:scale-[0.98]">
                  <span className="flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    {t.installNow}
                  </span>
                </button>
                <button onClick={handleClose} className="w-full py-2.5 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors">{t.later}</button>
              </div>
            )}
          </div>
          <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
      </div>
      <style>{`@keyframes pwaSlideUp { from { transform: translateY(100%); opacity: 0.5; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
};
