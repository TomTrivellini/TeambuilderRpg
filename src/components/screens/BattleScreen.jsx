import { BattleGrid } from "../BattleGrid";
import { InventoryDisplay } from "../InventoryDisplay"; // Esta ruta ya debería ser correcta tras mover el archivo

export function BattleScreen(props) {
  const {
    orderedBySpeed,
    allies,
    rivals,
    selectedCharacterId,
    setSelectedCharacterId,
    inventory,
    isResolving,
    startRound,
    roundNumber,
    level,
    useConsumable,
    equipItem,
  } = props;

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <InventoryDisplay
        allies={allies}
        selectedCharacterId={selectedCharacterId}
        inventory={inventory}
        useConsumable={useConsumable}
        equipItem={equipItem}
      />
      <div style={{ flex: 1 }}>
        <div className="speed-bar">
          {orderedBySpeed.map(c => (
            <div key={c.id} className={`speed-chip ${allies.some(a=>a.id===c.id)?'ally':'rival'}`}>
              <span className="dot" />
              <span style={{opacity:0.9}}>{c.name}</span>
              <span style={{opacity:0.6}}>({c.stats.velocidad})</span>
            </div>
          ))}
        </div>
        <BattleGrid title="Aliados" team={allies} {...props} selectedCharacterId={selectedCharacterId} setSelectedCharacterId={setSelectedCharacterId} />
        <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'center', justifyContent:'center', marginTop: 8, marginBottom: 8 }}>
          <button onClick={startRound} disabled={isResolving}>
            {roundNumber===0 ? 'Empezar ronda' : (isResolving ? 'Resolviendo...' : 'Siguiente ronda')}
          </button>
          <span style={{ fontSize:12, opacity:0.8 }}>Ronda: {roundNumber}</span>
          <span style={{ fontSize:12, opacity:0.8 }}>Nivel: {level}</span>
        </div>
        <BattleGrid title="Rivales" team={rivals} {...props} selectedCharacterId={selectedCharacterId} setSelectedCharacterId={setSelectedCharacterId} />
      </div>
    </div>
  );
}