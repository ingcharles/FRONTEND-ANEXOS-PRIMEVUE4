import { onMounted, onUnmounted, ref } from 'vue'
import type { TamanoDiseno } from '@/tipos/Comunes'

// Detectar breakpoint actual (sm, md, lg) basado en anchos típicos de PrimeFlex
// md: >= 768px, lg: >= 992px
export function usarPuntoDeCorte() {
  const punto = ref<TamanoDiseno>('sm')

  let mmMd: MediaQueryList | null = null
  let mmLg: MediaQueryList | null = null

  const Q_MD = '(min-width: 768px)'
  const Q_LG = '(min-width: 992px)'
  const hasMM = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'

  function actualizar() {
    const isLg = mmLg?.matches ?? (hasMM() ? window.matchMedia(Q_LG).matches : false)
    const isMd = mmMd?.matches ?? (hasMM() ? window.matchMedia(Q_MD).matches : false)
    punto.value = isLg ? 'lg' : isMd ? 'md' : 'sm'
  }

  function onChange() {
    actualizar()
  }

  onMounted(() => {
    if (hasMM()) {
      mmMd = window.matchMedia(Q_MD)
      mmLg = window.matchMedia(Q_LG)
      mmMd.addEventListener('change', onChange)
      mmLg.addEventListener('change', onChange)
    } else {
      mmMd = null
      mmLg = null
    }
    actualizar()
  })

  onUnmounted(() => {
    mmMd?.removeEventListener('change', onChange)
    mmLg?.removeEventListener('change', onChange)
  })

  return { punto }
}

