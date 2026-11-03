"use client";

import React, { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MessageSquare,
  Users,
  Hash,
  Lock,
  Plus,
  Send,
  Paperclip,
  Image as ImageIcon,
  Video as VideoIcon,
  Link2,
  FileText,
  Search,
  MoreVertical,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  FileSpreadsheet,
  FileCode,
  Smile,
  Edit2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "link";
  url: string;
  size?: string;
  thumbnailUrl?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderNickname: string;
  senderAvatar: string;
  senderRole: string;
  isCoreAdmin: boolean;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface ChatChannel {
  id: string;
  name: string;
  type: "channel" | "dm";
  description?: string;
  isPrivate: boolean;
  membersCount: number;
  unreadCount?: number;
  lastMessageSnippet?: string;
  lastMessageTime?: string;
}

const INITIAL_CHANNELS: ChatChannel[] = [
  {
    id: "general",
    name: "general-gim",
    type: "channel",
    description: "Company-wide operational announcements and team discussions.",
    isPrivate: false,
    membersCount: 7,
  },
  {
    id: "little-treasures",
    name: "little-treasures-ops",
    type: "channel",
    description: "Daily sprint updates, GHL funnels, and Dec 11 summit build.",
    isPrivate: false,
    membersCount: 4,
  },
  {
    id: "wrts-ops",
    name: "wrts-automations",
    type: "channel",
    description: "21 n8n workflows, ClassReach CRM sync, and operational monitoring.",
    isPrivate: false,
    membersCount: 3,
  },
  {
    id: "leadership",
    name: "core-leadership",
    type: "channel",
    description: "Restricted strategy, client retainers & resource allocation.",
    isPrivate: true,
    membersCount: 3,
  },
  {
    id: "dm-divine",
    name: "Divine Origines",
    type: "dm",
    isPrivate: true,
    membersCount: 2,
  },
  {
    id: "dm-ra",
    name: "Ma. Rose Anne (RA)",
    type: "dm",
    isPrivate: true,
    membersCount: 2,
  },
  {
    id: "dm-erwin",
    name: "Erwin Manaog",
    type: "dm",
    isPrivate: true,
    membersCount: 2,
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};

interface MessagingCenterProps {
  currentUserId: string;
  currentUserName: string;
  currentUserNickname: string;
  currentUserRole: string;
  isCoreAdmin: boolean;
  avatarColor: string;
}

export function MessagingCenter({
  currentUserId,
  currentUserName,
  currentUserNickname,
  currentUserRole,
  isCoreAdmin,
  avatarColor,
}: MessagingCenterProps) {
  const [channels, setChannels] = useState<ChatChannel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>("general");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("gim_messages_store");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load local messages:", e);
      }
    }
    return {};
  });
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const updateAndPersistMessages = (updater: (prev: Record<string, ChatMessage[]>) => Record<string, ChatMessage[]>) => {
    setMessages((prev) => {
      const next = updater(prev);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("gim_messages_store", JSON.stringify(next));
        } catch (e) {
          console.error("Failed to persist messages:", e);
        }
      }
      return next;
    });
  };

  // Attachment Modal
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [attachType, setAttachType] = useState<"image" | "video" | "document" | "link">("document");
  const [attachName, setAttachName] = useState("");
  const [attachUrl, setAttachUrl] = useState("");
  const [attachSize, setAttachSize] = useState("");

  // Create Channel Modal (Core 3 Admins Only)
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);

  // Supabase Realtime Synchronization
  useEffect(() => {
    // 1. Initial fetch from API
    fetch(`/api/messages?channelId=${activeChannelId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data.messages && data.messages.length > 0) {
          const mapped: ChatMessage[] = data.messages.map((row: any) => ({
            id: row.id,
            channelId: row.channel_id,
            senderId: row.sender_id,
            senderName: row.sender_name,
            senderNickname: row.sender_nickname || row.sender_name?.split(" ")[0] || "User",
            senderAvatar: row.sender_avatar || "#3D5249",
            senderRole: row.sender_role || "team_member",
            isCoreAdmin: !!row.is_core_admin,
            content: row.content || "",
            timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            attachments: row.attachments || [],
            reactions: row.reactions || [],
          }));

          setMessages((prev) => ({
            ...prev,
            [activeChannelId]: mapped,
          }));
        }
      })
      .catch((err) => console.log("Realtime fetch fallback:", err));

    // 2. Supabase Realtime Channel
    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`realtime-channel-${activeChannelId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `channel_id=eq.${activeChannelId}`,
          },
          (payload) => {
            const row = payload.new as any;
            if (!row) return;

            const newMsg: ChatMessage = {
              id: row.id,
              channelId: row.channel_id,
              senderId: row.sender_id,
              senderName: row.sender_name,
              senderNickname: row.sender_nickname || row.sender_name?.split(" ")[0] || "User",
              senderAvatar: row.sender_avatar || "#3D5249",
              senderRole: row.sender_role || "team_member",
              isCoreAdmin: !!row.is_core_admin,
              content: row.content || "",
              timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              attachments: row.attachments || [],
              reactions: row.reactions || [],
            };

            setMessages((prev) => {
              const current = prev[row.channel_id] || [];
              if (current.some((m) => m.id === newMsg.id)) return prev;
              return {
                ...prev,
                [row.channel_id]: [...current, newMsg],
              };
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.log("Supabase realtime subscription bypassed:", e);
    }
  }, [activeChannelId]);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const activeMessages = messages[activeChannelId] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const contentText = inputText.trim();
    const tempId = `msg-${Date.now()}`;

    const newMessage: ChatMessage = {
      id: tempId,
      channelId: activeChannelId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderNickname: currentUserNickname,
      senderAvatar: avatarColor,
      senderRole: currentUserRole,
      isCoreAdmin,
      content: contentText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    updateAndPersistMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMessage],
    }));

    setInputText("");

    // Dispatch to Supabase API
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel_id: activeChannelId,
        sender_id: currentUserId,
        sender_name: currentUserName,
        sender_nickname: currentUserNickname,
        sender_avatar: avatarColor,
        sender_role: currentUserRole,
        is_core_admin: isCoreAdmin,
        content: contentText,
        attachments: [],
      }),
    }).catch((err) => console.log("Failed to persist message to Supabase:", err));
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachName.trim() || !attachUrl.trim()) return;

    const newAttachment: Attachment = {
      id: `att-${Date.now()}`,
      name: attachName.trim(),
      type: attachType,
      url: attachUrl.trim(),
      size: attachSize.trim() || (attachType === "link" ? undefined : "1.2 MB"),
    };

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannelId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderNickname: currentUserNickname,
      senderAvatar: avatarColor,
      senderRole: currentUserRole,
      isCoreAdmin,
      content: inputText.trim() || `Shared a ${attachType}: ${attachName.trim()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments: [newAttachment],
    };

    updateAndPersistMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMessage],
    }));

    // Persist attachment to Supabase API
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel_id: activeChannelId,
        sender_id: currentUserId,
        sender_name: currentUserName,
        sender_nickname: currentUserNickname,
        sender_avatar: avatarColor,
        sender_role: currentUserRole,
        is_core_admin: isCoreAdmin,
        content: newMessage.content,
        attachments: [newAttachment],
      }),
    }).catch((err) => console.log("Failed to persist attachment to Supabase:", err));

    setIsAttachModalOpen(false);
    setAttachName("");
    setAttachUrl("");
    setAttachSize("");
    setInputText("");
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const formattedId = newChannelName.toLowerCase().replace(/\s+/g, "-");
    const newChan: ChatChannel = {
      id: formattedId,
      name: formattedId,
      type: "channel",
      description: newChannelDesc.trim() || "Operational collaboration channel.",
      isPrivate: newChannelPrivate,
      membersCount: newChannelPrivate ? 3 : 7,
      lastMessageSnippet: "Channel created.",
      lastMessageTime: "Just now",
    };

    setChannels([...channels, newChan]);
    setActiveChannelId(formattedId);
    setIsCreateChannelModalOpen(false);
    setNewChannelName("");
    setNewChannelDesc("");
    setNewChannelPrivate(false);
  };

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-[#242E29]">
              Team Messaging & Communication Hub
            </h2>
            <Badge variant="brand">Internal Real-Time Channels</Badge>
          </div>
          <p className="text-xs text-[#65746C] mt-0.5">
            Real-time chat, file sharing, media previews, and channel administration for GIM leaders and specialists.
          </p>
        </div>

        {isCoreAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateChannelModalOpen(true)}
            className="flex items-center space-x-1 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Channel (Core Admin)</span>
          </Button>
        )}
      </div>

      {/* 2. CHAT CONTAINER: SIDEBAR + ACTIVE CONVERSATION */}
      <Card className="overflow-hidden border border-[#E8E2DD] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[620px]">
          {/* Left Sidebar: Channels & DMs (4 Cols) */}
          <div className="md:col-span-4 border-r border-[#E8E2DD] bg-[#FBF6F3]/50 flex flex-col">
            {/* Search Input */}
            <div className="p-3 border-b border-[#E8E2DD]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
                <input
                  type="text"
                  placeholder="Filter channels or members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                />
              </div>
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {/* Group Channels */}
              <div>
                <div className="flex items-center justify-between px-2 text-[10px] font-semibold text-[#65746C] uppercase tracking-wider mb-1">
                  <span>Group Channels</span>
                  {isCoreAdmin && (
                    <button
                      onClick={() => setIsCreateChannelModalOpen(true)}
                      className="hover:text-[#242E29]"
                      title="Create Channel"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="space-y-0.5">
                  {filteredChannels
                    .filter((c) => c.type === "channel")
                    .map((channel) => {
                      const isActive = channel.id === activeChannelId;
                      return (
                        <button
                          key={channel.id}
                          onClick={() => setActiveChannelId(channel.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                            isActive
                              ? "bg-[#3D5249] text-white font-semibold shadow-xs"
                              : "text-[#242E29] hover:bg-white hover:border-[#E8E2DD]"
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate min-w-0">
                            {channel.isPrivate ? (
                              <Lock className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-amber-400" : "text-amber-600"}`} />
                            ) : (
                              <Hash className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#518E6A]" : "text-[#65746C]"}`} />
                            )}
                            <span className="truncate">{channel.name}</span>
                          </div>
                          {channel.unreadCount && !isActive && (
                            <span className="w-4 h-4 rounded-full bg-[#518E6A] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                              {channel.unreadCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Direct Messages */}
              <div>
                <div className="px-2 text-[10px] font-semibold text-[#65746C] uppercase tracking-wider mb-1">
                  Direct Messages
                </div>
                <div className="space-y-0.5">
                  {filteredChannels
                    .filter((c) => c.type === "dm")
                    .map((channel) => {
                      const isActive = channel.id === activeChannelId;
                      return (
                        <button
                          key={channel.id}
                          onClick={() => setActiveChannelId(channel.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                            isActive
                              ? "bg-[#3D5249] text-white font-semibold shadow-xs"
                              : "text-[#242E29] hover:bg-white hover:border-[#E8E2DD]"
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate min-w-0">
                            <div className="w-5 h-5 rounded-full bg-[#466B53] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                              {channel.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate">{channel.name}</span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* User Presence Footer */}
            <div className="p-3 border-t border-[#E8E2DD] bg-white flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className={`w-7 h-7 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                  {currentUserNickname.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-[#242E29] truncate leading-tight">
                    {currentUserName} ({currentUserNickname})
                  </p>
                  <p className="text-[10px] text-[#466B53] font-medium">{currentUserRole}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Area: Active Chat & Composer (8 Cols) */}
          <div className="md:col-span-8 flex flex-col bg-white">
            {/* Chat Top Header */}
            <div className="p-3.5 border-b border-[#E8E2DD] bg-[#FBF6F3]/40 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                {activeChannel.isPrivate ? (
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <Hash className="w-4 h-4 text-[#466B53] shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-sm text-[#242E29] leading-tight">
                    {activeChannel.name}
                  </h3>
                  {activeChannel.description && (
                    <p className="text-[11px] text-[#65746C] truncate mt-0.5">
                      {activeChannel.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="neutral">
                  <Users className="w-3 h-3 mr-1 inline" />
                  {activeChannel.membersCount} members
                </Badge>
              </div>
            </div>

            {/* Messages Thread Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeMessages.length === 0 ? (
                <div className="p-16 text-center text-[#65746C] space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#466B53]/10 text-[#466B53] flex items-center justify-center mx-auto">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-xs text-[#242E29]">
                    No messages in #{activeChannel.name} yet
                  </p>
                  <p className="text-[11px] text-[#65746C] max-w-sm mx-auto">
                    Send a message or attach real project pictures, videos, files, or links below.
                  </p>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isCurrentUser = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className="flex items-start space-x-3 text-xs group">
                      <div className={`w-8 h-8 rounded-full ${msg.senderAvatar} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5`}>
                        {msg.senderNickname.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#242E29]">{msg.senderName}</span>
                          <span className="text-[#466B53] font-semibold text-[10px]">({msg.senderNickname})</span>
                          {msg.isCoreAdmin && <Badge variant="dark">Core Admin</Badge>}
                          <span className="text-[10px] text-[#65746C]">{msg.timestamp}</span>
                        </div>

                        {/* Text Content */}
                        <div className="text-xs text-[#242E29] leading-relaxed whitespace-pre-wrap bg-[#FBF6F3]/50 p-2.5 rounded-xl border border-[#E8E2DD]/70 inline-block max-w-2xl">
                          {msg.content}
                        </div>

                        {/* Attachments Section */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-2 pt-1">
                            {msg.attachments.map((att) => (
                              <div key={att.id}>
                                {/* Image Attachment */}
                                {att.type === "image" && (
                                  <div className="max-w-sm rounded-xl border border-[#E8E2DD] overflow-hidden bg-[#FBF6F3] p-2 space-y-1.5">
                                    <div className="h-40 bg-[#3D5249]/10 rounded-lg flex items-center justify-center overflow-hidden">
                                      <img
                                        src={att.url}
                                        alt={att.name}
                                        className="h-full object-contain"
                                      />
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] px-1">
                                      <span className="font-semibold text-[#242E29] truncate">{att.name}</span>
                                      <span className="text-[#65746C]">{att.size}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Video Attachment */}
                                {att.type === "video" && (
                                  <div className="max-w-md rounded-xl border border-[#E8E2DD] overflow-hidden bg-black p-1 space-y-1">
                                    <video
                                      src={att.url}
                                      controls
                                      className="w-full rounded max-h-48"
                                    />
                                    <div className="flex items-center justify-between text-[11px] text-white px-2 py-1">
                                      <span className="font-semibold truncate">{att.name}</span>
                                      <span className="text-white/70">{att.size}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Document / File Attachment */}
                                {att.type === "document" && (
                                  <div className="flex items-center space-x-3 p-2.5 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/80 max-w-md hover:border-[#518E6A]/50 transition-colors">
                                    <div className="p-2 rounded-lg bg-[#466B53]/15 text-[#3D5249]">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-xs text-[#242E29] truncate">{att.name}</p>
                                      <p className="text-[10px] text-[#65746C]">{att.size || "File"}</p>
                                    </div>
                                    <a
                                      href={att.url}
                                      download={att.name}
                                      className="p-1.5 rounded-md text-[#466B53] hover:bg-[#466B53]/10"
                                      title="Download File"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                                )}

                                {/* External Link Attachment */}
                                {att.type === "link" && (
                                  <div className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-[#518E6A]/30 bg-[#EDFDF5]/60 max-w-md">
                                    <Link2 className="w-4 h-4 text-[#38A169] shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-xs text-[#276749] truncate">{att.name}</p>
                                      <p className="text-[10px] text-[#276749]/70 truncate">{att.url}</p>
                                    </div>
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded text-[#276749] hover:bg-[#C6F6D5]"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Composer & Attachment Bar */}
            <div className="p-3 border-t border-[#E8E2DD] bg-[#FBF6F3]/30 space-y-2">
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={`Message #${activeChannel.name}... (Press Enter to send)`}
                    className="w-full p-2.5 pr-20 bg-white border border-[#E8E2DD] rounded-xl text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A] resize-none"
                  />
                  <div className="absolute right-2.5 bottom-2.5 flex items-center space-x-1">
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-1.5 h-7 w-7 rounded-lg flex items-center justify-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Quick Attachment Triggers */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAttachType("document");
                        setIsAttachModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded text-[#65746C] hover:text-[#242E29] hover:bg-black/5 transition-colors text-[11px]"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[#518E6A]" />
                      <span>Attach File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAttachType("image");
                        setIsAttachModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded text-[#65746C] hover:text-[#242E29] hover:bg-black/5 transition-colors text-[11px]"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#466B53]" />
                      <span>Image</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAttachType("video");
                        setIsAttachModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded text-[#65746C] hover:text-[#242E29] hover:bg-black/5 transition-colors text-[11px]"
                    >
                      <VideoIcon className="w-3.5 h-3.5 text-amber-600" />
                      <span>Video</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAttachType("link");
                        setIsAttachModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded text-[#65746C] hover:text-[#242E29] hover:bg-black/5 transition-colors text-[11px]"
                    >
                      <Link2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Link</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-[#65746C]">Shift + Enter for new line</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* 3. ATTACHMENT MODAL (Pictures, Videos, Files, Links) */}
      {/* ========================================================================= */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8E2DD] max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8E2DD] pb-3">
              <div className="flex items-center space-x-2">
                <Paperclip className="w-4 h-4 text-[#518E6A]" />
                <h3 className="font-bold text-sm text-[#242E29]">
                  Attach {attachType.toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setIsAttachModalOpen(false)}
                className="p-1 rounded text-[#65746C] hover:text-[#242E29]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAttachment} className="space-y-3.5 text-xs">
              {/* Type Selector */}
              <div className="flex items-center gap-1.5">
                {(["document", "image", "video", "link"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAttachType(t)}
                    className={`flex-1 py-1.5 rounded-lg font-medium text-xs capitalize transition-colors ${
                      attachType === t
                        ? "bg-[#3D5249] text-white"
                        : "bg-[#FBF6F3] text-[#65746C] hover:bg-[#E8E2DD]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#242E29] mb-1">
                  File Title / Display Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    attachType === "image"
                      ? "e.g. GHL_Mobile_Funnels_Screenshot.png"
                      : attachType === "video"
                      ? "e.g. G5_Page_Walkthrough_Review.mp4"
                      : attachType === "link"
                      ? "e.g. Zoe's Live Funnel Staging"
                      : "e.g. Little_Treasures_Intake_Audit.pdf"
                  }
                  value={attachName}
                  onChange={(e) => setAttachName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#242E29] mb-1">
                  {attachType === "link" ? "URL Destination *" : "File Source URL or Asset Path *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    attachType === "link"
                      ? "https://littletreasurescompany.com"
                      : "https://... or /gim-mark-green.png"
                  }
                  value={attachUrl}
                  onChange={(e) => setAttachUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                />
              </div>

              {attachType !== "link" && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#242E29] mb-1">
                    File Size (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3.4 MB"
                    value={attachSize}
                    onChange={(e) => setAttachSize(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E8E2DD]">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsAttachModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Insert Attachment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CREATE CHANNEL MODAL (Core 3 Admins Only) */}
      {/* ========================================================================= */}
      {isCreateChannelModalOpen && isCoreAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8E2DD] max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-1 flex items-center justify-between border-b border-[#E8E2DD] pb-3">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-[#466B53]" />
                <h3 className="font-bold text-sm text-[#242E29]">Create Team Channel</h3>
              </div>
              <button
                onClick={() => setIsCreateChannelModalOpen(false)}
                className="p-1 rounded text-[#65746C] hover:text-[#242E29]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#242E29] mb-1">
                  Channel Name *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C] font-mono">#</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. invogue-onboarding"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#242E29] mb-1">
                  Topic & Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What is this channel for?"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                />
              </div>

              <div className="p-3 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-[#242E29]">Make Channel Private</p>
                  <p className="text-[10px] text-[#65746C]">Restricted to invited core leaders</p>
                </div>
                <input
                  type="checkbox"
                  checked={newChannelPrivate}
                  onChange={(e) => setNewChannelPrivate(e.target.checked)}
                  className="rounded text-[#518E6A] focus:ring-[#518E6A] h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E8E2DD]">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateChannelModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Create Channel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
