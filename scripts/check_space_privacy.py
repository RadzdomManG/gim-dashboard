import urllib.request
import json

DIVINE_TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
headers = {'Authorization': DIVINE_TOKEN, 'Content-Type': 'application/json'}

req = urllib.request.Request('https://api.clickup.com/api/v2/space/90162348432', headers=headers)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    print("Space name:", data.get('name'))
    print("Private:", data.get('private'))
    print("Members:", [(m.get('id'), m.get('username')) for m in data.get('members', [])])
