# 🏗️ Grid Shell Architecture (The Phoenix Protocol)
*Documentation of the core layout engine introduced in Dec 2025.*

## 1. The Core Concept
The **Grid Shell** (internally "Protocol Phoenix") is the architectural decision to split the application layout into two distinct, non-conflicting modes based on viewport width (`1280px`). It resolves the "Tablet Limbo" and "Sidebar Formatting" issues by enforcing strict separation of concerns.

### The Two Modes
| Mode | Trigger | CSS Display | Logic |
| :--- | :--- | :--- | :--- |
| **Mobile/Tablet** | `< 1280px` | `block` / `flex` | **Overlay Mode**: Sidebar is a modal/off-canvas element. Content is a single column. |
| **Desktop** | `>= 1280px` | `grid` | **Shell Mode**: Navigation, Content, and Sidebar are co-existing columns in a strict Grid. |

---

## 2. Desktop Grid Structure
**Source:** `Shared/styles/layout/_layout-shell.scss`

The desktop layout is defined by a 3-column CSS Grid:

```css
.app-container {
    display: grid;
    grid-template-columns: 80px 1fr 0px; /* Default (Closed) */
    grid-template-areas: "nav content sidebar";
    max-width: 100%; /* Fix: Prevents Scrollbar Overflow */
    overflow-x: hidden; /* Global Safety */
}
```

### The 3 Columns
1.  **Nav (80px):** A spacer column. The actual Navigation Bar remains `position: fixed` to act as an overlay/z-index master, but this grid track ensures space is reserved if needed.
2.  **Content (1fr):** Elastic main content area. Grows/shrinks depending on Sidebar state.
3.  **Sidebar (Dynamic):** 
    - **Closed:** `0px`
    - **Open:** `350px` (Triggered by `data-sidebar-state="open"`)

---

## 3. Sidebar Architecture
**Source:** `Shared/styles/layout/_layout-shell.scss` (Layout) + `_sidebars.scss` (Theme)

### "Natural" Configuration (Dec 23 Refactor)
We moved away from `!important` overrides to a natural flow state:
-   **Position:** `sticky` (pinned to viewport top).
-   **Top:** `76px` (Header 56px + 20px Gap).
-   **Height:** `max-height: calc(100vh - 96px)` (Viewport - Header - Margins).
-   **Visibility:** 
    -   Default: `opacity: 0; visibility: hidden;` (Physical space reserved, but invisible).
    -   Active: `opacity: 1; visibility: visible;`
    -   *Why?* Prevents the "Peeking" bug where collapsed sidebars were still clickable.

### Internal Layout (Sticky Footer)
The sidebar itself is a Flex Column:
1.  **Header:** Fixed.
2.  **Scrollable List:** `flex: 1`, `overflow-y: auto`. **Auto-scrolls to bottom** on new items.
3.  **Footer (Buttons):** `flex: 0 0 auto`. Pinned to bottom. Never scrolls out of view.

---

## 4. Visual Unification (The Black Card)
**Source:** `Shared/styles/views/_view-grid.scss` & `_view-table.scss`

To prevent "Floating Content", all views (Tables, Grids, Liquor Menus) are now wrapped in a unified container:

### `.grid-view-container`
-   **Role:** Acts as the "Page Card" for Grid Views.
-   **Visuals:**
    -   Background: `var(--card-bg)` (Semi-transparent black).
    -   Border: `1px solid var(--border-color)`.
    -   Radius: `15px`.
    -   Shadow: `0 0 20px`.
-   **Contents:** Wraps the `h2.page-title` and the content grid.

---

## 5. Critical Fixes (The Knowledge Base)
Issues successfully resolved by this architecture:

### A. The "100vw" Scrollbar Bug
-   **Problem:** Using `width: 100vw` on Windows caused a horizontal scrollbar because `100vw` includes the vertical scrollbar width (17px).
-   **Fix:** Changed to `width: 100%` and enforced `overflow-x: hidden` on `body`.

### B. The "Style War"
-   **Problem:** `_sidebars.scss` tried to hide the sidebar (Mobile style) while `main.scss` tried to show it (Desktop style), leading to `!important` wars.
-   **Fix:** Refactored into "Separation of Concerns". `_layout-shell.scss` owns Desktop, `_sidebars.scss` owns Mobile.

### C. The "Ghost Peeking"
-   **Problem:** Sidebar appeared as a 1px line on the right when closed.
-   **Fix:** Added explicit `opacity: 0` / `visibility: hidden` output state when inactive.
