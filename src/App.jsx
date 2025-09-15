import './App.css'
import { useGame } from './hooks/useGame.js'
import { ChooseScreen } from './components/screens/ChooseScreen.jsx'
import { BattleScreen } from './components/screens/BattleScreen.jsx'
import { RewardScreen } from './components/screens/RewardScreen.jsx'

function App() {
  const game = useGame()
  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          {game.mode !== 'choose' && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ padding:'4px 8px', borderRadius:999, background:'rgba(255,215,0,0.15)', border:'1px solid rgba(255,215,0,0.35)' }}>Oro: {game.gold}</span>
            </div>
          )}
        </div>

        {game.mode === 'choose' && <ChooseScreen {...game} />}
        {game.mode === 'battle' && <BattleScreen {...game} />}
        {game.mode === 'reward' && <RewardScreen {...game} />}

      </header>
    </div>
  )
}

export default App