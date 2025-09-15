import { CharacterCard } from "../CharacterCard";

export function ChooseScreen({ rounds, roundIndex, handlePick, allies }) {
  if (rounds.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ color: '#fff', marginBottom: 12 }}>Elegí un personaje ({roundIndex + 1}/3)</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {rounds[roundIndex]?.map(c => <CharacterCard key={c.id} character={c} onPick={handlePick} />)}
      </div>
    </div>
  );
}