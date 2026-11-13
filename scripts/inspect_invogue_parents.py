import urllib.request
import json

TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
headers = {'Authorization': TOKEN, 'Content-Type': 'application/json'}
url = 'https://api.clickup.com/api/v2/list/901617666653/task?subtasks=false'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    tasks = data.get('tasks', [])
    print(f"Parent tasks (top-level): {len(tasks)}")
    for t in tasks:
        st = t.get('status', {}).get('status')
        name = t.get('name')
        sub_count = len(t.get('subtasks', []))
        print(f"[{st}] {name} (subtasks: {sub_count})")
