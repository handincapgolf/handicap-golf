// ViewerGameScreen.js — HandinCap Viewer Mode (read-only live game view)
// Independent component: Live tab + Card tab, zero input logic
//
// Props:
//   activePlayers, allScores, allPutts, allUps, scores, putts, pars, holes,
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

// ===== Scorecard cell — PGA style matching main program (uniform 26x26) =====
// Eagle: double circle, Birdie: single circle, Par: plain, Bogey: single square, Double+: double square
const S = 26; // uniform cell size (main program uses 32, viewer compact uses 26)
function ScoreCell({ stroke, par }) {
  if (stroke == null) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#d1d5db' }}>-</span>
      </div>
    );
  }
  const diff = stroke - par;
  const ns = { fontSize: 12, fontWeight: 700, lineHeight: 1, position: 'relative', zIndex: 1 };

  // Eagle: double circle (outer + inner border, both round)
  if (diff <= -2) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          position: 'relative', width: S, height: S, borderRadius: '50%',
          background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* outer circle */}
          <div style={{ position: 'absolute', inset: 0, border: '2px solid #f59e0b', borderRadius: '50%' }} />
          {/* inner circle */}
          <div style={{ position: 'absolute', inset: 3, border: '2px solid #f59e0b', borderRadius: '50%' }} />
          <span style={{ ...ns, color: '#92400e' }}>{stroke}</span>
        </div>
      </div>
    );
  }
  // Birdie: single circle
  if (diff === -1) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: S, height: S, borderRadius: '50%',
          border: '2px solid #3b82f6', background: '#dbeafe',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ ...ns, color: '#1d4ed8' }}>{stroke}</span>
        </div>
      </div>
    );
  }
  // Par: plain square (no border)
  if (diff === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: S, height: S, borderRadius: 2,
          background: '#f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ ...ns, color: '#374151' }}>{stroke}</span>
        </div>
      </div>
    );
  }
  // Bogey: single square
  if (diff === 1) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: S, height: S, borderRadius: 2,
          border: '2px solid #f97316', background: '#fff7ed',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ ...ns, color: '#c2410c' }}>{stroke}</span>
        </div>
      </div>
    );
  }
  // Double bogey+: double square (outer + inner border)
  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        position: 'relative', width: S, height: S, borderRadius: 2,
        background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {/* outer square */}
        <div style={{ position: 'absolute', inset: 0, border: '2px solid #dc2626', borderRadius: 2 }} />
        {/* inner square */}
        <div style={{ position: 'absolute', inset: 3, border: '2px solid #dc2626', borderRadius: 2 }} />
        <span style={{ ...ns, color: '#dc2626' }}>{stroke}</span>
      </div>
    </div>
  );
}

