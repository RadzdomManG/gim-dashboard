"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  MessageSquare,
  Plus,
  MoreHorizontal,
  FileText,
  KanbanSquare,
  List as ListIcon,
  Table as TableIcon,
  Calendar as CalendarIcon,
  GitBranch,
  Sparkles,
  Zap,
  Share2,
  Settings,
  Search,
  Filter,
  Check,
} from "lucide-react";
import { ClickUpTask } from "@/lib/clickup/types";
import { sound } from "@/lib/audio";

interface ClickUpGroupedTaskListViewProps {
  tasks: ClickUpTask[];
  selectedClientName: string;
  clientSlug: string;
  currentUserNickname: string;
  onSelectTask: (task: ClickUpTask) => void;
  onQuickMoveTask: (taskId: string, targetStatus: string, taskName: string, client: string) => void;
  onOpenCreateTask: (defaultStatus?: string) => void;
  onOpenKnowledgeHub: () => void;
  onSwitchViewMode?: (mode: "table" | "board" | "grid") => void;
}

interface SpecialistTabConfig {
  id: string;
  label: string;
  assigneeName?: string;
  icon?: "doc" | "list" | "board" | "table" | "calendar" | "gantt";
  isDoc?: boolean;
}

const CLIENT_SPECIALIST_TABS: Record<string, SpecialistTabConfig[]> = {
  "invogue-cleans": [
    { id: "kh", label: "Knowledge Hub", icon: "doc", isDoc: true },
    { id: "list", label: "List", icon: "list" },
    { id: "erwin", label: "Erwin's", assigneeName: "Erwin", icon: "list" },
    { id: "jedy", label: "Jedy's", assigneeName: "Jedy", icon: "list" },
    { id: "ellyka", label: "Ellyka's", assigneeName: "Ellyka", icon: "list" },
    { id: "board", label: "Board", icon: "board" },
    { id: "calendar", label: "Calendar", icon: "calendar" },
    { id: "table", label: "Table", icon: "table" },
    { id: "gantt", label: "Gantt", icon: "gantt" },
  ],
  "juvibolt-cybertech": [
    { id: "kh", label: "Knowledge Hub", icon: "doc", isDoc: true },
    { id: "list", label: "List", icon: "list" },
    { id: "divine", label: "Divine's", assigneeName: "Divine", icon: "list" },
    { id: "radz", label: "Radz's", assigneeName: "Radz", icon: "list" },
    { id: "kim", label: "Kim's", assigneeName: "Kim", icon: "list" },
    { id: "board", label: "Board", icon: "board" },
    { id: "calendar", label: "Calendar", icon: "calendar" },
    { id: "table", label: "Table", icon: "table" },
  ],
  "we-rock-the-spectrum": [
    { id: "kh", label: "Knowledge Hub", icon: "doc", isDoc: true },
    { id: "list", label: "List", icon: "list" },
    { id: "erwin", label: "Erwin's", assigneeName: "Erwin", icon: "list" },
    { id: "bj", label: "BJ's", assigneeName: "BJ", icon: "list" },
    { id: "aldwin", label: "Aldwin's", assigneeName: "Aldwin", icon: "list" },
    { id: "board", label: "Board", icon: "board" },
    { id: "calendar", label: "Calendar", icon: "calendar" },
    { id: "table", label: "Table", icon: "table" },
  ],
  "noirlab": [
    { id: "kh", label: "Knowledge Hub", icon: "doc", isDoc: true },
    { id: "list", label: "List", icon: "list" },
    { id: "jane", label: "Jane's", assigneeName: "Jane", icon: "list" },
    { id: "jerold", label: "Jerold's", assigneeName: "Jerold", icon: "list" },
    { id: "erwin", label: "Erwin's", assigneeName: "Erwin", icon: "list" },
    { id: "divine", label: "Divine's", assigneeName: "Divine", icon: "list" },
    { id: "completed", label: "Completed This Week", assigneeName: "completed", icon: "list" },
    { id: "board", label: "Board", icon: "board" },
  ],
  "risewise": [
    { id: "kh", label: "Knowledge Hub", icon: "doc", isDoc: true },
    { id: "list", label: "List", icon: "list" },
    { id: "jerold", label: "Jerold's", assigneeName: "Jerold", icon: "list" },
    { id: "cy", label: "Cy's", assigneeName: "Cy", icon: "list" },
    { id: "board", label: "Board", icon: "board" },
  ],
  "studio-nets": [
    { id: "kh", label: "Knowledge Hub", icon: "doc", isDoc: true },
    { id: "list", label: "List", icon: "list" },
    { id: "erwin", label: "Erwin's", assigneeName: "Erwin", icon: "list" },
    { id: "jerold", label: "Jerold's", assigneeName: "Jerold", icon: "list" },
    { id: "joyce", label: "Joyce's", assigneeName: "Joyce", icon: "list" },
    { id: "board", label: "Board", icon: "board" },
  ],
  "gim-internal": [
    { id: "kh", label: "Knowledge Hub", icon: "doc", isDoc: true },
    { id: "ai-registry", label: "GIM AI Assistants Registry", icon: "doc", isDoc: true },
    { id: "list", label: "List", icon: "list" },
    { id: "board", label: "Board", icon: "board" },
    { id: "calendar", label: "Calendar", icon: "calendar" },
    { id: "table", label: "Table", icon: "table" },
  ],
};

