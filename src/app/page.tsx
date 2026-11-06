"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Plus,
  DollarSign,
  Target,
  UploadCloud,
  Camera,
  Globe,
  Sparkles,
  EyeOff,
  Moon,
  Sun,
  Palette,
  Volume2,
  VolumeX,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { TaskBacklogView } from "@/components/tasks/TaskBacklogView";
import { ClientPortfolioView } from "@/components/clients/ClientPortfolioView";
import { MessagingCenter } from "@/components/messaging/MessagingCenter";
import { TeamTimesheetView } from "@/components/timesheet/TeamTimesheetView";
import { ClientInvoicingView } from "@/components/invoices/ClientInvoicingView";
import { WelcomeOnboardingModal } from "@/components/onboarding/WelcomeOnboardingModal";
import { ClientPortalView } from "@/components/client-portal/ClientPortalView";
import { SopPlaybookLibrary } from "@/components/library/SopPlaybookLibrary";
import { UserInvitationModal } from "@/components/invitations/UserInvitationModal";
import { EditClientAccessModal, TeamMemberAccess } from "@/components/team/EditClientAccessModal";
import { MembershipAccessManager } from "@/components/team/MembershipAccessManager";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { TaskDetailModal, TaskItem } from "@/components/tasks/TaskDetailModal";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { soundManager } from "@/lib/audio/sounds";

type NavTab =
  | "overview"
  | "clients"
  | "tasks"
  | "messaging"
  | "timesheet"
  | "invoicing"
  | "library"
  | "team"
  | "settings";

type UserRole =
  | "Owner"
  | "Admin"
  | "Operations Manager"
  | "Project Owner"
  | "Team Member"
  | "Team Specialist"
  | "Social Media Specialist"
  | "Client User"
  | "Operations Specialist"
  | "Project Lead"
  | "Operations Assistant"
  | "Project Specialist"
  | "Tech Specialist";

interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  email: string;
  role: UserRole;
  isCoreAdmin: boolean;
  avatarColor: string;
  avatarUrl?: string;
  title: string;
  clientScope: string;
}

interface InvitationRecord {
  id: string;
  email?: string;
  username?: string;
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
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [modalTask, setModalTask] = useState<TaskItem | null>(null);
  const [selectedPortfolioClientId, setSelectedPortfolioClientId] = useState<string>("all");
  const [selectedPortfolioSubTab, setSelectedPortfolioSubTab] = useState<"calendar" | "board" | "dossier">("calendar");
  const [isGlobalCreateTaskOpen, setIsGlobalCreateTaskOpen] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenSearchTask = async (taskId: string, clientName?: string) => {
    try {
      const res = await fetch("/api/tasks?client=all");
      const json = await res.json();
      const lowerId = taskId.toLowerCase();
      const found = (json.tasks || []).find((t: any) => {
        if (!t) return false;
        if (t.id === taskId) return true;
        if (t.gateCode && t.gateCode.toLowerCase() === lowerId) return true;
        if (Array.isArray(t.tags) && t.tags.some((tag: string) => tag.toLowerCase() === lowerId)) return true;
        if (t.title && t.title.toLowerCase().startsWith(lowerId)) return true;
        return false;
      });
      if (found) {
        setModalTask(found);
      } else {
        setModalTask({
          id: taskId,
          title: `${taskId} Deliverable Gate Verification`,
          client: clientName || "Little Treasures Company",
          status: "In Progress",
          priority: "Normal",
        });
      }
    } catch {
      setActiveTab("clients");
    }
  };

