# 🚀 Roadmap de Pendientes (Sesión: 28 Dic 2025)

Este documento detalla los cabos sueltos identificados tras la auditoría de las fases 2, 3.5 y 4. Estos puntos deben ser atacados para alcanzar la "Integridad Total" del sistema.

---

## 🏗️ 1. Unificación Total de Modales (Fase 4 - Final)
**Estado actual:** Solo el modal de bebidas usa el `ModalSystem.js` (Builder Engine). El resto usa plantillas estáticas legacy.
- [x] **Migrar Modal de Carne**: Convertir `meat-customization-template` en una configuración dinámica del `ModalSystem`.
- [x] **Migrar Modal de Comida**: Convertir `food-customization-template` para Pizzas/Snacks.
- [x] **Limpieza de index.html**: Eliminar todos los tags `<template>` de modales una vez migrados.
- [x] **Visuales**: Asegurar que todos tengan el resplandor cian estandarizado y botones `.btn-contrast`.

- [x] **Enforcement**: El botón "Confirmar" regresó a su estado natural (siempre activo), priorizando la validación visual por vibración y color rojo.
- [x] **Feedback**: Se validó el funcionamiento del glow rojo (`.u-validation-error`) en el motor de modales.

## 🛡️ 3. Operación "Cero Overrides" (Fase 7)
**Estado actual:** Quedan ~122 declaraciones `!important` y muchas clases manuales en el JS.
- [x] **Limpieza de Vistas**: Los archivos `_view-table.scss` y `_view-grid.scss` ya están 100% libres de `!important` y usan Mixins/Tokens.
- [ ] **Reducción de !important en Layout**: Atacar `_containers.scss` y `_sidebars.scss` para eliminar hacks de posicionamiento residuales.
- [ ] **Color Purge**: Eliminar colores "quemados" (ej. `#00f7ff`) en archivos de utilerías y base, delegando todo a `var(--accent-color)`.
- [ ] **Refactor de ScreenManager**: Asegurar que las transiciones de pantalla usen el sistema de animación por tokens en lugar de JS directo.

## 🧹 4. Desmantelamiento de Código Legacy
**Estado actual:** Archivos antiguos conviven con los nuevos, generando confusión.
- [ ] **Eliminar `_modals.scss`**: (Una vez migrados todos los modales).
- [ ] **Eliminar `_modals_custom.scss`**: Consolidar lo útil en `_modal-system.scss`.
- [ ] **Auditoría de JS**: Eliminar funciones duplicadas en `OrderUI.js` que ya realiza el `SidebarManager`.

---

> [!IMPORTANT]
> **Estado Final:** Migración de Modales 100% Completada. Todos los componentes operan bajo el `ModalSystem` con estética Premium.
