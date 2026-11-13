import urllib.request
import json

TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
headers = {'Authorization': TOKEN, 'Content-Type': 'application/json'}

clients = [
    ('InVogue Cleans', '901617666653'),
    ('Juvibolt Cybertech', '1301240000005206'),
    ('We Rock the Spectrum', '1301240000002387'),
    ('NoirLab', '901616453524'),
    ('Risewise', '901614119824'),
    ('Grace In Motion', '901607479883'),
    ('Origines Biz', '901605140683'),
    ('Studio Nets', '901616174910')
]

results = {}

for name, lid in clients:
    req = urllib.request.Request(f'https://api.clickup.com/api/v2/list/{lid}/view', headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            v_data = json.loads(resp.read().decode())
            views = [{'id': v['id'], 'name': v['name'], 'type': v['type']} for v in v_data.get('views', [])]
            results[name] = views
            print(f'=== {name} ===')
            for v in views:
                print(f"  - {v['name']} ({v['type']})")
    except Exception as e:
        print(f'Error {name}:', e)

with open('clickup_client_views.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)
print("Saved to clickup_client_views.json")
