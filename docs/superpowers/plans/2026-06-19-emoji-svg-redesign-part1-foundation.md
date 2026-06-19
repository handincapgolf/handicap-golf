# Emoji → Color SVG Redesign — Part 1: Foundation + Pictographic Emoji

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `<Icon>` + `<Badge>` infrastructure and replace every pictographic/prefix emoji in the UI (JSX + locale strings) with the approved custom color SVG set. App stays fully functional; no raw pictographic emoji remain.

**Architecture:** One `<Icon name size className>` component backed by a single SVG registry (`src/components/icons/registry.js`) holding the approved 24×24 artwork. A `<Badge>` component (CSS, not SVG) is built here for later marker use. Replacement is done per-file (one commit each) so each screen can be verified in the browser as we go.

**Tech Stack:** React 19, Create React App (`react-scripts test` = Jest + React Testing Library + jest-dom already configured in `src/setupTests.js`), TailwindCSS (CDN).

**Scope note:** This is Part 1 of 3. Part 2 = numeric/letter marker badges (①②③④ 🅰️🅱️🅲 Ⓒ–Ⓗ). Part 3 = restyle remaining `lucide-react` icons to the color set and drop the dependency. Markers, lucide icons, comments, `console.log` debug lines, and `×` used as multiplication in code comments are explicitly OUT of scope for Part 1.

**Reference artwork:** All SVG bodies below are the exact paths the user approved in the visual companion (`.superpowers/brainstorm/75167-1781856961/content/icon-catalog.html`). Tool icons (arrows, check, x, dot) are converted to `currentColor` per the spec's coloring rule so they adapt inside colored buttons.

---

## File Structure

| File | Create/Modify | Responsibility |
|------|---------------|----------------|
| `src/components/icons/registry.js` | Create | The single source of truth: `name → { body, currentColor }`. No React, just data. |
| `src/components/Icon.js` | Create | `<Icon>` wrapper that renders `<svg>` around a registry entry. |
| `src/components/Badge.js` | Create | `<Badge>` colored CSS circle/square with a number/letter (used in Part 2). |
| `src/components/icons/Icon.test.js` | Create | Tests for Icon + registry. |
| `src/components/Badge.test.js` | Create | Tests for Badge. |
| `src/locales/*.js` (7 files) | Modify | Strip emoji prefixes from string values. |
| `src/sections/*.js`, `src/components/*.js`, `src/RoundReport.js`, `src/ViewerGameScreen.js`, `src/IntegratedGolfGame.js` | Modify | Replace inline JSX emoji with `<Icon>`; add `<Icon>` next to de-prefixed `{t(...)}` calls. |

---

## Phase 0 — Foundation

### Task 1: `<Badge>` component (TDD)

**Files:**
- Create: `src/components/Badge.js`
- Create: `src/components/Badge.test.js`

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/Badge.test.js
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

test('renders label inside a circle badge', () => {
  render(<Badge label="1" />);
  const el = screen.getByText('1');
  expect(el).toBeInTheDocument();
  expect(el).toHaveStyle({ borderRadius: '50%' });
});

test('square shape uses rounded-square radius', () => {
  render(<Badge label="A" shape="square" />);
  expect(screen.getByText('A')).toHaveStyle({ borderRadius: '28%' });
});

