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
  CheckCheck,
  ArrowLeft,
  CornerUpLeft,
  Sliders,
  UserPlus,
  UserMinus,
  Pin,
  PinOff,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { soundManager } from "@/lib/audio/sounds";

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "link";
  url: string;
  size?: string;
  thumbnailUrl?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
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
  reactions?: MessageReaction[];
  reply_to?: { senderName: string; content: string } | null;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: "channel" | "dm";
  description?: string;
  isPrivate: boolean;
  membersCount: number;
  memberIds?: string[];
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
    membersCount: 19,
    memberIds: [], // Open to all team members
  },
  {
    id: "juvibolt-ops",
    name: "juvibolt-cybertech",
    type: "channel",
    description: "Daily sprint updates, Tutor LMS architecture, and bootcamp student onboarding.",
    isPrivate: false,
    membersCount: 4,
    memberIds: ["divine", "radz", "erwin", "aaron"],
  },
  {
    id: "wrts-ops",
    name: "wrts-automations",
    type: "channel",
    description: "Sensory gym franchise, 21 n8n automations, GHL funnels, and webhooks.",
    isPrivate: false,
    membersCount: 5,
    memberIds: ["divine", "radz", "bj", "aldwin", "erwin"],
  },
  {
    id: "juvibolt-ops",
    name: "juvibolt-cybertech",
    type: "channel",
    description: "GHL Sub-Account mg57RFEKUm6nvnSadv2D, LMS course sync, and WooCommerce.",
    isPrivate: false,
    membersCount: 4,
    memberIds: ["divine", "radz", "aaron"],
  },
  {
    id: "risewise-ops",
    name: "risewise-growth",
    type: "channel",
    description: "Multi-channel funnel automation, appointment routing & sprint tracking.",
    isPrivate: false,
    membersCount: 4,
    memberIds: ["divine", "radz", "jerold"],
  },
  {
    id: "noirlab-ops",
    name: "noirlab-digital",
    type: "channel",
    description: "Brand digital strategy, web asset builds, and client acquisition workflows.",
    isPrivate: false,
    membersCount: 4,
    memberIds: ["divine", "radz", "jane"],
  },
  {
    id: "studio-nets-ops",
    name: "studio-nets-ops",
    type: "channel",
    description: "Creative design systems, Figma handoffs, and Fathom AI SOP summaries.",
    isPrivate: false,
    membersCount: 6,
    memberIds: ["divine", "erwin", "bj", "jedy", "joyce", "hashim", "ellyka", "nathan"],
  },
  {
    id: "invogue-ops",
    name: "invogue-growth",
    type: "channel",
    description: "Lead generation, SMS reminders, cleaner dispatch system, and billing reconciliations.",
    isPrivate: false,
    membersCount: 6,
    memberIds: ["ra", "joy", "radz", "jedy", "ellyka", "matthew"],
  },
  {
    id: "tch2thrive-ops",
    name: "tch2thrive-systems",
    type: "channel",
    description: "Teacher development resources, district pipelines, and SOP library.",
    isPrivate: false,
    membersCount: 4,
    memberIds: ["divine", "radz", "ra", "bj"],
  },
  {
    id: "leadership",
    name: "core-leadership",
    type: "channel",
    description: "Restricted strategy, client retainers & resource allocation.",
    isPrivate: true,
    membersCount: 3,
    memberIds: ["divine", "radz", "ra"],
  },
  {
    id: "dm-divine",
    name: "Divine Origines",
    type: "dm",
    isPrivate: true,
    membersCount: 2,
    memberIds: ["divine", "radz"],
  },
  {
    id: "dm-ra",
    name: "Ma. Rose Anne (RA)",
    type: "dm",
    isPrivate: true,
    membersCount: 2,
    memberIds: ["ra", "radz"],
  },
  {
    id: "dm-erwin",
    name: "Erwin Manaog",
    type: "dm",
    isPrivate: true,
    membersCount: 2,
    memberIds: ["erwin", "radz"],
  },
];

const AVAILABLE_TEAM_MEMBERS = [
  { id: "divine", name: "Divine Origines", role: "Owner" },
  { id: "radz", name: "Radzdom Gallego", role: "Admin" },
  { id: "ra", name: "Ma. Rose Anne Malinao", role: "Admin" },
  { id: "erwin", name: "Erwin Manaog", role: "Operations Manager" },
  { id: "camille", name: "Camille Bautista", role: "Operations Manager" },
  { id: "bj", name: "BJ Ricafrente", role: "Specialist" },
  { id: "joy", name: "Joy Fabular", role: "Specialist" },
  { id: "kimberly", name: "Kimberly Besa", role: "Operations Assistant" },
  { id: "jedy", name: "Jedy Caillio", role: "Creative Specialist" },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};

interface MessagingCenterProps {
  currentUserId: string;
  currentUserName: string;
  currentUserNickname: string;
  currentUserRole: string;
  isCoreAdmin: boolean;
  avatarColor: string;
  selectedClientId?: string;
  clientScope?: string;
}

