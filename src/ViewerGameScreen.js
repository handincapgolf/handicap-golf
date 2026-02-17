// ViewerGameScreen.js — HandinCap Viewer Mode (read-only live game view)
// Independent component: Live tab + Card tab, zero input logic
//
// Props:
//   activePlayers, allScores, allPutts, scores, putts, pars, holes,
//   currentHole, completedHoles, gameMode, stake, selectedCourse,
//   totalMoney, currentHoleSettlement, mp, t, setCurrentSection

import { useState, useMemo, memo } from 'react';

// ===== Score label helpers =====
// Score label — uses t() for i18n, fallback to English
const getScoreInfo = (stroke, par, t) => {
  const d = stroke - par;
  if (d <= -2) return { label: t('eagle') || 'Eagle', color: '#f59e0b', bg: '#fffbeb' };
  if (d === -1) return { label: t('birdie') || 'Birdie', color: '#3b82f6', bg: '#eff6ff' };
  if (d === 0)  return { label: t('parLabel') || 'Par', color: '#374151', bg: '#f9fafb' };
  if (d === 1)  return { label: t('bogey') || 'Bogey', color: '#f97316', bg: '#fff7ed' };
  return { label: t('doubleplus') || 'Dbl Bogey+', color: '#dc2626', bg: '#fef2f2' };
};

// ===== Scorecard cell renderer (circle/square symbols) =====
function ScoreCell({ stroke, par }) {
  if (stroke == null) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#d1d5db' }}>·</span>
      </div>
    );
  }
  const diff = stroke - par;
  const ns = { fontSize: 14, fontWeight: 800, lineHeight: 1 };

  // Eagle or better: double circle
  if (diff <= -2) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '2px solid #f59e0b', outline: '2px solid #f59e0b', outlineOffset: '2px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          ...ns, color: '#f59e0b'
        }}>{stroke}</span>
      </div>
    );
  }
  // Birdie: single circle
  if (diff === -1) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{
          width: 26, height: 26, borderRadius: '50%',
          border: '2px solid #3b82f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          ...ns, color: '#3b82f6'
        }}>{stroke}</span>
      </div>
    );
  }
  // Par: plain
  if (diff === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ ...ns, color: '#374151' }}>{stroke}</span>
      </div>
    );
  }
  // Bogey: single square
  if (diff === 1) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{
          width: 26, height: 26, borderRadius: 4,
          border: '2px solid #f97316',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          ...ns, color: '#f97316'
        }}>{stroke}</span>
      </div>
    );
  }
  // Double bogey+: double square
  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <span style={{
        width: 28, height: 28, borderRadius: 4,
        border: '2px solid #dc2626', outline: '2px solid #dc2626', outlineOffset: '2px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...ns, color: '#dc2626'
      }}>{stroke}</span>
    </div>
  );
}

