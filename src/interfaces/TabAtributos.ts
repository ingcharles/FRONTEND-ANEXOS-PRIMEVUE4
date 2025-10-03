import type { TipoDiseno } from "@/tipos/Comunes"
import type { MetodoHttp } from "@/tipos/TabAtributos"

export interface OpcionLayout {
  label: string
  value: TipoDiseno
}

export interface ConfigApi {
  url?: string
  method?: MetodoHttp
  dataPath?: string
  claveEtiqueta?: string
  claveValor?: string
  contentType?: string
  body?: string
  headersJson?: string
}