  // ClickUp Live Mirror State
  const [taskStatusFilter, setTaskStatusFilter] = useState("active");
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
    // User Theme and Appearance State
  const [uiTheme, setUiTheme] = useState<"classic" | "dark" | "slate" | "emerald">("classic");
  const [soundSettings, setSoundSettings] = useState({
    master: true,
    task: true,
    message: true,
    reminder: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = (localStorage.getItem("gim_ui_theme") as any) || "classic";
      setUiTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.className = "dark";
      } else {
        document.documentElement.classList.remove("dark");
      }
      document.documentElement.setAttribute("data-theme", savedTheme);
      setSoundSettings(soundManager.getSettings());
    }
  }, []);

  const applyTheme = (themeName: "classic" | "dark" | "slate" | "emerald") => {
    setUiTheme(themeName);
    if (typeof window !== "undefined") {
      localStorage.setItem("gim_ui_theme", themeName);
      if (themeName === "dark") {
        document.documentElement.className = "dark";
      } else {
        document.documentElement.classList.remove("dark");
      }
      document.documentElement.setAttribute("data-theme", themeName);
    }
  };

  const handleToggleSound = (key: "master" | "task" | "message" | "reminder") => {
    const updated = { ...soundSettings, [key]: !soundSettings[key] };
    setSoundSettings(updated);
    soundManager.updateSettings({ [key]: updated[key] });
  };

  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({
    divine: {
      id: "divine",
      name: "Divine Origines",
      nickname: "Divine",
      email: "divine@graceinmotion.agency",
      role: "Owner",
      isCoreAdmin: false,
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
      title: "Chief Automation Architect & Platform Systems Lead",
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
      title: "Project Owner (Little Treasures & WRTS)",
      clientScope: "Little Treasures Company, We Rock the Spectrum (WRTS)",
    },
    bj: {
      id: "bj",
      name: "BJ Ricafrente",
      nickname: "BJ",
      email: "bj@graceinmotion.agency",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#3D5249]",
      title: "Operations Specialist (WRTS & GIM)",
      clientScope: "We Rock the Spectrum (WRTS), Grace In Motion (Internal)",
    },
    jerold: {
      id: "jerold",
      name: "Jerold Recaplaza",
      nickname: "Jerold",
      email: "jerold@graceinmotion.agency",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Operations Specialist (Risewise)",
      clientScope: "Risewise",
    },
    jane: {
      id: "jane",
      name: "Jane Caillio",
      nickname: "Jane",
      email: "jane@graceinmotion.agency",
      role: "Project Lead",
      isCoreAdmin: false,
      avatarColor: "bg-[#518E6A]",
      title: "Project Lead (NoirLab)",
      clientScope: "NoirLab",
    },
    jedy: {
      id: "jedy",
      name: "Jedy Caillio",
      nickname: "Jedy",
      email: "jedy@graceinmotion.agency",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Operations Specialist (InVogue)",
      clientScope: "InVogue Cleans",
    },
    ellyka: {
      id: "ellyka",
      name: "Ellyka Claire Pama",
      nickname: "Ellyka",
      email: "ellyka@graceinmotion.agency",
      role: "Operations Assistant",
      isCoreAdmin: false,
      avatarColor: "bg-[#65746C]",
      title: "Operations Assistant (InVogue & Studio Nets)",
      clientScope: "InVogue Cleans, Studio Nets",
    },
    joyce: {
      id: "joyce",
      name: "Joyce Roble",
      nickname: "Joyce",
      email: "joyce@graceinmotion.agency",
      role: "Project Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#3D5249]",
      title: "Project Specialist (Studio Nets)",
      clientScope: "Studio Nets",
    },
    joy: {
      id: "joy",
      name: "Joy Fabular",
      nickname: "Joy",
      email: "joy@graceinmotion.agency",
      role: "Operations Assistant",
      isCoreAdmin: false,
      avatarColor: "bg-[#518E6A]",
      title: "Operations Assistant (InVogue)",
      clientScope: "InVogue Cleans",
    },
    aldwin: {
      id: "aldwin",
      name: "Aldwin",
      nickname: "Aldwin",
      email: "aldwin@graceinmotion.agency",
      role: "Operations Assistant",
      isCoreAdmin: false,
      avatarColor: "bg-[#65746C]",
      title: "Operations Assistant (WRTS)",
      clientScope: "We Rock the Spectrum (WRTS)",
    },
    smm: {
      id: "smm",
      name: "Camille Bautista",
      nickname: "Camille",
      email: "camille.smm@graceinmotion.agency",
      role: "Social Media Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#518E6A]",
      title: "Social Media Manager (SMM)",
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
    aaron: {
      id: "aaron",
      name: "Aaron Ofosu",
      nickname: "Aaron",
      email: "aaron@juviboltcybertech.com",
      role: "Client User",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Founder, Juvibolt Cybertech",
      clientScope: "Juvibolt Cybertech",
    },
    matthew: {
      id: "matthew",
      name: "Matthew Robbins",
      nickname: "Matthew",
      email: "matthew@invoguecleans.com",
      role: "Client User",
      isCoreAdmin: false,
      avatarColor: "bg-[#3D5249]",
      title: "Founder, InVogue Cleans",
      clientScope: "InVogue Cleans",
    },
    nathan: {
      id: "nathan",
      name: "Nathan Blake",
      nickname: "Nathan",
      email: "nathan@studionets.com.au",
      role: "Client User",
      isCoreAdmin: false,
      avatarColor: "bg-[#65746C]",
      title: "Creative Director, Studio Nets",
      clientScope: "Studio Nets",
    },
  });

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [currentUserKey, setCurrentUserKey] = useState<string>("");
  const currentUser: UserProfile = userProfiles[currentUserKey] || {
    id: "guest",
    email: "member@graceinmotion.agency",
    name: "Team Member",
    nickname: "Member",
    role: "Team Member",
    title: "Operational Specialist",
    isCoreAdmin: false,
    avatarColor: "bg-[#466B53]",
    avatarUrl: "",
    clientScope: "all",
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("gim_auth_user");
    }
    router.replace("/login");
  };

  // Load authenticated user, custom avatars, and profiles from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("gim_user_profiles");
        if (saved) {
          const parsed = JSON.parse(saved);
          setUserProfiles((prev) => ({ ...prev, ...parsed }));
        }

        // Check if there is an authenticated user from /login
        const authSaved = localStorage.getItem("gim_auth_user");
        if (!authSaved) {
          // NO USER LOGGED IN -> Immediately redirect to /login
          router.replace("/login");
          return;
        }

        const authUser = JSON.parse(authSaved);
        const userKey = (authUser.username || authUser.id || authUser.nickname || "user").toLowerCase();
        
        const activeProfile: UserProfile = {
          id: authUser.id || `usr-${userKey}`,
          email: authUser.email || `${userKey}@graceinmotion.agency`,
          name: authUser.name || authUser.username || "Team Member",
          nickname: authUser.nickname || authUser.name || authUser.username || "Member",
          role: (authUser.role as UserRole) || "Team Member",
          title: authUser.title || authUser.role || "Operational Specialist",
          isCoreAdmin: authUser.isCoreAdmin ?? (authUser.role === "Owner" || authUser.role === "Admin"),
          avatarColor: authUser.avatarColor || "bg-[#466B53]",
          avatarUrl: authUser.avatarUrl || "",
          clientScope: authUser.clientScope || "all",
        };

        setUserProfiles((prev) => ({
          ...prev,
          [userKey]: activeProfile,
        }));

        setCurrentUserKey(userKey);
        setIsAuthenticated(true);
        setIsAuthChecking(false);

        // Check onboarding specifically for this authenticated user!
        const userOnboarded = localStorage.getItem(`gim_onboarded_${userKey}`);
        if (!userOnboarded) {
          setShowOnboardingModal(true);
        }
      } catch (err) {
        console.error("Failed to load user profiles from localStorage:", err);
        router.replace("/login");
      }
    }
  }, [router]);

  // Nickname & Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentUser.name,
    nickname: currentUser.nickname,
    title: currentUser.title,
    avatarUrl: currentUser.avatarUrl || "",
  });

  const handleOpenEditProfile = () => {
    setEditForm({
      name: currentUser.name,
      nickname: currentUser.nickname,
      title: currentUser.title,
      avatarUrl: currentUser.avatarUrl || "",
    });
    setIsEditProfileOpen(true);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("Image size should be under 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...userProfiles,
      [currentUserKey]: {
        ...currentUser,
        name: editForm.name,
        nickname: editForm.nickname,
        title: editForm.title,
        avatarUrl: editForm.avatarUrl || undefined,
      },
    };
    setUserProfiles(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("gim_user_profiles", JSON.stringify(updated));
      const authSaved = localStorage.getItem("gim_auth_user");
      if (authSaved) {
        try {
          const parsedAuth = JSON.parse(authSaved);
          parsedAuth.name = editForm.name;
          parsedAuth.nickname = editForm.nickname;
          parsedAuth.title = editForm.title;
          if (editForm.avatarUrl) parsedAuth.avatarUrl = editForm.avatarUrl;
          localStorage.setItem("gim_auth_user", JSON.stringify(parsedAuth));
        } catch {
          // ignore
        }
      }
    }
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
      username: "erwin.manaog",
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
      username: "bj.ricafrente",
      name: "BJ Ricafrente",
      role: "Operations Specialist",
      clientScope: "We Rock the Spectrum (WRTS)",
      invitedBy: "Radzdom Gallego",
      token: "gim_tok_9b71e83c0",
      status: "Active",
      createdDate: "Nov 02, 2026",
      permissions: { view: true, create: true, edit: true, assign: true, delete: false },
    },
    {
      id: "inv-3",
      username: "camille.smm",
      name: "Camille Bautista",
      role: "Social Media Specialist",
      clientScope: "Little Treasures Company",
      invitedBy: "Radzdom Gallego",
      token: "gim_tok_7c64a511f",
      status: "Active",
      createdDate: "Oct 28, 2026",
      permissions: { view: true, create: true, edit: true, assign: false, delete: false },
    },
    {
      id: "inv-4",
      username: "jerold.recaplaza",
      name: "Jerold Recaplaza",
      role: "Operations Specialist",
      clientScope: "Risewise",
      invitedBy: "Radzdom Gallego",
      token: "gim_tok_3a19b882c",
      status: "Active",
      createdDate: "Nov 02, 2026",
      permissions: { view: true, create: true, edit: true, assign: true, delete: false },
    },
    {
      id: "inv-5",
      username: "jane.caillio",
      name: "Jane Caillio",
      role: "Project Lead",
      clientScope: "NoirLab",
      invitedBy: "Divine Origines",
      token: "gim_tok_5f20e991d",
      status: "Active",
      createdDate: "Nov 03, 2026",
      permissions: { view: true, create: true, edit: true, assign: true, delete: false },
    },
    {
      id: "inv-6",
      username: "jedy.caillio",
      name: "Jedy Caillio",
      role: "Operations Specialist",
      clientScope: "InVogue Cleans",
      invitedBy: "Ma. Rose Anne (RA) Malinao",
      token: "gim_tok_6c41d773b",
      status: "Active",
      createdDate: "Nov 03, 2026",
      permissions: { view: true, create: true, edit: true, assign: false, delete: false },
    },
    {
      id: "inv-7",
      username: "ellyka.pama",
      name: "Ellyka Claire Pama",
      role: "Operations Assistant",
      clientScope: "InVogue Cleans",
      invitedBy: "Ma. Rose Anne (RA) Malinao",
      token: "gim_tok_2b88f441e",
      status: "Active",
      createdDate: "Nov 03, 2026",
      permissions: { view: true, create: true, edit: true, assign: false, delete: false },
    },
    {
      id: "inv-8",
      username: "joyce.roble",
      name: "Joyce Roble",
      role: "Project Specialist",
      clientScope: "Studio Nets",
      invitedBy: "Divine Origines",
      token: "gim_tok_1a55c229f",
      status: "Active",
      createdDate: "Nov 04, 2026",
      permissions: { view: true, create: true, edit: true, assign: false, delete: false },
    },
    {
      id: "inv-9",
      username: "joy.fabular",
      name: "Joy Fabular",
      role: "Operations Assistant",
      clientScope: "InVogue Cleans",
      invitedBy: "Ma. Rose Anne (RA) Malinao",
      token: "gim_tok_9d77e114a",
      status: "Active",
      createdDate: "Nov 04, 2026",
      permissions: { view: true, create: true, edit: true, assign: false, delete: false },
    },
    {
      id: "inv-10",
      username: "aldwin.ops",
      name: "Aldwin",
      role: "Operations Assistant",
      clientScope: "We Rock the Spectrum (WRTS)",
      invitedBy: "Radzdom Gallego",
      token: "gim_tok_8e66a335c",
      status: "Active",
      createdDate: "Nov 04, 2026",
      permissions: { view: true, create: true, edit: true, assign: false, delete: false },
    },
    {
      id: "inv-11",
      username: "hashim.saudi",
      name: "Hashim Saudi",
      role: "Tech Specialist",
      clientScope: "Studio Nets",
      invitedBy: "Radzdom Gallego",
      token: "gim_tok_7c33d881e",
      status: "Active",
      createdDate: "Nov 04, 2026",
      permissions: { view: true, create: true, edit: true, assign: true, delete: false },
    },
    {
      id: "inv-12",
      username: "kimberly.besa",
      name: "Kimberly Besa",
      role: "Operations Assistant",
      clientScope: "Grace In Motion (Internal)",
      invitedBy: "Divine Origines",
      token: "gim_tok_4f11b229d",
      status: "Active",
      createdDate: "Nov 04, 2026",
      permissions: { view: true, create: true, edit: true, assign: false, delete: false },
    },
    {
      id: "inv-13",
      username: "zoe.horner",
      name: "Zoe Horner",
      role: "Client User",
      clientScope: "Little Treasures Company",
      invitedBy: "Divine Origines",
      token: "gim_tok_4e12c980b",
      status: "Active",
      createdDate: "Nov 02, 2026",
      permissions: { view: true, create: false, edit: false, assign: false, delete: false },
    },
    {
      id: "inv-14",
      username: "aaron.ofosu",
      name: "Aaron Ofosu",
      role: "Client User",
      clientScope: "Juvibolt Cybertech",
      invitedBy: "Radzdom Gallego",
      token: "gim_tok_6b22c771f",
      status: "Active",
      createdDate: "Nov 02, 2026",
      permissions: { view: true, create: false, edit: false, assign: false, delete: false },
    },
    {
      id: "inv-15",
      username: "matthew.robbins",
      name: "Matthew Robbins",
      role: "Client User",
      clientScope: "InVogue Cleans",
      invitedBy: "Ma. Rose Anne (RA) Malinao",
      token: "gim_tok_5d88a113b",
      status: "Active",
      createdDate: "Nov 02, 2026",
      permissions: { view: true, create: false, edit: false, assign: false, delete: false },
    },
    {
      id: "inv-16",
      username: "nathan.blake",
      name: "Nathan Blake",
      role: "Client User",
      clientScope: "Studio Nets",
      invitedBy: "Divine Origines",
      token: "gim_tok_3c99e442d",
      status: "Active",
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
            : "Active",
        },
      ],
    },
    {
      title: "Collaboration & Operations",
      items: [
        { id: "messaging", label: "Team Messaging", icon: MessageSquare, badge: "Live" },
        { id: "timesheet", label: "Timesheets & EOS", icon: Clock },
        ...(hasAdminAccess || currentUser.nickname.toLowerCase() === "ra"
          ? [{ id: "invoicing" as NavTab, label: "Invoicing & Billing", icon: DollarSign, badge: "RA Lead" }]
          : []),
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

  // Client Delivery Pipeline (Verified from GIM Operating System folder: Studio Nets, Little Treasures, etc.)
  const clientsData = [
    {
      id: "little-treasures",
      name: "Little Treasures Company",
      code: "LT-AU",
      lead: "Erwin Manaog",
      contact: "Zoe Horner (Founder)",
      currentSprint: "Website v2, summit pages, G19 Australian text number, course downloads",
      status: "Active Sprint",
      statusVariant: "active" as const,
      milestone: "Summit Ready: Fri 11 Dec 2026",
      tasksCount: "47 active tasks",
      retainer: "AUD $4,500 / mo",
      progress: 75,
    },
    {
      id: "we-rock-the-spectrum",
      name: "We Rock the Spectrum (WRTS)",
      code: "WRTS-US",
      lead: "Erwin Manaog",
      contact: "Chris & Niko (Clovis CA)",
      currentSprint: "Renew 147 CVRC approvals ending Nov 30, daily portal reports & Niko CFO data pack",
      status: "Active Sprint",
      statusVariant: "active" as const,
      milestone: "CVRC Renewals Finalized (Dec 1)",
      tasksCount: "58 active tasks",
      retainer: "USD $4,000 / mo",
      progress: 70,
    },
    {
      id: "juvibolt-cybertech",
      name: "Juvibolt Cybertech",
      code: "JB-US",
      lead: "Radzdom-Man Gallego",
      contact: "Aaron Ofosu (Founder)",
      currentSprint: "J6 Launch Dry Run, synthetic 5-student verification, GHL funnel & Cohortly LMS",
      status: "Active Sprint",
      statusVariant: "active" as const,
      milestone: "Cohort 1 First Live Class",
      tasksCount: "89 active tasks",
      retainer: "USD $4,000 / mo",
      progress: 65,
    },
    {
      id: "risewise",
      name: "Risewise",
      code: "RW-GLOBAL",
      lead: "Divine Origines",
      contact: "Joel & Team",
      currentSprint: "RW Ops Automation Plan (Nov 2026): 8 helpers and 17 steps, won client onboarding",
      status: "Active Sprint",
      statusVariant: "active" as const,
      milestone: "Full 17-Step Automation Live",
      tasksCount: "15 active tasks",
      retainer: "USD $3,500 / mo",
      progress: 80,
    },
    {
      id: "noirlab",
      name: "NoirLab",
      code: "NL-GLOBAL",
      lead: "Jane Caillio",
      contact: "Malik & Atefa",
      currentSprint: "Weekly plan to Malik, order board monitoring, QA call with Atefa",
      status: "Active Sprint",
      statusVariant: "active" as const,
      milestone: "Production QA Stabilization",
      tasksCount: "14 active tasks",
      retainer: "USD $2,500 / mo",
      progress: 60,
    },
    {
      id: "invogue-cleans",
      name: "InVogue Cleans",
      code: "IVC-AU",
      lead: "Ma. Rose Anne (RA) Malinao",
      contact: "Matthew Robbins (Founder)",
      currentSprint: "Weekly cleaner shift checklists, cleaner pay policy review, second lead source",
      status: "Active Sprint",
      statusVariant: "active" as const,
      milestone: "90-Day Retention Roadmap",
      tasksCount: "38 active tasks",
      retainer: "USD $1,700 / mo",
      progress: 55,
    },
    {
      id: "studio-nets",
      name: "Studio Nets",
      code: "SN-AU",
      lead: "Ma. Rose Anne (RA) Malinao",
      contact: "Nathan Blake (Creative Lead)",
      currentSprint: "Complete & test Leadly GHL updates, PO onboarding, winning creatives SOP",
      status: "Active Sprint",
      statusVariant: "active" as const,
      milestone: "SOP Standardization Complete",
      tasksCount: "9 active tasks",
      retainer: "USD $2,800 / mo",
      progress: 60,
    },
    {
      id: "gim-internal",
      name: "Grace In Motion (Internal)",
      code: "GIM-HQ",
      lead: "Divine Origines & Radz Gallego",
      contact: "Executive Leadership",
      currentSprint: "Weekly operations reports, subcon weekly meeting, contractor invoices, team scorecards",
      status: "Active Sprint",
      statusVariant: "active" as const,
      milestone: "Universal Agency OS Live",
      tasksCount: "89 active tasks",
      retainer: "Agency Internal HQ",
      progress: 85,
    },
    {
      id: "tch2thrive",
      name: "Tch2Thrive",
      code: "T2T-US",
      lead: "Ma. Rose Anne (RA) Malinao",
      contact: "Dr. Gloria Ramos Gonzalez",
      currentSprint: "School District Proposal & ClickUp SOP Library",
      status: "Discovery Intake",
      statusVariant: "upcoming" as const,
      milestone: "District Conference Pipeline",
      tasksCount: "30-60-90 Plan",
      retainer: "USD $2,500 / mo",
      progress: 40,
    },
  ];

  // Filter clients based on user scope
  const visibleClients = clientsData.filter((client) => {
    if (currentUser.clientScope === "all") return true;
    const allowed = currentUser.clientScope.split(",").map((s) => s.trim().toLowerCase());
    return allowed.some((s) => client.name.toLowerCase().includes(s) || s.includes(client.name.toLowerCase()));
  });

  // Critical delivery checkpoints across active clients
  const urgentTasks = [
    {
      code: "W3",
      title: "Website v2, summit pages, emails and downloads ready for Zoe",
      assignee: "Erwin",
      reviewer: userProfiles.radz.nickname,
      status: "In Progress",
      account: "Little Treasures",
      priority: "Critical",
      deadline: "Mon Nov 09",
    },
    {
      code: "G19",
      title: "Text number: GoHighLevel's business check, then the Australian number",
      assignee: userProfiles.radz.nickname,
      reviewer: "Erwin",
      status: "In Progress",
      account: "Little Treasures",
      priority: "High",
      deadline: "Fri Nov 13",
    },
    {
      code: "J6",
      title: "Launch Dry Run: Synthetic 5-Student Verification before First Class",
      assignee: userProfiles.radz.nickname,
      reviewer: userProfiles.divine.nickname,
      status: "In Progress",
      account: "Juvibolt Cybertech",
      priority: "Critical",
      deadline: "Sun Nov 08",
    },
    {
      code: "WRTS",
      title: "Renew the 147 CVRC approvals that end Nov 30 (play or pay Dec 1)",
      assignee: "Erwin",
      reviewer: "BJ",
      status: "In Progress",
      account: "We Rock the Spectrum",
      priority: "High",
      deadline: "Mon Nov 16",
    },
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
      status: "Approved",
      account: "Little Treasures",
      priority: "High",
      deadline: "Completed",
    },
  ];

  // Team live attendance and shift presence matrix (Replaces capacity pills with live presence)
  const teamWorkload = [
    {
      name: userProfiles.divine.name,
      nickname: userProfiles.divine.nickname,
      role: "Owner · Strategy Lead",
      focus: "Executive Direction & Client Discovery",
      load: "7h 15m logged today",
      status: "Online",
      shift: "08:00 AM - 05:00 PM",
      initials: "DO",
      color: "bg-[#3D5249]",
    },
    {
      name: userProfiles.radz.name,
      nickname: userProfiles.radz.nickname,
      role: "Admin · Tech & Automation Lead",
      focus: "GIM Platform Systems, GHL & n8n Workflows",
      load: "6h 45m logged today",
      status: "Online",
      shift: "08:30 AM - 05:30 PM",
      initials: "RG",
      color: "bg-[#518E6A]",
    },
    {
      name: userProfiles.ra.name,
      nickname: userProfiles.ra.nickname,
      role: "Admin · Commercial Operations & Invoicing",
      focus: "Invoicing, Client Contracts & Billing",
      load: "5h 50m logged · On Break (22m)",
      status: "On Break",
      shift: "09:00 AM - 06:00 PM",
      initials: "RA",
      color: "bg-[#3D5249]",
    },
    {
      name: userProfiles.erwin.name,
      nickname: userProfiles.erwin.nickname,
      role: "Project Owner · Little Treasures",
      focus: "Summit Launch Funnel & Sprint Velocity",
      load: "7h 10m logged today",
      status: "Online",
      shift: "08:00 AM - 05:00 PM",
      initials: "EM",
      color: "bg-[#466B53]",
    },
    {
      name: userProfiles.smm.name,
      nickname: userProfiles.smm.nickname,
      role: "Social Media Specialist",
      focus: "Little Treasures Reel Batches & Meta Ads",
      load: "6h 20m logged today",
      status: "Online",
      shift: "09:00 AM - 06:00 PM",
      initials: "CB",
      color: "bg-[#518E6A]",
    },
    {
      name: "BJ Ricafrente",
      nickname: "BJ",
      role: "Operations Specialist",
      focus: "WRTS CVRC Renewals & Operations Kickoffs",
      load: "4h 15m logged · Away",
      status: "Away",
      shift: "10:00 AM - 07:00 PM",
      initials: "BR",
      color: "bg-slate-600",
    },
    {
      name: "Jerold Recaplaza",
      nickname: "Jerold",
      role: "Operations Specialist · Risewise",
      focus: "Risewise Automation Plan & Client Onboarding",
      load: "5h 40m logged today",
      status: "Online",
      shift: "08:00 AM - 05:00 PM",
      initials: "JR",
      color: "bg-[#466B53]",
    },
    {
      name: "Jane Caillio",
      nickname: "Jane",
      role: "Project Lead · NoirLab",
      focus: "Production Dashboard & WhatsApp Sync",
      load: "6h 10m logged today",
      status: "Online",
      shift: "09:00 AM - 06:00 PM",
      initials: "JC",
      color: "bg-[#518E6A]",
    },
    {
      name: "Ellyka Claire Pama",
      nickname: "Ellyka",
      role: "Operations Assistant",
      focus: "InVogue Cleaner Checklists & Studio Nets Calls",
      load: "5h 15m logged today",
      status: "Online",
      shift: "09:00 AM - 06:00 PM",
      initials: "EP",
      color: "bg-[#65746C]",
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

        {/* Quick Search Button in Sidebar */}
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              setIsGlobalSearchOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#34463E] border border-[#466B53]/50 text-xs text-[#FBF6F3]/70 hover:text-white hover:border-[#518E6A] transition-all"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-[#518E6A]" />
              <span>Search everything...</span>
            </div>
            <kbd className="text-[9px] font-mono bg-[#3D5249] px-1 py-0.5 rounded border border-[#466B53]/40">
              ⌘K
            </kbd>
          </button>
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
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20 shadow-xs shrink-0"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-white/20 shadow-xs`}
              >
                {currentUser.nickname.slice(0, 2).toUpperCase()}
              </div>
            )}
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
          <div className="flex items-center space-x-0.5">
            <button
              onClick={handleOpenEditProfile}
              title="Edit Nickname & Profile"
              className="p-1.5 text-[#FBF6F3]/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-rose-300/80 hover:text-rose-200 hover:bg-rose-500/20 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  if (isAuthChecking || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FBF6F3]">
        <div className="w-14 h-14 relative flex items-center justify-center animate-pulse mb-3">
          <Image
            src="/gim-mark-green.png"
            alt="GIM"
            width={48}
            height={48}
            className="object-contain"
            priority
          />
        </div>
        <p className="text-xs font-semibold text-[#3D5249] tracking-wider uppercase">
          Verifying GIM Authentication...
        </p>
      </div>
    );
  }

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
        <header className="h-16 bg-[#FBF6F3]/95 backdrop-blur-md border-b border-[#E8E2DD] px-2.5 sm:px-6 flex items-center justify-between shrink-0 gap-1.5 sm:gap-3 overflow-hidden">
          {/* Left Header: Mobile hamburger & Global Client Workspace Switcher */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 min-w-0 shrink">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-[#65746C] hover:text-[#242E29] hover:bg-white md:hidden shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Client Workspace Switcher */}
            <div className="flex items-center space-x-1.5 bg-white border border-[#E8E2DD] rounded-xl px-2 py-1 shadow-2xs hover:border-[#518E6A] transition-all max-w-[125px] xs:max-w-[165px] sm:max-w-xs shrink-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-[#466B53]/15 text-[#3D5249] flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0">
                <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#518E6A]" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[7.5px] sm:text-[9px] font-bold uppercase tracking-wider text-[#65746C] leading-none truncate">
                  Workspace
                </span>
                <select
                  value={selectedPortfolioClientId}
                  onChange={(e) => setSelectedPortfolioClientId(e.target.value)}
                  className="bg-transparent text-[10px] sm:text-xs font-bold text-[#242E29] focus:outline-none cursor-pointer pr-1 leading-tight mt-0.5 truncate max-w-[85px] xs:max-w-[120px] sm:max-w-none"
                  title="Switch client account instantly"
                >
                  <option value="all">All Clients (Unified)</option>
                  <option value="little-treasures">Little Treasures (AU)</option>
                  <option value="we-rock-the-spectrum">We Rock the Spectrum (US)</option>
                  <option value="juvibolt-cybertech">Juvibolt Cybertech (US)</option>
                  <option value="risewise">Risewise (Global)</option>
                  <option value="noirlab">NoirLab (Global)</option>
                  <option value="studio-nets">Studio Nets (AU)</option>
                  <option value="invogue-cleans">InVogue Cleans (AU)</option>
                  <option value="gim-internal">Grace In Motion (Internal)</option>
                  <option value="tch2thrive">Tch2Thrive (US)</option>
                </select>
              </div>
            </div>

            {/* Breadcrumb Context Label (Desktop only) */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-[#65746C] truncate pl-1">
              <span className="text-[#E8E2DD]">/</span>
              <span className="font-semibold text-[#242E29] truncate">
                {activeTab === "overview"
                  ? "Operations Hub"
                  : activeTab === "clients"
                  ? "Client Workspaces & Calendar"
                  : activeTab === "tasks"
                  ? "Tasks & Pipeline"
                  : activeTab === "messaging"
                  ? "Team Messaging"
                  : activeTab === "timesheet"
                  ? "Timesheets & Shift Tracking"
                  : activeTab === "invoicing"
                  ? "Invoicing & Retainers"
                  : activeTab === "library"
                  ? "SOP & Playbooks"
                  : activeTab === "team"
                  ? "Team Directory & Roles"
                  : "Profile & Settings"}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* Quick Create Task Trigger (+ New Task) */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsGlobalCreateTaskOpen(true)}
              className="p-1.5 h-8 w-8 sm:w-auto sm:px-3 rounded-xl flex items-center justify-center text-xs shadow-xs shrink-0"
              title="Add New Task"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </Button>

            {/* Clean User Presence Pill */}
            {activeTab !== "settings" && (
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-white border border-[#E8E2DD] rounded-xl text-xs shadow-xs shrink-0">
                <div className="relative">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-black/5"
                    />
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full ${currentUser.avatarColor || "bg-[#466B53]"} text-white flex items-center justify-center font-bold text-[9px] shrink-0`}
                    >
                      {(currentUser.nickname || currentUser.name || "U").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-white"></span>
                </div>
                <span className="font-semibold text-[#242E29] truncate max-w-[65px] sm:max-w-none hidden xs:inline">
                  {currentUser.nickname || currentUser.name}
                </span>
                {currentUser.role === "Owner" ? (
                  <span className="hidden md:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#3D5249] text-white">
                    Owner
                  </span>
                ) : currentUser.isCoreAdmin ? (
                  <span className="hidden md:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#518E6A] text-white">
                    Admin
                  </span>
                ) : null}
              </div>
            )}

            {/* Profile Switcher, Edit Nickname, and Invite Buttons: ONLY on Settings Tab */}
            {activeTab === "settings" && hasAdminAccess && (
              <div className="hidden sm:flex items-center space-x-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Edit2 className="w-3 h-3 text-[#518E6A]" />}
                  onClick={handleOpenEditProfile}
                  className="hidden md:inline-flex"
                >
                  Edit Profile
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Mail className="w-3.5 h-3.5" />}
                  className="shadow-xs"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  <span className="hidden sm:inline">Invite User</span>
                </Button>
              </div>
            )}

            {/* Global Search Button */}
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white border border-[#E8E2DD] rounded-xl text-xs text-[#65746C] hover:text-[#242E29] hover:border-[#518E6A] shadow-xs transition-colors shrink-0 flex items-center space-x-1"
              title="Search everything across GIM (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#518E6A]" />
              <span className="hidden md:inline font-medium text-xs">Search...</span>
            </button>

            {/* Quick Theme Switcher */}
            <button
              type="button"
              onClick={() => {
                const themes: Array<"classic" | "dark" | "slate" | "emerald"> = ["classic", "dark", "slate", "emerald"];
                const nextIndex = (themes.indexOf(uiTheme) + 1) % themes.length;
                applyTheme(themes[nextIndex]);
              }}
              className="p-1.5 rounded-xl border border-[#E8E2DD] bg-white text-[#65746C] hover:text-[#242E29] hover:bg-[#FBF6F3] shadow-xs flex items-center shrink-0 transition-colors"
              title={`Active Theme: ${uiTheme.toUpperCase()}. Click to switch color scheme.`}
            >
              {uiTheme === "dark" ? (
                <Moon className="w-3.5 h-3.5 text-amber-400" />
              ) : uiTheme === "emerald" ? (
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              ) : uiTheme === "slate" ? (
                <Palette className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-600" />
              )}
            </button>

            {/* Notifications Dropdown Bell */}
            <div className="shrink-0">
              <NotificationBell
                onSelectTask={handleOpenSearchTask}
                onSelectMessage={() => setActiveTab("messaging")}
                onSelectApprovals={() => setActiveTab("tasks")}
              />
            </div>
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

        {/* Team Specialist / PO Scoped View Notice */}
        {!currentUser.isCoreAdmin && !isClientUser && (
          <div className="bg-[#EBF3EF] border-b border-[#D2E4DA] px-4 sm:px-8 py-2 flex items-center justify-between text-xs text-[#244234]">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#518E6A] shrink-0" />
              <span>
                <strong>{currentUser.role} View Active:</strong> Authenticated as <strong>{currentUser.name} ({currentUser.nickname})</strong> &lt;{currentUser.email}&gt;. Scope: <strong>{currentUser.clientScope}</strong>. You can add tasks, upload pictures/videos, and post comments, but editing tasks assigned to other members is locked.
              </span>
            </div>
            <button
              onClick={() => setCurrentUserKey("radz")}
              className="font-semibold underline hover:text-[#183125] text-[11px] shrink-0 ml-2"
            >
              Switch back to Radz (Admin)
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
                <Card
                  onClick={() => {
                    setSelectedPortfolioClientId("all");
                    setSelectedPortfolioSubTab("calendar");
                    setActiveTab("clients");
                  }}
                  className="cursor-pointer hover:border-[#466B53]/60 transition-all hover:shadow-xs group"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#65746C] group-hover:text-[#466B53] transition-colors flex items-center gap-1">
                        Active Client Accounts
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <div className="text-2xl font-bold text-[#242E29] mt-1">
                        {visibleClients.length}
                      </div>
                      <p className="text-[11px] text-[#466B53] font-medium mt-0.5">
                        3 Primary Builds · 3 Staged
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#466B53]/10 text-[#466B53] group-hover:bg-[#466B53] group-hover:text-white transition-all flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Sprint Tasks */}
                <Card
                  onClick={() => {
                    setSelectedPortfolioClientId("all");
                    setSelectedPortfolioSubTab("board");
                    setActiveTab("clients");
                  }}
                  className="cursor-pointer hover:border-[#518E6A]/60 transition-all hover:shadow-xs group"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#65746C] group-hover:text-[#518E6A] transition-colors flex items-center gap-1">
                        Active Sprint Tasks
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    <div className="w-10 h-10 rounded-lg bg-[#518E6A]/10 text-[#518E6A] group-hover:bg-[#518E6A] group-hover:text-white transition-all flex items-center justify-center">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Review Checkpoints */}
                <Card
                  onClick={() => {
                    setTaskStatusFilter("In Review");
                    setActiveTab("tasks");
                  }}
                  className="cursor-pointer hover:border-amber-400 transition-all hover:shadow-xs group"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#65746C] group-hover:text-amber-800 transition-colors flex items-center gap-1">
                        Needs Review & Checkpoints
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <div className="text-2xl font-bold text-[#242E29] mt-1">
                        {clickupStats ? clickupStats.reviewCount : 2}
                      </div>
                      <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                        G5 Website Pages & G7 Enquiry Flow
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-all flex items-center justify-center">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Summit Countdown */}
                <Card
                  onClick={() => {
                    setSelectedPortfolioClientId("little-treasures");
                    setSelectedPortfolioSubTab("calendar");
                    setActiveTab("clients");
                  }}
                  className="cursor-pointer hover:border-[#3D5249]/60 transition-all hover:shadow-xs group"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#65746C] group-hover:text-[#3D5249] transition-colors flex items-center gap-1">
                        Summit Launch Deadline
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <div className="text-2xl font-bold text-[#242E29] mt-1">
                        38 Days
                      </div>
                      <p className="text-[11px] text-[#3D5249] font-medium mt-0.5">
                        Hard Target: Fri 11 Dec 2026
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#3D5249]/10 text-[#3D5249] group-hover:bg-[#3D5249] group-hover:text-white transition-all flex items-center justify-center">
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
                            <tr
                              key={idx}
                              onClick={() => {
                                setSelectedPortfolioClientId(client.id);
                                setSelectedPortfolioSubTab("calendar");
                                setActiveTab("clients");
                              }}
                              className="hover:bg-[#518E6A]/5 transition-colors cursor-pointer group"
                              title={`Open ${client.name} workspace`}
                            >
                              <td className="py-3 px-4 font-semibold text-[#242E29]">
                                <div className="flex items-center gap-1.5 group-hover:text-[#466B53] transition-colors">
                                  <span>{client.name}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#518E6A]" />
                                </div>
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
                            onClick={() => handleOpenSearchTask(task.code, "Little Treasures Company")}
                            className="p-3 rounded-lg border border-[#E8E2DD] bg-[#FBF6F3]/40 hover:border-[#518E6A]/60 hover:bg-[#FBF6F3] cursor-pointer transition-all text-xs group"
                            title={`Inspect ${task.code} requirements & sign-off`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-[#3D5249] text-[10px] bg-[#466B53]/15 px-1.5 py-0.2 rounded border border-[#466B53]/25 group-hover:bg-[#466B53] group-hover:text-white transition-colors">
                                  {task.code}
                                </span>
                                <span className="font-semibold text-[#242E29] line-clamp-1 group-hover:text-[#466B53] transition-colors">
                                  {task.title}
                                </span>
                              </div>
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#518E6A] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
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
                        <CardTitle>Team Shift Attendance & Live Presence</CardTitle>
                        <CardDescription>
                          Real-time team presence, active shift schedules, and logged duration
                        </CardDescription>
                      </div>
                      <Badge variant="neutral">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1 animate-pulse" />
                        {teamWorkload.filter((m) => m.status === "Online").length} Online
                      </Badge>
                    </CardHeader>

                    <div className="divide-y divide-[#E8E2DD]/60">
                      {teamWorkload.map((member, idx) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#FBF6F3]/40 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className={`w-8 h-8 rounded-full ${member.color} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                                {member.initials}
                              </div>
                              <span
                                className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 ring-2 ring-white ${
                                  member.status === "Online"
                                    ? "bg-emerald-500"
                                    : member.status === "On Break"
                                    ? "bg-amber-500 animate-pulse"
                                    : member.status === "Away"
                                    ? "bg-orange-500"
                                    : "bg-slate-400"
                                }`}
                              />
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
                            <p className="text-[10px] text-[#518E6A] font-semibold">{member.load}</p>
                          </div>
                          <div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                              member.status === "Online"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : member.status === "On Break"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : member.status === "Away"
                                ? "bg-orange-100 text-orange-800 border-orange-300"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                member.status === "Online" ? "bg-emerald-600" : member.status === "On Break" ? "bg-amber-600" : "bg-orange-600"
                              }`} />
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
              currentUserName={currentUser.name}
              currentUserNickname={currentUser.nickname}
              isCoreAdmin={currentUser.isCoreAdmin}
              initialClientId={selectedPortfolioClientId}
              initialSubTab={selectedPortfolioSubTab}
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
              currentUserNickname={currentUser.nickname}
              currentUserName={currentUser.name}
              isCoreAdmin={currentUser.isCoreAdmin}
              clientScope={currentUser.clientScope}
              selectedClientId={selectedPortfolioClientId}
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
              selectedClientId={selectedPortfolioClientId}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: TEAM TIMESHEETS, EOS REPORTS & LIVE ATTENDANCE */}
          {/* ========================================================================= */}
          {activeTab === "timesheet" && (
            <TeamTimesheetView />
          )}

          {/* ========================================================================= */}
          {/* TAB: COMMERCIAL INVOICING & RETAINER MANAGEMENT (RA MALINAO LEAD) */}
          {/* ========================================================================= */}
          {activeTab === "invoicing" && (
            <ClientInvoicingView
              currentUserName={currentUser.name}
              currentUserRole={currentUser.role}
              isCoreAdmin={currentUser.isCoreAdmin}
              currentUserNickname={currentUser.nickname}
            />
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

              {/* Dual Pillar Membership Governance (Client Details/Goals/Accounts & GIM Details/Goals/Accounts) */}
              <MembershipAccessManager
                currentUserName={currentUser.name}
                currentUserRole={currentUser.role}
                isCoreAdmin={hasAdminAccess}
                currentUserNickname={currentUser.nickname}
                onEditStaffScope={(member) => setEditAccessMember(member)}
                onInviteUser={() => setIsInviteModalOpen(true)}
              />

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
                            <div className="text-[10px] text-[#518E6A] font-mono font-bold">
                              @{inv.username || inv.name.toLowerCase().replace(/\s+/g, ".")}
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
                                      email: inv.email || `${inv.username || "member"}@graceinmotion.agency`,
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
                    {/* Live Avatar Preview with Custom Photo Upload */}
                    <div className="flex items-center space-x-4 p-4 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50">
                      {editForm.avatarUrl ? (
                        <img
                          src={editForm.avatarUrl}
                          alt="Avatar Preview"
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-[#518E6A] shadow-xs shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-14 h-14 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0`}
                        >
                          {(editForm.nickname || currentUser.nickname).slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-[#242E29]">{currentUser.name}</p>
                        <p className="text-xs text-[#65746C]">
                          Display Nickname: <strong className="text-[#466B53]">({editForm.nickname || currentUser.nickname})</strong>
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#3D5249]/20 hover:bg-[#518E6A]/10 text-xs font-semibold text-[#3D5249] shadow-2xs transition-colors">
                            <Camera className="w-3.5 h-3.5 text-[#518E6A]" />
                            <span>Change Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarFileUpload}
                              className="hidden"
                            />
                          </label>
                          {editForm.avatarUrl && (
                            <button
                              type="button"
                              onClick={() => setEditForm((prev) => ({ ...prev, avatarUrl: "" }))}
                              className="text-[11px] text-rose-700 hover:underline font-semibold"
                            >
                              Reset Photo
                            </button>
                          )}
                        </div>
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

              {/* UI Theme & Appearance Card */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>UI Appearance & Color Theme</CardTitle>
                    <CardDescription>Personalize dashboard contrast, color palette, and night mode</CardDescription>
                  </div>
                  <Palette className="w-5 h-5 text-[#466B53]" />
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Theme 1: Classic GIM */}
                    <div
                      onClick={() => applyTheme("classic")}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        uiTheme === "classic"
                          ? "border-[#518E6A] bg-[#518E6A]/5 shadow-sm ring-1 ring-[#518E6A]/30"
                          : "border-[#E8E2DD] bg-white hover:border-[#518E6A]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-4 h-4 rounded-full bg-[#FBF6F3] border border-[#3D5249]/30"></span>
                          <span className="w-4 h-4 rounded-full bg-[#3D5249]"></span>
                          <span className="w-4 h-4 rounded-full bg-[#518E6A]"></span>
                        </div>
                        {uiTheme === "classic" && <Check className="w-4 h-4 text-[#518E6A]" />}
                      </div>
                      <p className="font-bold text-xs text-[#242E29]">Classic GIM Cream</p>
                      <p className="text-[10px] text-[#65746C] mt-0.5">Signature warm cream and dark green</p>
                    </div>

                    {/* Theme 2: Dark Forest Mode */}
                    <div
                      onClick={() => applyTheme("dark")}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        uiTheme === "dark"
                          ? "border-[#518E6A] bg-[#1A2420] shadow-sm ring-1 ring-[#518E6A]/30"
                          : "border-[#E8E2DD] bg-[#121A16] hover:border-[#518E6A]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-4 h-4 rounded-full bg-[#121A16] border border-white/20"></span>
                          <span className="w-4 h-4 rounded-full bg-[#1A2420]"></span>
                          <span className="w-4 h-4 rounded-full bg-[#466B53]"></span>
                        </div>
                        {uiTheme === "dark" && <Check className="w-4 h-4 text-[#518E6A]" />}
                      </div>
                      <p className="font-bold text-xs text-white">Dark Forest Mode</p>
                      <p className="text-[10px] text-white/70 mt-0.5">Sleek midnight charcoal and pine</p>
                    </div>

                    {/* Theme 3: Midnight Slate */}
                    <div
                      onClick={() => applyTheme("slate")}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        uiTheme === "slate"
                          ? "border-blue-500 bg-[#1E293B] shadow-sm ring-1 ring-blue-500/30"
                          : "border-[#E8E2DD] bg-[#0B1120] hover:border-blue-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-4 h-4 rounded-full bg-[#0B1120] border border-white/20"></span>
                          <span className="w-4 h-4 rounded-full bg-[#1E293B]"></span>
                          <span className="w-4 h-4 rounded-full bg-[#3B82F6]"></span>
                        </div>
                        {uiTheme === "slate" && <Check className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="font-bold text-xs text-white">Midnight Slate</p>
                      <p className="text-[10px] text-white/70 mt-0.5">High-contrast modern studio navy</p>
                    </div>

                    {/* Theme 4: Emerald Pine */}
                    <div
                      onClick={() => applyTheme("emerald")}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        uiTheme === "emerald"
                          ? "border-emerald-500 bg-[#0C382C] shadow-sm ring-1 ring-emerald-500/30"
                          : "border-[#E8E2DD] bg-[#06241B] hover:border-emerald-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-4 h-4 rounded-full bg-[#06241B] border border-white/20"></span>
                          <span className="w-4 h-4 rounded-full bg-[#0C382C]"></span>
                          <span className="w-4 h-4 rounded-full bg-[#10B981]"></span>
                        </div>
                        {uiTheme === "emerald" && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="font-bold text-xs text-white">Emerald Pine</p>
                      <p className="text-[10px] text-white/70 mt-0.5">Vibrant deep emerald night</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Preferences & Sound Settings Card */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Notifications & Audio Chimes</CardTitle>
                    <CardDescription>Control alerts for tasks, team chat mentions, and audio chimes</CardDescription>
                  </div>
                  <Bell className="w-5 h-5 text-[#466B53]" />
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {/* Toggle 1: Master Audio */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-[#518E6A]/15 text-[#3D5249]">
                        {soundSettings.master ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#242E29]">Master Audio Chimes</p>
                        <p className="text-[11px] text-[#65746C]">Synthesized audio alerts on events</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleSound("master")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        soundSettings.master ? "bg-[#518E6A]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          soundSettings.master ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Task Alerts */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50">
                    <div>
                      <p className="font-bold text-xs text-[#242E29]">Task Assignment & Due Date Alerts</p>
                      <p className="text-[11px] text-[#65746C]">Notify when you are assigned or task nears target SLA</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleSound("task")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        soundSettings.task ? "bg-[#518E6A]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          soundSettings.task ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 3: Message Alerts */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50">
                    <div>
                      <p className="font-bold text-xs text-[#242E29]">Team Chat & Direct Mentions</p>
                      <p className="text-[11px] text-[#65746C]">Pop audio chime and notification badge on messages</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleSound("message")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        soundSettings.message ? "bg-[#518E6A]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          soundSettings.message ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* PLACEHOLDER VIEWS FOR OTHER MODULES */}
          {!["overview", "clients", "tasks", "messaging", "timesheet", "invoicing", "library", "team", "settings"].includes(activeTab) && (
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
              {/* Profile Photo Upload & Live Preview */}
              <div className="flex items-center gap-3.5 p-3 rounded-xl border border-[#3D5249]/15 bg-[#FBF6F3]/60">
                <div className="relative shrink-0">
                  {editForm.avatarUrl ? (
                    <img
                      src={editForm.avatarUrl}
                      alt="Avatar Preview"
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-[#518E6A] shadow-xs"
                    />
                  ) : (
                    <div
                      className={`w-14 h-14 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-lg shadow-xs`}
                    >
                      {(editForm.nickname || currentUser.nickname).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white" />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#3D5249]/20 hover:bg-[#518E6A]/10 text-xs font-semibold text-[#3D5249] shadow-2xs transition-colors">
                      <Camera className="w-3.5 h-3.5 text-[#518E6A]" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </label>

                    {editForm.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setEditForm((prev) => ({ ...prev, avatarUrl: "" }))}
                        className="text-[11px] text-rose-700 hover:underline font-semibold"
                      >
                        Reset Photo
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-[#65746C]">
                    PNG, JPG or WebP. Persisted across GIM.
                  </p>
                </div>
              </div>

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

              <div className="flex items-center justify-between pt-3 border-t border-[#E8E2DD]">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
                <div className="flex items-center space-x-2">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. USER & CLIENT PROVISIONING MODAL (NAME, USERNAME, PASSWORD ONLY) */}
      {/* ========================================================================= */}
      <UserInvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onUserProvisioned={(newUser) => {
          setInvitations((prev) => [
            {
              id: `inv-${Date.now()}`,
              username: newUser.username,
              name: newUser.name,
              role: newUser.role as UserRole,
              clientScope: newUser.clientScope,
              invitedBy: currentUser.name,
              token: `gim_tok_${Math.random().toString(36).substring(2, 9)}`,
              status: "Active",
              createdDate: "Today",
              permissions: { view: true, create: true, edit: true, assign: false, delete: false },
            },
            ...prev,
          ]);
        }}
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

      {/* ========================================================================= */}
      {/* 7. UNIFIED GLOBAL SEARCH SPOTLIGHT MODAL (Ctrl+K) */}
      {/* ========================================================================= */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectTask={(taskId, clientName) => {
          handleOpenSearchTask(taskId, clientName);
        }}
        onSelectMessage={(channelId) => {
          setActiveTab("messaging");
        }}
        onSelectClient={(clientName) => {
          setActiveTab("clients");
        }}
        onSelectSop={(sopId) => {
          setActiveTab("library");
        }}
        onSelectTeam={(memberId) => {
          setActiveTab("team");
        }}
      />

      {/* ========================================================================= */}
      {/* 8. SEARCH & NOTIFICATION TASK DETAIL MODAL */}
      {/* ========================================================================= */}
      {modalTask && (
        <TaskDetailModal
          task={modalTask}
          isOpen={!!modalTask}
          onClose={() => setModalTask(null)}
          currentUserNickname={currentUser.nickname}
          currentUserName={currentUser.name}
          onTaskUpdated={(updated) => {
            setModalTask(updated);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 9. GLOBAL QUICK CREATE TASK MODAL */}
      {/* ========================================================================= */}
      <CreateTaskModal
        isOpen={isGlobalCreateTaskOpen}
        onClose={() => setIsGlobalCreateTaskOpen(false)}
        defaultClient={
          selectedPortfolioClientId === "little-treasures"
            ? "Little Treasures Company"
            : selectedPortfolioClientId === "we-rock-the-spectrum"
            ? "We Rock the Spectrum (WRTS)"
            : selectedPortfolioClientId === "juvibolt-cybertech" || selectedPortfolioClientId === "aaron-ofosu"
            ? "Juvibolt Cybertech"
            : selectedPortfolioClientId === "risewise"
            ? "Risewise"
            : selectedPortfolioClientId === "noirlab"
            ? "NoirLab"
            : selectedPortfolioClientId === "studio-nets"
            ? "Studio Nets"
            : selectedPortfolioClientId === "invogue-cleans"
            ? "InVogue Cleans"
            : selectedPortfolioClientId === "gim-internal"
            ? "Grace In Motion (Internal)"
            : selectedPortfolioClientId === "tch2thrive"
            ? "Tch2Thrive"
            : "Little Treasures Company"
        }
        currentUserName={currentUser.name}
        currentUserRole={currentUser.role}
        onTaskCreated={() => {
          setIsGlobalCreateTaskOpen(false);
        }}
      />

      {/* ========================================================================= */}
      {/* 10. FIRST-TIME USER WELCOME & ONBOARDING TOUR MODAL */}
      {/* ========================================================================= */}
      <WelcomeOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => {
          setShowOnboardingModal(false);
          if (typeof window !== "undefined") {
            localStorage.setItem(`gim_onboarded_${currentUserKey}`, "true");
            localStorage.setItem("gim_onboarding_accepted", "true");
          }
        }}
        userName={currentUser ? (currentUser.nickname || currentUser.name) : "Team Member"}
        userRole={currentUser.role}
        clientScope={currentUser.clientScope}
      />
    </div>
  );
}
