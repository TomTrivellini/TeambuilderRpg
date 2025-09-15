import { countFuerza10Passives, countItem, hasPassive } from './characters.js';
import { STATUS_DEFINITIONS } from './statusEffects.js';

/**
 * Determines the turn order based on speed.
 * @param {Array} combatants - All characters in the fight.
 * @param {Object} hpMap - A map of character IDs to their current HP.
 * @returns {Array<string>} - An array of character IDs sorted by speed.
 */
export function getTurnOrder(combatants, hpMap) {
  const isDead = (c) => (hpMap[c.id] ?? c.stats.vida) <= 0;
  // If hpMap is empty (pre-combat), don't filter anyone.
  if (Object.keys(hpMap).length === 0) {
    return [...combatants]
      .sort((a, b) => (b.stats.velocidad || 0) - (a.stats.velocidad || 0))
      .map(c => c.id);
  }
  return [...combatants]
    .filter(c => !isDead(c))
    .sort((a, b) => (b.stats.velocidad || 0) - (a.stats.velocidad || 0))
    .map(c => c.id);
}

/**
 * Resolves a full round of combat, returning a log of actions.
 * @param {Array<string>} turnQueue - Array of character IDs in turn order.
 * @param {Array} allCombatants - All characters in the fight.
 * @param {Array} allies - The player's characters.
 * @param {Array} rivals - The enemy characters.
 * @param {Object} hpMap - Current HP of all characters.
 * @param {Object} statusMap - Current statuses on all characters.
 * @param {Object} tempModsMap - Current temporary modifiers on all characters.
 * @returns {Array} - A log of actions that occurred during the round.
 */
