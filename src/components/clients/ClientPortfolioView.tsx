"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  FileText,
  DollarSign,
  Search,
  ExternalLink,
  Layers,
  ChevronRight,
  Filter,
  Check,
  Plus,
  LayoutGrid,
  AlertTriangle,
  User,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ClientReportExportModal } from "@/components/reports/ClientReportExportModal";
import { ClientOnboardingModal } from "@/components/clients/ClientOnboardingModal";
import { ClientCalendarView } from "@/components/clients/ClientCalendarView";
import { TaskItem, TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { createClient } from "@/lib/supabase/client";

export interface ClientProfile {
  id: string;
  name: string;
  code: string;
  industry: string;
  location: string;
  contactName: string;
  contactRole: string;
  accountLead: string;
  specialist: string;
  status: "Active Sprint" | "Proposal Staged" | "Discovery Intake" | "Paused (Archive)";
  statusVariant: "active" | "review" | "upcoming";
  retainer: string;
  progress: number;
  currentSprint: string;
  targetMilestone: string;
  description: string;
  deliverables: {
    code: string;
    title: string;
    status: "Completed" | "In Review" | "In Progress" | "Queued";
  }[];
  keyTechStack: string[];
}

const CLIENT_PORTFOLIO: ClientProfile[] = [
  {
    id: "we-rock-the-spectrum",
    name: "We Rock the Spectrum (WRTS)",
    code: "WRTS-US",
    industry: "Sensory Gym Franchise Operations",
    location: "Clovis, California, United States",
    contactName: "Chris & Niko",
    contactRole: "Franchise Owners & CFO",
    accountLead: "Erwin Manaog",
    specialist: "BJ Ricafrente & Aldwin",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "USD $4,000 / month",
    progress: 70,
    currentSprint: "Renew 147 CVRC approvals ending Nov 30, daily portal reports & Niko CFO data pack",
    targetMilestone: "CVRC Renewals Finalized (Dec 1 Play-or-Pay)",
    description:
      "Sensory gym franchise operations management. Manages Central Valley Regional Center (CVRC) child approval tracking, daily attendance reporting, Roller system cross-referencing, and staff emergency SOPs.",
    deliverables: [
      { code: "WRTS-01", title: "Renew the 147 CVRC approvals that end Nov 30 (play or pay from Dec 1)", status: "In Progress" },
      { code: "WRTS-02", title: "Daily portal report: CVRC approved count, renewals due, unbilled count", status: "In Progress" },
      { code: "WRTS-03", title: "Niko CFO data pack: CVRC authorization status and child days attended", status: "Completed" },
      { code: "WRTS-04", title: "Staff emergency contacts SOP check in Clovis folder", status: "Completed" },
    ],
    keyTechStack: ["n8n Workflows (21 active)", "Google Sheets DB", "Roller Gym POS", "Slack Alerts", "CVRC State Portal"],
  },
  {
    id: "juvibolt-cybertech",
    name: "Juvibolt Cybertech",
    code: "JB-US",
    industry: "Cybersecurity Bootcamp & Technical LMS",
    location: "Columbus, Ohio, US",
    contactName: "Aaron Ofosu",
    contactRole: "Founder & Lead Security Specialist",
    accountLead: "Radzdom-Man Gallego",
    specialist: "Radzdom-Man Gallego",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "USD $4,000 / month",
    progress: 65,
    currentSprint: "J6 Launch Dry Run, synthetic 5-student verification, GHL funnel & Cohortly LMS",
    targetMilestone: "Cohort 1 Live Class Launch",
    description:
      "Cybersecurity technical training and cohort delivery platform. Manages student enrollment pipelines, Tutor LMS WordPress access, Cohortly discovery sessions, US A2P 10DLC compliance, and Stripe checkout.",
    deliverables: [
      { code: "J6", title: "Launch Dry Run: Synthetic 5-Student End-to-End Verification before Monday First Class", status: "In Progress" },
      { code: "T5.9", title: "Update hard-coded website claims once Aaron approves real figures", status: "In Progress" },
      { code: "T5.8", title: "Add email verification to website discovery call bookings (Cohortly)", status: "In Progress" },
      { code: "T5.7", title: "Choose booking, quote and checkout path: GHL funnel vs Cohortly Advisor Desk", status: "In Review" },
      { code: "J10", title: "Funnels & Products: Domain mapping & Stripe product attachment across 8 funnels", status: "Queued" },
      { code: "J8", title: "SMS Carrier Compliance: US A2P 10DLC Brand & Campaign Registration", status: "Completed" },
    ],
    keyTechStack: ["WordPress Tutor LMS", "Cohortly", "GoHighLevel (US)", "Stripe Payments", "Discord"],
  },
  {
    id: "risewise",
    name: "Risewise",
    code: "RW-GLOBAL",
    industry: "Business Operations & Executive Coaching",
    location: "Australia / Global",
    contactName: "Joel & Team",
    contactRole: "Founders",
    accountLead: "Divine Origines",
    specialist: "Jerold Recaplaza",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "USD $3,500 / month",
    progress: 80,
    currentSprint: "RW Ops Automation Plan (Nov 2026): 8 helpers and 17 steps, won client onboarding",
    targetMilestone: "Full 17-Step Automation Live",
    description:
      "Executive business operations and consulting system. Orchestrates won client onboarding, tax invoicing, automated inbox triaging (divine@, joel@, coaching@), and Stripe failed payment handling.",
    deliverables: [
      { code: "RW-01", title: "RW Ops Automation Plan (Nov 2026): rollout tracker", status: "In Progress" },
      { code: "RW-02", title: "Won Client Onboarding + Send Tax Invoice", status: "In Progress" },
      { code: "RW-03", title: "Email Management (divine@, Joel's inbox, coaching@)", status: "In Progress" },
      { code: "RW-04", title: "Check Stripe transactions and handling Failed Payments", status: "Completed" },
      { code: "RW-05", title: "Weekly: contracts ending list for Leanna + access removal", status: "Completed" },
    ],
    keyTechStack: ["ClickUp", "Stripe Billing", "Google Workspace", "Skool Community", "Make.com"],
  },
  {
    id: "noirlab",
    name: "NoirLab",
    code: "NL-GLOBAL",
    industry: "Creative Media & Production Agency",
    location: "Global",
    contactName: "Malik & Atefa",
    contactRole: "Agency Principals",
    accountLead: "Jane Caillio",
    specialist: "Ellyka Claire Pama",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "USD $2,500 / month",
    progress: 60,
    currentSprint: "Weekly plan to Malik, order board monitoring, QA call with Atefa",
    targetMilestone: "Production QA Stabilization",
    description:
      "Media production and creative workflow management. Monitors incoming creative orders, flagged order exceptions, client communication cadences, and weekly delivery reports.",
    deliverables: [
      { code: "NL-01", title: "Send weekly plan to Malik for Noir Lab via WhatsApp", status: "In Progress" },
      { code: "NL-02", title: "Monitor order board & email for messages", status: "In Progress" },
      { code: "NL-03", title: "Do the QA call with Atefa (flagged orders & blockers)", status: "In Progress" },
      { code: "NL-04", title: "Send EOW report to Malik for Noir Lab", status: "Queued" },
      { code: "NL-05", title: "Check the NoirLab production dashboard & order flags", status: "Completed" },
    ],
    keyTechStack: ["ClickUp", "WhatsApp Business", "Google Drive", "Slack"],
  },
  {
    id: "invogue-cleans",
    name: "InVogue Cleans",
    code: "IVC-AU",
    industry: "Premium Residential & Commercial Cleaning",
    location: "Brisbane, Queensland, AU",
    contactName: "Matthew Robbins",
    contactRole: "Founder & Managing Director",
    accountLead: "Ma. Rose Anne (RA) Malinao",
    specialist: "Jedy Caillio & Ellyka Claire Pama",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "USD $1,700 / month",
    progress: 55,
    currentSprint: "Weekly cleaner shift checklists, cleaner pay policy review, second lead source",
    targetMilestone: "90-Day Retention System Live",
    description:
      "Operational management and customer retention system for premium cleaning services. Monitors cleaner shift checklists, client satisfaction surveys, cleaner pay policies, and multi-channel lead acquisition.",
    deliverables: [
      { code: "IVC-01", title: "Check the week's logs before the Friday report", status: "In Progress" },
      { code: "IVC-02", title: "Check Gelton & Nebs shift checklists (weekday and weekend)", status: "In Progress" },
      { code: "IVC-03", title: "Cleaner pay resolution after refund or unphotographed complaint", status: "In Review" },
      { code: "IVC-04", title: "Find a second lead source with Matthew", status: "Queued" },
      { code: "IVC-05", title: "Instant estimate calculator and SMS quote follow-up", status: "Completed" },
    ],
    keyTechStack: ["ClickUp", "Twilio SMS", "GoHighLevel", "Stripe Invoicing"],
  },
  {
    id: "studio-nets",
    name: "Studio Nets",
    code: "SN-AU",
    industry: "Digital Creative & Design Systems",
    location: "Sydney, NSW, AU",
    contactName: "Nathan Blake",
    contactRole: "Creative Director",
    accountLead: "Ma. Rose Anne (RA) Malinao",
    specialist: "Joyce Roble & Hashim Saudi",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "USD $2,800 / month",
    progress: 60,
    currentSprint: "Complete & test Leadly GHL updates, PO onboarding, winning creatives SOP",
    targetMilestone: "SOP Standardization Complete",
    description:
      "Operational systemization for a boutique digital creative agency. Bridges Figma design asset reviews with client sign-off checklists, ClickUp task generation, and automated Fathom meeting summary transcript extraction.",
    deliverables: [
      { code: "SN-01", title: "Complete and test Leadly GHL updates", status: "In Review" },
      { code: "SN-02", title: "PO Onboarding & Workflow Alignment", status: "In Progress" },
      { code: "SN-03", title: "Winning Creatives SOP - screenshot assets", status: "In Progress" },
      { code: "SN-04", title: "Create Action Items from Weekly Call & review recordings", status: "In Progress" },
      { code: "SN-05", title: "Client feedback portal and approval states", status: "Completed" },
    ],
    keyTechStack: ["Figma Enterprise", "Fathom AI", "ClickUp", "GoHighLevel", "Google Workspace"],
  },
  {
    id: "gim-internal",
    name: "Grace In Motion (Internal)",
    code: "GIM-HQ",
    industry: "Agency Operating Architecture & Tech Systems",
    location: "Manila / Global",
    contactName: "Executive Leadership",
    contactRole: "Divine Origines (Owner) & Radz Gallego (Tech Lead)",
    accountLead: "Ma. Rose Anne (RA) Malinao",
    specialist: "All Operations Specialists",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "Internal Agency HQ",
    progress: 85,
    currentSprint: "Weekly operations reports, subcon weekly meeting, contractor invoices, team scorecards",
    targetMilestone: "Universal Agency OS Live",
    description:
      "Internal agency management, weekly reporting cadences, contractor invoicing, team KPI scorecards, and cross-client delivery synchronization.",
    deliverables: [
      { code: "GIM-01", title: "GIM Weekly Meeting (Mondays) & Subcon Weekly Meeting (Fridays)", status: "Completed" },
      { code: "GIM-02", title: "Weekly GIM Operations Report (Compiled for Divine)", status: "In Progress" },
      { code: "GIM-03", title: "Weekly KPI Check & Team Scorecards Audit", status: "In Progress" },
      { code: "GIM-04", title: "Contractor Invoice Processing & Verification", status: "In Progress" },
      { code: "GIM-05", title: "Daily & Hourly Communication Channels Check (7 AM - 8 PM)", status: "Completed" },
    ],
    keyTechStack: ["ClickUp", "Next.js", "Supabase", "Vercel", "Slack", "Fathom AI"],
  },
  {
    id: "tch2thrive",
    name: "Tch2Thrive",
    code: "T2T-US",
    industry: "Education & Teacher Development",
    location: "California, United States",
    contactName: "Kimberly Daniels",
    contactRole: "Executive Director",
    accountLead: "Ma. Rose Anne (RA) Malinao",
    specialist: "BJ Ricafrente",
    status: "Discovery Intake",
    statusVariant: "upcoming",
    retainer: "USD $2,500 / month",
    progress: 40,
    currentSprint: "School District Proposal & ClickUp SOP Library",
    targetMilestone: "District Conference Partnership Pipeline",
    description:
      "Educational consulting delivery platform supporting school district teacher retention initiatives. Manages professional development workshop contracts, attendance verification, and grant compliance tracking.",
    deliverables: [
      { code: "T2T-01", title: "School district proposal & scope document", status: "Completed" },
      { code: "T2T-02", title: "District workshop booking & attendee intake form", status: "In Progress" },
      { code: "T2T-03", title: "Accreditation certificate generation automation", status: "Queued" },
    ],
    keyTechStack: ["ClickUp", "Google Docs / Drive API", "Stripe Invoicing", "Airtable"],
  },
  {
    id: "little-treasures",
    name: "Little Treasures Company",
    code: "LT-AU",
    industry: "Paediatric Therapy & Sensory Education",
    location: "Perth / Brisbane, Australia",
    contactName: "Zoe Horner",
    contactRole: "Founder & Lead Paediatric OT",
    accountLead: "Radzdom Gallego",
    specialist: "Erwin Manaog",
    status: "Paused (Archive)",
    statusVariant: "upcoming",
    retainer: "AUD $4,500 / month (Paused)",
    progress: 100,
    currentSprint: "Paused by client request (historical ClickUp tasks preserved in archive)",
    targetMilestone: "Historical Archive",
    description:
      "Clinical paediatric occupational therapy clinic delivery system. Powers automated parent enquiry routing, GoHighLevel multi-step funnels, and ClassReach patient scheduling (Archived).",
    deliverables: [
      { code: "W3", title: "Website v2, summit pages, emails and downloads ready for Zoe", status: "Completed" },
      { code: "G19", title: "Text number: GoHighLevel's business check, then the Australian number", status: "Completed" },
      { code: "G5", title: "Website: Six Brand Pages in Zoe's Palette", status: "Completed" },
      { code: "G7", title: "Enquiry Workflow & Zoe Mobile Alert", status: "Completed" },
    ],
    keyTechStack: ["GoHighLevel (AU)", "Stripe Payments (AUD)", "Make.com"],
  },
];

interface ClientPortfolioViewProps {
  onSelectTasks?: (clientName: string) => void;
  clientScope?: string | string[];
  currentUserName?: string;
  currentUserNickname?: string;
  isCoreAdmin?: boolean;
  initialClientId?: string;
  initialSubTab?: "calendar" | "board" | "dossier";
}

export function ClientPortfolioView({
  onSelectTasks,
  clientScope = "all",
  currentUserName = "Radzdom Gallego",
  currentUserNickname = "Radz",
  isCoreAdmin = true,
  initialClientId,
  initialSubTab,
}: ClientPortfolioViewProps) {
  // Permission helper: only Core Admins, assignee, or creator can move or modify tasks
  const canModifyTask = (task: TaskItem) => {
    if (isCoreAdmin) return true;
    const nick = (currentUserNickname || "").toLowerCase();
    const name = (currentUserName || "").toLowerCase();
    const assignee = (task.assignee_name || "").toLowerCase();
    const creator = (task.created_by || "").toLowerCase();
    return (
      (nick && assignee.includes(nick)) ||
      (name && assignee.includes(name)) ||
      (nick && creator.includes(nick)) ||
      (name && creator.includes(name))
    );
  };

  // Filter clients based on logged-in member's access scope
  const accessibleClients = CLIENT_PORTFOLIO.filter((c) => {
    if (clientScope && clientScope !== "all") {
      const allowed = Array.isArray(clientScope)
        ? clientScope
        : clientScope.split(",").map((s) => s.trim());
      return allowed.some(
        (scope) =>
          c.name.toLowerCase().includes(scope.toLowerCase()) ||
          scope.toLowerCase().includes(c.name.toLowerCase())
      );
    }
    return true;
  });

  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || (isCoreAdmin ? "all" : (accessibleClients[0]?.id || "juvibolt-cybertech"))
  );
  const [activeSubTab, setActiveSubTab] = useState<"calendar" | "board" | "dossier">(
    initialSubTab || "calendar"
  );

  useEffect(() => {
    if (initialClientId) {
      setSelectedClientId(initialClientId);
    } else if (!isCoreAdmin && selectedClientId === "all" && accessibleClients.length > 0) {
      setSelectedClientId(accessibleClients[0].id);
    }
  }, [initialClientId, isCoreAdmin, accessibleClients, selectedClientId]);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Modals & Tasks State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [boardAssigneeFilter, setBoardAssigneeFilter] = useState("All");
  const [boardPriorityFilter, setBoardPriorityFilter] = useState("All");
  const [mobileBoardColumnFilter, setMobileBoardColumnFilter] = useState<string>("all");

  const isAllClients = isCoreAdmin && selectedClientId === "all";

  const selectedClient = isAllClients
    ? {
        id: "all",
        name: "All Clients",
        code: "ALL",
        industry: "Unified Agency Operations",
        location: "Global",
        contactName: "All Stakeholders",
        contactRole: "Portfolio Overview",
        accountLead: "Divine Origines & Radz",
        specialist: "All Specialists",
        status: "Active Sprint" as const,
        statusVariant: "active" as const,
        retainer: "Portfolio Total",
        progress: 78,
        currentSprint: "All Client Sprints & Deliverables",
        targetMilestone: "Agency Sprints",
        description: "Unified master portfolio view across all authentic client accounts.",
        deliverables: [],
        keyTechStack: ["ClickUp", "Supabase", "GoHighLevel", "n8n", "Stripe"],
      }
    : accessibleClients.find((c) => c.id === selectedClientId) ||
      accessibleClients[0] ||
      CLIENT_PORTFOLIO[0];

  const handleQuickStatusChange = async (
    task: TaskItem,
    newStatus: TaskItem["status"],
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          status: newStatus,
          title: task.title,
          client: task.client,
          priority: task.priority,
          due_date: task.due_date,
        }),
      });
    } catch (err) {
      console.error("Failed to quick update status:", err);
      fetchTasks();
    }
  };

  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const clientQuery = isAllClients
        ? "all"
        : (!isCoreAdmin && accessibleClients.length > 0)
        ? (selectedClientId === "all" ? accessibleClients.map((c) => c.name).join(",") : selectedClient.name)
        : selectedClient.name;
      const res = await fetch(`/api/tasks?client=${encodeURIComponent(clientQuery)}`);
      if (res.ok) {
        const data = await res.json();
        let loadedTasks: TaskItem[] = data.tasks || [];
        // Strict client isolation check for non-admins
        if (!isCoreAdmin && accessibleClients.length > 0) {
          const allowedNames = accessibleClients.map((c) => c.name.toLowerCase());
          loadedTasks = loadedTasks.filter((t) => {
            const tc = (t.client || "").toLowerCase();
            return allowedNames.some((an) => tc.includes(an) || an.includes(tc));
          });
        }
        setTasks(loadedTasks);
      }
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Realtime channel for client tasks
    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`realtime:client_tasks:${selectedClientId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "client_tasks" },
          () => {
            fetchTasks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // offline fallback
    }
  }, [selectedClientId, selectedClient.name]);

  // Status board grouping: 4 clean, focused pipeline columns
  const boardColumns: { status: "To Do" | "In Progress" | "In Review" | "Approved"; title: string; color: string }[] = [
    { status: "To Do", title: "To Do", color: "border-slate-300 bg-slate-50 text-slate-800" },
    { status: "In Progress", title: "In Progress", color: "border-[#518E6A] bg-[#518E6A]/10 text-[#3D5249]" },
    { status: "In Review", title: "QA Review", color: "border-amber-400 bg-amber-50 text-amber-900" },
    { status: "Approved", title: "Approved & Completed", color: "border-emerald-500 bg-emerald-50 text-emerald-900" },
  ];

  return (
    <div className="space-y-5">
      {/* 1. TOP HEADER & ACCESSIBLE CLIENT SELECTOR BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#3D5249]/15 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold tracking-tight text-[#242E29]">
                Client Operations Workspace
              </h2>
              <Badge variant="brand">
                {accessibleClients.length} {accessibleClients.length === 1 ? "Client Assigned" : "Clients Available"}
              </Badge>
            </div>
            <p className="text-xs text-[#65746C] mt-0.5">
              Select an account to view deadlines, workflow task statuses, and verified delivery dossiers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsReportModalOpen(true)}
              className="text-xs flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#518E6A]" />
              <span>Client Report</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOnboardModalOpen(true)}
              className="flex items-center space-x-1 text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Onboard Client</span>
            </Button>
          </div>
        </div>

        {/* Clean Client Switcher (Pill Selector) - Focused on One Client at a Time + ALL option */}
        <div className="pt-2 border-t border-[#3D5249]/10 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#3D5249] shrink-0 mr-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#518E6A]" />
            Active Client:
          </span>

          {/* ALL CLIENTS PILL (Admins Only) */}
          {isCoreAdmin && (
            <button
              onClick={() => setSelectedClientId("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                isAllClients
                  ? "bg-[#3D5249] text-white border-[#3D5249] shadow-xs"
                  : "bg-[#FBF6F3] text-[#65746C] border-[#3D5249]/15 hover:border-[#3D5249]/40 hover:text-[#242E29]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Clients</span>
              <span
                className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                  isAllClients ? "bg-white/20 text-white" : "bg-[#3D5249]/10 text-[#3D5249]"
                }`}
              >
                ALL
              </span>
            </button>
          )}

          {accessibleClients.map((client) => {
            const isSelected = client.id === selectedClientId;
            return (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? "bg-[#3D5249] text-white border-[#3D5249] shadow-xs"
                    : "bg-[#FBF6F3] text-[#65746C] border-[#3D5249]/15 hover:border-[#3D5249]/40 hover:text-[#242E29]"
                }`}
              >
                <span>{client.name}</span>
                <span
                  className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#3D5249]/10 text-[#3D5249]"
                  }`}
                >
                  {client.code}
                </span>
              </button>
            );
          })}

          {/* + New Client Button Pill */}
          <button
            type="button"
            onClick={() => setIsOnboardModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border border-dashed border-[#518E6A] text-[#518E6A] hover:bg-[#518E6A]/10 hover:border-[#3D5249]"
            title="Onboard New Client Account"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Client</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TAB SWITCHER (Calendar, Board, Dossier) */}
      <div className="flex border-b border-[#3D5249]/15 bg-white rounded-t-2xl px-2 sm:px-4 pt-2 shadow-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab("calendar")}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === "calendar"
              ? "border-[#518E6A] text-[#3D5249]"
              : "border-transparent text-[#65746C] hover:text-[#242E29]"
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-[#518E6A]" />
          Calendar &amp; Deadlines
        </button>

        <button
          onClick={() => setActiveSubTab("board")}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === "board"
              ? "border-[#518E6A] text-[#3D5249]"
              : "border-transparent text-[#65746C] hover:text-[#242E29]"
          }`}
        >
          <Layers className="w-4 h-4 text-[#518E6A]" />
          Task Board ({tasks.length})
        </button>

        <button
          onClick={() => setActiveSubTab("dossier")}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === "dossier"
              ? "border-[#518E6A] text-[#3D5249]"
              : "border-transparent text-[#65746C] hover:text-[#242E29]"
          }`}
        >
          <Building2 className="w-4 h-4 text-[#518E6A]" />
          Client Dossier &amp; Retainer
        </button>
      </div>

      {/* 3. ACTIVE SUB-TAB CONTENT */}
      {/* SUB-TAB 1: INTERACTIVE CALENDAR VIEW */}
      {activeSubTab === "calendar" && (
        <ClientCalendarView
          clientName={selectedClient.name}
          tasks={tasks}
          onTaskUpdated={fetchTasks}
          availableClients={accessibleClients.map((c) => c.name)}
        />
      )}

      {/* SUB-TAB 2: KANBAN TASK BOARD */}
      {activeSubTab === "board" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#3D5249]/15">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#242E29] flex items-center gap-2">
                <span>Task Delivery Board &mdash; {selectedClient.name}</span>
              </h3>
              <p className="text-xs text-[#65746C]">
                Track deliverable movement through To Do, In Progress, QA Review, and Approved sign-offs.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick My Tasks Toggle Pill */}
              <button
                type="button"
                onClick={() => {
                  const myVal = currentUserNickname || currentUserName;
                  if (boardAssigneeFilter.toLowerCase() === myVal.toLowerCase()) {
                    setBoardAssigneeFilter("All");
                  } else {
                    setBoardAssigneeFilter(myVal);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border ${
                  boardAssigneeFilter !== "All" &&
                  (boardAssigneeFilter.toLowerCase() === (currentUserNickname || "").toLowerCase() ||
                    boardAssigneeFilter.toLowerCase() === (currentUserName || "").toLowerCase())
                    ? "bg-[#466B53] text-white border-[#466B53] shadow-xs"
                    : "bg-[#FBF6F3] text-[#3D5249] border-[#E8E2DD] hover:border-[#466B53]/50"
                }`}
                title="View deliverables assigned to you"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Deliverables</span>
              </button>

              {/* Assignee Filter */}
              <div className="flex items-center gap-1.5 bg-[#FBF6F3] border border-[#E8E2DD] px-2.5 py-1 rounded-xl text-xs">
                <Filter className="w-3.5 h-3.5 text-[#65746C]" />
                <select
                  value={boardAssigneeFilter}
                  onChange={(e) => setBoardAssigneeFilter(e.target.value)}
                  className="bg-transparent text-xs text-[#242E29] font-medium focus:outline-none"
                >
                  <option value="All">All Team</option>
                  {Array.from(new Set(tasks.map((t) => t.assignee_name || "Unassigned").filter(Boolean))).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5 bg-[#FBF6F3] border border-[#E8E2DD] px-2.5 py-1 rounded-xl text-xs">
                <Filter className="w-3.5 h-3.5 text-[#65746C]" />
                <select
                  value={boardPriorityFilter}
                  onChange={(e) => setBoardPriorityFilter(e.target.value)}
                  className="bg-transparent text-xs text-[#242E29] font-medium focus:outline-none"
                >
                  <option value="All">All Priority</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateTaskOpen(true)}
                className="flex items-center gap-1.5 text-xs shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </Button>
            </div>
          </div>

          {/* Mobile Column Switcher (Visible on screens < 640px) */}
          <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
            <button
              type="button"
              onClick={() => setMobileBoardColumnFilter("all")}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors ${
                mobileBoardColumnFilter === "all"
                  ? "bg-[#3D5249] text-white shadow-xs"
                  : "bg-white border border-[#E8E2DD] text-[#65746C]"
              }`}
            >
              All Columns
            </button>
            {boardColumns.map((c) => {
              const count = tasks.filter((t) => t.status.toLowerCase() === c.status.toLowerCase()).length;
              const isActive = mobileBoardColumnFilter === c.status;
              return (
                <button
                  key={c.status}
                  type="button"
                  onClick={() => setMobileBoardColumnFilter(c.status)}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors flex items-center gap-1 ${
                    isActive
                      ? "bg-[#518E6A] text-white shadow-xs"
                      : "bg-white border border-[#E8E2DD] text-[#242E29]"
                  }`}
                >
                  <span>{c.title}</span>
                  <span className="text-[10px] opacity-80 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {boardColumns
              .filter((col) => {
                if (mobileBoardColumnFilter === "all") return true;
                return col.status.toLowerCase() === mobileBoardColumnFilter.toLowerCase();
              })
              .map((col) => {
              const colTasks = tasks
                .filter((t) => {
                  if (boardAssigneeFilter !== "All") {
                    const target = boardAssigneeFilter.toLowerCase();
                    const aName = (t.assignee_name || "Unassigned").toLowerCase();
                    if (aName !== target && !aName.includes(target) && !target.includes(aName)) return false;
                  }
                  if (boardPriorityFilter !== "All" && t.priority !== boardPriorityFilter) return false;
                  return true;
                })
                .filter((t) => {
                  const s = (t.status || "").toLowerCase();
                  if (col.status === "Approved") {
                    return s === "approved" || s === "closed" || s === "done" || s === "complete";
                  }
                  if (col.status === "In Review") {
                    return s === "in review" || s === "for review";
                  }
                  if (col.status === "In Progress") {
                    return s === "in progress";
                  }
                  return s === "to do" || s === "open";
                })
                .sort((a, b) => {
                  const timeA = a.due_date ? new Date(a.due_date).getTime() : 0;
                  const timeB = b.due_date ? new Date(b.due_date).getTime() : 0;
                  return timeB - timeA; // Latest to oldest
                });

              return (
                <div key={col.status} className="bg-white rounded-2xl border border-[#3D5249]/15 shadow-sm overflow-hidden flex flex-col">
                  {/* Column Header */}
                  <div className={`px-3.5 py-3 border-b flex items-center justify-between font-bold text-xs ${col.color}`}>
                    <span className="uppercase tracking-wider truncate">{col.title}</span>
                    <span className="w-5 h-5 rounded-full bg-white/90 border border-current flex items-center justify-center font-mono text-[11px] shrink-0">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="p-2.5 space-y-2 min-h-64 bg-[#FBF6F3]/30">
                    {colTasks.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#65746C]/60 italic border border-dashed border-[#3D5249]/15 rounded-xl">
                        No tasks in {col.title}
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const dueDateObj = task.due_date ? new Date(task.due_date) : null;
                        const isClosed = task.status.toLowerCase() === "closed";
                        const isOverdue = !isClosed && dueDateObj && dueDateObj.getTime() < Date.now();

                        return (
                          <div
                            key={task.id}
                            role="button"
                            onClick={() => setSelectedTaskForDetail(task)}
                            className={`p-3 rounded-xl bg-white border transition-all cursor-pointer space-y-2 ${
                              isClosed
                                ? "border-purple-200/70 hover:border-purple-400 bg-purple-50/20"
                                : "border-[#3D5249]/15 hover:border-[#518E6A] hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1 min-w-0">
                                {isAllClients && task.client && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FBF6F3] text-[#3D5249] border border-[#E8E2DD] shrink-0 font-bold truncate max-w-20">
                                    {task.client.split(" ")[0]}
                                  </span>
                                )}
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                  isClosed ? "bg-purple-100 text-purple-900" : "bg-[#3D5249]/10 text-[#3D5249]"
                                }`}>
                                  {task.tags?.[0] || (task.is_clickup ? "CLICKUP" : "TASK")}
                                </span>
                              </div>
                              {isClosed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded">
                                  <Check className="w-2.5 h-2.5" /> Done
                                </span>
                              ) : task.priority === "Urgent" ? (
                                <Badge variant="critical">Urgent</Badge>
                              ) : task.priority === "High" ? (
                                <Badge variant="review">High</Badge>
                              ) : null}
                            </div>

                            <h4 className={`text-xs font-bold line-clamp-2 ${
                              isClosed ? "text-[#242E29]/80 line-through" : "text-[#242E29]"
                            }`}>
                              {task.title}
                            </h4>

                            <div className="pt-2 border-t border-[#3D5249]/10 flex items-center justify-between text-[11px] text-[#65746C]">
                              <span className="flex items-center gap-1 truncate max-w-28">
                                <User className="w-3 h-3 text-[#518E6A]" />
                                {task.assignee_name?.split(" ")[0] || "Unassigned"}
                              </span>
                              {dueDateObj && (
                                <span
                                  className={`flex items-center gap-1 font-medium ${
                                    isOverdue ? "text-rose-600 font-bold" : "text-[#65746C]"
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  {dueDateObj.toLocaleDateString("en-AU", { month: "short", day: "numeric" })}
                                </span>
                              )}
                            </div>

                            {/* One-Click Quick Move Status Bar (or locked if not assignee/admin) */}
                            <div
                              className="pt-1.5 border-t border-[#E8E2DD]/70 flex items-center justify-between gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {canModifyTask(task) ? (
                                <>
                                  <span className="text-[9px] font-mono text-[#65746C] uppercase">Move:</span>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {(["To Do", "In Progress", "In Review", "Approved", "Closed"] as TaskItem["status"][]).map((st) => {
                                      if (st.toLowerCase() === task.status.toLowerCase()) return null;
                                      return (
                                        <button
                                          key={st}
                                          type="button"
                                          onClick={(e) => handleQuickStatusChange(task, st, e)}
                                          title={`Move task to ${st}`}
                                          className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FBF6F3] border border-[#E8E2DD] hover:bg-[#518E6A] hover:text-white hover:border-[#518E6A] transition-colors"
                                        >
                                          {st === "In Progress" ? "Prog" : st === "In Review" ? "Rev" : st === "Closed" ? "Done" : st}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </>
                              ) : (
                                <div className="w-full flex items-center justify-between text-[10px] text-[#65746C]">
                                  <span className="flex items-center gap-1 text-amber-800/80 font-medium">
                                    <Lock className="w-2.5 h-2.5 text-amber-700" /> {task.assignee_name?.split(" ")[0] || "Member"}
                                  </span>
                                  <span className="text-[9px] font-mono text-[#65746C]/60 bg-[#FBF6F3] px-1 py-0.2 rounded border border-[#E8E2DD]">
                                    Locked
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CLIENT DOSSIER & RETAINER */}
      {activeSubTab === "dossier" && (
        <Card>
          <div className="p-5 border-b border-[#E8E2DD] bg-[#FBF6F3]/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#3D5249] text-xs bg-[#466B53]/20 px-2 py-0.5 rounded border border-[#466B53]/30">
                  {selectedClient.code}
                </span>
                <Badge variant={selectedClient.statusVariant} dot>
                  {selectedClient.status}
                </Badge>
              </div>
              <span className="text-xs font-bold text-[#466B53]">
                {selectedClient.retainer}
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#242E29]">
              {selectedClient.name}
            </h2>
            <p className="text-xs text-[#65746C] mt-0.5">
              {selectedClient.industry} &bull; {selectedClient.location}
            </p>
          </div>

          <CardContent className="p-5 space-y-5 text-xs">
            <div>
              <h4 className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider mb-1.5">
                Strategic Scope &amp; Objective
              </h4>
              <p className="text-xs text-[#242E29] leading-relaxed">
                {selectedClient.description}
              </p>
            </div>

            {/* Account Stakeholders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/40">
              <div>
                <span className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider block">
                  Client Contact
                </span>
                <p className="font-bold text-xs text-[#242E29] mt-0.5">
                  {selectedClient.contactName}
                </p>
                <p className="text-[10px] text-[#65746C]">{selectedClient.contactRole}</p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider block">
                  GIM Account Lead
                </span>
                <p className="font-bold text-xs text-[#242E29] mt-0.5">
                  {selectedClient.accountLead}
                </p>
                <p className="text-[10px] text-[#518E6A] font-medium">Project Owner</p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider block">
                  Technical Specialist
                </span>
                <p className="font-bold text-xs text-[#242E29] mt-0.5">
                  {selectedClient.specialist}
                </p>
                <p className="text-[10px] text-[#466B53] font-medium">Delivery &amp; Systems</p>
              </div>
            </div>

            {/* Current Sprint Focus */}
            <div className="p-3.5 rounded-xl border border-[#518E6A]/30 bg-[#EDFDF5]/60 flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-[#38A169] shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <p className="font-bold text-xs text-[#276749]">
                  Current Sprint Focus: {selectedClient.currentSprint}
                </p>
                <p className="text-[11px] text-[#276749]/80">
                  Target Milestone: <strong>{selectedClient.targetMilestone}</strong>
                </p>
              </div>
            </div>

            {/* Deliverables Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider">
                  Deliverables &amp; Verification Gates
                </h4>
                <span className="text-[11px] text-[#65746C]">
                  Overall Progress: <strong>{selectedClient.progress}%</strong>
                </span>
              </div>

              <div className="divide-y divide-[#E8E2DD]/50 border border-[#E8E2DD] rounded-xl overflow-hidden bg-white">
                {selectedClient.deliverables.map((del, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 flex items-center justify-between hover:bg-[#FBF6F3]/40 transition-colors text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[10px] text-[#3D5249] bg-[#466B53]/10 px-1.5 py-0.2 rounded">
                        {del.code}
                      </span>
                      <span className="font-medium text-[#242E29] text-xs">
                        {del.title}
                      </span>
                    </div>
                    <Badge
                      variant={
                        del.status === "Completed"
                          ? "active"
                          : del.status === "In Review"
                          ? "review"
                          : del.status === "In Progress"
                          ? "brand"
                          : "upcoming"
                      }
                    >
                      {del.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Tech Stack */}
            <div>
              <h4 className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider mb-2">
                Integrated Technologies &amp; Tooling
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedClient.keyTechStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-[#FBF6F3] border border-[#E8E2DD] text-[11px] font-medium text-[#242E29]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTaskForDetail}
        isOpen={!!selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        onTaskUpdated={fetchTasks}
        currentUserName={currentUserName}
        currentUserNickname={currentUserNickname}
        isCoreAdmin={isCoreAdmin}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        defaultClient={selectedClient.name === "All Clients" ? "Little Treasures Company" : selectedClient.name}
        availableClients={accessibleClients.map((c) => c.name)}
        onTaskCreated={fetchTasks}
        currentUserName={currentUserName}
        currentUserRole={isCoreAdmin ? "Admin" : "Team Specialist"}
      />

      {/* Client Report Export Modal */}
      <ClientReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        clientName={selectedClient.name}
      />

      {/* Client Onboarding Modal */}
      <ClientOnboardingModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        onClientAdded={fetchTasks}
      />
    </div>
  );
}
