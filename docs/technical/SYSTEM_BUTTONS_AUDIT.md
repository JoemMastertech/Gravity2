# 🔘 Button System Audit & Architecture Plan

## 1. Current State (The Diagnosis)
We currently have "Buttons by Location" rather than a "Button System". This leads to code duplication, inconsistent hit-areas, and difficult scaling.

### The Census (Audit Findings)
| Location | Button Name | Current Implementation | Issues |
| :--- | :--- | :--- | :--- |
| **Top Nav** | Hamburger | Hardcoded `40px` | No touch target Standard. |
| **Top Nav** | View Toggle | Duplicate logic in `buttons.css` | Defined twice (index & css). |
| **Top Nav** | Settings | Hardcoded SVG | No consistency with other icons. |
| **Sidebar (L)**| Nav Items | `li` styled as buttons | Semantic misalignment. |
| **Content** | Price Button | `.price-button` (Hardcoded Gold) | Complex keyframe logic mixed in. |
| **Order Sidebar**| Complete/Cancel | Flexbox hacks in `Layout Shell` | Not responsive to text length. |
| **Orders Screen**| History/Back | Local styles in `_header.scss` | Inconsistent padding/fonts. |

---

## 2. Proposed Architecture (The Hybrid Model)
**User Vision:** "Organize by Component" (Control Centers).
**Architectural Recommendation:** Use **Design Tokens** to feed the Components.

We will **not** abandon the component structure (Header buttons stay in Header), but we will power them with a shared **System Core**.

### Layer 1: The Design Tokens (`_tokens.scss`)
Define the "DNA" of a button once.
```css
/* Structure */
--btn-radius-primary: 12px;
--btn-height-touch: 48px; /* Standard Touch Target */
--btn-padding-std: 0 24px;

/* Typography (Visual Weight) */
--btn-font-weight: 600;      /* Semibold for readability */
--btn-text-transform: uppercase; /* Uniformity */
--btn-letter-spacing: 0.5px;
```

### Layer 2: The Variants (`_buttons.scss`)
Define the "Species" of buttons.
-   `.btn-primary`: Filled, Accent Color (Completar Orden).
-   `.btn-ghost`: Transparent, Bordered (Cancelar, Back).
-   `.btn-icon`: Circular, no text (Settings, Toggle).

### Layer 3: The Components (Control Centers)
Map the Component to the Variant.
-   **Header Control Center:**
    -   `#view-toggle-btn` extends `.btn-icon`.
-   **Order Control Center:**
    -   `.confirm-btn` extends `.btn-primary`.

---

## 3. Implementation Plan
### Phase A: The Foundation
1.  Create `Shared/styles/settings/_tokens.scss`.
2.  Define Spacing, Radius, Surface levels, and **Typography** tokens.

### Phase B: The Button Factory
1.  Create `Shared/styles/components/_button-system.scss`.

### Phase B.5: The Laboratory (Kitchen Sink)
*Before refactoring existing buttons:*
1.  Create a hidden route/file (e.g., `_kitchen-sink.html`).
2.  Render all button variants on White, Black, and Glass backgrounds.
3.  **Validate:** Ensure visibility and contrast pass 100% on all surfaces.

### Phase C: The Migration
1.  Go Component by Component (Header, Sidebar, Order).
2.  Replace hardcoded styles with System Classes.
