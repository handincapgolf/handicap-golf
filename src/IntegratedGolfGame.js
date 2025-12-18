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
  Target,
  Camera,
  CircleDollarSign,
  Search,
  MapPin,
  Edit2,
  Droplets
} from 'lucide-react';

// 球场数据库
const GOLF_COURSES = {

  "VILLEA_ROMPIN_RESORT_&_GOLF": {
    shortName: "VRRG",
    fullName: "Villea Rompin Resort & Golf",
    location: ["Rompin", "Pahang", "Malaysia"],
    pars: [4,4,4,4,3,5,3,5,4, 4,5,3,4,4,4,4,3,5],
    blueTees: null,
    whiteTees: null,
    redTees: null
  }
};

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

const HoleScoreConfirmDialog = memo(({ isOpen, onClose, onConfirm, hole, players, scores, rankings, gameMode, getHandicapForHole, pars, t, stake, prizePool, activePlayers }) => {
  if (!isOpen || !players) return null;

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

// 洞号选择弹窗
const HoleSelectDialog = memo(({ isOpen, onClose, completedHoles = [], onSelect, t, pars = {} }) => {
  if (!isOpen || !completedHoles || completedHoles.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-5 max-w-xs w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {t('selectHoleToEdit')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
<div className="grid grid-cols-5 gap-2 mb-4">
  {completedHoles.map(hole => {
    const par = pars[hole] || 4;
    const colorClass = par === 3 
      ? 'bg-yellow-300 hover:bg-yellow-400 text-yellow-900' 
      : par === 5 
        ? 'bg-orange-300 hover:bg-orange-400 text-orange-900' 
        : 'bg-gray-300 hover:bg-gray-400 text-gray-900';
    
    return (
      <button
        key={hole}
        onClick={() => { onSelect(hole); onClose(); }}
        className={`w-12 h-12 ${colorClass} rounded-lg font-bold text-lg transition`}
      >
        {hole}
      </button>
    );
  })}
</div>
        
        <button 
          onClick={onClose} 
          className="w-full px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
});

// 编辑洞成绩弹窗
const EditHoleDialog = memo(({ isOpen, onClose, hole, players = [], allScores = {}, allUps = {}, pars = {}, onSave, t, gameMode }) => {
  const [editScores, setEditScores] = useState({});
  const [editUps, setEditUps] = useState({});

  useEffect(() => {
    if (isOpen && hole && players.length > 0) {
      const initialScores = {};
      const initialUps = {};
      players.forEach(p => {
        initialScores[p] = allScores[p]?.[hole] || pars[hole] || 4;
        initialUps[p] = allUps[p]?.[hole] || false;
      });
      setEditScores(initialScores);
      setEditUps(initialUps);
    }
  }, [isOpen, hole, players, allScores, allUps, pars]);

  if (!isOpen || !hole || !players || players.length === 0) return null;

  const par = pars[hole] || 4;

  const changeScore = (player, delta) => {
    setEditScores(prev => ({
      ...prev,
      [player]: Math.max(1, (prev[player] || par) + delta)
    }));
  };

  const toggleUp = (player) => {
    setEditUps(prev => ({
      ...prev,
      [player]: !prev[player]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-5 max-w-sm w-full shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {t('editHole')} {hole} (PAR {par})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3 mb-4">
          {players.map(player => (
            <div key={player} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{player}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeScore(player, -1)}
                    className="w-9 h-9 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-bold w-10 text-center">{editScores[player]}</span>
                  <button
                    onClick={() => changeScore(player, 1)}
                    className="w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {gameMode === 'win123' && (
                    <button
                      onClick={() => toggleUp(player)}
                      className={`ml-2 px-3 py-1.5 rounded-md font-medium text-xs transition ${
                        editUps[player]
                          ? 'bg-yellow-400 text-yellow-900'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      UP
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
          >
            {t('cancel')}
          </button>
          <button
            onClick={() => { onSave(hole, editScores, editUps); onClose(); }}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
});

// ========== 在 EditHoleDialog 组件之后添加以下两个组件 ==========

// ========== Advance Mode 报告卡片组件 ==========
const AdvanceReportCard = memo(({ player, rank, onClose, onViewFull, allScores, allPutts, allWater, allOb, allUps, pars, completedHoles, gameMode, t, getMedal }) => {
  const details = completedHoles.map(hole => ({
    hole,
    par: pars[hole] || 4,
    score: allScores[player]?.[hole] || (pars[hole] || 4),
    putts: allPutts[player]?.[hole] || 0,
    water: allWater[player]?.[hole] || 0,
    ob: allOb[player]?.[hole] || 0,
    up: allUps[player]?.[hole] || false
  }));

  const totalPar = completedHoles.reduce((sum, h) => sum + (pars[h] || 4), 0);
  const playerTotal = details.reduce((sum, d) => sum + d.score, 0);
  const playerDiff = playerTotal - totalPar;
  const diffText = playerDiff > 0 ? `+${playerDiff}` : playerDiff === 0 ? 'E' : `${playerDiff}`;
  
  const front9Details = details.filter(d => d.hole <= 9);
  const back9Details = details.filter(d => d.hole > 9);
  const front9Score = front9Details.reduce((sum, d) => sum + d.score, 0);
  const back9Score = back9Details.reduce((sum, d) => sum + d.score, 0);
  
  const totalPutts = details.reduce((sum, d) => sum + d.putts, 0);
  const totalWater = details.reduce((sum, d) => sum + d.water, 0);
  const totalOb = details.reduce((sum, d) => sum + d.ob, 0);
  const totalUp = details.filter(d => d.up).length;
  const avgPutts = details.length > 0 ? (totalPutts / details.length).toFixed(1) : '0';
  const onePutts = details.filter(d => d.putts === 1).length;
  const threePutts = details.filter(d => d.putts >= 3).length;

  const birdies = details.filter(d => d.score - d.par === -1).length;
  const parsCount = details.filter(d => d.score - d.par === 0).length;
  const bogeys = details.filter(d => d.score - d.par === 1).length;
  const doubles = details.filter(d => d.score - d.par >= 2).length;

  const isWin123 = gameMode === 'win123';

  const getScoreBgColor = (score, par) => {
    const diff = score - par;
    if (diff <= -2) return 'bg-purple-500';
    if (diff === -1) return 'bg-blue-500';
    if (diff === 0) return 'bg-gray-400';
    if (diff === 1) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative flex flex-col bg-white m-3 mt-10 mb-3 rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: 'calc(100vh - 52px)', animation: 'cardAppear 0.25s ease-out' }}>
        
        {/* Header */}
        <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getMedal(rank)}</span>
            <span className="font-bold text-lg">{player} {t('reportTitle')}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 text-lg">✕</button>
        </div>

        {/* 可滚动内容区 */}
        <div className="overflow-auto flex-1 p-3 space-y-3">
          {/* 总成绩 */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">{playerTotal}</span>
              <span className={`px-2 py-1 rounded text-sm font-bold ${playerDiff > 0 ? 'bg-red-100 text-red-600' : playerDiff === 0 ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                {diffText}
              </span>
            </div>
            <div className="text-right text-sm text-gray-500">
              {front9Details.length > 0 && <div>{t('front9')}: <span className="font-semibold text-gray-700">{front9Score}</span></div>}
              {back9Details.length > 0 && <div>{t('back9')}: <span className="font-semibold text-gray-700">{back9Score}</span></div>}
            </div>
          </div>

          {/* 成绩分布 */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="text-sm font-semibold text-gray-500 mb-2">🎯 {t('scoreDistribution')}</div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{birdies}</div>
                <div className="text-xs text-gray-500">Birdie</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-600">{parsCount}</div>
                <div className="text-xs text-gray-500">Par</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">{bogeys}</div>
                <div className="text-xs text-gray-500">Bogey</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">{doubles}</div>
                <div className="text-xs text-gray-500">Double+</div>
              </div>
            </div>
          </div>

          {/* 推杆分析 */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="text-sm font-semibold text-gray-500 mb-2">📊 {t('puttingAnalysis')}</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-800">{totalPutts}</div>
                <div className="text-xs text-gray-500">{t('totalPutts')}</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{avgPutts}</div>
                <div className="text-xs text-gray-500">{t('avgPerHole')}</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{onePutts}</div>
                <div className="text-xs text-gray-500">{t('onePutt')}</div>
              </div>
            </div>
            {threePutts > 0 && (
              <div className="mt-2 text-center text-sm text-red-500">
                ⚠️ {t('threePutts')}: {threePutts}{t('holes')}
              </div>
            )}
          </div>

          {/* 罚杆统计 */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="text-sm font-semibold text-gray-500 mb-2">⚠️ {t('penaltyStats')}</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-cyan-50 rounded-lg p-2 flex items-center justify-between">
                <div className="text-cyan-600 text-sm">💧 {t('waterHazard')}</div>
                <div className="text-xl font-bold text-cyan-600">{totalWater}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2 flex items-center justify-between">
                <div className="text-yellow-600 text-sm">OB</div>
                <div className="text-xl font-bold text-yellow-600">{totalOb}</div>
              </div>
            </div>
          </div>

          {/* UP统计 - 仅Win123显示 */}
          {isWin123 && (
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="text-sm font-semibold text-gray-500 mb-2">⬆️ UP{t('stats')}</div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">UP{t('attempts')}</span>
                <span className="text-xl font-bold text-green-600">{totalUp}{t('times')}</span>
              </div>
            </div>
          )}

          {/* 逐洞成绩格子 */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="text-sm font-semibold text-gray-500 mb-2">📋 {t('holeByHole')}</div>
            {front9Details.length > 0 && (
              <>
                <div className="text-xs text-gray-400 mb-1">{t('front9')} OUT</div>
                <div className="grid grid-cols-9 gap-1 mb-2">
                  {front9Details.map(d => (
                    <div key={d.hole} className={`aspect-square ${getScoreBgColor(d.score, d.par)} text-white rounded flex items-center justify-center text-xs font-bold`}>
                      {d.score}
                    </div>
                  ))}
                </div>
              </>
            )}
            {back9Details.length > 0 && (
              <>
                <div className="text-xs text-gray-400 mb-1">{t('back9')} IN</div>
                <div className="grid grid-cols-9 gap-1">
                  {back9Details.map(d => (
                    <div key={d.hole} className={`aspect-square ${getScoreBgColor(d.score, d.par)} text-white rounded flex items-center justify-center text-xs font-bold`}>
                      {d.score}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 查看完整明细按钮 */}
        <div className="flex-shrink-0 p-3 border-t bg-white" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button 
            onClick={onViewFull}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            {t('viewFullDetail')} →
          </button>
        </div>
      </div>
    </div>
  );
});

// ========== Advance Mode 完整明细弹窗 ==========
const AdvanceFullDetailModal = memo(({ player, rank, onClose, onBack, allScores, allPutts, allWater, allOb, allUps, pars, completedHoles, gameMode, t, getMedal }) => {
  const details = completedHoles.map(hole => ({
    hole,
    par: pars[hole] || 4,
    score: allScores[player]?.[hole] || (pars[hole] || 4),
    putts: allPutts[player]?.[hole] || 0,
    water: allWater[player]?.[hole] || 0,
    ob: allOb[player]?.[hole] || 0,
    up: allUps[player]?.[hole] || false
  }));

  const totalPar = completedHoles.reduce((sum, h) => sum + (pars[h] || 4), 0);
  const playerTotal = details.reduce((sum, d) => sum + d.score, 0);
  const playerDiff = playerTotal - totalPar;
  const diffText = playerDiff > 0 ? `+${playerDiff}` : playerDiff === 0 ? 'E' : `${playerDiff}`;
  
  const front9Details = details.filter(d => d.hole <= 9);
  const back9Details = details.filter(d => d.hole > 9);
  
  const totalPutts = details.reduce((sum, d) => sum + d.putts, 0);
  const totalWater = details.reduce((sum, d) => sum + d.water, 0);
  const totalOb = details.reduce((sum, d) => sum + d.ob, 0);
  const totalUp = details.filter(d => d.up).length;

  const isWin123 = gameMode === 'win123';

  const getScoreColorText = (score, par) => {
    const diff = score - par;
    if (diff <= -2) return 'text-purple-600 bg-purple-100';
    if (diff === -1) return 'text-blue-600 bg-blue-100';
    if (diff === 0) return 'text-gray-700 bg-gray-100';
    if (diff === 1) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative flex flex-col bg-white m-3 mt-12 mb-3 rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: 'calc(100vh - 60px)', animation: 'cardAppear 0.25s ease-out' }}>
        
        {/* Header */}
        <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 text-lg">←</button>
            <div>
              <div className="font-bold text-lg">👤 {player} {t('fullDetail')}</div>
              <div className="text-sm text-green-100">{playerTotal}{t('strokes')} ({diffText})</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 text-lg">✕</button>
        </div>

        {/* 可滚动的表格区域 */}
        <div className="flex-1 overflow-auto">
          {/* 前九 */}
          {front9Details.length > 0 && (
            <>
              <div className="px-3 py-2 bg-green-50 text-xs font-semibold text-green-700 sticky top-0">{t('front9')} OUT</div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-7">
                  <tr>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">{t('hole')}</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">Par</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">{t('strokes')}</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">{t('putt')}</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">💧</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">OB</th>
                    {isWin123 && <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">UP</th>}
                  </tr>
                </thead>
                <tbody>
                  {front9Details.map((d, idx) => (
                    <tr key={d.hole} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-2 text-center font-semibold text-gray-700">{d.hole}</td>
                      <td className="py-2 px-2 text-center text-gray-500">{d.par}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`inline-block w-7 h-7 leading-7 rounded-full font-bold text-sm ${getScoreColorText(d.score, d.par)}`}>{d.score}</span>
                      </td>
                      <td className="py-2 px-2 text-center text-gray-700">{d.putts}</td>
                      <td className="py-2 px-2 text-center">{d.water > 0 ? <span className="text-cyan-600 font-bold">{d.water}</span> : <span className="text-gray-300">-</span>}</td>
                      <td className="py-2 px-2 text-center">{d.ob > 0 ? <span className="text-yellow-600 font-bold">{d.ob}</span> : <span className="text-gray-300">-</span>}</td>
                      {isWin123 && <td className="py-2 px-2 text-center">{d.up ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">-</span>}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* 后九 */}
          {back9Details.length > 0 && (
            <>
              <div className="px-3 py-2 bg-blue-50 text-xs font-semibold text-blue-700 sticky top-0">{t('back9')} IN</div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-7">
                  <tr>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">{t('hole')}</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">Par</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">{t('strokes')}</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">{t('putt')}</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">💧</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">OB</th>
                    {isWin123 && <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">UP</th>}
                  </tr>
                </thead>
                <tbody>
                  {back9Details.map((d, idx) => (
                    <tr key={d.hole} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-2 text-center font-semibold text-gray-700">{d.hole}</td>
                      <td className="py-2 px-2 text-center text-gray-500">{d.par}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`inline-block w-7 h-7 leading-7 rounded-full font-bold text-sm ${getScoreColorText(d.score, d.par)}`}>{d.score}</span>
                      </td>
                      <td className="py-2 px-2 text-center text-gray-700">{d.putts}</td>
                      <td className="py-2 px-2 text-center">{d.water > 0 ? <span className="text-cyan-600 font-bold">{d.water}</span> : <span className="text-gray-300">-</span>}</td>
                      <td className="py-2 px-2 text-center">{d.ob > 0 ? <span className="text-yellow-600 font-bold">{d.ob}</span> : <span className="text-gray-300">-</span>}</td>
                      {isWin123 && <td className="py-2 px-2 text-center">{d.up ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">-</span>}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* 底部统计 */}
        <div className="flex-shrink-0 bg-gray-100 p-3 border-t" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div className={`grid ${isWin123 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 text-center`}>
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="text-gray-500 text-xs">{t('putt')}</div>
              <div className="font-bold text-xl text-gray-800">{totalPutts}</div>
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="text-gray-500 text-xs">💧{t('water')}</div>
              <div className="font-bold text-xl text-cyan-600">{totalWater}</div>
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="text-gray-500 text-xs">OB</div>
              <div className="font-bold text-xl text-yellow-600">{totalOb}</div>
            </div>
            {isWin123 && (
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-gray-500 text-xs">UP</div>
                <div className="font-bold text-xl text-green-600">{totalUp}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

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

const ScoreDisplay = memo(({ score, par }) => {
  const diff = score - par;
  
  let colorClass = 'text-gray-900';
  if (diff <= -2) colorClass = 'text-purple-600';
  else if (diff === -1) colorClass = 'text-blue-600';
  else if (diff === 0) colorClass = 'text-gray-900';
  else if (diff === 1) colorClass = 'text-orange-600';
  else colorClass = 'text-red-600';
  
  return <span className={`font-semibold ${colorClass}`}>{score}</span>;
});

// 高级模式玩家卡片 - 来自v15 final
const AdvancedPlayerCard = memo(({ player, playerScore, playerPutts, playerWater, playerOb, playerUp, par, showUp, onChangeScore, onChangePutts, onChangeWater, onChangeOb, onResetWater, onResetOb, onToggleUp, getScoreLabel }) => {
  const label = getScoreLabel(playerScore, par);

  const WaterButton = ({ value, onInc, onReset }) => (
    <div className="relative">
      {value > 0 && (
        <button onClick={onReset} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10 shadow active:scale-95">−</button>
      )}
      <button onClick={onInc} className={`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition ${value > 0 ? 'bg-cyan-500 text-white shadow' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}>
        <Droplets className="w-4 h-4" />
      </button>
      {value > 0 && (
        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-700 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">{value}</span>
      )}
    </div>
  );

  const OBButton = ({ value, onInc, onReset }) => (
    <div className="relative">
      {value > 0 && (
        <button onClick={onReset} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10 shadow active:scale-95">−</button>
      )}
      <button onClick={onInc} className={`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition font-bold text-xs ${value > 0 ? 'bg-yellow-500 text-white shadow' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}>
        OB
      </button>
      {value > 0 && (
        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-700 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">{value}</span>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="pt-1">
          <h3 className="font-bold text-xl text-gray-900">{player}</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${label.class}`}>{label.text}</span>
        </div>
        
        <div className="flex items-start gap-3">
          {/* Score */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-1">Score</span>
            <div className="flex items-center gap-1">
              <button onClick={() => onChangeScore(-1)} disabled={playerScore <= 1} className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm active:scale-95 ${playerScore > 1 ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-400'}`}>
                <span className="text-lg font-bold">−</span>
              </button>
              <div className="w-8 text-center">
                <span className="text-2xl font-bold text-gray-900">{playerScore}</span>
              </div>
              <button onClick={() => onChangeScore(1)} className="w-9 h-9 bg-green-500 text-white rounded-full flex items-center justify-center shadow-sm active:scale-95">
                <span className="text-lg font-bold">+</span>
              </button>
            </div>
            <div className="mt-2 h-8 flex items-center justify-center">
              <WaterButton value={playerWater} onInc={onChangeWater} onReset={onResetWater} />
            </div>
          </div>
          
          {/* Putts */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-1">Putts</span>
            <div className="flex items-center gap-1">
              <button onClick={() => onChangePutts(-1)} disabled={playerPutts <= 0} className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm active:scale-95 ${playerPutts > 0 ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-400'}`}>
                <span className="text-lg font-bold">−</span>
              </button>
              <div className="w-8 text-center">
                <span className="text-2xl font-bold text-gray-900">{playerPutts}</span>
              </div>
              <button onClick={() => onChangePutts(1)} className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-sm active:scale-95">
                <span className="text-lg font-bold">+</span>
              </button>
            </div>
            <div className="mt-2 h-8 flex items-center justify-center">
              <OBButton value={playerOb} onInc={onChangeOb} onReset={onResetOb} />
            </div>
          </div>
          
          {/* UP按钮 */}
          {showUp && (
            <button onClick={onToggleUp} className={`px-3 py-2 rounded-md font-medium text-sm transition active:scale-95 mt-5 ${playerUp ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-600'}`}>
              <TrendingUp className="inline w-3 h-3 mr-1" />UP
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

const courses = {
  f9: [1,2,3,4,5,6,7,8,9],
  b9: [10,11,12,13,14,15,16,17,18],
  f18: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
  b18: [10,11,12,13,14,15,16,17,18,1,2,3,4,5,6,7,8,9]
};

function IntegratedGolfGame() {
  const [lang, setLang] = useState(() => {
    try {
      const savedLang = localStorage.getItem('handincap_lang');
      return savedLang || 'en';
    } catch {
      return 'en';
    }
  });
  const [currentSection, setCurrentSection] = useState('home');
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', action: null, showScreenshotHint: false });
  const [holeConfirmDialog, setHoleConfirmDialog] = useState({ isOpen: false, action: null });
  const [holeSelectDialog, setHoleSelectDialog] = useState(false);
  const [editHoleDialog, setEditHoleDialog] = useState({ isOpen: false, hole: null });
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
  const [jumboMode, setJumboMode] = useState(false);
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [stake, setStake] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [handicap, setHandicap] = useState('off');
  const [playerHandicaps, setPlayerHandicaps] = useState({});
  const [advanceMode, setAdvanceMode] = useState('off');
  
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState({});  
  const [ups, setUps] = useState({});  
  const [putts, setPutts] = useState({});
  const [water, setWater] = useState({});
  const [ob, setOb] = useState({});
  const [allScores, setAllScores] = useState({});  
  const [allUps, setAllUps] = useState({});  
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
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const activePlayers = useMemo(() => {
    return playerNames.filter(name => name.trim());
  }, [playerNames]);

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

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
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
        setPrizePool(gameState.prizePool || '');
        setHandicap(gameState.handicap || 'off');
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
        setCurrentSection('game');
      } catch (error) {
        console.error('Failed to resume game:', error);
        showToast('恢复游戏失败', 'error');
      }
    }
  }, [showToast]);

  // 保存游戏状态到localStorage
  useEffect(() => {
    if (currentSection === 'game' && activePlayers.length > 0) {
      const gameState = {
        lang,
        courseType,
        holes,
        pars,
        gameMode,
        playerNames,
        stake,
        prizePool,
        handicap,
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
        jumboMode
      };
      localStorage.setItem('golfGameState', JSON.stringify(gameState));
      setHasSavedGame(true);
    }
  }, [currentSection, lang, courseType, holes, pars, gameMode, playerNames, stake, prizePool, 
      handicap, playerHandicaps, advanceMode, currentHole, scores, ups, putts, water, ob,
      allScores, allUps, allPutts, allWater, allOb, totalMoney, 
      moneyDetails, completedHoles, gameComplete, currentHoleSettlement, totalSpent, 
      selectedCourse, setupMode, jumboMode, activePlayers.length]);

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

  const t = useCallback((key) => {
    const translations = {
      zh: {
        title: 'HandinCap',
        subtitle: '让每一杆都算数',
        create: '创建新局',
        courseTitle: '球场设置',
        autoMode: '自动搜索',
        manualMode: '手动输入',
        searchPlaceholder: '搜索球场名称...',
        selectCourse: '选择球场',
        gameType: '比赛类型',
        setPar: '设置各洞PAR值',
        confirmCourse: '确认设置',
        playerTitle: '玩家设置',
        players: '玩家',
        player1: '玩家1',
        player2: '玩家2',
        player3: '玩家3',
        player4: '玩家4',
        player5: '玩家5',
        player6: '玩家6',
        player7: '玩家7',
        player8: '玩家8',
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
        advance: '高级',
        off: '关',
        on: '开',
        back: '返回',
        start: '开始比赛',
        hole: '洞',
        par: 'PAR',
        nextHole: '确认成绩 →',
        currentMoney: '实时战况',
        poolBalance: '奖池余额',
        holeTied: '本洞平局',
        poolGrows: '下洞奖池',
        skinsWinner: '{player}赢得Skins！',
        holeSettlement: '该洞结算',
        netScore: '净杆',
        rank: '第{n}名',
        winner: '胜利',
        resume: '继续比赛',
        finishRound: '确认并结束',
        confirmHoleScore: '确认第{hole}洞成绩',
        holeScoresSummary: '各玩家成绩：',
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
        f9: '前9洞',
        b9: '后9洞',
        f18: '前18洞',
        b18: '后18洞',
        f9Desc: '1-9洞',
        b9Desc: '10-18洞',
        f18Desc: '1-18洞标准',
        b18Desc: '10-18,1-9洞',
        duplicateNames: '玩家名不可重复',
        screenshotHint: '建议您先截图保存成绩记录',
        totalLoss: '累计',
        totalPar: 'PAR',
        noCourses: '未找到球场',
        trySearch: '请尝试其他关键词',
        front9: '前九',
        back9: '后九',
        eagle: '老鹰',
        birdie: '小鸟',
        parLabel: '标准杆',
        bogey: '柏忌',
        doubleplus: '双柏忌+',
        selectHoleToEdit: '选择要修改的洞',
        editHole: '修改',
        save: '保存',
        scoreUpdated: '成绩已更新，金额已重算',
		reportTitle: '的比赛报告',
		scoreDistribution: '成绩分布',
		puttingAnalysis: '推杆分析',
		totalPutts: '总推杆',
		avgPerHole: '平均/洞',
		onePutt: '一推进洞',
		threePutts: '三推及以上',
		holes: '洞',
		penaltyStats: '罚杆统计',
		waterHazard: '水障碍',
		stats: '统计',
		attempts: '尝试',
		times: '次',
		holeByHole: '逐洞成绩',
		viewFullDetail: '查看完整明细',
		fullDetail: '完整明细',
		strokes: '杆',
		putt: '推',
		water: '水障',
		clickNameToView: '点击名字查看详情'
      },
      en: {
        title: 'HandinCap',
        subtitle: 'Just a ScoreCard',
        create: 'Create New Game',
        courseTitle: 'Course Setup',
        autoMode: 'Auto Search',
        manualMode: 'Manual Input',
        searchPlaceholder: 'Search course name...',
        selectCourse: 'Select Course',
        gameType: 'Game Type',
        setPar: 'Set PAR Values',
        confirmCourse: 'Confirm',
        playerTitle: 'Player Setup',
        players: 'Players',
        player1: 'Player 1',
        player2: 'Player 2',
        player3: 'Player 3',
        player4: 'Player 4',
        player5: 'Player 5',
        player6: 'Player 6',
        player7: 'Player 7',
        player8: 'Player 8',
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
        advance: 'Advance',
        off: 'Off',
        on: 'On',
        back: 'Back',
        start: 'Start Game',
        hole: 'Hole',
        par: 'PAR',
        nextHole: 'Confirm & Next',
        currentMoney: 'Live Standings',
        poolBalance: 'Pool Balance',
        holeTied: 'Hole Tied',
        poolGrows: 'Next hole pool',
        skinsWinner: '{player} wins the Skin!',
        holeSettlement: 'Hole Settlement',
        netScore: 'Net',
        rank: 'Rank {n}',
        winner: 'Winner',
        resume: 'Resume Game',
        finishRound: 'Confirm & Finish',
        confirmHoleScore: 'Confirm Hole {hole} Scores',
        holeScoresSummary: 'Player Scores:',
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
        f9: 'Front 9',
        b9: 'Back 9',
        f18: 'Front 18',
        b18: 'Back 18',
        f9Desc: 'Holes 1-9',
        b9Desc: 'Holes 10-18',
        f18Desc: 'Standard 1-18',
        b18Desc: '10-18, 1-9',
        duplicateNames: 'Player names must be unique',
        screenshotHint: 'We recommend taking a screenshot to save your scores',
        totalLoss: 'Total',
        totalPar: 'PAR',
        noCourses: 'No courses found',
        trySearch: 'Try different keywords',
        front9: 'Front 9',
        back9: 'Back 9',
        eagle: 'Eagle',
        birdie: 'Birdie',
        parLabel: 'Par',
        bogey: 'Bogey',
        doubleplus: 'Double+',
        selectHoleToEdit: 'Select Hole to Edit',
        editHole: 'Edit Hole',
        save: 'Save',
        scoreUpdated: 'Scores updated, money recalculated',
		reportTitle: "'s Report",
		scoreDistribution: 'Score Distribution',
		puttingAnalysis: 'Putting Analysis',
		totalPutts: 'Total Putts',
		avgPerHole: 'Avg/Hole',
		onePutt: 'One-Putts',
		threePutts: '3-Putts+',
		holes: ' holes',
		penaltyStats: 'Penalty Stats',
		waterHazard: 'Water',
		stats: ' Stats',
		attempts: ' Attempts',
		times: '',
		holeByHole: 'Hole by Hole',
		viewFullDetail: 'View Full Detail',
		fullDetail: 'Full Detail',
		strokes: ' strokes',
		putt: 'Putt',
		water: 'Water',
		clickNameToView: 'Tap name to view details'
      }
    };
    return translations[lang][key] || key;
  }, [lang]);

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
  }, []);

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

  const updatePlayerHandicap = useCallback((playerName, parType, value) => {
    setPlayerHandicaps(prev => ({
      ...prev,
      [playerName]: {
        ...prev[playerName],
        [parType]: value === '' ? undefined : value
      }
    }));
  }, []);

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
        return;
      }
      setPrizePool(0);
    } else if (gameMode === 'win123') {
      if (stakeValue <= 0) {
        showToast(t('noStake'), 'error');
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
    setCurrentSection('game');
  }, [activePlayers, stake, gameMode, showToast, t]);

  const getHandicapForHole = useCallback((player, par = 4) => {
    if (handicap !== 'on') return 0;
    const handicaps = playerHandicaps[player];
    if (!handicaps) return 0;
    
    if (par === 3) return handicaps.par3 || 0;
    if (par === 4) return handicaps.par4 || 0;
    if (par === 5) return handicaps.par5 || 0;
    return 0;
  }, [handicap, playerHandicaps]);

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
      const winAmount = currentPrizePool + holeStake;
      results[winner].money = winAmount - stakeValue;
      results[winner].fromPool = currentPrizePool;
      
      poolChange = -currentPrizePool;
    } else {
      poolChange = holeStake;
    }
    
    return { results, poolChange, isTied: winners.length > 1, winner: winners.length === 1 ? winners[0].player : null, winAmount: winners.length === 1 ? currentPrizePool + holeStake : 0 };
  }, [activePlayers, stake, pars, getHandicapForHole, prizePool]);

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
    const playerCount = activePlayers.length;
    
    if (uniqueScores.length === 1) {
      // 全部同分 → 全部第1名，不罚款
      rankings.forEach(r => r.finalRank = 1);
    } else if (playerCount <= 4) {
      // ===== 原4人规则 =====
      if (uniqueScores.length === 2) {
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
    } else {
      // ===== Jumbo (5+人) A改版：并列取差名次 =====
      let currentIndex = 0;
      while (currentIndex < rankings.length) {
        const currentScore = rankings[currentIndex].netScore;
        let lastIndex = currentIndex;
        while (lastIndex < rankings.length - 1 && 
               rankings[lastIndex + 1].netScore === currentScore) {
          lastIndex++;
        }
        const rank = lastIndex + 1;
        for (let i = currentIndex; i <= lastIndex; i++) {
          rankings[i].finalRank = rank;
        }
        currentIndex = lastIndex + 1;
      }
    }
    
    const results = {};
    let poolChange = 0;
    
    activePlayers.forEach(player => {
      results[player] = { money: 0, fromPool: 0 };
    });
    
    if (uniqueScores.length > 1) {
      rankings.forEach(r => {
        let penalty = 0;
        
        // 支持 Jumbo 人数：罚金 = stake × (名次 - 1)
        if (r.finalRank > 1) {
          penalty = stakeValue * (r.finalRank - 1);
        }
        
        if (r.up) {
          if (r.finalRank === 1) {
            const poolWin = stakeValue * 6;
            results[r.player].money = poolWin;
            results[r.player].fromPool = poolWin;
            poolChange -= poolWin;
          } else {
            penalty = penalty * 2;
          }
        }
        
        if (r.finalRank > 1) {
          results[r.player].money = -penalty;
          poolChange += penalty;
        }
      });
    }
    
    return { results, poolChange, rankings };
  }, [activePlayers, stake, pars, getHandicapForHole]);

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
  }, [scores, currentHole, holes, pars, ups, activePlayers, gameMode, calculateMatchPlay, calculateSkins, calculateWin123]);

  const changePutts = useCallback((player, delta) => {
    setPutts(prev => ({ ...prev, [player]: Math.max(0, (prev[player] || 0) + delta) }));
  }, []);

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
    const newUps = { ...ups, [player]: !ups[player] };
    
    activePlayers.forEach(p => {
      holeScores[p] = scores[p] || par;
    });
    
    if (gameMode === 'win123') {
      const { results } = calculateWin123(holeScores, newUps, holeNum);
      setCurrentHoleSettlement(results);
    }
  }, [ups, currentHole, holes, pars, scores, activePlayers, gameMode, calculateWin123]);

  const proceedToNextHole = useCallback(() => {
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const currentHoleScores = {};
    const currentHoleUps = {};
    const currentHolePutts = {};
    const currentHoleWater = {};
    const currentHoleOb = {};
    
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
	triggerConfetti();
    } else {
      setCurrentHole(currentHole + 1);
      setScores({});
      setUps({});
      setPutts({});
      setWater({});
      setOb({});
      setCurrentHoleSettlement(null);
    }
    
    setHoleConfirmDialog({ isOpen: false, action: null });
    setPendingRankings(null);
  }, [currentHole, holes, scores, ups, putts, water, ob, activePlayers, allScores, allUps, allPutts, allWater, allOb, gameMode, totalMoney, moneyDetails, completedHoles, prizePool, pars, stake, calculateMatchPlay, calculateSkins, calculateWin123, showToast, t, totalSpent]);

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

  // 编辑洞成绩并重新计算金额
  const handleEditHoleSave = useCallback((hole, newScores, newUps) => {
    // 1. 更新 allScores 和 allUps
    const updatedAllScores = { ...allScores };
    const updatedAllUps = { ...allUps };
    
    activePlayers.forEach(player => {
      if (!updatedAllScores[player]) updatedAllScores[player] = {};
      if (!updatedAllUps[player]) updatedAllUps[player] = {};
      updatedAllScores[player][hole] = newScores[player];
      updatedAllUps[player][hole] = newUps[player] || false;
    });
    
    setAllScores(updatedAllScores);
    setAllUps(updatedAllUps);
    
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
        
        activePlayers.forEach(player => {
          holeScores[player] = updatedAllScores[player]?.[holeNum] || (pars[holeNum] || 4);
          holeUps[player] = updatedAllUps[player]?.[holeNum] || false;
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
            netScore: (holeScores[p] || par) - getHandicapForHole(p, par)
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
          const { results, poolChange } = calculateWin123(holeScores, holeUps, holeNum);
          activePlayers.forEach(player => {
            newTotalMoney[player] += results[player].money;
            if (results[player].fromPool) {
              newDetails[player].fromPool += results[player].fromPool;
            }
          });
          newPrizePool += poolChange;
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
  }, [allScores, allUps, activePlayers, stake, gameMode, completedHoles, pars, calculateMatchPlay, calculateWin123, getHandicapForHole, showToast, t]);

  const goHome = useCallback(() => {
    const resetGame = () => {
      clearSavedGame();
      setCurrentSection('home');
      setGameMode('matchPlay');
      setJumboMode(false);
      setPlayerNames(['', '', '', '']);
      setStake('');
      setPrizePool('');
      setHandicap('off');
      setPlayerHandicaps({});
      setAdvanceMode('off');
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

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {currentSection === 'home' && (
        <div className="flex justify-end items-center p-3 bg-white border-b border-gray-200">
          <button
            onClick={() => {
              const newLang = lang === 'zh' ? 'en' : 'zh';
              setLang(newLang);
              try {
                localStorage.setItem('handincap_lang', newLang);
              } catch {}
            }}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium shadow-sm"
          >
            {t('switchLang')}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto p-3">
          
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
              </div>
            </div>
          )}

          {currentSection === 'course' && (
            <div className="space-y-4 py-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    {t('courseTitle')}
                  </h2>
                </div>
                
                <div className="flex rounded-lg border-2 border-green-600 overflow-hidden">
                  <button
                    onClick={() => setSetupMode('auto')}
                    className={`flex-1 px-4 py-2.5 font-semibold text-sm transition flex items-center justify-center gap-2 ${
                      setupMode === 'auto'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    {t('autoMode')}
                  </button>
                  <button
                    onClick={() => setSetupMode('manual')}
                    className={`flex-1 px-4 py-2.5 font-semibold text-sm transition flex items-center justify-center gap-2 ${
                      setupMode === 'manual'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    {t('manualMode')}
                  </button>
                </div>
              </div>

              {setupMode === 'auto' && (
                <>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      {t('selectCourse')}
                    </h3>
                    
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {searchQuery.trim() && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((course, index) => {
                            const coursePar = course.pars.reduce((sum, par) => sum + par, 0);
                            
                            return (
                              // ========== 修改后的徽章风格卡片 ==========
                              <div
                                key={`${course.shortName}-${index}`}
                                className="border border-gray-200 bg-white hover:border-green-400 hover:shadow-lg rounded-xl p-4 cursor-pointer transition-all"
                                onClick={() => selectAndApplyCourse(course)}
                              >
                                <div className="flex gap-4">
                                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex flex-col items-center justify-center text-white shadow-md flex-shrink-0">
                                    <span className="text-xl font-bold">{coursePar}</span>
                                    <span className="text-xs uppercase tracking-wide opacity-90">Par</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                      {course.fullName}
                                    </h4>
                                    <div className="border-t border-gray-100 pt-2 mt-2">
                                      {course.location && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                          <MapPin className="w-3 h-3 text-green-500 flex-shrink-0" />
                                          <span>{course.location[0]}, {course.location[1]}</span>
                                        </div>
                                      )}
                                      <p className="text-xs text-gray-400 mt-1">{course.shortName}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-medium">{t('noCourses')}</p>
                            <p className="text-xs mt-1">{t('trySearch')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedCourse && courseApplied && (
                    <>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="mb-3">
                          <div className="flex items-start gap-2 mb-1">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900">
                                {selectedCourse.fullName}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {selectedCourse.shortName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-green-600">
                              PAR {calculateTotalPar()}
                            </span>
                          </div>
                        </div>
                        
<div className="bg-white rounded-lg p-4 shadow-sm mb-4">
  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
    <Target className="w-4 h-4" />
    {t('gameType')}
  </h3>
  <div className="grid grid-cols-2 gap-3">
    {Object.keys(courses).map(type => (
      <button
        key={type}
        onClick={() => {
          setCourseType(type);
          const newHoles = courses[type];
          setHoles(newHoles);
          const newPars = {};
          newHoles.forEach((hole, index) => {
            newPars[hole] = selectedCourse.pars[hole - 1] || 4;
          });
          setPars(newPars);
        }}
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
                        
                        <div className={`grid gap-2 ${(courseType === 'f9' || courseType === 'b9') ? 'grid-cols-1 max-w-[200px] mx-auto' : 'grid-cols-2'}`}>
                          <div className="border-2 border-green-600 rounded-lg overflow-hidden">
                            <div className="bg-green-600 text-white text-xs font-bold py-1.5 text-center">
                              {t('front9')}
                            </div>
                            <div className="p-1.5 space-y-1">
                              {holes.slice(0, 9).map((hole, idx) => (
                                <div key={hole}>
                                  <div className="text-xs text-gray-600 mb-0.5 font-medium text-center">
                                    {lang === 'zh' ? `${hole}洞` : `Hole ${hole}`}
                                  </div>
                                  <div className={`rounded font-bold text-sm py-1.5 shadow-sm text-center ${
                                    pars[hole] === 3 ? 'bg-yellow-300 text-black' :
                                    pars[hole] === 5 ? 'bg-orange-300 text-black' :
                                    'bg-gray-300 text-black'
                                  }`}>
                                    Par {pars[hole]}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {holes.length > 9 && (
                            <div className="border-2 border-green-600 rounded-lg overflow-hidden">
                              <div className="bg-green-600 text-white text-xs font-bold py-1.5 text-center">
                                {t('back9')}
                              </div>
                              <div className="p-1.5 space-y-1">
                                {holes.slice(9, 18).map((hole, idx) => (
                                  <div key={hole}>
                                    <div className="text-xs text-gray-600 mb-0.5 font-medium text-center">
                                      {lang === 'zh' ? `${hole}洞` : `Hole ${hole}`}
                                    </div>
                                    <div className={`rounded font-bold text-sm py-1.5 shadow-sm text-center ${
                                      pars[hole] === 3 ? 'bg-yellow-300 text-black' :
                                      pars[hole] === 5 ? 'bg-orange-300 text-black' :
                                      'bg-gray-300 text-black'
                                    }`}>
                                      Par {pars[hole]}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {setupMode === 'manual' && (
                <>
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
                                          ? getParColorClass(par) + ' shadow-md ring-2 ring-green-600'
                                          : 'bg-gray-100 text-gray-500 border border-gray-400 hover:bg-gray-200'
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
                                          ? getParColorClass(par) + ' shadow-md ring-2 ring-green-600'
                                          : 'bg-gray-100 text-gray-500 border border-gray-400 hover:bg-gray-200'
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
                                      ? getParColorClass(par) + ' shadow-md ring-2 ring-green-600'
                                      : 'bg-gray-100 text-gray-500 border border-gray-400'
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
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
      setSearchQuery('');
      setSelectedCourse(null);
      setCourseApplied(false);
      setCurrentSection('home');
    }}
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

          {currentSection === 'players' && (
            <div className="space-y-4 py-3">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('playerTitle')}
                </h2>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('players')}
                  </h3>
                  <button
                    onClick={toggleJumboMode}
                    className={`px-3 py-1.5 rounded-md font-medium text-xs transition ${
                      jumboMode
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {lang === 'zh' ? '多人' : 'Jumbo'}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {Array.from({ length: jumboMode ? 8 : 4 }, (_, i) => i).map(i => (
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

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">
                      {t('advance')}:
                    </label>
                    <div className="flex rounded-md border border-gray-300 overflow-hidden">
                      <button
                        onClick={() => setAdvanceMode('off')}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          advanceMode === 'off'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('off')}
                      </button>
                      <button
                        onClick={() => setAdvanceMode('on')}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          advanceMode === 'on'
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

          {currentSection === 'scorecard' && (
            <div className="space-y-3 py-3">
              {selectedCourse && (
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 text-white shadow-md text-center">
                  <h1 className="text-2xl font-bold mb-1">
                    {selectedCourse.fullName}
                  </h1>
                  <p className="text-sm text-green-100">
                    {selectedCourse.shortName}
                  </p>
                </div>
              )}

              {/* ========== 条件渲染：Advance Mode ON 或 OFF ========== */}
              {advanceMode === 'on' && completedHoles.length > 0 ? (
                // ===== Advance Mode Scorecard =====
                <>
                  {/* 提示文字 */}
                  <p className="text-xs text-gray-400 text-center mb-2">💡 {t('clickNameToView')}</p>

                  {/* 总成绩摘要 - 可点击查看详情 */}
                  {(() => {
                    const totalPar = completedHoles.reduce((sum, h) => sum + (pars[h] || 4), 0);
                    const playerTotals = {};
                    activePlayers.forEach(player => {
                      playerTotals[player] = completedHoles.reduce((total, hole) => {
                        return total + (allScores[player]?.[hole] || 0);
                      }, 0);
                    });

                    const scoreRankings = activePlayers
                      .map(player => ({ player, score: playerTotals[player] }))
                      .sort((a, b) => a.score - b.score)
                      .reduce((acc, { player }, index, arr) => {
                        if (index === 0) {
                          acc[player] = 1;
                        } else {
                          const prevPlayer = arr[index - 1].player;
                          if (playerTotals[player] === playerTotals[prevPlayer]) {
                            acc[player] = acc[prevPlayer];
                          } else {
                            acc[player] = index + 1;
                          }
                        }
                        return acc;
                      }, {});

                    return (
                      <div className="bg-white rounded-lg p-3 shadow-sm mb-3">
                        <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">
                          {t('totalScore')} ({t('standardPar')}: {totalPar})
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {activePlayers.map(player => {
                            const total = playerTotals[player];
                            const diff = total - totalPar;
                            const diffStr = diff > 0 ? `+${diff}` : diff === 0 ? 'E' : `${diff}`;
                            const rank = scoreRankings[player];
                            const medal = getMedal(rank);
                            
                            return (
                              <div 
                                key={player} 
                                className="text-center p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 active:scale-98 transition"
                                onClick={() => handleAdvancePlayerClick(player)}
                              >
                                <div className="text-sm font-medium text-blue-600 underline flex items-center justify-center gap-1">
                                  {player} {medal}
                                </div>
                                <div className="flex items-baseline justify-center gap-1">
                                  <span className="text-xl font-bold text-gray-900">{total || '-'}</span>
                                  {total > 0 && (
                                    <span className={`text-xs font-semibold ${diff > 0 ? 'text-red-600' : diff === 0 ? 'text-gray-600' : 'text-green-600'}`}>
                                      ({diffStr})
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 前九/后九 Scorecard 表格 */}
                  {(() => {
                    const frontNine = completedHoles.filter(h => h <= 9).sort((a, b) => a - b);
                    const backNine = completedHoles.filter(h => h > 9).sort((a, b) => a - b);
                    
                    const calculateTotal = (player, holesList) => {
                      return holesList.reduce((total, hole) => {
                        return total + (allScores[player]?.[hole] || 0);
                      }, 0);
                    };
                    
                    const calculateParTotal = (holesList) => {
                      return holesList.reduce((total, hole) => {
                        return total + (pars[hole] || 4);
                      }, 0);
                    };

                    const getScoreColor = (score, par) => {
                      const diff = score - par;
                      if (diff <= -2) return 'text-purple-600 font-bold';
                      if (diff === -1) return 'text-blue-600 font-bold';
                      if (diff === 0) return 'text-gray-900';
                      if (diff === 1) return 'text-orange-600 font-bold';
                      return 'text-red-600 font-bold';
                    };

                    return (
                      <>
                        {frontNine.length > 0 && (
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3">
                            <table className="w-full" style={{ fontSize: '10px' }}>
                              <thead>
                                <tr className="bg-green-600 text-white">
                                  <th className="px-1 py-1.5 text-left font-semibold" style={{ minWidth: '35px' }}>OUT</th>
                                  {frontNine.map(h => (
                                    <th key={h} className="px-0 py-1.5 text-center font-semibold" style={{ minWidth: '18px' }}>{h}</th>
                                  ))}
                                  <th className="px-1 py-1.5 text-center font-semibold" style={{ minWidth: '22px' }}>{t('total')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-gray-50">
                                  <td className="px-1 py-1.5 font-semibold text-gray-900">Par</td>
                                  {frontNine.map(h => (
                                    <td key={h} className="px-0 py-1.5 text-center text-gray-900">{pars[h] || 4}</td>
                                  ))}
                                  <td className="px-1 py-1.5 text-center font-bold text-gray-900">{calculateParTotal(frontNine)}</td>
                                </tr>
                                {activePlayers.map((player, idx) => (
                                  <tr key={player} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-1 py-1.5 font-semibold text-gray-700 truncate" style={{ fontSize: '9px' }}>
                                      {player}
                                    </td>
                                    {frontNine.map(h => {
                                      const score = allScores[player]?.[h];
                                      const par = pars[h] || 4;
                                      return (
                                        <td key={h} className={`px-0 py-1.5 text-center ${score ? getScoreColor(score, par) : ''}`}>
                                          {score || '-'}
                                        </td>
                                      );
                                    })}
                                    <td className="px-1 py-1.5 text-center font-bold text-gray-900">
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
                                  <th className="px-1 py-1.5 text-left font-semibold" style={{ minWidth: '35px' }}>IN</th>
                                  {backNine.map(h => (
                                    <th key={h} className="px-0 py-1.5 text-center font-semibold" style={{ minWidth: '18px' }}>{h}</th>
                                  ))}
                                  <th className="px-1 py-1.5 text-center font-semibold" style={{ minWidth: '22px' }}>{t('total')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-gray-50">
                                  <td className="px-1 py-1.5 font-semibold text-gray-900">Par</td>
                                  {backNine.map(h => (
                                    <td key={h} className="px-0 py-1.5 text-center text-gray-900">{pars[h] || 4}</td>
                                  ))}
                                  <td className="px-1 py-1.5 text-center font-bold text-gray-900">{calculateParTotal(backNine)}</td>
                                </tr>
                                {activePlayers.map((player, idx) => (
                                  <tr key={player} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-1 py-1.5 font-semibold text-gray-700 truncate" style={{ fontSize: '9px' }}>
                                      {player}
                                    </td>
                                    {backNine.map(h => {
                                      const score = allScores[player]?.[h];
                                      const par = pars[h] || 4;
                                      return (
                                        <td key={h} className={`px-0 py-1.5 text-center ${score ? getScoreColor(score, par) : ''}`}>
                                          {score || '-'}
                                        </td>
                                      );
                                    })}
                                    <td className="px-1 py-1.5 text-center font-bold text-gray-900">
                                      {calculateTotal(player, backNine) || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                // ===== 原版 Scorecard (advanceMode === 'off') =====
                <>
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

                    const scoreRankings = activePlayers
                      .map(player => ({ player, score: playerTotals[player] }))
                      .sort((a, b) => a.score - b.score)
                      .reduce((acc, { player }, index, arr) => {
                        if (index === 0) {
                          acc[player] = 1;
                        } else {
                          const prevPlayer = arr[index - 1].player;
                          if (playerTotals[player] === playerTotals[prevPlayer]) {
                            acc[player] = acc[prevPlayer];
                          } else {
                            acc[player] = index + 1;
                          }
                        }
                        return acc;
                      }, {});

                    const moneyRankings = (Number(stake) > 0) ? activePlayers
                      .map(player => ({ player, money: totalMoney[player] }))
                      .sort((a, b) => b.money - a.money)
                      .reduce((acc, { player }, index, arr) => {
                        if (index === 0) {
                          acc[player] = 1;
                        } else {
                          const prevPlayer = arr[index - 1].player;
                          if (totalMoney[player] === totalMoney[prevPlayer]) {
                            acc[player] = acc[prevPlayer];
                          } else {
                            acc[player] = index + 1;
                          }
                        }
                        return acc;
                      }, {}) : {};
                    
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
                                const rank = scoreRankings[player];
                                const medal = getMedal(rank);
                                
                                return (
                                  <div key={player} className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-xs font-medium text-gray-700 flex items-center justify-center gap-1">
                                      {player}
                                      {medal && <span className="text-sm">{medal}</span>}
                                    </div>
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
                </>
              )}

              {(gameComplete || completedHoles.length === holes.length) && (Number(stake) > 0 || (gameMode === 'skins' && prizePool > 0)) && (
                <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                    {t('finalSettlement')}
                  </h3>
                  {(gameMode === 'skins' || gameMode === 'win123') && prizePool > 0 && (
                    <div className="mb-3 text-center p-2 bg-purple-100 rounded">
                      <span className="text-sm text-purple-700">
                        {gameMode === 'win123' ? t('penaltyPot') : t('prizePool')}: 
                      </span>
                      <span className="text-lg font-bold text-purple-800 ml-2">
                        ${prizePool}
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {(() => {
                      const playerTotals = {};
                      activePlayers.forEach(player => {
                        playerTotals[player] = completedHoles.reduce((total, hole) => {
                          const score = allScores[player]?.[hole];
                          return total + (score || 0);
                        }, 0);
                      });

                      const moneyRankings = activePlayers
                        .map(player => ({ player, money: totalMoney[player] }))
                        .sort((a, b) => b.money - a.money)
                        .reduce((acc, { player }, index, arr) => {
                          if (index === 0) {
                            acc[player] = 1;
                          } else {
                            const prevPlayer = arr[index - 1].player;
                            if (totalMoney[player] === totalMoney[prevPlayer]) {
                              acc[player] = acc[prevPlayer];
                            } else {
                              acc[player] = index + 1;
                            }
                          }
                          return acc;
                        }, {});

                      return activePlayers.map(player => {
                        const amount = totalMoney[player] || 0;
                        const rank = moneyRankings[player];
                        const medal = getMedal(rank);
                        
                        return (
                          <div key={player} className="border-b border-yellow-200 last:border-b-0 pb-2">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900 flex items-center gap-1">
                                {player}
                                {amount > 0 && medal && <span className="text-base">{medal}</span>}
                              </span>
                              <span className={`font-bold ${
                                amount > 0 ? 'text-green-600' : amount < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!gameComplete ? (
                  <>
                    <button
                      onClick={() => setCurrentSection('game')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                    >
                      {t('resume')}
                    </button>
                    {completedHoles.length > 0 && (
                      <button
                        onClick={() => setHoleSelectDialog(true)}
                        className="w-14 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center transition"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                  </>
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
                {advanceMode === 'on' && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-600 rounded text-xs">Adv</span>
                )}
              </div>
            )}
            
            {selectedCourse && (
              selectedCourse.blueTees || 
              selectedCourse.whiteTees || 
              selectedCourse.redTees
            ) && (
              <div className="mt-2 px-4">
                <div className="grid gap-1.5" style={{
                  gridTemplateColumns: `repeat(${
                    [selectedCourse.blueTees, selectedCourse.whiteTees, selectedCourse.redTees]
                      .filter(Boolean).length
                  }, 1fr)`
                }}>
                  {selectedCourse.blueTees && (
                    <div className="bg-blue-500 bg-opacity-90 rounded-md py-1 px-1.5 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-700 rounded-full"></span>
                        <span className="text-xs font-semibold text-white">Blue</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {selectedCourse.blueTees[holes[currentHole] - 1]}m
                      </div>
                    </div>
                  )}
                  
                  {selectedCourse.whiteTees && (
                    <div className="bg-gray-200 rounded-md py-1 px-1.5 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        <span className="text-xs font-semibold text-gray-700">White</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {selectedCourse.whiteTees[holes[currentHole] - 1]}m
                      </div>
                    </div>
                  )}
                  
                  {selectedCourse.redTees && (
                    <div className="bg-red-500 bg-opacity-90 rounded-md py-1 px-1.5 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className="inline-block w-1.5 h-1.5 bg-red-700 rounded-full"></span>
                        <span className="text-xs font-semibold text-white">Red</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {selectedCourse.redTees[holes[currentHole] - 1]}m
                      </div>
                    </div>
                  )}
                </div>
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
					showToast(t('gameOver'));
					setCurrentSection('scorecard');
					triggerConfetti();
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
              {advanceMode === 'on' ? (
                // 高级模式 - v15 final 的 AdvancedPlayerCard
                activePlayers.map(player => {
                  const holeNum = holes[currentHole];
                  const par = pars[holeNum] || 4;
                  const playerScore = scores[player] || par;
                  const playerPutts = putts[player] || 0;
                  const playerWater = water[player] || 0;
                  const playerOb = ob[player] || 0;
                  const playerUp = ups[player] || false;
                  
                  return (
                    <AdvancedPlayerCard
                      key={player}
                      player={player}
                      playerScore={playerScore}
                      playerPutts={playerPutts}
                      playerWater={playerWater}
                      playerOb={playerOb}
                      playerUp={playerUp}
                      par={par}
                      showUp={gameMode === 'win123' && Number(stake) > 0}
                      onChangeScore={(delta) => changeScore(player, delta)}
                      onChangePutts={(delta) => changePutts(player, delta)}
                      onChangeWater={() => changeWater(player)}
                      onChangeOb={() => changeOb(player)}
                      onResetWater={() => resetWater(player)}
                      onResetOb={() => resetOb(player)}
                      onToggleUp={() => toggleUp(player)}
                      getScoreLabel={getScoreLabel}
                    />
                  );
                })
              ) : (
                // 标准模式 - 原有的输入方式
                activePlayers.map(player => {
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
                })
              )}
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
            </div>
          </div>
        </div>
      )}

{/* Advance Mode 报告弹窗 */}
      {advanceReportPlayer && !showAdvanceFullDetail && (
        <AdvanceReportCard
          player={advanceReportPlayer}
          rank={(() => {
            const playerTotals = {};
            activePlayers.forEach(p => {
              playerTotals[p] = completedHoles.reduce((sum, h) => sum + (allScores[p]?.[h] || 0), 0);
            });
            const sorted = activePlayers.slice().sort((a, b) => playerTotals[a] - playerTotals[b]);
            return sorted.indexOf(advanceReportPlayer) + 1;
          })()}
          onClose={() => setAdvanceReportPlayer(null)}
          onViewFull={() => setShowAdvanceFullDetail(true)}
          allScores={allScores}
          allPutts={allPutts}
          allWater={allWater}
          allOb={allOb}
          allUps={allUps}
          pars={pars}
          completedHoles={completedHoles}
          gameMode={gameMode}
          t={t}
          getMedal={getMedal}
        />
      )}

      {advanceReportPlayer && showAdvanceFullDetail && (
        <AdvanceFullDetailModal
          player={advanceReportPlayer}
          rank={(() => {
            const playerTotals = {};
            activePlayers.forEach(p => {
              playerTotals[p] = completedHoles.reduce((sum, h) => sum + (allScores[p]?.[h] || 0), 0);
            });
            const sorted = activePlayers.slice().sort((a, b) => playerTotals[a] - playerTotals[b]);
            return sorted.indexOf(advanceReportPlayer) + 1;
          })()}
          onClose={() => { setAdvanceReportPlayer(null); setShowAdvanceFullDetail(false); }}
          onBack={() => setShowAdvanceFullDetail(false)}
          allScores={allScores}
          allPutts={allPutts}
          allWater={allWater}
          allOb={allOb}
          allUps={allUps}
          pars={pars}
          completedHoles={completedHoles}
          gameMode={gameMode}
          t={t}
          getMedal={getMedal}
        />
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

      <HoleSelectDialog
        isOpen={holeSelectDialog}
        onClose={() => setHoleSelectDialog(false)}
        completedHoles={completedHoles}
        onSelect={(hole) => setEditHoleDialog({ isOpen: true, hole })}
        t={t}
		pars={pars}
      />

      <EditHoleDialog
        isOpen={editHoleDialog.isOpen}
        onClose={() => setEditHoleDialog({ isOpen: false, hole: null })}
        hole={editHoleDialog.hole}
        players={activePlayers}
        allScores={allScores}
        allUps={allUps}
        pars={pars}
        onSave={handleEditHoleSave}
        t={t}
        gameMode={gameMode}
      />
    </div>
  );
}

export default IntegratedGolfGame;