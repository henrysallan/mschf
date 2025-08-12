export default function Image({ src, alt = '', className = '', width, height, sizes }) {
  return (
    <img
      loading="lazy"
      decoding="async"
      alt={alt}
      src={src}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
    />
  )
}
