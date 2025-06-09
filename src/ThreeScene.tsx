import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls, Line } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { DoubleSide, Object3D, Vector3 } from 'three'


function Box({
  onSelect,
  selectedObject,
  lineMode,
  onLinePoint,
  ...props
}: JSX.IntrinsicElements['mesh'] & {
  onSelect: (obj: Object3D) => void
  selectedObject: Object3D | null
  lineMode: boolean
  onLinePoint: (p: Vector3) => void
}) {
  const ref = useRef<Object3D>(null!)
  const isSelected = selectedObject != null && selectedObject === ref.current
  return (
    <mesh
      ref={ref}
      {...props}
      onPointerDown={(e) => {
        e.stopPropagation()
        if (lineMode) {
          onLinePoint(e.point.clone())
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
  lineMode,
  onLinePoint,
  ...props
}: JSX.IntrinsicElements['mesh'] & {
  onSelect: (obj: Object3D) => void
  selectedObject: Object3D | null
  lineMode: boolean
  onLinePoint: (p: Vector3) => void
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
        if (lineMode) {
          onLinePoint(e.point.clone())
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
interface ThreeSceneProps {
  planes: number[]
  lineMode: boolean
}

export default function ThreeScene({ planes, lineMode }: ThreeSceneProps) {
  const [selected, setSelected] = useState<Object3D | null>(null)
  const orbitRef = useRef<OrbitControlsImpl | null>(null)
  const [lines, setLines] = useState<Vector3[][]>([])
  const pending = useRef<Vector3[]>([])

  const addLinePoint = (p: Vector3) => {
    const next = [...pending.current, p]
    if (next.length === 2) {
      setLines((ls) => [...ls, [next[0], next[1]]])
      pending.current = []
    } else {
      pending.current = next
    }
  }

  useEffect(() => {
    // ensure nothing is selected on initial mount
    setSelected(null)
  }, [])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <Canvas
      style={{ height: '100vh', width: '100vw' }}
      onContextMenu={(e) => {
        e.preventDefault()
        setSelected(null)
      }}
      onPointerMissed={() => {
        if (!lineMode) setSelected(null)
      }}
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box
        onSelect={setSelected}
        selectedObject={selected}
        lineMode={lineMode}
        onLinePoint={addLinePoint}
      />
      {planes.map((id) => (
        <Plane
          key={id}
          position={[0, 0, 0]}
          onSelect={setSelected}
          selectedObject={selected}
          lineMode={lineMode}
          onLinePoint={addLinePoint}
        />
      ))}
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
      {lines.map((pts, idx) => (
        <Line key={idx} points={pts} color="yellow" lineWidth={2} />
      ))}
      <OrbitControls ref={orbitRef} />
    </Canvas>
  )
}
