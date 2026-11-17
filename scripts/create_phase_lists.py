import urllib.request
import json

DIVINE_TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
RADZ_TOKEN = 'pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD'
headers_admin = {'Authorization': DIVINE_TOKEN, 'Content-Type': 'application/json'}
headers_radz = {'Authorization': RADZ_TOKEN, 'Content-Type': 'application/json'}

FOLDER_ID = '1301240000004927' # GIM Dashboard - System

phase_lists = [
    "Phase 1: Foundation & Brand Architecture",
    "Phase 2: ClickUp REA 1:1 & RBAC Isolation",
    "Phase 3: Client Portfolios & Knowledge Hub",
    "Phase 4: Real-time Messaging & Active Sprints",
    "Phase 5: Grok AI, Slack & Automation Roadmap"
]

created_lists = {}

for name in phase_lists:
    url = f'https://api.clickup.com/api/v2/folder/{FOLDER_ID}/list'
    payload = {"name": name}
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers_admin, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            lid = data.get('id')
            created_lists[name] = lid
            print(f"Created List: {name} (ID: {lid})")
    except Exception as e:
        print(f"Error creating list {name}:", e)

# Test if Radzdom can query or create task in list 1
if created_lists:
    first_lid = list(created_lists.values())[0]
    print(f"\nTesting Radzdom token access on list {first_lid}...")
    req_test = urllib.request.Request(f'https://api.clickup.com/api/v2/list/{first_lid}', headers=headers_radz)
    try:
        with urllib.request.urlopen(req_test) as r:
            print("Radzdom can read list:", json.loads(r.read().decode()).get('name'))
    except Exception as e:
        print("Radzdom read test:", e)

with open('gim_dashboard_created_lists.json', 'w', encoding='utf-8') as f:
    json.dump(created_lists, f, indent=2)
