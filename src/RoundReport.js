import React, { useState, useEffect, useRef, memo } from 'react';

// ============================================================
// Round Report - 完整回合报告组件
// 支持: 1) 截图分享 (html2canvas)  2) URL 链接分享
// ============================================================

// ========== 编解码工具 ==========

const packBitsRR = (values, bitSizes) => {
  let bits = '';
  values.forEach((val, i) => {
    const size = bitSizes[i % bitSizes.length];
    bits += Math.max(0, val).toString(2).padStart(size, '0');
  });
  while (bits.length % 8 !== 0) bits += '0';
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return bytes;
};

const unpackBitsRR = (bytes, bitSizes, count) => {
  let bits = bytes.map(b => b.toString(2).padStart(8, '0')).join('');
  const values = [];
  let pos = 0;
  for (let i = 0; i < count; i++) {
    const size = bitSizes[i % bitSizes.length];
    values.push(parseInt(bits.slice(pos, pos + size), 2));
    pos += size;
  }
  return values;
};

const toB64 = (bytes) => {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64 = (str) => {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return Array.from(atob(b64), c => c.charCodeAt(0));
};

/**
 * 编码 Round Report 数据
 * 格式: R|version|courseSN|courseFN|date|gameMode|stake|prizePool|numPlayers|
 *        p1Name:money:spent|p2Name:money:spent|...|
 *        startHole|holeCount|parsB64|scoresB64
 * 
 * pars: 2 bits/hole (par3=0, par4=1, par5=2, par6=3)
 * scores: per player per hole: on_green(4bits) + putts(3bits) = 7 bits
 */
export const encodeRoundReport = ({
  courseSN, courseFN, date, gameMode, stake, prizePool,
  players, // [{ name, money, spent }]
  startHole, holeCount, parsArr, // [par for each hole in order]
  scoresArr // [{ on: [], putts: [] }] per player, each array has holeCount entries
}) => {
  try {
    const dateCompact = date.slice(2).replace(/-/g, '');
    
    // Encode pars: 2 bits each
    const parValues = parsArr.map(p => Math.min(Math.max(p - 3, 0), 3));
    const parBytes = packBitsRR(parValues, [2]);
    const parsB64 = toB64(parBytes);
    
    // Encode scores: 4 bits on + 3 bits putts per hole per player
    const scoreValues = [];
    players.forEach((_, pi) => {
      for (let hi = 0; hi < holeCount; hi++) {
        scoreValues.push(Math.min(scoresArr[pi].on[hi] || 0, 15));
        scoreValues.push(Math.min(scoresArr[pi].putts[hi] || 0, 7));
      }
    });
    const scoreBytes = packBitsRR(scoreValues, [4, 3]);
    const scoresB64 = toB64(scoreBytes);
    
    // Player info
    const playerParts = players.map(p => 
      `${p.name}:${(p.money || 0).toFixed(1)}:${(p.spent || 0).toFixed(1)}`
    );
    
    const parts = [
      'R', '1',
      courseSN || 'X', courseFN || '',
      dateCompact,
      gameMode || 'matchPlay',
      stake || '0', String(prizePool || 0),
      String(players.length),
      ...playerParts,
      String(startHole), String(holeCount),
      parsB64, scoresB64
    ];
    
    const compact = parts.join('|');
    const b64 = btoa(unescape(encodeURIComponent(compact)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error('Round Report encode error:', e);
    return null;
  }
};

/**
 * 解码 Round Report 数据
 */
export const decodeRoundReport = (encoded) => {
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const compact = decodeURIComponent(escape(atob(b64)));
    const parts = compact.split('|');
    
    if (parts[0] !== 'R') return null;
    
    const version = Number(parts[1]);
    const courseSN = parts[2] === 'X' ? '' : parts[2];
    const courseFN = parts[3];
    const dateRaw = parts[4];
    const date = `20${dateRaw.slice(0,2)}-${dateRaw.slice(2,4)}-${dateRaw.slice(4,6)}`;
    const gameMode = parts[5];
    const stake = parts[6];
    const prizePool = Number(parts[7]);
    const numPlayers = Number(parts[8]);
    
    // Parse player info
    const players = [];
    for (let i = 0; i < numPlayers; i++) {
      const [name, money, spent] = parts[9 + i].split(':');
      players.push({ name, money: Number(money), spent: Number(spent) });
    }
    
    const baseIdx = 9 + numPlayers;
    const startHole = Number(parts[baseIdx]);
    const holeCount = Number(parts[baseIdx + 1]);
    const parsB64 = parts[baseIdx + 2];
    const scoresB64 = parts[baseIdx + 3];
    
    // Decode pars
    const parBytes = fromB64(parsB64);
    const parValues = unpackBitsRR(parBytes, [2], holeCount);
    const parsArr = parValues.map(v => v + 3);
    
    // Decode scores
    const scoreBytes = fromB64(scoresB64);
    const totalScoreValues = numPlayers * holeCount * 2; // 2 values per hole (on + putts)
    const scoreValues = unpackBitsRR(scoreBytes, [4, 3], totalScoreValues);
    
    const scoresArr = [];
    for (let pi = 0; pi < numPlayers; pi++) {
      const on = [], putts = [];
      for (let hi = 0; hi < holeCount; hi++) {
        const idx = (pi * holeCount + hi) * 2;
        on.push(scoreValues[idx]);
        putts.push(scoreValues[idx + 1]);
      }
      scoresArr.push({ on, putts });
    }
    
    // Build structured data
    const holes = Array.from({ length: holeCount }, (_, i) => startHole + i);
    const pars = {};
    const allScores = {};
    const allPutts = {};
    
    holes.forEach((h, hi) => {
      pars[h] = parsArr[hi];
    });
    
    players.forEach((p, pi) => {
      allScores[p.name] = {};
      allPutts[p.name] = {};
      holes.forEach((h, hi) => {
        allScores[p.name][h] = scoresArr[pi].on[hi];
        allPutts[p.name][h] = scoresArr[pi].putts[hi];
      });
    });
    
    return {
      courseSN, courseFN, date, gameMode, stake: Number(stake), prizePool,
      players, holes, pars, allScores, allPutts
    };
  } catch (e) {
    console.error('Round Report decode error:', e);
    return null;
  }
};

/**
 * 从游戏状态生成 Round Report 编码所需的数据
 */
export const buildRoundReportData = ({
  selectedCourse, completedHoles, pars, activePlayers,
  allScores, allPutts, totalMoney, totalSpent,
  gameMode, stake, prizePool
}) => {
  const sortedHoles = [...completedHoles].sort((a, b) => a - b);
  const startHole = sortedHoles[0] || 1;
  const holeCount = sortedHoles.length;
  
  const parsArr = sortedHoles.map(h => pars[h] || 4);
  
  const players = activePlayers.map(name => ({
    name,
    money: totalMoney[name] || 0,
    spent: totalSpent?.[name] || 0
  }));
  
  const scoresArr = activePlayers.map(name => ({
    on: sortedHoles.map(h => allScores[name]?.[h] || 0),
    putts: sortedHoles.map(h => allPutts[name]?.[h] || 0)
  }));
  
  return {
    courseSN: selectedCourse?.shortName || 'Custom',
    courseFN: selectedCourse?.fullName || '',
    date: new Date().toISOString().split('T')[0],
    gameMode: gameMode || 'matchPlay',
    stake: stake || 0,
    prizePool: prizePool || 0,
    players,
    startHole,
    holeCount,
    parsArr,
    scoresArr,
    // 显示用数据（RoundReportCard 需要）
    holes: sortedHoles,
    pars,
    allScores,
    allPutts
  };
};

export const generateRoundReportUrl = (data) => {
  const encoded = encodeRoundReport(data);
  if (!encoded) return null;
  return `${window.location.origin}?r=${encoded}`;
};


// ========== 样式工具 ==========

const getScoreColor = (score, par) => {
  const diff = score - par;
  if (diff <= -2) return '#7c3aed'; // purple - eagle+
  if (diff === -1) return '#2563eb'; // blue - birdie
  if (diff === 0) return '#374151';  // gray - par
  if (diff === 1) return '#ea580c';  // orange - bogey
  return '#dc2626';                   // red - double+
};

const getScoreBg = (score, par) => {
  const diff = score - par;
  if (diff <= -2) return '#f5f3ff';
  if (diff === -1) return '#eff6ff';
  if (diff === 0) return '#f9fafb';
  if (diff === 1) return '#fff7ed';
  return '#fef2f2';
};

const getMedalRR = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '';
};

const formatDiff = (diff) => {
  if (diff > 0) return `+${diff}`;
  if (diff === 0) return 'E';
  return String(diff);
};


// ========== Round Report 渲染组件 ==========

/**
 * RoundReportCard - 用于截图和 URL 查看的完整报告
 * 接收解码后的数据结构
 */
export const RoundReportCard = memo(({ data, forCapture = false }) => {
  const {
    courseSN, courseFN, date, gameMode, stake, prizePool,
    players, holes, pars, allScores, allPutts
  } = data;

  const activePlayers = players.map(p => p.name);
  const frontNine = holes.filter(h => h <= 9);
  const backNine = holes.filter(h => h > 9);

  // 计算总分和排名
  const playerTotals = {};
  activePlayers.forEach(name => {
    playerTotals[name] = holes.reduce((sum, h) => {
      return sum + (allScores[name]?.[h] || 0) + (allPutts[name]?.[h] || 0);
    }, 0);
  });

  const totalPar = holes.reduce((sum, h) => sum + (pars[h] || 4), 0);

  const sortedByScore = [...activePlayers].sort((a, b) => playerTotals[a] - playerTotals[b]);
  const scoreRanks = {};
  sortedByScore.forEach((p, i) => {
    if (i === 0) scoreRanks[p] = 1;
    else scoreRanks[p] = playerTotals[p] === playerTotals[sortedByScore[i-1]] 
      ? scoreRanks[sortedByScore[i-1]] : i + 1;
  });

  // 结算排名
  const sortedByMoney = [...players].sort((a, b) => b.money - a.money);
  const moneyRanks = {};
  sortedByMoney.forEach((p, i) => {
    if (i === 0) moneyRanks[p.name] = 1;
    else moneyRanks[p.name] = p.money === sortedByMoney[i-1].money 
      ? moneyRanks[sortedByMoney[i-1].name] : i + 1;
  });

  const hasSettlement = players.some(p => p.money !== 0);

  const calcTotal = (name, holeList) => 
    holeList.reduce((sum, h) => sum + (allScores[name]?.[h] || 0) + (allPutts[name]?.[h] || 0), 0);
  
  const calcParTotal = (holeList) => 
    holeList.reduce((sum, h) => sum + (pars[h] || 4), 0);

  const containerStyle = forCapture ? {
    width: '100%',
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  } : {};

  return (
    <div style={containerStyle} className={forCapture ? '' : 'space-y-3'}>
      
      {/* ===== Header: 球场信息 ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
        padding: '16px 20px',
        borderRadius: forCapture ? '0' : '8px',
        color: 'white',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px', letterSpacing: '2px' }}>
          ROUND REPORT
        </div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
          {courseFN || courseSN || 'Golf Course'}
        </div>
        {courseFN && courseSN && courseSN !== courseFN && (
          <div style={{ fontSize: '13px', opacity: 0.8 }}>{courseSN}</div>
        )}
        <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '8px' }}>{date}</div>
      </div>

      {/* ===== Total Score Summary ===== */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '12px',
        ...(forCapture ? {} : { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' })
      }}>
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: 600 }}>
          Total Score (Par: {totalPar})
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(activePlayers.length, 4)}, 1fr)`, gap: '8px' }}>
          {activePlayers.map(name => {
            const total = playerTotals[name];
            const diff = total - totalPar;
            const rank = scoreRanks[name];
            const medal = getMedalRR(rank);
            return (
              <div key={name} style={{
                textAlign: 'center', padding: '8px', backgroundColor: '#f9fafb',
                borderRadius: '8px', border: rank === 1 ? '2px solid #fbbf24' : '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  {name} {medal}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                    {total || '-'}
                  </span>
                  {total > 0 && (
                    <span style={{
                      fontSize: '12px', fontWeight: 600,
                      color: diff > 0 ? '#dc2626' : diff === 0 ? '#6b7280' : '#16a34a'
                    }}>
                      ({formatDiff(diff)})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Scorecard Tables ===== */}
      {[
        { label: 'OUT', holeList: frontNine },
        { label: 'IN', holeList: backNine }
      ].filter(s => s.holeList.length > 0).map(({ label, holeList }) => (
        <div key={label} style={{
          backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden',
          ...(forCapture ? {} : { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' })
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: label === 'OUT' ? '#16a34a' : '#dc2626', color: 'white' }}>
                <th style={{ padding: '6px 4px', textAlign: 'left', fontWeight: 600, minWidth: '35px' }}>{label}</th>
                {holeList.map(h => (
                  <th key={h} style={{ padding: '6px 0', textAlign: 'center', fontWeight: 600, minWidth: '18px' }}>{h}</th>
                ))}
                <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 700, minWidth: '24px' }}>Tot</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td style={{ padding: '5px 4px', fontWeight: 600, color: '#111827' }}>Par</td>
                {holeList.map(h => (
                  <td key={h} style={{ padding: '5px 0', textAlign: 'center', color: '#111827' }}>{pars[h] || 4}</td>
                ))}
                <td style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 700, color: '#111827' }}>
                  {calcParTotal(holeList)}
                </td>
              </tr>
              {activePlayers.map((name, idx) => (
                <tr key={name} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '5px 4px', fontWeight: 600, color: '#4b5563', fontSize: '9px' }}>{name}</td>
                  {holeList.map(h => {
                    const on = allScores[name]?.[h] || 0;
                    const putt = allPutts[name]?.[h] || 0;
                    const score = on + putt;
                    const par = pars[h] || 4;
                    return (
                      <td key={h} style={{
                        padding: '5px 0', textAlign: 'center',
                        color: score ? getScoreColor(score, par) : '#9ca3af',
                        fontWeight: score && score !== par ? 700 : 400
                      }}>
                        {score || '-'}
                      </td>
                    );
                  })}
                  <td style={{
                    padding: '5px 4px', textAlign: 'center', fontWeight: 700, color: '#111827'
                  }}>
                    {calcTotal(name, holeList) || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* ===== Final Settlement ===== */}
      {hasSettlement && (
        <div style={{
          backgroundColor: '#fefce8', borderRadius: '8px', padding: '14px',
          ...(forCapture ? {} : { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' })
        }}>
          <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>
            Final Settlement
          </div>
          {(stake > 0 || prizePool > 0) && (
            <div style={{
              textAlign: 'center', padding: '6px 12px', backgroundColor: '#f3e8ff',
              borderRadius: '6px', marginBottom: '10px'
            }}>
              <span style={{ fontSize: '13px', color: '#7c3aed' }}>Pot: </span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#6d28d9' }}>
                ${prizePool || 0}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {players.map(p => {
              const rank = moneyRanks[p.name];
              const medal = p.money > 0 ? getMedalRR(rank) : '';
              return (
                <div key={p.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 0', borderBottom: '1px solid #fef08a'
                }}>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {p.name} {medal}
                  </span>
                  <span style={{
                    fontWeight: 700,
                    color: p.money > 0 ? '#16a34a' : p.money < 0 ? '#dc2626' : '#6b7280'
                  }}>
                    {p.money === 0 ? '$0' : p.money > 0 ? `+$${p.money.toFixed(1)}` : `-$${Math.abs(p.money).toFixed(1)}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Footer ===== */}
      <div style={{
        textAlign: 'center', padding: '10px',
        backgroundColor: forCapture ? '#f9fafb' : 'transparent',
        borderTop: forCapture ? '1px solid #e5e7eb' : 'none'
      }}>
        <span style={{ color: '#16a34a', marginRight: '6px' }}>⛳</span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
          Powered by <span style={{ color: '#16a34a' }}>HandinCap.golf</span>
        </span>
      </div>
    </div>
  );
});


