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

export const generateRoundReportUrl = (data, vertical = false, editLog = []) => {
  const encoded = encodeRoundReport(data);
  if (!encoded) return null;
  let url = `${window.location.origin}?r=${encoded}${vertical ? '&v=1' : ''}`;
  // Append edit log if present
  if (editLog && editLog.length > 0) {
    try {
      const compact = editLog.map(l => ({
        h: l.hole, t: l.timestamp, b: l.editedByLabel || '',
        c: l.changes.map(c => ({ p: c.player, f: c.field, o: c.from, n: c.to }))
      }));
      const json = JSON.stringify(compact);
      const b64 = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      url += `&e=${b64}`;
    } catch (e) { console.warn('EditLog encode error:', e); }
  }
  return url;
};

export const decodeEditLog = (encoded) => {
  if (!encoded) return [];
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const json = decodeURIComponent(escape(atob(b64)));
    const compact = JSON.parse(json);
    return compact.map((l, i) => ({
      id: i + 1, hole: l.h, timestamp: l.t, editedByLabel: l.b || '',
      changes: l.c.map(c => ({ player: c.p, field: c.f, from: c.o, to: c.n }))
    }));
  } catch (e) { console.warn('EditLog decode error:', e); return []; }
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

// PGA-style score cell for vertical layout (matches ScorecardSection ScoreCell)
const PGA_S = 40;
const PGAScoreCellRR = ({ stroke, par }) => {
  if (stroke == null || stroke === 0) {
    return <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><span style={{ fontSize: 16, color: '#d1d5db' }}>-</span></div>;
  }
  const diff = stroke - par;
  const ns = { fontSize: 18, fontWeight: 800, lineHeight: 1, position: 'relative', zIndex: 1 };

  if (diff <= -2) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: PGA_S, height: PGA_S, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, border: '2px solid #f59e0b', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 4, border: '2px solid #f59e0b', borderRadius: '50%' }} />
          <span style={{ ...ns, color: '#92400e' }}>{stroke}</span>
        </div>
      </div>
    );
  }
  if (diff === -1) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: PGA_S, height: PGA_S, borderRadius: '50%', border: '2px solid #3b82f6', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ ...ns, color: '#1d4ed8' }}>{stroke}</span>
        </div>
      </div>
    );
  }
  if (diff === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: PGA_S, height: PGA_S, borderRadius: 3, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ ...ns, color: '#374151' }}>{stroke}</span>
        </div>
      </div>
    );
  }
  if (diff === 1) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: PGA_S, height: PGA_S, borderRadius: 3, border: '2px solid #f97316', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ ...ns, color: '#c2410c' }}>{stroke}</span>
        </div>
      </div>
    );
  }
  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: PGA_S, height: PGA_S, borderRadius: 3, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, border: '2px solid #dc2626', borderRadius: 3 }} />
        <div style={{ position: 'absolute', inset: 4, border: '2px solid #dc2626', borderRadius: 3 }} />
        <span style={{ ...ns, color: '#dc2626' }}>{stroke}</span>
      </div>
    </div>
  );
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
export const RoundReportCard = memo(({ data, forCapture = false, vertical = false }) => {
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

  const hasSettlement = players.some(p => p.money !== 0);

  const calcTotal = (name, holeList) => 
    holeList.reduce((sum, h) => sum + (allScores[name]?.[h] || 0) + (allPutts[name]?.[h] || 0), 0);
  
  const calcParTotal = (holeList) => 
    holeList.reduce((sum, h) => sum + (pars[h] || 4), 0);

  const getVsColor = (total, parTotal) => {
    const diff = total - parTotal;
    return diff < 0 ? '#059669' : diff === 0 ? '#6b7280' : '#dc2626';
  };

  const containerStyle = forCapture ? {
    width: '100%',
    backgroundColor: '#f0fdf4',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  } : {};

  return (
    <div style={containerStyle} className={forCapture ? '' : 'space-y-3'}>
      
      {/* ===== Header: 球场信息 ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        padding: '16px 20px',
        borderRadius: forCapture ? '0' : '8px',
        color: 'white',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px', letterSpacing: '3px', fontWeight: 600, color: 'rgba(236,253,245,0.6)' }}>
          ROUND REPORT
        </div>
        <div style={{ fontSize: (courseFN || courseSN || '').length > 25 ? '14px' : '17px', fontWeight: 'bold', marginBottom: '4px' }}>
          {courseFN || courseSN || 'Golf Course'}
        </div>
        {courseFN && courseSN && courseSN !== courseFN && (
          <div style={{ fontSize: '12px', opacity: 0.8 }}>{courseSN}</div>
        )}
        <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '8px' }}>{date}</div>
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
        <div style={{ display: 'flex', gap: '4px' }}>
          {activePlayers.map(name => {
            const total = playerTotals[name];
            const diff = total - totalPar;
            return (
              <div key={name} style={{
                flex: 1, textAlign: 'center', padding: '6px 4px', backgroundColor: '#f9fafb',
                borderRadius: '8px', border: '1px solid #e5e7eb',
                minWidth: 0
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', ...(forCapture ? {} : { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }), padding: '0 2px' }}>
                  {name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                    {total || '-'}
                  </span>
                  {total > 0 && (
                    <span style={{
                      fontSize: '9px', fontWeight: 600,
                      color: diff > 0 ? '#dc2626' : diff === 0 ? '#6b7280' : '#047857'
                    }}>
                      {formatDiff(diff)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Final Settlement (before scorecard, matching ScorecardSection position) ===== */}
      {hasSettlement && (
        <div style={{
          backgroundColor: '#fffbeb', borderRadius: '8px', padding: '14px',
          ...(forCapture ? {} : { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' })
        }}>
          <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
            Final Settlement
          </div>
          {(stake > 0 || prizePool > 0) && (
            <div style={{
              textAlign: 'center', padding: '6px 12px', backgroundColor: '#f3e8ff',
              borderRadius: '6px', marginBottom: '8px'
            }}>
              <span style={{ fontSize: '12px', color: '#6b21a8' }}>Pot: </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#6b21a8' }}>
                ${prizePool || 0}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '4px' }}>
            {players.map(p => {
              const amount = p.money || 0;
              return (
                <div key={p.name} style={{
                  flex: 1, textAlign: 'center', padding: '6px 4px',
                  backgroundColor: '#fef3c7', borderRadius: '8px', minWidth: 0
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', ...(forCapture ? {} : { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }), padding: '0 4px' }}>
                    {p.name}
                  </div>
                  <div style={{
                    fontSize: '18px', fontWeight: 700,
                    color: amount > 0 ? '#059669' : amount < 0 ? '#dc2626' : '#9ca3af'
                  }}>
                    {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Scorecard ===== */}
      {vertical ? (
        /* ===== VERTICAL PGA-style — Front 9 / Back 9 split ===== */
        <>
          {[
            { label: 'OUT', holeList: frontNine, bg: '#166534' },
            { label: 'IN', holeList: backNine, bg: '#7f1d1d' }
          ].filter(s => s.holeList.length > 0).map(({ label, holeList, bg }) => {
            const sectionPar = calcParTotal(holeList);
            return (
              <div key={label} style={{
                backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', marginBottom: 20,
                ...(forCapture ? {} : { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' })
              }}>
                {/* Header row */}
                <div style={{ display: 'flex', width: '100%', padding: '10px 0', borderBottom: '2px solid #e5e7eb', background: bg }}>
                  <div style={{ width: 42, flexShrink: 0, fontSize: 14, fontWeight: 700, color: '#fff', textAlign: 'center' }}>{label}</div>
                  <div style={{ width: 34, flexShrink: 0, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>P</div>
                  {activePlayers.map(p => (
                    <div key={p} style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#fff', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px' }}>{p}</div>
                  ))}
                </div>
                {/* Hole rows */}
                {holeList.map((h, rowIdx) => {
                  const hp = pars[h] || 4;
                  const getStroke = (name) => {
                    const on = allScores[name]?.[h] || 0;
                    const pt = allPutts[name]?.[h] || 0;
                    return on > 0 ? on + pt : null;
                  };
                  return (
                    <div key={h} style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f3f4f6', background: rowIdx % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <div style={{ width: 42, flexShrink: 0, textAlign: 'center', fontSize: 17, fontWeight: 900, color: '#374151' }}>{h}</div>
                      <div style={{ width: 34, flexShrink: 0, fontSize: 15, color: '#9ca3af', textAlign: 'center', fontWeight: 700 }}>{hp}</div>
                      {activePlayers.map(p => <PGAScoreCellRR key={p} stroke={getStroke(p)} par={hp} />)}
                    </div>
                  );
                })}
                {/* Section subtotal row */}
                <div style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '8px 0', background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                  <div style={{ width: 42, flexShrink: 0, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#166534' }}>{label}</div>
                  <div style={{ width: 34, flexShrink: 0, fontSize: 13, color: '#166534', textAlign: 'center', fontWeight: 700 }}>{sectionPar}</div>
                  {activePlayers.map(p => (
                    <div key={p} style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 800, color: '#166534' }}>{calcTotal(p, holeList) || '-'}</div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Grand total row */}
          <div style={{
            backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden',
            ...(forCapture ? {} : { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' })
          }}>
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '10px 0', background: '#f0fdf4', borderTop: '2px solid #166534' }}>
              <div style={{ width: 42, flexShrink: 0, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#166534' }}>TOT</div>
              <div style={{ width: 34, flexShrink: 0, fontSize: 14, color: '#166534', textAlign: 'center', fontWeight: 700 }}>{totalPar}</div>
              {activePlayers.map(p => (
                <div key={p} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: getVsColor(playerTotals[p], totalPar) }}>{playerTotals[p]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: getVsColor(playerTotals[p], totalPar) }}>{formatDiff(playerTotals[p] - totalPar)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ===== HORIZONTAL Tables (matching ScorecardSection: 14px, tableLayout fixed) ===== */
        <>
          {[
            { label: 'OUT', holeList: frontNine },
            { label: 'IN', holeList: backNine }
          ].filter(s => s.holeList.length > 0).map(({ label, holeList }) => (
            <div key={label} style={{
              backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden',
              ...(forCapture ? {} : { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' })
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ backgroundColor: label === 'OUT' ? '#047857' : '#b91c1c', color: 'white' }}>
                    <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: 700, width: '55px' }}>{label}</th>
                    {holeList.map(h => (
                      <th key={h} style={{ padding: '8px 0', textAlign: 'center', fontWeight: 700 }}>{h}</th>
                    ))}
                    <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 700, width: '35px' }}>Tot</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <td style={{ padding: '8px 4px', fontWeight: 700, color: '#111827' }}>Par</td>
                    {holeList.map(h => (
                      <td key={h} style={{ padding: '8px 0', textAlign: 'center', color: '#111827' }}>{pars[h] || 4}</td>
                    ))}
                    <td style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 700, color: '#111827' }}>
                      {calcParTotal(holeList)}
                    </td>
                  </tr>
                  {activePlayers.map((name, idx) => (
                    <tr key={name} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '6px 4px', fontWeight: 700, color: '#374151', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</td>
                      {holeList.map(h => {
                        const on = allScores[name]?.[h] || 0;
                        const putt = allPutts[name]?.[h] || 0;
                        const score = on + putt;
                        const par = pars[h] || 4;
                        return (
                          <td key={h} style={{
                            padding: '8px 0', textAlign: 'center',
                            color: score ? getScoreColor(score, par) : '#9ca3af',
                            fontWeight: score && score !== par ? 700 : 400
                          }}>
                            {score || '-'}
                          </td>
                        );
                      })}
                      <td style={{
                        padding: '8px 4px', textAlign: 'center', fontWeight: 700, color: '#111827'
                      }}>
                        {calcTotal(name, holeList) || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}

      {/* ===== Footer ===== */}
      <div style={{
        textAlign: 'center', padding: '10px',
        backgroundColor: forCapture ? '#f0fdf4' : 'transparent',
        borderTop: forCapture ? '1px solid #d1fae5' : 'none'
      }}>
        <span style={{ color: '#047857', marginRight: '6px' }}>⛳</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>
          Powered by <span style={{ color: '#047857' }}>HandinCap.golf</span>
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
export const RoundReportShareModal = memo(({ isOpen, onClose, reportData, lang = 'en', showToast, linkOnly = false, editLog = [] }) => {
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
        backgroundColor: '#f0fdf4',
        scale: 5,
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
    const url = generateRoundReportUrl(reportData, linkOnly, editLog);
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
          {!linkOnly && (
            <button
              onClick={handleImageShare}
              disabled={capturing}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                backgroundColor: capturing ? '#d1d5db' : '#047857', color: 'white',
                border: 'none', cursor: capturing ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              {capturing ? '⏳' : '📷'} {lang === 'zh' ? '分享图片' : 'Share Image'}
            </button>
          )}
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
        <div style={{ padding: '0 12px 12px', maxHeight: linkOnly ? '70vh' : '60vh', overflowY: 'auto' }}>
          <div ref={captureRef}>
            <RoundReportCard data={reportData} forCapture={!linkOnly} vertical={linkOnly} />
          </div>
        </div>
      </div>
    </div>
  );
});


// ========== Inline Edit Log (for shared pages) ==========
export const EditLogInline = memo(({ logs }) => {
  if (!logs || logs.length === 0) return null;
  
  const fieldLabel = (f) => ({ score: 'Score', putts: 'Putts', up: 'UP' }[f] || f);
  const fmtVal = (f, v) => {
    if (f === 'up') {
      if (typeof v === 'string') return v;
      return v ? '✓' : '✗';
    }
    return v;
  };
  const fmtTime = (ts) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📋</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Edit Log</span>
          </div>
          <span style={{ fontSize: 12, color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
            {logs.length} edit{logs.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>All score modifications are recorded</p>
      </div>
      <div style={{ padding: '8px 12px' }}>
        {logs.map((log) => (
          <div key={log.id} style={{ background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 8, border: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Hole {log.hole}</span>
                {log.editedByLabel && (
                  <span style={{ padding: '2px 8px', background: '#dbeafe', color: '#1d4ed8', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{log.editedByLabel}</span>
                )}
              </div>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{fmtTime(log.timestamp)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {log.changes.map((c, ci) => (
                <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', borderRadius: 8, padding: '6px 10px', border: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', minWidth: 36 }}>{c.player}</span>
                  <span style={{
                    padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: c.field === 'score' ? '#dcfce7' : c.field === 'putts' ? '#ede9fe' : '#fef3c7',
                    color: c.field === 'score' ? '#166534' : c.field === 'putts' ? '#6d28d9' : '#92400e',
                  }}>{fieldLabel(c.field)}</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ color: '#ef4444', textDecoration: 'line-through', fontSize: 13, fontFamily: 'monospace' }}>{fmtVal(c.field, c.from)}</span>
                  <span style={{ color: '#d1d5db', fontSize: 11 }}>→</span>
                  <span style={{ color: '#059669', fontWeight: 700, fontSize: 13, fontFamily: 'monospace' }}>{fmtVal(c.field, c.to)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ========== Inline Feedback (for shared pages) ==========
export const FeedbackInline = memo(({ courseName = '' }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [categories, setCategories] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const activeRating = hoverRating || rating;
  const starLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];
  const CATS = [
    { key: 'modes', label: '🎮 New Modes' }, { key: 'ui', label: '🎨 UI/UX' },
    { key: 'speed', label: '⚡ Speed' }, { key: 'course', label: '⛳ Course DB' },
    { key: 'scoring', label: '📊 Scoring' }, { key: 'mp', label: '👥 Multiplayer' },
    { key: 'bug', label: '🐛 Bug Report' }, { key: 'other', label: '💬 Other' },
  ];
  const toggleCat = (k) => setCategories(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch('https://handincap.golf/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating, categories: categories.map(k => k), comment,
          course: courseName, lang: navigator.language || 'en',
          ts: new Date().toISOString(), ua: navigator.userAgent,
        }),
      });
    } catch (e) { console.warn('Feedback error:', e); }
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center', padding: '32px 20px' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Thank You!</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Your feedback helps us improve HandinCap</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>💬</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Rate Your Experience</span>
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Help us improve HandinCap</p>
      </div>
      <div style={{ padding: '12px 16px 20px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[1,2,3,4,5].map(s => (
              <span key={s} onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                style={{ fontSize: 36, cursor: 'pointer', userSelect: 'none', transition: 'transform 0.15s', transform: activeRating >= s ? 'scale(1.1)' : 'scale(1)' }}>
                {activeRating >= s ? '⭐' : '☆'}
              </span>
            ))}
            {activeRating > 0 && <span style={{ fontSize: 13, color: '#059669', fontWeight: 600, marginLeft: 8 }}>{starLabels[activeRating]}</span>}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>What can we improve?</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {CATS.map(({ key, label }) => {
              const active = categories.includes(key);
              return (
                <div key={key} onClick={() => toggleCat(key)} style={{
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer', userSelect: 'none',
                  border: `2px solid ${active ? '#059669' : '#e5e7eb'}`, background: active ? '#ecfdf5' : 'white',
                  color: active ? '#065f46' : '#374151', fontWeight: active ? 600 : 500, fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
                }}>{active && <span style={{ color: '#059669' }}>✓</span>}{label}</div>
              );
            })}
          </div>
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Any additional thoughts? (optional)" rows={3}
          style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
          onFocus={(e) => e.target.style.borderColor = '#059669'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
        <button onClick={handleSubmit} disabled={submitting || rating === 0} style={{
          width: '100%', padding: 14, borderRadius: 12, border: 'none', cursor: (submitting || rating === 0) ? 'not-allowed' : 'pointer',
          background: (submitting || rating === 0) ? '#d1d5db' : 'linear-gradient(135deg, #059669, #047857)',
          color: 'white', fontSize: 15, fontWeight: 700,
          boxShadow: rating > 0 ? '0 4px 14px rgba(5,150,105,0.4)' : 'none', transition: 'all 0.2s',
        }}>{submitting ? '⏳ Submitting...' : '📨 Submit Feedback'}</button>
      </div>
    </div>
  );
});


// ========== Round Report 独立查看页 (URL 打开) ==========

export const RoundReportPage = memo(({ encoded, vertical = false, editLogEncoded = null }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [editLogs, setEditLogs] = useState([]);

  useEffect(() => {
    try {
      const decoded = decodeRoundReport(encoded);
      if (decoded) setData(decoded);
      else setError(true);
    } catch {
      setError(true);
    }
    // Decode edit log from URL param
    if (editLogEncoded) {
      setEditLogs(decodeEditLog(editLogEncoded));
    }
  }, [encoded, editLogEncoded]);

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
              backgroundColor: '#047857', color: 'white', borderRadius: '8px',
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
      position: 'fixed', inset: 0, zIndex: 10,
      overflowY: 'auto', WebkitOverflowScrolling: 'touch',
      background: 'linear-gradient(to bottom, #064e3b, #022c22)',
      padding: '16px'
    }}>
      <div style={{ width: '100%', margin: '0 auto' }}>
        <RoundReportCard data={data} vertical={vertical} />
        
        {/* Edit Log (if present in URL) */}
        {editLogs.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <EditLogInline logs={editLogs} />
          </div>
        )}

        {/* Feedback */}
        <div style={{ marginTop: 16 }}>
          <FeedbackInline courseName={data.courseFN || data.courseSN || ''} />
        </div>

        {/* Open in App button */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <a 
            href="/"
            style={{
              display: 'inline-block', padding: '12px 24px',
              backgroundColor: '#047857', color: 'white', borderRadius: '10px',
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