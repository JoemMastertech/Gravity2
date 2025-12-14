# 🎨 Visual System Map (Radiography)
*Generated: Dec 13, 2025*
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
**Sources:** `Shared/styles/components/_product-table-v2.scss` (Layout), `cards.css` (Component)

### 1. Estructura (Grid Layout)
| Dispositivo | Breakpoint | Columnas | Gap (Espacio) | Padding |
| :--- | :--- | :--- | :--- | :--- |
| **Móvil Portrait** | Defaults | 2 ccols | `12px` | `12px` |
| **Móvil (Min)** | > 480px | 2 cols | `12px` | `12px` |
| **Tablet/Desktop** | > 768px | 3 cols | `16px` | `16px` |
| **Large Desktop** | > 1200px | 3 cols | `20px` | `20px` |
| **Licores (Desktop)** | > 1200px | **5 cols** | `20px` | - |

### 2. La Tarjeta (Componente `.product-card`)
- **Altura Imagen:** `180px` (Fixed).
- **Bordes:** `10px` (Rounded). (*User estimate: 12px*)
- **Sombra:** `0 0 10px var(--border-color)`.
- **Padding Interno:** `clamp(15px, 1.8vw, 20px)`.

### 3. Tipografía Grid
- **Título:** `1.1rem` (Bold 600).
- **Precio:** `0.9rem` (Bold 600). (*User estimate: 1.2rem*)
- **Descripción:** Size `clamp(0.7rem...)`. Color `text-color`.

---

## 🎛️ PANEL B: MODO TABLA (Listas)
**Independence Status:** ✅ TOTAL
**Source:** `Shared/styles/components/_tables.scss`
*Cambios aquí NO afectan al Grid.*

### 1. Estructura (Table Layout)
- **Ancho:** 100% (Max 1400px).
- **Estilo:** `border-collapse: separate` con `border-spacing: 0 10px` (Filas flotantes).

### 2. La Fila (Componente `tr`)
| Configuración | Valor Actual (Code) | Notas |
| :--- | :--- | :--- |
| **Padding Celda** | `15px 10px` | *User estimate: 12px 15px* |
| **Borde Inferior** | `2px solid` | Separador |
| **Hover** | `rgba(0,0,0,0.4)` | Oscurecimiento |

### 3. Elementos Internos
- **Imagen Thumbnail:** `70px x 70px` (Cuadrada). (*User estimate: 60px*)
- **Animación:** Glow `2s infinite`.

### ⚠️ Zona de Conflicto (Overrides Móviles)
**Source:** `_tables.scss` @media (max-width: 480px)

Estas reglas fuerzan la tabla a caber en pantallas pequeñas. Son destructivas ("Nuclear Option").
- **Padding:** `2px !important`.
- **Imagen:** `30px !important`.
- **Fuente:** `0.75rem`.
- **Layout:** `fixed`.

---

## 🛠️ Guía de Edición (Hacker's Manual)

### Si quieres cambiar...

1.  **Tamaño Tarjetas (PC):**
    - Ir a `_product-table-v2.scss`.
    - Buscar `@media (min-width: 768px)`.
    - Cambiar `repeat(3, ...)` a `repeat(2, ...)`.

2.  **Letra de Tabla:**
    - Ir a `_tables.scss`.
    - Buscar `.product-table td`.
    - Editar `font-size` (Solo afectará tablas).

3.  **Color Precios (Global):**
    - Ir a `variables.css`.
    - Editar `--price-color` o `--accent-color`.

4.  **Imágenes de Licores:**
    - Ir a `cards.css`.
    - Buscar `.product-card.liquor-card .product-image`.
    - Grid Licores tiene reglas propias de altura (`clamp`).
