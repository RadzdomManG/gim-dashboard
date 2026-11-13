"use client";

import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  Search,
  FolderOpen,
  Layers,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Workflow,
  Sparkles,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export interface SopDocument {
  id: string;
  title: string;
  category: "Strategy" | "Client Delivery" | "Automation & Tech" | "Internal Operations";
  clientScope?: string;
  updatedDate: string;
  author: string;
  summary: string;
  content: string;
}

const SOP_DOCS: SopDocument[] = [
  {
    id: "sop-daily-hourly-comms-check",
    title: "Daily and Hourly Communication Channels Check",
    category: "Internal Operations",
    updatedDate: "Nov 07, 2026",
    author: "RA Malinao, Head of Operations",
    summary:
      "Daily 7:00 AM full check and hourly sweeps (till 8:00 PM MNL) across Slack, operation@ email, and ClickUp notifications. Zero unanswered client queries.",
    content: `# Daily and Hourly Communication Channels Check

**Owner:** RA Malinao, Head of Operations
**Cadence & time:** Every day, including weekends. First full check at 7:00 AM, then a quick check every hour until 8:00 PM MNL Time. Time spent: About 60 minutes for the 7:00 AM check; about 15-30 minutes per hourly check.
**Systems/source:** Slack: info@divineorigines.com and ma.roseannemalinao@gmail.com accounts (all client and internal channels and DMs) Email: operations@divineorigines.com ClickUp: notifications, task comments and mentions

## Trigger & inputs
7:00 AM daily (full check), then every hour (quick check).
Inputs: new and unread messages, mentions, replies, reports, client questions, and anything left unreplied from the previous check. Make sure no client message, request, report or complaint goes unanswered, and every action item ends up as a ClickUp task with an owner.

## Procedure
### Step 1. Scan every channel
- **Slack:** unread messages, mentions, DMs, and client channels on both accounts.
- **Email:** unread and flagged emails in operations@divineorigines.com.
- **ClickUp:** notifications, comments and mentions.
- At 7:00 AM, also review anything that came in overnight or since the last check.

### Step 2. Sort each item into one of four groups
1. **Urgent:** report to RA right away. A client expresses disappointment, a complaint, bad feedback or a churn risk; anything blocking client work; payment or contract issues; anything that needs RA's decision or approval.
2. **Needs a reply:** A client or team member question that can be answered now.
3. **Needs action:** A request, change or deliverable that takes work.
4. **FYI:** Updates and reports that need no reply.

### Step 3. Act on each group
- **Urgent:** message RA directly with the client name, a link to the message, a one-line summary, and a suggested next step. Do not reply to the client on RA's behalf unless RA says to.
- **Needs a reply:** reply, forward to the right owner, or send a reminder. If the answer isn't known, acknowledge the message and say when the client will hear back.
- **Needs action:** create a ClickUp task in the client's list with an owner, a due date and the link to the original message. Reply to the sender that it's logged.
- **FYI:** read it, react or mark it as read, and file it if needed.

### Step 4. Close the loop
- Check that nothing from a client is left unreplied from the previous check.
- At the end of the day, send RA a short summary: urgent items and their status, tasks created, and anything still waiting for a reply.

## Exceptions, approvals & privacy
- **Always report to RA:** every message that needs RA's action or decision, any issue, and any message showing client disappointment or bad feedback.
- **Needs RA's approval before replying:** pricing, scope changes, contracts, refunds, complaints, and anything said on Divine's behalf.
- **Privacy:** never forward client credentials, passwords, payment details or personal data in Slack or email. Share links to the source instead of copying sensitive content. Keep client issues out of channels other clients can see.
- If a channel can't be accessed (logged out, notifications off), tell RA right away.

## Definition of done / evidence
Done when:
1. Every channel (Slack on both accounts, operation@ email, ClickUp) has been checked.
2. Every client message has a reply, a forward, or an acknowledgement.
3. Every urgent item has been reported to RA.
4. Every action item is a ClickUp task with an owner and a due date.

Evidence:
- No unread client messages or unanswered mentions left in Slack, email or ClickUp.
- New ClickUp tasks linked to their source messages.
- The end-of-day summary sent to RA.

**Document status:** Draft — requires RA review and process owner sign-off.`,
  },
  {
    id: "sop-weekly-gim-operations-report",
    title: "Weekly GIM Operations Report",
    category: "Internal Operations",
    updatedDate: "Nov 07, 2026",
    author: "RA Malinao, Head of Operations",
    summary:
      "Weekly Friday Subcon presentations, Monday compiled operations report for Divine, ClickUp Accounts by Health sync, and 30-60-90 day milestone tracking.",
    content: `# Weekly GIM Operations Report

**Owner:** RA Malinao, Head of Operations (compiles and submits the report). Project Owners prepare and present their client updates. Divine receives the report.
**Cadence & time:** Weekly. POs present every Friday at the Subcon Weekly Meeting; RA submits the compiled report to Divine every Monday. First cycle: Friday, October 30 (PO presentations) and Monday, November 2 (submission). About 3 hours per week.
**Systems/source:** Subcon Weekly Meeting (online call, Fridays, POs only) and its Fathom recording ClickUp (each client's tasks, milestones and deliverables; the Subcon Weekly Meeting task) ClickUp Client CRM > Accounts by Health (each client's health status) Each client's 30-60-90 day plan Weekly GIM Operations Report template Slack or email (to send the report to Divine)

## Trigger & inputs
Trigger: The Friday Subcon Weekly Meeting, where each Project Owner presents their prepared client updates.
Input, per client from its PO (prepared in advance, not improvised on the call):
- Account updates for the week
- Health status (Green / Yellow / Red)
- What was promised to the client this week, and what was delivered
- For clients within their first 90 days: the current day count (e.g. "Day 22"), the next milestone (Day 30, 60 or 90), the percentage done toward it, what was agreed for that milestone, and what is not on track and why
- The next milestone and its date
- Issues that came up during the week, with what is being done about them
- Topics the PO wants to brainstorm with the team
- Key numbers where relevant (e.g. bookings, conversion rate, cash collected)
- Team member performance notes (PAs or specialists on the account)
- Links to proof (ClickUp task, file, report or client message)

## Procedure
1. **Thursday:** remind POs to prepare their written update for each client before the meeting, using the input list (account updates, health, promised vs delivered, 30-60-90 milestone progress, issues, brainstorm topics, numbers, team notes, proof).
2. **Friday:** run the Subcon Weekly Meeting. Each PO presents their clients from their prepared list. Note decisions, blockers, brainstorm outcomes and anything Divine raises.
3. **After the meeting:** collect each PO's written update and proof links. Check that every active client is covered.
4. Check each update against ClickUp and the client's 30-60-90 day plan: delivered items match completed tasks, the day count and milestone percentage are right, and every proof link opens.
5. Follow up with any PO whose update is missing, unclear or has no proof.
6. **Update Client CRM > Accounts by Health:** set each client's health status (Green / Yellow / Red) to match the agreed rating, and add a short note on any change from last week.
7. **Monday morning:** compile the Weekly GIM Operations Report.
   a. Section 01, Portfolio health & client commitments: one entry per client with health status (matching Accounts by Health), promised vs delivered, milestone progress (day count and percentage for clients within 90 days), next milestone, Red or Yellow issues, and proof links.
   b. Put Red clients first, then Yellow, then Green.
   c. For each Red or Yellow issue, add the owner, the action being taken, and whether Divine needs to decide anything.
   d. Flag any client whose 30-60-90 milestone is at risk of being missed.
   e. Complete the report's other sections.
8. Submit the report to Divine by Monday morning.
9. Log Divine's decisions and turn follow-ups into ClickUp tasks for the right PO.

## Exceptions, approvals & privacy
Failure scenarios:
- A PO comes to the meeting unprepared: Ask for the written update by Friday EOD and note it for their KPI review.
- A PO misses the Friday meeting: They send their written update to RA by Friday EOD.
- An update has no proof, or the proof or milestone progress does not match ClickUp: Ask the PO before the report goes to Divine; do not submit unverified claims.
- A 30-60-90 milestone is about to be missed: Flag it in the report with the reason and the recovery plan, so the client can be told before the date.
- A client turns Red over the weekend: Update Accounts by Health, add it to the report, and flag it to Divine separately without waiting for Monday.
- Accounts by Health and the report disagree: The agreed rating from the PO update wins; fix the view before submitting.

Privacy:
- The report is internal. Share it with Divine and the POs only, never with clients.
- Keep team member performance notes factual, and share them only with Divine and the member's PO.
- Link to proof instead of pasting client data, credentials or financials into the report.

## Definition of done / evidence
Done when:
- Every active client has an entry with health status, promised vs delivered, next milestone, issues and proof links.
- Every client within its first 90 days shows its day count and percentage toward the next 30-60-90 milestone.
- Client CRM > Accounts by Health matches the health status in the report for every client.
- Every Red or Yellow issue, and every at-risk milestone, has an owner and an action.
- The report is submitted to Divine by Monday.
- Follow-ups from Divine's feedback are ClickUp tasks with owners.

**Document status:** Draft — requires RA review and process owner sign-off.`,
  },
  {
    id: "sop-weekly-kpi-check",
    title: "Weekly KPI Check & Scorecards",
    category: "Internal Operations",
    updatedDate: "Nov 07, 2026",
    author: "RA Malinao, Head of Operations",
    summary:
      "Monday KPI scorecards verification across ClickUp Team KPI, score entry checks, reviewer comment audits, and auto-approvals.",
    content: `# Weekly KPI Check

**Owner:** RA Malinao, Head of Operations (owns follow-ups and the tracker)
**Cadence & time:** Weekly, Mondays
**Systems/source:** ClickUp → Operations & Management → Team KPI → KPI Scorecards. Reference: KPI Framework doc (Knowledge Hub → GIM Internal Processes → Team & Performance → KPI Framework).

## Trigger & inputs
Monday morning, after the Friday EOD submission deadline and the Saturday to Monday review period. Last week's scorecard card for each team member (each KPI subtask's Score %, the Period field, and the reviewer's comments). The "Reviewed By" field shows who reviews each card.

## Procedure
1. Open ClickUp → Team KPI → KPI Scorecards.
2. For each active team member, open last week's card (the one due the previous Friday).
3. Check that every KPI subtask has a Score % entered. Any blank KPI means the entry is missing.
4. Check that each entry has a reviewer comment ("Approved", a clarification, or a flag), using the reviewer named in "Reviewed By".
5. Missing entries: comment on the person's card and tag them, asking them to enter their scores by Monday EOD. Send the same reminder on Slack.
6. Missing reviews: remind the reviewer before Monday EOD. Any entry without a reviewer comment after Monday EOD counts as approved.
7. Check that each person's card for the new week has been created. If someone has no current card, create one from their KPI scorecard in the framework, or confirm with their PO that they're no longer on weekly KPIs.
8. Note anyone who missed their entries again, or who is below target on the same KPI for 2 or more weeks in a row. Flag them for escalation.
9. Record the result (who entered, who's missing, follow-ups sent) as a comment on your own "KPI Tracker Accuracy" subtask.

## Exceptions, approvals & privacy
- A new weekly card is not created (recurrence fails): Create it manually.
- Stale cards: someone's latest card is weeks old (for example, people who left or changed roles). Confirm with their PO whether they should still be tracked.
- The reviewer is on leave or does not respond: Entries auto-approve after Monday EOD, so remind them before then and escalate if the scores look wrong.
- Scores are entered without evidence, or do not match what the reviewer saw: The reviewer comments and tags the team member, as the framework says.
- RA's own card is reviewed by Erwin, so someone else checks it.

Privacy:
- KPI scores are performance data. Discuss them only on the person's ClickUp card or in direct messages with the person, their reviewer and management.
- Never post scores, or the names of people who missed entries, in group channels.

## Definition of done / evidence
- Every active team member's card for last week has a Score % on every KPI.
- Each entry has a reviewer comment, or has auto-approved after Monday EOD.
- Everyone who was missing entries has been followed up.
- Each person has a card for the new week.

**Document status:** Draft — requires RA review and process owner sign-off.`,
  },
  {
    id: "sop-new-client-onboarding",
    title: "New Client Onboarding SOP",
    category: "Client Delivery",
    updatedDate: "Nov 07, 2026",
    author: "RA Malinao, Head of Operations",
    summary:
      "3 business days SLA: Client Services Agreement signing, 9-point client kickoff call, pre-GIM process mapping, and operations implementation timeline.",
    content: `# New Client Onboarding

**Owner:** RA Malinao, Head of Operations (with the assigned Project Owner for kickoff and process work, and Divine for contract sign-off)
**Cadence & time:** Each time a new client signs with GIM. Target: contract signed and kickoff call held within 3 business days of the client saying yes. About 3 hours per client.
**Systems/source:** ClickUp (Onboarding Tasks list in the client's folder) Client Services Agreement template (modeled on the We Rock the Spectrum Clovis agreement) Gmail (info@divineorigines.com) for the welcome email and kickoff summary Slack (client channel) Google Drive (client folder for the contract, brand assets and process documents) Fathom (kickoff call recording)

## Trigger & inputs
Trigger: A new client confirms they want to work with GIM (after the discovery or sales call).
Input: Client name and contact, agreed services and scope, fees and term, start date, governing law for their country, the discovery call notes, and the proposed team.

## Procedure
### 1. Prepare, send and sign the contract
a. Draft the Client Services Agreement from the template (Key Details table, scope, fees, term, governing law for the client's country).
b. Get Divine's sign-off, send it to the client, and confirm both sides have signed.
c. Send the welcome message or email to the client.

### 2. Delivery team assignment
a. Confirm the PO and team for the account. For anyone new to GIM, run New Team Member Onboarding; for everyone, run New Account Assignment.
b. Hold the internal team kickoff call: client background, scope, priorities, roles, and the kickoff call agenda.

### 3. Schedule and conduct the kickoff call with the client
a. Introduce the client to their assigned team members.
b. Set up communication channel and project management tool access (Slack channel, ClickUp or the client's tools).
c. Walk through the client's current workflow and processes, account by account.
d. Collect all access and credentials, and share them with the assigned team through the approved method.
e. Collect brand assets.
f. Align on and note the first 30-day priorities.
g. Capture urgent deadlines and upcoming deliverables.
h. Confirm the meeting cadence.
i. Send the kickoff summary and action items.

### 4. Process Mapping & Handover
- Create the client process map (before GIM): how the client's work runs today.
- Create the operations implementation timeline.
- Send the proposed process improvements to the client.

## Exceptions, approvals & privacy
Failure scenarios:
- The contract is not signed yet: Do not start work, collect credentials or schedule kickoff until it is signed.
- The client delays access or brand assets: Log what is missing in the kickoff summary, follow up within 2 business days, and tell the PO which work is blocked.
- The team is not ready: Finish New Team Member Onboarding or New Account Assignment before the kickoff call.
- Kickoff reveals scope beyond the contract: Note it and raise it with Divine before agreeing to anything.

Privacy:
- Collect and share credentials only through the approved secure method, never in plain email, Slack or ClickUp comments.
- Give each team member only the access their role needs.
- Keep the contract, fees and client data in the client's Drive folder with restricted access.

**Document status:** Draft — requires RA review and process owner sign-off.`,
  },
  {
    id: "sop-new-team-member-onboarding",
    title: "New Team Member Onboarding SOP",
    category: "Internal Operations",
    updatedDate: "Nov 07, 2026",
    author: "RA Malinao, Head of Operations",
    summary:
      "2 business days SLA: Subcontractor agreement execution, Slack & ClickUp provisioning, calendar invites, and onboarding meeting.",
    content: `# New Team Member Onboarding

**Owner:** RA Malinao, Head of Operations
**Cadence & time:** Each time a new team member joins GIM. Target: completed within 2 business days of their start date. About 2 hours per new member.
**Systems/source:** ClickUp (GIM workspace; New Team Member Onboarding task) Slack (GIM workspace) Google Calendar (GIM Weekly Meeting and Subcon Weekly Meeting invites) GIM subcontractor agreement template

## Trigger & inputs
A new team member is hired and their start date is confirmed.
Input: The member's name, role (PA, PO or Specialist), start date, agreed working hours and rate, and email address.

## Procedure
1. Send the subcontractor agreement using the GIM template and confirm it is signed.
2. Pre-onboarding setup:
   a. Add the member to the GIM Slack workspace and the internal channels.
   b. Add the member to the GIM ClickUp workspace.
   c. Invite the member to the GIM Weekly Meeting (online call, Mondays, 9:00 AM).
   d. If the member is a Project Owner, also invite them to the Subcon Weekly Meeting. PAs and Specialists are not invited.
   e. Send the onboarding timeline so they know what to expect.
3. Hold the onboarding meeting: how GIM works, tools, communication norms, reporting, and who to go to for what.
4. Introduce the new member to the team in Slack on their first day, then on the next GIM Weekly Meeting call.
5. Start their account assignment.
6. Mark the New Team Member Onboarding task done and note the completion date.

## Exceptions, approvals & privacy
Failure scenarios:
- The agreement is not signed yet: Do not grant workspace access until it is signed.
- The member cannot access Slack or ClickUp on their start date: Fix it the same day.
- The start date moves: Update the onboarding timeline and meeting invites.

Human judgment:
- Deciding whether the member is a PO (Subcon Weekly Meeting) or not.
- Deciding whether the member is ready to be assigned to an account after the onboarding meeting.

Privacy:
- Keep the agreement, rate and personal details private (RA, Finance and Divine only).
- File the signed agreement in Drive, not in Slack or ClickUp comments.

**Document status:** Draft — requires RA review and process owner sign-off.`,
  },
  {
    id: "sop-lt-spec",
    title: "Little Treasures: Paediatric Funnel & $99 Course Specification",
    category: "Client Delivery",
    clientScope: "Little Treasures Company",
    updatedDate: "Nov 02, 2026",
    author: "Erwin Manaog",
    summary:
      "Full delivery roadmap, GoHighLevel account configuration, AUD Stripe tax compliance, and Dec 11 summit timeline.",
    content: `# Little Treasures Company — Master Delivery Specification

## 1. Executive Summary
- **Client:** Zoe Horner (Founder & Lead Paediatric OT)
- **Hard Milestone:** Summit Readiness by Friday 11 Dec 2026 (Working target).
- **Core Deliverable:** GoHighLevel 6-page brand website, intake booking funnels, automated phone SMS alerts, and $99 online video course delivery.

## 2. Gate Verification Sequence (G1 - G19)
- **G1 (Foundation):** Set currency to AUD, GST compliance, receipt as tax invoice.
- **G2 (Course Shell):** 5 video modules, instructor profile cards, completion certificates.
- **G3 (Custom Fields):** Pediatric sensory tags, patient pipeline stages, smart lists.
- **G4 (Clinical Forms):** Three forms with Australian privacy disclosures.
- **G5 (Website):** 6 pages styled in Zoe's authentic warm palette.
- **G7 (Workflow):** Instant SMS alert dispatched to Zoe's mobile upon new enquiry submission.
- **G11 (SMM):** 30-Day social media calendar, video reel batches, parent education hooks.
- **G14 (Domain):** Point littletreasurescompany.com DNS via Wix.
- **G18 (Dry Run):** Full purchase, course enrollment, refund audit, and summit-ready sign-off.
- **G19 (Australian Phone Number):** Australian regulatory compliance, ABN verification, and direct outbound SMS alerting.`,
  },
  {
    id: "sop-studio-nets-ops",
    title: "Studio Nets: Design Ingestion Systems & Creative Ops Runbook",
    category: "Client Delivery",
    clientScope: "Studio Nets",
    updatedDate: "Oct 31, 2026",
    author: "Erwin Manaog",
    summary:
      "Standard operating procedure for intake questionnaires, Figma design handoff pipelines, and asset revision tracking.",
    content: `# Studio Nets — Design Ingestion & Handoff Runbook

## 1. System Overview
- **Platform:** Figma Enterprise + Supabase Asset Storage + ClickUp Delivery Boards
- **Client Focus:** Studio Nets Design & Creative Systems
- **Primary Goal:** Seamless brand asset intake, Figma file versioning, and client QA approvals.

## 2. Core Creative Pipeline
1. **Intake & Questionnaire:** Automated receipt of client design brief and vector assets.
2. **Figma Canvas Setup:** Grid systems, typography scale tokens, and responsive layout frames.
3. **Internal Review:** Creative lead QA on component states, spacing, and accessibility tokens.
4. **Client Presentation:** Interactive prototype shared with contextual comment pins.
5. **Final Handoff:** Production SVG, PNG, and developer-ready code snippets archived in repository.`,
  },
  {
    id: "sop-auto-testing",
    title: "Automation Design & Testing Protocol",
    category: "Automation & Tech",
    updatedDate: "Oct 30, 2026",
    author: "Radzdom Gallego (Radz)",
    summary:
      "Automated payload schema validation, sandbox dry-runs, error catch blocks, and webhook alerting channels.",
    content: `# Automation Design & Testing Protocol

## 1. Design Principles
1. Every webhook must have an idempotency key to prevent double charging or double SMS delivery.
2. Every external HTTP request must have a 5-second timeout and exponential backoff retry.
3. Catch blocks must alert the internal #ops channel with the failed payload.

## 2. Testing Steps
- Run synthetic test contact with \`gim-test\` prefix.
- Verify status changes in Supabase and notify project owner.
- Confirm client credentials remain isolated in approved secrets vault.`,
  },
  {
    id: "sop-invogue-retention",
    title: "InVogue Cleans: 30-60-90 Day Retention & Lead Magnet Blueprint",
    category: "Client Delivery",
    clientScope: "InVogue Cleans",
    updatedDate: "Nov 02, 2026",
    author: "Ma. Rose Anne (RA) Malinao",
    summary:
      "Lead generation architecture, quote follow-up cadences, and residential cleaning subscription retention.",
    content: `# InVogue Cleans — 30-60-90 Day Retention System

## 1. Objective
Establish an automated lead capture and subscription retention system for premium residential cleaning in Brisbane.

## 2. Phase Breakdown
- **Days 1 - 30 (Foundation):** Multi-step instant estimate calculator, Twilio SMS quote alerts, and GHL pipeline setup.
- **Days 31 - 60 (Retention Engine):** Automated post-cleaning satisfaction surveys and one-click rescheduling links.
- **Days 61 - 90 (Scale):** Referral incentives and automated commercial cleaning proposal generator.`,
  },
];

