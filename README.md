# frontend-anexo

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Diseñador: DnD y redimensionado por columnas

- Reordenación: usamos `vuedraggable` (SortableJS) para arrastrar desde la paleta y reordenar en el lienzo y dentro de paneles. Es ideal para estructuras tipo Kanban/listas y soporta táctil.
- Redimensionado: implementamos handles laterales en cada campo para ajustar columnas `sm/md/lg` (1..12) con snap. Se actualiza en el store y respeta el breakpoint actual.
- Alternativa: si necesitas widgets libres con cambio de tamaño y posición en una cuadrícula absoluta, se puede integrar `vue-grid-layout` como complemento. Aquí priorizamos vuedraggable porque el requerimiento se centra en formularios de 12 columnas y anidación en paneles.
