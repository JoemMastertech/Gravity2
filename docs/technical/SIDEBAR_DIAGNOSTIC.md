# Diagnóstico de Arquitectura de Sidebar (Actual)

Este documento detalla el estado actual de la implementación del Sidebar de Órdenes, identificando puntos críticos y deuda técnica.

## 1. Posicionamiento CSS Actual (`_sidebar.scss`)

| Breakpoint | Posición | Dimensiones | Comportamiento |
| :--- | :--- | :--- | :--- |
| **Desktop** | `fixed` | `top: 90px`, `right: 20px`, `w: 264px` | **Flotante**. No empuja el contenido nativamente, requiere márgenes JS. |
| **Tablet Portrait** | `fixed` | `bottom: 0`, `left: 0`, `w: 100vw` | **Bottom Sheet**. Cubre el contenido inferior. |
| **Mobile** | `fixed` | `bottom: 0`, `left: 0`, `w: 100%` | **Bottom Sheet**. Desliza desde abajo. |

### Problema Crítico: Layout Shift
En Desktop, el sidebar es `fixed` pero simula empujar el contenido usando una clase `.with-sidebar` en `layout/_containers.scss` que añade `padding-right: 300px`.
*   **Riesgo**: Si el JS falla o tarda en cargar, el sidebar flota sobre el contenido (overlay) tapando la tabla.

## 2. Lógica de Activación JS (`OrderUI.js`)

El sidebar es controlado por `OrderSystem` -> `OrderUI`.

### Clases de Estado Controladas por JS
1.  **Globales**:
    *   `body.sidebar-open`: Bloquea scroll en móvil? (A verificar).
    *   `.content-wrapper.with-sidebar`: Añade el padding derecho en Desktop.
    *   `.content-wrapper.order-active`: Estado general.

2.  **En el Sidebar (`#order-sidebar`)**:
    *   `.active` / `.is-open` / `.sidebar-visible`: Controlan `display: flex`.
    *   `.sidebar-mobile-portrait` / `.sidebar-mobile-landscape`: Clases específicas de orientación añadidas dinámicamente.

### Flujo de Activación
1.  Usuario activa "Crear Orden".
2.  `OrderSystem.toggleOrderMode()` llama a `ui.toggleOrderModeUI(true)`.
3.  `OrderUI` añade clases y recalcula orientación.
4.  `OrderUI` escucha `orientationchange` y `resize` para cambiar entre modo Desktop (Lateral) y Móvil (Bottom).

## 3. Puntos de Fricción Identificados

1.  **Dependencia de JS para Layout**: El layout responsivo depende fuertemente de que JS detecte la orientación y añada clases. CSS puro sería más robusto.
2.  **Overlays Móviles**: En móvil, el sidebar es un overlay que puede tapar el botón de "Ver Orden" si no se gestionan los z-index correctamente.
3.  **Z-Index War**: El sidebar tiene `z-index: 900`. Necesitamos asegurar que los Modales (`z-index: 1000+`) siempre estén encima.
4.  **Ghost Sidebar**: El código HTML del sidebar se inyecta o preserva dinámicamente en `product-table.js` al renderizar categorías, lo que añade complejidad.

## 4. Estrategia de Estabilización

Antes de tocar las tablas, debemos:
1.  **Desktop**: Decidido si queremos `Fixed Overlay` o `Grid Layout` (pantalla dividida real).
    *   *Recomendación*: `Grid Layout` o `Flex` real para que el redimensionamiento de tablas sea automático, no calculado con px mágicos.
2.  **Mobile**: Refinar la transición del Bottom Sheet para que no se sienta "pegado".
3.  **Limpieza JS**: Reducir la cantidad de clases de estado que JS necesita gestionar manualmente.
