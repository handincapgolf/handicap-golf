import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  Plus, 
  Minus, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  X,
  Trophy,
  DollarSign,
  Play,
  Home,
  Users,
  Settings,
  BarChart3,
  Target,
  Camera,
  CircleDollarSign,
  Search,
  MapPin,
  Edit2,
  Droplets,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from 'lucide-react';

import { GOLF_COURSES, searchCourses } from './data/courses';
import { useTranslation } from './locales';

// ========== 超紧凑分享链接 V3 (二进制压缩 + fullName) ==========

const packBits = (values, bitSizes) => {
  let bits = '';
  values.forEach((val, i) => {
    bits += val.toString(2).padStart(bitSizes[i], '0');
  });
  while (bits.length % 8 !== 0) bits += '0';
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return bytes;
};

const unpackBits = (bytes, bitSizes, count) => {
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

const bytesToBase64 = (bytes) => {
  const binary = String.fromCharCode(...bytes);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const base64ToBytes = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  return Array.from(binary, c => c.charCodeAt(0));
};

const encodeShareData = (data) => {
  try {
    const dateCompact = data.d.slice(2).replace(/-/g, '');
    const startHole = data.h[0]?.h || 1;
    const holeCount = data.h.length;
    const isAdvance = data.a ? 1 : 0;
    
    const holeValues = [];
    const bitSizes = isAdvance ? [2, 4, 3, 2, 2] : [2, 4, 3];
    
    data.h.forEach(h => {
      holeValues.push(h.p - 3);
      holeValues.push(Math.min(h.o, 15));
      holeValues.push(Math.min(h.t, 7));
      if (isAdvance) {
        holeValues.push(Math.min(h.w || 0, 3));
        holeValues.push(Math.min(h.b || 0, 3));
      }
    });
    
    const allBitSizes = [];
    for (let i = 0; i < holeCount; i++) {
      allBitSizes.push(...bitSizes);
    }
    
    const holeBytes = packBits(holeValues, allBitSizes);
    const holeData = bytesToBase64(holeBytes);
    
    const parts = [
      data.n,
      data.f || data.c || 'X',
      dateCompact,
      isAdvance,
      startHole,
      holeCount,
      holeData
    ];
    
    const compact = parts.join('|');
    const base64 = btoa(unescape(encodeURIComponent(compact)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error('Encode error:', e);
    return null;
  }
};

const decodeShareData = (encoded) => {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    
    const compact = decodeURIComponent(escape(atob(base64)));
    const parts = compact.split('|');
    
    const name = parts[0];
    const fullName = parts[1];
    const dateRaw = parts[2];
    const date = `20${dateRaw.slice(0,2)}-${dateRaw.slice(2,4)}-${dateRaw.slice(4,6)}`;
    const isAdvance = parts[3] === '1';
    const startHole = Number(parts[4]);
    const holeCount = Number(parts[5]);
    const holeData = parts[6];
    
    const holeBytes = base64ToBytes(holeData);
    const bitSizes = isAdvance ? [2, 4, 3, 2, 2] : [2, 4, 3];
    const valuesPerHole = bitSizes.length;
    const holeValues = unpackBits(holeBytes, bitSizes, holeCount * valuesPerHole);
    
    const holesData = [];
    for (let i = 0; i < holeCount; i++) {
      const base = i * valuesPerHole;
      const hole = {
        h: startHole + i,
        p: holeValues[base] + 3,
        o: holeValues[base + 1],
        t: holeValues[base + 2]
      };
      if (isAdvance) {
        hole.w = holeValues[base + 3];
        hole.b = holeValues[base + 4];
      }
      holesData.push(hole);
    }
    
    const totalScore = holesData.reduce((sum, h) => sum + h.o + h.t, 0);
    const totalPar = holesData.reduce((sum, h) => sum + h.p, 0);
    const totalPutts = holesData.reduce((sum, h) => sum + h.t, 0);
    
    return {
      v: 3,
      n: name,
      c: fullName,
      f: fullName,
      d: date,
      s: totalScore,
      p: totalPar,
      u: totalPutts,
      a: isAdvance,
      h: holesData
    };
  } catch (e) {
    console.error('Decode error:', e);
    return null;
  }
};

// 生成个人报告的分享数据
const generatePlayerShareData = (player, course, holes, pars, allScores, allPutts, allWater, allOb, completedHoles, isAdvancePlayer) => {
  // 计算统计数据
  const holeDetails = completedHoles.map(hole => {
    const on = allScores[player]?.[hole] || 0;
    const putts = allPutts[player]?.[hole] || 0;
    const detail = {
      h: hole,                          // hole number
      p: pars[hole] || 4,               // par
      o: on,                            // on green strokes
      t: putts                          // putts
    };
    // 只有 Advance 玩家才记录 water/OB
    if (isAdvancePlayer) {
      detail.w = allWater[player]?.[hole] || 0;
      detail.b = allOb[player]?.[hole] || 0;
    }
    return detail;
  });

  const totalScore = holeDetails.reduce((sum, h) => sum + h.o + h.t, 0);
  const totalPar = holeDetails.reduce((sum, h) => sum + h.p, 0);
  const totalPutts = holeDetails.reduce((sum, h) => sum + h.t, 0);

  return {
    v: 1,                               // version
    n: player,                          // player name
    c: course?.shortName || 'Custom',   // course short name
    f: course?.fullName || '',          // course full name
    d: new Date().toISOString().split('T')[0], // date
    s: totalScore,                      // total score
    p: totalPar,                        // total par
    u: totalPutts,                      // total putts
    a: isAdvancePlayer || false,        // advance mode 标志（新增）
    h: holeDetails                      // hole details
  };
};

// 生成分享链接
const generateShareUrl = (data) => {
  const encoded = encodeShareData(data);
  if (!encoded) return null;
  
  // 获取当前域名
  const baseUrl = window.location.origin;
  return `${baseUrl}?p=${encoded}`;
};

// ========== 分享页面组件 ==========

// 分享页面样式
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

// PGA 成绩样式
const getShareScoreClass = (score, par) => {
  const diff = score - par;
  if (diff <= -2) return 'pga-eagle';
  if (diff === -1) return 'pga-birdie';
  if (diff === 0) return 'pga-par';
  if (diff === 1) return 'pga-bogey';
  return 'pga-double';
};
// 球场 Logo 组件 - 自动识别 shortName
const CourseLogo = memo(({ shortName, fullName }) => {
  const [imgError, setImgError] = useState(false);
  
  // 尝试从 shortName 或 fullName 中提取简称
  const getLogoName = () => {
    // 如果是真正的 shortName（短，无空格或很少空格）
    if (shortName && shortName.length <= 15 && !shortName.includes('Golf')) {
      return shortName.toLowerCase();
    }
    // 否则从 fullName 提取首字母缩写
    if (fullName || shortName) {
      const name = fullName || shortName;
      // 提取大写首字母作为缩写
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

// 品牌 Footer
const BrandFooter = memo(() => (
  <div className="text-center py-3 bg-gray-50 border-t">
    <div className="flex items-center justify-center gap-2">
      <span className="text-green-600 text-lg">⛳</span>
      <span className="text-sm font-semibold text-gray-600">
        Powered by <span className="text-green-600">HandinCap.golf</span>
      </span>
    </div>
  </div>
));

// 分享报告页面
const ShareReportPage = memo(({ data, onViewFull }) => {
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
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Birdie</div>
              <div className="text-xl font-bold text-blue-600">{birdies}</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Par</div>
              <div className="text-xl font-bold text-gray-600">{pars}</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Bogey</div>
              <div className="text-xl font-bold text-orange-600">{bogeys}</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Dbl+</div>
              <div className="text-xl font-bold text-red-600">{doubles}</div>
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

// 分享完整明细页面
const ShareDetailPage = memo(({ data, onBack }) => {
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

// 主分享页面容器
const SharePage = memo(({ data }) => {
  const [view, setView] = useState('report');
  const [error, setError] = useState(null);

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
    <PWAInstallPrompt lang="en" />
  </div>
);
});

const Toast = memo(({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  const icon = type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 text-sm animate-pulse`}>
      {icon}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
});

const ConfirmDialog = memo(({ isOpen, onClose, onConfirm, message, t, showScreenshotHint }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-base font-semibold text-gray-900 mb-4 leading-relaxed">{message}</h3>
        {showScreenshotHint && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Camera className="w-5 h-5 text-yellow-600 mt-0.5" />
              <p className="text-xs text-yellow-800">
                {t('screenshotHint')}
              </p>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            {t('yes')}
          </button>
        </div>
      </div>
    </div>
  );
});
const PuttsWarningDialog = memo(({ isOpen, onClose, onConfirm, players, scores, pars, holes, currentHole, t, lang }) => {
  if (!isOpen || !players || players.length === 0) return null;

  const holeNum = holes[currentHole];
  const par = pars[holeNum] || 4;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 max-w-xs w-full shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">{t('confirmPutts')}</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">{t('zeroPuttsWarning')}</p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
          {players.map(player => {
            const playerScore = scores[player] || par;
            return (
              <div key={player} className="flex items-center justify-between py-1.5 border-b border-yellow-100 last:border-b-0">
                <span className="font-semibold text-gray-900">{player}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600">{lang === 'zh' ? '成绩' : 'Score'}: <span className="font-bold text-gray-900">{playerScore}</span></span>
                  <span className="text-red-600 font-bold">{lang === 'zh' ? '推' : 'Putts'}: 0</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <p className="text-xs text-gray-500 mb-3">
          💡 {t('puttsTip')}
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
          >
            {t('puttsGoBack')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
          >
            {t('puttsConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
});

const HoleScoreConfirmDialog = memo(({ isOpen, onClose, onConfirm, hole, players, scores, putts, rankings, gameMode, getHandicapForHole, pars, t, stake, prizePool, activePlayers }) => {
  if (!isOpen || !players) return null;

  let skinsWinner = null;
  let skinsAmount = 0;
  let netWinnings = 0;
  if (gameMode === 'skins' && Number(stake) > 0) {
    const par = pars[hole] || 4;
    const playerScores = players.map(p => ({
      player: p,
      score: scores[p] || par,
      netScore: (scores[p] || par) - getHandicapForHole(p, hole, par)
    }));
    
    playerScores.sort((a, b) => a.netScore - b.netScore);
    const minScore = playerScores[0].netScore;
    const winners = playerScores.filter(p => p.netScore === minScore);
    
    if (winners.length === 1) {
      skinsWinner = winners[0].player;
      skinsAmount = prizePool + (Number(stake) || 0) * activePlayers.length;
      netWinnings = skinsAmount - Number(stake);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {t('confirmHoleScore').replace('{hole}', hole)}
        </h3>
        
        {gameMode === 'skins' && Number(stake) > 0 && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            {skinsWinner ? (
              <>
                <div className="text-center text-purple-800 font-semibold">
                  {t('skinsWinner').replace('{player}', skinsWinner)}
                </div>
                <div className="text-center text-2xl font-bold text-purple-600 mt-1">
                  ${netWinnings}
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-purple-800 font-semibold">
                  {t('holeTied')}
                </div>
                <div className="text-center text-sm text-purple-600 mt-1">
                  {t('poolGrows')}: ${prizePool + (Number(stake) || 0) * activePlayers.length}
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">{t('holeScoresSummary')}</p>
          <div className="space-y-2">
            {(gameMode === 'matchPlay' || gameMode === 'skins') ? (
              players.map(player => {
                const playerOn = scores[player] || (pars[hole] || 4);
                const playerPutts = putts?.[player] || 0;
                const score = playerOn + playerPutts;
                const handicap = getHandicapForHole(player, hole, pars[hole] || 4);
                const netScore = score - handicap;
                
                return (
                  <div key={player} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{player}</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{score}</span>
                      {handicap > 0 && (
                        <div className="text-xs text-green-600">
                          {t('netScore')}: {netScore}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              rankings && rankings.map(r => (
                <div key={r.player} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{r.player}</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{r.score}</span>
                    {r.up && <span className="ml-1 text-xs text-yellow-600">(UP)</span>}
                    <div className="text-xs text-gray-600">
                      {r.finalRank === 1 ? t('winner') : t('rank').replace('{n}', r.finalRank)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
});

// 洞号选择弹窗
const HoleSelectDialog = memo(({ isOpen, onClose, completedHoles = [], onSelect, t, pars = {} }) => {
  if (!isOpen || !completedHoles || completedHoles.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-5 max-w-xs w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {t('selectHoleToEdit')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
<div className="grid grid-cols-5 gap-2 mb-4">
  {completedHoles.map(hole => {
    const par = pars[hole] || 4;
    const colorClass = par === 3 
      ? 'bg-yellow-300 hover:bg-yellow-400 text-yellow-900' 
      : par === 5 
        ? 'bg-orange-300 hover:bg-orange-400 text-orange-900' 
        : 'bg-gray-300 hover:bg-gray-400 text-gray-900';
    
    return (
      <button
        key={hole}
        onClick={() => { onSelect(hole); onClose(); }}
        className={`w-12 h-12 ${colorClass} rounded-lg font-bold text-lg transition`}
      >
        {hole}
      </button>
    );
  })}
</div>
        
        <button 
          onClick={onClose} 
          className="w-full px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
});

// 编辑洞成绩弹窗
// 编辑洞成绩弹窗 - iPhone优化版
const EditHoleDialog = memo(({ isOpen, onClose, hole, players = [], allScores = {}, allUps = {}, allPutts = {}, pars = {}, onSave, t, gameMode }) => {
  const [editScores, setEditScores] = useState({});
  const [editUps, setEditUps] = useState({});
  const [editPutts, setEditPutts] = useState({});

  useEffect(() => {
    if (isOpen && hole && players.length > 0) {
      const initialScores = {};
      const initialUps = {};
      const initialPutts = {};
      players.forEach(p => {
        initialScores[p] = allScores[p]?.[hole] || pars[hole] || 4;
        initialUps[p] = allUps[p]?.[hole] || false;
        initialPutts[p] = allPutts[p]?.[hole] || 0;
      });
      setEditScores(initialScores);
      setEditUps(initialUps);
      setEditPutts(initialPutts);
    }
  }, [isOpen, hole, players, allScores, allUps, allPutts, pars]);

  if (!isOpen || !hole || !players || players.length === 0) return null;

  const par = pars[hole] || 4;

  const changeScore = (player, delta) => {
    setEditScores(prev => ({
      ...prev,
      [player]: Math.max(1, (prev[player] || par) + delta)
    }));
  };

  const changePutts = (player, delta) => {
    setEditPutts(prev => ({
      ...prev,
      [player]: Math.max(0, (prev[player] || 0) + delta)
    }));
  };

  const toggleUp = (player) => {
    setEditUps(prev => ({
      ...prev,
      [player]: !prev[player]
    }));
  };

  const getScoreLabel = (stroke, par) => {
    const diff = stroke - par;
    if (diff <= -2) return { text: 'Eagle', numClass: 'bg-purple-500 text-white', labelClass: 'bg-purple-500 text-white' };
    if (diff === -1) return { text: 'Birdie', numClass: 'bg-blue-500 text-white', labelClass: 'bg-blue-500 text-white' };
    if (diff === 0) return { text: 'Par', numClass: 'bg-gray-100 text-gray-800', labelClass: 'bg-gray-200 text-gray-600' };
    if (diff === 1) return { text: 'Bogey', numClass: 'bg-orange-500 text-white', labelClass: 'bg-orange-500 text-white' };
    return { text: 'Dbl+', numClass: 'bg-red-500 text-white', labelClass: 'bg-red-500 text-white' };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl p-3 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-bold text-gray-900">
            {t('editHole')} {hole} (PAR {par})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2 mb-3">
          {players.map(player => {
            const playerOn = editScores[player] || par;
            const playerPutts = editPutts[player] || 0;
            const stroke = playerOn + playerPutts;
            const label = getScoreLabel(stroke, par);
            const playerUp = editUps[player] || false;

            return (
              <div key={player} className={`rounded-lg px-2.5 py-2 transition-all ${
                playerUp ? 'card-up-active' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-14 flex-shrink-0">
                    {gameMode === 'win123' && (
                      <button
                        onClick={() => toggleUp(player)}
                        className={`w-8 h-8 rounded-md font-bold text-xs btn-press flex flex-col items-center justify-center transition mb-0.5 ${
                          playerUp 
                            ? 'bg-yellow-400 text-yellow-900 shadow' 
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span style={{fontSize: '7px', lineHeight: 1}}>UP</span>
                      </button>
                    )}
                    <div className="font-bold text-sm text-gray-900 truncate">{player}</div>
                  </div>

                  <div className="flex flex-col items-center mx-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl font-extrabold shadow ${label.numClass}`}>{stroke}</div>
                    <div className={`px-1.5 py-0.5 rounded mt-0.5 text-xs font-bold ${label.labelClass}`} style={{fontSize: '9px'}}>{label.text}</div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-end">
                      <span className="text-xs font-semibold text-gray-500 w-8">On</span>
                      <button
                        onClick={() => changeScore(player, -1)}
                        disabled={playerOn <= 1}
                        className={`w-8 h-8 rounded-full flex items-center justify-center btn-press ${
                          playerOn > 1 ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xl font-bold w-8 text-center text-gray-900">{playerOn}</span>
                      <button
                        onClick={() => changeScore(player, 1)}
                        className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center btn-press"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <span className="text-xs font-semibold text-gray-500 w-8">Putts</span>
                      <button
                        onClick={() => changePutts(player, -1)}
                        disabled={playerPutts <= 0}
                        className={`w-8 h-8 rounded-full flex items-center justify-center btn-press ${
                          playerPutts > 0 ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xl font-bold w-8 text-center text-blue-600">{playerPutts}</span>
                      <button
                        onClick={() => changePutts(player, 1)}
                        className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center btn-press"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium text-sm"
          >
            {t('cancel')}
          </button>
          <button
            onClick={() => { onSave(hole, editScores, editUps, editPutts); onClose(); }}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-1"
          >
            <CheckCircle className="w-4 h-4" />
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
});

// ========== 在 EditHoleDialog 组件之后添加以下两个组件 ==========

// ========== Advance Mode 报告卡片组件 ==========
const AdvanceReportCard = memo(({ player, rank, onClose, onViewFull, allScores, allPutts, allWater, allOb, allUps, pars, completedHoles, gameMode, t, getMedal, isAdvancePlayer }) => {
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

          {/* 成绩分布 */}
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="text-sm font-semibold text-gray-500 mb-2">🎯 {t('scoreDistribution')}</div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Birdie</div>
                <div className="text-xl font-bold text-blue-600">{birdies}</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Par</div>
                <div className="text-xl font-bold text-gray-600">{parsCount}</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Bogey</div>
                <div className="text-xl font-bold text-orange-600">{bogeys}</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Double+</div>
                <div className="text-xl font-bold text-red-600">{doubles}</div>
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
const AdvanceFullDetailModal = memo(({ player, rank, onClose, onBack, allScores, allPutts, allWater, allOb, allUps, pars, completedHoles, gameMode, t, getMedal, isAdvancePlayer }) => {
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

const PlayerInput = memo(({ index, value, placeholder, onChange }) => {
  const handleChange = useCallback((e) => {
    onChange(index, e.target.value);
  }, [index, onChange]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
    />
  );
});

const HandicapRow = memo(({ playerName, handicapValue, onChange, maxHoles = 18, lang = 'en' }) => {
  return (
    <div className="bg-gray-50 rounded-md p-3 mb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-green-600 flex-shrink-0">
          {playerName}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {lang === 'zh' ? '差点' : 'HCP'}
          </span>
          <input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  maxLength={2}
  value={handicapValue > 0 ? handicapValue : ''}
  placeholder=""
  onChange={(e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const num = val === '' ? 0 : Math.min(36, parseInt(val, 10));
    onChange(playerName, num);
  }}
  className="w-16 px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm text-center"
/>
          <span className="text-xs text-gray-400">
            / {maxHoles * 2}
          </span>
        </div>
      </div>
    </div>
  );
});

// 展开式说明组件
const ExpandableInfo = memo(({ children, isOpen, onToggle, lang }) => {
  return (
    <div className="mt-2">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span>{isOpen ? (lang === 'zh' ? '收起说明' : 'Hide') : (lang === 'zh' ? '了解更多' : 'Learn more')}</span>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {isOpen && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-gray-700 leading-relaxed animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
});

const ScoreDisplay = memo(({ score, par }) => {
  const diff = score - par;
  
  let colorClass = 'text-gray-900';
  if (diff <= -2) colorClass = 'text-purple-600';
  else if (diff === -1) colorClass = 'text-blue-600';
  else if (diff === 0) colorClass = 'text-gray-900';
  else if (diff === 1) colorClass = 'text-orange-600';
  else colorClass = 'text-red-600';
  
  return <span className={`font-semibold ${colorClass}`}>{score}</span>;
});

// 高级模式玩家卡片 - 方案3 布局
const AdvancedPlayerCard = memo(({ 
  player, 
  playerOn,
  playerPutts, 
  playerWater, 
  playerOb, 
  playerUp, 
  par, 
  showUp, 
  onChangeOn, 
  onChangePutts, 
  onChangeWater, 
  onChangeOb, 
  onResetWater, 
  onResetOb, 
  onToggleUp, 
  getScoreLabel 
}) => {
  const stroke = playerOn + playerPutts;
  const label = getScoreLabel(stroke, par);

  return (
    <div className={`rounded-lg px-3 py-2.5 shadow-sm transition-all ${
      playerUp ? 'card-up-active' : 'bg-gray-50 border border-gray-200'
    }`}>
      <div className="flex items-center">
        
        {/* 左侧：UP按钮 + 玩家名 */}
        <div className="w-14 flex-shrink-0 flex flex-col items-start">
          {showUp && (
            <button 
              onClick={onToggleUp}
              className={`w-9 h-9 rounded-lg font-bold text-[10px] btn-press flex flex-col items-center justify-center mb-1 transition ${
                playerUp 
                  ? 'bg-yellow-400 text-yellow-900 shadow' 
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[8px] leading-none mt-0.5">UP</span>
            </button>
          )}
          <div className="font-bold text-lg text-gray-900">{player}</div>
        </div>

        {/* Water/OB 按钮 */}
        <div className="flex flex-col gap-2 mx-2">
          <div className="relative">
            <button 
              onClick={onChangeWater}
              className={`w-10 h-10 rounded-lg flex items-center justify-center btn-press transition ${
                playerWater > 0 
                  ? 'bg-cyan-500 text-white shadow' 
                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
              }`}
            >
              <Droplets className="w-5 h-5" />
            </button>
            {playerWater > 0 && (
              <>
                <span className="badge-count">{playerWater}</span>
                <button onClick={onResetWater} className="reset-btn-mini btn-press">−</button>
              </>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={onChangeOb}
              className={`w-10 h-10 rounded-lg flex items-center justify-center btn-press font-bold text-xs transition ${
                playerOb > 0 
                  ? 'bg-yellow-500 text-white shadow' 
                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
              }`}
            >
              OB
            </button>
            {playerOb > 0 && (
              <>
                <span className="badge-count">{playerOb}</span>
                <button onClick={onResetOb} className="reset-btn-mini btn-press">−</button>
              </>
            )}
          </div>
        </div>

        {/* 中间：Stroke 显示（方案3 双层分离） */}
        <div className="flex-1 flex justify-center">
          <div className="stroke-display">
            <div className={`stroke-number ${label.numClass}`}>
              {stroke}
            </div>
            <div className={`stroke-label ${label.class}`}>
              {label.text}
            </div>
          </div>
        </div>

        {/* 右侧：On + Putts 控制器 */}
        <div className="flex flex-col gap-2 ml-2">
          <div className="flex items-center">
            <span className="text-[11px] font-bold text-gray-500 w-10 mr-1">On</span>
            <button 
              onClick={() => onChangeOn(-1)} 
              disabled={playerOn <= 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold transition ${
                playerOn > 1 ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-400'
              }`}
            >
              −
            </button>
            <span className="text-[32px] font-extrabold w-11 text-center text-gray-900">{playerOn}</span>
            <button 
              onClick={() => onChangeOn(1)}
              className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold"
            >
              +
            </button>
          </div>
          <div className="flex items-center">
            <span className="text-[11px] font-bold text-gray-500 w-10 mr-1">Putts</span>
            <button 
              onClick={() => onChangePutts(-1)} 
              disabled={playerPutts <= 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold transition ${
                playerPutts > 0 ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-400'
              }`}
            >
              −
            </button>
            <span className="text-[32px] font-extrabold w-11 text-center text-blue-700">{playerPutts}</span>
            <button 
              onClick={() => onChangePutts(1)}
              className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold"
            >
              +
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
});

const courses = {
  f9: [1,2,3,4,5,6,7,8,9],
  b9: [10,11,12,13,14,15,16,17,18],
  f18: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
  b18: [10,11,12,13,14,15,16,17,18,1,2,3,4,5,6,7,8,9]
};

// ========== PWA 安装提示组件 ==========
const PWAInstallPrompt = ({ lang = 'en' }) => {
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [isIOS, setIsIOS] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const texts = {
    zh: {
      install: '安装 HandinCap',
      domain: 'handincap.golf',
      fastLaunch: '记分卡',
		offlineUse: '球友对战',
		fullScreen: '一键分享',
      installNow: '立即安装',
      later: '暂不安装',
      gotIt: '我知道了',
      iosTitle: '添加到主屏幕：',
      iosStep1: '点击底部',
      iosStep1b: '分享按钮',
      iosStep2: '选择 "添加到主屏幕"',
      iosStep3: '点击 "添加"'
    },
    en: {
      install: 'Install HandinCap',
      domain: 'handincap.golf',
      fastLaunch: 'Scorecard',
		offlineUse: 'Play Together',
		fullScreen: 'Share',
      installNow: 'Install Now',
      later: 'Maybe Later',
      gotIt: 'Got It',
      iosTitle: 'Add to Home Screen:',
      iosStep1: 'Tap the',
      iosStep1b: 'Share button',
      iosStep2: 'Select "Add to Home Screen"',
      iosStep3: 'Tap "Add"'
    }
  };

  const t = texts[lang] || texts.en;

  React.useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    setIsStandalone(standalone);
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) return;
    }
    if (standalone) return;
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 2500);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (iOS && !standalone && isSafari) {
      setTimeout(() => setShowPrompt(true), 2500);
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    handleClose();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPrompt(false);
      setIsClosing(false);
      localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    }, 300);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className={`absolute inset-0 bg-black/30 pointer-events-auto transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} onClick={handleClose} />
      <div className={`absolute bottom-0 left-0 right-0 pointer-events-auto transition-transform duration-300 ease-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`} style={{ animation: isClosing ? 'none' : 'pwaSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
          <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
          <div className="px-5 pb-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900">{t.install}</h3>
                <p className="text-gray-400 text-sm truncate">{t.domain}</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 mb-4">
              <div className="flex justify-around">
  <div className="flex flex-col items-center">
    <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center mb-1.5 shadow-sm">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>
      </svg>
    </div>
    <span className="text-xs text-gray-600 font-medium">{t.fastLaunch}</span>
  </div>
  <div className="flex flex-col items-center">
    <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center mb-1.5 shadow-sm">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    </div>
    <span className="text-xs text-gray-600 font-medium">{t.offlineUse}</span>
  </div>
  <div className="flex flex-col items-center">
    <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center mb-1.5 shadow-sm">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
      </svg>
    </div>
    <span className="text-xs text-gray-600 font-medium">{t.fullScreen}</span>
  </div>
</div>
            </div>
            {isIOS ? (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2l-2 4h1.5v6h1V6H14L12 2z"/><rect x="4" y="14" width="16" height="2" rx="1"/><path d="M6 18h12v2H6z"/></svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 font-semibold mb-2">{t.iosTitle}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold">1</span>
                          <span>{t.iosStep1} <span className="inline-flex items-center bg-blue-200 px-1.5 py-0.5 rounded"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></span> {t.iosStep1b}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold">2</span>
                          <span>{t.iosStep2}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold">3</span>
                          <span>{t.iosStep3}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={handleClose} className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg active:scale-[0.98] transition-transform">{t.gotIt}</button>
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={handleInstall} className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all active:scale-[0.98]">
                  <span className="flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    {t.installNow}
                  </span>
                </button>
                <button onClick={handleClose} className="w-full py-2.5 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors">{t.later}</button>
              </div>
            )}
          </div>
          <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
      </div>
      <style>{`@keyframes pwaSlideUp { from { transform: translateY(100%); opacity: 0.5; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
};
// ========== PWA 安装提示组件结束 ==========

function IntegratedGolfGame() {

// ========== 注入样式 ==========
  useEffect(() => {
    if (!document.getElementById('up-active-style')) {
      const style = document.createElement('style');
      style.id = 'up-active-style';
      style.textContent = `
        /* PGA 经典双圈双框样式 */
        .pga-eagle {
          position: relative;
          width: 32px;
          height: 32px;
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
          width: 32px;
          height: 32px;
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
          width: 32px;
          height: 32px;
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
          width: 32px;
          height: 32px;
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
          width: 32px;
          height: 32px;
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
        .pga-triple {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12px;
          color: #dc2626;
          background: #fef2f2;
          border-radius: 2px;
        }
        .pga-triple::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 2px solid #dc2626;
          border-radius: 2px;
        }
        .pga-triple::after {
          content: '';
          position: absolute;
          inset: 3px;
          border: 2px solid #dc2626;
          border-radius: 2px;
        }
        .pga-quad {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12px;
          color: #dc2626;
          background: #fef2f2;
          border-radius: 2px;
        }
        .pga-quad::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 2px solid #dc2626;
          border-radius: 2px;
        }
        .pga-quad::after {
          content: '';
          position: absolute;
          inset: 3px;
          border: 2px solid #dc2626;
          border-radius: 2px;
        }

        .card-up-active {
          background: linear-gradient(135deg, #fef9c3 0%, #fde047 100%) !important;
          border: 2px solid #eab308 !important;
          animation: pulse-glow 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.3); }
          50% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.6), 0 0 30px rgba(234, 179, 8, 0.3); }
        }
        
        .btn-press:active {
          transform: scale(0.95);
        }
        
        .badge-count {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          background: #374151;
          color: white;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .reset-btn-mini {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        
        /* 方案3: Stroke 双层分离显示 */
        .stroke-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .stroke-number {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .stroke-label {
          padding: 2px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  // ========== 结束样式注入 ==========
  const [lang, setLang] = useState(() => {
    try {
      const savedLang = localStorage.getItem('handincap_lang');
      return savedLang || 'en';
    } catch {
      return 'en';
    }
  });
  const [currentSection, setCurrentSection] = useState('home');
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', action: null, showScreenshotHint: false });
  const [holeConfirmDialog, setHoleConfirmDialog] = useState({ isOpen: false, action: null });
  const [holeSelectDialog, setHoleSelectDialog] = useState(false);
  const [editHoleDialog, setEditHoleDialog] = useState({ isOpen: false, hole: null });
  // Advance Mode 报告弹窗状态
const [advanceReportPlayer, setAdvanceReportPlayer] = useState(null);
const [showAdvanceFullDetail, setShowAdvanceFullDetail] = useState(false);
  
  const [setupMode, setSetupMode] = useState('auto');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseApplied, setCourseApplied] = useState(false);
  
  const [courseType, setCourseType] = useState('f18');
  const [holes, setHoles] = useState(courses.f18);
  const [pars, setPars] = useState(courses.f18.reduce((acc, hole) => ({...acc, [hole]: 4}), {}));
  
  const [gameMode, setGameMode] = useState('matchPlay');
  const [jumboMode, setJumboMode] = useState(false);
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [stake, setStake] = useState('');
  const [prizePool, setPrizePool] = useState(0);
  const [playerHandicaps, setPlayerHandicaps] = useState({});
  const [advanceMode, setAdvanceMode] = useState('off');
  const [advancePlayers, setAdvancePlayers] = useState({});
  const [puttsWarningDialog, setPuttsWarningDialog] = useState({ isOpen: false, players: [] });
  // 新增：展开说明的状态
const [showAdvanceInfo, setShowAdvanceInfo] = useState(false);
  
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState({});  
  const [ups, setUps] = useState({});  
  const [putts, setPutts] = useState({});
  const [water, setWater] = useState({});
  const [ob, setOb] = useState({});
  const [allScores, setAllScores] = useState({});  
  const [allUps, setAllUps] = useState({});  
  const [allPutts, setAllPutts] = useState({});
  const [allWater, setAllWater] = useState({});
  const [allOb, setAllOb] = useState({});
  const [totalMoney, setTotalMoney] = useState({});
  const [moneyDetails, setMoneyDetails] = useState({});
  const [completedHoles, setCompletedHoles] = useState([]);
  const [pendingRankings, setPendingRankings] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentHoleSettlement, setCurrentHoleSettlement] = useState(null);
  const [totalSpent, setTotalSpent] = useState({});
  const [hasSavedGame, setHasSavedGame] = useState(false);
  
  // 语音播报状态
const [voiceEnabled, setVoiceEnabled] = useState(() => {
  try {
    return localStorage.getItem('handincap_voice') === 'true';
  } catch { return false; }
});

// 语音播报函数
const playHoleResults = useCallback((players, holeScores, holePutts) => {
  if (!voiceEnabled) return;
  if (!('speechSynthesis' in window)) return;
  
  // 取消之前的播报
  speechSynthesis.cancel();
  
  // 构建播报内容
  players.forEach((player, index) => {
    const on = holeScores[player] || 0;
    const putt = holePutts[player] || 0;
    const puttWord = putt === 1 ? 'putt' : 'putts';
    
    const text = lang === 'zh' 
      ? `${player}，${on}上${putt}推。`
      : `${player}, ${on} on, ${putt} ${puttWord}.`;
    
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
    
    // 尝试使用女声（覆盖所有设备）
    const voices = speechSynthesis.getVoices();
    const female = voices.find(v => 
      v.name.includes('Samantha') ||        // Mac/iOS
      v.name.includes('Zira') ||            // Windows
      v.name.includes('Female') ||          // Google Female
      v.name.includes('Google') && v.lang === 'en-US' ||  // Android Google
      v.name.includes('Xiaoxiao') ||        // 中文女声
      v.name.includes('Huihui') ||          // 中文女声 Windows
      v.name.includes('女') ||              // 中文含"女"
      v.name.toLowerCase().includes('female')
    );
    if (female) msg.voice = female;
    
    // 延迟播报，每个玩家间隔 1.5 秒
    setTimeout(() => {
      speechSynthesis.speak(msg);
    }, index * 1500);
  });
}, [voiceEnabled, lang]);

  const activePlayers = useMemo(() => {
    return playerNames.filter(name => name.trim());
  }, [playerNames]);
  

  // 从localStorage加载游戏状态
  useEffect(() => {
    const savedGame = localStorage.getItem('golfGameState');
    if (savedGame) {
      setHasSavedGame(true);
    }
  }, []);
  useEffect(() => {
    if (currentSection === 'course') {
      setSearchQuery('');
      setSelectedCourse(null);
      setCourseApplied(false);
    }
  }, [currentSection]);
  // 清除已保存的游戏
  const clearSavedGame = useCallback(() => {
    localStorage.removeItem('golfGameState');
    setHasSavedGame(false);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // 恢复游戏状态
  const resumeGame = useCallback(() => {
    const savedGame = localStorage.getItem('golfGameState');
    if (savedGame) {
      try {
        const gameState = JSON.parse(savedGame);
        setLang(gameState.lang || 'zh');
        setCourseType(gameState.courseType || 'f18');
        setHoles(gameState.holes || courses.f18);
        setPars(gameState.pars || {});
        setGameMode(gameState.gameMode || 'matchPlay');
        setPlayerNames(gameState.playerNames || ['', '', '', '']);
        setStake(gameState.stake || '');
        setPrizePool(gameState.prizePool ?? 0);
        setPlayerHandicaps(gameState.playerHandicaps || {});
        setAdvanceMode(gameState.advanceMode || 'off');
        setCurrentHole(gameState.currentHole || 0);
        setScores(gameState.scores || {});
        setUps(gameState.ups || {});
        setPutts(gameState.putts || {});
        setWater(gameState.water || {});
        setOb(gameState.ob || {});
        setAllScores(gameState.allScores || {});
        setAllUps(gameState.allUps || {});
        setAllPutts(gameState.allPutts || {});
        setAllWater(gameState.allWater || {});
        setAllOb(gameState.allOb || {});
        setTotalMoney(gameState.totalMoney || {});
        setMoneyDetails(gameState.moneyDetails || {});
        setCompletedHoles(gameState.completedHoles || []);
        setGameComplete(gameState.gameComplete || false);
        setCurrentHoleSettlement(gameState.currentHoleSettlement || null);
        setTotalSpent(gameState.totalSpent || {});
        setSelectedCourse(gameState.selectedCourse || null);
        setSetupMode(gameState.setupMode || 'auto');
        setJumboMode(gameState.jumboMode || false);
		setAdvancePlayers(gameState.advancePlayers || {});
        setCurrentSection('game');
      } catch (error) {
        console.error('Failed to resume game:', error);
        showToast('恢复游戏失败', 'error');
      }
    }
  }, [showToast]);

  // 保存游戏状态到localStorage
  useEffect(() => {
    if (currentSection === 'game' && activePlayers.length > 0) {
      const gameState = {
        lang,
        courseType,
        holes,
        pars,
        gameMode,
        playerNames,
        stake,
        prizePool,
        playerHandicaps,
        advanceMode,
        currentHole,
        scores,
        ups,
        putts,
        water,
        ob,
        allScores,
        allUps,
        allPutts,
        allWater,
        allOb,
        totalMoney,
        moneyDetails,
        completedHoles,
        gameComplete,
        currentHoleSettlement,
        totalSpent,
        selectedCourse,
        setupMode,
        jumboMode,
		advancePlayers
      };
      localStorage.setItem('golfGameState', JSON.stringify(gameState));
      setHasSavedGame(true);
    }
  }, [currentSection, lang, courseType, holes, pars, gameMode, playerNames, stake, prizePool, 
      playerHandicaps, advanceMode, currentHole, scores, ups, putts, water, ob,
      allScores, allUps, allPutts, allWater, allOb, totalMoney, 
      moneyDetails, completedHoles, gameComplete, currentHoleSettlement, totalSpent, 
      selectedCourse, setupMode, jumboMode, activePlayers.length]);

  const showConfirm = useCallback((message, action, showScreenshotHint = false) => {
    setConfirmDialog({ isOpen: true, message, action, showScreenshotHint });
  }, []);

  useEffect(() => {
    if (currentSection === 'scorecard') {
      setConfirmDialog({ isOpen: false, message: '', action: null, showScreenshotHint: false });
    }
  }, [currentSection]);

  // ========== 修改后的精准搜索逻辑 ==========
const filteredCourses = useMemo(() => {
  if (!searchQuery.trim()) return [];
  
  const query = searchQuery.toLowerCase().trim();
  const allCourses = Object.values(GOLF_COURSES);
  
  // 调试输出（确认代码已更新后可删除）
  console.log("🔍 搜索词:", query);
  
  // ===== 第一步：shortName 完全匹配 =====
  const exactMatch = allCourses.filter(course => 
    course.shortName.toLowerCase() === query
  );
  
  if (exactMatch.length > 0) {
    console.log("✅ 完全匹配:", exactMatch.map(c => c.shortName));
    return exactMatch;
  }
  
  // ===== 第二步：shortName 以搜索词开头 =====
  const startsWithMatch = allCourses.filter(course => {
    const shortNameLower = course.shortName.toLowerCase();
    const shortNameNoHyphen = shortNameLower.replace(/-/g, '');
    const queryNoHyphen = query.replace(/-/g, '');
    return shortNameLower.startsWith(query) || shortNameNoHyphen.startsWith(queryNoHyphen);
  });
  
  if (startsWithMatch.length > 0) {
    console.log("✅ 开头匹配:", startsWithMatch.map(c => c.shortName));
    return startsWithMatch;
  }
  
  // ===== 第三步：shortName 包含搜索词 =====
  const containsMatch = allCourses.filter(course => 
    course.shortName.toLowerCase().includes(query)
  );
  
  if (containsMatch.length > 0) {
    console.log("✅ 包含匹配:", containsMatch.map(c => c.shortName));
    return containsMatch;
  }
  
  // ===== 第四步：fullName 或 location 匹配 =====
  const keywords = query.split(/\s+/).filter(k => k.length > 0);
  
  const keywordMatches = allCourses
    .map(course => {
      const fullNameLower = course.fullName.toLowerCase();
      const locationStr = course.location ? course.location.join(' ').toLowerCase() : '';
      
      // 所有关键词都必须在 fullName 或 location 中出现
      const allMatch = keywords.every(keyword =>
        fullNameLower.includes(keyword) || locationStr.includes(keyword)
      );
      
      if (!allMatch) return null;
      
      // 计算匹配分数
      let score = 0;
      keywords.forEach(keyword => {
        if (fullNameLower.includes(keyword)) score += 10;
        if (locationStr.includes(keyword)) score += 5;
      });
      
      return { course, score };
    })
    .filter(item => item !== null)
    .sort((a, b) => b.score - a.score)
    .map(item => item.course);
  
  console.log("✅ 关键词匹配:", keywordMatches.length, "个结果");
  return keywordMatches;
}, [searchQuery]);

  const getParColorClass = useCallback((par) => {
    if (par === 3) return 'bg-yellow-300 text-black';
    if (par === 5) return 'bg-orange-300 text-black';
    if (par === 6) return 'bg-red-400 text-black';
    return 'bg-gray-300 text-black';
  }, []);

const t = useTranslation(lang);

  const setCourse = useCallback((type) => {
    setCourseType(type);
    const newHoles = courses[type];
    setHoles(newHoles);
    
    if (selectedCourse) {
      const newPars = {};
      newHoles.forEach((hole) => {
        newPars[hole] = selectedCourse.pars[hole - 1] || 4;
      });
      setPars(newPars);
    } else {
      setPars(newHoles.reduce((acc, hole) => ({...acc, [hole]: 4}), {}));
    }
  }, [selectedCourse]);

  const setPar = useCallback((hole, par) => {
    setPars(prev => ({ ...prev, [hole]: par }));
  }, []);

const confirmCourse = useCallback(() => {
  setCurrentSection('players');
  setTimeout(() => {
    const scrollContainer = document.querySelector('.overflow-auto');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
    window.scrollTo({ top: 0 });
  }, 100);
}, [showToast, t]);

const selectAndApplyCourse = useCallback((course) => {
  setSelectedCourse(course);
  setCourseApplied(false);
  
  // 根据球场数据自动选择洞数
  const holeCount = course.pars.length;
  const autoType = holeCount <= 9 ? 'f9' : 'f18';
  
  setCourseType(autoType);
  const newHoles = courses[autoType];
  setHoles(newHoles);
  
  const newPars = {};
  newHoles.forEach((hole, index) => {
    newPars[hole] = course.pars[index] || 4;
  });
  setPars(newPars);
  setCourseApplied(true);
  
setSearchQuery('');
    
    // 移动端兼容的自动滚动
    setTimeout(() => {
      // 找到滚动容器并滚动
      const scrollContainer = document.querySelector('.overflow-auto') || 
                              document.querySelector('.overflow-y-auto') ||
                              document.documentElement;
      
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
      
      // 同时也尝试 window 滚动
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 200);
  }, []);

  const getVerticalArrangedHoles = useCallback(() => {
    const arranged = [];
    
    if (courseType === 'f9' || courseType === 'b9') {
      for (let i = 0; i < holes.length; i++) {
        arranged.push([holes[i], null]);
      }
    } else if (courseType === 'f18') {
      for (let i = 0; i < 9; i++) {
        arranged.push([holes[i], holes[i + 9]]);
      }
    } else if (courseType === 'b18') {
      for (let i = 0; i < 9; i++) {
        arranged.push([holes[i], holes[i + 9]]);
      }
    }
    
    return arranged;
  }, [holes, courseType]);

  const calculateTotalPar = useCallback(() => {
    return holes.reduce((sum, hole) => sum + (pars[hole] || 4), 0);
  }, [holes, pars]);

  const updatePlayerName = useCallback((index, value) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = value;
      return newNames;
    });
  }, []);

  const toggleJumboMode = useCallback(() => {
    setJumboMode(prev => {
      const newMode = !prev;
      if (newMode) {
        setPlayerNames(['', '', '', '', '', '', '', '']);
      } else {
        setPlayerNames(['', '', '', '']);
      }
      return newMode;
    });
  }, []);

  const updatePlayerHandicap = useCallback((playerName, value) => {
    setPlayerHandicaps(prev => ({
      ...prev,
      [playerName]: Math.max(0, Math.min(36, value || 0))
    }));
  }, []);

// ========== 计算 Stroke = On + Putts ==========
  const getStroke = useCallback((player) => {
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const on = scores[player] ?? par;
    const playerPutts = putts[player] ?? 0;
    return on + playerPutts;
  }, [holes, currentHole, pars, scores, putts]);
  
const getScoreLabel = useCallback((stroke, par) => {
    const diff = stroke - par;
    
    if (diff <= -2) {
      return { text: t('eagle'), class: 'bg-purple-500 text-white', numClass: 'bg-purple-500 text-white' };
    } else if (diff === -1) {
      return { text: t('birdie'), class: 'bg-blue-500 text-white', numClass: 'bg-blue-500 text-white' };
    } else if (diff === 0) {
      return { text: t('parLabel'), class: 'bg-gray-200 text-gray-600', numClass: 'bg-gray-100 text-gray-800' };
    } else if (diff === 1) {
      return { text: t('bogey'), class: 'bg-orange-500 text-white', numClass: 'bg-orange-500 text-white' };
    } else {
      return { text: t('doubleplus'), class: 'bg-red-500 text-white', numClass: 'bg-red-500 text-white' };
    }
  }, [t]);

  const startGame = useCallback(() => {
    if (activePlayers.length < 2) {
      showToast(t('atLeast2'), 'error');
      return;
    }

    const uniqueNames = new Set(activePlayers);
    if (uniqueNames.size !== activePlayers.length) {
      showToast(t('duplicateNames'), 'error');
      return;
    }

    const stakeValue = Number(stake) || 0;
    
    if (gameMode === 'matchPlay') {
    } else if (gameMode === 'skins') {
      if (stakeValue <= 0) {
        showToast(t('noStake'), 'error');
        return;
      }
      setPrizePool(0);
    } else if (gameMode === 'win123') {
      if (stakeValue <= 0) {
        showToast(t('noStake'), 'error');
        return;
      }
      setPrizePool(0);
    }

    const initMoney = {};
    const initDetails = {};
    const initAllScores = {};
    const initSpent = {};
    const initAllPutts = {};
    const initAllWater = {};
    const initAllOb = {};
    
    activePlayers.forEach(player => {
      initMoney[player] = 0;
      initDetails[player] = { fromPool: 0, fromPlayers: {} };
      initAllScores[player] = {};
      initSpent[player] = 0;
      initAllPutts[player] = {};
      initAllWater[player] = {};
      initAllOb[player] = {};
      activePlayers.forEach(other => {
        if (other !== player) {
          initDetails[player].fromPlayers[other] = 0;
        }
      });
    });
    
    setTotalMoney(initMoney);
    setMoneyDetails(initDetails);
    setAllScores(initAllScores);
    setAllUps({});
    setAllPutts(initAllPutts);
    setAllWater(initAllWater);
    setAllOb(initAllOb);
    setTotalSpent(initSpent);
    setCurrentHole(0);  
    setScores({});
    setUps({});
    setPutts({});
    setWater({});
    setOb({});
    setCompletedHoles([]);
    setGameComplete(false);
    setCurrentHoleSettlement(null);
    setCurrentSection('game');
  }, [activePlayers, stake, gameMode, showToast, t]);

  // 基于 Index 的让杆计算
  // holeNum: 实际洞号 (1-18)
  // playerHandicap: 玩家差点数 (0-36)
  // holeIndex: 该洞的难度排名 (1-18, 1=最难)
  // 让杆规则: 差点 >= index 时放1杆, 差点 >= index+18 时放2杆
  const getHandicapForHole = useCallback((player, holeNum, par = 4) => {
    
    const playerHcp = playerHandicaps[player];
    if (!playerHcp || playerHcp <= 0) return 0;
    
    // 获取该洞的 index
    let holeIndex = null;
    if (selectedCourse && selectedCourse.index && Array.isArray(selectedCourse.index)) {
      holeIndex = selectedCourse.index[holeNum - 1];
    }
    
    // 如果没有 index 数据，fallback: 按洞号顺序分配
    if (!holeIndex) {
      // Fallback: 前 playerHcp 个洞各放1杆
      const totalHoles = holes.length;
      if (playerHcp >= holeNum) return 1;
      if (playerHcp >= holeNum + totalHoles) return 2;
      return 0;
    }
    
    // 基于 index 计算让杆
    let strokes = 0;
    if (playerHcp >= holeIndex) strokes += 1;        // 第一轮让杆
    if (playerHcp >= holeIndex + 18) strokes += 1;  // 第二轮让杆 (差点 > 18)
    
    return strokes;
  }, [playerHandicaps, selectedCourse, holes.length]);

  const calculateMatchPlay = useCallback((holeScores, holeNum) => {
    const stakeValue = Number(stake) || 0;
    const par = pars[holeNum] || 4;
    const playerScores = activePlayers.map(p => ({
      player: p,
      score: holeScores[p] || par,
      netScore: (holeScores[p] || par) - getHandicapForHole(p, holeNum, par)
    }));
    
    playerScores.sort((a, b) => a.netScore - b.netScore);
    const minScore = playerScores[0].netScore;
    const winners = playerScores.filter(p => p.netScore === minScore);
    const losers = playerScores.filter(p => p.netScore > minScore);
    
    const results = {};
    activePlayers.forEach(player => {
      results[player] = { money: 0 };
    });
    
    if (winners.length < activePlayers.length && stakeValue > 0) {
      const winAmount = (losers.length * stakeValue) / winners.length;
      winners.forEach(w => {
        results[w.player].money = winAmount;
      });
      losers.forEach(l => {
        results[l.player].money = -stakeValue;
      });
    }
    
    return results;
  }, [activePlayers, stake, pars, getHandicapForHole]);

  const calculateSkins = useCallback((holeScores, holeNum) => {
    const stakeValue = Number(stake) || 0;
    const par = pars[holeNum] || 4;
    
    const currentPrizePool = Math.max(0, prizePool);
    
    const playerScores = activePlayers.map(p => ({
      player: p,
      score: holeScores[p] || par,
      netScore: (holeScores[p] || par) - getHandicapForHole(p, holeNum, par)
    }));
    
    playerScores.sort((a, b) => a.netScore - b.netScore);
    const minScore = playerScores[0].netScore;
    const winners = playerScores.filter(p => p.netScore === minScore);
    
    const results = {};
    let poolChange = 0;
    
    activePlayers.forEach(player => {
      results[player] = { 
        money: -stakeValue,
        fromPool: 0,
        spent: stakeValue
      };
    });
    
    const holeStake = stakeValue * activePlayers.length;
    
    if (winners.length === 1) {
      const winner = winners[0].player;
      const winAmount = currentPrizePool + holeStake;
      results[winner].money = winAmount - stakeValue;
      results[winner].fromPool = currentPrizePool;
      
      poolChange = -currentPrizePool;
    } else {
      poolChange = holeStake;
    }
    
    return { results, poolChange, isTied: winners.length > 1, winner: winners.length === 1 ? winners[0].player : null, winAmount: winners.length === 1 ? currentPrizePool + holeStake : 0 };
  }, [activePlayers, stake, pars, getHandicapForHole, prizePool]);

  const calculateWin123 = useCallback((holeScores, holePutts, holeUps, holeNum) => {
    const stakeValue = Number(stake) || 0;
    const par = pars[holeNum] || 4;
    const playerScores = activePlayers.map(p => ({
      player: p,
      on: holeScores[p] || par,
      putts: holePutts[p] || 0,
      stroke: (holeScores[p] || par) + (holePutts[p] || 0),
      netScore: (holeScores[p] || par) + (holePutts[p] || 0) - getHandicapForHole(p, holeNum, par),
      up: holeUps[p] || false
    }));
    
    playerScores.sort((a, b) => a.netScore - b.netScore);
    
    const uniqueScores = [...new Set(playerScores.map(p => p.netScore))];
    const rankings = [...playerScores];
    const playerCount = activePlayers.length;
    
    if (uniqueScores.length === 1) {
      rankings.forEach(r => r.finalRank = 1);
    } else if (playerCount <= 4) {
      if (uniqueScores.length === 2) {
        const firstScore = uniqueScores[0];
        rankings.forEach(r => {
          r.finalRank = r.netScore === firstScore ? 1 : 4;
        });
      } else if (uniqueScores.length === 3) {
        const firstScore = uniqueScores[0];
        const secondScore = uniqueScores[1];
        const firstCount = rankings.filter(r => r.netScore === firstScore).length;
        
        rankings.forEach(r => {
          if (r.netScore === firstScore) {
            r.finalRank = 1;
          } else if (r.netScore === secondScore) {
            r.finalRank = firstCount >= 3 ? 4 : 3;
          } else {
            r.finalRank = 4;
          }
        });
      } else {
        rankings.forEach((r, i) => r.finalRank = i + 1);
      }
    } else {
      let currentIndex = 0;
      while (currentIndex < rankings.length) {
        const currentScore = rankings[currentIndex].netScore;
        let lastIndex = currentIndex;
        while (lastIndex < rankings.length - 1 && 
               rankings[lastIndex + 1].netScore === currentScore) {
          lastIndex++;
        }
        const rank = lastIndex + 1;
        for (let i = currentIndex; i <= lastIndex; i++) {
          rankings[i].finalRank = rank;
        }
        currentIndex = lastIndex + 1;
      }
    }
    
    const results = {};
    let poolChange = 0;
    
    activePlayers.forEach(player => {
      results[player] = { money: 0, fromPool: 0 };
    });
    
    if (uniqueScores.length > 1) {
      rankings.forEach(r => {
        let penalty = 0;
        
        if (r.finalRank > 1) {
          penalty = stakeValue * (r.finalRank - 1);
        }
        
        if (r.up) {
          if (r.finalRank === 1) {
            const poolWin = stakeValue * 6;
            results[r.player].money = poolWin;
            results[r.player].fromPool = poolWin;
            poolChange -= poolWin;
          } else {
            penalty = penalty * 2;
          }
        }
        
        if (r.finalRank > 1) {
          results[r.player].money = -penalty;
          poolChange += penalty;
        }
      });
    }
    
    return { results, poolChange, rankings };
  }, [activePlayers, stake, pars, getHandicapForHole]);

// ========== 修改 On (上果岭杆数) ==========
  const changeOn = useCallback((player, delta) => {
  const holeNum = holes[currentHole];
  const par = pars[holeNum] || 4;
  const current = scores[player] ?? par;
  const newOn = Math.max(1, current + delta);
  setScores(prev => ({ ...prev, [player]: newOn }));

  // 实时更新 Hole Settlement
  const newScores = { ...scores, [player]: newOn };
  const holeScores = {};
  const holePutts = {};
  const holeUps = {};
  activePlayers.forEach(p => {
    holeScores[p] = newScores[p] || par;
    holePutts[p] = putts[p] || 0;
    holeUps[p] = ups[p] || false;
  });

  if (gameMode === 'matchPlay') {
    const settlement = calculateMatchPlay(holeScores, holeNum);
    setCurrentHoleSettlement(settlement);
  } else if (gameMode === 'skins') {
    const { results } = calculateSkins(holeScores, holeNum);
    setCurrentHoleSettlement(results);
  } else if (gameMode === 'win123') {
    const { results } = calculateWin123(holeScores, holePutts, holeUps, holeNum);
    setCurrentHoleSettlement(results);
  }
}, [currentHole, holes, pars, scores, putts, ups, activePlayers, gameMode, calculateMatchPlay, calculateSkins, calculateWin123]);

  const changeScore = useCallback((player, delta) => {
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const current = scores[player] || par;
    const newScore = Math.max(1, current + delta);
    setScores(prev => ({ ...prev, [player]: newScore }));
    
    const newScores = { ...scores, [player]: newScore };
    const holeScores = {};
    const holeUps = {};
	const holePutts = {};
    
    activePlayers.forEach(p => {
      holeScores[p] = newScores[p] || par;
      holeUps[p] = ups[p] || false;
	  holePutts[p] = putts[p] || 0;
    });
    
    if (gameMode === 'matchPlay') {
      const settlement = calculateMatchPlay(holeScores, holeNum);
      setCurrentHoleSettlement(settlement);
    } else if (gameMode === 'skins') {
      const { results } = calculateSkins(holeScores, holeNum);
      setCurrentHoleSettlement(results);
    } else if (gameMode === 'win123') {
      const { results } = calculateWin123(holeScores, holePutts, holeUps, holeNum);
      setCurrentHoleSettlement(results);
    }
  }, [scores, currentHole, holes, pars, ups, putts, activePlayers, gameMode, calculateMatchPlay, calculateSkins, calculateWin123]);

  const changePutts = useCallback((player, delta) => {
  const holeNum = holes[currentHole];
  const par = pars[holeNum] || 4;
  const newPutts = Math.max(0, (putts[player] || 0) + delta);
  setPutts(prev => ({ ...prev, [player]: newPutts }));

  // 实时更新 Hole Settlement
  const newPuttsAll = { ...putts, [player]: newPutts };
  const holeScores = {};
  const holePutts = {};
  const holeUps = {};
  activePlayers.forEach(p => {
    holeScores[p] = scores[p] || par;
    holePutts[p] = newPuttsAll[p] || 0;
    holeUps[p] = ups[p] || false;
  });

  if (gameMode === 'matchPlay') {
    const settlement = calculateMatchPlay(holeScores, holeNum);
    setCurrentHoleSettlement(settlement);
  } else if (gameMode === 'skins') {
    const { results } = calculateSkins(holeScores, holeNum);
    setCurrentHoleSettlement(results);
  } else if (gameMode === 'win123') {
    const { results } = calculateWin123(holeScores, holePutts, holeUps, holeNum);
    setCurrentHoleSettlement(results);
  }
}, [currentHole, holes, pars, scores, putts, ups, activePlayers, gameMode, calculateMatchPlay, calculateSkins, calculateWin123]);

  const changeWater = useCallback((player) => {
    setWater(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 }));
  }, []);

  const resetWater = useCallback((player) => {
    setWater(prev => ({ ...prev, [player]: 0 }));
  }, []);

  const changeOb = useCallback((player) => {
    setOb(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 }));
  }, []);

  const resetOb = useCallback((player) => {
    setOb(prev => ({ ...prev, [player]: 0 }));
  }, []);

  const toggleUp = useCallback((player) => {
    setUps(prev => ({ ...prev, [player]: !prev[player] }));
    
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const holeScores = {};
	const holePutts = {};
    const newUps = { ...ups, [player]: !ups[player] };
    
    activePlayers.forEach(p => {
      holeScores[p] = scores[p] || par;
	  holePutts[p] = putts[p] || 0;
    });
    
    if (gameMode === 'win123') {
      const { results } = calculateWin123(holeScores, holePutts, newUps, holeNum);
      setCurrentHoleSettlement(results);
    }
  }, [ups, currentHole, holes, pars, scores, activePlayers, gameMode, calculateWin123]);

  const proceedToNextHole = useCallback(() => {
    const holeNum = holes[currentHole];
    const par = pars[holeNum] || 4;
    const currentHoleScores = {};
    const currentHoleUps = {};
    const currentHolePutts = {};
    const currentHoleWater = {};
    const currentHoleOb = {};
    
    activePlayers.forEach(player => {
      currentHoleScores[player] = scores[player] || par;
      currentHoleUps[player] = ups[player] || false;
      currentHolePutts[player] = putts[player] || 0;
      currentHoleWater[player] = water[player] || 0;
      currentHoleOb[player] = ob[player] || 0;
    });
    
    const newAllScores = { ...allScores };
    const newAllUps = { ...allUps };
    const newAllPutts = { ...allPutts };
    const newAllWater = { ...allWater };
    const newAllOb = { ...allOb };
    
    activePlayers.forEach(player => {
      if (!newAllScores[player]) newAllScores[player] = {};
      if (!newAllUps[player]) newAllUps[player] = {};
      if (!newAllPutts[player]) newAllPutts[player] = {};
      if (!newAllWater[player]) newAllWater[player] = {};
      if (!newAllOb[player]) newAllOb[player] = {};
      newAllScores[player][holeNum] = currentHoleScores[player];
      newAllUps[player][holeNum] = currentHoleUps[player];
      newAllPutts[player][holeNum] = currentHolePutts[player];
      newAllWater[player][holeNum] = currentHoleWater[player];
      newAllOb[player][holeNum] = currentHoleOb[player];
    });
    
    setAllScores(newAllScores);
    setAllUps(newAllUps);
    setAllPutts(newAllPutts);
    setAllWater(newAllWater);
    setAllOb(newAllOb);
    
    const stakeValue = Number(stake) || 0;
    let finalPrizePool = prizePool;
    
    if (stakeValue > 0 || gameMode === 'skins') {
      if (gameMode === 'matchPlay') {
        const settlement = calculateMatchPlay(currentHoleScores, holeNum);
        
        const newTotalMoney = { ...totalMoney };
        activePlayers.forEach(player => {
          newTotalMoney[player] = (newTotalMoney[player] || 0) + settlement[player].money;
        });
        setTotalMoney(newTotalMoney);
        
      } else if (gameMode === 'skins') {
        const { results, poolChange } = calculateSkins(currentHoleScores, holeNum);
        
        const newTotalMoney = { ...totalMoney };
        const newDetails = { ...moneyDetails };
        const newSpent = { ...totalSpent };
        
        activePlayers.forEach(player => {
          newSpent[player] = (newSpent[player] || 0) + (results[player].spent || 0);
          newTotalMoney[player] = (newTotalMoney[player] || 0) + results[player].money;
          
          if (results[player].fromPool) {
            newDetails[player].fromPool += results[player].fromPool;
          }
        });
        
        setTotalMoney(newTotalMoney);
        setMoneyDetails(newDetails);
        setTotalSpent(newSpent);
        finalPrizePool = prizePool + poolChange;
        setPrizePool(finalPrizePool);
        
      } else if (gameMode === 'win123') {
        const { results, poolChange } = calculateWin123(currentHoleScores, currentHolePutts, currentHoleUps, holeNum);
        
        const newTotalMoney = { ...totalMoney };
        const newDetails = { ...moneyDetails };
        
        activePlayers.forEach(player => {
          newTotalMoney[player] = (newTotalMoney[player] || 0) + results[player].money;
          if (results[player].fromPool) {
            newDetails[player].fromPool = (newDetails[player].fromPool || 0) + results[player].fromPool;
          }
        });
        
        setTotalMoney(newTotalMoney);
        setMoneyDetails(newDetails);
        finalPrizePool = prizePool + poolChange;
        setPrizePool(finalPrizePool);
      }
    }
     // 播报本洞成绩
    playHoleResults(activePlayers, currentHoleScores, currentHolePutts);
    setCompletedHoles([...completedHoles, holeNum]);
    
    if (currentHole >= holes.length - 1) {
      setGameComplete(true);
	showToast(t('gameOver'));
	setCurrentSection('scorecard');
	triggerConfetti();
    } else {
      setCurrentHole(currentHole + 1);
      setScores({});
      setUps({});
      setPutts({});
      setWater({});
      setOb({});
      setCurrentHoleSettlement(null);
    }
    
    setHoleConfirmDialog({ isOpen: false, action: null });
    setPendingRankings(null);
  }, [currentHole, holes, scores, ups, putts, water, ob, activePlayers, allScores, allUps, allPutts, allWater, allOb, gameMode, totalMoney, moneyDetails, completedHoles, prizePool, pars, stake, calculateMatchPlay, calculateSkins, calculateWin123, showToast, t, totalSpent, playHoleResults]);

const nextHole = useCallback(() => {
  const holeNum = holes[currentHole];
  const par = pars[holeNum] || 4;

  // 检查 Advance 玩家推杆数
const playersWithZeroPutts = activePlayers.filter(player => 
  (putts[player] || 0) === 0 && 
  (scores[player] || par) > 1
);

  if (playersWithZeroPutts.length > 0) {
  // 播放提示音（iOS/Android 都支持）
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (e) {}
  // Android 额外震动
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
  setPuttsWarningDialog({ isOpen: true, players: playersWithZeroPutts });
  return;
}

  // 原有逻辑继续
  if (gameMode === 'win123') {
    const currentHoleScores = {};
	const currentHolePutts = {};
	const currentHoleUps = {};

activePlayers.forEach(player => {
  currentHoleScores[player] = scores[player] || par;
  currentHolePutts[player] = putts[player] || 0;
  currentHoleUps[player] = ups[player] || false;
});
    
    const { rankings } = calculateWin123(currentHoleScores, currentHolePutts, currentHoleUps, holeNum);
    setPendingRankings(rankings);
  }
  setHoleConfirmDialog({ 
    isOpen: true, 
    action: proceedToNextHole
  });
}, [gameMode, currentHole, holes, scores, ups, putts, activePlayers, pars, calculateWin123, proceedToNextHole, advanceMode, advancePlayers]);

const handlePuttsWarningConfirm = useCallback(() => {
  setPuttsWarningDialog({ isOpen: false, players: [] });
  
  const holeNum = holes[currentHole];
  const par = pars[holeNum] || 4;

  if (gameMode === 'win123') {
    const currentHoleScores = {};
	const currentHolePutts = {};
	const currentHoleUps = {};

activePlayers.forEach(player => {
  currentHoleScores[player] = scores[player] || par;
  currentHolePutts[player] = putts[player] || 0;
  currentHoleUps[player] = ups[player] || false;
});
    
    const { rankings } = calculateWin123(currentHoleScores, currentHolePutts, currentHoleUps, holeNum);
    setPendingRankings(rankings);
  }
  setHoleConfirmDialog({ 
    isOpen: true, 
    action: proceedToNextHole
  });
}, [gameMode, currentHole, holes, scores, ups, activePlayers, pars, calculateWin123, proceedToNextHole]);

  // 编辑洞成绩并重新计算金额
const handleEditHoleSave = useCallback((hole, newScores, newUps, newPutts) => {
    // 1. 更新 allScores, allUps, allPutts
    const updatedAllScores = { ...allScores };
    const updatedAllUps = { ...allUps };
    const updatedAllPutts = { ...allPutts };
    
    activePlayers.forEach(player => {
      if (!updatedAllScores[player]) updatedAllScores[player] = {};
      if (!updatedAllUps[player]) updatedAllUps[player] = {};
      if (!updatedAllPutts[player]) updatedAllPutts[player] = {};
      updatedAllScores[player][hole] = newScores[player];
      updatedAllUps[player][hole] = newUps[player] || false;
      updatedAllPutts[player][hole] = newPutts[player] || 0;
    });
    
    setAllScores(updatedAllScores);
    setAllUps(updatedAllUps);
    setAllPutts(updatedAllPutts);
    
    // 2. 重新计算所有已完成洞的金额
    const stakeValue = Number(stake) || 0;
    
    const newTotalMoney = {};
    const newDetails = {};
    const newSpent = {};
    let newPrizePool = 0;
    
    activePlayers.forEach(player => {
      newTotalMoney[player] = 0;
      newSpent[player] = 0;
      newDetails[player] = { fromPool: 0, fromPlayers: {} };
      activePlayers.forEach(other => {
        if (other !== player) {
          newDetails[player].fromPlayers[other] = 0;
        }
      });
    });
    
    if (stakeValue > 0 || gameMode === 'skins') {
      completedHoles.forEach(holeNum => {
        const holeScores = {};
        const holeUps = {};
        
        activePlayers.forEach(player => {
          holeScores[player] = updatedAllScores[player]?.[holeNum] || (pars[holeNum] || 4);
          holeUps[player] = updatedAllUps[player]?.[holeNum] || false;
        });
        
        if (gameMode === 'matchPlay') {
          const settlement = calculateMatchPlay(holeScores, holeNum);
          activePlayers.forEach(player => {
            newTotalMoney[player] += settlement[player].money;
          });
        } else if (gameMode === 'skins') {
          const par = pars[holeNum] || 4;
          const playerScoresList = activePlayers.map(p => ({
            player: p,
            score: holeScores[p] || par,
            netScore: (holeScores[p] || par) - getHandicapForHole(p, holeNum, par)
          }));
          
          playerScoresList.sort((a, b) => a.netScore - b.netScore);
          const minScore = playerScoresList[0].netScore;
          const winners = playerScoresList.filter(p => p.netScore === minScore);
          
          const holeStake = stakeValue * activePlayers.length;
          
          activePlayers.forEach(player => {
            newSpent[player] += stakeValue;
            newTotalMoney[player] -= stakeValue;
          });
          
          if (winners.length === 1) {
            const winner = winners[0].player;
            const winAmount = newPrizePool + holeStake;
            newTotalMoney[winner] += winAmount;
            newDetails[winner].fromPool += newPrizePool;
            newPrizePool = 0;
          } else {
            newPrizePool += holeStake;
          }
        } else if (gameMode === 'win123') {
          const holePutts = {};
          activePlayers.forEach(p => {
            holePutts[p] = allPutts[p]?.[holeNum] || 0;
          });
          const { results, poolChange } = calculateWin123(holeScores, holePutts, holeUps, holeNum);
          activePlayers.forEach(player => {
            newTotalMoney[player] += results[player].money;
            if (results[player].fromPool) {
              newDetails[player].fromPool += results[player].fromPool;
            }
          });
          newPrizePool += poolChange;
        }
      });
    }
    
    setTotalMoney(newTotalMoney);
    setMoneyDetails(newDetails);
    setTotalSpent(newSpent);
    if (gameMode === 'win123' || gameMode === 'skins') {
      setPrizePool(newPrizePool);
    }
    
    showToast(t('scoreUpdated'));
  }, [allScores, allUps, activePlayers, stake, gameMode, completedHoles, pars, calculateMatchPlay, calculateWin123, getHandicapForHole, showToast, t]);

  const goHome = useCallback(() => {
    const resetGame = () => {
      clearSavedGame();
      setCurrentSection('home');
      setGameMode('matchPlay');
      setJumboMode(false);
      setPlayerNames(['', '', '', '']);
      setStake('');
      setPrizePool('');
      setPlayerHandicaps({});
      setAdvanceMode('off');
	  setAdvancePlayers({});
      setCourseType('f18');
      setHoles(courses.f18);
      setPars(courses.f18.reduce((acc, hole) => ({...acc, [hole]: 4}), {}));
      setCurrentHole(0);
      setScores({});
      setUps({});
      setPutts({});
      setWater({});
      setOb({});
      setAllScores({});
      setAllUps({});
      setAllPutts({});
      setAllWater({});
      setAllOb({});
      setTotalMoney({});
      setMoneyDetails({});
      setTotalSpent({});
      setCompletedHoles([]);
      setGameComplete(false);
      setCurrentHoleSettlement(null);
      setSetupMode('auto');
      setSearchQuery('');
      setSelectedCourse(null);
      setCourseApplied(false);
    };

    if (gameComplete) {
      resetGame();
    } else {
      resetGame();
    }
  }, [gameComplete, clearSavedGame]);

  const getMedal = useCallback((rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }, []);

// ========== 分享功能 ==========
  const handleSharePlayer = useCallback((player) => {
    const data = generatePlayerShareData(
      player, selectedCourse, completedHoles, pars,
      allScores, allPutts, allWater || {}, allOb || {}, completedHoles,
      advancePlayers[player] || false
    );
    const url = generateShareUrl(data);
    
    if (!url) {
      showToast(lang === 'zh' ? '生成链接失败' : 'Failed to generate link', 'error');
      return;
    }
    
    // 检测是否是移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && navigator.share) {
      navigator.share({
        url: url
      }).catch(() => {});
    } else {
      // 桌面端直接复制链接
      navigator.clipboard.writeText(url).then(() => {
        showToast(lang === 'zh' ? '链接已复制！' : 'Link copied!');
      }).catch(() => showToast(lang === 'zh' ? '复制失败' : 'Copy failed', 'error'));
    }
  }, [selectedCourse, completedHoles, pars, allScores, allPutts, allWater, allOb, lang, showToast, advancePlayers]);

// 彩纸庆祝效果
const triggerConfetti = useCallback(() => {
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        top: -10px;
        z-index: 100;
        pointer-events: none;
        animation: confettiFall linear forwards;
      }
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
      .confetti-container {
        position: fixed;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 50;
      }
    `;
    document.head.appendChild(style);
  }
  
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    confetti.style.animationDelay = Math.random() * 1.5 + 's';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    confetti.style.width = (Math.random() * 8 + 6) + 'px';
    confetti.style.height = (Math.random() * 8 + 6) + 'px';
    container.appendChild(confetti);
  }
  
  setTimeout(() => {
    container.remove();
  }, 6000);
}, []);

// 处理 Advance 报告弹窗的玩家点击
const handleAdvancePlayerClick = useCallback((playerName) => {
  setAdvanceReportPlayer(playerName);
  setShowAdvanceFullDetail(false);
}, []);

// ========== 检测分享链接 ==========
  const urlParams = new URLSearchParams(window.location.search);
  const shareParam = urlParams.get('p');
  if (shareParam) {
    const decoded = decodeShareData(shareParam);
    if (decoded) {
      return <SharePage data={decoded} />;
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {currentSection === 'home' && (
        <div className="flex justify-end items-center p-3 bg-white border-b border-gray-200">
          <button
            onClick={() => {
              const newLang = lang === 'zh' ? 'en' : 'zh';
              setLang(newLang);
              try {
                localStorage.setItem('handincap_lang', newLang);
              } catch {}
            }}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium shadow-sm"
          >
            {t('switchLang')}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto p-3">
          
          {currentSection === 'home' && (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-green-600 mb-2">
                  {t('title')}
                </h1>
                <p className="text-gray-600">
                  {t('subtitle')}
                </p>
              </div>
              
              <div className="w-full max-w-xs space-y-3">
                {hasSavedGame && (
                  <button
                    onClick={resumeGame}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    {t('resume')}
                  </button>
                )}
                <button
                  onClick={() => {
    setSearchQuery('');
    setSelectedCourse(null);
    setCourseApplied(false);
    setCurrentSection('course');
  }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {t('create')}
                </button>
             </div>
            
            {/* 页脚版权 */}
            <footer className="absolute bottom-4 text-center text-gray-400 text-xs">
              © 2025 HandinCap. All rights reserved. {window.APP_VERSION}
            </footer>
          </div>
        )}

          {currentSection === 'course' && (
            <div className="space-y-4 py-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    {t('courseTitle')}
                  </h2>
                </div>
                
                <div className="flex rounded-lg border-2 border-green-600 overflow-hidden">
                  <button
                    onClick={() => setSetupMode('auto')}
                    className={`flex-1 px-4 py-2.5 font-semibold text-sm transition flex items-center justify-center gap-2 ${
                      setupMode === 'auto'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    {t('autoMode')}
                  </button>
                  <button
                    onClick={() => setSetupMode('manual')}
                    className={`flex-1 px-4 py-2.5 font-semibold text-sm transition flex items-center justify-center gap-2 ${
                      setupMode === 'manual'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    {t('manualMode')}
                  </button>
                </div>
              </div>

              {setupMode === 'auto' && (
                <>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      {t('selectCourse')}
                    </h3>
                    
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {searchQuery.trim() && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((course, index) => {
                            const coursePar = course.pars.reduce((sum, par) => sum + par, 0);
                            
                            return (
                              // ========== 修改后的徽章风格卡片 ==========
                              <div
                                key={`${course.shortName}-${index}`}
                                className="border border-gray-200 bg-white hover:border-green-400 hover:shadow-lg rounded-xl p-4 cursor-pointer transition-all"
                                onClick={() => selectAndApplyCourse(course)}
                              >
                                <div className="flex gap-4">
                                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex flex-col items-center justify-center text-white shadow-md flex-shrink-0">
                                    <span className="text-xl font-bold">{coursePar}</span>
                                    <span className="text-xs uppercase tracking-wide opacity-90">Par</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                      {course.fullName}
                                    </h4>
                                    <div className="border-t border-gray-100 pt-2 mt-2">
                                      {course.location && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                          <MapPin className="w-3 h-3 text-green-500 flex-shrink-0" />
                                          <span>{course.location[0]}, {course.location[1]}</span>
                                        </div>
                                      )}
                                      <p className="text-xs text-gray-400 mt-1">{course.shortName}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-medium">{t('noCourses')}</p>
                            <p className="text-xs mt-1">{t('trySearch')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedCourse && courseApplied && (
                    <>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="mb-3">
                          <div className="flex items-start gap-2 mb-1">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900">
                                {selectedCourse.fullName}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {selectedCourse.shortName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-green-600">
                              PAR {calculateTotalPar()}
                            </span>
                          </div>
                        </div>
                        
<div className="bg-white rounded-lg p-4 shadow-sm mb-4">
  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
    <Target className="w-4 h-4" />
    {t('gameType')}
  </h3>
  <div className="grid grid-cols-2 gap-3">
    {Object.keys(courses).map(type => (
      <button
        key={type}
        onClick={() => {
          setCourseType(type);
          const newHoles = courses[type];
          setHoles(newHoles);
          const newPars = {};
          newHoles.forEach((hole, index) => {
            newPars[hole] = selectedCourse.pars[hole - 1] || 4;
          });
          setPars(newPars);
        }}
        className={`p-2 rounded-lg border transition transform hover:scale-105 ${
          courseType === type
            ? 'bg-green-600 text-white border-green-600 shadow-md'
            : 'bg-gray-50 text-gray-900 border-gray-200 hover:border-green-300 hover:shadow-sm'
        }`}
      >
        <h4 className="font-semibold text-xs">{t(type)}</h4>
        <p className="text-xs opacity-80" style={{ fontSize: '10px' }}>
          {t(`${type}Desc`)}
        </p>
      </button>
    ))}
  </div>
</div>
                        
                        <div className={`grid gap-2 ${(courseType === 'f9' || courseType === 'b9') ? 'grid-cols-1 max-w-[200px] mx-auto' : 'grid-cols-2'}`}>
                          <div className="border-2 border-green-600 rounded-lg overflow-hidden">
                            <div className="bg-green-600 text-white text-xs font-bold py-1.5 text-center">
                              {t('front9')}
                            </div>
                            <div className="p-1.5 space-y-1">
                              {holes.slice(0, 9).map((hole, idx) => (
                                <div key={hole}>
                                  <div className="text-xs text-gray-600 mb-0.5 font-medium text-center">
                                    {lang === 'zh' ? `${hole}洞` : `Hole ${hole}`}
                                  </div>
                                  <div className={`rounded font-bold text-sm py-1.5 shadow-sm text-center ${
                                    pars[hole] === 3 ? 'bg-yellow-300 text-black' :
                                    pars[hole] === 5 ? 'bg-orange-300 text-black' :
                                    'bg-gray-300 text-black'
                                  }`}>
                                    Par {pars[hole]}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {holes.length > 9 && (
                            <div className="border-2 border-green-600 rounded-lg overflow-hidden">
                              <div className="bg-green-600 text-white text-xs font-bold py-1.5 text-center">
                                {t('back9')}
                              </div>
                              <div className="p-1.5 space-y-1">
                                {holes.slice(9, 18).map((hole, idx) => (
                                  <div key={hole}>
                                    <div className="text-xs text-gray-600 mb-0.5 font-medium text-center">
                                      {lang === 'zh' ? `${hole}洞` : `Hole ${hole}`}
                                    </div>
                                    <div className={`rounded font-bold text-sm py-1.5 shadow-sm text-center ${
                                      pars[hole] === 3 ? 'bg-yellow-300 text-black' :
                                      pars[hole] === 5 ? 'bg-orange-300 text-black' :
                                      'bg-gray-300 text-black'
                                    }`}>
                                      Par {pars[hole]}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {setupMode === 'manual' && (
                <>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('setPar')}</h3>
                    
                    {(courseType === 'f18' || courseType === 'b18') ? (
                      <div className="grid grid-cols-2 gap-3">
                        {getVerticalArrangedHoles().map((pair, index) => (
                          <React.Fragment key={index}>
                            {pair[0] && (
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 min-w-[40px]">
                                  {lang === 'zh' ? `${pair[0]}洞` : `H${pair[0]}`}
                                </span>
                                <div className="flex gap-1">
                                  {[3, 4, 5].map(par => (
                                    <button
                                      key={par}
                                      onClick={() => setPar(pair[0], par)}
                                      className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${
                                        pars[pair[0]] === par
                                          ? getParColorClass(par) + ' shadow-md ring-2 ring-green-600'
                                          : 'bg-gray-100 text-gray-500 border border-gray-400 hover:bg-gray-200'
                                      }`}
                                    >
                                      {par}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {pair[1] ? (
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 min-w-[40px]">
                                  {lang === 'zh' ? `${pair[1]}洞` : `H${pair[1]}`}
                                </span>
                                <div className="flex gap-1">
                                  {[3, 4, 5].map(par => (
                                    <button
                                      key={par}
                                      onClick={() => setPar(pair[1], par)}
                                      className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${
                                        pars[pair[1]] === par
                                          ? getParColorClass(par) + ' shadow-md ring-2 ring-green-600'
                                          : 'bg-gray-100 text-gray-500 border border-gray-400 hover:bg-gray-200'
                                      }`}
                                    >
                                      {par}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-1">
                        {holes.map(hole => (
                          <div key={hole} className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                            <span className="text-sm font-medium text-gray-900">
                              {t('hole')} {hole}
                            </span>
                            <div className="flex gap-1">
                              {[3, 4, 5].map(par => (
                                <button
                                  key={par}
                                  onClick={() => setPar(hole, par)}
                                  className={`w-8 h-8 rounded font-bold text-sm transition-all ${
                                    pars[hole] === par
                                      ? getParColorClass(par) + ' shadow-md ring-2 ring-green-600'
                                      : 'bg-gray-100 text-gray-500 border border-gray-400'
                                  }`}
                                >
                                  {par}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-2 pt-2 border-t text-center">
                      <span className="text-sm text-gray-600">{t('par')}: </span>
                      <span className="text-lg font-bold text-green-600">{calculateTotalPar()}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
      setSearchQuery('');
      setSelectedCourse(null);
      setCourseApplied(false);
      setCurrentSection('home');
    }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  {t('back')}
                </button>
                <button
                  onClick={confirmCourse}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
                >
                  {t('confirmCourse')}
                </button>
              </div>
            </div>
          )}

          {currentSection === 'players' && (
            <div className="space-y-4 py-3">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('playerTitle')}
                </h2>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('players')}
                  </h3>
                  <button
                    onClick={toggleJumboMode}
                    className={`px-3 py-1.5 rounded-md font-medium text-xs transition ${
                      jumboMode
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {lang === 'zh' ? '多人' : 'Jumbo'}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {Array.from({ length: jumboMode ? 8 : 4 }, (_, i) => i).map(i => (
                    <div key={i}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t(`player${i + 1}`)}:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t('enterName')}
                          value={playerNames[i]}
                          onChange={(e) => updatePlayerName(i, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">HCP</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            placeholder=""
                            value={(playerHandicaps[playerNames[i]] || 0) > 0 ? playerHandicaps[playerNames[i]] : ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              const num = val === '' ? 0 : Math.min(36, parseInt(val, 10));
                              if (playerNames[i]) {
                                updatePlayerHandicap(playerNames[i], num);
                              }
                            }}
                            className="w-12 px-2 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 text-sm text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      {t('gameMode')}:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setGameMode('matchPlay')}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1 ${
                          gameMode === 'matchPlay'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Trophy className="w-4 h-4" />
                        <span style={{ fontSize: '12px' }}>{t('matchPlay')}</span>
                      </button>
                      <button
                        onClick={() => setGameMode('win123')}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1 ${
                          gameMode === 'win123'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span style={{ fontSize: '12px' }}>{t('win123')}</span>
                      </button>
                      <button
                        onClick={() => setGameMode('skins')}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1 ${
                          gameMode === 'skins'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <CircleDollarSign className="w-4 h-4" />
                        <span style={{ fontSize: '12px' }}>{t('skins')}</span>
                      </button>
                    </div>
					</div>

{/* 模式说明卡片 - 方案 E */}
<div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
  <div className="flex items-start gap-2">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
      gameMode === 'matchPlay' ? 'bg-blue-100 text-blue-600' :
      gameMode === 'win123' ? 'bg-green-100 text-green-600' :
      'bg-purple-100 text-purple-600'
    }`}>
      {gameMode === 'matchPlay' && <Trophy className="w-3.5 h-3.5" />}
      {gameMode === 'win123' && <DollarSign className="w-3.5 h-3.5" />}
      {gameMode === 'skins' && <CircleDollarSign className="w-3.5 h-3.5" />}
    </div>
    <div className="flex-1">
      <div className="font-semibold text-sm text-gray-900">{t(gameMode)}</div>
      <div className="text-xs text-gray-600 mt-0.5">{t(`${gameMode}Desc`)}</div>
      <div className="mt-2 text-xs text-gray-500 space-y-1">
        {gameMode === 'matchPlay' && (
          <>
            <div>• {lang === 'zh' ? '净杆 = 实际杆数 − 让杆' : 'Net = Gross − Handicap'}</div>
            <div>• {lang === 'zh' ? '同杆数平局，无输赢' : 'Tie = no money exchanged'}</div>
          </>
        )}
        {gameMode === 'win123' && (
          <>
            <div>• {lang === 'zh' ? '第2名罚1倍 | 第3名罚2倍 | 第4名罚3倍' : '2nd: 1x | 3rd: 2x | 4th: 3x penalty'}</div>
            <div>• {lang === 'zh' ? 'UP成功：从池中拿6倍底注' : 'UP win: Take 6x from pool'}</div>
            <div>• {lang === 'zh' ? 'UP失败：双倍罚款' : 'UP lose: Double penalty'}</div>
          </>
        )}
        {gameMode === 'skins' && (
          <>
            <div>• {lang === 'zh' ? '每洞每人投入1倍底注' : 'Each player antes 1x per hole'}</div>
            <div>• {lang === 'zh' ? '平局时奖池累积到下一洞' : 'Ties carry over to next hole'}</div>
          </>
        )}
      </div>
    </div>
  </div>
</div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      {t('stake')}:
                    </label>
                    <input
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      placeholder={t('enterStake')}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">
                      {t('advance')}:
                    </label>
                    <div className="flex rounded-md border border-gray-300 overflow-hidden">
                      <button
                        onClick={() => setAdvanceMode('off')}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          advanceMode === 'off'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('off')}
                      </button>
                      <button
                        onClick={() => setAdvanceMode('on')}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          advanceMode === 'on'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('on')}
</button>
                    </div>
                  </div>
				  
				  {/* 语音播报开关 */}
                  <div className="flex items-center justify-between mt-3">
                    <label className="text-xs font-medium text-gray-700">
                      {lang === 'zh' ? '语音播报' : 'Voice Announce'}:
                    </label>
                    <div className="flex rounded-md border border-gray-300 overflow-hidden">
                      <button
                        onClick={() => {
                          setVoiceEnabled(false);
                          localStorage.setItem('handincap_voice', 'false');
                        }}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          !voiceEnabled
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('off')}
                      </button>
                      <button
                        onClick={() => {
                          setVoiceEnabled(true);
                          localStorage.setItem('handincap_voice', 'true');
                        }}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          voiceEnabled
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('on')}
                      </button>
                    </div>
                  </div>
				  
                  {/* 高级模式说明 - 方案 B */}
                  <ExpandableInfo isOpen={showAdvanceInfo} onToggle={() => setShowAdvanceInfo(!showAdvanceInfo)} lang={lang}>
                    <div className="space-y-2">
                      <div className="font-semibold text-gray-800">📊 {lang === 'zh' ? '高级统计模式' : 'Advanced Stats Mode'}</div>
                      <div>{lang === 'zh' ? '开启后，每洞可额外记录：' : 'When enabled, track extra data:'}</div>
                      <div className="bg-white rounded p-2 space-y-1">
                        <div>• 🏌️ <strong>{lang === 'zh' ? '推杆数' : 'Putts'}</strong></div>
                        <div>• 💧 <strong>{lang === 'zh' ? '水障碍' : 'Water Hazards'}</strong></div>
                        <div>• 🚫 <strong>OB</strong> ({lang === 'zh' ? '出界' : 'Out of Bounds'})</div>
                      </div>
                      <div className="text-gray-600">{lang === 'zh' ? '赛后自动生成详细统计报告！' : 'Get detailed stats report after round!'}</div>
                    </div>
                  </ExpandableInfo>
				  {/* Advance 玩家选择 */}
                  {advanceMode === 'on' && activePlayers.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        {lang === 'zh' ? '选择使用高级统计的玩家' : 'Select players for advanced stats'}
                      </div>
                      <div className="space-y-2">
                        {activePlayers.map(player => (
                          <label key={player} className="flex items-center gap-3 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition">
                            <input
                              type="checkbox"
                              checked={advancePlayers[player] || false}
                              onChange={(e) => {
                                setAdvancePlayers(prev => ({
                                  ...prev,
                                  [player]: e.target.checked
                                }));
                              }}
                              className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            />
                            <span className="font-medium text-gray-900">{player}</span>
                            {advancePlayers[player] && (
                              <span className="ml-auto text-xs text-green-600 font-medium">
                                {lang === 'zh' ? '📊 高级' : '📊 Advanced'}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {lang === 'zh' 
                          ? '勾选的玩家将记录推杆、水障碍、OB等详细数据' 
                          : 'Selected players will track putts, water, OB details'}
                      </p>
                    </div>
                  )}
                </div>
              </div>


              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentSection('course')}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  {t('back')}
                </button>
                <button
                  onClick={startGame}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
                >
                  {t('start')}
                </button>
              </div>
            </div>
          )}

          {currentSection === 'scorecard' && (
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
                    {completedHoles.length > 0 && (
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
                      {lang === 'zh' ? '所有比赛数据将被清除' : 'All game data will be cleared'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {currentSection === 'game' && (
        <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 text-white">
          <div className="bg-green-800 bg-opacity-50 text-center pt-6 pb-3 relative">
            <h1 className="text-2xl font-bold mb-2">
  {t('hole')} {holes[currentHole]}
  <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded text-lg">
    PAR {pars[holes[currentHole]] || 4}
  </span>
  {selectedCourse?.index && (
    <span className="ml-2 px-2 py-0.5 bg-amber-400 text-amber-900 rounded text-sm font-bold">
      IDX {selectedCourse.index[holes[currentHole] - 1] || '-'}
    </span>
  )}
</h1>
            {Number(stake) > 0 && (
              <div className="text-base">
                {t('stake')}: ${Number(stake)} 
                {(gameMode === 'skins' || gameMode === 'win123') && (
                  <span className="ml-4">
                    {gameMode === 'win123' ? t('penaltyPot') : t('poolBalance')}: ${gameMode === 'skins' ? prizePool + (Number(stake) || 0) * activePlayers.length : prizePool}
                  </span>
                )}
                {advanceMode === 'on' && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-600 rounded text-xs">Adv</span>
                )}
              </div>
            )}
            
            {selectedCourse && (
              selectedCourse.blueTees || 
              selectedCourse.whiteTees || 
              selectedCourse.redTees
            ) && (
              <div className="mt-2 px-4">
                <div className="grid gap-1.5" style={{
                  gridTemplateColumns: `repeat(${
                    [selectedCourse.blueTees, selectedCourse.whiteTees, selectedCourse.redTees]
                      .filter(Boolean).length
                  }, 1fr)`
                }}>
                  {selectedCourse.blueTees && (
                    <div className="bg-blue-500 bg-opacity-90 rounded-md py-1 px-1.5 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-700 rounded-full"></span>
                        <span className="text-xs font-semibold text-white">Blue</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {selectedCourse.blueTees[holes[currentHole] - 1]}m
                      </div>
                    </div>
                  )}
                  
                  {selectedCourse.whiteTees && (
                    <div className="bg-gray-200 rounded-md py-1 px-1.5 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        <span className="text-xs font-semibold text-gray-700">White</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {selectedCourse.whiteTees[holes[currentHole] - 1]}m
                      </div>
                    </div>
                  )}
                  
                  {selectedCourse.redTees && (
                    <div className="bg-red-500 bg-opacity-90 rounded-md py-1 px-1.5 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className="inline-block w-1.5 h-1.5 bg-red-700 rounded-full"></span>
                        <span className="text-xs font-semibold text-white">Red</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {selectedCourse.redTees[holes[currentHole] - 1]}m
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 语音开关按钮 */}
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                localStorage.setItem('handincap_voice', (!voiceEnabled).toString());
              }}
              className="absolute top-4 right-20 px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-lg transition"
            >
              {voiceEnabled ? '🔊' : '🔇'}
            </button>

            {!gameComplete && completedHoles.length < holes.length && (
              <button
                onClick={() => {
                  const message = lang === 'zh' 
                    ? '确定要终止比赛吗？\n未完成的洞将不计入成绩' 
                    : 'End the game now?\nIncomplete holes will not be counted';
                  showConfirm(message, () => {
                    setGameComplete(true);
					showToast(t('gameOver'));
					setCurrentSection('scorecard');
					triggerConfetti();
                  }, true);
                }}
                className="absolute top-4 right-4 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition"
              >
                {lang === 'zh' ? '终止' : 'End'}
              </button>
            )}
          </div>

          <div className="bg-white text-gray-900 p-3"> 
		  <div className="grid gap-3">
              {activePlayers.map(player => {
                const holeNum = holes[currentHole];
                const par = pars[holeNum] || 4;
                const playerScore = scores[player] || par;
                const playerPutts = putts[player] || 0;
                const playerWater = water[player] || 0;
                const playerOb = ob[player] || 0;
                const playerUp = ups[player] || false;
                const playerHandicapValue = getHandicapForHole(player, holeNum, par);
                const netScore = playerScore - playerHandicapValue;
                const scoreLabel = getScoreLabel(netScore, par);
                const isAdvancePlayer = advanceMode === 'on' && advancePlayers[player];
                
                if (isAdvancePlayer) {
                  // Advance 玩家 - 显示高级卡片
                  return (
                    <AdvancedPlayerCard
  key={player}
  player={player}
  playerOn={playerScore}
  playerPutts={playerPutts}
  playerWater={playerWater}
  playerOb={playerOb}
  playerUp={playerUp}
  par={par}
  showUp={gameMode === 'win123' && Number(stake) > 0}
  onChangeOn={(delta) => changeOn(player, delta)}
  onChangePutts={(delta) => changePutts(player, delta)}
  onChangeWater={() => changeWater(player)}
  onChangeOb={() => changeOb(player)}
  onResetWater={() => resetWater(player)}
  onResetOb={() => resetOb(player)}
  onToggleUp={() => toggleUp(player)}
  getScoreLabel={getScoreLabel}
/>
                  );
} else {
  // Classic 玩家 - 方案3 布局（无 Water/OB）
  const stroke = playerScore + playerPutts;
  const strokeLabel = getScoreLabel(stroke, par);
  
  return (
    <div key={player} className={`rounded-lg px-3 py-2.5 shadow-sm transition-all ${
      playerUp ? 'card-up-active' : 'bg-gray-50 border border-gray-200'
    }`}>
      <div className="flex items-center">
        
        {/* 左侧：UP按钮 + 玩家名 */}
        <div className="w-14 flex-shrink-0 flex flex-col items-start">
          {gameMode === 'win123' && Number(stake) > 0 && (
            <button 
              onClick={() => toggleUp(player)}
              className={`w-9 h-9 rounded-lg font-bold text-[10px] btn-press flex flex-col items-center justify-center mb-1 transition ${
                playerUp 
                  ? 'bg-yellow-400 text-yellow-900 shadow' 
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[8px] leading-none mt-0.5">UP</span>
            </button>
          )}
          <div className="font-bold text-lg text-gray-900">{player}</div>
        </div>

        {/* 中间：Stroke 显示（方案3 双层分离） */}
        <div className="flex-1 flex justify-center">
          <div className="stroke-display relative">
  <div className={`stroke-number ${strokeLabel.numClass}`}>
    {stroke}
  </div>
  <div className={`stroke-label ${strokeLabel.class}`}>
    {strokeLabel.text}
  </div>
  {getHandicapForHole(player, holes[currentHole]) > 0 && (
    <div className="absolute -top-1 -right-3 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
      -{getHandicapForHole(player, holes[currentHole])}
    </div>
  )}
</div>
        </div>

        {/* 右侧：On + Putts 控制器 */}
        <div className="flex flex-col gap-2 ml-2">
          <div className="flex items-center">
            <span className="text-[11px] font-bold text-gray-500 w-10 mr-1">On</span>
            <button
              onClick={() => changeOn(player, -1)}
              disabled={playerScore <= 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold transition ${
                playerScore > 1 ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-400'
              }`}
            >
              −
            </button>
            <span className="text-[32px] font-extrabold w-11 text-center text-gray-900">{playerScore}</span>
            <button
              onClick={() => changeOn(player, 1)}
              className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold"
            >
              +
            </button>
          </div>
          <div className="flex items-center">
            <span className="text-[11px] font-bold text-gray-500 w-10 mr-1">Putts</span>
            <button
              onClick={() => changePutts(player, -1)}
              disabled={playerPutts <= 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold transition ${
                playerPutts > 0 ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-400'
              }`}
            >
              −
            </button>
            <span className="text-[32px] font-extrabold w-11 text-center text-blue-700">{playerPutts}</span>
            <button
              onClick={() => changePutts(player, 1)}
              className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold"
            >
              +
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
              })}
            </div>
          </div>

          {/* 方案C: 合并 Hole Settlement + Live Standings */}
{Number(stake) > 0 && (gameMode === 'matchPlay' || gameMode === 'win123' || gameMode === 'skins') && (
  <div className="bg-orange-50 text-gray-900 p-3">
    <h3 className="text-center font-semibold mb-2 text-sm">{t('holeSettlement')}</h3>
    <div className={`grid gap-2 ${
      activePlayers.length <= 2 ? 'grid-cols-2' :
      activePlayers.length === 3 ? 'grid-cols-3' :
      'grid-cols-2'
    }`}>
      {activePlayers.map(player => {
        const holeAmt = currentHoleSettlement?.[player]?.money || 0;
        const totalAmt = totalMoney[player] || 0;
        return (
          <div key={player} className="bg-white p-2 rounded-md text-center">
            <div className="text-xs font-medium truncate">{player}</div>
            <div className={`text-sm font-bold ${
              holeAmt > 0 ? 'text-green-600' : 
              holeAmt < 0 ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {holeAmt === 0 ? '$0' : holeAmt > 0 ? `+$${holeAmt.toFixed(1)}` : `-$${Math.abs(holeAmt).toFixed(1)}`}
            </div>
            <div className={`text-xs mt-1 ${
              totalAmt > 0 ? 'text-green-500' : 
              totalAmt < 0 ? 'text-red-400' : 
              'text-gray-400'
            }`}>
              Total: {totalAmt === 0 ? '$0' : totalAmt > 0 ? `+$${totalAmt.toFixed(1)}` : `-$${Math.abs(totalAmt).toFixed(1)}`}
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

          <div className="bg-white p-3">
            <div className="flex gap-2">
              <button
                onClick={nextHole}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
              >
                {currentHole === holes.length - 1 ? t('finishRound') : t('nextHole')}
              </button>
              <button
                onClick={() => setCurrentSection('scorecard')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

{/* Advance Mode 报告弹窗 */}
      {advanceReportPlayer && !showAdvanceFullDetail && (
        <AdvanceReportCard
          player={advanceReportPlayer}
          rank={(() => {
            const playerTotals = {};
            activePlayers.forEach(p => {
              playerTotals[p] = completedHoles.reduce((sum, h) => sum + (allScores[p]?.[h] || 0), 0);
            });
            const sorted = activePlayers.slice().sort((a, b) => playerTotals[a] - playerTotals[b]);
            return sorted.indexOf(advanceReportPlayer) + 1;
          })()}
          onClose={() => setAdvanceReportPlayer(null)}
          onViewFull={() => setShowAdvanceFullDetail(true)}
          allScores={allScores}
          allPutts={allPutts}
          allWater={allWater}
          allOb={allOb}
          allUps={allUps}
          pars={pars}
          completedHoles={completedHoles}
          gameMode={gameMode}
          t={t}
          getMedal={getMedal}
          isAdvancePlayer={advancePlayers[advanceReportPlayer] || false}
        />
      )}

      {advanceReportPlayer && showAdvanceFullDetail && (
        <AdvanceFullDetailModal
          player={advanceReportPlayer}
          rank={(() => {
            const playerTotals = {};
            activePlayers.forEach(p => {
              playerTotals[p] = completedHoles.reduce((sum, h) => sum + (allScores[p]?.[h] || 0), 0);
            });
            const sorted = activePlayers.slice().sort((a, b) => playerTotals[a] - playerTotals[b]);
            return sorted.indexOf(advanceReportPlayer) + 1;
          })()}
          onClose={() => { setAdvanceReportPlayer(null); setShowAdvanceFullDetail(false); }}
          onBack={() => setShowAdvanceFullDetail(false)}
          allScores={allScores}
          allPutts={allPutts}
          allWater={allWater}
          allOb={allOb}
          allUps={allUps}
          pars={pars}
          completedHoles={completedHoles}
          gameMode={gameMode}
          t={t}
          getMedal={getMedal}
          isAdvancePlayer={advancePlayers[advanceReportPlayer] || false}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, message: '', action: null, showScreenshotHint: false })}
        onConfirm={() => {
          if (confirmDialog.action) confirmDialog.action();
        }}
        message={confirmDialog.message}
        t={t}
        showScreenshotHint={confirmDialog.showScreenshotHint}
      />

      <HoleScoreConfirmDialog
        isOpen={holeConfirmDialog.isOpen}
        onClose={() => {
          setHoleConfirmDialog({ isOpen: false, action: null });
          setPendingRankings(null);
        }}
        onConfirm={() => {
          if (holeConfirmDialog.action) holeConfirmDialog.action();
        }}
        hole={holes[currentHole]}
        players={activePlayers}
        scores={scores}
        putts={putts}
        rankings={pendingRankings}
        gameMode={gameMode}
        getHandicapForHole={getHandicapForHole}
        pars={pars}
        t={t}
        stake={stake}
        prizePool={prizePool}
        activePlayers={activePlayers}
      />

      <HoleSelectDialog
        isOpen={holeSelectDialog}
        onClose={() => setHoleSelectDialog(false)}
        completedHoles={completedHoles}
        onSelect={(hole) => setEditHoleDialog({ isOpen: true, hole })}
        t={t}
		pars={pars}
      />

      <EditHoleDialog
  isOpen={editHoleDialog.isOpen}
  onClose={() => setEditHoleDialog({ isOpen: false, hole: null })}
  hole={editHoleDialog.hole}
  players={activePlayers}
  allScores={allScores}
  allUps={allUps}
  allPutts={allPutts}
  pars={pars}
  onSave={handleEditHoleSave}
  t={t}
  gameMode={gameMode}
/>
	  <PuttsWarningDialog
  isOpen={puttsWarningDialog.isOpen}
  onClose={() => setPuttsWarningDialog({ isOpen: false, players: [] })}
  onConfirm={handlePuttsWarningConfirm}
  players={puttsWarningDialog.players}
  scores={scores}
  pars={pars}
  holes={holes}
  currentHole={currentHole}
  t={t}
  lang={lang}
/>
      <PWAInstallPrompt lang={lang} />
    </div>
  );
}

export default IntegratedGolfGame;