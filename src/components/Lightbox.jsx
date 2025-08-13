import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import VideoPlayer from './VideoPlayer'
import { LightboxContext } from './lightboxContext'

export function LightboxProvider({ children }) {
  const [item, setItem] = useState(null)
  const open = useCallback((media) => setItem(media), [])
  const close = useCallback(() => setItem(null), [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close() }
    if (item) document.addEventListener('keydown', onKey)
    document.body.classList.toggle('overflow-hidden', !!item)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('overflow-hidden')
    }
  }, [item, close])

  return (
    <LightboxContext.Provider value={{ open, close }}>
      {children}
      {item && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black/90"
          onClick={close}
          aria-modal="true"
          role="dialog"
        >
          {/* Close button above content */}
          <button
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); close() }}
            className="fixed top-4 right-4 z-[101] bg-white/90 hover:bg-white text-black rounded-full h-9 w-9 grid place-items-center shadow-md"
          >
            ×
          </button>

          {/* Centered media wrapper that doesn't cover the whole viewport, so backdrop remains clickable */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              {item.type === 'video' ? (
                <VideoPlayer
                  className="w-auto h-auto max-w-screen max-h-screen object-contain"
                  src={item.src}
                />
              ) : (
                <img
                  alt={item.label || 'Asset'}
                  loading="eager"
                  className="w-auto h-auto max-w-screen max-h-screen object-contain select-none"
                  src={item.src}
                />
              )}
              {item.label && (
                <div className="absolute left-4 bottom-4 text-[11px] px-1.5 py-0.5 bg-white/85 text-black rounded select-none">
                  {item.label}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </LightboxContext.Provider>
  )
}
