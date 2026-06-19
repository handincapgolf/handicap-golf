# Emoji → Custom Color SVG Redesign

- **Date:** 2026-06-19
- **Status:** Approved (design); ready for implementation planning
- **Project:** HandinCap golf scoring PWA

## 1. Problem & Motivation

The UI uses ~60 system emojis (⛳ 📡 🎉 📊 🏌️ 💰 …). System emojis render
differently on every device/OS, look inconsistent with the app's brand, and
several read as "ugly" at small sizes. We will replace **all** of them with a
single, coherent set of custom SVG icons in one visual style, so the app looks
identical and on-brand on every device.

Scope confirmed with user: **all** emoji groups (全部), not a subset.

## 2. Goals / Non-Goals

**Goals**
- Replace every emoji in the UI with a custom SVG icon (or a CSS badge for
  numeric/letter markers).
- One coherent visual style across the whole app.
- Pixel-identical rendering on all devices.
- For full coherence, restyle the existing `lucide-react` line icons into the
  same custom set, then drop the `lucide-react` dependency.

**Non-Goals**
- No redesign of layouts, flows, or copy — icons only.
- No new features.
- No change to the share-URL encoding, game logic, or backend.

## 3. Visual Language (approved)

Style **C · Color**: solid fills, brand green as the base, semantic accent
colors per meaning (gold trophy, blue water hazard, multi-color confetti).
Validated with the user via the visual companion (`icon-catalog.html`).

**Brand palette** (derived from existing code):

| Role | Colors |
|------|--------|
| Green (primary) | `#16a34a` `#15803d` `#166534` `#059669` |
| Green (light) | `#86efac` `#bbf7d0` `#dcfce7` |
| Gold / amber | `#f59e0b` `#d97706` `#b45309` `#fbbf24` `#fcd34d` |
| Blue | `#3b82f6` `#1d4ed8` `#dbeafe` |
| Red | `#ef4444` `#dc2626` |
| Slate | `#64748b` `#94a3b8` `#cbd5e1` `#334155` |

### Coloring rule (two classes of icon)

- **Expressive icons** — golf, rewards, celebration, reports, status
  (success/warning/error): **baked-in semantic colors**.
- **Tool / UI icons** — arrows, back, close ✕, edit, share, search, chevrons:
  drawn with **`currentColor`** so they inherit the surrounding text color
  (dark on white backgrounds, white inside colored buttons). Same geometry as
  the expressive set, just color-adaptive — avoids "green-on-green" inside the
  app's many colored buttons.

## 4. Architecture

### 4.1 `<Icon>` component + registry (single source of truth)

New file `src/components/Icon.js`:

```jsx
<Icon name="flag" size={20} className="..." />   // ⛳
<Icon name="trophy" size={24} />                 // 🏆
```

- Internal registry: `name → SVG markup` (~35 icons in one file for easy search
  and global edits).
- Props: `name` (required), `size` (number, default ~20), `className`,
  optional `title` for a11y.
- Expressive icons carry their own fills; tool icons use `currentColor`.
- Changing line-weight/color in one place updates the whole app.

### 4.2 `<Badge>` component (numeric / letter markers)

New file `src/components/Badge.js`. Renders a colored CSS circle or square with
a number/letter inside — **not** a pictographic SVG. Used for:

- Player numbers ① ② ③ ④ → colored circles.
- Device letters Ⓒ Ⓓ Ⓔ Ⓕ Ⓖ Ⓗ → outlined circles.
- Team markers 🅰️ 🅱️ 🅲 → colored rounded squares.

Sharper than hand-drawn SVG and scales to any size.

### 4.3 Star rating

⭐ / ★ / ☆ → `<Icon name="star" filled />` and `<Icon name="star" />`
(filled vs. outline variant).

### 4.4 Online dot

● (online indicator) → small CSS dot, not an icon.

## 5. Emoji → Icon mapping

### Group 1 · Golf & scoring
| Emoji | Icon `name` | Notes |
|-------|-------------|-------|
| ⛳ | `flag` | green flag on pole, light-green green |
| 🏌️ | `golfer` | swinging player |
| 🎯 | `target` | concentric rings |
| 💧 | `water` | blue droplet (water hazard) |

### Group 2 · Status & feedback
| Emoji | Icon `name` | Notes |
|-------|-------------|-------|
| ✅ | `check-circle` | green filled circle + check |
| ✓ | `check` | tool icon, currentColor |
| ✗ ✕ | `x` | tool icon, currentColor (close / wrong) |
| ❌ | `x-circle` | red filled circle + x |
| ⏳ | `loading` | hourglass / spinner |
| ⚠️ | `alert` | amber triangle |
| 🚫 | `ban` | red prohibition circle |

### Group 3 · Navigation & actions
| Emoji | Icon `name` | Notes |
|-------|-------------|-------|
| → | `arrow-right` | tool icon |
| ← | `arrow-left` | tool icon |
| ⬆️ | `arrow-up` | tool icon |
| ✏️ | `edit` | pencil, tool icon |
| 📤 | `share` | share/upload |
| 🔗 | `link` | chain link |
| 📷 | `camera` | screenshot |
| 🔍 | `search` | magnifier, tool icon |

