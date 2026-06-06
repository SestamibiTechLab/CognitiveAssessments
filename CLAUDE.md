# Cognitive Assessments - Project Rules

## Deployment Workflow

**Always push to GitHub before proposing `eas build` or `eas submit`.**

Order of operations for every release:
1. Make and verify code changes
2. Commit with a descriptive message
3. `git push origin main`
4. Then propose: `eas build --platform <ios|android> --profile production`
5. Then propose: `eas submit --platform <ios|android> --profile production`

## Project Overview

React Native / Expo managed workflow app for clinical cognitive screening.
Assessments: SLUMS, RUDAS, AD8, MoCA.

## Key Config

- **iOS bundle ID:** `com.sestamibitechlab.cognitiveassessments`
- **Android package:** `com.sestamibitechlab.slums`
- **EAS project ID:** `a14cd138-02b3-458e-91a9-ab4eb8cac675`
- **App Store Connect app ID:** `6776948414`
- **Apple Team ID:** `Y9V2LZPRD9`
- **Apple ID:** `stevesethi@gmail.com`

## Version Bumping

When making a release build, always increment:
- `version` in app.json (e.g. 1.0.11 -> 1.0.12)
- `ios.buildNumber` in app.json (e.g. "2" -> "3")
- `android.versionCode` in app.json (e.g. 12 -> 13)

## Build Notes

- iOS builds require interactive terminal (certificate approval prompts)
- `eas submit --platform ios` requires interactive terminal (build selection prompt)
- `newArchEnabled: true` — expo-speech does not work reliably on iOS; use expo-av with bundled audio files instead