// ===== LIVE TAB =====
const TabLive = memo(({
  activePlayers, scores, putts, pars, holes, currentHole,
  completedHoles, allScores, allPutts, allUps, gameMode, stake,
  totalMoney, getHandicapForHole, selectedCourse, mp, t
}) => {
  const nowHoleNum = holes[currentHole];
  const nowPar = pars[nowHoleNum] || 4;
  const nowIndex = selectedCourse?.index?.[nowHoleNum - 1];
  const hasMoney = Number(stake) > 0;

  // Last completed hole (the "results" we show)
  const lastCompleted = completedHoles.length > 0
    ? completedHoles[completedHoles.length - 1]
    : null;
  const lastPar = lastCompleted ? (pars[lastCompleted] || 4) : null;

  // If no completed holes yet, show waiting state
  if (!lastCompleted) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: 40, opacity: 0.5 }}>⛳</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#6b7280' }}>
          Waiting for first hole to be completed...
        </div>

        {/* Show Now Playing preview even when no completed holes */}
        <NowPlayingCard
          holeNum={nowHoleNum} par={nowPar} index={nowIndex}
          activePlayers={activePlayers} getHandicapForHole={getHandicapForHole}
          t={t}
        />
      </div>
    );
  }

  // Build player data from LAST COMPLETED hole
  const playerData = activePlayers.map(p => {
    const on = allScores[p]?.[lastCompleted];
    const pt = allPutts[p]?.[lastCompleted];
    const hasScore = on !== undefined && on !== null;
    const stroke = hasScore ? on + (pt || 0) : null;
    const hcpStrokes = getHandicapForHole ? getHandicapForHole(p, lastCompleted, lastPar) : 0;
    const isUp = allUps?.[p]?.[lastCompleted] || false;
    const money = totalMoney?.[p] || 0;
    return { name: p, hasScore, stroke, hcpStrokes, isUp, on, pt, money };
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
      {/* Player cards — last completed hole results */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, overflow: 'auto' }}>
        {playerData.map(d => {
          const sc = d.stroke != null ? getScoreInfo(d.stroke, lastPar, t) : null;
          const mColor = d.money > 0 ? '#059669' : d.money < 0 ? '#dc2626' : '#9ca3af';
          const mText = d.money === 0 ? '$0' : d.money > 0 ? `+$${d.money.toFixed(1)}` : `-$${Math.abs(d.money).toFixed(1)}`;

          return (
            <div key={d.name} style={{
              padding: '8px 14px', borderRadius: 16,
              background: sc ? sc.bg : '#f9fafb',
              border: `2px solid ${sc ? sc.color + '4D' : '#e5e7eb'}`,
              flex: 1, minHeight: 0,
              display: 'flex', alignItems: 'center',
              transition: 'all 0.3s ease'
            }}>
              {/* Left: name + UP badge */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.name}
                  </div>
                  {d.isUp && (
                    <span style={{
                      fontSize: 10, fontWeight: 900, color: '#fff',
                      background: '#ef4444', padding: '1px 6px',
                      borderRadius: 6, letterSpacing: 1, lineHeight: '16px',
                      flexShrink: 0
                    }}>UP</span>
                  )}
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
                      <div style={{ fontSize: 12, color: '#d1d5db', marginTop: 3 }}>N/A</div>
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

              {/* Right: money or vs par */}
              <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                {hasMoney ? (
                  <div style={{ fontSize: 18, fontWeight: 900, color: mColor }}>{mText}</div>
                ) : (
                  (() => {
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

      {/* Now Playing preview card */}
      <NowPlayingCard
        holeNum={nowHoleNum} par={nowPar} index={nowIndex}
        activePlayers={activePlayers} getHandicapForHole={getHandicapForHole}
        t={t}
      />
    </div>
  );
});

// ===== NOW PLAYING CARD — compact preview of current hole =====
const NowPlayingCard = memo(({
  holeNum, par, index, activePlayers, getHandicapForHole,
  t
}) => {
  // Who gets handicap strokes on this hole?
  const hcpPlayers = activePlayers.filter(p => {
    const strokes = getHandicapForHole ? getHandicapForHole(p, holeNum, par) : 0;
    return strokes > 0;
  }).map(p => ({
    name: p,
    strokes: getHandicapForHole(p, holeNum, par),
  }));

  return (
    <div style={{
      flexShrink: 0, borderRadius: 14,
      background: 'linear-gradient(135deg, #fefce8, #fef9c3)',
      border: '1.5px solid #fde68a',
      padding: '10px 14px',
    }}>
      {/* Single line: Now Playing Hole X Par X Index X */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: hcpPlayers.length > 0 ? 6 : 0 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#78350f' }}>
          ⏳ Now Playing Hole {holeNum}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Par {par}</span>
        {index != null && (
          <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Index {index}</span>
        )}
      </div>

      {/* Handicap strokes info */}
      {hcpPlayers.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {hcpPlayers.map(hp => (
            <span key={hp.name} style={{
              fontSize: 11, fontWeight: 700,
              background: '#dcfce7', color: '#166534',
              padding: '2px 8px', borderRadius: 8,
            }}>
              🏌️ {hp.name} <span style={{ fontWeight: 800 }}>-{hp.strokes}</span>
            </span>
          ))}
        </div>
      )}
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
    <div style={{ flex: 1, width: '100%', alignSelf: 'stretch', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
      {/* Header */}
      <div style={{
        display: 'flex', width: '100%', padding: '6px 0', borderBottom: '2px solid #e5e7eb',
        position: 'sticky', top: 0, background: '#fff', zIndex: 2
      }}>
        <div style={{ width: 36, flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#9ca3af', textAlign: 'center' }}>#</div>
        <div style={{ width: 28, flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#9ca3af', textAlign: 'center' }}>P</div>
        {activePlayers.map(p => (
          <div key={p} style={{ flex: 1, fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            display: 'flex', width: '100%', alignItems: 'center', padding: '8px 0',
            borderBottom: '1px solid #f3f4f6',
            background: isCurrent ? '#fffbeb' : 'transparent'
          }}>
            <div style={{ width: 36, flexShrink: 0, textAlign: 'center', fontSize: 14, fontWeight: 900, color: isCurrent ? '#b45309' : '#374151' }}>
              {h}
            </div>
            <div style={{ width: 28, flexShrink: 0, fontSize: 12, color: '#9ca3af', textAlign: 'center', fontWeight: 600 }}>
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
          display: 'flex', width: '100%', alignItems: 'center', padding: '10px 0',
          background: '#f9fafb', borderTop: '2px solid #e5e7eb',
          position: 'sticky', bottom: 0
        }}>
          <div style={{ width: 36, flexShrink: 0, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#6b7280' }}>TOT</div>
          <div style={{ width: 28, flexShrink: 0, fontSize: 11, color: '#6b7280', textAlign: 'center', fontWeight: 700 }}>{totalPar}</div>
          {activePlayers.map(p => (
            <div key={p} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: getVsColor(p) }}>{getPlayerTotal(p)}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: getVsColor(p) }}>{getVsPar(p)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ===== MAIN ViewerGameScreen =====
const ViewerGameScreen = memo(({
  activePlayers, allScores, allPutts, allUps, scores, putts,
  pars, holes, currentHole, completedHoles,
  gameMode, stake, selectedCourse, totalMoney,
  currentHoleSettlement, getHandicapForHole, mp, t, setCurrentSection
}) => {
  const [tab, setTab] = useState('live');

  const holeNum = holes[currentHole];
  const curPar = pars[holeNum] || 4;
  const courseName = selectedCourse?.shortName || selectedCourse?.fullName || '';

  // Last completed hole for display in course bar
  const lastCompletedHole = completedHoles.length > 0
    ? completedHoles[completedHoles.length - 1]
    : null;
  // Show last completed hole info in bar (what Live tab displays), fallback to current
  const barHole = lastCompletedHole || holeNum;
  const barPar = pars[barHole] || 4;
  const barIndex = selectedCourse?.index?.[barHole - 1];

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
        background: 'linear-gradient(90deg, #14532d, #166534)',
        padding: '5px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#86efac', letterSpacing: 2 }}>
          👁 VIEW ONLY
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80' }}>
          ● LIVE
        </span>
      </div>

      {/* Course bar — shows last completed hole (what Live tab displays) */}
      <div style={{
        flexShrink: 0, padding: '6px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f3f4f6',
        background: 'linear-gradient(90deg, #f0fdf4, #fff)'
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#14532d' }}>{courseName}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {lastCompletedHole ? (
            <span style={{ fontSize: 13, fontWeight: 800, color: '#166534' }}>
              ✅ {t('hole') || 'Hole'} {lastCompletedHole}
            </span>
          ) : (
            <span style={{ fontSize: 13, fontWeight: 800, color: '#9ca3af' }}>
              ⏳ {t('hole') || 'Hole'} {holeNum}
            </span>
          )}
          <span style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>Par {barPar}</span>
          {barIndex != null && (
            <span style={{
              fontSize: 10, background: '#fef3c7', color: '#b45309',
              padding: '1px 6px', borderRadius: 4, fontWeight: 700
            }}>
              Index {barIndex}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 4, padding: '6px 12px', background: '#f0fdf4' }}>
        {tabList.map(tb => {
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
              background: active ? 'linear-gradient(135deg, #166534, #14532d)' : 'transparent',
              color: active ? '#fff' : '#6b7280',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: active ? '0 2px 6px rgba(22,101,52,0.3)' : 'none'
            }}>
              {tb.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '6px 12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ flex: 1, display: tab === 'live' ? 'flex' : 'none', flexDirection: 'column', overflow: 'hidden' }}>
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
            allUps={allUps}
            gameMode={gameMode}
            stake={stake}
            totalMoney={totalMoney}
            getHandicapForHole={getHandicapForHole}
            selectedCourse={selectedCourse}
            mp={mp}
            t={t}
          />
        </div>
        <div style={{ flex: 1, width: '100%', display: tab === 'card' ? 'flex' : 'none', flexDirection: 'column', alignItems: 'stretch', minHeight: 0 }}>
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
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        flexShrink: 0, padding: '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid #dcfce7'
      }}>
        <button
          onClick={() => {
            mp.resetMultiplayer();
            mp.setMultiplayerSection(null);
            setCurrentSection('home');
          }}
          style={{
            background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
            borderRadius: 12, padding: '8px 20px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer'
          }}
        >
          {t('exit') || 'Exit'}
        </button>
        <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>
          ● {mp.syncStatus === 'connected' ? 'Syncing' : mp.syncStatus === 'error' ? 'Reconnecting...' : 'Connecting...'}
        </span>
      </div>
    </div>
  );
});

export default ViewerGameScreen;