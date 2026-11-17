import urllib.request
import urllib.error
import json

DIVINE_TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
TEAM_ID = '9016642965'
headers = {'Authorization': DIVINE_TOKEN, 'Content-Type': 'application/json'}

# Test invite or add user as Member (role 3)
url = f'https://api.clickup.com/api/v2/team/{TEAM_ID}/user'
payload = {
    "email": "radzdomgallego4@gmail.com",
    "admin": True # Or role: 2/3
}
req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
try:
    with urllib.request.urlopen(req) as resp:
        print("Success adding user via POST /user:", resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.read().decode()}")
except Exception as e:
    print("Error:", e)
