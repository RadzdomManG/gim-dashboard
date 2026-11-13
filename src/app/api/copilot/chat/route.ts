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
        reply: `Hey ${userNick}! 😊 I'm your dedicated GIM Co-Pilot, configured strictly to help you with our agency deliverables, client sprints, task execution, and shift reports. 

I don't answer general non-work questions, but I'm ready to help you plan your deliverables, schedule social campaigns, or update tasks! What are we focusing on? 💼✨`,
        suggestedActions: [
          "Show my active deliverables 📋",
          "Draft today's EOS note 📝",
          "Check client sprint goals 🎯",
        ],
      });
    }

    // =========================================================================
    // GUARDRAIL 2: STRICT MULTI-TENANT CLIENT ISOLATION
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
              reply: `🔒 Hey ${userNick}! Your account is scoped strictly to **${assignedClients.join(", ")}**. Information regarding **${cName}** is air-gapped under GIM's client confidentiality policies. 

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
    // FILTER ACCESSIBLE TASKS FOR THIS USER
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
          (user?.email && (a.email || "").toLowerCase() === user.email.toLowerCase())
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
          (user?.email && (a.email || "").toLowerCase() === user.email.toLowerCase())
        );
      });
    });

    // =========================================================================
    // 3. ACTION DISPATCHER A: TASK MOVE + STEP-BY-STEP ROADMAP (OPTION B: CONFIRMATION FIRST)
    // E.g. "can you put my task in progress and tell me step by step what to do"
    // E.g. "move task #123 to in progress"
    // =========================================================================
    const isPutInProgress =
      cleanMsg.includes("in progress") ||
      cleanMsg.includes("start task") ||
      cleanMsg.includes("step by step") ||
      cleanMsg.includes("put my task") ||
      cleanMsg.includes("move task") ||
      cleanMsg.includes("mark task");

    if (isPutInProgress) {
      // Find matching task: either by explicit ID or first active assigned task
      const idMatch = cleanMsg.match(/#?([a-zA-Z0-9_-]{4,})/);
      let targetTask = idMatch
        ? accessibleTasks.find((t) => t.id.toLowerCase().includes(idMatch[1].toLowerCase()))
        : myAssignedTasks.find((t) => t.status !== "In Progress" && t.status !== "Closed") ||
          accessibleTasks[0];

      if (!targetTask && accessibleTasks.length > 0) {
        targetTask = accessibleTasks[0];
      }

      if (targetTask) {
        let targetStatus = "In Progress";
        if (cleanMsg.includes("done") || cleanMsg.includes("close") || cleanMsg.includes("complete")) {
          targetStatus = "Closed";
        } else if (cleanMsg.includes("review")) {
          targetStatus = "In Review";
        }

        const taskTitle = targetTask.name || "Assigned Deliverable";
        const taskClient = targetTask.client || assignedClients[0] || "GIM";

        return NextResponse.json({
          reply: `I've prepared the plan for **${taskTitle}** (Client: *${taskClient}*). 🎯

Here is your **Step-by-Step Execution Plan**:
1. 🔍 **Audit Requirements & Assets:** Inspect the task description and verify all required Figma links, copy docs, or GDrive assets.
2. ⚙️ **Execute Deliverable:** Implement the necessary changes in GHL, ClickUp, or the design canvas according to the client SOP.
3. 🛡️ **G5 Internal Verification:** Conduct self-QA and verify mobile responsiveness or webhook delivery before asking for review.
4. 📝 **Record Shift Footprint:** Post an operational comment in the task modal and log your work time.

