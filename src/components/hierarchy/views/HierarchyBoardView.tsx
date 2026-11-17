"use client";

import React from "react";
import {
  Plus,
  Flag,
  Calendar,
  GitBranch,
  CheckSquare,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { HierarchicalTask, TaskStatusConfig } from "@/lib/hierarchy/types";
import { DEFAULT_TASK_STATUSES } from "@/lib/hierarchy/defaults";

interface HierarchyBoardViewProps {
  tasks: HierarchicalTask[];
  statusConfigs?: TaskStatusConfig[];
  onSelectTask: (task: HierarchicalTask) => void;
  onOpenCreateTask: (defaultStatus?: string) => void;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
}

export function HierarchyBoardView({
  tasks,
  statusConfigs = DEFAULT_TASK_STATUSES,
  onSelectTask,
  onOpenCreateTask,
  onUpdateStatus,
}: HierarchyBoardViewProps) {
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
    <div className="flex-1 overflow-x-auto p-4 flex space-x-4 bg-[#FBF6F3]/40 custom-scrollbar">
      {statusConfigs.map((statusConfig) => {
        const columnTasks = tasks.filter(
          (t) => (t.status || "to do").toLowerCase() === statusConfig.name.toLowerCase()
        );

        return (
          <div
            key={statusConfig.name}
            className="w-72 shrink-0 bg-[#FBF6F3] rounded-2xl border border-[#E8E2DD] flex flex-col max-h-full shadow-xs"
          >
            {/* Column Header */}
            <div className="p-3 border-b border-[#E8E2DD] flex items-center justify-between bg-white rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: statusConfig.color }}
                />
                <h4 className="text-xs font-bold text-[#242E29] uppercase tracking-wider">
                  {statusConfig.name}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8E2DD] text-[#65746C] font-mono font-bold">
                  {columnTasks.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onOpenCreateTask(statusConfig.name)}
                className="p-1 rounded-lg text-[#65746C] hover:text-[#242E29] hover:bg-[#FBF6F3] transition-colors"
                title={`Add task in ${statusConfig.name}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards Column */}
            <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5 custom-scrollbar">
              {columnTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#65746C]/60 italic border border-dashed border-[#E8E2DD] rounded-xl">
                  Drop tasks here
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-3.5 bg-white rounded-xl border border-[#E8E2DD] shadow-xs hover:shadow-md hover:border-[#518E6A]/50 transition-all cursor-pointer group space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-[#242E29] group-hover:text-[#518E6A] transition-colors leading-snug line-clamp-2">
                        {task.title}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold shrink-0 ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-[#65746C] line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata: Subtasks & Checklists */}
                    <div className="flex items-center space-x-2 text-[10px] text-[#65746C]">
                      {((task.subtasks && task.subtasks.length > 0) || (task.subtasks_count || 0) > 0) && (
                        <span className="flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <GitBranch className="w-3 h-3" />
                          <span>{task.subtasks_completed_count || 0}/{task.subtasks_count || (task.subtasks?.length || 0)}</span>
                        </span>
                      )}

                      {task.checklists && task.checklists.length > 0 && (
                        <span className="flex items-center gap-1 font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          <CheckSquare className="w-3 h-3" />
                          <span>{task.checklists.length}</span>
                        </span>
                      )}
                    </div>

                    {/* Footer: Due date + Assignees */}
                    <div className="pt-2 border-t border-[#E8E2DD]/60 flex items-center justify-between text-xs">
                      {task.due_date ? (
                        <span className="text-[10px] text-[#65746C] flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-[#518E6A]" />
                          {new Date(task.due_date).toLocaleDateString("en-AU", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#65746C]/50 italic">No deadline</span>
                      )}

                      {task.assignees && task.assignees.length > 0 ? (
                        <div className="flex items-center -space-x-1.5">
                          {task.assignees.slice(0, 3).map((a, i) => (
                            <div
                              key={i}
                              title={a.name || a.nickname}
                              className="w-5 h-5 rounded-full bg-[#3D5249] text-white flex items-center justify-center font-bold text-[8px] border border-white"
                            >
                              {(a.nickname || a.name || "U").slice(0, 2).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#65746C]/50">Unassigned</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
