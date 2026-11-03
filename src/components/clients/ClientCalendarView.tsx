"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Filter,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TaskItem, TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";

interface ClientCalendarViewProps {
  clientName: string;
  tasks: TaskItem[];
  onTaskUpdated?: () => void;
  availableClients?: string[];
  currentUserName?: string;
  currentUserNickname?: string;
}

export function ClientCalendarView({
  clientName,
  tasks,
  onTaskUpdated,
  availableClients,
  currentUserName,
  currentUserNickname,
}: ClientCalendarViewProps) {
  // Calendar navigation state (Year 2026, Month Nov = index 10)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 10, 1));
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTaskDate, setCreateTaskDate] = useState<string>("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 10, 3));
  };

  // Get calendar days for month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Adjust so Monday is 0
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Filter tasks for this client (or client matching)
  const clientTasks = tasks.filter((t) => {
    if (!t.client) return false;
    return (
      t.client.toLowerCase().includes(clientName.toLowerCase()) ||
      clientName.toLowerCase().includes(t.client.toLowerCase())
    );
  });

  // Calculate upcoming / overdue deadlines
  const urgentOrOverdueTasks = clientTasks.filter((t) => {
    if (!t.due_date || t.status === "Approved" || t.status === "Completed") return false;
    const due = new Date(t.due_date);
    const now = new Date(2026, 10, 3); // Current simulation context: Nov 3, 2026
    const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7; // Within 7 days
  });

  // Map tasks to day of current month
  const tasksByDay: Record<number, TaskItem[]> = {};
  clientTasks.forEach((t) => {
    if (t.due_date) {
      const d = new Date(t.due_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayNum = d.getDate();
        if (!tasksByDay[dayNum]) tasksByDay[dayNum] = [];
        tasksByDay[dayNum].push(t);
      }
    }
  });

  return (
    <div className="space-y-4">
      {/* 1. URGENT NOTIFICATION BANNER */}
      {urgentOrOverdueTasks.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-200/80 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <span className="font-bold">
                {urgentOrOverdueTasks.length} Deadline Alert{urgentOrOverdueTasks.length > 1 ? "s" : ""}:
              </span>{" "}
              {urgentOrOverdueTasks.map((t) => t.title).join(", ")}
            </div>
          </div>
          <span className="text-[11px] font-mono text-amber-800 font-semibold shrink-0">
            Real-time Delivery Watch
          </span>
        </div>
      )}

      {/* 2. CALENDAR HEADER BAR */}
      <div className="bg-white rounded-2xl p-4 border border-[#3D5249]/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-[#3D5249]/20 rounded-xl p-1 bg-[#FBF6F3]/50">
            <button
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-white text-[#3D5249] transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-[#242E29] px-2 min-w-32 text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-white text-[#3D5249] transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={goToToday} className="text-xs">
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setCreateTaskDate(new Date(year, month, 15).toISOString().split("T")[0]);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task / Deadline</span>
          </Button>
        </div>
      </div>

      {/* 3. CALENDAR GRID */}
      <div className="bg-white rounded-2xl border border-[#3D5249]/15 shadow-sm overflow-hidden">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-[#3D5249]/10 bg-[#3D5249]/5 text-center text-xs font-bold text-[#3D5249] py-2.5">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#3D5249]/10 text-xs">
          {/* Previous month padding days */}
          {Array.from({ length: adjustedFirstDay }).map((_, i) => {
            const prevDayNum = daysInPrevMonth - adjustedFirstDay + i + 1;
            return (
              <div key={`prev-${i}`} className="min-h-24 p-2 bg-[#FBF6F3]/40 text-[#65746C]/40">
                <span className="font-mono text-[11px]">{prevDayNum}</span>
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayTasks = tasksByDay[dayNum] || [];
            const isToday = dayNum === 3 && month === 10 && year === 2026;

            const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

            return (
              <div
                key={`curr-${dayNum}`}
                className={`min-h-24 p-2 flex flex-col justify-between transition-colors group hover:bg-[#FBF6F3]/60 relative ${
                  isToday ? "bg-[#518E6A]/5" : "bg-white"
                }`}
              >
                {/* Top day header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold ${
                      isToday
                        ? "bg-[#518E6A] text-white"
                        : "text-[#242E29]"
                    }`}
                  >
                    {dayNum}
                  </span>

                  <button
                    onClick={() => {
                      setCreateTaskDate(dateString);
                      setIsCreateModalOpen(true);
                    }}
                    title="Add task on this date"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#3D5249]/10 text-[#3D5249] transition-opacity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Tasks list inside day */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-20">
                  {dayTasks.map((t) => {
                    const statusColor =
                      t.status === "Approved" || t.status === "Completed"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : t.status === "In Review"
                        ? "bg-amber-50 text-amber-800 border-amber-300"
                        : t.status === "In Progress"
                        ? "bg-[#518E6A]/10 text-[#3D5249] border-[#518E6A]/30"
                        : "bg-slate-50 text-slate-700 border-slate-200";

                    return (
                      <div
                        key={t.id}
                        role="button"
                        onClick={() => setSelectedTask(t)}
                        className={`px-1.5 py-1 rounded-md text-[10px] border truncate cursor-pointer hover:shadow-xs transition-shadow font-medium flex items-center justify-between gap-1 ${statusColor}`}
                      >
                        <span className="truncate">{t.title}</span>
                        {t.priority === "Urgent" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={() => {
          if (onTaskUpdated) onTaskUpdated();
        }}
        currentUserName={currentUserName}
        currentUserNickname={currentUserNickname}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultClient={clientName}
        defaultDate={createTaskDate}
        availableClients={availableClients}
        onTaskCreated={() => {
          if (onTaskUpdated) onTaskUpdated();
        }}
      />
    </div>
  );
}
