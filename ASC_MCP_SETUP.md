# App Store Connect MCP Server Setup

How to configure and use the asc-mcp (App Store Connect Model Context Protocol) server with Claude Code.

---

## What is asc-mcp?

The App Store Connect MCP server allows Claude to:
- Query app information from App Store Connect
- View build status and TestFlight information
- Manage app metadata and screenshots
- Check app review status
- Retrieve sales and performance data
- Access beta testing information

This is useful for automating App Store operations directly through Claude.

---

## Installation

✅ Already installed:
```bash
npm install -g asc-mcp
```

Version: 1.1.0

---

## Configuration

The asc-mcp requires three environment variables:

### Required Environment Variables

```powershell
# Set these in your .env or system environment

APP_STORE_CONNECT_KEY_ID=7HSAN9JN5V
APP_STORE_CONNECT_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
APP_STORE_CONNECT_P8_PATH=C:\Users\Steve\OneDrive\Desktop\Apps\credentials\AuthKey_7HSAN9JN5V.p8
```

**Where to get these:**
- **KEY_ID**: Your API key ID from App Store Connect (you have: `7HSAN9JN5V`)
- **ISSUER_ID**: Your issuer ID from App Store Connect > Keys
- **P8_PATH**: Path to your private key file (you have the file)

### Find Your Issuer ID

1. Go to https://appstoreconnect.apple.com/access/api
2. Look for the "Issuer ID" field
3. Copy the UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
4. Add to your `.env`:
   ```
   APP_STORE_CONNECT_ISSUER_ID=your-issuer-id-here
   ```

---

## Setup Methods

### Method 1: Environment Variables (Recommended)

**In PowerShell:**
```powershell
$env:APP_STORE_CONNECT_KEY_ID = "7HSAN9JN5V"
$env:APP_STORE_CONNECT_ISSUER_ID = "your-issuer-id"
$env:APP_STORE_CONNECT_P8_PATH = "C:\Users\Steve\OneDrive\Desktop\Apps\credentials\AuthKey_7HSAN9JN5V.p8"
```

**In `.env` file:**
```
APP_STORE_CONNECT_KEY_ID=7HSAN9JN5V
APP_STORE_CONNECT_ISSUER_ID=your-issuer-id
APP_STORE_CONNECT_P8_PATH=C:\Users\Steve\OneDrive\Desktop\Apps\credentials\AuthKey_7HSAN9JN5V.p8
```

### Method 2: Configure in Claude Code Settings

Edit your Claude Code `settings.json`:

```json
{
  "mcpServers": {
    "asc-mcp": {
      "command": "asc-mcp",
      "env": {
        "APP_STORE_CONNECT_KEY_ID": "7HSAN9JN5V",
        "APP_STORE_CONNECT_ISSUER_ID": "your-issuer-id",
        "APP_STORE_CONNECT_P8_PATH": "C:\\Users\\Steve\\OneDrive\\Desktop\\Apps\\credentials\\AuthKey_7HSAN9JN5V.p8"
      }
    }
  }
}
```

**Location of settings.json:**
- Windows: `C:\Users\Steve\AppData\Local\Code\User\settings.json`
- Or use VS Code: File > Preferences > Settings > Search "MCP"

---

## Verify Installation

Once configured, test the connection:

```powershell
# Set the environment variables
$env:APP_STORE_CONNECT_KEY_ID = "7HSAN9JN5V"
$env:APP_STORE_CONNECT_ISSUER_ID = "your-issuer-id"
$env:APP_STORE_CONNECT_P8_PATH = "C:\Users\Steve\OneDrive\Desktop\Apps\credentials\AuthKey_7HSAN9JN5V.p8"

# Test the MCP server
asc-mcp
```

You should see:
```
App Store Connect MCP server is ready
```

---

## Available Commands via Claude

Once configured in Claude Code, you can ask Claude to:

- "Get the status of my iOS app"
- "Show me TestFlight beta testers"
- "What builds are available for testing?"
- "Get app review status"
- "Show app metadata"
- "List TestFlight builds"
- "Get sales and downloads data"

Example:
```
User: Get the current version and build number of my app from App Store Connect
Claude: [Uses asc-mcp to fetch this information]
Response: Your app "Cognitive Assessments" (ID: 6776948414) is at version 1.0.10 with build...
```

---

## What asc-mcp Can Do

### App Information
- Get app details (name, bundle ID, version, etc.)
- View app store metadata
- Check supported platforms

### Builds & Versions
- List all builds
- View build details
- Check beta build status
- Manage TestFlight builds

### Testing
- View beta testers
- Check TestFlight groups
- Monitor build availability for testers

### Metadata
- View app description and keywords
- Check screenshots
- View app category and rating

### Review & Status
- Check app review status
- Get rejection reasons
- Monitor submission status

### Analytics
- View sales data
- Check downloads
- Monitor revenue

---

## Configuration Checklist

- [ ] Key ID obtained: `7HSAN9JN5V` ✓
- [ ] Issuer ID obtained from App Store Connect
- [ ] P8 key file verified at: `C:\Users\Steve\OneDrive\Desktop\Apps\credentials\AuthKey_7HSAN9JN5V.p8` ✓
- [ ] Environment variables set (APP_STORE_CONNECT_*)
- [ ] asc-mcp installed globally ✓
- [ ] Test connection successful

---

## Troubleshooting

### "Configuration error: APP_STORE_CONNECT_KEY_ID environment variable is required"
- Set the environment variables before running asc-mcp
- Check spelling: `APP_STORE_CONNECT_KEY_ID` (not `ASC_KEY_ID`)

### "Invalid API key"
- Verify Key ID matches what's in App Store Connect
- Check the .p8 file is not expired

### "Issuer ID invalid"
- Get the Issuer ID from App Store Connect > Keys (it's a UUID)
- Not the same as your Team ID

### "Cannot read P8 file"
- Verify file path is correct
- Check file permissions
- Use absolute path, not relative

---

## Next Steps

1. **Get your Issuer ID** from App Store Connect > Keys
2. **Set environment variables** in your `.env` or system environment
3. **Test the connection** with `asc-mcp`
4. **Ask Claude** to get App Store Connect information

You can now manage your App Store submissions directly through Claude!

---

## Documentation

- [asc-mcp on npm](https://www.npmjs.com/package/asc-mcp)
- [App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi)
- [MCP Documentation](https://modelcontextprotocol.io/)
