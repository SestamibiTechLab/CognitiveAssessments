# Credentials & Security Management

How to safely manage API keys, service accounts, and other secrets for the Cognitive Assessments app.

---

## Overview

This project uses credentials from:
- **Google Play Store** (Android deployment)
- **Apple App Store Connect** (iOS deployment)
- **Fastlane** (automation tool)

**IMPORTANT:** Never commit credentials to Git. All secrets should be in `.env` or environment variables.

---

## Current Security Status

✅ `.gitignore` already includes:
- `google-service-account.json` - Google Play service account
- `*.p8` - Apple certificates
- `*.key` - Private keys
- `.env*.local` - Local environment files

✅ Git history: No credentials have been committed

---

## How to Manage Credentials Safely

### 1. Local Development (Your Machine)

**Never create a `.env` file in the repo.** Instead:

```bash
# Copy the example
cp .env.example .env

# Edit .env with your real credentials
# This file is in .gitignore - it won't be committed
```

**Local `.env` contents:**
```
APPLE_ID=your-apple-id@example.com
ASC_KEY_ID=XXXXXXXXXX
ASC_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ASC_KEY_PATH=./AuthKey_XXXXXXXXXX.p8
GOOGLE_SERVICE_ACCOUNT_PATH=./google-service-account.json
```

**Files to keep locally (NOT in Git):**
- `.env` (with real credentials)
- `google-service-account.json` (service account private key)
- `AuthKey_*.p8` (Apple API private key)

---

### 2. Using Credentials with Fastlane

Fastlane will prompt for credentials at runtime if not provided:

```powershell
# Will prompt for Apple ID password / 2FA code
fastlane ios upload_metadata

# OR provide via environment variables
$env:FASTLANE_USER = "your-apple-id@example.com"
$env:FASTLANE_PASSWORD = "your-app-specific-password"
fastlane ios upload_metadata
```

**Recommended:** Use app-specific passwords instead of your actual Apple ID password.

Generate app-specific password at: https://appleid.apple.com/account/security

---

### 3. Using Credentials with EAS

EAS credentials are already configured in `eas.json`:

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-service-account.json"
    },
    "ios": {
      "appleId": "your-email@example.com",
      "appleTeamId": "Y9V2LZPRD9",
      "ascAppId": "6776948414"
    }
  }
}
```

**Important:** 
- `serviceAccountKeyPath` points to your local `google-service-account.json`
- `appleTeamId` and `ascAppId` are non-secret (safe in Git)
- `appleId` is safe to commit (it's just your email)

EAS will prompt for:
- Apple ID password when building/submitting
- 2FA code from your Apple device

---

### 4. CI/CD Deployment (GitHub Actions, etc.)

For automated deployments, store secrets in GitHub:

**GitHub Secrets** (Settings > Secrets > Actions):

```
GOOGLE_SERVICE_ACCOUNT_JSON    # Full JSON content as base64
APPLE_ID                        # your-email@example.com
APPLE_TEAM_ID                   # Y9V2LZPRD9
APPLE_APP_ID                    # 6776948414
APPLE_APP_SPECIFIC_PASSWORD     # Generate at appleid.apple.com
```

**In your GitHub Actions workflow:**

```yaml
- name: Deploy to App Store
  env:
    FASTLANE_USER: ${{ secrets.APPLE_ID }}
    FASTLANE_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
  run: fastlane ios upload_metadata
```

---

### 5. Where Each Credential Lives

| Credential | Where to Get | Where to Store | Commit? |
|-----------|-------------|-----------------|---------|
| `google-service-account.json` | Google Cloud Console | Local `.env` or file | ❌ NO |
| `AuthKey_*.p8` | App Store Connect > Keys | Local `.env` or file | ❌ NO |
| `APPLE_ID` | Your Apple ID email | `eas.json` or env var | ✅ OK |
| `APPLE_TEAM_ID` | Apple Developer account | `eas.json` | ✅ OK |
| `ASC_APP_ID` | App Store Connect | `eas.json` | ✅ OK |
| `.env` file | Created locally | Never commit | ❌ NO |

---

## Security Checklist

- [ ] `.gitignore` includes `google-service-account.json` (verify: line 47)
- [ ] `.gitignore` includes `*.p8` files (line 16)
- [ ] `.gitignore` includes `.env*.local` (line 34)
- [ ] `.env` file created locally and in `.gitignore`
- [ ] No credentials in Git history (`git log --all`)
- [ ] `google-service-account.json` is in project root (local only)
- [ ] `AuthKey_*.p8` stored locally (not in Git)
- [ ] No credentials in environment variable echo outputs
- [ ] No credentials in command history (PowerShell/Bash history)
- [ ] Apple app-specific password used instead of real password

---

## How to Rotate Credentials

### Google Play Service Account Key

1. Go to Google Cloud Console
2. Create a new service account key
3. Replace `google-service-account.json` locally
4. Update `eas.json` `serviceAccountKeyPath` if location changed

### Apple App Store Connect API Key

1. Go to App Store Connect > Keys
2. Create a new key (keep the old one temporarily)
3. Download the `.p8` file
4. Replace `AuthKey_*.p8` locally
5. Update `ASC_KEY_PATH` in `.env`
6. Delete the old key from App Store Connect

### Apple ID Password

1. Go to https://appleid.apple.com/account/security
2. Create a new app-specific password
3. Update `FASTLANE_PASSWORD` in `.env`
4. Or use this new password when prompted by Fastlane

---

## Troubleshooting

### "Missing google-service-account.json"
- Copy your key from Google Cloud Console to project root
- Ensure path in `eas.json` is correct: `./google-service-account.json`

### "Fastlane authentication failed"
- Check `FASTLANE_USER` (email) is correct
- Use app-specific password, not your real password
- If using 2FA, enter the code when prompted

### "ASC_KEY_ID not found"
- Verify your `.p8` key is valid
- Check that `ASC_KEY_ID`, `ASC_ISSUER_ID` match the key details in App Store Connect
- Update `.env` with correct values from App Store Connect > Keys

---

## Best Practices

1. **Never echo credentials:**
   ```powershell
   # WRONG
   Write-Host "Password: $password"
   
   # RIGHT
   # Just don't print them
   ```

2. **Use environment variables, not command-line arguments:**
   ```powershell
   # WRONG
   fastlane ios upload_metadata --username=email@example.com
   
   # RIGHT
   $env:FASTLANE_USER = "email@example.com"
   fastlane ios upload_metadata
   ```

3. **Rotate credentials periodically:**
   - Every 90 days for service accounts
   - When team members leave
   - If you suspect compromise

4. **Audit access:**
   - Check Google Cloud audit logs
   - Check App Store Connect activity logs
   - Monitor who has access to secrets in CI/CD

5. **Use least privilege:**
   - Service account should only have Play Store permissions
   - Don't use admin accounts for deployments

---

## Files Reference

| File | Purpose | Commit? |
|------|---------|---------|
| `.env.example` | Template for credentials | ✅ YES |
| `.env` | Actual credentials (local) | ❌ NO |
| `google-service-account.json` | Google Play key (local) | ❌ NO |
| `AuthKey_*.p8` | Apple API key (local) | ❌ NO |
| `.gitignore` | Ignores sensitive files | ✅ YES |
| `CREDENTIALS_SECURITY.md` | This guide | ✅ YES |
| `eas.json` | Non-secret config | ✅ YES |

---

## Questions?

For more information:
- [Google Cloud Service Account Docs](https://cloud.google.com/docs/authentication/getting-started)
- [Apple App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi)
- [Fastlane Documentation](https://docs.fastlane.tools/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
