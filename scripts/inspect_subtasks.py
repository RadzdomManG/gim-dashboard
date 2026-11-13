import urllib.request
import json

TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
headers = {'Authorization': TOKEN, 'Content-Type': 'application/json'}

all_tasks = []
page = 0
while True:
    url = f'https://api.clickup.com/api/v2/list/901617666653/task?include_closed=true&subtasks=true&page={page}'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        tasks = data.get('tasks', [])
        if not tasks:
            break
        all_tasks.extend(tasks)
        page += 1
        if len(tasks) < 100:
            break

print(f"Total all_tasks fetched across pages: {len(all_tasks)}")
parent_map = {}
for t in all_tasks:
    p = t.get('parent')
    if p:
        parent_map.setdefault(p, []).append(t)

for t in all_tasks:
    if 'SOP 7.0' in t.get('name', ''):
        print(f"Found: {t.get('name')} ID: {t.get('id')}")
        subs = parent_map.get(t.get('id'), [])
        print(f"Total subtasks under SOP 7.0: {len(subs)}")
        for s in subs:
            print(f"   [{s.get('status',{}).get('status')}] {s.get('name')}")
