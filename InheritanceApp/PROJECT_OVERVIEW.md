# Project Overview

## Identity
- **Name:** حاسبة المواريث الإسلامية (Professional Islamic Inheritance Calculator)
- **Slug:** `merath_mobile`
- **Version:** 5.0.0
- **Package:** `com.inheritance.calculator`
- **VersionCode:** 500
- **License:** MIT
- **Git Remote:** `https://github.com/Merathapp/kimireactNative`
- **EAS Project ID:** `2c2de43d-16e9-4c3f-88b6-be678d534494`
- **EAS Owner:** `smartengineer`

## Tech Stack
| Layer | Choice |
|-------|--------|
| **Framework** | Expo Managed Workflow SDK 50 |
| **React Native** | 0.73.6 |
| **Language** | TypeScript ~5.3.0 (strict mode) |
| **UI Library** | React Native Paper 5.11 (Material Design 3) |
| **Navigation** | React Navigation 6 (Stack + Bottom Tabs) |
| **State Management** | Context API |
| **Animations** | react-native-reanimated 3.6 |
| **Charts** | react-native-chart-kit |
| **SVG** | react-native-svg 14.1.0 |
| **Build System** | EAS Build (Expo Application Services) |
| **Bundler** | Metro (with SVG transformer) |
| **Testing** | Jest 29.7 (configured, zero test files yet) |
| **Linting** | ESLint 8 + eslint-config-expo |
| **TypeScript** | Strict mode, zero errors |
| **Icons** | react-native-vector-icons 10.0 |
| **Localization** | expo-localization + react-native-localization |

## Architecture
- **Workflow:** Expo Managed (no `android/` or `ios/` directories committed)
- **Entry Point:** `node_modules/expo/AppEntry.js` via `index.js`
- **Root Component:** `App.tsx` (127 lines) — MD3 theme + navigation container
- **Navigation:** `AppNavigator.tsx` (Stack) → `MainTabNavigator.tsx` (6 Bottom Tabs)
- **State:** `AppContext.tsx` — global state via React Context + useReducer

## Directory Structure
```
InheritanceApp/
├── App.tsx                    # Root component with MD3 theme
├── index.js                   # Expo entry point
├── app.json                   # Expo configuration (plugins, permissions, icons)
├── eas.json                   # EAS Build profiles (dev/preview/production)
├── babel.config.js            # Babel + module-resolver aliases + reanimated
├── metro.config.js            # Metro + SVG transformer
├── tsconfig.json              # TypeScript strict + path aliases
├── package.json               # Dependencies & scripts
├── package-lock.json          # Lock file (npm, lockfileVersion 3)
├── BUILD_GUIDE.md             # Bilingual build instructions
├── README.md                  # Bilingual project README
├── PROJECT_SUMMARY.md         # Detailed project summary
├── COMPARISON.md              # Competitive analysis
├── PROJECT_OVERVIEW.md        # Build & project tracking (this file)
├── .gitignore                 # Git exclusions (android/, keystores, etc.)
└── src/
    ├── components/            # HeirInput, MadhabDropdown, QuickPreview
    ├── constants/             # colors.ts, FiqhDatabase.ts, theme.ts
    ├── context/               # AppContext.tsx
    ├── navigation/            # AppNavigator, MainTabNavigator
    ├── screens/               # 6 screens (Calculator, Results, Compare, etc.)
    └── utils/                 # Fraction, HeirShare, InheritanceEngine, etc.
```

## Source Code
- **Total TypeScript/TSX:** ~5,847 lines
- **Largest file:** `InheritanceEngine.ts` (1,503 lines — core calculation engine)
- **RTL Support:** Full Arabic via `I18nManager.forceRTL()`
- **Dark Mode:** Automatic + manual toggle via Context

## Build Configuration

### EAS Build Profiles (eas.json)
| Profile | Type | Command |
|---------|------|---------|
| `development` | dev client, internal | `eas build --platform android --profile development` |
| `preview` | APK (internal distribution) | `eas build --platform android --profile preview` |
| `production` | AAB (Play Store) | `eas build --platform android --profile production` |

### App Signing
- **EAS Build:** Auto-managed by Expo (or upload custom keystore via EAS dashboard)
- **Local Build:** Requires generating `upload.keystore` via `keytool`

### Android Config (app.json)
- `compileSdkVersion: 34`
- `targetSdkVersion: 34`
- `buildToolsVersion: "34.0.0"`
- `kotlinVersion: "1.9.0"`
- Permissions: `INTERNET`, `WRITE_EXTERNAL_STORAGE`, `READ_EXTERNAL_STORAGE`
- `softwareKeyboardLayoutMode: "pan"`

## Dependencies (Key)

