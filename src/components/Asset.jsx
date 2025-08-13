import manifest from '../data/assets.json'
import VideoPlayer from './VideoPlayer'
import { LightboxContext } from './lightboxContext'
import { useContext } from 'react'

export default function Asset({ id, className = '' }) {
  const a = manifest[id]
  const { open } = useContext(LightboxContext)
  if (!a) {
    return (
      <div className={`relative w-full bg-zinc-100 text-xs text-zinc-500 p-2 ${className}`}>
        Missing asset: {id}
      </div>
    )
  }

  const ratio = a.ratio ?? '9/16'
  const fit = a.fit ?? 'cover'
  const hasRatio = ratio !== 'auto'
  const wrapperStyle = hasRatio ? { aspectRatio: ratio.replace(':', ' / ') } : undefined
  const mediaClass = hasRatio ? 'absolute inset-0 w-full h-full' : 'w-full h-auto'
  const objectFit = fit === 'contain' ? 'object-contain' : 'object-cover'

  const handleOpen = () => open({ type: a.type, src: a.src, label: a.label })
  const handleKey = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpen() } }

  return (
    <div
      className={`relative w-full group ${className}`}
      style={wrapperStyle}
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKey}
      aria-label={a.label || id}
    >
      {a.type === 'video' ? (
        <VideoPlayer className={`${mediaClass} ${objectFit}`} src={a.src} />
      ) : (
        <img
          alt={a.label || id}
          loading="lazy"
          className={`${mediaClass} ${objectFit} bg-zinc-100`}
          src={a.src}
        />
      )}
      <div className="absolute inset-0 rounded-sm ring-0 group-hover:ring-2 ring-black/10 md:ring-white/40 transition pointer-events-none" />
      <div className="absolute inset-0 cursor-zoom-in" />
      {a.label && (
        <div className="absolute left-2 bottom-2 text-[10px] px-1.5 py-0.5 bg-white/80 text-black rounded select-none">
          {a.label}
        </div>
      )}
    </div>
  )
}
