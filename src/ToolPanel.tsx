import './ToolPanel.css'

interface ToolPanelProps {
  onAddPlane: () => void
  onPlacePoint: () => void
}

export default function ToolPanel({ onAddPlane, onPlacePoint }: ToolPanelProps) {
  return (
    <div className="tool-panel">
      <button onClick={onAddPlane}>Plane</button>
      <button onClick={onPlacePoint}>Point</button>
    </div>
  )
}