// ===== LIVE TAB =====
const TabLive = memo(({
  activePlayers, scores, putts, pars, holes, currentHole,
  completedHoles, allScores, allPutts, gameMode, stake,
  totalMoney, getHandicapForHole, mp, t
}) => {
  const holeNum = holes[currentHole];
  const curPar = pars[holeNum] || 4;
  const hasMoney = Number(stake) > 0;

  // Confirmed progress
  const summary = mp.getConfirmedSummary();

  // Per-player: confirmed status + current hole score + handicap
  const playerData = activePlayers.map(p => {
    const deviceId = mp.claimed[p];
    const isConfirmed = deviceId ? (mp.confirmed[deviceId] || false) : false;
    const on = scores[p];
    const pt = putts[p];
    const hasScore = on !== undefined && on !== null;
    const stroke = hasScore ? on + (pt || 0) : null;
    const hcpStrokes = getHandicapForHole ? getHandicapForHole(p, holeNum, curPar) : 0;
    const money = totalMoney?.[p] || 0;
    return { name: p, isConfirmed, hasScore, stroke, hcpStrokes, on, pt, money };
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
      {/* Confirm progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 4, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: '#22c55e', borderRadius: 4,
            width: (summary.total > 0 ? (summary.confirmed / summary.total * 100) : 0) + '%',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>
          {summary.confirmed}/{summary.total}
        </span>
      </div>

      {/* Player cards */}
      {playerData.map(d => {
        const sc = d.stroke != null ? getScoreInfo(d.stroke, curPar, t) : null;
        const mColor = d.money > 0 ? '#059669' : d.money < 0 ? '#dc2626' : '#9ca3af';
        const mText = d.money === 0 ? '$0' : d.money > 0 ? `+$${d.money.toFixed(1)}` : `-$${Math.abs(d.money).toFixed(1)}`;

        return (
          <div key={d.name} style={{
            padding: '8px 14px', borderRadius: 16,
            background: sc ? sc.bg : '#f9fafb',
            border: d.isConfirmed
              ? `2px solid ${sc ? sc.color + '4D' : '#e5e7eb'}`
              : '2px dashed #e5e7eb',
            flex: 1, minHeight: 0,
            display: 'flex', alignItems: 'center',
            transition: 'all 0.3s ease'
          }}>
            {/* Left: name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d.name}
              </div>
            </div>

            {/* Center: score (gross) + handicap badge */}
            <div style={{ textAlign: 'center', minWidth: 70 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {d.stroke != null ? (
                  <>
                    <div style={{ fontSize: 48, fontWeight: 900, color: sc.color, lineHeight: 1 }}>{d.stroke}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: sc.color, marginTop: 3 }}>{sc.label}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 48, fontWeight: 900, color: '#e5e7eb', lineHeight: 1 }}>—</div>
                    <div style={{ fontSize: 12, color: '#d1d5db', marginTop: 3 }}>⏳</div>
                  </>
                )}
                {d.hcpStrokes > 0 && (
                  <div style={{
                    position: 'absolute', top: -4, right: -14,
                    background: '#22c55e', color: '#fff',
                    fontSize: 11, fontWeight: 800,
                    padding: '1px 5px', borderRadius: 10,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    lineHeight: '16px'
                  }}>
                    -{d.hcpStrokes}
                  </div>
                )}
              </div>
            </div>

            {/* Right: money if available, otherwise vs par */}
            <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              {hasMoney ? (
                <div style={{ fontSize: 18, fontWeight: 900, color: mColor }}>{mText}</div>
              ) : (
                (() => {
                  // Show cumulative vs par for non-baccarat
                  const totalStroke = completedHoles.reduce((sum, h) =>
                    sum + (allScores[d.name]?.[h] || 0) + (allPutts[d.name]?.[h] || 0), 0);
                  const totalPar = completedHoles.reduce((sum, h) => sum + (pars[h] || 4), 0);
                  if (completedHoles.length === 0) return null;
                  const diff = totalStroke - totalPar;
                  const vsText = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`;
                  const vsColor = diff < 0 ? '#059669' : diff === 0 ? '#6b7280' : '#dc2626';
                  return <div style={{ fontSize: 18, fontWeight: 900, color: vsColor }}>{vsText}</div>;
                })()
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

// ===== CARD TAB =====
const TabCard = memo(({
  activePlayers, allScores, allPutts, scores, putts,
  pars, holes, currentHole, completedHoles
}) => {
  const holeNum = holes[currentHole];
  // Show completed holes + current hole
  const displayHoles = [...completedHoles];
  if (!displayHoles.includes(holeNum)) displayHoles.push(holeNum);
  // Sort by hole order
  const holeOrder = holes.slice(0); // all holes in play order
  displayHoles.sort((a, b) => holeOrder.indexOf(a) - holeOrder.indexOf(b));

  // Get stroke for a player at a hole
  const getStroke = (player, h) => {
    if (h === holeNum && !completedHoles.includes(h)) {
      // Current hole — use live scores
      const on = scores[player];
      const pt = putts[player];
      if (on == null) return null;
      return on + (pt || 0);
    }
    // Completed hole
    const on = allScores[player]?.[h];
    const pt = allPutts[player]?.[h];
    if (on == null) return null;
    return on + (pt || 0);
  };

  // Totals
  const totalPar = completedHoles.reduce((sum, h) => sum + (pars[h] || 4), 0);
  const getPlayerTotal = (p) => completedHoles.reduce((sum, h) =>
    sum + (allScores[p]?.[h] || 0) + (allPutts[p]?.[h] || 0), 0);
  const getVsPar = (p) => {
    const total = getPlayerTotal(p);
    const diff = total - totalPar;
    return diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`;
  };
  const getVsColor = (p) => {
    const diff = getPlayerTotal(p) - totalPar;
    return diff < 0 ? '#059669' : diff === 0 ? '#6b7280' : '#dc2626';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {/* Header */}
        <div style={{
          display: 'flex', padding: '4px 0', borderBottom: '2px solid #f3f4f6',
          position: 'sticky', top: 0, background: '#fff', zIndex: 2
        }}>
          <div style={{ width: 40, fontSize: 10, fontWeight: 700, color: '#9ca3af', textAlign: 'center' }}>#</div>
          <div style={{ width: 30, fontSize: 10, fontWeight: 700, color: '#9ca3af', textAlign: 'center' }}>P</div>
          {activePlayers.map(p => (
            <div key={p} style={{ flex: 1, fontSize: 10, fontWeight: 700, color: '#6b7280', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p}
            </div>
          ))}
        </div>

        {/* Hole rows */}
        {displayHoles.map(h => {
          const hp = pars[h] || 4;
          const isCurrent = h === holeNum && !completedHoles.includes(h);
          return (
            <div key={h} style={{
              display: 'flex', alignItems: 'center', padding: '7px 0',
              borderBottom: '1px solid #f9fafb',
              background: isCurrent ? '#fffbeb' : 'transparent'
            }}>
              <div style={{ width: 40, textAlign: 'center', fontSize: 13, fontWeight: 900, color: isCurrent ? '#b45309' : '#d1d5db' }}>
                {h}
              </div>
              <div style={{ width: 30, fontSize: 11, color: '#9ca3af', textAlign: 'center', fontWeight: 600 }}>
                {hp}
              </div>
              {activePlayers.map(p => (
                <ScoreCell key={p} stroke={getStroke(p, h)} par={hp} />
              ))}
            </div>
          );
        })}

        {/* Total row */}
        {completedHoles.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', padding: '10px 0',
            background: '#f9fafb', borderTop: '2px solid #f3f4f6',
            position: 'sticky', bottom: 0
          }}>
            <div style={{ width: 40, textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#6b7280' }}>TOT</div>
            <div style={{ width: 30, fontSize: 10, color: '#6b7280', textAlign: 'center', fontWeight: 700 }}>{totalPar}</div>
            {activePlayers.map(p => (
              <div key={p} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: getVsColor(p) }}>{getPlayerTotal(p)}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: getVsColor(p) }}>{getVsPar(p)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// ===== MAIN ViewerGameScreen =====
const ViewerGameScreen = memo(({
  activePlayers, allScores, allPutts, scores, putts,
  pars, holes, currentHole, completedHoles,
  gameMode, stake, selectedCourse, totalMoney,
  currentHoleSettlement, getHandicapForHole, mp, t, setCurrentSection
}) => {
  const [tab, setTab] = useState('live');

  const holeNum = holes[currentHole];
  const curPar = pars[holeNum] || 4;
  const courseName = selectedCourse?.shortName || selectedCourse?.fullName || '';
  const holeIndex = selectedCourse?.index?.[holeNum - 1];

  const tabList = [
    { id: 'live', label: `⛳ ${t('live') || 'Live'}` },
    { id: 'card', label: `📋 ${t('scorecard') || 'Card'}` },
  ];

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#fff', color: '#1f2937',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: 430, margin: '0 auto', overflow: 'hidden'
    }}>
      {/* Viewer banner */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(90deg, #7c3aed, #6366f1)',
        padding: '5px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#e9d5ff', letterSpacing: 2 }}>
          👁 {t('mpViewerBanner') || 'VIEWER MODE'}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#bbf7d0' }}>
          ● LIVE
        </span>
      </div>

      {/* Course bar */}
      <div style={{
        flexShrink: 0, padding: '6px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{courseName}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#1f2937' }}>
            {t('hole') || 'Hole'} {holeNum}
          </span>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Par {curPar}</span>
          {holeIndex != null && (
            <span style={{
              fontSize: 10, background: '#fef3c7', color: '#b45309',
              padding: '1px 6px', borderRadius: 4, fontWeight: 700
            }}>
              Index {holeIndex}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 4, padding: '6px 12px', background: '#f9fafb' }}>
        {tabList.map(tb => {
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
              background: active ? '#111827' : 'transparent',
              color: active ? '#fff' : '#9ca3af',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              {tb.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '6px 12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'live' && (
          <TabLive
            activePlayers={activePlayers}
            scores={scores}
            putts={putts}
            pars={pars}
            holes={holes}
            currentHole={currentHole}
            completedHoles={completedHoles}
            allScores={allScores}
            allPutts={allPutts}
            gameMode={gameMode}
            stake={stake}
            totalMoney={totalMoney}
            getHandicapForHole={getHandicapForHole}
            mp={mp}
            t={t}
          />
        )}
        {tab === 'card' && (
          <TabCard
            activePlayers={activePlayers}
            allScores={allScores}
            allPutts={allPutts}
            scores={scores}
            putts={putts}
            pars={pars}
            holes={holes}
            currentHole={currentHole}
            completedHoles={completedHoles}
          />
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        flexShrink: 0, padding: '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid #f3f4f6'
      }}>
        <button
          onClick={() => {
            mp.resetMultiplayer();
            mp.setMultiplayerSection(null);
            setCurrentSection('home');
          }}
          style={{
            background: '#f3f4f6', color: '#6b7280', border: 'none',
            borderRadius: 12, padding: '8px 20px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer'
          }}
        >
          {t('exit') || 'Exit'}
        </button>
        <span style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>
          ● {mp.syncStatus === 'connected' ? 'Syncing' : mp.syncStatus === 'error' ? 'Reconnecting...' : 'Connecting...'}
        </span>
      </div>
    </div>
  );
});

export default ViewerGameScreen;