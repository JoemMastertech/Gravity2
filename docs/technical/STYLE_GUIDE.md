# Guía de Estilos y Breakpoints (STYLE_GUIDE.md)

Este documento es la **Fuente de Verdad** para la estandarización visual del proyecto. Consolida las reglas BEM y el sistema de Breakpoints extraídos de la documentación técnica.

---

## 1. Sistema de Breakpoints (6 Niveles)

El proyecto utiliza un sistema de **6 Tiers** para garantizar fluidez desde relojes inteligentes hasta monitores 4K.

| Breakpoint | Rango | Dispositivo Típico | Comportamiento Clave |
| :--- | :--- | :--- | :--- |
| **Desktop** | `> 1200px` | PC / Mac grandes | Layout completo, Sidebar expandido. |
| **Laptop** | `901px - 1200px` | Laptops 13" / iPad Pro | Grid de productos se adapta (3 columnas). |
| **Tablet** | `769px - 900px` | iPad Portrait | Navegación se compacta, Sidebar colapsable. |
| **Mobile Large**| `481px - 768px` | Tablets pequeñas / Plus | Menú hamburguesa, Grid de 2 columnas. |
| **Mobile Std** | `376px - 480px` | iPhone / Pixel | Stack vertical (1 columna), Touch targets grandes. |
| **Mobile Small**| `≤ 375px` | iPhone SE / Antiguos | **Modo de Superviencia UI**: Fuentes reducidas, márgenes mínimos. |

### Reglas Especiales
- **Landscape Mobile**: `(max-width: 768px) and (orientation: landscape)`. Optimiza altura para teclados/navegación horizontal.
- **Ultra-Tiny**: Ajustes específicos para tablas de licores en pantallas de <350px.

---

## 2. Metodología CSS (BEM + ITCSS)

Utilizamos **BEM** (Block Element Modifier) para componentes y una estructura de capas (ITCSS).

### Nomenclatura BEM
- **Bloque**: `.componente` (La entidad raíz)
- **Elemento**: `.componente__elemento` (Parte interna, depende del bloque)
- **Modificador**: `.componente--variante` (Estado o versión alternativa)

### Ejemplo Práctico: Tarjeta de Producto
```css
/* Bloque */
.product-card { } 

/* Elementos */
.product-card__image { }
.product-card__title { }
.product-card__price { }

/* Modificadores */
.product-card--featured { border: 2px solid gold; }
.product-card__price--discount { color: red; }
```

### Arquitectura de Archivos (ITCSS)
1. **Settings**: Variables SASS, Breakpoints.
2. **Tools**: Mixins.
3. **Generic**: Resets (Normalize).
4. **Base**: HTML tags puros (`body`, `h1`).
5. **Objects**: Layouts, Grids (`.container`).
6. **Components**: UI específica (`.btn`, `.card`).
7. **Trumps/Utilities**: Helpers de alta especificidad (`.u-hidden`, `.u-text-center`).

---

## 3. Clases Utilitarias (Reemplazando `!important`)
El proyecto está en proceso de eliminar `!important`. Usa estas clases prefijadas con `u-`:

- **Layout**: `.u-hidden`, `.u-flex`, `.u-block`.
- **Spacing**: `.u-m-0` (margin 0), `.u-p-2` (padding).
- **Text**: `.u-text-center`, `.u-text-bold`, `.u-text-ellipsis`.
- **Size**: `.u-w-full` (width 100%), `.u-h-screen`.

---

*Esta guía debe ser consultada antes de escribir cualquier línea de CSS nuevo.*
