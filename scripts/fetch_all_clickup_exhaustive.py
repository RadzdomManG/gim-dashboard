import requests
import json
import os
import time

TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
HEADERS = {'Authorization': TOKEN}
TEAM_ID = '9016642965'

print("=== STARTING EXHAUSTIVE CLICKUP EXTRACTION ===")

# 1. Fetch all spaces
spaces_res = requests.get(f'https://api.clickup.com/api/v2/team/{TEAM_ID}/space?archived=false', headers=HEADERS)
spaces = spaces_res.json().get('spaces', [])
print(f"Found {len(spaces)} spaces in Grace In Motion")

all_lists_meta = []
hierarchy_tree = []

for s in spaces:
    sid = s.get('id')
    sname = s.get('name')
    print(f"\nProcessing Space: {sname} ({sid})")

    space_node = {
        "id": f"space-{sid}",
        "workspace_id": "ws-gim",
        "name": sname,
        "slug": sname.lower().replace(" ", "-").replace("&", "and"),
        "icon": "FolderKanban" if "Management" in sname else ("Users" if "HR" in sname else "Workflow"),
        "color": "#3D5249",
        "is_private": s.get('private', False),
        "position": len(hierarchy_tree) + 1,
        "folders": [],
        "lists": []
    }

    # Folders in this space
    f_res = requests.get(f'https://api.clickup.com/api/v2/space/{sid}/folder?archived=false', headers=HEADERS)
    folders = f_res.json().get('folders', []) if f_res.status_code == 200 else []

    for f in folders:
        fid = f.get('id')
        fname = f.get('name')
        folder_node = {
            "id": f"folder-{fid}",
            "space_id": f"space-{sid}",
            "name": fname,
            "color": "#466B53",
            "position": len(space_node["folders"]) + 1,
            "is_archived": False,
            "lists": []
        }

        flists = f.get('lists', [])
        for l in flists:
            lid = l.get('id')
            lname = l.get('name')
            all_lists_meta.append({
                'space_id': f"space-{sid}", 'space_name': sname,
                'folder_id': f"folder-{fid}", 'folder_name': fname,
                'list_id': lid, 'list_name': lname
            })
            folder_node["lists"].append({
                "id": lid,
                "space_id": f"space-{sid}",
                "folder_id": f"folder-{fid}",
                "name": lname,
                "color": "#518E6A",
                "position": len(folder_node["lists"]) + 1,
                "is_archived": "PAUSE" in fname or "ARCHIVE" in fname,
                "tasks_count": 0
            })
        space_node["folders"].append(folder_node)

    # Standalone lists in this space
    sl_res = requests.get(f'https://api.clickup.com/api/v2/space/{sid}/list?archived=false', headers=HEADERS)
    slists = sl_res.json().get('lists', []) if sl_res.status_code == 200 else []

    for l in slists:
        lid = l.get('id')
        lname = l.get('name')
        all_lists_meta.append({
            'space_id': f"space-{sid}", 'space_name': sname,
            'folder_id': None, 'folder_name': None,
            'list_id': lid, 'list_name': lname
        })
        space_node["lists"].append({
            "id": lid,
            "space_id": f"space-{sid}",
            "folder_id": None,
            "name": lname,
            "color": "#518E6A",
            "position": len(space_node["lists"]) + 1,
            "is_archived": False,
            "tasks_count": 0
        })

    hierarchy_tree.append(space_node)

print(f"\nDiscovered {len(all_lists_meta)} total lists across all spaces.")

# 2. Paginate through each list to extract ALL tasks (open + closed + subtasks)
all_extracted_tasks = []
list_task_counts = {}

