"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Flag,
  MessageSquare,
  Plus,
  GitBranch,
  CheckSquare,
  Clock,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import { HierarchicalTask, TaskStatusConfig } from "@/lib/hierarchy/types";
import { DEFAULT_TASK_STATUSES } from "@/lib/hierarchy/defaults";

interface HierarchyListViewProps {
  tasks: HierarchicalTask[];
  statusConfigs?: TaskStatusConfig[];
  onSelectTask: (task: HierarchicalTask) => void;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
  onOpenCreateTask: (defaultStatus?: string) => void;
}

export function HierarchyListView({
  tasks,
  statusConfigs = DEFAULT_TASK_STATUSES,
  onSelectTask,
  onUpdateStatus,
  onOpenCreateTask,
}: HierarchyListViewProps) {
  // Collapsible status accordions
  const [collapsedStatuses, setCollapsedStatuses] = useState<Record<string, boolean>>({});
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});
  const [visibleLimits, setVisibleLimits] = useState<Record<string, number>>({});

  const toggleStatusAccordion = (statusName: string) => {
    setCollapsedStatuses((prev) => ({ ...prev, [statusName]: !prev[statusName] }));
  };

  const toggleSubtaskAccordion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubtasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Group root tasks by status & sort chronologically by date
  const [dateSortAsc, setDateSortAsc] = useState<boolean>(true);

  const groupedTasks = useMemo(() => {
    const map: Record<string, HierarchicalTask[]> = {};
    statusConfigs.forEach((sc) => {
      map[sc.name.toLowerCase()] = [];
    });

    tasks.forEach((t) => {
      const s = (t.status || "to do").toLowerCase();
      if (!map[s]) map[s] = [];
      map[s].push(t);
    });

    // Sort tasks in each status group chronologically by due_date
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1; // null dates go to bottom
        if (!b.due_date) return -1;
        const timeA = new Date(a.due_date).getTime();
        const timeB = new Date(b.due_date).getTime();
        return dateSortAsc ? timeA - timeB : timeB - timeA;
      });
    });

    return map;
  }, [tasks, statusConfigs, dateSortAsc]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "text-rose-600 bg-rose-50 border-rose-200";
      case "high":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "low":
        return "text-slate-500 bg-slate-50 border-slate-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans bg-[#FBF6F3]/40">
      {/* Quick Sort Controls Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-[#65746C]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#242E29]">Chronological Order:</span>
          <button
            type="button"
            onClick={() => setDateSortAsc(!dateSortAsc)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E8E2DD] text-[#3D5249] hover:bg-stone-50 font-semibold shadow-2xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-[#518E6A]" />
            <span>{dateSortAsc ? "Due Date (Earliest First ↑)" : "Due Date (Latest First ↓)"}</span>
          </button>
        </div>
        <span className="text-[11px] text-[#65746C]">
          Showing {tasks.length} total tasks across {statusConfigs.length} statuses
        </span>
      </div>

      {statusConfigs.map((statusConfig) => {
        const statusKey = statusConfig.name.toLowerCase();
        const statusTasks = groupedTasks[statusKey] || [];
        const isCollapsed = !!collapsedStatuses[statusConfig.name];

        return (
          <div
            key={statusConfig.name}
            className="bg-white rounded-xl border border-[#E8E2DD] shadow-xs overflow-hidden"
          >
            {/* Accordion Header */}
            <div
              onClick={() => toggleStatusAccordion(statusConfig.name)}
              className="px-4 py-2.5 bg-[#FBF6F3]/80 border-b border-[#E8E2DD] flex items-center justify-between cursor-pointer hover:bg-[#FBF6F3] transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <button type="button" className="text-[#65746C] hover:text-[#242E29]">
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: statusConfig.color }}
                  />
                  <span className="font-bold text-xs text-[#242E29] uppercase tracking-wider">
                    {statusConfig.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 font-mono font-bold text-[#65746C]">
                    {statusTasks.length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCreateTask(statusConfig.name);
                }}
                className="text-[11px] text-[#518E6A] hover:text-[#427457] font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            {/* Task Rows */}
            {!isCollapsed && (
              <div className="divide-y divide-[#E8E2DD]">
                {statusTasks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#65746C] italic">
                    No tasks in {statusConfig.name}
                  </div>
                ) : (
                  <>
                    {statusTasks
                      .slice(0, visibleLimits[statusConfig.name] || 40)
                      .map((task) => {
                        const hasSubtasks = (task.subtasks && task.subtasks.length > 0) || (task.subtasks_count || 0) > 0;
                        const isSubtasksOpen = !!expandedSubtasks[task.id];

                        return (
                          <React.Fragment key={task.id}>
                        {/* Parent Task Row */}
                        <div
                          onClick={() => onSelectTask(task)}
                          className="px-4 py-3 hover:bg-[#FBF6F3]/40 cursor-pointer flex items-center justify-between gap-3 transition-colors group"
                        >
                          {/* Left: Subtask trigger + Checkmark + Title */}
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            {hasSubtasks ? (
                              <button
                                type="button"
                                onClick={(e) => toggleSubtaskAccordion(task.id, e)}
                                className="p-0.5 text-[#65746C] hover:text-[#242E29]"
                                title="Expand Subtasks"
                              >
                                {isSubtasksOpen ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </button>
                            ) : (
                              <span className="w-3.5 h-3.5 inline-block" />
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStatus =
                                  task.status.toLowerCase() === "completed" ? "To Do" : "Completed";
                                onUpdateStatus(task.id, nextStatus);
                              }}
                              className="text-[#65746C] hover:text-[#00b884] transition-colors"
                            >
                              {task.status.toLowerCase() === "completed" ? (
                                <CheckCircle2 className="w-4 h-4 text-[#00b884]" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-[#242E29] group-hover:text-[#518E6A] transition-colors block truncate">
                                {task.title}
                              </span>
                              {task.description && (
                                <p className="text-[11px] text-[#65746C] line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Badges, Subtask Count, Checklists, Priority, Assignees, Due Date */}
                          <div className="flex items-center space-x-3 shrink-0 text-xs">
                            {/* Subtasks Count Badge */}
                            {hasSubtasks && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono flex items-center gap-1">
                                <GitBranch className="w-3 h-3" />
                                <span>{task.subtasks_completed_count || 0}/{task.subtasks_count || (task.subtasks?.length || 0)}</span>
                              </span>
                            )}

                            {/* Checklists Badge */}
                            {task.checklists && task.checklists.length > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-mono flex items-center gap-1">
                                <CheckSquare className="w-3 h-3" />
                                <span>{task.checklists.length}</span>
                              </span>
                            )}

                            {/* Priority Flag */}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              <Flag className="w-3 h-3" />
                              <span>{task.priority}</span>
                            </span>

                            {/* Due Date */}
                            {task.due_date && (
                              <span className="text-[11px] text-[#65746C] flex items-center gap-1 font-mono">
                                <Calendar className="w-3.5 h-3.5 text-[#518E6A]" />
                                <span>
                                  {new Date(task.due_date).toLocaleDateString("en-AU", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </span>
                            )}

                            {/* Assignee Avatars */}
                            {task.assignees && task.assignees.length > 0 ? (
                              <div className="flex items-center -space-x-1.5">
                                {task.assignees.slice(0, 3).map((a, aIdx) => (
                                  <div
                                    key={aIdx}
                                    title={a.name || a.nickname}
                                    className="w-5 h-5 rounded-full bg-[#3D5249] text-white flex items-center justify-center font-bold text-[9px] border-2 border-white shadow-xs"
                                  >
                                    {(a.nickname || a.name || "U").slice(0, 2).toUpperCase()}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#65746C]/60 italic">Unassigned</span>
                            )}
                          </div>
                        </div>

                        {/* Subtasks Accordion Content */}
                        {isSubtasksOpen && task.subtasks && task.subtasks.length > 0 && (
                          <div className="bg-[#FBF6F3]/30 pl-11 pr-4 py-1 divide-y divide-[#E8E2DD]/60 border-l-2 border-[#518E6A] ml-8 my-1 rounded-r-lg">
                            {task.subtasks.map((sub) => (
                              <div
                                key={sub.id}
                                onClick={() => onSelectTask(sub)}
                                className="py-2 flex items-center justify-between text-xs hover:bg-white/60 px-2 rounded-md cursor-pointer transition-colors"
                              >
                                <div className="flex items-center space-x-2 min-w-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const nextStatus =
                                        sub.status.toLowerCase() === "completed" ? "To Do" : "Completed";
                                      onUpdateStatus(sub.id, nextStatus);
                                    }}
                                    className="text-[#65746C] hover:text-[#00b884]"
                                  >
                                    {sub.status.toLowerCase() === "completed" ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00b884]" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <span className="text-[11px] font-medium text-[#242E29] truncate">
                                    {sub.title}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2 text-[10px]">
                                  <span
                                    className={`px-1.5 py-0.2 rounded border font-semibold ${getPriorityColor(
                                      sub.priority
                                    )}`}
                                  >
                                    {sub.priority}
                                  </span>
                                  {sub.due_date && (
                                    <span className="font-mono text-[#65746C]">
                                      {new Date(sub.due_date).toLocaleDateString("en-AU", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {statusTasks.length > (visibleLimits[statusConfig.name] || 40) && (
                    <div className="p-3 text-center bg-[#FBF6F3]/50">
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleLimits((prev) => ({
                            ...prev,
                            [statusConfig.name]: (prev[statusConfig.name] || 40) + 50,
                          }))
                        }
                        className="px-3.5 py-1.5 rounded-lg border border-[#518E6A]/30 bg-white hover:bg-[#EBF3EF] text-xs font-bold text-[#518E6A] transition-all shadow-xs"
                      >
                        Load 50 more tasks ({statusTasks.length - (visibleLimits[statusConfig.name] || 40)} remaining) &darr;
                      </button>
                    </div>
                  )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