const STATUS_GROUPS = [
  { id: "to do", label: "TO DO", color: "#87909E", targetAdvance: "in progress" },
  { id: "in progress", label: "IN PROGRESS", color: "#5F55EE", targetAdvance: "for review" },
  { id: "for review", label: "FOR REVIEW", color: "#F8AE00", targetAdvance: "closed" },
  { id: "blocked", label: "BLOCKED", color: "#D33D44", targetAdvance: "in progress" },
  { id: "closed", label: "CLOSED", color: "#008844", targetAdvance: "to do" },
];

export function ClickUpGroupedTaskListView({
  tasks,
  selectedClientName,
  clientSlug,
  currentUserNickname,
  onSelectTask,
  onQuickMoveTask,
  onOpenCreateTask,
  onOpenKnowledgeHub,
  onSwitchViewMode,
}: ClickUpGroupedTaskListViewProps) {
  // Active specialist tab
  const [activeTabId, setActiveTabId] = useState<string>("list");

  // Expanded sections for status accordions (all open by default, closed can be expanded)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "to do": true,
    "in progress": true,
    "for review": true,
    "blocked": true,
    "closed": false,
  });

  // Expanded parent tasks (for nested subtasks)
  const [expandedParentTasks, setExpandedParentTasks] = useState<Set<string>>(new Set());

  const toggleSection = (statusId: string) => {
    sound.playClick();
    setExpandedSections((prev) => ({
      ...prev,
      [statusId]: !prev[statusId],
    }));
  };

  const toggleParentTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setExpandedParentTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // Specialist tabs for the current client
  const tabs = useMemo(() => {
    const slug = clientSlug || "invogue-cleans";
    return (
      CLIENT_SPECIALIST_TABS[slug] || [
        { id: "kh", label: "Knowledge Hub", icon: "doc", isDoc: true },
        { id: "list", label: "List", icon: "list" },
        { id: "board", label: "Board", icon: "board" },
        { id: "table", label: "Table", icon: "table" },
      ]
    );
  }, [clientSlug]);

  // Filter tasks based on active specialist tab
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const displayedTasks = useMemo(() => {
    if (!activeTab || activeTab.id === "list" || activeTab.isDoc) {
      return tasks;
    }
    if (activeTab.id === "completed") {
      return tasks.filter(
        (t) =>
          t.status.toLowerCase().includes("closed") ||
          t.status.toLowerCase().includes("complete") ||
          t.status.toLowerCase().includes("done")
      );
    }
    if (activeTab.assigneeName) {
      const needle = activeTab.assigneeName.toLowerCase();
      return tasks.filter((t) =>
        t.assignees.some((a) => {
          const u = (a.username || "").toLowerCase();
          const em = (a.email || "").toLowerCase();
          return u.includes(needle) || needle.includes(u) || em.includes(needle);
        })
      );
    }
    return tasks;
  }, [tasks, activeTab]);

  // Group displayed tasks by status
  const groupedTasks = useMemo(() => {
    const map: Record<string, ClickUpTask[]> = {
      "to do": [],
      "in progress": [],
      "for review": [],
      "blocked": [],
      "closed": [],
    };

    displayedTasks.forEach((task) => {
      const s = (task.status || "to do").toLowerCase().trim();
      if (s === "to do" || s === "open" || s === "pending") {
        map["to do"].push(task);
      } else if (s === "in progress" || s === "doing" || s === "active") {
        map["in progress"].push(task);
      } else if (s.includes("review")) {
        map["for review"].push(task);
      } else if (s === "blocked") {
        map["blocked"].push(task);
      } else if (s === "closed" || s === "complete" || s === "completed" || s === "approved" || s === "done") {
        map["closed"].push(task);
      } else {
        map["to do"].push(task);
      }
    });

    return map;
  }, [displayedTasks]);

  // Render priority flag
  const renderPriorityFlag = (priority?: string | null) => {
    if (!priority) {
      return (
        <span className="text-slate-300 hover:text-slate-500 transition-colors" title="No Priority">
          <Flag className="w-3.5 h-3.5" />
        </span>
      );
    }
    const p = priority.toLowerCase();
    if (p === "urgent") {
      return (
        <span className="flex items-center gap-1 text-rose-600 font-semibold text-[11px]" title="Urgent Priority">
          <Flag className="w-3.5 h-3.5 fill-rose-600" />
          <span className="hidden xl:inline">Urgent</span>
        </span>
      );
    }
    if (p === "high") {
      return (
        <span className="flex items-center gap-1 text-amber-500 font-semibold text-[11px]" title="High Priority">
          <Flag className="w-3.5 h-3.5 fill-amber-500" />
          <span className="hidden xl:inline">High</span>
        </span>
      );
    }
    if (p === "normal") {
      return (
        <span className="flex items-center gap-1 text-sky-500 font-medium text-[11px]" title="Normal Priority">
          <Flag className="w-3.5 h-3.5 fill-sky-400 text-sky-500" />
          <span className="hidden xl:inline">Normal</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-slate-400 text-[11px]" title="Low Priority">
        <Flag className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">Low</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#3D5249]/15 shadow-xs overflow-hidden">
      {/* 1. TOP BREADCRUMB & ACTION BAR */}
      <div className="px-5 py-3 border-b border-[#E8E2DD] bg-[#FAF8F5] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#65746C]">
          <span className="text-[#3D5249] flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#518E6A] inline-block" />
            Operations
          </span>
          <span>/</span>
          <span>Active Clients</span>
          <span>/</span>
          <span className="text-[#242E29] font-bold bg-[#E8E2DD]/50 px-2 py-0.5 rounded text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {selectedClientName || "InVogue Cleans"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenKnowledgeHub()}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#3D5249] bg-white border border-[#E8E2DD] rounded-lg hover:border-[#518E6A] transition-colors"
            title="Open Client Knowledge Hub & SOPs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#518E6A]" />
            <span>AI Knowledge</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCreateTask("To Do")}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#242E29] text-white text-xs font-bold rounded-lg hover:bg-[#3D5249] transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>
        </div>
      </div>

      {/* 2. AUTHENTIC CLICKUP VIEWS NAVIGATION BAR */}
      <div className="px-4 border-b border-[#E8E2DD] bg-white flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 py-1">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  if (tab.isDoc) {
                    onOpenKnowledgeHub();
                  } else if (tab.id === "board") {
                    if (onSwitchViewMode) onSwitchViewMode("board");
                  } else if (tab.id === "table") {
                    if (onSwitchViewMode) onSwitchViewMode("table");
                  } else {
                    setActiveTabId(tab.id);
                  }
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#3D5249] text-white shadow-xs font-bold"
                    : "text-[#65746C] hover:text-[#242E29] hover:bg-[#FBF6F3]"
                }`}
              >
                {tab.icon === "doc" ? (
                  <FileText className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-purple-600"}`} />
                ) : tab.icon === "board" ? (
                  <KanbanSquare className="w-3.5 h-3.5" />
                ) : tab.icon === "table" ? (
                  <TableIcon className="w-3.5 h-3.5" />
                ) : tab.icon === "calendar" ? (
                  <CalendarIcon className="w-3.5 h-3.5" />
                ) : (
                  <ListIcon className="w-3.5 h-3.5" />
                )}
                <span>{tab.label}</span>
                {tab.isDoc && (
                  <span className="text-[9px] px-1 rounded bg-purple-200/50 text-purple-900 font-mono font-bold">
                    DOC
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center space-x-2 text-xs text-[#65746C] shrink-0 pl-4">
          <span className="text-[11px] font-mono">
            {displayedTasks.length} {displayedTasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>
      </div>

      {/* 3. GROUPED STATUS SECTIONS (CLICKUP 1:1 REVERSE-ENGINEERED) */}
      <div className="divide-y divide-[#E8E2DD]/70">
        {STATUS_GROUPS.map((group) => {
          const groupTasks = groupedTasks[group.id] || [];
          const isExpanded = expandedSections[group.id] ?? true;

          // Separate parent tasks and nested subtasks
          // Top-level parent tasks: tasks that have no parent OR whose parent is not in this group
          const topLevelTasks = groupTasks.filter((t) => !t.parent);
          // If all tasks have parents (edge-case), fall back to all
          const effectiveTopLevel = topLevelTasks.length > 0 ? topLevelTasks : groupTasks;

          return (
            <div key={group.id} className="bg-white">
              {/* SECTION HEADER ACCORDION */}
              <div
                onClick={() => toggleSection(group.id)}
                className="px-4 py-2.5 bg-[#FAF8F5]/80 hover:bg-[#FBF6F3] transition-colors cursor-pointer flex items-center justify-between border-b border-[#E8E2DD]/60 select-none"
              >
                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    className="p-0.5 text-[#65746C] hover:text-[#242E29] transition-transform"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#65746C]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#65746C]" />
                    )}
                  </button>

                  {/* Status Badge with ClickUp hex color */}
                  <span
                    className="px-2.5 py-0.5 rounded text-[11px] font-bold text-white tracking-wider uppercase shadow-2xs"
                    style={{ backgroundColor: group.color }}
                  >
                    {group.label}
                  </span>

                  {/* Task Count Badge */}
                  <span className="text-xs font-bold text-[#65746C] font-mono">
                    {effectiveTopLevel.length}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onOpenCreateTask(group.label)}
                    className="p-1 rounded text-[#65746C] hover:text-[#242E29] hover:bg-[#E8E2DD]/50 transition-colors"
                    title={`Add task to ${group.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1 rounded text-[#65746C] hover:text-[#242E29] hover:bg-[#E8E2DD]/50 transition-colors"
                    title="Section options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SECTION CONTENT TABLE */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E8E2DD]/60 text-[10px] uppercase tracking-wider font-semibold text-[#65746C] bg-white">
                        <th className="py-2 px-4 w-12 text-center"></th>
                        <th className="py-2 px-2 font-semibold">Name</th>
                        <th className="py-2 px-4 font-semibold w-40">Assignee</th>
                        <th className="py-2 px-4 font-semibold w-32 hidden md:table-cell">Due date</th>
                        <th className="py-2 px-4 font-semibold w-28 hidden lg:table-cell">Priority</th>
                        <th className="py-2 px-4 font-semibold w-20 text-center hidden sm:table-cell">Comments</th>
                        <th className="py-2 px-4 font-semibold w-28 text-right hidden xl:table-cell">Time tracked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2DD]/40">
                      {effectiveTopLevel.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-4 px-4 text-center text-xs text-[#65746C]/60 italic">
                            No tasks in {group.label}
                          </td>
                        </tr>
                      ) : (
                        effectiveTopLevel.map((task) => {
                          const cleanTitle = task.name.replace(
                            /\s*\|\s*(Juvibolt Cybertech|Little Treasures Company|We Rock the Spectrum|Risewise|NoirLab|Studio Nets|InVogue Cleans|Grace in Motion).*$/i,
                            ""
                          );

                          const hasSubtasks =
                            (task.subtasksCount && task.subtasksCount > 0) ||
                            (task.subtasks && task.subtasks.length > 0);
                          const isSubtasksOpen = expandedParentTasks.has(task.id);
                          const isClosed =
                            task.status.toLowerCase() === "closed" ||
                            task.status.toLowerCase() === "complete" ||
                            task.status.toLowerCase() === "done";

                          return (
                            <React.Fragment key={task.id}>
                              {/* TOP-LEVEL TASK ROW */}
                              <tr
                                onClick={() => onSelectTask(task)}
                                className="hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                              >
                                {/* Checkbox Column */}
                                <td
                                  className="py-2.5 px-3 text-center w-12"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextStatus = isClosed ? "to do" : "closed";
                                    onQuickMoveTask(task.id, nextStatus, task.name, task.client);
                                  }}
                                >
                                  {isClosed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 hover:text-emerald-700 mx-auto transition-transform active:scale-90" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 mx-auto transition-transform active:scale-90" />
                                  )}
                                </td>

                                {/* Name Column with Subtask Chevron & Tags */}
                                <td className="py-2.5 px-2">
                                  <div className="flex items-center gap-2">
                                    {/* Expand Subtasks Chevron */}
                                    {hasSubtasks ? (
                                      <button
                                        type="button"
                                        onClick={(e) => toggleParentTask(task.id, e)}
                                        className="p-0.5 rounded text-[#65746C] hover:text-[#242E29] hover:bg-[#E8E2DD]/50 transition-colors"
                                        title={isSubtasksOpen ? "Collapse subtasks" : "Expand subtasks"}
                                      >
                                        {isSubtasksOpen ? (
                                          <ChevronDown className="w-3.5 h-3.5 text-[#3D5249]" />
                                        ) : (
                                          <ChevronRight className="w-3.5 h-3.5 text-[#65746C]" />
                                        )}
                                      </button>
                                    ) : (
                                      <span className="w-4 inline-block" />
                                    )}

                                    {/* Gate Code Badge */}
                                    {task.gateCode && (
                                      <span className="font-bold text-[#3D5249] text-[10px] bg-[#466B53]/15 px-1.5 py-0.2 rounded border border-[#466B53]/25 shrink-0">
                                        {task.gateCode}
                                      </span>
                                    )}

                                    {/* Task Title */}
                                    <span className="font-semibold text-[#242E29] group-hover:text-[#466B53] transition-colors line-clamp-1">
                                      {cleanTitle}
                                    </span>

                                    {/* Subtask Counter Pill */}
                                    {hasSubtasks && (
                                      <span
                                        className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#65746C] bg-[#E8E2DD]/50 px-1.5 py-0.2 rounded-full font-mono shrink-0"
                                        title={`${task.subtasksCount || task.subtasks?.length || 0} subtasks`}
                                      >
                                        <GitBranch className="w-3 h-3 text-[#518E6A]" />
                                        {task.subtasksCount || task.subtasks?.length || 0}
                                      </span>
                                    )}

                                    {/* Tag Chips */}
                                    {task.tags && task.tags.length > 0 && (
                                      <div className="hidden sm:flex items-center gap-1 shrink-0">
                                        {task.tags.map((tag) => (
                                          <span
                                            key={tag.name}
                                            className="px-1.5 py-0.2 rounded text-[9px] font-medium border"
                                            style={{
                                              backgroundColor: tag.tag_bg ? `${tag.tag_bg}25` : "#E0F2FE",
                                              borderColor: tag.tag_bg ? `${tag.tag_bg}50` : "#BAE6FD",
                                              color: tag.tag_fg || "#0369A1",
                                            }}
                                          >
                                            {tag.name}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Assignee Column */}
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  {task.assignees.length > 0 ? (
                                    <div className="flex items-center space-x-1.5">
                                      <div className="flex items-center -space-x-1.5">
                                        {task.assignees.map((assignee) => (
                                          <div
                                            key={assignee.id}
                                            title={assignee.username}
                                            className="w-6 h-6 rounded-full border border-white text-white flex items-center justify-center font-bold text-[9px] shadow-2xs"
                                            style={{ backgroundColor: assignee.color || "#466B53" }}
                                          >
                                            {assignee.initials || assignee.username.slice(0, 2).toUpperCase()}
                                          </div>
                                        ))}
                                      </div>
                                      <span className="text-[11px] text-[#65746C] truncate max-w-[90px] hidden sm:inline">
                                        {task.assignees[0].username.split(" ")[0]}
                                        {task.assignees.length > 1 && ` +${task.assignees.length - 1}`}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-[#65746C]/60 italic">—</span>
                                  )}
                                </td>

                                {/* Due Date Column */}
                                <td className="py-2.5 px-4 whitespace-nowrap text-[#65746C] hidden md:table-cell text-[11px]">
                                  {task.dueDateFormatted ? (
                                    <span className="flex items-center gap-1 font-medium text-[#242E29]">
                                      <Clock className="w-3 h-3 text-[#518E6A]" />
                                      {task.dueDateFormatted}
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </td>

                                {/* Priority Column */}
                                <td className="py-2.5 px-4 whitespace-nowrap hidden lg:table-cell">
                                  {renderPriorityFlag(task.priority)}
                                </td>

                                {/* Comments Column */}
                                <td className="py-2.5 px-4 whitespace-nowrap text-center hidden sm:table-cell">
                                  {task.commentsCount && task.commentsCount > 0 ? (
                                    <span
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#65746C] hover:text-[#242E29]"
                                      title={`${task.commentsCount} comments`}
                                    >
                                      <MessageSquare className="w-3.5 h-3.5 text-[#518E6A]" />
                                      <span>{task.commentsCount}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[#65746C]/40 text-center">—</span>
                                  )}
                                </td>

                                {/* Time Tracked Column */}
                                <td className="py-2.5 px-4 whitespace-nowrap text-right hidden xl:table-cell">
                                  {task.timeSpentFormatted ? (
                                    <span className="text-[11px] font-mono font-medium text-[#3D5249]">
                                      {task.timeSpentFormatted}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[#65746C]/50 hover:text-[#242E29] transition-colors">
                                      + Add time
                                    </span>
                                  )}
                                </td>
                              </tr>

                              {/* NESTED SUBTASK ROWS (WHEN EXPANDED) */}
                              {isSubtasksOpen && task.subtasks && task.subtasks.length > 0 && (
                                <>
                                  {task.subtasks.map((subtask) => {
                                    const isSubClosed =
                                      subtask.status.toLowerCase() === "closed" ||
                                      subtask.status.toLowerCase() === "complete" ||
                                      subtask.status.toLowerCase() === "done";
                                    return (
                                      <tr
                                        key={subtask.id}
                                        onClick={() => onSelectTask(subtask)}
                                        className="bg-[#FAF8F5]/50 hover:bg-[#FBF6F3] transition-colors cursor-pointer"
                                      >
                                        {/* Subtask Indented Checkbox */}
                                        <td
                                          className="py-2 px-3 text-center"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const nextSubStatus = isSubClosed ? "to do" : "closed";
                                            onQuickMoveTask(subtask.id, nextSubStatus, subtask.name, subtask.client);
                                          }}
                                        >
                                          {isSubClosed ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto" />
                                          ) : (
                                            <Circle className="w-3.5 h-3.5 text-slate-300 hover:text-emerald-600 mx-auto" />
                                          )}
                                        </td>

                                        {/* Subtask Title with Tree Branch */}
                                        <td className="py-2 px-2 pl-7">
                                          <div className="flex items-center gap-1.5 text-xs text-[#242E29]">
                                            <span className="text-[#65746C]/50 text-xs">└─</span>
                                            <span className={`${isSubClosed ? "line-through text-[#65746C]" : "font-medium"}`}>
                                              {subtask.name}
                                            </span>
                                          </div>
                                        </td>

                                        {/* Subtask Assignee */}
                                        <td className="py-2 px-4 whitespace-nowrap text-[11px] text-[#65746C]">
                                          {subtask.assignees.length > 0
                                            ? subtask.assignees[0].username.split(" ")[0]
                                            : "—"}
                                        </td>

                                        {/* Subtask Due Date */}
                                        <td className="py-2 px-4 whitespace-nowrap text-[11px] text-[#65746C] hidden md:table-cell">
                                          {subtask.dueDateFormatted || "—"}
                                        </td>

                                        {/* Subtask Priority */}
                                        <td className="py-2 px-4 whitespace-nowrap hidden lg:table-cell">
                                          {renderPriorityFlag(subtask.priority)}
                                        </td>

                                        {/* Subtask Comments */}
                                        <td className="py-2 px-4 whitespace-nowrap text-center hidden sm:table-cell">
                                          {subtask.commentsCount && subtask.commentsCount > 0 ? (
                                            <span className="text-[10px] text-[#65746C]">
                                              {subtask.commentsCount}
                                            </span>
                                          ) : (
                                            "—"
                                          )}
                                        </td>

                                        {/* Subtask Time */}
                                        <td className="py-2 px-4 whitespace-nowrap text-right hidden xl:table-cell text-[10px] text-[#65746C]/60">
                                          {subtask.timeSpentFormatted || "—"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}

                      {/* ADD TASK ROW AT BOTTOM OF STATUS SECTION */}
                      <tr className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="py-2 px-3 text-center text-[#65746C]">
                          <Plus className="w-3.5 h-3.5 mx-auto" />
                        </td>
                        <td colSpan={6} className="py-2 px-2">
                          <button
                            type="button"
                            onClick={() => onOpenCreateTask(group.label)}
                            className="text-xs font-semibold text-[#65746C] hover:text-[#242E29] flex items-center gap-1.5 transition-colors"
                          >
                            <span>Add Task</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
