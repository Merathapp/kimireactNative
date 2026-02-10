# دليل البناء الكامل - حاسبة المواريث الإسلامية

# Complete Build Guide - Islamic Inheritance Calculator

<div dir="rtl">

## 📋 متطلبات ما قبل البناء

### 1. تثبيت المتطلبات الأساسية

```bash
# تثبيت Node.js 18+ (يفضل 20 LTS)
# من: https://nodejs.org/

# تثبيت Expo CLI
npm install -g expo-cli

# تثبيت EAS CLI
npm install -g eas-cli
```

### 2. إعداد المشروع

```bash
# الانتقال لمجلد المشروع
cd InheritanceApp

# تثبيت جميع التبعيات
npm install

# تثبيت Expo Go على الهاتف (للاختبار)
# Android: https://play.google.com/store/apps/details?id=host.exp.exponent
# iOS: https://apps.apple.com/app/expo-go/id982107779
```

## 🔧 إعداد Google Play Console

### 1. إنشاء حساب مطور
- انتقل إلى: https://play.google.com/console
- ادفع رسوم التسجيل ($25 لمرة واحدة)
- أكمل معلومات المطور

### 2. إنشاء التطبيق
- انقر على "Create app"
- اختر "العربية" كلغة افتراضية
- اختر "تطبيق" كنوع
- أكمل المعلومات الأساسية

### 3. إعداد التوقيع الرقمي

```bash
# إنشاء مفتاح توقيع جديد (إذا لم يكن موجوداً)
keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# عرض بصمة المفتاح (SHA-1)
keytool -list -v -keystore my-upload-key.keystore -alias my-key-alias
```

## 📱 إعداد الأيقونات والصور

### الأيقونات المطلوبة

أنشئ الملفات التالية في مجلد `assets/`:

```
assets/
├── icon.png              # 1024x1024 - أيقونة التطبيق
├── adaptive-icon.png     # 1024x1024 - أيقونة Android التكيفية
├── splash.png            # 1242x2436 - شاشة البداية
├── favicon.png           # 48x48 - أيقونة الويب
└── notification-icon.png # 96x96 - أيقونة الإشعارات
```

### لقطات الشاشة المطلوبة

```
assets/screenshots/
├── phone/
│   ├── screenshot-1.png  # 1080x1920
│   ├── screenshot-2.png
│   ├── screenshot-3.png
│   └── screenshot-4.png
└── tablet/
    ├── screenshot-1.png  # 1920x1080
    └── screenshot-2.png
```

## 🏗️ بناء APK (للاختبار)

### الطريقة 1: بناء محلي

```bash
# بناء APK للاختبار
expo build:android -t apk

# أو باستخدام EAS
eas build --platform android --profile preview
```

### الطريقة 2: بناء يدوي

```bash
# توليد مشروع Android أصلي
expo prebuild --platform android

# الانتقال لمجلد Android
cd android

# بناء APK
./gradlew assembleRelease

# APK سيكون في:
# android/app/build/outputs/apk/release/app-release.apk
```

## 📦 بناء AAB (للنشر على Google Play)

### الطريقة 1: EAS Build (موصى بها)

```bash
# تسجيل الدخول في Expo
eas login

# تهيئة المشروع (مرة واحدة)
eas build:configure

# بناء AAB
eas build --platform android --profile production

# متابعة البناء
# ستحصل على رابط لتحميل AAB عند الانتهاء
```

### الطريقة 2: بناء محلي

```bash
# توليد مشروع Android
cd InheritanceApp
expo prebuild --platform android

# الانتقال لمجلد Android
cd android

# تنظيف البناء السابق
./gradlew clean

# بناء AAB
./gradlew bundleRelease

# AAB سيكون في:
# android/app/build/outputs/bundle/release/app-release.aab
```

## 🚀 نشر على Google Play Store

### 1. إعداد حساب الخدمة

