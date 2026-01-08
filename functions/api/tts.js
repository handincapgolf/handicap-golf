// Cloudflare Worker - Edge TTS 代理
// 文件位置: functions/api/tts.js

export async function onRequest(context) {
  const { request } = context;
  
  // 只接受 POST 请求
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { text, voice } = await request.json();
    
    // 默认英文声音
    const selectedVoice = voice || 'en-US-JennyNeural';
    
    // 构建 SSML（语音合成标记语言）
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${selectedVoice}">
          ${text}
        </voice>
      </speak>
    `;
    
    // 调用 Edge TTS API
    const response = await fetch(
      'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
        },
        body: ssml
      }
    );
    
    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }
    
    const audio = await response.arrayBuffer();
    
    // 返回音频数据
    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400'  // 缓存1天
      }
    });
    
  } catch (error) {
    console.error('TTS Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
