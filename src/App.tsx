import { useEffect, useState } from 'react'
import type { Object3D } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
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
  const [mode, setMode] = useState<'select' | 'placePoint' | 'placeLine'>(
    'select',
  )
  const [message, setMessage] = useState<string | null>(null)
  const [models, setModels] = useState<Object3D[]>([])

  const addPlane = () => {
    setPlanes((prev) => [...prev, prev.length])
    setMessage('Plane added')
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

  const loadModel = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    const url = URL.createObjectURL(file)
    let obj: Object3D | null = null
    try {
      if (ext === 'fbx') {
        const loader = new FBXLoader()
        obj = await loader.loadAsync(url)
      } else if (ext === 'gltf' || ext === 'glb') {
        const loader = new GLTFLoader()
        const gltf = await loader.loadAsync(url)
        obj = gltf.scene
      }
    } finally {
      URL.revokeObjectURL(url)
    }
    if (obj) {
      setModels((prev) => [...prev, obj])
      setMessage('Model added')
    }
  }

  const handleModelUpload = (file: File) => {
    void loadModel(file)
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
      setMode('select')
      setMessage('Line added')
    }
  }

  const cancelPointPlacement = () => {
    setMode('select')
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
        onUploadModel={handleModelUpload}
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
        models={models}
      />
      {message && <div className="message">{message}</div>}
    </div>
  )
}
