# Expo SDK Migration Plan: SDK 50 → 56

## Why Upgrade

| Reason | Detail |
|--------|--------|
| **Play Store compliance** | SDK 50 targets API 34. New apps must target **API 35** (Android 15) since Aug 2025. |
| **Security** | RN 0.73.6 is 2.5 years old with unpatched CVEs. |
| **Dependency EOL** | React 18.2 → 19.x, Kotlin 1.9 → 2.x, New Arch only. |
| **Performance** | Hermes v1, New Architecture, faster startup/animation backends. |

## Current State → Target State

| Aspect | Current (SDK 50) | Target (SDK 56) |
|--------|-----------------|-----------------|
| **Expo SDK** | `~50.0.0` | `~56.0.0` |
| **React Native** | `0.73.6` | `0.85.x` |
| **React** | `18.2.0` | `19.2.x` |
| **Architecture** | Legacy (JSI) | New Architecture (JSI + Fabric + TurboModules) |
| **Hermes** | Hermes (pre-v1) | Hermes v1 (default) |
| **targetSdkVersion** | `34` | `35` |
| **compileSdkVersion** | `34` | `35` |
| **buildToolsVersion** | `34.0.0` | `35.0.0` |
| **kotlinVersion** | `1.9.0` | `2.0.x` |
| **Minimum Node** | 18.x | 22.13.x |

---

## Incremental Upgrade Path

### Phase 0: Preparation (Before Any Upgrade)

**Backup & snapshot:**
```bash
git checkout -b upgrade/sdk-56
# Ensure working tree is clean
git status
```

**Install all existing deps & verify current state:**
```bash
npm install
npx tsc --noEmit
npx eslint .
npx expo-doctor
```

**Result:** All checks pass before touching anything.

---

### Phase 1: SDK 50 → 51 (Minor)

| Change | Detail |
|--------|--------|
| **RN** | 0.73.6 → 0.74.x |
| **React** | stays 18.2.0 |
| **Breaking** | `hooks` field removed from `app.json` (not used here) |
| **Breaking** | `expo-barcode-scanner` deprecated (not used) |
| **Breaking** | `sentry-expo` → `@sentry/react-native` (not used) |

**Steps:**
```bash
npx expo install expo@~51.0.0 --fix
npx expo install --fix
```
**Risk:** Very low. SDK 50→51 is a minor bump.

---

### Phase 2: SDK 51 → 52 (Moderate)

| Change | Detail |
|--------|--------|
| **RN** | 0.74.x → 0.76.x (skipped 0.75) |
| **React** | stays 18.2.0 |
| **New Arch** | Available as opt-in (DO NOT ENABLE YET) |
| **Breaking** | `expo-camera/legacy` removed (not used) |
| **Breaking** | `expo-sqlite/legacy` removed (not used) |

**Steps:**
```bash
npx expo install expo@~52.0.0 --fix
npx expo install --fix
```
**Risk:** Low. Keep Legacy Architecture. Do NOT enable New Arch yet.

---

### Phase 3: SDK 52 → 53 (Major — React 19 + New Arch by Default)

| Change | Detail |
|--------|--------|
| **RN** | 0.76.x → 0.79.x (skipped 0.77, 0.78) |
| **React** | **18.2.0 → 19.0+** (major!) |
| **New Arch** | **Enabled by default** — can opt out via `"newArchEnabled": false` in `app.json` |
| **Breaking** | `jsEngine` field deprecated (not used — Hermes only) |
| **Breaking** | `expo-av` deprecated (not used) |
| **Node** | Minimum Node bumped to 20.x (current env: v24 — OK) |

**Steps:**
```bash
# Upgrade to SDK 53
npx expo install expo@~53.0.0 --fix
npx expo install --fix

# Opt out of New Architecture temporarily to isolate issues
# Add to app.json → expo.plugins → expo-build-properties:
#   "android": { "newArchEnabled": false }
```

**Risk: HIGH.** This is the riskiest phase:
- React 18→19 may break third-party libraries
- New Architecture may break native modules
- Must test each native module individually

**Test each dependency after upgrade:**
- react-native-paper (check v6 compatibility)
- react-navigation (check v7 compatibility)
- react-native-reanimated (needs 3.7+ for React 19)
- react-native-gesture-handler (needs 2.18+ for New Arch)
- react-native-screens
- react-native-safe-area-context
- react-native-html-to-pdf (**likely broken**)
- react-native-chart-kit (**likely broken**)

