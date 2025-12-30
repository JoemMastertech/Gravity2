# Documentación del Sistema de Modales (Phase 4: Unified)

## Resumen de la Arquitectura
El sistema de modales ha migrado de plantillas HTML estáticas y manipulaciones manuales a un motor de construcción dinámico: `ModalSystem.js`.

## El Motor (ModalSystem.js)
Este componente actúa como un `Builder` que inyecta modales en el DOM bajo demanda, asegurando que solo exista un modal activo y que su comportamiento sea consistente.

### API de ModalSystem
```javascript
import { ModalSystem } from './ModalSystem.js';

ModalSystem.show({
    title: '¿Confirmar selección?',
    content: 'Texto o elemento HTML',
    actions: [
        { label: 'Cancelar', type: 'ghost', onClick: () => { /* ... */ } },
        { label: 'Confirmar', type: 'primary', onClick: () => { /* ... */ } }
    ]
});
```

### Tipos de Botones Estandarizados
| Tipo | Uso | Clase CSS |
|------|-----|-----------|
| **primary** | Acción positiva (Confirmar, Aceptar) | `.btn-primary` |
| **ghost** | Acción neutra/negativa (Cancelar) | `.btn-ghost` |
| **contrast** | Acciones de alta visibilidad | `.btn-contrast` |

## Estilo Visual (_modal-system.scss)
- **Glassmorphism**: Aplica `--surface-glass-2` para un fondo semi-transparente elegante.
- **Efectos**: Inyecta un resplandor dinámico (`--elevation-glow`) basado en el acento del tema activo.
- **Scroll**: El sistema bloquea automáticamente el scroll del `body` mientras el modal está abierto.

## Migraciones Completadas
- [x] **Drink Options**: El modal de bebidas ahora usa el motor dinámico.
- [x] **Meat/Food Customization**: Migrado a `ModalSystem` para manejo de guarniciones e ingredientes.
- [x] **Generic Confirmation**: Modales simples de error o validación.

## Fecha de Actualización
**Última revisión**: 27 de Diciembre, 2025
