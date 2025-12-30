# 📱 Matriz de Responsividad (The Behavioral Contract)
*Status: Draft for Approval*

Esta matriz define exactamente cómo debe comportarse la interfaz en los 4 modos críticos.

## 1. Definición de Modos (The Triggers)
El sistema usa `tools/_mixins.scss` para detectar estos estados.

| Modo | Mixin | Definición Técnica (Aprox) | Contexto de Uso |
| :--- | :--- | :--- | :--- |
| **Móvil Portrait** | `@include mobile-portrait` | Width < 480px + Portrait | Uso a una mano, lectura rápida. |
| **Móvil Landscape** | `@include mobile-landscape` | Width < 768px + Landscape | Pantalla ancha pero "bajita". Teclado virtual ocupa mucho espacio. |
| **Tablet Portrait** | `@include tablet-portrait` | Width 481px - 1024px + Portrait | Similar a desktop estrecho. |
| **Tablet Landscape** | `@include tablet-landscape` | Width > 768px + Landscape | **Virtualmente Desktop**. Experiencia completa. |

---

## 2. Panel A: GRID VIEW (Tarjetas)
*Objetivo: Maximizar visibilidad de producto sin saturar.*

| Característica | Móvil Portrait | Móvil Landscape | Tablet Portrait | Tablet Landscape (Desktop) |
| :--- | :--- | :--- | :--- | :--- |
| **Columnas** | **2 Cols** | **3 Cols** (Default) | **3 Cols** | **3 Cols** |
| **Sidebar Open** | N/A (Overlay) | **2 Cols** (Reactivo) ⚠️ | 3 Cols | 3 Cols |
| **Altura Tarjeta** | `Clamp(300px...)` | Compacta | Estándar (`350px`) | Estándar (`350px`) |
| **Imagen** | `180px` de alto | `140px` | `180px` | `180px` |

> **Regla Crítica (Sidebar Aware):** En **Móvil Landscape**, si el Sidebar está abierto (`.order-mode`), el Grid DEBE bajar a **2 Columnas** para mantener la legibilidad.

---

## 3. Panel B: TABLE VIEW (Listas)
*Objetivo: Lectura de datos y comparación de precios.*

| Característica | Móvil Portrait | Móvil Landscape | Tablet Portrait | Tablet Landscape (Desktop) |
| :--- | :--- | :--- | :--- | :--- |
| **Layout** | **Nuclear (Squish)** | Estándar Compacto | Estándar | Estándar Full |
| **Padding Celda** | `2px` (Extremo) | `6px` | `8px` | `15px` |
| **Tamaño Fuente** | `0.75rem` (Tiny) | `0.8rem` | `0.9rem` | `1.0rem` |
| **Imágenes** | `30px` (Icono) | `50px` | `60px` | `70px` |
| **Wrap Texto** | Si (Forzado) | No (Ellipsis) | No (Ellipsis) | No (Ellipsis) |

---

## 4. Estrategia de Implementación
1.  **Móvil Landscape es el reto:** A menudo se olvida. Si un usuario gira el teléfono, no queremos que la tarjeta ocupe toda la pantalla verticalmente.
2.  **Tablet Landscape = Desktop:** No haremos distinción mayor, salvo que el usuario lo pida.

---

### ✅ Checklist de Aprobación
- [ ] ¿Grid Móvil Landscape en 2 o 3 columnas?
- [ ] ¿Mantener el "Squish" (Nuclear) en Móvil Portrait? (Actualmente sí).
- [ ] ¿Tablet Portrait necesita columnas de 2 o 3? (Actualmente 3, podría sentirse apretado).