### Group 4 · Multiplayer & connection
| Emoji | Icon `name` | Notes |
|-------|-------------|-------|
| 📡 | `sync` | broadcast / sync waves |
| 👥 | `users` | two people |
| 👤 | `user` | single person |
| 📱 | `device` | phone |
| 🌐 | `globe` | language |
| 👁 | `eye` | viewer/spectate |
| ● | — | CSS online dot (§4.4) |

### Group 5 · Reports & data
| Emoji | Icon `name` | Notes |
|-------|-------------|-------|
| 📊 | `chart` | bar chart |
| 📋 | `clipboard` | scoreboard |
| 💬 | `comment` | speech bubble |
| 💡 | `tip` | light bulb |

### Group 6 · Player / group markers → `<Badge>`
| Emoji | Handling |
|-------|----------|
| ① ② ③ ④ | `<Badge>` colored circle, number |
| Ⓒ Ⓓ Ⓔ Ⓕ Ⓖ Ⓗ | `<Badge>` outlined circle, letter |
| 🅰️ 🅱️ 🅲 | `<Badge>` rounded square, letter |
| ⭐ ★ ☆ | `<Icon name="star" [filled]>` (§4.3) |

### Group 7 · Rewards / celebration / money
| Emoji | Icon `name` | Notes |
|-------|-------------|-------|
| 🎉 | `celebrate` | multi-color confetti |
| 🥇 | `medal-gold` | gold medal |
| 🥈 | `medal-silver` | silver medal |
| 🥉 | `medal-bronze` | bronze medal |
| 🏆 | `trophy` | gold trophy |
| 💰 | `money-bag` | stake |
| 💵 | `cash` | bill |

### Group 8 · Other / system
| Emoji | Icon `name` | Notes |
|-------|-------------|-------|
| 🎮 | `game` | controller |
| 🏠 | `home` | house |
| 🔊 | `sound-on` | speaker + waves |
| 🔇 | `sound-off` | speaker muted |
| ⚡ | `bolt` | fast |
| 🐛 | `bug` | bug report |
| ♠ ♥ ♦ ♣ | `suit-spade` … | poker suits (baccarat); black/red per suit |
| 📨 | `mail` | feedback letter |

> The exact SVG geometry for each name is finalized during implementation; the
> approved `icon-catalog.html` preview is the visual reference.

## 6. Replacement strategy (~60 sites)

| Source | Current form | Approach |
|--------|--------------|----------|
| 7 locale files (en, zh, zh-TW, ms, th, ja, ko) — emoji used as a **prefix** inside translation strings | `switchLang: '🌐 Language'` | Strip the emoji prefix from the string in **all 7** locales; render `<Icon>` + text at the call site |
| Inline JSX emoji in components | `<span>🎯</span>`, `{capturing ? '⏳' : '📷'}` | Replace directly with `<Icon>` |
| Existing `lucide-react` line icons | `<Users/>`, `<Trophy/>`, … | Replace with our color equivalents, then **remove the `lucide-react` dependency** |

Known emoji-bearing files (from inventory): `src/locales/*.js`,
`src/sections/MultiplayerSections.js`, `src/RoundReport.js`, plus lucide imports
across `HomeSection`, `PlayersSection`, `GameSection`, `ScorecardSection`,
`CourseSection`, `HoleDialogs`, `Toasts`, `EditLogDialog`, `ConfirmDialogs`,
`gameModes`.

## 7. Phased rollout

Each phase is independently viewable in the browser, so we verify as we go.

0. **Foundation** — build `<Icon>` + registry, `<Badge>`, star variant, online dot.
1. **Home / Course / Players** sections.
2. **Game / Scorecard / Hole dialogs**.
3. **Multiplayer** (lobby / role / claim) + viewer screen.
4. **RoundReport / PersonalReport / SharePage / Feedback**.
5. **Toasts & dialogs & misc** → remove `lucide-react` → global sweep for any
   stragglers and unused imports.

## 8. Verification

- After each phase, run the dev server and visually check the affected screens
  (golden path + a couple of edge cases) on a mobile-width viewport.
- Confirm no remaining raw emoji in the touched files (`grep` sweep).
- Confirm `lucide-react` fully removed after phase 5 (no imports, dependency
  dropped from `package.json`).
- Existing ESLint must not gain new warnings from the changes.

## 9. Risks / open questions

- **Icon legibility at small sizes** — colored solid icons can muddy below
  ~16px; verify the smallest in-context usages and simplify geometry if needed.
- **currentColor coverage** — make sure every tool icon used inside a colored
  button actually inherits the right color (no hard-coded fill leaking through).
- **Poker suits** — confirm all four suits (♠♥♦♣) are used in baccarat mode and
  need icons, vs. only ♠ surfaced in the inventory.
- **Locale prefix spacing** — after stripping `'🌐 '` prefixes, ensure the
  call-site layout adds correct spacing between icon and text.
