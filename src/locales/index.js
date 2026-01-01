/**
 * 翻译模块 (i18n)
 * 
 * 使用方法：
 * import { useTranslation, translations } from './locales';
 * const t = useTranslation('zh'); // 或 'en'
 * t('hello') // 返回对应翻译
 */

import { zh } from './zh';
import { en } from './en';

// 所有翻译
export const translations = { zh, en };

// 获取翻译函数
export const useTranslation = (lang = 'en') => {
  const dict = translations[lang] || translations.en;
  
  return (key) => {
    return dict[key] || key;
  };
};

// 直接导出各语言
export { zh, en };

export default translations;
