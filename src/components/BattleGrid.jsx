import { useEffect, useMemo, useState } from "react";
import { SpriteCanvas } from "./ui/SpriteCanvas";

function CharacterDisplay({ c, hpMap, shieldMap, actingId, hitId, lostHpId, statusMap, tempModsMap, torchActive, isSelected }) {
  const statusList = useMemo(() => statusMap[c.id] || [], [statusMap, c.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontWeight: 'bold', fontSize: 12 }}>{c.name}</div>
      <div style={{ fontSize: 11, opacity: 0.9 }}>{c.class?.name}</div>
      <div style={{ display: 'flex', gap: 6, fontSize: 11 }}>
        {/* ocultamos HP/SH textuales para evitar redundancia */}
      </div>
      <div className={`sprite-wrap ${actingId === c.id ? 'acting' : ''} ${hitId === c.id ? 'hit' : ''} ${lostHpId === c.id ? 'lost-hp' : ''} ${(hpMap[c.id] ?? c.stats.vida) <= 0 ? 'dead' : ''} ${statusList.length > 0 ? 'has-status' : ''}`} style={{ position: 'relative' }}>
        <div className="corner-badge atk">ATK {Math.floor((c.stats.ataque + (Array.isArray(c.items) ? c.items.filter(it => it.id === 'sword').length : 0) * 10) * (tempModsMap[c.id]?.attackMultiplier ?? 1))}</div>
        <div className="corner-badge spd">SPD {c.stats.velocidad}</div>
        <SpriteCanvas spriteIndex={c.spriteIndex} />
        <div className="status-effects-display">
          {statusList.map(status => (
            <div key={`${status.id}-${status.level}`} className="status-effect" style={{ backgroundColor: status.color }}>
              <span title={`${status.name} (Nivel ${status.level})`}>{status.name.substring(0, 3).toUpperCase()}{status.level}</span>
              {status.stacks > 1 && (
                <span className="status-stacks">x{status.stacks}</span>
              )}
              <span className="status-duration">({status.duration})</span>
            </div>
          ))}
        </div>
      </div>
      {/* ... el resto del componente (barras, detalles) se mantiene igual ... */}
      <div className="bars">
        <div className="bar hp">
          <div className="fill" style={{ width: `${Math.max(0, Math.min(1, (hpMap[c.id] ?? c.stats.vida) / c.stats.vida)) * 100}%` }} />
          <div className="label">HP {hpMap[c.id] ?? c.stats.vida} / {c.stats.vida}</div>
        </div>
        <div className="bar shield">
          <div className="fill" style={{ width: `${Math.max(0, (shieldMap[c.id] ?? c.stats.escudo) / c.stats.escudo) * 100}%` }} />
          <div className="label">SH {shieldMap[c.id] ?? c.stats.escudo} / {c.stats.escudo}</div>
        </div>
      </div>
      <details className="char-details">
        <summary>Detalles</summary>
        <div>
          <strong>Habilidad Activa:</strong> {c.activeAbility?.name || 'Ninguna'}
        </div>
        <div>
          <strong>Pasivas:</strong>
          {c.passives && c.passives.length > 0
            ? <ul>{c.passives.map((t, i) => <li key={i}>{t.name}</li>)}</ul>
            : ' Ninguno'
          }
        </div>
        <div>
          <strong>Objetos:</strong>
          {c.items && c.items.length > 0
            ? <ul>{c.items.map((it, i) => <li key={i}>{it.name}</li>)}</ul>
            : ' Ninguno'
          }
        </div>
        {torchActive && (
          <div>
            <strong>Efectos Temporales:</strong>
            <ul>
              <li>Antorcha (temp)</li>
            </ul>
          </div>
        )}
      </details>
    </div>
  );
}

export function BattleGrid(props) {
  const { title, team, hpMap, shieldMap, actingId, hitId, lostHpId, statusMap, tempModsMap, torchActive, selectedCharacterId, setSelectedCharacterId } = props;
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ color: '#fff', marginBottom: 8 }}>{title}</div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, minmax(100px, 1fr))', gap: 12,
      }}>
        {Array.from({ length: 8 }).map((_, idx) => {
          const c = team[idx]
          return (
            <div 
              key={idx} 
              style={{
                border: c && selectedCharacterId === c.id ? '2px solid yellow' : '1px solid rgba(255,255,255,0.12)', 
                borderRadius: 8, minHeight: 160, padding: 8, color: '#fff', background: 'rgba(255,255,255,0.03)',
                cursor: c ? 'pointer' : 'default'
              }}
              onClick={() => c && setSelectedCharacterId(c.id)}
            >
              {c ? (
                <CharacterDisplay c={c} hpMap={hpMap} shieldMap={shieldMap} actingId={actingId} hitId={hitId} lostHpId={lostHpId} statusMap={statusMap} tempModsMap={tempModsMap} torchActive={torchActive} isSelected={selectedCharacterId === c.id} />
              ) : (
                <span style={{ opacity: 0.6, fontSize: 12 }}>Vacío</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}