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
  status: "Active Sprint" | "Proposal Staged" | "Discovery Intake";
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
    id: "little-treasures",
    name: "Little Treasures Company",
    code: "LT-AU",
    industry: "Paediatric Therapy & Education",
    location: "Brisbane, Queensland, AU",
    contactName: "Zoe Horner",
    contactRole: "Founder & Lead Paediatric OT",
    accountLead: "Radzdom Gallego",
    specialist: "Erwin Manaog",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "AUD $4,500 / month",
    progress: 72,
    currentSprint: "Summit Landing Page, GHL Automated SMS Alerts & $99 Video Course",
    targetMilestone: "Dec 11 Summit Launch",
    description:
      "Clinical paediatric occupational therapy clinic delivery system. Powers automated parent enquiry routing, GoHighLevel multi-step funnels, ClassReach patient scheduling, AUD Stripe payments, and online sensory regulation courses.",
    deliverables: [
      { code: "G1", title: "Currency & GST Compliance Setup (AUD)", status: "Completed" },
      { code: "G2", title: "Course Membership Shell in GHL", status: "Completed" },
      { code: "G3", title: "Custom Fields & Therapy Stage Tags", status: "Completed" },
      { code: "G4", title: "Therapy Intake Forms with AU Disclosures", status: "Completed" },
      { code: "G5", title: "Website: Six Brand Pages (Copy & Layout)", status: "In Review" },
      { code: "G7", title: "Enquiry Workflow & Zoe Mobile Alert", status: "In Progress" },
      { code: "G11", title: "SMM 30-Day Campaign & Video Reel Batches", status: "In Progress" },
      { code: "G18", title: "Dec 11 Clinical Summit Live Readiness", status: "Queued" },
    ],
    keyTechStack: ["GoHighLevel (AU)", "Stripe Payments (AUD)", "Wix DNS", "Vimeo Enterprise", "Make.com"],
  },
  {
    id: "wrts",
    name: "We Rock the Spectrum (WRTS)",
    code: "WRTS-AU",
    industry: "Sensory Gym Franchise Operations",
    location: "Melbourne & Sydney, AU",
    contactName: "Franchise Director",
    contactRole: "National Operations Lead",
    accountLead: "Divine Origines",
    specialist: "Radzdom Gallego",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "AUD $5,200 / month",
    progress: 85,
    currentSprint: "21 n8n Automation Workflows & ClassReach Roster Sync",
    targetMilestone: "Franchise Waiver & Roster Sentinel",
    description:
      "Enterprise workflow automation for sensory gym franchises across Australia. Bridges ClassReach booking rosters with HubSpot CRM and automated parent waiver signature archiving via self-hosted n8n.",
    deliverables: [
      { code: "W01", title: "Parent waiver ingestion & Supabase record write", status: "Completed" },
      { code: "W05", title: "ClassReach attendance sync to CRM", status: "Completed" },
      { code: "W12", title: "Failed payment 3-stage dunning automated SMS", status: "In Progress" },
      { code: "W18", title: "Gym floor capacity threshold alert", status: "Queued" },
      { code: "W21", title: "Daily settlement revenue reconciliation", status: "Completed" },
    ],
    keyTechStack: ["n8n Enterprise", "ClassReach CRM", "HubSpot", "Twilio SMS", "PostgreSQL"],
  },
  {
    id: "studio-nets",
    name: "Studio Nets",
    code: "SN-AU",
    industry: "Digital Creative & Design Systems",
    location: "Sydney, NSW, AU",
    contactName: "Nathan Blake",
    contactRole: "Creative Director",
    accountLead: "Erwin Manaog",
    specialist: "BJ Ricafrente",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "USD $2,800 / month",
    progress: 60,
    currentSprint: "Creative Production Playbook & Fathom Integrations",
    targetMilestone: "SOP Standardization Complete",
    description:
      "Operational systemization for a boutique digital creative agency. Bridges Figma design asset reviews with client sign-off checklists, ClickUp task generation, and automated Fathom meeting summary transcript extraction.",
    deliverables: [
      { code: "SN-01", title: "Client intake questionnaire and Figma folder generator", status: "Completed" },
      { code: "SN-02", title: "Creative production SOP & Fathom call sync", status: "Completed" },
      { code: "SN-03", title: "Client feedback portal and approval states", status: "In Progress" },
      { code: "SN-04", title: "Resource allocation & contractor billing matrix", status: "Queued" },
    ],
    keyTechStack: ["Figma Enterprise", "Fathom AI", "ClickUp", "Google Workspace"],
  },
  {
    id: "invogue-cleans",
    name: "InVogue Cleans",
    code: "IVC-US",
    industry: "Residential & Commercial Cleaning",
    location: "Brisbane, Queensland, AU",
    contactName: "Matthew Robbins",
    contactRole: "Founder & Managing Director",
    accountLead: "Ma. Rose Anne (RA) Malinao",
    specialist: "Joy Fabular",
    status: "Proposal Staged",
    statusVariant: "review",
    retainer: "USD $1,700 / month",
    progress: 35,
    currentSprint: "CRM Follow-up & Retention System Architecture",
    targetMilestone: "90-Day Retention Roadmap Presentation",
    description:
      "Lead conversion and customer retention system for premium cleaning services. Targets recurring subscription churn reduction through automated satisfaction surveys, quote reminders, and cleaner dispatching alerts.",
    deliverables: [
      { code: "IVC-01", title: "30-60-90 Day Retention strategy & lead magnet proposal", status: "Completed" },
      { code: "IVC-02", title: "Instant estimate calculator and SMS quote follow-up", status: "In Progress" },
      { code: "IVC-03", title: "Cleaner dispatch alerts via WhatsApp/SMS", status: "Queued" },
    ],
    keyTechStack: ["ClickUp", "Twilio SMS", "GoHighLevel", "Stripe Invoicing"],
  },
  {
    id: "aaron-ofosu",
    name: "Aaron Ofosu Bootcamp",
    code: "AO-AU",
    industry: "High-Performance Athletic Fitness",
    location: "Gold Coast, Queensland, AU",
    contactName: "Aaron Ofosu",
    contactRole: "Founder & Elite Strength Coach",
    accountLead: "Divine Origines",
    specialist: "Radzdom Gallego",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "AUD $3,200 / month",
    progress: 50,
    currentSprint: "Athlete Onboarding & Membership Checkout Portal",
    targetMilestone: "Summer Bootcamp Intake Launch",
    description:
      "Full digital athlete onboarding and recurring subscription billing infrastructure. Automates liability waivers, trainer scheduling, nutrition plan PDF distribution, and Stripe recurring memberships.",
    deliverables: [
      { code: "AO-01", title: "Athlete liability waiver & health questionnaire", status: "Completed" },
      { code: "AO-02", title: "Stripe subscription checkout with coupon rules", status: "In Progress" },
      { code: "AO-03", title: "Class capacity & trainer dispatch alert", status: "Queued" },
    ],
    keyTechStack: ["Stripe Billing", "Google Workspace", "ClickUp", "Typeform"],
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
];

