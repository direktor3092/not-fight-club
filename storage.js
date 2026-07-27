import { state, initState } from './state.js';

const STORAGE_KEY = 'not-fight-club-state';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      initState(saved);
      return true;
    }
  } catch (e) {
    console.warn('Не удалось загрузить состояние', e);
  }
  initState(null);
  return false;
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Не удалось сохранить состояние', e);
  }
}