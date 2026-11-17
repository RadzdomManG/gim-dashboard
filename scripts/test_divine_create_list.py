import urllib.request
import json

DIVINE_TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
headers = {'Authorization': DIVINE_TOKEN, 'Content-Type': 'application/json'}

url = 'https://api.clickup.com/api/v2/folder/90163184406/list'
req = urllib.request.Request(
    url,
    data=json.dumps({"name": "TEST LIST [DIVINE]"}).encode('utf-8'),
    headers=headers,
    method='POST'
)
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("List created successfully with Divine! ID:", data.get('id'), "Name:", data.get('name'))
        lid = data.get('id')
        req_del = urllib.request.Request(f'https://api.clickup.com/api/v2/list/{lid}', headers=headers, method='DELETE')
        with urllib.request.urlopen(req_del) as dresp:
            print("List deleted successfully! HTTP Code:", dresp.getcode())
except Exception as e:
    print("Error:", e)
