import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { FieldSchema, FormSchema, PageSchema } from '@/types/form-schema'
import { clonarProfundo, duplicarConNuevosIds } from '@/utils/clone'
import { deserializarFormulario, serializarFormulario } from '@/utils/serializer'
import { generarId } from '@/utils/id'

export interface ClipboardItem {
  field: FieldSchema
}

function crearFormularioVacio(): FormSchema {
  return {
    id: generarId('form'),
    name: 'Nuevo formulario',
    pages: [
      { id: generarId('page'), title: 'Página 1', fields: [] },
    ],
    settings: { gridSnap: true, columns: 12 },
  }
}

export const useDesignerStore = defineStore('designer', () => {
  const formSchema = ref<FormSchema>(crearFormularioVacio())
  const selectedFieldId = ref<string | null>(null)
  const clipboard = ref<ClipboardItem | null>(null)
  const activePageIndex = ref<number>(0)

  const gridSnap = computed({
    get: () => formSchema.value.settings?.gridSnap ?? true,
    set: (v: boolean) => {
      if (!formSchema.value.settings) formSchema.value.settings = { gridSnap: v, columns: 12 }
      else formSchema.value.settings.gridSnap = v
    },
  })

  const paginaActiva = computed<PageSchema>(() => formSchema.value.pages[activePageIndex.value])
  const camposPagina = computed<FieldSchema[]>(() => paginaActiva.value?.fields ?? [])
  const campoSeleccionado = computed<FieldSchema | null>(() => {
    const id = selectedFieldId.value
    if (!id) return null
    for (const page of formSchema.value.pages) {
      const stack: FieldSchema[] = [...page.fields]
      while (stack.length) {
        const n = stack.shift()!
        if (n.id === id) return n
        if (n.children) stack.push(...n.children)
      }
    }
    return null
  })

  function seleccionarCampo(id: string | null): void {
    selectedFieldId.value = id
  }

  function agregarCampo(campo: FieldSchema, indice?: number): void {
    const copia = clonarProfundo(campo)
    if (!copia.id) copia.id = generarId('field')
    paginaActiva.value.fields.splice(indice ?? paginaActiva.value.fields.length, 0, copia)
    seleccionarCampo(copia.id)
  }

  function moverCampo(indiceOrigen: number, indiceDestino: number): void {
    const arr = paginaActiva.value.fields
    const [item] = arr.splice(indiceOrigen, 1)
    arr.splice(indiceDestino, 0, item)
  }

  function actualizarCampo(id: string, cambios: Partial<FieldSchema>): void {
    function actualizarEnLista(lista: FieldSchema[]): boolean {
      const idx = lista.findIndex((f) => f.id === id)
      if (idx >= 0) {
        lista[idx] = { ...lista[idx], ...clonarProfundo(cambios) }
        return true
      }
      for (const f of lista) {
        if (f.children && actualizarEnLista(f.children)) return true
      }
      return false
    }
    for (const page of formSchema.value.pages) {
      if (actualizarEnLista(page.fields)) return
    }
  }

  function duplicarCampo(id: string): void {
    function duplicarEnLista(lista: FieldSchema[]): boolean {
      const idx = lista.findIndex((f) => f.id === id)
      if (idx !== -1) {
        const copia = duplicarConNuevosIds(lista[idx], () => generarId('field'))
        lista.splice(idx + 1, 0, copia)
        seleccionarCampo(copia.id)
        return true
      }
      for (const f of lista) {
        if (f.children && duplicarEnLista(f.children)) return true
      }
      return false
    }
    for (const page of formSchema.value.pages) {
      if (duplicarEnLista(page.fields)) return
    }
  }

  function eliminarCampo(id: string): void {
    function eliminarEnLista(lista: FieldSchema[]): boolean {
      const idx = lista.findIndex((f) => f.id === id)
      if (idx !== -1) {
        lista.splice(idx, 1)
        return true
      }
      for (const f of lista) {
        if (f.children && eliminarEnLista(f.children)) return true
      }
      return false
    }
    for (const page of formSchema.value.pages) {
      if (eliminarEnLista(page.fields)) {
        if (selectedFieldId.value === id) selectedFieldId.value = null
        return
      }
    }
  }

  function serializar(): string {
    return serializarFormulario(formSchema.value)
  }

  function deserializar(json: string): void {
    formSchema.value = deserializarFormulario(json)
    selectedFieldId.value = null
    activePageIndex.value = 0
  }

  function exportarJson(): void {
    const contenido = serializar()
    const nombre = `${formSchema.value.name.replace(/\s+/g, '_')}.json`
    // uso perezoso para evitar dependencias aquí
    import('@/utils/serializer').then(({ descargarJson }) => descargarJson(nombre, contenido))
  }

  async function importarJson(archivo: File): Promise<void> {
    const text = await archivo.text()
    deserializar(text)
  }

  function agregarPagina(): void {
    formSchema.value.pages.push({ id: generarId('page'), title: `Página ${formSchema.value.pages.length + 1}`, fields: [] })
    activePageIndex.value = formSchema.value.pages.length - 1
  }

  function eliminarPagina(indice: number): void {
    if (formSchema.value.pages.length <= 1) return
    formSchema.value.pages.splice(indice, 1)
    activePageIndex.value = Math.max(0, activePageIndex.value - 1)
  }

  function duplicarPagina(indice: number): void {
    const page = formSchema.value.pages[indice]
    const copia: PageSchema = clonarProfundo(page)
    copia.id = generarId('page')
    copia.title = `${page.title ?? 'Página'} (copia)`
    copia.fields = copia.fields.map((f) => duplicarConNuevosIds(f, () => generarId('field')))
    formSchema.value.pages.splice(indice + 1, 0, copia)
    activePageIndex.value = indice + 1
  }

  return {
    // estado
    formSchema,
    selectedFieldId,
    clipboard,
    activePageIndex,
    gridSnap,
    // getters
    paginaActiva,
    camposPagina,
    campoSeleccionado,
    // acciones
    seleccionarCampo,
    agregarCampo,
    moverCampo,
    actualizarCampo,
    duplicarCampo,
    eliminarCampo,
    serializar,
    deserializar,
    exportarJson,
    importarJson,
    agregarPagina,
    eliminarPagina,
    duplicarPagina,
  }
})
