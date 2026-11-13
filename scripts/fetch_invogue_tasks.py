import urllib.request
import json

TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
headers = {'Authorization': TOKEN, 'Content-Type': 'application/json'}

# Fetch tasks for InVogue Cleans
url = 'https://api.clickup.com/api/v2/list/901617666653/task?include_closed=true&subtasks=true'
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        tasks = data.get('tasks', [])
        print(f"Total tasks fetched: {len(tasks)}")
        
        # Group by status
        statuses = {}
        for t in tasks:
            st = t.get('status', {}).get('status', 'unknown')
            statuses.setdefault(st, []).append(t)
            
        for st, tlist in statuses.items():
            print(f"\n--- Status: {st} ({len(tlist)} tasks) ---")
            for t in tlist[:5]:
                subcount = len(t.get('subtasks', []))
                assignees = [a.get('username') for a in t.get('assignees', [])]
                priority = t.get('priority', {}).get('priority') if t.get('priority') else 'none'
                tags = [tg.get('name') for tg in t.get('tags', [])]
                print(f"  * {t.get('name')} | subtasks={subcount} | assignees={assignees} | priority={priority} | tags={tags}")
        
        with open('invogue_tasks_sample.json', 'w', encoding='utf-8') as f:
            json.dump(tasks[:5], f, indent=2)
except Exception as e:
    print("Error:", e)
