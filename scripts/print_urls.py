import urllib.request
import json

DIVINE_TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
headers = {'Authorization': DIVINE_TOKEN, 'Content-Type': 'application/json'}

req = urllib.request.Request('https://api.clickup.com/api/v2/folder/1301240000004927', headers=headers)
with urllib.request.urlopen(req) as r:
    data = json.loads(r.read().decode())
    print(f"Folder: {data.get('name')} (ID: {data.get('id')})")
    print(f"Direct Folder URL: https://app.clickup.com/9016642965/v/f/{data.get('id')}")
    for l in data.get('lists', []):
        print(f"  - {l.get('name')}: https://app.clickup.com/9016642965/v/li/{l.get('id')}")
