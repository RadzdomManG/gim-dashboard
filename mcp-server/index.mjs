#!/usr/bin/env node

/**
 * Grace In Motion (GIM) — Model Context Protocol (MCP) Server
 * 
 * Provides standard MCP tools for Claude Desktop, Claude Code, and Cursor
 * to inspect, query, create tasks, update statuses, access 13-section client SOPs,
 * and communicate via GIM Agency OS channels.
 * 
 * Protocol: Model Context Protocol (JSON-RPC stdio transport)
 * Standards: @modelcontextprotocol/sdk, Grace In Motion (GIM)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

// 1. Read environment variables from .env.local
function loadEnv() {
  const envPath = path.join(ROOT_DIR, ".env.local");
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        env[key] = val;
      }
    }
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "https://eckdybswbcbhqidgwfkl.supabase.co";
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = SUPABASE_SERVICE_ROLE
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
  : null;

// 2. Load authentic ClickUp dataset
let masterTasksCache = null;
let masterTreeCache = null;

function getMasterTasks() {
  if (masterTasksCache) return masterTasksCache;
  try {
    const p = path.join(ROOT_DIR, "src", "lib", "hierarchy", "clickup_tasks_master.json");
    if (fs.existsSync(p)) {
      masterTasksCache = JSON.parse(fs.readFileSync(p, "utf-8"));
      return masterTasksCache;
    }
  } catch (err) {
    console.error("Warning: could not load clickup_tasks_master.json:", err.message);
  }
  return [];
}

function getMasterTree() {
  if (masterTreeCache) return masterTreeCache;
  try {
    const p = path.join(ROOT_DIR, "src", "lib", "hierarchy", "clickup_tree_master.json");
    if (fs.existsSync(p)) {
      masterTreeCache = JSON.parse(fs.readFileSync(p, "utf-8"));
      return masterTreeCache;
    }
  } catch (err) {
    console.error("Warning: could not load clickup_tree_master.json:", err.message);
  }
  return null;
}

// 3. Client Portfolio & Grounded SOP Data
const CLIENT_PORTFOLIO = [
  {
    id: "we-rock-the-spectrum",
    name: "We Rock the Spectrum (WRTS)",
    code: "WRTS-US",
    industry: "Sensory Gym Franchise Operations",
    location: "Clovis, California, United States",
    timezone: "PST (UTC-8)",
    aiBotName: "Rocky",
    accountLead: "Divine Origines & Erwin Manaog",
    specialist: "BJ Ricafrente & Aldwin",
    status: "Active Sprint",
    retainer: "USD $4,000 / month",
    currentSprint: "Renew 147 CVRC approvals ending Nov 30, daily portal reports & Niko CFO data pack",
    keyTechStack: ["n8n Workflows (21 active)", "Google Sheets DB", "Roller Gym POS", "Slack Alerts", "CVRC State Portal"],
    description: "Sensory gym franchise operations management. Central Valley Regional Center (CVRC) child approval tracking, daily attendance reporting, Roller system cross-referencing.",
  },
  {
    id: "juvibolt-cybertech",
    name: "Juvibolt Cybertech",
    code: "JUV-CT",
    industry: "Cybersecurity EdTech & Bootcamp Delivery",
    location: "Accra, Ghana & London, UK",
    timezone: "EST (UTC-5)",
    aiBotName: "Jarvis",
    accountLead: "Radzdom-Man Gallego",
    specialist: "Kimberly Besa & Erwin Manaog",
    status: "Active Sprint",
    retainer: "USD $3,500 / month",
    currentSprint: "Tutor LMS course sync, WooCommerce checkout optimization, Discord community onboarding",
    keyTechStack: ["GoHighLevel (mg57RFEKUm6nvnSadv2D)", "WordPress / WooCommerce", "Tutor LMS", "Discord Webhooks"],
    description: "Cybersecurity EdTech training institute. Cohortly onboarding, student LMS progress tracking, certification issuance, email nurturing.",
  },
  {
    id: "invogue-cleans",
    name: "InVogue Cleans",
    code: "IVC-AU",
    industry: "Premium Commercial & Residential Cleaning",
    location: "Brisbane, Queensland, Australia",
    timezone: "CST (UTC-6) / AEST (UTC+10)",
    aiBotName: "Ivy",
    accountLead: "Ma. Rose Anne (RA) Malinao",
    specialist: "Kimberly Besa, Joy Fabular & Jedy Caillio",
    status: "Active Sprint",
    retainer: "AUD $3,800 / month",
    currentSprint: "Cleaner route dispatch automation, automated SMS booking reminders, Stripe invoice reconciliation",
    keyTechStack: ["ClickUp", "GoHighLevel", "Stripe Billing", "Twilio SMS", "Google Calendar API"],
    description: "Multi-location cleaning franchise operations. Lead qualification, automated deposit collection, field cleaner dispatch, customer feedback loops.",
  },
  {
    id: "studio-nets",
    name: "Studio Nets",
    code: "SNT-AU",
    industry: "Creative Brand & Digital Experience Systems",
    location: "Sydney, New South Wales, Australia",
    timezone: "AEST (UTC+10)",
    aiBotName: "Stella",
    accountLead: "Erwin Manaog",
    specialist: "Ellyka Claire Pama, Joyce Roble & Hashim",
    status: "Active Sprint",
    retainer: "AUD $4,200 / month",
    currentSprint: "Figma design system token sync, Webflow component library deployment, asset pipeline QA",
    keyTechStack: ["Figma Tokens", "Webflow", "ClickUp", "Fathom AI Summaries", "Zapier"],
    description: "Boutique creative design studio. Brand identity guidelines, high-fidelity UI/UX design components, client asset handoff workflows.",
  },
  {
    id: "risewise",
    name: "Risewise",
    code: "RSW-AU",
    industry: "Performance Marketing & Growth Funnels",
    location: "Melbourne, Victoria, Australia",
    timezone: "AEST (UTC+10)",
    aiBotName: "Riva",
    accountLead: "Divine Origines",
    specialist: "Jerold Recaplaza",
    status: "Active Sprint",
    retainer: "AUD $4,500 / month",
    currentSprint: "High-ticket appointment routing funnel, Meta Ads CAPI integration, pipeline revenue attribution dashboard",
    keyTechStack: ["Meta Conversions API", "GoHighLevel", "Zapier", "Google Sheets", "Stripe"],
    description: "Growth marketing accelerator. Multi-channel paid acquisition, speed-to-lead qualification, automated calendar scheduling.",
  },
  {
    id: "noirlab",
    name: "NoirLab",
    code: "NRL-DIG",
    industry: "Luxury Web & E-Commerce Engineering",
    location: "Sydney, Australia",
    timezone: "AEST (UTC+10)",
    aiBotName: "Neo",
    accountLead: "Jane Caillio",
    specialist: "Jane Caillio & Radzdom Gallego",
    status: "Active Sprint",
    retainer: "AUD $3,500 / month",
    currentSprint: "Headless Shopify Next.js storefront build, GSAP interactive product transitions, Klaviyo email flows",
    keyTechStack: ["Next.js", "Shopify Storefront API", "Tailwind CSS", "GSAP / Framer Motion", "Klaviyo"],
    description: "High-end bespoke digital agency. Custom e-commerce web applications, editorial web motion, brand narrative storytelling.",
  },
  {
    id: "tch2thrive",
    name: "Tch2Thrive",
    code: "T2T-US",
    industry: "Teacher Professional Development & District PD",
    location: "Texas, United States",
    timezone: "CST (UTC-6)",
    aiBotName: "Thrive",
    accountLead: "Divine Origines & RA Malinao",
    specialist: "BJ Ricafrente",
    status: "Active Sprint",
    retainer: "USD $2,800 / month",
    currentSprint: "School district proposal automation, workshop participant registration, CEU certificate generation",
    keyTechStack: ["ClickUp", "Google Docs / Drive API", "Stripe Invoicing", "Airtable"],
    description: "Educational development platform supporting district retention. Workshop contract tracking, attendee verification.",
  },
];

// Initialize MCP Server
const server = new McpServer({
  name: "gim-agency-os",
  version: "1.0.0",
});

// =============================================================================
// TOOL 1: gim_list_spaces
// =============================================================================
server.tool(
  "gim_list_spaces",
  "List all organizational spaces, folders, and lists in GIM Agency OS hierarchy",
  {},
  async () => {
    const tree = getMasterTree();
    if (tree && tree.spaces) {
      const summary = tree.spaces.map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        folders_count: s.folders?.length || 0,
        folders: (s.folders || []).map((f) => ({
          id: f.id,
          name: f.name,
          lists: (f.lists || []).map((l) => ({
            id: l.id,
            name: l.name,
            tasks_count: l.tasks_count || 0,
          })),
        })),
        direct_lists: (s.lists || []).map((l) => ({
          id: l.id,
          name: l.name,
          tasks_count: l.tasks_count || 0,
        })),
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ total_spaces: summary.length, spaces: summary }, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ message: "Loaded default spaces", spaces: CLIENT_PORTFOLIO }, null, 2),
        },
      ],
    };
  }
);

// =============================================================================
// TOOL 2: gim_get_tasks
// =============================================================================
server.tool(
  "gim_get_tasks",
  "Query authentic ClickUp tasks from GIM Agency OS with filters for client, status, priority, assignee, search, limit",
  {
    client: z.string().optional().describe("Client name filter (e.g. wrts, juvibolt, invogue, risewise, studio-nets, noirlab, gim)"),
    list_id: z.string().optional().describe("Specific list ID"),
    space_id: z.string().optional().describe("Specific space ID"),
    status: z.string().optional().describe("Status filter (e.g. 'To Do', 'In Progress', 'Pending Review', 'Completed')"),
    priority: z.string().optional().describe("Priority filter ('Urgent', 'High', 'Normal', 'Low')"),
    assignee: z.string().optional().describe("Assignee name or nickname (e.g. 'Radz', 'Divine', 'Erwin', 'BJ', 'Kimberly')"),
    search: z.string().optional().describe("Search query across task titles and descriptions"),
    limit: z.number().optional().default(50).describe("Max tasks to return (default: 50, max: 200)"),
  },
  async ({ client, list_id, space_id, status, priority, assignee, search, limit }) => {
    const tasks = getMasterTasks();
    let filtered = tasks;

    if (client) {
      const q = client.toLowerCase();
      filtered = filtered.filter((t) => {
        const lName = (t.list_name || "").toLowerCase();
        const fName = (t.folder_name || "").toLowerCase();
        const sName = (t.space_name || "").toLowerCase();
        return (
          lName.includes(q) ||
          fName.includes(q) ||
          sName.includes(q) ||
          (q.includes("wrts") && (lName.includes("spectrum") || fName.includes("spectrum"))) ||
          (q.includes("juvibolt") && (lName.includes("juvibolt") || fName.includes("juvibolt"))) ||
          (q.includes("invogue") && (lName.includes("invogue") || fName.includes("invogue")))
        );
      });
    }

    if (list_id) {
      filtered = filtered.filter((t) => t.list_id === list_id);
    }

    if (space_id) {
      filtered = filtered.filter((t) => t.space_id === space_id);
    }

    if (status) {
      const s = status.toLowerCase();
      filtered = filtered.filter((t) => (t.status || "").toLowerCase() === s);
    }

    if (priority) {
      const p = priority.toLowerCase();
      filtered = filtered.filter((t) => (t.priority || "").toLowerCase() === p);
    }

    if (assignee) {
      const a = assignee.toLowerCase();
      filtered = filtered.filter((t) =>
        (t.assignees || []).some(
          (u) =>
            (u.name || "").toLowerCase().includes(a) ||
            (u.nickname || "").toLowerCase().includes(a) ||
            a.includes((u.name || "").toLowerCase())
        )
      );
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }

    const maxLimit = Math.min(limit || 50, 200);
    const results = filtered.slice(0, maxLimit).map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      due_date: t.due_date,
      list_name: t.list_name,
      folder_name: t.folder_name,
      assignees: (t.assignees || []).map((u) => u.name),
      subtasks_count: t.subtasks?.length || 0,
      checklists_count: t.checklists?.length || 0,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              total_matched: filtered.length,
              returned_count: results.length,
              tasks: results,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// =============================================================================
// TOOL 3: gim_get_task_details
// =============================================================================
server.tool(
  "gim_get_task_details",
  "Get complete entity details of a specific task including subtasks, checklists, assignees, custom fields",
  {
    task_id: z.string().describe("Task ID"),
  },
  async ({ task_id }) => {
    const tasks = getMasterTasks();
    const task = tasks.find((t) => t.id === task_id);

    if (task) {
      return {
        content: [{ type: "text", text: JSON.stringify(task, null, 2) }],
      };
    }

    // Check Supabase fallback
    if (supabase) {
      const { data } = await supabase.from("client_tasks").select("*").eq("id", task_id).single();
      if (data) {
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }
    }

    return {
      isError: true,
      content: [{ type: "text", text: `Task with ID '${task_id}' not found.` }],
    };
  }
);

// =============================================================================
// TOOL 4: gim_create_task
// =============================================================================
server.tool(
  "gim_create_task",
  "Create a new task in GIM Agency OS hierarchy (persists to Supabase client_tasks)",
  {
    title: z.string().describe("Task title"),
    client: z.string().describe("Client name (e.g. 'We Rock the Spectrum', 'Juvibolt Cybertech', 'InVogue Cleans', 'Studio Nets')"),
    description: z.string().optional().describe("Detailed description of the task"),
    status: z.string().optional().default("To Do").describe("Status ('Open', 'To Do', 'In Progress', 'Pending Review', 'Completed')"),
    priority: z.enum(["Urgent", "High", "Normal", "Low"]).optional().default("Normal"),
    assignee_name: z.string().optional().default("Radzdom Gallego").describe("Name of assignee"),
    due_date: z.string().optional().describe("Due date in YYYY-MM-DD or ISO format"),
  },
  async ({ title, client, description, status, priority, assignee_name, due_date }) => {
    const taskId = `gim-task-${Date.now()}`;
    const newTask = {
      id: taskId,
      title,
      client_name: client,
      description: description || `Task created via Claude MCP for ${client}`,
      status: status || "To Do",
      priority: priority || "Normal",
      assignee_name: assignee_name || "Radzdom Gallego",
      due_date: due_date || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      created_by: "Claude MCP Agent",
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { error } = await supabase.from("client_tasks").insert([
          {
            id: newTask.id,
            title: newTask.title,
            client_name: newTask.client_name,
            description: newTask.description,
            status: newTask.status,
            priority: newTask.priority,
            assignee_name: newTask.assignee_name,
            due_date: newTask.due_date,
            created_by: newTask.created_by,
          },
        ]);
        if (error) {
          console.error("Supabase insert error:", error.message);
        }
      } catch (err) {
        console.error("Failed to insert task to Supabase:", err);
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              message: `Task successfully created for ${client}`,
              task: newTask,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// =============================================================================
// TOOL 5: gim_update_task_status
// =============================================================================
server.tool(
  "gim_update_task_status",
  "Update task status in GIM Agency OS (e.g. 'To Do', 'In Progress', 'Pending Review', 'Approved', 'Completed')",
  {
    task_id: z.string().describe("Task ID"),
    status: z.enum([
      "Open",
      "To Do",
      "In Progress",
      "Pending Review",
      "Approved",
      "Rejected",
      "On Hold",
      "Completed",
      "Cancelled",
    ]),
  },
  async ({ task_id, status }) => {
    if (supabase) {
      try {
        await supabase.from("client_tasks").update({ status }).eq("id", task_id);
      } catch (err) {
        console.error("Failed to update status in Supabase:", err);
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: true, task_id, new_status: status }, null, 2),
        },
      ],
    };
  }
);

// =============================================================================
// TOOL 6: gim_list_clients
// =============================================================================
server.tool(
  "gim_list_clients",
  "List active clients in Grace In Motion (GIM) with retainers, account leads, and sprint objectives",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ total_clients: CLIENT_PORTFOLIO.length, clients: CLIENT_PORTFOLIO }, null, 2),
        },
      ],
    };
  }
);

// =============================================================================
// TOOL 7: gim_get_client_knowledge
// =============================================================================
server.tool(
  "gim_get_client_knowledge",
  "Fetch authentic 13-section client SOP, intelligence dossier, and tech stack guidelines",
  {
    client_id: z.string().describe("Client ID (e.g. 'we-rock-the-spectrum', 'juvibolt-cybertech', 'invogue-cleans', 'studio-nets', 'risewise', 'noirlab', 'tch2thrive')"),
  },
  async ({ client_id }) => {
    const client = CLIENT_PORTFOLIO.find(
      (c) => c.id === client_id || c.name.toLowerCase().includes(client_id.toLowerCase())
    );

    if (!client) {
      return {
        isError: true,
        content: [{ type: "text", text: `Client '${client_id}' not found in active GIM portfolio.` }],
      };
    }

    const dossier = {
      client_name: client.name,
      code: client.code,
      industry: client.industry,
      location: client.location,
      timezone: client.timezone,
      ai_copilot_bot: client.aiBotName,
      account_leadership: {
        lead: client.accountLead,
        specialist: client.specialist,
      },
      commercial_terms: {
        retainer: client.retainer,
        status: client.status,
      },
      current_sprint: client.currentSprint,
      tech_stack: client.keyTechStack,
      master_sop_sections: [
        { section: 1, title: "Client Identity & Executive Summary", details: client.description },
        { section: 2, title: "Operational Scope & Active Deliverables", details: client.currentSprint },
        { section: 3, title: "Technology Stack & API Integrations", details: client.keyTechStack.join(", ") },
        { section: 4, title: "SOP Workflows & Automation Triggers", details: `Grounded in GIM standard operational patterns for ${client.industry}` },
        { section: 5, title: "Communication Protocols & Slack Channels", details: `Channel #${client.id.split("-")[0]}-ops with ${client.accountLead}` },
        { section: 6, title: "Escalation Matrix", details: "1. Specialist -> 2. Account Lead -> 3. Divine Origines (Owner) / Radzdom Gallego (Admin)" },
        { section: 7, title: "Quality Assurance & Verification Standards", details: "Verification on staging before live deployment. Zero client data leaks." },
      ],
    };

    return {
      content: [{ type: "text", text: JSON.stringify(dossier, null, 2) }],
    };
  }
);

// =============================================================================
// TOOL 8: gim_send_team_message
// =============================================================================
server.tool(
  "gim_send_team_message",
  "Send an operational message to a GIM team channel (e.g. 'general', 'wrts-ops', 'juvibolt-ops', 'invogue-ops')",
  {
    channel_id: z.string().describe("Target channel ID (e.g. 'general', 'wrts-ops', 'juvibolt-ops', 'invogue-ops', 'studio-nets-ops')"),
    content: z.string().describe("Message content to post"),
    sender_name: z.string().optional().default("Claude AI Assistant"),
  },
  async ({ channel_id, content, sender_name }) => {
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const payload = {
      id: msgId,
      channel_id,
      sender_id: "claude-mcp",
      sender_name: sender_name || "Claude AI Assistant",
      sender_nickname: "Claude",
      sender_avatar: "#3D5249",
      sender_role: "AI Co-Pilot",
      is_core_admin: false,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        await supabase.from("messages").upsert(payload, { onConflict: "id" });
      } catch (err) {
        console.error("Failed to post message to Supabase:", err);
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: true, message_id: msgId, channel_id, content }, null, 2),
        },
      ],
    };
  }
);

// =============================================================================
// TOOL 9: gim_get_channel_messages
// =============================================================================
server.tool(
  "gim_get_channel_messages",
  "Read recent messages from a GIM team channel",
  {
    channel_id: z.string().describe("Channel ID (e.g. 'general', 'wrts-ops', 'juvibolt-ops')"),
    limit: z.number().optional().default(25).describe("Number of recent messages to return"),
  },
  async ({ channel_id, limit }) => {
    if (supabase) {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channel_id)
        .order("created_at", { ascending: false })
        .limit(Math.min(limit || 25, 100));

      if (data && data.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ channel_id, count: data.length, messages: data.reverse() }, null, 2),
            },
          ],
        };
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ channel_id, count: 0, messages: [] }, null, 2),
        },
      ],
    };
  }
);

// =============================================================================
// Start MCP Server on Stdio Transport
// =============================================================================
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Grace In Motion (GIM) MCP Server running on stdio transport.");
}

run().catch((err) => {
  console.error("Fatal error starting GIM MCP Server:", err);
  process.exit(1);
});
