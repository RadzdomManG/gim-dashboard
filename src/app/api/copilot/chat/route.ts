import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TaskItem {
  id: string;
  name: string;
  client: string;
  status: string;
  priority?: string;
  due_date?: string | null;
  assignees?: { username: string; email?: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, user, tasks = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const userRole = user?.role || "Team Member";
    const userName = user?.name || "Team Member";
    const userNick = user?.nickname || userName.split(" ")[0] || "Member";
    const isCoreAdmin = user?.isCoreAdmin || userRole === "Owner" || userRole === "Admin";
    const clientScope: string = user?.clientScope || "all";
    const assignedClients: string[] = user?.assigned_clients || (clientScope === "all" ? ["All Accounts"] : clientScope.split(",").map((s: string) => s.trim()));

    const cleanMsg = message.trim().toLowerCase();

    // 1. STRICT CLIENT ISOLATION CHECK
    // If a non-admin user asks about a client outside their assigned scope, reject with security boundary notice!
    const clientKeywords: Record<string, string> = {
      "little treasure": "Little Treasures Company",
      "spectrum": "We Rock the Spectrum (WRTS)",
      "wrts": "We Rock the Spectrum (WRTS)",
      "juvibolt": "Juvibolt Cybertech",
      "risewise": "Risewise",
      "noirlab": "NoirLab",
      "studio nets": "Studio Nets",
      "invogue": "InVogue Cleans",
      "tch2thrive": "Tch2Thrive",
    };

    if (!isCoreAdmin) {
      for (const [kw, cName] of Object.entries(clientKeywords)) {
        if (cleanMsg.includes(kw)) {
          const hasAccess = assignedClients.some(
            (ac) => ac.toLowerCase().includes(kw) || cName.toLowerCase().includes(ac.toLowerCase())
          );
          if (!hasAccess) {
            return NextResponse.json({
              reply: `🔒 **Security Boundary Notice:** You are currently logged in as **${userName}** with access restricted to **${assignedClients.join(", ")}**. Information regarding **${cName}** is protected by Grace in Motion's strict multi-tenant isolation policy. Let's focus on your authorized account objectives!`,
              suggestedActions: [
                `Show my ${assignedClients[0]} deliverables`,
                "Draft an End of Shift (EOS) note",
                "View communication channels SOP",
              ],
            });
          }
        }
      }
    }

    // 2. FILTER USER'S ACCESSIBLE TASKS
    const accessibleTasks: TaskItem[] = tasks.filter((t: TaskItem) => {
      if (isCoreAdmin) return true;
      const tClient = (t.client || "").toLowerCase();
      const clientAllowed = assignedClients.some((ac) => {
        const sc = ac.toLowerCase();
        return tClient.includes(sc) || sc.includes(tClient);
      });
      const isAssigned = (t.assignees || []).some((a) => {
        const u = (a.username || "").toLowerCase();
        return (
          u.includes(userNick.toLowerCase()) ||
          userNick.toLowerCase().includes(u) ||
          (user.email && (a.email || "").toLowerCase() === user.email.toLowerCase())
        );
      });
      return clientAllowed || isAssigned;
    });

    const myAssignedTasks = accessibleTasks.filter((t: TaskItem) => {
      return (t.assignees || []).some((a) => {
        const u = (a.username || "").toLowerCase();
        return (
          u.includes(userNick.toLowerCase()) ||
          userNick.toLowerCase().includes(u) ||
          (user.email && (a.email || "").toLowerCase() === user.email.toLowerCase())
        );
      });
    });

    // 3. TASK STATUS UPDATE ACTION COMMAND (e.g. "move task #123 to in progress", "mark task ... done")
    const moveMatch = cleanMsg.match(/(?:move|change|set|mark)\s+(?:task\s+)?#?([a-zA-Z0-9_-]+)\s+(?:to\s+|as\s+)?(in progress|review|for review|done|closed|approved|to do)/i);
    if (moveMatch) {
      const targetTaskId = moveMatch[1];
      const targetStatusRaw = moveMatch[2].toLowerCase();
      let newStatus = "In Progress";
      if (targetStatusRaw.includes("progress")) newStatus = "In Progress";
      else if (targetStatusRaw.includes("review")) newStatus = "In Review";
      else if (targetStatusRaw.includes("done") || targetStatusRaw.includes("closed") || targetStatusRaw.includes("approved")) newStatus = "Closed";
      else if (targetStatusRaw.includes("to do") || targetStatusRaw.includes("open")) newStatus = "To Do";

      return NextResponse.json({
        reply: `✅ I have processed your request to update task **#${targetTaskId}** to **${newStatus}**. You can confirm the update with the action button below:`,
        action: {
          type: "UPDATE_TASK_STATUS",
          taskId: targetTaskId,
          status: newStatus,
        },
        suggestedActions: [
          "Show all my active tasks",
          "Check today's shift log",
          "Draft End of Shift note",
        ],
      });
    }

    // 4. COMMON INTELLIGENT QUERIES:
    // A. "Tasks" / "What are my deliverables"
    if (cleanMsg.includes("task") || cleanMsg.includes("deliverable") || cleanMsg.includes("assigned to me") || cleanMsg.includes("to do")) {
      const listToShow = myAssignedTasks.length > 0 ? myAssignedTasks : accessibleTasks.slice(0, 5);
      if (listToShow.length === 0) {
        return NextResponse.json({
          reply: `Hello **${userNick}**! You currently have **0 pending tasks** under your authorized scope (**${assignedClients.join(", ")}**). Everything is up to date! Would you like to review client sprint goals or draft an End of Shift (EOS) report?`,
          suggestedActions: [
            "View client sprint milestones",
            "Draft End of Shift (EOS) note",
            "Review SOP guidelines",
          ],
        });
      }

      const taskLines = listToShow.slice(0, 6).map((t, i) => {
        return `${i + 1}. **[${t.status.toUpperCase()}]** ${t.name} (Client: *${t.client}*) — Task ID: \`#${t.id}\``;
      }).join("\n");

      return NextResponse.json({
        reply: `Here are the active deliverables under your scope (**${assignedClients.join(", ")}**):\n\n${taskLines}\n\n💡 *Tip: You can tell me to "Move task #[ID] to In Progress" or "Mark task #[ID] as Review" anytime!*`,
        suggestedActions: [
          `Mark task #${listToShow[0]?.id} as In Progress`,
          "Draft End of Shift note for today",
          "What are the client milestones?",
        ],
      });
    }

    // B. "End of Shift" / "EOS" / "Shift Note"
    if (cleanMsg.includes("eos") || cleanMsg.includes("end of shift") || cleanMsg.includes("shift note") || cleanMsg.includes("clock out")) {
      const tasksSummary = myAssignedTasks.slice(0, 3).map((t) => t.name).join(", ") || "Client sprint deliverable reviews";
      return NextResponse.json({
        reply: `Here is a tailored **End of Shift (EOS) Note** draft for your shift today, **${userNick}**:\n\n---\n**GIM END OF SHIFT REPORT — ${new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}**\n- **Specialist:** ${userName} (${userRole})\n- **Client Accounts:** ${assignedClients.join(", ")}\n- **Shift Status:** Complete\n\n**1. Completed Deliverables Today:**\n- ${tasksSummary}\n- Daily & hourly communication channel checks conducted across designated channels\n\n**2. Blockers Encountered:**\n- None. All workflows and client assets proceeding on schedule.\n\n**3. Priorities for Next Shift:**\n- Advance pending QA approvals and coordinate with account leads.\n---\n\nYou can copy this note and submit it directly to your attendance timesheet before clocking out!`,
        suggestedActions: [
          "Copy EOS note to clipboard",
          "Check timesheet hours",
          "Show communication channels SOP",
        ],
      });
    }

    // C. "SOP" / "Communication" / "Report" / "Policy"
    if (cleanMsg.includes("sop") || cleanMsg.includes("communication") || cleanMsg.includes("channel") || cleanMsg.includes("hourly") || cleanMsg.includes("rule")) {
      return NextResponse.json({
        reply: `📘 **GIM Operational SOP Reference:**\n\n1. **Daily & Hourly Communication Channels Check (7 AM – 8 PM):**\n   - Check client channels at the top of every operating hour.\n   - Urgent messages must be acknowledged within 15 minutes.\n   - Always post in designated channels (e.g. \`#little-treasures-ops\`, \`#wrts-automations\`). Never send client assets via direct unlogged channels.\n\n2. **Shift Integrity:**\n   - Clock in at start of shift; toggle to **On Break** when away.\n   - Mandatory EOS note submitted before clocking out.\n\n3. **Client Isolation:**\n   - Strictly 0 cross-client drift. Assets for one client never enter another client's workspace.`,
        suggestedActions: [
          "What are the weekly KPI scorecards?",
          "How do we handle new client onboarding?",
          "Show my active deliverables",
        ],
      });
    }

    // D. "Client Milestones" / "Sprint Targets"
    if (cleanMsg.includes("milestone") || cleanMsg.includes("goal") || cleanMsg.includes("sprint") || cleanMsg.includes("summit") || cleanMsg.includes("launch")) {
      const milestones: string[] = [];
      const scopeStr = assignedClients.join(" ").toLowerCase();

      if (isCoreAdmin || scopeStr.includes("little treasure")) {
        milestones.push("• **Little Treasures Company:** Fri 11 Dec 2026 Global Autism Summit Ticket Funnel Launch, $99 Course Build & GHL Payment Automation.");
      }
      if (isCoreAdmin || scopeStr.includes("spectrum") || scopeStr.includes("wrts")) {
        milestones.push("• **We Rock the Spectrum:** 21 n8n automation workflows, franchise webhook triggers, and Leadly error handling.");
      }
      if (isCoreAdmin || scopeStr.includes("juvibolt")) {
        milestones.push("• **Juvibolt Cybertech:** Sub-Account `mg57RFEKUm6nvnSadv2D` setup, WordPress LMS integration, and WooCommerce student enrollments.");
      }
      if (isCoreAdmin || scopeStr.includes("risewise")) {
        milestones.push("• **Risewise:** Multi-channel appointment routing, executive pipeline tracking, and funnel automation.");
      }
      if (isCoreAdmin || scopeStr.includes("studio net")) {
        milestones.push("• **Studio Nets:** Figma component reviews, creative ingestion forms, and 48-hour wireframe pipeline.");
      }
      if (isCoreAdmin || scopeStr.includes("invogue")) {
        milestones.push("• **InVogue Cleans:** 30-60-90 Day Retention Funnel, cleaner SMS alerts, and weekly subcontractor billing audits.");
      }

      return NextResponse.json({
        reply: `🎯 **Q4 Active Client Milestones (Your Scope: ${assignedClients.join(", ")}):**\n\n${milestones.join("\n\n")}\n\nOur team delivery SLA requires zero missed deadlines across all active sprints!`,
        suggestedActions: [
          "Show deliverables for these milestones",
          "Draft End of Shift (EOS) note",
          "Review communication SOP",
        ],
      });
    }

    // E. General contextual inquiry / AI Assistance
    const availableActions = [
      `Show my deliverables`,
      "Draft an End of Shift (EOS) note",
      "Explain communication SOP",
      "Check client milestones",
    ];

    return NextResponse.json({
      reply: `Hello **${userNick}**! I am your dedicated **GIM AI Co-Pilot** operating under your authentic security profile:\n\n- **Role:** ${userRole}\n- **Authorized Scope:** ${assignedClients.join(", ")}\n- **Security Isolation:** Strict Multi-Tenant Isolation Active\n\nHow can I help you today? You can ask me to inspect your tasks, update a task status, draft an EOS note, or check agency SOPs!`,
      suggestedActions: availableActions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
