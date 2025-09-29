<template>
  <div>
    <PrimeButton icon="pi pi-question-circle" severity="help" text rounded size="small" @click="mostrarAyuda = true"
      v-tooltip.top="'Ver ejemplos y ayuda'" />

    <DialogoAyuda v-model:visible="mostrarAyuda" titulo="Guía de Validaciones" ancho="700px">
      <PrimeTabs value="0">
        <PrimeTabList>
          <PrimeTab value="0">Básicas</PrimeTab>
          <PrimeTab value="1">Patrones</PrimeTab>
          <PrimeTab value="2">Avanzadas</PrimeTab>
        </PrimeTabList>

        <PrimeTabPanels>
          <!-- Validaciones Básicas -->
          <PrimeTabPanel value="0">
            <div class="flex flex-column gap-4">
              <PrimeCard v-for="validacion in validacionesBasicas" :key="validacion.tipo">
                <template #title>
                  <div class="flex align-items-center gap-2">
                    <i :class="`pi ${validacion.icono} ${validacion.colorClase}`"></i>
                    {{ validacion.titulo }}
                  </div>
                </template>
                <template #content>
                  <p class="contenido mb-3">{{ validacion.descripcion }}</p>
                  <PrimePanel header="Ejemplo" toggleable collapsed class="mb-3">
                    <template #content>
                      <div class="surface-100 border-round p-3">
                        <strong>{{ validacion.ejemploTitulo }}:</strong>
                        <PrimeTag :value="validacion.ejemploValor" class="ml-2" />
                      </div>
                    </template>
                  </PrimePanel>
                  <div v-if="validacion.casos" class="surface-50 border-round p-3">
                    <strong class="">Casos comunes:</strong>
                    <ul class="mt-2 mb-0 pl-3">
                      <li v-for="caso in validacion.casos" :key="caso" class="mb-1">{{ caso }}</li>
                    </ul>
                  </div>
                </template>
              </PrimeCard>
            </div>
          </PrimeTabPanel>

          <!-- Patrones -->
          <PrimeTabPanel value="1">
            <div class="flex flex-column gap-3">
              <PrimeMessage severity="info" :closable="false">
                <template #messageicon>
                  <i class="pi pi-search"></i>
                </template>
                Expresiones regulares para validar formatos específicos. Haz clic en "Copiar" para usar el patrón.
              </PrimeMessage>

              <PrimeAccordion v-model:activeIndex="patronActivo" multiple>
                <PrimeAccordionTab v-for="(patron, index) in patronesComunes" :key="patron.nombre"
                  :header="patron.nombre">
                  <div class="flex flex-column gap-3">
                    <div class="flex align-items-center justify-content-between">
                      <PrimeInputText :model-value="patron.regex" readonly class="flex-1 mr-2 font-mono texto-sm" />
                      <PrimeButton label="Copiar" icon="pi pi-copy" size="small" outlined
                        @click="copiarPatron(patron.regex)" />
                    </div>

                    <p class="contenido m-0">{{ patron.descripcion }}</p>

                    <div>
                      <strong class=" texto-sm">Ejemplos válidos:</strong>
                      <div class="flex flex-wrap gap-1 mt-2">
                        <PrimeTag v-for="ejemplo in patron.ejemplos" :key="ejemplo" :value="ejemplo" severity="success"
                          rounded />
                      </div>
                    </div>
                  </div>
                </PrimeAccordionTab>
              </PrimeAccordion>
            </div>
          </PrimeTabPanel>

          <!-- Avanzadas -->
          <PrimeTabPanel value="2">
            <div class="flex flex-column gap-4">
              <PrimeMessage severity="warn" :closable="false">
                <template #messageicon>
                  <i class="pi pi-code"></i>
                </template>
                Las funciones deben retornar <code>true</code> si el valor es válido, o <code>false</code> si no es
                válido.
              </PrimeMessage>

              <PrimeCard v-for="ejemplo in ejemplosPersonalizados" :key="ejemplo.nombre">
                <template #title>
                  <div class="flex align-items-center justify-content-between">
                    <span>{{ ejemplo.nombre }}</span>
                    <PrimeButton label="Copiar Código" icon="pi pi-copy" size="small" text
                      @click="copiarCodigo(ejemplo.codigo)" />
                  </div>
                </template>
                <template #content>
                  <p class="contenido mb-3">{{ ejemplo.descripcion }}</p>
                  <PrimeScrollPanel style="width: 100%; height: 200px">
                    <pre
                      class="surface-900 text-0 p-3 border-round font-mono texto-sm overflow-auto"><code>{{ ejemplo.codigo }}</code></pre>
                  </PrimeScrollPanel>
                </template>
              </PrimeCard>
            </div>
          </PrimeTabPanel>
        </PrimeTabPanels>
      </PrimeTabs>
    </DialogoAyuda>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DialogoAyuda from '@/componentes/DialogoAyuda.vue'

