import React, { useState } from 'react';
import { AlertCircle, Edit2, Home, ChevronDown, ChevronUp, Droplets, XCircle } from 'lucide-react';

// ===== PGA-style ScoreCell (Vertical view) =====
const S = 40;
function ScoreCell({ stroke, par }) {
  if (stroke == null) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontSize: 16, color: '#d1d5db' }}>-</span>
      </div>
    );
  }
  const diff = stroke - par;
  const ns = { fontSize: 18, fontWeight: 800, lineHeight: 1, position: 'relative', zIndex: 1 };

  if (diff <= -2) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: S, height: S, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        <div style={{ width: S, height: S, borderRadius: '50%', border: '2px solid #3b82f6', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ ...ns, color: '#1d4ed8' }}>{stroke}</span>
        </div>
      </div>
    );
  }
  if (diff === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: S, height: S, borderRadius: 3, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ ...ns, color: '#374151' }}>{stroke}</span>
        </div>
      </div>
    );
  }
  if (diff === 1) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: S, height: S, borderRadius: 3, border: '2px solid #f97316', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ ...ns, color: '#c2410c' }}>{stroke}</span>
        </div>
      </div>
    );
  }
  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: S, height: S, borderRadius: 3, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, border: '2px solid #dc2626', borderRadius: 3 }} />
        <div style={{ position: 'absolute', inset: 4, border: '2px solid #dc2626', borderRadius: 3 }} />
        <span style={{ ...ns, color: '#dc2626' }}>{stroke}</span>
      </div>
    </div>
  );
}

// ===== Score color helper (Horizontal view) =====
const getScoreColor = (score, par) => {
  const diff = score - par;
  if (diff <= -2) return 'text-purple-600 font-bold';
  if (diff === -1) return 'text-blue-600 font-bold';
  if (diff === 0) return 'text-gray-900';
  if (diff === 1) return 'text-orange-600 font-bold';
  return 'text-red-600 font-bold';
};

// ===== PGA Legend =====
const PGALegend = ({ t }) => (
  <div className="bg-white rounded-lg p-3 shadow-sm">
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <div className="flex items-center gap-1">
        <div style={{ width: 18, height: 18, borderRadius: '50%', position: 'relative', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, border: '1.5px solid #f59e0b', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 2, border: '1.5px solid #f59e0b', borderRadius: '50%' }} />
        </div>
        <span className="text-xs text-gray-500">{t('eagle')}</span>
      </div>
      <div className="flex items-center gap-1">
        <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #3b82f6', background: '#dbeafe' }} />
        <span className="text-xs text-gray-500">{t('birdie')}</span>
      </div>
      <div className="flex items-center gap-1">
        <div style={{ width: 18, height: 18, borderRadius: 2, background: '#f3f4f6' }} />
        <span className="text-xs text-gray-500">{t('parLabel')}</span>
      </div>
      <div className="flex items-center gap-1">
        <div style={{ width: 18, height: 18, borderRadius: 2, border: '1.5px solid #f97316', background: '#fff7ed' }} />
        <span className="text-xs text-gray-500">{t('bogey')}</span>
      </div>
      <div className="flex items-center gap-1">
        <div style={{ width: 18, height: 18, borderRadius: 2, position: 'relative', background: '#fef2f2' }}>
          <div style={{ position: 'absolute', inset: 0, border: '1.5px solid #dc2626', borderRadius: 2 }} />
          <div style={{ position: 'absolute', inset: 2, border: '1.5px solid #dc2626', borderRadius: 2 }} />
        </div>
        <span className="text-xs text-gray-500">{t('doubleplus')}</span>
      </div>
    </div>
  </div>
);

