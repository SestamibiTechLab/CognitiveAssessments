# Apple App Store Submission Checklist

Quick reference for converting from Android-only to iOS + Android dual-platform submission.

## ✅ Code Changes Complete
- [x] Platform.OS imported in App.js
- [x] BackHandler guarded for Android
- [x] Rate & Review link platform-conditional
- [x] AD8 credits link hidden on iOS
- [x] No syntax errors in modified files

## ✅ Configuration Complete
- [x] ios.bundleIdentifier set in app.json
- [x] ios.buildNumber set to "1" in app.json
- [x] iOS build profile in eas.json (distribution: store)
- [x] iOS submit profile in eas.json (with placeholders)

## ✅ Documentation & Scripts
- [x] IOS_SETUP.md created with full guide
- [x] create_screenshots.py updated for iOS resolution (1290×2796)
- [x] Python script validates correctly

---

## TODO: User Actions Required

### Step 1: Apple Developer Setup
- [ ] Enroll in Apple Developer Program ($99/year) at https://developer.apple.com/programs/
- [ ] Note your 10-character **Team ID** from developer.apple.com/account/

### Step 2: App Store Connect Setup
- [ ] Create app in https://appstoreconnect.apple.com/
- [ ] Set Bundle ID: `com.sestamibitechlab.cognitivassessments`
- [ ] Note the numeric **App ID** from app details

### Step 3: Update Configuration
- [ ] In `eas.json`, replace `XXXXXXXXXX` with:
  - `appleTeamId`: Your 10-char Team ID
  - `ascAppId`: Your numeric App ID from App Store Connect

### Step 4: Generate Screenshots
- [ ] Run `python create_screenshots.py` to generate iOS screenshots
- [ ] Move outputs to `store/screenshots/ios/` (create folder if needed)

### Step 5: Build for iOS
- [ ] First dry-run: `eas build --platform ios --profile production --dry-run`
- [ ] Real build: `eas build --platform ios --profile production`
- [ ] EAS will output an .ipa file and upload to Xcode builds

### Step 6: TestFlight Internal Testing
- [ ] Submit to internal TestFlight: `eas submit --platform ios --profile production`
- [ ] Test app thoroughly on iOS device via TestFlight

### Step 7: Prepare App Store Listing
- [ ] Upload screenshots (generated via create_screenshots.py)
- [ ] Write app description and keywords
- [ ] Set privacy policy: https://sestamibitechlab.github.io/CognitiveAssessments/privacy-policy.html
- [ ] Provide support email and website URL
- [ ] Set category to "Medical"

### Step 8: Rate & Review URL
- [ ] After app is live on App Store, get direct link: `https://apps.apple.com/app/idXXXXXXXXX`
- [ ] Update `App.js` line 961 placeholder with real URL

### Step 9: Submit for Review
- [ ] In App Store Connect, mark build as "Ready for Distribution"
- [ ] Submit for App Review
- [ ] Wait for Apple review (~24-48 hours)
- [ ] Upon approval, app is live on App Store

---

## Current Credentials (Placeholders - Update Required)

**File: `eas.json` lines 26–30**
```json
"ios": {
  "appleId": "stevesethi@gmail.com",
  "ascAppId": "XXXXXXXXXX",    ← Replace with numeric App ID
  "appleTeamId": "XXXXXXXXXX"  ← Replace with 10-char Team ID
}
```

**File: `App.js` line 961**
```javascript
Platform.OS === 'ios' ? "https://apps.apple.com/app/idXXXXXXXXX" : ...
                                                    ↑↑↑↑↑↑↑↑
                                        Replace with real App Store app ID
```

---

## Useful Commands

### Test on iOS Simulator (requires macOS/Xcode)
```bash
npm run ios
```

### Validate iOS config before building
```bash
eas build --platform ios --profile production --dry-run
```

### Build iOS binary
```bash
eas build --platform ios --profile production
```

### Submit to TestFlight
```bash
eas submit --platform ios --profile production
```

### Generate iOS screenshots
```bash
python create_screenshots.py
```

---

## Documentation

- **Full Setup Guide**: `IOS_SETUP.md` (in project root)
- **Implementation Details**: `.claude/plans/warm-beaming-pillow.md`
- **Apple Dev Resources**: https://developer.apple.com/
- **Expo EAS Docs**: https://docs.expo.dev/build-reference/eas-json/
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/

---

## Key Differences from Android

| Aspect | Android | iOS |
|--------|---------|-----|
| Back button | Hardware button (BackHandler) | Swipe gesture (automatic) |
| Store rating | Play Store URL | App Store URL |
| App bundle | .aab file | .ipa file |
| Distribution | Internal track (testing) | TestFlight (testing) |
| Submission | EAS Submit | EAS Submit |
| Certificates | Managed by EAS | Managed by EAS |

---

## Troubleshooting Quick Links

- **"bundleIdentifier not found"** → Check `app.json` has `ios.bundleIdentifier` set
- **"ascAppId not found"** → Create app in App Store Connect, copy numeric ID to `eas.json`
- **"appleTeamId not found"** → Get Team ID from developer.apple.com/account, add to `eas.json`
- **Screenshots wrong resolution** → Check `create_screenshots.py` has `PHONE_WIDTH=1290, PHONE_HEIGHT=2796`
- **Build fails** → Run with `--dry-run` first to validate config

Full troubleshooting guide in `IOS_SETUP.md`.

---

## Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| Code | ✅ Complete | Platform-conditional code in place |
| Config | ✅ Complete | app.json & eas.json ready (placeholders for credentials) |
| Screenshots | ✅ Ready | Script updated, ready to generate |
| Documentation | ✅ Complete | IOS_SETUP.md with full guide |
| Apple Setup | ⏳ User Action | Requires Developer Program enrollment |
| Build Ready | ⏳ Pending | After Apple credentials are configured |
