import Placeholder from '../../components/Placeholder'
import ThreeViewer from '../../components/ThreeViewer'
import VideoPlayer from '../../components/VideoPlayer'
import Asset from '../../components/Asset'
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
  lineGap = 0.2,
  style = {},
}) {
  const [containerRef] = useInViewAnimation()
  const [d, setD] = useState('')
  const [bbox, setBbox] = useState({ x1: 0, y1: 0, x2: size, y2: size })
  const width = Math.max(1, bbox.x2 - bbox.x1)
  const height = Math.max(1, bbox.y2 - bbox.y1)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const resolvedUrl = fontUrl ?? `${import.meta.env.BASE_URL}fonts/EBGaramond-VariableFont_wght.ttf`
        const font = await opentype.load(resolvedUrl)
        try { font?.setVariation && font.setVariation({ wght: weight }) } catch { /* ignore */ }

        const lines = String(text ?? '').split(/\r?\n/)
        const gapPx = Math.max(0, Math.round(size * lineGap))
        let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
        const parts = []

        lines.forEach((line, i) => {
          const y = (i + 1) * size + i * gapPx
          const path = font.getPath(line, 0, y, size)
          const b = path.getBoundingBox()
          x1 = Math.min(x1, b.x1)
          y1 = Math.min(y1, b.y1)
          x2 = Math.max(x2, b.x2)
          y2 = Math.max(y2, b.y2)
          parts.push(path.toPathData(2))
        })

        if (!cancelled) {
          setD(parts.join(' '))
          // Round bbox to whole pixels to reduce subpixel shimmer
          const rx1 = Number.isFinite(x1) ? Math.floor(x1) : 0
          const ry1 = Number.isFinite(y1) ? Math.floor(y1) : 0
          const rx2 = Number.isFinite(x2) ? Math.ceil(x2) : size
          const ry2 = Number.isFinite(y2) ? Math.ceil(y2) : size
          setBbox({ x1: rx1, y1: ry1, x2: rx2, y2: ry2 })
        }
      } catch {
        if (!cancelled) setD('')
      }
    })()
    return () => { cancelled = true }
  }, [text, fontUrl, size, weight, lineGap])

  const lines = String(text ?? '').split(/\r?\n/)
  const gapPx = Math.max(0, Math.round(size * lineGap))

  return (
    <div ref={containerRef} className={className} style={style}>
      {d ? (
        <svg
          width={width}
          height={height}
          viewBox={`${bbox.x1} ${bbox.y1} ${width} ${height}`}
          style={{ display: 'block', willChange: 'opacity, transform', contain: 'paint' }}
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
        >
          <motion.path
            d={d}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            style={{ paintOrder: 'stroke fill' }}
            pathLength={1}
            initial={{ strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 }}
            whileInView={{ strokeDashoffset: 0, fillOpacity: 1 }}
            viewport={{ once: true, amount: 0.2, margin: '0px 0px -20% 0px' }}
            transition={{
              strokeDashoffset: { duration: 1.2, ease: 'easeInOut' },
              fillOpacity: { delay: 0.5, duration: 0.6, ease: 'easeOut' },
            }}
          />
        </svg>
      ) : (
        <svg style={{ display: 'block', overflow: 'visible', willChange: 'opacity, transform', contain: 'paint' }} shapeRendering="geometricPrecision" textRendering="geometricPrecision">
          {lines.map((line, i) => (
            <motion.text
              key={`fill-${i}`}
              x="0"
              y={(i + 1) * size + i * gapPx}
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
              {line}
            </motion.text>
          ))}
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
        {/* Section 1 — Overview */}
        <section className="min-h-screen grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <SvgTraceHeading 
              text="2$ Million Puzzle"  
            />
            <TraceText text="In 2023, MSCHF launched The $2 Million Puzzle: a physical sweepstakes product from a brand known for limited-run, concept-driven drops that merge cultural provocation with minimal marketing. Unlike MSCHF’s typical hype-based releases, the puzzle stayed on sale for months, appealing to a broader audience including families, casual puzzle buyers, and novelty-gift shoppers." />
            <TraceText text="The original request was modest: repurpose existing photography into simple animations for social media. Over the next year, that brief evolved into a high-quality, 3D-driven content series that increased engagement, supported seasonal campaigns, and gave the brand a consistent visual identity." />
          </div>
          <div className="order-1 md:order-2">
            <Asset id="S1-1" />
          </div>
        </section>

        {/* Section 2 — Initial Brief */}
        <section className="min-h-screen grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Asset id="S2-1" />
            <Asset id="S2-2" />
          </div>
          <div className="space-y-4">
            <SvgTraceHeading text="Initial Brief" />
            <TraceText text="The creative brief was intentionally minimal: produce evergreen social content in both 1:1 and 9:16 formats using provided copy, brand colors, and fonts." />
            <TraceText text="Deliverables began with clean, procedural animations built in After Effects using a small set of static photos, logos, and reference animations. Custom templates were developed to ensure motion consistency and scalability. This early phase established trust and provided a dependable production baseline." />
          </div>
        </section>

        <section className="min-h-screen grid gap-6 content-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {['S3-1','S3-2','S3-3'].map((id) => (
              <Asset key={id} id={id} />
            ))}
          </div>
          </section>

        {/* Section 3 — Prototype & Strategic Shift */}
        <section className="min-h-screen grid gap-6 content-center">
          
          
          

          <SvgTraceHeading text="Prototype & Strategic Shift" />
          
          <TraceText text="While delivering the baseline assets, it became clear that neutral 2D treatments lacked specificity and emotional resonance. A fully rebuilt 3D model of the puzzle was placed in a clean, physics-driven “blue world” environment — and this post significantly outperformed average engagement metrics."/>
          <TraceText text="The success validated a pivot: high-polish, immersive 3D content would become a recurring feature of the campaign." />
          <div className="grid grid-cols-1 gap-3">
            {['S5-1'].map((id) => (
              <Asset key={id} id={id} />
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {['S4-1','S4-2', 'S3-4'].map((id) => (
              <Asset key={id} id={id} />
            ))}
          </div>
        </section>

        {/* Section 4 — Audience Data & Lifestyle Series */}
        <section className="min-h-screen space-y-8 flex flex-col justify-center">
          <SvgTraceHeading text="Audience Data" />
          
          <TraceText text="After the initial success, audience demographic data was requested to refine the creative strategy. The majority of buyers were women aged 35–55, purchasing as family gifts — often a toy for kids, a novelty for a spouse, or a shared activity." />
          <TraceText text="This insight motivated a new direction: a series of lifestyle-inspired 3D environments (living rooms, desks, bookshelves, outdoor scenes) designed to show the puzzle as something that could live anywhere in the home, while retaining MSCHF’s surreal and playful energy." />
          
        </section>

        {/* Section 5 — Alternate Concepts & Seasonal Campaigns */}
        <section className="min-h-screen space-y-6 flex flex-col justify-center">
          <SvgTraceHeading text="Responding to Insight" className="font-bold text-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {['S7-1','S7-2','S7-3','S7-4','S7-5','S7-6'].map((id) => (
              <Asset key={id} id={id} />
            ))}
          </div>
          <TraceText text="Alongside the lifestyle scenes, alternate concepts were developed to expand the visual language — experimenting with composition, color, and narrative framing." />
          

          {/* Restored: Social Impact single video */}
          

          {/* Restored: Alternate Concepts (video + image) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['S8-1','S8-2'].map((id) => (
              <Asset key={id} id={id} />
            ))}
          </div>

          
        </section>

        <section className="min-h-screen space-y-6 flex flex-col justify-center">
            <SvgTraceHeading text="Seasonal Campaigns" className="font-bold text-3xl" />
          <TraceText text="The modular 3D environments were later adapted for seasonal moments like Halloween and Labor Day, efficiently re-skinned with updated props, lighting, and palettes without sacrificing visual quality." />
          {/* Restored: Seasonal Adaptations (six-up) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {['S9-1','S9-2','S9-3','S9-4','S9-5','S9-6'].map((id) => (
              <Asset key={id} id={id} />
            ))}
          </div>
        </section>

        {/* Section 6 — Creative Challenge */}
        <section className="min-h-screen space-y-6 flex flex-col justify-center">
          <SvgTraceHeading 
            text={'Creative Challenge:\nCreating Clarity'} 
            lineGap={0.12}
            className="leading-[1.1]"
          />
          <TraceText text="Midway through the year, a marketing consultant recommended more minimal, “readable” assets with a 2D-style presentation. This created a design challenge: simplify without losing the polish that was now core to the brand’s look." />
          <TraceText text="The solution was to keep the pipeline in 3D but reduce camera movement, depth complexity, and environmental detail; preserving brand quality while delivering assets that were immediately legible." />
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-3">
            {["S10-1"].map((id) => (
              <Asset key={id} id={id} />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
            {["S10-4", "S10-5"].map((id) => (
              <Asset key={id} id={id} />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3">
            {["S10-2", "S10-3"].map((id) => (
              <Asset key={id} id={id} />
            ))}
          </div>
        </section>

        {/* Section 7 — Impact */}
        <section className="min-h-screen grid content-center gap-6">
          <SvgTraceHeading text="Impact" />
          <TraceText text="Exact metrics were not disclosed, but internal reports cited a substantial increase in conversions and engagement for 3D-driven campaigns, exceeding expectations. The project evolved from a small adaptation brief into a scalable visual system that could flex across audiences, seasons, and creative styles while maintaining brand distinction." />
          <TraceText text="This project is from earlier in my career, and at the time it represented the highest level of motion craft I was delivering. It helped reshape the client’s content strategy, evolving into a year-long campaign that balanced brand voice with high-quality, engaging visuals. Since then, my skills and tools have evolved. My current work is more refined both technically and creatively, but I chose to present this project because it clearly shows how I think, adapt, and build scalable visual systems. The creative decision-making here, from testing new approaches to integrating audience insights, is exactly the kind of process I would bring to SoundCloud." />
        </section>
      </article>
    </>
  )
}
