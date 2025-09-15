import { useEffect, useRef } from 'react'
import { drawCharacterTile, characterTileSize } from '../../core/tilesets.js'

export function SpriteCanvas({ spriteIndex }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = ref.current.getContext('2d')
    ctx.clearRect(0, 0, characterTileSize, characterTileSize)
    if (typeof spriteIndex === 'number') {
      // dibujamos a resolución base 32x32, CSS escala 4x sin suavizado
      drawCharacterTile(ctx, spriteIndex, 0, 0)
    }
  }, [spriteIndex])

  return (
    <canvas
      width={characterTileSize}
      height={characterTileSize}
      style={{ alignSelf: 'center', background: 'transparent' }}
      ref={ref}
    />
  )
}