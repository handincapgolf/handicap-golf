import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useMultiplayerSync } from './useMultiplayerSync';
import { GOLF_COURSES, searchCourses } from './data/courses';
import { useTranslation, detectLanguage } from './locales';
import { gameModes } from './gameModes';
import { injectGameStyles } from './styles/gameStyles';
import { 
  RoundReportPage,
  buildRoundReportData,
  decodeRoundReport 
} from './RoundReport';
import {
  encodeShareData,
  decodeShareData,
  generatePlayerShareData,
  generateShareUrl
} from './utils/shareEncoder';
import SharePage from './components/SharePage';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import CourseSection from './sections/CourseSection';
import PlayersSection from './sections/PlayersSection';
import { MpLobbySection, MpRoleSection, MpClaimSection } from './sections/MultiplayerSections';
import ScorecardSection from './sections/ScorecardSection';
import GameSection from './sections/GameSection';
import { HomeLangBar, HomeContent } from './sections/HomeSection';
import GlobalDialogs from './sections/GlobalDialogs';

const courses = {
  f9: [1,2,3,4,5,6,7,8,9],
  b9: [10,11,12,13,14,15,16,17,18],
  f18: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
  b18: [10,11,12,13,14,15,16,17,18,1,2,3,4,5,6,7,8,9]
};


function IntegratedGolfGame() {

// ========== 注入样式 ==========
  useEffect(() => { injectGameStyles(); }, []);
  // ========== 结束样式注入 ==========
  const [lang, setLang] = useState(() => {
    try {
      return detectLanguage();
    } catch {
      return 'en';
    }
  });
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', action: null, showScreenshotHint: false });
  const [holeConfirmDialog, setHoleConfirmDialog] = useState({ isOpen: false, action: null });
  const [holeSelectDialog, setHoleSelectDialog] = useState(false);
  const [editHoleDialog, setEditHoleDialog] = useState({ isOpen: false, hole: null });
  const [editLog, setEditLog] = useState([]);
  const [editToastData, setEditToastData] = useState(null);
  const [editLogDialog, setEditLogDialog] = useState({ isOpen: false, hole: null });
  // Advance Mode 报告弹窗状态
const [advanceReportPlayer, setAdvanceReportPlayer] = useState(null);
const [showAdvanceFullDetail, setShowAdvanceFullDetail] = useState(false);
  
  const [setupMode, setSetupMode] = useState('auto');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseApplied, setCourseApplied] = useState(false);
  
  const [courseType, setCourseType] = useState('f18');
  const [holes, setHoles] = useState(courses.f18);
  const [pars, setPars] = useState(courses.f18.reduce((acc, hole) => ({...acc, [hole]: 4}), {}));
  
  const [gameMode, setGameMode] = useState('matchPlay');
  const [showModeDesc, setShowModeDesc] = useState(false);
  const [jumboMode, setJumboMode] = useState(false);
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [stake, setStake] = useState('');
  const [prizePool, setPrizePool] = useState(0);
  const [playerHandicaps, setPlayerHandicaps] = useState({});
  const [advanceMode, setAdvanceMode] = useState('off');
  const [advancePlayers, setAdvancePlayers] = useState({});
  const [puttsWarningDialog, setPuttsWarningDialog] = useState({ isOpen: false, players: [] });
  // 新增：展开说明的状态
const [showAdvanceInfo, setShowAdvanceInfo] = useState(false);
  
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState({});  
  const [ups, setUps] = useState({});  
  const [upOrder, setUpOrder] = useState([]);  // 百家乐UP顺序
  const [putts, setPutts] = useState({});
  const [water, setWater] = useState({});
  const [ob, setOb] = useState({});
  const [allScores, setAllScores] = useState({});  
  const [allUps, setAllUps] = useState({});  
  const [allUpOrders, setAllUpOrders] = useState({});  // 百家乐每洞UP顺序
  const [allPutts, setAllPutts] = useState({});
  const [allWater, setAllWater] = useState({});
  const [allOb, setAllOb] = useState({});
  const [totalMoney, setTotalMoney] = useState({});
  const [moneyDetails, setMoneyDetails] = useState({});
  const [completedHoles, setCompletedHoles] = useState([]);
  const [pendingRankings, setPendingRankings] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentHoleSettlement, setCurrentHoleSettlement] = useState(null);
  const [totalSpent, setTotalSpent] = useState({});
  const [showRoundReport, setShowRoundReport] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const qrVideoRef = useRef(null);
  const qrStreamRef = useRef(null);
  const playHoleIntroRef = useRef(null); // ref to avoid TDZ
  const saveTimerRef = useRef(null); // debounce save to localStorage
  const stakeInputRef = useRef(null); // focus stake input on validation error
  
  // 语音播报状态
const [voiceEnabled, setVoiceEnabled] = useState(() => {
  try {
    return localStorage.getItem('handincap_voice') === 'true';
  } catch { return false; }
});

// ========== iOS speechSynthesis 解锁 ==========
// iOS 要求首次 speak() 必须在用户手势事件中触发
// 之后程序化调用（如 auto-advance）才能正常播报
useEffect(() => {
  if (!('speechSynthesis' in window)) return;
  const unlock = () => {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    speechSynthesis.speak(u);
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('click', unlock);
  };
  document.addEventListener('touchstart', unlock, { once: true });
  document.addEventListener('click', unlock, { once: true });
  return () => {
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('click', unlock);
  };
}, []);

// ========== 禁止 PWA 下拉刷新 ==========
useEffect(() => {
  const style = document.createElement('style');
  style.textContent = `
    html, body { 
      overscroll-behavior-y: none;
    }
  `;
  document.head.appendChild(style);
  return () => style.remove();
}, []);

