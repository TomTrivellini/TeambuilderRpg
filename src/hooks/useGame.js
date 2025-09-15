import { useEffect, useMemo, useState } from 'react'
import { generateInitialChoices, generateCharacter, levelUpCharacter, countFuerza10Passives, countItem, hasPassive } from '../core/characters.js'
import { ITEMS } from '../core/items.js'
import { getTurnOrder, resolveRound } from '../core/combat.js'
import { STATUS_DEFINITIONS } from '../core/statusEffects.js'

export function useGame() {
  // Estado para flujo de elección
  const [mode, setMode] = useState('choose') // 'choose' | 'battle'
  const [rounds, setRounds] = useState([]) // array de arrays (3x3)
  const [roundIndex, setRoundIndex] = useState(0)
  const [allies, setAllies] = useState([]) // elegidos por el usuario (3)
  const [rivals, setRivals] = useState([]) // 8 NPCs
  const [level, setLevel] = useState(1)
  // Combate
  const [turnQueue, setTurnQueue] = useState([]) // array de ids en orden
  const [activeTurn, setActiveTurn] = useState(null) // id actual
  const [roundNumber, setRoundNumber] = useState(0)
  const [isResolving, setIsResolving] = useState(false)
  const [hpMap, setHpMap] = useState({}) // id -> vida restante
  const [shieldMap, setShieldMap] = useState({}) // id -> escudo
  const [actingId, setActingId] = useState(null)
  const [hitId, setHitId] = useState(null)
  const [lostHpId, setLostHpId] = useState(null)
  const [statusMap, setStatusMap] = useState({}) // { [charId]: Array<{ id, level, duration, stacks, color }> }
  const [inventory, setInventory] = useState([ITEMS.potion, ITEMS.potion, ITEMS.potion, ITEMS.sword, ITEMS.poison_knife, ITEMS.torch, ITEMS.mark_potion])
  const [selectedCharacterId, setSelectedCharacterId] = useState(null)
  // Modificadores temporales (ej: debuffs de ataque). Ejemplo: { [id]: { attackMultiplier: 0.5 } }
  const [tempModsMap, setTempModsMap] = useState({})
  // Recompensas
  const [gold, setGold] = useState(0)
  const [rewardOptions, setRewardOptions] = useState([])

  useEffect(() => {
    // generar 3 rondas de 3 opciones
    setRounds(generateInitialChoices(3, 3))
    setRoundIndex(0)
    setAllies([])
    setRivals([])
    setLevel(1)
  }, [])

  const allCombatants = useMemo(() => {
    return [...allies, ...rivals]
  }, [allies, rivals])

  const orderedBySpeed = useMemo(() => {
    // This is now just for display, the actual turn order is calculated in resolveTurns
    const turnOrderIds = getTurnOrder(allCombatants, hpMap);
    const combatantsMap = new Map(allCombatants.map(c => [c.id, c]));
    return turnOrderIds.map(id => combatantsMap.get(id));
  }, [allCombatants, hpMap])

  function startRound() {
    if (isResolving) return
    const ids = getTurnOrder(allCombatants, hpMap);
    setTurnQueue(ids);
    setRoundNumber(n => n + 1)
    resolveTurns(ids)
  }

  function applyStatus(targetId, status) {
    const statusInfo = STATUS_DEFINITIONS[status.id];
    if (!statusInfo) return;

    const newStatusInfo = {
      ...status,
      duration: status.duration ?? statusInfo.getDuration(status.level),
      color: statusInfo.color,
      name: statusInfo.name,
    };

    setStatusMap(prev => {
      const newMap = { ...prev };
      const oldStatuses = newMap[targetId] || [];
      const existingStatusIndex = oldStatuses.findIndex(
        s => s.id === status.id && s.level === status.level
      );

      let newStatuses;

      if (existingStatusIndex > -1) {
        // Si ya existe, creamos un nuevo array con el estado actualizado
        newStatuses = oldStatuses.map((s, index) => {
          if (index === existingStatusIndex) {
            // Este es el que actualizamos. Creamos un nuevo objeto.
            return {
              ...s,
              stacks: (s.stacks || 1) + 1,
              duration: newStatusInfo.duration, // Reiniciar duración
            };
          }
          return s;
        });
      } else {
        // Si no existe, lo añadimos al array
        newStatuses = [...oldStatuses, { ...newStatusInfo, stacks: 1 }];
      }

      newMap[targetId] = newStatuses;
      return newMap;
    });
  }

  function takeDamage(targetId, amount) {
    const target = allCombatants.find(c => c.id === targetId);
    if (!target) return;

    setLostHpId(targetId); // Activa la animación de "lost-hp"

    setShieldMap(prev => {
      const s = prev[targetId] ?? 0;
      const remToHp = Math.max(0, amount - s);
      setHpMap(hp => ({ ...hp, [targetId]: Math.max(0, (hp[targetId] ?? target.stats.vida) - remToHp) }));
      return { ...prev, [targetId]: Math.max(0, s - amount) };
    });
  }

  function resolveTurns(queue) {
    setIsResolving(true)

    // Get a pure log of actions from the combat logic
    const actionLog = resolveRound(queue, allCombatants, allies, rivals, hpMap, statusMap, tempModsMap);

    // "Play" the actions with delays for animations
    let actionIndex = 0
    const step = () => {
      if (actionIndex >= actionLog.length) {
        setActiveTurn(null)
        setIsResolving(false)
        // Chequear estado del combate al finalizar la ronda
        setTimeout(checkOutcome, 50)
        return
      }
      
      const action = actionLog[actionIndex];
      let delay = 400;

      switch (action.type) {
        case 'START_TURN':
          setActiveTurn(action.actorId);
          setActingId(action.actorId);
          delay = 200;
          break;
        
        case 'STATUS_DAMAGE':
          setLostHpId(action.targetId);
          takeDamage(action.targetId, action.damage);
          delay = 300;
          break;

        case 'UPDATE_STATUSES':
          // This action can be processed immediately as it doesn't have a visual effect by itself
          setStatusMap(prev => ({ ...prev, [action.targetId]: action.statuses }));
          delay = 50;
          break;

        case 'ATTACK':
          setActingId(action.actorId);
          setHitId(action.targetId);
          takeDamage(action.targetId, action.damage);
          break;

        case 'APPLY_STATUS':
          setActingId(action.actorId);
          setHitId(action.targetId); // Show hit animation when applying status
          applyStatus(action.targetId, action.status);
          delay = 100;
          break;

        case 'END_TURN':
          setActingId(null);
          setHitId(null);
          setLostHpId(null);
          delay = action.stunned ? 300 : 100;
          break;

        case 'HEAL':
          setActingId(action.actorId);
          // Podríamos crear una animación de "heal" en el futuro
          setHitId(action.targetId); 
          setHpMap(prev => ({
            ...prev,
            [action.targetId]: Math.min(action.targetMaxHp, (prev[action.targetId] ?? 0) + action.amount)
          }));
          delay = 300;
          break;
      }

      actionIndex++;
      setTimeout(step, delay);
    };
    setTimeout(step, 200)
  }

  function checkOutcome() {
    // helpers
    const isDead = (c) => (hpMap[c.id] ?? c.stats.vida) <= 0
    const alliesAlive = allies.some(c => !isDead(c))
    const rivalsAlive = rivals.some(c => !isDead(c))

    if (!alliesAlive) {
      // Game Over: volver a selección
      setMode('choose')
      setRounds(generateInitialChoices(3, 3))
      setRoundIndex(0)
      setAllies([])
      setRivals([])
      setLevel(1)
      setHpMap({})
      setShieldMap({})
      setStatusMap({})
      setRoundNumber(0)
      setTurnQueue([])
      setActiveTurn(null)
      return
    }

    if (!rivalsAlive) {
      // Victoria: remover muertos, curar sobrevivientes, subir de nivel y pasar a recompensa.
      const survivingAlliesPreLevel = allies.filter(c => !isDead(c));
      
      const leveledAllies = survivingAlliesPreLevel.map(c => levelUpCharacter(c, 1));

      const nextHpMap = {};
      const nextShieldMap = {};

      leveledAllies.forEach(c => {
        // Encontrar stats pre-subida de nivel para calcular curación
        const oldChar = survivingAlliesPreLevel.find(old => old.id === c.id);
        const oldMaxHp = oldChar.stats.vida;
        const oldCurHp = hpMap[c.id] ?? oldMaxHp;
        
        // Curación es 25% de la vida máxima *anterior*.
        const healedHp = Math.round(oldCurHp + oldMaxHp * 0.25);
        
        // Limitar HP al nuevo máximo.
        nextHpMap[c.id] = Math.min(c.stats.vida, healedHp);
        
        // Restaurar escudo al nuevo máximo.
        nextShieldMap[c.id] = c.stats.escudo;
      });

      setAllies(leveledAllies);
      setHpMap(nextHpMap);
      setShieldMap(nextShieldMap);

      // Oro + opciones de recompensa y cambio de modo
      setGold(g => g + 5)
      const next = Math.min(99, level + 1)
      setLevel(next)
      const genCandidate = () => {
        const roll = Math.random()
        let cLvl = 1
        if (roll > 0.7) cLvl = 3
        else if (roll > 0.35) cLvl = 2
        return generateCharacter({ level: cLvl })
      }
      setRewardOptions([genCandidate(), genCandidate(), genCandidate()])
      setMode('reward')
      setRoundNumber(0)
      setTurnQueue([])
      setActiveTurn(null)
    }
  }

  function acceptReward(candidate) {
    let finalAllies = allies;
    const finalHpMap = { ...hpMap };
    const finalShieldMap = { ...shieldMap };

    if (candidate && allies.length < 8) {
      finalAllies = [...allies, candidate];
      finalHpMap[candidate.id] = candidate.stats.vida;
      finalShieldMap[candidate.id] = candidate.stats.escudo;
    }

    // Generar próximos rivales para el nivel actual
    const enemyCount = Math.min(8, 2 + level);
    const genEnemy = () => {
      const roll = Math.random();
      let eLvl = 1;
      if (roll > 0.7) eLvl = 3;
      else if (roll > 0.35) eLvl = 2;
      return generateCharacter({ level: eLvl });
    };
    const npc = Array.from({ length: enemyCount }, () => genEnemy());

    npc.forEach(e => {
      finalHpMap[e.id] = e.stats.vida;
      finalShieldMap[e.id] = e.stats.escudo;
    });

    // Set all state for the next battle
    setAllies(finalAllies);
    setRivals(npc);
    setHpMap(finalHpMap);
    setShieldMap(finalShieldMap);
    setRewardOptions([]);
    setRoundNumber(0);
    setTurnQueue([]);
    setActiveTurn(null);
    setMode('battle');
  }

  function sellAlly(allyId) {
    // Vender aliado por +1 oro y liberar espacio
    const idx = allies.findIndex(a => a.id === allyId)
    if (idx === -1) return
    setGold(g => g + 1)
    const removed = allies[idx]
    setAllies(prev => [...prev.slice(0, idx), ...prev.slice(idx + 1)])
    // Limpiar mapas de HP/SH del vendido
    setHpMap(prev => { const n = { ...prev }; delete n[removed.id]; return n })
    setShieldMap(prev => { const n = { ...prev }; delete n[removed.id]; return n })
  }

  function handlePick(character) {
    const newAllies = [...allies, character]
    const nextRound = roundIndex + 1
    if (nextRound >= 3) {
      // Pasar a batalla
      const finalAllies = newAllies;
      const enemyCount = Math.min(8, 2 + level) // nivel 1 -> 3, escala hasta 8
      const genEnemy = () => generateCharacter({ level: 1 })
      const npc = Array.from({ length: enemyCount }, () => genEnemy())

      // Preparar estado para la batalla (HP, escudos, etc.)
      const all = [...finalAllies, ...npc];
      const newHp = {};
      const newShield = {};
      all.forEach(c => {
        newHp[c.id] = c.stats.vida;
        newShield[c.id] = c.stats.escudo;
      });

      setAllies(finalAllies);
      setRivals(npc);
      setHpMap(newHp);
      setShieldMap(newShield);
      setRoundNumber(0);
      setTurnQueue([]);
      setActiveTurn(null);
      setMode('battle');
    } else {
      setAllies(newAllies)
      setRoundIndex(nextRound)
    }
  }

  function useConsumable(characterId, itemId) {
    const itemIndex = inventory.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    const item = inventory[itemIndex];
    const character = allCombatants.find(c => c.id === characterId);
    if (!character) return;

    // Aplicar efecto del objeto
    if (item.id === 'potion') {
      setHpMap(prev => {
        const currentHp = prev[characterId] ?? character.stats.vida;
        const maxHp = character.stats.vida;
        // Cura 50% de la vida máxima, sin sobrepasar el máximo
        const newHp = Math.min(maxHp, currentHp + Math.floor(maxHp * 0.5));
        return { ...prev, [characterId]: newHp };
      });
    } else if (item.id === 'mark_potion') {
      applyStatus(characterId, { id: 'marked', level: 1 });
    }

    // Eliminar una instancia del objeto del inventario
    setInventory(prev => [...prev.slice(0, itemIndex), ...prev.slice(itemIndex + 1)]);
  }

  function equipItem(characterId, itemId) {
    const itemIndex = inventory.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    const itemToEquip = inventory[itemIndex];

    // Actualizar el personaje en la lista de aliados
    setAllies(prevAllies => prevAllies.map(ally => {
      if (ally.id === characterId) {
        // Simplemente lo añade al array de items del personaje
        const newItems = [...(ally.items || []), itemToEquip];
        return { ...ally, items: newItems };
      }
      return ally;
    }));

    // Eliminar el objeto del inventario principal
    setInventory(prev => [...prev.slice(0, itemIndex), ...prev.slice(itemIndex + 1)]);
  }

  return {
    mode,
    rounds,
    roundIndex,
    allies,
    rivals,
    level,
    roundNumber,
    isResolving,
    hpMap,
    shieldMap,
    actingId,
    hitId,
    lostHpId,
    statusMap,
    inventory,
    selectedCharacterId,
    tempModsMap,
    gold,
    rewardOptions,
    orderedBySpeed,
    startRound,
    acceptReward,
    sellAlly,
    handlePick,
    useConsumable,
    equipItem,
    setAllies,
    setShieldMap,
    setHpMap,
    setSelectedCharacterId,
  }
}