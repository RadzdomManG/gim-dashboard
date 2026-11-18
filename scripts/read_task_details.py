import requests
headers = {'Authorization': 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'}
r = requests.get('https://api.clickup.com/api/v2/list/901607479883/task?include_closed=true', headers=headers)
tasks = r.json().get('tasks', [])
target_names = ['SOP DOCUMENTATION', 'SUB CONS ONBOARDING', 'SUB CONS OFFBOARDING', 'CLICK UP & SLACK MAINTENANCE', 'SUB CONS WEEKLY MEETING', 'GIM AI Assistants Registry', 'Little Treasures Company: Six-Month Operational Roadmap', 'Dr. Yasmin x Divine']

for t in tasks:
    for tn in target_names:
        if tn.lower() in t.get('name', '').lower():
            print(f"=== {t.get('name')} ===")
            print(f"Description:\n{t.get('description')}\n")
