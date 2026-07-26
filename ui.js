import { state, ZONES, startBattle } from './state.js';
import { saveState } from './storage.js';
import { navigateTo } from './app.js';
import { playBattleMusic } from './app.js';

export function renderRegistration() {
  const input = document.getElementById('player-name-input');
  if (state.player.name && state.player.name !== 'Боец') {
    input.value = state.player.name;
  }
}

export function renderHome() {
  const nameEl = document.getElementById('home-player-name');
  if (nameEl) nameEl.textContent = state.player.name || 'Боец';
}

export function renderCharacter() {
  const avatarImg = document.getElementById('character-avatar');
  const nameSpan = document.getElementById('character-name');
  const winsSpan = document.getElementById('character-wins');
  const lossesSpan = document.getElementById('character-losses');
  const dmgSpan = document.getElementById('char-damage');
  const hpSpan = document.getElementById('char-hp');
  const profileSpan = document.getElementById('char-profile');

  if (dmgSpan) dmgSpan.textContent = state.player.baseDamage || '?';
  if (hpSpan) hpSpan.textContent = state.player.maxHp || '?';
  if (profileSpan) {
    const p = state.player.profile || { attack: 1, defend: 2 };
    profileSpan.textContent = `Атака: ${p.attack} зон / Защита: ${p.defend} зон`;
  }
  if (avatarImg) avatarImg.src = state.player.avatar || 'assets/avatars/default.png';
  if (nameSpan) nameSpan.textContent = state.player.name || 'Боец';
  if (winsSpan) winsSpan.textContent = state.player.wins || 0;
  if (lossesSpan) lossesSpan.textContent = state.player.losses || 0;

  renderAvatarList();
}

function renderAvatarList() {
  const container = document.getElementById('avatar-list');
  if (!container) return;

  const avatars = [
    'assets/avatars/default.png',
    'assets/avatars/avatar1.png',
    'assets/avatars/avatar2.png',
  ];

  const currentAvatar = state.player.avatar || 'assets/avatars/default.png';

  container.innerHTML = avatars.map(src => `
    <img 
      src="${src}" 
      alt="avatar" 
      class="${src === currentAvatar ? 'selected' : ''}"
      data-src="${src}"
    />
  `).join('');

  container.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => {
      const src = img.dataset.src;
      state.player.avatar = src;
      saveState();
      renderCharacter();
      renderHome();
      if (state.isBattleActive) renderBattle();
    });
  });
}

export function renderSettings() {
  const input = document.getElementById('settings-name-input');
  if (input) input.value = state.player.name || 'Боец';
}

export function renderBattle() {
  if (!state.isBattleActive || !state.opponent || !state.battle) {
    document.getElementById('battle-player-name').textContent = '—';
    document.getElementById('battle-opponent-name').textContent = '—';
    const newBattleBtn = document.getElementById('new-battle-btn');
    if (newBattleBtn) newBattleBtn.style.display = 'none';
    return;
  }

  const player = state.player;
  const opponent = state.opponent;
  const battle = state.battle;

  document.getElementById('battle-player-name').textContent = player.name;
  document.getElementById('battle-opponent-name').textContent = opponent.name;

  document.getElementById('battle-player-avatar').src = player.avatar || 'assets/avatars/default.png';
  document.getElementById('battle-opponent-avatar').src = opponent.avatar || 'assets/avatars/default.png';

  const descEl = document.getElementById('opponent-description');
  if (descEl) {
    descEl.textContent = opponent.description || '';
  }

  const playerMaxHp = player.maxHp || 100;
  const playerCurrentHp = battle.playerCurrentHp !== undefined ? battle.playerCurrentHp : playerMaxHp;
  updateHpBar('player', playerCurrentHp, playerMaxHp);

  const opponentMaxHp = opponent.maxHp;
  const opponentCurrentHp = opponent.currentHp;
  updateHpBar('opponent', opponentCurrentHp, opponentMaxHp);

  renderZones();
  renderLog();

  const attackBtn = document.getElementById('attack-btn');
  const newBattleBtn = document.getElementById('new-battle-btn');

  if (battle.isFinished) {
    attackBtn.disabled = true;
    newBattleBtn.style.display = 'inline-block';
  } else {
    newBattleBtn.style.display = 'none';
    const hasAttack = battle.playerAttackZone !== null;
    const hasDefend = battle.playerDefendZones.length === 2;
    attackBtn.disabled = !(hasAttack && hasDefend);
  }
}

