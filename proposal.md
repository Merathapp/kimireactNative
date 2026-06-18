# Engine Comparison & Enhancement Proposal

## 1. Comparison: HTML vs React Native Engine

### Verdict: Engines Are Identical
After thorough side-by-side review of every module in both versions, the **core engine logic is a 1:1 match** — no functional gaps.

| Module | HTML | RN | Match |
|--------|------|----|-------|
| `Fraction` | Full arithmetic + Unicode fractions | Same + `toDisplay()` method | ✅ (RN ahead) |
| `HeirShare` | Standard share representation | Same | ✅ |
| `FiqhDatabase` | 4 madhab configs | Same (separate file) | ✅ |
| `InheritanceEngine` | 1500+ lines, all cases | Same (ts-ported) | ✅ |
| `applyHijab` | 12 blocking rules | Same | ✅ |
| `computeFixedShares` | All heirs, special cases | Same | ✅ |
| `computeMusharraka` | Shared siblings logic | Same | ✅ |
| `computeAkdariyya` | 27-base special case | Same | ✅ |
| `computeAsaba` | Full hierarchy + sharing | Same | ✅ |
| `applyAwl` | LCM-based increase | Same | ✅ |
| `applyRadd` | Proportional return | Same | ✅ |
| `distributeToBloodRelatives` | 4 classes + treasury | Same | ✅ |
| `fairRounding` | Cent distribution | Same | ✅ |
| `calculateConfidence` | Multiplicative scoring | Same | ✅ |

### Minor Test Suite Differences

| Test | HTML | RN | 
|------|------|----|
| `radd: أم + أب فقط` | ✅ Has this test | ❌ Missing |
| `bloodRelatives: خال فقط (الشافعي)` | ✅ Has test | ❌ Missing |
| `bloodRelatives: خال فقط (المالكي)` | ✅ Has test | ❌ Missing |
| `basic: زوج + ابن + بنت` | Expected: `{son: 1/2, daughter: 1/4}` | Expected: `{son: 7/12, daughter: 7/24}` (incorrect — sums to >1) |
| `complex: زوج + بنت + بنت ابن + أم` | Expected: `{mother: 1/6}` (correct) | Expected: `{mother: 1/12}` (incorrect — should be 2/12) |

**Total tests:** HTML = 55, RN = 53 (2 missing bloodRelative tests). **2 test expectation bugs** in RN suite (test expectations only, not engine).

---

## 2. Enhancement Proposals

Since the engines are identical, enhancements focus on **new features** not present in either version, plus **fixing the test suite**.

### P0 — Critical Fixes

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | Fix expected values for "زوج + ابن + بنت" | `TestSuite.ts:69-73` | Test fails incorrectly |
| 2 | Fix expected mother value for "زوج + بنت + بنت ابن + أم" | `TestSuite.ts:273` | Test fails incorrectly |
| 3 | Add missing `bloodRelatives` test cases (2 tests) | `TestSuite.ts` | Missing coverage |
| 4 | Add missing `radd: أم + أب فقط` test | `TestSuite.ts` | Missing coverage |

### P1 — Engine Enhancements (New Features)

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 5 | **`getPerPerson()` formatting** in ResultsScreen | Per-person breakdown row in distribution table (HTML has `↳ لكل فرد:` sub-row) | Low |
| 6 | **Prenuptial / marital property awareness** | Track which spouse contributed what asset; separate estate shares for husband/wife estate | Medium |
| 7 | **Missing heir / unborn child placeholder** | Allow marking an heir as "expected" (pregnant wife) — defer distribution | Medium |
| 8 | **Quranic verse citations** | Show relevant Quran/Sunnah source for each share (e.g., "النِّسَاء 4:11" for daughter) | Low |
| 9 | **Deceased gender toggle** | Already in HTML UI (male/female selector), not in RN | Low |

### P2 — UI & Display Polish

| # | Feature | Description |
|---|---------|-------------|
| 10 | **CSV export button** on Results screen | Dependencies already installed |
| 11 | **Copy-to-clipboard** button on Results | Dedicated copy button (not just share) |
| 12 | **Print support** | HTML has print CSS; RN could use `expo-print` |
| 13 | **Bar chart visualization** (in addition to pie) | HTML has both; RN only has pie |

### P3 — Architectural

| # | Feature | Description |
|---|---------|-------------|
| 14 | **Scenario save/load** | Persist calculation scenarios with AsyncStorage |
| 15 | **Jest test files** | Convert 50+ in-app tests to Jest for CI |

---

## 3. Implementation Status

### ✅ Phase 1 — Test Suite Fixes (Complete)
| # | Issue | Status |
|---|-------|--------|
| 1 | Fix "زوج + ابن + بنت" expected values | ✅ `TestSuite.ts` |
| 2 | Fix mother value for "زوج + بنت + بنت ابن + أم" | ✅ `TestSuite.ts` |
| 3 | Add missing `bloodRelatives` tests | ✅ 2 tests added |
| 4 | Add missing `radd: أم + أب فقط` test | ✅ 1 test added |

### ✅ Phase 2 — UI Enhancements (Complete)
| # | Feature | Status |
|---|---------|--------|
| 5 | Per-person fraction sub-row in ResultsScreen | ✅ |
| 9 | Deceased gender toggle (ذكر/أنثى) in CalculatorScreen | ✅ |

### ✅ Phase 3 — Export & Share (Complete)
| # | Feature | Status |
|---|---------|--------|
| 10 | CSV export button on Results screen | ✅ `expo-file-system/legacy` + `expo-sharing` |
| 11 | Copy-to-clipboard button on Results | ✅ `expo-clipboard` |
| 12 | Print support via `expo-print` | ✅ Print-friendly HTML |

### ✅ Phase 4 — Citations, Persistence, Tests (Complete)
| # | Feature | Status |
|---|---------|--------|
| 8 | Quranic verse citations (📖 icon per heir) | ✅ `QuranicVerses.ts` |
| 14 | Scenario save/load with AsyncStorage | ✅ `ScenarioStorage.ts` + `ScenariosScreen.tsx` |
| 15 | 44 Jest tests (Fraction + Engine, all passing) | ✅ `src/__tests__/` |

### Other Fixes
| Issue | Fix | Status |
|-------|-----|--------|
| Engine bug: `h.key === 0` fails for undefined keys | Changed to `!h.key` in 8 locations | ✅ |

### Pending
| # | Feature | Priority |
|---|---------|----------|
| 6 | Prenuptial / marital property awareness | Medium |
| 7 | Missing heir / unborn child placeholder | Medium |
| 13 | Bar chart visualization (in addition to pie) | Low |
| — | Android nav bar overlay on tab bar | 🚧 In progress |

---

## 4. Build Status

Current branch `main` has all SDK 56 migration fixes, number format unification, Settings screen, and all 4 enhancement phases. Ready for APK build at any time.
