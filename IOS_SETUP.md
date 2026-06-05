# iOS App Store Conversion - Setup Guide

This document describes the iOS support added to the Cognitive Assessments app for Apple App Store submission.

## What Was Changed

### 1. Code Changes (App.js)
- **Platform import**: Added `Platform` from `react-native` to detect iOS vs Android
- **BackHandler guard**: Wrapped Android-only back button handler with `Platform.OS === 'android'` check
  - iOS users rely on native swipe-back gesture; the programmatic back handler is Android-only
- **Rate & Review link**: Made platform-conditional
  - Android: Links to Play Store with label "Rate & Review on Play Store"
  - iOS: Links to App Store with label "Rate & Review on App Store" (update placeholder URL after app is created)
- **AD8 Credits link**: Hidden on iOS with `Platform.OS === 'android'` guard
  - The Play Store link to Washington University's AD8 app doesn't apply to iOS users

### 2. Configuration Changes (app.json)
Added iOS block with:
```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.sestamibitechlab.cognitivassessments",
  "buildNumber": "1"
}
```

- `bundleIdentifier`: Must be registered in Apple Developer account (reverse-domain style)
- `buildNumber`: Must increment with each TestFlight/App Store build (starts at "1")
- `supportsTablet`: Enabled since app supports iPad

### 3. Build & Submit Configuration (eas.json)
Added iOS production profile:

**Build:**
```json
"ios": {
  "distribution": "store"
}
```

**Submit:**
```json
"ios": {
  "appleId": "stevesethi@gmail.com",
  "ascAppId": "XXXXXXXXXX",
  "appleTeamId": "XXXXXXXXXX"
}
```

- `appleId`: Your Apple ID email
- `ascAppId`: Numeric app ID from App Store Connect (get after creating the app listing)
- `appleTeamId`: 10-character Team ID from Apple Developer account

### 4. Screenshots (create_screenshots.py)
Updated to generate iOS-resolution screenshots (iPhone 6.7"):
- Dimensions: 1290×2796 px (full screen with safe area)
- Font handling: Improved cross-platform font loading (Windows, macOS, Linux)
- Output: 9 mock app screenshots as PNG files

---

## Next Steps: Before You Can Build for iOS

### 1. Enroll in Apple Developer Program
- Go to https://developer.apple.com/programs/
- Pay the $99/year fee
- Agree to terms and complete enrollment

### 2. Get Your Team ID
- Sign in to https://developer.apple.com/account/
- Copy your 10-character Team ID
- Update `eas.json` `submit.production.ios.appleTeamId` with this value

### 3. Create an App in App Store Connect
- Go to https://appstoreconnect.apple.com/
- Click "My Apps" → "+" → "New App"
- Choose iOS
- Fill in:
  - **App Name**: Cognitive Assessments
  - **Bundle ID**: com.sestamibitechlab.cognitivassessments
  - **SKU**: Any unique ID (e.g., cognitive-assessments-001)
  - **Primary Language**: English
  - **User Type**: Select appropriate category
- After creation, note the numeric **App ID** (shown in App Store Connect URL or in app details)
- Update `eas.json` `submit.production.ios.ascAppId` with this value

### 4. Update the Rate & Review Link
- Once your app is live on the App Store, you'll get a direct link like:
  ```
  https://apps.apple.com/app/id1234567890
  ```
- Update `App.js` line 961 to replace the placeholder `idXXXXXXXXX` with your actual app ID

### 5. Generate iOS Screenshots
- Run the updated script to create iOS-resolution screenshots:
  ```bash
  python create_screenshots.py
  ```
- Outputs will be saved as `01_main_screen.png` through `09_ad8_results.png`
- Move these to `store/screenshots/ios/` for organization
- Use these in App Store Connect listing

### 6. Build for iOS
Once prerequisites are complete, build the iOS binary:

```bash
eas build --platform ios --profile production
```

EAS will:
- Manage iOS provisioning profiles automatically
- Create distribution certificates
- Output an .ipa file
- Upload to Xcode builds archive

### 7. Submit to TestFlight (Internal Testing)
First, test via TestFlight before submitting to the public App Store:

```bash
eas submit --platform ios --profile production
```

This will:
- Submit the iOS binary to App Store Connect
- Target the internal TestFlight track
- Allow internal testers to download and test before public release

### 8. Complete App Store Listing
In App Store Connect, add:
- Screenshots (generated via create_screenshots.py)
- Description, keywords, support URL
- Privacy policy link: https://sestamibitechlab.github.io/CognitiveAssessments/privacy-policy.html
- Support email
- Category: Medical

### 9. Submit for App Review
Once testing is complete and App Store listing is finalized:
- Change the build status from TestFlight internal to "Submit for Review"
- Apple reviews the app (typically 24–48 hours)
- Upon approval, the app appears on the App Store

---

## Verification Checklist

- [ ] Platform-specific code checked: BackHandler guard, Rate & Review link, AD8 credits link
- [ ] iOS config in app.json: bundleIdentifier, buildNumber, supportsTablet
- [ ] iOS build/submit profiles in eas.json
- [ ] Screenshots generated and verified at iOS resolution (1290×2796)
- [ ] Apple Developer Program enrolled
- [ ] Team ID noted
- [ ] App created in App Store Connect
- [ ] ascAppId and appleTeamId updated in eas.json
- [ ] Rate & Review link placeholder updated with real App Store URL
- [ ] iOS build tested: `eas build --platform ios --profile production --dry-run`
- [ ] TestFlight internal submission successful
- [ ] App Store listing completed (description, screenshots, privacy policy)

---

## Troubleshooting

### "bundleIdentifier not found" error
- Ensure `ios.bundleIdentifier` is set in app.json
- Verify it matches the Bundle ID you registered in Apple Developer account

### "ascAppId not found" error
- Create the app in App Store Connect first
- Copy the numeric App ID from the app details
- Update `submit.production.ios.ascAppId` in eas.json

### "appleTeamId not found" error
- Sign in to developer.apple.com/account
- Find your 10-character Team ID under Membership details
- Update `submit.production.ios.appleTeamId` in eas.json

### Screenshots not displaying at correct resolution
- Verify `PHONE_WIDTH` (1290) and `PHONE_HEIGHT` (2796) in create_screenshots.py
- Check that the create_phone_frame function pastes content at the right offset (SAFE_AREA = 120)
- Re-run the script and check output dimensions with an image tool

---

## References

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Expo EAS Build documentation](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
