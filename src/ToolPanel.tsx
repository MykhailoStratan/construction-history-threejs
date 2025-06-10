import './ToolPanel.css'

interface ToolPanelProps {
  onAddPlane: () => void
  onPlacePoint: () => void
  onDrawLine: () => void
  onUploadModel: () => void
}

export default function ToolPanel({
  onAddPlane,
  onPlacePoint,
  onDrawLine,
  onUploadModel,
}: ToolPanelProps) {
  return (
    <div className="tool-panel">
      <button onClick={onAddPlane}>Plane</button>
      <button onClick={onPlacePoint}>Point</button>
      <button onClick={onDrawLine}>Line</button>
      <button className="upload-button" onClick={onUploadModel}>Upload model</button>
    </div>
  )
}
