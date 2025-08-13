import { useEffect, useState } from 'react'

export default function StickyInfoPanel({ text = '' }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {/* Toggle button */}
      <button
        aria-expanded={open}
        aria-controls="sticky-info-panel"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-[70] text-black bg-transparent shadow-none focus:outline-none focus:ring-0 h-8 w-8 grid place-items-center"
        title={open ? 'Close panel' : 'Open panel'}
      >
        <span className={`text-xl leading-none transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>

      {/* Sliding panel */}
      <aside
        id="sticky-info-panel"
        className={`fixed right-0 z-[69] bg-white overflow-hidden transition-transform duration-500 ease-out will-change-transform \n          ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ top: '72px', height: 'calc(100vh - 72px)', width: 'min(85vw, 360px)' }}
        role="region"
        aria-label="Additional information"
      >
        <div className="h-full overflow-y-auto p-5 text-sm leading-6 text-zinc-800">
          <div className="whitespace-pre-wrap text-left">
            {text && text.trim().length > 0 ? text : 'In 2023, MSCHF launched The $2 Million Puzzle — a physical sweepstakes product from a brand known for limited-run, concept-driven drops that merge cultural provocation with minimal marketing. Unlike their typical hype-based releases, the puzzle stayed on sale for months, appealing to a broader audience including families, casual puzzle buyers, and novelty-gift shoppers.\n\nThe original request was modest: repurpose existing photography into simple animations for social media. Over the next year, that brief evolved into a high-quality, 3D-driven content series that increased engagement, supported seasonal campaigns, and gave the brand a consistent visual identity.\n\nThe creative brief was intentionally minimal: produce evergreen social content in both 1:1 and 9:16 formats using provided copy, brand colors, and fonts. Deliverables began with clean, procedural animations built in After Effects using a small set of static photos, logos, and reference animations. Custom templates were developed to ensure motion consistency and scalability. This early phase established trust and provided a dependable production baseline.\n\nWhile delivering the baseline assets, it became clear that neutral 2D treatments lacked specificity and emotional resonance. A fully rebuilt 3D model of the puzzle was placed in a clean, physics-driven “blue world” environment — and this post significantly outperformed average engagement metrics. The success validated a pivot: high-polish, immersive 3D content would become a recurring feature of the campaign.\n\nAfter the initial success, audience demographic data was requested to refine the creative strategy. The majority of buyers were women aged 35–55, purchasing as family gifts — often a toy for kids, a novelty for a spouse, or a shared activity. This insight motivated a new direction: a series of lifestyle-inspired 3D environments (living rooms, desks, bookshelves, outdoor scenes) designed to show the puzzle as something that could live anywhere in the home, while retaining MSCHF’s surreal and playful energy.\n\nAlongside the lifestyle scenes, alternate concepts were developed to expand the visual language — experimenting with composition, color, and narrative framing. The modular 3D environments were later adapted for seasonal moments like Halloween and Labor Day, efficiently re-skinned with updated props, lighting, and palettes without sacrificing visual quality.\n\nMidway through the year, a marketing consultant recommended more minimal, “readable” assets with a 2D-style presentation. This created a design challenge: simplify without losing the polish that was now core to the brand’s look. The solution was to keep the pipeline in 3D but reduce camera movement, depth complexity, and environmental detail — preserving brand quality while delivering assets that were immediately legible.\n\nExact metrics were not disclosed, but internal reports cited a substantial increase in conversions and engagement for 3D-driven campaigns, exceeding expectations. The project evolved from a small adaptation brief into a scalable visual system that could flex across audiences, seasons, and creative styles while maintaining brand distinction.'}
          </div>
        </div>
      </aside>
    </>
  )
}
