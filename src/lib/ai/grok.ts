/**
 * Grace In Motion (GIM) — Grok (xAI) Intelligence Engine
 * 
 * STRICT AIR-GAPPED GIM SOP GROUNDING
 * - Grounded strictly in GIM Agency Operating Procedures (SOPs) and 13-section Knowledge Hub.
 * - ZERO cross-client leakage.
 * - Little Treasures Company is strictly PAUSED.
 * - Automatic graceful fallback when xAI credits are pending or unavailable.
 */

export interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GrokResponse {
  reply: string;
  modelUsed: "grok-beta" | "gim-sop-grounded";
  isFallback: boolean;
  suggestedActions: string[];
  statusMessage?: string;
}

interface UserContext {
  name?: string;
  nickname?: string;
  role?: string;
  clientScope?: string;
  assigned_clients?: string[];
  isCoreAdmin?: boolean;
}

interface TaskContext {
  id: string;
  name: string;
  client: string;
  status: string;
  priority?: string;
}

const GIM_MASTER_SYSTEM_PROMPT = `You are the Grace In Motion (GIM) Co-Pilot & Operations Intelligence Engine, powered by Grok (xAI) and strictly grounded in GIM Agency Operating Procedures (SOPs).

=============================================================================
CORE AGENCY IDENTITY & NON-NEGOTIABLE OPERATIONAL GUARDRAILS
=============================================================================
1. Platform & Agency Name: Grace In Motion (GIM). Strictly do NOT refer to the platform as "Agency Operating System".
2. Core Admin Team (Universal Admin Access):
   - Divine Origines (Owner)
   - Radzdom-Man Gallego / Radz (AI Automation Specialist / Admin)
   - Ma. Rose Anne (RA) Malinao (Finance & Admin)
3. Operations Specialists:
   - Erwin Manaog (Operations Manager / OM)
   - Kimberly Besa (Marketing & Operations Specialist / SMM)
   * Note: The fictitious dummy "Camille Bautista" has been completely purged. Never reference Camille.
4. Active Client Portfolio & Grounded AI Bots:
   - Juvibolt Cybertech (Bot: Jarvis | Timezone: EST UTC-5 | Lead: Radzdom Gallego)
   - We Rock the Spectrum / WRTS (Bot: Rocky | Timezone: PST UTC-8 | Lead: Divine Origines)
   - InVogue Cleans (Bot: Ivy | Timezone: CST UTC-6 | Lead: RA Malinao & Kim Besa)
   - NoirLab (Bot: Neo | Timezone: AEST UTC+10 | Lead: Jane Caillio)
   - Risewise (Bot: Riva | Timezone: AEST UTC+10 | Lead: Divine Origines)
5. STRICT PAUSE DIRECTIVE:
   - Little Treasures Company (AU) is STRICTLY PAUSED per client request. Never generate active sprint deliverables or workflows for Little Treasures. State clearly that operations are paused.
6. ZERO LEAK & AIR-GAPPED ISOLATION:
   - Never leak internal data, passwords, API tokens, or client information across different client scopes.
   - Refuse general non-work trivia (weather, movies, politics, crypto, coding riddles). Politely redirect to GIM operations, deliverables, and client SOPs.
   - Keep answers clear, professional, concise, and aligned with GIM operational standards.`;

