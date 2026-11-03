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
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ClickUpTask, ClickUpStats } from "@/lib/clickup/types";
import { TaskDetailModal, TaskItem } from "@/components/tasks/TaskDetailModal";

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
  initialStatusFilter = "all",
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
  const [clientFilter, setClientFilter] = useState<"all" | "little-treasures" | "gim-internal">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

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

  // Compute distinct assignees for dropdown
  const uniqueAssignees = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      t.assignees.forEach((a) => {
        if (!map.has(a.username)) {
          map.set(a.username, a.username);
        }
      });
    });
    return Array.from(map.values()).sort();
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Scoped client check for non-admin users
      if (clientScope && clientScope !== "all") {
        const allowed = Array.isArray(clientScope) ? clientScope : [clientScope];
        const hasAccess = allowed.some((scope) =>
          task.client.toLowerCase().includes(scope.toLowerCase()) ||
          scope.toLowerCase().includes(task.client.toLowerCase()) ||
          task.listName.toLowerCase().includes(scope.toLowerCase())
        );
        if (!hasAccess) return false;
      }

      // Global client context filter from header
      if (selectedClientId && selectedClientId !== "all") {
        const clientKeyMap: Record<string, string> = {
          "little-treasures": "little treasures",
          "wrts": "wrts",
          "studio-nets": "studio nets",
          "invogue-cleans": "invogue",
          "aaron-ofosu": "aaron ofosu",
          "tch2thrive": "tch2thrive",
        };
        const targetPattern = clientKeyMap[selectedClientId];
        if (targetPattern) {
          const matches =
            task.client.toLowerCase().includes(targetPattern) ||
            task.listName.toLowerCase().includes(targetPattern);
          if (!matches) return false;
        }
      }

      // Client filter
      if (clientFilter === "little-treasures" && !task.listName.toLowerCase().includes("little treasures")) {
        return false;
      }
      if (clientFilter === "gim-internal" && !task.listName.toLowerCase().includes("grace in motion")) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (task.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Assignee filter
      if (assigneeFilter !== "all") {
        const hasAssignee = task.assignees.some((a) =>
          a.username.toLowerCase() === assigneeFilter.toLowerCase()
        );
        if (!hasAssignee) return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = task.name.toLowerCase().includes(q);
        const matchesId = task.id.toLowerCase().includes(q);
        const matchesGate = task.gateCode?.toLowerCase().includes(q);
        const matchesAssignee = task.assignees.some((a) => a.username.toLowerCase().includes(q));
        if (!matchesName && !matchesId && !matchesGate && !matchesAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, clientFilter, statusFilter, assigneeFilter, search]);

  // Paginated tasks
  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

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
      {/* 1. TOP HEADER & READ-ONLY MIRROR NOTICE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-[#242E29]">
              Task & Delivery Pipeline
            </h2>
            <Badge variant="brand">Read-Only Mirror</Badge>
          </div>
          <p className="text-xs text-[#65746C] mt-0.5">
            Real-time feed synced directly from ClickUp workspace (Little Treasures & Internal GIM).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto-Connected (60s live feed)</span>
          </div>
          {lastSynced && (
            <span className="text-[11px] text-[#65746C] hidden md:inline">
              Last synced: {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            onClick={() => setStatusFilter("all")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#3D5249] text-white border-[#3D5249] shadow-xs"
                : "bg-white text-[#242E29] border-[#E8E2DD] hover:border-[#466B53]/40"
            }`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${statusFilter === "all" ? "text-white/70" : "text-[#65746C]"}`}>
              Total Tasks
            </p>
            <p className="text-lg font-bold mt-0.5">{stats.totalTasks}</p>
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
              Closed
            </p>
            <p className="text-lg font-bold mt-0.5">{stats.closedCount}</p>
          </div>

          <div
            onClick={() => setStatusFilter("blocked")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "blocked"
                ? "bg-rose-700 text-white border-rose-700 shadow-xs"
                : "bg-white text-[#242E29] border-[#E8E2DD] hover:border-rose-400"
            }`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${statusFilter === "blocked" ? "text-white/80" : "text-rose-700"}`}>
              Blocked
            </p>
            <p className="text-lg font-bold mt-0.5">{stats.blockedCount}</p>
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
                placeholder="Search tasks by name, G-gate (G5, G7), ClickUp ID, or assignee..."
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
              {/* Client Workspace Filter */}
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value as any)}
                className="px-3 py-2 bg-white border border-[#E8E2DD] rounded-lg text-xs font-medium text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
              >
                <option value="all">All Sources (Little Treasures + GIM)</option>
                <option value="little-treasures">Little Treasures Company</option>
                <option value="gim-internal">Grace In Motion (Internal)</option>
              </select>

              {/* Assignee Filter */}
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-[#E8E2DD] rounded-lg text-xs font-medium text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
              >
                <option value="all">All Assignees</option>
                {uniqueAssignees.map((assignee) => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
              </select>

              {/* Reset Filters */}
              {(search || statusFilter !== "all" || clientFilter !== "all" || assigneeFilter !== "all") && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setClientFilter("all");
                    setAssigneeFilter("all");
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
            <CardTitle className="text-sm">ClickUp Task Backlog</CardTitle>
            <Badge variant="neutral">
              Showing {paginatedTasks.length} of {filteredTasks.length} tasks
            </Badge>
          </div>
          <div className="text-xs text-[#65746C] hidden sm:block">
            Page {currentPage} of {totalPages}
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8E2DD] bg-[#FBF6F3] text-[#65746C]">
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px] w-20">Gate</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Task Name & ID</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px] hidden md:table-cell">Client Source</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Assignee(s)</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px] hidden lg:table-cell">Due Date</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2DD]/60">
                {paginatedTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="hover:bg-[#FBF6F3]/50 transition-colors cursor-pointer group"
                  >
                    {/* Gate Code */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {task.gateCode ? (
                        <span className="font-bold text-[#3D5249] text-[11px] bg-[#466B53]/15 px-2 py-0.5 rounded border border-[#466B53]/25">
                          {task.gateCode}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#65746C]/60">—</span>
                      )}
                    </td>

                    {/* Task Title & ID */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#242E29] group-hover:text-[#466B53] transition-colors line-clamp-1">
                        {task.name}
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
                      <span className="text-[#242E29] font-medium text-[11px]">
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. PAGINATION CONTROLS */}
        {!loading && filteredTasks.length > pageSize && (
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
