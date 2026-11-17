import urllib.request
import json
import time

DIVINE_TOKEN = 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G'
RADZ_USER_ID = 106916383
headers = {'Authorization': DIVINE_TOKEN, 'Content-Type': 'application/json'}

tasks_data = [
    # Phase 1: Foundation & Brand Architecture (1301240000006600)
    {
        "list_id": "1301240000006600",
        "name": "[GIM-ARCH-01] Brand Typography & Design Tokens Setup",
        "description": "Implemented Cooper Black display typography and Montserrat UI font. Established canonical palette: #3D5249 (Dark Green), #466B53 (Logo Green), #518E6A (Accent), #FBF6F3 (Warm Cream).\n\n• Font: CooperBlack.ttf\n• UI Font: Montserrat sans\n• Palette: GIM Dark Green, Logo Green, Accent Green, Warm Cream",
        "status": "complete",
        "priority": 3,
        "assignees": [RADZ_USER_ID],
        "tags": ["brand-tokens", "closed"]
    },
    {
        "list_id": "1301240000006600",
        "name": "[GIM-ARCH-02] Official Brand Logo Marks Integration",
        "description": "Mounted /gim-mark-white.png for dark surfaces and /gim-mark-green.png for light surfaces. Strictly banned plain letter 'G' or emojis as logo marks.\n\n• Verified emblem paths: /gim-mark-white.png, /gim-mark-green.png\n• Replaced legacy text placeholders.",
        "status": "complete",
        "priority": 3,
        "assignees": [RADZ_USER_ID],
        "tags": ["logo-marks", "closed"]
    },
    {
        "list_id": "1301240000006600",
        "name": "[GIM-ARCH-03] Multi-Viewport Quality & Responsive Engine",
        "description": "Zero horizontal scroll leakage across 1440x900 (Desktop), 1366x768 (Laptop), and 390x844 (Mobile). Dynamic viewport height handling and touch target minimums (44px min).\n\n• Responsive layout tested on desktop, tablet, and mobile.\n• DvH viewport height fixes applied.",
        "status": "complete",
        "priority": 3,
        "assignees": [RADZ_USER_ID],
        "tags": ["responsive-ui", "closed"]
    },
    {
        "list_id": "1301240000006600",
        "name": "[GIM-ARCH-04] Design Standards Documentation & Tokens Reference",
        "description": "Authored comprehensive design tokens reference in docs/DESIGN_STANDARDS.md and AGENTS.md.\n\n• Palette hex tables and usage guidelines.\n• Iconography rules (lucide-react strokeWidth={2}).",
        "status": "complete",
        "priority": 3,
        "assignees": [RADZ_USER_ID],
        "tags": ["documentation", "closed"]
    },

    # Phase 2: ClickUp REA 1:1 & RBAC Isolation (1301240000006601)
    {
        "list_id": "1301240000006601",
        "name": "[GIM-ARCH-05] Full REA Audit & 6-Tier ClickUp Reverse-Engineering",
        "description": "Extracted all 7 spaces, 48 lists, 50 docs, and 20 verified members. Built master reverse-engineering blueprint in GIM_CLICKUP_REVERSE_ENGINEERING_MASTER_PLAN.md.\n\n• Workspace: Grace In Motion (9016642965)\n• 6-tier architecture mapped: Workspace -> Space -> Folder -> List -> Task -> Subtask",
        "status": "complete",
        "priority": 2,
        "assignees": [RADZ_USER_ID],
        "tags": ["rea-audit", "closed"]
    },
    {
        "list_id": "1301240000006601",
        "name": "[GIM-ARCH-06] ClickUp Status Accordion Groups & Hex Codes",
        "description": "1:1 ClickUp status accordions (TO DO #87909E, IN PROGRESS #5F55EE, FOR REVIEW #F8AE00, BLOCKED #D33D44, CLOSED #008844) with subtask counters, priority flags, tag chips, and comments count.\n\n• Collapsible status headers matching ClickUp 1:1\n• Subtask count badges (2, 4, 7)\n• Tag chips and time tracking indicators",
        "status": "complete",
        "priority": 1,
        "assignees": [RADZ_USER_ID],
        "tags": ["clickup-status", "closed"]
    },
    {
        "list_id": "1301240000006601",
        "name": "[GIM-ARCH-07] Dynamic Specialist Views Bar per Client",
        "description": "Real-time specialist tabs matching ClickUp: InVogue (Erwin's, Jedy's, Ellyka's), Juvibolt (Divine's, Radz's, Kim's), WRTS (Erwin's, BJ's, Aldwin's), NoirLab, Risewise, Studio Nets.\n\n• Clicking a specialist filters to that member's tasks.\n• Knowledge Hub doc tab, List view, Board view, Table view, Calendar view.",
        "status": "complete",
        "priority": 2,
        "assignees": [RADZ_USER_ID],
        "tags": ["specialist-tabs", "closed"]
    },
    {
        "list_id": "1301240000006601",
        "name": "[GIM-ARCH-08] Air-Gapped RBAC & Client Scope Lockdown",
        "description": "Strict single-tenant isolation for delivery specialists. Universal authority for Divine, Radz, and RA. Zero cross-client data drift enforced across API routes and frontend state.\n\n• Enforced user_metadata.clientScope.\n• Supabase RLS and server-side client isolation.",
        "status": "complete",
        "priority": 1,
        "assignees": [RADZ_USER_ID],
        "tags": ["rbac-security", "closed"]
    },
    {
        "list_id": "1301240000006601",
        "name": "[GIM-ARCH-09] Team Roster Alignment & Camille Bautista Purge",
        "description": "Purged dummy placeholder Camille Bautista across credentials, login, mock data, and team directory. Restored Kimberly Besa (Marketing & Ops Assistant) and Erwin Manaog (Operations Manager). Paused Little Treasures Company.\n\n• Real team roster: Divine, Radz, RA, Erwin, Kim, BJ, Jedy, Jane, Jerold, Ellyka, Joy, Joyce, Aldwin.\n• Little Treasures strictly paused in sprint views.",
        "status": "complete",
        "priority": 1,
        "assignees": [RADZ_USER_ID],
        "tags": ["roster-cleanup", "closed"]
    },

    # Phase 3: Client Portfolios & Knowledge Hub (1301240000006602)
    {
        "list_id": "1301240000006602",
        "name": "[GIM-SPRINT-05] 13-Section AI Knowledge Hub & Evidence Vault",
        "description": "Standardized 13-section operational framework per client:\n1. Company Overview\n2. Communication Cadence\n3. Key Tech Stack\n4. Brand Identity & Style Tokens\n5. Client Portals & Logins Vault\n6. Standard Operating Procedures (SOPs)\n7. AI Bot Profile & Guardrails\n8. Quality Assurance & Sign-off Gates\n9. Escalation Matrix\n10. File Vault & Shared Assets\n11. Deliverable Milestone Archive\n12. Retainer & Billing Structure\n13. Client Contact Directory",
        "status": "complete",
        "priority": 2,
        "assignees": [RADZ_USER_ID],
        "tags": ["knowledge-hub", "closed"]
    },
    {
        "list_id": "1301240000006602",
        "name": "[GIM-SPRINT-06] Multi-Client Real-Time Global Timezone Engine",
        "description": "Live timezone clocks for Texas (CST UTC-6), California (PST UTC-8), Australia (AEST UTC+10), and UK (GMT). Enables the team to see client local time instantly to avoid out-of-hours messages.\n\n• Displays city, offset, and live pulsing clock.\n• Integrated into Client Portfolio Dossier.",
        "status": "complete",
        "priority": 3,
        "assignees": [RADZ_USER_ID],
        "tags": ["timezone-engine", "closed"]
    },
    {
        "list_id": "1301240000006602",
        "name": "[GIM-SPRINT-07] Client Dossier & Retainer Milestone Tracker",
        "description": "Live monthly retainer, active sprint focus, and milestone velocity tracking across active clients.\n\n• InVogue Cleans: USD $1,700/mo (55% progress)\n• Juvibolt Cybertech: USD $3,200/mo (70% progress)\n• WRTS: USD $4,500/mo (80% progress)\n• NoirLab: USD $2,500/mo (60% progress)\n• Studio Nets: USD $2,800/mo (60% progress)\n• Risewise: USD $2,200/mo (65% progress)",
        "status": "complete",
        "priority": 3,
        "assignees": [RADZ_USER_ID],
        "tags": ["client-dossier", "closed"]
    },
    {
        "list_id": "1301240000006602",
        "name": "[GIM-SPRINT-08] Knowledge Hub Prompt One-Click Copy Engine",
        "description": "One-click formatted context extraction for copying client SOPs into external AI tools and subagent briefings.\n\n• Copies full prompt with client guardrails, tones, and restrictions.\n• Visual checkmark confirmation on copy.",
        "status": "complete",
        "priority": 3,
        "assignees": [RADZ_USER_ID],
        "tags": ["prompt-engine", "closed"]
    },
    {
        "list_id": "1301240000006602",
        "name": "[GIM-SPRINT-09] Client Knowledge Hub Document Search & Filter",
        "description": "Interactive section search and keyword filter across client knowledge documents and SOP checklists.\n\n• In-page keyword search highlighting.\n• Quick filter by SOP category (Operations, Billing, Delivery, AI).",
        "status": "in progress",
        "priority": 3,
        "assignees": [RADZ_USER_ID],
        "tags": ["knowledge-search", "in-progress"]
    },

    # Phase 4: Real-time Messaging & Active Sprints (1301240000006603)
    {
        "list_id": "1301240000006603",
        "name": "[GIM-SPRINT-10] PostgreSQL Schema Fix for Real-time Messaging",
        "description": "Stripped unsupported reply_to column on insert; resolved HTTP 500 error on /api/messages. Messages now post immediately and format timestamps on retrieval.\n\n• Schema sanitization in src/app/api/messages/route.ts\n• Live verification passed: inserted test message and purged cleanly.",
        "status": "complete",
        "priority": 1,
        "assignees": [RADZ_USER_ID],
        "tags": ["messaging-fix", "closed"]
    },
    {
        "list_id": "1301240000006603",
        "name": "[GIM-SPRINT-11] Dual-Pane Operational Task & Messaging Split View",
        "description": "Side-by-side execution view: Tasks & Delivery Pipeline on left, Real-Time Messaging on right. Tested in Nov 13 team call.\n\n• Enables team members to chat while viewing sprint deliverables.\n• Exit Dual View button for focused layout.",
        "status": "complete",
        "priority": 3,
        "assignees": [RADZ_USER_ID],
        "tags": ["dual-pane", "closed"]
    },
    {
        "list_id": "1301240000006603",
        "name": "[GIM-SPRINT-12] Real-time Messaging Delivery Verification & Online Indicator",
        "description": "Live presence indicators and typing indicators across #general-gim, #ops-delivery, and client rooms.\n\n• Green dot online indicators for active leadership and specialists.\n• Sound chime on incoming message receive.",
        "status": "in progress",
        "priority": 2,
        "assignees": [RADZ_USER_ID],
        "tags": ["presence-sync", "in-progress"]
    },
    {
        "list_id": "1301240000006603",
        "name": "[GIM-SPRINT-13] Task Quick-Status Movement & Audio Chimes Persistence",
        "description": "Seamless status transitions updating Supabase client_tasks with audio chimes (sound.playSuccessChime()).\n\n• Checkbox click advances task to Closed with success chime.\n• Syncs state across dashboard views.",
        "status": "in progress",
        "priority": 2,
        "assignees": [RADZ_USER_ID],
        "tags": ["status-movement", "in-progress"]
    },
    {
        "list_id": "1301240000006603",
        "name": "[GIM-SPRINT-14] Task Comment Threading & Feed Activity Persistence",
        "description": "Direct modal comment entry with persistence to Supabase task_comments and ClickUp activity logs.\n\n• Modal loads comments from ClickUp API.\n• Allows specialist to post handover notes.",
        "status": "in progress",
        "priority": 3,
        "assignees": [RADZ_USER_ID],
        "tags": ["comment-threading", "in-progress"]
    },

    # Phase 5: Grok AI, Slack & Automation Roadmap (1301240000006604)
    {
        "list_id": "1301240000006604",
        "name": "[GIM-ROADMAP-01] Grok (xAI API) & Multi-Model Intelligence Integration",
        "description": "Integration of Grok-2 / Grok API endpoints alongside Anthropic/Gemini for automated client research, code generation, and rapid triage in the GIM Copilot.\n\n• Model: Grok-2 / Grok Vision\n• Integration point: src/app/api/copilot/chat/route.ts & AI Bot Registry\n• Use case: Real-time web triage, cybersecurity log analysis for Juvibolt, and operational QA for InVogue.",
        "status": "in progress",
        "priority": 1,
        "assignees": [RADZ_USER_ID],
        "tags": ["grok-ai", "xai-api", "in-progress"]
    },
    {
        "list_id": "1301240000006604",
        "name": "[GIM-ROADMAP-02] Automated Slack Notification Webhook Engine",
        "description": "Automated webhook dispatch to #gim-sprint-alerts whenever tasks are assigned, moved to for review, or blocked.\n\n• Incoming webhook URL configuration in .env.local.\n• Formatted Slack blocks with Task Title, Assignee, Client, and direct link.",
        "status": "to do",
        "priority": 1,
        "assignees": [RADZ_USER_ID],
        "tags": ["slack-webhook", "roadmap"]
    },
    {
        "list_id": "1301240000006604",
        "name": "[GIM-ROADMAP-03] Two-Way ClickUp Direct Write-Back Engine",
        "description": "Configurable toggle for pushing GIM Dashboard created tasks, subtasks, and comments straight into ClickUp via API.\n\n• POST /api/v2/list/{id}/task direct push from CreateTaskModal.\n• PUT /api/v2/task/{id} status synchronization on card move.",
        "status": "to do",
        "priority": 2,
        "assignees": [RADZ_USER_ID],
        "tags": ["two-way-sync", "roadmap"]
    },
    {
        "list_id": "1301240000006604",
        "name": "[GIM-ROADMAP-04] AI Copilot Contextual Routing to Knowledge Hubs",
        "description": "Routing GIM Copilot inquiries directly to client SOPs and AI bot profiles (Ivy, Jarvis, Neo, Riva, Rocky, Gianna).\n\n• Auto-injects client Knowledge Hub section 1-13 context into LLM prompt.\n• Provides instant answers to client SOP questions without manual searching.",
        "status": "to do",
        "priority": 2,
        "assignees": [RADZ_USER_ID],
        "tags": ["ai-routing", "roadmap"]
    },
    {
        "list_id": "1301240000006604",
        "name": "[GIM-ROADMAP-05] Automated Specialist Timesheet & Capacity Rollups",
        "description": "Weekly capacity and time-tracking aggregation per specialist for billing reconciliations with RA.\n\n• Total hours per specialist per client.\n• Exportable summary for invoice matching.",
        "status": "to do",
        "priority": 3,
        "assignees": [RADZ_USER_ID],
        "tags": ["timesheet-rollup", "roadmap"]
    }
]

created_count = 0
for t in tasks_data:
    url = f'https://api.clickup.com/api/v2/list/{t["list_id"]}/task'
    payload = {
        "name": t["name"],
        "description": t["description"],
        "status": t["status"],
        "priority": t["priority"],
        "assignees": t["assignees"],
        "tags": t.get("tags", [])
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"[{data.get('status',{}).get('status').upper()}] Created: {data.get('name')} (ID: {data.get('id')})")
            created_count += 1
            time.sleep(0.3) # Avoid ClickUp rate limits
    except Exception as e:
        print(f"Error creating {t['name']}: {e}")

print(f"\n======================================")
print(f"Total tasks populated successfully: {created_count}/{len(tasks_data)}")
