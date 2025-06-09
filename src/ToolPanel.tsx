import './ToolPanel.css'

interface ToolPanelProps {
  onAddPlane: () => void
}

export default function ToolPanel({ onAddPlane }: ToolPanelProps) {
  return (
    <div className="tool-panel">
      <button onClick={onAddPlane}>Plane</button>
    </div>
  )
}
