import { Canvas } from '@react-three/fiber'
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
  ...props
}: JSX.IntrinsicElements['mesh'] & {
  onSelect: (obj: Object3D) => void
  selectedObject: Object3D | null
  mode: 'select' | 'placePoint'
  onAddPoint: (point: PointData) => void
}) {
  const ref = useRef<Object3D>(null!)
  const isSelected = selectedObject != null && selectedObject === ref.current
  return (
    <mesh
      ref={ref}
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
        } else {
          onSelect(ref.current)
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
  onSelect,
  selectedObject,
  mode,
  onAddPoint,
  ...props
}: JSX.IntrinsicElements['mesh'] & {
  onSelect: (obj: Object3D) => void
  selectedObject: Object3D | null
  mode: 'select' | 'placePoint'
  onAddPoint: (point: PointData) => void
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
        } else {
          onSelect(ref.current)
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

interface ThreeSceneProps {
  planes: number[]
  points: PointData[]
  mode: 'select' | 'placePoint'
  onAddPoint: (point: PointData) => void
  onCancelPointPlacement: () => void
}

export default function ThreeScene({
  planes,
  points,
  mode,
  onAddPoint,
  onCancelPointPlacement,
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
        if (mode === 'placePoint') onCancelPointPlacement()
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
        if (mode === 'placePoint') onCancelPointPlacement()
      }}
      onPointerMissed={() => {
        setSelected(null)
        if (mode === 'placePoint') onCancelPointPlacement()
      }}
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box
        onSelect={setSelected}
        selectedObject={selected}
        mode={mode}
        onAddPoint={onAddPoint}
      />
      {planes.map((id) => (
        <Plane
          key={id}
          position={[0, 0, 0]}
          onSelect={setSelected}
          selectedObject={selected}
          mode={mode}
          onAddPoint={onAddPoint}
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
