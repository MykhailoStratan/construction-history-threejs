import { useEffect, useRef } from 'react'
import type { Object3D } from 'three'
import { Mesh, MeshStandardMaterial, Raycaster } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { LineEnd, PointData } from './types'

export function useObjectInteractions({
  objectId,
  onSelect,
  selectedObject,
  mode,
  onAddPoint,
  onAddLinePoint,
  onUpdateTempLineEnd,
  registerObject,
}: {
  objectId: string
  onSelect: (obj: Object3D) => void
  selectedObject: Object3D | null
  mode: 'idle' | 'move' | 'placePoint' | 'placeLine' | 'edit'
  onAddPoint: (point: PointData) => void
  onAddLinePoint: (point: LineEnd) => void
  onUpdateTempLineEnd: (point: LineEnd) => void
  registerObject: (id: string, obj: Object3D | null) => void
}) {
  const ref = useRef<Object3D>(null!)
  const hovered = useRef<Object3D | null>(null)
  const raycaster = useRef<Raycaster>(new Raycaster())

  useEffect(() => {
    registerObject(objectId, ref.current)
    return () => registerObject(objectId, null)
  }, [objectId, registerObject])

  const isSelected = selectedObject != null && selectedObject === ref.current

  const applyHighlight = (obj: Object3D, highlight: boolean) => {
    obj.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh
        const materials: MeshStandardMaterial[] = Array.isArray(mesh.material)
          ? (mesh.material as MeshStandardMaterial[])
          : [mesh.material as MeshStandardMaterial]
        materials.forEach((mat) => {
          if (highlight) {
            if (mat.userData.__origColor === undefined) {
              mat.userData.__origColor = mat.color.getHex()
            }
            mat.color.set('#ffff00')
          } else if (mat.userData.__origColor !== undefined) {
            mat.color.set(mat.userData.__origColor as number)
            delete mat.userData.__origColor
          }
        })
      }
    })
  }

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const local = ref.current
      .worldToLocal(e.point.clone())
      .toArray() as [number, number, number]
    raycaster.current.ray.origin.copy(e.ray.origin)
    raycaster.current.ray.direction.copy(e.ray.direction)
    const hit = raycaster.current.intersectObject(ref.current, true)[0]
    if (hit) console.log(hit.object.name)
    if (mode === 'placePoint') {
      if (e.button !== 0) return
      const normal = e.face?.normal?.clone()
      if (normal) {
        onAddPoint({
          objectId,
          position: local,
          normal: [normal.x, normal.y, normal.z],
        })
      }
    } else if (mode === 'placeLine') {
      if (e.button !== 0) return
      onAddLinePoint({ objectId, position: local })
    } else if (mode === 'move') {
      onSelect(ref.current)
    } else if (mode === 'edit') {
      onSelect(hit ? hit.object : ref.current)
    }
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (mode === 'placeLine') {
      const localMove = ref.current
        .worldToLocal(e.point.clone())
        .toArray() as [number, number, number]
      onUpdateTempLineEnd({ objectId, position: localMove })
      return
    }
    if (mode !== 'move' && mode !== 'edit') return
    raycaster.current.ray.origin.copy(e.ray.origin)
    raycaster.current.ray.direction.copy(e.ray.direction)
    const hit = raycaster.current.intersectObject(ref.current, true)[0]?.object ?? null
    if (hovered.current !== hit) {
      if (hovered.current) applyHighlight(hovered.current, false)
      hovered.current = hit
      if (hit) applyHighlight(hit, true)
    }
  }

  const handlePointerOut = () => {
    if (hovered.current) {
      applyHighlight(hovered.current, false)
      hovered.current = null
    }
  }

  return {
    ref,
    isSelected,
    handlePointerDown,
    handlePointerMove,
    handlePointerOut,
  }
}