function updateHpBar(who, current, max) {
  const fill = document.getElementById(`${who}-hp-fill`);
  const text = document.getElementById(`${who}-hp-text`);
  if (!fill || !text) return;

  const percent = Math.max(0, (current / max) * 100);
  fill.style.width = `${percent}%`;

  fill.classList.remove('low', 'medium');
  if (percent < 30) fill.classList.add('low');
  else if (percent < 60) fill.classList.add('medium');

  text.textContent = `${Math.round(current)} / ${max}`;
}

function renderZones() {
  const attackContainer = document.getElementById('attack-zones');
  const defendContainer = document.getElementById('defend-zones');
  if (!attackContainer || !defendContainer) return;

  const battle = state.battle;
  const playerAttack = battle.playerAttackZone;
  const playerDefend = battle.playerDefendZones;

  function createZoneButtons(container, type) {
    const isAttack = type === 'attack';
    const selected = isAttack ? playerAttack : null;
    const selectedList = isAttack ? [] : playerDefend;

    container.innerHTML = ZONES.map(zone => {
      const isSelected = isAttack ? (selected === zone) : selectedList.includes(zone);
      const cls = isSelected
        ? (isAttack ? 'zone-btn selected-attack' : 'zone-btn selected-defend')
        : 'zone-btn';
      return `<button class="${cls}" data-zone="${zone}" data-type="${type}">${zone.charAt(0).toUpperCase() + zone.slice(1)}</button>`;
    }).join('');

    container.querySelectorAll('.zone-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const zone = btn.dataset.zone;
        const type = btn.dataset.type;
        handleZoneClick(zone, type);
      });
    });
  }

  createZoneButtons(attackContainer, 'attack');
  createZoneButtons(defendContainer, 'defend');
}

function handleZoneClick(zone, type) {
  if (!state.isBattleActive || state.battle.isFinished) return;

  const battle = state.battle;

  if (type === 'attack') {
    if (battle.playerAttackZone === zone) {
      battle.playerAttackZone = null;
    } else {
      battle.playerAttackZone = zone;
    }
  } else if (type === 'defend') {
    const index = battle.playerDefendZones.indexOf(zone);
    if (index !== -1) {
      battle.playerDefendZones.splice(index, 1);
    } else {
      if (battle.playerDefendZones.length < 2) {
        battle.playerDefendZones.push(zone);
      }
    }
  }

  saveState();
  renderBattle();
}

export function renderLog() {
  const container = document.getElementById('log-container');
  if (!container) return;

  const log = state.battle?.log || [];
  if (log.length === 0) {
    container.innerHTML = '<div class="log-entry">Бой ещё не начался</div>';
    return;
  }

  container.innerHTML = log.map(entry => {
    let damageClass = 'damage';
    if (entry.critical) damageClass += ' critical';
    if (entry.blocked) damageClass += ' blocked';

    return `<div class="log-entry">
      <span class="who">${entry.who}</span> атакует <span class="whom">${entry.whom}</span> в <span class="where">${entry.where}</span> 
      → <span class="${damageClass}">${entry.damage}</span>
      ${entry.critical ? '💥' : ''}
      ${entry.blocked ? '🛡️' : ''}
    </div>`;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

document.getElementById('attack-btn').addEventListener('click', () => {
  if (!state.isBattleActive || !state.battle || state.battle.isFinished) {
    console.warn('Бой не активен или уже завершён');
    return;
  }

  const battle = state.battle;
  if (battle.playerAttackZone === null || battle.playerDefendZones.length !== 2) {
    console.warn('Выберите зону атаки и две зоны защиты');
    return;
  }

  import('./battle.js')
    .then(module => {
      module.executeTurn();
    })
    .catch(err => console.warn('battle.js не загружен', err));
});

document.getElementById('new-battle-btn').addEventListener('click', () => {
  const opponent = startBattle();
  saveState();
  renderBattle();
  playBattleMusic();
});

export function renderAll() {
  renderHome();
  renderCharacter();
  renderSettings();
  if (state.isBattleActive) renderBattle();
}