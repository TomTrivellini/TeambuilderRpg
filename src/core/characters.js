// Base de generación de personajes
import { PASSIVES } from './passives.js';
import { ACTIVES } from './actives.js';
import { DefaultClasses } from './classes.js';
import { ITEMS } from './items.js';

export const MAX_INVENTORY_SIZE = 12;

export function pickRandomClass() {
  return DefaultClasses[Math.floor(Math.random() * DefaultClasses.length)];
}

export function createBaseStats(baseStats = {}, overrides = {}) {
  const finalStats = {
    vida: (baseStats.vida || 75) + Math.floor(Math.random() * 21) - 10, // +/- 10
    escudo: (baseStats.escudo || 35) + Math.floor(Math.random() * 11) - 5, // +/- 5
    ataque: (baseStats.ataque || 10) + Math.floor(Math.random() * 5) - 2, // +/- 2
    velocidad: (baseStats.velocidad || 5) + Math.floor(Math.random() * 3) - 1, // +/- 1
  };

  // Asegurar que los stats sean al menos 1
  Object.keys(finalStats).forEach(key => {
    finalStats[key] = Math.max(1, finalStats[key]);
  });

  return { ...finalStats, ...overrides };
}


//generar character
export function generateCharacter(options = {}) {
  const charClass = options.class || pickRandomClass();
  const stats = createBaseStats(charClass.baseStats, options.stats);
  const level = options.level || 1;
  const passives = [...(options.passives || [])];
  const items = [...(options.items || [])];
  let activeAbility = ACTIVES.ataque_basico;

  // Asignar habilidades activas únicas por clase
  if (charClass.id === 'cleric') {
    activeAbility = ACTIVES.curar;
  } else if (charClass.id === 'mage') {
    const mageAbilities = [ACTIVES.nube_toxica, ACTIVES.bola_de_fuego];
    // 50% de chance de obtener una habilidad activa
    if (Math.random() < 0.5) {
      activeAbility = mageAbilities[Math.floor(Math.random() * mageAbilities.length)];
    }
  }

  // Chance de tener la pasiva Venenoso
  if (Math.random() < 0.1) {
    passives.push(PASSIVES.venenoso);
  }

  // Chance de tener la pasiva Incendiario
  if (Math.random() < 0.1) {
    passives.push(PASSIVES.incendiario);
  }

  // Chance de tener un objeto inicial
  if (Math.random() < 0.05) { // 5% chance
    const possibleItems = [ITEMS.potion, ITEMS.torch]; // Solo consumibles para no desbalancear
    items.push(possibleItems[Math.floor(Math.random() * possibleItems.length)]);
  }

  // Elige un sprite aleatorio de los disponibles para la clase
  const spriteIndices = (charClass.spriteIndices && charClass.spriteIndices.length > 0)
    ? charClass.spriteIndices
    : [0]; // Fallback a un sprite seguro (índice 0) si no hay sprites definidos
  const spriteIndex = options.spriteIndex ?? spriteIndices[Math.floor(Math.random() * spriteIndices.length)];
  
  const baseCharacter = {
    id: options.id || cryptoRandomId(),
    name: options.name || generateName(charClass),
    spriteIndex,
    items,
    stats,
    class: charClass,
    level: 1, // Siempre se empieza en nivel 1
    activeAbility,
    passives,
  };

  if (level > 1) {
    return levelUpCharacter(baseCharacter, level - 1);
  }
  return baseCharacter;
}

export function generateInitialChoices(rounds = 3, optionsPerRound = 3) {
  return Array.from({ length: rounds }, () =>
    Array.from({ length: optionsPerRound }, () => generateCharacter({ level: 1 }))
  );
}

export function canAddToInventory(inventory) {
  return inventory.length < MAX_INVENTORY_SIZE;
}

export function addToInventory(inventory, character) {
  if (!canAddToInventory(inventory)) return { ok: false, error: 'Inventario lleno' };
  return { ok: true, inventory: [...inventory, character] };
}

export function sellCharacter(inventory, characterId, goldPrice = 1) {
  const idx = inventory.findIndex(c => c.id === characterId);
  if (idx === -1) return { ok: false, error: 'Personaje no encontrado' };
  const newInv = [...inventory.slice(0, idx), ...inventory.slice(idx + 1)];
  return { ok: true, gold: goldPrice, inventory: newInv };
}

// Leveling
export function levelUpCharacter(character, levels = 1) {
  let newChar = { ...character, stats: { ...character.stats }, passives: [...(character.passives||[])], level: (character.level||1) }
  for (let i = 0; i < levels; i++) {
    newChar.level = (newChar.level || 1) + 1
    // Incrementos simples por nivel
    newChar.stats.vida += 10
    newChar.stats.escudo += 5
    newChar.stats.ataque += 2
    newChar.stats.velocidad += 1
    // Cada 3 niveles: pasiva +10 daño por golpe
    if (newChar.level > 0 && newChar.level % 3 === 0) {
      newChar.passives.push(PASSIVES.fuerza10);
    }
  }
  return newChar
}

export function countFuerza10Passives(character) {
  if (!character || !Array.isArray(character.passives)) return 0
  return character.passives.filter(t => t.id === 'fuerza10').length
}

export function countItem(character, itemId) {
  if (!character || !Array.isArray(character.items)) return 0
  return character.items.filter(i => i.id === itemId).length
}

export function hasPassive(character, passiveId) {
  if (!character || !Array.isArray(character.passives)) return false;
  return character.passives.some(t => t.id === passiveId);
}

//asignar id a los personajes
function cryptoRandomId() {

  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

function generateName(clazz) {
  const base = ['Ari', 'Bren', 'Caro', 'Dara', 'Eli', 'Fio', 'Gabe', 'Hera'];
  const pick = base[Math.floor(Math.random() * base.length)];
  return `${pick} ${clazz.name}`;
}