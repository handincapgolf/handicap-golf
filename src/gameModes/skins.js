/**
 * Skins Game Mode
 * 
 * 规则：
 * - 每洞所有玩家投入 stake 到奖池
 * - 唯一最低杆数者赢得奖池所有钱
 * - 如果平局，奖金累积到下一洞
 */

import { CircleDollarSign } from 'lucide-react';

// 模式配置
export const config = {
  name: 'skins',
  nameZh: 'Skins',
  nameEn: 'Skins',
  icon: CircleDollarSign,
  color: 'purple',
  bgColor: 'bg-purple-600',
  bgColorLight: 'bg-purple-100',
  textColor: 'text-purple-600',
  // 此模式需要的功能
  requires: ['stake', 'handicap', 'prizePool'],
  // 此模式不需要的功能
  excludes: ['up'],
  // 描述
  descZh: '唯一最低杆赢全部奖池',
  descEn: 'Sole low score wins the pot'
};

/**
 * 计算单洞结算
 * @param {Object} params
 * @param {Object} params.holeScores - 各玩家本洞杆数 { playerName: score }
 * @param {number} params.holeNum - 洞号
 * @param {number} params.par - 本洞标准杆
 * @param {number} params.stake - 每洞赌注
 * @param {number} params.prizePool - 当前奖池金额
 * @param {string[]} params.activePlayers - 参与玩家列表
 * @param {Function} params.getHandicapForHole - 获取玩家在某洞的差点
 * @returns {Object} 结算结果
 */
export const calculate = ({
  holeScores,
  holeNum,
  par,
  stake,
  prizePool = 0,
  activePlayers,
  getHandicapForHole
}) => {
  const stakeValue = Number(stake) || 0;
  const currentPrizePool = Math.max(0, prizePool);
  
  // Guard: no players yet (e.g. during sync init)
  if (!activePlayers || activePlayers.length === 0) {
    return { results: {}, poolChange: 0, isTied: true, winner: null, winAmount: 0, newPrizePool: currentPrizePool };
  }
  
  // 计算每位玩家的净杆数
  const playerScores = activePlayers.map(player => ({
    player,
    score: holeScores[player] || par,
    netScore: (holeScores[player] || par) - getHandicapForHole(player, holeNum, par)
  }));
  
  playerScores.sort((a, b) => a.netScore - b.netScore);
  
  const minScore = playerScores[0].netScore;
  const winners = playerScores.filter(p => p.netScore === minScore);
  
  // 初始化结果 - 所有人先扣除 stake
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
  
  // 只有唯一赢家才能拿走奖池
  if (winners.length === 1) {
    const winner = winners[0].player;
    const winAmount = currentPrizePool + holeStake;
    results[winner].money = winAmount - stakeValue; // 减去自己的投入
    results[winner].fromPool = currentPrizePool;
    poolChange = -currentPrizePool; // 清空奖池
  } else {
    // 平局，所有钱进入奖池
    poolChange = holeStake;
  }
  
  return {
    results,
    poolChange,
    isTied: winners.length > 1,
    winner: winners.length === 1 ? winners[0].player : null,
    winAmount: winners.length === 1 ? currentPrizePool + holeStake : 0,
    newPrizePool: currentPrizePool + poolChange
  };
};

/**
 * 获取本洞排名
 */
export const getRankings = ({
  holeScores,
  holeNum,
  par,
  activePlayers,
  getHandicapForHole
}) => {
  const playerScores = activePlayers.map(player => ({
    player,
    score: holeScores[player] || par,
    netScore: (holeScores[player] || par) - getHandicapForHole(player, holeNum, par)
  }));
  
  playerScores.sort((a, b) => a.netScore - b.netScore);
  
  const minScore = playerScores[0].netScore;
  const winners = playerScores.filter(p => p.netScore === minScore);
  
  return playerScores.map((p, index) => ({
    ...p,
    rank: index + 1,
    isWinner: p.netScore === minScore && winners.length === 1,
    isTied: p.netScore === minScore && winners.length > 1
  }));
};

export default {
  config,
  calculate,
  getRankings
};
