import urllib.request
import urllib.error
import json

DIVINE_TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
TEAM_ID = '9016642965'
RADZ_USER_ID = 106916383
headers = {'Authorization': DIVINE_TOKEN, 'Content-Type': 'application/json'}

# Test updating user role in team: PUT /api/v2/team/{team_id}/user/{user_id}
url = f'https://api.clickup.com/api/v2/team/{TEAM_ID}/user/{RADZ_USER_ID}'
payload = {
    "role": 2 # 1: Owner, 2: Admin, 3: Member, 4: Guest
}
req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='PUT')
try:
    with urllib.request.urlopen(req) as resp:
        print("Success updating user role via API! Response:", resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.read().decode()}")
except Exception as e:
    print("Error:", e)
