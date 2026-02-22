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
                        <div className="flex gap-1">
                          {activePlayers.map(player => {
                            const total = playerTotals[player];
                            const diff = total - totalPar;
                            const diffStr = diff > 0 ? `+${diff}` : diff === 0 ? 'E' : `${diff}`;
                            
                            return (
                              <div key={player} className="flex-1 text-center py-1.5 bg-gray-50 rounded-lg min-w-0">
  <div 
    className="cursor-pointer hover:bg-gray-100 rounded px-1"
    onClick={() => handleAdvancePlayerClick(player)}
  >
    <div className="text-xs font-medium text-blue-600 underline truncate">
      {player}
    </div>
    <div className="flex items-baseline justify-center gap-0.5">
      <span className="text-lg font-bold text-gray-900">{total || '-'}</span>
      {total > 0 && (
        <span className={`font-semibold ${diff > 0 ? 'text-red-600' : diff === 0 ? 'text-gray-600' : 'text-green-600'}`} style={{ fontSize: 9 }}>
          {diffStr}
        </span>
      )}
    </div>
  </div>
  {gameComplete && (
    <button
      onClick={(e) => { e.stopPropagation(); handleSharePlayer(player); }}
      className="mt-0.5 px-1.5 py-0.5 bg-green-100 hover:bg-green-200 text-green-700 rounded font-medium mx-auto flex items-center gap-0.5 justify-center" style={{ fontSize: 10 }}
    >
      📤 Share
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

              {(gameComplete || completedHoles.length === holes.length) && (Number(stake) > 0 || (gameMode === 'skins' && prizePool > 0)) && (
                <div className="bg-yellow-50 rounded-lg p-3 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">
                    {t('finalSettlement')}
                  </h3>
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
                            <table className="w-full" style={{ fontSize: '14px', tableLayout: 'fixed' }}>
                              <thead>
                                <tr className="bg-green-600 text-white">
                                  <th className="px-1 py-2 text-left font-bold" style={{ width: '55px' }}>OUT</th>
                                  {frontNine.map(h => (
                                    <th key={h} className="px-0 py-2 text-center font-bold">{h}</th>
                                  ))}
                                  <th className="px-1 py-2 text-center font-bold" style={{ width: '35px' }}>{t('total')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-gray-50">
                                  <td className="px-1 py-2 font-bold text-gray-900">Par</td>
                                  {frontNine.map(h => (
                                    <td key={h} className="px-0 py-2 text-center text-gray-900">{pars[h] || 4}</td>
                                  ))}
                                  <td className="px-1 py-2 text-center font-bold text-gray-900">{calculateParTotal(frontNine)}</td>
                                </tr>
                                {activePlayers.map((player, idx) => (
                                  <tr key={player} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-1 py-1.5 font-bold text-gray-700 truncate" style={{ fontSize: '12px' }}>
                                      {player}
                                    </td>
                                    {frontNine.map(h => {
                                      const onScore = allScores[player]?.[h] || 0;
const puttScore = allPutts[player]?.[h] || 0;
const score = onScore + puttScore;
const par = pars[h] || 4;
return (
  <td key={h} className={`px-0 py-2 text-center ${score ? getScoreColor(score, par) : ''}`}>
    {score || '-'}
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
                                  <th className="px-1 py-2 text-left font-bold" style={{ width: '55px' }}>IN</th>
                                  {backNine.map(h => (
                                    <th key={h} className="px-0 py-2 text-center font-bold">{h}</th>
                                  ))}
                                  <th className="px-1 py-2 text-center font-bold" style={{ width: '35px' }}>{t('total')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-gray-50">
                                  <td className="px-1 py-2 font-bold text-gray-900">Par</td>
                                  {backNine.map(h => (
                                    <td key={h} className="px-0 py-2 text-center text-gray-900">{pars[h] || 4}</td>
                                  ))}
                                  <td className="px-1 py-2 text-center font-bold text-gray-900">{calculateParTotal(backNine)}</td>
                                </tr>
                                {activePlayers.map((player, idx) => (
                                  <tr key={player} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-1 py-1.5 font-bold text-gray-700 truncate" style={{ fontSize: '12px' }}>
                                      {player}
                                    </td>
                                    {backNine.map(h => {
                                      const onScore = allScores[player]?.[h] || 0;
const puttScore = allPutts[player]?.[h] || 0;
const score = onScore + puttScore;
const par = pars[h] || 4;
return (
  <td key={h} className={`px-0 py-2 text-center ${score ? getScoreColor(score, par) : ''}`}>
    {score || '-'}
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
                            <div className="flex gap-1">
                              {activePlayers.map(player => {
                                const total = playerTotals[player];
                                const diff = total - totalPar;
                                const diffText = diff > 0 ? `+${diff}` : diff === 0 ? 'E' : `${diff}`;
                                const diffColor = diff > 0 ? 'text-red-600' : diff === 0 ? 'text-gray-600' : 'text-green-600';
                                
                                return (
                                  <div key={player} className="flex-1 text-center py-1.5 bg-gray-50 rounded-lg min-w-0">
                                    <div className="cursor-pointer hover:bg-gray-100 rounded px-1" onClick={() => handleAdvancePlayerClick(player)}>
                                      <div className="text-xs font-medium text-blue-600 underline truncate">
                                        {player}
                                      </div>
                                      <div className="flex items-baseline justify-center gap-0.5">
                                        <span className="text-lg font-bold text-gray-900">{total || '-'}</span>
                                        {total > 0 && (
                                          <span className={`font-semibold ${diffColor}`} style={{ fontSize: 9 }}>
                                            {diffText}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <button onClick={() => handleSharePlayer(player)} className="mt-0.5 px-1.5 py-0.5 bg-green-100 hover:bg-green-200 text-green-700 rounded font-medium mx-auto flex items-center gap-0.5 justify-center" style={{ fontSize: 10 }}>
                                      📤 {t('share') || 'Share'}
                                    </button>
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

              {(gameComplete || completedHoles.length === holes.length) && (Number(stake) > 0 || (gameMode === 'skins' && prizePool > 0)) && (
                <div className="bg-yellow-50 rounded-lg p-3 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">
                    {t('finalSettlement')}
                  </h3>
                  {(gameMode === 'skins' || gameMode === 'win123') && prizePool > 0 && (
                    <div className="mb-2 text-center p-1.5 bg-purple-100 rounded">
                      <span className="text-xs text-purple-700">
                        {gameMode === 'win123' ? t('penaltyPot') : t('prizePool')}: 
                      </span>
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

                        {hasData ? (
                          <>
                            {frontNine.length > 0 && (
                              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <table className="w-full" style={{ fontSize: '14px', tableLayout: 'fixed' }}>
                                  <thead>
                                    <tr className="bg-green-600 text-white">
                                      <th className="px-1 py-2 text-left font-bold" style={{ width: '55px' }}>
                                        {t('out')}
                                      </th>
                                      {frontNine.map(hole => (
                                        <th key={hole} className="px-0 py-2 text-center font-bold">
                                          {hole}
                                        </th>
                                      ))}
                                      <th className="px-1 py-2 text-center font-bold" style={{ width: '35px' }}>
                                        {t('total')}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="bg-gray-50">
                                      <td className="px-1 py-2 font-bold text-gray-900">{t('par')}</td>
                                      {frontNine.map(hole => (
                                        <td key={hole} className="px-0 py-2 text-center text-gray-900">
                                          {pars[hole] || 4}
                                        </td>
                                      ))}
                                      <td className="px-1 py-2 text-center font-bold text-gray-900">
                                        {calculateParTotal(frontNine)}
                                      </td>
                                    </tr>
                                    {activePlayers.map((player, index) => (
                                      <tr key={player} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-1 py-1 font-bold text-gray-900 truncate" style={{ fontSize: '12px' }}>
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
                                      <th className="px-1 py-2 text-left font-bold" style={{ width: '55px' }}>
                                        {t('in')}
                                      </th>
                                      {backNine.map(hole => (
                                        <th key={hole} className="px-0 py-2 text-center font-bold">
                                          {hole}
                                        </th>
                                      ))}
                                      <th className="px-1 py-2 text-center font-bold" style={{ width: '35px' }}>
                                        {t('total')}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="bg-gray-50">
                                      <td className="px-1 py-2 font-bold text-gray-900">{t('par')}</td>
                                      {backNine.map(hole => (
                                        <td key={hole} className="px-0 py-2 text-center text-gray-900">
                                          {pars[hole] || 4}
                                        </td>
                                      ))}
                                      <td className="px-1 py-2 text-center font-bold text-gray-900">
                                        {calculateParTotal(backNine)}
                                      </td>
                                    </tr>
                                    {activePlayers.map((player, index) => (
                                      <tr key={player} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-1 py-1 font-bold text-gray-900 truncate" style={{ fontSize: '12px' }}>
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