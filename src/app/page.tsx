"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  Bot,
  Workflow,
  Users,
  BarChart3,
  Settings,
  Search,
  Bell,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Zap,
  ArrowUpRight,
  UserPlus,
  Mail,
  KeyRound,
  Lock,
  Unlock,
  XCircle,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  ShieldAlert,
  Sliders,
  Check,
  X,
  FileCheck2,
  AlertTriangle,
  Menu,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { TaskBacklogView } from "@/components/tasks/TaskBacklogView";
import { ClientPortfolioView } from "@/components/clients/ClientPortfolioView";
import { DeliverableSignOffQueue } from "@/components/approvals/DeliverableSignOffQueue";
import { MessagingCenter } from "@/components/messaging/MessagingCenter";
import { TeamCapacityWorksheet } from "@/components/capacity/TeamCapacityWorksheet";
import { ClientPortalView } from "@/components/client-portal/ClientPortalView";
import { SopPlaybookLibrary } from "@/components/library/SopPlaybookLibrary";
import { UserInvitationModal } from "@/components/invitations/UserInvitationModal";
import { EditClientAccessModal, TeamMemberAccess } from "@/components/team/EditClientAccessModal";

type NavTab =
  | "overview"
  | "clients"
  | "tasks"
  | "approvals"
  | "messaging"
  | "capacity"
  | "library"
  | "team"
  | "settings";

type UserRole =
  | "Owner"
  | "Admin"
  | "Operations Manager"
  | "Project Owner"
  | "Team Member"
  | "Client User";

interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  email: string;
  role: UserRole;
  isCoreAdmin: boolean;
  avatarColor: string;
  title: string;
  clientScope: string;
}

interface InvitationRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientScope: string;
  invitedBy: string;
  token: string;
  status: "Active" | "Pending" | "Revoked";
  createdDate: string;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    assign: boolean;
    delete: boolean;
  };
}

