import { useGLTF } from '@react-three/drei'

// Utility function to preload GLB models
export function preloadModel(url) {
  useGLTF.preload(url)
}

// You can call this in your main component to preload models
export function preloadAllModels() {
  preloadModel('/models/model.glb')
}
