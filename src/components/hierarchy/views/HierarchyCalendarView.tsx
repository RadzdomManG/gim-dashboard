"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
} from "lucide-react";
import { HierarchicalTask } from "@/lib/hierarchy/types";

interface HierarchyCalendarViewProps {
  tasks: HierarchicalTask[];
  onSelectTask: (task: HierarchicalTask) => void;
}

export function HierarchyCalendarView({ tasks, onSelectTask }: HierarchyCalendarViewProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentMonthDate.toLocaleString("en-AU", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Group tasks by day of current month
  const tasksByDay = (day: number) => {
    return tasks.filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  return (
    <div className="flex-1 overflow-auto p-4 bg-white flex flex-col font-sans custom-scrollbar">
      {/* Month Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DD] shrink-0 mb-3">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-[#518E6A]" />
          <h3 className="font-bold text-sm text-[#242E29]">{monthName}</h3>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-[#E8E2DD] hover:bg-[#FBF6F3] text-[#65746C] hover:text-[#242E29]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonthDate(new Date())}
            className="px-2.5 py-1 rounded-lg border border-[#E8E2DD] text-xs font-semibold hover:bg-[#FBF6F3] text-[#242E29]"
          >
            Today
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-[#E8E2DD] hover:bg-[#FBF6F3] text-[#65746C] hover:text-[#242E29]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Calendar Grid */}
      <div className="border border-[#E8E2DD] rounded-xl overflow-hidden shadow-xs flex-1 flex flex-col">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-[#FBF6F3] border-b border-[#E8E2DD] text-center text-xs font-bold text-[#3D5249] py-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-[#E8E2DD] bg-white">
          {/* Empty offset padding cells */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="p-2 bg-[#FBF6F3]/30 min-h-[90px]" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const dayTasks = tasksByDay(dayNum);
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;

            return (
              <div
                key={`day-${dayNum}`}
                className={`p-2 min-h-[90px] flex flex-col justify-between hover:bg-[#FBF6F3]/40 transition-colors ${
                  isToday ? "bg-[#518E6A]/5" : ""
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      isToday ? "bg-[#518E6A] text-white shadow-xs" : "text-[#242E29]"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[9px] font-mono font-bold text-[#518E6A]">
                      {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                    </span>
                  )}
                </div>

                <div className="space-y-1 flex-1 overflow-y-auto max-h-24 custom-scrollbar">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EBF3EF] border border-[#518E6A]/30 text-[#242E29] hover:bg-[#518E6A] hover:text-white cursor-pointer truncate transition-all"
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
