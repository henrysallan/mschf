import Placeholder from '../../components/Placeholder'
import ThreeViewer from '../../components/ThreeViewer'
import VideoPlayer from '../../components/VideoPlayer'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import opentype from 'opentype.js'

// Fixed scroll animation hook
function useInViewAnimation() {
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)
  const animatedRef = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true
            setHasAnimated(true)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20% 0px'
      }
    )

    observer.observe(element)
    
    return () => {
      observer.disconnect()
    }
  }, [])

  return [ref, hasAnimated]
}

// Load variable font once (wght axis supported)
function useOpenTypeFont(fontUrl, weight) {
  const [font, setFont] = useState(null)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const url = fontUrl ?? `${import.meta.env.BASE_URL}fonts/EBGaramond-VariableFont_wght.ttf`
        const f = await opentype.load(url)
        try { f?.setVariation && f.setVariation({ wght: weight }) } catch { /* ignore */ }
        if (!cancelled) setFont(f)
      } catch {
        if (!cancelled) setFont(null)
      }
    })()
    return () => { cancelled = true }
  }, [fontUrl, weight])
  return font
}

function WordOutline({ font, word, size, delay, className }) {
  const { d, bbox } = useMemo(() => {
    if (!font || !word) return { d: '', bbox: { x1: 0, y1: 0, x2: size, y2: size } }
    const path = font.getPath(word, 0, size, size)
    const b = path.getBoundingBox()
    return { d: path.toPathData(2), bbox: b }
  }, [font, word, size])

  const width = Math.max(1, bbox.x2 - bbox.x1)
  const height = Math.max(1, bbox.y2 - bbox.y1)

  if (!d) {
    // Fallback plain text if path failed
    return <span className={className} style={{ display: 'inline-block' }}>{word}</span>
  }

  return (
    <span className={className} style={{ display: 'inline-block', verticalAlign: 'baseline' }}>
      <svg width={width} height={height} viewBox={`${bbox.x1} ${bbox.y1} ${width} ${height}`} style={{ display: 'block' }}>
        <motion.path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.2, margin: '0px 0px -20% 0px' }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay }}
        />
        <motion.path
          d={d}
          fill="currentColor"
          stroke="none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2, margin: '0px 0px -20% 0px' }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: delay + 0.15 }}
        />
      </svg>
    </span>
  )
}

function SvgTraceHeading({
  text,
  fontUrl,
  size = 56,
  weight = 700,
  className = '',
}) {
  const [containerRef] = useInViewAnimation()
  const [d, setD] = useState('')
  const [bbox, setBbox] = useState({ x1: 0, y1: 0, x2: size, y2: size })
  const width = Math.max(1, bbox.x2 - bbox.x1)
  const height = Math.max(1, bbox.y2 - bbox.y1)
  const textRef = useRef(null)
  const [textLen, setTextLen] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const resolvedUrl = fontUrl ?? `${import.meta.env.BASE_URL}fonts/EBGaramond-VariableFont_wght.ttf`
        const font = await opentype.load(resolvedUrl)
        try { font?.setVariation && font.setVariation({ wght: weight }) } catch { /* ignore */ }
        const path = font.getPath(text, 0, size, size)
        const b = path.getBoundingBox()
        if (!cancelled) { setD(path.toPathData(2)); setBbox(b) }
      } catch { setD('') }
    })()
    return () => { cancelled = true }
  }, [text, fontUrl, size, weight])

  useEffect(() => {
    if (!d && textRef.current) {
      const measure = () => setTextLen(textRef.current.getComputedTextLength?.() || 0)
      const id = requestAnimationFrame(measure)
      return () => cancelAnimationFrame(id)
    }
  }, [d, text])

  return (
    <div ref={containerRef} className={className}>
      {d ? (
        <svg width={width} height={height} viewBox={`${bbox.x1} ${bbox.y1} ${width} ${height}`} style={{ display: 'block' }}>
          <motion.path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.2, margin: '0px 0px -20% 0px' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
          <motion.path
            d={d}
            fill="currentColor"
            stroke="none"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2, margin: '0px 0px -20% 0px' }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
          />
        </svg>
      ) : (
        <svg height={height} style={{ display: 'block', overflow: 'visible' }}>
          <motion.text
            key={`stroke-${textLen}`}
            ref={textRef}
            x="0"
            y={size}
            fontFamily="'EB Garamond', serif"
            fontSize={size}
            fontWeight={weight}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            initial={{ strokeDasharray: textLen || 1, strokeDashoffset: textLen || 1 }}
            whileInView={{ strokeDashoffset: 0 }}
            viewport={{ once: true, amount: 0.2, margin: '0px 0px -20% 0px' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            {text}
          </motion.text>
          <motion.text
            key={`fill-${textLen}`}
            x="0"
            y={size}
            fontFamily="'EB Garamond', serif"
            fontSize={size}
            fontWeight={weight}
            fill="currentColor"
            stroke="none"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2, margin: '0px 0px -20% 0px' }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
          >
            {text}
          </motion.text>
        </svg>
      )}
    </div>
  )
}

