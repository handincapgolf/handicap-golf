import React, { memo } from 'react';

// ========== Advance Mode 报告卡片组件 ==========
export const AdvanceReportCard = memo(({ player, rank, onClose, onViewFull, allScores, allPutts, allWater, allOb, allUps, pars, completedHoles, gameMode, t, getMedal, isAdvancePlayer }) => {
  const details = completedHoles.map(hole => ({
  hole,
  par: pars[hole] || 4,
  score: (allScores[player]?.[hole] || (pars[hole] || 4)) + (allPutts[player]?.[hole] || 0),
  putts: allPutts[player]?.[hole] || 0,
    water: allWater[player]?.[hole] || 0,
    ob: allOb[player]?.[hole] || 0,
    up: allUps[player]?.[hole] || false
  }));

  const totalPar = completedHoles.reduce((sum, h) => sum + (pars[h] || 4), 0);
  const playerTotal = details.reduce((sum, d) => sum + d.score, 0);
  const playerDiff = playerTotal - totalPar;
  const diffText = playerDiff > 0 ? `+${playerDiff}` : playerDiff === 0 ? 'E' : `${playerDiff}`;
  
  const front9Details = details.filter(d => d.hole <= 9);
  const back9Details = details.filter(d => d.hole > 9);
  const front9Score = front9Details.reduce((sum, d) => sum + d.score, 0);
  const back9Score = back9Details.reduce((sum, d) => sum + d.score, 0);
  
  const totalPutts = details.reduce((sum, d) => sum + d.putts, 0);
  const totalWater = details.reduce((sum, d) => sum + d.water, 0);
  const totalOb = details.reduce((sum, d) => sum + d.ob, 0);
  const totalUp = details.filter(d => d.up).length;
  const avgPutts = details.length > 0 ? (totalPutts / details.length).toFixed(1) : '0';
  const onePutts = details.filter(d => d.putts === 1).length;
  const threePutts = details.filter(d => d.putts >= 3).length;

  const birdies = details.filter(d => d.score - d.par === -1).length;
  const parsCount = details.filter(d => d.score - d.par === 0).length;
  const bogeys = details.filter(d => d.score - d.par === 1).length;
  const doubles = details.filter(d => d.score - d.par >= 2).length;

  const isWin123 = gameMode === 'win123';

  const getPgaScoreClass = (score, par) => {
    const diff = score - par;
    const doublePar = par * 2;
    if (diff <= -2) return 'pga-eagle';
    if (diff === -1) return 'pga-birdie';
    if (diff === 0) return 'pga-par';
    if (diff === 1) return 'pga-bogey';
    if (diff === 2) return 'pga-double';
    if (score <= doublePar) return 'pga-triple';
    return 'pga-quad';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative flex flex-col bg-white m-3 mt-4 mb-3 rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: 'calc(100vh - 52px)', animation: 'cardAppear 0.25s ease-out' }}>
        
        {/* Header */}
        <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getMedal(rank)}</span>
            <span className="font-bold text-lg">{player} {t('reportTitle')}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 text-lg">✕</button>
        </div>

        {/* 可滚动内容区 */}
        <div className="overflow-auto flex-1 p-3 space-y-3">
          {/* 总成绩 - 紧凑版 */}
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="text-xl font-bold text-gray-900">{playerTotal}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${playerDiff > 0 ? 'bg-red-100 text-red-600' : playerDiff === 0 ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-600'}`}>
              {diffText}
            </span>
          </div>

          {/* 逐洞成绩 - 新布局 */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            
            {front9Details.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">{t('front9')} OUT</span>
                  <span className="text-sm text-gray-500">Total <span className="font-bold text-green-600">{front9Score}</span></span>
                </div>
                <div className="flex justify-between mb-1">
  {front9Details.map(d => (
    <div key={d.hole} className="w-8 text-center">
      <span className="text-xs font-semibold text-gray-500">{d.hole}</span>
      <div className="text-[10px] text-gray-400">P{d.par}</div>
    </div>
  ))}
</div>
                <div className="flex justify-between">
                  {front9Details.map(d => (
                    <div key={d.hole} className="flex justify-center">
                      <div className={getPgaScoreClass(d.score, d.par)}>
                        {d.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {back9Details.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">{t('back9')} IN</span>
                  <span className="text-sm text-gray-500">Total <span className="font-bold text-green-600">{back9Score}</span></span>
                </div>
                <div className="flex justify-between mb-1">
  {back9Details.map(d => (
    <div key={d.hole} className="w-8 text-center">
      <span className="text-xs font-semibold text-gray-500">{d.hole}</span>
      <div className="text-[10px] text-gray-400">P{d.par}</div>
    </div>
  ))}
</div>
                <div className="flex justify-between">
                  {back9Details.map(d => (
                    <div key={d.hole} className="flex justify-center">
                      <div className={getPgaScoreClass(d.score, d.par)}>
                        {d.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 成绩分布 - 横向药丸标签在上，渐变数字方块在下 */}
<div className="bg-white border border-gray-200 rounded-xl p-3">
  <div className="text-sm font-semibold text-gray-500 mb-2">🎯 {t('scoreDistribution')}</div>
  <div className="flex justify-around">
    {/* Birdie */}
    <div className="flex flex-col items-center gap-2">
      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
        Birdie
      </span>
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
      >
        <span className="text-2xl font-extrabold text-white">{birdies}</span>
      </div>
    </div>
    
    {/* Par */}
    <div className="flex flex-col items-center gap-2">
      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
        Par
      </span>
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' }}
      >
        <span className="text-2xl font-extrabold text-white">{parsCount}</span>
      </div>
    </div>
    
    {/* Bogey */}
    <div className="flex flex-col items-center gap-2">
      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
        Bogey
      </span>
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
      >
        <span className="text-2xl font-extrabold text-white">{bogeys}</span>
      </div>
    </div>
    
    {/* Double+ */}
    <div className="flex flex-col items-center gap-2">
      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
        Dbl+
      </span>
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
      >
        <span className="text-2xl font-extrabold text-white">{doubles}</span>
      </div>
    </div>
  </div>
</div>

          {/* 推杆分析 */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="text-sm font-semibold text-gray-500 mb-2">📊 {t('puttingAnalysis')}</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">{t('totalPutts')}</div>
                <div className="text-xl font-bold text-gray-800">{totalPutts}</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">{t('avgPerHole')}</div>
                <div className="text-xl font-bold text-blue-600">{avgPutts}</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">{t('onePutt')}</div>
                <div className="text-xl font-bold text-green-600">{onePutts}</div>
              </div>
            </div>
            {threePutts > 0 && (
              <div className="mt-2 text-center text-sm text-red-500">
                ⚠️ {t('threePutts')}: {threePutts}{t('holes')}
              </div>
            )}
          </div>

          {/* 罚杆统计 */}
          {isAdvancePlayer && (
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="text-sm font-semibold text-gray-500 mb-2">⚠️ {t('penaltyStats')}</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-cyan-50 rounded-lg p-2 flex items-center justify-between">
                  <div className="text-cyan-600 text-sm">💧 {t('waterHazard')}</div>
                  <div className="text-xl font-bold text-cyan-600">{totalWater}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2 flex items-center justify-between">
                  <div className="text-yellow-600 text-sm">OB</div>
                  <div className="text-xl font-bold text-yellow-600">{totalOb}</div>
                </div>
              </div>
            </div>
          )}

          {/* UP统计 - 仅Win123显示 */}
          {isWin123 && (
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="text-sm font-semibold text-gray-500 mb-2">⬆️ UP{t('stats')}</div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">UP{t('attempts')}</span>
                <span className="text-xl font-bold text-green-600">{totalUp}{t('times')}</span>
              </div>
            </div>
          )}
        </div>

        {/* 查看完整明细按钮 */}
        <div className="flex-shrink-0 p-3 border-t bg-white" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button 
            onClick={onViewFull}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            {t('viewFullDetail')} →
          </button>
        </div>
      </div>
    </div>
  );
});

// ========== Advance Mode 完整明细弹窗 ==========
export const AdvanceFullDetailModal = memo(({ player, rank, onClose, onBack, allScores, allPutts, allWater, allOb, allUps, pars, completedHoles, gameMode, t, getMedal, isAdvancePlayer }) => {
  const details = completedHoles.map(hole => {
    const on = allScores[player]?.[hole] || (pars[hole] || 4);
    const putts = allPutts[player]?.[hole] || 0;
    return {
      hole,
      par: pars[hole] || 4,
      on: on,
      putts: putts,
      total: on + putts,
      water: allWater[player]?.[hole] || 0,
      ob: allOb[player]?.[hole] || 0,
      up: allUps[player]?.[hole] || false
    };
  });

  const totalPar = completedHoles.reduce((sum, h) => sum + (pars[h] || 4), 0);
  const playerTotal = details.reduce((sum, d) => sum + d.total, 0);
  const playerDiff = playerTotal - totalPar;
  const diffText = playerDiff > 0 ? `+${playerDiff}` : playerDiff === 0 ? 'E' : `${playerDiff}`;
  
  const front9Details = details.filter(d => d.hole <= 9);
  const back9Details = details.filter(d => d.hole > 9);
  
  const totalPutts = details.reduce((sum, d) => sum + d.putts, 0);
  const totalWater = details.reduce((sum, d) => sum + d.water, 0);
  const totalOb = details.reduce((sum, d) => sum + d.ob, 0);
  const totalUp = details.filter(d => d.up).length;

  const isWin123 = gameMode === 'win123';

  const getScoreColorText = (score, par) => {
    const diff = score - par;
    if (diff <= -2) return 'text-purple-600 bg-purple-100';
    if (diff === -1) return 'text-blue-600 bg-blue-100';
    if (diff === 0) return 'text-gray-700 bg-gray-100';
    if (diff === 1) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative flex flex-col bg-white m-3 mt-12 mb-3 rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: 'calc(100vh - 60px)', animation: 'cardAppear 0.25s ease-out' }}>
        
        {/* Header */}
        <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 text-lg">←</button>
            <div>
              <div className="font-bold text-lg">👤 {player} {t('fullDetail')}</div>
              <div className="text-sm text-green-100">{playerTotal}{t('strokes')} ({diffText})</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 text-lg">✕</button>
        </div>

        {/* 可滚动的表格区域 */}
        <div className="flex-1 overflow-auto">
          {/* 前九 */}
          {front9Details.length > 0 && (
            <>
              <div className="px-3 py-2 bg-green-50 text-xs font-semibold text-green-700 sticky top-0">{t('front9')} OUT</div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-7">
                  <tr>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">{t('hole')}</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">Par</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">On</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">{t('putt')}</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">Total</th>
                    {isAdvancePlayer && <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">💧</th>}
                    {isAdvancePlayer && <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">OB</th>}
                    {isWin123 && <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">UP</th>}
                  </tr>
                </thead>
                <tbody>
                  {front9Details.map((d, idx) => (
                    <tr key={d.hole} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-2 text-center font-semibold text-gray-700">{d.hole}</td>
                      <td className="py-2 px-2 text-center text-gray-500">{d.par}</td>
                      <td className="py-2 px-2 text-center text-gray-700">{d.on}</td>
                      <td className="py-2 px-2 text-center text-blue-600">{d.putts}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`inline-block w-7 h-7 leading-7 rounded-full font-bold text-sm ${getScoreColorText(d.total, d.par)}`}>{d.total}</span>
                      </td>
                      {isAdvancePlayer && <td className="py-2 px-2 text-center">{d.water > 0 ? <span className="text-cyan-600 font-bold">{d.water}</span> : <span className="text-gray-300">-</span>}</td>}
                      {isAdvancePlayer && <td className="py-2 px-2 text-center">{d.ob > 0 ? <span className="text-yellow-600 font-bold">{d.ob}</span> : <span className="text-gray-300">-</span>}</td>}
                      {isWin123 && <td className="py-2 px-2 text-center">{d.up ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">-</span>}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* 后九 */}
          {back9Details.length > 0 && (
            <>
              <div className="px-3 py-2 bg-blue-50 text-xs font-semibold text-blue-700 sticky top-0">{t('back9')} IN</div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-7">
                  <tr>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">{t('hole')}</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">Par</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">On</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">{t('putt')}</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">Total</th>
                    {isAdvancePlayer && <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">💧</th>}
                    {isAdvancePlayer && <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">OB</th>}
                    {isWin123 && <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600 w-10">UP</th>}
                  </tr>
                </thead>
                <tbody>
                  {back9Details.map((d, idx) => (
                    <tr key={d.hole} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-2 text-center font-semibold text-gray-700">{d.hole}</td>
                      <td className="py-2 px-2 text-center text-gray-500">{d.par}</td>
                      <td className="py-2 px-2 text-center text-gray-700">{d.on}</td>
                      <td className="py-2 px-2 text-center text-blue-600">{d.putts}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`inline-block w-7 h-7 leading-7 rounded-full font-bold text-sm ${getScoreColorText(d.total, d.par)}`}>{d.total}</span>
                      </td>
                      {isAdvancePlayer && <td className="py-2 px-2 text-center">{d.water > 0 ? <span className="text-cyan-600 font-bold">{d.water}</span> : <span className="text-gray-300">-</span>}</td>}
                      {isAdvancePlayer && <td className="py-2 px-2 text-center">{d.ob > 0 ? <span className="text-yellow-600 font-bold">{d.ob}</span> : <span className="text-gray-300">-</span>}</td>}
                      {isWin123 && <td className="py-2 px-2 text-center">{d.up ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">-</span>}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

{/* 底部统计 */}
        <div className="flex-shrink-0 bg-gray-100 p-3 border-t" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div className={`grid gap-2 text-center`} style={{ gridTemplateColumns: `repeat(${2 + (isAdvancePlayer ? 2 : 0) + (isWin123 ? 1 : 0)}, 1fr)` }}>
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="text-gray-500 text-xs">Total</div>
              <div className="font-bold text-xl text-gray-800">{playerTotal}</div>
            </div>
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="text-gray-500 text-xs">{t('putt')}</div>
              <div className="font-bold text-xl text-blue-600">{totalPutts}</div>
            </div>
            {isAdvancePlayer && (
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-gray-500 text-xs">💧{t('water')}</div>
                <div className="font-bold text-xl text-cyan-600">{totalWater}</div>
              </div>
            )}
            {isAdvancePlayer && (
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-gray-500 text-xs">OB</div>
                <div className="font-bold text-xl text-yellow-600">{totalOb}</div>
              </div>
            )}
            {isWin123 && (
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-gray-500 text-xs">UP</div>
                <div className="font-bold text-xl text-green-600">{totalUp}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