Click the button below to confirm and move this task to **${targetStatus}**:`,
          action: {
            type: "CONFIRM_TASK_MOVE",
            taskId: targetTask.id,
            taskTitle: taskTitle,
            client: taskClient,
            status: targetStatus,
          },
          suggestedActions: [
            `Confirm: Move to ${targetStatus} 🚀`,
            "Show my remaining tasks 📋",
            "Draft End of Shift note 📝",
          ],
        });
      }
    }

    // =========================================================================
    // 4. ACTION DISPATCHER B: SOCIAL MEDIA SCHEDULE FROM GDRIVE/CANVA/CAPTION
    // E.g. "hey can you help me schedule for this client, for this social media. here's the link of the post, and the caption etc."
    // =========================================================================
    const hasSocialIntent =
      cleanMsg.includes("schedule") ||
      cleanMsg.includes("social media") ||
      cleanMsg.includes("gdrive") ||
      cleanMsg.includes("drive.google.com") ||
      cleanMsg.includes("canva.com") ||
      cleanMsg.includes("post this") ||
      cleanMsg.includes("caption");

    if (hasSocialIntent) {
      // Extract links
      const urlMatch = message.match(/(https?:\/\/[^\s]+)/gi);
      const cloudLink = urlMatch ? urlMatch[0] : "";

      // Detect client
      let targetClient = assignedClients[0] || "We Rock the Spectrum (WRTS)";
      for (const [kw, cName] of Object.entries(clientKeywords)) {
        if (cleanMsg.includes(kw)) {
          targetClient = cName;
          break;
        }
      }

      // Generate 4-platform variations
      const platformVariations = [
        {
          platform: "facebook",
          platformName: "Facebook Community",
          badgeBg: "bg-blue-100 text-blue-800",
          copy: `🌟 Big updates from ${targetClient}! We're thrilled to share our latest milestone with our incredible community. Check out the link below and drop your thoughts in the comments! 👇✨\n\n${cloudLink || "https://graceinmotion.agency"} #Community #Growth`,
        },
        {
          platform: "tiktok",
          platformName: "TikTok Creator",
          badgeBg: "bg-zinc-100 text-zinc-900",
          copy: `🔥 Stop scrolling! Here's what goes down behind the scenes at ${targetClient} today. Watch till the end for the reveal! 👀🚀\n\nSound: Trending Lo-Fi Beats | #Viral #BTS #Growth`,
        },
        {
          platform: "linkedin",
          platformName: "LinkedIn Professional",
          badgeBg: "bg-sky-100 text-sky-800",
          copy: `🚀 Operational Excellence at ${targetClient}:\n\nHow our team builds scalable delivery frameworks and drives measurable impact. Key takeaways:\n• Streamlined workflow execution\n• High-velocity feedback loops\n• Real-time client transparency\n\nFull assets: ${cloudLink || "[Attached]"}\n\n#Leadership #Operations #Scale`,
        },
        {
          platform: "youtube",
          platformName: "YouTube Shorts / Channel",
          badgeBg: "bg-red-100 text-red-800",
          copy: `🎬 ${targetClient} Official Release: Behind the Scenes & Strategic Milestones.\n\nSubscribe for more weekly walkthroughs! Link to resources: ${cloudLink || "https://graceinmotion.agency"} #Shorts #Tech #Agency`,
        },
      ];

      return NextResponse.json({
        reply: `I've planned your social media campaign for **${targetClient}**! 📱✨

I've generated platform-tailored copy for **Facebook, TikTok, LinkedIn, and YouTube**. Review the preview below and click **Approve & Schedule** to push them into the live queue:`,
        action: {
          type: "SCHEDULE_SOCIAL_PREVIEW",
          client: targetClient,
          platforms: ["facebook", "tiktok", "linkedin", "youtube"],
          cloudLink: cloudLink,
          posts: platformVariations,
        },
        suggestedActions: [
          "⚡ Approve & Schedule All 4 Posts",
          "Modify captions before scheduling ✍️",
          "Show my active deliverables 📋",
        ],
      });
    }

    // =========================================================================
    // 5. LIVE GEMINI LLM API BRIDGE (IF GEMINI_API_KEY IS AVAILABLE)
    // =========================================================================
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (geminiApiKey) {
      try {
        const systemPrompt = `You are GIM AI Co-Pilot, the elite intelligence system for Grace In Motion (GIM) Mission Control.
You are assisting ${userName} (${userNick}), whose role is ${userRole}.
Client Scope: ${assignedClients.join(", ")}.
Core Admin Status: ${isCoreAdmin ? "Full Agency Admin" : "Specialist"}.
Active Deliverables: ${accessibleTasks.slice(0, 5).map((t) => `#${t.id}: ${t.name} (${t.client}) [${t.status}]`).join("; ")}.

Guidelines:
- Communicate in a friendly, crisp, professional human voice with relevant emojis.
- Never act like a robotic template.
- Help plan shifts, prioritize tasks, explain SOPs, draft copy, or guide execution.
- Maintain client confidentiality: never leak data of unassigned clients.
- If the user asks about dashboard tools, explain:
  1. ClickUp Kanban Board & Task Manager
  2. Social Media Hub with AI Campaign Autopilot & OAuth Connectors
  3. Real-Time Team Messaging & Direct Messages
  4. Personal Timesheets, Live Attendance & EOS Submissions
  5. SOP & Playbook Knowledge Base.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: message }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const generatedReply =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedReply && generatedReply.trim().length > 0) {
            return NextResponse.json({
              reply: generatedReply,
              suggestedActions: [
                "Show my active deliverables 📋",
                "Plan my next deliverable 🎯",
                "Draft End of Shift note 📝",
              ],
            });
          }
        }
      } catch (geminiErr) {
        console.error("Gemini API call failed, falling back to reasoning engine:", geminiErr);
      }
    }

    // =========================================================================
    // 6. RICH CONVERSATIONAL REASONING ENGINE (INTELLIGENT DYNAMIC FALLBACK)
    // Handles general questions like "how are you", "what is your tools", "how do we plan"
    // =========================================================================

    // "What is your tools" / "What can you do"
    if (
      cleanMsg.includes("tool") ||
      cleanMsg.includes("what can you do") ||
      cleanMsg.includes("capabilities") ||
      cleanMsg.includes("features") ||
      cleanMsg.includes("what do you have")
    ) {
      return NextResponse.json({
        reply: `Hey ${userNick}! 🛠️ Here are the full capabilities and tools I control inside GIM Mission Control:

1. 📋 **ClickUp Kanban & Task Controller:**
   • Move tasks between statuses (\`To Do\` $\\rightarrow$ \`In Progress\` $\\rightarrow$ \`In Review\` $\\rightarrow$ \`Closed\`).
   • Break down deliverables into step-by-step checklists.

2. 📱 **Social Media Hub & AI Autopilot:**
   • Give me a Google Drive or Canva link with Day 1, Day 2, Day 3 assets, and I'll adapt copy for Facebook, TikTok, LinkedIn, and YouTube.
   • Show interactive previews and schedule directly into the queue.

3. 💬 **100% Real-Time Team Messaging:**
   • Sub-millisecond messaging synchronized across team channels and private DMs via Supabase.

4. ⏱️ **Timesheets & EOS Engine:**
   • Track your shift clock, monitor break limits, and generate ready-to-copy End of Shift (EOS) notes based on real tasks.

5. 📘 **SOP & Playbook Library:**
   • Instant access to your assigned client protocols, hourly sweep guidelines, and communication SOPs.

What would you like me to run for you right now? 🚀`,
        suggestedActions: [
          "Show my active deliverables 📋",
          "Help me schedule a social campaign 📱",
          "Draft today's EOS note 📝",
        ],
      });
    }

    // "How are you" / "How's your day" / Greetings
    if (
      cleanMsg.includes("how are you") ||
      cleanMsg.includes("how r u") ||
      cleanMsg.includes("how are things") ||
      cleanMsg.includes("what's up") ||
      cleanMsg.includes("whats up") ||
      cleanMsg.includes("sup")
    ) {
      return NextResponse.json({
        reply: `I'm doing great, ${userNick}! 😊 Systems are running at 100%, and all client delivery channels for **${assignedClients.join(", ")}** are humming along smoothly.

How is your shift going so far? Want to review today's sprint deliverables, plan out a task, or draft your EOS note? 🚀✨`,
        suggestedActions: [
          "Show my active deliverables 📋",
          "Help me plan a task step-by-step 🎯",
          "Draft End of Shift note 📝",
        ],
      });
    }

    // End of Shift (EOS)
    if (
      cleanMsg.includes("eos") ||
      cleanMsg.includes("end of shift") ||
      cleanMsg.includes("clock out") ||
      cleanMsg.includes("shift note")
    ) {
      const tasksSummary =
        myAssignedTasks
          .slice(0, 3)
          .map((t) => `• ${t.name} (${t.client}) — Status: ${t.status}`)
          .join("\n") || "• Reviewed active deliverables and monitored assigned client channels";

      const todayFormatted = new Date().toLocaleDateString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return NextResponse.json({
        reply: `Here is your customized **End of Shift (EOS) Report** for today, ${userNick}! 📝✨

---
**GIM END OF SHIFT REPORT — ${todayFormatted}**
• **Specialist:** ${userName} (${userRole})
• **Client Scope:** ${assignedClients.join(", ")}
• **Shift Status:** Complete ✅

**1. Accomplished Deliverables Today:**
${tasksSummary}
• Monitored client channels at the top of each operating hour

**2. Blockers / Impediments:**
• None — workflows moving on schedule

**3. Focus for Next Shift:**
• Continue advancing sprint targets and coordinate with account leads
---

You can copy this directly and attach it to your shift log before signing off! 👏🎉`,
        suggestedActions: [
          "Show active tasks 📋",
          "Review communication SOP 📘",
        ],
      });
    }

    // Deliverables & Tasks
    if (
      cleanMsg.includes("task") ||
      cleanMsg.includes("deliverable") ||
      cleanMsg.includes("to do") ||
      cleanMsg.includes("assigned")
    ) {
      const listToShow = myAssignedTasks.length > 0 ? myAssignedTasks : accessibleTasks.slice(0, 5);
      if (listToShow.length === 0) {
        return NextResponse.json({
          reply: `Great news, ${userNick}! 🎉 You have **0 pending tasks** under your scope (**${assignedClients.join(", ")}**). Everything is up to date!`,
          suggestedActions: [
            "Help me plan a social campaign 📱",
            "Draft End of Shift note 📝",
          ],
        });
      }

      const taskLines = listToShow
        .slice(0, 6)
        .map((t, i) => `${i + 1}. **[${t.status.toUpperCase()}]** ${t.name} (${t.client}) — \`#${t.id}\``)
        .join("\n");

      return NextResponse.json({
        reply: `Here are your active deliverables, ${userNick}! 📋

${taskLines}

💡 *You can say "Put task #${listToShow[0]?.id} in progress and tell me step by step what to do" anytime!* 🚀`,
        suggestedActions: [
          `Put task #${listToShow[0]?.id} in progress ⚡`,
          "Draft today's EOS note 📝",
        ],
      });
    }

    // Default intelligent conversational response
    return NextResponse.json({
      reply: `Hey ${userNick}! 👋 I hear you. We're focused on **${assignedClients.join(", ")}**.

I can help you:
• 🚀 Put any task in progress and walk you through it step-by-step
• 📱 Schedule multi-platform social media posts from Google Drive or Canva links
• 📝 Generate your daily End of Shift (EOS) note
• 📘 Answer SOP questions or explain client playbooks

Tell me what you'd like to tackle first! 💼✨`,
      suggestedActions: [
        "What are my active deliverables? 📋",
        "Put my task in progress and guide me 🎯",
        "Draft End of Shift note 📝",
      ],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
