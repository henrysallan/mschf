import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

// Cloudflare Stream HLS player with lazy attach & poster
// Props: src (HLS .m3u8 url), poster, muted, autoPlay, loop, playsInline, preferMaxQuality
export default function VideoPlayer({ src, poster, muted = true, autoPlay = true, loop = true, playsInline = true, className = '', preferMaxQuality = true, controls = false }) {
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
      // Native HLS (Safari/iOS). Quality selection is browser-controlled.
      el.src = src
      if (autoPlay) el.play().catch(() => {})
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        capLevelToPlayerSize: false,
        startLevel: -1,
      })
      hls.loadSource(src)
      hls.attachMedia(el)

      const setMaxLevel = () => {
        try {
          const last = (hls.levels?.length ?? 0) - 1
          if (preferMaxQuality && last >= 0) {
            hls.currentLevel = last
            hls.nextLevel = last
            hls.loadLevel = last
          }
        } catch { /* noop */ }
      }

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setMaxLevel()
        if (autoPlay) el.play().catch(() => {})
      })
      hls.on(Hls.Events.LEVEL_SWITCHED, () => {
        // Ensure we stick to max if ABR tries to drop
        setMaxLevel()
      })

      el.addEventListener('error', () => hls.destroy(), { once: true })
      return () => hls.destroy()
    } else {
      el.src = src // Fallback; most browsers need hls.js.
      if (autoPlay) el.play().catch(() => {})
    }
  }, [isIntersecting, src, autoPlay, preferMaxQuality])

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      muted={muted}
      autoPlay={autoPlay}
      loop={loop}
      playsInline={playsInline}
      controls={controls}
      preload="metadata"
    />
  )
}
