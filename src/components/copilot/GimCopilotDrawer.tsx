"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Shield,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { sound } from "@/lib/audio";

interface GimCopilotDrawerProps {
  currentUser: {
    id: string;
    name: string;
    nickname: string;
    email: string;
    role: string;
    title?: string;
    isCoreAdmin: boolean;
    clientScope?: string;
    assigned_clients?: string[];
  };
  tasks?: any[];
  onUpdateTaskStatus?: (taskId: string, newStatus: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  content: string;
  timestamp: string;
  action?: {
    type: string;
    taskId?: string;
    taskTitle?: string;
    client?: string;
    status?: string;
    platforms?: string[];
    posts?: any[];
    cloudLink?: string;
  };
  suggestedActions?: string[];
}

function getMemberInitials(name?: string, nickname?: string): string {
  if (nickname) {
    const nick = nickname.trim().toLowerCase();
    if (nick === "radz" || nick === "radzdom") return "RG"; // Radzdom Gallego
    if (nick === "ra") return "RA"; // Rose Anne
  }
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (nickname) return nickname.trim().slice(0, 2).toUpperCase();
  return "U";
}

export function GimCopilotDrawer({
  currentUser,
  tasks = [],
  onUpdateTaskStatus,
}: GimCopilotDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [internalTasks, setInternalTasks] = useState<any[]>(tasks);
  const [appliedActions, setAppliedActions] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleConfirmTaskMove = async (msgId: string, taskId: string, status: string, taskTitle: string) => {
    sound.playSuccessChime();
    setAppliedActions((prev) => ({ ...prev, [msgId]: true }));
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: status }),
      });
      if (onUpdateTaskStatus) {
        onUpdateTaskStatus(taskId, status);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: "copilot",
          content: `✅ Task **#${taskId}** (${taskTitle}) status has been moved to **${status}**! Great job — ready for the next milestone. 🚀`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedActions: ["What should I do next? 📋", "Draft today's EOS note 📝"],
        },
      ]);
    } catch (e) {
      console.error("Failed to update task status:", e);
    }
  };

  const handleApproveSocialSchedule = (msgId: string, action: any) => {
    sound.playSuccessChime();
    setAppliedActions((prev) => ({ ...prev, [msgId]: true }));
    try {
      const stored = localStorage.getItem("gim_social_posts");
      const existing = stored ? JSON.parse(stored) : [];
      const newPosts = (action.posts || []).map((p: any, idx: number) => ({
        id: `post-ai-${Date.now()}-${idx}`,
        client: action.client,
        clientId: (action.client || "").toLowerCase().replace(/[^a-z0-9]/g, "-"),
        platform: p.platform,
        content: p.copy,
        status: "scheduled",
        scheduledFor: new Date(Date.now() + (idx + 1) * 86400000).toISOString(),
        author: currentUser.name,
        attachments: action.cloudLink ? [action.cloudLink] : [],
      }));
      localStorage.setItem("gim_social_posts", JSON.stringify([...existing, ...newPosts]));

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: "copilot",
          content: `🎉 **${newPosts.length} posts have been approved & scheduled** into the live calendar for **${action.client}**! You can view them anytime under the **Social Hub & Auto-Post** tab. 🚀📅`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedActions: ["View Scheduled Queue 📅", "Show my active deliverables 📋"],
        },
      ]);
    } catch (e) {
      console.error("Failed to schedule posts:", e);
    }
  };

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setInternalTasks(tasks);
    } else {
      fetch("/api/tasks")
        .then((r) => r.json())
        .then((data) => {
          if (data?.tasks && Array.isArray(data.tasks)) {
            setInternalTasks(data.tasks);
          }
        })
        .catch(() => {});
    }
  }, [tasks]);

  const clientScope = currentUser.clientScope || "all";
  const userNick = currentUser.nickname || currentUser.name.split(" ")[0] || "Member";

  // Initial greeting tailored to this member's scope
  useEffect(() => {
    const initialGreeting: ChatMessage = {
      id: "msg-welcome",
      sender: "copilot",
      content: `Hey **${userNick}**! 👋 Ready to support your shift today.

Here's what I can do for you:
• 📋 Review your active deliverables & tasks
• 🚀 Move or update any task status
• 📝 Draft your End of Shift (EOS) note in 1 click
• 🎯 Check client sprint goals & milestones

What would you like to work on right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedActions: [
        "What are my active deliverables? 📋",
        "Draft today's End of Shift note 📝",
        "Check client sprint milestones 🎯",
        "Explain communication SOP 📘",
      ],
    };

    setMessages([initialGreeting]);
  }, [currentUser, clientScope, userNick]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          user: currentUser,
          tasks: internalTasks,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        const copilotMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: "copilot",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          action: data.action,
          suggestedActions: data.suggestedActions,
        };
        setMessages((prev) => [...prev, copilotMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: "copilot",
          content: "I ran into a temporary issue connecting with the internal knowledge engine. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "copilot",
        content: "Network connection error. Please verify your connection to Mission Control.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyContent = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* 1. FLOATING COPILOT TRIGGER PILL (Visible when drawer is closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-[#3D5249] hover:bg-[#2D3D36] text-white px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2.5 border border-[#518E6A]/50 transition-all hover:scale-105 active:scale-95 group"
          title="Open Personalized GIM AI Co-Pilot"
        >
          <div className="w-7 h-7 rounded-xl bg-[#518E6A] flex items-center justify-center text-white relative shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-[#3D5249]" />
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>{userNick}&apos;s Co-Pilot</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 font-mono text-white/90">AI</span>
            </div>
            <div className="text-[10px] text-white/70 truncate max-w-[140px]">
              {clientScope === "all" ? "Universal HQ Brain" : clientScope.split(",")[0]}
            </div>
          </div>
        </button>
      )}

      {/* 2. COPILOT SLIDE-OVER DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div
            className={`bg-[#FBF6F3] h-full shadow-2xl flex flex-col border-l border-[#3D5249]/20 transition-all duration-300 ${
              isExpanded ? "w-full max-w-2xl" : "w-full sm:max-w-md"
            }`}
          >
            {/* Drawer Header */}
            <div className="bg-[#3D5249] text-white px-4 py-3.5 border-b border-[#2D3D36] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 p-1 flex items-center justify-center relative">
                  <Image
                    src="/gim-mark-white.png"
                    alt="GIM"
                    width={22}
                    height={22}
                    className="object-contain"
                  />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-1 ring-[#3D5249]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="text-sm font-bold leading-tight">GIM AI Co-Pilot</h3>
                    <Badge variant="brand" className="text-[9px] bg-[#518E6A] text-white border-0 py-0 px-1.5">
                      {userNick}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-white/70 flex items-center gap-1 mt-0.5">
                    {currentUser.isCoreAdmin ? (
                      <span className="flex items-center gap-1 text-emerald-300 font-medium">
                        <Shield className="w-3 h-3" /> Universal Agency Scope
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-200 font-medium truncate max-w-[220px]">
                        <Lock className="w-3 h-3" /> {clientScope} Scope Only
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-1 text-white/80">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden sm:inline-flex"
                  title={isExpanded ? "Collapse width" : "Expand width"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="Close Co-Pilot Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Security Isolation Notice Pill */}
            <div className="px-4 py-1.5 bg-[#466B53]/15 border-b border-[#466B53]/20 flex items-center justify-between text-[10px] text-[#3D5249] shrink-0 font-medium">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#518E6A]" /> Zero-Leak Isolation Active
              </span>
              <span className="text-[#65746C]">Company Knowledge Base Connected</span>
            </div>

            {/* Chat Messages Scroll Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-start space-x-2 max-w-[92%]">
                    {msg.sender === "copilot" && (
                      <div className="w-6 h-6 rounded-lg bg-[#3D5249] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-emerald-300" />
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs relative group ${
                        msg.sender === "user"
                          ? "bg-[#518E6A] text-white rounded-tr-xs"
                          : "bg-white text-[#242E29] border border-[#3D5249]/15 rounded-tl-xs"
                      }`}
                    >
                      {/* Copy Button on AI responses */}
                      {msg.sender === "copilot" && (
                        <button
                          type="button"
                          onClick={() => handleCopyContent(msg.id, msg.content)}
                          className="absolute top-2 right-2 text-[#65746C] hover:text-[#242E29] opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-[#FBF6F3] rounded"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}

                      {/* Content with simple markdown rendering */}
                      <div className="whitespace-pre-wrap space-y-1">
                        {msg.content.split("\n").map((line, lIdx) => {
                          if (line.startsWith("• ") || line.startsWith("- ")) {
                            return (
                              <div key={lIdx} className="pl-3 relative">
                                <span className="absolute left-0 text-[#518E6A] font-bold">•</span>
                                <span>{line.substring(2)}</span>
                              </div>
                            );
                          }
                          return <p key={lIdx}>{line}</p>;
                        })}
                      </div>

                      {/* Interactive Task Update Action Card (Option B: Confirmation First) */}
                      {msg.action && msg.action.type === "CONFIRM_TASK_MOVE" && (
                        <div className="mt-3 p-2.5 rounded-xl bg-[#EBF3EF] border border-[#518E6A]/30 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#242E29]">
                              Task #{msg.action.taskId}: {msg.action.taskTitle}
                            </span>
                            <Badge variant="brand" className="text-[10px]">
                              {msg.action.status}
                            </Badge>
                          </div>

                          {appliedActions[msg.id] ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Status updated to {msg.action.status}!</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleConfirmTaskMove(
                                    msg.id,
                                    msg.action?.taskId || "",
                                    msg.action?.status || "In Progress",
                                    msg.action?.taskTitle || "Deliverable"
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-[#518E6A] text-white text-xs font-bold hover:bg-[#427457] flex items-center gap-1.5 shadow-xs transition-all hover:scale-102 active:scale-98"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>⚡ Confirm: Move to {msg.action.status}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Social Media Staging Preview Card */}
                      {msg.action && msg.action.type === "SCHEDULE_SOCIAL_PREVIEW" && (
                        <div className="mt-3 p-3 rounded-xl bg-[#FBF6F3] border border-[#3D5249]/20 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#242E29]">
                              📱 Campaign Staging ({msg.action.client})
                            </span>
                            <span className="text-[10px] text-[#518E6A] font-bold">
                              4 Platform Variants Ready
                            </span>
                          </div>

                          {/* Post Snippet Cards */}
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {(msg.action.posts || []).map((p: any, pIdx: number) => (
                              <div
                                key={pIdx}
                                className="p-2 rounded-lg bg-white border border-[#E8E2DD] text-[10px] space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#3D5249] capitalize">
                                    {p.platformName || p.platform}
                                  </span>
                                  <span className="text-[9px] font-mono text-[#65746C]">Day {pIdx + 1} • 10:00 AM</span>
                                </div>
                                <p className="text-[#65746C] line-clamp-2 leading-relaxed font-sans">
                                  {p.copy}
                                </p>
                              </div>
                            ))}
                          </div>

                          {appliedActions[msg.id] ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold pt-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Approved & scheduled into live calendar!</span>
                            </div>
                          ) : (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => handleApproveSocialSchedule(msg.id, msg.action)}
                                className="w-full py-2 rounded-xl bg-[#518E6A] text-white text-xs font-bold hover:bg-[#427457] flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-101 active:scale-99"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>⚡ Approve & Schedule All 4 Posts into Queue</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {msg.sender === "user" && (
                      <div className="w-6 h-6 rounded-lg bg-[#518E6A] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        {getMemberInitials(currentUser.name, userNick)}
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-[#65746C]/70 px-2 mt-0.5">
                    {msg.timestamp}
                  </span>

                  {/* AI Suggested Quick Replies */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-2 pl-8">
                      {msg.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={() => handleSendMessage(action)}
                          className="px-2.5 py-1 rounded-full bg-white border border-[#3D5249]/15 text-[11px] font-medium text-[#3D5249] hover:bg-[#518E6A] hover:text-white hover:border-[#518E6A] transition-all shadow-2xs flex items-center gap-1"
                        >
                          <span>{action}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2 text-xs text-[#65746C] pl-8">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#518E6A]" />
                  <span>Consulting {userNick}&apos;s internal AI brain...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Drawer Input Bar */}
            <div className="p-3 bg-white border-t border-[#E8E2DD] shrink-0 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Ask ${userNick}'s Co-Pilot about tasks, EOS notes, or SOPs...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-xl text-xs text-[#242E29] placeholder-[#65746C]/60 focus:outline-none focus:ring-1 focus:ring-[#518E6A] focus:border-[#518E6A]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-3 bg-[#518E6A] hover:bg-[#427457] text-white rounded-xl"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>

              <div className="flex items-center justify-between text-[10px] text-[#65746C] px-1">
                <span>Encrypted single-tenant agent</span>
                <span>Press Enter to send</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
