import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, TransformControls } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { DoubleSide, Object3D, Vector3, Quaternion } from 'three'
import type { BufferGeometry, BufferAttribute } from 'three'


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
  mode: 'select' | 'placePoint' | 'placeLine'
  onAddPoint: (point: PointData) => void
  onAddLinePoint: (point: LineEnd) => void
  onUpdateTempLineEnd: (point: LineEnd) => void
  registerObject: (id: string, obj: Object3D | null) => void
}) {
  const ref = useRef<Object3D>(null!)
  useEffect(() => {
    registerObject(objectId, ref.current)
    return () => registerObject(objectId, null)
  }, [objectId, registerObject])
  const isSelected = selectedObject != null && selectedObject === ref.current
  return (
    <mesh
      ref={ref}
      {...props}
      onPointerDown={(e) => {
        e.stopPropagation()
        const local = ref.current.worldToLocal(e.point.clone()).toArray() as [
          number,
          number,
          number,
        ]
        if (mode === 'placePoint') {
          if (e.button !== 0) return
          const normal = e.face?.normal?.clone()
          if (normal) {
            onAddPoint({
              objectId: objectId,
              position: local,
              normal: [normal.x, normal.y, normal.z],
            })
          }
        } else if (mode === 'placeLine') {
          if (e.button !== 0) return
          onAddLinePoint({ objectId: objectId, position: local })
        } else {
          onSelect(ref.current)
        }
      }}
      onPointerMove={(e) => {
        if (mode === 'placeLine') {
          const localMove = ref.current
            .worldToLocal(e.point.clone())
            .toArray() as [number, number, number]
          onUpdateTempLineEnd({ objectId: objectId, position: localMove })
        }
      }}
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
  mode: 'select' | 'placePoint' | 'placeLine'
  onAddPoint: (point: PointData) => void
  onAddLinePoint: (point: LineEnd) => void
  onUpdateTempLineEnd: (point: LineEnd) => void
  registerObject: (id: string, obj: Object3D | null) => void
}) {
  const ref = useRef<Object3D>(null!)
  useEffect(() => {
    registerObject(objectId, ref.current)
    return () => registerObject(objectId, null)
  }, [objectId, registerObject])
  const isSelected = selectedObject != null && selectedObject === ref.current
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      {...props}
      onPointerDown={(e) => {
        e.stopPropagation()
        const local = ref.current
          .worldToLocal(e.point.clone())
          .toArray() as [number, number, number]
        if (mode === 'placePoint') {
          if (e.button !== 0) return
          const normal = e.face?.normal?.clone()
          if (normal) {
            onAddPoint({
              objectId: objectId,
              position: local,
              normal: [normal.x, normal.y, normal.z],
            })
          }
        } else if (mode === 'placeLine') {
          if (e.button !== 0) return
          onAddLinePoint({ objectId: objectId, position: local })
        } else {
          onSelect(ref.current)
        }
      }}
      onPointerMove={(e) => {
        if (mode === 'placeLine') {
          const localMove = ref.current
            .worldToLocal(e.point.clone())
            .toArray() as [number, number, number]
          onUpdateTempLineEnd({ objectId: objectId, position: localMove })
        }
      }}
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

interface ThreeSceneProps {
  planes: number[]
  points: PointData[]
  lines: LineData[]
  tempLine: { start: LineEnd | null; end: LineEnd | null }
  mode: 'select' | 'placePoint' | 'placeLine'
  onAddPoint: (point: PointData) => void
  onAddLinePoint: (point: LineEnd) => void
  onUpdateTempLineEnd: (point: LineEnd) => void
  onCancelPointPlacement: () => void
}

export default function ThreeScene({
  planes,
  points,
  lines,
  tempLine,
  mode,
  onAddPoint,
  onAddLinePoint,
  onUpdateTempLineEnd,
  onCancelPointPlacement,
}: ThreeSceneProps) {
  const [selected, setSelected] = useState<Object3D | null>(null)
  const orbitRef = useRef<OrbitControlsImpl | null>(null)
  const objectMap = useRef<Record<string, Object3D | null>>({})
  const registerObject = (id: string, obj: Object3D | null) => {
    objectMap.current[id] = obj
  }

  useEffect(() => {
    // ensure nothing is selected on initial mount
    setSelected(null)
  }, [])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelected(null)
        if (mode === 'placePoint' || mode === 'placeLine')
          onCancelPointPlacement()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [mode, onCancelPointPlacement])

  return (
    <Canvas
      style={{ height: '100vh', width: '100vw' }}
      onContextMenu={(e) => {
        e.preventDefault()
        setSelected(null)
        if (mode === 'placePoint' || mode === 'placeLine')
          onCancelPointPlacement()
      }}
      onPointerMissed={() => {
        setSelected(null)
        if (mode === 'placePoint' || mode === 'placeLine')
          onCancelPointPlacement()
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
      {selected && (
        <TransformControls
          object={selected}
          mode="translate"
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
