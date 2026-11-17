"use client";

import React from "react";
import {
  Inbox,
  CheckCircle2,
  Circle,
  Flag,
  Calendar,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { HierarchicalTask } from "@/lib/hierarchy/types";

interface HierarchyMyTasksViewProps {
  tasks: HierarchicalTask[];
  currentUserName: string;
  currentUserNickname: string;
  onSelectTask: (task: HierarchicalTask) => void;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
}

export function HierarchyMyTasksView({
  tasks,
  currentUserName,
  currentUserNickname,
  onSelectTask,
  onUpdateStatus,
}: HierarchyMyTasksViewProps) {
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
    <div className="flex-1 overflow-auto p-4 bg-[#FBF6F3]/40 flex flex-col font-sans space-y-4 custom-scrollbar">
      {/* Banner */}
      <div className="p-4 bg-[#3D5249] text-white rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#518E6A] flex items-center justify-center text-white shadow-xs">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">
              {currentUserNickname || currentUserName}&apos;s Personal Task Queue
            </h3>
            <p className="text-xs text-white/70 mt-0.5">
              Aggregated across all Spaces, Folders, and Lists in GIM Agency OS
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-bold font-mono text-emerald-300">
            {tasks.length}
          </span>
          <span className="text-[11px] text-white/70 block">Active Assigned Tasks</span>
        </div>
      </div>

      {/* Task Queue List */}
      <div className="bg-white rounded-2xl border border-[#E8E2DD] divide-y divide-[#E8E2DD] shadow-xs overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-[#242E29]">Queue is All Caught Up!</h4>
            <p className="text-xs text-[#65746C]">You have no pending tasks assigned right now.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="p-3.5 hover:bg-[#FBF6F3]/50 cursor-pointer flex items-center justify-between gap-3 transition-colors group text-xs"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextStatus =
                      task.status.toLowerCase() === "completed" ? "To Do" : "Completed";
                    onUpdateStatus(task.id, nextStatus);
                  }}
                  className="text-[#65746C] hover:text-[#00b884]"
                >
                  {task.status.toLowerCase() === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00b884]" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>

                <div className="min-w-0">
                  <span className="font-bold text-[#242E29] group-hover:text-[#518E6A] transition-colors truncate block">
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-[#65746C] mt-0.5">
                    {task.space_name && <span>{task.space_name}</span>}
                    {task.folder_name && <span>&bull; {task.folder_name}</span>}
                    {task.list_name && <span className="font-medium text-[#3D5249]">&bull; {task.list_name}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 shrink-0">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>

                <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/5 font-mono uppercase text-[#65746C]">
                  {task.status}
                </span>

                {task.due_date && (
                  <span className="text-[11px] text-[#65746C] font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#518E6A]" />
                    {new Date(task.due_date).toLocaleDateString("en-AU", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
