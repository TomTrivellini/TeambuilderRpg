import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>TeamBuilder RPG</h1>
        <p>¡Bienvenido a tu nueva aventura!</p>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Contador: {count}
          </button>
        </div>
      </header>
    </div>
  )
}

export default App
