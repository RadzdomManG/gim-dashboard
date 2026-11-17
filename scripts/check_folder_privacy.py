import urllib.request
import json

DIVINE_TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
headers = {'Authorization': DIVINE_TOKEN, 'Content-Type': 'application/json'}

req = urllib.request.Request('https://api.clickup.com/api/v2/folder/1301240000004927', headers=headers)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    print("Folder name:", data.get('name'))
    print("Folder keys:", list(data.keys()))
    print("Folder members:", data.get('members'))
    print("Folder hidden:", data.get('hidden'))