for idx, meta in enumerate(all_lists_meta):
    lid = meta['list_id']
    lname = meta['list_name']
    sname = meta['space_name']
    fname = meta['folder_name'] or "Root"

    page = 0
    list_tasks_count = 0

    while True:
        url = f'https://api.clickup.com/api/v2/list/{lid}/task?include_closed=true&subtasks=true&page={page}'
        try:
            r = requests.get(url, headers=HEADERS, timeout=15)
            if r.status_code != 200:
                break
            tasks = r.json().get('tasks', [])
            if not tasks:
                break

            for raw in tasks:
                # Map assignees
                assignees = []
                for a in raw.get('assignees', []):
                    name = a.get('username') or a.get('email') or 'Specialist'
                    nick = 'Radz' if 'radz' in name.lower() else ('Divine' if 'divine' in name.lower() else ('RA' if 'rose' in name.lower() or 'ra' in name.lower() else name.split()[0]))
                    assignees.append({
                        'id': str(a.get('id', '')),
                        'user_id': str(a.get('id', '')),
                        'name': name,
                        'nickname': nick,
                        'email': a.get('email', '')
                    })

                # Due date
                due = None
                if raw.get('due_date'):
                    try:
                        val = int(raw.get('due_date'))
                        import datetime
                        due = datetime.datetime.fromtimestamp(val / 1000, tz=datetime.timezone.utc).isoformat()
                    except:
                        due = str(raw.get('due_date'))

                # Priority
                priority = 'Normal'
                raw_p = raw.get('priority')
                if isinstance(raw_p, dict):
                    priority = raw_p.get('priority', 'Normal').capitalize()
                elif isinstance(raw_p, str):
                    priority = raw_p.capitalize()

                # Status
                status = 'To Do'
                raw_s = raw.get('status')
                if isinstance(raw_s, dict):
                    status = raw_s.get('status', 'To Do').capitalize()
                elif isinstance(raw_s, str):
                    status = raw_s.capitalize()

                # Checklists
                checklists = []
                for cl in raw.get('checklists', []):
                    items = []
                    for item in cl.get('items', []):
                        items.append({
                            'id': item.get('id'),
                            'title': item.get('name', 'Checklist item'),
                            'is_completed': item.get('resolved', False),
                            'assignee_id': str(item.get('assignee', {}).get('id')) if item.get('assignee') else None
                        })
                    checklists.append({
                        'id': cl.get('id'),
                        'name': cl.get('name', 'Checklist'),
                        'items': items
                    })

                task_obj = {
                    'id': str(raw.get('id')),
                    'list_id': lid,
                    'list_name': lname,
                    'folder_id': meta['folder_id'],
                    'folder_name': meta['folder_name'],
                    'space_id': meta['space_id'],
                    'space_name': sname,
                    'parent_task_id': raw.get('parent'),
                    'title': raw.get('name') or raw.get('title') or 'Untitled Task',
                    'description': raw.get('text_content') or raw.get('description') or '',
                    'status': status,
                    'priority': priority if priority in ['Urgent', 'High', 'Normal', 'Low'] else 'Normal',
                    'due_date': due,
                    'tags': [t.get('name') if isinstance(t, dict) else str(t) for t in raw.get('tags', [])],
                    'assignees': assignees,
                    'subtasks_count': raw.get('subtasks_count', 0),
                    'comments_count': raw.get('comments_count', 0),
                    'checklists': checklists,
                    'position': 0
                }
                all_extracted_tasks.append(task_obj)
                list_tasks_count += 1

            page += 1
            time.sleep(0.15) # gentle on ClickUp rate limits
        except Exception as e:
            print(f"Error on {lname} (page {page}): {e}")
            break

    list_task_counts[lid] = list_tasks_count
    if list_tasks_count > 0:
        print(f"[{idx+1}/{len(all_lists_meta)}] {sname} > {fname} > {lname}: {list_tasks_count} tasks (Page {page})")

print(f"\n==========================================")
print(f"TOTAL AUTHENTIC CLICKUP TASKS FETCHED: {len(all_extracted_tasks)}")
print(f"==========================================")

# Update task counts in hierarchy tree
for s in hierarchy_tree:
    for f in s.get("folders", []):
        for l in f.get("lists", []):
            l["tasks_count"] = list_task_counts.get(l["id"], 0)
    for l in s.get("lists", []):
        l["tasks_count"] = list_task_counts.get(l["id"], 0)

# Save master tasks
out_tasks = os.path.join('src', 'lib', 'hierarchy', 'clickup_tasks_master.json')
with open(out_tasks, 'w', encoding='utf-8') as f:
    json.dump(all_extracted_tasks, f, indent=2)

out_tree = os.path.join('src', 'lib', 'hierarchy', 'clickup_tree_master.json')
with open(out_tree, 'w', encoding='utf-8') as f:
    json.dump(hierarchy_tree, f, indent=2)

print(f"Saved {len(all_extracted_tasks)} tasks to {out_tasks}")
print(f"Saved complete hierarchy tree to {out_tree}")
