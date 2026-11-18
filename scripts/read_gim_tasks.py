import requests
headers = {'Authorization': 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'}
r = requests.get('https://api.clickup.com/api/v2/list/901607479883/task?include_closed=true', headers=headers)
tasks = r.json().get('tasks', [])
print(f'Grace In Motion tasks count: {len(tasks)}')
for t in tasks:
    print(f"- {t.get('name')} | Assignees: {[a.get('username') for a in t.get('assignees', [])]} | Desc: {t.get('description', '')[:100]}")
