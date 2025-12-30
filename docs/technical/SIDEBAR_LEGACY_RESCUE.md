# Rescate de Lógica Legacy: Sidebar de Órdenes (Análisis Definitivo)

Este documento integra el análisis profundo de CSS y JS del commit `64aed10`.

## 1. El "Push" Matemático (CSS)
La base del éxito era el cálculo dinámico en `main.css`:

| Variable | Valor | Función |
| :--- | :--- | :--- |
| `--order-sidebar-width-tl` | `284px` | Ancho base Tablet Landscape. |
| `--parent-left-padding-tl` | `5%` | **Clave**: Offset visual izquierdo para centrar la tabla. |
| Formula | `calc(100vw - var(--width))` | Hacía que el contenedor 'respirara' con el sidebar. |

## 2. El "Conflicto" JS (La Competencia Detectada)
El análisis de JS reveló por qué "había reglas compitiendo".
En `product-table.js` existía este bloque peligroso:

```javascript
// La "Race Condition" Visual
setTimeout(() => {
    if (window.innerWidth <= 768 && window.innerHeight > window.innerWidth) {
        // JS sobrescribía CSS aquí violentamente
        img.style.maxWidth = '100%'; 
        cell.style.textAlign = 'center'; // Sobrescribía alineación de tabla
    }
}, 50);
```

**Diagnóstico**: El CSS definía una regla, pero 50ms después, el JS inyectaba estilos en línea (`style="..."`), ganando por especificidad y causando saltos visuales o comportamientos erráticos si el CSS tardaba en cargar.

## 3. Plan Maestro de Restauración

1.  **CSS**: Implementar la lógica de variables (`--sidebar-width`, `--left-offset: 5%`) usando **CSS Grid**.
    *   Esto elimina la necesidad de `calc()` complejos en `padding`.
2.  **JS**: **ELIMINAR** toda inyección de estilos en `product-table.js`.
    *   No more `img.style.maxWidth`.
    *   No more `setTimeout` hacks.
    *   El CSS Grid es suficiente y más performante.

## 4. Por qué Grid es mejor que el Legacy `calc()`
El legacy usaba `calc()` para *simular* columnas. Grid *crea* columnas reales.
*   Legacy: "Calcula el ancho restante y ponle padding".
*   Grid: "Tengo 2 columnas, tú ocupas esta, tú la otra".

Procederemos a replicar la **matemática visual** del Legacy (ancho 284px, offset 5%) pero sobre un motor **Grid** robusto, sin interferencia de JS.
