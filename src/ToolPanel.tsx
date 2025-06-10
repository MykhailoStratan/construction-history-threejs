import { useState } from 'react'
import './ToolPanel.css'

interface ToolPanelProps {
  onAddPlane: () => void
  onPlacePoint: () => void
  onDrawLine: () => void
  moveEnabled: boolean
  onToggleMove: () => void
}

export default function ToolPanel({
  onAddPlane,
  onPlacePoint,
  onDrawLine,
  moveEnabled,
  onToggleMove,
}: ToolPanelProps) {
  const [open, setOpen] = useState(false)

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
        <button onClick={onPlacePoint}>Point</button>
        <button onClick={onDrawLine}>Line</button>
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
