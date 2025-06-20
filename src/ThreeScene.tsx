import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, TransformControls } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import {
  DoubleSide,
  Object3D,
  Vector3,
  Quaternion,
  Box3,
  SpotLight,
  Mesh,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial,
} from 'three'
import type { BufferGeometry, BufferAttribute } from 'three'
import type { LineData, LineEnd, PointData, UploadData } from './types'
import { useObjectInteractions } from './useObjectInteractions'

function applyHighlight(object: Object3D, highlight: boolean) {
  object.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh
      if (highlight) {
        if (!mesh.userData.__edgeHelper) {
          const edges = new EdgesGeometry(mesh.geometry)
          const line = new LineSegments(
            edges,
            new LineBasicMaterial({ color: '#ffff00' }),
          )
          mesh.add(line)
          mesh.userData.__edgeHelper = line
        }
      } else if (mesh.userData.__edgeHelper) {
        const line = mesh.userData.__edgeHelper as LineSegments
        mesh.remove(line)
        line.geometry.dispose()
        ;(line.material as LineBasicMaterial).dispose()
        delete mesh.userData.__edgeHelper
      }
    }
  })
}


function Box({
  objectId,
  onSelect,
  selectedObject,
  mode,
  onAddPoint,
  onAddLinePoint,
  onUpdateTempLineEnd,
  registerObject,
  ...props
}: JSX.IntrinsicElements['mesh'] & {
  objectId: string
  onSelect: (obj: Object3D) => void
  selectedObject: Object3D | null
  mode: 'idle' | 'move' | 'placePoint' | 'placeLine' | 'edit'
  onAddPoint: (point: PointData) => void
  onAddLinePoint: (point: LineEnd) => void
  onUpdateTempLineEnd: (point: LineEnd) => void
  registerObject: (id: string, obj: Object3D | null) => void
}) {
  const {
    ref,
    isSelected,
    handlePointerDown,
    handlePointerMove,
    handlePointerOut,
  } = useObjectInteractions({
    objectId,
    onSelect,
    selectedObject,
    mode,
    onAddPoint,
    onAddLinePoint,
    onUpdateTempLineEnd,
    registerObject,
  })
  return (
    <mesh
      ref={ref}
      {...props}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={isSelected ? '#00008B' : 'orange'}
        transparent
        opacity={isSelected ? 0.8 : 1}
      />
    </mesh>
  )
}

function Plane({
  objectId,
  onSelect,
  selectedObject,
  mode,
  onAddPoint,
  onAddLinePoint,
  onUpdateTempLineEnd,
  registerObject,
  ...props
}: JSX.IntrinsicElements['mesh'] & {
  objectId: string
  onSelect: (obj: Object3D) => void
  selectedObject: Object3D | null
  mode: 'idle' | 'move' | 'placePoint' | 'placeLine' | 'edit'
  onAddPoint: (point: PointData) => void
  onAddLinePoint: (point: LineEnd) => void
  onUpdateTempLineEnd: (point: LineEnd) => void
  registerObject: (id: string, obj: Object3D | null) => void
}) {
  const {
    ref,
    isSelected,
    handlePointerDown,
    handlePointerMove,
    handlePointerOut,
  } = useObjectInteractions({
    objectId,
    onSelect,
    selectedObject,
    mode,
    onAddPoint,
    onAddLinePoint,
    onUpdateTempLineEnd,
    registerObject,
  })
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      {...props}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial
        color={isSelected ? '#00008B' : 'lightgray'}
        side={DoubleSide}
        transparent
        opacity={isSelected ? 0.8 : 1}
      />
    </mesh>
  )
}

function PointObject({ point, objectMap }: { point: PointData; objectMap: React.MutableRefObject<Record<string, Object3D | null>> }) {
  const ref = useRef<Object3D>(null!)
  useFrame(() => {
    const obj = objectMap.current[point.objectId]
    if (!obj) return
    const normalVec = new Vector3(...point.normal)
      .applyQuaternion(obj.quaternion)
      .normalize()
    const quaternion = new Quaternion().setFromUnitVectors(
      new Vector3(0, 0, 1),
      normalVec,
    )
    const position = new Vector3(...point.position)
      .applyMatrix4(obj.matrixWorld)
      .add(normalVec.clone().multiplyScalar(0.01))
    ref.current.position.copy(position)
    ref.current.quaternion.copy(quaternion)
  })
  return (
    <mesh ref={ref}>
      <circleGeometry args={[0.01, 16]} />
      <meshStandardMaterial color="red" side={DoubleSide} />
    </mesh>
  )
}

