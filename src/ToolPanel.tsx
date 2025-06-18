import { useState, useRef } from 'react'
import './ToolPanel.css'

interface ToolPanelProps {
  onAddPlane: () => void
  pointEnabled: boolean
  onTogglePoint: () => void
  lineEnabled: boolean
  onToggleLine: () => void
  moveEnabled: boolean
  onToggleMove: () => void
  onUpload: (files: FileList) => void
}

export default function ToolPanel({
  onAddPlane,
  pointEnabled,
  onTogglePoint,
  lineEnabled,
  onToggleLine,
  moveEnabled,
  onToggleMove,
  onUpload,
}: ToolPanelProps) {
  const [open, setOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className={`tool-panel-container${open ? ' open' : ''}`}> 
      <div className="tool-panel">
        <button
          className={moveEnabled ? 'active' : ''}
          onClick={onToggleMove}
        >
          Move
        </button>
        <button onClick={onAddPlane}>Plane</button>
        <button
          className={pointEnabled ? 'active' : ''}
          onClick={onTogglePoint}
        >
          Point
        </button>
        <button
          className={lineEnabled ? 'active' : ''}
          onClick={onToggleLine}
        >
          Line
        </button>
        <button
          style={{ marginTop: 'auto', marginBottom: '1rem' }}
          onClick={() => fileRef.current?.click()}
        >
          Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".fbx,.gltf,.glb"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) {
              onUpload(e.target.files)
              e.target.value = ''
            }
          }}
        />
      </div>
      <div
        className="panel-toggle"
        onClick={() => setOpen(!open)}
      >
        {open ? '◀' : '▶'}
      </div>
    </div>
  )
}
