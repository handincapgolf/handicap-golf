// Cloudflare Pages Functions - 动态 OG 标签 + 球场 Logo
// 文件位置: functions/_middleware.js

// Base64 URL 安全解码
function base64ToBytes(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  return Array.from(binary, c => c.charCodeAt(0));
}

// 解包二进制位
function unpackBits(bytes, bitSizes, count) {
  let bits = bytes.map(b => b.toString(2).padStart(8, '0')).join('');
  const values = [];
  let pos = 0;
  for (let i = 0; i < count; i++) {
    const size = bitSizes[i % bitSizes.length];
    values.push(parseInt(bits.slice(pos, pos + size), 2));
    pos += size;
  }
  return values;
}

// 解码分享数据（与前端 decodeShareData 一致）
function decodeShareData(encoded) {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    
    const compact = decodeURIComponent(escape(atob(base64)));
    const parts = compact.split('|');
    
    if (parts.length < 7) return null;
    
    const name = parts[0];
    const courseName = parts[1];  // shortName: SIGC, PDGCC 等
    const dateRaw = parts[2];
    const date = `20${dateRaw.slice(0,2)}-${dateRaw.slice(2,4)}-${dateRaw.slice(4,6)}`;
    const isAdvance = parts[3] === '1';
    const startHole = Number(parts[4]);
    const holeCount = Number(parts[5]);
    const holeData = parts[6];
    
    // 解析洞数据计算总分
    const holeBytes = base64ToBytes(holeData);
    const bitSizes = isAdvance ? [2, 4, 3, 2, 2] : [2, 4, 3];
    const valuesPerHole = bitSizes.length;
    const holeValues = unpackBits(holeBytes, bitSizes, holeCount * valuesPerHole);
    
    let totalScore = 0;
    let totalPar = 0;
    
    for (let i = 0; i < holeCount; i++) {
      const base = i * valuesPerHole;
      const par = holeValues[base] + 3;
      const on = holeValues[base + 1];
      const putts = holeValues[base + 2];
      totalScore += on + putts;
      totalPar += par;
    }
    
    return {
      name,
      courseName,  // shortName
      date,
      totalScore,
      totalPar,
      holeCount
    };
  } catch (e) {
    console.error('Decode error:', e);
    return null;
  }
}

// 检测社交媒体爬虫
function isSocialCrawler(userAgent) {
  const crawlers = [
    'WhatsApp',
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'LinkedInBot',
    'Slackbot',
    'TelegramBot',
    'Discordbot',
    'Pinterest',
    'Googlebot',
    'bingbot'
  ];
  return crawlers.some(crawler => userAgent.includes(crawler));
}

// 生成球场 logo 文件名
function getCourseLogoFilename(shortName) {
  // 转小写，用于匹配文件名
  // 例如: "SIGC" -> "sigc", "PDGCC" -> "pdgcc"
  return shortName.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// 检查球场 logo 是否存在（通过 fetch）
async function checkLogoExists(baseUrl, filename) {
  try {
    const logoUrl = `${baseUrl}/images/courses/${filename}.png`;
    const response = await fetch(logoUrl, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    return false;
  }
}

// 生成动态 OG HTML
function generateOGHtml(data, originalUrl, ogImageUrl) {
  const diff = data.totalScore - data.totalPar;
  const diffText = diff > 0 ? `+${diff}` : diff === 0 ? 'E' : `${diff}`;
  
  // 动态标题：kk score 90 (+18) - SIGC
  const title = `${data.name} score ${data.totalScore} (${diffText})`;
  const description = data.courseName;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 页面标题 -->
  <title>${title} | HandinCap</title>
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${originalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="HandinCap">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${originalUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImageUrl}">
  
  <!-- 立即重定向到实际页面 -->
  <meta http-equiv="refresh" content="0;url=${originalUrl}">
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f0fdf4;
      color: #166534;
    }
  </style>
</head>
<body>
  <div>
    <p>Loading scorecard...</p>
    <p><a href="${originalUrl}">Click here if not redirected</a></p>
  </div>
</body>
</html>`;
}

// 主处理函数
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const shareParam = url.searchParams.get('p');
  const userAgent = request.headers.get('user-agent') || '';
  
  // 获取基础 URL（用于构建图片路径）
  const baseUrl = `${url.protocol}//${url.host}`;
  
  // 条件：有分享参数 且 是社交媒体爬虫
  if (shareParam && isSocialCrawler(userAgent)) {
    const data = decodeShareData(shareParam);
    
    if (data) {
      // 尝试获取球场 logo
      const logoFilename = getCourseLogoFilename(data.courseName);
      const logoExists = await checkLogoExists(baseUrl, logoFilename);
      
      // 如果有球场 logo 用球场 logo，否则用默认 og-image.png
      const ogImageUrl = logoExists 
        ? `${baseUrl}/images/courses/${logoFilename}.png`
        : `${baseUrl}/og-image.png`;
      
      const html = generateOGHtml(data, url.href, ogImageUrl);
      
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=3600'  // 缓存1小时
        }
      });
    }
  }
  
  // 非爬虫或无分享参数，正常处理
  return next();
}
