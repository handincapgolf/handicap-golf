/**
 * Baccarat Mode Components
 * 百家乐模式专用组件 - 仅包含独有部分
 */

import React, { memo } from 'react';
import { TrendingUp } from 'lucide-react';

// ========== 百家乐独有：UP 顺序样式配置 ==========
export const upStyles = {
  0: { btn: 'bg-gray-200 text-gray-500 hover:bg-gray-300', card: 'bg-gray-50 border border-gray-200', label: 'UP' },
  1: { btn: 'bg-yellow-400 text-yellow-900 shadow', card: 'bg-gradient-to-br from-yellow-100 to-yellow-300 border-2 border-yellow-400', label: 'UP ①' },
  2: { btn: 'bg-orange-400 text-orange-900 shadow', card: 'bg-gradient-to-br from-orange-100 to-orange-300 border-2 border-orange-400', label: 'UP ②' },
  3: { btn: 'bg-red-400 text-red-900 shadow', card: 'bg-gradient-to-br from-red-100 to-red-300 border-2 border-red-400', label: 'UP ③' },
  4: { btn: 'bg-purple-400 text-purple-900 shadow', card: 'bg-gradient-to-br from-purple-100 to-purple-300 border-2 border-purple-400', label: 'UP ④' }
};

// ========== 获取玩家UP位置 (1-4, 0表示没UP) ==========
export const getBaccaratUpPosition = (player, upOrder) => {
  const idx = upOrder.indexOf(player);
  return idx === -1 ? 0 : idx + 1;
};

// ========== 获取卡片样式 ==========
export const getBaccaratCardClass = (player, upOrder) => {
  const pos = getBaccaratUpPosition(player, upOrder);
  return upStyles[pos]?.card || upStyles[0].card;
};

// ========== 获取UP按钮样式 ==========
export const getBaccaratUpBtnClass = (player, upOrder) => {
  const pos = getBaccaratUpPosition(player, upOrder);
  return upStyles[pos]?.btn || upStyles[0].btn;
};

// ========== 获取UP按钮文字 ==========
export const getBaccaratUpLabel = (player, upOrder) => {
  const pos = getBaccaratUpPosition(player, upOrder);
  return upStyles[pos]?.label || 'UP';
};

// ========== 百家乐独有：对战明细组件 (方案B) ==========
export const BaccaratMatchupGrid = memo(({ matchupDetails, lang = 'zh', upOrder = [] }) => {
  if (!matchupDetails || matchupDetails.length === 0) return null;
  
  // 获取玩家UP位置 (1-4, 0表示没UP)
  const getUpPos = (player) => {
    const idx = upOrder.indexOf(player);
    return idx === -1 ? 0 : idx + 1;
  };
  
  // UP符号
  const upSymbols = ['', '①', '②', '③', '④'];
  
  // UP框样式
  const upBoxStyles = {
    1: 'bg-gradient-to-br from-yellow-100 to-yellow-300 border-2 border-yellow-400',
    2: 'bg-gradient-to-br from-orange-100 to-orange-300 border-2 border-orange-400',
    3: 'bg-gradient-to-br from-red-100 to-red-300 border-2 border-red-400',
    4: 'bg-gradient-to-br from-purple-100 to-purple-300 border-2 border-purple-400'
  };
  
  // UP文字颜色
  const upTextStyles = {
    1: 'text-amber-800 font-semibold',
    2: 'text-orange-800 font-semibold',
    3: 'text-red-800 font-semibold',
    4: 'text-purple-800 font-semibold'
  };
  
  // UP金额颜色
  const upAmtStyles = {
    1: 'text-amber-700',
    2: 'text-orange-700',
    3: 'text-red-700',
    4: 'text-purple-700'
  };
  
  return (
    <div className="bg-white rounded-lg p-3 mt-3">
      <div className="text-xs font-semibold text-center text-gray-500 mb-2">
        {lang === 'zh' ? '6组对战明细' : '6 Matchup Details'}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {matchupDetails.map((m, idx) => {
          const p1Up = getUpPos(m.p1);
          const p2Up = getUpPos(m.p2);
          
          // 判断是否UP者赢了
          const winnerUpPos = !m.isTied && m.winner === m.p1 ? p1Up : 
                             !m.isTied && m.winner === m.p2 ? p2Up : 0;
          
          // 框样式
          const boxClass = winnerUpPos > 0 
            ? upBoxStyles[winnerUpPos] 
            : 'bg-gray-50 border border-gray-200';
          
          // 结果文字样式
          const resultClass = winnerUpPos > 0 
            ? upTextStyles[winnerUpPos]
            : m.isTied ? 'text-gray-500' : 'text-green-600';
          
          // 金额样式
          const amtClass = winnerUpPos > 0 
            ? upAmtStyles[winnerUpPos]
            : 'text-gray-400';
          
          return (
            <div key={idx} className={`p-2 rounded text-xs ${boxClass}`}>
              <div className="flex justify-between font-medium">
                <span>
                  {m.p1}{p1Up > 0 && <span className={`ml-0.5 inline-block w-4 h-4 rounded text-[10px] text-center leading-4 ${
                    p1Up === 1 ? 'bg-yellow-400 text-yellow-900' :
                    p1Up === 2 ? 'bg-orange-400 text-orange-900' :
                    p1Up === 3 ? 'bg-red-400 text-red-900' :
                    'bg-purple-400 text-purple-900'
                  }`}>{upSymbols[p1Up]}</span>}
                  {' vs '}
                  {m.p2}{p2Up > 0 && <span className={`ml-0.5 inline-block w-4 h-4 rounded text-[10px] text-center leading-4 ${
                    p2Up === 1 ? 'bg-yellow-400 text-yellow-900' :
                    p2Up === 2 ? 'bg-orange-400 text-orange-900' :
                    p2Up === 3 ? 'bg-red-400 text-red-900' :
                    'bg-purple-400 text-purple-900'
                  }`}>{upSymbols[p2Up]}</span>}
                </span>
                <span className={amtClass}>${m.matchStake}</span>
              </div>
              <div className={`mt-1 ${resultClass}`}>
                {m.s1} vs {m.s2} → {
                  m.isTied 
                    ? (lang === 'zh' ? '平手' : 'Tie') 
                    : `${m.winner} ${lang === 'zh' ? '赢' : 'wins'}${winnerUpPos > 0 ? ' ' + upSymbols[winnerUpPos] : ''}`
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default {
  upStyles,
  getBaccaratUpPosition,
  getBaccaratCardClass,
  getBaccaratUpBtnClass,
  getBaccaratUpLabel,
  BaccaratMatchupGrid
};