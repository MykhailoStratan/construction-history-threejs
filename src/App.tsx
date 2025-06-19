import { useEffect, useRef, useState } from 'react'
import ThreeScene from './ThreeScene'
import ToolPanel from './ToolPanel'
import HeaderMenu from './HeaderMenu'
import type { LineData, LineEnd, PointData, UploadData } from './types'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { MeshStandardMaterial, Mesh, Object3D, DataTexture, RGBAFormat } from 'three'
import { gltfKhrPbrSpecularGlossinessConverter } from './gltfKhrPbrSpecularGlossinessConverter'
import './App.css'

const dracoLoader = new DRACOLoader()
const whitePixel = new Uint8Array([255, 255, 255, 255])
const defaultTexture = new DataTexture(whitePixel, 1, 1, RGBAFormat)
defaultTexture.needsUpdate = true

export default function App() {
  const [planes, setPlanes] = useState<number[]>([])

  const [points, setPoints] = useState<PointData[]>([])
  const [lines, setLines] = useState<LineData[]>([])
  const [uploads, setUploads] = useState<UploadData[]>([])
  const [focusUploadId, setFocusUploadId] = useState<number | null>(null)
  const uploadCounter = useRef(0)
  const [lineStart, setLineStart] = useState<LineEnd | null>(null)
  const [tempLineEnd, setTempLineEnd] = useState<LineEnd | null>(null)
  const [mode, setMode] =
    useState<'idle' | 'move' | 'placePoint' | 'placeLine' | 'edit'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [uiVisible, setUiVisible] = useState(true)

  const addPlane = () => {
    setPlanes((prev) => [...prev, prev.length])
    setMessage('Plane added')
  }

  const toggleMove = () => {
    setMode((prev) => (prev === 'move' ? 'idle' : 'move'))
    setMessage(null)
  }

  const toggleEdit = () => {
    setMode((prev) => (prev === 'edit' ? 'idle' : 'edit'))
    setMessage(null)
  }

  const toggleUI = () => {
    setUiVisible((prev) => !prev)
  }

  const cancelMove = () => {
    setMode('idle')
  }

  const loadModel = (file: File): Promise<Object3D> => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    const url = URL.createObjectURL(file)
    return new Promise((resolve, reject) => {
      const revoke = () => URL.revokeObjectURL(url)
      if (ext === 'fbx') {
        new FBXLoader().load(
          url,
          (obj) => {
            revoke()
            obj.traverse((c) => {
              if (c instanceof Mesh) {
                c.material = new MeshStandardMaterial({ map: defaultTexture })
              }
            })
            resolve(obj)
          },
          undefined,
          (err) => {
            revoke()
            reject(err instanceof Error ? err : new Error('Failed to load model'))
          },
        )
      } else if (ext === 'gltf' || ext === 'glb') {
        const loader = new GLTFLoader()
        loader.setDRACOLoader(dracoLoader)
        loader.register(gltfKhrPbrSpecularGlossinessConverter())
        loader.load(
          url,
          (gltf) => {
            revoke()
            gltf.scene.traverse((c) => {
              if (c instanceof Mesh) {
                c.material = new MeshStandardMaterial({ map: defaultTexture })
              }
            })
            resolve(gltf.scene)
          },
          undefined,
          (err) => {
            revoke()
            reject(err instanceof Error ? err : new Error('Failed to load model'))
          },
        )
      } else if (ext === 'stl') {
        new STLLoader().load(
          url,
          (geom) => {
            revoke()
            const mesh = new Mesh(geom, new MeshStandardMaterial({ map: defaultTexture }))
            resolve(mesh)
          },
          undefined,
          (err) => {
            revoke()
            reject(err instanceof Error ? err : new Error('Failed to load model'))
          },
        )
      } else {
        revoke()
        reject(new Error('Unsupported file type'))
      }
    })
  }

  const handleUpload = (files: FileList | null): void => {
    if (!files) return
    void (async () => {
      for (const file of Array.from(files)) {
        try {
          const object = await loadModel(file)
          const id = uploadCounter.current++
          setUploads((prev) => [...prev, { id, object }])
          setFocusUploadId(id)
          setMessage(`${file.name} loaded`)
        } catch (e) {
          console.error(e)
          setMessage(`Failed to load ${file.name}`)
        }
      }
    })()
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
      <ThreeScene
        planes={planes}
        points={points}
        lines={lines}
        uploads={uploads}
        focusUploadId={focusUploadId}
        tempLine={{ start: lineStart, end: tempLineEnd }}
        mode={mode}
        onAddPoint={handlePointAdd}
        onAddLinePoint={handleLinePoint}
        onUpdateTempLineEnd={setTempLineEnd}
        onCancelPointPlacement={cancelPointPlacement}
        onCancelLineChain={cancelLineChain}
        onCancelMove={cancelMove}
      />
      {uiVisible && <HeaderMenu />}
      <ToolPanel
        onAddPlane={addPlane}
        pointEnabled={mode === 'placePoint'}
        onTogglePoint={togglePointPlacement}
        lineEnabled={mode === 'placeLine'}
        onToggleLine={toggleLineDrawing}
        moveEnabled={mode === 'move'}
        onToggleMove={toggleMove}
        editEnabled={mode === 'edit'}
        onToggleEdit={toggleEdit}
        onToggleUI={toggleUI}
        onUpload={handleUpload}
      />
      {uiVisible && (
        <>
          <section id="home" className="menu-section">
            <h2>Home</h2>
          </section>
          <section id="services" className="menu-section">
            <h2>Services</h2>
          </section>
          <section id="prices" className="menu-section">
            <h2>Prices</h2>
          </section>
          <section id="contacts" className="menu-section">
            <h2>Contacts</h2>
          </section>
          <section id="about" className="menu-section">
            <h2>About</h2>
          </section>
        </>
      )}
      {message && <div className="message">{message}</div>}
    </div>
  )
}
