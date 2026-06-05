# App Store Connect Automation Guide

Automated uploading of screenshots and app metadata to App Store Connect.

---

## Option 1: Fastlane (Recommended - but requires setup on Windows)

**Fastlane** is the industry-standard tool for automating iOS App Store submissions.

### Installation
Fastlane requires Ruby. On Windows:

```bash
# Install Ruby first (if not already installed)
# https://rubyinstaller.org/ - Download and install Ruby

# Then install Fastlane
gem install fastlane
```

### Quick Setup
Once installed, run:

```bash
fastlane init
```

Select "3 - Manual setup" and configure for your app.

### Fastfile Example (Manual configuration)

Create `fastlane/Fastfile`:

```ruby
default_platform(:ios)

platform :ios do
  desc "Upload screenshots and metadata to App Store Connect"
  lane :upload_metadata do
    deliver(
      app_identifier: "com.sestamibitechlab.cognitiveassessments",
      username: "stevesethi@gmail.com",
      app_version: "1.0.10",
      ipa: nil,  # Don't upload binary, just metadata
      skip_binary_upload: true,
      skip_package_validation: true,
      
      # Screenshots for all iPhone sizes
      screenshots_path: "./store/screenshots/ios/",
      
      # App metadata
      release_notes: {
        "en-US" => "Clinical cognitive screening tool for healthcare professionals"
      },
      
      # Full description
      description: {
        "en-US" => "Cognitive Assessments is a free tool for clinicians and caregivers to administer validated cognitive screening assessments at the bedside. No personal health information is stored."
      },
      
      # Keywords for search
      keywords: {
        "en-US" => "cognitive assessment, dementia screening, SLUMS, RUDAS, MoCA, AD8"
      },
      
      # Support information
      support_url: "https://github.com/SestamibiTechLab/Cognitive-Assessments",
      marketing_url: "https://sestamibitechlab.github.io/",
      privacy_url: "https://sestamibitechlab.github.io/CognitiveAssessments/privacy-policy.html",
      
      # Categories
      primary_category: "MEDICAL",
      
      # Minimum OS version
      minimum_os_version: "16.0",
      
      # Rating info (if desired)
      # rating_config_path: "./fastlane/metadata/rating_config.json",
      
      # Force upload even if metadata appears unchanged
      force: true,
      
      # Skip confirmation prompts
      skip_waiting_for_build_processing: true
    )
  end

  desc "Upload only screenshots to App Store Connect"
  lane :upload_screenshots_only do
    deliver(
      app_identifier: "com.sestamibitechlab.cognitiveassessments",
      username: "stevesethi@gmail.com",
      ipa: nil,
      skip_binary_upload: true,
      skip_package_validation: true,
      skip_metadata: true,
      skip_app_version_update: true,
      screenshots_path: "./store/screenshots/ios/",
      force: true
    )
  end
end
```

### Usage

```bash
# Upload all metadata and screenshots
fastlane ios upload_metadata

# Upload only screenshots
fastlane ios upload_screenshots_only
```

**Pros:**
- Industry standard
- Full automation
- Handles all metadata
- Can automate entire release workflow

**Cons:**
- Requires Ruby installation
- More setup complexity
- Windows support is less tested than macOS

---

## Option 2: App Store Connect API (Advanced)

Use Apple's official REST API to upload metadata programmatically.

### Requirements
1. App Store Connect key (generated in developer.apple.com)
2. JWT token generation
3. API calls for metadata/screenshots

### Python Example

```python
import jwt
import json
import requests
from datetime import datetime, timedelta

# App Store Connect API credentials
ISSUER_ID = "your-issuer-id"  # From developer.apple.com
KEY_ID = "your-key-id"
PRIVATE_KEY = """-----BEGIN PRIVATE KEY-----
your-private-key-content-here
-----END PRIVATE KEY-----"""

def get_jwt_token():
    """Generate JWT token for App Store Connect API"""
    now = datetime.utcnow()
    payload = {
        'iss': ISSUER_ID,
        'exp': now + timedelta(minutes=20),
        'aud': 'appstoreconnect-v1'
    }
    return jwt.encode(payload, PRIVATE_KEY, algorithm='ES256', headers={'kid': KEY_ID})

def upload_screenshots(app_id, screenshots_dir):
    """Upload screenshots to App Store Connect"""
    token = get_jwt_token()
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Get app version ID
    response = requests.get(
        f'https://api.appstoreconnect.apple.com/v1/apps/{app_id}/appStoreVersions',
        headers=headers
    )
    
    # Process response and upload screenshots
    # ...implementation details...

if __name__ == '__main__':
    upload_screenshots('6776948414', './store/screenshots/ios/')
```

