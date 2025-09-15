# Funciones y Variables (índice vivo)

Este archivo sirve como un índice de las funciones y variables exportadas más importantes del directorio `src/core`.

## core/actives.js
- `ACTIVES`: Objeto que contiene la definición de todas las habilidades activas.

## core/characters.js
- `generateCharacter(options)`: Crea un personaje con stats, clase, nivel, etc. `options` puede sobreescribir valores por defecto.
- `generateInitialChoices(rounds, optionsPerRound)`: Genera una matriz de personajes para la pantalla de elección inicial.
- `levelUpCharacter(character, levels)`: Sube de nivel a un personaje, mejorando sus stats y añadiendo pasivas.
- `countFuerza10Passives(character)`: Cuenta cuántas veces un personaje tiene la pasiva 'fuerza10'.
- `hasPassive(character, passiveId)`: Verifica si un personaje tiene una pasiva específica.
- `countItem(character, itemId)`: Cuenta cuántas veces un personaje tiene un objeto específico.
- `createBaseStats(baseStats, overrides)`: Genera un set de estadísticas base aleatorias.
- `pickRandomClass()`: Elige una clase al azar de `DefaultClasses`.
- `canAddToInventory(inventory)`: Verifica si hay espacio en el inventario.
- `addToInventory(inventory, character)`: Intenta agregar un personaje al inventario. Retorna `{ ok: boolean, ... }`.
- `sellCharacter(inventory, characterId, goldPrice)`: Intenta vender un personaje. Retorna `{ ok: boolean, ... }`.
- `MAX_INVENTORY_SIZE`: Constante, `12`.

## core/classes.js
- `DefaultClasses`: Array de objetos, donde cada objeto es la definición de una clase.

## core/combat.js
- `getTurnOrder(combatants, hpMap)`: Determina el orden de los turnos basado en la velocidad de los combatientes.
- `resolveRound(...)`: Resuelve una ronda completa de combate, procesando acciones, estados y daños.

## core/inventory.js
- `globalInventory`: Objeto que contiene arrays con todos los ítems (`equipables`, `consumibles`) posibles del juego.

## core/items.js
- `ITEMS`: Objeto que contiene la definición de todos los objetos.

## core/passives.js
- `PASSIVES`: Objeto que contiene la definición de todas las habilidades pasivas.

## core/statusEffects.js
- `STATUS_DEFINITIONS`: Objeto que contiene la definición de todos los efectos de estado.

## core/tilesets.js
- `drawCharacterTile(ctx, tileIndex, x, y, size)`: Dibuja un tile del spritesheet de personajes.
- `characterTileSize`: Constante, `32`.
- `characterSheetCols`: Constante, `8`.
- `drawItemTile(ctx, tileIndex, x, y, size)`: Dibuja un tile del spritesheet de objetos.
- `randomItemTile()`: Obtiene un índice de sprite de objeto aleatorio.
- `itemTileSize`: Constante, `16`.
- `itemSheetCols`: Constante, `16`.

Cuando cambie algún nombre o firma, actualizar aquí y haré el cambio global.
