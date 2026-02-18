/**
 * 分享页面组件 (Share Pages)
 * 
 * 包含：SharePage (主容器), ShareReportPage, ShareDetailPage, CourseLogo, BrandFooter
 * 从 IntegratedGolfGame.js 提取
 */

import React, { useState, useEffect, memo } from 'react';

// ========== 分享页面样式 ==========
const sharePageStyles = `
  .classic-header {
    background: linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%);
    position: relative;
    overflow: hidden;
  }
  .classic-header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
  }
  .gold-accent { color: #fbbf24; }
  .logo-large {
    width: 72px; height: 72px;
    background: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 0 0 3px rgba(251,191,36,0.3);
    font-size: 24px;
    color: #166534;
    font-weight: bold;
  }
  .total-box {
    width: 32px; height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 12px;
    color: #166534;
    background: #dcfce7;
    border: 2px solid #22c55e;
    border-radius: 4px;
  }
  .pga-eagle {
  position: relative;
  width: 32px; height: 32px;
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
    width: 32px; height: 32px;
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
    width: 32px; height: 32px;
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
    width: 32px; height: 32px;
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
  width: 32px; height: 32px;
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
`;

// ========== PGA 成绩样式 ==========
export const getShareScoreClass = (score, par) => {
  const diff = score - par;
  if (diff <= -2) return 'pga-eagle';
  if (diff === -1) return 'pga-birdie';
  if (diff === 0) return 'pga-par';
  if (diff === 1) return 'pga-bogey';
  return 'pga-double';
};

