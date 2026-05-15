const KEY = 'hardwood-dynasty-v0_1';

/** Save entire league state to localStorage. */
export function saveLeague(league) {
  globalThis.localStorage.setItem(KEY, JSON.stringify(league));
}

/** Load league state from localStorage (or null). */
export function loadLeague() {
  const raw = globalThis.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Remove local save data. */
export function clearLeague() {
  globalThis.localStorage.removeItem(KEY);
}
