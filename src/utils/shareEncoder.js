/**
 * 分享链接编解码工具 (Share Encoder/Decoder)
 * 
 * 超紧凑分享链接 V3 - 二进制压缩 + fullName
 * 从 IntegratedGolfGame.js 提取的纯工具函数，零 React 依赖
 */

// ========== 二进制位操作 ==========

export const packBits = (values, bitSizes) => {
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

export const unpackBits = (bytes, bitSizes, count) => {
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

// ========== Base64 编解码 ==========

export const bytesToBase64 = (bytes) => {
  const binary = String.fromCharCode(...bytes);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const base64ToBytes = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  return Array.from(binary, c => c.charCodeAt(0));
};

// ========== 分享数据编码 ==========

export const encodeShareData = (data) => {
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

// ========== 分享数据解码 ==========

export const decodeShareData = (encoded) => {
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

// ========== 生成个人报告的分享数据 ==========

export const generatePlayerShareData = (player, course, holes, pars, allScores, allPutts, allWater, allOb, completedHoles, isAdvancePlayer) => {
  const holeDetails = completedHoles.map(hole => {
    const on = allScores[player]?.[hole] || 0;
    const putts = allPutts[player]?.[hole] || 0;
    const detail = {
      h: hole,
      p: pars[hole] || 4,
      o: on,
      t: putts
    };
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
    v: 1,
    n: player,
    c: course?.shortName || 'Custom',
    f: course?.fullName || '',
    d: new Date().toISOString().split('T')[0],
    s: totalScore,
    p: totalPar,
    u: totalPutts,
    a: isAdvancePlayer || false,
    h: holeDetails
  };
};

// ========== 生成分享链接 ==========

export const generateShareUrl = (data) => {
  const encoded = encodeShareData(data);
  if (!encoded) return null;
  
  const baseUrl = window.location.origin;
  return `${baseUrl}?p=${encoded}`;
};