interface SopPlaybookLibraryProps {
  clientScope?: string | string[];
  isCoreAdmin?: boolean;
}

export function SopPlaybookLibrary({ clientScope = "all", isCoreAdmin = true }: SopPlaybookLibraryProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>("sop-daily-hourly-comms-check");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  // Client scoping rule: Admins see all. Members only see general internal SOPs + their specifically assigned clients.
  const accessibleDocs = SOP_DOCS.filter((doc) => {
    if (isCoreAdmin) return true;
    // General agency ops are accessible to all verified team members
    if (!doc.clientScope || doc.category === "Internal Operations") {
      return true;
    }
    // Client-specific SOPs must match the member's assigned clients
    if (clientScope && clientScope !== "all") {
      const allowed = Array.isArray(clientScope)
        ? clientScope
        : clientScope.split(",").map((s) => s.trim());
      return allowed.some(
        (scope) =>
          doc.clientScope?.toLowerCase().includes(scope.toLowerCase()) ||
          scope.toLowerCase().includes(doc.clientScope?.toLowerCase() || "")
      );
    }
    return false;
  });

  const filteredDocs = accessibleDocs.filter((d) => {
    if (selectedCategory !== "all" && d.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        (d.clientScope && d.clientScope.toLowerCase().includes(q)) ||
        d.author.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeDoc = SOP_DOCS.find((d) => d.id === selectedDocId) || filteredDocs[0] || SOP_DOCS[0];

  const handleCopy = () => {
    if (typeof window !== "undefined" && activeDoc) {
      navigator.clipboard.writeText(activeDoc.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-[#242E29]">
              Operations SOP & Governance Library
            </h2>
            <Badge variant="brand">GIM Standard v2.4</Badge>
          </div>
          <p className="text-xs text-[#65746C] mt-0.5">
            Operational runbooks, daily/weekly reporting cadences, client delivery specifications, and team performance governance authored by RA Malinao & GIM Leadership.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy SOP Markdown"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Controls & Search */}
      <Card>
        <CardContent className="p-3.5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
              <input
                type="text"
                placeholder="Search runbooks, procedures, author, or client keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] placeholder-[#65746C]/60 focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              {["all", "Internal Operations", "Client Delivery", "Automation & Tech"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${
                    selectedCategory === cat
                      ? "bg-[#3D5249] text-white border-[#3D5249]"
                      : "bg-white text-[#242E29] border-[#E8E2DD] hover:border-[#466B53]/40"
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Main Split View: Document Directory + Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document List (4 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredDocs.map((doc) => {
            const isSelected = doc.id === activeDoc?.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#FBF6F3] border-[#518E6A] shadow-xs ring-1 ring-[#518E6A]/20"
                    : "bg-white border-[#E8E2DD] hover:border-[#466B53]/40 hover:bg-[#FBF6F3]/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge
                        variant={
                          doc.category === "Internal Operations"
                            ? "brand"
                            : doc.category === "Client Delivery"
                            ? "active"
                            : "upcoming"
                        }
                      >
                        {doc.category}
                      </Badge>
                      {doc.clientScope && (
                        <span className="text-[10px] font-bold text-[#518E6A] bg-[#518E6A]/10 px-1.5 py-0.2 rounded">
                          {doc.clientScope}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[#242E29] line-clamp-1">{doc.title}</h4>
                    <p className="text-[11px] text-[#65746C] line-clamp-2 mt-1 leading-relaxed">
                      {doc.summary}
                    </p>
                    <div className="flex items-center space-x-3 text-[10px] text-[#65746C]/80 mt-2 pt-2 border-t border-[#E8E2DD]/50">
                      <span>By: {doc.author}</span>
                      <span>•</span>
                      <span>Updated: {doc.updatedDate}</span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 mt-1 transition-transform ${
                      isSelected ? "text-[#518E6A] translate-x-0.5" : "text-[#65746C]/40"
                    }`}
                  />
                </div>
              </div>
            );
          })}

          {filteredDocs.length === 0 && (
            <div className="p-8 text-center bg-white border border-[#E8E2DD] rounded-xl text-xs text-[#65746C]">
              No documents found matching "{search}".
            </div>
          )}
        </div>

        {/* Right: Document Viewer (7 cols) */}
        <div className="lg:col-span-7">
          {activeDoc ? (
            <Card className="h-full">
              <CardHeader className="border-b border-[#E8E2DD] pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="brand">{activeDoc.category}</Badge>
                      {activeDoc.clientScope && (
                        <Badge variant="active">{activeDoc.clientScope}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base font-bold text-[#242E29] mt-1.5">
                      {activeDoc.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-[#65746C]">
                      Maintained by <strong>{activeDoc.author}</strong> • Last reviewed {activeDoc.updatedDate}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <article className="prose prose-sm max-w-none text-xs text-[#242E29] leading-relaxed space-y-4">
                  <div className="whitespace-pre-wrap font-sans text-xs text-[#242E29] leading-relaxed">
                    {activeDoc.content}
                  </div>
                </article>
              </CardContent>
            </Card>
          ) : (
            <div className="p-12 text-center bg-white border border-[#E8E2DD] rounded-xl text-xs text-[#65746C]">
              Select a runbook or standard from the directory on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
