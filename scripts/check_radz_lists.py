import urllib.request
import json

RADZ_TOKEN = 'pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD'
headers = {'Authorization': RADZ_TOKEN, 'Content-Type': 'application/json'}

lists = [
    ('Grace In Motion (Internal)', '901607479883'),
    ('Juvibolt Cybertech', '1301240000005206'),
    ('We Rock the Spectrum', '1301240000002387'),
    ('InVogue Cleans', '901617666653'),
    ('NoirLab', '901616453524'),
    ('Risewise', '901614119824'),
    ('Studio Nets', '901616174910'),
    ('Little Treasures', '1301240000003883')
]

for name, lid in lists:
    url = f'https://api.clickup.com/api/v2/list/{lid}'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"[ACCESS OK] {name} ({lid}) - folder: {data.get('folder', {}).get('name')}")
    except Exception as e:
        print(f"[NO ACCESS] {name} ({lid}): {e}")
