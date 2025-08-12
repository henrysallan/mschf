export default function Placeholder({ label = 'Video Placeholder', aspect = '9 / 16', className = '' }) {
  return (
    <div
      aria-label={label}
      className={`bg-zinc-200 text-zinc-600 grid place-items-center ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <span className="text-[11px] tracking-wide uppercase">{label}</span>
    </div>
  )
}
