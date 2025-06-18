export interface PointData {
  objectId: string
  position: [number, number, number]
  normal: [number, number, number]
}

export interface LineEnd {
  objectId: string
  position: [number, number, number]
}

export interface LineData {
  start: LineEnd
  end: LineEnd
}

export interface ModelData {
  id: string
  object: import('three').Object3D
}