```bash
# إنشاء حساب خدمة في Google Cloud Console
# 1. انتقل إلى: https://console.cloud.google.com/
# 2. أنشئ مشروع جديد
# 3. فعّل Google Play Developer API
# 4. أنشئ حساب خدمة
# 5. أنشئ مفتاح JSON
# 6. احفظ الملف كـ google-service-account.json في مجلد المشروع
```

### 2. رفع AAB باستخدام EAS

```bash
# رفع مباشر
eas submit --platform android

# أو مع تحديد الملف
eas submit --platform android --path ./path/to/app.aab
```

### 3. رفع يدوي

```bash
# تثبيت bundletool (للاختبار)
# من: https://github.com/google/bundletool

# توليد APKs من AAB
bundletool build-apks --bundle=app.aab --output=app.apks --ks=my-upload-key.keystore --ks-pass=pass:your-password --ks-key-alias=my-key-alias --key-pass=pass:your-key-password

# تثبيت على جهاز
bundletool install-apks --apks=app.apks
```

## 🔍 اختبار التطبيق

### اختبار على جهاز حقيقي

```bash
# تثبيت APK على جهاز متصل
adb install app-release.apk

# أو تثبيت AAB
bundletool install-apks --apks=app.apks
```

### اختبار على محاكي

```bash
# تشغيل محاكي Android
emulator -avd Pixel_4_API_30

# تثبيت التطبيق
adb install app-release.apk
```

## 📊 تحسين حجم التطبيق

### تحليل الحجم

```bash
# تحليل حجم التطبيق
cd android
./gradlew app:analyzeReleaseBundle

# عرض تقرير الحجم
open app/build/outputs/bundle/release/app-release-size-report.html
```

### تقليل الحجم

```bash
# تمكين ProGuard (مفعل افتراضياً)
# في android/app/build.gradle:

android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## 🔐 الأمان

### 1. حماية المفاتيح

```bash
# إضافة المفاتيح إلى .gitignore
echo "*.keystore" >> .gitignore
echo "*.jks" >> .gitignore
echo "google-service-account.json" >> .gitignore
```

### 2. تشفير البيانات الحساسة

```bash
# تثبيت react-native-encrypted-storage
npm install react-native-encrypted-storage
```

## 🐛 استكشاف الأخطاء

### مشكلة: فشل البناء

```bash
# تنظيف ذاكرة التخزين المؤقت
expo start -c

# أو
cd android
./gradlew clean
cd ..
npm start
```

### مشكلة: خطأ في التوقيع

```bash
# التحقق من المفتاح
keytool -list -v -keystore my-upload-key.keystore

# إعادة إنشاء المفتاح إذا لزم الأمر
keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### مشكلة: تبعيات مفقودة

```bash
# إعادة تثبيت التبعيات
rm -rf node_modules
npm install
```

## 📈 مراقبة الأداء

### Firebase Performance Monitoring

```bash
# تثبيت Firebase
npm install @react-native-firebase/app
npm install @react-native-firebase/perf
```

### Sentry للأخطاء

```bash
# تثبيت Sentry
npm install @sentry/react-native
```

## 🔄 التحديثات المستقبلية

### إعداد التحديثات التلقائية (OTA)

```bash
# Expo Updates مفعل افتراضياً
# لنشر تحديث:
expo publish

# أو باستخدام EAS Update:
eas update --branch production --message "تحديث جديد"
```

---

<div dir="ltr">

## English Build Instructions

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build APK for testing
npm run build:apk

# Build AAB for Play Store
npm run build:aab
```

### Environment Setup

1. Install Node.js 18+ from https://nodejs.org/
2. Install Expo CLI: `npm install -g expo-cli`
3. Install EAS CLI: `npm install -g eas-cli`
4. Create Expo account at https://expo.dev/

### Building for Production

```bash
# Login to Expo
eas login

# Configure project
eas build:configure

# Build APK (testing)
eas build --platform android --profile preview

# Build AAB (Play Store)
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

</div>

</div>