interface ClientPortfolioViewProps {
  onSelectTasks?: (clientName: string) => void;
  clientScope?: string | string[];
  currentUserName?: string;
  currentUserNickname?: string;
  isCoreAdmin?: boolean;
}

export function ClientPortfolioView({
  onSelectTasks,
  clientScope = "all",
  currentUserName = "Radzdom Gallego",
  currentUserNickname = "Radz",
  isCoreAdmin = true,
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
      const allowed = Array.isArray(clientScope) ? clientScope : [clientScope];
      return allowed.some(
        (scope) =>
          c.name.toLowerCase().includes(scope.toLowerCase()) ||
          scope.toLowerCase().includes(c.name.toLowerCase())
      );
    }
    return true;
  });

  const [selectedClientId, setSelectedClientId] = useState<string>(
    accessibleClients[0]?.id || "little-treasures"
  );
  const [activeSubTab, setActiveSubTab] = useState<"calendar" | "board" | "dossier">("calendar");

  // Modals & Tasks State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [boardAssigneeFilter, setBoardAssigneeFilter] = useState("All");
  const [boardPriorityFilter, setBoardPriorityFilter] = useState("All");

  const isAllClients = selectedClientId === "all";

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
      const clientQuery = isAllClients ? "all" : selectedClient.name;
      const res = await fetch(`/api/tasks?client=${encodeURIComponent(clientQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
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

  // Status board grouping (including Closed deliverables)
  const boardColumns: { status: TaskItem["status"]; title: string; color: string }[] = [
    { status: "To Do", title: "To Do", color: "border-slate-300 bg-slate-50 text-slate-800" },
    { status: "In Progress", title: "In Progress", color: "border-[#518E6A] bg-[#518E6A]/10 text-[#3D5249]" },
    { status: "In Review", title: "In Review", color: "border-amber-400 bg-amber-50 text-amber-900" },
    { status: "Approved", title: "Approved / Done", color: "border-emerald-500 bg-emerald-50 text-emerald-900" },
    { status: "Closed", title: "Closed / Completed", color: "border-purple-400 bg-purple-50 text-purple-950" },
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

          {/* ALL CLIENTS PILL */}
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
        </div>
      </div>

      {/* 2. SUB-TAB SWITCHER (Calendar, Board, Dossier) */}
      <div className="flex border-b border-[#3D5249]/15 bg-white rounded-t-2xl px-4 pt-2 shadow-xs">
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
              {/* Assignee Filter */}
              <div className="flex items-center gap-1.5 bg-[#FBF6F3] border border-[#E8E2DD] px-2.5 py-1 rounded-xl text-xs">
                <User className="w-3.5 h-3.5 text-[#65746C]" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 items-start">
            {boardColumns.map((col) => {
              const colTasks = tasks
                .filter((t) => {
                  if (boardAssigneeFilter !== "All" && (t.assignee_name || "Unassigned") !== boardAssigneeFilter) return false;
                  if (boardPriorityFilter !== "All" && t.priority !== boardPriorityFilter) return false;
                  return true;
                })
                .filter(
                  (t) => t.status.toLowerCase() === col.status.toLowerCase()
                );

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
                        const isOverdue = !isClosed && dueDateObj && dueDateObj.getTime() < new Date(2026, 10, 3).getTime();

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