// ========== 自动刷新：从后台切回首页时检查更新 ==========
const lastActiveRef = useRef(Date.now());
useEffect(() => {
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      const elapsed = Date.now() - lastActiveRef.current;
      if (elapsed > 30 * 60 * 1000 && currentSection === 'home') {
        window.location.reload();
      }
      lastActiveRef.current = Date.now();
    } else {
      lastActiveRef.current = Date.now();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, [currentSection]);

// ========== 比赛结束自动弹出 Edit Log，10秒后自动关闭 ==========
useEffect(() => {
  if (gameComplete && editLog.length > 0 && currentSection === 'scorecard') {
    setEditLogDialog({ isOpen: true, hole: null });
    const timer = setTimeout(() => {
      setEditLogDialog({ isOpen: false, hole: null });
    }, 10000);
    return () => clearTimeout(timer);
  }
}, [gameComplete, currentSection]);

// ========== 最近使用球场 ==========
const RECENT_COURSES_KEY = 'handincap_recent_courses';
const [recentCourses, setRecentCourses] = useState(() => {
  try { return JSON.parse(localStorage.getItem('handincap_recent_courses') || '[]'); } catch { return []; }
});
const saveRecentCourse = useCallback((course) => {
  setRecentCourses(prev => {
    const list = prev.filter(c => c.shortName !== course.shortName);
    list.unshift(course);
    const trimmed = list.slice(0, 5);
    localStorage.setItem('handincap_recent_courses', JSON.stringify(trimmed));
    return trimmed;
  });
}, []);

const [showAdvanceTooltip, setShowAdvanceTooltip] = useState(false);
const [showMpTooltip, setShowMpTooltip] = useState(false);
const [showHcpTooltip, setShowHcpTooltip] = useState(false);

// ========== 多人同步 ==========
const mp = useMultiplayerSync();

  // 从 editLog 中提取被编辑过的洞号集合
  const editedHolesSet = useMemo(() => new Set(editLog.map(l => l.hole)), [editLog]);

// 点击外部关闭气泡
useEffect(() => {
  if (!showAdvanceTooltip && !showMpTooltip && !showHcpTooltip) return;
  const handleClick = () => { setShowAdvanceTooltip(false); setShowMpTooltip(false); setShowHcpTooltip(false); };
  setTimeout(() => document.addEventListener('click', handleClick), 0);
  return () => document.removeEventListener('click', handleClick);
}, [showAdvanceTooltip, showMpTooltip, showHcpTooltip]);

// 语音播报函数（带超时防护，防止 Android TTS 卡死）
const TTS_TIMEOUT = 8000; // 单个播报最长 8 秒
const playHoleResults = useCallback((players, holeScores, holePutts, enableSpecialAudio = false, rankings = null, isTied = false, onComplete = null) => {
  if (!voiceEnabled) { if (onComplete) onComplete(); return; }
  if (!('speechSynthesis' in window)) { if (onComplete) onComplete(); return; }
  
  // 取消之前的播报，延迟 100ms 再开始（Android TTS 需要时间清理）
  speechSynthesis.cancel();
  
  // 使用队列方式依次播报
  let currentIndex = 0;
  let ttsTimer = null;
  
  const clearTtsTimer = () => {
    if (ttsTimer) { clearTimeout(ttsTimer); ttsTimer = null; }
  };
  
  const playNext = () => {
    clearTtsTimer();
    if (currentIndex >= players.length) { if (onComplete) onComplete(); return; }
    
    const player = players[currentIndex];
    const on = holeScores[player] || 0;
    const putt = holePutts[player] || 0;
    const puttWord = putt === 1 ? 'putt' : 'putts';
    
    // 从rankings获取该玩家的差点（如果有）
    let handicap = 0;
    if (rankings) {
      const playerRanking = rankings.find(r => r.player === player);
      if (playerRanking) {
        handicap = playerRanking.stroke - playerRanking.netScore;
      }
    }
    
    // 构建播报文字
    const voiceTemplate = handicap > 0 ? t('voiceWithHcp') : t('voiceNoHcp');
    const text = voiceTemplate
      .replace('{player}', player)
      .replace('{on}', on)
      .replace('{putt}', putt)
      .replace('{puttWord}', puttWord)
      .replace('{handicap}', handicap);
    
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = t('ttsLang');
    
    // 尝试使用女声
    const voices = speechSynthesis.getVoices();
    const female = voices.find(v => 
      v.name.includes('Samantha') ||
      v.name.includes('Zira') ||
      v.name.includes('Female') ||
      v.name.includes('Google') && v.lang === 'en-US' ||
      v.name.includes('Xiaoxiao') ||
      v.name.includes('Huihui') ||
      v.name.includes('女') ||
      v.name.toLowerCase().includes('female')
    );
    if (female) msg.voice = female;
    
    // 超时防护：Android onend 有时不触发
    ttsTimer = setTimeout(() => {
      speechSynthesis.cancel();
      currentIndex++;
      playNext();
    }, TTS_TIMEOUT);
    
    msg.onend = () => {
      clearTtsTimer();
      setTimeout(() => {
        currentIndex++;
        playNext();
      }, 300);
    };
    
    msg.onerror = () => {
      clearTtsTimer();
      currentIndex++;
      playNext();
    };
    
    speechSynthesis.speak(msg);
  };
  
  // 延迟 100ms 开始（等 cancel 清理完）
  setTimeout(playNext, 100);
}, [voiceEnabled, lang]);

  const activePlayers = useMemo(() => {
    return playerNames.filter(name => name.trim());
  }, [playerNames]);
  
  // ========== 多人同步 Effects ==========
  // Joiner: 检测 Creator 开始比赛
  useEffect(() => {
    if (!mp.multiplayerOn || !mp.remoteGame) return;
    if (mp.remoteGame.status === 'playing' && (mp.multiplayerSection === 'lobby' || currentSection === 'mp-lobby')) {
      mp.setMultiplayerSection(null);
      setCurrentSection('game');
    }
  }, [mp.remoteGame?.status, mp.multiplayerSection, mp.multiplayerOn, currentSection]);

  // Joiner: 检测 Creator 结束比赛 → 自动跳转结果页
  useEffect(() => {
    if (!mp.multiplayerOn || !mp.remoteGame) return;
    if (mp.remoteGame.status === 'finished' && !gameComplete) {
      if (mp.remoteGame.allScores) setAllScores(mp.remoteGame.allScores);
      if (mp.remoteGame.allUps) setAllUps(mp.remoteGame.allUps);
      if (mp.remoteGame.allPutts) setAllPutts(mp.remoteGame.allPutts);
      if (mp.remoteGame.allWater) setAllWater(mp.remoteGame.allWater);
      if (mp.remoteGame.allOb) setAllOb(mp.remoteGame.allOb);
      if (mp.remoteGame.completedHoles) setCompletedHoles(mp.remoteGame.completedHoles);
      if (mp.remoteGame.totalMoney) setTotalMoney(mp.remoteGame.totalMoney);
      if (mp.remoteGame.moneyDetails) setMoneyDetails(mp.remoteGame.moneyDetails);
      if (mp.remoteGame.totalSpent) setTotalSpent(mp.remoteGame.totalSpent);
      if (mp.remoteGame.prizePool !== undefined) setPrizePool(mp.remoteGame.prizePool);
      setGameComplete(true);
      setCurrentSection('scorecard');
      showToast(t('gameOver'));
    }
  }, [mp.remoteGame?.status, mp.multiplayerOn, gameComplete]);

  // 任何角色: 房间消失或断线 → 跳转 scorecard（有数据）或 home（无数据）
  useEffect(() => {
    if (!mp.multiplayerOn) return;
    if (mp.syncStatus !== 'roomGone') return;
    
    mp.stopPolling();
    if (completedHoles.length > 0) {
      setGameComplete(true);
      setCurrentSection('scorecard');
      showToast(t('gameOver') || 'Game ended');
    } else {
      mp.resetMultiplayer();
      mp.setMultiplayerSection(null);
      setCurrentSection('home');
    }
  }, [mp.syncStatus, mp.multiplayerOn, completedHoles.length]);

  // Joiner/Viewer: 检测 Creator 已完成当前洞 → 自动跟进到下一洞
  useEffect(() => {
    if (!mp.multiplayerOn || (mp.multiplayerRole !== 'joiner' && mp.multiplayerRole !== 'viewer')) return;
    if (!mp.remoteGame?.completedHoles || mp.remoteGame.status !== 'playing') return;
    
    const myHoleNum = holes[currentHole];
    if (mp.remoteGame.completedHoles.includes(myHoleNum)) {
      // 播报本洞成绩
      const holeData = mp.remoteGame.holes?.[myHoleNum];
      if (holeData?.scores && voiceEnabled) {
        const holeScores = holeData.scores;
        const holePutts = holeData.putts || {};
        const sortedPlayers = [...activePlayers].sort((a, b) => {
          const scoreA = (holeScores[a] || 0) + (holePutts[a] || 0);
          const scoreB = (holeScores[b] || 0) + (holePutts[b] || 0);
          return scoreB - scoreA;
        });
        const enableSpecialAudio = gameMode === 'win123' && Number(stake) > 0 && activePlayers.length >= 4;
        const joinerNextIdx = currentHole + 1;
        const joinerHasNext = joinerNextIdx < holes.length;
        playHoleResults(sortedPlayers, holeScores, holePutts, enableSpecialAudio, null, false,
          joinerHasNext ? () => { setTimeout(() => { if (playHoleIntroRef.current) playHoleIntroRef.current(holes[joinerNextIdx]); }, 10000); } : null
        );
      }
      
      if (currentHole < holes.length - 1) {
        setCurrentHole(currentHole + 1);
        setScores({});
        setUps({});
        setUpOrder([]);
        setPutts({});
        setWater({});
        setOb({});
        setCurrentHoleSettlement(null);
        mp.resetAllConfirmed();
      }
    }
  }, [mp.remoteGame?.completedHoles?.length, mp.multiplayerOn, mp.multiplayerRole, currentHole, holes, voiceEnabled, activePlayers, gameMode, stake, playHoleResults]);

  // Joiner/Viewer：从 allScores + completedHoles 本地重算 totalMoney（不依赖服务器推送）
  useEffect(() => {
    if (!mp.multiplayerOn || (mp.multiplayerRole !== 'joiner' && mp.multiplayerRole !== 'viewer') || !mp.remoteGame) return;
    // 同步 allScores 等原始数据
    if (mp.remoteGame.allScores) setAllScores(mp.remoteGame.allScores);
    if (mp.remoteGame.allUps) setAllUps(mp.remoteGame.allUps);
    if (mp.remoteGame.allPutts) setAllPutts(mp.remoteGame.allPutts);
    if (mp.remoteGame.allWater) setAllWater(mp.remoteGame.allWater);
    if (mp.remoteGame.allOb) setAllOb(mp.remoteGame.allOb);
    if (mp.remoteGame.completedHoles) setCompletedHoles(mp.remoteGame.completedHoles);
    if (mp.remoteGame.totalSpent) setTotalSpent(mp.remoteGame.totalSpent);
    // 直接同步 creator 推送的 totalMoney + moneyDetails
    if (mp.remoteGame.totalMoney) setTotalMoney(mp.remoteGame.totalMoney);
    if (mp.remoteGame.moneyDetails) setMoneyDetails(mp.remoteGame.moneyDetails);
    if (mp.remoteGame.prizePool !== undefined) setPrizePool(mp.remoteGame.prizePool);
  }, [mp.remoteGame?.lastUpdate, mp.remoteGame?.totalMoney, mp.multiplayerOn, mp.multiplayerRole]);

  // 多人模式：检测远程编辑 → 同步数据 + editLog 通知（Creator 和 Joiner 都需要）
  const lastEditLogIdRef = useRef(null);
  const lastRemoteEditKeyRef = useRef(null);
  useEffect(() => {
    if (!mp.multiplayerOn || !mp.remoteGame) return;

    // === 方法1: 通过 editLog 字段检测（如果服务器返回了 editLog）===
    if (mp.remoteGame.editLog) {
      const remoteLog = mp.remoteGame.editLog;
      if (remoteLog.editedBy !== mp.deviceId && remoteLog.id !== lastEditLogIdRef.current) {
        lastEditLogIdRef.current = remoteLog.id;
        // 合并 editLog + 弹通知
        setEditLog(prev => {
          if (prev.some(l => l.id === remoteLog.id)) return prev;
          return [remoteLog, ...prev];
        });
        setEditToastData(remoteLog);
        // ★ 同步远程编辑后的完整数据（分数+金额）
        if (mp.remoteGame.allScores) setAllScores(mp.remoteGame.allScores);
        if (mp.remoteGame.allUps) setAllUps(mp.remoteGame.allUps);
        if (mp.remoteGame.allPutts) setAllPutts(mp.remoteGame.allPutts);
        if (mp.remoteGame.totalMoney) setTotalMoney(mp.remoteGame.totalMoney);
        if (mp.remoteGame.moneyDetails) setMoneyDetails(mp.remoteGame.moneyDetails);
        if (mp.remoteGame.totalSpent) setTotalSpent(mp.remoteGame.totalSpent);
        if (mp.remoteGame.prizePool !== undefined) setPrizePool(mp.remoteGame.prizePool);
        return;
      }
    }

    // === 方法2: 通过 editedHole + lastUpdate 检测 (fallback) ===
    const editedHole = mp.remoteGame.editedHole;
    if (editedHole) {
      const editKey = `${editedHole}_${mp.remoteGame.lastUpdate || ''}_${JSON.stringify(mp.remoteGame.totalMoney || {})}`;
      if (editKey !== lastRemoteEditKeyRef.current) {
        lastRemoteEditKeyRef.current = editKey;
        if (mp.remoteGame.allScores) setAllScores(mp.remoteGame.allScores);
        if (mp.remoteGame.allUps) setAllUps(mp.remoteGame.allUps);
        if (mp.remoteGame.allPutts) setAllPutts(mp.remoteGame.allPutts);
        if (mp.remoteGame.totalMoney) setTotalMoney(mp.remoteGame.totalMoney);
        if (mp.remoteGame.moneyDetails) setMoneyDetails(mp.remoteGame.moneyDetails);
        if (mp.remoteGame.totalSpent) setTotalSpent(mp.remoteGame.totalSpent);
        if (mp.remoteGame.prizePool !== undefined) setPrizePool(mp.remoteGame.prizePool);
      }
    }
  }, [mp.remoteGame?.editLog?.id, mp.remoteGame?.editedHole, mp.remoteGame?.lastUpdate, mp.multiplayerOn]);

  // 多人模式：合并对方球员的成绩到本地 state
  useEffect(() => {
    if (!mp.multiplayerOn || !mp.remoteGame) return;
    const status = mp.remoteGame.status;
    if (status !== 'playing' && status !== 'finished') return;
    
    // Sync accumulated data from creator (allScores etc, NOT totalMoney - handled by dedicated effect)
    if (mp.multiplayerRole === 'joiner' || mp.multiplayerRole === 'viewer') {
      if (mp.remoteGame.allScores) setAllScores(mp.remoteGame.allScores);
      if (mp.remoteGame.allUps) setAllUps(mp.remoteGame.allUps);
      if (mp.remoteGame.allPutts) setAllPutts(mp.remoteGame.allPutts);
      if (mp.remoteGame.allWater) setAllWater(mp.remoteGame.allWater);
      if (mp.remoteGame.allOb) setAllOb(mp.remoteGame.allOb);
    }
    
    // 以下仅在 playing 时执行（洞级别合并）
    if (status !== 'playing') return;
    
    // Always read MY current hole's data (even if Creator already advanced)
    const holeNum = holes[currentHole];
    
    // 如果当前洞已完成（Creator 已推进），不要再合并旧数据，等 auto-advance effect 处理
    if (mp.remoteGame.completedHoles?.includes(holeNum)) return;
    
    const holeData = mp.remoteGame.holes?.[holeNum];
    if (!holeData) return;
    
    // Update confirmed from MY current hole (not latest hole)
    if (holeData.confirmed) {
      mp.setConfirmedFromHole(holeData.confirmed);
    }
    
    const otherPlayers = mp.getOtherPlayers(activePlayers);
    
    if (otherPlayers.length === 0) return;
    
    setScores(prev => {
      const next = { ...prev };
      otherPlayers.forEach(p => {
        if (holeData.scores?.[p] !== undefined) next[p] = holeData.scores[p];
      });
      return next;
    });
    setPutts(prev => {
      const next = { ...prev };
      otherPlayers.forEach(p => {
        if (holeData.putts?.[p] !== undefined) next[p] = holeData.putts[p];
      });
      return next;
    });
    setUps(prev => {
      const next = { ...prev };
      otherPlayers.forEach(p => {
        if (holeData.ups?.[p] !== undefined) next[p] = holeData.ups[p];
      });
      return next;
    });
    setWater(prev => {
      const next = { ...prev };
      otherPlayers.forEach(p => {
        if (holeData.water?.[p] !== undefined) next[p] = holeData.water[p];
      });
      return next;
    });
    setOb(prev => {
      const next = { ...prev };
      otherPlayers.forEach(p => {
        if (holeData.ob?.[p] !== undefined) next[p] = holeData.ob[p];
      });
      return next;
    });
    // 百家乐 upOrder 合并：保留我方 UP 选择 + 合并对方 UP 选择
    if (gameMode === 'baccarat' && holeData.upOrder) {
      setUpOrder(prev => {
        const myPlayers = new Set(mp.getMyPlayers(activePlayers));
        const myUps = prev.filter(p => myPlayers.has(p));
        const otherUps = holeData.upOrder.filter(p => !myPlayers.has(p));
        const merged = [...myUps, ...otherUps];
        if (merged.length === prev.length && merged.every((v, i) => v === prev[i])) return prev;
        return merged;
      });
    }
  }, [mp.remoteGame?.lastUpdate, mp.multiplayerOn, mp.multiplayerRole, mp.claimed, activePlayers, currentHole, holes, gameMode]);

  // 检测 URL 参数 ?join=XXXXXX（QR码扫描）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && joinCode.length === 6) {
      mp.setJoinerCode(joinCode.toUpperCase());
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // QR Scanner
  const stopQrScanner = useCallback(() => {
    if (qrStreamRef.current) {
      qrStreamRef.current.getTracks().forEach(t => t.stop());
      qrStreamRef.current = null;
    }
    setShowQrScanner(false);
  }, []);

  const startQrScanner = useCallback(async () => {
    setShowQrScanner(true);
    // Load jsQR library if not loaded
    if (!window.jsQR) {
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      } catch(e) {
        showToast(t('mpQrLoadFail'), 'error');
        setShowQrScanner(false);
        return;
      }
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      qrStreamRef.current = stream;
      const tryAttach = () => {
        if (qrVideoRef.current) {
          qrVideoRef.current.srcObject = stream;
          qrVideoRef.current.play();
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const scan = () => {
            if (!qrVideoRef.current || !qrStreamRef.current) return;
            const v = qrVideoRef.current;
            if (v.readyState >= 2) {
              canvas.width = v.videoWidth;
              canvas.height = v.videoHeight;
              ctx.drawImage(v, 0, 0);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const qr = window.jsQR(imageData.data, canvas.width, canvas.height);
              if (qr && qr.data) {
                const val = qr.data;
                const match = val.match(/[?&]join=([A-Z0-9]{6})/i);
                const code = match ? match[1] : (/^[A-Z0-9]{6}$/i.test(val.trim()) ? val.trim() : null);
                if (code) {
                  mp.setJoinerCode(code.toUpperCase());
                  stopQrScanner();
                  showToast('QR scanned!', 'success');
                  return;
                }
              }
            }
            if (qrStreamRef.current) requestAnimationFrame(scan);
          };
          scan();
        } else {
          setTimeout(tryAttach, 100);
        }
      };
      tryAttach();
    } catch(e) {
      showToast(t('cameraAccessDenied'), 'error');
      setShowQrScanner(false);
    }
  }, [mp, stopQrScanner, showToast, lang]);
  // 从localStorage加载游戏状态
  useEffect(() => {
    const savedGame = localStorage.getItem('golfGameState');
    if (savedGame) {
      setHasSavedGame(true);
    }
  }, []);
  useEffect(() => {
    if (currentSection === 'course') {
      setSearchQuery('');
      setSelectedCourse(null);
      setCourseApplied(false);
    }
  }, [currentSection]);
  // 清除已保存的游戏
  const clearSavedGame = useCallback(() => {
    localStorage.removeItem('golfGameState');
    setHasSavedGame(false);
  }, []);

  // 恢复游戏状态
  const resumeGame = useCallback(() => {
    const savedGame = localStorage.getItem('golfGameState');
    if (savedGame) {
      try {
        const gameState = JSON.parse(savedGame);
        setLang(gameState.lang || 'zh');
        setCourseType(gameState.courseType || 'f18');
        setHoles(gameState.holes || courses.f18);
        setPars(gameState.pars || {});
        setGameMode(gameState.gameMode || 'matchPlay');
        setPlayerNames(gameState.playerNames || ['', '', '', '']);
        setStake(gameState.stake || '');
        setPrizePool(gameState.prizePool ?? 0);
        setPlayerHandicaps(gameState.playerHandicaps || {});
        setAdvanceMode(gameState.advanceMode || 'off');
        setCurrentHole(gameState.currentHole || 0);
        setScores(gameState.scores || {});
        setUps(gameState.ups || {});
        setPutts(gameState.putts || {});
        setWater(gameState.water || {});
        setOb(gameState.ob || {});
        setAllScores(gameState.allScores || {});
        setAllUps(gameState.allUps || {});
        setAllPutts(gameState.allPutts || {});
        setAllWater(gameState.allWater || {});
        setAllOb(gameState.allOb || {});
        setTotalMoney(gameState.totalMoney || {});
        setMoneyDetails(gameState.moneyDetails || {});
        setCompletedHoles(gameState.completedHoles || []);
        setGameComplete(gameState.gameComplete || false);
        setCurrentHoleSettlement(gameState.currentHoleSettlement || null);
        setTotalSpent(gameState.totalSpent || {});
        setSelectedCourse(gameState.selectedCourse || null);
        setSetupMode(gameState.setupMode || 'auto');
        setJumboMode(gameState.jumboMode || false);
		setAdvancePlayers(gameState.advancePlayers || {});
        setEditLog(gameState.editLog || []);
        setCurrentSection(gameState.gameComplete ? 'scorecard' : 'game');
      } catch (error) {
        console.error('Failed to resume game:', error);
        showToast('恢复游戏失败', 'error');
      }
    }
  }, [showToast]);

  // 保存游戏状态到localStorage（debounce 500ms，避免连续 setState 重复序列化）
  useEffect(() => {
    if ((currentSection === 'game' || currentSection === 'scorecard') && activePlayers.length > 0) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const gameState = {
          lang,
          courseType,
          holes,
          pars,
          gameMode,
          playerNames,
          stake,
          prizePool,
          playerHandicaps,
          advanceMode,
          currentHole,
          scores,
          ups,
          putts,
          water,
          ob,
          allScores,
          allUps,
          allPutts,
          allWater,
          allOb,
          totalMoney,
          moneyDetails,
          completedHoles,
          gameComplete,
          currentHoleSettlement,
          totalSpent,
          selectedCourse,
          setupMode,
          jumboMode,
          advancePlayers,
          editLog
        };
        localStorage.setItem('golfGameState', JSON.stringify(gameState));
        setHasSavedGame(true);
      }, 500);
      return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
    }
  }, [currentSection, lang, courseType, holes, pars, gameMode, playerNames, stake, prizePool, 
      playerHandicaps, advanceMode, currentHole, scores, ups, putts, water, ob,
      allScores, allUps, allPutts, allWater, allOb, totalMoney, 
      moneyDetails, completedHoles, gameComplete, currentHoleSettlement, totalSpent, 
      selectedCourse, setupMode, jumboMode, activePlayers.length, editLog]);

  // ========== MP Auto-resume after page refresh ==========
  // When MP reconnects after a refresh and we're still at 'home', navigate automatically
  useEffect(() => {
    if (!mp.multiplayerOn || currentSection !== 'home') return;
    
    // Path A: Remote game received — navigate based on status
    if (mp.remoteGame) {
      const status = mp.remoteGame.status;
      
      if (status === 'finished') {
        const savedGame = localStorage.getItem('golfGameState');
        if (savedGame) {
          try {
            const parsed = JSON.parse(savedGame);
            if (parsed.gameComplete) {
              resumeGame();
              return;
            }
          } catch {}
          return;
        }
        if (mp.isViewer) {
          const rg = mp.remoteGame;
          if (rg.playerNames || rg.players) {
            const names = rg.playerNames || rg.players;
            const padded = [...names];
            while (padded.length < 4) padded.push('');
            setPlayerNames(padded);
          }
          if (rg.holesList) setHoles(rg.holesList);
          if (rg.pars) setPars(rg.pars);
          if (rg.gameMode) setGameMode(rg.gameMode);
          if (rg.stake !== undefined) setStake(rg.stake);
          if (rg.course) setSelectedCourse(rg.course);
          if (rg.handicaps) setPlayerHandicaps(rg.handicaps);
          if (rg.allScores) setAllScores(rg.allScores);
          if (rg.allPutts) setAllPutts(rg.allPutts);
          if (rg.allUps) setAllUps(rg.allUps);
          if (rg.allWater) setAllWater(rg.allWater);
          if (rg.allOb) setAllOb(rg.allOb);
          if (rg.completedHoles) setCompletedHoles(rg.completedHoles);
          if (rg.totalMoney) setTotalMoney(rg.totalMoney);
          if (rg.moneyDetails) setMoneyDetails(rg.moneyDetails);
          if (rg.totalSpent) setTotalSpent(rg.totalSpent);
          if (rg.prizePool !== undefined) setPrizePool(rg.prizePool);
          setGameComplete(true);
          setCurrentSection('scorecard');
        }
        return;
      }
      
      if (status === 'playing') {
        const savedGame = localStorage.getItem('golfGameState');
        if (savedGame) {
          resumeGame();
          return;
        }
        if (mp.isViewer) {
          const rg = mp.remoteGame;
          if (rg.playerNames || rg.players) {
            const names = rg.playerNames || rg.players;
            const padded = [...names];
            while (padded.length < 4) padded.push('');
            setPlayerNames(padded);
          }
          if (rg.holesList) setHoles(rg.holesList);
          if (rg.pars) setPars(rg.pars);
          if (rg.gameMode) setGameMode(rg.gameMode);
          if (rg.stake !== undefined) setStake(rg.stake);
          if (rg.course) setSelectedCourse(rg.course);
          if (rg.handicaps) setPlayerHandicaps(rg.handicaps);
          if (rg.allScores) setAllScores(rg.allScores);
          if (rg.allPutts) setAllPutts(rg.allPutts);
          if (rg.allUps) setAllUps(rg.allUps);
          if (rg.completedHoles) setCompletedHoles(rg.completedHoles);
          if (rg.totalMoney) setTotalMoney(rg.totalMoney);
          if (rg.moneyDetails) setMoneyDetails(rg.moneyDetails);
          setCurrentSection('game');
        }
        return;
      }
      
      if (status === 'waiting') {
        if (mp.multiplayerSection === 'lobby') setCurrentSection('mp-lobby');
        else if (mp.multiplayerSection === 'joinerClaim') setCurrentSection('mp-claim');
      }
      return;
    }
    
    // Path B: Room gone / connection error — use localStorage as fallback
    if (mp.syncStatus === 'roomGone' || mp.syncStatus === 'error') {
      const savedGame = localStorage.getItem('golfGameState');
      if (savedGame) {
        resumeGame();
        mp.stopPolling();
      }
    }
  }, [mp.multiplayerOn, mp.remoteGame?.status, mp.syncStatus, currentSection, mp.isViewer, mp.multiplayerSection, resumeGame, mp.stopPolling]);

  const showConfirm = useCallback((message, action, showScreenshotHint = false) => {
    setConfirmDialog({ isOpen: true, message, action, showScreenshotHint });
  }, []);

  useEffect(() => {
    if (currentSection === 'scorecard') {
      setConfirmDialog({ isOpen: false, message: '', action: null, showScreenshotHint: false });
    }
  }, [currentSection]);

  // ========== 修改后的精准搜索逻辑 ==========
