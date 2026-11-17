import urllib.request
import json

RADZ_TOKEN = 'pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD'
headers = {'Authorization': RADZ_TOKEN, 'Content-Type': 'application/json'}

url = 'https://api.clickup.com/api/v2/folder/90163184406/list'
req = urllib.request.Request(
    url,
    data=json.dumps({"name": "TEST LIST [RADZDOM]"}).encode('utf-8'),
    headers=headers,
    method='POST'
)
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("List created successfully! ID:", data.get('id'), "Name:", data.get('name'))
        # Delete it immediately
        lid = data.get('id')
        req_del = urllib.request.Request(f'https://api.clickup.com/api/v2/list/{lid}', headers=headers, method='DELETE')
        with urllib.request.urlopen(req_del) as dresp:
            print("List deleted successfully! HTTP Code:", dresp.getcode())
except Exception as e:
    print("Error creating list with Radzdom token:", e)
