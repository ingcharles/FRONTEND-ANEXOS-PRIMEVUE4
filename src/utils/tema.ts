import { updatePrimaryPalette, updatePreset } from '@primeuix/themes'

type Shade = 50|100|200|300|400|500|600|700|800|900|950
export type Paleta = Record<Shade, string>
export type Superficies =
  | Partial<Record<Shade, string>>
  | { light?: Partial<Record<Shade, string>>; dark?: Partial<Record<Shade, string>> }

// Cambiar paleta primaria en runtime (por ejemplo, a 'emerald')
export function CambiarPaletaPrimaria(paleta: Paleta) {
  updatePrimaryPalette(paleta)
}

// Cambiar superficies (light/dark) en runtime
export function CambiarSuperficies(opciones: Superficies) {
  // Si es un objeto plano, aplica a ambos esquemas; si trae light/dark, respeta cada uno
  if (!('light' in opciones) && !('dark' in opciones)) {
    const palette = opciones as Partial<Record<Shade, string>>
    updatePreset({
      semantic: {
        colorScheme: {
          light: { surface: palette },
          dark: { surface: palette },
        },
      },
    })
  } else {
    const scoped = opciones as { light?: Partial<Record<Shade, string>>; dark?: Partial<Record<Shade, string>> }
    updatePreset({
      semantic: {
        colorScheme: {
          ...(scoped.light ? { light: { surface: scoped.light } } : {}),
          ...(scoped.dark ? { dark: { surface: scoped.dark } } : {}),
        },
      },
    })
  }
}
