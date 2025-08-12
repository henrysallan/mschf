import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'

// Resolve asset URLs to respect Vite base path (e.g., /mschf/ on GitHub Pages)
function resolveAssetUrl(input) {
  if (!input) return `${import.meta.env.BASE_URL}nonexistent.glb`
  if (/^https?:\/\//i.test(input) || input.startsWith('data:')) return input
  const trimmed = input.replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${trimmed}`
}

function Model({ url, ...props }) {
  const ref = useRef()
  
  // Normalize URL against Vite base so absolute paths don't break on Pages
  const validUrl = resolveAssetUrl(url)
  const { scene, error } = useGLTF(validUrl, true)
  
  // Slow rotation - always call useFrame
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })
  
  // If no URL provided or model fails, show placeholder cube
  const shouldShowPlaceholder = !url || url === "" || error || !scene
  
  if (shouldShowPlaceholder) {
    return (
      <mesh ref={ref} {...props}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    )
  }
  
  return <primitive ref={ref} object={scene} {...props} />
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#e5e5e5" />
    </mesh>
  )
}

function Scene({ modelUrl }) {
  return (
    <>
      {/* Reduced Studio Lighting Setup */}
      <ambientLight intensity={0.2} />
      
      {/* Key light - reduced intensity */}
      <directionalLight
        position={[5, 8, 4]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fill light - much softer */}
      <directionalLight
        position={[-2, 3, 2]}
        intensity={0.3}
        color="#f8f8f8"
      />
      
      {/* Rim light - subtle edge definition */}
      <directionalLight
        position={[-3, 0, -3]}
        intensity={0.2}
        color="#e8e8e8"
      />
      
      {/* Removed top light to reduce overexposure */}
      
      {/* Model with Suspense fallback */}
      <Suspense fallback={<LoadingFallback />}>
        <Model 
          url={modelUrl} 
          scale={1}
          position={[0, 0, 0]}
        />
      </Suspense>
      
      {/* Environment with reduced influence */}
      <Environment preset="studio" background={false} environmentIntensity={0.3} />
    </>
  )
}

export default function ThreeViewer({ 
  modelUrl = "models/model.glb", 
  height = "100vh",
  className = ""
}) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ 
          background: 'white'
        }}
      >
        <Scene modelUrl={modelUrl} />
        
        {/* Optional: Allow user interaction */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}