const filteredCourses = useMemo(() => {
  if (!searchQuery.trim()) return [];
  
  const query = searchQuery.toLowerCase().trim();
  const allCourses = Object.values(GOLF_COURSES);
  
  // 调试输出（确认代码已更新后可删除）
  console.log("🔍 搜索词:", query);
  
  // ===== 第一步：shortName 完全匹配 =====
  const exactMatch = allCourses.filter(course => 
    course.shortName.toLowerCase() === query
  );
  
  if (exactMatch.length > 0) {
    console.log("✅ 完全匹配:", exactMatch.map(c => c.shortName));
    return exactMatch;
  }
  
  // ===== 第二步：shortName 以搜索词开头 =====
  const startsWithMatch = allCourses.filter(course => {
    const shortNameLower = course.shortName.toLowerCase();
    const shortNameNoHyphen = shortNameLower.replace(/-/g, '');
    const queryNoHyphen = query.replace(/-/g, '');
    return shortNameLower.startsWith(query) || shortNameNoHyphen.startsWith(queryNoHyphen);
  });
  
  if (startsWithMatch.length > 0) {
    console.log("✅ 开头匹配:", startsWithMatch.map(c => c.shortName));
    return startsWithMatch;
  }
  
  // ===== 第三步：shortName 包含搜索词 =====
  const containsMatch = allCourses.filter(course => 
    course.shortName.toLowerCase().includes(query)
  );
  
  if (containsMatch.length > 0) {
    console.log("✅ 包含匹配:", containsMatch.map(c => c.shortName));
    return containsMatch;
  }
  
  // ===== 第四步：fullName 或 location 匹配 =====
  const keywords = query.split(/\s+/).filter(k => k.length > 0);
  
  const keywordMatches = allCourses
    .map(course => {
      const fullNameLower = course.fullName.toLowerCase();
      const locationStr = course.location ? course.location.join(' ').toLowerCase() : '';
      
      // 所有关键词都必须在 fullName 或 location 中出现
      const allMatch = keywords.every(keyword =>
        fullNameLower.includes(keyword) || locationStr.includes(keyword)
      );
      
      if (!allMatch) return null;
      
      // 计算匹配分数
      let score = 0;
      keywords.forEach(keyword => {
        if (fullNameLower.includes(keyword)) score += 10;
        if (locationStr.includes(keyword)) score += 5;
      });
      
      return { course, score };
    })
    .filter(item => item !== null)
    .sort((a, b) => b.score - a.score)
    .map(item => item.course);
  
  console.log("✅ 关键词匹配:", keywordMatches.length, "个结果");
  return keywordMatches;
}, [searchQuery]);

  const getParColorClass = useCallback((par) => {
    if (par === 3) return 'bg-yellow-300 text-black';
    if (par === 5) return 'bg-orange-300 text-black';
    if (par === 6) return 'bg-red-400 text-black';
    return 'bg-gray-300 text-black';
  }, []);

