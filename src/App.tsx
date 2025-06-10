import { useEffect, useState } from 'react'
import ThreeScene from './ThreeScene'
import ToolPanel from './ToolPanel'
import type { LineData, LineEnd, PointData } from './types'
import './App.css'

export default function App() {
  const [planes, setPlanes] = useState<number[]>([])

  const [points, setPoints] = useState<PointData[]>([])
  const [lines, setLines] = useState<LineData[]>([])
  const [lineStart, setLineStart] = useState<LineEnd | null>(null)
  const [tempLineEnd, setTempLineEnd] = useState<LineEnd | null>(null)
  const [mode, setMode] =
    useState<'idle' | 'move' | 'placePoint' | 'placeLine'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const addPlane = () => {
    setPlanes((prev) => [...prev, prev.length])
    setMessage('Plane added')
  }

  const toggleMove = () => {
    setMode((prev) => (prev === 'move' ? 'idle' : 'move'))
    setMessage(null)
  }

  const cancelMove = () => {
    setMode('idle')
  }

  const togglePointPlacement = () => {
    setLineStart(null)
    setTempLineEnd(null)
    setMode((prev) => {
      if (prev === 'placePoint') {
        setMessage(null)
        return 'idle'
      }
      setMessage('Click on an object to place a point')
      return 'placePoint'
    })
  }

  const toggleLineDrawing = () => {
    setLineStart(null)
    setTempLineEnd(null)
    setMode((prev) => {
      if (prev === 'placeLine') {
        setMessage(null)
        return 'idle'
      }
      setMessage('Click to set start of line')
      return 'placeLine'
    })
  }

  const handlePointAdd = (point: PointData) => {
    setPoints((prev) => [...prev, point])
    setMessage('Point added')
  }

  const handleLinePoint = (point: LineEnd) => {
    if (!lineStart) {
      setLineStart(point)
      setTempLineEnd(point)
      setMessage('Click to set end of line')
    } else {
      setLines((prev) => [...prev, { start: lineStart, end: point }])
      setLineStart(point)
      setTempLineEnd(point)
      setMessage('Click to set end of line')
    }
  }

  const cancelPointPlacement = () => {
    setMode('idle')
    setLineStart(null)
    setTempLineEnd(null)
    setMessage(null)
  }

  const cancelLineChain = () => {
    setLineStart(null)
    setTempLineEnd(null)
    if (mode === 'placeLine') {
      setMessage('Click to set start of line')
    }
  }

  useEffect(() => {
    if (message) {
      const id = setTimeout(() => setMessage(null), 2000)
      return () => clearTimeout(id)
    }
  }, [message])

  return (
    <div className="app">
      <ToolPanel
        onAddPlane={addPlane}
        pointEnabled={mode === 'placePoint'}
        onTogglePoint={togglePointPlacement}
        lineEnabled={mode === 'placeLine'}
        onToggleLine={toggleLineDrawing}
        moveEnabled={mode === 'move'}
        onToggleMove={toggleMove}
      />
      <ThreeScene
        planes={planes}
        points={points}
        lines={lines}
        tempLine={{ start: lineStart, end: tempLineEnd }}
        mode={mode}
        onAddPoint={handlePointAdd}
        onAddLinePoint={handleLinePoint}
        onUpdateTempLineEnd={setTempLineEnd}
        onCancelPointPlacement={cancelPointPlacement}
        onCancelLineChain={cancelLineChain}
        onCancelMove={cancelMove}
      />
      {message && <div className="message">{message}</div>}
    </div>
  )
}
