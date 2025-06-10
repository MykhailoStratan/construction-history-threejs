import { useState } from 'react'
import './ToolPanel.css'

interface ToolPanelProps {
  onAddPlane: () => void
  pointEnabled: boolean
  onTogglePoint: () => void
  lineEnabled: boolean
  onToggleLine: () => void
  moveEnabled: boolean
  onToggleMove: () => void
}

export default function ToolPanel({
  onAddPlane,
  pointEnabled,
  onTogglePoint,
  lineEnabled,
  onToggleLine,
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