const t = useTranslation(lang);

  const setCourse = useCallback((type) => {
    setCourseType(type);
    const newHoles = courses[type];
    setHoles(newHoles);
    
    if (selectedCourse) {
      const newPars = {};
      newHoles.forEach((hole) => {
        newPars[hole] = selectedCourse.pars[hole - 1] || 4;
      });
      setPars(newPars);
    } else {
      setPars(newHoles.reduce((acc, hole) => ({...acc, [hole]: 4}), {}));
    }
  }, [selectedCourse]);

  const setPar = useCallback((hole, par) => {
    setPars(prev => ({ ...prev, [hole]: par }));
  }, []);

const confirmCourse = useCallback(() => {
  setCurrentSection('players');
  setTimeout(() => {
    const scrollContainer = document.querySelector('.overflow-auto');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
    window.scrollTo({ top: 0 });
  }, 100);
}, [showToast, t]);

const selectAndApplyCourse = useCallback((course) => {
  setSelectedCourse(course);
  setCourseApplied(false);
  
  // 根据球场数据自动选择洞数
  const holeCount = course.pars.length;
  const autoType = holeCount <= 9 ? 'f9' : 'f18';
  
  setCourseType(autoType);
  const newHoles = courses[autoType];
  setHoles(newHoles);
  
  const newPars = {};
  newHoles.forEach((hole, index) => {
    newPars[hole] = course.pars[index] || 4;
  });
  setPars(newPars);
  setCourseApplied(true);
  
  // 保存到最近使用球场
  saveRecentCourse(course);
  
setSearchQuery('');
    
    // 移动端兼容的自动滚动
    setTimeout(() => {
      // 找到滚动容器并滚动
      const scrollContainer = document.querySelector('.overflow-auto') || 
                              document.querySelector('.overflow-y-auto') ||
                              document.documentElement;
      
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
      
      // 同时也尝试 window 滚动
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 200);
  }, [saveRecentCourse]);

  const getVerticalArrangedHoles = useCallback(() => {
    const arranged = [];
    
    if (courseType === 'f9' || courseType === 'b9') {
      for (let i = 0; i < holes.length; i++) {
        arranged.push([holes[i], null]);
      }
    } else if (courseType === 'f18') {
      for (let i = 0; i < 9; i++) {
        arranged.push([holes[i], holes[i + 9]]);
      }
    } else if (courseType === 'b18') {
      for (let i = 0; i < 9; i++) {
        arranged.push([holes[i], holes[i + 9]]);
      }
    }
    
    return arranged;
  }, [holes, courseType]);

  const calculateTotalPar = useCallback(() => {
    return holes.reduce((sum, hole) => sum + (pars[hole] || 4), 0);
  }, [holes, pars]);

  const updatePlayerName = useCallback((index, value) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = value;
      return newNames;
    });
  }, []);

  const toggleJumboMode = useCallback(() => {
    setJumboMode(prev => {
      const newMode = !prev;
      if (newMode) {
        setPlayerNames(['', '', '', '', '', '', '', '']);
      } else {
        setPlayerNames(['', '', '', '']);
      }
      return newMode;
    });
  }, []);

  const updatePlayerHandicap = useCallback((playerName, value) => {
    setPlayerHandicaps(prev => ({
      ...prev,
      [playerName]: Math.max(0, Math.min(36, value || 0))
    }));
  }, []);

// ========== 计算 Stroke = On + Putts ==========
  const getStroke = useCallback((player) => {
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const on = scores[player] ?? par;
    const playerPutts = putts[player] ?? 0;
    return on + playerPutts;
  }, [holes, currentHole, pars, scores, putts]);
  
