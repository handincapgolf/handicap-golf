/**
 * Match Play (比洞赛) Game Mode
 * 
 * 规则：
 * - 每洞比较净杆数（杆数 - 差点）
 * - 最低分者赢得该洞
 * - 输家向赢家支付 stake
 * - 平局不换钱
 */

import { Trophy } from 'lucide-react';

// 模式配置
export const config = {
  name: 'matchPlay',
  nameZh: '比洞赛',
  nameEn: 'Match Play',
  icon: Trophy,
  color: 'blue',
  bgColor: 'bg-blue-600',
  bgColorLight: 'bg-blue-100',
  textColor: 'text-blue-600',
  // 此模式需要的功能
  requires: ['stake', 'handicap'],
  // 此模式不需要的功能
  excludes: ['up', 'prizePool'],
  // 描述
  descZh: '每洞最低杆数者胜出',
  descEn: 'Lowest score wins each hole'
};

/**
 * 计算单洞结算
 * @param {Object} params
 * @param {Object} params.holeScores - 各玩家本洞杆数 { playerName: score }
 * @param {number} params.holeNum - 洞号
 * @param {number} params.par - 本洞标准杆
 * @param {number} params.stake - 每洞赌注
 * @param {string[]} params.activePlayers - 参与玩家列表
 * @param {Function} params.getHandicapForHole - 获取玩家在某洞的差点
 * @returns {Object} results - 各玩家的结算结果 { playerName: { money: number } }
 */
export const calculate = ({
  holeScores,
  holeNum,
  par,
  stake,
  activePlayers,
  getHandicapForHole
}) => {
  const stakeValue = Number(stake) || 0;
  
  // Guard: no players yet (e.g. during sync init)
  if (!activePlayers || activePlayers.length === 0) {
    return { results: {}, winners: [], losers: [], isTied: true };
  }
  
  // 计算每位玩家的净杆数
  const playerScores = activePlayers.map(player => ({
    player,
    score: holeScores[player] || par,
    netScore: (holeScores[player] || par) - getHandicapForHole(player, holeNum, par)
  }));
  
  // 按净杆数排序
  playerScores.sort((a, b) => a.netScore - b.netScore);
  
  const minScore = playerScores[0].netScore;
  const winners = playerScores.filter(p => p.netScore === minScore);
  const losers = playerScores.filter(p => p.netScore > minScore);
  
  // 初始化结果
  const results = {};
  activePlayers.forEach(player => {
    results[player] = { money: 0 };
  });
  
  // 计算金额
  if (winners.length < activePlayers.length && stakeValue > 0) {
    const winAmount = (losers.length * stakeValue) / winners.length;
    winners.forEach(w => {
      results[w.player].money = winAmount;
    });
    losers.forEach(l => {
      results[l.player].money = -stakeValue;
    });
  }
  
  return {
    results,
    winners: winners.map(w => w.player),
    losers: losers.map(l => l.player),
    isTied: winners.length === activePlayers.length
  };
};

/**
 * 获取本洞排名（用于UI显示）
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
  
  return playerScores.map((p, index) => ({
    ...p,
    rank: index + 1
  }));
};

export default {
  config,
  calculate,
  getRankings
};