export async function askGrokSopEngine(
  prompt: string,
  user: UserContext,
  tasks: TaskContext[] = []
): Promise<GrokResponse> {
  const xaiApiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || "";
  const userNick = user.nickname || (user.name ? user.name.split(" ")[0] : "Team Member");
  const assignedClients = user.assigned_clients || ["All Accounts"];

  // 1. Guardrail against Paused Client inquiry
  const cleanPrompt = prompt.toLowerCase();
  if (cleanPrompt.includes("little treasure")) {
    return {
      reply: `⏸️ **Little Treasures Company is currently on pause.**\n\nOperations and deliverables for Little Treasures Company are paused per client instruction. Active sprint workflows are concentrated on **We Rock the Spectrum (WRTS)**, **Juvibolt Cybertech**, **InVogue Cleans**, **Risewise**, and **NoirLab**.\n\nWould you like to review deliverables for an active client?`,
      modelUsed: "gim-sop-grounded",
      isFallback: false,
      suggestedActions: [
        "Show WRTS deliverables 📋",
        "Show Juvibolt deliverables 🛡️",
        "Draft an End of Shift (EOS) note 📝"
      ]
    };
  }

  // 2. Guardrail against general off-topic trivia
  const offTopicKeywords = [
    "weather", "temperature", "tell me a joke", "write a poem", "sing a song",
    "bitcoin", "crypto", "who won the", "politics", "president", "recipe"
  ];
  if (offTopicKeywords.some(kw => cleanPrompt.includes(kw))) {
    return {
      reply: `Hey ${userNick}! 😊 I am your dedicated GIM Co-Pilot, strictly calibrated for our agency deliverables, client sprints, task execution, and SOP compliance.\n\nI do not answer general external trivia, but I am ready to help you plan sprint tasks, verify deliverables, or draft your shift reports! What are we focusing on? 💼✨`,
      modelUsed: "gim-sop-grounded",
      isFallback: false,
      suggestedActions: [
        "Show my active deliverables 📋",
        "Draft today's EOS note 📝",
        "Check client sprint goals 🎯"
      ]
    };
  }

  // 3. Attempt Grok API call if key is available
  if (xaiApiKey && xaiApiKey.trim().length > 10) {
    try {
      const activeTasksSummary = tasks.length > 0
        ? tasks.slice(0, 5).map(t => `- [${t.status.toUpperCase()}] ${t.name} (${t.client})`).join("\n")
        : "No active tasks currently assigned.";

      const userContextPrompt = `\n[CURRENT USER CONTEXT]
User: ${user.name || "Member"} (Nickname: ${userNick}, Role: ${user.role || "Specialist"})
Client Scope: ${assignedClients.join(", ")}
Active Tasks Summary:
${activeTasksSummary}
`;

      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${xaiApiKey.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [
            { role: "system", content: GIM_MASTER_SYSTEM_PROMPT + "\n" + userContextPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 800
        }),
        // Avoid hanging UI
        signal: AbortSignal.timeout(8000)
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return {
            reply: content,
            modelUsed: "grok-beta",
            isFallback: false,
            suggestedActions: [
              "Show my active deliverables 📋",
              "Draft End of Shift note 📝",
              "Review client SOPs 📘"
            ]
          };
        }
      } else {
        // e.g. 403 permission-denied / insufficient credits
        console.warn(`[Grok API] Non-OK response (${response.status}). Activating Grounded GIM SOP fallback.`);
      }
    } catch (err) {
      console.warn("[Grok API] Call failed or timed out. Activating Grounded GIM SOP fallback.", err);
    }
  }

  // 4. Deterministic GIM Grounded Engine (Fail-safe, Zero-Downtime, Zero-Leak)
  return getDeterministicGimResponse(prompt, userNick, assignedClients, tasks);
}