export default function GimDashboard() {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ClickUp Live Mirror State
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [clickupStats, setClickupStats] = useState<{
    totalTasks: number;
    openCount: number;
    inProgressCount: number;
    reviewCount: number;
    closedCount: number;
    blockedCount: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/clickup/tasks")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setClickupStats(json.data.stats);
        }
      })
      .catch((err) => console.error("Failed to load clickup stats:", err));
  }, []);

  // User Profiles with editable nicknames
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({
    divine: {
      id: "divine",
      name: "Divine Origines",
      nickname: "Divine",
      email: "divine@graceinmotion.agency",
      role: "Owner",
      isCoreAdmin: true,
      avatarColor: "bg-[#466B53]",
      title: "Founder & Strategy Lead",
      clientScope: "all",
    },
    radz: {
      id: "radz",
      name: "Radzdom Gallego",
      nickname: "Radz",
      email: "radz@graceinmotion.agency",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#518E6A]",
      title: "Admin / AI & Automations Specialist",
      clientScope: "all",
    },
    ra: {
      id: "ra",
      name: "Ma. Rose Anne Malinao",
      nickname: "RA",
      email: "ra@graceinmotion.agency",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#3D5249]",
      title: "Admin / Operations & Commercial",
      clientScope: "all",
    },
    erwin: {
      id: "erwin",
      name: "Erwin Manaog",
      nickname: "Erwin",
      email: "erwin@graceinmotion.agency",
      role: "Project Owner",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Project Owner (Little Treasures)",
      clientScope: "Little Treasures Company",
    },
    zoe: {
      id: "zoe",
      name: "Zoe Horner",
      nickname: "Zoe",
      email: "zoe@littletreasures.com.au",
      role: "Client User",
      isCoreAdmin: false,
      avatarColor: "bg-[#518E6A]",
      title: "Founder, Little Treasures",
      clientScope: "Little Treasures Company",
    },
  });

  const [currentUserKey, setCurrentUserKey] = useState<string>("radz");
  const currentUser = userProfiles[currentUserKey];

  // Nickname & Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentUser.name,
    nickname: currentUser.nickname,
    title: currentUser.title,
  });

  const handleOpenEditProfile = () => {
    setEditForm({
      name: currentUser.name,
      nickname: currentUser.nickname,
      title: currentUser.title,
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfiles({
      ...userProfiles,
      [currentUserKey]: {
        ...currentUser,
        name: editForm.name,
        nickname: editForm.nickname,
        title: editForm.title,
      },
    });
    setIsEditProfileOpen(false);
  };

  // RBAC Permission Check Helpers
  const hasAdminAccess = currentUser.isCoreAdmin || currentUser.role === "Owner" || currentUser.role === "Admin";
  const isClientUser = currentUser.role === "Client User";

  // Invitation Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editAccessMember, setEditAccessMember] = useState<TeamMemberAccess | null>(null);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "Team Member" as UserRole,
    clientScope: "all",
    permissions: {
      view: true,
      create: false,
      edit: false,
      assign: false,
      delete: false,
    },
  });

  // Provisioning Directory
  const [invitations, setInvitations] = useState<InvitationRecord[]>([
    {
      id: "inv-1",
      email: "erwin@graceinmotion.agency",
      name: "Erwin Manaog",
      role: "Project Owner",
      clientScope: "Little Treasures Company",
      invitedBy: "Divine Origines",
      token: "gim_tok_8f92e104a",
      status: "Active",
      createdDate: "Nov 01, 2026",
      permissions: { view: true, create: true, edit: true, assign: true, delete: false },
    },
    {
      id: "inv-2",
      email: "bj@graceinmotion.agency",
      name: "BJ Ricafrente",
      role: "Operations Manager",
      clientScope: "all",
      invitedBy: "Radzdom Gallego",
      token: "gim_tok_9b71e83c0",
      status: "Active",
      createdDate: "Nov 02, 2026",
      permissions: { view: true, create: true, edit: true, assign: true, delete: false },
    },
    {
      id: "inv-3",
      email: "zoe@littletreasures.com.au",
      name: "Zoe Horner",
      role: "Client User",
      clientScope: "Little Treasures Company",
      invitedBy: "Divine Origines",
      token: "gim_tok_7c64a511f",
      status: "Active",
      createdDate: "Oct 28, 2026",
      permissions: { view: true, create: false, edit: false, assign: false, delete: false },
    },
    {
      id: "inv-4",
      email: "matthew@invoguecleans.com",
      name: "Matthew Robbins",
      role: "Client User",
      clientScope: "InVogue Cleans",
      invitedBy: "RA Malinao",
      token: "gim_tok_4e12c980b",
      status: "Pending",
      createdDate: "Nov 02, 2026",
      permissions: { view: true, create: false, edit: false, assign: false, delete: false },
    },
  ]);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.name) return;

    const newInvite: InvitationRecord = {
      id: `inv-${Date.now()}`,
      email: inviteForm.email,
      name: inviteForm.name,
      role: inviteForm.role,
      clientScope: inviteForm.clientScope,
      invitedBy: `${currentUser.name} (${currentUser.nickname})`,
      token: `gim_tok_${Math.random().toString(36).substring(2, 10)}`,
      status: "Pending",
      createdDate: "Just now",
      permissions: inviteForm.permissions,
    };

    setInvitations([newInvite, ...invitations]);
    setIsInviteModalOpen(false);
    setInviteForm({
      name: "",
      email: "",
      role: "Team Member",
      clientScope: "all",
      permissions: { view: true, create: false, edit: false, assign: false, delete: false },
    });
  };

  const handleRevokeInvite = (id: string) => {
    setInvitations(
      invitations.map((inv) =>
        inv.id === id ? { ...inv, status: "Revoked" } : inv
      )
    );
  };

  // Grouped Navigation — Clean Operational IA
  const navSections = [
    {
      title: "Operations",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "clients", label: "Client Portfolio", icon: Building2, badge: "6" },
        {
          id: "tasks",
          label: "Tasks & Backlog",
          icon: CheckSquare,
          badge: clickupStats
            ? clickupStats.reviewCount > 0
              ? `${clickupStats.reviewCount} Review`
              : `${clickupStats.totalTasks}`
            : "Live",
        },
        {
          id: "approvals",
          label: "Sign-Off Queue",
          icon: FileCheck2,
          badge: "2 Action",
        },
      ],
    },
    {
      title: "Collaboration & Knowledge",
      items: [
        { id: "messaging", label: "Team Messaging", icon: MessageSquare, badge: "Live" },
        { id: "capacity", label: "Capacity Worksheet", icon: BarChart3 },
        { id: "library", label: "SOP & Playbooks", icon: FolderKanban },
      ],
    },
    {
      title: "Organization",
      items: [
        { id: "team", label: "Team & RBAC", icon: Users, badge: "Admin" },
        { id: "settings", label: "Profile & Settings", icon: Settings },
      ],
    },
  ];

  // Client Delivery Pipeline (Verified from GIM Operating System folder: WRTS, Studio Nets, Little Treasures, etc.)
  const clientsData = [
    {
      name: "Little Treasures Company",
      code: "LT-AU",
      lead: "Erwin Manaog",
      contact: "Zoe Horner (Founder)",
      currentSprint: "GHL Website & $99 Course Build",
      status: "Active Sprint",
      statusVariant: "active" as const,
      milestone: "Summit Ready: Fri 11 Dec 2026",
      tasksCount: "18 subtasks",
      retainer: "AUD $875 / wk",
      progress: 72,
    },
    {
      name: "WRTS (We Rock the Spectrum)",
      code: "WRTS-US",
      lead: userProfiles.radz.nickname,
      contact: "Operations Director",
      currentSprint: "21 n8n Automations & Intake Sync",
      status: "Active Sprint",
      statusVariant: "active" as const,
      milestone: "Workflow Verification & Live Handover",
      tasksCount: "21 workflows",
      retainer: "USD $3,200 / mo",
      progress: 85,
    },
    {
      name: "Studio Nets",
      code: "SN-US",
      lead: "Erwin Manaog",
      contact: "Creative Lead",
      currentSprint: "Operations Playbook & Fathom Integrations",
      status: "Active Sprint",
      statusVariant: "active" as const,
      milestone: "SOP Standardization",
      tasksCount: "8 items",
      retainer: "USD $2,800 / mo",
      progress: 60,
    },
    {
      name: "InVogue Cleans",
      code: "IVC-US",
      lead: "Pending PO",
      contact: "Matthew Robbins (Founder)",
      currentSprint: "CRM Follow-up & Retention System",
      status: "Proposal Staged",
      statusVariant: "review" as const,
      milestone: "90-Day Retention Roadmap",
      tasksCount: "Scoped",
      retainer: "USD $1,700 / mo",
      progress: 35,
    },
    {
      name: "Aaron Ofosu Bootcamp",
      code: "AO-US",
      lead: "Pending PO",
      contact: "Aaron Ofosu (Founder)",
      currentSprint: "Student Onboarding & GHL Structure",
      status: "Discovery Intake",
      statusVariant: "upcoming" as const,
      milestone: "Cohort 1 Launch Readiness",
      tasksCount: "Intake Staged",
      retainer: "USD $4,000 / mo",
      progress: 20,
    },
    {
      name: "Tch2Thrive",
      code: "T2T-US",
      lead: "Pending PO",
      contact: "Dr. Gloria Ramos Gonzalez",
      currentSprint: "Contract Path & ClickUp SOP Library",
      status: "Proposal Staged",
      statusVariant: "review" as const,
      milestone: "District Conference Pipeline",
      tasksCount: "30-60-90 Plan",
      retainer: "USD $2,500 / mo",
      progress: 40,
    },
  ];

  // Filter clients based on user scope
  const visibleClients = clientsData.filter((client) => {
    if (currentUser.clientScope === "all") return true;
    return client.name === currentUser.clientScope;
  });

  // Critical delivery checkpoints
  const urgentTasks = [
    {
      code: "G5",
      title: "Website: Six pages in Zoe's brand (copy & styling)",
      assignee: userProfiles.radz.nickname,
      reviewer: "Erwin",
      status: "For Review",
      account: "Little Treasures",
      priority: "High",
      deadline: "Today",
    },
    {
      code: "G7",
      title: "Enquiry workflow and Zoe's phone SMS alert",
      assignee: userProfiles.radz.nickname,
      reviewer: "Erwin",
      status: "For Review",
      account: "Little Treasures",
      priority: "High",
      deadline: "Tomorrow",
    },
    {
      code: "G14",
      title: "Custom domain DNS & transactional sending email configuration",
      assignee: "Erwin",
      reviewer: userProfiles.divine.nickname,
      status: "Upcoming",
      account: "Little Treasures",
      priority: "Normal",
      deadline: "Nov 06",
    },
    {
      code: "G16",
      title: "Batch 3 test: real purchase & refund verification",
      assignee: userProfiles.radz.nickname,
      reviewer: "Erwin",
      status: "Upcoming",
      account: "Little Treasures",
      priority: "Critical",
      deadline: "Nov 09",
    },
  ];

  // Team capacity and workload matrix
  const teamWorkload = [
    {
      name: userProfiles.divine.name,
      nickname: userProfiles.divine.nickname,
      role: "Owner · Strategy Lead",
      focus: "Executive Direction & Client Discovery",
      load: "6 Active Accounts",
      status: "At Capacity",
      initials: "DO",
      color: "bg-[#466B53]",
    },
    {
      name: userProfiles.radz.name,
      nickname: userProfiles.radz.nickname,
      role: "Admin · Automation Specialist & Tech Lead",
      focus: "Platform Architecture, GHL & n8n Workflows",
      load: "8 Active Tasks",
      status: "Optimal",
      initials: "RG",
      color: "bg-[#518E6A]",
    },
    {
      name: userProfiles.ra.name,
      nickname: userProfiles.ra.nickname,
      role: "Admin · Commercial & Operations",
      focus: "Invoicing, Contracts & Subcontractors",
      load: "Commercial Operations & Billing",
      status: "Optimal",
      initials: "RA",
      color: "bg-[#3D5249]",
    },
    {
      name: userProfiles.erwin.name,
      nickname: userProfiles.erwin.nickname,
      role: "Project Owner · Delivery Lead",
      focus: "Little Treasures & Studio Nets Sprint Velocity",
      load: "14 Sprint Subtasks",
      status: "Heavy Load",
      initials: "EM",
      color: "bg-[#466B53]",
    },
    {
      name: "BJ Ricafrente",
      nickname: "BJ",
      role: "Operations Specialist",
      focus: "Client Kickoffs & Tool Subscriptions",
      load: "3 Workflows",
      status: "Available",
      initials: "BR",
      color: "bg-slate-600",
    },
  ];

  // Recent operational activity
  const recentActivities = [
    {
      time: "5 mins ago",
      actor: `${userProfiles.radz.name} (${userProfiles.radz.nickname})`,
      action: "Updated GIM branding and profile nickname management",
      target: "Profile System",
    },
    {
      time: "2 hours ago",
      actor: `${userProfiles.erwin.name} (${userProfiles.erwin.nickname})`,
      action: "Updated review notes on Gate G5 (Website 6 Pages)",
      target: "Little Treasures",
    },
    {
      time: "Yesterday",
      actor: `${userProfiles.divine.name} (${userProfiles.divine.nickname})`,
      action: "Approved scope and 30-60-90 roadmap for InVogue Cleans",
      target: "InVogue Cleans",
    },
    {
      time: "Oct 31",
      actor: `${userProfiles.radz.name} (${userProfiles.radz.nickname})`,
      action: "Audited ClickUp list 1301240000003883 (21 tasks mapped)",
      target: "ClickUp Sync",
    },
  ];

  const renderSidebarContent = () => (
    <>
      <div className="overflow-y-auto flex-1">
        {/* Authentic GIM Logo & Just "GIM" (No generic subtitles) */}
        <div className="px-5 py-4 border-b border-[#466B53]/40 bg-[#34463E]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 relative shrink-0 flex items-center justify-center">
              <Image
                src="/gim-mark-white.png"
                alt="GIM"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base tracking-tight text-white leading-none">
                GIM
              </h1>
            </div>
          </div>
        </div>

        {/* Grouped Domain Navigation */}
        <div className="p-3 space-y-4">
          {navSections.map((section, idx) => {
            if (isClientUser && section.title === "Organization") return null;

            return (
              <div key={idx} className="space-y-0.5">
                <div className="px-3 text-[10px] font-semibold text-[#FBF6F3]/50 uppercase tracking-wider mb-1">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  if (isClientUser && ["team", "settings", "automations"].includes(item.id)) {
                    return null;
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as NavTab);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-[#518E6A] text-white shadow-xs font-semibold"
                          : "text-[#FBF6F3]/80 hover:bg-[#466B53]/40 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-white" : "text-[#FBF6F3]/70"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[#466B53]/60 text-[#FBF6F3]/90"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer User Badge with Edit Nickname Trigger */}
      <div className="p-3.5 border-t border-[#466B53]/40 bg-[#34463E] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-white/20 shadow-xs`}
            >
              {currentUser.nickname.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-tight flex items-center space-x-1">
                <span>{currentUser.name}</span>
                <span className="text-[#FBF6F3]/60 font-normal">({currentUser.nickname})</span>
              </p>
              <div className="flex items-center space-x-1 mt-0.5">
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                    currentUser.isCoreAdmin
                      ? "bg-[#518E6A] text-white"
                      : "bg-white/15 text-white/80"
                  }`}
                >
                  {currentUser.role}
                </span>
                {currentUser.isCoreAdmin && (
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleOpenEditProfile}
            title="Edit Nickname & Profile"
            className="p-1.5 text-[#FBF6F3]/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-[#FBF6F3] text-[#242E29] overflow-hidden font-sans">
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR NAVIGATION — BESPOKE GIM FOREST GREEN (#3D5249) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex w-64 bg-[#3D5249] text-[#FBF6F3] flex-col justify-between shrink-0 border-r border-[#466B53]/30 shadow-md select-none">
        {renderSidebarContent()}
      </aside>

      {/* MOBILE SLIDE-OVER DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <aside className="relative w-64 max-w-[80%] bg-[#3D5249] text-[#FBF6F3] flex flex-col justify-between h-full shadow-xl z-10">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN APPLICATION WORKSPACE */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* TOP HEADER */}
        <header className="h-16 bg-[#FBF6F3] border-b border-[#E8E2DD] px-4 sm:px-8 flex items-center justify-between shrink-0 gap-3">
          {/* Left Header: Mobile hamburger & Context breadcrumb or Settings Search */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-[#65746C] hover:text-[#242E29] hover:bg-white md:hidden shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {activeTab === "settings" && hasAdminAccess ? (
              <div className="relative w-full max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
                <input
                  type="text"
                  placeholder="Search settings, permissions, accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-12 py-1.5 bg-white border border-[#E8E2DD] rounded-lg text-xs placeholder:text-[#65746C]/60 text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A] focus:border-[#518E6A] transition-all"
                />
                <span className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-[#65746C]/50 font-mono bg-[#FBF6F3] px-1 py-0.5 rounded border border-[#E8E2DD]">
                  Ctrl K
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 truncate">
                <span className="font-bold text-sm text-[#242E29] truncate">
                  {activeTab === "overview"
                    ? "Agency Operations Overview"
                    : activeTab === "clients"
                    ? "Client Operations Portfolio"
                    : activeTab === "tasks"
                    ? "Tasks & Delivery Backlog"
                    : activeTab === "approvals"
                    ? "Deliverable Sign-Off Queue"
                    : activeTab === "messaging"
                    ? "Internal Team Messaging Hub"
                    : activeTab === "capacity"
                    ? "Team Capacity Worksheet"
                    : activeTab === "library"
                    ? "SOP & Client Playbooks"
                    : activeTab === "team"
                    ? "Team Directory & RBAC"
                    : "Profile & Settings"}
                </span>
                <span className="hidden sm:inline-block text-[10px] text-[#65746C] font-mono px-1.5 py-0.5 rounded bg-white border border-[#E8E2DD]">
                  GIM OS
                </span>
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            {/* Active Sprint Context Pill (Desktop only) */}
            <div className="hidden xl:flex items-center space-x-2 px-3 py-1 bg-white border border-[#E8E2DD] rounded-lg text-xs shadow-xs whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#518E6A] animate-pulse"></span>
              <span className="font-semibold text-[#242E29]">Little Treasures Sprint</span>
              <span className="text-[#65746C] text-[10px]">·</span>
              <span className="text-[11px] text-[#466B53] font-medium">Dec 11 Launch Target</span>
            </div>

            {/* Profile Switcher, Edit Nickname, and Invite Buttons: ONLY visible on Settings Tab for 3 Owners */}
            {activeTab === "settings" && hasAdminAccess && (
              <>
                <div className="flex items-center space-x-1.5 bg-white border border-[#E8E2DD] rounded-lg px-2 py-1 shadow-xs">
                  <KeyRound className="w-3.5 h-3.5 text-[#518E6A] shrink-0" />
                  <select
                    value={currentUserKey}
                    onChange={(e) => setCurrentUserKey(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-[#242E29] focus:outline-none cursor-pointer pr-1"
                  >
                    <optgroup label="Core Admin Team (Universal Full Access)">
                      <option value="radz">{userProfiles.radz.name} ({userProfiles.radz.nickname})</option>
                      <option value="divine">{userProfiles.divine.name} ({userProfiles.divine.nickname})</option>
                      <option value="ra">{userProfiles.ra.name} ({userProfiles.ra.nickname})</option>
                    </optgroup>
                    <optgroup label="Scoped Roles (RBAC Sandbox)">
                      <option value="erwin">{userProfiles.erwin.name} ({userProfiles.erwin.nickname})</option>
                      <option value="zoe">{userProfiles.zoe.name} ({userProfiles.zoe.nickname})</option>
                    </optgroup>
                  </select>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Edit2 className="w-3 h-3 text-[#518E6A]" />}
                  onClick={handleOpenEditProfile}
                >
                  Edit Nickname
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={<Mail className="w-3.5 h-3.5" />}
                  className="hidden sm:inline-flex shadow-xs"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  Invite User / Client
                </Button>
              </>
            )}

            {/* Clean User Presence Pill when on other dashboard tabs */}
            {activeTab !== "settings" && (
              <div className="flex items-center space-x-2 px-2.5 py-1 bg-white border border-[#E8E2DD] rounded-lg text-xs shadow-xs">
                <div
                  className={`w-5 h-5 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}
                >
                  {currentUser.nickname.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-[#242E29] truncate max-w-[120px] sm:max-w-none">
                  {currentUser.nickname}
                </span>
                {currentUser.isCoreAdmin && (
                  <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#518E6A] text-white">
                    Core Admin
                  </span>
                )}
              </div>
            )}

            {/* Notifications */}
            <button className="relative p-2 text-[#65746C] hover:text-[#242E29] rounded-lg hover:bg-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Client User Isolation Notice */}
        {isClientUser && (
          <div className="bg-[#FAF3EB] border-b border-[#E8DCCF] px-4 sm:px-8 py-2 flex items-center justify-between text-xs text-[#6B4E3D]">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#8C5D38] shrink-0" />
              <span>
                <strong>Client User View Active:</strong> Authenticated as <strong>{currentUser.name} ({currentUser.nickname})</strong>. Access is restricted strictly to <strong>{currentUser.clientScope}</strong>. Internal operations, financial metrics, and core admin controls are isolated.
              </span>
            </div>
            <button
              onClick={() => setCurrentUserKey("radz")}
              className="font-semibold underline hover:text-[#4A3225] text-[11px]"
            >
              Switch to Core Admin
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. DYNAMIC TAB WORKSPACE CANVAS */}
        {/* ========================================================================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {isClientUser ? (
            <ClientPortalView onExitPreview={() => setCurrentUserKey("radz")} />
          ) : (
            <>
              {/* ========================================================================= */}
              {/* TAB 1: OVERVIEW — OPERATIONAL MISSION CONTROL */}
              {/* ========================================================================= */}
              {activeTab === "overview" && (
            <>
              {/* PAGE TITLE BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#242E29]">
                    Operations Overview
                  </h2>
                  <p className="text-xs text-[#65746C] mt-0.5">
                    Central operating hub for client deliveries, gate reviews, and team capacity.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#65746C]">Mirror Source:</span>
                  <Badge variant="brand">ClickUp (Read-Only Mirror)</Badge>
                </div>
              </div>

              {/* 1. COMPACT OPERATIONAL SUMMARY STRIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Accounts */}
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#65746C]">
                        Active Client Accounts
                      </p>
                      <div className="text-2xl font-bold text-[#242E29] mt-1">
                        {visibleClients.length}
                      </div>
                      <p className="text-[11px] text-[#466B53] font-medium mt-0.5">
                        3 Primary Builds · 3 Staged
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#466B53]/10 text-[#466B53] flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Sprint Tasks */}
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#65746C]">
                        Sprint Tasks (ClickUp Mirror)
                      </p>
                      <div className="text-2xl font-bold text-[#242E29] mt-1">
                        {clickupStats ? clickupStats.totalTasks : 193}
                      </div>
                      <p className="text-[11px] text-[#518E6A] font-medium mt-0.5">
                        {clickupStats
                          ? `${clickupStats.closedCount} Closed · ${clickupStats.openCount + clickupStats.inProgressCount} Open`
                          : "94 Closed · 97 Open"}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#518E6A]/10 text-[#518E6A] flex items-center justify-center">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Review Checkpoints */}
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#65746C]">
                        Needs Review & Checkpoints
                      </p>
                      <div className="text-2xl font-bold text-[#242E29] mt-1">
                        {clickupStats ? clickupStats.reviewCount : 2}
                      </div>
                      <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                        G5 Website Pages & G7 Enquiry Flow
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Summit Countdown */}
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#65746C]">
                        Summit Launch Deadline
                      </p>
                      <div className="text-2xl font-bold text-[#242E29] mt-1">
                        38 Days
                      </div>
                      <p className="text-[11px] text-[#3D5249] font-medium mt-0.5">
                        Hard Target: Fri 11 Dec 2026
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#3D5249]/10 text-[#3D5249] flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 2. NEEDS ATTENTION / BLOCKERS BANNER */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-md bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">
                      Immediate Action Required: 2 QA Checkpoints Pending Review
                    </h4>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      Gate <strong>G5 (Website 6 Pages in Zoe's Brand)</strong> and <strong>G7 (Enquiry Workflow & Alert)</strong> are awaiting QA sign-off by Erwin Manaog before proceeding to domain and payment tests.
                    </p>
                  </div>
                </div>
                <Button
                  variant="dark"
                  size="sm"
                  className="whitespace-nowrap shrink-0"
                  onClick={() => {
                    setTaskStatusFilter("for review");
                    setActiveTab("tasks");
                  }}
                >
                  Review Checkpoints
                </Button>
              </div>

              {/* 3. CLIENT DELIVERY PIPELINE & QA GATES GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2-Column: Active Client Accounts Table */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Client Delivery Pipeline</CardTitle>
                        <CardDescription>
                          {isClientUser ? "Authorized Organization" : "Active accounts and ongoing delivery sprints"}
                        </CardDescription>
                      </div>
                      <Badge variant="brand">{visibleClients.length} Accounts</Badge>
                    </CardHeader>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FBF6F3] text-[#65746C] font-semibold border-b border-[#E8E2DD]">
                          <tr>
                            <th className="py-2.5 px-4">Account</th>
                            <th className="py-2.5 px-4">Project Lead</th>
                            <th className="py-2.5 px-4">Sprint & Velocity</th>
                            <th className="py-2.5 px-4">Milestone</th>
                            <th className="py-2.5 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E2DD]/70">
                          {visibleClients.map((client, idx) => (
                            <tr key={idx} className="hover:bg-[#FBF6F3]/50 transition-colors">
                              <td className="py-3 px-4 font-semibold text-[#242E29]">
                                <div>{client.name}</div>
                                <div className="text-[10px] text-[#65746C] font-normal">
                                  {client.contact}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-[#242E29] font-medium">
                                {client.lead}
                              </td>
                              <td className="py-3 px-4 text-[#242E29]">
                                <div>{client.currentSprint}</div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="w-20 bg-[#E8E2DD] rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="bg-[#518E6A] h-1.5 rounded-full"
                                      style={{ width: `${client.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[10px] text-[#518E6A] font-medium">
                                    {client.progress}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-[#65746C]">
                                {client.milestone}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={client.statusVariant} dot>
                                  {client.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>

                {/* 1-Column: Sprint Delivery QA Gates */}
                <div>
                  <Card className="h-full flex flex-col justify-between">
                    <div>
                      <CardHeader>
                        <div>
                          <CardTitle>Delivery QA Gates</CardTitle>
                          <CardDescription>
                            Little Treasures verification gates
                          </CardDescription>
                        </div>
                        <ShieldCheck className="w-4 h-4 text-[#518E6A]" />
                      </CardHeader>

                      <div className="p-3.5 space-y-2">
                        {urgentTasks.map((task, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border border-[#E8E2DD] bg-[#FBF6F3]/40 hover:border-[#518E6A]/50 transition-all text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-[#3D5249] text-[10px] bg-[#466B53]/15 px-1.5 py-0.2 rounded border border-[#466B53]/25">
                                  {task.code}
                                </span>
                                <span className="font-semibold text-[#242E29] line-clamp-1">
                                  {task.title}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E8E2DD]/60 text-[10px] text-[#65746C]">
                              <span>Assignee: <strong>{task.assignee}</strong></span>
                              <span>Reviewer: <strong>{task.reviewer}</strong></span>
                              <Badge
                                variant={task.status === "For Review" ? "review" : "upcoming"}
                              >
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 border-t border-[#E8E2DD] bg-[#FBF6F3]/60 text-center">
                      <button
                        onClick={() => {
                          setTaskStatusFilter("all");
                          setActiveTab("tasks");
                        }}
                        className="text-xs font-semibold text-[#466B53] hover:text-[#3D5249] flex items-center justify-center space-x-1 w-full transition-colors"
                      >
                        <span>
                          View All {clickupStats ? clickupStats.totalTasks : 193} ClickUp Tasks (Read-Only)
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                </div>
              </div>

              {/* 4. TEAM CAPACITY LEDGER & RECENT ACTIVITY */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2-Column: Team Workload & Assignments */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Team Capacity & Role Allocation</CardTitle>
                        <CardDescription>
                          Assignees, operational load, and focus areas across active accounts
                        </CardDescription>
                      </div>
                      <Badge variant="neutral">5 Team Members</Badge>
                    </CardHeader>

                    <div className="divide-y divide-[#E8E2DD]/60">
                      {teamWorkload.map((member, idx) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#FBF6F3]/40 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full ${member.color} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                              {member.initials}
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#242E29]">
                                {member.name} <span className="text-[#65746C] font-normal">({member.nickname})</span>
                              </h4>
                              <p className="text-[11px] text-[#65746C]">{member.role}</p>
                            </div>
                          </div>
                          <div className="hidden sm:block text-right">
                            <p className="text-[#242E29] font-medium text-[11px]">{member.focus}</p>
                            <p className="text-[10px] text-[#65746C]">{member.load}</p>
                          </div>
                          <div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              member.status === "At Capacity"
                                ? "bg-amber-100 text-amber-800"
                                : member.status === "Optimal"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {member.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* 1-Column: Recent Operational Activity */}
                <div>
                  <Card className="h-full flex flex-col justify-between">
                    <div>
                      <CardHeader>
                        <div>
                          <CardTitle>Recent Activity</CardTitle>
                          <CardDescription>Verified system audit log</CardDescription>
                        </div>
                        <Clock className="w-4 h-4 text-[#65746C]" />
                      </CardHeader>

                      <div className="p-3.5 space-y-3">
                        {recentActivities.map((act, idx) => (
                          <div key={idx} className="text-xs space-y-0.5 border-b border-[#E8E2DD]/50 pb-2.5 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#242E29]">{act.actor}</span>
                              <span className="text-[10px] text-[#65746C]">{act.time}</span>
                            </div>
                            <p className="text-[11px] text-[#65746C]">{act.action}</p>
                            <div className="pt-0.5">
                              <span className="text-[9px] font-semibold text-[#466B53] bg-[#466B53]/10 px-1.5 py-0.2 rounded">
                                {act.target}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 border-t border-[#E8E2DD] bg-[#FBF6F3]/40 text-center">
                      <span className="text-[10px] text-[#65746C]">ClickUp Read-Only Connected</span>
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* TAB: CLIENT PORTFOLIO COMMAND CENTER */}
          {/* ========================================================================= */}
          {activeTab === "clients" && (
            <ClientPortfolioView
              clientScope={currentUser.clientScope}
              onSelectTasks={(clientName) => {
                setTaskSearchQuery(clientName);
                setActiveTab("tasks");
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: TASKS & DELIVERY PIPELINE (CLICKUP READ-ONLY MIRROR) */}
          {/* ========================================================================= */}
          {activeTab === "tasks" && (
            <TaskBacklogView
              initialStatusFilter={taskStatusFilter}
              initialSearch={taskSearchQuery}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: DELIVERABLE SIGN-OFF QUEUE (QUALITY GATES) */}
          {/* ========================================================================= */}
          {activeTab === "approvals" && (
            <DeliverableSignOffQueue
              currentUserName={currentUser.name}
              currentUserNickname={currentUser.nickname}
              isCoreAdmin={currentUser.isCoreAdmin}
              clientScope={currentUser.clientScope}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: TEAM MESSAGING & COMMUNICATION HUB */}
          {/* ========================================================================= */}
          {activeTab === "messaging" && (
            <MessagingCenter
              currentUserId={currentUser.id}
              currentUserName={currentUser.name}
              currentUserNickname={currentUser.nickname}
              currentUserRole={currentUser.role}
              isCoreAdmin={currentUser.isCoreAdmin}
              avatarColor={currentUser.avatarColor}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: TEAM CAPACITY & WORKLOAD WORKSHEET */}
          {/* ========================================================================= */}
          {activeTab === "capacity" && (
            <TeamCapacityWorksheet />
          )}

          {/* ========================================================================= */}
          {/* TAB: INTERNAL SOP & PLAYBOOK LIBRARY */}
          {/* ========================================================================= */}
          {activeTab === "library" && (
            <SopPlaybookLibrary
              clientScope={currentUser.clientScope}
              isCoreAdmin={currentUser.isCoreAdmin}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 8: TEAM & ACCESS CONTROL (RBAC SYSTEM) */}
          {/* ========================================================================= */}
          {activeTab === "team" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#242E29] flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-[#466B53]" />
                    <span>Team & Access Control (RBAC)</span>
                  </h2>
                  <p className="text-xs text-[#65746C] mt-0.5">
                    Core administrative leadership, invitation provisioning, and role security boundaries.
                  </p>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Button
                    variant="secondary"
                    icon={<Edit2 className="w-4 h-4 text-[#518E6A]" />}
                    onClick={handleOpenEditProfile}
                  >
                    Edit Nickname
                  </Button>
                  {hasAdminAccess ? (
                    <Button
                      variant="primary"
                      icon={<UserPlus className="w-4 h-4" />}
                      onClick={() => setIsInviteModalOpen(true)}
                    >
                      Invite User
                    </Button>
                  ) : (
                    <div className="text-xs bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Admin Access Required</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CORE ADMIN TEAM (THREE FULL-ACCESS ACCOUNTS) */}
              <Card>
                <CardHeader className="bg-[#466B53]/5">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <KeyRound className="w-4 h-4 text-[#466B53]" />
                      <span>Full Access — Core Admin Team</span>
                    </CardTitle>
                    <CardDescription>
                      These three designated leaders have unrestricted administrative access across all clients, projects, tasks, and configurations.
                    </CardDescription>
                  </div>
                  <Badge variant="brand">Universal Authority</Badge>
                </CardHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E8E2DD]">
                  {/* 1. Divine Origines */}
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#466B53] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        DO
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#242E29]">
                          {userProfiles.divine.name} <span className="font-normal text-[#65746C]">({userProfiles.divine.nickname})</span>
                        </h4>
                        <Badge variant="dark" className="mt-0.5">Owner</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-[#242E29] space-y-0.5">
                      <p className="font-medium text-[#242E29]">Founder & Leadership</p>
                      <p className="text-[11px] text-[#65746C]">{userProfiles.divine.email}</p>
                    </div>
                    <div className="pt-2.5 border-t border-[#E8E2DD] text-[11px] space-y-1 text-[#65746C]">
                      <div className="flex items-center space-x-1.5 text-[#3D5249] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#518E6A]" />
                        <span>Full Operational & Financial Authority</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Check className="w-3 h-3 text-[#518E6A]" />
                        <span>Client Contracts & Intake Approvals</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Check className="w-3 h-3 text-[#518E6A]" />
                        <span>Team Management & Governance</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Radzdom Gallego */}
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#518E6A] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        RG
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#242E29]">
                          {userProfiles.radz.name} <span className="font-normal text-[#65746C]">({userProfiles.radz.nickname})</span>
                        </h4>
                        <Badge variant="brand" className="mt-0.5">Admin / Specialist</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-[#242E29] space-y-0.5">
                      <p className="font-medium text-[#242E29]">{userProfiles.radz.title}</p>
                      <p className="text-[11px] text-[#65746C]">{userProfiles.radz.email}</p>
                    </div>
                    <div className="pt-2.5 border-t border-[#E8E2DD] text-[11px] space-y-1 text-[#65746C]">
                      <div className="flex items-center space-x-1.5 text-[#3D5249] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#518E6A]" />
                        <span>Full Admin & Operational Access</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Check className="w-3 h-3 text-[#518E6A]" />
                        <span>Automations & Platform Architecture</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Check className="w-3 h-3 text-[#518E6A]" />
                        <span>Database, AI Workflows & Security</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. RA Malinao */}
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#3D5249] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        RA
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#242E29]">
                          {userProfiles.ra.name} <span className="font-normal text-[#65746C]">({userProfiles.ra.nickname})</span>
                        </h4>
                        <Badge variant="brand" className="mt-0.5">Admin / Core Team</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-[#242E29] space-y-0.5">
                      <p className="font-medium text-[#242E29]">{userProfiles.ra.title}</p>
                      <p className="text-[11px] text-[#65746C]">{userProfiles.ra.email}</p>
                    </div>
                    <div className="pt-2.5 border-t border-[#E8E2DD] text-[11px] space-y-1 text-[#65746C]">
                      <div className="flex items-center space-x-1.5 text-[#3D5249] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#518E6A]" />
                        <span>Full Admin & Operational Access</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Check className="w-3 h-3 text-[#518E6A]" />
                        <span>Invoicing, Subcontractors & Contracts</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Check className="w-3 h-3 text-[#518E6A]" />
                        <span>Client Deliveries & Commercial Ops</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* INVITATION & USER MANAGEMENT DIRECTORY */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Invitation & Provisioning Directory</CardTitle>
                    <CardDescription>
                      Manage team members, client users, and pending invitations.
                    </CardDescription>
                  </div>
                  <Badge variant="neutral">
                    {invitations.length + 3} Registered (3 Core + {invitations.length} Scoped)
                  </Badge>
                </CardHeader>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FBF6F3] text-[#65746C] font-semibold border-b border-[#E8E2DD]">
                      <tr>
                        <th className="py-2.5 px-4">User</th>
                        <th className="py-2.5 px-4">Role</th>
                        <th className="py-2.5 px-4">Client Scope</th>
                        <th className="py-2.5 px-4">Permissions</th>
                        <th className="py-2.5 px-4">Token & Invite Date</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2DD]/70">
                      {invitations.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#FBF6F3]/50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#242E29]">
                            <div>{inv.name}</div>
                            <div className="text-[10px] text-[#65746C] font-normal">
                              {inv.email}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="brand">{inv.role}</Badge>
                          </td>
                          <td className="py-3 px-4 text-[#242E29] font-medium">
                            {inv.clientScope === "all" ? (
                              <span className="text-[#466B53] font-semibold">All Accounts</span>
                            ) : (
                              <span className="text-[#3D5249] bg-[#466B53]/10 px-2 py-0.5 rounded border border-[#466B53]/20 text-[10px]">
                                {inv.clientScope}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1 text-[10px] font-mono">
                              <span className={`px-1 rounded ${inv.permissions.view ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-400"}`}>V</span>
                              <span className={`px-1 rounded ${inv.permissions.create ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-400"}`}>C</span>
                              <span className={`px-1 rounded ${inv.permissions.edit ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-400"}`}>E</span>
                              <span className={`px-1 rounded ${inv.permissions.assign ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-400"}`}>A</span>
                              <span className={`px-1 rounded ${inv.permissions.delete ? "bg-rose-100 text-rose-800" : "bg-gray-100 text-gray-400"}`}>D</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#65746C]">
                            <div className="font-mono text-[10px] text-[#242E29]">{inv.token}</div>
                            <div className="text-[10px] text-[#65746C]">{inv.createdDate} by {inv.invitedBy}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                inv.status === "Active"
                                  ? "active"
                                  : inv.status === "Pending"
                                  ? "review"
                                  : "critical"
                              }
                              dot
                            >
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {hasAdminAccess ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditAccessMember({
                                      id: inv.id,
                                      name: inv.name,
                                      nickname: inv.name.split(" ")[0],
                                      email: inv.email,
                                      role: inv.role,
                                      assignedClients: inv.clientScope === "all" ? [] : [inv.clientScope],
                                    });
                                  }}
                                  className="text-[11px] text-[#518E6A] hover:text-[#466B53] font-semibold underline"
                                >
                                  Edit Scope
                                </button>
                                {inv.status !== "Revoked" && (
                                  <button
                                    onClick={() => handleRevokeInvite(inv.id)}
                                    className="text-[11px] text-rose-700 hover:text-rose-900 font-semibold underline"
                                  >
                                    Revoke
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#65746C]/60">Locked</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* ROLE-BASED ACCESS CONTROL (RBAC) REFERENCE MATRIX */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-[#518E6A]" />
                      <span>Role & Permission Security Matrix</span>
                    </CardTitle>
                    <CardDescription>
                      Definitions enforced by Supabase Row Level Security (RLS) policies.
                    </CardDescription>
                  </div>
                </CardHeader>

                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left text-xs border border-[#E8E2DD] rounded-lg">
                    <thead className="bg-[#3D5249] text-white">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Role</th>
                        <th className="py-2.5 px-4 font-semibold">Operational Scope</th>
                        <th className="py-2.5 px-4 font-semibold">Task Capabilities</th>
                        <th className="py-2.5 px-4 font-semibold">Client Records</th>
                        <th className="py-2.5 px-4 font-semibold">User Provisioning</th>
                        <th className="py-2.5 px-4 font-semibold">Settings & Config</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2DD] text-[#242E29]">
                      <tr className="bg-[#466B53]/5">
                        <td className="py-2.5 px-4 font-bold text-[#3D5249]">Owner (Divine)</td>
                        <td className="py-2.5 px-4">Universal Agency Scope</td>
                        <td className="py-2.5 px-4 text-[#466B53] font-semibold">Full Create / Edit / Delete</td>
                        <td className="py-2.5 px-4 text-[#466B53] font-semibold">Full Management</td>
                        <td className="py-2.5 px-4 text-[#466B53] font-semibold">Full Management</td>
                        <td className="py-2.5 px-4 text-[#466B53] font-semibold">Full Management</td>
                      </tr>
                      <tr className="bg-[#466B53]/5">
                        <td className="py-2.5 px-4 font-bold text-[#3D5249]">Admin ({userProfiles.radz.nickname}, {userProfiles.ra.nickname})</td>
                        <td className="py-2.5 px-4">Universal Operational Scope</td>
                        <td className="py-2.5 px-4 text-[#466B53] font-semibold">Full Create / Edit / Delete</td>
                        <td className="py-2.5 px-4 text-[#466B53] font-semibold">Full Management</td>
                        <td className="py-2.5 px-4 text-[#466B53] font-semibold">Full Management</td>
                        <td className="py-2.5 px-4 text-[#466B53] font-semibold">Full Management</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-[#242E29]">Operations Manager</td>
                        <td className="py-2.5 px-4">Assigned Workflows</td>
                        <td className="py-2.5 px-4">Create, Edit & Assign</td>
                        <td className="py-2.5 px-4">View & Update</td>
                        <td className="py-2.5 px-4 text-[#65746C]">No Access</td>
                        <td className="py-2.5 px-4 text-[#65746C]">View Only</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-[#242E29]">Project Owner</td>
                        <td className="py-2.5 px-4">Assigned Projects Only</td>
                        <td className="py-2.5 px-4">Manage & Reassign Tasks</td>
                        <td className="py-2.5 px-4">Authorized Project Only</td>
                        <td className="py-2.5 px-4 text-[#65746C]">No Access</td>
                        <td className="py-2.5 px-4 text-[#65746C]">No Access</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-[#242E29]">Team Member</td>
                        <td className="py-2.5 px-4">Assigned Tasks Only</td>
                        <td className="py-2.5 px-4">Update Task Status</td>
                        <td className="py-2.5 px-4">Authorized Read-Only</td>
                        <td className="py-2.5 px-4 text-[#65746C]">No Access</td>
                        <td className="py-2.5 px-4 text-[#65746C]">No Access</td>
                      </tr>
                      <tr className="bg-[#FAF3EB]/80">
                        <td className="py-2.5 px-4 font-bold text-[#6B4E3D]">Client User</td>
                        <td className="py-2.5 px-4 text-[#6B4E3D]">Strict Single-Tenant Isolation</td>
                        <td className="py-2.5 px-4 text-[#6B4E3D]">View Client Tasks Only</td>
                        <td className="py-2.5 px-4 text-[#6B4E3D]">Own Organization Only</td>
                        <td className="py-2.5 px-4 text-[#65746C]">No Access</td>
                        <td className="py-2.5 px-4 text-[#65746C]">No Access</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: PROFILE, NICKNAME & SETTINGS */}
          {/* ========================================================================= */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#242E29] flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-[#466B53]" />
                    <span>Profile & Settings</span>
                  </h2>
                  <p className="text-xs text-[#65746C] mt-0.5">
                    Customize your display nickname, role titles, and operational platform preferences.
                  </p>
                </div>
                <Badge variant="brand">GIM Platform Settings</Badge>
              </div>

              {/* Profile Card & Nickname Form */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>User Profile & Nickname</CardTitle>
                    <CardDescription>
                      Edit how your name appears across task boards, review queues, and activity logs.
                    </CardDescription>
                  </div>
                  <Badge variant={currentUser.isCoreAdmin ? "dark" : "brand"}>
                    {currentUser.role}
                  </Badge>
                </CardHeader>

                <CardContent className="p-6">
                  <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                    {/* Live Avatar Preview */}
                    <div className="flex items-center space-x-4 p-4 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50">
                      <div
                        className={`w-14 h-14 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0`}
                      >
                        {(editForm.nickname || currentUser.nickname).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#242E29]">{currentUser.name}</p>
                        <p className="text-xs text-[#65746C]">
                          Display Nickname: <strong className="text-[#466B53]">({editForm.nickname || currentUser.nickname})</strong>
                        </p>
                        <p className="text-[11px] text-[#65746C] mt-0.5">{currentUser.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#242E29] mb-1">
                        Full Name (System Identity)
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#242E29] mb-1">
                        Display Nickname *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Radz"
                        value={editForm.nickname}
                        onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                      />
                      <p className="text-[10px] text-[#65746C] mt-1">
                        Your nickname is shown across task assignees, live comments, and capacity worksheets.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#242E29] mb-1">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                      />
                    </div>

                    <div className="pt-2">
                      <Button variant="primary" size="md" type="submit" className="flex items-center space-x-1.5">
                        <Check className="w-4 h-4" />
                        <span>Save Profile & Nickname</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* System Governance & Security Boundaries Summary */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>System Boundaries & Governance</CardTitle>
                    <CardDescription>Active operating controls and data protections</CardDescription>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#466B53]" />
                </CardHeader>
                <div className="p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[#E8E2DD] bg-[#FBF6F3]/40">
                    <div>
                      <p className="font-semibold text-[#242E29]">ClickUp Integration Mode</p>
                      <p className="text-[11px] text-[#65746C]">100% Read-Only Mirror (Mutations blocked)</p>
                    </div>
                    <Badge variant="active" dot>Enforced</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-[#E8E2DD] bg-[#FBF6F3]/40">
                    <div>
                      <p className="font-semibold text-[#242E29]">Vercel Deployment State</p>
                      <p className="text-[11px] text-[#65746C]">Production Deployments Frozen (Localhost active)</p>
                    </div>
                    <Badge variant="review" dot>Frozen</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-[#E8E2DD] bg-[#FBF6F3]/40">
                    <div>
                      <p className="font-semibold text-[#242E29]">Role-Based Access Control (RBAC)</p>
                      <p className="text-[11px] text-[#65746C]">Universal Admin Access for Divine, Radz, and RA</p>
                    </div>
                    <Badge variant="dark">Active</Badge>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* PLACEHOLDER VIEWS FOR OTHER MODULES */}
          {!["overview", "clients", "tasks", "approvals", "messaging", "capacity", "library", "team", "settings"].includes(activeTab) && (
            <div className="bg-white rounded-xl border border-[#E8E2DD] shadow-[0_2px_8px_-2px_rgba(61,82,73,0.06)] p-12 text-center max-w-xl mx-auto my-12">
              <div className="w-11 h-11 rounded-full bg-[#466B53]/10 text-[#466B53] flex items-center justify-center mx-auto mb-3">
                {React.createElement(
                  navSections.flatMap((s) => s.items).find((item) => item.id === activeTab)?.icon || Layers,
                  { className: "w-5 h-5" }
                )}
              </div>
              <h3 className="text-base font-bold text-[#242E29] capitalize">
                {activeTab.replace("-", " ")} Module
              </h3>
              <p className="text-xs text-[#65746C] mt-1.5 leading-relaxed">
                This module is provisioned for future activation under the Local-First development plan.
              </p>
              <Button
                variant="dark"
                size="sm"
                className="mt-5"
                onClick={() => setActiveTab("overview")}
              >
                Return to Overview
              </Button>
            </div>
          )}
            </>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 4. EDIT NICKNAME & PROFILE MODAL */}
      {/* ========================================================================= */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E8E2DD] shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8E2DD] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[#518E6A]/10 text-[#518E6A]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#242E29]">
                    Edit Profile & Nickname
                  </h3>
                  <p className="text-[11px] text-[#65746C]">
                    Customize your display name and nickname across GIM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-md text-[#65746C] hover:text-[#242E29] hover:bg-[#FBF6F3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#242E29] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBF6F3] border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242E29] mb-1">
                  Nickname (Display Name in Assignees & Badges)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radz"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBF6F3] border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                />
                <p className="text-[10px] text-[#65746C] mt-1">
                  This nickname is shown in task cards, activity logs, and chat notifications.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242E29] mb-1">
                  Role Title & Responsibilities
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBF6F3] border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-[#E8E2DD]">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                >
                  Save Nickname
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUPABASE AUTH USER & CLIENT INVITATION MODAL */}
      {/* ========================================================================= */}
      <UserInvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* ========================================================================= */}
      {/* 6. EDIT CLIENT TENANT ACCESS MODAL (Core 3 Admins Only) */}
      {/* ========================================================================= */}
      <EditClientAccessModal
        isOpen={!!editAccessMember}
        onClose={() => setEditAccessMember(null)}
        member={editAccessMember}
        onSaved={(memberId, updatedClients) => {
          setInvitations((prev) =>
            prev.map((i) =>
              i.id === memberId
                ? {
                    ...i,
                    clientScope: updatedClients.length === 6 ? "all" : updatedClients.join(", "),
                  }
                : i
            )
          );
        }}
      />
    </div>
  );
}
