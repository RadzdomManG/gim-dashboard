import urllib.request
import json

TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
headers = {'Authorization': TOKEN, 'Content-Type': 'application/json'}

# ClickUp workspace search
url = 'https://api.clickup.com/api/v2/team/9016642965/task?include_closed=true&subtasks=true&include_markdown_description=true'
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        tasks = data.get('tasks', [])
        print(f"Workspace tasks: {len(tasks)}")
        for t in tasks:
            if 'verify with' in t.get('name', '').lower() or 'escalate' in str(t).lower():
                print("FOUND in team search:", t.get('name'), "List:", t.get('list', {}).get('name'), "Tags:", t.get('tags'))
except Exception as e:
    print("Error:", e)
