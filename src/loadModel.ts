/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import type { Object3D } from 'three'

export async function loadModel(file: File): Promise<Object3D> {
  const url = URL.createObjectURL(file)
  const ext = file.name.split('.').pop()?.toLowerCase()
  return new Promise((resolve, reject) => {
    const cleanup = () => URL.revokeObjectURL(url)
    if (ext === 'fbx') {
      new FBXLoader().load(
        url,
        (obj) => {
          cleanup()
          resolve(obj)
        },
        undefined,
        (err) => {
          cleanup()
          reject(err instanceof Error ? err : new Error(String(err)))
        },
      )
    } else if (ext === 'gltf' || ext === 'glb') {
      new GLTFLoader().load(
        url,
        (gltf) => {
          cleanup()
          resolve(gltf.scene)
        },
        undefined,
        (err) => {
          cleanup()
          reject(err instanceof Error ? err : new Error(String(err)))
        },
      )
    } else {
      cleanup()
      reject(new Error('Unsupported file type'))
    }
  })
}
