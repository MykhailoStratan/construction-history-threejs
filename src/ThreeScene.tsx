import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls } from '@react-three/drei'
import { useRef, useState } from 'react'
import type { JSX } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { DoubleSide, Object3D } from 'three'


function Box({ onSelect, ...props }: JSX.IntrinsicElements['mesh'] & { onSelect: (obj: Object3D) => void }) {
  const ref = useRef<Object3D>(null!)
  return (
    <mesh
      ref={ref}
      {...props}
      onClick={() => onSelect(ref.current)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

function Plane({ onSelect, ...props }: JSX.IntrinsicElements['mesh'] & { onSelect: (obj: Object3D) => void }) {
  const ref = useRef<Object3D>(null!)
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      {...props}
      onClick={() => onSelect(ref.current)}
    >
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="lightgray" side={DoubleSide} />
    </mesh>
  )
}
interface ThreeSceneProps {
  planes: number[]
}

export default function ThreeScene({ planes }: ThreeSceneProps) {
  const [selected, setSelected] = useState<Object3D | null>(null)
  const orbitRef = useRef<OrbitControlsImpl | null>(null)

  return (
    <Canvas
      style={{ height: '100vh', width: '100vw' }}
      onPointerMissed={() => setSelected(null)}
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box onSelect={setSelected} />
      {planes.map((id) => (
        <Plane key={id} position={[0, 0, 0]} onSelect={setSelected} />
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
      <OrbitControls ref={orbitRef} />
    </Canvas>
  )
}
