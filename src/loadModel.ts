import { FBXLoader, GLTFLoader } from 'three-stdlib'
import type { Object3D } from 'three'
import type { GLTF } from 'three-stdlib'

export async function loadModel(file: File): Promise<Object3D> {
  const url = URL.createObjectURL(file)
  const ext = file.name.split('.').pop()?.toLowerCase()
  return new Promise((resolve, reject) => {
    const cleanup = () => URL.revokeObjectURL(url)
    if (ext === 'fbx') {
      new FBXLoader().load(
        url,
        (obj: Object3D) => {
          cleanup()
          resolve(obj)
        },
        undefined,
        (err: unknown) => {
          cleanup()
          reject(err instanceof Error ? err : new Error(String(err)))
        },
      )
    } else if (ext === 'gltf' || ext === 'glb') {
      new GLTFLoader().load(
        url,
        (gltf: GLTF) => {
          cleanup()
          resolve(gltf.scene)
        },
        undefined,
        (err: unknown) => {
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
