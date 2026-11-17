"use client";

import React, { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  GitBranch,
  Flag,
  Sparkles,
} from "lucide-react";
import { HierarchicalTask } from "@/lib/hierarchy/types";

interface HierarchyGanttViewProps {
  tasks: HierarchicalTask[];
  onSelectTask: (task: HierarchicalTask) => void;
}

export function HierarchyGanttView({ tasks, onSelectTask }: HierarchyGanttViewProps) {
  // Timeline days generator (e.g. 14 days window around current week)
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });

  return (
    <div className="flex-1 overflow-auto p-4 bg-white flex flex-col font-sans custom-scrollbar">
      {/* Gantt Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DD] shrink-0 mb-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-[#518E6A]" />
          <h3 className="font-bold text-xs text-[#242E29]">
            Interactive Gantt & Dependency Timeline
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
            {tasks.length} Deliverables Tracked
          </span>
        </div>

        <div className="text-[11px] text-[#65746C] flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-[#518E6A] inline-block" /> Complete
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-[#0084ff] inline-block" /> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-[#e0e0e0] inline-block" /> To Do
          </span>
        </div>
      </div>

      {/* Gantt Matrix Grid */}
      <div className="border border-[#E8E2DD] rounded-xl overflow-hidden shadow-xs flex-1 flex flex-col">
        {/* Day Column Headers */}
        <div className="flex bg-[#FBF6F3] border-b border-[#E8E2DD] text-xs font-semibold text-[#65746C]">
          <div className="w-72 p-2.5 border-r border-[#E8E2DD] shrink-0 font-bold text-[#242E29]">
            Task & Deliverable Name
          </div>
          <div className="flex-1 grid grid-cols-14 divide-x divide-[#E8E2DD] text-center text-[10px]">
            {days.map((d, idx) => {
              const isToday = d.toDateString() === today.toDateString();
              return (
                <div
                  key={idx}
                  className={`p-2 ${isToday ? "bg-[#518E6A]/10 text-[#518E6A] font-bold" : ""}`}
                >
                  <div className="uppercase">{d.toLocaleDateString("en-AU", { weekday: "narrow" })}</div>
                  <div className="font-mono">{d.getDate()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Rows with Gantt Bars */}
        <div className="divide-y divide-[#E8E2DD] flex-1 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#65746C] italic">
              No tasks with scheduled timelines found.
            </div>
          ) : (
            tasks.map((task, rowIdx) => {
              // Calculate start and end offset for gantt bar visualization
              const startOffset = (rowIdx % 5) + 1;
              const duration = ((rowIdx * 2) % 6) + 3;

              const getBarColor = (status: string) => {
                switch (status.toLowerCase()) {
                  case "completed":
                    return "bg-[#00b884] text-white";
                  case "in progress":
                    return "bg-[#0084ff] text-white";
                  default:
                    return "bg-[#9b51e0] text-white";
                }
              };

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="flex items-center hover:bg-[#FBF6F3]/50 cursor-pointer transition-colors group text-xs"
                >
                  {/* Left Task Label */}
                  <div className="w-72 p-2.5 border-r border-[#E8E2DD] shrink-0 truncate flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#242E29] group-hover:text-[#518E6A] truncate">
                      {task.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 bg-black/5 text-[#65746C]">
                      {task.priority}
                    </span>
                  </div>

                  {/* Gantt Bar Cell Range */}
                  <div className="flex-1 grid grid-cols-14 divide-x divide-[#E8E2DD]/40 relative h-10 items-center px-1">
                    <div
                      style={{
                        gridColumnStart: startOffset,
                        gridColumnEnd: `span ${duration}`,
                      }}
                      className={`h-6 rounded-lg px-2 flex items-center justify-between text-[10px] font-bold shadow-xs truncate transition-all group-hover:scale-101 ${getBarColor(
                        task.status
                      )}`}
                    >
                      <span className="truncate">{task.title}</span>
                      <span className="text-[8px] opacity-80 uppercase ml-1 shrink-0">
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
