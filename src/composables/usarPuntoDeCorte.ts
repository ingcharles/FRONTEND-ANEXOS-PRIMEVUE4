import { onMounted, onUnmounted, ref } from 'vue'
import type { PuntoDeCorte } from '@/tipos/Comunes'

// Detectar breakpoint actual (sm, md, lg) basado en anchos típicos de PrimeFlex
// md: >= 768px, lg: >= 992px
export function usarPuntoDeCorte() {
  const punto = ref<PuntoDeCorte>('sm')

  let mmMd: MediaQueryList | null = null
  let mmLg: MediaQueryList | null = null

  function actualizar() {
    const hasMM = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    const isLg = mmLg?.matches ?? (hasMM ? window.matchMedia('(min-width: 992px)').matches : false)
    const isMd = mmMd?.matches ?? (hasMM ? window.matchMedia('(min-width: 768px)').matches : false)
    punto.value = isLg ? 'lg' : isMd ? 'md' : 'sm'
  }

  function onChange() {
    actualizar()
  }

  onMounted(() => {
    const hasMM = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    if (hasMM) {
      mmMd = window.matchMedia('(min-width: 768px)')
      mmLg = window.matchMedia('(min-width: 992px)')
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

