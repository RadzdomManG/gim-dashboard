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
    const assignedClients: string[] =
      user?.assigned_clients ||
      (clientScope === "all"
        ? ["All Accounts"]
        : clientScope.split(",").map((s: string) => s.trim()));

    const cleanMsg = message.trim().toLowerCase();

    // =========================================================================
    // GUARDRAIL 1: STRICT OFF-TOPIC & GENERAL QUERY SHIELD
    // If user asks general non-agency questions (weather, prompt leak, jokes, trivia, etc.)
    // Politely avoid answering and redirect back to GIM agency deliverables.
    // =========================================================================
    const offTopicKeywords = [
      "weather",
      "temperature",
      "forecast",
      "rain",
      "what is your prompt",
      "whats your prompt",
      "system prompt",
      "reveal prompt",
      "tell me your instructions",
      "ignore previous instructions",
      "who made you",
      "tell me a joke",
      "write a poem",
      "sing a song",
      "recipe",
      "bitcoin",
      "crypto",
      "who won the",
      "movie recommendation",
      "politics",
      "president",
      "how are babies made",
      "play a game",
    ];

    const isOffTopic = offTopicKeywords.some((kw) => cleanMsg.includes(kw));
    if (isOffTopic) {
      return NextResponse.json({
        reply: `Hey ${userNick}! 😊 I'm your dedicated GIM Co-Pilot, so I'm set up strictly to help you with our agency work, client deliverables, and shift reports. 

I avoid answering general or off-topic questions like that, but I'm ready to help with your tasks, client sprint targets, or daily EOS note! What are we working on right now? 💼✨`,
        suggestedActions: [
          "Show my active deliverables 📋",
          "Draft today's EOS note 📝",
          "Check client sprint goals 🎯",
        ],
      });
    }

    // =========================================================================
    // GUARDRAIL 2: STRICT MULTI-TENANT CLIENT ISOLATION
    // Non-admin specialists asking about unassigned clients are blocked.
    // =========================================================================
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
              reply: `🔒 Hey ${userNick}! Just a quick heads-up: your account is scoped strictly to **${assignedClients.join(", ")}**. Information regarding **${cName}** is protected by GIM's client privacy rules. 

Let's stick to your assigned client goals — how can I help with **${assignedClients[0]}** today? 🚀`,
              suggestedActions: [
                `Show my ${assignedClients[0]} deliverables 📋`,
                "Draft an End of Shift (EOS) note 📝",
                "View communication channels SOP 📘",
              ],
            });
          }
        }
      }
    }

    // =========================================================================
    // 3. FILTER ACCESSIBLE TASKS FOR THIS USER
    // =========================================================================
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

    // =========================================================================
    // SKILL-MATCHED AI COMPANION PERSONA ENGINE
    // Tailored to each specialist's verified operational role & superpowers
    // =========================================================================
    const getSkillGreeting = (nickname: string, role: string) => {
      const nick = nickname.toLowerCase();
      if (nick.includes("camille")) {
        return {
          greeting: `Hey Camille! 📱 Ready to crush our social content today! We've got scheduled broadcasts and campaigns across WRTS, Juvibolt, and Studio Nets. 

Want me to draft viral TikTok hooks, adapt a LinkedIn carousel, or check pending audience comments? 🚀✨`,
          actions: [
            "Generate AI copy for TikTok 📱",
            "Review scheduled social posts 📅",
            "Draft today's EOS note 📝",
          ],
        };
      }
      if (nick.includes("erwin")) {
        return {
          greeting: `Hey Erwin! 🛡️ Ready for sprint verification and release gating. How are the G5/G7 quality checks looking across our active sprints? 

Let me know what tickets need inspection or approval today! 🎯`,
          actions: [
            "Review open QA deliverables 📋",
            "Check sprint burndown 🎯",
            "Draft today's EOS note 📝",
          ],
        };
      }
      if (nick.includes("bj") || nick.includes("hashim")) {
        return {
          greeting: `Hey ${userNick}! ⚡ Ready to inspect webhooks, n8n automations, or GHL API integrations. What are we building or debugging today? 💻`,
          actions: [
            "Check automation tasks ⚡",
            "Inspect webhook pipeline 📋",
            "Draft today's EOS note 📝",
          ],
        };
      }
      if (nick.includes("jerold") || nick.includes("jane")) {
        return {
          greeting: `Hey ${userNick}! 🚀 Ready to drive conversions on our landing pages and email sequences. What client funnels are we optimizing today? 📈`,
          actions: [
            "Review CRO & funnel deliverables 📋",
            "Check client conversion goals 🎯",
            "Draft today's EOS note 📝",
          ],
        };
      }
      if (nick.includes("jedy") || nick.includes("joy") || nick.includes("ellyka")) {
        return {
          greeting: `Hey ${userNick}! 💼 Ready to keep our client communications, hourly sweeps, and team deliverables running smoothly! How can I support your shift? ✨`,
          actions: [
            "Review hourly comms check SOP 📘",
            "Show my assigned tasks 📋",
            "Draft today's EOS note 📝",
          ],
        };
      }
      if (nick.includes("radz")) {
        return {
          greeting: `Hey Radz! 👑 Agency systems are live and all client sprint pipelines are humming. What do you want to inspect, advance, or approve? 🚀`,
          actions: [
            "What are my active deliverables? 📋",
            "Check active client sprints 🎯",
            "Draft End of Shift note 📝",
          ],
        };
      }
      return {
        greeting: `Hey ${userNick}! 👋 Ready to help you knock out today's deliverables, update tasks, or prep your EOS report. What are we tackling first? 🚀✨`,
        actions: [
          "What are my active deliverables? 📋",
          "Draft today's EOS note 📝",
          "Check client sprint goals 🎯",
        ],
      };
    };

    // =========================================================================
    // 4. NATURAL HUMAN GREETINGS ("hi", "hello", "hey", "good morning", "yo")
    // =========================================================================
    const greetingWords = [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "yo",
      "sup",
      "kumusta",
      "howdy",
    ];
    const isPureGreeting = greetingWords.some(
      (g) => cleanMsg === g || cleanMsg === `${g}!` || cleanMsg.startsWith(`${g} `)
    );

    if (isPureGreeting) {
      const skillPersona = getSkillGreeting(userNick, userRole);
      return NextResponse.json({
        reply: skillPersona.greeting,
        suggestedActions: skillPersona.actions,
      });
    }

    // =========================================================================
    // 5. NATURAL TASK MOVE ACTION (e.g. "move task #123 to in progress")
    // =========================================================================
    const moveMatch = cleanMsg.match(
      /(?:move|change|set|mark)\s+(?:task\s+)?#?([a-zA-Z0-9_-]+)\s+(?:to\s+|as\s+)?(in progress|review|for review|done|closed|approved|to do)/i
    );
    if (moveMatch) {
      const targetTaskId = moveMatch[1];
      const targetStatusRaw = moveMatch[2].toLowerCase();
      let newStatus = "In Progress";
      if (targetStatusRaw.includes("progress")) newStatus = "In Progress";
      else if (targetStatusRaw.includes("review")) newStatus = "In Review";
      else if (
        targetStatusRaw.includes("done") ||
        targetStatusRaw.includes("closed") ||
        targetStatusRaw.includes("approved")
      )
        newStatus = "Closed";
      else if (targetStatusRaw.includes("to do") || targetStatusRaw.includes("open")) newStatus = "To Do";

      return NextResponse.json({
        reply: `All set! 👍 I can update task **#${targetTaskId}** to **${newStatus}**. Click the confirmation button below to apply it:`,
        action: {
          type: "UPDATE_TASK_STATUS",
          taskId: targetTaskId,
          status: newStatus,
        },
        suggestedActions: [
          "Show all my active tasks 📋",
          "Draft End of Shift note 📝",
          "Check sprint goals 🎯",
        ],
      });
    }

    // =========================================================================
    // 6. TASKS / DELIVERABLES INQUIRY
    // =========================================================================
    if (
      cleanMsg.includes("task") ||
      cleanMsg.includes("deliverable") ||
      cleanMsg.includes("assigned to me") ||
      cleanMsg.includes("to do") ||
      cleanMsg.includes("what should i work on")
    ) {
      const listToShow = myAssignedTasks.length > 0 ? myAssignedTasks : accessibleTasks.slice(0, 5);
      if (listToShow.length === 0) {
        return NextResponse.json({
          reply: `Great news, ${userNick}! 🎉 You have **0 pending tasks** under your scope (**${assignedClients.join(", ")}**). Everything is up to date! 

Would you like to review client sprint goals or draft your daily End of Shift (EOS) note?`,
          suggestedActions: [
            "View client sprint milestones 🎯",
            "Draft End of Shift (EOS) note 📝",
            "Review SOP guidelines 📘",
          ],
        });
      }

      const taskLines = listToShow
        .slice(0, 6)
        .map((t, i) => {
          return `${i + 1}. **[${t.status.toUpperCase()}]** ${t.name} (Client: *${t.client}*) — \`#${t.id}\``;
        })
        .join("\n");

      return NextResponse.json({
        reply: `Here are your active deliverables, ${userNick}! 📋 Let's get these knocked out:

${taskLines}

💡 *Quick tip: You can say 'Move task #[ID] to In Progress' or 'Mark task #[ID] as Done' anytime!* 🚀`,
        suggestedActions: [
          `Mark task #${listToShow[0]?.id} as In Progress`,
          "Draft End of Shift note for today 📝",
          "What are the client milestones? 🎯",
        ],
      });
    }

    // =========================================================================
    // 7. END OF SHIFT (EOS) NOTE GENERATOR
    // =========================================================================
    if (
      cleanMsg.includes("eos") ||
      cleanMsg.includes("end of shift") ||
      cleanMsg.includes("shift note") ||
      cleanMsg.includes("clock out") ||
      cleanMsg.includes("done for today")
    ) {
      const tasksSummary =
        myAssignedTasks
          .slice(0, 3)
          .map((t) => `• ${t.name} (${t.client}) — Status: ${t.status}`)
          .join("\n") || "• Reviewed sprint deliverables and synchronized asset updates";

      const todayFormatted = new Date().toLocaleDateString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return NextResponse.json({
        reply: `Here is your **End of Shift (EOS) Note** ready to copy, ${userNick}! 📝✨

---
**GIM END OF SHIFT REPORT — ${todayFormatted}**
• **Specialist:** ${userName} (${userRole})
• **Client Scope:** ${assignedClients.join(", ")}
• **Shift Status:** Complete ✅

**1. Accomplished Deliverables Today:**
${tasksSummary}
• Monitored assigned communication channels at the top of each operating hour

**2. Blockers / Impediments:**
• None — all workflows and deliverables moving smoothly on schedule

**3. Focus for Next Shift:**
• Continue advancing sprint targets and coordinate with account leads
---

You can copy this directly and attach it to your timesheet before clocking out! Great work today! 🎉👏`,
        suggestedActions: [
          "Copy EOS note to clipboard 📋",
          "Check timesheet hours ⏱️",
          "Show communication channels SOP 📘",
        ],
      });
    }

    // =========================================================================
    // 8. SOP & CHANNEL OPERATING RULES
    // =========================================================================
    if (
      cleanMsg.includes("sop") ||
      cleanMsg.includes("communication") ||
      cleanMsg.includes("channel") ||
      cleanMsg.includes("hourly") ||
      cleanMsg.includes("rule") ||
      cleanMsg.includes("policy")
    ) {
      return NextResponse.json({
        reply: `Here are our key GIM Agency SOPs, ${userNick}! 📘✨

1. **Hourly Channel Checks (7 AM – 8 PM):** 💬
   • Check client channels at the top of every operating hour.
   • Acknowledge urgent client inquiries within 15 minutes.
   • Always communicate in official client channels (e.g. \`#little-treasures-ops\`, \`#wrts-automations\`). Never send client assets via direct unlogged DMs.

2. **Shift Logging:** ⏱️
   • Clock in when your shift starts; switch to 'On Break' when away.
   • Submit your EOS note before clocking out.

3. **Client Isolation:** 🛡️
   • Zero cross-client mixing. Assets and tasks for one client never enter another client's workspace.

Let me know if you need clarification on anything! 😊`,
        suggestedActions: [
          "What are the client milestones? 🎯",
          "Show my active deliverables 📋",
          "Draft End of Shift note 📝",
        ],
      });
    }

    // =========================================================================
    // 9. CLIENT MILESTONES & SPRINT TARGETS
    // =========================================================================
    if (
      cleanMsg.includes("milestone") ||
      cleanMsg.includes("goal") ||
      cleanMsg.includes("sprint") ||
      cleanMsg.includes("summit") ||
      cleanMsg.includes("launch")
    ) {
      const milestones: string[] = [];
      const scopeStr = assignedClients.join(" ").toLowerCase();

      if (isCoreAdmin || scopeStr.includes("spectrum") || scopeStr.includes("wrts")) {
        milestones.push(
          "• **We Rock the Spectrum (WRTS):** 21 n8n automation workflows, franchise webhook triggers, and Leadly error handling."
        );
      }
      if (isCoreAdmin || scopeStr.includes("juvibolt")) {
        milestones.push(
          "• **Juvibolt Cybertech:** Sub-Account `mg57RFEKUm6nvnSadv2D` setup, WordPress LMS integration, and WooCommerce student enrollments."
        );
      }
      if (isCoreAdmin || scopeStr.includes("risewise")) {
        milestones.push(
          "• **Risewise:** Multi-channel appointment routing, executive pipeline tracking, and funnel automation."
        );
      }
      if (isCoreAdmin || scopeStr.includes("studio net")) {
        milestones.push(
          "• **Studio Nets:** Figma component reviews, creative ingestion forms, and 48-hour wireframe pipeline."
        );
      }
      if (isCoreAdmin || scopeStr.includes("invogue")) {
        milestones.push(
          "• **InVogue Cleans:** 30-60-90 Day Retention Funnel, cleaner SMS alerts, and weekly subcontractor billing audits."
        );
      }
      if (isCoreAdmin || scopeStr.includes("noirlab")) {
        milestones.push(
          "• **NoirLab:** Weekly plan to Malik, order board monitoring, and production QA stabilization."
        );
      }

      return NextResponse.json({
        reply: `Here are our active client sprint targets, ${userNick}! 🎯🚀

${milestones.join("\n\n")}

Our delivery SLA target is 100% on-time sprint completions. Want me to pull up your specific deliverables for any of these? 💼`,
        suggestedActions: [
          "Show my active deliverables 📋",
          "Draft End of Shift note 📝",
          "Review communication SOP 📘",
        ],
      });
    }

    // =========================================================================
    // 10. DEFAULT SKILL-MATCHED RESPONSE
    // =========================================================================
    const defaultPersona = getSkillGreeting(userNick, userRole);
    return NextResponse.json({
      reply: defaultPersona.greeting,
      suggestedActions: defaultPersona.actions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
