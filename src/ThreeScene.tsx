import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { JSX } from 'react'
import { DoubleSide } from 'three'


function Box(props: JSX.IntrinsicElements['mesh']) {
  return (
    <mesh {...props}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

function Plane(props: JSX.IntrinsicElements['mesh']) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} {...props}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="lightgrey" side={DoubleSide} />
    </mesh>
  )
}
interface ThreeSceneProps {
  planes: number[]
}

export default function ThreeScene({ planes }: ThreeSceneProps) {
  return (
    <Canvas style={{ height: '100vh', width: '100vw' }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box />
      {planes.map((id) => (
        <Plane key={id} position={[0, 0, 0]} />
      ))}
      <OrbitControls />
    </Canvas>
  )
}
