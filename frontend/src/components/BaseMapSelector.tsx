import { useEffect, useRef } from 'react'
import { BASE_MAP_LAYERS, type BaseMapLayer } from '../services/baseMapLayers'

type BaseMapSelectorProps = {
  activeLayerId: BaseMapLayer['id']
  onChange: (id: BaseMapLayer['id']) => void
  open: boolean
  onToggle: () => void
}

export function BaseMapSelector({ activeLayerId, onChange, open, onToggle }: BaseMapSelectorProps) {
  const controlRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    function closeOnOutsideClick(event: MouseEvent) {
      if (!controlRef.current?.contains(event.target as Node)) onToggle()
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [onToggle, open])

  return (
    <section ref={controlRef} className="base-map-control" aria-label="Base map selector">
      <button
        type="button"
        className="base-map-toggle"
        aria-label="Choose base map"
        aria-expanded={open}
        onClick={onToggle}
      >
        ◫
      </button>
      {open ? (
        <div className="overlay-panel base-map-menu" role="dialog" aria-label="Base map choices">
          <div className="base-map-menu-header">
            <h2>Base map</h2>
            <button type="button" className="base-map-dismiss" onClick={onToggle}>Dismiss</button>
          </div>
          <div className="base-map-options">
            {BASE_MAP_LAYERS.map((layer) => (
              <button
                key={layer.id}
                type="button"
                className={layer.id === activeLayerId ? 'base-map-option selected' : 'base-map-option'}
                onClick={() => {
                  onChange(layer.id)
                  onToggle()
                }}
              >
                <span>{layer.name}</span>
                <small>{layer.usageNotes}</small>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
