# Golf Courses 模块使用指南

## 目录结构

```
src/
├── data/
│   └── courses/
│       ├── index.js          # 统一导出 + 搜索工具 ⭐
│       ├── selangor.js       # 雪兰莪 (55个球场)
│       ├── johor.js          # 柔佛 (31个球场)
│       ├── perak.js          # 霹雳 (14个球场)
│       ├── pahang.js         # 彭亨 (15个球场)
│       ├── sabah.js          # 沙巴 (19个球场)
│       ├── sarawak.js        # 砂拉越 (8个球场)
│       ├── kedah.js          # 吉打 (11个球场)
│       ├── penang.js         # 槟城 (5个球场)
│       ├── kuala-lumpur.js   # 吉隆坡 (8个球场)
│       ├── negeri-sembilan.js # 森美兰 (15个球场)
│       ├── melaka.js         # 马六甲 (13个球场)
│       ├── terengganu.js     # 登嘉楼 (7个球场)
│       ├── kelantan.js       # 吉兰丹 (3个球场)
│       └── others.js         # 其他 (Perlis, Labuan)
└── App.jsx
```

## 在主程序中使用

### 方式1：导入整个数据库（推荐）

```javascript
// App.jsx
import { GOLF_COURSES, searchCourses, getCourseStats } from './data/courses';

// 直接使用 GOLF_COURSES 对象
const course = GOLF_COURSES['GLENMARIE_GOLF_AND_COUNTRY_CLUB_GARDEN'];

// 使用搜索功能
const results = searchCourses('klgcc');
const selangorResults = searchCourses('shah alam', { state: 'Selangor' });
```

### 方式2：只导入需要的数据

```javascript
// 只导入吉隆坡球场
import { KUALA_LUMPUR_COURSES } from './data/courses/kuala-lumpur';

// 或者使用按需加载
import { getCoursesByState } from './data/courses';
const klCourses = getCoursesByState('Kuala Lumpur');
```

## 可用的工具函数

```javascript
import {
  GOLF_COURSES,           // 所有球场对象
  COURSES_BY_STATE,       // 按州属分组的球场
  getStates,              // 获取所有州属列表
  getCourseCount,         // 获取球场总数
  getCoursesByState,      // 按州属获取球场
  getAllCoursesArray,     // 获取所有球场数组
  searchCourses,          // 搜索球场
  getCourseById,          // 通过ID获取单个球场
  getCourseStats          // 获取统计信息
} from './data/courses';

// 示例
console.log(getCourseCount());        // 200+
console.log(getStates());             // ['Selangor', 'Johor', ...]
console.log(getCourseStats());        // { total: 200+, byState: {...} }
```

## 搜索功能

```javascript
import { searchCourses } from './data/courses';

// 基本搜索
searchCourses('klgcc');                    // 按简称搜索
searchCourses('kuala lumpur');             // 按关键词搜索
searchCourses('shah alam');                // 按地点搜索

// 限制搜索范围
searchCourses('golf', { state: 'Johor' }); // 只搜索柔佛
searchCourses('resort', { limit: 10 });    // 限制返回数量
```

## 迁移到 Supabase

当你准备好迁移到 Supabase 时，只需要修改 `index.js`：

```javascript
// index.js (迁移后)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 搜索函数改为调用 Supabase
export const searchCourses = async (query, options = {}) => {
  const { data, error } = await supabase
    .from('golf_courses')
    .select('*')
    .ilike('full_name', `%${query}%`)
    .limit(options.limit || 50);
    
  return data || [];
};

// 其他函数类似...
```

**其他组件完全不需要改动！** 🎉

## 添加新球场

1. 找到对应州属的文件（如 `selangor.js`）
2. 添加新球场数据：

```javascript
"NEW_COURSE_ID": {
  shortName: "NGC",
  fullName: "New Golf Course",
  location: ["City", "State", "Malaysia"],
  pars: [4,4,3,5,4,4,3,5,4, 4,4,5,3,4,4,5,3,4],
  blueTees: null,
  whiteTees: null,
  redTees: null
}
```

3. 完成！`index.js` 会自动包含新球场

## 球场数据结构

```javascript
{
  shortName: "KLGCC-E",           // 简称（用于搜索）
  fullName: "Kuala Lumpur Golf & Country Club (East Course)",  // 全名
  location: ["Bukit Kiara", "Kuala Lumpur", "Malaysia"],       // [城市, 州, 国家]
  pars: [4,4,4,4,3,5,3,4,4, 4,4,5,4,4,3,5,3,4],               // 18洞PAR值
  blueTees: [420,380,...],        // 蓝Tee码数（可选）
  whiteTees: [400,360,...],       // 白Tee码数（可选）
  redTees: [350,320,...]          // 红Tee码数（可选）
}
```