const getScoreLabel = useCallback((stroke, par) => {
    const diff = stroke - par;
    
    if (diff <= -2) {
      return { text: t('eagle'), class: 'bg-purple-500 text-white', numClass: 'bg-purple-500 text-white' };
    } else if (diff === -1) {
      return { text: t('birdie'), class: 'bg-blue-500 text-white', numClass: 'bg-blue-500 text-white' };
    } else if (diff === 0) {
      return { text: t('parLabel'), class: 'bg-gray-200 text-gray-600', numClass: 'bg-gray-100 text-gray-800' };
    } else if (diff === 1) {
      return { text: t('bogey'), class: 'bg-orange-500 text-white', numClass: 'bg-orange-500 text-white' };
    } else {
      return { text: t('doubleplus'), class: 'bg-red-500 text-white', numClass: 'bg-red-500 text-white' };
    }
  }, [t]);

  const startGame = useCallback(() => {
    if (activePlayers.length < 2) {
      showToast(t('atLeast2'), 'error');
      return;
    }

    const uniqueNames = new Set(activePlayers);
    if (uniqueNames.size !== activePlayers.length) {
      showToast(t('duplicateNames'), 'error');
      return;
    }

    const stakeValue = Number(stake) || 0;
    
    if (gameMode === 'matchPlay') {
    } else if (gameMode === 'skins') {
      if (stakeValue <= 0) {
        showToast(t('noStake'), 'error');
        if (stakeInputRef.current) { stakeInputRef.current.focus(); stakeInputRef.current.classList.add('ring-2', 'ring-red-500'); setTimeout(() => { stakeInputRef.current?.classList.remove('ring-2', 'ring-red-500'); }, 2000); }
        return;
      }
      setPrizePool(0);
    } else if (gameMode === 'win123') {
      if (stakeValue <= 0) {
        showToast(t('noStake'), 'error');
        if (stakeInputRef.current) { stakeInputRef.current.focus(); stakeInputRef.current.classList.add('ring-2', 'ring-red-500'); setTimeout(() => { stakeInputRef.current?.classList.remove('ring-2', 'ring-red-500'); }, 2000); }
        return;
      }
      setPrizePool(0);
    } else if (gameMode === 'baccarat') {
      if (stakeValue <= 0) {
        showToast(t('noStake'), 'error');
        if (stakeInputRef.current) { stakeInputRef.current.focus(); stakeInputRef.current.classList.add('ring-2', 'ring-red-500'); setTimeout(() => { stakeInputRef.current?.classList.remove('ring-2', 'ring-red-500'); }, 2000); }
        return;
      }
      setPrizePool(0);
    }

    const initMoney = {};
    const initDetails = {};
    const initAllScores = {};
    const initSpent = {};
    const initAllPutts = {};
    const initAllWater = {};
    const initAllOb = {};
    
    activePlayers.forEach(player => {
      initMoney[player] = 0;
      initDetails[player] = { fromPool: 0, fromPlayers: {} };
      initAllScores[player] = {};
      initSpent[player] = 0;
      initAllPutts[player] = {};
      initAllWater[player] = {};
      initAllOb[player] = {};
      activePlayers.forEach(other => {
        if (other !== player) {
          initDetails[player].fromPlayers[other] = 0;
        }
      });
    });
    
    setTotalMoney(initMoney);
    setMoneyDetails(initDetails);
    setAllScores(initAllScores);
    setAllUps({});
    setAllPutts(initAllPutts);
    setAllWater(initAllWater);
    setAllOb(initAllOb);
    setTotalSpent(initSpent);
    setCurrentHole(0);  
    setScores({});
    setUps({});
    setPutts({});
    setWater({});
    setOb({});
    setCompletedHoles([]);
    setGameComplete(false);
    setCurrentHoleSettlement(null);
    
    // ===== 多人模式：创建房间 =====
    if (mp.multiplayerOn) {
      const gameSetup = {
        course: selectedCourse || {},
        gameMode,
        stake: Number(stake) || 0,
        jumboMode,
        players: activePlayers,
        playerNames: [...playerNames],
        pars: { ...pars },
        handicaps: playerHandicaps,
        advanceMode,
        advancePlayers,
        holesList: [...holes],
      };
      mp.createGame(gameSetup).then(result => {
        if (!result.ok) {
          showToast('Failed to create game room', 'error');
        } else {
          setCurrentSection('mp-lobby');
        }
      });
      return; // Don't go to game section yet — go to lobby
    }
    
    setCurrentSection('game');
    // 开局播报第一洞信息（延迟1秒等UI渲染）
    setTimeout(() => { if (playHoleIntroRef.current) playHoleIntroRef.current(holes[0]); }, 1000);
  }, [activePlayers, stake, gameMode, showToast, t, mp, selectedCourse, jumboMode, playerHandicaps, advanceMode, advancePlayers, lang, holes]);

  // 基于 Index 的让杆计算
  // holeNum: 实际洞号 (1-18)
  // playerHandicap: 玩家差点数 (0-36)
  // holeIndex: 该洞的难度排名 (1-18, 1=最难)
  // 让杆规则: 差点 >= index 时放1杆, 差点 >= index+18 时放2杆
  const getHandicapForHole = useCallback((player, holeNum, par = 4) => {
    
    const playerHcp = playerHandicaps[player];
    if (!playerHcp || playerHcp <= 0) return 0;
    
    // 获取该洞的 index
    let holeIndex = null;
    if (selectedCourse && selectedCourse.index && Array.isArray(selectedCourse.index)) {
      holeIndex = selectedCourse.index[holeNum - 1];
    }
    
    // 如果没有 index 数据，fallback: 按洞号顺序分配
    if (!holeIndex) {
      // Fallback: 前 playerHcp 个洞各放1杆
      const totalHoles = holes.length;
      if (playerHcp >= holeNum) return 1;
      if (playerHcp >= holeNum + totalHoles) return 2;
      return 0;
    }
    
    // 基于 index 计算让杆
    let strokes = 0;
    if (playerHcp >= holeIndex) strokes += 1;        // 第一轮让杆
    if (playerHcp >= holeIndex + 18) strokes += 1;  // 第二轮让杆 (差点 > 18)
    
    return strokes;
  }, [playerHandicaps, selectedCourse, holes.length]);

  // ========== 新洞播报：洞号、标准杆、Index、让杆玩家 ==========
  const playHoleIntro = useCallback((holeNum) => {
    if (!voiceEnabled) return;
    if (!('speechSynthesis' in window)) return;
    
    speechSynthesis.cancel();
    
    const par = pars[holeNum] || 4;
    let holeIndex = null;
    if (selectedCourse && selectedCourse.index && Array.isArray(selectedCourse.index)) {
      holeIndex = selectedCourse.index[holeNum - 1];
    }
    
    // 构建洞信息播报文字
    let introText;
    if (holeIndex) {
      introText = t('voiceHoleIntro')
        .replace('{hole}', holeNum)
        .replace('{par}', par)
        .replace('{index}', holeIndex);
    } else {
      introText = t('voiceHoleIntroNoIdx')
        .replace('{hole}', holeNum)
        .replace('{par}', par);
    }
    
    const introMsg = new SpeechSynthesisUtterance(introText);
    introMsg.lang = t('ttsLang');
    
    const voices = speechSynthesis.getVoices();
    const female = voices.find(v => 
      v.name.includes('Samantha') ||
      v.name.includes('Zira') ||
      v.name.includes('Female') ||
      v.name.includes('Google') && v.lang === 'en-US' ||
      v.name.includes('Xiaoxiao') ||
      v.name.includes('Huihui') ||
      v.name.includes('女') ||
      v.name.toLowerCase().includes('female')
    );
    if (female) introMsg.voice = female;
    
    // 超时防护
    let introTimer = setTimeout(() => { speechSynthesis.cancel(); }, TTS_TIMEOUT);
    
    introMsg.onend = () => {
      clearTimeout(introTimer);
      const playersWithHcp = activePlayers.filter(p => getHandicapForHole(p, holeNum, par) > 0);
      if (playersWithHcp.length === 0) return;
      
      setTimeout(() => {
        const hcpParts = playersWithHcp.map(p => {
          const strokes = getHandicapForHole(p, holeNum, par);
          return t('voiceHcpOnHole').replace('{player}', p).replace('{strokes}', strokes);
        });
        const hcpText = hcpParts.join('. ');
        
        const hcpMsg = new SpeechSynthesisUtterance(hcpText);
        hcpMsg.lang = t('ttsLang');
        if (female) hcpMsg.voice = female;
        hcpMsg.onerror = () => {};
        let hcpTimer = setTimeout(() => { speechSynthesis.cancel(); }, TTS_TIMEOUT);
        hcpMsg.onend = () => { clearTimeout(hcpTimer); };
        speechSynthesis.speak(hcpMsg);
      }, 500);
    };
    
    introMsg.onerror = () => { clearTimeout(introTimer); };
    setTimeout(() => { speechSynthesis.speak(introMsg); }, 100);
  }, [voiceEnabled, pars, selectedCourse, activePlayers, getHandicapForHole, t]);
  playHoleIntroRef.current = playHoleIntro;

  const calculateMatchPlay = useCallback((holeScores, holeNum) => {
    const par = pars[holeNum] || 4;
    return gameModes.matchPlay.calculate({
      holeScores,
      holeNum,
      par,
      stake,
      activePlayers,
      getHandicapForHole
    }).results;
  }, [activePlayers, stake, pars, getHandicapForHole]);

  const calculateSkins = useCallback((holeScores, holeNum) => {
    const par = pars[holeNum] || 4;
    return gameModes.skins.calculate({
      holeScores,
      holeNum,
      par,
      stake,
      prizePool,
      activePlayers,
      getHandicapForHole
    });
  }, [activePlayers, stake, pars, getHandicapForHole, prizePool]);

  const calculateWin123 = useCallback((holeScores, holePutts, holeUps, holeNum) => {
    const par = pars[holeNum] || 4;
    return gameModes.win123.calculate({
      holeScores,
      holePutts,
      holeUps,
      holeNum,
      par,
      stake,
      activePlayers,
      getHandicapForHole
    });
  }, [activePlayers, stake, pars, getHandicapForHole]);

  const calculateBaccarat = useCallback((holeScores, holePutts, holeUpOrder, holeNum) => {
    const par = pars[holeNum] || 4;
    return gameModes.baccarat.calculate({
      holeScores,
      holePutts,
      upOrder: holeUpOrder,
      holeNum,
      par,
      stake,
      activePlayers,
      getHandicapForHole
    });
  }, [activePlayers, stake, pars, getHandicapForHole]);

  // 多人同步：远程分数合并后重算 hole settlement
  useEffect(() => {
    if (!mp.multiplayerOn || !mp.remoteGame || mp.remoteGame.status !== 'playing') return;
    const holeNum = holes[currentHole];
    // 已完成的洞不再重算（等 auto-advance）
    if (mp.remoteGame.completedHoles?.includes(holeNum)) return;
    const holeData = mp.remoteGame.holes?.[holeNum];
    if (!holeData) return;
    
    const par = pars[holeNum] || 4;
    const mergedScores = {};
    const mergedPutts = {};
    const mergedUps = {};
    activePlayers.forEach(p => {
      mergedScores[p] = holeData.scores?.[p] !== undefined ? holeData.scores[p] : (scores[p] || par);
      mergedPutts[p] = holeData.putts?.[p] !== undefined ? holeData.putts[p] : (putts[p] || 0);
      mergedUps[p] = holeData.ups?.[p] !== undefined ? holeData.ups[p] : (ups[p] || false);
    });
    
    if (gameMode === 'matchPlay') {
      setCurrentHoleSettlement(calculateMatchPlay(mergedScores, holeNum));
    } else if (gameMode === 'skins') {
      const { results } = calculateSkins(mergedScores, holeNum);
      setCurrentHoleSettlement(results);
    } else if (gameMode === 'win123') {
      const { results } = calculateWin123(mergedScores, mergedPutts, mergedUps, holeNum);
      setCurrentHoleSettlement(results);
    } else if (gameMode === 'baccarat') {
      const myPlayers = new Set(mp.getMyPlayers(activePlayers));
      const myUps = upOrder.filter(p => myPlayers.has(p));
      const otherUps = (holeData.upOrder || []).filter(p => !myPlayers.has(p));
      const mergedUpOrder = [...myUps, ...otherUps];
      const { results, matchupDetails } = calculateBaccarat(mergedScores, mergedPutts, mergedUpOrder, holeNum);
      setCurrentHoleSettlement({ ...results, matchupDetails });
    }
  }, [mp.remoteGame?.lastUpdate, mp.multiplayerOn, activePlayers, currentHole, scores, putts, ups, upOrder, pars, holes, gameMode, calculateMatchPlay, calculateSkins, calculateWin123, calculateBaccarat]);

