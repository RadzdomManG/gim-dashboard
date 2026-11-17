# Grace In Motion (GIM) — Model Context Protocol (MCP) Server

Connect Claude Desktop, Claude Code, Cursor, or any MCP client directly to **Grace In Motion (GIM) Agency OS**.

This MCP server gives Claude full operational capabilities to query tasks, create and manage deliverables, inspect client dossiers, read 13-section SOPs, and post updates to internal team channels.

---

## 1. Quick Setup for Claude Desktop

Add this configuration to your Claude Desktop config file:

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gim-agency-os": {
      "command": "node",
      "args": [
        "d:\\GIM dashboard\\mcp-server\\index.mjs"
      ]
    }
  }
}
```

Restart Claude Desktop, and you will see the hammer icon with GIM tools ready!

---

## 2. Available MCP Tools for Claude

| Tool | Description |
|---|---|
| `gim_list_spaces` | Returns all organizational spaces (Operations, Client Management, Marketing, Projects, Finance, HR, Support), folders, and lists. |
| `gim_get_tasks` | Query 8,173 authentic ClickUp tasks with filters for `client`, `status`, `priority`, `assignee`, `search`, and `limit`. |
| `gim_get_task_details` | Retrieve full details of any task, including subtasks, checklists, custom fields, and assignees. |
| `gim_create_task` | Create a new task assigned to any specialist and persist it to Supabase. |
| `gim_update_task_status` | Update task status (`To Do`, `In Progress`, `Pending Review`, `Approved`, `Completed`). |
| `gim_list_clients` | List active clients (WRTS, Juvibolt, InVogue, Studio Nets, Risewise, NoirLab, Tch2Thrive) with retainers and sprint targets. |
| `gim_get_client_knowledge` | Access authentic 13-section client SOP, intelligence dossier, tech stack, and escalation procedures. |
| `gim_send_team_message` | Post real-time operational messages to any GIM channel (`#general-gim`, `#wrts-automations`, `#juvibolt-cybertech`, `#invogue-growth`, etc.). |
| `gim_get_channel_messages` | Read recent operational messages from any channel. |

---

## 3. Example Commands for Claude

Once connected to Claude, you can simply prompt:
- *"Show me all high-priority tasks for We Rock the Spectrum."*
- *"What is the active sprint and tech stack for Juvibolt Cybertech?"*
- *"Create a task for InVogue Cleans titled 'Automate weekly cleaner payout reports' assigned to RA Malinao with Urgent priority."*
- *"Send a message to #general-gim announcing that the ClickUp hierarchy sync is complete."*
- *"Get the SOP and escalation matrix for Risewise."*
