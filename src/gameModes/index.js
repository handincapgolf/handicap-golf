/**
 * Game Modes Module Index
 * 游戏模式模块索引
 * 
 * 使用方法:
 * import { gameModes, getGameMode, calculateHole } from './gameModes';
 */

import matchPlay from './matchPlay';
import win123 from './win123';
import skins from './skins';
import baccarat from './baccarat';

// 所有游戏模式
export const gameModes = {
  matchPlay,
  win123,
  skins,
  baccarat
};

// 获取游戏模式配置
export const getGameMode = (modeKey) => {
  return gameModes[modeKey] || null;
};

// 获取所有模式列表（用于UI渲染）
export const getGameModeList = () => {
  return Object.entries(gameModes).map(([key, mode]) => ({
    key,
    ...mode.config
  }));
};

// 通用计算函数
export const calculateHole = (modeKey, params) => {
  const mode = gameModes[modeKey];
  if (!mode) {
    console.error(`Unknown game mode: ${modeKey}`);
    return null;
  }
  return mode.calculate(params);
};

// 检查模式是否需要特定功能
export const modeRequires = (modeKey, feature) => {
  const mode = gameModes[modeKey];
  return mode?.config?.requires?.includes(feature) || false;
};

export default gameModes;