function splitTokens(text) { return text.split(/(\s+)/).map((t) => (t === ' ' ? '\u00A0' : t)) }
function TraceText({ as: Tag = 'p', text, className = '', baseDelay = 0, stagger = 0.02, outline = false, weight = 400 }) {
  const [ref] = useInViewAnimation()
  const tokens = useMemo(() => splitTokens(text), [text])
  const M = motion.create(Tag)
  
  // Always call hooks in the same order
  const [measuredSize, setMeasuredSize] = useState(18)
  const font = useOpenTypeFont(undefined, weight)
  
  useEffect(() => {
    if ((Tag === 'h2' || outline) && ref.current) {
      const s = parseFloat(getComputedStyle(ref.current).fontSize || '18')
      if (!Number.isNaN(s)) setMeasuredSize(s)
    }
  }, [Tag, outline, ref])

  // For headings, we want the SVG tracing effect
  if ((Tag === 'h2' || outline) && font) {
    return (
      <div ref={ref}>
        <M className={className}>
          {tokens.map((tok, i) => (
            tok.trim() === '' ? (
              <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre' }}>{tok}</span>
            ) : (
              <WordOutline
                key={i}
                font={font}
                word={tok}
                size={measuredSize}
                delay={baseDelay + i * stagger}
              />
            )
          ))}
        </M>
      </div>
    )
  }

  // Simple text with CSS-based reveal animation
  return (
    <div ref={ref}>
      <M 
        className={className}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -20% 0px' }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: baseDelay }}
      >
        {text}
      </M>
    </div>
  )
}

function Overlay() {
  return (
    <div className="hidden md:block fixed inset-0 z-50 pointer-events-none text-zinc-400 italic">
      {/* Left vertical hairline at screen edge */}
      <div
        aria-hidden
        className="absolute"
        style={{ 
          left: 0,
          top: 0,
          bottom: 0,
          width: '0.25pt', 
          background: 'currentColor' 
        }}
      />
      {/* Right vertical hairline at screen edge */}
      <div
        aria-hidden
        className="absolute"
        style={{ 
          right: 0,
          top: 0,
          bottom: 0,
          width: '0.25pt', 
          background: 'currentColor' 
        }}
      />

      {/* Labels in the corners */}
      <div 
        className="absolute top-6 left-6"
      >
        <div className="select-none text-xs tracking-wide uppercase">MSCHF</div>
      </div>
      <div 
        className="absolute top-6 right-6"
      >
        <div className="select-none text-xs tracking-wide uppercase">Henry Allan</div>
      </div>
    </div>
  )
}

