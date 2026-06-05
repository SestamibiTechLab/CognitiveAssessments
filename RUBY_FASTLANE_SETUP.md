# Ruby and Fastlane Installation Guide (Windows)

## Step 1: Install Ruby Using RubyInstaller

1. **Download RubyInstaller:**
   - Go to https://rubyinstaller.org/downloads/
   - Download the latest version (Ruby 3.3+ recommended)
   - Choose the **x64** version if you have a 64-bit Windows

2. **Run the installer:**
   - Execute the `.exe` file
   - Accept the license agreement
   - **IMPORTANT:** Check these boxes during installation:
     - ✓ Add Ruby executables to your PATH
     - ✓ Associate .rb and .rbw files with this Ruby installation
     - ✓ Run 'ridk install' to setup MSYS2 toolchain

3. **Complete MSYS2 setup:**
   - At the end of installation, a command prompt will appear asking "MSYS2 base installation (y/n/s)"
   - Press **3** then Enter (installs full MSYS2 toolchain)
   - Wait for installation to complete
   - Press Enter to continue

4. **Verify Ruby installation:**
   ```powershell
   ruby --version
   gem --version
   ```

   Should output something like:
   ```
   ruby 3.3.0 (2023-12-25 revision 5aac304)
   gem 3.4.0
   ```

---

## Step 2: Install Fastlane

Once Ruby is installed, open **PowerShell as Administrator** and run:

```powershell
gem install fastlane
```

This will download and install Fastlane and all dependencies (may take 2-3 minutes).

**Verify installation:**
```powershell
fastlane --version
```

Should output:
```
fastlane 2.x.x
```

---

## Step 3: Initialize Fastlane in Your Project

Navigate to your project directory:

```powershell
cd 'C:\Users\Steve\OneDrive\Desktop\tech\decompile\slums-modern'
```

Initialize Fastlane:

```powershell
fastlane init ios
```

Choose option **1** (Manually set up configurations) when prompted.

---

## Step 4: Create Fastlane Configuration

The above command creates a `fastlane/` directory. Now create/update `fastlane/Fastfile`:

```ruby
default_platform(:ios)

platform :ios do
  desc "Upload screenshots and metadata to App Store Connect"
  lane :upload_metadata do
    deliver(
      app_identifier: "com.sestamibitechlab.cognitiveassessments",
      username: "stevesethi@gmail.com",
      app_version: "1.0.10",
      ipa: nil,
      skip_binary_upload: true,
      skip_package_validation: true,
      skip_app_version_update: true,
      
      # Screenshots
      screenshots_path: "./store/screenshots/ios/",
      
      # Metadata
      release_notes: {
        "en-US" => "Clinical cognitive screening tool for healthcare professionals"
      },
      
      description: {
        "en-US" => "Cognitive Assessments is a free tool for clinicians and caregivers to administer validated cognitive screening assessments at the bedside. No personal health information is stored."
      },
      
      keywords: {
        "en-US" => "cognitive assessment, dementia screening, SLUMS, RUDAS, MoCA, AD8"
      },
      
      # Support links
      support_url: "https://github.com/SestamibiTechLab/Cognitive-Assessments",
      marketing_url: "https://sestamibitechlab.github.io/",
      privacy_url: "https://sestamibitechlab.github.io/CognitiveAssessments/privacy-policy.html",
      
      # App category
      primary_category: "MEDICAL",
      
      # Skip confirmation
      force: true,
      skip_waiting_for_build_processing: true
    )
  end

  desc "Upload only screenshots"
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

---

## Step 5: Run Fastlane Commands

### Upload Screenshots Only (recommended first step)

```powershell
cd 'C:\Users\Steve\OneDrive\Desktop\tech\decompile\slums-modern'
fastlane ios upload_screenshots_only
```

This will:
1. Authenticate with App Store Connect
2. Find your app
3. Upload all 6 screenshots from `store/screenshots/ios/`
4. Save them to the App Store listing

### Upload Full Metadata (screenshots + description)

```powershell
fastlane ios upload_metadata
```

This will:
1. Upload screenshots
2. Update app description
3. Update keywords
4. Update support URLs
5. Update privacy policy link

---

## Troubleshooting

### "Ruby command not found" after installation
- Close and reopen PowerShell/Command Prompt
- The PATH might need to be refreshed
- Or restart your computer

### "Fastlane command not found"
- Make sure you used "PowerShell as Administrator"
- Ruby installation might have failed - try reinstalling

### "two_factor_authentication_code" prompt during upload
- App Store Connect requires 2FA for your Apple ID
- When prompted, enter the code from your Apple device
- You can also generate app-specific passwords at https://appleid.apple.com

### Permission errors during upload
- Make sure you're running as Administrator
- Fastlane needs write permissions to the project

### Certificate/Provisioning Profile errors
- This means the app build hasn't been uploaded to TestFlight yet
- Run: `eas build --platform ios --profile production`
- Then: `eas submit --platform ios --profile production`
- Only after the build is in TestFlight can you upload metadata

---

## Complete Workflow

```powershell
# 1. Build the iOS app with EAS
eas build --platform ios --profile production

# 2. Submit build to TestFlight
eas submit --platform ios --profile production

# 3. Upload screenshots and metadata with Fastlane
fastlane ios upload_metadata

# 4. Verify in App Store Connect
# - Screenshots uploaded
# - Description, keywords set
# - All links correct

# 5. Submit for review in App Store Connect UI
# - Log in to https://appstoreconnect.apple.com/
# - Select build from TestFlight
# - Click "Submit for Review"
```

---

## File Locations

After setup:

```
slums-modern/
├── fastlane/
│   ├── Fastfile              (Lane definitions)
│   ├── report.xml            (Report after runs)
│   └── metadata/             (Generated metadata)
├── store/
│   └── screenshots/
│       └── ios/              (Your iOS screenshots)
```

---

## Next Steps

1. Install Ruby using RubyInstaller (steps 1-2 above)
2. Install Fastlane: `gem install fastlane`
3. Run: `fastlane ios upload_screenshots_only`
4. Check App Store Connect to verify screenshots uploaded
5. Complete remaining metadata in App Store Connect UI
6. Submit for review

All scripts and screenshots are ready!