// ========== Round Report 分享弹窗 ==========

/**
 * RoundReportShareModal - 弹出分享选项
 * Props:
 *   isOpen, onClose, reportData (已解码的数据), lang, showToast
 */
export const RoundReportShareModal = memo(({ isOpen, onClose, reportData, lang = 'en', showToast }) => {
  const captureRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  if (!isOpen || !reportData) return null;

  // 截图分享
  const handleImageShare = async () => {
    setCapturing(true);
    try {
      // 动态导入 html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const el = captureRef.current;
      if (!el) throw new Error('Capture element not found');

      const canvas = await html2canvas(el, {
        backgroundColor: '#f9fafb',
        scale: 3,
        useCORS: true,
        logging: false
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast?.(lang === 'zh' ? '生成图片失败' : 'Failed to generate image', 'error');
          setCapturing(false);
          return;
        }

        const file = new File([blob], 'round-report.png', { type: 'image/png' });
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile && navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file] });
          } catch (err) {
            if (err.name !== 'AbortError') {
              // fallback: download
              downloadBlob(blob, 'round-report.png');
            }
          }
        } else {
          downloadBlob(blob, 'round-report.png');
          showToast?.(lang === 'zh' ? '图片已下载' : 'Image downloaded');
        }
        setCapturing(false);
      }, 'image/png');
    } catch (e) {
      console.error('Screenshot error:', e);
      showToast?.(lang === 'zh' ? '截图失败，请手动截屏' : 'Screenshot failed. Please take a manual screenshot.', 'error');
      setCapturing(false);
    }
  };

  // URL 链接分享
  const handleLinkShare = () => {
    const url = generateRoundReportUrl(reportData);
    if (!url) {
      showToast?.(lang === 'zh' ? '生成链接失败' : 'Failed to generate link', 'error');
      return;
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
      navigator.share({ url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        showToast?.(lang === 'zh' ? '链接已复制' : 'Link copied!');
      }).catch(() => {
        showToast?.(lang === 'zh' ? '复制失败' : 'Copy failed', 'error');
      });
    }
  };

  return (
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px 0', overflowY: 'auto'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: 'white', borderRadius: '16px', width: '100%',
        maxWidth: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Title Bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 16px', borderBottom: '1px solid #e5e7eb'
        }}>
          <span style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>
            📊 Round Report
          </span>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: '#f3f4f6', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', color: '#6b7280'
            }}
          >
            ✕
          </button>
        </div>

        {/* Share Buttons */}
        <div style={{ display: 'flex', gap: '10px', padding: '12px 16px' }}>
          <button
            onClick={handleImageShare}
            disabled={capturing}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              backgroundColor: capturing ? '#d1d5db' : '#16a34a', color: 'white',
              border: 'none', cursor: capturing ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            {capturing ? '⏳' : '📷'} {lang === 'zh' ? '分享图片' : 'Share Image'}
          </button>
          <button
            onClick={handleLinkShare}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              backgroundColor: '#2563eb', color: 'white',
              border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            🔗 {lang === 'zh' ? '分享链接' : 'Share Link'}
          </button>
        </div>

        {/* Preview / Capture Area */}
        <div style={{ padding: '0 12px 12px', maxHeight: '60vh', overflowY: 'auto' }}>
          <div ref={captureRef}>
            <RoundReportCard data={reportData} forCapture={true} />
          </div>
        </div>
      </div>
    </div>
  );
});


// ========== Round Report 独立查看页 (URL 打开) ==========

export const RoundReportPage = memo(({ encoded }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const decoded = decodeRoundReport(encoded);
      if (decoded) setData(decoded);
      else setError(true);
    } catch {
      setError(true);
    }
  }, [encoded]);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '24px',
          textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '360px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
            Invalid Link
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            This Round Report link is invalid or expired.
          </p>
          <a 
            href="/"
            style={{
              display: 'inline-block', padding: '10px 20px',
              backgroundColor: '#16a34a', color: 'white', borderRadius: '8px',
              textDecoration: 'none', fontWeight: 600, fontSize: '14px'
            }}
          >
            Go to HandinCap
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⛳</div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #374151, #111827)',
      padding: '16px'
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <RoundReportCard data={data} />
        
        {/* Open in App button */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <a 
            href="/"
            style={{
              display: 'inline-block', padding: '12px 24px',
              backgroundColor: '#16a34a', color: 'white', borderRadius: '10px',
              textDecoration: 'none', fontWeight: 600, fontSize: '14px'
            }}
          >
            ⛳ Open HandinCap
          </a>
        </div>
      </div>
    </div>
  );
});


// ========== 工具函数 ==========

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default RoundReportCard;