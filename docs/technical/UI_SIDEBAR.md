# Documentación del Sistema de Cajones (Phoenix Rebuild)

## Resumen de la Arquitectura
El sistema ha migrado de definiciones CSS manuales y dispersas a una arquitectura coordinada por el `SidebarManager`. Ahora los cajones son componentes desacoplados que comparten un "Backdrop" unificado.

## Componentes del Sistema

### 1. SidebarManager.js (El Coordinador)
- **Función**: Orquestador central del estado de todos los sidebars.
- **Responsabilidades**: 
  - Gestión del Backdrop (Overlay).
  - Bloqueo de scroll (`body.sidebar-open`).
  - Resolución de conflictos entre sidebars (evita múltiples sidebars abiertos simultáneamente en móvil).
  - Breakpoint Desktop: **1280px**.

### 2. Controladores Especializados
| Controlador | Archivo | Función |
|-------------|---------|---------|
| **NavigationDrawer** | `NavigationDrawer.js` | Menú izquierdo (Hamburgesa). Ahora desacoplado de la renderización de botones. |
| **OrderDrawer** | `OrderDrawer.js` | Panel de órdenes (Derecha). Integrado en el Grid de Desktop. |
| **SettingsDrawer** | `SettingsDrawer.js` | Panel de ajustes (Derecha). Maneja transiciones de sub-paneles (Idiomas/Tema). |

## Implementación CSS (_sidebars.scss)

### Estructura Unificada
Se utiliza el mixin `%sidebar-shell` para asegurar consistencia visual:
```scss
%sidebar-shell {
    position: fixed;
    background: var(--card-bg);
    backdrop-filter: blur(var(--blur-lg, 15px));
    z-index: var(--z-modal, 2000);
    transition: transform var(--transition-time) cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Comportamientos Responsivos
- **Mobile (< 1280px)**: Todos los cajones actúan como Overlays (encima del contenido) con Backdrop.
- **Desktop (≥ 1280px)**: 
  - **Navigation/Settings**: Overlays.
  - **Order Sidebar**: Persistente, integrado en el Layout Shell (Grid).

## Refinamientos Recientes (Diciembre 2025)
- [x] **Eliminación de Duplicados**: `NavigationDrawer` ya no renderiza sus propios botones; delega en `app-init.js`.
- [x] **Limpieza de Visibilidad**: Eliminados conflictos entre `.u-hidden` y clases legacy como `.screen-hidden`.
- [x] **Unificación de Backdrop**: Un solo elemento `.sidebar-backdrop` con z-index 1999.

## Fecha de Actualización
**Última revisión**: 27 de Diciembre, 2025