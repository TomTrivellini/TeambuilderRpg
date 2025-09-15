import React from 'react';
import characterSheetUrl from '../../assets/img/rogues.png';
import itemSheetUrl from '../../assets/img/items.png';
import { characterTileSize, characterSheetCols, itemTileSize, itemSheetCols } from '../../core/tilesets.js';

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#1a1a1a',
    color: 'white',
    fontFamily: 'monospace',
    borderTop: '2px solid #444',
    marginTop: '40px',
  },
  grid: {
    display: 'inline-grid',
    border: '1px solid #555',
    backgroundColor: '#333',
    imageRendering: 'pixelated',
    margin: '10px 0',
  },
  tile: {
    position: 'relative',
    border: '1px solid #555',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundSize: 'cover',
    cursor: 'pointer',
  },
  index: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '1px 3px',
    fontSize: '10px',
    borderRadius: '2px',
  },
  title: {
    fontSize: '24px',
    marginBottom: '10px',
  }
};

const SpritesheetViewer = ({ title, sheetUrl, tileSize, sheetCols, totalTiles }) => {
  const tiles = Array.from({ length: totalTiles }, (_, i) => i);

  return (
    <div>
      <h2 style={styles.title}>{title}</h2>
      <div style={{
        ...styles.grid,
        gridTemplateColumns: `repeat(${sheetCols}, ${tileSize * 2}px)`, // Multiplico por 2 para que se vea más grande
      }}>
        {tiles.map(index => (
          <div
            key={index}
            title={`Índice: ${index}`}
            style={{
              ...styles.tile,
              width: `${tileSize * 2}px`,
              height: `${tileSize * 2}px`,
              backgroundImage: `url(${sheetUrl})`,
              backgroundPosition: `-${(index % sheetCols) * tileSize}px -${Math.floor(index / sheetCols) * tileSize}px`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${sheetCols * tileSize}px auto`,
            }}
          >
            <span style={styles.index}>{index}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function TilePicker() {
  // Asumo 8 filas para personajes y 16 para items
  const totalCharacterTiles = characterSheetCols * 8;
  const totalItemTiles = itemSheetCols * 16;

  return (
    <div style={styles.container}>
      <h1>Herramienta de Selección de Tiles</h1>
      <p>Pasa el mouse sobre un tile para ver su índice. Úsalo para configurar los arrays `spriteIndices` en `characters.js` y `allowedItemTiles` en `tilesets.js`.</p>
      <SpritesheetViewer title="Personajes (rogues.png)" sheetUrl={characterSheetUrl} tileSize={characterTileSize} sheetCols={characterSheetCols} totalTiles={totalCharacterTiles} />
      <hr style={{ margin: '20px 0', borderColor: '#555' }} />
      <SpritesheetViewer title="Objetos (items.png)" sheetUrl={itemSheetUrl} tileSize={itemTileSize} sheetCols={itemSheetCols} totalTiles={totalItemTiles} />
    </div>
  );
}