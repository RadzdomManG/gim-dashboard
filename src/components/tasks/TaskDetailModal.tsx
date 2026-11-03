"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  Send,
  Paperclip,
  ExternalLink,
  X,
  FileText,
  Image as ImageIcon,
  Tag,
  Building2,
  Check,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface TaskItem {
  id: string;
  title: string;
  client: string;
  description?: string;
  status: "To Do" | "In Progress" | "In Review" | "Approved" | "Completed";
  priority: "Low" | "Normal" | "High" | "Urgent";
  due_date?: string | null;
  assignee_name?: string;
  assignee_id?: string;
  created_by?: string;
  attachments?: { name: string; url: string; type?: string }[];
  tags?: string[];
  created_at?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_name: string;
  author_nickname: string;
  author_avatar?: string;
  content: string;
  attachments?: { name: string; url: string; type?: string }[];
  created_at: string;
}

interface TaskDetailModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: (updated: TaskItem) => void;
  currentUserName?: string;
  currentUserNickname?: string;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
  currentUserName = "Radzdom Gallego",
  currentUserNickname = "Radz",
}: TaskDetailModalProps) {
  const [currentTask, setCurrentTask] = useState<TaskItem | null>(task);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    setCurrentTask(task);
    if (task?.id) {
      fetch(`/api/tasks/${task.id}/comments`)
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => setComments(data.comments || []))
        .catch(() => setComments([]));
    }
  }, [task]);

  if (!isOpen || !currentTask) return null;

  // Deadline calculation
  const getDeadlineAlert = () => {
    if (!currentTask.due_date) return null;
    const dueDate = new Date(currentTask.due_date);
    const now = new Date();
    const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) {
      const daysOverdue = Math.abs(Math.floor(diffHours / 24));
      return {
        type: "overdue",
        text: `Overdue by ${daysOverdue === 0 ? "hours" : `${daysOverdue} day(s)`}! Immediate attention needed.`,
      };
    }
    if (diffHours <= 48) {
      const hoursLeft = Math.round(diffHours);
      return {
        type: "urgent",
        text: `Due soon (within ${hoursLeft} hours). Target deadline approaching!`,
      };
    }
    return {
      type: "normal",
      text: `Due on ${dueDate.toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" })}`,
    };
  };

  const deadlineInfo = getDeadlineAlert();

  const handleStatusChange = async (newStatus: TaskItem["status"]) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentTask.id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        const updated = { ...currentTask, status: newStatus };
        setCurrentTask(updated);
        if (onTaskUpdated) onTaskUpdated(updated);
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && !attachmentUrl.trim()) return;

    setIsSubmittingComment(true);
    const attachments = attachmentUrl.trim()
      ? [{ name: attachmentName.trim() || "Attached File", url: attachmentUrl.trim(), type: "link" }]
      : [];

    try {
      const res = await fetch(`/api/tasks/${currentTask.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: currentUserName,
          author_nickname: currentUserNickname,
          author_avatar: "#3D5249",
          content: newComment.trim(),
          attachments,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, data.comment]);
        setNewComment("");
        setAttachmentUrl("");
        setAttachmentName("");
      }
    } catch (e) {
      console.error("Failed to add comment:", e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#242E29]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#3D5249]/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#3D5249] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#FBF6F3]/70 font-semibold flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-[#518E6A]" />
                {currentTask.client} &bull; Task #{currentTask.id.substring(0, 8)}
              </div>
              <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight text-white line-clamp-1">
                {currentTask.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deadline Alert Banner */}
        {deadlineInfo && (
          <div
            className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              deadlineInfo.type === "overdue"
                ? "bg-rose-50 text-rose-900 border-rose-200"
                : deadlineInfo.type === "urgent"
                ? "bg-amber-50 text-amber-900 border-amber-200 animate-pulse"
                : "bg-[#FBF6F3] text-[#3D5249] border-[#3D5249]/10"
            }`}
          >
            <div className="flex items-center gap-2">
              {deadlineInfo.type === "overdue" ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : deadlineInfo.type === "urgent" ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-[#518E6A] shrink-0" />
              )}
              <span>{deadlineInfo.text}</span>
            </div>
            <span className="font-mono text-[11px] text-[#65746C]">
              Priority: {currentTask.priority}
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Workflow Selector (To Do, In Progress, In Review, Approved) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249]">
              Workflow Status Pipeline
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["To Do", "In Progress", "In Review", "Approved"] as const).map((statusOption) => {
                const isActive = currentTask.status.toLowerCase() === statusOption.toLowerCase();
                return (
                  <button
                    key={statusOption}
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(statusOption)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                      isActive
                        ? statusOption === "Approved"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : statusOption === "In Review"
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                          : statusOption === "In Progress"
                          ? "bg-[#518E6A] text-white border-[#518E6A] shadow-xs"
                          : "bg-[#3D5249] text-white border-[#3D5249] shadow-xs"
                        : "bg-[#FBF6F3] text-[#65746C] border-[#3D5249]/15 hover:border-[#3D5249]/30 hover:text-[#242E29]"
                    }`}
                  >
                    {isActive && <Check className="w-3.5 h-3.5" />}
                    <span>{statusOption}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#FBF6F3] rounded-xl border border-[#3D5249]/10 text-xs">
            <div>
              <span className="text-[#65746C] font-semibold uppercase text-[10px] block">Assignee</span>
              <div className="font-bold text-[#242E29] mt-0.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#518E6A]" />
                {currentTask.assignee_name || "Unassigned"}
              </div>
            </div>
            <div>
              <span className="text-[#65746C] font-semibold uppercase text-[10px] block">Due Date</span>
              <div className="font-bold text-[#242E29] mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#518E6A]" />
                {currentTask.due_date
                  ? new Date(currentTask.due_date).toLocaleDateString("en-AU", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "No deadline"}
              </div>
            </div>
            <div>
              <span className="text-[#65746C] font-semibold uppercase text-[10px] block">Tags & Gate</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {currentTask.tags && currentTask.tags.length > 0 ? (
                  currentTask.tags.map((t, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-[#3D5249]/15 font-mono text-[10px] text-[#3D5249]">
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-[#65746C]">General Task</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {currentTask.description && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249]">
                Deliverable Requirements & Description
              </label>
              <div className="p-3.5 rounded-xl bg-white border border-[#3D5249]/15 text-xs text-[#242E29] leading-relaxed whitespace-pre-wrap">
                {currentTask.description}
              </div>
            </div>
          )}

          {/* ClickUp-style Notes & Collaboration Comments */}
          <div className="space-y-3 pt-3 border-t border-[#3D5249]/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D5249] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#518E6A]" />
                Activity Notes & Discussion ({comments.length})
              </h3>
              <span className="text-[11px] text-[#65746C]">Syncs in real-time</span>
            </div>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#65746C] bg-[#FBF6F3] rounded-xl border border-dashed border-[#3D5249]/20">
                  No comments or notes posted yet. Leave an update below.
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-[#FBF6F3]/60 border border-[#3D5249]/10 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#242E29]">{c.author_name}</span>
                        <span className="text-[10px] text-[#65746C]">({c.author_nickname})</span>
                      </div>
                      <span className="text-[10px] text-[#65746C]">
                        {new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-[#242E29] leading-relaxed whitespace-pre-wrap">
                      {c.content}
                    </p>
                    {c.attachments && c.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {c.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#3D5249]/15 text-[11px] text-[#518E6A] hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {att.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-2 pt-2">
              <textarea
                rows={2}
                placeholder="Write an operational note or status comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-[#3D5249]/20 focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29]"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1">
                    <Paperclip className="w-3.5 h-3.5 text-[#65746C] absolute left-2.5 top-2.5" />
                    <input
                      type="url"
                      placeholder="Attach file URL or link (Drive, Figma, Loom)..."
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-[#3D5249]/15 bg-white text-[#242E29]"
                    />
                  </div>
                  {attachmentUrl && (
                    <input
                      type="text"
                      placeholder="File Name"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      className="w-32 px-2 py-1.5 text-xs rounded-lg border border-[#3D5249]/15 bg-white text-[#242E29]"
                    />
                  )}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isSubmittingComment || (!newComment.trim() && !attachmentUrl.trim())}
                  className="shrink-0"
                >
                  {isSubmittingComment ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Post Comment
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#FBF6F3] border-t border-[#3D5249]/10 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#65746C]">
            ClickUp Read-Only &bull; Mutations stored in Supabase project eckdybswbcbhqidgwfkl
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
