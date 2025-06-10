import { useEffect, useState } from 'react'
import ThreeScene from './ThreeScene'
import ToolPanel from './ToolPanel'
import './App.css'

export default function App() {
  const [planes, setPlanes] = useState<number[]>([])
  interface PointData {
    objectId: string
    position: [number, number, number]
    normal: [number, number, number]
  }

  interface LineEnd {
    objectId: string
    position: [number, number, number]
  }

  interface LineData {
    start: LineEnd
    end: LineEnd
  }

  const [points, setPoints] = useState<PointData[]>([])
  const [lines, setLines] = useState<LineData[]>([])
  const [lineStart, setLineStart] = useState<LineEnd | null>(null)
  const [tempLineEnd, setTempLineEnd] = useState<LineEnd | null>(null)
  const [mode, setMode] = useState<'move' | 'placePoint' | 'placeLine'>('move')
  const [message, setMessage] = useState<string | null>(null)

  const addPlane = () => {
    setPlanes((prev) => [...prev, prev.length])
    setMessage('Plane added')
  }

  const enableMove = () => {
    setMode('move')
    setMessage(null)
  }

  const enablePointPlacement = () => {
    setMode('placePoint')
    setMessage('Click on an object to place a point')
  }

  const enableLineDrawing = () => {
    setLineStart(null)
    setTempLineEnd(null)
    setMode('placeLine')
    setMessage('Click to set start of line')
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
      setLineStart(null)
      setTempLineEnd(null)
      setMode('move')
      setMessage('Line added')
    }
  }

  const cancelPointPlacement = () => {
    setMode('move')
    setLineStart(null)
    setTempLineEnd(null)
    setMessage(null)
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
        onPlacePoint={enablePointPlacement}
        onDrawLine={enableLineDrawing}
        moveEnabled={mode === 'move'}
        onToggleMove={enableMove}
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
      />
      {message && <div className="message">{message}</div>}
    </div>
  )
}
