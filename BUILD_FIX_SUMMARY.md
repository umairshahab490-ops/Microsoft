# APK Build Fix - Complete Summary

## 🔴 Root Cause Analysis

The build was failing at ~17 seconds due to **package-lock.json being out of sync** with package.json after adding Capacitor dependencies. When `npm ci` runs, it requires an exact match between package.json and package-lock.json, otherwise it fails immediately.

### Secondary Issues Fixed:
1. **android/ directory conflicts** - If android/ exists from a previous run, `npx cap add android` fails
2. **Gradle wrapper permissions** - gradlew needs execute permissions in CI
3. **No error visibility** - Original workflow had no verification steps, making failures hard to diagnose
4. **Deprecated action versions** - setup-java@v4 and setup-android@v3 are outdated

---

## ✅ Files Changed

### 1. `.github/workflows/build-apk.yml` (MODIFIED)

**Changes:**
- ✅ Updated `actions/setup-java@v4` → `@v5` (Node 24 compatible)
- ✅ Updated `android-actions/setup-android@v3` → `@v4` (Node 24 compatible)
- ✅ Changed `npm ci` → `npm install` (handles lock file mismatches)
- ✅ Added verification step: Check dist/ exists after build
- ✅ Added cleanup step: Remove android/ before creating it
- ✅ Added verification step: Check android/ was created
- ✅ Added verification step: Check gradlew exists and make it executable
- ✅ Added verification step: Check APK was built successfully
- ✅ Added `--no-daemon` flag to Gradle (better for CI)

**Why these changes fix the build:**
- `npm install` regenerates package-lock.json if needed, preventing the 17-second failure
- Removing android/ first prevents "platform already exists" errors
- chmod +x ensures gradlew is executable (sometimes lost in git)
- Verification steps provide clear error messages if something fails
- --no-daemon prevents Gradle daemon issues in CI

---

### 2. `capacitor.config.json` (MODIFIED)

**Changes:**
- ✅ Removed `buildOptions` section with null values (not needed for debug builds)
- ✅ Simplified to essential configuration only

**Before:**
```json
{
  "android": {
    "allowMixedContent": false,
    "backgroundColor": "#ffffff",
    "buildOptions": {
      "keystorePath": null,
      "keystorePassword": null,
      "keystoreAlias": null,
      "keystoreAliasPassword": null,
      "releaseType": "APK"
    }
  }
}
```

**After:**
```json
{
  "android": {
    "allowMixedContent": false,
    "backgroundColor": "#ffffff"
  }
}
```

**Why:** The buildOptions with null values could cause parsing issues. For debug builds, we don't need keystore configuration.

---

## 📋 Complete Workflow (After Fix)

```yaml
name: Build Android APK

on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  build:
    name: Build Debug APK
    runs-on: ubuntu-24.04

    steps:
      - name: Checkout repository
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm

      - name: Setup Java JDK
        uses: actions/setup-java@v5  # ✅ Updated to v5
        with:
          distribution: temurin
          java-version: 17

      - name: Setup Android SDK
        uses: android-actions/setup-android@v4  # ✅ Updated to v4

      - name: Install npm dependencies
        run: npm install  # ✅ Changed from npm ci

      - name: Build web app (Vite → dist/)
        run: npm run build

      - name: Verify dist/ exists  # ✅ NEW
        run: |
          if [ ! -d "dist" ]; then
            echo "Error: dist/ directory not found after build"
            exit 1
          fi
          echo "✓ dist/ directory exists"
          ls -la dist/

      - name: Remove existing android/ if present  # ✅ NEW
        run: rm -rf android/

      - name: Add Capacitor Android platform
        run: npx cap add android

      - name: Verify android/ was created  # ✅ NEW
        run: |
          if [ ! -d "android" ]; then
            echo "Error: android/ directory not created"
            exit 1
          fi
          echo "✓ android/ directory exists"

      - name: Sync web assets to Android project
        run: npx cap sync android

      - name: Verify Gradle wrapper exists  # ✅ NEW
        run: |
          if [ ! -f "android/gradlew" ]; then
            echo "Error: gradlew not found in android/"
            exit 1
          fi
          chmod +x android/gradlew  # ✅ Ensure executable
          echo "✓ gradlew exists and is executable"

      - name: Build debug APK
        working-directory: android
        run: ./gradlew assembleDebug --no-daemon  # ✅ Added --no-daemon

      - name: Verify APK was built  # ✅ NEW
        run: |
          APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
          if [ ! -f "$APK_PATH" ]; then
            echo "Error: APK not found at $APK_PATH"
            exit 1
          fi
          echo "✓ APK built successfully"
          ls -lh "$APK_PATH"

      - name: Upload APK artifact
        uses: actions/upload-artifact@v5
        with:
          name: lite-word-notes-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 30
          if-no-files-found: error
```

