import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  Plus, 
  Minus, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  X,
  Trophy,
  DollarSign,
  Play,
  Home,
  Users,
  Settings,
  BarChart3,
  ArrowLeft,
  Target,
  Camera,
  CircleDollarSign
} from 'lucide-react';

// Toast 组件
const Toast = memo(({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  const icon = type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 text-sm animate-pulse`}>
      {icon}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
});

// 确认对话框
const ConfirmDialog = memo(({ isOpen, onClose, onConfirm, message, t, showScreenshotHint }) => {
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

// 该洞成绩确认对话框
const HoleScoreConfirmDialog = memo(({ isOpen, onClose, onConfirm, hole, players, scores, rankings, gameMode, getHandicapForHole, pars, t, stake, prizePool, activePlayers }) => {
  if (!isOpen || !players) return null;

  // Calculate Skins winner if in Skins mode
  let skinsWinner = null;
  let skinsAmount = 0;
  let netWinnings = 0;
  if (gameMode === 'skins' && Number(stake) > 0) {
    const par = pars[hole] || 4;
    const playerScores = players.map(p => ({
      player: p,
      score: scores[p] || par,
      netScore: (scores[p] || par) - getHandicapForHole(p, par)
    }));
    
    playerScores.sort((a, b) => a.netScore - b.netScore);
    const minScore = playerScores[0].netScore;
    const winners = playerScores.filter(p => p.netScore === minScore);
    
    if (winners.length === 1) {
      skinsWinner = winners[0].player;
      skinsAmount = prizePool + (Number(stake) || 0) * activePlayers.length;
      netWinnings = skinsAmount - Number(stake);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {t('confirmHoleScore').replace('{hole}', hole)}
        </h3>
        
        {/* Show Skins winner if applicable */}
        {gameMode === 'skins' && Number(stake) > 0 && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            {skinsWinner ? (
              <>
                <div className="text-center text-purple-800 font-semibold">
                  {t('skinsWinner').replace('{player}', skinsWinner)}
                </div>
                <div className="text-center text-2xl font-bold text-purple-600 mt-1">
                  ${netWinnings}
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-purple-800 font-semibold">
                  {t('holeTied')}
                </div>
                <div className="text-center text-sm text-purple-600 mt-1">
                  {t('poolGrows')}: ${prizePool + (Number(stake) || 0) * activePlayers.length}
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">{t('holeScoresSummary')}</p>
          <div className="space-y-2">
            {(gameMode === 'matchPlay' || gameMode === 'skins') ? (
              players.map(player => {
                const score = scores[player] || (pars[hole] || 4);
                const handicap = getHandicapForHole(player, pars[hole] || 4);
                const netScore = score - handicap;
                
                return (
                  <div key={player} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{player}</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{score}</span>
                      {handicap > 0 && (
                        <div className="text-xs text-green-600">
                          {t('netScore')}: {netScore}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              rankings && rankings.map(r => (
                <div key={r.player} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{r.player}</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{r.score}</span>
                    {r.up && <span className="ml-1 text-xs text-yellow-600">(UP)</span>}
                    <div className="text-xs text-gray-600">
                      {r.finalRank === 1 ? t('winner') : t('rank').replace('{n}', r.finalRank)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
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
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
});

// 输入组件
const PlayerInput = memo(({ index, value, placeholder, onChange }) => {
  const handleChange = useCallback((e) => {
    onChange(index, e.target.value);
  }, [index, onChange]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
    />
  );
});

// Handicap输入组件
const HandicapRow = memo(({ playerName, handicaps, onChange }) => {
  const handleParChange = useCallback((parType, value) => {
    onChange(playerName, parType, value);
  }, [playerName, onChange]);

  return (
    <div className="bg-gray-50 rounded-md p-3 mb-3">
      <div className="text-sm font-semibold text-green-600 mb-2">
        {playerName}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-600 mb-1">PAR 3</div>
          <input
            type="number"
            min={0}
            max={3}
            value={handicaps.par3 ?? ''}
            placeholder="0"
            onChange={(e) => handleParChange('par3', e.target.value === '' ? '' : parseInt(e.target.value))}
            className="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-600 mb-1">PAR 4</div>
          <input
            type="number"
            min={0}
            max={3}
            value={handicaps.par4 ?? ''}
            placeholder="0"
            onChange={(e) => handleParChange('par4', e.target.value === '' ? '' : parseInt(e.target.value))}
            className="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-600 mb-1">PAR 5</div>
          <input
            type="number"
            min={0}
            max={3}
            value={handicaps.par5 ?? ''}
            placeholder="0"
            onChange={(e) => handleParChange('par5', e.target.value === '' ? '' : parseInt(e.target.value))}
            className="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
    </div>
  );
});

// 成绩显示组件
const ScoreDisplay = memo(({ score, par }) => {
  const diff = score - par;
  
  let colorClass = 'text-gray-900';
  if (diff <= -2) colorClass = 'text-purple-600';
  else if (diff === -1) colorClass = 'text-blue-600';
  else if (diff === 0) colorClass = 'text-gray-900';
  else if (diff === 1) colorClass = 'text-orange-600';
  else colorClass = 'text-red-600';
  
  const fontSize = window.innerWidth < 360 ? '11px' : 
                   window.innerWidth < 375 ? '12px' : 
                   window.innerWidth < 414 ? '13px' : '14px';
  
  return <span className={`font-semibold ${colorClass}`} style={{ fontSize }}>{score}</span>;
});

// 球场配置
const courses = {
  f9: [1,2,3,4,5,6,7,8,9],
  b9: [10,11,12,13,14,15,16,17,18],
  f18: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
  b18: [10,11,12,13,14,15,16,17,18,1,2,3,4,5,6,7,8,9]
};

function IntegratedGolfGame() {
  const [lang, setLang] = useState('zh');
  const [currentSection, setCurrentSection] = useState('home');
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', action: null, showScreenshotHint: false });
  const [holeConfirmDialog, setHoleConfirmDialog] = useState({ isOpen: false, action: null });
  const [hasUnfinishedGame, setHasUnfinishedGame] = useState(false);
  
  // 球场设置
  const [courseType, setCourseType] = useState('f18');
  const [holes, setHoles] = useState(courses.f18);
  const [pars, setPars] = useState(courses.f18.reduce((acc, hole) => ({...acc, [hole]: 4}), {}));
  
  // 游戏设置
  const [gameMode, setGameMode] = useState('matchPlay'); 
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [stake, setStake] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [handicap, setHandicap] = useState('off');
  const [playerHandicaps, setPlayerHandicaps] = useState({});
  
  // 游戏数据
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState({});  
  const [ups, setUps] = useState({});  
  const [allScores, setAllScores] = useState({});  
  const [allUps, setAllUps] = useState({});  
  const [totalMoney, setTotalMoney] = useState({});
  const [moneyDetails, setMoneyDetails] = useState({});
  const [completedHoles, setCompletedHoles] = useState([]);
  const [pendingRankings, setPendingRankings] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentHoleSettlement, setCurrentHoleSettlement] = useState(null);
  const [totalSpent, setTotalSpent] = useState({});

  // 获取活跃玩家
  const activePlayers = useMemo(() => {
    return playerNames.filter(name => name.trim());
  }, [playerNames]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const showConfirm = useCallback((message, action, showScreenshotHint = false) => {
    setConfirmDialog({ isOpen: true, message, action, showScreenshotHint });
  }, []);

  // 页面切换时清理弹窗
  useEffect(() => {
    if (currentSection === 'scorecard') {
      setConfirmDialog({ isOpen: false, message: '', action: null, showScreenshotHint: false });
    }
  }, [currentSection]);

  // 检查是否有未完成的游戏
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedGame = localStorage.getItem('golfGameState');
        if (savedGame) {
          const state = JSON.parse(savedGame);
          if (!state.gameComplete && state.currentSection === 'game') {
            setHasUnfinishedGame(true);
          }
        }
      }
    } catch (error) {
      console.log('localStorage not available:', error);
    }
  }, []);

  // 保存游戏状态
  const saveGameState = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const gameState = {
          currentSection,
          currentHole,
          scores,
          ups,
          allScores,
          allUps,
          totalMoney,
          moneyDetails,
          totalSpent,
          completedHoles,
          gameComplete,
          currentHoleSettlement,
          courseType,
          holes,
          pars,
          gameMode,
          playerNames,
          stake,
          prizePool,
          handicap,
          playerHandicaps,
          savedAt: new Date().toISOString(),
          version: '1.0'
        };
        
        localStorage.setItem('golfGameState', JSON.stringify(gameState));
      }
    } catch (error) {
      console.log('Failed to save game state:', error);
    }
  }, [currentSection, currentHole, scores, ups, allScores, allUps, totalMoney, 
      moneyDetails, totalSpent, completedHoles, gameComplete, currentHoleSettlement, courseType,
      holes, pars, gameMode, playerNames, stake, prizePool,
      handicap, playerHandicaps]);

  // 恢复游戏状态
  const loadGameState = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedGame = localStorage.getItem('golfGameState');
        if (savedGame) {
          try {
            const state = JSON.parse(savedGame);
            
            setCurrentSection(state.currentSection || 'home');
            setCurrentHole(state.currentHole || 0);
            setScores(state.scores || {});
            setUps(state.ups || {});
            setAllScores(state.allScores || {});
            setAllUps(state.allUps || {});
            setTotalMoney(state.totalMoney || {});
            setMoneyDetails(state.moneyDetails || {});
            setTotalSpent(state.totalSpent || {});
            setCompletedHoles(state.completedHoles || []);
            setGameComplete(state.gameComplete || false);
            setCurrentHoleSettlement(state.currentHoleSettlement || null);
            
            setCourseType(state.courseType || 'f18');
            setHoles(state.holes || courses.f18);
            setPars(state.pars || {});
            setGameMode(state.gameMode || 'matchPlay');
            setPlayerNames(state.playerNames || ['', '', '', '']);
            setStake(state.stake || '');
            setPrizePool(state.prizePool || '');
            setHandicap(state.handicap || 'off');
            setPlayerHandicaps(state.playerHandicaps || {});
            
            // 清理弹窗状态
            setConfirmDialog({ isOpen: false, message: '', action: null, showScreenshotHint: false });
            
            setHasUnfinishedGame(false);
            showToast(lang === 'zh' ? '游戏已恢复' : 'Game restored');
          } catch (error) {
            console.error('Failed to parse game state:', error);
            showToast(lang === 'zh' ? '恢复失败' : 'Failed to restore', 'error');
          }
        }
      }
    } catch (error) {
      console.log('localStorage not available:', error);
    }
  }, [lang, showToast]);

  // 清除保存的游戏
  const clearSavedGame = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('golfGameState');
        setHasUnfinishedGame(false);
      }
    } catch (error) {
      console.log('Failed to clear saved game:', error);
    }
  }, []);

  // 翻译函数 - 修改为使用罚金池
  const t = useCallback((key) => {
    const translations = {
      zh: {
        title: 'HandinCap',
        subtitle: '让每一杆都算数',
        create: '创建新局',
        continueGame: '继续游戏',
        courseTitle: '球场设置',
        courseSubtitle: '选择比赛类型和洞设置',
        gameType: '比赛类型',
        setPar: '设置各洞PAR值',
        confirmCourse: '确认设置',
        playerTitle: '玩家设置',
        players: '玩家',
        player1: '玩家1',
        player2: '玩家2',
        player3: '玩家3',
        player4: '玩家4',
        enterName: '输入姓名',
        gameMode: '游戏模式',
        matchPlay: 'Match Play',
        win123: 'Win123',
        skins: 'Skins',
        stake: '底注',
        prizePool: '奖金池',
        penaltyPot: '罚金池',
        optional: '可选',
        enterStake: '输入金额（可选）',
        handicap: '差点',
        handicapSettings: '差点设置',
        off: '关',
        on: '开',
        back: '返回',
        start: '开始比赛',
        hole: '洞',
        holeTitle: '第{hole}洞',
        par: 'PAR',
        nextHole: '确认成绩 →',
        currentMoney: '实时战况',
        poolBalance: '奖池余额',
        carryOverPool: '累积奖池',
        currentHoleStake: '本洞赌注',
        holeTied: '本洞平局',
        poolGrows: '下洞奖池',
        accumulatedFromTies: '含之前平局累积',
        skinsWinner: '{player}赢得Skins！',
        holeSettlement: '该洞结算',
        settlement: '该洞结算',
        fromPool: '奖池',
        netScore: '净杆',
        rank: '第{n}名',
        winner: '胜利',
        scorecardTitle: '成绩卡',
        resume: '继续比赛',
        finishRound: '确认并结束',
        confirmHoleScore: '确认第{hole}洞成绩',
        holeScoresSummary: '各玩家成绩：',
        confirmPrev: '确定要返回上一洞吗？',
        cancel: '取消',
        yes: '确定',
        confirm: '确认',
        switchLang: 'English',
        noStake: '请输入底注金额',
        atLeast2: '请至少输入2名玩家',
        gameOver: '比赛结束！',
        backToHome: '回到首页',
        out: '前九',
        in: '后九',
        total: '计',
        totalScore: '总成绩',
        standardPar: '标准杆',
        finalSettlement: '最终结算',
        noScoreData: '还没有开始记分',
        eagle: '老鹰球',
        birdie: '小鸟球',
        parLabel: '标准杆',
        bogey: '柏忌',
        doubleplus: '双柏忌+',
        f9: '前9洞',
        b9: '后9洞',
        f18: '前18洞',
        b18: '后18洞',
        f9Desc: '1-9洞',
        b9Desc: '10-18洞',
        f18Desc: '1-18洞标准',
        b18Desc: '10-18,1-9洞',
        saved: '已保存！',
        duplicateNames: '玩家名不可重复',
        confirmBackToHome: '确定要回到首页吗？',
        dataWillBeLost: '所有比赛数据将被清除',
        screenshotHint: '建议您先截图保存成绩记录',
        totalLoss: '累计'
      },
      en: {
        title: 'HandinCap',
        subtitle: 'Your Handicap in Hand',
        create: 'Create New Game',
        continueGame: 'Continue Game',
        courseTitle: 'Course Setup',
        courseSubtitle: 'Select game type and holes',
        gameType: 'Game Type',
        setPar: 'Set PAR Values',
        confirmCourse: 'Confirm',
        playerTitle: 'Player Setup',
        players: 'Players',
        player1: 'Player 1',
        player2: 'Player 2',
        player3: 'Player 3',
        player4: 'Player 4',
        enterName: 'Enter name',
        gameMode: 'Game Mode',
        matchPlay: 'Match Play',
        win123: 'Win123',
        skins: 'Skins',
        stake: 'Stake',
        prizePool: 'Prize Pool',
        penaltyPot: 'Pot',
        optional: 'Optional',
        enterStake: 'Enter amount (optional)',
        handicap: 'Handicap',
        handicapSettings: 'Handicap Settings',
        off: 'Off',
        on: 'On',
        back: 'Back',
        start: 'Start Game',
        hole: 'Hole',
        holeTitle: 'Hole {hole}',
        par: 'PAR',
        nextHole: 'Confirm & Next',
        currentMoney: 'Live Standings',
        poolBalance: 'Pool Balance',
        carryOverPool: 'Carry-Over Pool',
        currentHoleStake: 'Current Hole Stake',
        holeTied: 'Hole Tied',
        poolGrows: 'Next hole pool',
        accumulatedFromTies: 'Accumulated from previous ties',
        skinsWinner: '{player} wins the Skin!',
        holeSettlement: 'Hole Settlement',
        settlement: 'Hole Settlement',
        fromPool: 'Pool',
        netScore: 'Net',
        rank: 'Rank {n}',
        winner: 'Winner',
        scorecardTitle: 'Score Card',
        resume: 'Resume Game',
        finishRound: 'Confirm & Finish',
        confirmHoleScore: 'Confirm Hole {hole} Scores',
        holeScoresSummary: 'Player Scores:',
        confirmPrev: 'Go back to previous hole?',
        cancel: 'Cancel',
        yes: 'Yes',
        confirm: 'Confirm',
        switchLang: '中文',
        noStake: 'Please enter stake amount',
        atLeast2: 'Please enter at least 2 players',
        gameOver: 'Game Over!',
        backToHome: 'Back to Home',
        out: 'OUT',
        in: 'IN',
        total: 'Tot',
        totalScore: 'Total Score',
        standardPar: 'Par',
        finalSettlement: 'Final Settlement',
        noScoreData: 'No scores recorded yet',
        eagle: 'Eagle',
        birdie: 'Birdie',
        parLabel: 'Par',
        bogey: 'Bogey',
        doubleplus: 'Double+',
        f9: 'Front 9',
        b9: 'Back 9',
        f18: 'Front 18',
        b18: 'Back 18',
        f9Desc: 'Holes 1-9',
        b9Desc: 'Holes 10-18',
        f18Desc: 'Standard 1-18',
        b18Desc: '10-18, 1-9',
        saved: 'Saved!',
        duplicateNames: 'Player names must be unique',
        confirmBackToHome: 'Return to home?',
        dataWillBeLost: 'All game data will be lost',
        screenshotHint: 'We recommend taking a screenshot to save your scores',
        totalLoss: 'Total'
      }
    };
    return translations[lang][key] || key;
  }, [lang]);

  // 设置球场类型
  const setCourse = useCallback((type) => {
    setCourseType(type);
    const newHoles = courses[type];
    setHoles(newHoles);
    setPars(newHoles.reduce((acc, hole) => ({...acc, [hole]: 4}), {}));
  }, []);

  // 设置PAR值
  const setPar = useCallback((hole, par) => {
    setPars(prev => ({ ...prev, [hole]: par }));
  }, []);

  // 确认球场设置
  const confirmCourse = useCallback(() => {
    showToast(t('saved'));
    setCurrentSection('players');
  }, [showToast, t]);

  // 获取竖向排列的洞
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

  // 计算总PAR
  const calculateTotalPar = useCallback(() => {
    return holes.reduce((sum, hole) => sum + (pars[hole] || 4), 0);
  }, [holes, pars]);

  // 更新玩家名字
  const updatePlayerName = useCallback((index, value) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = value;
      return newNames;
    });
  }, []);

  // 更新玩家差点
  const updatePlayerHandicap = useCallback((playerName, parType, value) => {
    setPlayerHandicaps(prev => ({
      ...prev,
      [playerName]: {
        ...prev[playerName],
        [parType]: value === '' ? undefined : value
      }
    }));
  }, []);

  // 获取成绩标签
  const getScoreLabel = useCallback((netScore, par) => {
    const diff = netScore - par;
    let textKey, className;
    
    if (diff <= -2) {
      textKey = 'eagle';
      className = 'bg-purple-100 text-purple-700';
    } else if (diff === -1) {
      textKey = 'birdie';
      className = 'bg-blue-100 text-blue-700';
    } else if (diff === 0) {
      textKey = 'parLabel';
      className = 'bg-gray-100 text-gray-700';
    } else if (diff === 1) {
      textKey = 'bogey';
      className = 'bg-orange-100 text-orange-700';
    } else {
      textKey = 'doubleplus';
      className = 'bg-red-100 text-red-700';
    }
    
    return { text: t(textKey), class: className };
  }, [t]);

  // 开始游戏
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
      // Match Play模式不需要特殊处理
    } else if (gameMode === 'skins') {
      if (stakeValue <= 0) {
        showToast(t('noStake'), 'error');
        return;
      }
      setPrizePool(0);  // Skins模式始终从0开始
    } else if (gameMode === 'win123') {
      if (stakeValue <= 0) {
        showToast(t('noStake'), 'error');
        return;
      }
      setPrizePool(0);  // Win123模式也从0开始（罚金池）
    }

    const initMoney = {};
    const initDetails = {};
    const initAllScores = {};
    const initSpent = {};
    
    activePlayers.forEach(player => {
      initMoney[player] = 0;
      initDetails[player] = { fromPool: 0, fromPlayers: {} };
      initAllScores[player] = {};
      initSpent[player] = 0;
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
    setTotalSpent(initSpent);
    setCurrentHole(0);  
    setScores({});
    setUps({});
    setCompletedHoles([]);
    setGameComplete(false);
    setCurrentHoleSettlement(null);
    setCurrentSection('game');
    
    setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const gameState = {
            currentSection: 'game',
            currentHole: 0,
            scores: {},
            ups: {},
            allScores: initAllScores,
            allUps: {},
            totalMoney: initMoney,
            moneyDetails: initDetails,
            totalSpent: initSpent,
            completedHoles: [],
            gameComplete: false,
            currentHoleSettlement: null,
            courseType,
            holes,
            pars,
            gameMode,
            playerNames,
            stake,
            prizePool: 0,
            handicap,
            playerHandicaps,
            savedAt: new Date().toISOString(),
            version: '1.0'
          };
          localStorage.setItem('golfGameState', JSON.stringify(gameState));
        }
      } catch (error) {
        console.log('Failed to save initial game state:', error);
      }
    }, 100);
  }, [activePlayers, stake, gameMode, showToast, t, courseType, holes, pars, playerNames, handicap, playerHandicaps]);

  // 获取handicap
  const getHandicapForHole = useCallback((player, par = 4) => {
    if (handicap !== 'on') return 0;
    const handicaps = playerHandicaps[player];
    if (!handicaps) return 0;
    
    if (par === 3) return handicaps.par3 || 0;
    if (par === 4) return handicaps.par4 || 0;
    if (par === 5) return handicaps.par5 || 0;
    return 0;
  }, [handicap, playerHandicaps]);

  // 计算Match Play
  const calculateMatchPlay = useCallback((holeScores, holeNum) => {
    const stakeValue = Number(stake) || 0;
    const par = pars[holeNum] || 4;
    const playerScores = activePlayers.map(p => ({
      player: p,
      score: holeScores[p] || par,
      netScore: (holeScores[p] || par) - getHandicapForHole(p, par)
    }));
    
    playerScores.sort((a, b) => a.netScore - b.netScore);
    const minScore = playerScores[0].netScore;
    const winners = playerScores.filter(p => p.netScore === minScore);
    const losers = playerScores.filter(p => p.netScore > minScore);
    
    const results = {};
    activePlayers.forEach(player => {
      results[player] = { money: 0 };
    });
    
    if (winners.length < activePlayers.length && stakeValue > 0) {
      const winAmount = (losers.length * stakeValue) / winners.length;
      winners.forEach(w => {
        results[w.player].money = winAmount;
      });
      losers.forEach(l => {
        results[l.player].money = -stakeValue;
      });
    }
    
    return results;
  }, [activePlayers, stake, pars, getHandicapForHole]);

  // calculateSkins函数
  const calculateSkins = useCallback((holeScores, holeNum) => {
    const stakeValue = Number(stake) || 0;
    const par = pars[holeNum] || 4;
    
    const currentPrizePool = Math.max(0, prizePool);
    
    const playerScores = activePlayers.map(p => ({
      player: p,
      score: holeScores[p] || par,
      netScore: (holeScores[p] || par) - getHandicapForHole(p, par)
    }));
    
    playerScores.sort((a, b) => a.netScore - b.netScore);
    const minScore = playerScores[0].netScore;
    const winners = playerScores.filter(p => p.netScore === minScore);
    
    const results = {};
    let poolChange = 0;
    
    // 每个玩家都要投入底注
    activePlayers.forEach(player => {
      results[player] = { 
        money: -stakeValue,  // 先扣除本洞投入
        fromPool: 0,
        spent: stakeValue    // 记录本洞投入
      };
    });
    
    const holeStake = stakeValue * activePlayers.length;
    
    if (winners.length === 1) {
      const winner = winners[0].player;
      const winAmount = currentPrizePool + holeStake;
      // 赢家获得奖池，但已经扣了底注，所以是净赢
      results[winner].money = winAmount - stakeValue;
      results[winner].fromPool = currentPrizePool;
      
      poolChange = -currentPrizePool;
    } else {
      // 平局时奖池累积
      poolChange = holeStake;
    }
    
    return { results, poolChange, isTied: winners.length > 1, winner: winners.length === 1 ? winners[0].player : null, winAmount: winners.length === 1 ? currentPrizePool + holeStake : 0 };
  }, [activePlayers, stake, pars, getHandicapForHole, prizePool]);

  // 修改后的calculateWin123 - 新规则
  const calculateWin123 = useCallback((holeScores, holeUps, holeNum) => {
    const stakeValue = Number(stake) || 0;
    const par = pars[holeNum] || 4;
    const playerScores = activePlayers.map(p => ({
      player: p,
      score: holeScores[p] || par,
      netScore: (holeScores[p] || par) - getHandicapForHole(p, par),
      up: holeUps[p] || false
    }));
    
    playerScores.sort((a, b) => a.netScore - b.netScore);
    
    const uniqueScores = [...new Set(playerScores.map(p => p.netScore))];
    const rankings = [...playerScores];
    
    // 计算排名
    if (uniqueScores.length === 1) {
      rankings.forEach(r => r.finalRank = 1);
    } else if (uniqueScores.length === 2) {
      const firstScore = uniqueScores[0];
      rankings.forEach(r => {
        r.finalRank = r.netScore === firstScore ? 1 : 4;
      });
    } else if (uniqueScores.length === 3) {
      const firstScore = uniqueScores[0];
      const secondScore = uniqueScores[1];
      const firstCount = rankings.filter(r => r.netScore === firstScore).length;
      
      rankings.forEach(r => {
        if (r.netScore === firstScore) {
          r.finalRank = 1;
        } else if (r.netScore === secondScore) {
          r.finalRank = firstCount >= 3 ? 4 : 3;
        } else {
          r.finalRank = 4;
        }
      });
    } else {
      rankings.forEach((r, i) => r.finalRank = i + 1);
    }
    
    const results = {};
    let poolChange = 0;
    
    // 初始化结果
    activePlayers.forEach(player => {
      results[player] = { money: 0, fromPool: 0 };
    });
    
    // 新规则：只处理罚金池
    if (uniqueScores.length > 1) {
      rankings.forEach(r => {
        let penalty = 0;
        
        // 根据排名计算基础罚金
        if (r.finalRank === 2) penalty = stakeValue;
        else if (r.finalRank === 3) penalty = stakeValue * 2;
        else if (r.finalRank === 4) penalty = stakeValue * 3;
        
        // UP的影响 - 新规则
        if (r.up) {
          if (r.finalRank === 1) {
            // 赢家UP从罚金池获得6倍底注
            const poolWin = stakeValue * 6;
            results[r.player].money = poolWin;
            results[r.player].fromPool = poolWin;
            poolChange -= poolWin;
          } else {
            // 输家UP罚金翻倍
            penalty = penalty * 2;
          }
        }
        
        // 输家扣钱（进罚金池）
        if (r.finalRank > 1) {
          results[r.player].money = -penalty;
          poolChange += penalty;
        }
      });
    }
    
    return { results, poolChange, rankings };
  }, [activePlayers, stake, pars, getHandicapForHole]);

  // 改变分数
  const changeScore = useCallback((player, delta) => {
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const current = scores[player] || par;
    const newScore = Math.max(1, current + delta);
    setScores(prev => ({ ...prev, [player]: newScore }));
    
    const newScores = { ...scores, [player]: newScore };
    const holeScores = {};
    const holeUps = {};
    
    activePlayers.forEach(p => {
      holeScores[p] = newScores[p] || par;
      holeUps[p] = ups[p] || false;
    });
    
    if (gameMode === 'matchPlay') {
      const settlement = calculateMatchPlay(holeScores, holeNum);
      setCurrentHoleSettlement(settlement);
    } else if (gameMode === 'skins') {
      const { results } = calculateSkins(holeScores, holeNum);
      setCurrentHoleSettlement(results);
    } else if (gameMode === 'win123') {
      const { results } = calculateWin123(holeScores, holeUps, holeNum);
      setCurrentHoleSettlement(results);
    }
    
    setTimeout(() => saveGameState(), 100);
  }, [scores, currentHole, holes, pars, ups, activePlayers, gameMode, calculateMatchPlay, calculateSkins, calculateWin123, saveGameState]);

  // 切换UP
  const toggleUp = useCallback((player) => {
    setUps(prev => ({ ...prev, [player]: !prev[player] }));
    
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const holeScores = {};
    const newUps = { ...ups, [player]: !ups[player] };
    
    activePlayers.forEach(p => {
      holeScores[p] = scores[p] || par;
    });
    
    if (gameMode === 'win123') {
      const { results } = calculateWin123(holeScores, newUps, holeNum);
      setCurrentHoleSettlement(results);
    }
    
    setTimeout(() => saveGameState(), 100);
  }, [ups, currentHole, holes, pars, scores, activePlayers, gameMode, calculateWin123, saveGameState]);

  // proceedToNextHole中Win123逻辑修改
  const proceedToNextHole = useCallback(() => {
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const currentHoleScores = {};
    const currentHoleUps = {};
    
    activePlayers.forEach(player => {
      currentHoleScores[player] = scores[player] || par;
      currentHoleUps[player] = ups[player] || false;
    });
    
    const newAllScores = { ...allScores };
    const newAllUps = { ...allUps };
    
    activePlayers.forEach(player => {
      if (!newAllScores[player]) newAllScores[player] = {};
      if (!newAllUps[player]) newAllUps[player] = {};
      newAllScores[player][holeNum] = currentHoleScores[player];
      newAllUps[player][holeNum] = currentHoleUps[player];
    });
    
    setAllScores(newAllScores);
    setAllUps(newAllUps);
    
    const stakeValue = Number(stake) || 0;
    let finalPrizePool = prizePool;
    
    if (stakeValue > 0 || gameMode === 'skins') {
      if (gameMode === 'matchPlay') {
        const settlement = calculateMatchPlay(currentHoleScores, holeNum);
        
        const newTotalMoney = { ...totalMoney };
        activePlayers.forEach(player => {
          newTotalMoney[player] = (newTotalMoney[player] || 0) + settlement[player].money;
        });
        setTotalMoney(newTotalMoney);
        
      } else if (gameMode === 'skins') {
        const { results, poolChange } = calculateSkins(currentHoleScores, holeNum);
        
        const newTotalMoney = { ...totalMoney };
        const newDetails = { ...moneyDetails };
        const newSpent = { ...totalSpent };
        
        activePlayers.forEach(player => {
          newSpent[player] = (newSpent[player] || 0) + (results[player].spent || 0);
          newTotalMoney[player] = (newTotalMoney[player] || 0) + results[player].money;
          
          if (results[player].fromPool) {
            newDetails[player].fromPool += results[player].fromPool;
          }
        });
        
        setTotalMoney(newTotalMoney);
        setMoneyDetails(newDetails);
        setTotalSpent(newSpent);
        finalPrizePool = prizePool + poolChange;
        setPrizePool(finalPrizePool);
        
      } else if (gameMode === 'win123') {
        const { results, poolChange } = calculateWin123(currentHoleScores, currentHoleUps, holeNum);
        
        const newTotalMoney = { ...totalMoney };
        const newDetails = { ...moneyDetails };
        
        activePlayers.forEach(player => {
          newTotalMoney[player] = (newTotalMoney[player] || 0) + results[player].money;
          if (results[player].fromPool) {
            newDetails[player].fromPool = (newDetails[player].fromPool || 0) + results[player].fromPool;
          }
        });
        
        setTotalMoney(newTotalMoney);
        setMoneyDetails(newDetails);
        finalPrizePool = prizePool + poolChange;
        setPrizePool(finalPrizePool);
      }
    }
    
    setCompletedHoles([...completedHoles, holeNum]);
    
    if (currentHole >= holes.length - 1) {
      setGameComplete(true);
      showToast(t('gameOver'));
      setCurrentSection('scorecard');
      clearSavedGame();
    } else {
      setCurrentHole(currentHole + 1);
      setScores({});
      setUps({});
      setCurrentHoleSettlement(null);
      setTimeout(() => saveGameState(), 100);
    }
    
    setHoleConfirmDialog({ isOpen: false, action: null });
    setPendingRankings(null);
    
    if (!gameComplete && currentHole < holes.length - 1) {
      setTimeout(() => saveGameState(), 100);
    }
  }, [currentHole, holes, scores, ups, activePlayers, allScores, allUps, gameMode, totalMoney, moneyDetails, completedHoles, prizePool, pars, stake, calculateMatchPlay, calculateSkins, calculateWin123, showToast, t, clearSavedGame, saveGameState, gameComplete, totalSpent]);

  // 显示确认对话框
  const nextHole = useCallback(() => {
    if (gameMode === 'win123') {
      const holeNum = holes[currentHole];
      const par = pars[holeNum] || 4;
      const currentHoleScores = {};
      const currentHoleUps = {};
      
      activePlayers.forEach(player => {
        currentHoleScores[player] = scores[player] || par;
        currentHoleUps[player] = ups[player] || false;
      });
      
      const { rankings } = calculateWin123(currentHoleScores, currentHoleUps, holeNum);
      setPendingRankings(rankings);
    }
    setHoleConfirmDialog({ 
      isOpen: true, 
      action: proceedToNextHole
    });
  }, [gameMode, currentHole, holes, scores, ups, activePlayers, pars, calculateWin123, proceedToNextHole]);

  // 返回上一洞
  const prevHole = useCallback(() => {
    if (currentHole === 0) return;
    
    showConfirm(t('confirmPrev'), () => {
      const prevHoleIndex = currentHole - 1;
      const prevHoleNum = holes[prevHoleIndex];
      
      const prevScores = {};
      const prevUps = {};
      
      activePlayers.forEach(player => {
        if (allScores[player] && allScores[player][prevHoleNum]) {
          prevScores[player] = allScores[player][prevHoleNum];
        }
        if (allUps[player] && allUps[player][prevHoleNum]) {
          prevUps[player] = allUps[player][prevHoleNum];
        }
      });
      
      setScores(prevScores);
      setUps(prevUps);
      
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
        for (let i = 0; i < prevHoleIndex; i++) {
          const holeNum = holes[i];
          const holeScores = {};
          const holeUps = {};
          
          activePlayers.forEach(player => {
            holeScores[player] = allScores[player]?.[holeNum] || (pars[holeNum] || 4);
            holeUps[player] = allUps[player]?.[holeNum] || false;
          });
          
          if (gameMode === 'matchPlay') {
            const settlement = calculateMatchPlay(holeScores, holeNum);
            activePlayers.forEach(player => {
              newTotalMoney[player] += settlement[player].money;
            });
          } else if (gameMode === 'skins') {
            const calculateSkinsForPrevHole = (holeScores, holeNum, currentPool) => {
              const stakeValue = Number(stake) || 0;
              const par = pars[holeNum] || 4;
              
              const playerScores = activePlayers.map(p => ({
                player: p,
                score: holeScores[p] || par,
                netScore: (holeScores[p] || par) - getHandicapForHole(p, par)
              }));
              
              playerScores.sort((a, b) => a.netScore - b.netScore);
              const minScore = playerScores[0].netScore;
              const winners = playerScores.filter(p => p.netScore === minScore);
              
              const results = {};
              let poolChange = 0;
              
              activePlayers.forEach(player => {
                results[player] = { 
                  money: -stakeValue,
                  fromPool: 0,
                  spent: stakeValue
                };
              });
              
              const holeStake = stakeValue * activePlayers.length;
              
              if (winners.length === 1) {
                const winner = winners[0].player;
                const winAmount = currentPool + holeStake;
                results[winner].money = winAmount - stakeValue;
                results[winner].fromPool = currentPool;
                poolChange = -currentPool;
              } else {
                poolChange = holeStake;
              }
              
              return { results, poolChange };
            };
            
            const { results, poolChange } = calculateSkinsForPrevHole(holeScores, holeNum, newPrizePool);
            activePlayers.forEach(player => {
              newSpent[player] += results[player].spent || 0;
              newTotalMoney[player] += results[player].money;
              newDetails[player].fromPool += results[player].fromPool;
            });
            newPrizePool += poolChange;
          } else if (gameMode === 'win123') {
            const { results, poolChange } = calculateWin123(holeScores, holeUps, holeNum);
            activePlayers.forEach(player => {
              newTotalMoney[player] += results[player].money;
              if (results[player].fromPool) {
                newDetails[player].fromPool += results[player].fromPool;
              }
            });
            newPrizePool += poolChange;
          }
        }
      }
      
      setTotalMoney(newTotalMoney);
      setMoneyDetails(newDetails);
      setTotalSpent(newSpent);
      if (gameMode === 'win123' || gameMode === 'skins') {
        setPrizePool(newPrizePool);
      }
      
      setCompletedHoles(completedHoles.filter(h => h !== prevHoleNum));
      setCurrentHole(prevHoleIndex);
      setCurrentHoleSettlement(null);
      
      setConfirmDialog({ isOpen: false, message: '', action: null, showScreenshotHint: false });
    });
  }, [currentHole, holes, activePlayers, allScores, allUps, completedHoles, gameMode, pars, stake, calculateMatchPlay, calculateSkins, calculateWin123, showConfirm, t]);

  const goHome = useCallback(() => {
    const resetGame = () => {
      setCurrentSection('home');
      setGameMode('matchPlay');
      setPlayerNames(['', '', '', '']);
      setStake('');
      setPrizePool('');
      setHandicap('off');
      setPlayerHandicaps({});
      setCourseType('f18');
      setHoles(courses.f18);
      setPars(courses.f18.reduce((acc, hole) => ({...acc, [hole]: 4}), {}));
      setCurrentHole(0);
      setScores({});
      setUps({});
      setAllScores({});
      setAllUps({});
      setTotalMoney({});
      setMoneyDetails({});
      setTotalSpent({});
      setCompletedHoles([]);
      setGameComplete(false);
      setCurrentHoleSettlement(null);
      
      clearSavedGame();
    };

    if (gameComplete) {
      resetGame();
    } else {
      resetGame();
    }
  }, [gameComplete, clearSavedGame]);

  // 渲染界面
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航 - 只在首页显示语言切换 */}
      {currentSection === 'home' && (
        <div className="flex justify-end items-center p-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium shadow-sm"
          >
            {t('switchLang')}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto p-3">
          
          {/* 首页 */}
          {currentSection === 'home' && (
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
                <button
                  onClick={() => setCurrentSection('course')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {t('create')}
                </button>
                
                {hasUnfinishedGame && (
                  <button
                    onClick={loadGameState}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    {t('continueGame')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 球场设置页面 */}
          {currentSection === 'course' && (
            <div className="space-y-4 py-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {t('gameType')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(courses).map(type => (
                    <button
                      key={type}
                      onClick={() => setCourse(type)}
                      className={`p-2 rounded-lg border transition transform hover:scale-105 ${
                        courseType === type
                          ? 'bg-green-600 text-white border-green-600 shadow-md'
                          : 'bg-gray-50 text-gray-900 border-gray-200 hover:border-green-300 hover:shadow-sm'
                      }`}
                    >
                      <h4 className="font-semibold text-xs">{t(type)}</h4>
                      <p className="text-xs opacity-80" style={{ fontSize: '10px' }}>
                        {t(`${type}Desc`)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('setPar')}</h3>
                
                {(courseType === 'f18' || courseType === 'b18') ? (
                  <div className="grid grid-cols-2 gap-3">
                    {getVerticalArrangedHoles().map((pair, index) => (
                      <React.Fragment key={index}>
                        {pair[0] && (
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 min-w-[40px]">
                              {lang === 'zh' ? `${pair[0]}洞` : `H${pair[0]}`}
                            </span>
                            <div className="flex gap-1">
                              {[3, 4, 5].map(par => (
                                <button
                                  key={par}
                                  onClick={() => setPar(pair[0], par)}
                                  className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${
                                    pars[pair[0]] === par
                                      ? 'bg-green-600 text-white shadow-sm'
                                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {par}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {pair[1] ? (
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 min-w-[40px]">
                              {lang === 'zh' ? `${pair[1]}洞` : `H${pair[1]}`}
                            </span>
                            <div className="flex gap-1">
                              {[3, 4, 5].map(par => (
                                <button
                                  key={par}
                                  onClick={() => setPar(pair[1], par)}
                                  className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${
                                    pars[pair[1]] === par
                                      ? 'bg-green-600 text-white shadow-sm'
                                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {par}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1">
                    {holes.map(hole => (
                      <div key={hole} className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-900">
                          {t('hole')} {hole}
                        </span>
                        <div className="flex gap-1">
                          {[3, 4, 5].map(par => (
                            <button
                              key={par}
                              onClick={() => setPar(hole, par)}
                              className={`w-8 h-8 rounded font-bold text-sm transition-all ${
                                pars[hole] === par
                                  ? 'bg-green-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300'
                              }`}
                            >
                              {par}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-2 pt-2 border-t text-center">
                  <span className="text-sm text-gray-600">{t('par')}: </span>
                  <span className="text-lg font-bold text-green-600">{calculateTotalPar()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentSection('home')}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  {t('back')}
                </button>
                <button
                  onClick={confirmCourse}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
                >
                  {t('confirmCourse')}
                </button>
              </div>
            </div>
          )}

          {/* 玩家设置页面 */}
          {currentSection === 'players' && (
            <div className="space-y-4 py-3">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('playerTitle')}
                </h2>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('players')}
                </h3>
                <div className="space-y-3">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">
                        {t(`player${i + 1}`)}:
                      </label>
                      <PlayerInput
                        index={i}
                        value={playerNames[i]}
                        placeholder={t('enterName')}
                        onChange={updatePlayerName}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      {t('gameMode')}:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setGameMode('matchPlay')}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1 ${
                          gameMode === 'matchPlay'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Trophy className="w-4 h-4" />
                        <span style={{ fontSize: '12px' }}>{t('matchPlay')}</span>
                      </button>
                      <button
                        onClick={() => setGameMode('win123')}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1 ${
                          gameMode === 'win123'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span style={{ fontSize: '12px' }}>{t('win123')}</span>
                      </button>
                      <button
                        onClick={() => setGameMode('skins')}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1 ${
                          gameMode === 'skins'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <CircleDollarSign className="w-4 h-4" />
                        <span style={{ fontSize: '12px' }}>{t('skins')}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      {t('stake')}:
                    </label>
                    <input
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      placeholder={t('enterStake')}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">
                      {t('handicap')}:
                    </label>
                    <div className="flex rounded-md border border-gray-300 overflow-hidden">
                      <button
                        onClick={() => setHandicap('off')}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          handicap === 'off'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('off')}
                      </button>
                      <button
                        onClick={() => setHandicap('on')}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          handicap === 'on'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('on')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {handicap === 'on' && activePlayers.length > 0 && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t('handicapSettings')}
                  </h3>
                  {activePlayers.map(playerName => (
                    <HandicapRow
                      key={playerName}
                      playerName={playerName}
                      handicaps={playerHandicaps[playerName] || {}}
                      onChange={updatePlayerHandicap}
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentSection('course')}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  {t('back')}
                </button>
                <button
                  onClick={startGame}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
                >
                  {t('start')}
                </button>
              </div>
            </div>
          )}

          {/* 成绩卡页面 */}
          {currentSection === 'scorecard' && (
            <div className="space-y-3 py-3">
              <div className="relative">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('scorecardTitle')}
                  </h2>
                </div>
              </div>

              {(() => {
                const hasData = completedHoles.length > 0;
                const frontNine = holes.filter(h => h <= 9 && completedHoles.includes(h));
                const backNine = holes.filter(h => h > 9 && completedHoles.includes(h));
                
                const calculateTotal = (player, holesList) => {
                  return holesList.reduce((total, hole) => {
                    const score = allScores[player]?.[hole];
                    return total + (score || 0);
                  }, 0);
                };
                
                const calculateParTotal = (holesList) => {
                  return holesList.reduce((total, hole) => {
                    return total + (pars[hole] || 4);
                  }, 0);
                };
                
                const totalPar = calculateParTotal(completedHoles);
                const playerTotals = {};
                activePlayers.forEach(player => {
                  playerTotals[player] = calculateTotal(player, completedHoles);
                });
                
                return (
                  <>
                    {gameComplete && hasData && (
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">
                          {t('totalScore')} ({t('standardPar')}: {totalPar})
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {activePlayers.map(player => {
                            const total = playerTotals[player];
                            const diff = total - totalPar;
                            const diffText = diff > 0 ? `+${diff}` : diff === 0 ? 'E' : `${diff}`;
                            const diffColor = diff > 0 ? 'text-red-600' : diff === 0 ? 'text-gray-600' : 'text-green-600';
                            
                            return (
                              <div key={player} className="text-center p-2 bg-gray-50 rounded">
                                <div className="text-xs font-medium text-gray-700">{player}</div>
                                <div className="flex items-baseline justify-center gap-1">
                                  <span className="text-xl font-bold text-gray-900">{total || '-'}</span>
                                  {total > 0 && (
                                    <span className={`text-xs font-semibold ${diffColor}`}>
                                      ({diffText})
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {hasData ? (
                      <>
                        {frontNine.length > 0 && (
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <table className="w-full" style={{ fontSize: '10px' }}>
                              <thead>
                                <tr className="bg-green-600 text-white">
                                  <th className="px-1 py-1 text-left font-semibold" style={{ minWidth: '35px' }}>
                                    {t('out')}
                                  </th>
                                  {frontNine.map(hole => (
                                    <th key={hole} className="px-0 py-1 text-center font-semibold" style={{ minWidth: '20px' }}>
                                      {hole}
                                    </th>
                                  ))}
                                  <th className="px-1 py-1 text-center font-semibold" style={{ minWidth: '25px' }}>
                                    {t('total')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-gray-50">
                                  <td className="px-1 py-1 font-semibold text-gray-900">{t('par')}</td>
                                  {frontNine.map(hole => (
                                    <td key={hole} className="px-0 py-1 text-center text-gray-900">
                                      {pars[hole] || 4}
                                    </td>
                                  ))}
                                  <td className="px-1 py-1 text-center font-bold text-gray-900">
                                    {calculateParTotal(frontNine)}
                                  </td>
                                </tr>
                                {activePlayers.map((player, index) => (
                                  <tr key={player} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-1 py-1 font-semibold text-gray-900 truncate" style={{ fontSize: '9px' }}>
                                      {player}
                                    </td>
                                    {frontNine.map(hole => {
                                      const score = allScores[player]?.[hole];
                                      const par = pars[hole] || 4;
                                      const handicapValue = getHandicapForHole(player, par);
                                      const netScore = score ? score - handicapValue : null;
                                      
                                      return (
                                        <td key={hole} className="px-0 py-1 text-center">
                                          {score ? (
                                            <div>
                                              <ScoreDisplay score={score} par={par} />
                                              {!gameComplete && handicap === 'on' && handicapValue > 0 && (
                                                <div style={{ fontSize: '8px', color: '#059669' }}>
                                                  ({netScore})
                                                </div>
                                              )}
                                            </div>
                                          ) : '-'}
                                        </td>
                                      );
                                    })}
                                    <td className="px-1 py-1 text-center font-bold text-gray-900">
                                      {calculateTotal(player, frontNine) || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {backNine.length > 0 && (
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <table className="w-full" style={{ fontSize: '10px' }}>
                              <thead>
                                <tr className="bg-green-600 text-white">
                                  <th className="px-1 py-1 text-left font-semibold" style={{ minWidth: '35px' }}>
                                    {t('in')}
                                  </th>
                                  {backNine.map(hole => (
                                    <th key={hole} className="px-0 py-1 text-center font-semibold" style={{ minWidth: '20px' }}>
                                      {hole}
                                    </th>
                                  ))}
                                  <th className="px-1 py-1 text-center font-semibold" style={{ minWidth: '25px' }}>
                                    {t('total')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-gray-50">
                                  <td className="px-1 py-1 font-semibold text-gray-900">{t('par')}</td>
                                  {backNine.map(hole => (
                                    <td key={hole} className="px-0 py-1 text-center text-gray-900">
                                      {pars[hole] || 4}
                                    </td>
                                  ))}
                                  <td className="px-1 py-1 text-center font-bold text-gray-900">
                                    {calculateParTotal(backNine)}
                                  </td>
                                </tr>
                                {activePlayers.map((player, index) => (
                                  <tr key={player} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-1 py-1 font-semibold text-gray-900 truncate" style={{ fontSize: '9px' }}>
                                      {player}
                                    </td>
                                    {backNine.map(hole => {
                                      const score = allScores[player]?.[hole];
                                      const par = pars[hole] || 4;
                                      const handicapValue = getHandicapForHole(player, par);
                                      const netScore = score ? score - handicapValue : null;
                                      
                                      return (
                                        <td key={hole} className="px-0 py-1 text-center">
                                          {score ? (
                                            <div>
                                              <ScoreDisplay score={score} par={par} />
                                              {!gameComplete && handicap === 'on' && handicapValue > 0 && (
                                                <div style={{ fontSize: '8px', color: '#059669' }}>
                                                  ({netScore})
                                                </div>
                                              )}
                                            </div>
                                          ) : '-'}
                                        </td>
                                      );
                                    })}
                                    <td className="px-1 py-1 text-center font-bold text-gray-900">
                                      {calculateTotal(player, backNine) || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-blue-700 text-sm">{t('noScoreData')}</p>
                      </div>
                    )}
                  </>
                );
              })()}

              {(gameComplete || completedHoles.length === holes.length) && (Number(stake) > 0 || (gameMode === 'skins' && prizePool > 0)) && (
                <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                    {t('finalSettlement')}
                  </h3>
                  {(gameMode === 'skins' || gameMode === 'win123') && prizePool > 0 && (
                    <div className="mb-3 text-center p-2 bg-purple-100 rounded">
                      <span className="text-sm text-purple-700">
                        {gameMode === 'win123' ? t('penaltyPot') : t('carryOverPool')}: 
                      </span>
                      <span className="text-lg font-bold text-purple-800 ml-2">
                        ${prizePool}
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {activePlayers.map(player => {
                      const amount = totalMoney[player] || 0;
                      
                      return (
                        <div key={player} className="border-b border-yellow-200 last:border-b-0 pb-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">{player}</span>
                            <span className={`font-bold ${
                              amount > 0 ? 'text-green-600' : amount < 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!gameComplete ? (
                  <button
                    onClick={() => setCurrentSection('game')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                  >
                    {t('resume')}
                  </button>
                ) : (
                  <div className="w-full">
                    <button
                      onClick={goHome}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Home className="w-5 h-5" />
                      {t('backToHome')}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {lang === 'zh' ? '所有比赛数据将被清除' : 'All game data will be cleared'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 游戏进行页面 */}
      {currentSection === 'game' && (
        <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white">
          <div className="bg-green-800 bg-opacity-50 text-center pt-6 pb-3 relative">
            <h1 className="text-2xl font-bold mb-2">
              {t('hole')} {holes[currentHole]} (PAR {pars[holes[currentHole]] || 4})
            </h1>
            {Number(stake) > 0 && (
              <div className="text-base">
                {t('stake')}: ${Number(stake)} 
                {(gameMode === 'skins' || gameMode === 'win123') && (
                  <span className="ml-4">
                    {gameMode === 'win123' ? t('penaltyPot') : t('poolBalance')}: ${gameMode === 'skins' ? prizePool + (Number(stake) || 0) * activePlayers.length : prizePool}
                  </span>
                )}
              </div>
            )}
            {!gameComplete && completedHoles.length < holes.length && (
              <button
                onClick={() => {
                  const message = lang === 'zh' 
                    ? '确定要终止比赛吗？\n未完成的洞将不计入成绩' 
                    : 'End the game now?\nIncomplete holes will not be counted';
                  showConfirm(message, () => {
                    setGameComplete(true);
                    clearSavedGame();
                    showToast(t('gameOver'));
                    setCurrentSection('scorecard');
                  }, true);
                }}
                className="absolute top-4 right-4 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition"
              >
                {lang === 'zh' ? '终止' : 'End'}
              </button>
            )}
          </div>

          <div className="bg-white text-gray-900 p-3">
            <div className="grid gap-3">
              {activePlayers.map(player => {
                const holeNum = holes[currentHole];
                const par = pars[holeNum] || 4;
                const playerScore = scores[player] || par;
                const playerUp = ups[player] || false;
                const playerHandicapValue = getHandicapForHole(player, par);
                const netScore = playerScore - playerHandicapValue;
                const scoreLabel = getScoreLabel(netScore, par);
                
                return (
                  <div key={player} className="bg-gray-50 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base text-gray-900">{player}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${scoreLabel.class}`}>
                            {scoreLabel.text}
                          </span>
                          {handicap === 'on' && playerHandicapValue > 0 && (
                            <span className="text-xs text-green-600">
                              {t('netScore')}: {netScore}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeScore(player, -1)}
                          className="w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-sm transition"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center min-w-[60px]">
                          <div className="text-3xl font-bold text-gray-900">{playerScore}</div>
                        </div>
                        
                        <button
                          onClick={() => changeScore(player, 1)}
                          className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-sm transition"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {gameMode === 'win123' && Number(stake) > 0 && (
                        <div className="ml-3">
                          <button
                            onClick={() => toggleUp(player)}
                            className={`px-4 py-2 rounded-md font-medium text-sm relative transition ${
                              playerUp
                                ? 'bg-yellow-400 text-yellow-900'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <TrendingUp className="inline w-3 h-3 mr-1" />
                            UP
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {Number(stake) > 0 && currentHoleSettlement && gameMode === 'win123' && (
            <div className="bg-orange-50 text-gray-900 p-3">
              <h3 className="text-center font-semibold mb-2 text-sm">{t('holeSettlement')}</h3>
              <div className={`grid gap-2 ${
                activePlayers.length <= 2 ? 'grid-cols-2' :
                activePlayers.length === 3 ? 'grid-cols-3' :
                'grid-cols-2'
              }`}>
                {activePlayers.map(player => {
                  const amount = currentHoleSettlement[player]?.money || 0;
                  return (
                    <div key={player} className="bg-white p-2 rounded-md text-center">
                      <div className="text-xs font-medium truncate">{player}</div>
                      <div className={`text-sm font-bold ${
                        amount > 0 ? 'text-green-600' : 
                        amount < 0 ? 'text-red-600' : 
                        'text-gray-500'
                      }`}>
                        {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Number(stake) > 0 && currentHoleSettlement && gameMode === 'matchPlay' && (
            <div className="bg-orange-50 text-gray-900 p-3">
              <h3 className="text-center font-semibold mb-2 text-sm">{t('holeSettlement')}</h3>
              <div className={`grid gap-2 ${
                activePlayers.length <= 2 ? 'grid-cols-2' :
                activePlayers.length === 3 ? 'grid-cols-3' :
                'grid-cols-2'
              }`}>
                {activePlayers.map(player => {
                  const amount = currentHoleSettlement[player]?.money || 0;
                  return (
                    <div key={player} className="bg-white p-2 rounded-md text-center">
                      <div className="text-xs font-medium truncate">{player}</div>
                      <div className={`text-sm font-bold ${
                        amount > 0 ? 'text-green-600' : 
                        amount < 0 ? 'text-red-600' : 
                        'text-gray-500'
                      }`}>
                        {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Number(stake) > 0 && (gameMode === 'matchPlay' || gameMode === 'win123' || gameMode === 'skins') && (
            <div className="bg-blue-50 text-gray-900 p-3">
              <h3 className="text-center font-semibold mb-2 text-sm">{t('currentMoney')}</h3>
              <div className={`grid gap-2 ${
                activePlayers.length <= 2 ? 'grid-cols-2' :
                activePlayers.length === 3 ? 'grid-cols-3' :
                'grid-cols-2'
              }`}>
                {activePlayers.map(player => {
                  const amount = totalMoney[player] || 0;
                  
                  return (
                    <div key={player} className="bg-white p-2 rounded-md">
                      <div className="text-xs font-medium text-center truncate">{player}</div>
                      <div className={`text-sm font-bold text-center ${
                        amount > 0 ? 'text-green-600' : 
                        amount < 0 ? 'text-red-600' : 
                        'text-gray-500'
                      }`}>
                        {gameMode === 'win123' ? (
                          <>
                            {t('totalLoss')}: {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                          </>
                        ) : (
                          <>
                            {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white p-3">
            <div className="flex gap-2">
              <button
                onClick={nextHole}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
              >
                {currentHole === holes.length - 1 ? t('finishRound') : t('nextHole')}
              </button>
              <button
                onClick={() => setCurrentSection('scorecard')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={prevHole}
                disabled={currentHole === 0}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, message: '', action: null, showScreenshotHint: false })}
        onConfirm={() => {
          if (confirmDialog.action) confirmDialog.action();
        }}
        message={confirmDialog.message}
        t={t}
        showScreenshotHint={confirmDialog.showScreenshotHint}
      />

      <HoleScoreConfirmDialog
        isOpen={holeConfirmDialog.isOpen}
        onClose={() => {
          setHoleConfirmDialog({ isOpen: false, action: null });
          setPendingRankings(null);
        }}
        onConfirm={() => {
          if (holeConfirmDialog.action) holeConfirmDialog.action();
        }}
        hole={holes[currentHole]}
        players={activePlayers}
        scores={scores}
        rankings={pendingRankings}
        gameMode={gameMode}
        getHandicapForHole={getHandicapForHole}
        pars={pars}
        t={t}
        stake={stake}
        prizePool={prizePool}
        activePlayers={activePlayers}
      />
    </div>
  );
}

export default IntegratedGolfGame;