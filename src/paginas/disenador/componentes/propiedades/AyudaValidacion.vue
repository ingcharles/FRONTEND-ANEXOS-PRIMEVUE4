<template>
  <div class="ayuda-validacion">
    <PrimeButton
      icon="pi pi-question-circle"
      severity="help"
      text
      rounded
      size="small"
      @click="mostrarAyuda = true"
      v-tooltip.top="'Ver ejemplos y ayuda'"
      class="ayuda-trigger"
    />

    <PrimeDialog
      v-model:visible="mostrarAyuda"
      header="Guía de Validaciones"
      :modal="true"
      :closable="true"
      :draggable="false"
      :style="{ width: '600px' }"
      class="ayuda-dialog"
    >
      <div class="ayuda-contenido">
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
                <div class="ayuda-seccion">
                  <h4 class="text-primary mb-2">
                    <i class="pi pi-exclamation-triangle mr-2"></i>
                    Campo Obligatorio
                  </h4>
                  <p class="text-600 mb-3">Hace que el usuario deba completar el campo antes de enviar el formulario.</p>
                  <div class="ejemplo-card">
                    <strong>Ejemplo de mensaje:</strong>
                    <code>"Este campo es obligatorio"</code>
                  </div>
                </div>

                <div class="ayuda-seccion">
                  <h4 class="text-blue-600 mb-2">
                    <i class="pi pi-arrow-down mr-2"></i>
                    Longitud Mínima
                  </h4>
                  <p class="text-600 mb-3">Define el número mínimo de caracteres que debe tener el texto.</p>
                  <div class="ejemplo-card">
                    <strong>Casos comunes:</strong>
                    <ul class="mt-2 mb-0">
                      <li>Nombres: 2 caracteres</li>
                      <li>Contraseñas: 8 caracteres</li>
                      <li>Comentarios: 10 caracteres</li>
                    </ul>
                  </div>
                </div>

                <div class="ayuda-seccion">
                  <h4 class="text-orange-600 mb-2">
                    <i class="pi pi-arrow-up mr-2"></i>
                    Longitud Máxima
                  </h4>
                  <p class="text-600 mb-3">Limita el número máximo de caracteres permitidos.</p>
                  <div class="ejemplo-card">
                    <strong>Casos comunes:</strong>
                    <ul class="mt-2 mb-0">
                      <li>Títulos: 100 caracteres</li>
                      <li>Descripciones: 500 caracteres</li>
                      <li>Comentarios: 1000 caracteres</li>
                    </ul>
                  </div>
                </div>
              </div>
            </PrimeTabPanel>

            <!-- Patrones -->
            <PrimeTabPanel value="1">
              <div class="flex flex-column gap-4">
                <div class="ayuda-seccion">
                  <h4 class="text-purple-600 mb-2">
                    <i class="pi pi-search mr-2"></i>
                    Patrones Comunes
                  </h4>
                  <p class="text-600 mb-3">Expresiones regulares para validar formatos específicos.</p>
                </div>

                <div class="patron-ejemplo" v-for="patron in patronesComunes" :key="patron.nombre">
                  <div class="flex align-items-center justify-content-between mb-2">
                    <strong class="text-700">{{ patron.nombre }}</strong>
                    <PrimeButton
                      label="Copiar"
                      size="small"
                      text
                      @click="copiarPatron(patron.regex)"
                      class="p-0"
                    />
                  </div>
                  <code class="patron-codigo">{{ patron.regex }}</code>
                  <p class="text-500 text-sm mt-1">{{ patron.descripcion }}</p>
                  <div class="ejemplos-validos">
                    <small class="text-600">Ejemplos válidos:</small>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <PrimeTag
                        v-for="ejemplo in patron.ejemplos"
                        :key="ejemplo"
                        :value="ejemplo"
                        severity="success"
                        class="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </PrimeTabPanel>

            <!-- Avanzadas -->
            <PrimeTabPanel value="2">
              <div class="flex flex-column gap-4">
                <div class="ayuda-seccion">
                  <h4 class="text-teal-600 mb-2">
                    <i class="pi pi-code mr-2"></i>
                    Validaciones Personalizadas
                  </h4>
                  <p class="text-600 mb-3">Funciones JavaScript para lógica de validación compleja.</p>
                </div>

                <div class="codigo-ejemplo" v-for="ejemplo in ejemplosPersonalizados" :key="ejemplo.nombre">
                  <h5 class="text-700 mb-2">{{ ejemplo.nombre }}</h5>
                  <pre class="codigo-bloque"><code>{{ ejemplo.codigo }}</code></pre>
                  <p class="text-500 text-sm mt-2">{{ ejemplo.descripcion }}</p>
                </div>

                <div class="nota-importante">
                  <i class="pi pi-info-circle mr-2"></i>
                  <strong>Nota:</strong> La función debe retornar <code>true</code> si el valor es válido,
                  o <code>false</code> si no es válido.
                </div>
              </div>
            </PrimeTabPanel>
          </PrimeTabPanels>
        </PrimeTabs>
      </div>
    </PrimeDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mostrarAyuda = ref(false)

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
</script>

<style scoped>
.ayuda-trigger {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.ayuda-trigger:hover {
  opacity: 1;
}

.ayuda-contenido {
  max-height: 70vh;
  overflow-y: auto;
}

.ayuda-seccion {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-200);
}

.ayuda-seccion:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.ejemplo-card {
  background: var(--surface-50);
  border: 1px solid var(--surface-200);
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 0.5rem;
}

.patron-ejemplo {
  background: var(--surface-0);
  border: 1px solid var(--surface-200);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.patron-codigo {
  display: block;
  background: var(--surface-100);
  padding: 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  word-break: break-all;
}

.ejemplos-validos {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--surface-100);
}

.codigo-ejemplo {
  background: var(--surface-50);
  border: 1px solid var(--surface-200);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.codigo-bloque {
  background: var(--surface-900);
  color: var(--surface-0);
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  overflow-x: auto;
  margin: 0;
}

.codigo-bloque code {
  color: inherit;
  background: none;
  padding: 0;
}

.nota-importante {
  background: var(--blue-50);
  border: 1px solid var(--blue-200);
  border-radius: 6px;
  padding: 0.75rem;
  color: var(--blue-800);
}

.nota-importante code {
  background: var(--blue-100);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-size: 0.875rem;
}
</style>