---

## 🔍 Expected Build Flow

### Step-by-step execution:
1. **Checkout** (2s) - Get your code
2. **Setup Node.js** (5s) - Install Node 24
3. **Setup Java** (10s) - Install JDK 17
4. **Setup Android SDK** (30s) - Download Android tools
5. **npm install** (60s) - Install dependencies + regenerate lock file ✅ **FIXED**
6. **npm run build** (15s) - Vite compiles TypeScript → dist/
7. **Verify dist/** (1s) - Confirm build output exists ✅ **NEW**
8. **Remove android/** (1s) - Clean slate ✅ **NEW**
9. **cap add android** (20s) - Generate Android project ✅ **FIXED**
10. **Verify android/** (1s) - Confirm platform created ✅ **NEW**
11. **cap sync android** (10s) - Copy dist/ into Android project
12. **Verify gradlew** (1s) - Check + chmod +x ✅ **NEW**
13. **gradlew assembleDebug** (180s) - Build APK (3 minutes)
14. **Verify APK** (1s) - Confirm APK exists ✅ **NEW**
15. **Upload artifact** (10s) - Upload to GitHub

**Total expected time: ~5-6 minutes** (down from failing at 17s)

---

## 🎯 What to Expect After Merge

### ✅ Success Indicators:
- Workflow runs to completion (~5-6 minutes)
- All 15 steps show ✅ green checkmarks
- No deprecation warnings in logs
- Artifact `lite-word-notes-debug-apk` appears
- APK size: ~5-10 MB

### 📱 Installation:
1. Download artifact from Actions tab
2. Transfer `app-debug.apk` to phone
3. Install (enable "Unknown sources" if needed)
4. App launches: "Lite Word Notes"
5. Notes persist across restarts (localStorage in WebView)

---

## 🐛 If Build Still Fails

The new verification steps will show **exactly where** it fails:

| Error Message | Likely Cause | Fix |
|--------------|--------------|-----|
| "dist/ directory not found" | Vite build failed | Check TypeScript errors in build log |
| "android/ directory not created" | `cap add android` failed | Check Capacitor config.json syntax |
| "gradlew not found" | Android platform incomplete | Re-run workflow (transient issue) |
| "APK not found" | Gradle build failed | Check Android build logs for compilation errors |

---

## 📝 Summary of Changes

| File | Change | Why |
|------|--------|-----|
| `.github/workflows/build-apk.yml` | Updated action versions | Remove deprecation warnings |
| `.github/workflows/build-apk.yml` | npm ci → npm install | Fix lock file sync issue (ROOT CAUSE) |
| `.github/workflows/build-apk.yml` | Added 5 verification steps | Better error visibility |
| `.github/workflows/build-apk.yml` | Added cleanup + chmod | Prevent conflicts and permission issues |
| `.github/workflows/build-apk.yml` | Added --no-daemon | Better CI behavior |
| `capacitor.config.json` | Removed buildOptions | Simplify config, avoid null value issues |

---

## ✅ Verification Checklist

After merging, confirm:
- [ ] No deprecation warnings in workflow logs
- [ ] All 15 steps pass (green checkmarks)
- [ ] Build completes in ~5-6 minutes
- [ ] Artifact `lite-word-notes-debug-apk` is created
- [ ] APK downloads successfully
- [ ] APK installs on Android phone
- [ ] App launches and shows notes editor
- [ ] Notes persist after app restart

---

**Status: READY TO MERGE** 🚀
