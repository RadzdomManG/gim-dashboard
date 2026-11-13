import urllib.request
import json

TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
headers = {'Authorization': TOKEN, 'Content-Type': 'application/json'}

page = 0
while True:
    url = f'https://api.clickup.com/api/v2/list/901617666653/task?include_closed=true&subtasks=true&page={page}'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        tasks = data.get('tasks', [])
        if not tasks:
            break
        for t in tasks:
            if 'testing' in t.get('name', '').lower() or 'escalat' in t.get('name', '').lower() or any('escalat' in tg.get('name', '').lower() for tg in t.get('tags', [])):
                print(f"Match: {t.get('name')} | Tags: {t.get('tags')} | Priority: {t.get('priority')}")
        page += 1
