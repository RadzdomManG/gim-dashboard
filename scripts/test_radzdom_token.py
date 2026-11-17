import urllib.request
import urllib.parse
import json

RADZ_TOKEN = 'pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD'
headers = {
    'Authorization': RADZ_TOKEN,
    'Content-Type': 'application/json'
}

# 1. Test /user
print("=== 1. Checking /user with Radzdom's Token ===")
req_user = urllib.request.Request('https://api.clickup.com/api/v2/user', headers=headers)
try:
    with urllib.request.urlopen(req_user) as resp:
        user_data = json.loads(resp.read().decode())
        print("User:", user_data.get('user', {}).get('username'), "| Email:", user_data.get('user', {}).get('email'), "| ID:", user_data.get('user', {}).get('id'))
except Exception as e:
    print("Error checking user:", e)

# 2. Check accessible teams / spaces
print("\n=== 2. Checking Teams & Accessible Lists ===")
req_team = urllib.request.Request('https://api.clickup.com/api/v2/team', headers=headers)
try:
    with urllib.request.urlopen(req_team) as resp:
        teams = json.loads(resp.read().decode())
        for t in teams.get('teams', []):
            print("Team:", t.get('name'), "ID:", t.get('id'))
except Exception as e:
    print("Error checking teams:", e)

# List: Grace In Motion (Internal): 901607479883
LIST_ID = '901607479883'
print(f"\n=== 3. Testing Task Creation in List {LIST_ID} ===")
task_payload = {
    "name": "TEST TASK [RADZDOM TOKEN VERIFICATION] - To be deleted",
    "description": "Verifying write permissions for Radzdom's token to document GIM Dashboard tasks.",
    "status": "to do",
    "priority": 3
}

req_create = urllib.request.Request(
    f'https://api.clickup.com/api/v2/list/{LIST_ID}/task',
    data=json.dumps(task_payload).encode('utf-8'),
    headers=headers,
    method='POST'
)

created_task_id = None
try:
    with urllib.request.urlopen(req_create) as resp:
        res_data = json.loads(resp.read().decode())
        created_task_id = res_data.get('id')
        print(f"Task successfully created! Task ID: {created_task_id} | Name: {res_data.get('name')}")
except Exception as e:
    print("Error creating task:", e)

if created_task_id:
    print(f"\n=== 4. Deleting Test Task {created_task_id} ===")
    req_del = urllib.request.Request(
        f'https://api.clickup.com/api/v2/task/{created_task_id}',
        headers=headers,
        method='DELETE'
    )
    try:
        with urllib.request.urlopen(req_del) as resp:
            print("Task successfully deleted! HTTP Code:", resp.getcode())
    except Exception as e:
        print("Error deleting task:", e)
