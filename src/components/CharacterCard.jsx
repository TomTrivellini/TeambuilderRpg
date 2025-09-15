import { SpriteCanvas } from "./ui/SpriteCanvas";

export function CharacterCard({ character: c, onPick }) {
  return (
    <div style={{
      border: '1px solid #444', borderRadius: 8, padding: 12, width: 220,
      background: '#1f1f1f', color: '#fff', display: 'flex', flexDirection: 'column', gap: 8
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontWeight: 'bold' }}>{c.name}</div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>{c.class?.name}</div>
        <div className="sprite-wrap">
          <SpriteCanvas spriteIndex={c.spriteIndex} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:6, fontSize:12 }}>
          <div>HP: {c.stats.vida}</div>
          <div>SH: {c.stats.escudo}</div>
          <div>ATK: {c.stats.ataque}</div>
          <div>SPD: {c.stats.velocidad}</div>
        </div>
        {c.activeAbility && (
          <div style={{ fontSize: 11 }}>
            <div style={{ opacity: 0.8 }}>Habilidad Activa:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ padding: '2px 6px', borderRadius: 6, background: 'rgba(135, 84, 255, 0.15)', border: '1px solid rgba(135, 84, 255, 0.3)' }}>{c.activeAbility.name || c.activeAbility.id}</span>
            </div>
          </div>
        )}
        {Array.isArray(c.passives) && c.passives.length > 0 && (
          <div style={{ fontSize: 11 }}>
            <div style={{ opacity: 0.8 }}>Pasivas:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {c.passives.map((t, i) => (
                <span key={i} style={{ padding: '2px 6px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  {t.name || t.id}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      {onPick && (
        <button onClick={() => onPick(c)}>Elegir</button>
      )}
    </div>
  )
}