function LineObject({ line, objectMap }: { line: LineData; objectMap: React.MutableRefObject<Record<string, Object3D | null>> }) {
  const geomRef = useRef<BufferGeometry>(null!)
  useFrame(() => {
    const startObj = objectMap.current[line.start.objectId]
    const endObj = objectMap.current[line.end.objectId]
    if (!startObj || !endObj) return
    const start = new Vector3(...line.start.position).applyMatrix4(startObj.matrixWorld)
    const end = new Vector3(...line.end.position).applyMatrix4(endObj.matrixWorld)
    const attr = geomRef.current.attributes.position as BufferAttribute
    attr.setXYZ(0, start.x, start.y, start.z)
    attr.setXYZ(1, end.x, end.y, end.z)
    attr.needsUpdate = true
  })
  return (
    <line>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[new Float32Array(6), 3]} count={2} />
      </bufferGeometry>
      <lineBasicMaterial color="yellow" />
    </line>
  )
}

function UploadedObject({
  objectId,
  object,
  onSelect,
  selectedObject,
  mode,
  onAddPoint,
  onAddLinePoint,
  onUpdateTempLineEnd,
  registerObject,
  highlight,
}: {
  objectId: string
  object: Object3D
  onSelect: (obj: Object3D) => void
  selectedObject: Object3D | null
  mode: 'idle' | 'move' | 'placePoint' | 'placeLine' | 'edit'
  onAddPoint: (point: PointData) => void
  onAddLinePoint: (point: LineEnd) => void
  onUpdateTempLineEnd: (point: LineEnd) => void
  registerObject: (id: string, obj: Object3D | null) => void
  highlight: boolean
}) {
  const {
    ref,
    handlePointerDown,
    handlePointerMove,
    handlePointerOut,
  } = useObjectInteractions({
    objectId,
    onSelect,
    selectedObject,
    mode,
    onAddPoint,
    onAddLinePoint,
    onUpdateTempLineEnd,
    registerObject,
  })
  const spotRef = useRef<SpotLight>(null!)
  const [center, setCenter] = useState<[number, number, number]>([0, 0, 0])
  useEffect(() => {
    const box = new Box3().setFromObject(object)
    const c = box.getCenter(new Vector3())
    setCenter([c.x, c.y, c.z])
  }, [object])
  useEffect(() => {
    if (highlight && spotRef.current) {
      spotRef.current.target.position.set(center[0], center[1], center[2])
      spotRef.current.target.updateMatrixWorld()
    }
  }, [highlight, center])
  return (
    <group>
      {highlight && (
        <spotLight
          ref={spotRef}
          position={[center[0], center[1] + 5, center[2] + 5]}
          intensity={1.5}
        />
      )}
      <primitive
        ref={ref}
        object={object}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      />
    </group>
  )
}

interface ThreeSceneProps {
  planes: number[]
  points: PointData[]
  lines: LineData[]
  uploads: UploadData[]
  focusUploadId: number | null
  tempLine: { start: LineEnd | null; end: LineEnd | null }
  mode: 'idle' | 'move' | 'placePoint' | 'placeLine' | 'edit'
  onAddPoint: (point: PointData) => void
  onAddLinePoint: (point: LineEnd) => void
  onUpdateTempLineEnd: (point: LineEnd) => void
  onCancelPointPlacement: () => void
  onCancelLineChain: () => void
  onCancelMove: () => void
}

