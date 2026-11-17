import urllib.request
import json

DIVINE_TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
headers = {'Authorization': DIVINE_TOKEN, 'Content-Type': 'application/json'}

for lid in ['901607479883', '1301240000006600']:
    req = urllib.request.Request(f'https://api.clickup.com/api/v2/list/{lid}', headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"=== List {lid} ({data.get('name')}) ===")
        print("keys:", list(data.keys()))
        print("folder:", data.get('folder'))
        print("space:", data.get('space'))
        print("permission_level:", data.get('permission_level'))
        print("members:", [(m.get('id'), m.get('username')) for m in data.get('members', [])])
