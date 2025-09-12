import { onMounted, onUnmounted, ref } from 'vue'
import type { Breakpoint } from '@/types/form-schema'

// Detectar breakpoint actual (sm, md, lg) basado en anchos típicos de PrimeFlex
// md: >= 768px, lg: >= 992px
export function usarPuntoDeCorte() {
  const punto = ref<Breakpoint>('sm')

  let mmMd: MediaQueryList | null = null
  let mmLg: MediaQueryList | null = null

  function actualizar() {
    const isLg = mmLg?.matches ?? window.matchMedia('(min-width: 992px)').matches
    const isMd = mmMd?.matches ?? window.matchMedia('(min-width: 768px)').matches
    punto.value = isLg ? 'lg' : isMd ? 'md' : 'sm'
  }

  function onChange() {
    actualizar()
  }

  onMounted(() => {
    mmMd = window.matchMedia('(min-width: 768px)')
    mmLg = window.matchMedia('(min-width: 992px)')
    mmMd.addEventListener('change', onChange)
    mmLg.addEventListener('change', onChange)
    actualizar()
  })

  onUnmounted(() => {
    mmMd?.removeEventListener('change', onChange)
    mmLg?.removeEventListener('change', onChange)
  })

  return { punto }
}
