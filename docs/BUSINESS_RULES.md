# Business Rules & Logic

## 🍹 Mixer Logic Rules
**Verified on:** 2025-12-13
**Status:** ✅ ENFORCED

For "Special Bottles" (Vodka, Gin, Special Rums), the following combination rules apply to mixers (acompañamientos):

### The "5 Sodas or 2 Pitchers" Rule
Users can select a combination of **Refrescos (Sodas)** and **Jarras (Pitchers/Juices)**, constrained by:

| Scenario | Sodas Limit | Pitchers Limit | Condition |
| :--- | :--- | :--- | :--- |
| **Sodas Only** | Max 5 | 0 | If no pitchers are selected. |
| **Pitchers Only** | 0 | Max 2 | If no sodas are selected. |
| **Mixed** | Max 2 | Max 1 | **Exactly 1 Pitcher** allows up to **2 Sodas**. |

### Forbidden Combinations
- ❌ **1 Pitcher + 3 Sodas** (Exceeds Mixed limit)
- ❌ **2 Pitchers + 1 Soda** (Exceeds Pitchers Only limit)
- ❌ **6 Sodas**
- ❌ **3 Pitchers**

### Code Source
- **Validation Logic:** `Interfaces/web/ui-adapters/components/order-system-validations.js`
- **Method:** `validateSpecialBottleRules`
- **Test Script:** `tools/verify-mixers.js`
