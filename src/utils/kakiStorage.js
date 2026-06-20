const KEY = 'handincap_kaki';
const MAX = 5;

export function loadKaki() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) => e && typeof e.id === 'string' && Array.isArray(e.names)
    );
  } catch {
    return [];
  }
}

function persist(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

// order-independent, case-sensitive identity for a group of names
function groupKey(names) {
  return [...names].sort().join(' ');
}

export function saveKaki(names) {
  const key = groupKey(names);
  const withoutDup = loadKaki().filter((e) => groupKey(e.names) !== key);
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    names: [...names],
  };
  const next = [entry, ...withoutDup].slice(0, MAX);
  persist(next);
  return next;
}

export function deleteKaki(id, list) {
  const next = list.filter((e) => e.id !== id);
  persist(next);
  return next;
}