**Pros:**
- Pure REST API
- No Ruby required
- Cross-platform

**Cons:**
- Requires understanding of API authentication
- More code to write
- Error handling needed

---

## Option 3: Manual Upload (Quick for now)

For your first submission, manual upload is fastest:

1. Log in to https://appstoreconnect.apple.com/
2. Navigate to "Cognitive Assessments" app
3. Click "App Store" tab
4. Scroll to "Screenshots" section
5. Select iPhone 6.7" size
6. Drag-and-drop the 6 PNG files from `store/screenshots/ios/`
7. Reorder if needed
8. Save

**Time required:** ~2 minutes

**When to use:** First submission, or occasional updates

---

## Option 4: Expo + EAS (Partially Automated)

EAS handles binary submission, but not metadata:

```bash
# Build for TestFlight
eas build --platform ios --profile production

# Submit binary to TestFlight
eas submit --platform ios --profile production
```

Then manually upload metadata/screenshots to App Store Connect.

**Hybrid Workflow:**
```bash
# 1. Build iOS binary with EAS
eas build --platform ios --profile production

# 2. Submit binary to TestFlight
eas submit --platform ios --profile production

# 3. Upload screenshots with Fastlane
fastlane ios upload_screenshots_only

# 4. Finalize in App Store Connect UI and submit for review
```

---

## Recommended Setup for Your Project

**For now (first submission):**
- Use **Option 3** (Manual): Upload screenshots manually in App Store Connect (2 minutes)
- Complete remaining metadata fields in the UI
- Submit for review

**For future updates:**
- Set up **Fastlane** (Option 1) for full automation
  - Takes ~30 minutes to set up once
  - Saves time on every future release

**Quick Fastlane Install (if you add Ruby later):**

```bash
gem install fastlane
fastlane ios upload_metadata
```

---

## Files Ready for Upload

All 6 screenshots are ready in: `store/screenshots/ios/`

| File | Screen |
|------|--------|
| 01_main_screen.png | Assessment list |
| 02_assessment_intro.png | Assessment intro |
| 03_assessment_question.png | Question |
| 04_assessment_results.png | Results |
| 05_history.png | History |
| 06_about.png | About |

---

## Complete Manual Submission Checklist

### App Store Connect Setup

- [ ] Log in to https://appstoreconnect.apple.com/
- [ ] Select "Cognitive Assessments" app
- [ ] Click "App Store" tab

### Screenshots
- [ ] iPhone 6.7" section
- [ ] Upload 6 screenshots from `store/screenshots/ios/`
- [ ] Arrange in desired order
- [ ] Verify all display correctly

### Metadata
- [ ] App Name: "Cognitive Assessments"
- [ ] Subtitle: "Clinical cognitive screening tool" (optional)
- [ ] Description: Copy from `assets/store-full-description.txt`
- [ ] Keywords: cognitive assessment, dementia screening, SLUMS, RUDAS, MoCA, AD8
- [ ] Support URL: https://github.com/SestamibiTechLab/Cognitive-Assessments
- [ ] Marketing URL: https://sestamibitechlab.github.io/
- [ ] Privacy Policy URL: https://sestamibitechlab.github.io/CognitiveAssessments/privacy-policy.html

### Build
- [ ] Select the iOS build from TestFlight to submit
- [ ] Add Release Notes: "Clinical cognitive screening tool for healthcare professionals"

### Review Information
- [ ] App Category: Medical
- [ ] Content Restrictions: Set as appropriate
- [ ] Age Rating: Distribute all ratings

### Submission
- [ ] Review all information
- [ ] Click "Submit for Review"
- [ ] Wait for Apple review (24-48 hours)

---

## Next Steps

1. **For your first submission:** Use manual upload (Option 3) - fastest
2. **For future updates:** Consider setting up Fastlane (Option 1)
3. **For complex workflows:** Use App Store Connect API (Option 2)

All code and screenshots are ready. Just upload and submit!