function getDeterministicGimResponse(
  prompt: string,
  userNick: string,
  assignedClients: string[],
  tasks: TaskContext[]
): GrokResponse {
  const clean = prompt.toLowerCase();

  // Knowledge Hub / AI Bot queries
  if (
    clean.includes("knowledge hub") ||
    clean.includes("timezone") ||
    clean.includes("jarvis") ||
    clean.includes("ivy") ||
    clean.includes("neo") ||
    clean.includes("riva") ||
    clean.includes("rocky")
  ) {
    return {
      reply: `🤖 **GIM Grounded Knowledge Hub & Evidence Roster**\n\nBawat client account sa GIM ay may standardized 13-section Knowledge Hub at dedicated grounded AI bot persona:\n\n` +
        `• 🛡️ **Juvibolt Cybertech:** Bot **Jarvis** • Timezone: **EST** (South Carolina, UTC-5) • Lead: Radzdom Gallego\n` +
        `• 🌿 **InVogue Cleans:** Bot **Ivy** • Timezone: **CST** (Texas, UTC-6) • Lead: RA Malinao & Kim Besa\n` +
        `• 🎯 **NoirLab:** Bot **Neo** • Timezone: **AEST** (Australia, UTC+10) • Lead: Jane Caillio\n` +
        `• 📈 **Risewise:** Bot **Riva** • Timezone: **AEST** (Australia, UTC+10) • Lead: Divine Origines\n` +
        `• 🏋️ **We Rock the Spectrum:** Bot **Rocky** • Timezone: **PST** (California, UTC-8) • Lead: Divine & Team\n\n` +
        `*Paalala: Ang Little Treasures Company ay nananatiling PAUSED.*`,
      modelUsed: "gim-sop-grounded",
      isFallback: true,
      statusMessage: "xAI API awaiting team credits. Grounded SOP Engine active.",
      suggestedActions: [
        "View Knowledge Hub Sections 📚",
        "Show my active deliverables 📋",
        "Draft End of Shift note 📝"
      ]
    };
  }

  // End of Shift (EOS)
  if (clean.includes("eos") || clean.includes("end of shift") || clean.includes("clock out")) {
    const taskSummary = tasks.length > 0
      ? tasks.slice(0, 3).map(t => `• ${t.name} (${t.client}) — Status: ${t.status}`).join("\n")
      : "• Monitored assigned client queues and executed scheduled operational sweeps";

    const today = new Date().toLocaleDateString("en-AU", {
      weekday: "short", day: "numeric", month: "short", year: "numeric"
    });

    return {
      reply: `Narito ang standard **GIM End of Shift (EOS) Report** template mo, ${userNick}! 📝✨\n\n---\n` +
        `**GIM END OF SHIFT REPORT — ${today}**\n` +
        `• **Specialist:** ${userNick}\n` +
        `• **Client Scope:** ${assignedClients.join(", ")}\n` +
        `• **Shift Status:** Complete ✅\n\n` +
        `**1. Accomplished Deliverables Today:**\n${taskSummary}\n` +
        `• Conducted operational monitoring on assigned channels.\n\n` +
        `**2. Blockers / Impediments:**\n• None — workflows moving on schedule.\n\n` +
        `**3. Focus for Next Shift:**\n• Advance sprint milestones and synchronize with account leads.\n---`,
      modelUsed: "gim-sop-grounded",
      isFallback: true,
      statusMessage: "xAI API awaiting team credits. Grounded SOP Engine active.",
      suggestedActions: [
        "Copy EOS Report 📋",
        "Review active tasks ⚡",
        "Check client sprint goals 🎯"
      ]
    };
  }

  // Deliverables & Tasks
  if (clean.includes("task") || clean.includes("deliverable") || clean.includes("to do")) {
    if (tasks.length === 0) {
      return {
        reply: `Ayos, ${userNick}! 🎉 Wala kang pending urgent deliverables sa kasalukuyang scope mo (**${assignedClients.join(", ")}**). Lahat ay up to date!`,
        modelUsed: "gim-sop-grounded",
        isFallback: true,
        statusMessage: "xAI API awaiting team credits. Grounded SOP Engine active.",
        suggestedActions: [
          "Check client sprint goals 🎯",
          "Draft End of Shift note 📝"
        ]
      };
    }

    const taskLines = tasks.slice(0, 5).map((t, idx) => `${idx + 1}. **[${t.status.toUpperCase()}]** ${t.name} (${t.client})`).join("\n");
    return {
      reply: `Narito ang active deliverables sa ilalim ng scope mo, ${userNick}! 📋\n\n${taskLines}\n\n💡 *Sabihin mo lang kung aling task ang sisimulan natin para magabayan kita step-by-step.*`,
      modelUsed: "gim-sop-grounded",
      isFallback: true,
      statusMessage: "xAI API awaiting team credits. Grounded SOP Engine active.",
      suggestedActions: [
        "Step-by-step guidance on task 🚀",
        "Draft End of Shift note 📝"
      ]
    };
  }

  // Default intelligent greeting & capability guide
  return {
    reply: `Kumusta ${userNick}! 👋 Nakatutok tayo sa mga accounts: **${assignedClients.join(", ")}**.\n\n` +
      `Maaari kitang tulungan sa:\n` +
      `• 📋 **Active Deliverables & Sprint Tasks:** I-organisa ang to-do items at step-by-step implementation.\n` +
      `• 📚 **GIM Knowledge Hub & SOPs:** 13-section grounded client reference, timezones, at specialist leads.\n` +
      `• 📝 **End of Shift (EOS) Generation:** Mabilis na pag-draft ng daily shift reports.\n` +
      `• 🛡️ **Air-Gapped Client Isolation:** Pag-verify ng accounts nang walang cross-client drift.\n\n` +
      `Saan mo gustong magsimula tayo? 🚀`,
    modelUsed: "gim-sop-grounded",
    isFallback: true,
    statusMessage: "xAI API awaiting team credits. Grounded SOP Engine active.",
    suggestedActions: [
      "What are my active deliverables? 📋",
      "Show Client Knowledge Hub 📚",
      "Draft End of Shift note 📝"
    ]
  };
}