const mostrarAyuda = ref(false)
const patronActivo = ref<number[]>([])

const validacionesBasicas = [
  {
    tipo: 'requerido',
    titulo: 'Campo Obligatorio',
    descripcion: 'Hace que el usuario deba completar el campo antes de enviar el formulario.',
    icono: 'pi-exclamation-triangle',
    colorClase: 'color-rojo',
    ejemploTitulo: 'Ejemplo de mensaje',
    ejemploValor: 'Este campo es obligatorio'
  },
  {
    tipo: 'longitud-minima',
    titulo: 'Longitud Mínima',
    descripcion: 'Define el número mínimo de caracteres que debe tener el texto.',
    icono: 'pi-arrow-down',
    colorClase: 'text-blue-500',
    ejemploTitulo: 'Valor mínimo',
    ejemploValor: '3',
    casos: ['Nombres: 2 caracteres', 'Contraseñas: 8 caracteres', 'Comentarios: 10 caracteres']
  },
  {
    tipo: 'longitud-maxima',
    titulo: 'Longitud Máxima',
    descripcion: 'Limita el número máximo de caracteres permitidos.',
    icono: 'pi-arrow-up',
    colorClase: 'text-orange-500',
    ejemploTitulo: 'Valor máximo',
    ejemploValor: '100',
    casos: ['Títulos: 100 caracteres', 'Descripciones: 500 caracteres', 'Comentarios: 1000 caracteres']
  }
]

const patronesComunes = [
  {
    nombre: 'Email',
    regex: '^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$',
    descripcion: 'Valida direcciones de correo electrónico',
    ejemplos: ['usuario@ejemplo.com', 'test.email@dominio.org']
  },
  {
    nombre: 'Teléfono',
    regex: '^\\+?[1-9]\\d{1,14}$',
    descripcion: 'Valida números de teléfono internacionales',
    ejemplos: ['+1234567890', '987654321']
  },
  {
    nombre: 'Solo Letras',
    regex: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$',
    descripcion: 'Solo permite letras y espacios (incluye acentos)',
    ejemplos: ['Juan Pérez', 'María José']
  },
  {
    nombre: 'Solo Números',
    regex: '^\\d+$',
    descripcion: 'Solo permite dígitos numéricos',
    ejemplos: ['123', '456789']
  },
  {
    nombre: 'Código Postal',
    regex: '^\\d{5}$',
    descripcion: 'Código postal de 5 dígitos',
    ejemplos: ['12345', '67890']
  },
  {
    nombre: 'URL',
    regex: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
    descripcion: 'Valida URLs web',
    ejemplos: ['https://ejemplo.com', 'http://www.sitio.org']
  }
]

const ejemplosPersonalizados = [
  {
    nombre: 'Edad mínima',
    codigo: `function(valor) {
  const edad = parseInt(valor);
  return edad >= 18;
}`,
    descripcion: 'Valida que la edad sea mayor o igual a 18 años'
  },
  {
    nombre: 'Contraseña segura',
    codigo: `function(valor) {
  const tieneMinuscula = /[a-z]/.test(valor);
  const tieneMayuscula = /[A-Z]/.test(valor);
  const tieneNumero = /\\d/.test(valor);
  const tieneEspecial = /[!@#$%^&*]/.test(valor);

  return valor.length >= 8 &&
         tieneMinuscula &&
         tieneMayuscula &&
         tieneNumero &&
         tieneEspecial;
}`,
    descripcion: 'Valida contraseñas con al menos 8 caracteres, mayúsculas, minúsculas, números y símbolos'
  },
  {
    nombre: 'Fecha futura',
    codigo: `function(valor) {
  const fecha = new Date(valor);
  const hoy = new Date();
  return fecha > hoy;
}`,
    descripcion: 'Valida que la fecha sea posterior al día actual'
  }
]

function copiarPatron(patron: string) {
  navigator.clipboard.writeText(patron).then(() => {
    // Aquí podrías mostrar un toast de confirmación
    console.log('Patrón copiado al portapapeles')
  })
}

function copiarCodigo(codigo: string) {
  navigator.clipboard.writeText(codigo).then(() => {
    // Aquí podrías mostrar un toast de confirmación
    console.log('Código copiado al portapapeles')
  })
}
</script>
