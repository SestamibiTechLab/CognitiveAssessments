#!/usr/bin/env python3
"""
App Store Connect API uploader for screenshots and metadata.

This script automates uploading screenshots to App Store Connect without Fastlane.
Requires: pip install requests PyJWT

Setup:
1. Generate App Store Connect API key at https://appstoreconnect.apple.com/access/api
2. Download the private key (.p8 file)
3. Note your Issuer ID and Key ID
4. Create config.json with your credentials (see example below)

Example config.json:
{
  "issuer_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "key_id": "XXXXXXXXXX",
  "private_key_path": "./path/to/AuthKey_XXXXXXXXXX.p8",
  "app_id": "6776948414",
  "bundle_id": "com.sestamibitechlab.cognitiveassessments"
}
"""

import json
import os
import sys
import jwt
import requests
from datetime import datetime, timedelta
from pathlib import Path


class AppStoreConnectAPI:
    """Client for App Store Connect API"""

    BASE_URL = "https://api.appstoreconnect.apple.com/v1"
    ALGORITHM = "ES256"

    def __init__(self, issuer_id, key_id, private_key_path):
        """Initialize API client"""
        self.issuer_id = issuer_id
        self.key_id = key_id

        # Read private key
        with open(private_key_path, 'r') as f:
            self.private_key = f.read()

    def _get_jwt_token(self):
        """Generate JWT token for API authentication"""
        now = datetime.utcnow()
        payload = {
            'iss': self.issuer_id,
            'exp': now + timedelta(minutes=20),
            'aud': 'appstoreconnect-v1'
        }

        token = jwt.encode(
            payload,
            self.private_key,
            algorithm=self.ALGORITHM,
            headers={'kid': self.key_id}
        )
        return token

    def _request(self, method, endpoint, **kwargs):
        """Make API request with JWT authentication"""
        url = f"{self.BASE_URL}{endpoint}"
        headers = {
            'Authorization': f'Bearer {self._get_jwt_token()}',
            'Content-Type': 'application/json'
        }

        if 'headers' in kwargs:
            headers.update(kwargs.pop('headers'))

        response = requests.request(method, url, headers=headers, **kwargs)
        response.raise_for_status()
        return response.json()

    def get_app(self, app_id):
        """Get app information"""
        return self._request('GET', f'/apps/{app_id}')

    def get_app_store_versions(self, app_id):
        """Get app store versions"""
        return self._request('GET', f'/apps/{app_id}/appStoreVersions')

    def get_app_store_version_localizations(self, version_id):
        """Get localizations for a version"""
        return self._request('GET', f'/appStoreVersions/{version_id}/appStoreVersionLocalizations')

    def get_screenshots(self, localization_id):
        """Get screenshots for a localization"""
        return self._request('GET', f'/appStoreVersionLocalizations/{localization_id}/appScreenshots')

    def upload_screenshot(self, localization_id, image_path, display_type="APP_IPHONE_65"):
        """Upload a screenshot"""
        # Read image file
        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Create screenshot record
        payload = {
            "data": {
                "type": "appScreenshots",
                "attributes": {
                    "fileName": Path(image_path).name,
                    "fileSize": len(image_data),
                    "displayType": display_type
                },
                "relationships": {
                    "appStoreVersionLocalization": {
                        "data": {
                            "type": "appStoreVersionLocalizations",
                            "id": localization_id
                        }
                    }
                }
            }
        }

        response = self._request(
            'POST',
            '/appScreenshots',
            json=payload
        )

        screenshot_id = response['data']['id']
        upload_operations = response['data']['attributes']['uploadOperations']

        # Upload image file
        for operation in upload_operations:
            method = operation['method']
            url = operation['url']
            headers = {h['name']: h['value'] for h in operation.get('requestHeaders', [])}

            requests.request(method, url, data=image_data, headers=headers)

        return screenshot_id

    def commit_upload(self, screenshot_id):
        """Commit uploaded screenshot"""
        payload = {
            "data": {
                "type": "appScreenshots",
                "id": screenshot_id,
                "attributes": {
                    "uploaded": True
                }
            }
        }
        return self._request('PATCH', f'/appScreenshots/{screenshot_id}', json=payload)


def load_config(config_path="appstore_config.json"):
    """Load configuration from JSON file"""
    if not os.path.exists(config_path):
        print(f"[ERROR] Config file not found: {config_path}")
        print("\nCreate appstore_config.json with:")
        print(json.dumps({
            "issuer_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            "key_id": "XXXXXXXXXX",
            "private_key_path": "./AuthKey_XXXXXXXXXX.p8",
            "app_id": "6776948414",
            "bundle_id": "com.sestamibitechlab.cognitiveassessments"
        }, indent=2))
        sys.exit(1)

    with open(config_path, 'r') as f:
        return json.load(f)


def main():
    """Main upload workflow"""
    print("App Store Connect API Screenshot Uploader")
    print("=" * 60)

    # Load config
    config = load_config()

    try:
        # Initialize API client
        api = AppStoreConnectAPI(
            config['issuer_id'],
            config['key_id'],
            config['private_key_path']
        )

        print("\n[1] Authenticating with App Store Connect API...")
        app = api.get_app(config['app_id'])
        app_name = app['data']['attributes']['name']
        print(f"[OK] Connected to app: {app_name}")

        # Get current app store version
        print("\n[2] Fetching app store versions...")
        versions = api.get_app_store_versions(config['app_id'])

        if not versions['data']:
            print("[ERROR] No app store versions found")
            sys.exit(1)

        version = versions['data'][0]
        version_id = version['id']
        version_string = version['attributes']['versionString']
        print(f"[OK] Using version: {version_string}")

        # Get localizations (should have en-US)
        print("\n[3] Fetching localizations...")
        localizations = api.get_app_store_version_localizations(version_id)

        en_us_localization = None
        for loc in localizations['data']:
            if loc['attributes']['locale'] == 'en-US':
                en_us_localization = loc
                break

        if not en_us_localization:
            print("[ERROR] No en-US localization found")
            sys.exit(1)

        localization_id = en_us_localization['id']
        print(f"[OK] Using en-US localization")

        # Upload screenshots
        screenshots_dir = "store/screenshots/ios"
        if not os.path.exists(screenshots_dir):
            print(f"[ERROR] Screenshots directory not found: {screenshots_dir}")
            sys.exit(1)

        screenshot_files = sorted([
            f for f in os.listdir(screenshots_dir)
            if f.lower().endswith('.png')
        ])

        print(f"\n[4] Uploading {len(screenshot_files)} screenshots...")

        for i, filename in enumerate(screenshot_files, 1):
            filepath = os.path.join(screenshots_dir, filename)
            print(f"  [{i}/{len(screenshot_files)}] Uploading {filename}...")

            try:
                screenshot_id = api.upload_screenshot(localization_id, filepath, "APP_IPHONE_67")
                api.commit_upload(screenshot_id)
                print(f"        [OK] Uploaded successfully")
            except Exception as e:
                print(f"        [ERROR] {e}")

        print("\n" + "=" * 60)
        print("[SUCCESS] Screenshots uploaded to App Store Connect!")
        print(f"Location: App Store > Cognitive Assessments > Screenshots > iPhone 6.7\"")
        print("Next: Log in to App Store Connect to verify and submit for review")

    except Exception as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
