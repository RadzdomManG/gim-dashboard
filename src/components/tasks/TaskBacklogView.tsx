"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Layers,
  ArrowUpRight,
  Info,
  MessageSquare,
  LayoutGrid,
  List,
  KanbanSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ClickUpTask, ClickUpStats } from "@/lib/clickup/types";
import { TaskDetailModal, TaskItem } from "@/components/tasks/TaskDetailModal";
import { sound } from "@/lib/audio";

interface TaskBacklogViewProps {
  initialStatusFilter?: string;
  initialSearch?: string;
  currentUserNickname?: string;
  currentUserName?: string;
  isCoreAdmin?: boolean;
  clientScope?: string | string[];
  selectedClientId?: string;
}

export function TaskBacklogView({
  initialStatusFilter = "active",
  initialSearch = "",
  currentUserNickname = "Radz",
  currentUserName = "Radzdom Gallego",
  isCoreAdmin = true,
  clientScope = "all",
  selectedClientId = "all",
}: TaskBacklogViewProps) {
  const [tasks, setTasks] = useState<ClickUpTask[]>([]);
  const [stats, setStats] = useState<ClickUpStats | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "board">("table");

  // Sync client filter with prop selectedClientId
  useEffect(() => {
    if (selectedClientId && selectedClientId !== "all") {
      setClientFilter(selectedClientId);
    }
  }, [selectedClientId]);

  // Sync initial search and status filter props
  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialStatusFilter !== undefined) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Selected Task Modal
  const [selectedTask, setSelectedTask] = useState<ClickUpTask | null>(null);
  const [taskComments, setTaskComments] = useState<{
    id: string;
    text: string;
    date: string;
    user: {
      id: number;
      username: string;
      email: string;
      initials: string;
      color: string;
    };
  }[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Fetch tasks from API
  const loadTasks = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/clickup/tasks");
      const json = await res.json();

      if (json.success && json.data) {
        setTasks(json.data.tasks);
        setStats(json.data.stats);
        setLastSynced(json.data.lastSynced);
      } else {
        throw new Error(json.error || "Failed to load tasks");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load ClickUp tasks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and periodic 60s auto-refresh
  useEffect(() => {
    loadTasks();
    const interval = setInterval(() => {
      loadTasks(true);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch comments whenever selectedTask changes
  useEffect(() => {
    if (!selectedTask) {
      setTaskComments([]);
      return;
    }
    setLoadingComments(true);
    fetch(`/api/clickup/tasks/${selectedTask.id}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.comments) {
          setTaskComments(data.comments);
        }
      })
      .catch((err) => console.error("Failed to load comments:", err))
      .finally(() => setLoadingComments(false));
  }, [selectedTask]);

  // Compute distinct assignees for dropdown (ClickUp assignees + Team members)
  const [teamMembersList, setTeamMembersList] = useState<{ full_name: string; nickname?: string }[]>([]);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (data.members && Array.isArray(data.members)) {
          setTeamMembersList(data.members);
        }
      })
      .catch(() => {});
  }, []);

  const uniqueAssignees = useMemo(() => {
    const map = new Map<string, string>();
    // ClickUp assignees
    tasks.forEach((t) => {
      t.assignees.forEach((a) => {
        if (a.username && !map.has(a.username)) {
          map.set(a.username, a.username);
        }
      });
    });
    // Team directory & provisioned members
    teamMembersList.forEach((m) => {
      if (m.full_name && !map.has(m.full_name)) {
        map.set(m.full_name, m.full_name);
      }
      if (m.nickname && !map.has(m.nickname)) {
        map.set(m.nickname, m.nickname);
      }
    });
    return Array.from(map.values()).sort();
  }, [tasks, teamMembersList]);

  // Count tasks assigned to current user
  const myTasksCount = useMemo(() => {
    const nick = (currentUserNickname || "").toLowerCase();
    const name = (currentUserName || "").toLowerCase();
    if (!nick && !name) return 0;
    return tasks.filter((task) => {
      return task.assignees.some((a) => {
        const u = (a.username || "").toLowerCase();
        const em = (a.email || "").toLowerCase();
        return (
          (nick && (u.includes(nick) || nick.includes(u) || em.includes(nick))) ||
          (name && (u.includes(name) || name.includes(u) || em.includes(name)))
        );
      });
    }).length;
  }, [tasks, currentUserNickname, currentUserName]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // My Tasks toggle
      if (myTasksOnly) {
        const nick = (currentUserNickname || "").toLowerCase();
        const name = (currentUserName || "").toLowerCase();
        const isAssigned = task.assignees.some((a) => {
          const u = (a.username || "").toLowerCase();
          const em = (a.email || "").toLowerCase();
          return (
            (nick && (u.includes(nick) || nick.includes(u) || em.includes(nick))) ||
            (name && (u.includes(name) || name.includes(u) || em.includes(name)))
          );
        });
        if (!isAssigned) return false;
      }
      // Scoped client check for non-admin users
      if (clientScope && clientScope !== "all") {
        const allowed = Array.isArray(clientScope)
          ? clientScope
          : clientScope.split(",").map((s) => s.trim());
        const hasAccess = allowed.some((scope) => {
          const s = scope.toLowerCase();
          return (
            task.client.toLowerCase().includes(s) ||
            s.includes(task.client.toLowerCase()) ||
            task.listName.toLowerCase().includes(s)
          );
        });

        // Also allow tasks specifically assigned to this user!
        const isAssignedToUser = task.assignees.some((a) => {
          const u = (a.username || "").toLowerCase();
          const em = (a.email || "").toLowerCase();
          return (
            (currentUserNickname && (u.includes(currentUserNickname.toLowerCase()) || em.includes(currentUserNickname.toLowerCase()))) ||
            (currentUserName && (u.includes(currentUserName.toLowerCase()) || em.includes(currentUserName.toLowerCase())))
          );
        });

        if (!hasAccess && !isAssignedToUser) return false;
      }

      // Global client context filter from header
      if (selectedClientId && selectedClientId !== "all") {
        const clientKeyMap: Record<string, string> = {
          "little-treasures": "little treasures",
          "we-rock-the-spectrum": "we rock the spectrum",
          "juvibolt-cybertech": "juvibolt",
          "aaron-ofosu": "juvibolt",
          "risewise": "risewise",
          "noirlab": "noirlab",
          "studio-nets": "studio nets",
          "invogue-cleans": "invogue cleans",
          "tch2thrive": "tch2thrive",
          "gim-internal": "grace in motion",
        };
        const targetPattern = clientKeyMap[selectedClientId] || selectedClientId.toLowerCase();
        const matches =
          task.client.toLowerCase().includes(targetPattern) ||
          task.listName.toLowerCase().includes(targetPattern);
        if (!matches) return false;
      }

      // Client filter
      if (clientFilter === "all") {
        // Zoe / Little Treasures is paused: omit from active sprint views, keep historical accessible via "little-treasures"
        if (task.client.toLowerCase().includes("little treasures")) {
          return false;
        }
      } else if (clientFilter !== "all-with-paused") {
        const clientKeyMap: Record<string, string> = {
          "little-treasures": "little treasures",
          "we-rock-the-spectrum": "we rock the spectrum",
          "wrts": "we rock the spectrum",
          "juvibolt-cybertech": "juvibolt",
          "aaron-ofosu": "juvibolt",
          "risewise": "risewise",
          "noirlab": "noirlab",
          "studio-nets": "studio nets",
          "invogue-cleans": "invogue cleans",
          "tch2thrive": "tch2thrive",
          "gim-internal": "grace in motion",
        };
        const targetPattern = clientKeyMap[clientFilter] || clientFilter.toLowerCase();
        const matches =
          task.client.toLowerCase().includes(targetPattern) ||
          task.listName.toLowerCase().includes(targetPattern);
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter === "active") {
        const s = task.status.toLowerCase();
        if (s === "closed" || s === "complete") return false;
      } else if (statusFilter !== "all") {
        const s = task.status.toLowerCase();
        const sf = statusFilter.toLowerCase();
        if (sf === "for review" || sf === "in review") {
          if (s !== "for review" && s !== "in review") return false;
        } else if (sf === "closed" || sf === "complete") {
          if (s !== "closed" && s !== "complete") return false;
        } else if (s !== sf) {
          return false;
        }
      }

      // Assignee filter
      if (assigneeFilter !== "all") {
        const af = assigneeFilter.toLowerCase();
        const hasAssignee = task.assignees.some((a) => {
          const u = (a.username || "").toLowerCase();
          const em = (a.email || "").toLowerCase();
          return u === af || u.includes(af) || af.includes(u) || (em && em.includes(af));
        });
        if (!hasAssignee) return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = task.name.toLowerCase().includes(q);
        const matchesId = task.id.toLowerCase().includes(q);
        const matchesGate = task.gateCode?.toLowerCase().includes(q);
        const matchesAssignee = task.assignees.some((a) => a.username.toLowerCase().includes(q));
        const matchesClient = task.client.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesGate && !matchesAssignee && !matchesClient) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const timeA = a.dueDate ? Number(a.dueDate) : 0;
      const timeB = b.dueDate ? Number(b.dueDate) : 0;
      return timeB - timeA; // Latest to oldest
    });
  }, [tasks, clientFilter, statusFilter, assigneeFilter, search, clientScope, selectedClientId, myTasksOnly, currentUserNickname, currentUserName]);

  // Paginated tasks
  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  const handleQuickMoveTask = (taskId: string, targetStatus: string, taskName: string, client: string) => {
    if (
      targetStatus.toLowerCase().includes("closed") ||
      targetStatus.toLowerCase().includes("done") ||
      targetStatus.toLowerCase().includes("approved")
    ) {
      sound.playSuccessChime();
    } else {
      sound.playClick();
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("gim_task_status_changed", {
          detail: {
            taskId,
            newStatus: targetStatus,
            taskName,
            client,
            author: currentUserNickname || "Radz",
          },
        })
      );
    }
  };

  const boardColumns = useMemo(() => {
    const todo = filteredTasks.filter((t) => {
      const s = t.status.toLowerCase();
      return s === "to do" || s === "open" || s === "pending";
    });
    const inProgress = filteredTasks.filter((t) => {
      const s = t.status.toLowerCase();
      return s === "in progress" || s === "doing" || s === "active";
    });
    const forReview = filteredTasks.filter((t) => {
      const s = t.status.toLowerCase();
      return s.includes("review");
    });
    const closed = filteredTasks.filter((t) => {
      const s = t.status.toLowerCase();
      return s === "closed" || s === "complete" || s === "completed" || s === "approved" || s === "done";
    });

    return [
      { id: "todo", title: "To Do", tasks: todo, topBorder: "border-t-slate-400", badgeColor: "bg-slate-100 text-slate-700", targetStatus: "In Progress", actionLabel: "Start ➔", actionColor: "bg-[#518E6A] hover:bg-[#43795A]" },
      { id: "inProgress", title: "In Progress", tasks: inProgress, topBorder: "border-t-[#518E6A]", badgeColor: "bg-[#518E6A]/15 text-[#3D5249]", targetStatus: "For Review", actionLabel: "Review ➔", actionColor: "bg-amber-600 hover:bg-amber-700" },
      { id: "forReview", title: "For Review", tasks: forReview, topBorder: "border-t-amber-500", badgeColor: "bg-amber-100 text-amber-800", targetStatus: "Closed", actionLabel: "Approve ➔", actionColor: "bg-emerald-600 hover:bg-emerald-700" },
      { id: "closed", title: "Closed / Done", tasks: closed, topBorder: "border-t-emerald-600", badgeColor: "bg-emerald-100 text-emerald-800", targetStatus: "To Do", actionLabel: "Reopen ↺", actionColor: "bg-slate-600 hover:bg-slate-700" },
    ];
  }, [filteredTasks]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, clientFilter, assigneeFilter]);

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "for review") {
      return (
        <Badge variant="review" dot>
          For Review
        </Badge>
      );
    }
    if (s === "in progress") {
      return (
        <Badge variant="brand" dot>
          In Progress
        </Badge>
      );
    }
    if (s === "closed") {
      return (
        <Badge variant="active" dot>
          Closed
        </Badge>
      );
    }
    if (s === "blocked") {
      return (
        <Badge variant="critical" dot>
          Blocked
        </Badge>
      );
    }
    return (
      <Badge variant="upcoming" dot>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-[#242E29]">
              Tasks & Deliverables
            </h2>
            <Badge variant="brand" dot>Live Synced</Badge>
          </div>
          <p className="text-xs text-[#65746C] mt-0.5">
            Track active deliverables, client sprint progress, and team assignments.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {lastSynced && (
            <span className="text-[11px] text-[#65746C] hidden md:inline">
              Synced: {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadTasks(true)}
            disabled={refreshing}
            className="flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#466B53]" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* 2. STATS STRIP */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div
            onClick={() => setStatusFilter("active")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "active"
                ? "bg-[#3D5249] text-white border-[#3D5249] shadow-xs"
                : "bg-white text-[#242E29] border-[#E8E2DD] hover:border-[#466B53]/40"
            }`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${statusFilter === "active" ? "text-white/70" : "text-[#466B53]"}`}>
              Active Tasks
            </p>
            <p className="text-lg font-bold mt-0.5">
              {stats.openCount + stats.inProgressCount + stats.reviewCount}
            </p>
          </div>

          <div
            onClick={() => setStatusFilter("for review")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "for review"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-white text-[#242E29] border-[#E8E2DD] hover:border-amber-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${statusFilter === "for review" ? "text-white/80" : "text-amber-800"}`}>
                For Review
              </p>
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-lg font-bold mt-0.5">{stats.reviewCount}</p>
          </div>

          <div
            onClick={() => setStatusFilter("in progress")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "in progress"
                ? "bg-[#466B53] text-white border-[#466B53] shadow-xs"
                : "bg-white text-[#242E29] border-[#E8E2DD] hover:border-[#466B53]/40"
            }`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${statusFilter === "in progress" ? "text-white/80" : "text-[#466B53]"}`}>
              In Progress
            </p>
            <p className="text-lg font-bold mt-0.5">{stats.inProgressCount}</p>
          </div>

          <div
            onClick={() => setStatusFilter("to do")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "to do"
                ? "bg-slate-700 text-white border-slate-700 shadow-xs"
                : "bg-white text-[#242E29] border-[#E8E2DD] hover:border-slate-400"
            }`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${statusFilter === "to do" ? "text-white/80" : "text-[#65746C]"}`}>
              To Do
            </p>
            <p className="text-lg font-bold mt-0.5">{stats.openCount}</p>
          </div>

          <div
            onClick={() => setStatusFilter("closed")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "closed"
                ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                : "bg-white text-[#242E29] border-[#E8E2DD] hover:border-emerald-400"
            }`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${statusFilter === "closed" ? "text-white/80" : "text-emerald-700"}`}>
              Completed
            </p>
            <p className="text-lg font-bold mt-0.5">{stats.closedCount}</p>
          </div>

          <div
            onClick={() => setStatusFilter("all")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#242E29] text-white border-[#242E29] shadow-xs"
                : "bg-white text-[#242E29] border-[#E8E2DD] hover:border-[#242E29]/40"
            }`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${statusFilter === "all" ? "text-white/80" : "text-[#65746C]"}`}>
              All History
            </p>
            <p className="text-lg font-bold mt-0.5">{stats.totalTasks}</p>
          </div>
        </div>
      )}

      {/* 3. FILTERS & SEARCH CONTROL BAR */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
              <input
                type="text"
                placeholder="Search tasks, clients, or team members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] placeholder-[#65746C]/60 focus:outline-none focus:ring-1 focus:ring-[#518E6A] focus:border-[#518E6A]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65746C] hover:text-[#242E29]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Quick "My Tasks" Toggle Pill */}
              <button
                type="button"
                onClick={() => setMyTasksOnly(!myTasksOnly)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  myTasksOnly
                    ? "bg-[#466B53] text-white border-[#466B53] shadow-xs ring-2 ring-[#466B53]/20"
                    : "bg-[#FBF6F3] text-[#3D5249] border-[#E8E2DD] hover:border-[#466B53]/50"
                }`}
                title="Filter tasks assigned to you"
              >
                <User className={`w-3.5 h-3.5 ${myTasksOnly ? "text-white" : "text-[#466B53]"}`} />
                <span>My Tasks</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                    myTasksOnly ? "bg-white text-[#466B53]" : "bg-[#466B53]/15 text-[#3D5249]"
                  }`}
                >
                  {myTasksCount}
                </span>
              </button>

              {/* Client Workspace Filter */}
              <select
                value={clientFilter}
                onChange={(e) => {
                  setClientFilter(e.target.value);
                  sound.playClick();
                }}
                className="px-3 py-2 bg-white border border-[#E8E2DD] rounded-lg text-xs font-semibold text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
              >
                <option value="all">All Active Clients</option>
                <option value="we-rock-the-spectrum">We Rock the Spectrum (WRTS)</option>
                <option value="juvibolt-cybertech">Juvibolt Cybertech</option>
                <option value="studio-nets">Studio Nets</option>
                <option value="invogue-cleans">InVogue Cleans</option>
                <option value="risewise">Risewise</option>
                <option value="noirlab">NoirLab</option>
                <option value="gim-internal">Grace In Motion (Internal)</option>
                <option value="little-treasures">📁 Paused Archive (Little Treasures)</option>
                <option value="all-with-paused">All Clients (Incl. Paused)</option>
              </select>

              {/* Assignee Filter */}
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-[#E8E2DD] rounded-lg text-xs font-medium text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
              >
                <option value="all">All Members ({uniqueAssignees.length})</option>
                {uniqueAssignees.map((assignee) => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
              </select>

              {/* Reset Filters */}
              {(search || statusFilter !== "all" || clientFilter !== "all" || assigneeFilter !== "all" || myTasksOnly) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setClientFilter("all");
                    setAssigneeFilter("all");
                    setMyTasksOnly(false);
                  }}
                  className="text-xs text-[#65746C]"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. TASK DATA TABLE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3.5 px-4 border-b border-[#E8E2DD]">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-sm">All Deliverables</CardTitle>
            <Badge variant="neutral">
              Showing {paginatedTasks.length} of {filteredTasks.length}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle (Table vs Grid vs Board) */}
            <div className="flex items-center space-x-0.5 bg-[#FBF6F3] p-0.5 rounded-xl border border-[#E8E2DD]">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                  viewMode === "table"
                    ? "bg-[#3D5249] text-white shadow-xs"
                    : "text-[#65746C] hover:text-[#242E29]"
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#3D5249] text-white shadow-xs"
                    : "text-[#65746C] hover:text-[#242E29]"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                  viewMode === "board"
                    ? "bg-[#3D5249] text-white shadow-xs"
                    : "text-[#65746C] hover:text-[#242E29]"
                }`}
                title="ClickUp Kanban Board View"
              >
                <KanbanSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">Board</span>
              </button>
            </div>
            <div className="text-xs text-[#65746C] hidden sm:block">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#466B53] mx-auto" />
            <p className="text-xs text-[#65746C] font-medium">Fetching real-time tasks from ClickUp API...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
            <p className="text-xs font-bold text-rose-800">Connection Notice</p>
            <p className="text-xs text-[#65746C]">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => loadTasks()} className="mt-2">
              Retry
            </Button>
          </div>
        ) : paginatedTasks.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Layers className="w-8 h-8 text-[#65746C]/40 mx-auto" />
            <p className="text-xs font-bold text-[#242E29]">No tasks match your criteria</p>
            <p className="text-xs text-[#65746C]">Try clearing your search query or status filters.</p>
          </div>
        ) : (
          <>
            {/* Mobile-Friendly Responsive Task Cards (< 768px) */}
            <div className="block md:hidden divide-y divide-[#E8E2DD]/70 bg-white">
              {paginatedTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-3.5 space-y-2 hover:bg-[#FBF6F3]/50 active:bg-[#FBF6F3] transition-colors cursor-pointer"
                >
                  {/* Top Bar: Gate code, Client source, Status */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {task.gateCode ? (
                        <span className="font-bold text-[#3D5249] text-[10px] bg-[#466B53]/15 px-2 py-0.5 rounded border border-[#466B53]/25 shrink-0">
                          {task.gateCode}
                        </span>
                      ) : null}
                      <span className="text-[10px] font-semibold text-[#3D5249] bg-[#FBF6F3] px-2 py-0.5 rounded border border-[#E8E2DD] truncate max-w-[150px]">
                        {task.client}
                      </span>
                    </div>

                    <Badge
                      variant={
                        task.status.toLowerCase().includes("approved") || task.status.toLowerCase().includes("closed")
                          ? "active"
                          : task.status.toLowerCase().includes("review")
                          ? "review"
                          : task.status.toLowerCase().includes("progress")
                          ? "brand"
                          : "neutral"
                      }
                      className="text-[10px] shrink-0"
                    >
                      {task.status}
                    </Badge>
                  </div>

                  {/* Task Name */}
                  <div className="font-bold text-xs text-[#242E29] leading-snug line-clamp-2">
                    {task.name}
                  </div>

                  {/* Bottom Bar: Assignee, Due date, ID */}
                  <div className="flex items-center justify-between text-[11px] text-[#65746C] pt-1 border-t border-[#E8E2DD]/40">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="text-[10px] font-mono text-[#65746C]">#{task.id}</span>
                      {task.assignees && task.assignees.length > 0 && (
                        <span className="font-medium text-[#242E29] bg-[#466B53]/10 text-[#466B53] px-1.5 py-0.2 rounded text-[10px] truncate max-w-[120px]">
                          👤 {task.assignees[0].username.split(" ")[0]}
                          {task.assignees.length > 1 && ` +${task.assignees.length - 1}`}
                        </span>
                      )}
                    </div>

                    {task.dueDateFormatted && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-[#65746C] shrink-0">
                        <Clock className="w-3 h-3 text-[#518E6A]" />
                        {task.dueDateFormatted}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View (>= 768px): Choice of Kanban Board View, Card Grid View, or Dense Data Table */}
            {viewMode === "board" ? (
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#FBF6F3]/40 min-h-[520px]">
                {boardColumns.map((col) => (
                  <div
                    key={col.id}
                    className="flex flex-col bg-white/90 rounded-2xl border border-[#3D5249]/15 shadow-xs overflow-hidden"
                  >
                    {/* Column Header */}
                    <div className={`p-3 border-t-4 ${col.topBorder} border-b border-[#E8E2DD] bg-[#FBF6F3] flex items-center justify-between`}>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-[#242E29]">{col.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${col.badgeColor}`}>
                          {col.tasks.length}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#65746C] font-mono">
                        {filteredTasks.length > 0 ? Math.round((col.tasks.length / filteredTasks.length) * 100) : 0}%
                      </span>
                    </div>

                    {/* Column Cards Container */}
                    <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5 max-h-[640px]">
                      {col.tasks.length === 0 ? (
                        <div className="p-6 text-center text-[#65746C]/60 text-[11px] italic">
                          No tasks in {col.title}
                        </div>
                      ) : (
                        col.tasks.map((task) => {
                          const cleanTitle = task.name.replace(
                            /\s*\|\s*(Juvibolt Cybertech|Little Treasures Company|We Rock the Spectrum|Risewise|NoirLab|Studio Nets|InVogue Cleans|Grace in Motion).*$/i,
                            ""
                          );
                          return (
                            <div
                              key={task.id}
                              onClick={() => {
                                sound.playPop();
                                setSelectedTask(task);
                              }}
                              className="card-3d p-3 rounded-xl bg-white border border-[#3D5249]/15 hover:border-[#518E6A] shadow-xs cursor-pointer space-y-2 group"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  {task.gateCode && (
                                    <span className="font-bold text-[#3D5249] text-[9px] bg-[#466B53]/15 px-1.5 py-0.2 rounded border border-[#466B53]/25 shrink-0">
                                      {task.gateCode}
                                    </span>
                                  )}
                                  <span className="text-[9px] font-semibold text-[#3D5249] bg-[#FBF6F3] px-1.5 py-0.2 rounded border border-[#E8E2DD] truncate max-w-[120px]">
                                    {task.client}
                                  </span>
                                </div>
                                <span className="text-[9px] font-mono text-[#65746C]">#{task.id}</span>
                              </div>

                              <h5 className="font-bold text-xs text-[#242E29] line-clamp-2 leading-snug group-hover:text-[#466B53] transition-colors">
                                {cleanTitle}
                              </h5>

                              <div className="pt-2 border-t border-[#E8E2DD]/60 flex items-center justify-between text-[10px] text-[#65746C]">
                                <div className="flex items-center space-x-1 truncate max-w-[110px]">
                                  {task.assignees && task.assignees.length > 0 ? (
                                    <span className="font-medium text-[#242E29] truncate">
                                      👤 {task.assignees[0].username.split(" ")[0]}
                                    </span>
                                  ) : (
                                    <span className="italic text-[#65746C]/60">Unassigned</span>
                                  )}
                                </div>

                                {task.dueDateFormatted && (
                                  <span className="flex items-center gap-0.5 text-[9px] font-medium text-[#65746C]">
                                    <Clock className="w-2.5 h-2.5 text-[#518E6A]" />
                                    {task.dueDateFormatted}
                                  </span>
                                )}
                              </div>

                              {/* Quick Move Action Button */}
                              <div className="pt-1 flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickMoveTask(task.id, col.targetStatus, task.name, task.client);
                                  }}
                                  className={`btn-3d text-[10px] font-bold px-2 py-0.5 rounded-lg text-white shadow-2xs ${col.actionColor}`}
                                  title={`Advance task to ${col.targetStatus}`}
                                >
                                  {col.actionLabel}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === "grid" ? (
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-[#FBF6F3]/30">
                {paginatedTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="p-4 rounded-2xl bg-white border border-[#3D5249]/15 hover:border-[#518E6A] hover:shadow-md transition-all cursor-pointer space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1 min-w-0">
                          {task.gateCode && (
                            <span className="font-bold text-[#3D5249] text-[10px] bg-[#466B53]/15 px-1.5 py-0.2 rounded border border-[#466B53]/25 shrink-0">
                              {task.gateCode}
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-[#3D5249] bg-[#FBF6F3] px-2 py-0.5 rounded border border-[#E8E2DD] truncate max-w-[140px]">
                            {task.client}
                          </span>
                        </div>
                        {renderStatusBadge(task.status)}
                      </div>

                      <h4 className="font-bold text-xs text-[#242E29] line-clamp-2 leading-snug">
                        {task.name}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-[#E8E2DD] flex items-center justify-between text-[11px] text-[#65746C]">
                      <div className="flex items-center space-x-1 truncate max-w-[140px]">
                        <User className="w-3 h-3 text-[#518E6A]" />
                        <span className="font-medium text-[#242E29] truncate">
                          {task.assignees && task.assignees.length > 0 ? task.assignees[0].username.split(" ")[0] : "Unassigned"}
                        </span>
                      </div>
                      {task.dueDateFormatted ? (
                        <span className="flex items-center gap-1 font-medium text-[10px]">
                          <Clock className="w-3 h-3 text-[#518E6A]" />
                          {task.dueDateFormatted}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#65746C]">#{task.id}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop Full Data Table (>= 768px) */
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8E2DD] bg-[#FBF6F3] text-[#65746C]">
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Task Deliverable</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px] hidden md:table-cell">Client</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Assignee</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px] hidden lg:table-cell">Due Date</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2DD]/60">
                {paginatedTasks.map((task) => {
                  const cleanTitle = task.name.replace(/\s*\|\s*(Juvibolt Cybertech|Little Treasures Company|We Rock the Spectrum|Risewise|NoirLab|Studio Nets|InVogue Cleans|Grace in Motion).*$/i, "");
                  return (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="hover:bg-[#FBF6F3]/50 transition-colors cursor-pointer group"
                  >
                    {/* Task Title with optional Gate Code */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {task.gateCode && (
                          <span className="font-bold text-[#3D5249] text-[10px] bg-[#466B53]/15 px-1.5 py-0.5 rounded border border-[#466B53]/25 shrink-0">
                            {task.gateCode}
                          </span>
                        )}
                        <span className="font-semibold text-[#242E29] group-hover:text-[#466B53] transition-colors line-clamp-1">
                          {cleanTitle}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5 text-[10px] text-[#65746C]">
                        <span>#{task.id}</span>
                        {task.isRadzTask && (
                          <span className="text-[9px] font-bold bg-[#466B53]/10 text-[#466B53] px-1 rounded">
                            Radz Assigned
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Client Source */}
                    <td className="py-3 px-4 whitespace-nowrap hidden md:table-cell">
                      <span className="text-[#242E29] font-medium text-[11px] bg-[#FBF6F3] px-2 py-0.5 rounded border border-[#E8E2DD]">
                        {task.client}
                      </span>
                    </td>

                    {/* Assignees */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {task.assignees.length > 0 ? (
                        <div className="flex items-center -space-x-1.5">
                          {task.assignees.map((assignee) => (
                            <div
                              key={assignee.id}
                              title={assignee.username}
                              className="w-6 h-6 rounded-full border border-white bg-[#3D5249] text-white flex items-center justify-center font-bold text-[9px] shadow-xs"
                            >
                              {assignee.initials}
                            </div>
                          ))}
                          <span className="ml-2 text-[11px] text-[#65746C] hidden sm:inline">
                            {task.assignees[0].username.split(" ")[0]}
                            {task.assignees.length > 1 && ` +${task.assignees.length - 1}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#65746C]/60 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4 whitespace-nowrap hidden lg:table-cell text-[#65746C]">
                      {task.dueDateFormatted || "—"}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderStatusBadge(task.status)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                        }}
                        className="text-xs text-[#466B53] hover:text-[#3D5249] p-1.5"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
            )}
        </>
      )}

        {/* 5. PAGINATION CONTROLS */}
        {!loading && viewMode !== "board" && filteredTasks.length > pageSize && (
          <div className="p-3.5 border-t border-[#E8E2DD] bg-[#FBF6F3]/40 flex items-center justify-between">
            <span className="text-xs text-[#65746C]">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredTasks.length)} of {filteredTasks.length} tasks
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs font-semibold text-[#242E29]">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 6. TASK DETAIL INSPECTION MODAL (UNIFIED GIM DETAIL MODAL) */}
      {/* ========================================================================= */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          currentUserNickname={currentUserNickname}
          currentUserName={currentUserName}
          isCoreAdmin={isCoreAdmin}
          onTaskUpdated={() => {
            loadTasks(true);
          }}
          task={{
            id: selectedTask.id,
            title: selectedTask.name,
            client: selectedTask.client,
            description: selectedTask.description || "",
            status:
              selectedTask.status.toLowerCase() === "closed"
                ? "Closed"
                : selectedTask.status.toLowerCase() === "for review" || selectedTask.status.toLowerCase() === "in review"
                ? "In Review"
                : selectedTask.status.toLowerCase() === "in progress"
                ? "In Progress"
                : "To Do",
            priority:
              selectedTask.priority?.toLowerCase() === "urgent" ||
              (selectedTask.gateCode && ["G18", "G5"].includes(selectedTask.gateCode))
                ? "Urgent"
                : selectedTask.priority?.toLowerCase() === "high" ||
                  (selectedTask.gateCode && ["G7", "G11"].includes(selectedTask.gateCode))
                ? "High"
                : "Normal",
            due_date: selectedTask.dueDateFormatted || null,
            assignee_name: selectedTask.assignees?.[0]?.username || "Unassigned",
            created_by: "ClickUp Mirror",
            tags: selectedTask.gateCode ? [selectedTask.gateCode] : [],
            url: selectedTask.url,
            is_clickup: true,
          }}
        />
      )}
    </div>
  );
}
