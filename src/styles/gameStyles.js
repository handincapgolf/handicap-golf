// Game CSS styles injected at runtime
// Extracted from IntegratedGolfGame.js to reduce main file size

export const GAME_STYLES_ID = 'up-active-style';

export const GAME_STYLES_CSS = `
  /* PGA 经典双圈双框样式 */
  .pga-eagle {
    position: relative;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
    color: #92400e;
    background: #fef3c7;
    border-radius: 50%;
  }
  .pga-eagle::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid #f59e0b;
    border-radius: 50%;
  }
  .pga-eagle::after {
    content: '';
    position: absolute;
    inset: 3px;
    border: 2px solid #f59e0b;
    border-radius: 50%;
  }
  .pga-birdie {
    width: 32px;
    height: 32px;
    border: 2px solid #3b82f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
    color: #1d4ed8;
    background: #dbeafe;
  }
  .pga-par {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
    color: #374151;
    background: #f3f4f6;
    border-radius: 2px;
  }
  .pga-bogey {
    width: 32px;
    height: 32px;
    border: 2px solid #f97316;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
    color: #c2410c;
    background: #fff7ed;
  }
  .pga-double {
    position: relative;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
    color: #dc2626;
    background: #fef2f2;
    border-radius: 2px;
  }
  .pga-double::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid #dc2626;
    border-radius: 2px;
  }
  .pga-double::after {
    content: '';
    position: absolute;
    inset: 3px;
    border: 2px solid #dc2626;
    border-radius: 2px;
  }
  .pga-triple {
    position: relative;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
    color: #dc2626;
    background: #fef2f2;
    border-radius: 2px;
  }
  .pga-triple::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid #dc2626;
    border-radius: 2px;
  }
  .pga-triple::after {
    content: '';
    position: absolute;
    inset: 3px;
    border: 2px solid #dc2626;
    border-radius: 2px;
  }
  .pga-quad {
    position: relative;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
    color: #dc2626;
    background: #fef2f2;
    border-radius: 2px;
  }
  .pga-quad::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid #dc2626;
    border-radius: 2px;
  }
  .pga-quad::after {
    content: '';
    position: absolute;
    inset: 3px;
    border: 2px solid #dc2626;
    border-radius: 2px;
  }

  .card-up-active {
    background: linear-gradient(135deg, #fef9c3 0%, #fde047 100%) !important;
    border: 2px solid #eab308 !important;
    animation: pulse-glow 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.3); }
    50% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.6), 0 0 30px rgba(234, 179, 8, 0.3); }
  }
  
  .btn-press:active {
    transform: scale(0.95);
  }
  
  .mp-locked-card button {
    opacity: 0.3 !important;
    background: #9ca3af !important;
  }
  
  .badge-count {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 16px;
    height: 16px;
    background: #374151;
    color: white;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .reset-btn-mini {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  
  /* 方案3: Stroke 双层分离显示 */
  .stroke-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .stroke-number {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 800;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .stroke-label {
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 700;
  }
`;

export function injectGameStyles() {
  if (!document.getElementById(GAME_STYLES_ID)) {
    const style = document.createElement('style');
    style.id = GAME_STYLES_ID;
    style.textContent = GAME_STYLES_CSS;
    document.head.appendChild(style);
  }
}
