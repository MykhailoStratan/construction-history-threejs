import { useRef, type ChangeEvent } from 'react'
import './ToolPanel.css'

interface ToolPanelProps {
  onAddPlane: () => void
  onPlacePoint: () => void
  onDrawLine: () => void
  onUploadModel: (file: File) => void
}

export default function ToolPanel({
  onAddPlane,
  onPlacePoint,
  onDrawLine,
  onUploadModel,
}: ToolPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUploadModel(file)
      e.target.value = ''
    }
  }
  return (
    <div className="tool-panel">
      <button onClick={onAddPlane}>Plane</button>
      <button onClick={onPlacePoint}>Point</button>
      <button onClick={onDrawLine}>Line</button>
      <input
        type="file"
        accept=".fbx,.gltf,.glb"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        style={{ marginTop: 'auto', marginBottom: '1rem' }}
        onClick={() => fileInputRef.current?.click()}
      >
        Model Update
      </button>
    </div>
  )
}
