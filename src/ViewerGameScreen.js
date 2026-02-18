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
          {t('viewerWaitingFirst') || 'Waiting for first hole to be completed...'}
        </div>

        {/* Show Now Playing preview even when no completed holes */}
        <NowPlayingCard
          holeNum={nowHoleNum} par={nowPar} index={nowIndex}
          activePlayers={activePlayers} getHandicapForHole={getHandicapForHole}
          scores={scores} putts={putts}
          mp={mp} t={t}
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
    const money = totalMoney?.[p] || 0;
    return { name: p, hasScore, stroke, hcpStrokes, on, pt, money };
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
      {/* Header: which hole's results we're showing */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>
          ✅ {t('hole') || 'Hole'} {lastCompleted} {t('viewerResults') || 'Results'}
        </span>
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
          Par {lastPar} · {completedHoles.length}/{holes.length} {t('viewerPlayed') || 'played'}
        </span>
      </div>

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
        scores={scores} putts={putts}
        mp={mp} t={t}
      />
    </div>
  );
});

// ===== NOW PLAYING CARD — compact preview of current hole =====
const NowPlayingCard = memo(({
  holeNum, par, index, activePlayers, getHandicapForHole,
  scores, putts, mp, t
}) => {
  // Who gets handicap strokes on this hole?
  const hcpPlayers = activePlayers.filter(p => {
    const strokes = getHandicapForHole ? getHandicapForHole(p, holeNum, par) : 0;
    return strokes > 0;
  }).map(p => ({
    name: p,
    strokes: getHandicapForHole(p, holeNum, par),
  }));

  // How many players have entered scores already?
  const enteredCount = activePlayers.filter(p => scores[p] != null).length;

  // Confirmed progress
  const summary = mp.getConfirmedSummary();

  return (
    <div style={{
      flexShrink: 0, borderRadius: 14,
      background: 'linear-gradient(135deg, #fefce8, #fef9c3)',
      border: '1.5px solid #fde68a',
      padding: '10px 14px',
    }}>
      {/* Top row: hole info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#92400e' }}>
            ⏳ {t('viewerNowPlaying') || 'Now Playing'}
          </span>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#78350f' }}>
            #{holeNum}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#92400e',
            background: '#fef3c7', padding: '2px 8px', borderRadius: 6,
          }}>
            Par {par}
          </span>
          {index != null && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#92400e',
              background: '#fef3c7', padding: '2px 8px', borderRadius: 6,
            }}>
              SI {index}
            </span>
          )}
        </div>
      </div>

      {/* Handicap strokes info */}
      {hcpPlayers.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
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

      {/* Progress: scores entered + confirmed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#a16207' }}>
        <span>
          ✏️ {enteredCount}/{activePlayers.length} {t('viewerScored') || 'scored'}
        </span>
        <span>
          ✅ {summary.confirmed}/{summary.total} {t('viewerConfirmed') || 'confirmed'}
        </span>
      </div>
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

      {/* Course bar — shows last completed hole (what Live tab displays) */}
      <div style={{
        flexShrink: 0, padding: '6px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{courseName}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {lastCompletedHole ? (
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1f2937' }}>
              ✅ {t('hole') || 'Hole'} {lastCompletedHole}
            </span>
          ) : (
            <span style={{ fontSize: 13, fontWeight: 800, color: '#9ca3af' }}>
              ⏳ {t('hole') || 'Hole'} {holeNum}
            </span>
          )}
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Par {barPar}</span>
          {barIndex != null && (
            <span style={{
              fontSize: 10, background: '#fef3c7', color: '#b45309',
              padding: '1px 6px', borderRadius: 4, fontWeight: 700
            }}>
              SI {barIndex}
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
            selectedCourse={selectedCourse}
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