import { state, ZONES } from './state.js';
import { saveState } from './storage.js';
import { randomInt, randomItem, shuffle } from './utils/random.js';
import { renderBattle, renderLog, renderAll } from './ui.js';
import { playHitSound, playEndSound } from './app.js';

const CRITICAL_MULTIPLIER = 1.5;
const CRITICAL_CHANCE = 25;

export function executeTurn() {
  if (!state.isBattleActive || !state.battle || state.battle.isFinished) {
    console.warn('Бой не активен или уже завершён');
    return;
  }

  const battle = state.battle;
  const player = state.player;
  const opponent = state.opponent;

  if (battle.playerAttackZone === null || battle.playerDefendZones.length !== 2) {
    console.warn('Игрок не выбрал зоны');
    return;
  }

  const opponentAttack = generateOpponentZones(opponent.profile.attack);
  const opponentDefend = generateOpponentZones(opponent.profile.defend);

  battle.opponentAttackZones = opponentAttack;
  battle.opponentDefendZones = opponentDefend;

  const playerDamage = calculateDamage(
    player.name,
    opponent.name,
    battle.playerAttackZone,
    opponentDefend,
    player.baseDamage || 10,
    'player'
  );

  const opponentDamage = calculateDamage(
    opponent.name,
    player.name,
    randomItem(opponentAttack),
    battle.playerDefendZones,
    opponent.baseDamage,
    'opponent'
  );

  if (playerDamage.damage > 0) {
    opponent.currentHp = Math.max(0, opponent.currentHp - playerDamage.damage);
  }
  if (opponentDamage.damage > 0) {
    if (!battle.playerCurrentHp) battle.playerCurrentHp = state.player.maxHp || 100;
    battle.playerCurrentHp = Math.max(0, battle.playerCurrentHp - opponentDamage.damage);
  }

  playHitSound();

  battle.log.push(playerDamage.entry);
  battle.log.push(opponentDamage.entry);

  if (opponent.currentHp <= 0) {
    battle.isFinished = true;
    player.wins = (player.wins || 0) + 1;
    battle.log.push({
      who: '⚔️ Бой',
      whom: '',
      where: '',
      damage: `${player.name} победил!`,
      critical: false,
      blocked: false,
    });
    playEndSound();
  } else if (battle.playerCurrentHp <= 0) {
    battle.isFinished = true;
    player.losses = (player.losses || 0) + 1;
    battle.log.push({
      who: '⚔️ Бой',
      whom: '',
      where: '',
      damage: `${opponent.name} победил!`,
      critical: false,
      blocked: false,
    });
    playEndSound();
  }

  battle.turn += 1;

  battle.playerAttackZone = null;
  battle.playerDefendZones = [];

  saveState();
  renderBattle();
  renderLog();

  if (battle.isFinished) {
    document.getElementById('attack-btn').disabled = true;
  }
}

function generateOpponentZones(count) {
  const shuffled = shuffle(ZONES);
  return shuffled.slice(0, Math.min(count, ZONES.length));
}

function calculateDamage(attackerName, defenderName, attackZone, defendZones, baseDamage, side) {
  const isCritical = randomInt(1, 100) <= CRITICAL_CHANCE;

  let damage = 0;
  let blocked = false;
  let critical = false;

  if (isCritical) {

    damage = Math.round(baseDamage * CRITICAL_MULTIPLIER);
    critical = true;
    blocked = false;
  } else {
    if (defendZones.includes(attackZone)) {
      blocked = true;
      damage = 0;
    } else {
      damage = baseDamage;
    }
  }

  const entry = {
    who: attackerName,
    whom: defenderName,
    where: attackZone,
    damage: damage > 0 ? `${damage} урона` : (blocked ? 'Заблокировано' : '0'),
    critical,
    blocked,
  };

  return { damage, entry };
}