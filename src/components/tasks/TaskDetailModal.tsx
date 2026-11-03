"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Video as VideoIcon,
  Tag,
  Building2,
  Check,
  RefreshCw,
  CornerUpLeft,
  Smile,
  Download,
  UploadCloud,
  Lock,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface TaskItem {
  id: string;
  title: string;
  client: string;
  description?: string;
  status: "To Do" | "In Progress" | "In Review" | "Approved" | "Closed" | "Completed";
  priority: "Low" | "Normal" | "High" | "Urgent";
  due_date?: string | null;
  assignee_name?: string;
  assignee_id?: string;
  created_by?: string;
  attachments?: { id?: string; name: string; url: string; type?: string; size?: string }[];
  tags?: string[];
  created_at?: string;
  url?: string;
  is_clickup?: boolean;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_name: string;
  author_nickname: string;
  author_avatar?: string;
  content: string;
  attachments?: { name: string; url: string; type?: string; size?: string; meta?: any }[];
  reactions?: { emoji: string; count: number; users: string[] }[];
  reply_to?: { author: string; text: string } | null;
  created_at: string;
  is_clickup?: boolean;
}

interface TaskDetailModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: (updated: TaskItem) => void;
  currentUserName?: string;
  currentUserNickname?: string;
  isCoreAdmin?: boolean;
}

