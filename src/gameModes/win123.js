/**
 * Win123 Game Mode
 * 
 * 规则：
 * - 按净杆数排名 1-2-3-4
 * - 第1名不扣钱，第2名扣1x，第3名扣2x，第4名扣3x
 * - UP功能：可以选择 UP（加注）
 *   - UP玩家如果赢得第1名，从罚池拿 6x stake
 *   - UP玩家如果输了，罚款翻倍
 * - 所有罚款进入罚池 (Penalty Pot)
 */

import { DollarSign } from 'lucide-react';

// 模式配置
export const config = {
  name: 'win123',
  nameZh: 'Win123',
  nameEn: 'Win123',
  icon: DollarSign,
  color: 'green',
  bgColor: 'bg-green-600',
  bgColorLight: 'bg-green-100',
  textColor: 'text-green-600',
  // 此模式需要的功能
  requires: ['stake', 'handicap', 'prizePool', 'up'],
  // 此模式不需要的功能
  excludes: [],
  // 描述
  descZh: '排名计分，支持UP加注',
  descEn: 'Ranking scoring with UP option'
};

/**
 * 计算排名
 * 处理并列情况的排名逻辑
 */
const calculateRankings = (playerScores, playerCount) => {
  const rankings = [...playerScores];
  const uniqueScores = [...new Set(rankings.map(p => p.netScore))];
  
  // 全部平局
  if (uniqueScores.length === 1) {
    rankings.forEach(r => r.finalRank = 1);
    return rankings;
  }
  
  // 4人或以下的特殊处理
  if (playerCount <= 4) {
    if (uniqueScores.length === 2) {
      // 只有两种分数：第1和第4
      const firstScore = uniqueScores[0];
      rankings.forEach(r => {
        r.finalRank = r.netScore === firstScore ? 1 : 4;
      });
    } else if (uniqueScores.length === 3) {
      // 三种分数
      const firstScore = uniqueScores[0];
      const secondScore = uniqueScores[1];
      const firstCount = rankings.filter(r => r.netScore === firstScore).length;
      
      rankings.forEach(r => {
        if (r.netScore === firstScore) {
          r.finalRank = 1;
        } else if (r.netScore === secondScore) {
          // 如果第1名有3人或以上，第2名变第4
          r.finalRank = firstCount >= 3 ? 4 : 3;
        } else {
          r.finalRank = 4;
        }
      });
    } else {
      // 4种分数，正常排名
      rankings.forEach((r, i) => r.finalRank = i + 1);
    }
  } else {
    // 5人以上的标准排名
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
  
  return rankings;
};

/**
 * 计算单洞结算
 * @param {Object} params
 * @param {Object} params.holeScores - 各玩家本洞On杆数 { playerName: score }
 * @param {Object} params.holePutts - 各玩家本洞推杆数 { playerName: putts }
 * @param {Object} params.holeUps - 各玩家是否UP { playerName: boolean }
 * @param {number} params.holeNum - 洞号
 * @param {number} params.par - 本洞标准杆
 * @param {number} params.stake - 基础赌注
 * @param {string[]} params.activePlayers - 参与玩家列表
 * @param {Function} params.getHandicapForHole - 获取玩家在某洞的差点
 * @returns {Object} 结算结果
 */
export const calculate = ({
  holeScores,
  holePutts,
  holeUps,
  holeNum,
  par,
  stake,
  activePlayers,
  getHandicapForHole
}) => {
  const stakeValue = Number(stake) || 0;
  
  // 计算每位玩家的总杆数和净杆数
  const playerScores = activePlayers.map(player => ({
    player,
    on: holeScores[player] || par,
    putts: holePutts[player] || 0,
    stroke: (holeScores[player] || par) + (holePutts[player] || 0),
    netScore: (holeScores[player] || par) + (holePutts[player] || 0) - getHandicapForHole(player, holeNum, par),
    up: holeUps[player] || false
  }));
  
  // 按净杆数排序
  playerScores.sort((a, b) => a.netScore - b.netScore);
  
  // 计算排名
  const rankings = calculateRankings(playerScores, activePlayers.length);
  const uniqueScores = [...new Set(rankings.map(p => p.netScore))];
  
  // 初始化结果
  const results = {};
  let poolChange = 0;
  
  activePlayers.forEach(player => {
    results[player] = { money: 0, fromPool: 0 };
  });
  
  // 非全部平局时计算金额
  if (uniqueScores.length > 1) {
    rankings.forEach(r => {
      let penalty = 0;
      
      // 非第1名需要罚款
      if (r.finalRank > 1) {
        penalty = stakeValue * (r.finalRank - 1);
      }
      
      // UP玩家特殊处理
      if (r.up) {
        if (r.finalRank === 1) {
          // UP且赢了，从罚池拿 6x stake
          const poolWin = stakeValue * 6;
          results[r.player].money = poolWin;
          results[r.player].fromPool = poolWin;
          poolChange -= poolWin;
        } else {
          // UP但输了，罚款翻倍
          penalty = penalty * 2;
        }
      }
      
      // 应用罚款
      if (r.finalRank > 1) {
        results[r.player].money = -penalty;
        poolChange += penalty;
      }
    });
  }
  
  return {
    results,
    poolChange,
    rankings,
    isTied: uniqueScores.length === 1
  };
};

/**
 * 获取本洞排名（包含UP状态）
 */
export const getRankings = ({
  holeScores,
  holePutts,
  holeUps,
  holeNum,
  par,
  activePlayers,
  getHandicapForHole
}) => {
  const playerScores = activePlayers.map(player => ({
    player,
    on: holeScores[player] || par,
    putts: holePutts[player] || 0,
    stroke: (holeScores[player] || par) + (holePutts[player] || 0),
    netScore: (holeScores[player] || par) + (holePutts[player] || 0) - getHandicapForHole(player, holeNum, par),
    up: holeUps[player] || false
  }));
  
  playerScores.sort((a, b) => a.netScore - b.netScore);
  
  return calculateRankings(playerScores, activePlayers.length);
};

/**
 * 计算UP的潜在收益/损失
 */
export const calculateUpPotential = (currentRank, stakeValue) => {
  if (currentRank === 1) {
    return {
      win: stakeValue * 6,  // 从罚池拿6x
      lose: 0
    };
  } else {
    const basePenalty = stakeValue * (currentRank - 1);
    return {
      win: 0,
      lose: basePenalty * 2  // 罚款翻倍
    };
  }
};

export default {
  config,
  calculate,
  getRankings,
  calculateUpPotential
};
