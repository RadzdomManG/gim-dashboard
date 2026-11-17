import urllib.request
import json

DIVINE_TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
RADZ_TOKEN = 'pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD'
RADZ_USER_ID = 106916383
headers_admin = {'Authorization': DIVINE_TOKEN, 'Content-Type': 'application/json'}
headers_radz = {'Authorization': RADZ_TOKEN, 'Content-Type': 'application/json'}

FOLDER_ID = '1301240000004927'
lists = [
    ('Phase 1', '1301240000006600'),
    ('Phase 2', '1301240000006601'),
    ('Phase 3', '1301240000006602'),
    ('Phase 4', '1301240000006603'),
    ('Phase 5', '1301240000006604'),
]

# 1. Try adding guest to folder: POST /api/v2/folder/{folder_id}/guest/{guest_id}
url_folder_guest = f'https://api.clickup.com/api/v2/folder/{FOLDER_ID}/guest/{RADZ_USER_ID}'
req = urllib.request.Request(url_folder_guest, data=json.dumps({"permission_level": "create"}).encode('utf-8'), headers=headers_admin, method='POST')
try:
    with urllib.request.urlopen(req) as resp:
        print("Radzdom added to Folder! Code:", resp.getcode())
except Exception as e:
    print("Folder guest add error:", e)

# 2. Add guest to each list: POST /api/v2/list/{list_id}/guest/{guest_id}
for name, lid in lists:
    url_list_guest = f'https://api.clickup.com/api/v2/list/{lid}/guest/{RADZ_USER_ID}'
    req_l = urllib.request.Request(url_list_guest, data=json.dumps({"permission_level": "create"}).encode('utf-8'), headers=headers_admin, method='POST')
    try:
        with urllib.request.urlopen(req_l) as resp:
            print(f"Radzdom added to {name} ({lid})! Code: {resp.getcode()}")
    except Exception as e:
        print(f"Error adding Radz to {name}:", e)

# 3. Test if Radzdom can read and create tasks in List 1
req_test = urllib.request.Request(f'https://api.clickup.com/api/v2/list/1301240000006600', headers=headers_radz)
try:
    with urllib.request.urlopen(req_test) as r:
        print("\nSUCCESS! Radzdom can read List 1:", json.loads(r.read().decode()).get('name'))
except Exception as e:
    print("Radzdom read test failed:", e)