const QUICK_EMOJIS = ["👍", "❤️", "🙌", "🔥", "👀", "✅", "🚀"];

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
  currentUserName = "Radzdom Gallego",
  currentUserNickname = "Radz",
  isCoreAdmin = false,
}: TaskDetailModalProps) {
  const [currentTask, setCurrentTask] = useState<TaskItem | null>(task);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentType, setAttachmentType] = useState<"image" | "video" | "document" | "link">("link");
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; url: string; type: string; size?: string }[]>([]);
  const [replyingTo, setReplyingTo] = useState<{ author: string; text: string } | null>(null);
  const [showEmojiPickerForComment, setShowEmojiPickerForComment] = useState<string | null>(null);

  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Permission Guardrail: Admins, assignee, or creator can edit. Others can only read and comment.
  const isAdmin =
    !!isCoreAdmin ||
    ["Radz", "Divine", "RA", "Radzdom Gallego", "Divine Origines", "Ma. Rose Anne Malinao"].some(
      (name) =>
        name.toLowerCase() === (currentUserNickname || "").toLowerCase() ||
        name.toLowerCase() === (currentUserName || "").toLowerCase()
    );

  const isAssignee =
    !!currentTask &&
    !!currentTask.assignee_name &&
    (currentTask.assignee_name.toLowerCase().includes((currentUserNickname || "").toLowerCase()) ||
      currentTask.assignee_name.toLowerCase().includes((currentUserName || "").toLowerCase()));

  const isCreator =
    !!currentTask &&
    !!currentTask.created_by &&
    (currentTask.created_by.toLowerCase().includes((currentUserNickname || "").toLowerCase()) ||
      currentTask.created_by.toLowerCase().includes((currentUserName || "").toLowerCase()));

  const canEditTask = isAdmin || isAssignee || isCreator;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentTask(task);
    setReplyingTo(null);
    setAttachedFiles([]);
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

    if (currentTask.status === "Closed" || currentTask.status === "Approved") {
      return {
        type: "closed",
        text: `Delivered and Closed on ${dueDate.toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" })}`,
      };
    }

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith("image/");
    const isVid = file.type.startsWith("video/");
    const type = isImg ? "image" : isVid ? "video" : "document";
    const size = `${(file.size / 1024).toFixed(0)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          url: result,
          type,
          size,
        },
      ]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddLinkAttachment = () => {
    if (!attachmentUrl.trim()) return;
    setAttachedFiles((prev) => [
      ...prev,
      {
        name: attachmentName.trim() || attachmentUrl.trim(),
        url: attachmentUrl.trim(),
        type: attachmentType,
        size: attachmentType === "link" ? undefined : "Cloud link",
      },
    ]);
    setAttachmentUrl("");
    setAttachmentName("");
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && attachedFiles.length === 0) return;

    setIsSubmittingComment(true);

    try {
      const res = await fetch(`/api/tasks/${currentTask.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: currentUserName,
          author_nickname: currentUserNickname,
          author_avatar: "#3D5249",
          content: newComment.trim(),
          attachments: attachedFiles,
          reply_to: replyingTo,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, data.comment]);
        setNewComment("");
        setAttachedFiles([]);
        setReplyingTo(null);
      }
    } catch (e) {
      console.error("Failed to add comment:", e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleReaction = (commentId: string, emoji: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const existing = c.reactions || [];
        const match = existing.find((r) => r.emoji === emoji);
        let updatedReactions;

        if (match) {
          const userAlready = match.users.includes(currentUserNickname);
          if (userAlready) {
            updatedReactions = existing
              .map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, users: r.users.filter((u) => u !== currentUserNickname) }
                  : r
              )
              .filter((r) => r.count > 0);
          } else {
            updatedReactions = existing.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...r.users, currentUserNickname] }
                : r
            );
          }
        } else {
          updatedReactions = [...existing, { emoji, count: 1, users: [currentUserNickname] }];
        }

        return { ...c, reactions: updatedReactions };
      })
    );
    setShowEmojiPickerForComment(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#242E29]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#3D5249]/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#3D5249] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-[#FBF6F3]/70 font-semibold flex items-center gap-1.5 truncate">
                <Building2 className="w-3 h-3 text-[#518E6A] shrink-0" />
                <span>{currentTask.client} &bull; Task #{currentTask.id.substring(0, 12)}</span>
                {currentTask.is_clickup && (
                  <span className="px-1.5 py-0.2 rounded bg-white/20 text-[9px] text-white font-mono">
                    ClickUp Sync
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight text-white truncate">
                {currentTask.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deadline Alert Banner */}
        {deadlineInfo && (
          <div
            className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              deadlineInfo.type === "closed"
                ? "bg-purple-50 text-purple-900 border-purple-200"
                : deadlineInfo.type === "overdue"
                ? "bg-rose-50 text-rose-900 border-rose-200"
                : deadlineInfo.type === "urgent"
                ? "bg-amber-50 text-amber-900 border-amber-200 animate-pulse"
                : "bg-[#FBF6F3] text-[#3D5249] border-[#3D5249]/10"
            }`}
          >
            <div className="flex items-center gap-2">
              {deadlineInfo.type === "closed" ? (
                <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
              ) : deadlineInfo.type === "overdue" ? (
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Workflow Selector (To Do, In Progress, In Review, Approved, Closed) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249]">
                Workflow Status Pipeline
              </label>
              {!canEditTask && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Assigned to {currentTask.assignee_name || "another member"} (Read-Only)
                </span>
              )}
            </div>

            {!canEditTask && (
              <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  <strong>Locked:</strong> You can review notes, media, and post comments, but editing task status is restricted to <strong>{currentTask.assignee_name || "the assignee"}</strong> and Core Admins.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(["To Do", "In Progress", "In Review", "Approved", "Closed"] as const).map((statusOption) => {
                const isActive = currentTask.status.toLowerCase() === statusOption.toLowerCase();
                return (
                  <button
                    key={statusOption}
                    type="button"
                    disabled={isUpdatingStatus || !canEditTask}
                    onClick={() => canEditTask && handleStatusChange(statusOption)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                      !canEditTask
                        ? "opacity-60 cursor-not-allowed bg-slate-100 text-slate-500 border-slate-200"
                        : isActive
                        ? statusOption === "Closed"
                          ? "bg-purple-800 text-white border-purple-800 shadow-xs"
                          : statusOption === "Approved"
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
                    <span>{statusOption === "Closed" ? "Closed / Done" : statusOption}</span>
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

          {/* Deliverable Requirements & Notes */}
          {currentTask.description && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249]">
                Deliverable Requirements & Brief
              </label>
              <div className="p-3.5 rounded-xl bg-white border border-[#3D5249]/15 text-xs text-[#242E29] leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                {currentTask.description}
              </div>
            </div>
          )}

          {/* Task-Level Attachments (ClickUp & GIM uploads) */}
          {currentTask.attachments && currentTask.attachments.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-[#518E6A]" />
                Task Attachments & Deliverable Files ({currentTask.attachments.length})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentTask.attachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBF6F3] border border-[#3D5249]/15 hover:border-[#518E6A] transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      {att.name.endsWith(".html") ? (
                        <FileText className="w-4 h-4 text-[#3D5249] shrink-0" />
                      ) : att.name.match(/\.(png|jpg|jpeg|webp)$/i) ? (
                        <ImageIcon className="w-4 h-4 text-[#518E6A] shrink-0" />
                      ) : (
                        <Paperclip className="w-4 h-4 text-[#65746C] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#242E29] truncate">{att.name}</p>
                        {att.size && <span className="text-[10px] text-[#65746C]">{att.size}</span>}
                      </div>
                    </div>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-[#518E6A] hover:bg-[#518E6A]/10 transition-colors"
                      title="Open attachment"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ClickUp-style Notes & Collaboration Comments */}
          <div className="space-y-3 pt-3 border-t border-[#3D5249]/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D5249] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#518E6A]" />
                Activity Notes & Review Comments ({comments.length})
              </h3>
              <span className="text-[11px] text-[#65746C]">Supabase Realtime Synced</span>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#65746C] bg-[#FBF6F3] rounded-xl border border-dashed border-[#3D5249]/20">
                  No comments or notes posted yet. Leave an update or file attachment below.
                </div>
              ) : (
                comments.map((c) => {
                  const replyAtt = c.attachments?.find((a: any) => a.type === "reply_to");
                  const mediaAtts = c.attachments?.filter((a: any) => a.type !== "reply_to") || [];

                  return (
                    <div key={c.id} className="p-3.5 rounded-xl bg-[#FBF6F3]/70 border border-[#3D5249]/10 space-y-2 group relative">
                      {/* Top Commenter Info & Timestamp */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#242E29]">{c.author_name}</span>
                          <span className="text-[10px] text-[#65746C]">({c.author_nickname})</span>
                          {c.is_clickup && (
                            <span className="px-1 py-0.2 rounded bg-[#3D5249]/10 text-[9px] font-mono text-[#3D5249]">
                              ClickUp
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#65746C]">
                          {new Date(c.created_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Replying To Quote Banner */}
                      {replyAtt && replyAtt.meta && (
                        <div className="p-2 bg-white/90 border-l-2 border-[#518E6A] rounded-md text-[11px] text-[#65746C]">
                          <span className="font-semibold text-[#3D5249]">@{replyAtt.meta.author}:</span>{" "}
                          <span className="italic line-clamp-1">&ldquo;{replyAtt.meta.text}&rdquo;</span>
                        </div>
                      )}

                      {/* Content */}
                      <p className="text-xs text-[#242E29] leading-relaxed whitespace-pre-wrap">
                        {c.content}
                      </p>

                      {/* Attached Media (Images, Videos, Files) */}
                      {mediaAtts.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {mediaAtts.map((att: any, idx: number) => (
                            <div key={idx}>
                              {att.type === "image" && (
                                <div className="max-w-xs rounded-lg border border-[#3D5249]/15 overflow-hidden bg-white p-1">
                                  <img src={att.url} alt={att.name} className="max-h-40 rounded object-contain w-full" />
                                  <div className="text-[10px] text-[#65746C] p-1 truncate">{att.name}</div>
                                </div>
                              )}
                              {att.type === "video" && (
                                <div className="max-w-sm rounded-lg border border-[#3D5249]/15 overflow-hidden bg-black p-1">
                                  <video src={att.url} controls className="max-h-44 w-full rounded" />
                                  <div className="text-[10px] text-white/80 p-1 truncate">{att.name}</div>
                                </div>
                              )}
                              {(att.type === "document" || att.type === "link") && (
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#3D5249]/15 text-xs text-[#518E6A] hover:bg-[#518E6A]/5"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>{att.name}</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Bottom Action Bar: Reply Button & Emoji Reactions */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#3D5249]/5 text-xs">
                        {/* Existing Reactions */}
                        <div className="flex items-center gap-1 flex-wrap">
                          {c.reactions &&
                            c.reactions.map((r, rIdx) => (
                              <button
                                key={rIdx}
                                type="button"
                                onClick={() => toggleReaction(c.id, r.emoji)}
                                className="px-1.5 py-0.5 rounded-full bg-white border border-[#518E6A]/30 text-[11px] flex items-center gap-1 text-[#242E29] hover:bg-[#518E6A]/10"
                                title={`Reacted by ${r.users.join(", ")}`}
                              >
                                <span>{r.emoji}</span>
                                <span className="font-bold text-[10px]">{r.count}</span>
                              </button>
                            ))}

                          {/* Quick Emoji Trigger Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setShowEmojiPickerForComment(
                                showEmojiPickerForComment === c.id ? null : c.id
                              )
                            }
                            className="p-1 rounded text-[#65746C] hover:text-[#242E29] hover:bg-black/5"
                            title="React with emoji"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>

                          {/* Emoji Picker Popover */}
                          {showEmojiPickerForComment === c.id && (
                            <div className="flex items-center gap-1 bg-white border border-[#3D5249]/20 rounded-xl p-1 shadow-md animate-in fade-in zoom-in-95">
                              {QUICK_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => toggleReaction(c.id, emoji)}
                                  className="p-1 text-sm hover:scale-125 transition-transform"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Reply Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setReplyingTo({
                              author: c.author_nickname || c.author_name,
                              text: c.content,
                            })
                          }
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#518E6A] hover:underline px-1.5 py-0.5 rounded hover:bg-[#518E6A]/10"
                        >
                          <CornerUpLeft className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Composer Form */}
            <form onSubmit={handleAddComment} className="space-y-2 pt-2">
              {/* Replying To Banner */}
              {replyingTo && (
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#518E6A]/10 border border-[#518E6A]/30 rounded-xl text-xs text-[#3D5249]">
                  <div className="flex items-center gap-1.5 truncate">
                    <CornerUpLeft className="w-3.5 h-3.5 text-[#518E6A] shrink-0" />
                    <span className="truncate">
                      Replying to <strong>@{replyingTo.author}</strong>: &ldquo;{replyingTo.text.slice(0, 70)}...&rdquo;
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="p-0.5 rounded text-[#3D5249] hover:bg-black/10 shrink-0 ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Pending Attachments List */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-[#FBF6F3] rounded-xl border border-[#3D5249]/10 text-xs">
                  {attachedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#3D5249]/15 rounded-lg shadow-xs">
                      {f.type === "image" ? (
                        <ImageIcon className="w-3.5 h-3.5 text-[#518E6A]" />
                      ) : f.type === "video" ? (
                        <VideoIcon className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Paperclip className="w-3.5 h-3.5 text-[#65746C]" />
                      )}
                      <span className="truncate max-w-[150px] font-semibold text-[#242E29]">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-[#65746C] hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                rows={2}
                placeholder="Write an acknowledgment, review note, or task comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-[#3D5249]/20 focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29] resize-none"
              />

              {/* Hidden File Input for Picture/Video */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#3D5249]/15 bg-white text-[#3D5249] hover:bg-[#518E6A]/10 text-[11px] font-semibold"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#518E6A]" />
                    <span>Upload Picture/Video</span>
                  </button>

                  <div className="flex items-center gap-1 pl-1">
                    <input
                      type="url"
                      placeholder="Or paste Drive / Loom URL..."
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      className="w-44 px-2 py-1 text-xs rounded-lg border border-[#3D5249]/15 bg-white text-[#242E29]"
                    />
                    {attachmentUrl && (
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={handleAddLinkAttachment}
                        className="text-[11px] py-1 px-2"
                      >
                        Attach Link
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isSubmittingComment || (!newComment.trim() && attachedFiles.length === 0)}
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
            ClickUp Read-Only &bull; Mutations & comments stored in Supabase
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
