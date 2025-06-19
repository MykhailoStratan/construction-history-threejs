import { useEffect, useRef } from 'react'
import type { Object3D } from 'three'
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

  useEffect(() => {
    registerObject(objectId, ref.current)
    return () => registerObject(objectId, null)
  }, [objectId, registerObject])

  const isSelected = selectedObject != null && selectedObject === ref.current

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const local = ref.current
      .worldToLocal(e.point.clone())
      .toArray() as [number, number, number]
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
      onSelect(e.eventObject)
    }
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (mode === 'placeLine') {
      const localMove = ref.current
        .worldToLocal(e.point.clone())
        .toArray() as [number, number, number]
      onUpdateTempLineEnd({ objectId, position: localMove })
    }
  }

  return { ref, isSelected, handlePointerDown, handlePointerMove }
}