// ========== 修改 On (上果岭杆数) ==========
  const changeOn = useCallback((player, delta) => {
  const holeNum = holes[currentHole];
  const par = pars[holeNum] || 4;
  const current = scores[player] ?? par;
  const newOn = Math.max(1, current + delta);
  setScores(prev => ({ ...prev, [player]: newOn }));

  // 实时更新 Hole Settlement
  const newScores = { ...scores, [player]: newOn };
  const holeScores = {};
  const holePutts = {};
  const holeUps = {};
  activePlayers.forEach(p => {
    holeScores[p] = newScores[p] || par;
    holePutts[p] = putts[p] || 0;
    holeUps[p] = ups[p] || false;
  });

  if (gameMode === 'matchPlay') {
    const settlement = calculateMatchPlay(holeScores, holeNum);
    setCurrentHoleSettlement(settlement);
  } else if (gameMode === 'skins') {
    const { results } = calculateSkins(holeScores, holeNum);
    setCurrentHoleSettlement(results);
  } else if (gameMode === 'win123') {
    const { results } = calculateWin123(holeScores, holePutts, holeUps, holeNum);
    setCurrentHoleSettlement(results);
  } else if (gameMode === 'baccarat') {
    const { results, matchupDetails } = calculateBaccarat(holeScores, holePutts, upOrder, holeNum);
    setCurrentHoleSettlement({ ...results, matchupDetails });
  }
}, [currentHole, holes, pars, scores, putts, ups, upOrder, activePlayers, gameMode, calculateMatchPlay, calculateSkins, calculateWin123, calculateBaccarat]);

  const changeScore = useCallback((player, delta) => {
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const current = scores[player] || par;
    const newScore = Math.max(1, current + delta);
    setScores(prev => ({ ...prev, [player]: newScore }));
    
    const newScores = { ...scores, [player]: newScore };
    const holeScores = {};
    const holeUps = {};
	const holePutts = {};
    
    activePlayers.forEach(p => {
      holeScores[p] = newScores[p] || par;
      holeUps[p] = ups[p] || false;
	  holePutts[p] = putts[p] || 0;
    });
    
    if (gameMode === 'matchPlay') {
      const settlement = calculateMatchPlay(holeScores, holeNum);
      setCurrentHoleSettlement(settlement);
    } else if (gameMode === 'skins') {
      const { results } = calculateSkins(holeScores, holeNum);
      setCurrentHoleSettlement(results);
    } else if (gameMode === 'win123') {
      const { results } = calculateWin123(holeScores, holePutts, holeUps, holeNum);
      setCurrentHoleSettlement(results);
    } else if (gameMode === 'baccarat') {
      const { results, matchupDetails } = calculateBaccarat(holeScores, holePutts, upOrder, holeNum);
      setCurrentHoleSettlement({ ...results, matchupDetails });
    }
  }, [scores, currentHole, holes, pars, ups, upOrder, putts, activePlayers, gameMode, calculateMatchPlay, calculateSkins, calculateWin123, calculateBaccarat]);

  const changePutts = useCallback((player, delta) => {
  const holeNum = holes[currentHole];
  const par = pars[holeNum] || 4;
  const newPutts = Math.max(0, (putts[player] || 0) + delta);
  setPutts(prev => ({ ...prev, [player]: newPutts }));

  // 实时更新 Hole Settlement
  const newPuttsAll = { ...putts, [player]: newPutts };
  const holeScores = {};
  const holePutts = {};
  const holeUps = {};
  activePlayers.forEach(p => {
    holeScores[p] = scores[p] || par;
    holePutts[p] = newPuttsAll[p] || 0;
    holeUps[p] = ups[p] || false;
  });

  if (gameMode === 'matchPlay') {
    const settlement = calculateMatchPlay(holeScores, holeNum);
    setCurrentHoleSettlement(settlement);
  } else if (gameMode === 'skins') {
    const { results } = calculateSkins(holeScores, holeNum);
    setCurrentHoleSettlement(results);
  } else if (gameMode === 'win123') {
    const { results } = calculateWin123(holeScores, holePutts, holeUps, holeNum);
    setCurrentHoleSettlement(results);
  } else if (gameMode === 'baccarat') {
    const { results, matchupDetails } = calculateBaccarat(holeScores, holePutts, upOrder, holeNum);
    setCurrentHoleSettlement({ ...results, matchupDetails });
  }
}, [currentHole, holes, pars, scores, putts, ups, upOrder, activePlayers, gameMode, calculateMatchPlay, calculateSkins, calculateWin123, calculateBaccarat]);

  const changeWater = useCallback((player) => {
    setWater(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 }));
  }, []);

  const resetWater = useCallback((player) => {
    setWater(prev => ({ ...prev, [player]: 0 }));
  }, []);

  const changeOb = useCallback((player) => {
    setOb(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 }));
  }, []);

  const resetOb = useCallback((player) => {
    setOb(prev => ({ ...prev, [player]: 0 }));
  }, []);

  const toggleUp = useCallback((player) => {
    setUps(prev => ({ ...prev, [player]: !prev[player] }));
    
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const holeScores = {};
	const holePutts = {};
    const newUps = { ...ups, [player]: !ups[player] };
    
    activePlayers.forEach(p => {
      holeScores[p] = scores[p] || par;
	  holePutts[p] = putts[p] || 0;
    });
    
    if (gameMode === 'win123') {
      const { results } = calculateWin123(holeScores, holePutts, newUps, holeNum);
      setCurrentHoleSettlement(results);
    }
  }, [ups, currentHole, holes, pars, scores, activePlayers, gameMode, calculateWin123]);

  // 百家乐专用：切换UP（记录顺序）
  const toggleBaccaratUp = useCallback((player) => {
    const newUpOrder = [...upOrder];
    const idx = newUpOrder.indexOf(player);
    if (idx !== -1) {
      newUpOrder.splice(idx, 1);
    } else {
      newUpOrder.push(player);
    }
    setUpOrder(newUpOrder);
    
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const holeScores = {};
    const holePutts = {};
    activePlayers.forEach(p => {
      holeScores[p] = scores[p] || par;
      holePutts[p] = putts[p] || 0;
    });
    
    const { results, matchupDetails } = calculateBaccarat(holeScores, holePutts, newUpOrder, holeNum);
    setCurrentHoleSettlement({ ...results, matchupDetails });
  }, [upOrder, currentHole, holes, pars, scores, putts, activePlayers, calculateBaccarat]);

  const proceedToNextHole = useCallback(() => {
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const currentHoleScores = {};
    const currentHoleUps = {};
    const currentHolePutts = {};
    const currentHoleWater = {};
    const currentHoleOb = {};
    let win123Rankings = null; // 用于保存Win123排名结果
    let win123IsTied = false;  // 用于保存是否平局
    
    activePlayers.forEach(player => {
      currentHoleScores[player] = scores[player] || par;
      currentHoleUps[player] = ups[player] || false;
      currentHolePutts[player] = putts[player] || 0;
      currentHoleWater[player] = water[player] || 0;
      currentHoleOb[player] = ob[player] || 0;
    });
    
    const newAllScores = { ...allScores };
    const newAllUps = { ...allUps };
    const newAllPutts = { ...allPutts };
    const newAllWater = { ...allWater };
    const newAllOb = { ...allOb };
    
    activePlayers.forEach(player => {
      if (!newAllScores[player]) newAllScores[player] = {};
      if (!newAllUps[player]) newAllUps[player] = {};
      if (!newAllPutts[player]) newAllPutts[player] = {};
      if (!newAllWater[player]) newAllWater[player] = {};
      if (!newAllOb[player]) newAllOb[player] = {};
      newAllScores[player][holeNum] = currentHoleScores[player];
      newAllUps[player][holeNum] = currentHoleUps[player];
      newAllPutts[player][holeNum] = currentHolePutts[player];
      newAllWater[player][holeNum] = currentHoleWater[player];
      newAllOb[player][holeNum] = currentHoleOb[player];
    });
    
    setAllScores(newAllScores);
    setAllUps(newAllUps);
    setAllPutts(newAllPutts);
    setAllWater(newAllWater);
    setAllOb(newAllOb);
    
    const stakeValue = Number(stake) || 0;
    let finalPrizePool = prizePool;
    // 提升到函数作用域，确保 syncNextHole 能拿到结算后的最新值
    let newTotalMoney = { ...totalMoney };
    let newMoneyDetails = { ...moneyDetails };
    let newTotalSpent = { ...totalSpent };
    
    if (stakeValue > 0 || gameMode === 'skins') {
      if (gameMode === 'matchPlay') {
        const settlement = calculateMatchPlay(currentHoleScores, holeNum);
        
        activePlayers.forEach(player => {
          newTotalMoney[player] = (newTotalMoney[player] || 0) + settlement[player].money;
        });
        setTotalMoney(newTotalMoney);
        
      } else if (gameMode === 'skins') {
        const { results, poolChange } = calculateSkins(currentHoleScores, holeNum);
        
        activePlayers.forEach(player => {
          newTotalSpent[player] = (newTotalSpent[player] || 0) + (results[player].spent || 0);
          newTotalMoney[player] = (newTotalMoney[player] || 0) + results[player].money;
          
          if (results[player].fromPool) {
            newMoneyDetails[player].fromPool += results[player].fromPool;
          }
        });
        
        setTotalMoney(newTotalMoney);
        setMoneyDetails(newMoneyDetails);
        setTotalSpent(newTotalSpent);
        finalPrizePool = prizePool + poolChange;
        setPrizePool(finalPrizePool);
        
      } else if (gameMode === 'win123') {
        const { results, poolChange, rankings, isTied } = calculateWin123(currentHoleScores, currentHolePutts, currentHoleUps, holeNum);
        
        // 保存rankings和isTied供播报使用
        win123Rankings = rankings;
        win123IsTied = isTied;
        
        activePlayers.forEach(player => {
          newTotalMoney[player] = (newTotalMoney[player] || 0) + results[player].money;
          if (results[player].fromPool) {
            newMoneyDetails[player].fromPool = (newMoneyDetails[player].fromPool || 0) + results[player].fromPool;
          }
        });
        
        setTotalMoney(newTotalMoney);
        setMoneyDetails(newMoneyDetails);
        finalPrizePool = prizePool + poolChange;
        setPrizePool(finalPrizePool);
      } else if (gameMode === 'baccarat') {
        const { results } = calculateBaccarat(currentHoleScores, currentHolePutts, upOrder, holeNum);
        
        activePlayers.forEach(player => {
          newTotalMoney[player] = (newTotalMoney[player] || 0) + results[player].money;
        });
        setTotalMoney(newTotalMoney);
        
        // 保存百家乐UP顺序
        setAllUpOrders(prev => ({ ...prev, [holeNum]: [...upOrder] }));
      }
    }
     // 播报本洞成绩（按本洞总杆数从高到低，最差先报）
    const sortedPlayersForVoice = [...activePlayers].sort((a, b) => {
      const scoreA = (currentHoleScores[a] || 0) + (currentHolePutts[a] || 0);
      const scoreB = (currentHoleScores[b] || 0) + (currentHolePutts[b] || 0);
      return scoreB - scoreA; // 降序：杆数高的先报
    });
    // 只有 Win123 + 有下注 + 4人或以上 时启用特殊音效
    const enableSpecialAudio = gameMode === 'win123' && Number(stake) > 0 && activePlayers.length >= 4;
    // 播报完成绩后，如果还有下一洞，等10秒再播报下一洞信息
    const nextHoleIdx = currentHole + 1;
    const hasNextHole = nextHoleIdx < holes.length;
    playHoleResults(sortedPlayersForVoice, currentHoleScores, currentHolePutts, enableSpecialAudio, win123Rankings, win123IsTied, 
      hasNextHole ? () => { setTimeout(() => { if (playHoleIntroRef.current) playHoleIntroRef.current(holes[nextHoleIdx]); }, 10000); } : null
    );
    setCompletedHoles([...completedHoles, holeNum]);
    
    const newCompletedHoles = [...completedHoles, holeNum];
    
    if (currentHole >= holes.length - 1) {
      setGameComplete(true);
	showToast(t('gameOver'));
	setCurrentSection('scorecard');
	triggerConfetti();
	// 多人同步：通知结束
	if (mp.multiplayerOn && mp.multiplayerRole === 'creator') {
	  mp.syncNextHole(holes.length, holes.length, { totalMoney: newTotalMoney, moneyDetails: newMoneyDetails, allScores: newAllScores, allUps: newAllUps, allPutts: newAllPutts, allWater: newAllWater, allOb: newAllOb, totalSpent: newTotalSpent, completedHoles: newCompletedHoles, prizePool: finalPrizePool, finished: true });
	}
    } else {
      setCurrentHole(currentHole + 1);
      setScores({});
      setUps({});
      setUpOrder([]);  // 重置百家乐UP顺序
      setPutts({});
      setWater({});
      setOb({});
      setCurrentHoleSettlement(null);
      // 多人同步：通知下一洞
      if (mp.multiplayerOn && mp.multiplayerRole === 'creator') {
        mp.syncNextHole(currentHole + 1, holes[currentHole + 1], { totalMoney: newTotalMoney, moneyDetails: newMoneyDetails, allScores: newAllScores, allUps: newAllUps, allPutts: newAllPutts, allWater: newAllWater, allOb: newAllOb, totalSpent: newTotalSpent, completedHoles: newCompletedHoles, prizePool: finalPrizePool });
      }
    }
    
    setHoleConfirmDialog({ isOpen: false, action: null });
    setPendingRankings(null);
  }, [currentHole, holes, scores, ups, upOrder, putts, water, ob, activePlayers, allScores, allUps, allPutts, allWater, allOb, gameMode, totalMoney, moneyDetails, completedHoles, prizePool, pars, stake, calculateMatchPlay, calculateSkins, calculateWin123, calculateBaccarat, showToast, t, totalSpent, playHoleResults, mp]);

const nextHole = useCallback(() => {
  const holeNum = holes[currentHole];
  const par = pars[holeNum] || 4;

  // 检查 Advance 玩家推杆数
const playersWithZeroPutts = activePlayers.filter(player => 
  (putts[player] || 0) === 0 && 
  (scores[player] || par) > 1
);

  if (playersWithZeroPutts.length > 0) {
  // 播放提示音（iOS/Android 都支持）
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (e) {}
  // Android 额外震动
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
  setPuttsWarningDialog({ isOpen: true, players: playersWithZeroPutts });
  return;
}

  // 原有逻辑继续
  if (gameMode === 'win123') {
    const currentHoleScores = {};
	const currentHolePutts = {};
	const currentHoleUps = {};

activePlayers.forEach(player => {
  currentHoleScores[player] = scores[player] || par;
  currentHolePutts[player] = putts[player] || 0;
  currentHoleUps[player] = ups[player] || false;
});
    
    const { rankings } = calculateWin123(currentHoleScores, currentHolePutts, currentHoleUps, holeNum);
    setPendingRankings(rankings);
  }
  setHoleConfirmDialog({ 
    isOpen: true, 
    action: proceedToNextHole
  });
}, [gameMode, currentHole, holes, scores, ups, putts, activePlayers, pars, calculateWin123, proceedToNextHole, advanceMode, advancePlayers]);

const handlePuttsWarningConfirm = useCallback(() => {
  setPuttsWarningDialog({ isOpen: false, players: [] });
  
  const holeNum = holes[currentHole];
  const par = pars[holeNum] || 4;

  if (gameMode === 'win123') {
    const currentHoleScores = {};
	const currentHolePutts = {};
	const currentHoleUps = {};

activePlayers.forEach(player => {
  currentHoleScores[player] = scores[player] || par;
  currentHolePutts[player] = putts[player] || 0;
  currentHoleUps[player] = ups[player] || false;
});
    
    const { rankings } = calculateWin123(currentHoleScores, currentHolePutts, currentHoleUps, holeNum);
    setPendingRankings(rankings);
  }
  setHoleConfirmDialog({ 
    isOpen: true, 
    action: proceedToNextHole
  });
}, [gameMode, currentHole, holes, scores, ups, activePlayers, pars, calculateWin123, proceedToNextHole]);

  // 编辑洞成绩并重新计算金额
