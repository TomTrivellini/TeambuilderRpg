import { SpriteCanvas } from "../ui/SpriteCanvas";

export function RewardScreen({ gold, rewardOptions, allies, acceptReward, sellAlly }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ color: '#fff', marginBottom: 12 }}>¡Victoria! Recompensa: +5 oro. Oro actual: {gold}</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {rewardOptions.map(c => (
          <div key={c.id} style={{ border: '1px solid #444', borderRadius: 8, padding: 12, width: 260, background: '#1f1f1f', color: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontWeight:'bold' }}>{c.name}</div>
              {/* <div style={{ fontSize:12, opacity:0.9 }}>Lv {c.level}</div> */}
            </div>
            <div className="sprite-wrap"><SpriteCanvas spriteIndex={c.spriteIndex} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:6, fontSize:12 }}>
              <div>ATK: {c.stats.ataque}</div>
              <div>SPD: {c.stats.velocidad}</div>
              <div>HP: {c.stats.vida}</div>
              <div>SH: {c.stats.escudo}</div>
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
              <div style={{ fontSize:11 }}>
                <div style={{ opacity:0.8 }}>Pasivas:</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {c.passives.map((t,i)=>(<span key={i} style={{ padding:'2px 6px', borderRadius:6, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)' }}>{t.name||t.id}</span>))}
                </div>
              </div>
            )}
            {Array.isArray(c.items) && c.items.length > 0 && (
              <div style={{ fontSize:11 }}>
                <div style={{ opacity:0.8 }}>Objetos:</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {c.items.map((it,i)=>(<span key={i} style={{ padding:'2px 6px', borderRadius:6, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)' }}>{it.name||it.id}</span>))}
                </div>
              </div>
            )}
            <button disabled={allies.length>=8} onClick={()=>acceptReward(c)}>{allies.length>=8 ? 'Equipo lleno' : 'Reclutar'}</button>
          </div>
        ))}
      </div>
      <div style={{ marginTop:12 }}>
        <button onClick={()=>acceptReward(null)}>Saltar recompensa</button>
      </div>
      <div style={{ marginTop:16, color:'#fff' }}>
        <div style={{ marginBottom:8, opacity:0.9, fontSize:12 }}>Tu equipo (vender para hacer espacio):</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
          {allies.map(a => (
            <div key={a.id} style={{ border:'1px solid #444', borderRadius:8, padding:8, minWidth:160, background:'#202225' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12 }}>{a.name}</span>
                {/* <span style={{ fontSize:11, opacity:0.8 }}>Lv {a.level||1}</span> */}
              </div>
              <button style={{ marginTop:6, width:'100%' }} onClick={()=>sellAlly(a.id)}>Vender (+1 oro)</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}