// ========== 球场 Logo 组件 ==========
export const CourseLogo = memo(({ shortName, fullName }) => {
  const [imgError, setImgError] = useState(false);
  
  const getLogoName = () => {
    if (shortName && shortName.length <= 15 && !shortName.includes('Golf')) {
      return shortName.toLowerCase();
    }
    if (fullName || shortName) {
      const name = fullName || shortName;
      const abbr = name.match(/\b[A-Z]/g)?.join('') || '';
      if (abbr.length >= 2) {
        return abbr.toLowerCase();
      }
    }
    return null;
  };
  
  const logoName = getLogoName();
  const logoPath = logoName ? `/images/courses/${logoName}.png` : null;
  
  if (!logoPath || imgError) {
    return (
      <div className="logo-large"><span>⛳</span></div>
    );
  }
  
  return (
    <div className="logo-large" style={{ padding: '4px' }}>
      <img 
        src={logoPath}
        alt={shortName || fullName}
        onError={() => setImgError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
      />
    </div>
  );
});

// ========== 品牌 Footer ==========
export const BrandFooter = memo(() => (
  <div className="text-center py-3 bg-gray-50 border-t">
    <div className="flex items-center justify-center gap-2">
      <span className="text-green-600 text-lg">⛳</span>
      <span className="text-sm font-semibold text-gray-600">
        Powered by <span className="text-green-600">HandinCap.golf</span>
      </span>
    </div>
  </div>
));

// ========== 分享报告页面 ==========
export const ShareReportPage = memo(({ data, onViewFull }) => {
  const holes = data.h || [];
  const front9 = holes.filter(h => h.h <= 9);
  const back9 = holes.filter(h => h.h > 9);
  const front9Total = front9.reduce((sum, h) => sum + h.o + h.t, 0);
  const back9Total = back9.reduce((sum, h) => sum + h.o + h.t, 0);
  
  const totalPutts = holes.reduce((sum, h) => sum + h.t, 0);
  const avgPutts = holes.length > 0 ? (totalPutts / holes.length).toFixed(1) : '0';
  const onePutts = holes.filter(h => h.t === 1).length;
  const threePutts = holes.filter(h => h.t >= 3).length;
  
  const birdies = holes.filter(h => (h.o + h.t) - h.p === -1).length;
  const pars = holes.filter(h => (h.o + h.t) - h.p === 0).length;
  const bogeys = holes.filter(h => (h.o + h.t) - h.p === 1).length;
  const doubles = holes.filter(h => (h.o + h.t) - h.p >= 2).length;
  
  const toPar = data.s - data.p;
  const diffText = toPar > 0 ? `+${toPar}` : toPar === 0 ? 'E' : `${toPar}`;

  return (
  <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="classic-header text-white relative">
        <div className="pt-5 pb-4 px-4 relative z-10">
          <div className="flex justify-center mb-3">
            <CourseLogo shortName={data.c} fullName={data.f} />
          </div>
          <div className="text-center mb-3">
            <h1 className="font-bold text-xl leading-tight gold-accent">
              {data.f || data.c}
            </h1>
            <p className="text-green-200 text-sm mt-1">{data.d}</p>
          </div>
          <div className="border-t border-green-500 border-opacity-50 my-3"></div>
          <div className="text-center">
            <div className="text-lg font-semibold mb-1">{data.n}</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-extrabold">{data.s}</span>
              <span className={`px-3 py-1 rounded-lg text-lg font-bold ${
                toPar > 0 ? 'bg-red-500 text-white' : toPar === 0 ? 'bg-gray-200 text-gray-700' : 'bg-green-400 text-green-900'
              }`}>{diffText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-3 overflow-auto">
        {/* Hole by Hole */}
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="text-sm font-semibold text-gray-500 mb-2">📋 Hole by Hole</div>
          
          {front9.length > 0 && (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs text-gray-400">Front 9 OUT</span>
      <span className="text-sm text-gray-500">Total <span className="font-bold text-green-600">{front9Total}</span></span>
    </div>
    <div className="flex justify-between mb-1">
      {front9.map(d => (
        <div key={d.h} className="w-8 text-center">
          <span className="text-xs font-semibold text-gray-500">{d.h}</span>
          <div className="text-[10px] text-gray-400">P{d.p}</div>
        </div>
      ))}
    </div>
    <div className="flex justify-between">
      {front9.map(d => (
        <div key={d.h} className="flex justify-center">
          <div className={getShareScoreClass(d.o + d.t, d.p)}>
            {d.o + d.t}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{back9.length > 0 && (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs text-gray-400">Back 9 IN</span>
      <span className="text-sm text-gray-500">Total <span className="font-bold text-green-600">{back9Total}</span></span>
    </div>
    <div className="flex justify-between mb-1">
      {back9.map(d => (
        <div key={d.h} className="w-8 text-center">
          <span className="text-xs font-semibold text-gray-500">{d.h}</span>
          <div className="text-[10px] text-gray-400">P{d.p}</div>
        </div>
      ))}
    </div>
    <div className="flex justify-between">
      {back9.map(d => (
        <div key={d.h} className="flex justify-center">
          <div className={getShareScoreClass(d.o + d.t, d.p)}>
            {d.o + d.t}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
        </div>

        {/* Score Distribution */}
<div className="bg-white border border-gray-200 rounded-xl p-3">
  <div className="text-sm font-semibold text-gray-500 mb-2">🎯 Score Distribution</div>
  <div className="flex justify-around">
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
    
    <div className="flex flex-col items-center gap-2">
      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
        Par
      </span>
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' }}
      >
        <span className="text-2xl font-extrabold text-white">{pars}</span>
      </div>
    </div>
    
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

        {/* Putting Analysis */}
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="text-sm font-semibold text-gray-500 mb-2">📊 Putting Analysis</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Total</div>
              <div className="text-xl font-bold text-gray-800">{totalPutts}</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Avg</div>
              <div className="text-xl font-bold text-blue-600">{avgPutts}</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">1-Putt</div>
              <div className="text-xl font-bold text-green-600">{onePutts}</div>
            </div>
          </div>
          {threePutts > 0 && (
            <div className="mt-2 text-center text-sm text-red-500">⚠️ 3-Putts: {threePutts}</div>
          )}
        </div>
      </div>

      {/* View Full Detail */}
      <div className="flex-shrink-0 p-4 border-t" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <button onClick={onViewFull} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition">
          View Full Detail →
        </button>
      </div>
      
      <BrandFooter />
    </div>
  );
});

// ========== 分享完整明细页面 ==========
export const ShareDetailPage = memo(({ data, onBack }) => {
  const holes = data.h || [];
  const front9 = holes.filter(h => h.h <= 9);
  const back9 = holes.filter(h => h.h > 9);
  
  const totalPutts = holes.reduce((sum, h) => sum + h.t, 0);
  const totalWater = holes.reduce((sum, h) => sum + (h.w || 0), 0);
  const totalOb = holes.reduce((sum, h) => sum + (h.b || 0), 0);
  
  const toPar = data.s - data.p;
  const diffText = toPar > 0 ? `+${toPar}` : toPar === 0 ? 'E' : `${toPar}`;

  const getScoreStyle = (total, par) => {
    const diff = total - par;
    if (diff <= -2) return 'text-purple-600 bg-purple-100';
    if (diff === -1) return 'text-blue-600 bg-blue-100';
    if (diff === 0) return 'text-gray-700 bg-gray-100';
    if (diff === 1) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
  <div className="bg-white min-h-screen flex flex-col">
      {/* Compact Header */}
      <div className="classic-header text-white relative">
        <div className="py-3 px-4 relative z-10">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 text-lg">←</button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-sm gold-accent truncate">{data.c}</h1>
              <p className="text-green-200 text-xs">{data.d}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{data.n}</span>
              <span className="text-2xl font-extrabold">{data.s}</span>
              <span className={`px-2 py-0.5 rounded text-sm font-bold ${
                toPar > 0 ? 'bg-red-500' : toPar === 0 ? 'bg-gray-200 text-gray-700' : 'bg-green-400 text-green-900'
              }`}>{diffText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {front9.length > 0 && (
          <>
            <div className="px-3 py-2 bg-green-50 text-xs font-semibold text-green-700 sticky top-0 z-10">Front 9 OUT</div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">Hole</th>
                  <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">Par</th>
                  <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">On</th>
                  <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">Putt</th>
                  <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">Tot</th>
                  {data.a && <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">💧</th>}
                  {data.a && <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">OB</th>}
                </tr>
              </thead>
              <tbody>
                {front9.map((d, idx) => (
                  <tr key={d.h} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-2 text-center font-semibold text-gray-700">{d.h}</td>
                    <td className="py-2 px-2 text-center text-gray-500">{d.p}</td>
                    <td className="py-2 px-2 text-center text-gray-700">{d.o}</td>
                    <td className="py-2 px-2 text-center text-blue-600">{d.t}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-block w-7 h-7 leading-7 rounded-full font-bold text-sm ${getScoreStyle(d.o + d.t, d.p)}`}>
                        {d.o + d.t}
                      </span>
                    </td>
                    {data.a && <td className="py-2 px-2 text-center">{d.w > 0 ? <span className="text-cyan-600 font-bold">{d.w}</span> : <span className="text-gray-300">-</span>}</td>}
    {data.a && <td className="py-2 px-2 text-center">{d.b > 0 ? <span className="text-yellow-600 font-bold">{d.b}</span> : <span className="text-gray-300">-</span>}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {back9.length > 0 && (
          <>
            <div className="px-3 py-2 bg-blue-50 text-xs font-semibold text-blue-700 sticky top-0 z-10">Back 9 IN</div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">Hole</th>
                  <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">Par</th>
                  <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">On</th>
                  <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">Putt</th>
                  <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">Tot</th>
                  {data.a && <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">💧</th>}
                  {data.a && <th className="py-2 px-2 text-center text-xs font-semibold text-gray-600">OB</th>}
                </tr>
              </thead>
              <tbody>
                {back9.map((d, idx) => (
                  <tr key={d.h} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-2 text-center font-semibold text-gray-700">{d.h}</td>
                    <td className="py-2 px-2 text-center text-gray-500">{d.p}</td>
                    <td className="py-2 px-2 text-center text-gray-700">{d.o}</td>
                    <td className="py-2 px-2 text-center text-blue-600">{d.t}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-block w-7 h-7 leading-7 rounded-full font-bold text-sm ${getScoreStyle(d.o + d.t, d.p)}`}>
                        {d.o + d.t}
                      </span>
                    </td>
                    {data.a && <td className="py-2 px-2 text-center">{d.w > 0 ? <span className="text-cyan-600 font-bold">{d.w}</span> : <span className="text-gray-300">-</span>}</td>}
    {data.a && <td className="py-2 px-2 text-center">{d.b > 0 ? <span className="text-yellow-600 font-bold">{d.b}</span> : <span className="text-gray-300">-</span>}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="flex-shrink-0 bg-gray-100 p-3 border-t" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div className={`grid gap-2 text-center ${data.a ? 'grid-cols-4' : 'grid-cols-2'}`}>
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <div className="text-gray-500 text-xs">Total</div>
            <div className="font-bold text-xl text-gray-800">{data.s}</div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <div className="text-gray-500 text-xs">Putt</div>
            <div className="font-bold text-xl text-blue-600">{totalPutts}</div>
          </div>
          {data.a && (
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="text-gray-500 text-xs">💧</div>
              <div className="font-bold text-xl text-cyan-600">{totalWater}</div>
            </div>
          )}
          {data.a && (
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="text-gray-500 text-xs">OB</div>
              <div className="font-bold text-xl text-yellow-600">{totalOb}</div>
            </div>
          )}
        </div>
      </div>
      
      <BrandFooter />
    </div>
  );
});

// ========== 主分享页面容器 ==========
const SharePage = memo(({ data, PWAInstallPrompt }) => {
  const [view, setView] = useState('report');

  // 注入样式
  useEffect(() => {
    try {
      if (!document.getElementById('share-page-styles')) {
        const style = document.createElement('style');
        style.id = 'share-page-styles';
        style.textContent = sharePageStyles;
        document.head.appendChild(style);
      }
    } catch (e) {
      console.error('Style injection error:', e);
    }
  }, []);

  // 数据验证
  if (!data || !data.h || !Array.isArray(data.h)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
          <div className="text-4xl mb-3">❌</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Invalid Link</h2>
          <p className="text-gray-600 text-sm">This share link is invalid or expired.</p>
          <a href="/" className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
            Go to HandinCap
          </a>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    {view === 'report' ? (
      <ShareReportPage data={data} onViewFull={() => setView('detail')} />
    ) : (
      <ShareDetailPage data={data} onBack={() => setView('report')} />
    )}
    {PWAInstallPrompt && <PWAInstallPrompt lang="en" />}
  </div>
);
});

export default SharePage;
