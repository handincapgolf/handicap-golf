/**
 * Win123 Game Mode
 * 
 * 规则：
 * - 按净杆数排名
 * - 第1名不扣钱，第2名扣1x，第3名扣2x，第4名扣3x...
 * - UP功能：可以选择 UP（加注）
 *   - UP玩家如果赢得第1名，从罚池拿 6x stake
 *   - UP玩家如果输了，罚款翻倍
 * - 所有罚款进入罚池 (Penalty Pot)
 * 
 * 4人或以下：原有逻辑（并列取最差排名，跳跃式）
 * 5-8人 Jumbo模式：从最后一名往上数
 *   - 最差杆数 = 最后一名（第N名）
 *   - 倒数第二差 = 第N-1名
 *   - ...一直到最好的 = 第1名
 *   - 并列第1名都不罚，其他并列同名次同罚款
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
 * 计算排名 - 4人或以下
 * 原有逻辑保持不变
 */
const calculateRankingsStandard = (rankings, uniqueScores) => {
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
  
  return rankings;
};

/**
 * 计算排名 - 5人以上 Jumbo模式
 * 从最后一名往上数：
 * - 最差杆数 = 最后一名
 * - 倒数第二差 = 第N-1名
 * - 并列第1名都不罚
 */
const calculateRankingsJumbo = (rankings, uniqueScores, playerCount) => {
  // uniqueScores 已经从小到大排序（最好到最差）
  // 我们需要从后往前分配名次
  
  const scoreCount = uniqueScores.length; // 有几种不同的杆数
  
  // 从最后一名开始分配
  // 最差的杆数 = 第playerCount名
  // 倒数第二差 = 第playerCount-1名
  // ...
  // 最好的杆数 = 第1名
  
  // 计算每个分数对应的名次
  // 名次 = playerCount - (scoreCount - 1 - scoreIndex)
  // 简化：名次 = playerCount - scoreCount + 1 + scoreIndex
  
  // 但最好的（第1名）永远是1
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
      // ...
      // 所以：名次 = playerCount - (scoreCount - 1 - i)
      scoreToRank[score] = playerCount - (scoreCount - 1 - i);
    }
  }
  
  // 分配名次给每个玩家
  rankings.forEach(r => {
    r.finalRank = scoreToRank[r.netScore];
  });
  
  return rankings;
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
  
  // 4人或以下：原有逻辑
  if (playerCount <= 4) {
    return calculateRankingsStandard(rankings, uniqueScores);
  }
  
  // 5-8人：Jumbo模式
  return calculateRankingsJumbo(rankings, uniqueScores, playerCount);
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