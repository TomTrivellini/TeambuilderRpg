import characterSheetUrl from '../assets/img/rogues.png';
import itemSheetUrl from '../assets/img/items.png'; // Asumo que esta es la ruta para la imagen simple de items

// --- Character Tileset ---
const characterSheet = new Image();
characterSheet.src = characterSheetUrl;

export const characterTileSize = 32;
export const characterSheetCols = 8;

/**
 * Dibuja un tile del spritesheet de personajes en un canvas.
 * @param {CanvasRenderingContext2D} ctx - El contexto del canvas.
 * @param {number} tileIndex - El índice del tile a dibujar.
 * @param {number} x - Coordenada X donde dibujar.
 * @param {number} y - Coordenada Y donde dibujar.
 * @param {number} [size=characterTileSize] - El tamaño final del sprite dibujado.
 */
export function drawCharacterTile(ctx, tileIndex, x, y, size = characterTileSize) {
  if (!characterSheet.complete || characterSheet.naturalWidth === 0) return;

  const sx = (tileIndex % characterSheetCols) * characterTileSize;
  const sy = Math.floor(tileIndex / characterSheetCols) * characterTileSize;

  ctx.drawImage(
    characterSheet,
    sx, sy, characterTileSize, characterTileSize,
    x, y, size, size
  );
}

// --- Item Tileset ---
const itemSheet = new Image();
itemSheet.src = itemSheetUrl;

export const itemTileSize = 16;
export const itemSheetCols = 16; // Asumo una grilla de 16x16 para items.png

// Lista de sprites de items permitidos para no elegir tiles vacíos.
// Esto es un ejemplo, habría que completarlo con los índices válidos de tu imagen.
const allowedItemTiles = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
  16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
  32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
];

/**
 * Dibuja un tile del spritesheet de objetos en un canvas.
 * @param {CanvasRenderingContext2D} ctx - El contexto del canvas.
 * @param {number} tileIndex - El índice del tile a dibujar.
 * @param {number} x - Coordenada X donde dibujar.
 * @param {number} y - Coordenada Y donde dibujar.
 * @param {number} [size=itemTileSize] - El tamaño final del sprite dibujado.
 */
export function drawItemTile(ctx, tileIndex, x, y, size = itemTileSize) {
  if (!itemSheet.complete || itemSheet.naturalWidth === 0) return;

  const sx = (tileIndex % itemSheetCols) * itemTileSize;
  const sy = Math.floor(tileIndex / itemSheetCols) * itemTileSize;

  ctx.drawImage(
    itemSheet,
    sx, sy, itemTileSize, itemTileSize,
    x, y, size, size
  );
}

/**
 * Obtiene un índice de sprite de objeto aleatorio de la lista de permitidos.
 * @returns {number}
 */
export function randomItemTile() {
  return allowedItemTiles[Math.floor(Math.random() * allowedItemTiles.length)];
}
