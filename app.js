import { loadState, saveState } from './storage.js';
import { state, updatePlayer, startBattle, initState } from './state.js';
import { renderHome, renderCharacter, renderSettings, renderBattle, renderRegistration } from './ui.js';

const soundMenu = document.getElementById('sound-menu');
const soundBattle = document.getElementById('sound-battle');
const soundHit = document.getElementById('sound-hit');
const soundEnd = document.getElementById('sound-end');

let isMenuMusicPlaying = false;

export function playMenuMusic() {
  if (isMenuMusicPlaying) return;
  soundBattle.pause();
  soundMenu.currentTime = 0;
  soundMenu.play().catch(() => {});
  isMenuMusicPlaying = true;
}

export function stopMenuMusic() {
  soundMenu.pause();
  isMenuMusicPlaying = false;
}

export function playBattleMusic() {
  stopMenuMusic();
  soundBattle.currentTime = 0;
  soundBattle.play().catch(() => {});
}

export function playHitSound() {
  soundHit.currentTime = 0;
  soundHit.play().catch(() => {});
}

export function playEndSound() {
  soundBattle.pause();
  soundEnd.currentTime = 0;
  soundEnd.play().catch(() => {});
}

function preloadImages() {
  const avatars = [
    'assets/avatars/default.png',
    'assets/avatars/avatar1.png',
    'assets/avatars/avatar2.png',
    'assets/avatars/child.png',
    'assets/avatars/hawking.png',
    'assets/avatars/grandma.png',
  ];
  avatars.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

function preloadAudio() {
  const sounds = [soundMenu, soundBattle, soundHit, soundEnd];
  sounds.forEach(audio => {
    if (audio) {
      audio.load();
    }
  });
}

const nav = document.getElementById('main-nav');
const navButtons = nav.querySelectorAll('button');
const pages = {
  registration: document.getElementById('page-registration'),
  home: document.getElementById('page-home'),
  character: document.getElementById('page-character'),
  settings: document.getElementById('page-settings'),
  battle: document.getElementById('page-battle'),
};

let currentPage = 'registration';

export function navigateTo(pageId) {
  if (pageId === 'registration') {
    nav.style.display = 'none';
  } else {
    nav.style.display = 'flex';
  }

  Object.values(pages).forEach(p => p.classList.remove('active'));
  if (pages[pageId]) pages[pageId].classList.add('active');

  navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });

  currentPage = pageId;

  if (pageId === 'battle') {
    playBattleMusic();
  } else {
    playMenuMusic();
  }

  switch (pageId) {
    case 'home': renderHome(); break;
    case 'character': renderCharacter(); break;
    case 'settings': renderSettings(); break;
    case 'battle': renderBattle(); break;
    case 'registration': renderRegistration(); break;
  }
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    if (!page) return;
    if (page === 'battle' && !state.isBattleActive) return;
    navigateTo(page);
  });
});

document.getElementById('register-btn').addEventListener('click', () => {
  const input = document.getElementById('player-name-input');
  const name = input.value.trim() || 'Боец';
  updatePlayer({ name });
  saveState();
  navigateTo('character');
});

document.getElementById('settings-save-btn').addEventListener('click', () => {
  const input = document.getElementById('settings-name-input');
  const name = input.value.trim() || 'Боец';
  updatePlayer({ name });
  saveState();
  renderHome();
  renderCharacter();
  renderSettings();
});

document.getElementById('start-battle-btn').addEventListener('click', () => {
  const opponent = startBattle();
  saveState();
  document.getElementById('nav-battle').style.display = 'inline-block';
  navigateTo('battle');
});

document.getElementById('reset-progress-btn')?.addEventListener('click', () => {
  if (confirm('Вы уверены? Весь прогресс будет удалён безвозвратно.')) {
    localStorage.removeItem('not-fight-club-state');
    initState(null);
    location.reload();
  }
});

document.getElementById('character-done-btn')?.addEventListener('click', () => {
  navigateTo('home');
});

const rulesBtn = document.getElementById('rules-btn');
const rulesModal = document.getElementById('rules-modal');
const modalClose = document.getElementById('modal-close-btn');

rulesBtn?.addEventListener('click', () => {
  rulesModal.classList.add('active');
  document.body.style.overflow = 'hidden';
});

modalClose?.addEventListener('click', () => {
  rulesModal.classList.remove('active');
  document.body.style.overflow = '';
});

rulesModal?.addEventListener('click', (e) => {
  if (e.target === rulesModal) {
    rulesModal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && rulesModal?.classList.contains('active')) {
    rulesModal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

export function initApp() {
  preloadImages();
  preloadAudio();

  loadState();

  if (state.isBattleActive && state.opponent && state.battle) {
    document.getElementById('nav-battle').style.display = 'inline-block';
    navigateTo('battle');
    return;
  }

  if (state.player.name && state.player.name !== 'Боец') {
    navigateTo('home');
  } else {
    navigateTo('registration');
  }

  document.getElementById('settings-name-input').value = state.player.name;
}

initApp();