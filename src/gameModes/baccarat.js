/**
 * Baccarat (百家乐) Game Mode
 * 
 * 规则：
 * - 4位玩家，两两配对形成6组对战
 * - 每组对战比较净杆数（On + Putts - Handicap）
 * - 低杆者赢得该组对战的赌注
 * 
 * UP 规则（倍率系统）：
 * - 有UP vs 有UP = 底注 ×4
 * - 有UP vs 没UP = 底注 ×2
 * - 没UP vs 没UP = 原版底注
 * 
 * UP 顺序：
 * - 第一UP：金色 ①
 * - 第二UP：橙色 ②
 * - 第三UP：红色 ③
 * - 第四UP：紫色 ④
 */

import { CircleDollarSign } from 'lucide-react';

// 模式配置
export const config = {
  name: 'baccarat',
  nameZh: '百家乐',
  nameEn: 'Baccarat',
  icon: CircleDollarSign,
  color: 'amber',
  bgColor: 'bg-amber-600',
  bgColorLight: 'bg-amber-100',
  textColor: 'text-amber-600',
  // 此模式需要的功能
  requires: ['stake', 'upOrder', 'handicap'],
  // 此模式不需要的功能
  excludes: ['prizePool'],
  // 描述
  descZh: '两两对战，UP加倍赌注',
  descEn: 'Head-to-head matchups with UP multipliers'
};

// UP 顺序配置（用于UI显示）
export const upOrderConfig = [
  { position: 1, label: '①', color: 'amber', bgClass: 'bg-yellow-400', textClass: 'text-yellow-900', cardClass: 'first-up' },
  { position: 2, label: '②', color: 'orange', bgClass: 'bg-orange-400', textClass: 'text-orange-900', cardClass: 'second-up' },
  { position: 3, label: '③', color: 'red', bgClass: 'bg-red-400', textClass: 'text-red-900', cardClass: 'third-up' },
  { position: 4, label: '④', color: 'purple', bgClass: 'bg-purple-400', textClass: 'text-purple-900', cardClass: 'fourth-up' }
];

/**
 * 获取玩家的UP位置配置
 * @param {string} player - 玩家名
 * @param {string[]} upOrder - UP顺序数组
 * @returns {Object|null} UP配置或null
 */
export const getUpPositionConfig = (player, upOrder) => {
  const idx = upOrder.indexOf(player);
  if (idx === -1) return null;
  return upOrderConfig[idx] || null;
};

/**
 * 计算两位玩家之间的对战赌注倍率
 * @param {boolean} p1Up - 玩家1是否UP
 * @param {boolean} p2Up - 玩家2是否UP
 * @returns {number} 倍率 (1, 2, 或 4)
 */
export const getMatchupMultiplier = (p1Up, p2Up) => {
  if (p1Up && p2Up) return 4;  // 双UP
  if (p1Up || p2Up) return 2;  // 单UP
  return 1;                     // 无UP
};

/**
 * 生成所有对战组合
 * @param {string[]} players - 玩家列表
 * @returns {Array} 对战组合 [{ p1, p2 }, ...]
 */
export const generateMatchups = (players) => {
  const matchups = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matchups.push({ p1: players[i], p2: players[j] });
    }
  }
  return matchups;
};

/**
 * 计算单洞结算
 * @param {Object} params
 * @param {Object} params.holeScores - 各玩家本洞On杆数 { playerName: score }
 * @param {Object} params.holePutts - 各玩家本洞推杆数 { playerName: putts }
 * @param {string[]} params.upOrder - UP顺序数组（按点击顺序）
 * @param {number} params.holeNum - 洞号
 * @param {number} params.par - 本洞标准杆
 * @param {number} params.stake - 基础赌注
 * @param {string[]} params.activePlayers - 参与玩家列表
 * @returns {Object} 结算结果
 */