// ===== OB / Water Penalty Widget (collapsible) =====
const PenaltyWidget = ({ activePlayers, completedHoles, allWater, allOb, holes, t }) => {
  const [expanded, setExpanded] = useState(false);

  // Check if there's any penalty data at all
  const hasAnyPenalty = activePlayers.some(p =>
    completedHoles.some(h =>
      (allWater?.[p]?.[h] || 0) > 0 || (allOb?.[p]?.[h] || 0) > 0
    )
  );

  // Player penalty totals
  const playerPenalties = activePlayers.map(p => {
    const totalWater = completedHoles.reduce((s, h) => s + (allWater?.[p]?.[h] || 0), 0);
    const totalOb = completedHoles.reduce((s, h) => s + (allOb?.[p]?.[h] || 0), 0);
    return { player: p, water: totalWater, ob: totalOb, total: totalWater + totalOb };
  });

  if (!hasAnyPenalty) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-red-50 hover:bg-red-100 transition"
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span className="text-sm font-semibold text-red-800">
            {t('penalties') || 'Penalties'} (OB / {t('water') || 'Water'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick summary chips */}
          {playerPenalties.filter(p => p.total > 0).map(p => (
            <span key={p.player} className="text-xs bg-red-200 text-red-800 px-1.5 py-0.5 rounded font-bold">
              {p.player}: {p.total}
            </span>
          ))}
          {expanded ? <ChevronUp className="w-4 h-4 text-red-600" /> : <ChevronDown className="w-4 h-4 text-red-600" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="p-3">
          {/* Per-player summary row */}
          <div className="flex gap-1 mb-3">
            {playerPenalties.map(({ player, water, ob }) => (
              <div key={player} className="flex-1 text-center py-2 bg-gray-50 rounded-lg min-w-0">
                <div className="text-xs font-medium text-gray-600 truncate px-1">{player}</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  {water > 0 && (
                    <span className="flex items-center gap-0.5 text-xs font-bold text-blue-700">
                      <Droplets className="w-3 h-3" />{water}
                    </span>
                  )}
                  {ob > 0 && (
                    <span className="flex items-center gap-0.5 text-xs font-bold text-red-700">
                      <XCircle className="w-3 h-3" />{ob}
                    </span>
                  )}
                  {water === 0 && ob === 0 && (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Per-hole detail table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full" style={{ fontSize: 12, tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-1 py-1.5 text-left font-bold text-gray-600" style={{ width: 42 }}>#</th>
                  {activePlayers.map(p => (
                    <th key={p} className="px-0 py-1.5 text-center font-bold text-gray-600 truncate">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...completedHoles].sort((a, b) => holes.indexOf(a) - holes.indexOf(b)).map(h => {
                  const hasHolePenalty = activePlayers.some(p =>
                    (allWater?.[p]?.[h] || 0) > 0 || (allOb?.[p]?.[h] || 0) > 0
                  );
                  if (!hasHolePenalty) return null;
                  return (
                    <tr key={h} className="border-b border-gray-100">
                      <td className="px-1 py-1.5 font-bold text-gray-700">{h}</td>
                      {activePlayers.map(p => {
                        const w = allWater?.[p]?.[h] || 0;
                        const o = allOb?.[p]?.[h] || 0;
                        return (
                          <td key={p} className="px-0 py-1.5 text-center">
                            {w > 0 && <span className="text-blue-600 font-bold mr-1">💧{w}</span>}
                            {o > 0 && <span className="text-red-600 font-bold">🚫{o}</span>}
                            {w === 0 && o === 0 && <span className="text-gray-300">-</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};


// ===== Main Component =====
const ScorecardSection = ({
  selectedCourse,
  completedHoles,
  activePlayers,
  allScores,
  allPutts,
  allWater,
  allOb,
  pars,
  holes,
  totalMoney,
  gameMode,
  stake,
  prizePool,
  gameComplete,
  editLog,
  mp,
  getHandicapForHole,
  getMedal,
  handleAdvancePlayerClick,
  handleSharePlayer,
  handleShareRoundReport,
  setCurrentSection,
  setHoleSelectDialog,
  setEditLogDialog,
  setFeedbackDialog,
  goHome,
  t,
}) => {
  const [scorecardView, setScorecardView] = useState('horizontal');

  // ── Derived data ──
  const hasData = completedHoles.length > 0;
  const totalPar = completedHoles.reduce((sum, h) => sum + (pars[h] || 4), 0);

  const getStroke = (player, h) => {
    const on = allScores[player]?.[h];
    const pt = allPutts[player]?.[h];
    if (on == null) return null;
    return on + (pt || 0);
  };

  const calculateTotal = (player, holesList) =>
    holesList.reduce((total, hole) =>
      total + (allScores[player]?.[hole] || 0) + (allPutts[player]?.[hole] || 0), 0);

  const calculateParTotal = (holesList) =>
    holesList.reduce((total, hole) => total + (pars[hole] || 4), 0);

  const getVsColor = (total, parTotal) => {
    const diff = total - parTotal;
    return diff < 0 ? '#059669' : diff === 0 ? '#6b7280' : '#dc2626';
  };

  // Player totals & rankings
  const playerTotals = {};
  activePlayers.forEach(p => { playerTotals[p] = calculateTotal(p, completedHoles); });

  const getVsPar = (p) => {
    const d = playerTotals[p] - totalPar;
    return d === 0 ? 'E' : d > 0 ? `+${d}` : `${d}`;
  };

  const frontNine = completedHoles.filter(h => h <= 9).sort((a, b) => a - b);
  const backNine = completedHoles.filter(h => h > 9).sort((a, b) => a - b);
  const displayHoles = [...completedHoles].sort((a, b) => holes.indexOf(a) - holes.indexOf(b));

  // ── Render ──
  return (
    <div className="space-y-3 py-3">
      {/* Course header */}
      {selectedCourse && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 text-white shadow-md text-center">
          <h1 className="text-lg font-bold mb-1">{selectedCourse.fullName}</h1>
          <p className="text-sm text-green-100">{selectedCourse.shortName}</p>
        </div>
      )}

      {/* View Toggle */}
      {gameComplete && hasData && (
        <div className="flex gap-1 p-1 bg-white rounded-xl shadow-sm">
          <button onClick={() => setScorecardView('horizontal')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              scorecardView === 'horizontal' ? 'bg-green-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}>{t('scorecardHorizontal')}</button>
          <button onClick={() => setScorecardView('vertical')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              scorecardView === 'vertical' ? 'bg-green-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}>{t('scorecardVertical')}</button>
        </div>
      )}

      {hasData ? (
        <>
          {/* Hint text */}
          <p className="text-xs text-gray-400 text-center mb-2">💡 {t('clickNameToView')}</p>

          {/* ── Total Score Summary ── */}
          <div className="bg-white rounded-lg p-3 shadow-sm mb-3">
            <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">
              {t('totalScore')} ({t('standardPar')}: {totalPar})
            </h3>
            <div className="flex gap-1">
              {activePlayers.map(player => {
                const total = playerTotals[player];
                const diff = total - totalPar;
                const diffStr = diff > 0 ? `+${diff}` : diff === 0 ? 'E' : `${diff}`;
                const diffColor = diff > 0 ? 'text-red-600' : diff === 0 ? 'text-gray-600' : 'text-green-600';
                return (
                  <div key={player} className="flex-1 text-center py-1.5 bg-gray-50 rounded-lg min-w-0">
                    <div className="cursor-pointer hover:bg-gray-100 rounded px-1" onClick={() => handleAdvancePlayerClick(player)}>
                      <div className="text-xs font-medium text-blue-600 underline truncate">{player}</div>
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-lg font-bold text-gray-900">{total || '-'}</span>
                        {total > 0 && (
                          <span className={`font-semibold ${diffColor}`} style={{ fontSize: 9 }}>{diffStr}</span>
                        )}
                      </div>
                    </div>
                    {gameComplete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSharePlayer(player); }}
                        className="mt-0.5 px-1.5 py-0.5 bg-green-100 hover:bg-green-200 text-green-700 rounded font-medium mx-auto flex items-center gap-0.5 justify-center"
                        style={{ fontSize: 10 }}
                      >
                        📤 {t('shareBtn')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {gameComplete && (
              <button
                onClick={() => handleShareRoundReport(scorecardView === 'vertical')}
                className="w-full mt-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
              >
                📊 {t('shareRoundReport')}
              </button>
            )}
          </div>

          {/* ── Settlement ── */}
          {(gameComplete || completedHoles.length === holes.length) && (Number(stake) > 0 || (gameMode === 'skins' && prizePool > 0)) && (
            <div className="bg-yellow-50 rounded-lg p-3 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">{t('finalSettlement')}</h3>
              {(gameMode === 'skins' || gameMode === 'win123') && prizePool > 0 && (
                <div className="mb-2 text-center p-1.5 bg-purple-100 rounded">
                  <span className="text-xs text-purple-700">{gameMode === 'win123' ? t('penaltyPot') : t('prizePool')}: </span>
                  <span className="text-sm font-bold text-purple-800 ml-1">${prizePool}</span>
                </div>
              )}
              <div className="flex gap-1">
                {activePlayers.map(player => {
                  const amount = totalMoney[player] || 0;
                  return (
                    <div key={player} className="flex-1 text-center py-1.5 bg-yellow-100 rounded-lg min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate px-1">{player}</div>
                      <div className={`text-lg font-bold ${amount > 0 ? 'text-green-600' : amount < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── OB / Water Penalty Widget ── */}
          <PenaltyWidget
            activePlayers={activePlayers}
            completedHoles={completedHoles}
            allWater={allWater}
            allOb={allOb}
            holes={holes}
            t={t}
          />

          {/* ── Scorecard Tables ── */}
          {scorecardView === 'horizontal' ? (
            // ===== HORIZONTAL (Front/Back Nine Tables) =====
            <>
              {frontNine.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3">
                  <table className="w-full" style={{ fontSize: '14px', tableLayout: 'fixed' }}>
                    <thead>
                      <tr className="bg-green-600 text-white">
                        <th className="px-1 py-2 text-left font-bold" style={{ width: '55px' }}>{t('out')}</th>
                        {frontNine.map(h => (
                          <th key={h} className="px-0 py-2 text-center font-bold">{h}</th>
                        ))}
                        <th className="px-1 py-2 text-center font-bold" style={{ width: '35px' }}>{t('total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-gray-50">
                        <td className="px-1 py-2 font-bold text-gray-900">{t('parLabel')}</td>
                        {frontNine.map(h => (
                          <td key={h} className="px-0 py-2 text-center text-gray-900">{pars[h] || 4}</td>
                        ))}
                        <td className="px-1 py-2 text-center font-bold text-gray-900">{calculateParTotal(frontNine)}</td>
                      </tr>
                      {activePlayers.map((player, idx) => (
                        <tr key={player} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-1 py-1.5 font-bold text-gray-700 truncate" style={{ fontSize: '12px' }}>{player}</td>
                          {frontNine.map(h => {
                            const score = getStroke(player, h);
                            const par = pars[h] || 4;
                            const handicapValue = getHandicapForHole(player, h, par);
                            return (
                              <td key={h} className={`px-0 py-2 text-center ${score ? getScoreColor(score, par) : ''}`}>
                                {score || '-'}
                                {score && !gameComplete && handicapValue > 0 && (
                                  <div style={{ fontSize: '8px', color: '#059669' }}>({score - handicapValue})</div>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-1 py-2 text-center font-bold text-gray-900">
                            {calculateTotal(player, frontNine) || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {backNine.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="w-full" style={{ fontSize: '14px', tableLayout: 'fixed' }}>
                    <thead>
                      <tr className="bg-green-600 text-white">
                        <th className="px-1 py-2 text-left font-bold" style={{ width: '55px' }}>{t('in')}</th>
                        {backNine.map(h => (
                          <th key={h} className="px-0 py-2 text-center font-bold">{h}</th>
                        ))}
                        <th className="px-1 py-2 text-center font-bold" style={{ width: '35px' }}>{t('total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-gray-50">
                        <td className="px-1 py-2 font-bold text-gray-900">{t('parLabel')}</td>
                        {backNine.map(h => (
                          <td key={h} className="px-0 py-2 text-center text-gray-900">{pars[h] || 4}</td>
                        ))}
                        <td className="px-1 py-2 text-center font-bold text-gray-900">{calculateParTotal(backNine)}</td>
                      </tr>
                      {activePlayers.map((player, idx) => (
                        <tr key={player} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-1 py-1.5 font-bold text-gray-700 truncate" style={{ fontSize: '12px' }}>{player}</td>
                          {backNine.map(h => {
                            const score = getStroke(player, h);
                            const par = pars[h] || 4;
                            const handicapValue = getHandicapForHole(player, h, par);
                            return (
                              <td key={h} className={`px-0 py-2 text-center ${score ? getScoreColor(score, par) : ''}`}>
                                {score || '-'}
                                {score && !gameComplete && handicapValue > 0 && (
                                  <div style={{ fontSize: '8px', color: '#059669' }}>({score - handicapValue})</div>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-1 py-2 text-center font-bold text-gray-900">
                            {calculateTotal(player, backNine) || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            // ===== VERTICAL (PGA-style ScoreCell) =====
            <>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Header row */}
                <div style={{ display: 'flex', width: '100%', padding: '10px 0', borderBottom: '2px solid #e5e7eb', background: '#166534' }}>
                  <div style={{ width: 42, flexShrink: 0, fontSize: 14, fontWeight: 700, color: '#fff', textAlign: 'center' }}>#</div>
                  <div style={{ width: 34, flexShrink: 0, fontSize: 14, fontWeight: 700, color: '#bbf7d0', textAlign: 'center' }}>P</div>
                  {activePlayers.map(p => (
                    <div key={p} style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#fff', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px' }}>{p}</div>
                  ))}
                </div>
                {/* Hole rows */}
                {displayHoles.map((h, rowIdx) => {
                  const hp = pars[h] || 4;
                  const isFirst10 = h === 10;
                  return (
                    <div key={h}>
                      {/* Front-nine subtotal before hole 10 */}
                      {isFirst10 && (
                        <div style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '4px 0', background: '#f0fdf4', borderTop: '2px solid #bbf7d0', borderBottom: '1px solid #dcfce7' }}>
                          <div style={{ width: 42, flexShrink: 0 }} />
                          <div style={{ width: 34, flexShrink: 0, fontSize: 14, color: '#166534', textAlign: 'center', fontWeight: 700 }}>
                            {completedHoles.filter(x => x <= 9).reduce((s, x) => s + (pars[x] || 4), 0)}
                          </div>
                          {activePlayers.map(p => {
                            const ft = completedHoles.filter(x => x <= 9).reduce((s, x) => s + (allScores[p]?.[x] || 0) + (allPutts[p]?.[x] || 0), 0);
                            return <div key={p} style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 800, color: '#166534' }}>{ft || '-'}</div>;
                          })}
                        </div>
                      )}
                      <div style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f3f4f6', background: rowIdx % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <div style={{ width: 42, flexShrink: 0, textAlign: 'center', fontSize: 17, fontWeight: 900, color: '#374151' }}>{h}</div>
                        <div style={{ width: 34, flexShrink: 0, fontSize: 15, color: '#9ca3af', textAlign: 'center', fontWeight: 700 }}>{hp}</div>
                        {activePlayers.map(p => <ScoreCell key={p} stroke={getStroke(p, h)} par={hp} />)}
                      </div>
                    </div>
                  );
                })}
                {/* Grand total row */}
                {completedHoles.length > 0 && (
                  <div style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '10px 0', background: '#f0fdf4', borderTop: '2px solid #166534' }}>
                    <div style={{ width: 42, flexShrink: 0, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#166534' }}>{t('total')}</div>
                    <div style={{ width: 34, flexShrink: 0, fontSize: 14, color: '#166534', textAlign: 'center', fontWeight: 700 }}>{totalPar}</div>
                    {activePlayers.map(p => (
                      <div key={p} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: getVsColor(playerTotals[p], totalPar) }}>{playerTotals[p]}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: getVsColor(playerTotals[p], totalPar) }}>{getVsPar(p)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <PGALegend t={t} />
            </>
          )}
        </>
      ) : (
        // ===== No data =====
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-blue-700 text-sm">{t('noScoreData')}</p>
        </div>
      )}

      {/* Edit log button */}
      {editLog.length > 0 && (
        <button
          onClick={() => setEditLogDialog({ isOpen: true, hole: null })}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-gray-200 shadow-sm"
        >
          📋 {t('editLogTitle')}
          <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{editLog.length}</span>
        </button>
      )}

      {/* Feedback button (game complete only) */}
      {gameComplete && (
        <button
          onClick={() => setFeedbackDialog(true)}
          style={{ border: '2px dashed #f59e0b', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}
          className="w-full text-amber-800 py-3 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-[15px]"
        >
          {t('feedbackBtn')}
        </button>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!gameComplete ? (
          <>
            <button
              onClick={() => setCurrentSection('game')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
            >
              {t('resume')}
            </button>
            {completedHoles.length > 0 && !mp.isViewer && (
              <button
                onClick={() => setHoleSelectDialog(true)}
                className="w-14 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center transition"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </>
        ) : (
          <div className="w-full">
            <button
              onClick={goHome}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              {t('backToHome')}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">{t('allDataCleared')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScorecardSection;