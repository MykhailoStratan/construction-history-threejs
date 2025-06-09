import { useState } from 'react'
import ThreeScene from './ThreeScene'
import ToolPanel from './ToolPanel'
import './App.css'

export default function App() {
  const [planes, setPlanes] = useState<number[]>([])

  const addPlane = () => {
    setPlanes((prev) => [...prev, prev.length])
  }

  return (
    <div className="app">
      <ToolPanel onAddPlane={addPlane} />
      <ThreeScene planes={planes} />
    </div>
  )
}
