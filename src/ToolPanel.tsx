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
  return (
    <div className="tool-panel">
      <button onClick={onAddPlane}>Plane</button>
      <button onClick={onPlacePoint}>Point</button>
      <button onClick={onDrawLine}>Line</button>
    </div>
  )
}
