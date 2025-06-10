import './ToolPanel.css'
import { useRef } from 'react'

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

  return (
    <div className="tool-panel">
      <button onClick={onAddPlane}>Plane</button>
      <button onClick={onPlacePoint}>Point</button>
      <button onClick={onDrawLine}>Line</button>
      <button
        style={{ marginTop: 'auto', marginBottom: '1rem' }}
        onClick={() => fileInputRef.current?.click()}
      >
        Upload model
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".gltf,.glb,.ifc"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            onUploadModel(file)
            e.target.value = ''
          }
        }}
      />
    </div>
  )
}
