# 🚀 Roadmap de Pendientes (Sesión: 28 Dic 2025)

Este documento detalla los cabos sueltos identificados tras la auditoría de las fases 2, 3.5 y 4. Estos puntos deben ser atacados para alcanzar la "Integridad Total" del sistema.

---

## 🏗️ 1. Unificación Total de Modales (Fase 4 - Final)
**Estado actual:** Solo el modal de bebidas usa el `ModalSystem.js` (Builder Engine). El resto usa plantillas estáticas legacy.
- [ ] **Migrar Modal de Carne**: Convertir `meat-customization-template` en una configuración dinámica del `ModalSystem`.
- [ ] **Migrar Modal de Comida**: Convertir `food-customization-template` para Pizzas/Snacks.
- [ ] **Limpieza de index.html**: Eliminar todos los tags `<template>` de modales una vez migrados.
- [ ] **Visuales**: Asegurar que todos tengan el resplandor cian estandarizado y botones `.btn-contrast`.

## 🥩 2. Blindaje de Validaciones (Fase 11)
**Estado actual:** La validación de términos de cocción existe pero no es "impenetrable".
- [ ] **Enforcement**: Asegurar que el botón "Confirmar" del nuevo modal de carne esté deshabilitado (`disabled`) hasta que se seleccione un término.
- [ ] **Feedback**: Usar el nuevo sistema de feedback visual (glow rojo) si se intenta saltar el paso.

## 🛡️ 3. Operación "Cero Overrides" (Fase 7)
**Estado actual:** Quedan ~122 declaraciones `!important` y muchas clases manuales en el JS.
- [ ] **Reducción de !important**: Atacar los archivos `_view-table.scss` y `_view-grid.scss` para eliminar hacks de posicionamiento.
- [ ] **Migración a Utility Belt**: Reemplazar manipulaciones de estilo manuales en `OrderUI.js` (ej: `.className = 'hamburger-hidden'`) por clases estandarizadas `.u-hidden`.
- [ ] **Refactor de ScreenManager**: Asegurar que las transiciones de pantalla usen el sistema de animación por tokens en lugar de JS directo.

## 🧹 4. Desmantelamiento de Código Legacy
**Estado actual:** Archivos antiguos conviven con los nuevos, generando confusión.
- [ ] **Eliminar `_modals.scss`**: (Una vez migrados todos los modales).
- [ ] **Eliminar `_modals_custom.scss`**: Consolidar lo útil en `_modal-system.scss`.
- [ ] **Auditoría de JS**: Eliminar funciones duplicadas en `OrderUI.js` que ya realiza el `SidebarManager`.

---

> [!IMPORTANT]
> **Prioridad #1:** Migración de Modales de Carne y Comida. Es la mayor discrepancia visual actualmente.
