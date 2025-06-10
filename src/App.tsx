import { useEffect, useState } from 'react'
import ThreeScene from './ThreeScene'
import ToolPanel from './ToolPanel'
import './App.css'

export default function App() {
  const [planes, setPlanes] = useState<number[]>([])
  const [points, setPoints] = useState<[number, number, number][]>([])
  const [mode, setMode] = useState<'select' | 'placePoint'>('select')
  const [message, setMessage] = useState<string | null>(null)

  const addPlane = () => {
    setPlanes((prev) => [...prev, prev.length])
    setMessage('Plane added')
  }

  const enablePointPlacement = () => {
    setMode('placePoint')
    setMessage('Click on an object to place a point')
  }

  const handlePointAdd = (point: [number, number, number]) => {
    setPoints((prev) => [...prev, point])
    setMode('select')
    setMessage('Point added')
  }

  useEffect(() => {
    if (message) {
      const id = setTimeout(() => setMessage(null), 2000)
      return () => clearTimeout(id)
    }
  }, [message])

  return (
    <div className="app">
      <ToolPanel onAddPlane={addPlane} onPlacePoint={enablePointPlacement} />
      <ThreeScene
        planes={planes}
        points={points}
        mode={mode}
        onAddPoint={handlePointAdd}
      />
      {message && <div className="message">{message}</div>}
    </div>
  )
}
