import './index.css'
import CaseStudy from './sections/mschf/CaseStudy'
import { LightboxProvider } from './components/Lightbox'
import StickyInfoPanel from './components/StickyInfoPanel'

export default function App() {
  return (
    <LightboxProvider>
      <div className="min-h-screen bg-white text-black">
        <main className="container mx-auto px-6 py-10 max-w-[750px]">
          <CaseStudy />
        </main>
        <footer className="container mx-auto px-6 pb-10 text-black/50 text-xs max-w-[750px]">
          
        </footer>
        <StickyInfoPanel />
      </div>
    </LightboxProvider>
  )
}
