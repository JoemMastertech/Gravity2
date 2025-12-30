# 🏗️ Visual Refactoring Strategy (The Blueprint)

## 🎯 Goal
Eliminate "Style Triangulation" (jumping between 4 files to change 1 thing) and create a **Direct Route** architecture where exact views are defined in exact files.

## 📂 New Folder Architecture
We will transform the current `Shared/styles` folder to match your "Optimized Routes" plan.

```text
Shared/styles/
├── base/               # (No Change) Reset, Typography
├── settings/           # (No Change) Variables
├── tools/
│   └── _mixins.scss    # 🌟 NEW: The Orchestrator (Responsive Logic)
├── views/              # 🌟 NEW: The Panels
│   ├── _view-grid.scss # (Was product-table-v2 + cards.css)
│   └── _view-table.scss# (Was _tables.scss)
└── main.scss           # The Entry Point (Imports everything)
```

---

## 🔧 The Tools (Orchestrator)
Instead of writing `@media (max-width: 480px)` everywhere, we will use semantic Mixins in `tools/_mixins.scss`.

### Proposed Mixins
```scss
// 1. Orientation Logic
@mixin landscape {
  @media (orientation: landscape) { @content; }
}

@mixin portrait {
  @media (orientation: portrait) { @content; }
}

// 2. Device Types (Combines size + orientation if needed)
@mixin mobile-portrait {
  @media (max-width: 480px) and (orientation: portrait) { @content; }
}

@mixin tablet-landscape {
  @media (min-width: 769px) and (orientation: landscape) { @content; }
}
```

---

## 🚀 Migration Plan

### Step 1: Create the Structure
- Create folders `views/` and `tools/` (if missing).
- Create `_mixins.scss`.

### Step 2: Migrate Grid (Panel A)
- **Source**: `components/cards.css` AND `components/_product-table-v2.scss`.
- **Destination**: `views/_view-grid.scss`.
- **Action**: Combine them. Convert plain CSS to SCSS nesting where appropriate. Use strict Grid variables from `VISUAL_MAP.md`.

### Step 3: Migrate Table (Panel B)
- **Source**: `components/_tables.scss`.
- **Destination**: `views/_view-table.scss`.
- **Action**: Move rules. Ensure the "Nuclear Option" (Mobile Overrides) is handled gracefully via the new `mobile-portrait` mixin.

### Step 4: Cleanup
- Remove `components/cards.css`.
- Remove `components/_product-table-v2.scss`.
- Update `main.scss` to import the new `views/` instead of `components/`.

---

## 🛡️ Verification (Safety)
1. **Before**: Verify we have green checkmarks on `npm run test:visual` (Reference).
2. **During**: After each file move, run `npm run test:visual`.
3. **Pass Condition**: 0% Mismatch. The user should notice **ZERO** visual difference, but the code will be 100% cleaner.
