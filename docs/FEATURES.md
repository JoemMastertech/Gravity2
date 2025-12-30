# Características y Funcionalidades

## 🎯 Visión General

**Master Technology Bar** es una aplicación web avanzada para la gestión y visualización de productos de bar, construida con una arquitectura modular y escalable.

---

## 🏗️ Arquitectura del Sistema

El proyecto sigue principios de arquitectura limpia y modularidad:

- **Dominio**: Definiciones de entidades y reglas de negocio.
- **Aplicación**: Casos de uso y lógica de aplicación.
- **Infraestructura**: Adaptadores para servicios externos (Supabase, Storage).
- **Interfaces**: Componentes UI y controladores de vista.
- **Shared**: Utilidades transversales, configuración y estilos.

---

## 🍺 Sistema de Productos

### Categorías Soportadas
- **🍺 Cervezas**: Catálogo detallado con variantes.
- **🍸 Cócteles**: Recetario y presentación visual.
- **🍕 Comida**: Pizzas, alitas, snacks y más.
- **🍷 Licores**: Whisky, Vodka, Tequila, etc. (Gestionados en tablas específicas).

### Características
- **Datos en Tiempo Real**: Sincronización con Supabase (fallbacks robustos).
- **Normalización**: Adaptadores (`ProductDataAdapter`) para unificar estructuras de datos diversas.
- **Gestión de Precios**: Formateo automático y validación.

---

## 📊 Sistema de Visualización

### 🗂️ Modo Tabla
Vista eficiente para comparación rápida de precios y stock.
- Implementado en: `Interfaces/ProductTable.js`
- Columnas ordenables y filtrables.
- Formato compacto para inventario.

### 🎴 Modo Grid
Vista visual atractiva para clientes.
- Implementado en: `Interfaces/ProductCard.js` (Lógica de renderizado)
- Tarjetas con imágenes/video thumbnails.
- Botones de acción rápida (Agregar, Ver Detalle).

---

## 🛒 Sistema de Órdenes

Gestión completa del ciclo de pedido:
- **Carrito de Compras**: Persistencia local y cálculo de totales.
- **Selección de Variantes**: Modales para mixers (refrescos) en licores.
- **Validación**: Control de stock y reglas de negocio (ej. 5 refrescos gratis por botella).
- **Interfaz**: Sidebar dedicado (`.order-sidebar`) para revisión y confirmación.

---

## 🎥 Sistema de Modales y Media

### Modales
Gestión centralizada via `domUtils.js` y `ModalSystem`.
- **Accesibilidad**: Control de foco y atributos ARIA.
- **Tipos**:
    - **Detalle de Producto**: Imagen, info y controles.
    - **Selección de Mixers**: Opciones para licores.
    - **Video Player**: Reproductor integrado para cócteles.

### Video y Multimedia
- **Soporte Dual**: WebM con fallback a MP4.
- **Thumbnails**: Generación automática o estática.
- **Optimización**: Carga diferida de recursos pesados.

---

## 🛠️ Utilidades y Herramientas

### DOM Utils (`Shared/utils/domUtils.js`)
- Manipulación segura del DOM (Sanitización).
- Gestión de clases y atributos.
- Control de visibilidad de elementos.

### Configuración (`Shared/config/`)
- Gestión centralizada de constantes (`Env.js`).
- Mapeo de categorías y tablas de base de datos.

### Seguridad (`docs/SECURITY.md`)
- **Sanitización Input**: Prevención XSS con DOMPurify.
- **Build Security**: Variables de entorno seguras (Vite).
- **Políticas RLS**: Seguridad a nivel de base de datos (Supabase).

---

## 📊 Métricas de Rendimiento (Estimadas)
- **Carga Inicial**: Optimizada con Vite y Minificación.
- **Interacción**: Sin bloqueos gracias a JS modular.
- **Lighthouse**: Puntuaciones altas en Accesibilidad y Best Practices.

---

**Estado del Proyecto**: 🟢 Estable / En Desarrollo Activo
**Arquitectura**: Modular (Clean Architecture/Adapters)
**Stack**: Vanilla JS (Moderno), Vite, Supabase, CSS Modules/BEM.