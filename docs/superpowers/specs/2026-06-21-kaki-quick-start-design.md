# Kaki — Saved Player Groups (Quick Start)

**Date:** 2026-06-21
**Status:** Approved in discussion; pending written-spec review

## Problem / Motivation

Players re-type the same player names in Player Setup every round. For regular
groups this is tedious. Provide a one-tap way to reuse a recent group ("Kaki")
straight from the home page.

## Terminology

A **Kaki** = a saved group of player names the user has played with. ("Kaki" is
Malay / Malaysian-English for a regular companion/buddy.) Shown on the home page
for quick re-selection.

## Naming / i18n

New heading key `kaki` per locale:

| Locale | Heading |
|--------|---------|
| en | Kaki |
| zh | 球友 |
| zh-TW | 球友 |
| ms | Kaki Golf |
| th | ก๊วนกอล์ฟ |
| ja | ゴルフ仲間 |
| ko | 골프 친구 |

Also add a `kakiDeleteConfirm` key per locale for the delete-confirmation prompt
(the dialog's buttons reuse the existing `cancel` / `yes` keys). E.g. en:
"Delete this Kaki?", zh: "确定删除这组球友吗?".

## Behavior

1. **Save (automatic).** On **Start Game**, after existing validation passes
   (≥2 players, unique names), the active group of names is saved as a Kaki.
   - Most-recent first; maximum 5 stored.
   - Dedup: the same set of names (order-independent, case-sensitive) bumps the
     existing entry to the top instead of creating a duplicate.
   - When a 6th distinct group is saved, the oldest entry drops off.
2. **Display.** The home page shows a **Kaki** section *above the
   multiplayer/join area* (between the Create button and the join block). It
   lists up to 5 groups, each rendered as its names
   joined by " · ". The whole section is hidden when no Kaki are saved.
3. **Apply (tap).** Tapping a Kaki pre-fills its names and navigates to Course
   selection; Player Setup then shows the names already filled in. **HCP fields
   are left blank** (names only).
4. **Delete (with confirmation).** Each row has an **✕** button; tapping it
   opens a confirmation dialog showing the group's names, and the Kaki is
   removed only when the user taps Yes. This guards against accidental deletes
   (e.g. by older users). ✕ uses `stopPropagation` so it does not also trigger
   Apply.

## Data model — `src/utils/kakiStorage.js` (new)

- localStorage key: `handincap_kaki` (matches existing `handincap_*` convention)
- Shape: `Array<{ id: string, names: string[] }>`, most-recent first, max length 5
- `id`: `` `${Date.now()}-${Math.random().toString(36).slice(2,7)}` ``
- Pure functions (only side effect is the localStorage write):
  - `loadKaki(): Entry[]` — parse the key; return `[]` on missing/invalid JSON.
  - `saveKaki(names: string[]): Entry[]` — drop existing entry whose sorted names
    equal the incoming sorted names, unshift the new entry, cap to 5, persist,
    return the new array.
  - `deleteKaki(id: string, list: Entry[]): Entry[]` — filter out `id`, persist,
    return the new array.

## Integration — `src/IntegratedGolfGame.js`

- `const [kakiList, setKakiList] = useState(loadKaki);`
- In `startGame`, after **all** validation passes (≥2 players, unique names,
  and the per-mode stake checks), just before `mp.createGame(...)` (~line 1177–
  1189): `setKakiList(saveKaki(activePlayers));` — so a group is only saved when
  the game actually proceeds, not when it aborts on a missing stake.
- New `applyKaki(names)` callback:
  - `const jumbo = names.length > 4;`
  - `setJumboMode(jumbo);`
  - `setPlayerNames(padded)` where `padded` is `names` sliced/padded with `''`
    to `jumbo ? 8 : 4` slots.
  - `setPlayerHandicaps({});` — guarantees blank HCP.
  - `setSearchQuery(''); setSelectedCourse(null); setCourseApplied(false);`
    (mirrors the Create button's resets)
  - `setCurrentSection('course');`
- New `removeKaki(id)` callback: instead of deleting directly, it opens a
  confirmation via the existing `showConfirm(message, action)` helper
  (`IntegratedGolfGame.js:854`). The message is the localized prompt
  (`t('kakiDeleteConfirm')`) plus the group's names; the action is
  `() => setKakiList(deleteKaki(id, kakiList))`. This reuses the generic
  `ConfirmDialog` already mounted in `GlobalDialogs` (Cancel / Yes) — no new
  dialog component or state is required.
- Pass `kakiList`, `applyKaki`, `removeKaki` down to `HomeContent`.

## Home UI — `src/sections/HomeSection.js`

- Placed inside the home column, **before** the multiplayer/join block (i.e.,
  directly under the Create button).
- Rendered only when `kakiList.length > 0`:
  - Heading: `{t('kaki')}`
  - For each entry: a tappable row (`onClick` → `applyKaki(entry.names)`)
    showing `entry.names.join(' · ')`, with a right-aligned ✕ button
    (`onClick` `stopPropagation` → `removeKaki(entry.id)`).
- Styling consistent with existing home controls (rounded, subtle
  border/background).

## Edge cases

- Names are pre-validated unique by `startGame`, so saved groups never contain
  duplicates.
- Applying a group with >4 names switches to Jumbo (8 slots); ≤4 uses the
  standard 4 slots.
- Stale HCP from a previous game is cleared on apply (blank HCP is honored).
- Corrupt/missing localStorage → `loadKaki` returns `[]` and the section is
  hidden.

## Layout caveat

Home content is vertically centered (`justify-center`) with an absolute-
positioned footer. The extra Kaki rows increase the column height and may crowd
the footer on short screens. Relax the forced centering or allow the inner
column to scroll, and verify at phone-sized viewport.

## Testing

- Unit tests for `kakiStorage.js`: dedup bumps an existing entry, cap at 5 drops
  the oldest, delete by id, `loadKaki` returns `[]` on bad/missing data.
- Manual browser verification: group saved on Start Game; section appears below
  the join area; tap pre-fills names and jumps to Course; >4 names → Jumbo; ✕
  opens a confirm dialog and only deletes on Yes (Cancel keeps the row); HCP
  stays blank after apply.

## Out of scope (non-goals)

- Saving/restoring handicaps (explicitly names-only).
- Saving game mode / stake / course alongside the group.
- Renaming or manually labeling a Kaki.
- Syncing Kaki across devices or through multiplayer.
