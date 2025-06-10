import { useState } from 'react'
import './ToolPanel.css'

interface ToolPanelProps {
  onAddPlane: () => void
  onPlacePoint: () => void
  onDrawLine: () => void
}

export default function ToolPanel({
  onAddPlane,
  onPlacePoint,
  onDrawLine,
}: ToolPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="tool-panel-container">
      <div className={`tool-panel${open ? ' open' : ''}`}>
        <button onClick={onAddPlane}>Plane</button>
        <button onClick={onPlacePoint}>Point</button>
        <button onClick={onDrawLine}>Line</button>
      </div>
      <div
        className={`panel-toggle${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {open ? '◀' : '▶'}
      </div>
    </div>
  )
}
