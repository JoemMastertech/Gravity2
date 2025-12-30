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
| **Borde Sistema** | `--border-color` | `#00f7ff40` | Cyan (25% Opacity) |
| **Tokens (DNA)** | `Shared/styles/settings/_tokens.scss` | Various | Spacing, Radius, Glass, Shadows |

---

## 🎛️ SYSTEM A: THE ACTION SYSTEM (Buttons)
**Source:** `Shared/styles/components/_button-system.scss`
**Status:** ✅ UNIFIED (Dec 24, 2025)

The application now uses 4 Master Variants for all interactions, eliminating ad-hoc styles.

| Variant | Class | Visual DNA | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `.btn-primary` | Transparent BG + Cyan Border | Standard Actions |
| **Contrast** | `.btn-contrast` | **Black BG** + Cyan Border | **Prices, Modals (High Priority)** |
| **Ghost** | `.btn-ghost` | Transparent + No Border | Cancel, Secondary |
| **Icon** | `.btn-icon` | Circular Gradient | Counters (+/-) |

> **Unification Note:** Price Buttons and Modal Action Buttons now use the exact same `.btn-contrast` class, fully matching the Left Sidebar aesthetics (`var(--border-color)`).

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
| **Licores (Wide)** | `.sys-grid-5` | **5 Cols** | `var(--spacing-lg)` | - | Full Desktop 2x5 Protocol |

### 1A. El Contenedor Unificado (Black Card Wrapper)
**New Standard (Dec 2025):** Grid Views and Liquor Menus are no longer floating cards. They are wrapped in a `.grid-view-container` that mimics the Table styling.
- **Background:** `var(--card-bg)` (Dark Glass).
- **Border:** `1px solid var(--border-color)`.
- **Shadow:** `0 0 20px` (Depth).
- **Protocol**: `display: flex; flex-direction: column; align-items: center;` (Enforced).
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

#### B. El Botón de Contraste (`.btn-contrast`)
Estilo unificado para TODOS los precios y acciones críticas.
- **Visual:** Fondo Negro + Borde Sistema (Cian) + Texto Blanco.
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

## 🎛️ PANEL E: THE UTILITY BELT (.u-)
**Source:** `Shared/styles/utilities/_utils.scss`
**Philosophy:** Fast, consistent spacing and alignment without writing custom SCSS.

| Category | Prefix | Example | Impact |
| :--- | :--- | :--- | :--- |
| **Visibility** | `.u-` | `.u-hidden`, `.u-fade-in` | Replaces legacy `screen-hidden` |
| **Spacing** | `.u-m-`, `.u-p-` | `.u-mt-xl`, `.u-p-md` | Token-based margins/padding |
| **Flexbox** | `.u-flex-` | `.u-flex-column`, `.u-justify-between` | Rapid internal alignment |
| **Sizing** | `.u-w-full` | `.u-h-full` | Fill parent containers |

---

## 🎛️ PANEL F: THE DRAWER SYSTEM
**Architecture:** `SidebarManager.js` (Coordinator) + Specialized Controllers.
**Unified Styles:** `%sidebar-shell` (Shared visual identity).

| Drawer | Controller | Side | Trigger | Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Navigation** | `NavigationDrawer.js` | Left | Hamburger | Overlay (Mobile/Desktop) |
| **Settings** | `SettingsDrawer.js` | Right | Settings Icon | Overlay (Mobile/Desktop) |
| **Orders** | `OrderDrawer.js` | Right | Automatic | **Persistent Grid** (Desktop) |

### Transition Flow
1. User interacts -> Controller (e.g. `SettingsDrawer.open()`).
2. Controller calls `SidebarManager.open(id)`.
3. Manager logic:
   - Sets `body.sidebar-open` (Scroll lock).
   - Shows shared backdrop (`.sidebar-backdrop`).
   - Resolves conflicts (Closes others).

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

---

## 🎛️ SYSTEM D: MODAL ARCHITECTURE (v2)
**Source:** `Shared/styles/components/_modal-system.scss` & `_modals_custom.scss`
**Status:** ✅ REFACTORED (Dec 25, 2025)

The Modal System has been rebuilt to follow a "Natural Configuration" philosophy (No Inline Styles, No `!important`).

### 1. Visual DNA (The "Premium" Look)
| Feature | Implementation | Style |
| :--- | :--- | :--- |
| **Global Glow** | `.sys-modal-container` | `box-shadow: 0 0 25px var(--price-color)` (Static Cyan Glow, 15% reduced) |
| **Symmetry** | `.modal-actions` | "Yes/Confirm" buttons now match "No/Cancel" (`.btn-contrast`) for outline aesthetics. |
| **Drink Options** | `.drink-option-card.active` | **Cyan Glow** (Matches Hover) instead of White. Mirror effect. |

### 2. Technical Philosophy (Natural Config)
- **Zero Inline Styles:** All button sizing (`min-width: 100px`) and layout is handled by utility classes (`.u-modal-actions`).
- **Confirmation-First Protocol**: All customization modals place **Confirm (Matte Black)** on the left and **Cancel (Ghost)** on the right.
- **Simplified Branding**: Modal titles strictly show `product.name`, removing redundant category headers for a cleaner focus.
- **Zero Forces:** Removed all `!important` flags; styling relies strictly on SCSS cascade and specificity.
- **Unified Logic:** `OrderUI.js` delegates all styling to CSS classes via `_launchCustomizationModal`.
