import { useState, useRef } from 'react'
import type React from 'react'
import './ToolPanel.css'

interface ToolPanelProps {
  onAddPlane: () => void
  pointEnabled: boolean
  onTogglePoint: () => void
  lineEnabled: boolean
  onToggleLine: () => void
  moveEnabled: boolean
  onToggleMove: () => void
  editEnabled: boolean
  onToggleEdit: () => void
  onToggleUI: () => void
  onUpload: (files: FileList | null) => void
}

export default function ToolPanel({
  onAddPlane,
  pointEnabled,
  onTogglePoint,
  lineEnabled,
  onToggleLine,
  moveEnabled,
  onToggleMove,
  editEnabled,
  onToggleEdit,
  onToggleUI,
  onUpload,
}: ToolPanelProps) {
  const [open, setOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={`tool-panel-container${open ? ' open' : ''}`}> 
      <div className="tool-panel">
        <button
          className={moveEnabled ? 'active' : ''}
          onClick={onToggleMove}
        >
          Move
        </button>
        <button
          className={editEnabled ? 'active' : ''}
          onClick={onToggleEdit}
        >
          Edit
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
        <button onClick={onToggleUI}>Toggle UI</button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".fbx,.gltf,.glb,.stl"
          multiple
          style={{ display: 'none' }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onUpload(e.target.files)
            e.target.value = ''
          }}
        />
        <button
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload
        </button>
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
