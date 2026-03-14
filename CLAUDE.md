# HandinCap - Golf Scoring PWA

## Tech Stack
- React 19 + CRA, TailwindCSS (CDN), lucide-react icons
- Backend: Cloudflare Workers + Durable Objects (`handincap-worker/worker.js`)
- No Redux/Context — pure useState hooks, props drilling
- Build: `npx react-scripts build` → `build/`

## Architecture
- **Routing**: `currentSection` state in IntegratedGolfGame.js switches views:
  `home → course → players → game → scorecard` + `mp-lobby / mp-role / mp-claim`
- **State**: 100+ useState in IntegratedGolfGame.js, auto-saved to localStorage
- **Multiplayer**: `useMultiplayerSync.js` — polling every 3s, API at `/api`
- **All sections/components use `React.memo()`**

## Key Files
| File | Purpose |
|------|---------|
| `src/IntegratedGolfGame.js` | Main component, all game state & routing (~2400 lines) |
| `src/useMultiplayerSync.js` | Multiplayer hook: devices, claimed, polling, API calls |
| `src/RoundReport.js` | Round report encoding/sharing, FeedbackInline component |
| `src/ViewerGameScreen.js` | Read-only game view for viewer role |

## Sections (`src/sections/`)
| File | Section | Purpose |
|------|---------|---------|
| HomeSection.js | `home` | Landing page, room code input, QR scanner |
| CourseSection.js | `course` | Course search/selection, par setup |
| PlayersSection.js | `players` | Player names, handicaps, game mode, stake |
| GameSection.js | `game` | Score input per hole |
| ScorecardSection.js | `scorecard` | Final scorecard display |
| MultiplayerSections.js | `mp-*` | MpLobbySection, MpRoleSection, MpClaimSection |
| GlobalDialogs.js | — | All dialog state management |

## Components (`src/components/`)
- `SharePage.js` — Share pages for `?p=` URL (ShareReportPage + ShareDetailPage)
- `HoleDialogs.js` — Score confirm, hole select, edit hole dialogs
- `AdvanceReport.js` / `AdvancedPlayerCard.js` — Advance mode UI
- `FeedbackDialog.js` — Feedback collection → Cloudflare KV
- `ConfirmDialogs.js`, `EditLogDialog.js`, `Toasts.js`, `PWAInstallPrompt.js`

## Game Modes (`src/gameModes/`)
Each exports `config` + `calculate()`: matchPlay, win123, skins, baccarat

## Data & i18n
- `src/data/courses/` — Malaysian golf courses by state (selangor.js, johor.js, etc.)
- `src/locales/` — en, zh, zh-TW, ms, th, ja, ko
- `src/utils/shareEncoder.js` — Binary bit-packing for compact share URLs
- `src/styles/gameStyles.js` — PGA-style score display (eagle/birdie/par/bogey)

## Multiplayer Flow
1. Creator: `createGame()` → lobby (show code + QR)
2. Joiner: `joinGame(code)` → role select → claim players → lobby
3. Creator starts → all devices switch to `game` section
4. Server auto-claims all players to creator on room creation (`worker.js`)

## Backend (`handincap-worker/worker.js`)
- Durable Object: GameRoom (per-game persistent state)
- Endpoints: `/init`, `/state`, `/join`, `/claim`, `/start`, `/score`, `/next`, `/edit`
- Device tracking: each device gets unique `deviceId` (localStorage)

## Conventions
- Components wrapped in `memo()`, state setters passed as props
- API calls via `apiCall(path, method, body)` helper in useMultiplayerSync
- localStorage keys: `handincap_mp`, `handincap_device_id`, `handincap_lang`, `golfGameState`
- Share URLs: `?p=` (player score), `?r=` (round report)
