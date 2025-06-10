import { useEffect, useState } from 'react'
import ThreeScene from './ThreeScene'
import ToolPanel from './ToolPanel'
import './App.css'
import { GLTFLoader } from 'three-stdlib'
import { IFCLoader } from 'web-ifc-three'
import type { Object3D } from 'three'

function useFileInput(callback: (file: File) => Promise<void> | void) {
  const [input] = useState(() => {
    const el = document.createElement('input')
    el.type = 'file'
    el.accept = '.gltf,.glb,.ifc'
    el.style.display = 'none'
    el.addEventListener('change', () => {
      const file = el.files?.[0]
      if (file) void callback(file)
      el.value = ''
    })
    document.body.appendChild(el)
    return el
  })
  return () => input.click()
}

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
  const [models, setModels] = useState<Object3D[]>([])
  const [lines, setLines] = useState<LineData[]>([])
  const [lineStart, setLineStart] = useState<LineEnd | null>(null)
  const [tempLineEnd, setTempLineEnd] = useState<LineEnd | null>(null)
  const [mode, setMode] = useState<'select' | 'placePoint' | 'placeLine'>(
    'select',
  )
  const [message, setMessage] = useState<string | null>(null)

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
    if (file.name.toLowerCase().endsWith('.gltf') || file.name.toLowerCase().endsWith('.glb')) {
      const loader = new GLTFLoader()
      const arrayBuffer = await file.arrayBuffer()
      const gltf = await loader.parseAsync(arrayBuffer, '')
      setModels((prev) => [...prev, gltf.scene])
      setMessage('Model added')
    } else if (file.name.toLowerCase().endsWith('.ifc')) {
      const loader = new IFCLoader()
      void loader.ifcManager.setWasmPath('/')
      const arrayBuffer = await file.arrayBuffer()
      const model = await loader.parse(arrayBuffer)
      setModels((prev) => [...prev, model])
      setMessage('Model added')
    }
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

  const triggerFileInput = useFileInput(loadModel)

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
        onUploadModel={triggerFileInput}
      />
      <ThreeScene
        planes={planes}
        points={points}
        lines={lines}
        models={models}
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
