import urllib.request
import json

DIVINE_TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
RADZ_TOKEN = 'pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD'
headers_admin = {'Authorization': DIVINE_TOKEN, 'Content-Type': 'application/json'}
headers_radz = {'Authorization': RADZ_TOKEN, 'Content-Type': 'application/json'}

SPACE_ID = '90162348432' # GIM Operations

# 1. Create Folder: "GIM Dashboard - System"
url_folder = f'https://api.clickup.com/api/v2/space/{SPACE_ID}/folder'
folder_payload = {"name": "GIM Dashboard - System"}
req = urllib.request.Request(url_folder, data=json.dumps(folder_payload).encode('utf-8'), headers=headers_admin, method='POST')

folder_id = None
try:
    with urllib.request.urlopen(req) as resp:
        folder_data = json.loads(resp.read().decode())
        folder_id = folder_data.get('id')
        print(f"Folder created successfully! ID: {folder_id} | Name: {folder_data.get('name')}")
except Exception as e:
    print("Error creating folder:", e)

if folder_id:
    # Verify Radzdom token can access this folder
    url_check = f'https://api.clickup.com/api/v2/folder/{folder_id}'
    req_check = urllib.request.Request(url_check, headers=headers_radz)
    try:
        with urllib.request.urlopen(req_check) as r:
            f_radz = json.loads(r.read().decode())
            print(f"Radzdom verified access to folder: {f_radz.get('name')}")
    except Exception as e:
        print("Radzdom access check notice:", e)

print("Folder ID:", folder_id)
