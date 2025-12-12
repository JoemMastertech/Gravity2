# Arquitectura JavaScript

Este documento describe la arquitectura modular implementada para el manejo de productos y UI.

## Estructura de Directorios (`Shared/modules/`)

La lógica de negocio se ha extraído de los componentes UI y se organiza en:

### 1. Common (`Shared/modules/common/`)
Utilidades genéricas reutilizables en toda la aplicación.
- **`utils.js`**: `simpleHash`, `formatPrice`, `slugify`.

### 2. Domain (Blindaje de Datos - `src/schemas/`)
Definiciones puras de entidades. NO dependen de UI ni de Supabase.
- **`product.schema.js`**: Define `productSchema` y `licorSchema` usando Zod. Contiene la lógica bilingüe (`z.preprocess`) y defaults.

### 3. Infrastructure (`Infraestructura/data-providers/`)
Adaptadores que obtienen datos sucios y los limpian.
- **`product-data.js`**: 
    1. Llama a Supabase.
    2. Recibe datos crudos (snake_case).
    3. Ejecuta `z.array(schema).parse(data)`.
    4. Retorna objetos limpios y tipados (camelCase) a la aplicación.

### 4. Product Table (`Shared/modules/product-table/`)
Módulos específicos del dominio de la tabla de productos.
- **`utils.js`**: Lógica de negocio específica (`determineProductType`, `normalizeCategory`).
- **`state.js`**: Gestión del estado de la vista (`currentViewMode`, `productCache`).
- **`events.js`**: Manejadores de eventos y delegación (`click` en tablas y grids).
- **`api.js`**: Capa de abstracción sobre `ProductRepository` y Supabase.

## Componentes UI (`Interfaces/web/ui-adapters/components/`)
- **`product-table.js`**: 
  - Actúa como **Orquestador UI**.
  - Importa lógica de los módulos compartidos.
  - Se encarga EXCLUSIVAMENTE de manipular el DOM y renderizar HTML.
  - No contiene lógica de negocio ni llamadas directas a APIs (usa `api.js`).

## Flujo de Datos
1. **Eventos**: `events.js` captura interacciones del usuario.
2. **Acciones**: Invoca métodos en `state.js` o `product-table.js` (rendering).
3. **Datos**: `api.js` obtiene datos del repositorio.
4. **Render**: `product-table.js` recibe datos y actualiza el DOM.
