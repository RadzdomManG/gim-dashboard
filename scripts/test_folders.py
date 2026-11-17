import urllib.request
import json

RADZ_TOKEN = 'pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD'
headers = {
    'Authorization': RADZ_TOKEN,
    'Content-Type': 'application/json'
}

# Check if Radzdom can query folders in Space 90162348432 (Operations)
url = 'https://api.clickup.com/api/v2/space/90162348432/folder'
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("Accessible Folders in Operations:", [(f['id'], f['name']) for f in data.get('folders', [])])
except Exception as e:
    print("Error:", e)