export const calculate = ({
  holeScores,
  holePutts,
  upOrder = [],
  holeNum,
  par,
  stake,
  activePlayers,
  getHandicapForHole = () => 0  // 默认无让杆
}) => {
  const stakeValue = Number(stake) || 0;
  
  // Guard: no players yet (e.g. during sync init)
  if (!activePlayers || activePlayers.length === 0) {
    return { results: {}, matchupDetails: [], upOrder: [] };
  }
  
  // 初始化结果
  const results = {};
  activePlayers.forEach(player => {
    results[player] = { money: 0 };
  });
  
  // 计算每位玩家的净杆数（总杆 - 让杆）
  const getNetStroke = (player) => {
    const on = holeScores[player] !== undefined ? holeScores[player] : par;
    const putts = holePutts[player] || 0;
    const stroke = on + putts;
    const handicap = getHandicapForHole(player, holeNum, par);
    return stroke - handicap;
  };
  
  // 计算总杆数（用于显示）
  const getGrossStroke = (player) => {
    const on = holeScores[player] !== undefined ? holeScores[player] : par;
    const putts = holePutts[player] || 0;
    return on + putts;
  };
  
  // 生成所有对战组合
  const matchups = generateMatchups(activePlayers);
  const matchupDetails = [];
  
  // 计算每组对战
  matchups.forEach(({ p1, p2 }) => {
    const net1 = getNetStroke(p1);
    const net2 = getNetStroke(p2);
    const gross1 = getGrossStroke(p1);
    const gross2 = getGrossStroke(p2);
    
    const p1Up = upOrder.includes(p1);
    const p2Up = upOrder.includes(p2);
    
    // 计算该组对战的赌注
    const multiplier = getMatchupMultiplier(p1Up, p2Up);
    const matchStake = stakeValue * multiplier;
    
    let winner = null;
    let loser = null;
    
    // 用净杆数比较
    if (net1 < net2) {
      winner = p1;
      loser = p2;
      results[p1].money += matchStake;
      results[p2].money -= matchStake;
    } else if (net2 < net1) {
      winner = p2;
      loser = p1;
      results[p2].money += matchStake;
      results[p1].money -= matchStake;
    }
    // 平局不换钱
    
    matchupDetails.push({
      p1,
      p2,
      s1: net1,      // 显示净杆
      s2: net2,      // 显示净杆
      gross1,        // 总杆（备用）
      gross2,        // 总杆（备用）
      p1Up,
      p2Up,
      multiplier,
      matchStake,
      winner,
      isTied: net1 === net2
    });
  });
  
  return {
    results,
    matchupDetails,
    upOrder: [...upOrder]
  };
};

/**
 * 获取本洞排名（按总杆数）
 */
export const getRankings = ({
  holeScores,
  holePutts,
  upOrder = [],
  holeNum,
  par,
  activePlayers
}) => {
  const playerScores = activePlayers.map(player => {
    const on = holeScores[player] !== undefined ? holeScores[player] : par;
    const putts = holePutts[player] || 0;
    const upIdx = upOrder.indexOf(player);
    
    return {
      player,
      on,
      putts,
      stroke: on + putts,
      upPosition: upIdx === -1 ? 0 : upIdx + 1,
      upConfig: upIdx === -1 ? null : upOrderConfig[upIdx]
    };
  });
  
  // 按总杆数排序
  playerScores.sort((a, b) => a.stroke - b.stroke);
  
  // 分配排名
  let currentRank = 1;
  for (let i = 0; i < playerScores.length; i++) {
    if (i > 0 && playerScores[i].stroke > playerScores[i - 1].stroke) {
      currentRank = i + 1;
    }
    playerScores[i].rank = currentRank;
  }
  
  return playerScores;
};

/**
 * 计算潜在收益/损失预览
 * @param {string} player - 当前玩家
 * @param {Object} params - 同 calculate 的参数
 * @returns {Object} { maxWin, maxLose, opponents: [...] }
 */
export const calculatePotential = (player, { upOrder, stake, activePlayers }) => {
  const stakeValue = Number(stake) || 0;
  const playerUp = upOrder.includes(player);
  
  const opponents = activePlayers
    .filter(p => p !== player)
    .map(opponent => {
      const opponentUp = upOrder.includes(opponent);
      const multiplier = getMatchupMultiplier(playerUp, opponentUp);
      return {
        opponent,
        opponentUp,
        matchStake: stakeValue * multiplier,
        multiplier
      };
    });
  
  const maxWin = opponents.reduce((sum, o) => sum + o.matchStake, 0);
  const maxLose = maxWin; // 对称的
  
  return { maxWin, maxLose, opponents };
};

/**
 * 切换玩家UP状态（管理UP顺序）
 * @param {string} player - 玩家名
 * @param {string[]} currentUpOrder - 当前UP顺序
 * @returns {string[]} 新的UP顺序
 */
export const toggleUp = (player, currentUpOrder) => {
  const newOrder = [...currentUpOrder];
  const idx = newOrder.indexOf(player);
  
  if (idx !== -1) {
    // 已经UP，取消（从数组中移除）
    newOrder.splice(idx, 1);
  } else {
    // 加入UP（追加到末尾）
    newOrder.push(player);
  }
  
  return newOrder;
};

export default {
  config,
  calculate,
  getRankings,
  calculatePotential,
  toggleUp,
  getUpPositionConfig,
  getMatchupMultiplier,
  generateMatchups,
  upOrderConfig
};