test('passes through background color and size', () => {
  render(<Badge label="C" color="#64748b" size={40} />);
  const el = screen.getByText('C');
  expect(el).toHaveStyle({ background: '#64748b', width: '40px', height: '40px' });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `CI=true npx react-scripts test src/components/Badge.test.js`
Expected: FAIL — `Cannot find module './Badge'`.

- [ ] **Step 3: Implement `Badge.js`**

```jsx
// src/components/Badge.js
import React, { memo } from 'react';

const Badge = memo(({ label, shape = 'circle', color = '#16a34a', textColor = '#fff', size = 24, className = '', style = {} }) => (
  <span
    className={className}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: shape === 'square' ? '28%' : '50%',
      background: color,
      color: textColor,
      fontWeight: 800,
      fontSize: Math.round(size * 0.5),
      lineHeight: 1,
      flexShrink: 0,
      ...style,
    }}
  >
    {label}
  </span>
));

export default Badge;
```

- [ ] **Step 4: Run test, verify it passes**

Run: `CI=true npx react-scripts test src/components/Badge.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/Badge.js src/components/Badge.test.js
git commit -m "feat(icons): add Badge component for numeric/letter markers"
```

---

### Task 2: Icon registry + `<Icon>` component (TDD)

**Files:**
- Create: `src/components/icons/registry.js`
- Create: `src/components/Icon.js`
- Create: `src/components/icons/Icon.test.js`

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/icons/Icon.test.js
import { render } from '@testing-library/react';
import Icon from '../Icon';
import { ICONS } from './registry';

test('renders an svg for a known name', () => {
  const { container } = render(<Icon name="flag" />);
  const svg = container.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
});

test('applies size to width and height', () => {
  const { container } = render(<Icon name="trophy" size={32} />);
  const svg = container.querySelector('svg');
  expect(svg).toHaveAttribute('width', '32');
  expect(svg).toHaveAttribute('height', '32');
});

test('passes className through', () => {
  const { container } = render(<Icon name="flag" className="mr-1" />);
  expect(container.querySelector('svg')).toHaveClass('mr-1');
});

test('unknown name renders nothing (null), no throw', () => {
  const { container } = render(<Icon name="does-not-exist" />);
  expect(container.querySelector('svg')).toBeNull();
});

test('every registry entry has a non-empty body', () => {
  Object.entries(ICONS).forEach(([name, def]) => {
    expect(def.body, `icon ${name}`).toBeTruthy();
  });
});

test('registry contains all Part 1 icon names', () => {
  const required = [
    'flag','target','water','golfer',
    'check-circle','check','x','x-circle','loading','alert','ban',
    'arrow-right','arrow-left','arrow-up','edit','share','search','link','camera',
    'sync','users','user','device','globe','eye','dot',
    'chart','clipboard','comment','tip',
    'celebrate','trophy','medal-gold','medal-silver','medal-bronze','money-bag','cash',
    'game','home','sound-on','sound-off','bolt','bug','suit-spade','mail',
    'star','star-outline',
  ];
  required.forEach((n) => expect(ICONS[n], `missing ${n}`).toBeDefined());
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `CI=true npx react-scripts test src/components/icons/Icon.test.js`
Expected: FAIL — `Cannot find module './registry'`.

- [ ] **Step 3: Create the registry** (`src/components/icons/registry.js`)

Bodies are the exact approved artwork. Tool icons set `currentColor: true` and use `stroke="currentColor"` so they inherit text color.

```jsx
// src/components/icons/registry.js
import React from 'react';

// Each entry: { body: <JSX children of a 0 0 24 24 svg>, currentColor?: boolean }
export const ICONS = {
  // ---- Golf ----
  'flag': { body: (<>
    <rect x="5" y="3" width="2.2" height="18" rx="1.1" fill="#64748b"/>
    <path d="M7.2 4h9.1a.6.6 0 0 1 .43 1.02L14 7.5l2.73 2.48A.6.6 0 0 1 16.3 11H7.2z" fill="#16a34a"/>
    <ellipse cx="6.1" cy="21" rx="4.6" ry="1.3" fill="#86efac"/>
  </>) },
  'target': { body: (<>
    <circle cx="12" cy="12" r="9" fill="#ef4444"/><circle cx="12" cy="12" r="6" fill="#fff"/>
    <circle cx="12" cy="12" r="3.4" fill="#ef4444"/><circle cx="12" cy="12" r="1.3" fill="#fff"/>
  </>) },
  'water': { body: (<>
    <path d="M12 3.2c3 4 5.5 6.6 5.5 9.8a5.5 5.5 0 0 1-11 0c0-3.2 2.5-5.8 5.5-9.8z" fill="#3b82f6"/>
    <path d="M9.5 13.6a2.6 2.6 0 0 0 2.6 2.6" fill="none" stroke="#bfdbfe" strokeWidth="1.4" strokeLinecap="round"/>
  </>) },
  'golfer': { body: (<>
    <circle cx="12" cy="6" r="3" fill="#15803d"/>
    <path d="M10.5 9.2 8 13l-3.5-1.5" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 9.5c2 .5 3 2 3.3 4l1.2 7" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 13.5 19 11" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M9.6 20.5 12 15" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round"/>
  </>) },

  // ---- Status ----
  'check-circle': { body: (<>
    <circle cx="12" cy="12" r="9.5" fill="#16a34a"/>
    <path d="M7.5 12.3l3 3 6-6.3" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </>) },
  'check': { currentColor: true, body: (
    <path d="M5 12.5l4 4 10-10.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
  ) },
  'x-circle': { body: (<>
    <circle cx="12" cy="12" r="9.5" fill="#ef4444"/>
    <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
  </>) },
  'x': { currentColor: true, body: (
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
  ) },
  'loading': { body: (<>
    <path d="M6 3h12a1 1 0 0 1 0 2h-.4c-.4 3-2.4 4.7-3.7 5.9 1.3 1.2 3.3 2.9 3.7 6h.4a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2h.4c.4-3.1 2.4-4.8 3.7-6C8.8 9.7 6.8 8 6.4 5H6a1 1 0 0 1 0-2z" fill="#f59e0b"/>
    <path d="M9 6.3h6c-.3 1.6-1.6 2.7-3 3.7-1.4-1-2.7-2.1-3-3.7z" fill="#fde68a"/>
  </>) },
  'alert': { body: (<>
    <path d="M12 3.2 22 20.5a1.4 1.4 0 0 1-1.2 2.1H3.2A1.4 1.4 0 0 1 2 20.5z" fill="#f59e0b"/>
    <path d="M12 9.2v5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="17.6" r="1.2" fill="#fff"/>
  </>) },
  'ban': { body: (<>
    <circle cx="12" cy="12" r="9" fill="none" stroke="#ef4444" strokeWidth="2.4"/>
    <path d="M5.6 5.6l12.8 12.8" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round"/>
  </>) },

  // ---- Navigation / actions ----
  'arrow-right': { currentColor: true, body: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15"/><path d="M13 6l6 6-6 6"/></g>
  ) },
  'arrow-left': { currentColor: true, body: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12H5"/><path d="M11 6l-6 6 6 6"/></g>
  ) },
  'arrow-up': { currentColor: true, body: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V5"/><path d="M6 11l6-6 6 6"/></g>
  ) },
  'edit': { body: (<>
    <path d="M15.4 4.6 19.4 8.6 9 19l-4.6 1 1-4.6z" fill="#fbbf24"/>
    <path d="M15.4 4.6 17 3a1.4 1.4 0 0 1 2 2l-1.6 1.6z" fill="#ef4444"/>
    <path d="M4.4 20 9 19 5.4 15.4z" fill="#334155"/>
  </>) },
  'share': { body: (<>
    <path d="M4 13h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="#86efac"/>
    <path d="M12 15V3.6" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 7l4-4 4 4" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </>) },
  'search': { body: (<>
    <circle cx="11" cy="11" r="6.5" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
    <path d="M16 16l4.5 4.5" stroke="#3b82f6" strokeWidth="2.6" strokeLinecap="round"/>
  </>) },
  'link': { body: (<>
    <path d="M8.5 9.5 6 7a3 3 0 1 1 4.2-4.2l2.5 2.5" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15.5 14.5 18 17a3 3 0 1 1-4.2 4.2l-2.5-2.5" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 15l6-6" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/>
  </>) },
  'camera': { body: (<>
    <rect x="3" y="7.5" width="18" height="12" rx="2.4" fill="#16a34a"/>
    <path d="M8.5 7.5 9.7 5.4h4.6l1.2 2.1z" fill="#15803d"/>
    <circle cx="12" cy="13.5" r="3.6" fill="#dcfce7"/><circle cx="12" cy="13.5" r="2" fill="#15803d"/>
  </>) },

  // ---- Multiplayer ----
  'sync': { body: (
    <g fill="none" strokeLinecap="round"><circle cx="12" cy="12" r="2" fill="#16a34a" stroke="none"/>
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49" stroke="#16a34a" strokeWidth="2.2"/>
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49" stroke="#16a34a" strokeWidth="2.2"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#86efac" strokeWidth="2.2"/>
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14" stroke="#86efac" strokeWidth="2.2"/></g>
  ) },
  'users': { body: (<>
    <circle cx="9" cy="7" r="4" fill="#16a34a"/>
    <path d="M9 13c-4.4 0-7 2.5-7 5.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1.5c0-3-2.6-5.5-7-5.5z" fill="#16a34a"/>
    <circle cx="17.5" cy="7.5" r="3.2" fill="#5eead4"/>
    <path d="M17.5 12.7c-1 0-1.9.16-2.6.45 1.3 1.1 2.1 2.6 2.1 4.35V21h4a1 1 0 0 0 1-1v-1.3c0-3-2.3-6-4.5-6z" fill="#5eead4"/>
  </>) },
  'user': { body: (<>
    <circle cx="12" cy="7.5" r="4.2" fill="#16a34a"/>
    <path d="M12 13.5c-4.6 0-7.5 2.6-7.5 5.7V20a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-.8c0-3.1-2.9-5.7-7.5-5.7z" fill="#16a34a"/>
  </>) },
  'device': { body: (<>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.6" fill="#16a34a"/>
    <rect x="8" y="5" width="8" height="12" rx="1" fill="#dcfce7"/>
    <circle cx="12" cy="19.2" r="1" fill="#86efac"/>
  </>) },
  'globe': { body: (<>
    <circle cx="12" cy="12" r="9" fill="#3b82f6"/>
    <path d="M3 12h18M12 3c2.7 3 2.7 15 0 18M12 3c-2.7 3-2.7 15 0 18M5 6.2c4.2 2 9.8 2 14 0M5 17.8c4.2-2 9.8-2 14 0" fill="none" stroke="#bfdbfe" strokeWidth="1.2"/>
  </>) },
  'eye': { body: (<>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.6"/>
    <circle cx="12" cy="12" r="3" fill="#3b82f6"/><circle cx="12" cy="12" r="1.1" fill="#fff"/>
  </>) },
  'dot': { currentColor: true, body: (<circle cx="12" cy="12" r="5" fill="currentColor"/>) },

  // ---- Reports ----
  'chart': { body: (<>
    <rect x="3.5" y="3" width="2" height="18" rx="1" fill="#cbd5e1"/>
    <rect x="3.5" y="19" width="17" height="2" rx="1" fill="#cbd5e1"/>
    <rect x="7.5" y="11" width="3" height="8" rx="1" fill="#4ade80"/>
    <rect x="12.5" y="7" width="3" height="12" rx="1" fill="#16a34a"/>
    <rect x="17.5" y="13" width="3" height="6" rx="1" fill="#22c55e"/>
  </>) },
  'clipboard': { body: (<>
    <rect x="5" y="4" width="14" height="18" rx="2.2" fill="#16a34a"/>
    <rect x="7" y="6.5" width="10" height="13.5" rx="1.4" fill="#fff"/>
    <rect x="9" y="2.6" width="6" height="3.4" rx="1.2" fill="#15803d"/>
    <path d="M9.3 11h5.4M9.3 14h5.4M9.3 17h3.4" stroke="#86efac" strokeWidth="1.4" strokeLinecap="round"/>
  </>) },
  'comment': { body: (<>
    <path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V16.5H4a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 4 5.5z" fill="#16a34a"/>
    <path d="M7.5 9.5h9M7.5 12.5h6" stroke="#bbf7d0" strokeWidth="1.5" strokeLinecap="round"/>
  </>) },
  'tip': { body: (<>
    <path d="M12 3a6 6 0 0 0-3.8 10.7c.7.6 1.1 1.2 1.3 2.3h5c.2-1.1.6-1.7 1.3-2.3A6 6 0 0 0 12 3z" fill="#fbbf24"/>
    <rect x="9.3" y="16.5" width="5.4" height="2.2" rx="1.1" fill="#94a3b8"/>
    <rect x="10" y="19" width="4" height="2.2" rx="1.1" fill="#64748b"/>
    <path d="M9.8 13c-.6-1.2-.5-2.5.4-3.5" stroke="#fff7cc" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
  </>) },

  // ---- Rewards ----
  'celebrate': { body: (<>
    <path d="M3.5 20.8 9 10.8l4.4 4.4L3.5 20.8z" fill="#16a34a"/>
    <path d="M9 10.8l4.4 4.4-2.2 1-3.2-3.2z" fill="#15803d"/>
    <path d="M14 8.8c1.1-1.3 2.8-1.5 4-.6" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="15.5" cy="4.6" r="1" fill="#ef4444"/><circle cx="19.2" cy="7.4" r="1" fill="#3b82f6"/>
    <circle cx="20.4" cy="3.4" r=".9" fill="#f59e0b"/><circle cx="12.3" cy="5.2" r=".9" fill="#a855f7"/>
  </>) },
  'trophy': { body: (<>
    <path d="M6 3h12v6a6 6 0 0 1-12 0V3z" fill="#f59e0b"/>
    <path d="M7 4H4.3a2.3 2.3 0 0 0 0 4.6H7V4z" fill="#f59e0b"/>
    <path d="M17 4h2.7a2.3 2.3 0 0 1 0 4.6H17V4z" fill="#f59e0b"/>
    <rect x="10.5" y="13.5" width="3" height="4.5" fill="#d97706"/>
    <rect x="7" y="20" width="10" height="2.4" rx="1.2" fill="#b45309"/>
    <path d="M12 5.2l.8 1.7 1.9.2-1.4 1.3.4 1.8L12 9.4l-1.7.9.4-1.8-1.4-1.3 1.9-.2z" fill="#fff7cc"/>
  </>) },
  'medal-gold': { body: (<>
    <path d="M9 3l2.2 5M15 3l-2.2 5" stroke="#3b82f6" strokeWidth="2.4" strokeLinecap="round"/>
    <circle cx="12" cy="15" r="6" fill="#f59e0b"/><circle cx="12" cy="15" r="3.9" fill="#fcd34d"/>
    <path d="M12 12.8l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill="#b45309"/>
  </>) },
  'medal-silver': { body: (<>
    <path d="M9 3l2.2 5M15 3l-2.2 5" stroke="#3b82f6" strokeWidth="2.4" strokeLinecap="round"/>
    <circle cx="12" cy="15" r="6" fill="#94a3b8"/><circle cx="12" cy="15" r="3.9" fill="#e2e8f0"/>
    <path d="M12 12.8l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill="#64748b"/>
  </>) },
  'medal-bronze': { body: (<>
    <path d="M9 3l2.2 5M15 3l-2.2 5" stroke="#3b82f6" strokeWidth="2.4" strokeLinecap="round"/>
    <circle cx="12" cy="15" r="6" fill="#c2722e"/><circle cx="12" cy="15" r="3.9" fill="#e3a06a"/>
    <path d="M12 12.8l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill="#8a4b1e"/>
  </>) },
  'money-bag': { body: (<>
    <path d="M8 7h8c2.5 2 4 4.7 4 7.5A6.5 6.5 0 0 1 13.5 21h-3A6.5 6.5 0 0 1 4 14.5C4 11.7 5.5 9 8 7z" fill="#16a34a"/>
    <path d="M8.2 7c0-1.4 1-2.4 1.5-3.4h4.6c.5 1 1.5 2 1.5 3.4z" fill="#15803d"/>
    <path d="M12 10.4v6.2M10.3 11.6c0-.8.8-1.2 1.7-1.2s1.7.4 1.7 1.2-.8 1.1-1.7 1.3-1.7.5-1.7 1.3.8 1.2 1.7 1.2 1.7-.4 1.7-1.2" fill="none" stroke="#fde68a" strokeWidth="1.3" strokeLinecap="round"/>
  </>) },
  'cash': { body: (<>
    <rect x="2.5" y="6.5" width="19" height="11" rx="2" fill="#16a34a"/>
    <circle cx="12" cy="12" r="3" fill="#86efac"/>
    <path d="M12 10.4v3.2M11 11.2c0-.5.5-.8 1-.8s1 .3 1 .7-.5.6-1 .8-1 .3-1 .8.5.7 1 .7 1-.3 1-.7" stroke="#15803d" strokeWidth="1" fill="none" strokeLinecap="round"/>
    <circle cx="5.5" cy="12" r="1.1" fill="#bbf7d0"/><circle cx="18.5" cy="12" r="1.1" fill="#bbf7d0"/>
  </>) },

  // ---- Misc / system ----
  'game': { body: (<>
    <path d="M7 8h10a4.5 4.5 0 0 1 4.4 5.5l-.8 3.6A2.4 2.4 0 0 1 16 17.2l-1.3-2H9.3l-1.3 2a2.4 2.4 0 0 1-4.6-.1l-.8-3.6A4.5 4.5 0 0 1 7 8z" fill="#16a34a"/>
    <path d="M6.8 11v3M5.3 12.5h3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="15.4" cy="11.8" r="1.05" fill="#fff"/><circle cx="17.3" cy="13.6" r="1.05" fill="#fff"/>
  </>) },
  'home': { body: (<>
    <path d="M6 10.5 12 5.5l6 5V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" fill="#86efac"/>
    <path d="M3 11.5 12 4l9 7.5" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="10" y="14" width="4" height="6" rx="0.5" fill="#15803d"/>
  </>) },
  'sound-on': { body: (<>
    <path d="M4 9.5h3l4-3.5v12l-4-3.5H4z" fill="#16a34a"/>
    <path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
  </>) },
  'sound-off': { body: (<>
    <path d="M4 9.5h3l4-3.5v12l-4-3.5H4z" fill="#94a3b8"/>
    <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
  </>) },
  'bolt': { body: (
    <path d="M13 2 4 13.5h6L11 22l9-11.5h-6z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" strokeLinejoin="round"/>
  ) },
  'bug': { body: (<>
    <ellipse cx="12" cy="13.5" rx="5" ry="6" fill="#16a34a"/>
    <path d="M9.2 5.2 10.5 7M14.8 5.2 13.5 7" stroke="#15803d" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="9.8" cy="4.6" r=".9" fill="#15803d"/><circle cx="14.2" cy="4.6" r=".9" fill="#15803d"/>
    <path d="M7 10.5H4M7 13.5H3.5M7 16.5H4.2M17 10.5h3M17 13.5h3.5M17 16.5h-3" stroke="#15803d" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="10.4" cy="11.5" r=".8" fill="#fff"/><circle cx="13.6" cy="11.5" r=".8" fill="#fff"/>
  </>) },
  'suit-spade': { body: (<>
    <path d="M12 21c-5-4-8-7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 4-3 7-8 11z" fill="#334155"/>
    <rect x="11" y="14" width="2" height="7" fill="#334155"/>
  </>) },
  'mail': { body: (<>
    <rect x="3" y="6" width="18" height="12" rx="2.4" fill="#16a34a"/>
    <path d="M4.5 8l7.5 5.2L19.5 8" fill="none" stroke="#dcfce7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </>) },
  'star': { body: (
    <path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 .98 5.7L12 17.2 6.92 22l.98-5.7-4.1-4 5.7-.8z" fill="#f59e0b"/>
  ) },
  'star-outline': { body: (
    <path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 .98 5.7L12 17.2 6.92 22l.98-5.7-4.1-4 5.7-.8z" fill="none" stroke="#cbd5e1" strokeWidth="1.6" strokeLinejoin="round"/>
  ) },
};
```

- [ ] **Step 4: Create the `<Icon>` component** (`src/components/Icon.js`)

```jsx
// src/components/Icon.js
import React, { memo } from 'react';
import { ICONS } from './icons/registry';

const Icon = memo(({ name, size = 20, className = '', title, style }) => {
  const def = ICONS[name];
  if (!def) {
    if (process.env.NODE_ENV !== 'production') console.warn(`<Icon> unknown name: ${name}`);
    return null;
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {def.body}
    </svg>
  );
});

export default Icon;
```

- [ ] **Step 5: Run tests, verify they pass**

Run: `CI=true npx react-scripts test src/components/icons/Icon.test.js`
Expected: PASS (6 tests). If "registry contains all Part 1 icon names" fails, a name is missing/misspelled in the registry — fix it.

- [ ] **Step 6: Commit**

```bash
git add src/components/Icon.js src/components/icons/registry.js src/components/icons/Icon.test.js
git commit -m "feat(icons): add Icon component + color SVG registry"
```

---

## Phase 1 — Strip emoji prefixes from locale strings

### Task 3: Remove pictographic emoji from all 7 locale files

After this task the buttons temporarily show plain text (no icon); per-screen tasks in Phase 2+ add the `<Icon>` next to each `{t(...)}` call. App stays functional throughout.

**Files (modify all 7):** `src/locales/en.js`, `zh.js`, `zh-TW.js`, `ms.js`, `th.js`, `ja.js`, `ko.js`

**Do NOT touch** the marker glyph `🅰️` inside `waitingProceed` (`'Waiting 🅰️ to proceed...'`) — that is a Part 2 badge. Strip every *pictographic* emoji prefix from the keys below.

- [ ] **Step 1: Edit `en.js`** — remove the leading emoji + space (and the mid-string `✏️ ` in `editLogTapHint`) from these 23 keys. Exact before → after:

```
switchLang:            '🌐 Language'          → 'Language'
mpMultiplayer:         '📡 Multiplayer'       → 'Multiplayer'
mpWaitingPartner:      '📡 Waiting for Partner' → 'Waiting for Partner'
mpWaitingStart:        '📡 Waiting to Start'  → 'Waiting to Start'
mpStartGame:           '🏌️ Start Game'        → 'Start Game'
mpConfirmSubmit:       '📤 Confirm'           → 'Confirm'
mpWaiting:             '⏳ Waiting...'         → 'Waiting...'
mpConfirmFinish:       '✅ Confirm & Finish'  → 'Confirm & Finish'
mpConfirmNext:         '✅ Confirm & Next'    → 'Confirm & Next'
editLogTapHint:        'Tap ✏️ on hole number to view edit log' → 'Tap on hole number to view edit log'
scorecardHorizontal:   '📋 Horizontal'        → 'Horizontal'
scorecardVertical:     '📊 Vertical'          → 'Vertical'
feedbackBtn:           '💬 Give Feedback'     → 'Give Feedback'
feedbackTitle:         '💬 Feedback'          → 'Feedback'
feedbackCatNewModes:   '🎮 More game modes'   → 'More game modes'
feedbackCatUI:         '📱 UI / Layout'       → 'UI / Layout'
feedbackCatSpeed:      '⚡ Performance'        → 'Performance'
feedbackCatCourse:     '⛳ Course data'        → 'Course data'
feedbackCatScoring:    '📊 Scoring'           → 'Scoring'
feedbackCatMultiplayer:'👥 Multiplayer'       → 'Multiplayer'
feedbackCatBug:        '🐛 Bug report'        → 'Bug report'
feedbackCatOther:      '💡 Other'             → 'Other'
feedbackThanks:        '🎉 Thank you!'        → 'Thank you!'
```

- [ ] **Step 2: Repeat for the other 6 locales** (`zh.js`, `zh-TW.js`, `ms.js`, `th.js`, `ja.js`, `ko.js`).

For each file, the **same 23 keys** carry the **same emoji prefix** (the translated text after it differs). Remove the identical leading emoji + space (and the embedded `✏️ ` in `editLogTapHint`). Leave `waitingProceed`'s `🅰️` in place. Open each file and confirm each listed key no longer starts with an emoji.

- [ ] **Step 3: Verify no pictographic emoji remain in locales**

Run (must print nothing):

```bash
LC_ALL=en_US.UTF-8 grep -rnP '[\x{26F3}\x{1F3CC}\x{1F3AF}\x{1F4A7}\x{2705}\x{274C}\x{23F3}\x{26A0}\x{1F6AB}\x{2B06}\x{270F}\x{1F4E4}\x{1F517}\x{1F4F7}\x{1F50D}\x{1F4E1}\x{1F465}\x{1F464}\x{1F4F1}\x{1F310}\x{1F441}\x{1F4CA}\x{1F4CB}\x{1F4AC}\x{1F4A1}\x{1F389}\x{1F947}\x{1F948}\x{1F949}\x{1F3C6}\x{1F4B0}\x{1F4B5}\x{1F3AE}\x{1F3E0}\x{1F50A}\x{1F507}\x{26A1}\x{1F41B}\x{2660}\x{1F4E8}]' src/locales/
```

Expected: empty output. (The marker glyphs `🅰️🅱️🅲` in `waitingProceed`/`win123` are intentionally still present — they are Part 2.)

- [ ] **Step 4: Smoke-test the app builds**

Run: `CI=true npx react-scripts test --watchAll=false 2>&1 | tail -5` (existing tests still pass) — or just confirm `npm start` compiles with no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/locales/
git commit -m "refactor(i18n): strip pictographic emoji prefixes from locale strings"
```

---

## Phase 2 — Replace inline JSX emoji + add call-site icons (one file = one task = one commit)

**Replacement procedure (apply to every file task below):**

1. Add the import at the top of the file (path per the table). If the file already imports from `'lucide-react'`, leave that import — it is handled in Part 3.
2. Make every edit listed for the file. The "Current" text is the exact substring to find; replace it with "Replacement".
3. Size/alignment tuning is allowed — the listed `size` values are starting points; adjust during the visual check.
4. **Verify no target emoji remain in the file** with the grep in the task's verify step.
5. **Visual check:** `BROWSER=none npm start` (if not already running), open the affected screen at mobile width, confirm icons render and are legible.
6. Commit with the listed message.

**Global do-not-touch (all files):** code comments, `console.log(...)` lines, `×` used as multiplication in `gameModes/*` comments, and the marker glyphs `① ② ③ ④ 🅰️ 🅱️ 🅲 Ⓒ–Ⓗ` (Part 2). `lucide-react` `<Component/>` icons are Part 3.

---

### Task 4: `src/sections/HomeSection.js`

**Import:** add `import Icon from '../components/Icon';`

| Line | Current | Replacement |
|------|---------|-------------|
| 18 | `{t('switchLang')}` | `<span className="inline-flex items-center gap-1"><Icon name="globe" size={14} />{t('switchLang')}</span>` |
| 34 | `<span className="mr-1.5">✓</span>` | `<Icon name="check" size={14} className="inline-block mr-1" />` |
| 96 | `{t('mpMultiplayer')}` | `<span className="inline-flex items-center gap-1"><Icon name="sync" size={12} />{t('mpMultiplayer')}</span>` |
| 138 | `📷` | `<Icon name="camera" size={18} />` |
| 168 | `{t('feedbackBtn')}` | `<Icon name="comment" size={16} />{t('feedbackBtn')}` *(button already `flex … gap-2`)* |

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{1F4F7}\x{2713}]' src/sections/HomeSection.js` prints nothing.
- [ ] Commit: `git commit -am "refactor(home): replace emoji with Icon component"`

---

### Task 5: `src/sections/GameSection.js`

**Import:** add `import Icon from '../components/Icon';`

| Line | Current | Replacement |
|------|---------|-------------|
| 169 | `{voiceEnabled ? '🔊' : '🔇'}` | `<Icon name={voiceEnabled ? 'sound-on' : 'sound-off'} size={18} />` |
| 333 | `✅ {t('allConfirmed')} ✓` | `<Icon name="check-circle" size={16} className="inline-block align-text-bottom" /> {t('allConfirmed')} <Icon name="check" size={14} className="inline-block align-text-bottom" />` |
| 340 | `{mp.confirmed[devId] ? '✓' : '...'}` | `{mp.confirmed[devId] ? <Icon name="check" size={12} className="inline-block" /> : '...'}` |
| 421 | `📡 {mp.gameCode}` | `<Icon name="sync" size={12} className="inline-block mr-1 align-text-bottom" />{mp.gameCode}` |
| 426 | `{mp.confirmed[devId] ? '✓' : '...'}` | `{mp.confirmed[devId] ? <Icon name="check" size={12} className="inline-block" /> : '...'}` |
| 485 | `{t('mpConfirmSubmit')}` | `<Icon name="share" size={16} className="inline-block mr-1 align-text-bottom" />{t('mpConfirmSubmit')}` |
| 496 | `✏️ {t('undoEdit')}` | `<Icon name="edit" size={14} className="inline-block mr-1 align-text-bottom" />{t('undoEdit')}` |
| 504 | `? (t('mpConfirmFinish'))` | `? (<><Icon name="check-circle" size={16} className="inline-block mr-1 align-text-bottom" />{t('mpConfirmFinish')}</>)` |
| 505 | `: (t('mpConfirmNext'))}` | `: (<><Icon name="check-circle" size={16} className="inline-block mr-1 align-text-bottom" />{t('mpConfirmNext')}</>)}` |
| 512 | `⏳ {t('waitingProceed')}` | `<Icon name="loading" size={14} className="inline-block mr-1 align-text-bottom" />{t('waitingProceed')}` |

*Note L512: `waitingProceed` still contains a `🅰️` marker glyph — that is intentional, handled in Part 2.*

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{1F50A}\x{1F507}\x{2705}\x{2713}\x{1F4E1}\x{270F}\x{23F3}]' src/sections/GameSection.js` prints nothing.
- [ ] Commit: `git commit -am "refactor(game): replace emoji with Icon component"`

---

### Task 6: `src/sections/ScorecardSection.js`

**Import:** add `import Icon from '../components/Icon';`

| Line | Current | Replacement |
|------|---------|-------------|
| 138 | `<span style={{ fontSize: 16 }}>⚠️</span>` | `<Icon name="alert" size={16} />` |
| 206 | `<span className="text-blue-600 font-bold mr-1">💧{w}</span>` | `<span className="text-blue-600 font-bold mr-1"><Icon name="water" size={13} className="inline-block align-text-bottom" />{w}</span>` |
| 207 | `<span className="text-red-600 font-bold">🚫{o}</span>` | `<span className="text-red-600 font-bold"><Icon name="ban" size={13} className="inline-block align-text-bottom" />{o}</span>` |
| 351 | `📤 {t('shareBtn')}` | `<Icon name="share" size={16} className="inline-block mr-1 align-text-bottom" />{t('shareBtn')}` |
| 363 | `📊 {t('shareRoundReport')}` | `<Icon name="chart" size={16} className="inline-block mr-1 align-text-bottom" />{t('shareRoundReport')}` |
| 366 | `💡 {t('clickNameToView')}` | `<Icon name="tip" size={14} className="inline-block mr-1 align-text-bottom" />{t('clickNameToView')}` |
| 577 | `📋 {t('editLogTitle')}` | `<Icon name="clipboard" size={16} className="inline-block mr-1 align-text-bottom" />{t('editLogTitle')}` |
| 310 | `}`}>{t('scorecardHorizontal')}</button>` | add before `{t('scorecardHorizontal')}`: `<Icon name="clipboard" size={14} className="inline-block mr-1 align-text-bottom" />` |
| 314 | `}`}>{t('scorecardVertical')}</button>` | add before `{t('scorecardVertical')}`: `<Icon name="chart" size={14} className="inline-block mr-1 align-text-bottom" />` |
| 589 | `{t('feedbackBtn')}` | `<Icon name="comment" size={16} className="inline-block mr-1 align-text-bottom" />{t('feedbackBtn')}` |

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{26A0}\x{1F4A7}\x{1F6AB}\x{1F4E4}\x{1F4CA}\x{1F4A1}\x{1F4CB}]' src/sections/ScorecardSection.js` prints nothing.
- [ ] Commit: `git commit -am "refactor(scorecard): replace emoji with Icon component"`

---

### Task 7: `src/sections/MultiplayerSections.js`

**Import:** add `import Icon from '../components/Icon';`

| Line | Current | Replacement |
|------|---------|-------------|
| 20 | `{mp.multiplayerRole === 'creator' ? t('mpWaitingPartner') : t('mpWaitingStart')}` | wrap each branch with a leading sync icon, e.g. `? <><Icon name="sync" size={14} className="inline-block mr-1 align-text-bottom" />{t('mpWaitingPartner')}</> : <><Icon name="sync" size={14} className="inline-block mr-1 align-text-bottom" />{t('mpWaitingStart')}</>` |
| 86 | `` `🏆 ${t('matchPlay')}` `` | `<><Icon name="trophy" size={16} className="inline-block mr-1 align-text-bottom" />{t('matchPlay')}</>` |
| 87 | `` `💵 ${t('win123')}` `` | `<><Icon name="cash" size={16} className="inline-block mr-1 align-text-bottom" />{t('win123')}</>` |
| 88 | `` `💰 ${t('skins')}` `` | `<><Icon name="money-bag" size={16} className="inline-block mr-1 align-text-bottom" />{t('skins')}</>` |
| 89 | `` `♠ ${t('baccarat')}` `` | `<><Icon name="suit-spade" size={16} className="inline-block mr-1 align-text-bottom" />{t('baccarat')}</>` |
| 170 | `<span className="text-lg">🎯</span>` | `<Icon name="target" size={20} />` |
| 181 | `<span className="text-lg">👁</span>` | `<Icon name="eye" size={20} />` |
| 192 | `💡 {t('mpNoPlayersYet')}` | `<Icon name="tip" size={14} className="inline-block mr-1 align-text-bottom" />{t('mpNoPlayersYet')}` |
| 222 | `{hasJoiners ? t('mpStartGame') : t('startSolo')}` | `{hasJoiners ? <><Icon name="golfer" size={16} className="inline-block mr-1 align-text-bottom" />{t('mpStartGame')}</> : t('startSolo')}` |
| 235 | `⏳ {t('mpWaitingCreator')}` | `<Icon name="loading" size={14} className="inline-block mr-1 align-text-bottom" />{t('mpWaitingCreator')}` |
| 340 | `🏠 {mp.gameCode}` | `<Icon name="home" size={16} className="inline-block mr-1 align-text-bottom" />{mp.gameCode}` |
| 350 | `<div className="text-3xl mb-2">🎯</div>` | `<div className="mb-2 flex justify-center"><Icon name="target" size={34} /></div>` |
| 359 | `✏️ <span>{t('mpPlayerTagInput')}</span>` | `<Icon name="edit" size={14} className="inline-block mr-1 align-text-bottom" /><span>{t('mpPlayerTagInput')}</span>` |
| 362 | `👤 <span>{t('mpPlayerTagClaim')}</span>` | `<Icon name="user" size={14} className="inline-block mr-1 align-text-bottom" /><span>{t('mpPlayerTagClaim')}</span>` |
| 381 | `<div className="text-3xl mb-2">👁</div>` | `<div className="mb-2 flex justify-center"><Icon name="eye" size={34} /></div>` |
| 390 | `👁 <span>{t('mpViewerTagLive')}</span>` | `<Icon name="eye" size={14} className="inline-block mr-1 align-text-bottom" /><span>{t('mpViewerTagLive')}</span>` |
| 393 | `✏️ <span>{t('mpViewerTagNoInput')}</span>` | `<Icon name="edit" size={14} className="inline-block mr-1 align-text-bottom" /><span>{t('mpViewerTagNoInput')}</span>` |

*Lines 86–89 are inside a ternary chain currently producing template-literal strings; converting them to JSX fragments is fine because the value is rendered as a React child. Verify the surrounding `{ … }` still returns one expression.*

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{1F3C6}\x{1F4B5}\x{1F4B0}\x{2660}\x{1F3AF}\x{1F441}\x{1F4A1}\x{23F3}\x{1F3E0}\x{270F}\x{1F464}]' src/sections/MultiplayerSections.js` prints nothing.
- [ ] Commit: `git commit -am "refactor(multiplayer): replace emoji with Icon component"`

---

### Task 8: `src/RoundReport.js`

**Import:** add `import Icon from './components/Icon';` (RoundReport lives in `src/`).

This file uses inline `style={{...}}` rather than Tailwind, so icons use `style` for alignment. The `⛳` flag appears 4× wrapped in `<span style={{ color: '#047857', marginRight: '6px' }}>` — replace each with the Icon (its color is baked, so drop the now-pointless color):

| Line | Current | Replacement |
|------|---------|-------------|
| 651, 827, 1116 | `<span style={{ color: '#047857', marginRight: '6px' }}>⛳</span>` | `<Icon name="flag" size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />` |
| 766 | `📊 {t('rrTitle')}` | `<Icon name="chart" size={18} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />{t('rrTitle')}` |
| 777 | `✕` (close button) | `<Icon name="x" size={18} />` |
| 795 | `{capturing ? '⏳' : '📷'} {t('rrShareImage')}` | `{capturing ? <Icon name="loading" size={16} style={{ verticalAlign: 'text-bottom' }} /> : <Icon name="camera" size={16} style={{ verticalAlign: 'text-bottom' }} />} {t('rrShareImage')}` |
| 808 | `🔗 {t('rrShareLink')}` | `<Icon name="link" size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />{t('rrShareLink')}` |
| 865 | `<span style={{ fontSize: forCapture ? 14 : 18 }}>📋</span>` | `<Icon name="clipboard" size={forCapture ? 14 : 18} />` |
| 949 | `<div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>` | `<div style={{ marginBottom: 12 }}><Icon name="celebrate" size={52} /></div>` |
| 960 | `<span style={{ fontSize: 18 }}>💬</span>` | `<Icon name="comment" size={18} />` |
| 971 | `{activeRating >= s ? '⭐' : '☆'}` | `<Icon name={activeRating >= s ? 'star' : 'star-outline'} size={26} />` |
| 1002 | `{submitting ? `⏳ ${t('feedbackSubmitting')}` : `📨 ${t('feedbackSubmit')}`}` | `{submitting ? <><Icon name="loading" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('feedbackSubmitting')}</> : <><Icon name="mail" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('feedbackSubmit')}</>}` |
| 1042 | `<div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>` | `<div style={{ marginBottom: '12px' }}><Icon name="x-circle" size={44} /></div>` |
| 1071 | `<div style={{ fontSize: '32px', marginBottom: '8px' }}>⛳</div>` | `<div style={{ marginBottom: '8px' }}><Icon name="flag" size={30} /></div>` |
| 1110 | `⛳ {t('rrOpenApp')}` | `<Icon name="flag" size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />{t('rrOpenApp')}` |

**`fmtVal` (lines 848–852)** returns `'✓'`/`'✗'` strings rendered in colored spans at 896/898. Change the up branch to return Icons (they are `currentColor`, so they inherit each span's red/green):

```jsx
// before
return v ? '✓' : '✗';
// after
return v ? <Icon name="check" size={13} /> : <Icon name="x" size={13} />;
```

**Arrow (line 897):**

| Line | Current | Replacement |
|------|---------|-------------|
| 897 | `<span style={{ color: '#d1d5db', fontSize: 11 }}>→</span>` | `<span style={{ color: '#d1d5db' }}><Icon name="arrow-right" size={12} /></span>` |

**Feedback categories (data-driven, lines 922–927 + render 980–988):** add an `icon` to each `CATS` entry and render it.

```jsx
// CATS array — add icon to each object:
const CATS = [
  { key: 'modes', label: t('feedbackCatNewModes'), icon: 'game' }, { key: 'ui', label: t('feedbackCatUI'), icon: 'device' },
  { key: 'speed', label: t('feedbackCatSpeed'), icon: 'bolt' }, { key: 'course', label: t('feedbackCatCourse'), icon: 'flag' },
  { key: 'scoring', label: t('feedbackCatScoring'), icon: 'chart' }, { key: 'mp', label: t('feedbackCatMultiplayer'), icon: 'users' },
  { key: 'bug', label: t('feedbackCatBug'), icon: 'bug' }, { key: 'other', label: t('feedbackCatOther'), icon: 'tip' },
];
```

```jsx
// render: destructure icon, and replace line 988's content
{CATS.map(({ key, label, icon }) => {
  ...
  }}>{active && <Icon name="check" size={14} style={{ color: '#059669' }} />}<Icon name={icon} size={16} style={{ marginRight: 2 }} />{label}</div>
```

*Do NOT add an icon to the `feedbackThanks` heading (line 950) — the large celebrate icon at line 949 already covers it.*

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{26F3}\x{1F4CA}\x{2715}\x{23F3}\x{1F4F7}\x{1F517}\x{1F4CB}\x{2713}\x{2717}\x{2192}\x{1F389}\x{1F4AC}\x{2B50}\x{2606}\x{1F4E8}\x{274C}]' src/RoundReport.js` prints nothing.
- [ ] Commit: `git commit -am "refactor(round-report): replace emoji with Icon component"`

---

### Task 9: `src/ViewerGameScreen.js`

**Import:** add `import Icon from './components/Icon';`

| Line | Current | Replacement |
|------|---------|-------------|
| 133 | `<div style={{ fontSize: 40, opacity: 0.5 }}>⛳</div>` | `<div style={{ opacity: 0.5 }}><Icon name="flag" size={38} /></div>` |
| 280 | `⏳ Now Playing Hole {holeNum}` | `<Icon name="loading" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />Now Playing Hole {holeNum}` |
| 297 | `🏌️ {hp.name}` | `<Icon name="golfer" size={16} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{hp.name}` |
| 464 | `` `⛳ ${t('live') || 'Live'}` `` | `<><Icon name="flag" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('live') || 'Live'}</>` |
| 465 | `` `📋 ${t('scorecard') || 'Card'}` `` | `<><Icon name="clipboard" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('scorecard') || 'Card'}</>` |
| 483 | `👁 VIEW ONLY` | `<Icon name="eye" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />VIEW ONLY` |
| 486 | `● LIVE` | `<Icon name="dot" size={10} style={{ marginRight: 4 }} />LIVE` |
| 501 | `✅ {t('hole') || 'Hole'} {lastCompletedHole}` | `<Icon name="check-circle" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('hole') || 'Hole'} {lastCompletedHole}` |
| 505 | `⏳ {t('hole') || 'Hole'} {holeNum}` | `<Icon name="loading" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('hole') || 'Hole'} {holeNum}` |
| 598 | `● {mp.syncStatus === 'connected' ? ...}` | `<Icon name="dot" size={8} style={{ marginRight: 4 }} />{mp.syncStatus === 'connected' ? ...}` |

*Lines 464/465 are array-of-tab-objects with `label:` template strings rendered as React children — JSX fragments are fine.*

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{26F3}\x{23F3}\x{1F3CC}\x{1F4CB}\x{1F441}\x{25CF}\x{2705}]' src/ViewerGameScreen.js` prints nothing.
- [ ] Commit: `git commit -am "refactor(viewer): replace emoji with Icon component"`

---

### Task 10: `src/IntegratedGolfGame.js` — `getMedal`

**Import:** add `import Icon from './components/Icon';`

`getMedal` (lines 2042–2046) returns an emoji string and is passed as a prop to several components. Make it return `<Icon>` JSX so every existing `{getMedal(rank)}` call site keeps working unchanged.

```jsx
// before
const getMedal = useCallback((rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  // ... keep the rest
// after
const getMedal = useCallback((rank) => {
  if (rank === 1) return <Icon name="medal-gold" size={20} />;
  if (rank === 2) return <Icon name="medal-silver" size={20} />;
  if (rank === 3) return <Icon name="medal-bronze" size={20} />;
  // ... keep the rest
```

**Do NOT touch** the `console.log("🔍 …")` / `console.log("✅ …")` debug lines (868–931) or the `★`/`→` characters in comments — they are not UI.

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{1F947}\x{1F948}\x{1F949}]' src/IntegratedGolfGame.js` prints nothing.
- [ ] Commit: `git commit -am "refactor(scoring): getMedal returns Icon instead of emoji"`

---

### Task 11: `src/components/PersonalReport.js`

**Import:** add `import Icon from './Icon';`

| Line | Current | Replacement |
|------|---------|-------------|
| 59 | `...text-lg">✕</button>` (close, on colored header) | `...text-lg"><Icon name="x" size={18} /></button>` |
| 124 | `🎯 {t('scoreDistribution')}` | `<Icon name="target" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('scoreDistribution')}` |
| 155 | `📊 {t('puttingAnalysis')}` | `<Icon name="chart" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('puttingAnalysis')}` |
| 172 | `⚠️ {t('threePutts')}: {threePutts}{t('holes')}` | `<Icon name="alert" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('threePutts')}: {threePutts}{t('holes')}` |
| 180 | `⬆️ UP{t('stats')}` | `<Icon name="arrow-up" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />UP{t('stats')}` |
| 195 | `{t('viewFullDetail')} →` | `{t('viewFullDetail')} <Icon name="arrow-right" size={16} style={{ verticalAlign: 'text-bottom' }} />` |
| 264 | `<span className="text-green-600 font-bold">✓</span>` | `<Icon name="check" size={14} className="text-green-600" />` |
| 281 | `...text-lg">←</button>` (back, on colored header) | `...text-lg"><Icon name="arrow-left" size={18} /></button>` |
| 283 | `👤 {player} {t('fullDetail')}` | `<Icon name="user" size={16} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{player} {t('fullDetail')}` |
| 287 | `...text-lg">✕</button>` (close, on colored header) | `...text-lg"><Icon name="x" size={18} /></button>` |

*Lines 59/281/287 sit on a colored header where text is white — `x`/`arrow-left` are `currentColor` tool icons, so they inherit white automatically. Line 283 `user` is expressive (baked green); during the visual check confirm it reads on the colored header.*

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{1F3AF}\x{1F4CA}\x{26A0}\x{2B06}\x{2192}\x{2713}\x{2190}\x{1F464}\x{2715}\x{FE0F}]' src/components/PersonalReport.js` prints nothing.
- [ ] Visual check: open a scorecard → tap a player name → PersonalReport card; then tap "view full detail". Confirm target/chart/alert/up icons in the stat headers, the green check in the win123 column, and that the `user` icon + back/close icons read clearly on the colored header.
- [ ] Commit: `git commit -am "refactor(personal-report): replace emoji with Icon component"`

---

### Task 12: `src/components/SharePage.js`

**Import:** add `import Icon from './Icon';`

| Line | Current | Replacement |
|------|---------|-------------|
| 172 | `<div className="logo-large"><span>⛳</span></div>` | `<div className="logo-large"><Icon name="flag" size={40} /></div>` |
| 192 | `<span className="text-green-600 text-lg">⛳</span>` | `<Icon name="flag" size={18} />` |
| 252 | `📋 {t('holeByHole')}` | `<Icon name="clipboard" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('holeByHole')}` |
| 309 | `🎯 {t('scoreDistribution')}` | `<Icon name="target" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('scoreDistribution')}` |
| 363 | `📊 {t('puttingAnalysis')}` | `<Icon name="chart" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('puttingAnalysis')}` |
| 379 | `⚠️ {t('threePutts')}: {threePutts}` | `<Icon name="alert" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('threePutts')}: {threePutts}` |
| 387 | `{t('viewFullDetail')} →` | `{t('viewFullDetail')} <Icon name="arrow-right" size={16} style={{ verticalAlign: 'text-bottom' }} />` |
| 424 | `...text-lg">←</button>` (back, on colored header) | `...text-lg"><Icon name="arrow-left" size={18} /></button>` |
| 453 | `<th ...>💧</th>` | `<th ...><Icon name="water" size={14} /></th>` |
| 489 | `<th ...>💧</th>` | `<th ...><Icon name="water" size={14} /></th>` |
| 528 | `<div className="text-gray-500 text-xs">💧</div>` | `<div className="text-gray-500 text-xs"><Icon name="water" size={13} /></div>` |
| 571 | `<div className="text-4xl mb-3">❌</div>` | `<div className="mb-3"><Icon name="x-circle" size={40} /></div>` |

*Line 172 is the fallback course logo (when no logo image) inside `.logo-large` — keep the wrapper div so existing CSS sizing/centering still applies. Line 424 back button is white text on a colored header → `arrow-left` currentColor inherits white.*

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{26F3}\x{1F4CB}\x{1F3AF}\x{1F4CA}\x{26A0}\x{2192}\x{2190}\x{1F4A7}\x{274C}\x{FE0F}]' src/components/SharePage.js` prints nothing.
- [ ] Visual check: open a `?p=` share URL (ShareReportPage) and a `?p=…` detail URL (ShareDetailPage). Confirm the flag logo/footer, the section-header icons, the water `💧` column headers, and the error `x-circle` (invalid-link state) render.
- [ ] Commit: `git commit -am "refactor(share-page): replace emoji with Icon component"`

---

### Task 13: `src/components/FeedbackDialog.js`

**Import:** add `import Icon from './Icon';`

**Category icons (important):** the 8 chips render `{t(key)}`, and those locale values **used to carry emoji prefixes** (🎮📱⚡👥🐛 …) that Task 3 strips. After Task 3 they'd be bare text and lose their marker. Restore a per-chip icon that matches the same categories in RoundReport (Task 8). Add this constant directly under `CATEGORY_KEYS` (top of the file, after line 6):

```jsx
const CATEGORY_ICONS = {
  feedbackCatNewModes: 'game', feedbackCatUI: 'device', feedbackCatSpeed: 'bolt', feedbackCatCourse: 'flag',
  feedbackCatScoring: 'chart', feedbackCatMultiplayer: 'users', feedbackCatBug: 'bug', feedbackCatOther: 'tip',
};
```

| Line | Current | Replacement |
|------|---------|-------------|
| 93 | `<div style={{ fontSize: 64, animation: 'fbPop 0.5s ease', marginBottom: 16 }}>🎉</div>` | `<div style={{ animation: 'fbPop 0.5s ease', marginBottom: 16 }}><Icon name="celebrate" size={64} /></div>` |
| 109 | `...margin: 0 }}>{t('feedbackTitle')}</h2>` | `...margin: 0 }}><Icon name="comment" size={18} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />{t('feedbackTitle')}</h2>` |
| 116 | `...color: '#6b7280', ...}}>✕</button>` (close) | `...color: '#6b7280', ...}}><Icon name="x" size={18} /></button>` |
| 123 | `⭐ {t('feedbackRateLabel')}` | `<Icon name="star" size={16} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('feedbackRateLabel')}` |
| 138 | `{activeRating >= star ? '⭐' : '☆'}` | `<Icon name={activeRating >= star ? 'star' : 'star-outline'} size={40} />` |
| 155 | `📋 {t('feedbackCatLabel')}` | `<Icon name="clipboard" size={16} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('feedbackCatLabel')}` |
| 174 | `{active && <span style={{ color: '#059669' }}>✓</span>}` | `{active && <Icon name="check" size={14} style={{ color: '#059669', flexShrink: 0 }} />}` |
| 175 | `{t(key)}` (the category chip label) | `<Icon name={CATEGORY_ICONS[key]} size={15} style={{ flexShrink: 0 }} />{t(key)}` |
| 213 | `{submitting ? '⏳ ' + t('feedbackSubmitting') : '📨 ' + t('feedbackSubmit')}` | `{submitting ? <><Icon name="loading" size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />{t('feedbackSubmitting')}</> : <><Icon name="mail" size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />{t('feedbackSubmit')}</>}` |

*Line 138: the `<span>` wrapper keeps the click/hover/scale handlers — only its text content changes to `<Icon>`; the wrapper's `fontSize: 42` no longer matters, `size={40}` drives the glyph. Lines 116/174 use `currentColor` tool icons (`x`, `check`) so the inline `color` styles them. Line 175: the chip is a flex row (`gap: 4` already on its container at line 170), so the category icon, the active check, and the text lay out left-to-right with spacing automatically.*

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{1F389}\x{2715}\x{2B50}\x{2606}\x{1F4CB}\x{2713}\x{23F3}\x{1F4E8}\x{FE0F}]' src/components/FeedbackDialog.js` prints nothing. (The category emoji 🎮📱⚡👥🐛⛳📊💡 live in the locale files and are removed by Task 3 — verified there, not here.)
- [ ] Visual check: trigger the feedback sheet. Confirm: the comment icon on the title, the star-prefix label + 5 tappable stars (filled gold vs. outline), the clipboard label, each of the 8 category chips shows its icon (game/device/bolt/flag/chart/users/bug/tip) plus a green check when selected, and the submit button. On the green submit button, confirm the `loading`/`mail` icons are legible against the gradient (if they wash out, note for Part 3 polish — do not block Part 1).
- [ ] Commit: `git commit -am "refactor(feedback-dialog): replace emoji with Icon component"`

---

### Task 14: `src/components/EditLogDialog.js`

**Import:** add `import Icon from './Icon';`
(This file also imports `CheckCircle, X` from `lucide-react` — **leave those** for Part 3.)

| Line | Current | Replacement |
|------|---------|-------------|
| 16 | `return v ? '✓' : '✗'; // Win123: true/false` | `return v ? <Icon name="check" size={14} /> : <Icon name="x" size={14} />; // Win123: true/false` |
| 38 | `📋 {filterHole ? t('editLogHoleTitle')... : t('editLogTitle')}` | `<Icon name="clipboard" size={16} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{filterHole ? t('editLogHoleTitle').replace('{n}', filterHole) : t('editLogTitle')}` |
| 49 | `{t('editLogEmpty')} ✅` | `{t('editLogEmpty')} <Icon name="check-circle" size={16} style={{ verticalAlign: 'text-bottom' }} />` |
| 78 | `<span className="text-gray-400 text-xs">→</span>` | `<span className="text-gray-400 text-xs"><Icon name="arrow-right" size={12} /></span>` |

*Line 16: `fmtVal` is rendered inside the from/to spans at lines 77 (`text-red-500 line-through`) and 79 (`text-green-600`). The `check`/`x` tool icons use `currentColor`, so they inherit red (old value) / green (new value) automatically. The `'UP①'` string in the line-15 comment is data/comment — do not touch.*

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{2713}\x{2717}\x{1F4CB}\x{2705}\x{2192}]' src/components/EditLogDialog.js` prints nothing.
- [ ] Visual check: open the edit-log dialog (tap the edit-history affordance) on a Win123 round. Confirm the clipboard title, the per-change `from → to` row shows check/x icons with the red/green colors and an arrow between them, and the empty-state check-circle.
- [ ] Commit: `git commit -am "refactor(edit-log): replace emoji with Icon component"`

---

### Task 15: `src/components/ConfirmDialogs.js`

**Import:** add `import Icon from './Icon';`

| Line | Current | Replacement |
|------|---------|-------------|
| 76 | `💡 {t('puttsTip')}` | `<Icon name="tip" size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />{t('puttsTip')}` |

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{1F4A1}]' src/components/ConfirmDialogs.js` prints nothing.
- [ ] Visual check: trigger the putts confirmation dialog (submit a hole that prompts the putts tip). Confirm the `tip` light-bulb icon prefixes the tip text.
- [ ] Commit: `git commit -am "refactor(confirm-dialogs): replace emoji with Icon component"`

---

### Task 16: `src/components/Toasts.js`

**Import:** add `import Icon from './Icon';`
(This file also imports `AlertCircle, CheckCircle, X` from `lucide-react` — **leave those** for Part 3.)

| Line | Current | Replacement |
|------|---------|-------------|
| 46 | `const fmtVal = (f, v) => (f === 'up' ? (v ? '✓' : '✗') : v);` | `const fmtVal = (f, v) => (f === 'up' ? (v ? <Icon name="check" size={13} /> : <Icon name="x" size={13} />) : v);` |
| 66 | `...fontSize: 16, flexShrink: 0,\n}}>⛳</div>` (green gradient chip) | `...fontSize: 16, flexShrink: 0,\n}}><Icon name="flag" size={18} /></div>` |
| 78 | `...fontSize: 18, ...padding: 4 }}>×</button>` (close) | `...fontSize: 18, ...padding: 4 }}><Icon name="x" size={16} /></button>` |
| 88 | `<span style={{ color: '#666', fontSize: 11 }}>→</span>` | `<span style={{ color: '#666', fontSize: 11 }}><Icon name="arrow-right" size={11} /></span>` |

*Line 46: `fmtVal` renders inside the from/to spans at lines 87 (`color: '#ef4444'`, line-through) and 89 (`color: '#4ade80'`). `check`/`x` tool icons inherit those colors via `currentColor`. Line 78 uses `×` (U+00D7 multiplication sign) as a close glyph with `color: '#888'` → the `x` tool icon inherits gray. Line 66 chip has a dark-green gradient background; verify the `flag` icon's lighter pennant reads against it.*

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '[\x{2713}\x{2717}\x{26F3}\x{00D7}\x{2192}]' src/components/Toasts.js` prints nothing.
- [ ] Visual check: trigger a success Toast (e.g., copy-link) and an EditToast (edit a hole on another device, or simulate). Confirm the green flag chip, the per-change `from → to` icons, the `×` close icon, and the arrow separator.
- [ ] Commit: `git commit -am "refactor(toasts): replace emoji with Icon component"`

---

### Task 17: `src/gameModes/BaccaratComponents.jsx`

**Import:** add `import Icon from '../components/Icon';`

This file renders the baccarat matchup grid (imported by `GameSection.js` as `BaccaratMatchupGrid`). One `→` arrow separates each matchup from its result line.

| Line | Current | Replacement |
|------|---------|-------------|
| 129 | `{m.s1} vs {m.s2} → {` | `{m.s1} vs {m.s2} <Icon name="arrow-right" size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {` |

*The surrounding `<div className={resultClass}>` sets the text color; `arrow-right` is a `currentColor` tool icon, so it matches automatically. The `upSymbols[...]` UP-position markers (`①②③④`) in this file are Part 2 — leave them.*

- [ ] Verify: `LC_ALL=en_US.UTF-8 grep -nP '\x{2192}' src/gameModes/BaccaratComponents.jsx` prints nothing.
- [ ] Visual check: start a baccarat-mode game and enter scores so the matchup grid shows results; confirm the arrow renders between "A vs B" and the result text, in the correct color.
- [ ] Commit: `git commit -am "refactor(baccarat): replace arrow emoji with Icon component"`

---

## Phase 3 — Part 1 closeout & verification

### Task 18: Repo-wide sweep, lint, and smoke test

**Files:** none created; this task only verifies the whole of Part 1 landed cleanly.

- [ ] **Step 1: Sweep for any leftover Part 1 pictographic emoji across `src/`**

Run:
```bash
LC_ALL=en_US.UTF-8 grep -rnP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}]' src/ \
  | grep -vE '//|console\.(log|warn|error)'
```

Expected remaining matches are **only** the things deferred to Part 2 / out of scope — anything else must be fixed before closing Part 1:

- **Part 2 marker glyphs** (still present on purpose): `①②③④` and the `🅰️` in `waitingProceed` across the 7 locale files; circled letters `Ⓒ–Ⓗ`; `★`/`☆` only where used as plain rating text not already converted.
- **Poker suits** `♥♦♣` if they exist beyond `♠` — these are addressed in their own task set; note them but do not change here.

If the sweep shows a *pictographic* emoji on a real JSX/render line (not a comment, not `console.*`, not a Part 2 marker), it was missed — go back to the owning file's task and fix it.

- [ ] **Step 2: Confirm the tool-symbol glyphs are gone from render code**

Run:
```bash
LC_ALL=en_US.UTF-8 grep -rnP '[\x{2190}-\x{2199}]|[\x{2713}\x{2717}\x{2705}\x{274C}\x{2B50}\x{2606}]' src/ \
  | grep -vE '//|console\.(log|warn|error)|registry\.js'
```
Expected: no matches outside `registry.js`. (Arrows `←→↑`, check/x `✓✗`, `✅❌`, stars `⭐☆` should all now be `<Icon>`.) The `×` (U+00D7) close glyph: `grep -rnP '\x{00D7}' src/ | grep -vE '//|console'` should return nothing in JSX (only multiplication in comments, if any).

- [ ] **Step 3: Lint — no new warnings**

Run: `npx eslint src/ 2>&1 | tail -20`
Expected: no **new** errors/warnings introduced by these changes (pre-existing ones, if any, are unchanged). In particular, confirm no "`Icon` is not defined" (missing import) and no unused-import warnings for files where every emoji was removed.

- [ ] **Step 4: Build sanity (optional but recommended)**

Run: `CI=true npx react-scripts build`
Expected: build succeeds. This catches any JSX typo (e.g., an unclosed `<Icon>` or a stray fragment) that lint might miss.

- [ ] **Step 5: Dev-server smoke test (mobile-width viewport)**

Run: `npm start`, then in the browser device toolbar at ~390px width, walk the golden path and confirm icons render (no broken glyphs, no empty boxes, no console `<Icon> unknown name` warnings):

1. **Home** → language globe, multiplayer sync icon, screenshot camera, feedback comment.
2. **Course** search → magnifier; **Players** setup.
3. **Game** → submit/edit/check flow, sound on/off toggle, sync badge, putts tip dialog.
4. **Scorecard** → water/ban markers, share/chart/clipboard/tip, medals; tap a player → **PersonalReport** (target/chart/alert/up, user header, back/close) → view full detail.
5. **RoundReport** → flag headers, celebrate, star rating, feedback categories (game/device/bolt/flag/chart/users/bug/tip), share/link/clipboard.
6. **Multiplayer** lobby/role/claim → trophy/cash/money-bag, target, eye, home, user, golfer start; **ViewerGameScreen** → live flag, golfer, online dot.
7. **Toasts / EditLog** → flag chip, from→to check/x, arrow, close `×`.

Note any icon that is illegible at its in-context size or washes out on a colored background (the known watch-spots: `flag` on the dark-green Toast chip, `user` on PersonalReport's colored header, `loading`/`mail` on the green feedback-submit button). Legibility fixes are allowed here (bump size, or swap an over-detailed glyph) but **no geometry redesign** — that stays within the approved catalog.

- [ ] **Step 6: Commit any smoke-test tweaks**

```bash
git commit -am "fix(icons): legibility tweaks from Part 1 smoke test"
```
(Skip if Step 5 produced no changes.)

---

## Done = Part 1 complete

At this point: `<Icon>`, `<Badge>`, the registry, and the star/dot variants exist; every **pictographic and prefix** emoji in the UI renders as a custom color SVG; the app builds and the golden path is visually verified. Numeric/letter **markers** (`①②③④ / 🅰️🅱️🅲 / Ⓒ–Ⓗ`) and the `lucide-react` migration are intentionally still pending — they are **Part 2** and **Part 3** respectively, each with its own plan.
