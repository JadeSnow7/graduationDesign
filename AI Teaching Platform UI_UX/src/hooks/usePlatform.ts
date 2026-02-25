import { useState, useEffect } from 'react'

export function usePlatform() {
  const [platform, setPlatform] = useState<'web' | 'desktop'>('web')

  useEffect(() => {
    // Tauri injects __TAURI_INTERNALS__ into the window
    const isTauriEnv =
      typeof window !== 'undefined' &&
      '__TAURI_INTERNALS__' in window

    setPlatform(isTauriEnv ? 'desktop' : 'web')
  }, [])

  return {
    isDesktop: platform === 'desktop',
    isWeb: platform === 'web',
    isMobile: false // Rely on useMobile hook for actual mobile breakpoint detection
  }
}
