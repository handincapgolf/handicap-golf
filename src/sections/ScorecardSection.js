import React from 'react';
import { AlertCircle, Edit2, Home } from 'lucide-react';

// ScoreDisplay - moved from main file
const ScoreDisplay = React.memo(({ score, par }) => {
  const diff = score - par;
  
  let colorClass = 'text-gray-900';
  if (diff <= -2) colorClass = 'text-purple-600';
  else if (diff === -1) colorClass = 'text-blue-600';
  else if (diff === 0) colorClass = 'text-gray-900';
  else if (diff === 1) colorClass = 'text-orange-600';
  else colorClass = 'text-red-600';
  
  return <span className={`font-semibold ${colorClass}`}>{score}</span>;
});

const ScorecardSection = ({
  selectedCourse,
  completedHoles,
  activePlayers,
  allScores,
  allPutts,
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
  goHome,
  t,
}) => {
  return (
            <div className="space-y-3 py-3">
              {selectedCourse && (
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 text-white shadow-md text-center">
                  <h1 className="text-2xl font-bold mb-1">
                    {selectedCourse.fullName}
                  </h1>
                  <p className="text-sm text-green-100">
                    {selectedCourse.shortName}
                  </p>
                </div>
              )}

              {/* ========== 条件渲染：Advance Mode ON 或 OFF ========== */}
              {completedHoles.length > 0 ? (
                // ===== Advance Mode Scorecard =====
                <>
                  {/* 提示文字 - 只在有 Advance 玩家时显示 */}
<p className="text-xs text-gray-400 text-center mb-2">💡 {t('clickNameToView')}</p>

                  {/* 总成绩摘要 - 可点击查看详情 */}
                  {(() => {
                    const totalPar = completedHoles.reduce((sum, h) => sum + (pars[h] || 4), 0);
                    const playerTotals = {};
                    activePlayers.forEach(player => {
  playerTotals[player] = completedHoles.reduce((total, hole) => {
    return total + (allScores[player]?.[hole] || 0) + (allPutts[player]?.[hole] || 0);
  }, 0);
});

                    const scoreRankings = activePlayers
                      .map(player => ({ player, score: playerTotals[player] }))
                      .sort((a, b) => a.score - b.score)
                      .reduce((acc, { player }, index, arr) => {
                        if (index === 0) {
                          acc[player] = 1;
                        } else {
                          const prevPlayer = arr[index - 1].player;
                          if (playerTotals[player] === playerTotals[prevPlayer]) {
                            acc[player] = acc[prevPlayer];
                          } else {
                            acc[player] = index + 1;
                          }
                        }
                        return acc;
                      }, {});

                    return (
                      <div className="bg-white rounded-lg p-3 shadow-sm mb-3">
                        <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">
                          {t('totalScore')} ({t('standardPar')}: {totalPar})
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {activePlayers.map(player => {
                            const total = playerTotals[player];
                            const diff = total - totalPar;
                            const diffStr = diff > 0 ? `+${diff}` : diff === 0 ? 'E' : `${diff}`;
                            const rank = scoreRankings[player];
                            const medal = getMedal(rank);
                            
                            return (
                              <div key={player} className="text-center p-2 bg-gray-50 rounded-lg">
  <div 
    className="cursor-pointer hover:bg-gray-100 rounded p-1 -m-1"
    onClick={() => handleAdvancePlayerClick(player)}
  >
    <div className="text-sm font-medium flex items-center justify-center gap-1 text-blue-600 underline">
      {player} {medal} <span className="text-xs">📊</span>
    </div>
    <div className="flex items-baseline justify-center gap-1">
      <span className="text-xl font-bold text-gray-900">{total || '-'}</span>
      {total > 0 && (
        <span className={`text-xs font-semibold ${diff > 0 ? 'text-red-600' : diff === 0 ? 'text-gray-600' : 'text-green-600'}`}>
          ({diffStr})
        </span>
      )}
    </div>
  </div>
  {gameComplete && (
    <button
      onClick={(e) => { e.stopPropagation(); handleSharePlayer(player); }}
      className="mt-1.5 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium flex items-center justify-center gap-1 mx-auto"
    >
      <span>📤</span> Share
    </button>
  )}
</div>
                            );
                          })}
                        </div>
                        {gameComplete && (
                          <button
                            onClick={handleShareRoundReport}
                            className="w-full mt-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
                          >
                            📊 {t('shareRoundReport')}
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* 前九/后九 Scorecard 表格 */}
                  {(() => {
                    const frontNine = completedHoles.filter(h => h <= 9).sort((a, b) => a - b);
                    const backNine = completedHoles.filter(h => h > 9).sort((a, b) => a - b);
                    
                    const calculateTotal = (player, holesList) => {
  return holesList.reduce((total, hole) => {
    return total + (allScores[player]?.[hole] || 0) + (allPutts[player]?.[hole] || 0);
  }, 0);
};
                    
                    const calculateParTotal = (holesList) => {
                      return holesList.reduce((total, hole) => {
                        return total + (pars[hole] || 4);
                      }, 0);
                    };

                    const getScoreColor = (score, par) => {
                      const diff = score - par;
                      if (diff <= -2) return 'text-purple-600 font-bold';
                      if (diff === -1) return 'text-blue-600 font-bold';
                      if (diff === 0) return 'text-gray-900';
                      if (diff === 1) return 'text-orange-600 font-bold';
                      return 'text-red-600 font-bold';
                    };

                    return (
                      <>
                        {frontNine.length > 0 && (
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3">
                            <table className="w-full" style={{ fontSize: '10px' }}>
                              <thead>
                                <tr className="bg-green-600 text-white">
                                  <th className="px-1 py-1.5 text-left font-semibold" style={{ minWidth: '35px' }}>OUT</th>
                                  {frontNine.map(h => (
                                    <th key={h} className="px-0 py-1.5 text-center font-semibold" style={{ minWidth: '18px' }}>{h}</th>
                                  ))}
                                  <th className="px-1 py-1.5 text-center font-semibold" style={{ minWidth: '22px' }}>{t('total')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-gray-50">
                                  <td className="px-1 py-1.5 font-semibold text-gray-900">Par</td>
                                  {frontNine.map(h => (
                                    <td key={h} className="px-0 py-1.5 text-center text-gray-900">{pars[h] || 4}</td>
                                  ))}
                                  <td className="px-1 py-1.5 text-center font-bold text-gray-900">{calculateParTotal(frontNine)}</td>
                                </tr>
                                {activePlayers.map((player, idx) => (
                                  <tr key={player} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-1 py-1.5 font-semibold text-gray-700 truncate" style={{ fontSize: '9px' }}>
                                      {player}
                                    </td>
                                    {frontNine.map(h => {
                                      const onScore = allScores[player]?.[h] || 0;
const puttScore = allPutts[player]?.[h] || 0;
const score = onScore + puttScore;
const par = pars[h] || 4;
return (
  <td key={h} className={`px-0 py-1.5 text-center ${score ? getScoreColor(score, par) : ''}`}>
    {score || '-'}
                                        </td>
                                      );
                                    })}
                                    <td className="px-1 py-1.5 text-center font-bold text-gray-900">
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
                            <table className="w-full" style={{ fontSize: '10px' }}>
                              <thead>
                                <tr className="bg-green-600 text-white">
                                  <th className="px-1 py-1.5 text-left font-semibold" style={{ minWidth: '35px' }}>IN</th>
                                  {backNine.map(h => (
                                    <th key={h} className="px-0 py-1.5 text-center font-semibold" style={{ minWidth: '18px' }}>{h}</th>
                                  ))}
                                  <th className="px-1 py-1.5 text-center font-semibold" style={{ minWidth: '22px' }}>{t('total')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-gray-50">
                                  <td className="px-1 py-1.5 font-semibold text-gray-900">Par</td>
                                  {backNine.map(h => (
                                    <td key={h} className="px-0 py-1.5 text-center text-gray-900">{pars[h] || 4}</td>
                                  ))}
                                  <td className="px-1 py-1.5 text-center font-bold text-gray-900">{calculateParTotal(backNine)}</td>
                                </tr>
                                {activePlayers.map((player, idx) => (
                                  <tr key={player} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-1 py-1.5 font-semibold text-gray-700 truncate" style={{ fontSize: '9px' }}>
                                      {player}
                                    </td>
                                    {backNine.map(h => {
                                      const onScore = allScores[player]?.[h] || 0;
const puttScore = allPutts[player]?.[h] || 0;
const score = onScore + puttScore;
const par = pars[h] || 4;
return (
  <td key={h} className={`px-0 py-1.5 text-center ${score ? getScoreColor(score, par) : ''}`}>
    {score || '-'}
                                        </td>
                                      );
                                    })}
                                    <td className="px-1 py-1.5 text-center font-bold text-gray-900">
                                      {calculateTotal(player, backNine) || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                // ===== 原版 Scorecard (advanceMode === 'off') =====
                <>
                  {(() => {
                    const hasData = completedHoles.length > 0;
                    const frontNine = holes.filter(h => h <= 9 && completedHoles.includes(h));
                    const backNine = holes.filter(h => h > 9 && completedHoles.includes(h));
                    
                    const calculateTotal = (player, holesList) => {
  return holesList.reduce((total, hole) => {
    return total + (allScores[player]?.[hole] || 0) + (allPutts[player]?.[hole] || 0);
  }, 0);
};
                    
                    const calculateParTotal = (holesList) => {
                      return holesList.reduce((total, hole) => {
                        return total + (pars[hole] || 4);
                      }, 0);
                    };
                    
                    const totalPar = calculateParTotal(completedHoles);
                    const playerTotals = {};
                    activePlayers.forEach(player => {
                      playerTotals[player] = calculateTotal(player, completedHoles);
                    });

                    const scoreRankings = activePlayers
                      .map(player => ({ player, score: playerTotals[player] }))
                      .sort((a, b) => a.score - b.score)
                      .reduce((acc, { player }, index, arr) => {
                        if (index === 0) {
                          acc[player] = 1;
                        } else {
                          const prevPlayer = arr[index - 1].player;
                          if (playerTotals[player] === playerTotals[prevPlayer]) {
                            acc[player] = acc[prevPlayer];
                          } else {
                            acc[player] = index + 1;
                          }
                        }
                        return acc;
                      }, {});

                    const moneyRankings = (Number(stake) > 0) ? activePlayers
                      .map(player => ({ player, money: totalMoney[player] }))
                      .sort((a, b) => b.money - a.money)
                      .reduce((acc, { player }, index, arr) => {
                        if (index === 0) {
                          acc[player] = 1;
                        } else {
                          const prevPlayer = arr[index - 1].player;
                          if (totalMoney[player] === totalMoney[prevPlayer]) {
                            acc[player] = acc[prevPlayer];
                          } else {
                            acc[player] = index + 1;
                          }
                        }
                        return acc;
                      }, {}) : {};
                    
                    return (
                      <>
                        {gameComplete && hasData && (
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">
                              {t('totalScore')} ({t('standardPar')}: {totalPar})
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                              {activePlayers.map(player => {
                                const total = playerTotals[player];
                                const diff = total - totalPar;
                                const diffText = diff > 0 ? `+${diff}` : diff === 0 ? 'E' : `${diff}`;
                                const diffColor = diff > 0 ? 'text-red-600' : diff === 0 ? 'text-gray-600' : 'text-green-600';
                                const rank = scoreRankings[player];
                                const medal = getMedal(rank);
                                
                                return (
                                  <div key={player} className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-xs font-medium text-gray-700 flex items-center justify-center gap-1">
                                      {player}
                                      {medal && <span className="text-sm">{medal}</span>}
                                    </div>
                                    <div className="flex items-baseline justify-center gap-1">
                                      <span className="text-xl font-bold text-gray-900">{total || '-'}</span>
                                      {total > 0 && (
                                        <span className={`text-xs font-semibold ${diffColor}`}>
                                          ({diffText})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {gameComplete && (
                              <button
                                onClick={handleShareRoundReport}
                                className="w-full mt-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
                              >
                                📊 {t('shareRoundReport')}
                              </button>
                            )}
                          </div>
                        )}

                        {hasData ? (
                          <>
                            {frontNine.length > 0 && (
                              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <table className="w-full" style={{ fontSize: '10px' }}>
                                  <thead>
                                    <tr className="bg-green-600 text-white">
                                      <th className="px-1 py-1 text-left font-semibold" style={{ minWidth: '35px' }}>
                                        {t('out')}
                                      </th>
                                      {frontNine.map(hole => (
                                        <th key={hole} className="px-0 py-1 text-center font-semibold" style={{ minWidth: '20px' }}>
                                          {hole}
                                        </th>
                                      ))}
                                      <th className="px-1 py-1 text-center font-semibold" style={{ minWidth: '25px' }}>
                                        {t('total')}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="bg-gray-50">
                                      <td className="px-1 py-1 font-semibold text-gray-900">{t('par')}</td>
                                      {frontNine.map(hole => (
                                        <td key={hole} className="px-0 py-1 text-center text-gray-900">
                                          {pars[hole] || 4}
                                        </td>
                                      ))}
                                      <td className="px-1 py-1 text-center font-bold text-gray-900">
                                        {calculateParTotal(frontNine)}
                                      </td>
                                    </tr>
                                    {activePlayers.map((player, index) => (
                                      <tr key={player} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-1 py-1 font-semibold text-gray-900 truncate" style={{ fontSize: '9px' }}>
                                          {player}
                                        </td>
                                        {frontNine.map(hole => {
                                          const score = allScores[player]?.[hole];
                                          const par = pars[hole] || 4;
                                          const handicapValue = getHandicapForHole(player, hole, par);
                                          const netScore = score ? score - handicapValue : null;
                                          
                                          return (
                                            <td key={hole} className="px-0 py-1 text-center">
                                              {score ? (
                                                <div>
                                                  <ScoreDisplay score={score} par={par} />
                                                  {!gameComplete && handicapValue > 0 && (
                                                    <div style={{ fontSize: '8px', color: '#059669' }}>
                                                      ({netScore})
                                                    </div>
                                                  )}
                                                </div>
                                              ) : '-'}
                                            </td>
                                          );
                                        })}
                                        <td className="px-1 py-1 text-center font-bold text-gray-900">
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
                                <table className="w-full" style={{ fontSize: '10px' }}>
                                  <thead>
                                    <tr className="bg-green-600 text-white">
                                      <th className="px-1 py-1 text-left font-semibold" style={{ minWidth: '35px' }}>
                                        {t('in')}
                                      </th>
                                      {backNine.map(hole => (
                                        <th key={hole} className="px-0 py-1 text-center font-semibold" style={{ minWidth: '20px' }}>
                                          {hole}
                                        </th>
                                      ))}
                                      <th className="px-1 py-1 text-center font-semibold" style={{ minWidth: '25px' }}>
                                        {t('total')}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="bg-gray-50">
                                      <td className="px-1 py-1 font-semibold text-gray-900">{t('par')}</td>
                                      {backNine.map(hole => (
                                        <td key={hole} className="px-0 py-1 text-center text-gray-900">
                                          {pars[hole] || 4}
                                        </td>
                                      ))}
                                      <td className="px-1 py-1 text-center font-bold text-gray-900">
                                        {calculateParTotal(backNine)}
                                      </td>
                                    </tr>
                                    {activePlayers.map((player, index) => (
                                      <tr key={player} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-1 py-1 font-semibold text-gray-900 truncate" style={{ fontSize: '9px' }}>
                                          {player}
                                        </td>
                                        {backNine.map(hole => {
                                          const score = allScores[player]?.[hole];
                                          const par = pars[hole] || 4;
                                          const handicapValue = getHandicapForHole(player, hole, par);
                                          const netScore = score ? score - handicapValue : null;
                                          
                                          return (
                                            <td key={hole} className="px-0 py-1 text-center">
                                              {score ? (
                                                <div>
                                                  <ScoreDisplay score={score} par={par} />
                                                  {!gameComplete && handicapValue > 0 && (
                                                    <div style={{ fontSize: '8px', color: '#059669' }}>
                                                      ({netScore})
                                                    </div>
                                                  )}
                                                </div>
                                              ) : '-'}
                                            </td>
                                          );
                                        })}
                                        <td className="px-1 py-1 text-center font-bold text-gray-900">
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
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <AlertCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-blue-700 text-sm">{t('noScoreData')}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}

              {/* 修改记录按钮 - scorecard 下方 */}
              {editLog.length > 0 && (
                <button
                  onClick={() => setEditLogDialog({ isOpen: true, hole: null })}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-gray-200 shadow-sm"
                >
                  📋 {t('editLogTitle')}
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{editLog.length}</span>
                </button>
              )}

              {(gameComplete || completedHoles.length === holes.length) && (Number(stake) > 0 || (gameMode === 'skins' && prizePool > 0)) && (
                <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                    {t('finalSettlement')}
                  </h3>
                  {(gameMode === 'skins' || gameMode === 'win123') && prizePool > 0 && (
                    <div className="mb-3 text-center p-2 bg-purple-100 rounded">
                      <span className="text-sm text-purple-700">
                        {gameMode === 'win123' ? t('penaltyPot') : t('prizePool')}: 
                      </span>
                      <span className="text-lg font-bold text-purple-800 ml-2">
                        ${prizePool}
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {(() => {
                      const playerTotals = {};
                      activePlayers.forEach(player => {
  playerTotals[player] = completedHoles.reduce((total, hole) => {
    return total + (allScores[player]?.[hole] || 0) + (allPutts[player]?.[hole] || 0);
  }, 0);
});

                      const moneyRankings = activePlayers
                        .map(player => ({ player, money: totalMoney[player] }))
                        .sort((a, b) => b.money - a.money)
                        .reduce((acc, { player }, index, arr) => {
                          if (index === 0) {
                            acc[player] = 1;
                          } else {
                            const prevPlayer = arr[index - 1].player;
                            if (totalMoney[player] === totalMoney[prevPlayer]) {
                              acc[player] = acc[prevPlayer];
                            } else {
                              acc[player] = index + 1;
                            }
                          }
                          return acc;
                        }, {});

                      return activePlayers.map(player => {
                        const amount = totalMoney[player] || 0;
                        const rank = moneyRankings[player];
                        const medal = getMedal(rank);
                        
                        return (
                          <div key={player} className="border-b border-yellow-200 last:border-b-0 pb-2">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900 flex items-center gap-1">
                                {player}
                                {amount > 0 && medal && <span className="text-base">{medal}</span>}
                              </span>
                              <span className={`font-bold ${
                                amount > 0 ? 'text-green-600' : amount < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {amount === 0 ? '$0' : amount > 0 ? `+$${amount.toFixed(1)}` : `-$${Math.abs(amount).toFixed(1)}`}
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

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
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {t('allDataCleared')}
                    </p>
                  </div>
                )}
              </div>
            </div>
  );
};

export default ScorecardSection;
