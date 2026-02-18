import React, { useState, useEffect, memo } from 'react';
import { X, CheckCircle, Plus, Minus, TrendingUp } from 'lucide-react';

// ========== 洞成绩确认弹窗 ==========
export const HoleScoreConfirmDialog = memo(({ isOpen, onClose, onConfirm, hole, players, scores, putts, rankings, gameMode, getHandicapForHole, pars, t, stake, prizePool, activePlayers }) => {
  if (!isOpen || !players) return null;

  let skinsWinner = null;
  let skinsAmount = 0;
  let netWinnings = 0;
  if (gameMode === 'skins' && Number(stake) > 0) {
    const par = pars[hole] || 4;
    const playerScores = players.map(p => ({
      player: p,
      score: scores[p] || par,
      netScore: (scores[p] || par) - getHandicapForHole(p, hole, par)
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
            {(gameMode === 'matchPlay' || gameMode === 'skins' || gameMode === 'baccarat') ? (
              players.map(player => {
                const playerOn = scores[player] || (pars[hole] || 4);
                const playerPutts = putts?.[player] || 0;
                const score = playerOn + playerPutts;
                const handicap = getHandicapForHole(player, hole, pars[hole] || 4);
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

// ========== 洞号选择弹窗 ==========
export const HoleSelectDialog = memo(({ isOpen, onClose, completedHoles = [], onSelect, t, pars = {} }) => {
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

// ========== 编辑洞成绩弹窗 - iPhone优化版 ==========
export const EditHoleDialog = memo(({ isOpen, onClose, hole, players = [], allScores = {}, allUps = {}, allUpOrders = {}, allPutts = {}, pars = {}, onSave, t, gameMode }) => {
  const [editScores, setEditScores] = useState({});
  const [editUps, setEditUps] = useState({});
  const [editUpOrder, setEditUpOrder] = useState([]);
  const [editPutts, setEditPutts] = useState({});

  useEffect(() => {
    if (isOpen && hole && players.length > 0) {
      const initialScores = {};
      const initialUps = {};
      const initialPutts = {};
      players.forEach(p => {
        initialScores[p] = allScores[p]?.[hole] || pars[hole] || 4;
        initialUps[p] = allUps[p]?.[hole] || false;
        initialPutts[p] = allPutts[p]?.[hole] || 0;
      });
      setEditScores(initialScores);
      setEditUps(initialUps);
      setEditPutts(initialPutts);
      // 百家乐 UP 顺序
      setEditUpOrder(allUpOrders[hole] || []);
    }
  }, [isOpen, hole, players, allScores, allUps, allUpOrders, allPutts, pars]);

  if (!isOpen || !hole || !players || players.length === 0) return null;

  const par = pars[hole] || 4;

  const changeScore = (player, delta) => {
    setEditScores(prev => ({
      ...prev,
      [player]: Math.max(1, (prev[player] || par) + delta)
    }));
  };

  const changePutts = (player, delta) => {
    setEditPutts(prev => ({
      ...prev,
      [player]: Math.max(0, (prev[player] || 0) + delta)
    }));
  };

  const toggleUp = (player) => {
    setEditUps(prev => ({
      ...prev,
      [player]: !prev[player]
    }));
  };

  // 百家乐专用：切换UP顺序
  const toggleBaccaratUp = (player) => {
    setEditUpOrder(prev => {
      const newOrder = [...prev];
      const idx = newOrder.indexOf(player);
      if (idx !== -1) {
        newOrder.splice(idx, 1);
      } else {
        newOrder.push(player);
      }
      return newOrder;
    });
  };

  // 获取百家乐UP位置
  const getBaccaratUpPos = (player) => {
    const idx = editUpOrder.indexOf(player);
    return idx === -1 ? 0 : idx + 1;
  };

  // 百家乐UP按钮样式
  const getBaccaratUpBtnStyle = (pos) => {
    if (pos === 1) return 'bg-yellow-400 text-yellow-900 shadow';
    if (pos === 2) return 'bg-orange-400 text-orange-900 shadow';
    if (pos === 3) return 'bg-red-400 text-red-900 shadow';
    if (pos === 4) return 'bg-purple-400 text-purple-900 shadow';
    return 'bg-gray-200 text-gray-500';
  };

  // 百家乐卡片样式
  const getBaccaratCardStyle = (pos) => {
    if (pos === 1) return 'bg-gradient-to-br from-yellow-100 to-yellow-300 border-2 border-yellow-400';
    if (pos === 2) return 'bg-gradient-to-br from-orange-100 to-orange-300 border-2 border-orange-400';
    if (pos === 3) return 'bg-gradient-to-br from-red-100 to-red-300 border-2 border-red-400';
    if (pos === 4) return 'bg-gradient-to-br from-purple-100 to-purple-300 border-2 border-purple-400';
    return 'bg-gray-50 border border-gray-200';
  };

  const upSymbols = ['', '①', '②', '③', '④'];

  const getScoreLabel = (stroke, par) => {
    const diff = stroke - par;
    if (diff <= -2) return { text: 'Eagle', numClass: 'bg-purple-500 text-white', labelClass: 'bg-purple-500 text-white' };
    if (diff === -1) return { text: 'Birdie', numClass: 'bg-blue-500 text-white', labelClass: 'bg-blue-500 text-white' };
    if (diff === 0) return { text: 'Par', numClass: 'bg-gray-100 text-gray-800', labelClass: 'bg-gray-200 text-gray-600' };
    if (diff === 1) return { text: 'Bogey', numClass: 'bg-orange-500 text-white', labelClass: 'bg-orange-500 text-white' };
    return { text: 'Dbl+', numClass: 'bg-red-500 text-white', labelClass: 'bg-red-500 text-white' };
  };

  // 卡片样式
  const getCardClass = (player) => {
    if (gameMode === 'baccarat') {
      return getBaccaratCardStyle(getBaccaratUpPos(player));
    }
    return editUps[player] ? 'card-up-active' : 'bg-gray-50 border border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl p-3 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-bold text-gray-900">
            {t('editHole')} {hole} (PAR {par})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2 mb-3">
          {players.map(player => {
            const playerOn = editScores[player] || par;
            const playerPutts = editPutts[player] || 0;
            const stroke = playerOn + playerPutts;
            const label = getScoreLabel(stroke, par);
            const playerUp = editUps[player] || false;
            const baccaratUpPos = getBaccaratUpPos(player);

            return (
              <div key={player} className={`rounded-lg px-2.5 py-2 transition-all ${getCardClass(player)}`}>
                <div className="flex items-center">
                  <div className="w-14 flex-shrink-0">
                    {gameMode === 'win123' && (
                      <button
                        onClick={() => toggleUp(player)}
                        className={`w-8 h-8 rounded-md font-bold text-xs btn-press flex flex-col items-center justify-center transition mb-0.5 ${
                          playerUp 
                            ? 'bg-yellow-400 text-yellow-900 shadow' 
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span style={{fontSize: '7px', lineHeight: 1}}>UP</span>
                      </button>
                    )}
                    {gameMode === 'baccarat' && (
                      <button
                        onClick={() => toggleBaccaratUp(player)}
                        className={`w-8 h-8 rounded-md font-bold text-xs btn-press flex flex-col items-center justify-center transition mb-0.5 ${getBaccaratUpBtnStyle(baccaratUpPos)}`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span style={{fontSize: '7px', lineHeight: 1}}>{baccaratUpPos > 0 ? `UP${upSymbols[baccaratUpPos]}` : 'UP'}</span>
                      </button>
                    )}
                    <div className="font-bold text-sm text-gray-900 truncate">{player}</div>
                  </div>

                  <div className="flex flex-col items-center mx-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl font-extrabold shadow ${label.numClass}`}>{stroke}</div>
                    <div className={`px-1.5 py-0.5 rounded mt-0.5 text-xs font-bold ${label.labelClass}`} style={{fontSize: '9px'}}>{label.text}</div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-end">
                      <span className="text-xs font-semibold text-gray-500 w-8">On</span>
                      <button
                        onClick={() => changeScore(player, -1)}
                        disabled={playerOn <= 1}
                        className={`w-8 h-8 rounded-full flex items-center justify-center btn-press ${
                          playerOn > 1 ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xl font-bold w-8 text-center text-gray-900">{playerOn}</span>
                      <button
                        onClick={() => changeScore(player, 1)}
                        className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center btn-press"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <span className="text-xs font-semibold text-gray-500 w-8">Putts</span>
                      <button
                        onClick={() => changePutts(player, -1)}
                        disabled={playerPutts <= 0}
                        className={`w-8 h-8 rounded-full flex items-center justify-center btn-press ${
                          playerPutts > 0 ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xl font-bold w-8 text-center text-blue-600">{playerPutts}</span>
                      <button
                        onClick={() => changePutts(player, 1)}
                        className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center btn-press"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium text-sm"
          >
            {t('cancel')}
          </button>
          <button
            onClick={() => { onSave(hole, editScores, editUps, editPutts, editUpOrder); onClose(); }}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-1"
          >
            <CheckCircle className="w-4 h-4" />
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
});