export function resolveRound(turnQueue, allCombatants, allies, rivals, hpMap, statusMap, tempModsMap) {
  const actionLog = [];
  const combatantsMap = new Map(allCombatants.map(c => [c.id, c]));

  // Create mutable copies of the state for this round's simulation.
  // This prevents stale state issues within the round.
  const currentHpMap = { ...hpMap };
  const currentStatusMap = JSON.parse(JSON.stringify(statusMap));

  // Helper to apply status to the simulation state
  const applyStatusInternal = (targetId, status) => {
    const statusInfo = STATUS_DEFINITIONS[status.id];
    if (!statusInfo) return;

    const newStatusInfo = {
      ...status,
      duration: status.duration ?? statusInfo.getDuration(status.level),
      name: statusInfo.name,
      color: statusInfo.color,
    };

    const oldStatuses = currentStatusMap[targetId] || [];
    const existingStatusIndex = oldStatuses.findIndex(
      s => s.id === status.id && s.level === status.level
    );

    let newStatuses;
    if (existingStatusIndex > -1) {
      newStatuses = oldStatuses.map((s, index) => {
        if (index === existingStatusIndex) {
          return {
            ...s,
            stacks: (s.stacks || 1) + 1,
            duration: newStatusInfo.duration, // Reset duration
          };
        }
        return s;
      });
    } else {
      newStatuses = [...oldStatuses, { ...newStatusInfo, stacks: 1 }];
    }
    currentStatusMap[targetId] = newStatuses;
  };

  // Helper to find a target based on taunt, mark, and confusion
  const findTarget = (actor, isActorAlly, potentialTargetTeam, isConfused) => {
    let livingTargets = potentialTargetTeam.filter(e => (currentHpMap[e.id] ?? e.stats.vida) > 0);

    if (isConfused && livingTargets.length > 1) {
      livingTargets = livingTargets.filter(t => t.id !== actor.id);
    }
    if (livingTargets.length === 0) return null;

    // 1. Priority: 'marked' status
    const markedTarget = livingTargets.find(t => 
      (currentStatusMap[t.id] || []).some(s => s.id === 'marked')
    );
    if (markedTarget) return markedTarget;

    // 2. Priority: 'provocacion' passive (if not confused)
    if (!isConfused) {
      const tauntingTarget = livingTargets.find(t => hasPassive(t, 'provocacion'));
      if (tauntingTarget) return tauntingTarget;
    }

    // 3. Default: random target
    return livingTargets[Math.floor(Math.random() * livingTargets.length)];
  };

  const findHealTarget = (potentialTargetTeam) => {
    const livingTargets = potentialTargetTeam.filter(e => (currentHpMap[e.id] ?? e.stats.vida) > 0);
    if (livingTargets.length === 0) return null;

    // Find target with the lowest HP percentage
    return livingTargets.reduce((mostWounded, current) => {
      const mostWoundedHp = (currentHpMap[mostWounded.id] ?? mostWounded.stats.vida) / mostWounded.stats.vida;
      const currentHp = (currentHpMap[current.id] ?? current.stats.vida) / current.stats.vida;
      return currentHp < mostWoundedHp ? current : mostWounded;
    });
  };

  for (const actorId of turnQueue) {
    const actor = combatantsMap.get(actorId);
    if (!actor) continue;

    // --- 1. CHECK IF ACTOR IS ALIVE ---
    if ((currentHpMap[actorId] ?? actor.stats.vida) <= 0) {
      continue; // Skip turn if dead
    }

    actionLog.push({ type: 'START_TURN', actorId });

    // --- 2. PROCESS STATUSES AT THE START OF THE TURN ---
    const actorStatuses = currentStatusMap[actorId] || [];
    let actorIsStunned = false;
    const nextStatuses = [];

    for (const status of actorStatuses) {
      const statusInfo = STATUS_DEFINITIONS[status.id];

      // Apply DoT damage
      if (statusInfo.getDamage) {
        const dotDamage = statusInfo.getDamage(status.level) * (status.stacks || 1);
        currentHpMap[actorId] -= dotDamage; // Update simulation state
        if (dotDamage > 0) {
          actionLog.push({ type: 'STATUS_DAMAGE', targetId: actorId, damage: dotDamage, statusId: status.id });
        }
      }

      // Check for stun
      if (status.id === 'stun' || status.id === 'frozen') {
        actorIsStunned = true;
      }

      // Reduce duration
      const newDuration = status.duration - 1;
      if (newDuration > 0) {
        nextStatuses.push({ ...status, duration: newDuration });
      }
    }
    currentStatusMap[actorId] = nextStatuses; // Update simulation state
    actionLog.push({ type: 'UPDATE_STATUSES', targetId: actorId, statuses: nextStatuses });

    if (actorIsStunned) {
      actionLog.push({ type: 'END_TURN', actorId, stunned: true });
      continue;
    }

    const isActorAlly = allies.some(a => a.id === actor.id);
    const isConfused = (currentStatusMap[actor.id] || []).some(s => s.id === 'confused');

    // --- 3. EXECUTE ACTION ---
    const activeAbility = actor.activeAbility;

    // HEAL LOGIC (replaces basic attack if present)
    if (activeAbility?.id === 'curar') {
      const targetTeam = isConfused ? rivals : allies;
      const healTarget = findHealTarget(targetTeam);
      if (healTarget) {
        const healAmount = Math.floor(healTarget.stats.vida * 0.10);
        currentHpMap[healTarget.id] = Math.min(healTarget.stats.vida, (currentHpMap[healTarget.id] ?? 0) + healAmount);
        actionLog.push({ type: 'HEAL', actorId, targetId: healTarget.id, amount: healAmount, targetMaxHp: healTarget.stats.vida });
        actionLog.push({ type: 'END_TURN', actorId });
        continue;
      }
    }

    if (activeAbility?.id === 'nube_toxica') {
      const enemies = allies.some(a => a.id === actorId) ? rivals : allies;
      const livingEnemies = enemies.filter(e => (currentHpMap[e.id] ?? e.stats.vida) > 0);
      const targets = livingEnemies.sort(() => 0.5 - Math.random()).slice(0, 2);
      targets.forEach(target => {
        const statusToApply = { id: 'poison', level: 1 };
        applyStatusInternal(target.id, statusToApply);
        actionLog.push({ type: 'APPLY_STATUS', actorId, targetId: target.id, status: statusToApply });
      });
    } else if (activeAbility?.id === 'bola_de_fuego') {
      const enemies = allies.some(a => a.id === actorId) ? rivals : allies;
      const livingEnemies = enemies.filter(e => (currentHpMap[e.id] ?? e.stats.vida) > 0);
      if (livingEnemies.length > 0) {
        const target = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
        const damage = 15 + Math.floor(actor.stats.ataque * 0.5);
        currentHpMap[target.id] -= damage;
        actionLog.push({ type: 'ATTACK', actorId, targetId: target.id, damage });
        const statusToApply = { id: 'burn', level: 1 };
        applyStatusInternal(target.id, statusToApply);
        actionLog.push({ type: 'APPLY_STATUS', actorId, targetId: target.id, status: statusToApply });
      }
    } else {
      // Basic Attack
      const targetTeam = isConfused
        ? (isActorAlly ? allies : rivals)
        : (isActorAlly ? rivals : allies);

      const target = findTarget(actor, isActorAlly, targetTeam, isConfused);

      if (target) {
        const fuerza10Stacks = countFuerza10Passives(actor);
        const swordBonus = countItem(actor, 'sword') * 10;
        const atkMult = (tempModsMap[actor.id]?.attackMultiplier ?? 1);
        const baseAttack = ((actor?.stats?.ataque || 1) + swordBonus) * atkMult;
        const damage = Math.max(1, Math.floor(baseAttack) + (fuerza10Stacks * 10));
        currentHpMap[target.id] -= damage;
        actionLog.push({ type: 'ATTACK', actorId, targetId: target.id, damage });

        if (hasPassive(actor, 'venenoso') || countItem(actor, 'poison_knife') > 0) {
          const statusToApply = { id: 'poison', level: 1 };
          applyStatusInternal(target.id, statusToApply);
          actionLog.push({ type: 'APPLY_STATUS', actorId, targetId: target.id, status: statusToApply });
        }
        if (hasPassive(actor, 'incendiario') || countItem(actor, 'torch') > 0) {
          const statusToApply = { id: 'burn', level: 1 };
          applyStatusInternal(target.id, statusToApply);
          actionLog.push({ type: 'APPLY_STATUS', actorId, targetId: target.id, status: statusToApply });
        }
      }
    }

    actionLog.push({ type: 'END_TURN', actorId });
  }

  return actionLog;
}