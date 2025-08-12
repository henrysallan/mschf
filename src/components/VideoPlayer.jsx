import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

// Cloudflare Stream HLS player with lazy attach & poster
// Props: src (HLS .m3u8 url), poster, muted, autoPlay, loop, playsInline
export default function VideoPlayer({ src, poster, muted = true, autoPlay = true, loop = true, playsInline = true, className = '' }) {
  const videoRef = useRef(null)
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin: '200px', threshold: 0.01 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !isIntersecting || !src) return

    if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = src
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 10,
        capLevelToPlayerSize: true,
      })
      hls.loadSource(src)
      hls.attachMedia(el)
      el.addEventListener('error', () => hls.destroy(), { once: true })
      return () => hls.destroy()
    } else {
      el.src = src // fallback; most browsers need hls.js though
    }
  }, [isIntersecting, src])

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      muted={muted}
      autoPlay={autoPlay}
      loop={loop}
      playsInline={playsInline}
      controls={false}
      preload="metadata"
    />
  )
}
