import './ToolPanel.css'

interface ToolPanelProps {
  onAddPlane: () => void
  lineMode: boolean
  toggleLineMode: () => void
}

export default function ToolPanel({ onAddPlane, lineMode, toggleLineMode }: ToolPanelProps) {
  return (
    <div className="tool-panel">
      <button onClick={onAddPlane}>Plane</button>
      <button onClick={toggleLineMode} className={lineMode ? 'active' : ''}>
        Line
      </button>
    </div>
  )
}
