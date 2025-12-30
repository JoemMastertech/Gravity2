# domUtils.js - Utilidades DOM

## Descripción General

`domUtils.js` es una biblioteca de utilidades DOM que proporciona funcionalidades robustas para el manejo de modales, manipulación segura de contenido HTML y gestión eficiente de elementos del DOM.

## Características Principales

### 🛡️ Manipulación Segura de DOM
- Validación de elementos antes de manipulación
- Manejo seguro de innerHTML (via `sanitizer.js`)
- Gestión de errores robusta

### 🔧 Gestión de Modales
- Funciones `showModal` y `hideModal` estandarizadas
- Control de atributos ARIA y clases `modal-hidden`/`modal-flex`
- Enfoque automático para accesibilidad

## API de Funciones

### Gestión de Modales

#### `showModal(modalId)`
Muestra un modal por su ID, manejando clases de visibilidad y foco.

```javascript
import { showModal } from './domUtils.js';
showModal('my-modal');
```

#### `hideModal(modalId)`
Oculta un modal por su ID.

```javascript
import { hideModal } from './domUtils.js';
hideModal('my-modal');
```

#### `enhanceModal(modalElement)`
Agrega funcionalidad básica (cerrar con click afuera o Escape) a un elemento modal.

```javascript
const modal = document.getElementById('my-modal');
enhanceModal(modal);
```

### Utilidades DOM

#### `setSafeInnerHTML(element, html)`
Establece contenido HTML de forma segura, sanitizando contra XSS.

```javascript
import { setSafeInnerHTML } from './domUtils.js';
const el = document.getElementById('content');
setSafeInnerHTML(el, '<p>Contenido seguro</p>');
```

#### `getElementSafely(elementId, required?)`
Obtiene un elemento del DOM con validación y logging de errores opcional.

```javascript
import { getElementSafely } from './domUtils.js';

// Retorna null si no existe, sin error
const softEl = getElementSafely('optional-el');

// Loguea error si no existe
const hardEl = getElementSafely('required-el', true);
```

#### `updateElementText(elementId, text)`
Actualiza el `textContent` de un elemento de forma segura.

```javascript
import { updateElementText } from './domUtils.js';
updateElementText('status', 'Operación completada');
```

#### `toggleElementClass(elementId, className, force?)`
Alterna una clase CSS en un elemento.

```javascript
import { toggleElementClass } from './domUtils.js';
toggleElementClass('button', 'active');
```

## Pruebas Unitarias
El archivo coincide con `domUtils.test.js` para validación de funciones principales.
