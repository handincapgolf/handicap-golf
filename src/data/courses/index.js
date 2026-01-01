/**
 * Golf Courses Database Index
 * 
 * 统一导出所有球场数据 + 搜索工具函数
 * 
 * 以后迁移到 Supabase 时，只需要修改这个文件的数据源即可
 * 其他组件不需要改动
 */

// ========== 导入各州属球场数据 ==========
import { SELANGOR_COURSES } from './selangor';
import { JOHOR_COURSES } from './johor';
import { PERAK_COURSES } from './perak';
import { PAHANG_COURSES } from './pahang';
import { SABAH_COURSES } from './sabah';
import { SARAWAK_COURSES } from './sarawak';
import { KEDAH_COURSES } from './kedah';
import { PENANG_COURSES } from './penang';
import { KUALA_LUMPUR_COURSES } from './kuala-lumpur';
import { NEGERI_SEMBILAN_COURSES } from './negeri-sembilan';
import { MELAKA_COURSES } from './melaka';
import { TERENGGANU_COURSES } from './terengganu';
import { KELANTAN_COURSES } from './kelantan';
import { OTHER_COURSES } from './others';

// ========== 合并所有球场数据 ==========
export const GOLF_COURSES = {
  ...SELANGOR_COURSES,
  ...JOHOR_COURSES,
  ...PERAK_COURSES,
  ...PAHANG_COURSES,
  ...SABAH_COURSES,
  ...SARAWAK_COURSES,
  ...KEDAH_COURSES,
  ...PENANG_COURSES,
  ...KUALA_LUMPUR_COURSES,
  ...NEGERI_SEMBILAN_COURSES,
  ...MELAKA_COURSES,
  ...TERENGGANU_COURSES,
  ...KELANTAN_COURSES,
  ...OTHER_COURSES
};

// ========== 按州属分组导出（方便按需加载）==========
export const COURSES_BY_STATE = {
  'Selangor': SELANGOR_COURSES,
  'Johor': JOHOR_COURSES,
  'Perak': PERAK_COURSES,
  'Pahang': PAHANG_COURSES,
  'Sabah': SABAH_COURSES,
  'Sarawak': SARAWAK_COURSES,
  'Kedah': KEDAH_COURSES,
  'Penang': PENANG_COURSES,
  'Kuala Lumpur': KUALA_LUMPUR_COURSES,
  'Negeri Sembilan': NEGERI_SEMBILAN_COURSES,
  'Melaka': MELAKA_COURSES,
  'Terengganu': TERENGGANU_COURSES,
  'Kelantan': KELANTAN_COURSES,
  'Others': OTHER_COURSES
};

// ========== 获取所有州属列表 ==========
export const getStates = () => Object.keys(COURSES_BY_STATE);

// ========== 获取球场总数 ==========
export const getCourseCount = () => Object.keys(GOLF_COURSES).length;

// ========== 按州属获取球场 ==========
export const getCoursesByState = (state) => {
  return COURSES_BY_STATE[state] || {};
};

// ========== 获取所有球场数组（方便遍历）==========
export const getAllCoursesArray = () => {
  return Object.values(GOLF_COURSES);
};

// ========== 搜索球场 ==========
/**
 * 搜索球场
 * @param {string} query - 搜索关键词
 * @param {Object} options - 搜索选项
 * @param {string} options.state - 限制搜索的州属
 * @param {number} options.limit - 返回结果数量限制
 * @returns {Array} 匹配的球场数组
 */
export const searchCourses = (query, options = {}) => {
  if (!query || !query.trim()) return [];
  
  const { state = null, limit = 50 } = options;
  const searchTerm = query.toLowerCase().trim();
  
  // 选择搜索范围
  const coursesToSearch = state 
    ? Object.values(COURSES_BY_STATE[state] || {})
    : getAllCoursesArray();
  
  // 第1优先：shortName 完全匹配
  const exactMatches = coursesToSearch.filter(course => 
    course.shortName.toLowerCase() === searchTerm
  );
  if (exactMatches.length > 0) {
    return exactMatches.slice(0, limit);
  }
  
  // 第2优先：shortName 开头匹配
  const startsWithMatches = coursesToSearch.filter(course => {
    const shortNameLower = course.shortName.toLowerCase();
    const shortNameNoHyphen = shortNameLower.replace(/-/g, '');
    const queryNoHyphen = searchTerm.replace(/-/g, '');
    return shortNameLower.startsWith(searchTerm) || shortNameNoHyphen.startsWith(queryNoHyphen);
  });
  if (startsWithMatches.length > 0) {
    return startsWithMatches.slice(0, limit);
  }
  
  // 第3优先：shortName 包含匹配
  const containsMatches = coursesToSearch.filter(course => 
    course.shortName.toLowerCase().includes(searchTerm)
  );
  if (containsMatches.length > 0) {
    return containsMatches.slice(0, limit);
  }
  
  // 第4优先：fullName 或 location 关键词匹配
  const keywords = searchTerm.split(/\s+/).filter(k => k.length > 0);
  
  const keywordMatches = coursesToSearch
    .map(course => {
      const fullNameLower = course.fullName.toLowerCase();
      const locationStr = course.location ? course.location.join(' ').toLowerCase() : '';
      
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
  
  return keywordMatches.slice(0, limit);
};

// ========== 通过 ID 获取单个球场 ==========
export const getCourseById = (courseId) => {
  return GOLF_COURSES[courseId] || null;
};

// ========== 获取球场统计信息 ==========
export const getCourseStats = () => {
  const stats = {
    total: getCourseCount(),
    byState: {}
  };
  
  Object.entries(COURSES_BY_STATE).forEach(([state, courses]) => {
    stats.byState[state] = Object.keys(courses).length;
  });
  
  return stats;
};

// ========== 默认导出 ==========
export default GOLF_COURSES;
