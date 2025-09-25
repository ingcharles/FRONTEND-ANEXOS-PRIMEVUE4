import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAlmacenDisenador } from '@/almacenes/UsarAlmacenDisenador'
import { ServicioEsquemasFormulario } from '../ServicioEsquemas'
import type { EsquemaCampo } from '@/interfaces/Campos'
import { TipoCampoValor } from '@/enumeraciones/Campos'

describe('Validaciones Específicas por Tipo de Campo', () => {
  const servicioEsquemas = new ServicioEsquemasFormulario()

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('debe aplicar validaciones de longitud solo a campos de texto', () => {
    console.log('📝 TEST: Validaciones de longitud en campos de texto')
    console.log('==================================================')

    const almacen = useAlmacenDisenador()

    const campoTexto: EsquemaCampo = {
      id: 'campo-texto',
      tipo: TipoCampoValor.Texto,
      etiqueta: 'Campo Texto',
      nombre: 'campoTexto',
      requerido: false,
      validaciones: [
        {
          tipo: 'longitud-minima',
          valor: '5'
        }
      ]
    }

    almacen.esquemaFormulario = {
      id: 'form-texto',
      titulo: 'Formulario Texto',
      paginas: [
        {
          id: 'pagina-texto',
          titulo: 'Página Texto',
          campos: [campoTexto]
        }
      ]
    }

    // Probar con valor corto (debería fallar)
    almacen.actualizarValorCampo('pagina-texto', 'campoTexto', 'abc')

    const errores: Record<string, string> = {}
    for (const pagina of almacen.esquemaFormulario.paginas) {
      const valoresPagina = almacen.obtenerValoresPagina(pagina.id) as Record<string, unknown>
      const esquemaPagina = servicioEsquemas.crearEsquemaValidacion(pagina.campos)
      const resultado = esquemaPagina.safeParse(valoresPagina)

      if (!resultado.success) {
        for (const problema of resultado.error.issues) {
          const ruta = String(problema.path[0] || '')
          if (ruta) {
            errores[ruta] = problema.message
          }
        }
      }
    }

    console.log('Valor "abc" en campo texto - Errores:', errores)
    expect(errores.campoTexto).toBe('Debe tener al menos 5 caracteres')
  })

  it('debe aplicar validaciones de valor solo a campos numéricos', () => {
    console.log('\\n🔢 TEST: Validaciones de valor en campos numéricos')
    console.log('===================================================')

    const almacen = useAlmacenDisenador()

    const campoNumero: EsquemaCampo = {
      id: 'campo-numero',
      tipo: TipoCampoValor.Numero,
      etiqueta: 'Campo Número',
      nombre: 'campoNumero',
      requerido: false,
      validaciones: [
        {
          tipo: 'valor-minimo',
          valor: '10'
        }
      ]
    }

    almacen.esquemaFormulario = {
      id: 'form-numero',
      titulo: 'Formulario Número',
      paginas: [
        {
          id: 'pagina-numero',
          titulo: 'Página Número',
          campos: [campoNumero]
        }
      ]
    }

    // Probar con valor menor (debería fallar)
    almacen.actualizarValorCampo('pagina-numero', 'campoNumero', '5')

    const errores: Record<string, string> = {}
    for (const pagina of almacen.esquemaFormulario.paginas) {
      const valoresPagina = almacen.obtenerValoresPagina(pagina.id) as Record<string, unknown>
      const esquemaPagina = servicioEsquemas.crearEsquemaValidacion(pagina.campos)
      const resultado = esquemaPagina.safeParse(valoresPagina)

      if (!resultado.success) {
        for (const problema of resultado.error.issues) {
          const ruta = String(problema.path[0] || '')
          if (ruta) {
            errores[ruta] = problema.message
          }
        }
      }
    }

    console.log('Valor "5" en campo numérico - Errores:', errores)
    expect(errores.campoNumero).toBe('Debe ser mayor o igual a 10')
  })

  it('debe ignorar validaciones de longitud en campos numéricos', () => {
    console.log('\\n🚫 TEST: Ignorar validaciones de longitud en campos numéricos')
    console.log('==============================================================')

    const almacen = useAlmacenDisenador()

    const campoNumero: EsquemaCampo = {
      id: 'campo-numero-longitud',
      tipo: TipoCampoValor.Numero,
      etiqueta: 'Campo Número con Longitud',
      nombre: 'campoNumeroLongitud',
      requerido: false,
      validaciones: [
        {
          tipo: 'longitud-minima', // Esta validación debería ser ignorada
          valor: '5'
        }
      ]
    }

    almacen.esquemaFormulario = {
      id: 'form-numero-longitud',
      titulo: 'Formulario Número Longitud',
      paginas: [
        {
          id: 'pagina-numero-longitud',
          titulo: 'Página Número Longitud',
          campos: [campoNumero]
        }
      ]
    }

    // Probar con valor corto (NO debería fallar porque es campo numérico)
    almacen.actualizarValorCampo('pagina-numero-longitud', 'campoNumeroLongitud', '2')

    const errores: Record<string, string> = {}
    for (const pagina of almacen.esquemaFormulario.paginas) {
      const valoresPagina = almacen.obtenerValoresPagina(pagina.id) as Record<string, unknown>
      const esquemaPagina = servicioEsquemas.crearEsquemaValidacion(pagina.campos)
      const resultado = esquemaPagina.safeParse(valoresPagina)

      if (!resultado.success) {
        for (const problema of resultado.error.issues) {
          const ruta = String(problema.path[0] || '')
          if (ruta) {
            errores[ruta] = problema.message
          }
        }
      }
    }

    console.log('Valor "2" en campo numérico con validación longitud - Errores:', errores)
    expect(Object.keys(errores).length).toBe(0) // No debería haber errores
  })

  it('debe ignorar validaciones de valor en campos de texto', () => {
    console.log('\\n🚫 TEST: Ignorar validaciones de valor en campos de texto')
    console.log('==========================================================')

    const almacen = useAlmacenDisenador()

    const campoTexto: EsquemaCampo = {
      id: 'campo-texto-valor',
      tipo: TipoCampoValor.Texto,
      etiqueta: 'Campo Texto con Valor',
      nombre: 'campoTextoValor',
      requerido: false,
      validaciones: [
        {
          tipo: 'valor-minimo', // Esta validación debería ser ignorada
          valor: '10'
        }
      ]
    }

    almacen.esquemaFormulario = {
      id: 'form-texto-valor',
      titulo: 'Formulario Texto Valor',
      paginas: [
        {
          id: 'pagina-texto-valor',
          titulo: 'Página Texto Valor',
          campos: [campoTexto]
        }
      ]
    }

    // Probar con valor que sería menor si fuera numérico (NO debería fallar porque es campo texto)
    almacen.actualizarValorCampo('pagina-texto-valor', 'campoTextoValor', '5')

    const errores: Record<string, string> = {}
    for (const pagina of almacen.esquemaFormulario.paginas) {
      const valoresPagina = almacen.obtenerValoresPagina(pagina.id) as Record<string, unknown>
      const esquemaPagina = servicioEsquemas.crearEsquemaValidacion(pagina.campos)
      const resultado = esquemaPagina.safeParse(valoresPagina)

      if (!resultado.success) {
        for (const problema of resultado.error.issues) {
          const ruta = String(problema.path[0] || '')
          if (ruta) {
            errores[ruta] = problema.message
          }
        }
      }
    }

    console.log('Valor "5" en campo texto con validación valor - Errores:', errores)
    expect(Object.keys(errores).length).toBe(0) // No debería haber errores
  })

  it('debe aplicar múltiples validaciones correctamente según el tipo', () => {
    console.log('\\n🔄 TEST: Múltiples validaciones por tipo de campo')
    console.log('==================================================')

    const almacen = useAlmacenDisenador()

    const campoTexto: EsquemaCampo = {
      id: 'campo-texto-multiple',
      tipo: TipoCampoValor.Texto,
      etiqueta: 'Campo Texto Múltiple',
      nombre: 'campoTextoMultiple',
      requerido: false,
      validaciones: [
        {
          tipo: 'longitud-minima',
          valor: '3'
        },
        {
          tipo: 'longitud-maxima',
          valor: '10'
        }
      ]
    }

    const campoNumero: EsquemaCampo = {
      id: 'campo-numero-multiple',
      tipo: TipoCampoValor.Numero,
      etiqueta: 'Campo Número Múltiple',
      nombre: 'campoNumeroMultiple',
      requerido: false,
      validaciones: [
        {
          tipo: 'valor-minimo',
          valor: '5'
        },
        {
          tipo: 'valor-maximo',
          valor: '100'
        }
      ]
    }

    almacen.esquemaFormulario = {
      id: 'form-multiple',
      titulo: 'Formulario Múltiple',
      paginas: [
        {
          id: 'pagina-multiple',
          titulo: 'Página Múltiple',
          campos: [campoTexto, campoNumero]
        }
      ]
    }

    // Probar valores que violan las validaciones
    almacen.actualizarValorCampo('pagina-multiple', 'campoTextoMultiple', 'ab') // Muy corto
    almacen.actualizarValorCampo('pagina-multiple', 'campoNumeroMultiple', '3') // Muy pequeño

    const errores: Record<string, string> = {}
    for (const pagina of almacen.esquemaFormulario.paginas) {
      const valoresPagina = almacen.obtenerValoresPagina(pagina.id) as Record<string, unknown>
      const esquemaPagina = servicioEsquemas.crearEsquemaValidacion(pagina.campos)
      const resultado = esquemaPagina.safeParse(valoresPagina)

      if (!resultado.success) {
        for (const problema of resultado.error.issues) {
          const ruta = String(problema.path[0] || '')
          if (ruta) {
            errores[ruta] = problema.message
          }
        }
      }
    }

    console.log('Errores en validaciones múltiples:', errores)
    expect(errores.campoTextoMultiple).toBe('Debe tener al menos 3 caracteres')
    expect(errores.campoNumeroMultiple).toBe('Debe ser mayor o igual a 5')
  })
})
