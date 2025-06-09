import { Canvas } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { OrbitControls, TransformControls, Line } from '@react-three/drei'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [current, setCurrent] = useState<Vector3[]>([])
  const [hover, setHover] = useState<Vector3 | null>(null)

  const snapPoint = useCallback(
    (p: Vector3) => {
      const snapCandidates: Vector3[] = []
      lines.forEach((ln) => {
        if (ln.length > 0) snapCandidates.push(ln[0], ln[ln.length - 1])
      })
      current.forEach((pt) => snapCandidates.push(pt))
      let nearest: Vector3 | null = null
      let minDist = Infinity
      for (const pt of snapCandidates) {
        const dist = pt.distanceTo(p)
        if (dist < 0.2 && dist < minDist) {
          nearest = pt
          minDist = dist
        }
      }
      return nearest ? nearest.clone() : p
    },
    [lines, current],
  )

  const addLinePoint = useCallback(
    (p: Vector3) => {
      const snapped = snapPoint(p)
      setCurrent((cur) => [...cur, snapped])
      setHover(null)
    },
    [snapPoint],
  )

  const finalizeLine = useCallback(() => {
    setHover(null)
    setCurrent((cur) => {
      if (cur.length > 1) setLines((ls) => [...ls, cur])
      return []
    })
  }, [])

  useEffect(() => {
    if (!lineMode && current.length > 0) finalizeLine()
  }, [lineMode, current.length, finalizeLine])

  useEffect(() => {
    // ensure nothing is selected on initial mount
    setSelected(null)
  }, [])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') finalizeLine()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [finalizeLine])

  return (
    <Canvas
      style={{ height: '100vh', width: '100vw' }}
      onContextMenu={(e) => {
        e.preventDefault()
        finalizeLine()
        setSelected(null)
      }}
      onPointerMissed={() => {
        if (!lineMode) setSelected(null)
      }}
      onPointerMove={(e) => {
        const ev = e as unknown as ThreeEvent<PointerEvent>
        if (lineMode && current.length > 0) {
          setHover(snapPoint(ev.point.clone()))
        }
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
        <group key={idx}>
          <Line points={pts} color="yellow" lineWidth={2} />
          <mesh position={pts[0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="red" />
          </mesh>
          <mesh position={pts[pts.length - 1]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="red" />
          </mesh>
        </group>
      ))}
      {current.length > 1 && <Line points={current} color="yellow" lineWidth={2} />}
      {current.map((pt, idx) => (
        <mesh key={`p${idx}`} position={pt}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
      ))}
      {hover && current.length > 0 && (
        <Line
          points={[current[current.length - 1], hover]}
          color="yellow"
          lineWidth={2}
        />
      )}
      <OrbitControls ref={orbitRef} />
    </Canvas>
  )
}