export default function ThreeScene({
  planes,
  points,
  lines,
  uploads,
  focusUploadId,
  tempLine,
  mode,
  onAddPoint,
  onAddLinePoint,
  onUpdateTempLineEnd,
  onCancelPointPlacement,
  onCancelLineChain,
  onCancelMove,
}: ThreeSceneProps) {
  const [selected, setSelected] = useState<Object3D | null>(null)
  const centerRef = useRef<Object3D>(new Object3D())
  const lastCenter = useRef<Vector3>(new Vector3())
  const orbitRef = useRef<OrbitControlsImpl | null>(null)
  const objectMap = useRef<Record<string, Object3D | null>>({})
  const registerObject = (id: string, obj: Object3D | null) => {
    objectMap.current[id] = obj
  }

  useEffect(() => {
    if (!selected) return
    const box = new Box3().setFromObject(selected)
    const center = box.getCenter(new Vector3())
    centerRef.current.position.copy(center)
    lastCenter.current.copy(center)
  }, [selected])

  useEffect(() => {
    if (mode !== 'edit' || !selected) return
    applyHighlight(selected, true)
    return () => {
      applyHighlight(selected, false)
    }
  }, [selected, mode])

  useEffect(() => {
    // ensure nothing is selected on initial mount
    setSelected(null)
  }, [])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelected(null)
        if (mode === 'placePoint' || mode === 'placeLine') {
          onCancelPointPlacement()
        } else if (mode === 'move' || mode === 'edit') {
          onCancelMove()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [mode, onCancelPointPlacement, onCancelMove])

  useEffect(() => {
    if (focusUploadId == null || !orbitRef.current) return
    const obj = objectMap.current[`upload-${focusUploadId}`]
    if (!obj) return
    const box = new Box3().setFromObject(obj)
    const center = box.getCenter(new Vector3())
    const size = box.getSize(new Vector3()).length()
    orbitRef.current.target.copy(center)
    const camera = orbitRef.current.object
    const dir = new Vector3().subVectors(camera.position, orbitRef.current.target).normalize()
    camera.position.copy(center.clone().add(dir.multiplyScalar(size * 1.5)))
    orbitRef.current.update()
  }, [focusUploadId, uploads])

  return (
    <Canvas
      style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '100vw', zIndex: 0 }}
      onContextMenu={(e) => {
        e.preventDefault()
        setSelected(null)
        if (mode === 'placeLine') onCancelLineChain()
      }}
      onPointerMissed={() => {
        setSelected(null)
        if (mode === 'placeLine') onCancelLineChain()
      }}
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box
        objectId="box"
        onSelect={setSelected}
        selectedObject={selected}
        mode={mode}
        onAddPoint={onAddPoint}
        onAddLinePoint={onAddLinePoint}
        onUpdateTempLineEnd={onUpdateTempLineEnd}
        registerObject={registerObject}
      />
      {uploads.map((u) => (
        <UploadedObject
          key={u.id}
          objectId={`upload-${u.id}`}
          object={u.object}
          highlight={focusUploadId === u.id}
          onSelect={setSelected}
          selectedObject={selected}
          mode={mode}
          onAddPoint={onAddPoint}
          onAddLinePoint={onAddLinePoint}
          onUpdateTempLineEnd={onUpdateTempLineEnd}
          registerObject={registerObject}
        />
      ))}
      {planes.map((id) => (
        <Plane
          key={id}
          objectId={`plane-${id}`}
          position={[0, 0, 0]}
          onSelect={setSelected}
          selectedObject={selected}
          mode={mode}
          onAddPoint={onAddPoint}
          onAddLinePoint={onAddLinePoint}
          onUpdateTempLineEnd={onUpdateTempLineEnd}
          registerObject={registerObject}
        />
      ))}
      {points.map((p, idx) => (
        <PointObject key={idx} point={p} objectMap={objectMap} />
      ))}
      {lines.map((l, idx) => {
        if (!objectMap.current[l.start.objectId] || !objectMap.current[l.end.objectId]) return null
        return <LineObject key={idx} line={l} objectMap={objectMap} />
      })}
      {tempLine.start && tempLine.end && (() => {
        if (!objectMap.current[tempLine.start.objectId] || !objectMap.current[tempLine.end.objectId]) return null
        return <LineObject line={{ start: tempLine.start, end: tempLine.end }} objectMap={objectMap} />
      })()}
      {selected && (mode === 'move' || mode === 'edit') && (
        <TransformControls
          object={centerRef.current}
          mode="translate"
          onObjectChange={() => {
            if (!selected) return
            const newPos = centerRef.current.position.clone()
            const delta = newPos.clone().sub(lastCenter.current)
            lastCenter.current.copy(newPos)
            const worldPos = selected.getWorldPosition(new Vector3()).add(delta)
            if (selected.parent) {
              selected.position.copy(selected.parent.worldToLocal(worldPos))
            } else {
              selected.position.copy(worldPos)
            }
          }}
          onMouseDown={() => {
            if (orbitRef.current) orbitRef.current.enabled = false
          }}
          onMouseUp={() => {
            if (orbitRef.current) orbitRef.current.enabled = true
          }}
        />
      )}
      <OrbitControls ref={orbitRef} />
    </Canvas>
  )
}
