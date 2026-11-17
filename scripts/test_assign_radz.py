import urllib.request
import json

DIVINE_TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
RADZ_TOKEN = 'pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD'
RADZ_USER_ID = 106916383
headers_admin = {'Authorization': DIVINE_TOKEN, 'Content-Type': 'application/json'}
headers_radz = {'Authorization': RADZ_TOKEN, 'Content-Type': 'application/json'}

LIST_ID = '1301240000006600' # Phase 1

payload = {
    "name": "TEST TASK ASSIGNED TO RADZ",
    "description": "Testing assignment to Radzdom so Radzdom can update it directly.",
    "status": "to do",
    "assignees": [RADZ_USER_ID]
}

url = f'https://api.clickup.com/api/v2/list/{LIST_ID}/task'
req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers_admin, method='POST')
try:
    with urllib.request.urlopen(req) as resp:
        t_data = json.loads(resp.read().decode())
        tid = t_data.get('id')
        print("Task created and assigned to Radz! Task ID:", tid)
        
        # Now test if Radzdom's token can read and update this task!
        req_radz_read = urllib.request.Request(f'https://api.clickup.com/api/v2/task/{tid}', headers=headers_radz)
        with urllib.request.urlopen(req_radz_read) as rresp:
            r_data = json.loads(rresp.read().decode())
            print("Radzdom can read the task:", r_data.get('name'))
            
        # Radzdom updates the task status to in progress
        update_payload = {"status": "in progress"}
        req_radz_update = urllib.request.Request(f'https://api.clickup.com/api/v2/task/{tid}', data=json.dumps(update_payload).encode('utf-8'), headers=headers_radz, method='PUT')
        with urllib.request.urlopen(req_radz_update) as uresp:
            u_data = json.loads(uresp.read().decode())
            print("Radzdom updated the task status to:", u_data.get('status', {}).get('status'))
            
        # Radzdom posts a comment on the task
        comment_payload = {"comment_text": "Radzdom verified update from API!"}
        req_radz_comment = urllib.request.Request(f'https://api.clickup.com/api/v2/task/{tid}/comment', data=json.dumps(comment_payload).encode('utf-8'), headers=headers_radz, method='POST')
        with urllib.request.urlopen(req_radz_comment) as cresp:
            print("Radzdom posted comment! Code:", cresp.getcode())
            
        # Delete test task
        req_del = urllib.request.Request(f'https://api.clickup.com/api/v2/task/{tid}', headers=headers_admin, method='DELETE')
        urllib.request.urlopen(req_del)
        print("Test task cleaned up successfully!")
except Exception as e:
    print("Error:", e)
