import { describe, it, expect } from 'vitest'
import { duplicarConNuevosIds } from '../../utilidades/clonar'

interface Nodo { id: string; children?: Nodo[]; x?: number }

describe('duplicarConNuevosIds', () => {
  it('Deberia duplicar con ids únicos y mantener estructura', () => {
    const base: Nodo = { id: 'a', children: [{ id: 'b' }, { id: 'c', children: [{ id: 'd' }] }] }
    let seq = 0
    const nuevo = duplicarConNuevosIds(base, () => `n_${++seq}`)
    // ids no vacíos y únicos
    const ids = [
      nuevo.id,
      nuevo.children?.[0].id,
      nuevo.children?.[1].id,
      nuevo.children?.[1].children?.[0].id,
    ].filter(Boolean) as string[]
    const set = new Set(ids)
    expect(set.size).toBe(ids.length)
    // estructura igual pero objetos distintos
    expect(nuevo).not.toBe(base)
    expect(nuevo.children?.[1]).not.toBe(base.children?.[1])
  })
})
