/**
 * Win123 Game Mode
 * 
 * 规则（所有人数通用）：
 * - 按净杆数排名，从最烂往上数
 * - 同杆同档位，不跳位
 * - 罚款：1st=0, 2nd=1x, 3rd=2x ... 最后=(n-1)x
 * - 所有罚款进入罚池 (Pool)
 * 
 * UP规则：
 * - 没UP只输不赢，UP才有赢钱机会
 * - UP赢（第1名）：从Pool拿 (n-1) × stake × 2
 * - UP输（非第1）：自己排名罚款 × 2
 * - 全部同杆 + 有UP：UP玩家算赢家，拿 (n-1) × stake × 2
 * - 全部同杆 + 没UP：全部 $0
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
  requires: ['stake', 'handicap', 'prizePool', 'up'],
  excludes: [],
  descZh: '排名计分，支持UP加注',
  descEn: 'Ranking scoring with UP option'
};

/**
 * 计算UP赢的金额 = (n-1) × stake × 2
 * 也就是最后一名档位 × 2
 */
const getUpWinAmount = (playerCount, stakeValue) => {
  return (playerCount - 1) * stakeValue * 2;
};

/**
 * 计算排名 - 从最烂往上数（所有人数通用）
 * - 最差杆数 = 最后一名（第N名）
 * - 倒数第二差 = 第N-1名
 * - ...一直到最好的 = 第1名
 * - 同杆同名次同罚款
 */
const calculateRankings = (playerScores, playerCount) => {
  const rankings = [...playerScores];
  const uniqueScores = [...new Set(rankings.map(p => p.netScore))];
  
  // 全部平局
  if (uniqueScores.length === 1) {
    rankings.forEach(r => r.finalRank = 1);
    return rankings;
  }
  
  // uniqueScores 从小到大（最好到最差）
  const scoreCount = uniqueScores.length;
  const scoreToRank = {};
  
  for (let i = 0; i < scoreCount; i++) {
    const score = uniqueScores[i];
    if (i === 0) {
      // 最好的杆数 = 第1名
      scoreToRank[score] = 1;
    } else {
      // 从后面数上来
      // 最差(最后一个) = playerCount
      // 倒数第二 = playerCount - 1
      // 名次 = playerCount - (scoreCount - 1 - i)
      scoreToRank[score] = playerCount - (scoreCount - 1 - i);
    }
  }
  
  rankings.forEach(r => {
    r.finalRank = scoreToRank[r.netScore];
  });
  
  return rankings;
};

/**
 * 计算单洞结算
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
  const playerCount = activePlayers.length;
  
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
  const rankings = calculateRankings(playerScores, playerCount);
  const uniqueScores = [...new Set(rankings.map(p => p.netScore))];
  
  // 初始化结果
  const results = {};
  let poolChange = 0;
  
  activePlayers.forEach(player => {
    results[player] = { money: 0, fromPool: 0 };
  });
  
  // UP赢的金额 = (n-1) × stake × 2
  const upWin = getUpWinAmount(playerCount, stakeValue);
  
  // 全部同杆
  if (uniqueScores.length === 1) {
    // 有UP玩家 → UP玩家算赢家
    const upPlayers = rankings.filter(r => r.up);
    if (upPlayers.length > 0) {
      upPlayers.forEach(r => {
        results[r.player].money = upWin;
        results[r.player].fromPool = upWin;
        poolChange -= upWin;
      });
    }
    // 没UP的玩家：$0
    
    return {
      results,
      poolChange,
      rankings,
      isTied: true
    };
  }
  
  // 非全部平局 - 计算金额
  rankings.forEach(r => {
    if (r.up) {
      if (r.finalRank === 1) {
        // UP赢：从Pool拿 (n-1) × stake × 2
        results[r.player].money = upWin;
        results[r.player].fromPool = upWin;
        poolChange -= upWin;
      } else {
        // UP输：自己排名罚款 × 2
        const penalty = stakeValue * (r.finalRank - 1) * 2;
        results[r.player].money = -penalty;
        poolChange += penalty;
      }
    } else {
      // 非UP玩家：只输不赢
      if (r.finalRank > 1) {
        const penalty = stakeValue * (r.finalRank - 1);
        results[r.player].money = -penalty;
        poolChange += penalty;
      }
    }
  });
  
  return {
    results,
    poolChange,
    rankings,
    isTied: false
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
 * @param {number} currentRank - 当前排名
 * @param {number} stakeValue - 底注
 * @param {number} playerCount - 玩家人数
 */
export const calculateUpPotential = (currentRank, stakeValue, playerCount = 4) => {
  const upAmount = getUpWinAmount(playerCount, stakeValue);
  
  if (currentRank === 1) {
    return {
      win: upAmount,
      lose: 0
    };
  } else {
    const basePenalty = stakeValue * (currentRank - 1);
    return {
      win: 0,
      lose: basePenalty * 2
    };
  }
};

export default {
  config,
  calculate,
  getRankings,
  calculateUpPotential
};