import React, { memo } from 'react';
import { TrendingUp, Droplets } from 'lucide-react';
import { getBaccaratCardClass, getBaccaratUpBtnClass, getBaccaratUpLabel } from '../gameModes/BaccaratComponents';

// ========== 高级模式玩家卡片 - 方案3 布局 ==========
const AdvancedPlayerCard = memo(({ 
  player, 
  playerOn,
  playerPutts, 
  playerWater, 
  playerOb, 
  playerUp, 
  par, 
  showUp, 
  onChangeOn, 
  onChangePutts, 
  onChangeWater, 
  onChangeOb, 
  onResetWater, 
  onResetOb, 
  onToggleUp, 
  getScoreLabel,
  gameMode = 'win123',
  upOrder = []
}) => {
  const stroke = playerOn + playerPutts;
  const label = getScoreLabel(stroke, par);

  // 卡片样式
  const cardClass = gameMode === 'baccarat' 
    ? getBaccaratCardClass(player, upOrder)
    : (playerUp ? 'card-up-active' : 'bg-gray-50 border border-gray-200');

  // UP按钮样式
  const upBtnClass = gameMode === 'baccarat'
    ? getBaccaratUpBtnClass(player, upOrder)
    : (playerUp ? 'bg-yellow-400 text-yellow-900 shadow' : 'bg-gray-200 text-gray-500 hover:bg-gray-300');

  // UP按钮文字
  const upLabel = gameMode === 'baccarat'
    ? getBaccaratUpLabel(player, upOrder)
    : 'UP';

  return (
    <div className={`rounded-lg px-3 py-2.5 shadow-sm transition-all ${cardClass}`}>
      <div className="flex items-center">
        
        {/* 左侧：UP按钮 + 玩家名 */}
        <div className="w-14 flex-shrink-0 flex flex-col items-start">
          {showUp && (
            <button 
              onClick={onToggleUp}
              className={`w-9 h-9 rounded-lg font-bold text-[10px] btn-press flex flex-col items-center justify-center mb-1 transition ${upBtnClass}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[8px] leading-none mt-0.5">{upLabel}</span>
            </button>
          )}
          <div className="font-bold text-lg text-gray-900">{player}</div>
        </div>

        {/* Water/OB 按钮 */}
        <div className="flex flex-col gap-2 mx-2">
          <div className="relative">
            <button 
              onClick={onChangeWater}
              className={`w-10 h-10 rounded-lg flex items-center justify-center btn-press transition ${
                playerWater > 0 
                  ? 'bg-cyan-500 text-white shadow' 
                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
              }`}
            >
              <Droplets className="w-5 h-5" />
            </button>
            {playerWater > 0 && (
              <>
                <span className="badge-count">{playerWater}</span>
                <button onClick={onResetWater} className="reset-btn-mini btn-press">−</button>
              </>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={onChangeOb}
              className={`w-10 h-10 rounded-lg flex items-center justify-center btn-press font-bold text-xs transition ${
                playerOb > 0 
                  ? 'bg-yellow-500 text-white shadow' 
                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
              }`}
            >
              OB
            </button>
            {playerOb > 0 && (
              <>
                <span className="badge-count">{playerOb}</span>
                <button onClick={onResetOb} className="reset-btn-mini btn-press">−</button>
              </>
            )}
          </div>
        </div>

        {/* 中间：Stroke 显示（方案3 双层分离） */}
        <div className="flex-1 flex justify-center">
          <div className="stroke-display">
            <div className={`stroke-number ${label.numClass}`}>
              {stroke}
            </div>
            <div className={`stroke-label ${label.class}`}>
              {label.text}
            </div>
          </div>
        </div>

        {/* 右侧：On + Putts 控制器 */}
        <div className="flex flex-col gap-2 ml-2">
          <div className="flex items-center">
            <span className="text-[11px] font-bold text-gray-500 w-10 mr-1">On</span>
            <button 
              onClick={() => onChangeOn(-1)} 
              disabled={playerOn <= 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold transition ${
                playerOn > 1 ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-400'
              }`}
            >
              −
            </button>
            <span className="text-[32px] font-extrabold w-11 text-center text-gray-900">{playerOn}</span>
            <button 
              onClick={() => onChangeOn(1)}
              className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold"
            >
              +
            </button>
          </div>
          <div className="flex items-center">
            <span className="text-[11px] font-bold text-gray-500 w-10 mr-1">Putts</span>
            <button 
              onClick={() => onChangePutts(-1)} 
              disabled={playerPutts <= 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold transition ${
                playerPutts > 0 ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-400'
              }`}
            >
              −
            </button>
            <span className="text-[32px] font-extrabold w-11 text-center text-blue-700">{playerPutts}</span>
            <button 
              onClick={() => onChangePutts(1)}
              className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold"
            >
              +
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
});

export default AdvancedPlayerCard;
