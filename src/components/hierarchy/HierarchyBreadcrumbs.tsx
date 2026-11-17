"use client";

import React from "react";
import {
  ChevronRight,
  Folder as FolderIcon,
  List as ListIcon,
  Workflow,
  Inbox,
  Plus,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import { Space, Folder, List, PMViewMode } from "@/lib/hierarchy/types";

interface HierarchyBreadcrumbsProps {
  space?: Space | null;
  folder?: Folder | null;
  list?: List | null;
  isMyTasksActive: boolean;
  viewMode: PMViewMode;
  onSwitchViewMode: (mode: PMViewMode) => void;
  onOpenCreateTask: () => void;
}

export function HierarchyBreadcrumbs({
  space,
  folder,
  list,
  isMyTasksActive,
  viewMode,
  onSwitchViewMode,
  onOpenCreateTask,
}: HierarchyBreadcrumbsProps) {
  const views: { id: PMViewMode; label: string }[] = [
    { id: "list", label: "List" },
    { id: "knowledge", label: "KNOWLEDGE HUB 🔒" },
    { id: "board", label: "Board" },
    { id: "calendar", label: "Calendar" },
    { id: "gantt", label: "Gantt" },
    { id: "timeline", label: "Timeline" },
    { id: "my-tasks", label: "My Tasks" },
  ];

  return (
    <div className="bg-white border-b border-[#E8E2DD] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
      {/* Breadcrumb Path */}
      <div className="flex items-center space-x-1.5 text-xs text-[#65746C] min-w-0">
        <span className="font-semibold text-[#242E29]">Grace In Motion</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#65746C]/60 shrink-0" />

        {isMyTasksActive ? (
          <span className="flex items-center gap-1 font-bold text-[#3D5249]">
            <Inbox className="w-3.5 h-3.5 text-[#518E6A]" /> My Tasks Queue
          </span>
        ) : (
          <>
            {space && (
              <span className="flex items-center gap-1 font-semibold text-[#242E29]">
                <Workflow className="w-3.5 h-3.5 text-[#518E6A]" /> {space.name}
              </span>
            )}

            {folder && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#65746C]/60 shrink-0" />
                <span className="flex items-center gap-1 font-semibold text-[#242E29]">
                  <FolderIcon className="w-3.5 h-3.5 text-amber-500" /> {folder.name}
                </span>
              </>
            )}

            {list && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#65746C]/60 shrink-0" />
                <span className="flex items-center gap-1 font-bold text-[#3D5249] truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: list.color || "#00b884" }}
                  />
                  {list.name}
                </span>
              </>
            )}
          </>
        )}
      </div>

      {/* Right Controls: View Mode Switcher + Add Task Button */}
      <div className="flex items-center space-x-2">
        {/* View Mode Tabs */}
        <div className="flex items-center bg-[#FBF6F3] p-1 rounded-xl border border-[#E8E2DD]">
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onSwitchViewMode(v.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === v.id
                  ? "bg-[#3D5249] text-white shadow-xs"
                  : "text-[#65746C] hover:text-[#242E29] hover:bg-white/60"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Create Task Button */}
        <button
          type="button"
          onClick={onOpenCreateTask}
          className="px-3 py-1.5 rounded-xl bg-[#518E6A] hover:bg-[#427457] text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all hover:scale-102 active:scale-98"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