**Critical dependency check:**
If any of the above fail, you may need to find alternatives or postpone New Arch adoption (use `"newArchEnabled": false`).

---

### Phase 4: SDK 53 → 54 (Moderate)

| Change | Detail |
|--------|--------|
| **RN** | 0.79.x → 0.81.x |
| **React** | stays 19.x |
| **Breaking** | Edge-to-edge default on Android (adjust `StatusBar`/safe area) |
| **Breaking** | This is the **final SDK supporting Legacy Architecture** |
| **Breaking** | `expo-av` removed (not used) |

**Steps:**
```bash
npx expo install expo@~54.0.0 --fix
npx expo install --fix

# If still using Legacy Arch, this is the last chance to stay on it.
# Plan to migrate to New Arch before SDK 55.
```
**Risk:** Moderate. Edge-to-edge changes may affect layout.

---

### Phase 5: SDK 54 → 55 (Major — New Arch Only, No Fallback)

| Change | Detail |
|--------|--------|
| **RN** | 0.81.x → 0.83.x |
| **React** | 19.2 |
| **New Arch** | **Mandatory.** `newArchEnabled` config option **removed**. Legacy Architecture gone. |
| **Breaking** | All native modules **must** support New Architecture |
| **Node** | Minimum Node 20.19.4+ |

**Steps:**
```bash
npx expo install expo@~55.0.0 --fix
npx expo install --fix
```

**Risk: HIGH.** If any dependency doesn't support New Arch, the build fails:
- Remove `newArchEnabled: false` if it was set
- Verify all native modules have New Arch support
- `react-native-html-to-pdf` v0.12 — **will not work** (no New Arch support)
- `react-native-chart-kit` — **likely broken**
- `react-native-vector-icons` — needs testing

---

### Phase 6: SDK 55 → 56 (Minor)

| Change | Detail |
|--------|--------|
| **RN** | 0.83.x → 0.85.x |
| **React** | 19.2 → 19.2.3 |
| **Hermes** | Hermes v1 becomes default |
| **Breaking** | iOS minimum bumped to 16.4 (Android-only — no impact) |
| **Breaking** | New animation backend |

**Steps:**
```bash
npx expo install expo@~56.0.0 --fix
npx expo install --fix
```
**Risk:** Low (Android-only project).

---

### Phase 7: Final Configuration

Update `app.json` with correct Play Store settings:
```json
{
  "expo": {
    "android": {
      "permissions": []  // Remove all — no permissions needed
    },
    "plugins": [
      "expo-file-system",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
            "buildToolsVersion": "35.0.0",
            "kotlinVersion": "2.0.0"
          }
        }
      ]
    ]
  }
}
```

**Remove the `packagingOptions.merge` workaround** — it's no longer needed in modern Gradle/AGP.

---

## Dependency Compatibility Matrix

| Package | Current Ver | SDK 56 Compat Ver | Notes |
|---------|------------|-------------------|-------|
| `expo` | `~50.0.0` | `~56.0.0` | Upgrade target |
| `react-native` | `0.73.6` | `0.85.x` | Bundled with SDK |
| `react` | `18.2.0` | `19.2.3` | Bundled with SDK |
| `react-native-paper` | `^5.11.0` | `^6.x` | v6 needed for RN 0.85 |
| `@react-navigation/*` | `^6.x` | `^7.x` | v7 needed for React 19 |
| `react-native-reanimated` | `~3.6.0` | `~3.16.x` or `4.x` | Needs New Arch compat |
| `react-native-gesture-handler` | `~2.14.0` | `~2.20.x` or `3.x` | Needs New Arch compat |
| `react-native-screens` | `~3.29.0` | `~4.x` | Needs New Arch compat |
| `react-native-safe-area-context` | `4.8.2` | `~5.x` | Needs New Arch compat |
| `react-native-svg` | `14.1.0` | `~15.x` | Needs New Arch compat |
| `react-native-vector-icons` | `^10.0.0` | `^10.x` or `per-icon packages` | May need migration |
| `react-native-html-to-pdf` | `^0.12.0` | **NONE** | **Unmaintained since 2023. Must be replaced.** |
| `react-native-chart-kit` | `^6.12.0` | **NONE** | **Poorly maintained. Consider replacing.** |
| `react-native-share` | `^10.0.0` | `^11.x` | Check compat with New Arch |
| `react-native-view-shot` | `3.8.0` | `^4.x` | Check compat with New Arch |
| `react-native-toast-message` | `^2.2.0` | `^2.x` or `3.x` | Check compat |
| `react-native-localization` | `^2.3.1` | **Uncertain** | Check compat |
| `expo-build-properties` | `^0.11.1` | `^0.13.x` | SDK 56 compatible version |
| `expo-file-system` | `~16.0.0` | `~19.x` | New API in SDK 54+ |
| `expo-sharing` | `~11.10.0` | `~13.x` | SDK 56 compatible |
| `expo-splash-screen` | `~0.26.0` | `~0.29.x` | SDK 56 compatible |
| `expo-updates` | `~0.24.0` | `~0.27.x` | SDK 56 compatible |
| `expo-localization` | `~14.8.0` | `~16.x` | SDK 56 compatible |
| `expo-system-ui` | `~2.9.4` | `~4.x` | SDK 56 compatible |

