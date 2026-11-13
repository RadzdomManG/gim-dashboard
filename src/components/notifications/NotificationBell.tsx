"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Layers,
  X,
  Volume2,
  VolumeX,
  Play,
  Settings2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { soundManager } from "@/lib/audio/sounds";

export interface NotificationItem {
  id: string;
  type: "deadline" | "comment" | "approval" | "message" | "task";
  title: string;
  description: string;
  time: string;
  client?: string;
  taskId?: string;
  channelId?: string;
  isRead: boolean;
  priority?: "Urgent" | "High" | "Normal";
}

interface NotificationBellProps {
  onSelectTask?: (taskId: string, clientName?: string) => void;
  onSelectMessage?: (channelId: string) => void;
  onSelectApprovals?: () => void;
}

export function NotificationBell({
  onSelectTask,
  onSelectMessage,
  onSelectApprovals,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTestingSlack, setIsTestingSlack] = useState(false);
  const [slackTestStatus, setSlackTestStatus] = useState<string | null>(null);

  const handleTestSlack = async () => {
    setIsTestingSlack(true);
    setSlackTestStatus(null);
    try {
      const res = await fetch("/api/notifications/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "test",
          payload: { sender: "Notification Hub" },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSlackTestStatus(data.dispatch?.simulated ? "Simulated (Add Webhook)" : "Dispatched to Slack!");
      } else {
        setSlackTestStatus("Error dispatching");
      }
    } catch {
      setSlackTestStatus("Failed to send");
    } finally {
      setIsTestingSlack(false);
      setTimeout(() => setSlackTestStatus(null), 3000);
    }
  };

  // Sound preferences state
  const [soundPrefs, setSoundPrefs] = useState({
    master: true,
    task: true,
    message: true,
    reminder: true,
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSoundPrefs(soundManager.getSettings());

    // Fetch upcoming deadlines from tasks API
    fetch("/api/tasks?client=all")
      .then((res) => res.json())
      .then((json) => {
        if (json.tasks) {
          const now = new Date(2026, 10, 3); // Simulation context Nov 3, 2026
          const upcoming: NotificationItem[] = [];

          json.tasks.forEach((t: any) => {
            if (t.due_date && t.status !== "Closed" && t.status !== "Completed") {
              const due = new Date(t.due_date);
              const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays >= -2 && diffDays <= 7) {
                upcoming.push({
                  id: `notif-${t.id}`,
                  type: "deadline",
                  title: t.title,
                  description:
                    diffDays < 0
                      ? `Overdue by ${Math.abs(diffDays)} days`
                      : diffDays === 0
                      ? "Due Today!"
                      : diffDays === 1
                      ? "Due Tomorrow"
                      : `Due in ${diffDays} days (${due.toLocaleDateString("en-AU", { month: "short", day: "numeric" })})`,
                  time: due.toLocaleDateString("en-AU", { month: "short", day: "numeric" }),
                  client: t.client,
                  taskId: t.id,
                  isRead: false,
                  priority: t.priority || "Normal",
                });
              }
            }
          });

          // Add sample team and approval notifications
          const teamAlerts: NotificationItem[] = [
            {
              id: "notif-task-assigned",
              type: "task",
              title: "Task Assigned to You: WRTS Gym Funnel QA",
              description: "Erwin Manaog requested final review on mobile responsiveness.",
              time: "10 mins ago",
              client: "We Rock the Spectrum (WRTS)",
              taskId: "14zf25zm1yv",
              isRead: false,
              priority: "Urgent",
            },
            {
              id: "notif-g5-review",
              type: "approval",
              title: "Gate Sign-Off Pending: Juvibolt LMS Course Setup",
              description: "Review submission ready for Divine, Radz, or RA sign-off.",
              time: "Today",
              client: "Juvibolt Cybertech",
              isRead: false,
              priority: "Urgent",
            },
            {
              id: "notif-bj-comment",
              type: "comment",
              title: "BJ commented on WRTS Automation",
              description: "Webhook payloads and error triggers verified.",
              time: "2 hours ago",
              client: "We Rock the Spectrum (WRTS)",
              taskId: "14zf25zm1yv",
              isRead: false,
            },
          ];

          const combined = [...teamAlerts, ...upcoming.slice(0, 5)];
          setNotifications(combined);
          setUnreadCount(combined.filter((n) => !n.isRead).length);
        }
      })
      .catch((err) => console.error("Error loading notifications:", err));
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowSoundSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleSound = (key: "master" | "task" | "message" | "reminder") => {
    const updated = { ...soundPrefs, [key]: !soundPrefs[key] };
    setSoundPrefs(updated);
    soundManager.updateSettings(updated);
  };

  const handleTestSound = (type: "task" | "message" | "reminder", e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.play(type);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleItemClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setIsOpen(false);

    if (item.type === "deadline" || item.type === "comment" || item.type === "task") {
      if (item.taskId && onSelectTask) {
        onSelectTask(item.taskId, item.client);
      }
    } else if (item.type === "approval" && onSelectApprovals) {
      onSelectApprovals();
    } else if (item.type === "message" && onSelectMessage) {
      onSelectMessage(item.channelId || "general");
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next && unreadCount > 0) {
            soundManager.play("reminder");
          }
        }}
        className="relative p-2 rounded-xl hover:bg-[#E8E2DD]/50 text-[#65746C] hover:text-[#242E29] transition-colors"
        title="Delivery Watch, Audio & Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#3D5249]/15 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-[#FBF6F3] border-b border-[#E8E2DD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#242E29]">Delivery Watch &amp; Alerts</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSoundSettings(!showSoundSettings)}
                className={`p-1 rounded-md transition-colors ${
                  showSoundSettings ? "bg-[#518E6A] text-white" : "text-[#65746C] hover:text-[#242E29] hover:bg-white"
                }`}
                title="Audio Sound Settings"
              >
                {soundPrefs.master ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] text-[#518E6A] hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Sound Preferences Sub-panel */}
          {showSoundSettings && (
            <div className="p-3 bg-[#518E6A]/5 border-b border-[#E8E2DD] space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-[#E8E2DD]/60">
                <span className="font-bold text-[#242E29] flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#518E6A]" />
                  Audio Notification Tones
                </span>
                <button
                  onClick={() => handleToggleSound("master")}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                    soundPrefs.master ? "bg-[#518E6A] text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {soundPrefs.master ? "Enabled" : "Muted"}
                </button>
              </div>

              {soundPrefs.master && (
                <div className="space-y-1.5 pt-1">
                  {/* Task Assignment Sound */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={soundPrefs.task}
                        onChange={() => handleToggleSound("task")}
                        className="rounded border-[#3D5249]/30 text-[#518E6A] focus:ring-[#518E6A]"
                      />
                      <span className="text-[#242E29]">Task Assignment Tone</span>
                    </label>
                    <button
                      type="button"
                      onClick={(e) => handleTestSound("task", e)}
                      className="px-1.5 py-0.5 rounded bg-white border border-[#E8E2DD] text-[10px] font-medium text-[#518E6A] hover:bg-[#518E6A] hover:text-white flex items-center gap-0.5"
                    >
                      <Play className="w-2.5 h-2.5" /> Test
                    </button>
                  </div>

                  {/* Message Sound */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={soundPrefs.message}
                        onChange={() => handleToggleSound("message")}
                        className="rounded border-[#3D5249]/30 text-[#518E6A] focus:ring-[#518E6A]"
                      />
                      <span className="text-[#242E29]">Chat &amp; Message Pop</span>
                    </label>
                    <button
                      type="button"
                      onClick={(e) => handleTestSound("message", e)}
                      className="px-1.5 py-0.5 rounded bg-white border border-[#E8E2DD] text-[10px] font-medium text-[#518E6A] hover:bg-[#518E6A] hover:text-white flex items-center gap-0.5"
                    >
                      <Play className="w-2.5 h-2.5" /> Test
                    </button>
                  </div>

                  {/* Reminder Sound */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={soundPrefs.reminder}
                        onChange={() => handleToggleSound("reminder")}
                        className="rounded border-[#3D5249]/30 text-[#518E6A] focus:ring-[#518E6A]"
                      />
                      <span className="text-[#242E29]">Deadline &amp; Alert Chime</span>
                    </label>
                    <button
                      type="button"
                      onClick={(e) => handleTestSound("reminder", e)}
                      className="px-1.5 py-0.5 rounded bg-white border border-[#E8E2DD] text-[10px] font-medium text-[#518E6A] hover:bg-[#518E6A] hover:text-white flex items-center gap-0.5"
                    >
                      <Play className="w-2.5 h-2.5" /> Test
                    </button>
                  </div>

                  {/* Slack Operational Hub */}
                  <div className="pt-2 border-t border-[#E8E2DD] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#242E29]">Slack Operational Broadcast</span>
                      <button
                        type="button"
                        disabled={isTestingSlack}
                        onClick={handleTestSlack}
                        className="px-2 py-0.5 rounded bg-[#3D5249] text-white text-[10px] font-medium hover:bg-[#2D3D36] transition-colors disabled:opacity-50"
                      >
                        {isTestingSlack ? "Testing..." : slackTestStatus || "Test Dispatch"}
                      </button>
                    </div>
                    <div className="text-[10px] text-[#65746C] space-y-0.5 font-mono">
                      <div>#gim-shift-reports · Daily EOS notes</div>
                      <div>#gim-client-ops · Gate approvals</div>
                      <div>#gim-social-media · Scheduled campaigns</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* List */}
          <div className="divide-y divide-[#E8E2DD]/60 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#65746C]">No active alerts right now.</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 transition-colors cursor-pointer flex items-start gap-3 hover:bg-[#FBF6F3] ${
                    !item.isRead ? "bg-[#518E6A]/5" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.type === "task" && (
                      <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {item.type === "deadline" && (
                      <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {item.type === "approval" && (
                      <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {item.type === "comment" && (
                      <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {item.type === "message" && (
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-[#242E29] truncate">{item.title}</span>
                      <span className="text-[10px] text-[#65746C] shrink-0 font-mono">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-[#65746C] mt-0.5 line-clamp-1">{item.description}</p>
                    {item.client && (
                      <span className="inline-block mt-1 text-[9px] font-mono px-1 py-0.2 rounded bg-[#FBF6F3] text-[#3D5249] border border-[#E8E2DD]">
                        {item.client}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
