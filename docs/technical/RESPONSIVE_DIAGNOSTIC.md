# Diagnóstico de Diseño Responsivo (Estado Actual)

Este documento mapea las reglas CSS activas que definen el comportamiento de Grids y Tablas, confirmando la alineación con la lógica de negocio.

## 1. Sistema de Grillas (`_product-table-v2.scss`)

| Dispositivo | Breakpoint | Columnas | Selector Clave | Ubicación |
| :--- | :--- | :--- | :--- | :--- |
| **Móvil Portrait** | Default | **2 Columnas** | `.product-grid` | Line 14 |
| **Móvil Landscape** | `(orientation: landscape)` | **3 Columnas** | `@media ... landscape` | Line 84 |
| **Tablet** | `min-width: 768px` | **3 Columnas** | `@media (min-width: 768px)` | Line 72 |
| **Desktop** | `min-width: 1024px` | **3 Columnas** | `@media (min-width: 1024px)` | Line 84 |
| **Licores (Grid)** | `min-width: 1200px` | **5 Columnas** | `.category-grid[data...="licores"]` | Line 125 |

### Verificación Lógica
- ✅ **Móvil Portrait**: 2 columnas (Confirmado).
- ✅ **Landscape/Tablet**: 3 columnas (Confirmado).
- ✅ **Licores Desktop**: 5 columnas (Excepción confirmada).

---

## 2. Sistema de Tablas (`_tables.scss`)

Define el comportamiento de las tablas de datos (Licores, Alimentos).

### Reglas Estrictas (Móvil Portrait)
Ubicadas en `@media (max-width: 480px) and (orientation: portrait)` (Línea 142).

**Reglas Nucleares (No negociables):**
1. **Ancho Forzado**: `width: 100% !important`, `margin: 0 !important`.
2. **Layout Fijo**: `table-layout: fixed !important`. Previene que una celda larga rompa la tabla.
3. **Compresión de Celdas**: 
   - `padding: 2px !important`.
   - `font-size: 0.75rem`.
4. **Imágenes Diminutas**: Forzadas a `30px` (Línea 169).

### Modo Supervivencia (Ultra-Small)
Ubicado al final del archivo (Línea 239).
- **Rompimiento de Texto**: `word-break: break-all !important` para precios y headers de licores.
- **Fuente Microscópica**: `0.65rem` en cabeceras críticas.

## 3. Conclusión
El sistema actual respeta fielmente la lógica de **"Desktop Base / Mobile Override"**. 
Las reglas de Móvil Portrait son agresivas (`!important`) intencionalmente para garantizar que la tabla quepa en pantallas de <350px sin romper el layout.
