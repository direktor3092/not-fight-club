import { randomItem } from './utils/random.js';

export const ZONES = ['head', 'body', 'legs', 'arms'];

const defaultPlayer = {
  name: 'Боец',
  avatar: 'assets/avatars/default.png',
  wins: 0,
  losses: 0,
  baseDamage: 10,
  maxHp: 100,
};

const OPPONENTS = [
  {
    id: 'child',
    name: 'Ребёнок',
    avatar: 'assets/avatars/child.png',
    baseDamage: 6,
    maxHp: 30,
    profile: { attack: 2, defend: 1 },
    description: 'Шустрый, но слабый. Иногда плачет.',
  },
  {
    id: 'hawking',
    name: 'Стивен Хокинг',
    avatar: 'assets/avatars/hawking.png',
    baseDamage: 5,
    maxHp: 50,
    profile: { attack: 1, defend: 3 },
    description: 'Гений, почти неуязвим, но атакует редко.',
  },
  {
    id: 'grandma',
    name: 'Старушка',
    avatar: 'assets/avatars/grandma.png',
    baseDamage: 6,
    maxHp: 40,
    profile: { attack: 1, defend: 3 },
    description: 'Бьёт клюкой и грозит проклятиями.',
  },
];

export let state = {
  player: { ...defaultPlayer },
  opponent: null,
  battle: null,
  isBattleActive: false,
};

export function initState(saved) {
  if (saved) {
    state.player = saved.player || { ...defaultPlayer };
    state.opponent = saved.opponent || null;
    state.battle = saved.battle || null;
    state.isBattleActive = saved.isBattleActive || false;
  } else {
    state.player = { ...defaultPlayer };
    state.opponent = null;
    state.battle = null;
    state.isBattleActive = false;
  }
}

export function getRandomOpponent() {
  return { ...randomItem(OPPONENTS) };
}

export function updatePlayer(data) {
  state.player = { ...state.player, ...data };
}

export function startBattle() {
  const opponent = getRandomOpponent();
  state.opponent = {
    ...opponent,
    currentHp: opponent.maxHp,
  };
  state.battle = {
    log: [],
    turn: 1,
    playerAttackZone: null,
    playerDefendZones: [],
    opponentAttackZones: [],
    opponentDefendZones: [],
    isFinished: false,
    playerCurrentHp: state.player.maxHp || 100,
  };
  state.isBattleActive = true;
  return state.opponent;
}