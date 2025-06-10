import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls, TransformControls } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { DoubleSide, Object3D, Vector3, Quaternion } from 'three'


function Box({
  onSelect,
  selectedObject,
  mode,
  onAddPoint,
  onAddLinePoint,
  onUpdateTempLineEnd,
  ...props
}: JSX.IntrinsicElements['mesh'] & {
  onSelect: (obj: Object3D) => void
  selectedObject: Object3D | null
  mode: 'select' | 'placePoint' | 'placeLine'
  onAddPoint: (point: PointData) => void
  onAddLinePoint: (point: [number, number, number]) => void
  onUpdateTempLineEnd: (point: [number, number, number]) => void
}) {
  const ref = useRef<Object3D>(null!)
  const isSelected = selectedObject != null && selectedObject === ref.current
  return (
    <mesh
      ref={ref}
      {...props}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        if (mode === 'placePoint') {
          if (e.button !== 0) return
          const normal = e.face?.normal
            ?.clone()
            .transformDirection(e.object.matrixWorld)
          if (normal) {
            onAddPoint({
              position: [e.point.x, e.point.y, e.point.z],
              normal: [normal.x, normal.y, normal.z],
            })
          }
        } else if (mode === 'placeLine') {
          if (e.button !== 0) return
          onAddLinePoint([e.point.x, e.point.y, e.point.z])
        } else {
          onSelect(ref.current)
        }
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        if (mode === 'placeLine') {
          onUpdateTempLineEnd([e.point.x, e.point.y, e.point.z])
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
function Model({
  object,
  onSelect,
  mode,
  onAddPoint,
  onAddLinePoint,
  onUpdateTempLineEnd,
}: {
  object: Object3D
  onSelect: (obj: Object3D) => void
  mode: 'select' | 'placePoint' | 'placeLine'
  onAddPoint: (point: PointData) => void
  onAddLinePoint: (point: [number, number, number]) => void
  onUpdateTempLineEnd: (point: [number, number, number]) => void
} & JSX.IntrinsicElements['primitive']) {
  const ref = useRef<Object3D>(null!)
  return (
    <primitive
      object={object}
      ref={ref}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        if (mode === 'placePoint') {
          if (e.button !== 0) return
          const normal = e.face?.normal
            ?.clone()
            .transformDirection(e.object.matrixWorld)
          if (normal) {
            onAddPoint({
              position: [e.point.x, e.point.y, e.point.z],
              normal: [normal.x, normal.y, normal.z],
            })
          }
        } else if (mode === 'placeLine') {
          if (e.button !== 0) return
          onAddLinePoint([e.point.x, e.point.y, e.point.z])
        } else {
          onSelect(ref.current)
        }
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        if (mode === 'placeLine') {
          onUpdateTempLineEnd([e.point.x, e.point.y, e.point.z])
        }
      }}
    />
  )
}

function Plane({
  onSelect,
  selectedObject,
  mode,
  onAddPoint,
  onAddLinePoint,
  onUpdateTempLineEnd,
  ...props
}: JSX.IntrinsicElements['mesh'] & {
  onSelect: (obj: Object3D) => void
  selectedObject: Object3D | null
  mode: 'select' | 'placePoint' | 'placeLine'
  onAddPoint: (point: PointData) => void
  onAddLinePoint: (point: [number, number, number]) => void
  onUpdateTempLineEnd: (point: [number, number, number]) => void
}) {
  const ref = useRef<Object3D>(null!)
  const isSelected = selectedObject != null && selectedObject === ref.current
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      {...props}
      onPointerDown={(e) => {
        e.stopPropagation()
        if (mode === 'placePoint') {
          if (e.button !== 0) return
          const normal = e.face?.normal
            ?.clone()
            .transformDirection(e.object.matrixWorld)
          if (normal) {
            onAddPoint({
              position: [e.point.x, e.point.y, e.point.z],
              normal: [normal.x, normal.y, normal.z],
            })
          }
        } else if (mode === 'placeLine') {
          if (e.button !== 0) return
          onAddLinePoint([e.point.x, e.point.y, e.point.z])
        } else {
          onSelect(ref.current)
        }
      }}
      onPointerMove={(e) => {
        if (mode === 'placeLine') {
          onUpdateTempLineEnd([e.point.x, e.point.y, e.point.z])
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
  position: [number, number, number]
  normal: [number, number, number]
}

interface LineData {
  start: [number, number, number] | null
  end: [number, number, number] | null
}

interface ThreeSceneProps {
  planes: number[]
  points: PointData[]
  lines: { start: [number, number, number]; end: [number, number, number] }[]
  tempLine: LineData
  mode: 'select' | 'placePoint' | 'placeLine'
  onAddPoint: (point: PointData) => void
  onAddLinePoint: (point: [number, number, number]) => void
  onUpdateTempLineEnd: (point: [number, number, number]) => void
  onCancelPointPlacement: () => void
  models: Object3D[]
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
  models,
}: ThreeSceneProps) {
  const [selected, setSelected] = useState<Object3D | null>(null)
  const orbitRef = useRef<OrbitControlsImpl | null>(null)

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
        onSelect={setSelected}
        selectedObject={selected}
        mode={mode}
        onAddPoint={onAddPoint}
        onAddLinePoint={onAddLinePoint}
        onUpdateTempLineEnd={onUpdateTempLineEnd}
      />
      {models.map((m, idx) => (
        <Model
          key={idx}
          object={m}
          onSelect={setSelected}
          selectedObject={selected}
          mode={mode}
          onAddPoint={onAddPoint}
          onAddLinePoint={onAddLinePoint}
          onUpdateTempLineEnd={onUpdateTempLineEnd}
        />
      ))}
      {planes.map((id) => (
        <Plane
          key={id}
          position={[0, 0, 0]}
          onSelect={setSelected}
          selectedObject={selected}
          mode={mode}
          onAddPoint={onAddPoint}
          onAddLinePoint={onAddLinePoint}
          onUpdateTempLineEnd={onUpdateTempLineEnd}
        />
      ))}
      {points.map((p, idx) => {
        const normalVec = new Vector3(...p.normal).normalize()
        const quaternion = new Quaternion().setFromUnitVectors(
          new Vector3(0, 0, 1),
          normalVec,
        )
        const position = new Vector3(...p.position)
          .add(normalVec.clone().multiplyScalar(0.01))
          .toArray()
        return (
          <mesh key={idx} position={position} quaternion={quaternion}>
            <circleGeometry args={[0.01, 16]} />
            <meshStandardMaterial color="red" side={DoubleSide} />
          </mesh>
        )
      })}
      {lines.map((l, idx) => (
        <line key={idx}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([...l.start, ...l.end]), 3]}
              count={2}
            />
          </bufferGeometry>
          <lineBasicMaterial color="yellow" />
        </line>
      ))}
      {tempLine.start && tempLine.end && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([...tempLine.start, ...tempLine.end]), 3]}
              count={2}
            />
          </bufferGeometry>
          <lineBasicMaterial color="yellow" linewidth={1} />
        </line>
      )}
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
