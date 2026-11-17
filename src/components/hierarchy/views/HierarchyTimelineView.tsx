"use client";

import React from "react";
import { Clock, Calendar, User, Flag } from "lucide-react";
import { HierarchicalTask } from "@/lib/hierarchy/types";

interface HierarchyTimelineViewProps {
  tasks: HierarchicalTask[];
  onSelectTask: (task: HierarchicalTask) => void;
}

export function HierarchyTimelineView({ tasks, onSelectTask }: HierarchyTimelineViewProps) {
  // Specialists lanes
  const specialists = [
    { name: "Radzdom Gallego", role: "Chief Architect / Admin" },
    { name: "Divine Origines", role: "Owner & Strategy" },
    { name: "Erwin Manaog", role: "Operations Manager (OM)" },
    { name: "Kimberly Besa", role: "Marketing Specialist (SMM)" },
    { name: "BJ Ricafrente", role: "Operations Specialist" },
  ];

  return (
    <div className="flex-1 overflow-auto p-4 bg-white flex flex-col font-sans custom-scrollbar">
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DD] shrink-0 mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#518E6A]" />
          <h3 className="font-bold text-xs text-[#242E29]">
            Specialist Resource Scheduling & Timeline Lanes
          </h3>
        </div>
      </div>

      <div className="border border-[#E8E2DD] rounded-xl overflow-hidden divide-y divide-[#E8E2DD] shadow-xs">
        {specialists.map((spec, sIdx) => {
          // Filter tasks assigned to this specialist or distribute for visualization
          const assignedTasks = tasks.filter((t) =>
            (t.assignees || []).some((a) => a.name.includes(spec.name) || spec.name.includes(a.name))
          );
          const displayTasks = assignedTasks.length > 0 ? assignedTasks : tasks.slice(sIdx * 2, sIdx * 2 + 2);

          return (
            <div key={spec.name} className="p-3.5 flex items-start space-x-4 hover:bg-[#FBF6F3]/30 transition-colors">
              <div className="w-56 shrink-0 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#3D5249] text-white flex items-center justify-center font-bold text-xs">
                  {spec.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h5 className="font-bold text-xs text-[#242E29]">{spec.name}</h5>
                  <span className="text-[10px] text-[#65746C]">{spec.role}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-wrap gap-2 pt-1">
                {displayTasks.length === 0 ? (
                  <span className="text-xs text-[#65746C]/60 italic">No scheduled deliverables</span>
                ) : (
                  displayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="px-3 py-1.5 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3] hover:bg-[#518E6A] hover:text-white cursor-pointer shadow-xs transition-all text-xs font-semibold flex items-center space-x-2 group"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#518E6A] group-hover:bg-white" />
                      <span>{t.title}</span>
                      <span className="text-[10px] opacity-75 font-mono">[{t.status}]</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
