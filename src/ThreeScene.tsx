import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { JSX } from 'react'

import type { Mesh } from 'three'

function Box(props: JSX.IntrinsicElements['mesh']) {
  const ref = useRef<Mesh>(null!)
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.x += 0.01
    ref.current.rotation.y += 0.01
  })
  return (
    <mesh ref={ref} {...props}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export default function ThreeScene() {
  return (
    <Canvas style={{ height: '100vh', width: '100vw' }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box />
    </Canvas>
  )
}