const handleEditHoleSave = useCallback((hole, newScores, newUps, newPutts, newUpOrder = []) => {
    // ===== Edit Log: 对比新旧值，记录差异 =====
    const changes = [];
    activePlayers.forEach(player => {
      const oldScore = allScores[player]?.[hole];
      const newScore = newScores[player];
      if (oldScore !== undefined && newScore !== undefined && oldScore !== newScore) {
        changes.push({ player, field: 'score', from: oldScore, to: newScore });
      }
      const oldPutt = allPutts[player]?.[hole];
      const newPutt = newPutts[player] || 0;
      if (oldPutt !== undefined && oldPutt !== newPutt) {
        changes.push({ player, field: 'putts', from: oldPutt, to: newPutt });
      }
      const oldUp = allUps[player]?.[hole] || false;
      const newUp = newUps[player] || false;
      if (oldUp !== newUp) {
        changes.push({ player, field: 'up', from: oldUp, to: newUp });
      }
    });
    // 百家乐 UP 顺序变更检测
    if (gameMode === 'baccarat') {
      const oldOrder = allUpOrders[hole] || [];
      const newOrder = newUpOrder || [];
      if (JSON.stringify(oldOrder) !== JSON.stringify(newOrder)) {
        // 找出每个玩家的 UP 位置变化
        activePlayers.forEach(player => {
          const oldPos = oldOrder.indexOf(player);
          const newPos = newOrder.indexOf(player);
          if (oldPos !== newPos) {
            const oldLabel = oldPos === -1 ? '—' : `UP${['①','②','③','④'][oldPos]}`;
            const newLabel = newPos === -1 ? '—' : `UP${['①','②','③','④'][newPos]}`;
            changes.push({ player, field: 'up', from: oldLabel, to: newLabel });
          }
        });
      }
    }
    const editLogEntry = changes.length > 0 ? {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      hole,
      editedBy: mp.multiplayerOn ? mp.deviceId : 'local',
      editedByLabel: mp.multiplayerOn ? (mp.getDeviceLabel(mp.deviceId) || mp.deviceId) : '',
      changes,
    } : null;
    if (editLogEntry) {
      setEditLog(prev => [editLogEntry, ...prev]);
    }
    // 1. 更新 allScores, allUps, allPutts, allUpOrders
    const updatedAllScores = { ...allScores };
    const updatedAllUps = { ...allUps };
    const updatedAllPutts = { ...allPutts };
    const updatedAllUpOrders = { ...allUpOrders };
    
    activePlayers.forEach(player => {
      if (!updatedAllScores[player]) updatedAllScores[player] = {};
      if (!updatedAllUps[player]) updatedAllUps[player] = {};
      if (!updatedAllPutts[player]) updatedAllPutts[player] = {};
      updatedAllScores[player][hole] = newScores[player];
      updatedAllUps[player][hole] = newUps[player] || false;
      updatedAllPutts[player][hole] = newPutts[player] || 0;
    });
    
    // 百家乐 UP 顺序
    if (gameMode === 'baccarat') {
      updatedAllUpOrders[hole] = [...newUpOrder];
    }
    
    setAllScores(updatedAllScores);
    setAllUps(updatedAllUps);
    setAllPutts(updatedAllPutts);
    setAllUpOrders(updatedAllUpOrders);
    
    // 2. 重新计算所有已完成洞的金额
    const stakeValue = Number(stake) || 0;
    
    const newTotalMoney = {};
    const newDetails = {};
    const newSpent = {};
    let newPrizePool = 0;
    
    activePlayers.forEach(player => {
      newTotalMoney[player] = 0;
      newSpent[player] = 0;
      newDetails[player] = { fromPool: 0, fromPlayers: {} };
      activePlayers.forEach(other => {
        if (other !== player) {
          newDetails[player].fromPlayers[other] = 0;
        }
      });
    });
    
    if (stakeValue > 0 || gameMode === 'skins') {
      completedHoles.forEach(holeNum => {
        const holeScores = {};
        const holeUps = {};
        const holePutts = {};
        
        activePlayers.forEach(player => {
          holeScores[player] = updatedAllScores[player]?.[holeNum] || (pars[holeNum] || 4);
          holeUps[player] = updatedAllUps[player]?.[holeNum] || false;
          holePutts[player] = updatedAllPutts[player]?.[holeNum] || 0;
        });
        
        if (gameMode === 'matchPlay') {
          const settlement = calculateMatchPlay(holeScores, holeNum);
          activePlayers.forEach(player => {
            newTotalMoney[player] += settlement[player].money;
          });
        } else if (gameMode === 'skins') {
          const par = pars[holeNum] || 4;
          const playerScoresList = activePlayers.map(p => ({
            player: p,
            score: holeScores[p] || par,
            netScore: (holeScores[p] || par) - getHandicapForHole(p, holeNum, par)
          }));
          
          playerScoresList.sort((a, b) => a.netScore - b.netScore);
          const minScore = playerScoresList[0].netScore;
          const winners = playerScoresList.filter(p => p.netScore === minScore);
          
          const holeStake = stakeValue * activePlayers.length;
          
          activePlayers.forEach(player => {
            newSpent[player] += stakeValue;
            newTotalMoney[player] -= stakeValue;
          });
          
          if (winners.length === 1) {
            const winner = winners[0].player;
            const winAmount = newPrizePool + holeStake;
            newTotalMoney[winner] += winAmount;
            newDetails[winner].fromPool += newPrizePool;
            newPrizePool = 0;
          } else {
            newPrizePool += holeStake;
          }
        } else if (gameMode === 'win123') {
          const { results, poolChange } = calculateWin123(holeScores, holePutts, holeUps, holeNum);
          activePlayers.forEach(player => {
            newTotalMoney[player] += results[player].money;
            if (results[player].fromPool) {
              newDetails[player].fromPool += results[player].fromPool;
            }
          });
          newPrizePool += poolChange;
        } else if (gameMode === 'baccarat') {
          const holeUpOrder = updatedAllUpOrders[holeNum] || [];
          const { results } = calculateBaccarat(holeScores, holePutts, holeUpOrder, holeNum);
          activePlayers.forEach(player => {
            newTotalMoney[player] += results[player].money;
          });
        }
      });
    }
    
    setTotalMoney(newTotalMoney);
    setMoneyDetails(newDetails);
    setTotalSpent(newSpent);
    if (gameMode === 'win123' || gameMode === 'skins') {
      setPrizePool(newPrizePool);
    }
    
    showToast(t('scoreUpdated'));
    
    // 多人同步：推送编辑结果并恢复轮询
    if (mp.multiplayerOn && mp.gameCode) {
      // 同步 allScores + 更新被编辑洞的 holes 数据
      const holeUpdate = {
        scores: {}, putts: {}, ups: {}, upOrder: newUpOrder,
      };
      activePlayers.forEach(p => {
        holeUpdate.scores[p] = newScores[p];
        holeUpdate.putts[p] = newPutts[p] || 0;
        holeUpdate.ups[p] = newUps[p] || false;
      });
      
      mp.syncEdit({
        allScores: updatedAllScores,
        allUps: updatedAllUps,
        allPutts: updatedAllPutts,
        allUpOrders: updatedAllUpOrders,
        totalMoney: newTotalMoney,
        moneyDetails: newDetails,
        totalSpent: newSpent,
        completedHoles,
        editedHole: hole,
        editedHoleData: holeUpdate,
        editLog: editLogEntry,
      });
      mp.startPolling(mp.gameCode);
    }
  }, [allScores, allUps, allUpOrders, allPutts, activePlayers, stake, gameMode, completedHoles, pars, calculateMatchPlay, calculateWin123, calculateBaccarat, getHandicapForHole, showToast, t, mp]);

  const goHome = useCallback(() => {
    const resetGame = () => {
      clearSavedGame();
      mp.resetMultiplayer();
      setCurrentSection('home');
      setGameMode('matchPlay');
      setJumboMode(false);
      setPlayerNames(['', '', '', '']);
      setStake('');
      setPrizePool('');
      setPlayerHandicaps({});
      setAdvanceMode('off');
	  setAdvancePlayers({});
      setCourseType('f18');
      setHoles(courses.f18);
      setPars(courses.f18.reduce((acc, hole) => ({...acc, [hole]: 4}), {}));
      setCurrentHole(0);
      setScores({});
      setUps({});
      setPutts({});
      setWater({});
      setOb({});
      setAllScores({});
      setAllUps({});
      setAllPutts({});
      setAllWater({});
      setAllOb({});
      setTotalMoney({});
      setMoneyDetails({});
      setTotalSpent({});
      setCompletedHoles([]);
      setGameComplete(false);
      setCurrentHoleSettlement(null);
      setSetupMode('auto');
      setSearchQuery('');
      setSelectedCourse(null);
      setCourseApplied(false);
      setEditLog([]);
      setEditToastData(null);
      setEditLogDialog({ isOpen: false, hole: null });
    };

    if (gameComplete) {
      resetGame();
    } else {
      resetGame();
    }
  }, [gameComplete, clearSavedGame]);

  const getMedal = useCallback((rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }, []);

// ========== 分享功能 ==========
  const handleSharePlayer = useCallback((player) => {
    const data = generatePlayerShareData(
      player, selectedCourse, completedHoles, pars,
      allScores, allPutts, allWater || {}, allOb || {}, completedHoles,
      advancePlayers[player] || false
    );
    const url = generateShareUrl(data);
    
    if (!url) {
      showToast(t('generateLinkFailed'), 'error');
      return;
    }
    
    // 检测是否是移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && navigator.share) {
      navigator.share({
        url: url
      }).catch(() => {});
    } else {
      // 桌面端直接复制链接
      navigator.clipboard.writeText(url).then(() => {
        showToast(t('mpLinkCopied'));
      }).catch(() => showToast(t('copyFailed'), 'error'));
    }
  }, [selectedCourse, completedHoles, pars, allScores, allPutts, allWater, allOb, lang, showToast, advancePlayers]);

  // ========== Round Report 分享 ==========
  const handleShareRoundReport = useCallback(() => {
    setShowRoundReport(true);
  }, []);

  const roundReportData = useMemo(() => {
    if (!gameComplete || completedHoles.length === 0) return null;
    return buildRoundReportData({
      selectedCourse, completedHoles, pars, activePlayers,
      allScores, allPutts, totalMoney, totalSpent,
      gameMode, stake, prizePool
    });
  }, [gameComplete, completedHoles, selectedCourse, pars, activePlayers,
      allScores, allPutts, totalMoney, totalSpent, gameMode, stake, prizePool]);

// ========== MP: End Game Early 同步到 Worker ==========
const endGameEarlyMP = useCallback(() => {
  if (mp.multiplayerOn && mp.multiplayerRole === 'creator') {
    mp.syncNextHole(holes.length, holes.length, {
      totalMoney, moneyDetails, allScores, allUps, allPutts,
      allWater, allOb, totalSpent, completedHoles, prizePool,
      finished: true
    });
  }
}, [mp.multiplayerOn, mp.multiplayerRole, mp.syncNextHole, holes, totalMoney, moneyDetails, allScores, allUps, allPutts, allWater, allOb, totalSpent, completedHoles, prizePool]);

