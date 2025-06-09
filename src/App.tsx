import { useEffect, useState } from 'react'
import ThreeScene from './ThreeScene'
import ToolPanel from './ToolPanel'
import './App.css'

export default function App() {
  const [planes, setPlanes] = useState<number[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [lineMode, setLineMode] = useState<boolean>(false)

  const addPlane = () => {
    setPlanes((prev) => [...prev, prev.length])
    setMessage('Plane added')
  }

  useEffect(() => {
    if (message) {
      const id = setTimeout(() => setMessage(null), 2000)
      return () => clearTimeout(id)
    }
  }, [message])

  return (
    <div className="app">
      <ToolPanel onAddPlane={addPlane} lineMode={lineMode} toggleLineMode={() => setLineMode((prev) => !prev)} />
      <ThreeScene planes={planes} lineMode={lineMode} />
      {message && <div className="message">{message}</div>}
    </div>
  )
}
