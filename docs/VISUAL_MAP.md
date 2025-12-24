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

## 🎛️ PANEL C: LAYOUT SHELL (Desktop Grid)
**Status:** ✅ PHOENIX PROTOCOL (Active)
**Source:** `Shared/styles/layout/_layout-shell.scss`
**Trigger:** `min-width: 1280px`

El sistema abandona Flexbox y adopta un Grid Real de 3 columnas para estabilidad total.

| Columna | Ancho | Función | Comportamiento |
| :--- | :--- | :--- | :--- |
| **1. Nav** | `80px` | Espaciador / Trigger | Reservado para Menú Izquierdo (cerrado). |
| **2. Content** | `1fr` | Contenido Principal | Elástico. Se expande o contrae según el sidebar. |
| **3. Sidebar** | `0px -> 350px` | Panel de Órdenes | **Sticky.** Se expande al detectar orden activa. |

### Jerarquía Visual (Z-Index Layers)
Control estricto de capas para evitar superposiciones ("Protocolo Fénix").

| Capa (Layer) | Z-Index | Elementos | Notas |
| :--- | :--- | :--- | :--- |
| **GOD MODE** | `2005` | **Menú de Ajustes** | Flota sobre absolutamente todo. |
| **Overlay** | `2000` | Menú Izquierdo | Backdrop clásico. |
| **High UI** | `1001` | Top Nav Bar | Barra superior fija. |
| **Modales** | `1000` | Video / Info | Tapa el contenido y sidebar. |
| **Base UI** | `1` | **Sidebar de Órdenes** | Integrado en el layout (Sticky). |
| **Content** | `0` | Grid / Tablas | Nivel base. |

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

### 1A. El Contenedor Unificado (Black Card Wrapper)
**New Standard (Dec 2025):** Grid Views and Liquor Menus are no longer floating cards. They are wrapped in a `.grid-view-container` that mimics the Table styling.
- **Background:** `var(--card-bg)` (Dark Glass).
- **Border:** `1px solid var(--border-color)`.
- **Shadow:** `0 0 20px` (Depth).
- **Structure:** Contains `h2.page-title` + `.product-grid` + `prompt`.

### 2. La Tarjeta (Componente `.product-card`)
**Architecture:** Uses `%card-shell` mixin (The Skeleton).
- **Core Styles:** Shared border, shadow, transition, hover effect (Golden Glow).
- **Altura Base:** `200px` (min).
- **Twins Variant:**
  - Standard: `min-height: 300px`, `object-fit: cover`.
  - Liquor: `min-height: 200px` (variable), `object-fit: contain` (Bottles).

### 3. Tipografía & Precios
- **Título:** `.product-name` -> `1.1rem` (Bold 600).
- **Precios (Unified Logic):**
  - Renderizado por `_renderCardPrices` (JS Strategy Pattern).
  - **Licores:** Alineación Vertical (Etiqueta + Botón).
  - **Standard:** Flex Wrap Centered.
  - **Estilo:** `.price-button` (Golden Standard).

---

## 🎛️ PANEL B: MODO TABLA (Listas)
**Independence Status:** ✅ TOTAL
**Source:** `Shared/styles/views/_view-table.scss`
*Refactored from _tables.scss*

### 1. Estructura (Table Layout)
- **Ancho:** 100% (Max 1400px).
- **Estilo:** `border-collapse: separate` con `border-spacing` variable (ver Modifiers).
- **El Esqueleto (`%table-core`):**
  - Nuevo Mixin maestro que combate la duplicidad.
  - Hereda `padding` y `text-align` centralizados.
  - **Defensa de Títulos:** Protege `tr.title-row` de heredar bordes o estilos destructivos.

### 2. The Twins Architecture (Gemelos)
Hemos separado el diseño en dos entidades distintas:

#### A. Tabla Estándar (`.standard-table`)
Diseñada para Alitas, Snacks, Pizzas (información densa).
- **Layout:** `auto` (Se adapta al contenido).
- **Thumbnails:** `80px x 56px` (Landscape) - FIXED with `!important`.
- **Ingredientes:** Ancho preferente `40%` (min `250px`).
- **Nombres:** Min `150px`.

#### B. Tabla Visual (`.liquor-table`)
Diseñada para Licores, Cervezas, Refrescos (Impacto visual).
- **Layout:** `fixed` (Control milimétrico).
- **Ancho:** Compactado al 95% (Max 1080px).
- **Imágenes:** `95px` (Grandes, aisladas).

### 3. Universal Optimizations (Grand Unification)
*Features implementados en `Dec 15` para consistencia total.*

#### A. El "Renglón" (Visual Separator)
Todas las celdas (`td`) incluyen ahora un borde inferior sutil:
- **Color:** `var(--border-color)` (Sincronizado con Tema).
- **Grosor:** `1px` (Elegante).
- **Excepción:** `tr.title-row` y `.compact` overrides.

#### B. El Botón Dorado (`.price-button`)
Estilo unificado para TODOS los precios (simples o múltiples).
- **Visual:** Glassmorphism + Borde Dorado + Glow.
- **Comportamiento Híbrido:**
  - En tablas simples: Se centra (`margin: 0 auto`) y toma `75%` ancho.
  - En grids (Alitas/Licores): Se alinea a la derecha (`justify-self: end`).

#### C. The Ghost Grid (`.stacked-price-container`)
Sistema universal para precios múltiples (Antes exclusivo de Licores).
- Renderizado por `_createMultiPriceCell` (JS).
- Alinea `Label (Izq)` vs `Button (Der)` perfectamente.
- Usado ahora en: Licores, Alitas, Cervezas.

#### D. Calibración de Spacing
- **Padding Vertical:** `18px` (Reducido de 25px para balance).
- **Modifiers:**
  - `.table-compact`: `10px` spacing (Ideal para Alitas).
  - `.table-spacious`: `20px` spacing (Standard Food).

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