// 彩纸庆祝效果
const triggerConfetti = useCallback(() => {
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        top: -10px;
        z-index: 100;
        pointer-events: none;
        animation: confettiFall linear forwards;
      }
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
      .confetti-container {
        position: fixed;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 50;
      }
    `;
    document.head.appendChild(style);
  }
  
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    confetti.style.animationDelay = Math.random() * 1.5 + 's';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    confetti.style.width = (Math.random() * 8 + 6) + 'px';
    confetti.style.height = (Math.random() * 8 + 6) + 'px';
    container.appendChild(confetti);
  }
  
  setTimeout(() => {
    container.remove();
  }, 6000);
}, []);

// 处理 Advance 报告弹窗的玩家点击
const handleAdvancePlayerClick = useCallback((playerName) => {
  setAdvanceReportPlayer(playerName);
  setShowAdvanceFullDetail(false);
}, []);

// ========== 检测分享链接 ==========
  const urlParams = new URLSearchParams(window.location.search);
  const shareParam = urlParams.get('p');
  if (shareParam) {
    const decoded = decodeShareData(shareParam);
    if (decoded) {
      return <SharePage data={decoded} PWAInstallPrompt={PWAInstallPrompt} />;
    }
  }

  // ========== 检测 Round Report 链接 ==========
  const roundParam = urlParams.get('r');
  if (roundParam) {
    return <RoundReportPage encoded={roundParam} />;
  }

  // Viewer mode: render outside Tailwind wrapper to avoid width issues
  if (currentSection === 'game' && mp.isViewer) {
    return (
      <GameSection
        activePlayers={activePlayers} allScores={allScores} allPutts={allPutts} allUps={allUps}
        scores={scores} putts={putts} water={water} ob={ob} ups={ups} upOrder={upOrder}
        pars={pars} holes={holes} currentHole={currentHole} completedHoles={completedHoles}
        gameMode={gameMode} stake={stake} prizePool={prizePool}
        advanceMode={advanceMode} advancePlayers={advancePlayers}
        selectedCourse={selectedCourse} totalMoney={totalMoney} moneyDetails={moneyDetails}
        totalSpent={totalSpent} currentHoleSettlement={currentHoleSettlement}
        gameComplete={gameComplete} voiceEnabled={voiceEnabled} setVoiceEnabled={setVoiceEnabled}
        mp={mp} getHandicapForHole={getHandicapForHole} getScoreLabel={getScoreLabel}
        changeOn={changeOn} changePutts={changePutts} changeWater={changeWater} changeOb={changeOb}
        resetWater={resetWater} resetOb={resetOb} toggleUp={toggleUp} toggleBaccaratUp={toggleBaccaratUp}
        nextHole={nextHole} showConfirm={showConfirm} showToast={showToast}
        setCurrentSection={setCurrentSection} setGameComplete={setGameComplete}
        triggerConfetti={triggerConfetti} endGameEarlyMP={endGameEarlyMP} t={t} lang={lang}
      />
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {currentSection === 'home' && (
        <HomeLangBar
          lang={lang}
          setLang={setLang}
          showLangPicker={showLangPicker}
          setShowLangPicker={setShowLangPicker}
          t={t}
        />
      )}

      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-3">
          
          {currentSection === 'home' && (
            <HomeContent
              hasSavedGame={hasSavedGame}
              resumeGame={resumeGame}
              setSearchQuery={setSearchQuery}
              setSelectedCourse={setSelectedCourse}
              setCourseApplied={setCourseApplied}
              setCurrentSection={setCurrentSection}
              showQrScanner={showQrScanner}
              startQrScanner={startQrScanner}
              stopQrScanner={stopQrScanner}
              qrVideoRef={qrVideoRef}
              mp={mp}
              showToast={showToast}
              t={t}
            />
          )}

          {currentSection === 'course' && (
            <CourseSection
              setupMode={setupMode} setSetupMode={setSetupMode}
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse}
              courseApplied={courseApplied} setCourseApplied={setCourseApplied}
              courseType={courseType} setCourseType={setCourseType}
              holes={holes} setHoles={setHoles}
              pars={pars} setPar={setPar} setPars={setPars}
              recentCourses={recentCourses} setRecentCourses={setRecentCourses}
              filteredCourses={filteredCourses}
              selectAndApplyCourse={selectAndApplyCourse}
              confirmCourse={confirmCourse}
              calculateTotalPar={calculateTotalPar}
              getParColorClass={getParColorClass}
              getVerticalArrangedHoles={getVerticalArrangedHoles}
              setCurrentSection={setCurrentSection}
              t={t}
            />
          )}
          {currentSection === 'players' && (
            <PlayersSection
              playerNames={playerNames} updatePlayerName={updatePlayerName}
              playerHandicaps={playerHandicaps} updatePlayerHandicap={updatePlayerHandicap}
              jumboMode={jumboMode} toggleJumboMode={toggleJumboMode}
              gameMode={gameMode} setGameMode={setGameMode}
              showModeDesc={showModeDesc} setShowModeDesc={setShowModeDesc}
              stake={stake} setStake={setStake} stakeInputRef={stakeInputRef}
              advanceMode={advanceMode} setAdvanceMode={setAdvanceMode}
              advancePlayers={advancePlayers} setAdvancePlayers={setAdvancePlayers}
              activePlayers={activePlayers}
              showHcpTooltip={showHcpTooltip} setShowHcpTooltip={setShowHcpTooltip}
              showAdvanceTooltip={showAdvanceTooltip} setShowAdvanceTooltip={setShowAdvanceTooltip}
              showMpTooltip={showMpTooltip} setShowMpTooltip={setShowMpTooltip}
              mp={mp}
              startGame={startGame}
              setCurrentSection={setCurrentSection}
              t={t}
            />
          )}
          {/* ========== 多人同步：Creator 大厅 ========== */}
          {currentSection === 'mp-lobby' && (
            <MpLobbySection
              activePlayers={activePlayers}
              playerHandicaps={playerHandicaps}
              mp={mp}
              showToast={showToast}
              setCurrentSection={setCurrentSection}
              t={t}
            />
          )}

          {/* ========== 多人同步：角色选择页 (Player / Viewer) ========== */}
          {currentSection === 'mp-role' && mp.remoteGame && (
            <MpRoleSection
              mp={mp}
              setGameMode={setGameMode} setStake={setStake} setJumboMode={setJumboMode} setPlayerHandicaps={setPlayerHandicaps}
              setAdvanceMode={setAdvanceMode} setAdvancePlayers={setAdvancePlayers} setPlayerNames={setPlayerNames}
              setSelectedCourse={setSelectedCourse} setPars={setPars} setHoles={setHoles}
              setTotalMoney={setTotalMoney} setMoneyDetails={setMoneyDetails} setAllScores={setAllScores} setAllUps={setAllUps} setAllPutts={setAllPutts}
              setAllWater={setAllWater} setAllOb={setAllOb} setTotalSpent={setTotalSpent}
              setCurrentHole={setCurrentHole} setScores={setScores} setUps={setUps} setPutts={setPutts} setWater={setWater} setOb={setOb}
              setCompletedHoles={setCompletedHoles} setGameComplete={setGameComplete} setCurrentHoleSettlement={setCurrentHoleSettlement}
              setCurrentSection={setCurrentSection}
              t={t}
            />
          )}

          {/* ========== 多人同步：Joiner 认领球员 ========== */}
          {currentSection === 'mp-claim' && mp.remoteGame && (
            <MpClaimSection
              mp={mp} showToast={showToast}
              setGameMode={setGameMode} setStake={setStake} setJumboMode={setJumboMode} setPlayerHandicaps={setPlayerHandicaps}
              setAdvanceMode={setAdvanceMode} setAdvancePlayers={setAdvancePlayers} setPlayerNames={setPlayerNames}
              setSelectedCourse={setSelectedCourse} setPars={setPars}
              setTotalMoney={setTotalMoney} setMoneyDetails={setMoneyDetails} setAllScores={setAllScores} setAllUps={setAllUps} setAllPutts={setAllPutts}
              setAllWater={setAllWater} setAllOb={setAllOb} setTotalSpent={setTotalSpent}
              setCurrentHole={setCurrentHole} setScores={setScores} setUps={setUps} setPutts={setPutts} setWater={setWater} setOb={setOb}
              setCompletedHoles={setCompletedHoles} setGameComplete={setGameComplete} setCurrentHoleSettlement={setCurrentHoleSettlement}
              setCurrentSection={setCurrentSection}
              t={t}
            />
          )}
          {currentSection === 'scorecard' && (
            <ScorecardSection
              selectedCourse={selectedCourse}
              completedHoles={completedHoles}
              activePlayers={activePlayers}
              allScores={allScores}
              allPutts={allPutts}
              pars={pars}
              holes={holes}
              totalMoney={totalMoney}
              gameMode={gameMode}
              stake={stake}
              prizePool={prizePool}
              gameComplete={gameComplete}
              editLog={editLog}
              mp={mp}
              getHandicapForHole={getHandicapForHole}
              getMedal={getMedal}
              handleAdvancePlayerClick={handleAdvancePlayerClick}
              handleSharePlayer={handleSharePlayer}
              handleShareRoundReport={handleShareRoundReport}
              setCurrentSection={setCurrentSection}
              setHoleSelectDialog={setHoleSelectDialog}
              setEditLogDialog={setEditLogDialog}
              goHome={goHome}
              t={t}
            />
          )}
        </div>
      </div>

      {currentSection === 'game' && (
        <GameSection
          activePlayers={activePlayers}
          allScores={allScores}
          allPutts={allPutts}
          allUps={allUps}
          scores={scores}
          putts={putts}
          water={water}
          ob={ob}
          ups={ups}
          upOrder={upOrder}
          pars={pars}
          holes={holes}
          currentHole={currentHole}
          completedHoles={completedHoles}
          gameMode={gameMode}
          stake={stake}
          prizePool={prizePool}
          advanceMode={advanceMode}
          advancePlayers={advancePlayers}
          selectedCourse={selectedCourse}
          totalMoney={totalMoney}
          moneyDetails={moneyDetails}
          totalSpent={totalSpent}
          currentHoleSettlement={currentHoleSettlement}
          gameComplete={gameComplete}
          voiceEnabled={voiceEnabled}
          setVoiceEnabled={setVoiceEnabled}
          mp={mp}
          getHandicapForHole={getHandicapForHole}
          getScoreLabel={getScoreLabel}
          changeOn={changeOn}
          changePutts={changePutts}
          changeWater={changeWater}
          changeOb={changeOb}
          resetWater={resetWater}
          resetOb={resetOb}
          toggleUp={toggleUp}
          toggleBaccaratUp={toggleBaccaratUp}
          nextHole={nextHole}
          showConfirm={showConfirm}
          showToast={showToast}
          setCurrentSection={setCurrentSection}
          setGameComplete={setGameComplete}
          triggerConfetti={triggerConfetti}
          endGameEarlyMP={endGameEarlyMP}
          t={t}
          lang={lang}
        />
      )}


      <GlobalDialogs
        advanceReportPlayer={advanceReportPlayer}
        showAdvanceFullDetail={showAdvanceFullDetail}
        setAdvanceReportPlayer={setAdvanceReportPlayer}
        setShowAdvanceFullDetail={setShowAdvanceFullDetail}
        activePlayers={activePlayers}
        completedHoles={completedHoles}
        allScores={allScores}
        allPutts={allPutts}
        allWater={allWater}
        allOb={allOb}
        allUps={allUps}
        pars={pars}
        gameMode={gameMode}
        advancePlayers={advancePlayers}
        getMedal={getMedal}
        showRoundReport={showRoundReport}
        setShowRoundReport={setShowRoundReport}
        roundReportData={roundReportData}
        lang={lang}
        showToast={showToast}
        toast={toast}
        setToast={setToast}
        editToastData={editToastData}
        setEditToastData={setEditToastData}
        setEditLogDialog={setEditLogDialog}
        editLogDialog={editLogDialog}
        editLog={editLog}
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
        holeConfirmDialog={holeConfirmDialog}
        setHoleConfirmDialog={setHoleConfirmDialog}
        pendingRankings={pendingRankings}
        setPendingRankings={setPendingRankings}
        holes={holes}
        currentHole={currentHole}
        scores={scores}
        putts={putts}
        getHandicapForHole={getHandicapForHole}
        stake={stake}
        prizePool={prizePool}
        holeSelectDialog={holeSelectDialog}
        setHoleSelectDialog={setHoleSelectDialog}
        setEditHoleDialog={setEditHoleDialog}
        mp={mp}
        editHoleDialog={editHoleDialog}
        allUpOrders={allUpOrders}
        handleEditHoleSave={handleEditHoleSave}
        puttsWarningDialog={puttsWarningDialog}
        setPuttsWarningDialog={setPuttsWarningDialog}
        handlePuttsWarningConfirm={handlePuttsWarningConfirm}
        t={t}
      />
    </div>
  );
}

export default IntegratedGolfGame;