### Runtime (33 packages)
- `expo ~50.0.0`, `react 18.2.0`, `react-native 0.73.6`
- `react-native-paper ^5.11.0` — Material Design 3
- `@react-navigation/*` — Stack + Bottom Tabs
- `react-native-reanimated ~3.6.0` — Animations
- `react-native-gesture-handler ~2.14.0` — Gestures
- `react-native-svg 14.1.0` — SVG rendering
- `react-native-chart-kit ^6.12.0` — Pie charts for results
- `react-native-html-to-pdf ^0.12.0` — PDF export
- `react-native-vector-icons ^10.0.0` — Tab bar icons
- `react-native-share ^10.0.0` — Share functionality
- `react-native-view-shot 3.8.0` — Screenshot capture
- `react-native-toast-message ^2.2.0` — Toast notifications
- `expo-file-system ~16.0.0` — File storage
- `expo-sharing ~11.10.0` — Native sharing sheet
- `expo-splash-screen ~0.26.0` — Splash screen
- `expo-updates ~0.24.0` — OTA updates
- `expo-localization ~14.8.0` — i18n/locale
- `expo-system-ui ~2.9.4` — System UI theming
- `react-native-safe-area-context 4.8.2` — Safe area
- `react-native-screens ~3.29.0` — Native screen containers
- `@react-native-async-storage/async-storage 1.21.0` — Local storage
- `node-forge 1.3.1` — Cryptography
- `fast-xml-parser 5.3.5` — XML parsing
- `semver 7.5.4`, `tar 6.2.1` — Utilities

### Dev Dependencies (7 packages)
- `@babel/core ^7.23.0`
- `@types/jest ^29.5.0`
- `babel-plugin-module-resolver ^5.0.2`
- `eslint ^8.56.0` + `eslint-config-expo ^7.0.0`
- `jest ^29.7.0` + `jest-expo ^50.0.0`
- `react-native-svg-transformer ^1.5.3`
- `typescript ^5.3.0`

## Build Requirements Checklist

### For EAS Build (Cloud — Recommended)
- [x] EAS project linked (`projectId` in `app.json`)
- [x] Build profiles configured (`eas.json`)
- [x] Expo SDK compatibility set (50)
- [x] `npm install` — dependencies installed
- [x] `eas-cli` installed globally (not in project dependencies)
- [ ] `eas login` with Expo account
- [ ] Run `npm run build:apk` or `npm run build:aab`

### For Local Build (Not Recommended — Environment Limited)
- [x] `npm install` — dependencies installed
- [x] Java JDK 17+ installed
- [x] Android SDK 34 + Build Tools 34.0.0 installed
- [x] `$ANDROID_HOME` environment variable set
- [x] Gradle configuration with custom keystore
- [ ] ~8GB+ RAM required (current env ~8GB, OOM risk)
- [ ] Run `npx expo prebuild --platform android` then `cd android && ./gradlew assembleRelease`

## Known Risks & Issues

1. **`react-native-html-to-pdf` compatibility** — Native module may not auto-link properly in Expo SDK 50 managed workflow. Potential build failure risk.

2. **`react-native-vector-icons` font registration** — May require manual font configuration in APK builds.

3. **`WRITE_EXTERNAL_STORAGE` / `READ_EXTERNAL_STORAGE` permissions** — Deprecated on Android 10+, using SDK 34 target. Google Play may flag these. Should migrate to scoped storage.

4. **`expo-build-properties` packagingOptions workaround** — `"merge": ["AndroidManifest.xml:package"]` indicates a namespace conflict fix. Fragile across SDK upgrades.

5. **No CI/CD pipeline** — No GitHub Actions or automation configured. Manual builds only.

6. **No test files** — Jest is configured but no `*.test.ts` files exist. The manual `TestSuite.ts` (50+ cases) is not wired to Jest.

## Verification Status (Last Run: 2026-06-17)

| Check | Result |
|-------|--------|
| **TypeScript (`tsc --noEmit`)** | ✅ 0 errors |
| **ESLint** | ✅ 0 errors, 0 warnings |
| **Jest** | ✅ Passes (`--passWithNoTests`) |
| **expo-doctor** | ✅ 16/16 checks passed |
| **Git status** | ✅ Clean (only expected files modified) |

## Scripts (package.json)
| Command | Action |
|---------|--------|
| `npm start` | `expo start` |
| `npm run android` | `expo start --android` |
| `npm run ios` | `expo start --ios` |
| `npm run web` | `expo start --web` |
| `npm test` | `jest --passWithNoTests` |
| `npm run build:android` | `eas build --platform android` |
| `npm run build:apk` | `eas build --platform android --profile preview` |
| `npm run build:aab` | `eas build --platform android --profile production` |
| `npm run submit` | `eas submit --platform android` |
