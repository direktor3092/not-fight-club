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

export function showToast(text, duration = 2000) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
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
    if (audio) audio.load();
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
  Object.values(pages).forEach(p => p.classList.remove('active'));
  if (pages[pageId]) pages[pageId].classList.add('active');

  navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });

  if (pageId === 'registration') {
    nav.style.display = 'none';
  } else {
    nav.style.display = 'flex';
  }

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

const resetBtn = document.getElementById('reset-progress-btn');
const rulesModal = document.getElementById('rules-modal');
const modalClose = document.getElementById('modal-close-btn');

resetBtn?.addEventListener('click', () => {
  const content = rulesModal.querySelector('.modal-content');
  content.innerHTML = `
    <button id="modal-close-btn" class="modal-close">&times;</button>
    <h2>⚠️ Подтверждение</h2>
    <p style="margin: 20px 0; font-size:1.1rem;">Вы уверены? Весь прогресс будет удалён безвозвратно.</p>
    <div style="display:flex; gap:16px; justify-content:center;">
      <button id="modal-confirm-yes" class="btn-confirm" style="background:#e74c3c; border:none; border-radius:20px; padding:10px 30px; color:#fff; cursor:pointer;">Да, сбросить</button>
      <button id="modal-confirm-no" class="btn-confirm" style="background:#555; border:none; border-radius:20px; padding:10px 30px; color:#fff; cursor:pointer;">Отмена</button>
    </div>
  `;
  rulesModal.classList.add('active');
  document.body.style.overflow = 'hidden';

  document.getElementById('modal-confirm-yes').addEventListener('click', () => {
    localStorage.removeItem('not-fight-club-state');
    initState(null);
    rulesModal.classList.remove('active');
    document.body.style.overflow = '';
    location.reload();
  });

  document.getElementById('modal-confirm-no').addEventListener('click', () => {
    rulesModal.classList.remove('active');
    document.body.style.overflow = '';
    restoreRulesModal();
  });

  document.getElementById('modal-close-btn').addEventListener('click', () => {
    rulesModal.classList.remove('active');
    document.body.style.overflow = '';
    restoreRulesModal();
  });

  rulesModal.addEventListener('click', function handler(e) {
    if (e.target === rulesModal) {
      rulesModal.classList.remove('active');
      document.body.style.overflow = '';
      restoreRulesModal();
      rulesModal.removeEventListener('click', handler);
    }
  });
});

function restoreRulesModal() {
  const content = rulesModal.querySelector('.modal-content');
  content.innerHTML = `
    <button id="modal-close-btn" class="modal-close">&times;</button>
    <h2>📖 Правила боя</h2>
    <ul>
      <li><strong>Зоны:</strong> голова, корпус, ноги, руки.</li>
      <li>Каждый ход вы выбираете <strong>1 зону для атаки</strong> и <strong>2 зоны для защиты</strong>.</li>
      <li>Урон проходит, если атака попала в зону, которую противник <strong>не защищает</strong>.</li>
      <li><strong>Критический удар</strong> (случайный шанс) наносит <strong>×1.5 урона</strong> и <strong>пробивает любую защиту</strong>.</li>
      <li>Бой длится, пока у одного из бойцов не закончится HP.</li>
      <li>Победы и поражения сохраняются даже после перезагрузки страницы.</li>
      <li>Лог показывает каждое действие хода: кто атаковал, куда, сколько урона (и был ли блок/крит).</li>
    </ul>
    <p style="margin-top:16px; color:#aaa; font-style:italic;">Удачи в бою! 🥊</p>
  `;
  document.getElementById('modal-close-btn').addEventListener('click', () => {
    rulesModal.classList.remove('active');
    document.body.style.overflow = '';
  });
}

document.getElementById('character-done-btn')?.addEventListener('click', () => {
  navigateTo('home');
});

const rulesBtn = document.getElementById('rules-btn');

rulesBtn?.addEventListener('click', () => {
  restoreRulesModal();
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
    nav.style.display = 'none';
  }

  document.getElementById('settings-name-input').value = state.player.name;
}

initApp();