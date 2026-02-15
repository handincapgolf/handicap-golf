/**
 * 翻译模块 (i18n)
 * 
 * 支持语言自动检测 + 手动切换
 * 
 * 使用方法：
 * import { useTranslation, translations, detectLanguage, LANGUAGES } from './locales';
 * const t = useTranslation('zh'); // 或 'en'
 * t('hello') // 返回对应翻译
 */

import { zh } from './zh';
import { en } from './en';
import { zhTW } from './zh-TW';
import { ms } from './ms';
import { th } from './th';
import { ja } from './ja';
import { ko } from './ko';

// 所有翻译
export const translations = { zh, en, 'zh-TW': zhTW, ms, th, ja, ko };

// 支持的语言列表（用于语言选择器）
export const LANGUAGES = [
  { code: 'en',    label: 'English' },
  { code: 'zh',    label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'ms',    label: 'Bahasa Melayu' },
  { code: 'th',    label: 'ภาษาไทย' },
  { code: 'ja',    label: '日本語' },
  { code: 'ko',    label: '한국어' }
];

/**
 * 自动检测用户语言
 * 优先级: localStorage > navigator.language > 'en'
 */
export const detectLanguage = () => {
  // 1. 已保存的偏好
  try {
    const saved = localStorage.getItem('handincap_lang');
    if (saved && translations[saved]) return saved;
  } catch {}

  // 2. 浏览器语言
  const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || 'en'];
  
  for (const rawLang of browserLangs) {
    const lang = rawLang.trim();
    
    // 精确匹配 (e.g. zh-TW)
    if (translations[lang]) return lang;
    
    // 繁体中文特殊处理: zh-TW, zh-HK, zh-Hant
    if (/^zh[-_](TW|HK|Hant)/i.test(lang)) return 'zh-TW';
    
    // 简体中文: zh, zh-CN, zh-SG, zh-Hans
    if (/^zh/i.test(lang)) return 'zh';
    
    // 基础语言匹配 (e.g. 'ms-MY' -> 'ms', 'th-TH' -> 'th')
    const base = lang.split('-')[0].toLowerCase();
    if (translations[base]) return base;
  }

  // 3. 默认英文
  return 'en';
};

// 获取翻译函数
export const useTranslation = (lang = 'en') => {
  const dict = translations[lang] || translations.en;
  
  return (key) => {
    return dict[key] || translations.en[key] || key;
  };
};

// 直接导出各语言
export { zh, en, zhTW, ms, th, ja, ko };

export default translations;
