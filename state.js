import { randomItem } from './utils/random.js';

export const ZONES = ['голова', 'корпус', 'ноги', 'руки'];

export const PLAYER_CHARACTERS = [
  {
    id: 'tyson',
    name: 'Майк Тайсон',
    avatar: 'assets/avatars/default.png',
    baseDamage: 20,
    maxHp: 80,
    profile: { attack: 2, defend: 1 },
    description: 'Кусает уши и нокаутирует с первого удара',
  },
  {
    id: 'schwarzenegger',
    name: 'Арнольд Шварцнегер',
    avatar: 'assets/avatars/avatar1.png',
    baseDamage: 5,
    maxHp: 100,
    profile: { attack: 1, defend: 2 },
    description: 'I\'ll be back! И принесёт тебе HP',
  },
  {
    id: 'mcgregor',
    name: 'Конор Макгрегор',
    avatar: 'assets/avatars/avatar2.png',
    baseDamage: 10,
    maxHp: 60,
    profile: { attack: 2, defend: 2 },
    description: 'Быстрый как ветер, языком работает лучше',
  },
];

const defaultPlayer = {
  name: PLAYER_CHARACTERS[0].name,
  avatar: PLAYER_CHARACTERS[0].avatar,
  wins: 0,
  losses: 0,
  baseDamage: PLAYER_CHARACTERS[0].baseDamage,
  maxHp: PLAYER_CHARACTERS[0].maxHp,
  profile: PLAYER_CHARACTERS[0].profile,
  characterId: PLAYER_CHARACTERS[0].id,
  description: PLAYER_CHARACTERS[0].description,
};

const OPPONENTS = [
  {
    id: 'child',
    name: 'Ребёнок',
    avatar: 'assets/avatars/child.png',
    baseDamage: 8,
    maxHp: 40,
    profile: { attack: 2, defend: 1 },
    description: 'Шустрый, но слабый. Иногда плачет.',
  },
  {
    id: 'hawking',
    name: 'Стивен Хокинг',
    avatar: 'assets/avatars/hawking.png',
    baseDamage: 10,
    maxHp: 50,
    profile: { attack: 1, defend: 3 },
    description: 'Гений, почти неуязвим, но атакует редко.',
  },
  {
    id: 'grandma',
    name: 'Старушка',
    avatar: 'assets/avatars/grandma.png',
    baseDamage: 9,
    maxHp: 45,
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

export function setPlayerCharacter(characterId) {
  const character = PLAYER_CHARACTERS.find(c => c.id === characterId);
  if (character) {
    state.player.avatar = character.avatar;
    state.player.baseDamage = character.baseDamage;
    state.player.maxHp = character.maxHp;
    state.player.profile = character.profile;
    state.player.characterId = character.id;
    state.player.description = character.description;
  }
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