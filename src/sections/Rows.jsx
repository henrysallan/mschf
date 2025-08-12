import VideoPlayer from '../components/VideoPlayer'
import Image from '../components/Image'

export default function Rows() {
  return (
    <div className="space-y-12">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="prose prose-invert">
          <h3>Two Column Text</h3>
          <p>Describe the project, goals, and context. We will replace this with your copy.</p>
        </div>
        <Image className="w-full h-64 object-cover rounded" src="https://picsum.photos/seed/7/1200/800" alt="" />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Image key={i} className="w-full h-48 object-cover rounded" src={`https://picsum.photos/seed/${i+10}/800/600`} alt="" />
        ))}
      </div>

      <div>
        <VideoPlayer className="w-full aspect-video rounded" src={''} poster={''} />
      </div>
    </div>
  )
}
