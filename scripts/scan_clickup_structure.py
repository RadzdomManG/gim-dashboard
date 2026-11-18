import requests
import json

headers = {'Authorization': 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'}
team_id = '9016642965'

spaces_r = requests.get(f'https://api.clickup.com/api/v2/team/{team_id}/space?archived=false', headers=headers)
spaces = spaces_r.json().get('spaces', [])

print(f"Total Spaces: {len(spaces)}")

for s in spaces:
    sid = s['id']
    sname = s['name']
    print(f"\n--- Space: {sname} ({sid}) ---")
    
    f_res = requests.get(f'https://api.clickup.com/api/v2/space/{sid}/folder?archived=false', headers=headers)
    folders = f_res.json().get('folders', []) if f_res.status_code == 200 else []
    for f in folders:
        print(f"  Folder: {f['name']} ({f['id']})")
        for l in f.get('lists', []):
            print(f"    List: {l['name']} ({l['id']})")
            
    l_res = requests.get(f'https://api.clickup.com/api/v2/space/{sid}/list?archived=false', headers=headers)
    lists = l_res.json().get('lists', []) if l_res.status_code == 200 else []
    for l in lists:
        print(f"  Folderless List: {l['name']} ({l['id']})")
