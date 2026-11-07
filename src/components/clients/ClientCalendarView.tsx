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
  X,
  ExternalLink,
  ChevronRight as ChevronRightIcon,
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
  // Calendar navigation state (defaults dynamically to current month and year)
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTaskDate, setCreateTaskDate] = useState<string>("");

  // Dynamic Real-Time Today State
  const realNow = new Date();
  const todayDayNum = realNow.getDate();
  const todayMonthName = realNow.toLocaleString("en-US", { month: "short" });
  const todayLabel = `Today (${todayMonthName} ${String(todayDayNum).padStart(2, "0")})`;

  // Day Tasks Pop-up Modal State
  const [selectedDayData, setSelectedDayData] = useState<{
    dayNum: number;
    dateString: string;
    tasks: TaskItem[];
  } | null>(null);

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

  const [filterAssignee, setFilterAssignee] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");

  // Get calendar days for month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Adjust so Monday is 0
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Filter tasks for this client (or client matching)
  const isAllClients = !clientName || clientName === "All Clients" || clientName.toLowerCase() === "all";
  const clientTasks = tasks.filter((t) => {
    if (isAllClients) return true;
    if (!t.client) return false;
    return (
      t.client.toLowerCase().includes(clientName.toLowerCase()) ||
      clientName.toLowerCase().includes(t.client.toLowerCase())
    );
  });

  const assignees = [
    "All",
    ...Array.from(new Set(clientTasks.map((t) => t.assignee_name || "Unassigned").filter(Boolean))),
  ];

  const filteredTasks = clientTasks.filter((t) => {
    if (filterAssignee !== "All" && (t.assignee_name || "Unassigned") !== filterAssignee) return false;
    if (filterPriority !== "All" && t.priority !== filterPriority) return false;
    return true;
  });

  // Map tasks to day of current month
  const tasksByDay: Record<number, TaskItem[]> = {};
  filteredTasks.forEach((t) => {
    if (t.due_date) {
      const d = new Date(t.due_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!tasksByDay[day]) tasksByDay[day] = [];
        tasksByDay[day].push(t);
      }
    }
  });

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const dNum = now.getDate();
    const todayTasks = tasksByDay[dNum] || [];
    const yStr = now.getFullYear();
    const mStr = String(now.getMonth() + 1).padStart(2, "0");
    const dayStr = String(dNum).padStart(2, "0");
    setSelectedDayData({
      dayNum: dNum,
      dateString: `${yStr}-${mStr}-${dayStr}`,
      tasks: todayTasks,
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-[#3D5249]/15 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#65746C]">Month's Deliverables</span>
          <p className="text-xl font-bold font-serif text-[#242E29] mt-0.5">{filteredTasks.length}</p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-[#3D5249]/15 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">Approved / Done</span>
          <p className="text-xl font-bold font-serif text-emerald-700 mt-0.5">
            {filteredTasks.filter((t) => t.status === "Approved" || t.status === "Completed" || t.status === "Closed").length}
          </p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-[#3D5249]/15 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">In Progress / Review</span>
          <p className="text-xl font-bold font-serif text-amber-700 mt-0.5">
            {filteredTasks.filter((t) => t.status === "In Progress" || t.status === "In Review").length}
          </p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-[#3D5249]/15 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-800">High / Urgent Priority</span>
          <p className="text-xl font-bold font-serif text-rose-700 mt-0.5">
            {filteredTasks.filter((t) => t.priority === "High" || t.priority === "Urgent").length}
          </p>
        </div>
      </div>

      {/* 2. CALENDAR CONTROLS & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#3D5249]/15 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-[#3D5249]/20 hover:bg-[#3D5249]/5 text-[#3D5249] transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-[#3D5249]/20 hover:bg-[#3D5249]/5 text-[#3D5249] transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-bold font-serif text-[#242E29]">
            {monthNames[month]} {year}
          </h3>

          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#518E6A]/10 text-[#3D5249] hover:bg-[#518E6A]/20 transition-colors"
            title="Jump to today and view today's tasks"
          >
            {todayLabel}
          </button>

          {/* Filter options */}
          <div className="hidden md:flex items-center gap-2 ml-2 pl-3 border-l border-[#E8E2DD]">
            <div className="flex items-center gap-1.5 bg-[#FBF6F3] border border-[#E8E2DD] px-2.5 py-1 rounded-xl text-xs">
              <User className="w-3.5 h-3.5 text-[#65746C]" />
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="bg-transparent text-xs text-[#242E29] font-medium focus:outline-none"
              >
                {assignees.map((a, i) => (
                  <option key={i} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#FBF6F3] border border-[#E8E2DD] px-2.5 py-1 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-[#65746C]" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-transparent text-xs text-[#242E29] font-medium focus:outline-none"
              >
                <option value="All">All Priority</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
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
            const now = new Date();
            const isToday =
              dayNum === now.getDate() &&
              month === now.getMonth() &&
              year === now.getFullYear();

            const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

            return (
              <div
                key={`curr-${dayNum}`}
                onClick={() => {
                  setSelectedDayData({
                    dayNum,
                    dateString,
                    tasks: dayTasks,
                  });
                }}
                className={`min-h-24 p-2 flex flex-col justify-between transition-colors group cursor-pointer hover:bg-[#FBF6F3]/80 relative ${
                  isToday ? "bg-[#518E6A]/10 ring-1 ring-[#518E6A]/40" : "bg-white"
                }`}
              >
                {/* Top day header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold ${
                      isToday
                        ? "bg-[#518E6A] text-white shadow-xs"
                        : "text-[#242E29]"
                    }`}
                  >
                    {dayNum}
                  </span>

                  <div className="flex items-center gap-1">
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-[#466B53] bg-[#466B53]/10 px-1 rounded-full">
                        {dayTasks.length}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCreateTaskDate(dateString);
                        setIsCreateModalOpen(true);
                      }}
                      title="Add task on this date"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#3D5249]/10 text-[#3D5249] transition-opacity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Tasks list inside day */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-20">
                  {dayTasks.map((t) => {
                    const statusColor =
                      t.status === "Closed"
                        ? "bg-purple-50 text-purple-900 border-purple-200 line-through opacity-85"
                        : t.status === "Approved" || t.status === "Completed"
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(t);
                        }}
                        className={`px-1.5 py-1 rounded-md text-[10px] border truncate cursor-pointer hover:shadow-xs transition-shadow font-medium flex items-center justify-between gap-1 ${statusColor}`}
                      >
                        <span className="truncate flex items-center gap-1">
                          {isAllClients && t.client && (
                            <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-black/10 shrink-0">
                              {t.client.split(" ")[0]}
                            </span>
                          )}
                          <span className="truncate font-semibold">{t.title}</span>
                        </span>
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

      {/* 4. DAY TASKS POP-UP MODAL (User Requested: click day opens popup dashboard of tasks) */}
      {selectedDayData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242E29]/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E8E2DD] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-5 py-4 bg-[#3D5249] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-white">
                    {monthNames[month]} {selectedDayData.dayNum}, {year}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {selectedDayData.tasks.length} {selectedDayData.tasks.length === 1 ? "Task" : "Tasks"}
                  </span>
                </div>
                <p className="text-[11px] text-[#FBF6F3]/80 mt-0.5">
                  Scheduled milestones and deliverables for this date
                </p>
              </div>
              <button
                onClick={() => setSelectedDayData(null)}
                className="p-1 rounded text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2DD]">
                <span className="text-xs font-semibold text-[#65746C]">Tasks for Day</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setCreateTaskDate(selectedDayData.dateString);
                    setIsCreateModalOpen(true);
                  }}
                  className="text-[11px] py-1 px-2.5 h-auto flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Task</span>
                </Button>
              </div>

              {selectedDayData.tasks.length === 0 ? (
                <div className="text-center py-8 text-[#65746C] space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-[#65746C]/40" />
                  <p className="text-xs font-medium">No tasks scheduled for this date.</p>
                  <p className="text-[11px] text-[#65746C]/70">Click 'Add Task' to schedule a deliverable.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDayData.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                      }}
                      className="p-3 rounded-xl border border-[#E8E2DD] hover:border-[#518E6A] hover:bg-[#FBF6F3]/60 transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.status === "Approved" || task.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : task.status === "In Review"
                                ? "bg-amber-100 text-amber-800"
                                : task.status === "In Progress"
                                ? "bg-[#518E6A]/15 text-[#3D5249]"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {task.status}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.priority === "Urgent"
                                ? "bg-rose-100 text-rose-800"
                                : task.priority === "High"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {task.priority}
                          </span>

                          {task.client && (
                            <span className="text-[10px] font-medium text-[#65746C] bg-white px-1.5 py-0.2 rounded border border-[#E8E2DD]">
                              {task.client}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-[#242E29] group-hover:text-[#518E6A] transition-colors">
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-2 text-[11px] text-[#65746C]">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-[#518E6A]" />
                            <span>{task.assignee_name || "Unassigned"}</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-1 rounded-md text-[#65746C] group-hover:text-[#518E6A] group-hover:bg-[#518E6A]/10 transition-colors shrink-0">
                        <ChevronRightIcon className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#E8E2DD] bg-[#FBF6F3]/50 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedDayData(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setSelectedDayData(null);
        }}
        onBack={selectedDayData ? () => setSelectedTask(null) : undefined}
        backLabel="Back to Day Schedule"
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