export function MessagingCenter({
  currentUserId,
  currentUserName,
  currentUserNickname,
  currentUserRole,
  isCoreAdmin,
  avatarColor,
  selectedClientId,
  clientScope = "all",
}: MessagingCenterProps) {
  const [channels, setChannels] = useState<ChatChannel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>("general");
  const [mobileView, setMobileView] = useState<"list" | "chat">("chat");
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; time: number }>>({});
  const [seenUsers, setSeenUsers] = useState<Record<string, { name: string; seenAt: number }>>({});
  const realtimeChannelRef = useRef<any>(null);
  const lastTypingBroadcastRef = useRef<number>(0);

  // Sync active channel with selected client context
  useEffect(() => {
    if (!selectedClientId || selectedClientId === "all") return;
    const clientChannelMap: Record<string, string> = {
      "juvibolt": "juvibolt-ops",
      "studio-nets": "studio-nets-ops",
      "invogue-cleans": "invogue-ops",
      "aaron-ofosu": "aaron-ofosu-ops",
      "tch2thrive": "tch2thrive-ops",
    };
    const target = clientChannelMap[selectedClientId];
    if (target) {
      setActiveChannelId(target);
    }
  }, [selectedClientId]);

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
  const [searchMessageQuery, setSearchMessageQuery] = useState("");
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<{ senderName: string; content: string } | null>(null);
  const [showEmojiPickerForMsg, setShowEmojiPickerForMsg] = useState<string | null>(null);
  const [isChannelInfoOpen, setIsChannelInfoOpen] = useState(false);
  const [infoDrawerTab, setInfoDrawerTab] = useState<"members" | "media" | "search">("members");
  const [addMemberSelectId, setAddMemberSelectId] = useState("");

    // Pinned Channels and Groups
  const [pinnedChannelIds, setPinnedChannelIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("gim_pinned_channels");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return ["general"];
  });

  const togglePinChannel = (channelId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setPinnedChannelIds((prev) => {
      const next = prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("gim_pinned_channels", JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  // Pinned Messages per channel
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Record<string, string[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("gim_pinned_messages");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const togglePinMessage = (msgId: string) => {
    setPinnedMessageIds((prev) => {
      const currentList = prev[activeChannelId] || [];
      const nextList = currentList.includes(msgId)
        ? currentList.filter((id) => id !== msgId)
        : [...currentList, msgId];
      const next = { ...prev, [activeChannelId]: nextList };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("gim_pinned_messages", JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  // Context Menu & Forwarding State
  const [contextMenuMsg, setContextMenuMsg] = useState<ChatMessage | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardMsg, setForwardMsg] = useState<ChatMessage | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile Long-Press / Hold handlers
  const handleMessageTouchStart = (msg: ChatMessage, e: React.TouchEvent) => {
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    touchTimerRef.current = setTimeout(() => {
      setContextMenuMsg(msg);
      setContextMenuPos({ x: clientX, y: clientY });
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(35);
      }
    }, 450);
  };

  const handleMessageTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
  };

  const handleMessageContextMenu = (msg: ChatMessage, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuMsg(msg);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Delete message for everyone
  const handleDeleteMessage = async (msgId: string) => {
    updateAndPersistMessages((prev) => {
      const channelMsgs = prev[activeChannelId] || [];
      return {
        ...prev,
        [activeChannelId]: channelMsgs.filter((m) => m.id !== msgId),
      };
    });
    setContextMenuMsg(null);

    // Broadcast instant delete across active channel
    if (realtimeChannelRef.current) {
      try {
        realtimeChannelRef.current.send({
          type: "broadcast",
          event: "delete_message",
          payload: { messageId: msgId, channelId: activeChannelId },
        });
      } catch (e) {
        console.error("Broadcast delete error:", e);
      }
    }

    try {
      await fetch(`/api/messages?id=${msgId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  // Forward message to another channel/DM
  const handleExecuteForward = (targetChannelId: string) => {
    if (!forwardMsg || !targetChannelId) return;

    const forwardedContent = `↪ Forwarded from @${forwardMsg.senderNickname || forwardMsg.senderName}:\n"${forwardMsg.content}"`;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      channelId: targetChannelId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderNickname: currentUserNickname,
      senderAvatar: avatarColor,
      senderRole: currentUserRole,
      isCoreAdmin,
      content: forwardedContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments: forwardMsg.attachments,
    };

    updateAndPersistMessages((prev) => {
      const targetMsgs = prev[targetChannelId] || [];
      return {
        ...prev,
        [targetChannelId]: [...targetMsgs, newMsg],
      };
    });

    if (realtimeChannelRef.current) {
      try {
        realtimeChannelRef.current.send({
          type: "broadcast",
          event: "new_message",
          payload: newMsg,
        });
      } catch (e) {}
    }

    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMsg),
    }).catch((e) => console.error("Forward error:", e));

    setIsForwardModalOpen(false);
    setForwardMsg(null);
    setContextMenuMsg(null);
    setActiveChannelId(targetChannelId);
  };

  const handleCopyMessageText = (text: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
      setContextMenuMsg(null);
    }
  };

  const isLeader =
    currentUserRole === "Owner" ||
    isCoreAdmin ||
    ["divine", "radz", "ra"].includes(currentUserId.toLowerCase()) ||
    ["divine", "radz", "ra"].includes(currentUserNickname.toLowerCase());

  const handleAddMemberToChannel = (memberId: string) => {
    if (!memberId) return;
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id !== activeChannelId) return c;
        const currentMembers = c.memberIds || [];
        if (currentMembers.includes(memberId)) return c;
        const nextMembers = [...currentMembers, memberId];
        return {
          ...c,
          memberIds: nextMembers,
          membersCount: Math.max(c.membersCount + 1, nextMembers.length),
        };
      })
    );
    setAddMemberSelectId("");
  };

  const handleRemoveMemberFromChannel = (memberId: string) => {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id !== activeChannelId) return c;
        const currentMembers = c.memberIds || [];
        const nextMembers = currentMembers.filter((id) => id !== memberId);
        return {
          ...c,
          memberIds: nextMembers,
          membersCount: Math.max(1, (c.membersCount || 2) - 1),
        };
      })
    );
  };

  const toggleMessageReaction = (msgId: string, emoji: string) => {
    let nextReactionsForBroadcast: MessageReaction[] = [];

    updateAndPersistMessages((prev) => {
      const channelMsgs = prev[activeChannelId] || [];
      const updated = channelMsgs.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions || [];
        const match = currentReactions.find((r) => r.emoji === emoji);
        let nextReactions;

        if (match) {
          const userAlready = match.users.includes(currentUserNickname);
          if (userAlready) {
            nextReactions = currentReactions
              .map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, users: r.users.filter((u) => u !== currentUserNickname) }
                  : r
              )
              .filter((r) => r.count > 0);
          } else {
            nextReactions = currentReactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, currentUserNickname] } : r
            );
          }
        } else {
          nextReactions = [...currentReactions, { emoji, count: 1, users: [currentUserNickname] }];
        }

        nextReactionsForBroadcast = nextReactions;
        return { ...m, reactions: nextReactions };
      });

      return {
        ...prev,
        [activeChannelId]: updated,
      };
    });
    setShowEmojiPickerForMsg(null);

    // Broadcast reaction instantly
    if (realtimeChannelRef.current) {
      try {
        realtimeChannelRef.current.send({
          type: "broadcast",
          event: "reaction",
          payload: {
            messageId: msgId,
            reactions: nextReactionsForBroadcast,
            channelId: activeChannelId,
          },
        });
      } catch (e) {}
    }

    // Persist to Supabase
    fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msgId, reactions: nextReactionsForBroadcast }),
    }).catch((e) => console.error("Failed to update reactions:", e));
  };

  // Clean up expired typing indicators after 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        let changed = false;
        const next: Record<string, { name: string; time: number }> = {};
        for (const [uid, info] of Object.entries(prev)) {
          if (now - info.time < 2500) {
            next[uid] = info;
          } else {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
  const [selectedChannelMembers, setSelectedChannelMembers] = useState<string[]>([currentUserId, "divine"]);

  // Supabase Realtime Synchronization + Instant Background Polling
  useEffect(() => {
    let isMounted = true;

    // Helper to fetch and merge messages from API
    const syncChannelMessages = async () => {
      try {
        const res = await fetch(`/api/messages?channelId=${activeChannelId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.messages && Array.isArray(data.messages)) {
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

          setMessages((prev) => {
            const current = prev[activeChannelId] || [];
            // Check if there are any new messages or reaction updates
            if (current.length === mapped.length) {
              const hasDiff = current.some((c, idx) => {
                const m = mapped[idx];
                return !m || c.id !== m.id || JSON.stringify(c.reactions) !== JSON.stringify(m.reactions);
              });
              if (!hasDiff) return prev;
            }
            return {
              ...prev,
              [activeChannelId]: mapped,
            };
          });
        }
      } catch (err) {
        // Silent background fallback
      }
    };

    // 1. Initial fetch
    syncChannelMessages();

    // 2. High-speed 2-second background sync interval
    const pollInterval = setInterval(() => {
      syncChannelMessages();
    }, 2000);

    // 3. Tab visibility and focus sync
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        syncChannelMessages();
      }
    };
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    // 4. Supabase Realtime Channel (Instant WebSockets Broadcast + Postgres Changes)
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
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

            if (row.sender_id !== currentUserId) {
              soundManager.play("message");
              channel?.send({
                type: "broadcast",
                event: "seen",
                payload: {
                  channelId: activeChannelId,
                  userId: currentUserId,
                  userName: currentUserNickname || currentUserName,
                  seenAt: Date.now(),
                },
              });
            }
          }
        )
        // Instant Realtime Peer Broadcast for new messages (<50ms delivery)
        .on("broadcast", { event: "new_message" }, (payload) => {
          const newMsg = payload.payload as ChatMessage;
          if (!newMsg || newMsg.channelId !== activeChannelId) return;

          setMessages((prev) => {
            const current = prev[newMsg.channelId] || [];
            if (current.some((m) => m.id === newMsg.id)) return prev;
            return {
              ...prev,
              [newMsg.channelId]: [...current, newMsg],
            };
          });

          if (newMsg.senderId !== currentUserId) {
            soundManager.play("message");
            channel?.send({
              type: "broadcast",
              event: "seen",
              payload: {
                channelId: activeChannelId,
                userId: currentUserId,
                userName: currentUserNickname || currentUserName,
                seenAt: Date.now(),
              },
            });
          }
        })
        // Instant Realtime Peer Broadcast for message deletion
        .on("broadcast", { event: "delete_message" }, (payload) => {
          const { messageId, channelId } = payload.payload || {};
          if (!messageId) return;
          const target = channelId || activeChannelId;
          setMessages((prev) => ({
            ...prev,
            [target]: (prev[target] || []).filter((m) => m.id !== messageId),
          }));
        })
        // Instant Realtime Peer Broadcast for reactions
        .on("broadcast", { event: "reaction" }, (payload) => {
          const { messageId, reactions, channelId } = payload.payload || {};
          if (!messageId || !reactions) return;
          const target = channelId || activeChannelId;
          setMessages((prev) => {
            const list = prev[target] || [];
            return {
              ...prev,
              [target]: list.map((m) => (m.id === messageId ? { ...m, reactions } : m)),
            };
          });
        })
        .on("broadcast", { event: "typing" }, (payload) => {
          const { userId, userName } = payload.payload || {};
          if (userId && userId !== currentUserId) {
            setTypingUsers((prev) => ({
              ...prev,
              [userId]: { name: userName || "Team Member", time: Date.now() },
            }));
          }
        })
        .on("broadcast", { event: "seen" }, (payload) => {
          const { userId, userName, seenAt } = payload.payload || {};
          if (userId && userId !== currentUserId) {
            setSeenUsers((prev) => ({
              ...prev,
              [userId]: { name: userName || "Member", seenAt: seenAt || Date.now() },
            }));
          }
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            channel?.send({
              type: "broadcast",
              event: "seen",
              payload: {
                channelId: activeChannelId,
                userId: currentUserId,
                userName: currentUserNickname || currentUserName,
                seenAt: Date.now(),
              },
            });
          }
        });

      realtimeChannelRef.current = channel;
    } catch (e) {
      console.log("Supabase realtime subscription bypassed:", e);
    }

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch (e) {}
      }
      realtimeChannelRef.current = null;
    };
  }, [activeChannelId, currentUserId, currentUserName, currentUserNickname]);

  // Throttled typing broadcast
  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!text.trim()) return;

    const now = Date.now();
    if (now - lastTypingBroadcastRef.current > 1500) {
      lastTypingBroadcastRef.current = now;
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.send({
          type: "broadcast",
          event: "typing",
          payload: {
            userId: currentUserId,
            userName: currentUserNickname || currentUserName,
          },
        });
      }
    }
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const activeMessages = messages[activeChannelId] || [];

  const displayedMessages = searchMessageQuery.trim()
    ? activeMessages.filter(
        (m) =>
          m.content.toLowerCase().includes(searchMessageQuery.toLowerCase()) ||
          m.senderName.toLowerCase().includes(searchMessageQuery.toLowerCase()) ||
          m.senderNickname.toLowerCase().includes(searchMessageQuery.toLowerCase())
      )
    : activeMessages;

  const channelPinnedIds = pinnedMessageIds[activeChannelId] || [];
  const channelPinnedMsgs = activeMessages.filter((m) => channelPinnedIds.includes(m.id));

  const channelAttachments = activeMessages.flatMap((m) => m.attachments || []);
  const channelImages = channelAttachments.filter((a) => a.type === "image");
  const channelFilesAndLinks = channelAttachments.filter((a) => a.type === "document" || a.type === "link" || a.type === "video");

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
      reply_to: replyingToMessage,
    };

    updateAndPersistMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMessage],
    }));

    setInputText("");
    setReplyingToMessage(null);
    soundManager.play("message");

    // Peer Broadcast over WebSockets for zero-latency delivery (<50ms)
    if (realtimeChannelRef.current) {
      try {
        realtimeChannelRef.current.send({
          type: "broadcast",
          event: "new_message",
          payload: newMessage,
        });
      } catch (e) {
        console.error("Broadcast send error:", e);
      }
    }

    // Dispatch to Supabase API with exact message ID for instant deduplication
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: tempId,
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

    // Peer Broadcast over WebSockets for zero-latency delivery (<50ms)
    if (realtimeChannelRef.current) {
      try {
        realtimeChannelRef.current.send({
          type: "broadcast",
          event: "new_message",
          payload: newMessage,
        });
      } catch (e) {
        console.error("Broadcast attachment error:", e);
      }
    }

    // Persist attachment to Supabase API
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newMessage.id,
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
    const membersToAssign = selectedChannelMembers.length > 0 ? selectedChannelMembers : [currentUserId];

    const newChan: ChatChannel = {
      id: formattedId,
      name: formattedId,
      type: "channel",
      description: newChannelDesc.trim() || "Operational collaboration channel.",
      isPrivate: newChannelPrivate,
      membersCount: membersToAssign.length,
      memberIds: membersToAssign,
      lastMessageSnippet: "Group chat created.",
      lastMessageTime: "Just now",
    };

    setChannels([...channels, newChan]);
    setActiveChannelId(formattedId);
    setIsCreateChannelModalOpen(false);
    setNewChannelName("");
    setNewChannelDesc("");
    setNewChannelPrivate(false);
    setSelectedChannelMembers([currentUserId, "divine"]);
  };

  const filteredChannels = channels.filter((c) => {
    if (searchQuery.trim() && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 1. General channel (#general-gim) is open to the whole team
    if (c.id === "general" || c.name === "general-gim") {
      return true;
    }

    // 2. Core Admins have universal visibility to oversee all spaces
    if (isCoreAdmin) {
      return true;
    }

    // 3. Client Scope Access: If channel belongs to member's assigned client
    if (clientScope && clientScope !== "all") {
      const scopeList = clientScope.split(",").map((s) => s.trim().toLowerCase());
      const channelName = c.name.toLowerCase();
      const channelId = c.id.toLowerCase();
      const isClientChannel = scopeList.some((sc) => {
        if (sc.includes("spectrum") && (channelName.includes("wrts") || channelName.includes("spectrum") || channelId.includes("wrts"))) return true;
        if (sc.includes("juvibolt") && (channelName.includes("juvibolt") || channelName.includes("ofosu") || channelId.includes("juvibolt"))) return true;
        if (sc.includes("risewise") && (channelName.includes("risewise") || channelId.includes("risewise"))) return true;
        if (sc.includes("noirlab") && (channelName.includes("noirlab") || channelId.includes("noirlab"))) return true;
        if (sc.includes("studio net") && (channelName.includes("studio-net") || channelId.includes("studio-net"))) return true;
        if (sc.includes("invogue") && (channelName.includes("invogue") || channelId.includes("invogue"))) return true;
        if (sc.includes("tch2thrive") && (channelName.includes("tch2thrive") || channelId.includes("tch2thrive"))) return true;
        return false;
      });
      if (isClientChannel) return true;
    }

    // 4. Member ID / Nickname check
    if (c.memberIds && c.memberIds.length > 0) {
      const myKeys = [
        currentUserId.toLowerCase(),
        currentUserNickname.toLowerCase(),
        currentUserName.toLowerCase().split(" ")[0],
      ];
      return c.memberIds.some((mId) => myKeys.includes(mId.toLowerCase()));
    }

    return !c.isPrivate;
  });

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
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px] md:min-h-[620px]">
          {/* Left Sidebar: Channels & DMs (4 Cols) */}
          <div className={`md:col-span-4 border-r border-[#E8E2DD] bg-[#FBF6F3]/50 flex flex-col ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
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
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {/* 📌 PINNED CHANNELS & CONVERSATIONS */}
              {pinnedChannelIds.length > 0 && (
                <div className="pb-1 border-b border-[#E8E2DD]/60">
                  <div className="px-2 text-[10px] font-bold text-[#466B53] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-[#466B53]" />
                    <span>Pinned ({pinnedChannelIds.length})</span>
                  </div>
                  <div className="space-y-0.5">
                    {channels
                      .filter((c) => pinnedChannelIds.includes(c.id))
                      .map((channel) => {
                        const isActive = channel.id === activeChannelId;
                        return (
                          <div
                            key={channel.id}
                            onClick={() => {
                              setActiveChannelId(channel.id);
                              setMobileView("chat");
                            }}
                            className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                              isActive
                                ? "bg-[#3D5249] text-white font-semibold shadow-xs"
                                : "text-[#242E29] hover:bg-white hover:border-[#E8E2DD]"
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate min-w-0">
                              {channel.type === "dm" ? (
                                <div className="w-4 h-4 rounded-full bg-[#466B53] text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                                  {channel.name.slice(0, 2).toUpperCase()}
                                </div>
                              ) : channel.isPrivate ? (
                                <Lock className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-amber-400" : "text-amber-600"}`} />
                              ) : (
                                <Hash className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#518E6A]" : "text-[#65746C]"}`} />
                              )}
                              <span className="truncate">{channel.name}</span>
                            </div>
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => togglePinChannel(channel.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-amber-400 hover:text-amber-300 transition-opacity"
                                title="Unpin conversation"
                              >
                                <Pin className="w-3 h-3 fill-current" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

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
                      const isPinned = pinnedChannelIds.includes(channel.id);
                      return (
                        <div
                          key={channel.id}
                          onClick={() => {
                            setActiveChannelId(channel.id);
                            setMobileView("chat");
                          }}
                          className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
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
                          <div className="flex items-center space-x-1 shrink-0">
                            {channel.unreadCount && !isActive && (
                              <span className="w-4 h-4 rounded-full bg-[#518E6A] text-white text-[9px] font-bold flex items-center justify-center">
                                {channel.unreadCount}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => togglePinChannel(channel.id, e)}
                              className={`p-1 transition-opacity ${isPinned ? "text-amber-400" : "opacity-0 group-hover:opacity-100 text-[#65746C] hover:text-[#242E29]"}`}
                              title={isPinned ? "Unpin channel" : "Pin channel to top"}
                            >
                              <Pin className={`w-3 h-3 ${isPinned ? "fill-current" : ""}`} />
                            </button>
                          </div>
                        </div>
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
                      const isPinned = pinnedChannelIds.includes(channel.id);
                      return (
                        <div
                          key={channel.id}
                          onClick={() => {
                            setActiveChannelId(channel.id);
                            setMobileView("chat");
                          }}
                          className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isActive
                              ? "bg-[#3D5249] text-white font-semibold shadow-xs"
                              : "text-[#242E29] hover:bg-white hover:border-[#E8E2DD]"
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate min-w-0">
                            <div className="relative shrink-0">
                              <div className="w-5 h-5 rounded-full bg-[#466B53] text-white flex items-center justify-center text-[9px] font-bold">
                                {channel.name.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-white"></span>
                            </div>
                            <span className="truncate">{channel.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => togglePinChannel(channel.id, e)}
                            className={`p-1 transition-opacity ${isPinned ? "text-amber-400" : "opacity-0 group-hover:opacity-100 text-[#65746C] hover:text-[#242E29]"}`}
                            title={isPinned ? "Unpin conversation" : "Pin conversation to top"}
                          >
                            <Pin className={`w-3 h-3 ${isPinned ? "fill-current" : ""}`} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* User Presence Footer */}
            <div className="p-3 border-t border-[#E8E2DD] bg-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className={`w-7 h-7 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-xs`}>
                    {currentUserNickname.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="relative flex h-2 w-2 absolute -bottom-0.5 -right-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-1 ring-white"></span>
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-[#242E29] truncate leading-tight">
                    {currentUserName} ({currentUserNickname})
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online &bull; {currentUserRole}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Area: Active Chat & Composer (8 Cols) */}
          <div className={`md:col-span-8 flex flex-col bg-white relative overflow-hidden ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>
            {/* Chat Top Header */}
            <div className="p-3.5 border-b border-[#E8E2DD] bg-[#FBF6F3]/40 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="md:hidden p-1.5 -ml-1 rounded-lg bg-[#518E6A]/15 text-[#3D5249] hover:bg-[#518E6A]/25 transition-colors flex items-center space-x-1 shrink-0"
                  title="Back to Channels"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#3D5249]" />
                  <span className="text-[10px] font-bold">Channels</span>
                </button>
                {activeChannel.isPrivate ? (
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <Hash className="w-4 h-4 text-[#466B53] shrink-0" />
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-[#242E29] leading-tight truncate">
                    {activeChannel.name}
                  </h3>
                  {activeChannel.description && (
                    <p className="text-[11px] text-[#65746C] truncate mt-0.5">
                      {activeChannel.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchingMessages(!isSearchingMessages);
                    if (isSearchingMessages) setSearchMessageQuery("");
                  }}
                  className={`px-2 py-1 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition-colors ${
                    isSearchingMessages
                      ? "bg-[#518E6A] text-white border-[#518E6A]"
                      : "bg-white text-[#65746C] border-[#E8E2DD] hover:text-[#242E29]"
                  }`}
                  title="Search / Backread messages"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Backread</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsChannelInfoOpen(!isChannelInfoOpen)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    isChannelInfoOpen
                      ? "bg-[#3D5249] text-white border-[#3D5249] shadow-xs"
                      : "bg-white text-[#65746C] border-[#E8E2DD] hover:text-[#242E29]"
                  }`}
                  title="Channel Details, Members & Shared Media"
                >
                  <Users className="w-3.5 h-3.5 text-[#518E6A]" />
                  <span>{activeChannel.membersCount} members</span>
                  <Sliders className="w-3 h-3 ml-0.5" />
                </button>




              </div>
            </div>

            {/* In-Conversation Search / Backread Bar */}
            {isSearchingMessages && (
              <div className="p-2.5 bg-[#FBF6F3] border-b border-[#E8E2DD] flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
                  <input
                    type="text"
                    placeholder={`Backread messages in #${activeChannel.name}...`}
                    value={searchMessageQuery}
                    onChange={(e) => setSearchMessageQuery(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 bg-white border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                    autoFocus
                  />
                  {searchMessageQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchMessageQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#65746C] hover:text-[#242E29]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {searchMessageQuery && (
                  <span className="text-[11px] text-[#65746C] shrink-0 font-medium">
                    {displayedMessages.length} match{displayedMessages.length === 1 ? "" : "es"}
                  </span>
                )}
              </div>
            )}

            {/* Top Pinned Message Banner */}
            {channelPinnedMsgs.length > 0 && (
              <div className="px-4 py-2 bg-[#FAF3EB] border-b border-[#E8E2DD] flex items-center justify-between text-xs text-[#242E29]">
                <div className="flex items-center space-x-2 truncate min-w-0">
                  <Pin className="w-3.5 h-3.5 text-[#518E6A] fill-[#518E6A] shrink-0" />
                  <span className="font-bold text-[#3D5249] shrink-0">Pinned ({channelPinnedMsgs.length}):</span>
                  <span className="truncate italic text-[#65746C]">
                    &ldquo;{channelPinnedMsgs[channelPinnedMsgs.length - 1].content}&rdquo;
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => togglePinMessage(channelPinnedMsgs[channelPinnedMsgs.length - 1].id)}
                  className="text-[10px] text-[#65746C] hover:text-rose-600 font-semibold shrink-0 ml-2"
                >
                  Unpin
                </button>
              </div>
            )}

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
                displayedMessages.map((msg) => {
                  const isCurrentUser = Boolean(
                    (currentUserId && (msg.senderId === currentUserId || msg.senderId?.toLowerCase() === currentUserId?.toLowerCase())) ||
                    (currentUserNickname && msg.senderNickname?.toLowerCase() === currentUserNickname?.toLowerCase()) ||
                    (currentUserName && msg.senderName?.toLowerCase() === currentUserName?.toLowerCase())
                  );
                  const isPinned = channelPinnedIds.includes(msg.id);

                  // Helper renderer for attachments
                  const renderAttachmentList = (alignRight: boolean) => (
                    <div className={`space-y-2 pt-1.5 max-w-sm sm:max-w-md ${alignRight ? "flex flex-col items-end" : "flex flex-col items-start"}`}>
                      {msg.attachments?.map((att) => (
                        <div key={att.id} className="w-full">
                          {att.type === "image" && (
                            <div className="rounded-xl border border-[#E8E2DD] overflow-hidden bg-white p-2 space-y-1.5 shadow-xs">
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

                          {att.type === "video" && (
                            <div className="rounded-xl border border-[#E8E2DD] overflow-hidden bg-black p-1 space-y-1 shadow-xs">
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

                          {att.type === "document" && (
                            <div className="flex items-center space-x-3 p-2.5 rounded-xl border border-[#E8E2DD] bg-white shadow-xs hover:border-[#518E6A]/50 transition-colors">
                              <div className="p-2 rounded-lg bg-[#466B53]/15 text-[#3D5249]">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
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

                          {att.type === "link" && (
                            <div className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-[#518E6A]/30 bg-[#EDFDF5] shadow-xs">
                              <Link2 className="w-4 h-4 text-[#38A169] shrink-0" />
                              <div className="flex-1 min-w-0 text-left">
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
                  );

                  // Helper renderer for reactions
                  const renderReactionList = (alignRight: boolean) => (
                    msg.reactions && msg.reactions.length > 0 && (
                      <div className={`flex items-center gap-1 flex-wrap pt-1 ${alignRight ? "justify-end" : "justify-start"}`}>
                        {msg.reactions.map((r, rIdx) => (
                          <button
                            key={rIdx}
                            type="button"
                            onClick={() => toggleMessageReaction(msg.id, r.emoji)}
                            className="px-2 py-0.5 rounded-full bg-white border border-[#E8E2DD] text-[11px] flex items-center gap-1 hover:border-[#518E6A] shadow-2xs transition-transform active:scale-95"
                            title={`Reacted by ${r.users.join(", ")}`}
                          >
                            <span>{r.emoji}</span>
                            <span className="font-bold text-[#3D5249]">{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )
                  );

                  // =========================================================================
                  // CURRENT USER BUBBLE (RIGHT-ALIGNED, GIM BRAND GREEN #466B53, WHITE TEXT)
                  // =========================================================================
                  if (isCurrentUser) {
                    return (
                      <div
                        key={msg.id}
                        onContextMenu={(e) => handleMessageContextMenu(msg, e)}
                        onTouchStart={(e) => handleMessageTouchStart(msg, e)}
                        onTouchEnd={handleMessageTouchEnd}
                        onTouchMove={handleMessageTouchEnd}
                        className={`group relative flex justify-end w-full py-1 px-1 sm:px-2 select-none ${
                          isPinned ? "bg-amber-50/50 rounded-2xl" : ""
                        }`}
                      >
                        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[70%]">
                          {/* Header: You • Timestamp • Pinned */}
                          <div className="flex items-center space-x-1.5 text-[10px] text-[#65746C] mb-1 pr-1">
                            <span className="font-semibold text-[#466B53]">You</span>
                            <span>•</span>
                            <span>{msg.timestamp}</span>
                            {isPinned && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-semibold ml-1">
                                <Pin className="w-2.5 h-2.5 fill-amber-700" /> Pinned
                              </span>
                            )}
                          </div>

                          {/* Replying quote if any */}
                          {msg.reply_to && (
                            <div className="p-2 mb-1.5 bg-[#466B53]/15 border-r-2 border-[#518E6A] rounded-lg text-[11px] text-[#3D5249] max-w-full text-right shadow-2xs">
                              <span className="font-semibold">@{msg.reply_to.senderName}:</span>{" "}
                              <span className="italic line-clamp-1">&ldquo;{msg.reply_to.content}&rdquo;</span>
                            </div>
                          )}

                          {/* Message Bubble + Floating Toolbar on LEFT */}
                          <div className="relative group/bubble inline-block">
                            <div className="text-[13px] sm:text-xs leading-relaxed whitespace-pre-wrap break-words bg-[#466B53] text-white px-4 py-2.5 rounded-2xl rounded-br-xs shadow-sm select-text font-normal">
                              {msg.content}
                            </div>

                            {/* Floating Toolbar on Left */}
                            <div className="absolute -top-3.5 left-1 opacity-0 group-hover:opacity-100 group-hover/bubble:opacity-100 transition-opacity flex items-center bg-white border border-[#E8E2DD] shadow-md rounded-full px-1.5 py-0.5 gap-0.5 z-20">
                              <button
                                type="button"
                                onClick={() => setShowEmojiPickerForMsg(showEmojiPickerForMsg === msg.id ? null : msg.id)}
                                className="p-1 rounded-full text-[#65746C] hover:text-[#242E29] hover:bg-black/5 transition-colors"
                                title="React with emoji"
                              >
                                <Smile className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setReplyingToMessage({
                                    senderName: msg.senderNickname || msg.senderName,
                                    content: msg.content,
                                  })
                                }
                                className="p-1 rounded-full text-[#65746C] hover:text-[#518E6A] hover:bg-black/5 transition-colors"
                                title="Reply in thread"
                              >
                                <CornerUpLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => togglePinMessage(msg.id)}
                                className={`p-1 rounded-full hover:bg-black/5 transition-colors ${
                                  isPinned ? "text-amber-600" : "text-[#65746C] hover:text-amber-600"
                                }`}
                                title={isPinned ? "Unpin message" : "Pin message"}
                              >
                                <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-amber-600" : ""}`} />
                              </button>
                            </div>

                            {/* Emoji Picker Popup */}
                            {showEmojiPickerForMsg === msg.id && (
                              <div className="absolute -top-11 right-0 flex items-center gap-1 bg-white border border-[#E8E2DD] rounded-xl p-1 shadow-lg z-30 animate-in fade-in">
                                {["👍", "❤️", "🙌", "🔥", "👀", "✅", "🚀", "🎉"].map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      toggleMessageReaction(msg.id, emoji);
                                      setShowEmojiPickerForMsg(null);
                                    }}
                                    className="p-1 text-sm hover:scale-125 transition-transform"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Attachments if any */}
                          {renderAttachmentList(true)}

                          {/* Reactions if any */}
                          {renderReactionList(true)}

                          {/* Delivery / Seen Receipts */}
                          <div className="flex items-center justify-end space-x-1 text-[10px] text-[#65746C] mt-1 mr-1">
                            {Object.keys(seenUsers).length > 0 ? (
                              <span className="inline-flex items-center space-x-1 text-[#466B53] font-medium">
                                <CheckCheck className="w-3 h-3 text-[#518E6A]" />
                                <span>Seen</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-[#65746C]">
                                <CheckCircle2 className="w-3 h-3 text-[#518E6A]" />
                                <span>Sent</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // =========================================================================
                  // OTHER USER / PERSON A BUBBLE (LEFT-ALIGNED, PURE WHITE, DARK CHARCOAL TEXT)
                  // =========================================================================
                  return (
                    <div
                      key={msg.id}
                      onContextMenu={(e) => handleMessageContextMenu(msg, e)}
                      onTouchStart={(e) => handleMessageTouchStart(msg, e)}
                      onTouchEnd={handleMessageTouchEnd}
                      onTouchMove={handleMessageTouchEnd}
                      className={`group relative flex justify-start items-start space-x-2.5 w-full py-1 px-1 sm:px-2 select-none ${
                        isPinned ? "bg-amber-50/50 rounded-2xl" : ""
                      }`}
                    >
                      {/* Avatar on Left */}
                      <div className={`w-8 h-8 rounded-full ${msg.senderAvatar || "bg-[#3D5249]"} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs mt-1`}>
                        {msg.senderNickname.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex flex-col items-start max-w-[85%] sm:max-w-[70%] min-w-0">
                        {/* Header: Sender Name, Nickname, Role, Timestamp */}
                        <div className="flex items-center space-x-2 flex-wrap text-xs leading-none mb-1 ml-1">
                          <span className="font-bold text-[#242E29]">{msg.senderName}</span>
                          <span className="text-[#466B53] font-semibold text-[11px]">({msg.senderNickname})</span>
                          {msg.isCoreAdmin && <Badge variant="dark">Core Admin</Badge>}
                          {msg.senderRole === "Owner" && <Badge variant="brand">Owner</Badge>}
                          <span className="text-[10px] text-[#65746C]">{msg.timestamp}</span>
                          {isPinned && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-semibold ml-1">
                              <Pin className="w-2.5 h-2.5 fill-amber-700" /> Pinned
                            </span>
                          )}
                        </div>

                        {/* Replying quote if any */}
                        {msg.reply_to && (
                          <div className="p-2 mb-1.5 bg-[#FBF6F3] border-l-2 border-[#518E6A] rounded-lg text-[11px] text-[#65746C] max-w-full text-left shadow-2xs">
                            <span className="font-semibold text-[#3D5249]">@{msg.reply_to.senderName}:</span>{" "}
                            <span className="italic line-clamp-1">&ldquo;{msg.reply_to.content}&rdquo;</span>
                          </div>
                        )}

                        {/* Message Bubble + Floating Toolbar on RIGHT */}
                        <div className="relative group/bubble inline-block">
                          <div className="text-[13px] sm:text-xs leading-relaxed whitespace-pre-wrap break-words bg-white text-[#242E29] border border-[#E8E2DD] px-4 py-2.5 rounded-2xl rounded-tl-xs shadow-xs select-text font-normal">
                            {msg.content}
                          </div>

                          {/* Floating Toolbar on Right */}
                          <div className="absolute -top-3.5 right-1 opacity-0 group-hover:opacity-100 group-hover/bubble:opacity-100 transition-opacity flex items-center bg-white border border-[#E8E2DD] shadow-md rounded-full px-1.5 py-0.5 gap-0.5 z-20">
                            <button
                              type="button"
                              onClick={() => setShowEmojiPickerForMsg(showEmojiPickerForMsg === msg.id ? null : msg.id)}
                              className="p-1 rounded-full text-[#65746C] hover:text-[#242E29] hover:bg-black/5 transition-colors"
                              title="React with emoji"
                            >
                              <Smile className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setReplyingToMessage({
                                  senderName: msg.senderNickname || msg.senderName,
                                  content: msg.content,
                                })
                              }
                              className="p-1 rounded-full text-[#65746C] hover:text-[#518E6A] hover:bg-black/5 transition-colors"
                              title="Reply in thread"
                            >
                              <CornerUpLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => togglePinMessage(msg.id)}
                              className={`p-1 rounded-full hover:bg-black/5 transition-colors ${
                                isPinned ? "text-amber-600" : "text-[#65746C] hover:text-amber-600"
                              }`}
                              title={isPinned ? "Unpin message" : "Pin message"}
                            >
                              <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-amber-600" : ""}`} />
                            </button>
                          </div>

                          {/* Emoji Picker Popup */}
                          {showEmojiPickerForMsg === msg.id && (
                            <div className="absolute -top-11 left-0 flex items-center gap-1 bg-white border border-[#E8E2DD] rounded-xl p-1 shadow-lg z-30 animate-in fade-in">
                              {["👍", "❤️", "🙌", "🔥", "👀", "✅", "🚀", "🎉"].map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    toggleMessageReaction(msg.id, emoji);
                                    setShowEmojiPickerForMsg(null);
                                  }}
                                  className="p-1 text-sm hover:scale-125 transition-transform"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Attachments if any */}
                        {renderAttachmentList(false)}

                        {/* Reactions if any */}
                        {renderReactionList(false)}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Bottom channel seen indicator if someone else is active in channel */}
              {false && (
                <div className="flex items-center justify-end space-x-1 text-[10px] text-[#65746C] pr-1 pt-1 italic">
                  <CheckCheck className="w-3.5 h-3.5 text-[#518E6A]" />
                  <span>Seen by {Object.values(seenUsers).map((u) => u.name).join(", ")}</span>
                </div>
              )}
            </div>

            {/* Message Composer & Attachment Bar */}
            <div className="p-3 border-t border-[#E8E2DD] bg-[#FBF6F3]/30 space-y-2">
              {/* Live Typing Indicator */}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex items-center space-x-1.5 text-[11px] text-[#466B53] font-medium animate-pulse px-1">
                  <span className="flex space-x-0.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#518E6A] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#518E6A] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#518E6A] animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                  <span>
                    {Object.values(typingUsers).map((u) => u.name).join(", ")}{" "}
                    {Object.keys(typingUsers).length === 1 ? "is" : "are"} typing...
                  </span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-2">
                {/* Replying Banner */}
                {replyingToMessage && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#518E6A]/10 border border-[#518E6A]/30 rounded-xl text-xs text-[#3D5249]">
                    <div className="flex items-center gap-1.5 truncate">
                      <CornerUpLeft className="w-3.5 h-3.5 text-[#518E6A] shrink-0" />
                      <span className="truncate">
                        Replying to <strong>@{replyingToMessage.senderName}</strong>: &ldquo;{replyingToMessage.content.slice(0, 70)}...&rdquo;
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyingToMessage(null)}
                      className="p-0.5 rounded text-[#3D5249] hover:bg-black/10 shrink-0 ml-2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    rows={2}
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
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


            {/* Messenger-style Conversation Details & Settings Drawer */}
            {isChannelInfoOpen && (
              <div className="absolute inset-y-0 right-0 w-full sm:w-80 bg-white border-l border-[#E8E2DD] shadow-2xl z-30 flex flex-col animate-in slide-in-from-right-10 duration-150">
                {/* Header */}
                <div className="p-3.5 border-b border-[#E8E2DD] flex items-center justify-between bg-[#FBF6F3]">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-[#518E6A]" />
                    <h4 className="font-bold text-xs text-[#242E29]">Conversation Details</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChannelInfoOpen(false)}
                    className="p-1 rounded text-[#65746C] hover:text-[#242E29]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtabs */}
                <div className="grid grid-cols-3 border-b border-[#E8E2DD] text-xs font-semibold text-center bg-white">
                  <button
                    type="button"
                    onClick={() => setInfoDrawerTab("members")}
                    className={`py-2 px-1 border-b-2 transition-colors ${
                      infoDrawerTab === "members"
                        ? "border-[#518E6A] text-[#3D5249] bg-[#FBF6F3]/50 font-bold"
                        : "border-transparent text-[#65746C] hover:text-[#242E29]"
                    }`}
                  >
                    Members ({activeChannel.membersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfoDrawerTab("media")}
                    className={`py-2 px-1 border-b-2 transition-colors ${
                      infoDrawerTab === "media"
                        ? "border-[#518E6A] text-[#3D5249] bg-[#FBF6F3]/50 font-bold"
                        : "border-transparent text-[#65746C] hover:text-[#242E29]"
                    }`}
                  >
                    Media ({channelAttachments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfoDrawerTab("search")}
                    className={`py-2 px-1 border-b-2 transition-colors ${
                      infoDrawerTab === "search"
                        ? "border-[#518E6A] text-[#3D5249] bg-[#FBF6F3]/50 font-bold"
                        : "border-transparent text-[#65746C] hover:text-[#242E29]"
                    }`}
                  >
                    Search
                  </button>
                </div>

                {/* Tab 1: Members */}
                {infoDrawerTab === "members" && (
                  <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
                    {/* Add Member control for Divine, Radz, RA */}
                    {isLeader && (
                      <div className="p-2.5 bg-[#FBF6F3] rounded-xl border border-[#E8E2DD] space-y-2">
                        <span className="text-[11px] font-bold text-[#3D5249] flex items-center gap-1">
                          <UserPlus className="w-3.5 h-3.5 text-[#518E6A]" />
                          <span>Add Member to Channel</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={addMemberSelectId}
                            onChange={(e) => setAddMemberSelectId(e.target.value)}
                            className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-[#E8E2DD] bg-white text-[#242E29]"
                          >
                            <option value="">Choose member...</option>
                            {AVAILABLE_TEAM_MEMBERS.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.role})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAddMemberToChannel(addMemberSelectId)}
                            disabled={!addMemberSelectId}
                            className="px-2.5 py-1.5 rounded-lg bg-[#518E6A] text-white text-xs font-semibold hover:bg-[#466B53] disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Members List */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#65746C]">
                        Active Channel Members ({activeChannel.membersCount})
                      </span>
                      {AVAILABLE_TEAM_MEMBERS.slice(0, activeChannel.membersCount || 4).map((m) => {
                        const isProtected = ["divine", "radz", "ra"].includes(m.id);
                        return (
                          <div
                            key={m.id}
                            className="p-2 rounded-xl border border-[#E8E2DD] flex items-center justify-between bg-white text-xs hover:border-[#518E6A]/50 transition-colors"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <div className="w-6 h-6 rounded-full bg-[#3D5249] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                {m.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <p className="font-semibold text-[#242E29] leading-tight truncate">{m.name}</p>
                                <p className="text-[10px] text-[#65746C] truncate">{m.role}</p>
                              </div>
                            </div>
                            {isLeader && !isProtected && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMemberFromChannel(m.id)}
                                className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 px-1.5 py-0.5 rounded hover:bg-rose-50 shrink-0 ml-1"
                                title="Remove from channel"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab 2: Shared Media & Files */}
                {infoDrawerTab === "media" && (
                  <div className="p-3.5 space-y-4 flex-1 overflow-y-auto">
                    {/* Images */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#65746C] flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-[#518E6A]" />
                        <span>Images ({channelImages.length})</span>
                      </span>
                      {channelImages.length === 0 ? (
                        <p className="text-[11px] text-[#65746C] italic">No images in this channel.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {channelImages.map((img) => (
                            <a
                              key={img.id}
                              href={img.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-[#E8E2DD] overflow-hidden group relative block bg-white"
                            >
                              <img src={img.url} alt={img.name} className="h-20 w-full object-cover" />
                              <div className="p-1 text-[9px] text-[#242E29] truncate bg-white">
                                {img.name}
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Files & Links */}
                    <div className="space-y-2 pt-2 border-t border-[#E8E2DD]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#65746C] flex items-center gap-1">
                        <Link2 className="w-3 h-3 text-blue-600" />
                        <span>Files & Links ({channelFilesAndLinks.length})</span>
                      </span>
                      {channelFilesAndLinks.length === 0 ? (
                        <p className="text-[11px] text-[#65746C] italic">No links or files shared yet.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {channelFilesAndLinks.map((f) => (
                            <a
                              key={f.id}
                              href={f.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg border border-[#E8E2DD] flex items-center justify-between text-xs hover:border-[#518E6A] bg-white group"
                            >
                              <span className="truncate font-medium text-[#242E29] group-hover:text-[#518E6A]">
                                {f.name}
                              </span>
                              <ExternalLink className="w-3 h-3 text-[#65746C] group-hover:text-[#518E6A] shrink-0 ml-1" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: Backread Search */}
                {infoDrawerTab === "search" && (
                  <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#65746C]" />
                      <input
                        type="text"
                        placeholder="Search conversation..."
                        value={searchMessageQuery}
                        onChange={(e) => setSearchMessageQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E8E2DD] bg-white text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                      />
                    </div>
                    {searchMessageQuery ? (
                      <p className="text-[11px] text-[#65746C]">
                        Found {displayedMessages.length} message{displayedMessages.length === 1 ? "" : "es"}
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#65746C] italic">
                        Type keywords above to backread messages, notes, and decisions in this channel.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

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
                      ? "e.g. Juvibolt Live Funnel Staging"
                      : "e.g. WRTS_Franchise_Automation_Audit.pdf"
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
                      ? "https://juviboltcybertech.com"
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

              {/* Add Members to Group Chat */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3D5249]">
                    Add Group Chat Members *
                  </label>
                  <span className="text-[10px] text-[#65746C]">
                    Only checked members will have access to this chat
                  </span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-xl">
                  {AVAILABLE_TEAM_MEMBERS.map((m) => {
                    const isChecked = selectedChannelMembers.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        onClick={() => {
                          setSelectedChannelMembers((prev) =>
                            prev.includes(m.id)
                              ? prev.filter((id) => id !== m.id)
                              : [...prev, m.id]
                          );
                        }}
                        className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isChecked
                            ? "bg-white border-[#518E6A] ring-1 ring-[#518E6A]"
                            : "bg-white/50 border-[#3D5249]/10 hover:border-[#3D5249]/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="text-[#518E6A] focus:ring-[#518E6A] rounded border-[#3D5249]/20"
                          />
                          <span className="font-semibold text-xs text-[#242E29]">
                            {m.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#65746C] font-mono">
                          {m.role}
                        </span>
                      </label>
                    );
                  })}
                </div>
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

      {/* Toast Notification when message text copied */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3D5249] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Message copied to clipboard!</span>
        </div>
      )}

      {/* Message Context Menu (Right Click on Desktop / Long Press on Phone) */}
      {contextMenuMsg && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-2xs flex sm:block items-end justify-center"
          onClick={() => setContextMenuMsg(null)}
        >
          {/* Mobile Bottom Action Sheet (sm:hidden) */}
          <div
            className="sm:hidden w-full bg-white rounded-t-2xl p-4 shadow-2xl border-t border-[#E8E2DD] space-y-3 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-[#E8E2DD] rounded-full mx-auto mb-2" />
            
            {/* Quick Emoji Reactions Row */}
            <div className="flex items-center justify-around bg-[#FBF6F3] p-2 rounded-xl">
              {["👍", "❤️", "🔥", "😂", "🚀", "✅", "👀", "🎉"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    toggleMessageReaction(contextMenuMsg.id, emoji);
                    setContextMenuMsg(null);
                  }}
                  className="p-1.5 text-lg active:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="divide-y divide-[#E8E2DD]/70 text-xs font-semibold text-[#242E29]">
              <button
                type="button"
                onClick={() => {
                  setReplyingToMessage({
                    senderName: contextMenuMsg.senderNickname || contextMenuMsg.senderName,
                    content: contextMenuMsg.content,
                  });
                  setContextMenuMsg(null);
                }}
                className="w-full flex items-center space-x-3 py-3 px-2 text-left active:bg-[#FBF6F3]"
              >
                <CornerUpLeft className="w-4 h-4 text-[#518E6A]" />
                <span>Reply in Thread</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setForwardMsg(contextMenuMsg);
                  setIsForwardModalOpen(true);
                  setContextMenuMsg(null);
                }}
                className="w-full flex items-center space-x-3 py-3 px-2 text-left active:bg-[#FBF6F3]"
              >
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Forward Message</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  togglePinMessage(contextMenuMsg.id);
                  setContextMenuMsg(null);
                }}
                className="w-full flex items-center space-x-3 py-3 px-2 text-left active:bg-[#FBF6F3]"
              >
                <Pin className="w-4 h-4 text-amber-500" />
                <span>Pin / Unpin Message</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyMessageText(contextMenuMsg.content)}
                className="w-full flex items-center space-x-3 py-3 px-2 text-left active:bg-[#FBF6F3]"
              >
                <Copy className="w-4 h-4 text-[#65746C]" />
                <span>Copy Message Text</span>
              </button>

              {/* Delete for Everyone: Available to Sender or Admin/Owner */}
              {(contextMenuMsg.senderId === currentUserId ||
                contextMenuMsg.senderNickname === currentUserNickname ||
                contextMenuMsg.senderName === currentUserName ||
                isLeader ||
                isCoreAdmin) && (
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(contextMenuMsg.id)}
                  className="w-full flex items-center space-x-3 py-3 px-2 text-left text-rose-600 active:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Delete for Everyone</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop Floating Context Menu (hidden sm:block) */}
          <div
            className="hidden sm:block absolute bg-white rounded-xl shadow-2xl border border-[#E8E2DD] p-1.5 w-56 z-50 animate-in zoom-in-95 duration-150"
            style={{
              top: Math.min(contextMenuPos?.y || 100, typeof window !== "undefined" ? window.innerHeight - 300 : 400),
              left: Math.min(contextMenuPos?.x || 100, typeof window !== "undefined" ? window.innerWidth - 250 : 600),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Reactions */}
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#E8E2DD]/70 mb-1">
              {["👍", "❤️", "🔥", "😂", "🚀", "✅"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    toggleMessageReaction(contextMenuMsg.id, emoji);
                    setContextMenuMsg(null);
                  }}
                  className="hover:scale-125 transition-transform text-sm p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="space-y-0.5 text-xs font-semibold text-[#242E29]">
              <button
                type="button"
                onClick={() => {
                  setReplyingToMessage({
                    senderName: contextMenuMsg.senderNickname || contextMenuMsg.senderName,
                    content: contextMenuMsg.content,
                  });
                  setContextMenuMsg(null);
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FBF6F3] text-left transition-colors"
              >
                <CornerUpLeft className="w-3.5 h-3.5 text-[#518E6A]" />
                <span>Reply</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setForwardMsg(contextMenuMsg);
                  setIsForwardModalOpen(true);
                  setContextMenuMsg(null);
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FBF6F3] text-left transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Forward Message</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  togglePinMessage(contextMenuMsg.id);
                  setContextMenuMsg(null);
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FBF6F3] text-left transition-colors"
              >
                <Pin className="w-3.5 h-3.5 text-amber-500" />
                <span>Pin Message</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyMessageText(contextMenuMsg.content)}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FBF6F3] text-left transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-[#65746C]" />
                <span>Copy Text</span>
              </button>

              {/* Delete for Everyone */}
              {(contextMenuMsg.senderId === currentUserId ||
                contextMenuMsg.senderNickname === currentUserNickname ||
                contextMenuMsg.senderName === currentUserName ||
                isLeader ||
                isCoreAdmin) && (
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(contextMenuMsg.id)}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 text-left transition-colors border-t border-[#E8E2DD]/60 pt-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete for Everyone</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forward Message Modal */}
      {isForwardModalOpen && forwardMsg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E2DD] shadow-2xl w-full max-w-md p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8E2DD] pb-3">
              <div className="flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-[#518E6A]" />
                <h4 className="font-bold text-sm text-[#242E29]">Forward Message</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForwardModalOpen(false);
                  setForwardMsg(null);
                }}
                className="text-[#65746C] hover:text-[#242E29]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#FBF6F3] border border-[#E8E2DD] text-xs text-[#242E29] max-h-28 overflow-y-auto italic">
              <span className="font-bold not-italic text-[#3D5249]">@{forwardMsg.senderNickname}:</span> &ldquo;{forwardMsg.content}&rdquo;
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#3D5249]">
                Select Destination Channel / Direct Message:
              </label>
              <div className="max-h-52 overflow-y-auto space-y-1 divide-y divide-[#E8E2DD]/60">
                {channels.map((chan) => (
                  <button
                    key={chan.id}
                    type="button"
                    onClick={() => handleExecuteForward(chan.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FBF6F3] text-left transition-colors text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {chan.type === "dm" ? (
                        <div className="w-5 h-5 rounded-full bg-[#466B53] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                          {chan.name.slice(0, 2).toUpperCase()}
                        </div>
                      ) : (
                        <Hash className="w-3.5 h-3.5 text-[#518E6A]" />
                      )}
                      <span className="font-bold text-[#242E29] truncate">{chan.name}</span>
                    </div>
                    <span className="text-[10px] text-[#518E6A] font-bold shrink-0">Send →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