export default function CaseStudy() {
  return (
    <>
      <Overlay />
      
      {/* Three.js Intro Viewer */}
      <section className="w-full">
        <ThreeViewer 
          modelUrl="models/Mschf.glb"
          height="100vh"
          className="w-full"
        />
      </section>
      
      <article className="mx-auto w-full max-w-[750px] text-zinc-900">
        {/* Section 1 — Hero */}
        <section className="min-h-screen grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <SvgTraceHeading text="MSCHF — $2 Million Puzzle" className="leading-[1.1]" />
            <TraceText text="In 2023, I worked with MSCHF on the $2 Million Puzzle campaign — a physical product sold online, with a brand voice that’s irreverent, internet-native, and deeply tuned into online culture." />
            <TraceText text="The original ask was modest: repurpose existing photography into simple animations for social media. Over the course of a year, that brief evolved into a high-quality, 3D-driven content series that increased engagement, supported seasonal campaigns, and created a consistent visual identity for the brand." />
          </div>
          <div className="order-1 md:order-2">
            <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
              <VideoPlayer
                className="absolute inset-0 w-full h-full object-cover"
                src="https://customer-aw0tss17gwcmheqp.cloudflarestream.com/2e803d38867046f62cbf8f31e1c30b06/manifest/video.m3u8"
              />
            </div>
          </div>
        </section>

        {/* Section 2 — The Brief */}
        <section className="min-h-screen grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
              <img
                alt="Product"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover bg-zinc-100"
                src="https://imagedelivery.net/HphCwoGO3w49JUPOajXgFw/a6a725f5-7ce1-4e4d-5b2d-03e9c3c1ab00/public"
              />
            </div>
            <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
              <img
                alt="Brand Guidelines"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover bg-zinc-100"
                src="https://imagedelivery.net/HphCwoGO3w49JUPOajXgFw/a6a725f5-7ce1-4e4d-5b2d-03e9c3c1ab00/public"
              />
            </div>
          </div>
          <div className="space-y-4">
            <SvgTraceHeading text="The Brief" />
            <TraceText text="The brief was intentionally loose — evergreen content for social media, using provided copy and brand colors/fonts. Deliverables needed to work in both 1:1 and 9:16 formats." />
            <TraceText text="I was given a small set of static photography, logos, and a few reference animations, but little strategic direction. This meant I had both freedom and responsibility to define the creative approach." />
          </div>
        </section>

        {/* Section 3 — Establishing the Baseline (4-up) */}
        <section className="min-h-screen grid gap-6 content-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            { [
              'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/21d1fac9b0624048cf490feab97d9aa2/manifest/video.m3u8',
              'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/b67e22f1709fc2fa8410f1f310c304e4/manifest/video.m3u8',
              'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/94fad3c97117b2614211e96b16e3795f/manifest/video.m3u8',
              'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/2dfc512b72690f64fa79beefeb7ccec8/manifest/video.m3u8'
            ].map((src, i) => (
              <div key={i} className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
                <VideoPlayer className="absolute inset-0 w-full h-full object-cover" src={src} />
              </div>
            ))}
          </div>
          <TraceText text="I started by delivering exactly what was requested: clean, procedural animations based on the provided references. These used After Effects stroke effects and templates I built to make the motion more consistent and scalable." className="text-sm text-zinc-500" />
          <TraceText text="This initial phase established trust with the client and ensured we had a dependable baseline for ongoing content." className="text-sm text-zinc-500" />
        </section>

        {/* Section 4 — Hypothesis & 3D Prototype (2-up) */}
        <section className="min-h-screen space-y-8 flex flex-col justify-center">
          <SvgTraceHeading text="Hypothesis & 3D Prototype" />
          <div className="grid md:grid-cols-2 gap-4">
            { [
              'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/1650b64306991ea4b57ed987d4d94530/manifest/video.m3u8',
              'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/68f60e87cf5b8382bd11d86472380383/manifest/video.m3u8'
            ].map((src, i) => (
              <div key={i} className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
                <VideoPlayer className="absolute inset-0 w-full h-full object-cover" src={src} />
              </div>
            ))}
          </div>
          <TraceText text="While delivering the baseline work, I saw an opportunity... I created a 3D prototype of the puzzle in a clean, physics-driven “blue world”." />
        </section>

        {/* Section 5 — Social Impact */}
        <section className="min-h-screen grid content-center gap-6">
          <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
            <VideoPlayer className="absolute inset-0 w-full h-full object-cover" src="https://customer-aw0tss17gwcmheqp.cloudflarestream.com/ff5afe61d7ceb4e0fe9a747a513ece48/manifest/video.m3u8" />
          </div>
          <TraceText text="The 3D post significantly outperformed our average engagement metrics. This was the turning point." />
          <TraceText text="We pivoted strategy: 3D content would become a recurring feature of our social presence, not just a one-off experiment." />
        </section>

        {/* Section 6 — Audience Insight */}
        <section className="min-h-screen grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-zinc-100 p-8 space-y-4">
            <div className="bg-zinc-200 h-48 w-36" />
            <div className="space-y-2 text-sm">
              <div className="h-3 bg-zinc-200 w-40" />
              <div className="h-3 bg-zinc-200 w-28" />
              <div className="h-3 bg-zinc-200 w-24" />
            </div>
          </div>
          <div className="space-y-4">
            <SvgTraceHeading text="Audience Insight" className="font-bold text-3xl" />
            <TraceText text="After this, I requested demographic data. The majority of buyers were women aged 35–55, purchasing as family gifts — a toy for kids, a novelty for a spouse, or a group activity." />
            <TraceText text="This insight focused my creative approach: we wanted to present the puzzle as something that could live anywhere in the home and appeal to all ages." />
          </div>
        </section>

        {/* Section 7 — Strategic Environment Series (2 rows of 3 with labels) */}
        <section className="min-h-screen space-y-6 flex flex-col justify-center">
          <SvgTraceHeading text="Strategic Environment Series" className="font-bold text-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            { [
              { label: 'Basketball', src: 'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/f19a17949a5132ccfb8ac1728fc4753c/manifest/video.m3u8' },
              { label: 'Gameshow', src: 'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/881ab4c19448a94314bbe6a8ace47db1/manifest/video.m3u8' },
              { label: 'Brownstone', src: 'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/2e803d38867046f62cbf8f31e1c30b06/manifest/video.m3u8' },
              { label: 'Living Room', src: 'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/4b3111c39f82ceccf38913875c1dd3c3/manifest/video.m3u8' },
              { label: 'Bookshelf', src: 'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/f04862f24a48a757253a7a61f4c429df/manifest/video.m3u8' },
              { label: 'Desk', src: 'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/9fa77f8b6058439e5a69d68714b92beb/manifest/video.m3u8' }
            ].map((item, i) => (
              <div key={i} className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
                <VideoPlayer className="absolute inset-0 w-full h-full object-cover" src={item.src} />
                <div className="absolute left-2 bottom-2 text-[10px] px-1.5 py-0.5 bg-white/80 text-black rounded select-none">{item.label}</div>
              </div>
            ))}
          </div>
          <TraceText text="I pitched a series of 3D environments designed to reflect different lifestyles, settings, and use cases." />
          <TraceText text="The goal: create visual 'hooks' that mirrored our audience's world, while keeping the brand's surreal and playful energy." />
        </section>

        {/* Section 8 — Alternate Concepts (1 video, 1 image) */}
        <section className="min-h-screen grid content-center gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
              <VideoPlayer className="absolute inset-0 w-full h-full object-cover" src="https://customer-aw0tss17gwcmheqp.cloudflarestream.com/3ad228825fcab830270df1424b563f12/manifest/video.m3u8" />
            </div>
            <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
              <img
                alt="Alternate Concept"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover bg-zinc-100"
                src="https://imagedelivery.net/HphCwoGO3w49JUPOajXgFw/d024d90b-9db0-4743-7950-d98a19b70600/public"
              />
            </div>
          </div>
          <TraceText text="Alongside the main environments, I explored alternate concepts to expand our visual language — experimenting with composition, color, and narrative framing." className="text-sm text-zinc-500" />
        </section>

        {/* Section 9 — Seasonal (2 rows of 3 with labels) */}
        <section className="min-h-screen grid content-center gap-6">
          <SvgTraceHeading text="Seasonal Adaptations" className="font-bold text-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            { [
              { label: 'Columbus Day', type: 'video', src: 'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/07908ad414b4aed250705273bc092098/manifest/video.m3u8' },
              { label: 'Labor Day', type: 'video', src: 'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/0d318d81763b795996702fa8ce8dc2bf/manifest/video.m3u8' },
              { label: 'Halloween 1', type: 'video', src: 'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/f4d02698c9782b61a39a14f7a3d952ea/manifest/video.m3u8' },
              { label: 'Halloween 2', type: 'video', src: 'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/130fed6bf46cc46280f3d23464558db5/manifest/video.m3u8' },
              { label: 'Halloween 3', type: 'image', src: 'https://imagedelivery.net/HphCwoGO3w49JUPOajXgFw/9ccc1b30-8b52-4bff-d27c-28307132be00/public' },
              { label: 'Halloween 4', type: 'image', src: 'https://imagedelivery.net/HphCwoGO3w49JUPOajXgFw/1d773f37-d3a7-49ec-2eee-c31bf70dea00/public' }
            ].map((item, i) => (
              <div key={i} className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
                {item.type === 'video' ? (
                  <VideoPlayer className="absolute inset-0 w-full h-full object-cover" src={item.src} />
                ) : (
                  <img alt={item.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover bg-zinc-100" src={item.src} />
                )}
                <div className="absolute left-2 bottom-2 text-[10px] px-1.5 py-0.5 bg-white/80 text-black rounded select-none">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* New Section — Additional Assets (full-width + row of 4) */}
        {/* duplicate removed */}

        {/* New Section — Additional Assets (full-width + row of 4) */}
        <section className="min-h-screen grid content-center gap-6">
          <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
            <VideoPlayer className="absolute inset-0 w-full h-full object-cover" src="https://customer-aw0tss17gwcmheqp.cloudflarestream.com/fa72111ff515f59e42279d65f5e69bc3/manifest/video.m3u8" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            { [
              { type: 'video', src: 'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/0666ebb4e733be311b4697560733bf4c/manifest/video.m3u8' },
              { type: 'video', src: 'https://customer-aw0tss17gwcmheqp.cloudflarestream.com/fdf5031a01e52d2bf8e6e7d0471e6be7/manifest/video.m3u8' },
              { type: 'image', src: 'https://imagedelivery.net/HphCwoGO3w49JUPOajXgFw/b35ca6e6-2be9-435d-365c-1fc83939a900/public' },
              { type: 'image', src: 'https://imagedelivery.net/HphCwoGO3w49JUPOajXgFw/20d9a888-3d3e-4f66-6348-d15bfd63bc00/public' }
            ].map((item, i) => (
              <div key={i} className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
                {item.type === 'video' ? (
                  <VideoPlayer className="absolute inset-0 w-full h-full object-cover" src={item.src} />
                ) : (
                  <img alt="Asset" loading="lazy" className="absolute inset-0 w-full h-full object-cover bg-zinc-100" src={item.src} />
                )}
              </div>
            ))}
          </div>
        </section>
      </article>
    </>
  )
}
