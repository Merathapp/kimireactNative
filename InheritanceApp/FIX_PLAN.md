# Fix Plan: Post-Upgrade Issues — Progress Tracker

## Issue 1 — Number Format Unification (Arabic → English Digits) ✅ DONE

### Root Cause
- `toLocaleString()` called without locale argument → inherits device locale (Arabic users get Arabic-Indic digits)
- `Fraction.toArabic()` forcibly outputs Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩)
- Result: mixed Arabic/English digits depending on device locale

### Fix
1. ✅ Add `toDisplay()` method to `Fraction` class (same as `toArabic()` but with Western digits)
2. ✅ Replace all bare `toLocaleString()` → `toLocaleString('en-US')`
3. ✅ Replace `toArabic()` → `toDisplay()` in ResultsScreen and CompareScreen
4. ✅ Fix audit log timestamp locale in AppContext

### Files Changed
| File | Change | Status |
|------|--------|--------|
| `src/utils/Fraction.ts` | Add `toDisplay()` method | ✅ |
| `src/screens/ResultsScreen.tsx` | `toLocaleString('en-US')`, `toDisplay()` | ✅ |
| `src/screens/CalculatorScreen.tsx` | `toLocaleString('en-US')` | ✅ |
| `src/screens/CompareScreen.tsx` | `toDisplay()` | ✅ |
| `src/components/QuickPreview.tsx` | `toLocaleString('en-US')` | ✅ |
| `src/utils/InheritanceEngine.ts` | `toLocaleString('en-US')` | ✅ |
| `src/utils/Validation.ts` | `toLocaleString('en-US')` | ✅ |
| `src/context/AppContext.tsx` | `'en-US'` for audit timestamps | ✅ |

---

## Issue 2 — Test Failures ⏳ PENDING

### Root Cause (likely)
- ~~Number format display issues~~ ✅ fixed in Issue 1
- Possible madhab-specific edge case mismatches
- No `bloodRelatives` test data but category listed in TestsScreen

### Fix
1. ✅ Issue 1 fixed (number unification)
2. ⏳ Run tests on device to capture exact failure messages
3. ⏳ Fix specific test expectations based on actual output

---

## Issue 3 — Exclude .md from EAS Build ✅ DONE

- `*.md` added to `.easignore` in commit `6fbacbb`

---

## Issue 4 — Settings Screen ✅ DONE

### Implementation
| Setting | Data Source | UI Component | Status |
|---------|-------------|-------------|--------|
| Dark Mode | `isDarkMode` / `toggleTheme()` | Switch | ✅ |
| Language | `language: 'ar'\|'en'` / `setLanguage()` | Segmented Buttons | ✅ |
| Default Madhab | `currentMadhab` / `setCurrentMadhab()` | Dropdown | ✅ |
| Reset All Data | `resetHeirs()` + confirmation | Button with dialog | ✅ |

### Files Changed
| File | Change | Status |
|------|--------|--------|
| `src/screens/SettingsScreen.tsx` | New settings UI | ✅ |
| `src/navigation/AppNavigator.tsx` | Added Settings stack screen + gear icon in header | ✅ |

**Note:** Settings is a stack screen (not a tab). Access via ⚙️ gear icon in top-right header.

---

## Implementation Log

| Step | Task | Status | Commit |
|------|------|--------|--------|
| 1 | Add `toDisplay()` to `Fraction.ts` | ✅ | `e35f48f` |
| 2 | Replace `toLocaleString()` across all files | ✅ | `e35f48f` |
| 3 | Replace `toArabic()` → `toDisplay()` in Results/Compare | ✅ | `e35f48f` |
| 4 | Fix audit log timestamp locale | ✅ | `e35f48f` |
| 5 | Create `SettingsScreen.tsx` | ✅ | `e35f48f` |
| 6 | Add Settings stack screen + gear icon to navigator | ✅ | `e35f48f` |
| 7 | Commit, push, rebuild APK | ✅ | `e35f48f` |
| 8 | Run tests, fix specific failures | ⏳ | — |

**Latest build commit:** `e35f48f` on `main`
