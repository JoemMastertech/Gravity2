# 🎨 Visual System Map (Radiography)
*Generated: Dec 13, 2025*
*Updated: Dec 13, 2025 (Refactor Completed)*
*Status: Verified against Codebase*

## 🧬 Materia Prima (Global Variables)
**Source:** `Shared/styles/settings/variables.css`
These are the atoms of the design. Changes here ripple everywhere.

| Variable | Token Name | Actual Value (Code) | Notes |
| :--- | :--- | :--- | :--- |
| **Fuente Principal** | --n/a | 'Montserrat', sans-serif | Hardcoded in Components |
| **Fuente Secundaria** | --n/a | 'Roboto', sans-serif | Assumed default |
| **Color Acento** | `--accent-color` | `#00f7ff` (Cyan) | *User noted #00d4ff* |
| **Color Fondo** | `--background-color` | `#000000` | *User noted #0a0a0a* |
| **Color Texto** | `--text-color` | `var(--color-gray-200)` | #ECE9D8 |
| **Radio Borde** | `--radius-md` | `12px` | |

---

## 🎛️ PANEL A: MODO GRID (Tarjetas)
**Independence Status:** ✅ TOTAL
**Source:** `Shared/styles/views/_view-grid.scss`
*Unified View (formerly cards.css + product-table-v2)*

### 1. Estructura (Grid Layout)
Uses `tools/_mixins.scss` for responsive logic.

| Dispositivo | Mixin | Columnas | Gap | Padding | Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Móvil Portrait** | `@include mobile-portrait` | **2 Cols** | `var(--spacing-md)` | `var(--spacing-md)` | |
| **Móvil Landscape** | `@include mobile-landscape` | **3 Cols** | `var(--spacing-sm)` | - | **Sidebar Aware:** Drops to 2 cols if Sidebar Open |
| **Tablet Portrait** | `@include tablet-portrait` | **3 Cols** | `var(--spacing-lg)` | `var(--spacing-lg)` | |
| **Tablet Landscape** | `@include tablet-landscape` | **3 Cols** | `var(--spacing-lg)` | - | Desktop logic applies |
| **Licores (Wide)** | `@include desktop-wide` | **5 Cols** | `var(--spacing-lg)` | - | Only for licores category |

### 2. La Tarjeta (Componente `.product-card`)
- **Altura Imagen (Base):** `180px`.
- **Altura Imagen (Móvil Land):** `140px` (Compact).
- **Bordes:** `var(--radius-md)`.
- **Padding Interno:** `clamp(15px, 1.8vw, 20px)` (Base) / `10px` (Móvil Land).

### 3. Tipografía Grid
- **Título:** `.product-name` -> `1.1rem` (Bold 600).
- **Precio:** `.price-button` -> `0.75rem` (Centralized).

---

## 🎛️ PANEL B: MODO TABLA (Listas)
**Independence Status:** ✅ TOTAL
**Source:** `Shared/styles/views/_view-table.scss`
*Refactored from _tables.scss*

### 1. Estructura (Table Layout)
- **Ancho:** 100% (Max 1400px).
- **Estilo:** `border-collapse: separate` con `border-spacing: 0 10px` (Filas flotantes).
- **El Contenedor Supremo (`%table-shell`):**
  - Controla la simetría global.
  - Hereda `padding: 15px 20px` a TODAS las celdas (Izquierda/Derecha balanceados).

### 2. La Fila (Componente `tr`)
| Configuración | Valor Actual (Code) | Notas |
| :--- | :--- | :--- |
| **Padding Celda** | `15px 20px` | **Simetría Natural** (Antes asimétrico) |
| **Borde Inferior** | `2px solid` | Separador |
| **Hover** | `rgba(0,0,0,0.4)` | Oscurecimiento |

### 3. Elementos Internos
- **Imagen Thumbnail:** `70px x 70px` (Cuadrada).
- **Animación:** Glow `2s infinite`.

### ⚠️ Zona de Conflicto (Overrides Móviles)
**Source:** `_view-table.scss` -> `@mixin nuclear-mobile`

Estas reglas fuerzan la tabla a caber en pantallas pequeñas. Son destructivas ("Squish Protocol").
- **Padding:** `2px !important`.
- **Imagen:** `30px !important`.
- **Fuente:** `0.75rem`.
- **Layout:** `fixed`.

---

## 🛠️ Guía de Edición (New Hacker's Manual)

### Si quieres cambiar...

1.  **Tamaño Tarjetas (PC/Tablet):**
    - Ir a `Shared/styles/views/_view-grid.scss`.
    - Buscar `@include tablet-portrait` o start of file.
    - Cambiar `repeat(3, ...)` a `repeat(2, ...)`.

2.  **Comportamiento Móvil Landscape:**
    - Ir a `Shared/styles/views/_view-grid.scss`.
    - Buscar `@include mobile-landscape`.
    - Modificar la regla `.app-container.order-mode &` si quieres cambiar el comportamiento con Sidebar.

3.  **Letra de Tabla:**
    - Ir a `Shared/styles/views/_view-table.scss`.
    - Buscar `.product-table td`.
    - Editar `font-size` (Solo afectará tablas).

4.  **Imágenes de Licores:**
    - Ir a `Shared/styles/views/_view-grid.scss`.
    - Buscar `.product-card.liquor-card .product-image`.
    - Ajustar height clamp.
    
---

## 🎭 Coreografía de Animación (Anti-FOUC)
**Logic:** Centralized Robust Animation System
**Goal:** Prevent pile-up, ensure smooth entry/exit.
**Location:** 
- **Tool:** `tools/_mixins.scss` -> `@mixin stagger-children`
- **Keyframes:** `base/animations.css` -> `fadeIn`, `fadeOut`
- **States:** `layout/_containers.scss` -> `.screen-hidden`, `.fade-out`

### 1. El Orquestador (Mixin)
En lugar de bucles manuales, usamos el mixin robusto:
```scss
/* Usage in Views */
.product-card {
    /* Automates opacity:0 and delays */
    @include stagger-children(20, 0.05s); 
}
```

### 2. Máquina de Estados (Visibilidad)
El sistema de navegación (`app-init.js`, `ScreenManager.js`) depende de estas clases CSS críticas.

| Clase | Función | Comportamiento (CSS) |
| :--- | :--- | :--- |
| `.screen-hidden` | **Estado Final** | `display: none !important; opacity: 0;` |
| `.fade-out` | **Transición Salida** | `animation: fadeOut 1s ...` (Fuerza opacidad a 0) |
| `.screen-visible` | **Estado Visible** | `display: flex/block; opacity: 1;` |
| `.fade-in` | **Transición Entrada** | `animation: fadeIn 1s ...` |

> **Nota Crítica:** `.fade-out` usa `@keyframes` explícitos para garantizar que el elemento desaparezca visualmente antes de ser eliminado del flujo (display: none).