---

## Libraries at Risk (Need Replacement or Workaround)

### 1. `react-native-html-to-pdf` ⛔ Must Replace

| Issue | Detail |
|-------|--------|
| Status | **Unmaintained** since 2023 |
| New Arch | No support (cannot build on SDK 55+) |
| Solution | Use `expo-print` to generate PDF from HTML, then `expo-file-system` + `expo-sharing` to save/share |

**Migration path for PDF:**
```tsx
// BEFORE (react-native-html-to-pdf)
import RNHTMLtoPDF from 'react-native-html-to-pdf';
const pdf = await RNHTMLtoPDF.convert({ html, fileName: 'report' });

// AFTER (expo-print + expo-file-system + expo-sharing)
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const { uri } = await Print.printToFileAsync({ html });
const pdfUri = FileSystem.documentDirectory + 'report.pdf';
await FileSystem.moveAsync({ from: uri, to: pdfUri });
await Sharing.shareAsync(pdfUri);
```

### 2. `react-native-chart-kit` ⚠️ May Need Replacement

| Issue | Detail |
|-------|--------|
| Status | Last release 2023, not actively maintained |
| New Arch | Unconfirmed — likely broken on SDK 55+ |
| Alternatives | `react-native-svg-charts`, `victory-native`, or custom SVG charts |

Since the project uses a pie chart in `ResultsScreen.tsx`, this is a contained replacement.

### 3. `react-native-vector-icons` ⚠️ May Need Migration

| Issue | Detail |
|-------|--------|
| Status | v10.3 still maintained but moved to per-icon-family packages |
| New Arch | Supported in v10+ |
| Action | May need to switch to per-icon packages or `expo-symbols` |

---

## Testing Strategy Per Phase

Each SDK upgrade phase should follow this checklist:

```bash
# 1. Install upgraded deps
npx expo install --fix

# 2. Verify TypeScript
npx tsc --noEmit

# 3. Verify lint
npx eslint .

# 4. Verify Expo config
npx expo-doctor

# 5. Build test APK (EAS)
npm run build:apk

# 6. Install on device and test ALL screens:
#    - Calculator → HeirInput → Results (all madhabs)
#    - PDF export
#    - Share results
#    - Audit log export
#    - Compare screen
#    - Rules screen
#    - Test suite runner
#    - Dark mode toggle
#    - RTL layout
```

---

## Rollback Plan

If a phase fails, revert to the previous SDK:

```bash
git checkout -- package.json package-lock.json
git checkout -- app.json
rm -rf node_modules
npm install
```

Each upgrade should be committed separately:

```bash
git add -A && git commit -m "chore: upgrade Expo SDK X → Y"
```

This way you can `git revert` any problematic phase.

---

## Summary Timeline

| Phase | SDK | Effort | Risk | Key Action |
|-------|-----|--------|------|------------|
| 0 | 50 | Low | — | Snapshot, verify clean state |
| 1 | 50→51 | Low | Low | Minor bump |
| 2 | 51→52 | Low | Low | Keep Legacy Arch |
| 3 | 52→53 | **High** | **High** | React 19, New Arch default, opt out |
| 4 | 53→54 | Medium | Medium | Edge-to-edge, final Legacy SDK |
| 5 | 54→55 | **High** | **High** | New Arch mandatory, replace broken deps |
| 6 | 55→56 | Low | Low | Hermes v1, final target SDK |
| 7 | — | Low | Low | Clean up permissions, final Play Store config |

**Total estimated effort: 2–4 weeks** depending on how many dependencies need replacement.
