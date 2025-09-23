import { updatePrimaryPalette, updatePreset } from '@primeuix/themes'

type Sombra = 50|100|200|300|400|500|600|700|800|900|950
export type Paleta = Record<Sombra, string>
export type Superficies =
  | Partial<Record<Sombra, string>>
  | { claro?: Partial<Record<Sombra, string>>; oscuro?: Partial<Record<Sombra, string>> }

// Cambiar paleta primaria en runtime (por ejemplo, a 'emerald')
export function cambiarPaletaPrimaria(paleta: Paleta) {
  updatePrimaryPalette(paleta)
}

// Cambiar superficies (claro/oscuro) en runtime
export function cambiarSuperficies(opciones: Superficies) {
  // Si es un objeto plano, aplica a ambos esquemas; si trae claro/oscuro, respeta cada uno
  if (!('claro' in opciones) && !('oscuro' in opciones)) {
    const palette = opciones as Partial<Record<Sombra, string>>
    updatePreset({
      semantic: {
        colorScheme: {
          light: { surface: palette },
          dark: { surface: palette },
        },
      },
    })
  } else {
    const scoped = opciones as { claro?: Partial<Record<Sombra, string>>; oscuro?: Partial<Record<Sombra, string>> }
    updatePreset({
      semantic: {
        colorScheme: {
          ...(scoped.claro ? { light: { surface: scoped.claro } } : {}),
          ...(scoped.oscuro ? { dark: { surface: scoped.oscuro } } : {}),
        },
      },
    })
  }
}
