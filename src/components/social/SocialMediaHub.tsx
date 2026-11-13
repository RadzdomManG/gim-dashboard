"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Calendar,
  Clock,
  Sparkles,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Plus,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  Film,
  Image as ImageIcon,
  Check,
  ChevronRight,
  TrendingUp,
  Volume2,
  VolumeX,
  X,
  Play,
  Copy,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { sound } from "@/lib/audio";
import {
  SOCIAL_PLATFORMS,
  INITIAL_CLIENT_ACCOUNTS,
  SEED_SOCIAL_POSTS,
  SocialPost,
  ClientSocialAccount,
  generatePlatformCopy,
} from "@/lib/social/connectors";
import { SocialOAuthLoginModal } from "./SocialOAuthLoginModal";
import { AiSocialMediaAssistant } from "./AiSocialMediaAssistant";

interface SocialMediaHubProps {
  currentUserName?: string;
  currentUserNickname?: string;
  currentUserRole?: string;
  selectedClientId?: string;
  initialPostDraft?: {
    title?: string;
    description?: string;
    client?: string;
    taskId?: string;
  } | null;
  onClearInitialDraft?: () => void;
}

export function SocialMediaHub({
  currentUserName = "Radzdom Gallego",
  currentUserNickname = "Radz",
  currentUserRole = "Admin",
  selectedClientId = "we-rock-the-spectrum",
  initialPostDraft,
  onClearInitialDraft,
}: SocialMediaHubProps) {
  // Navigation sub-views: "composer" | "ai_assistant" | "queue" | "connectors" | "comments"
  const [activeSubView, setActiveSubView] = useState<"composer" | "ai_assistant" | "queue" | "connectors" | "comments">("composer");
  const [oauthModalPlatform, setOauthModalPlatform] = useState<"facebook" | "tiktok" | "linkedin" | "youtube" | null>(null);
  
  // Selected client for social media scope (WRTS, Juvibolt, Studio Nets, InVogue, Risewise, NoirLab, GIM Internal)
  const [activeClient, setActiveClient] = useState<string>(selectedClientId || "we-rock-the-spectrum");

  // Client accounts state
  const [clientAccounts, setClientAccounts] = useState<ClientSocialAccount[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gim_client_social_accounts");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_CLIENT_ACCOUNTS;
  });

  // Scheduled posts state
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gim_social_posts");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // fallback
        }
      }
    }
    return SEED_SOCIAL_POSTS;
  });

  // Composer Form State
  const [composerBrief, setComposerBrief] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<("facebook" | "tiktok" | "linkedin" | "youtube")[]>([
    "facebook",
    "tiktok",
  ]);
  const [adaptedCopies, setAdaptedCopies] = useState<{
    facebook?: string;
    tiktok?: string;
    linkedin?: string;
    youtube?: string;
  }>({});
  const [activePlatformTab, setActivePlatformTab] = useState<"facebook" | "tiktok" | "linkedin" | "youtube">("facebook");
  const [mediaType, setMediaType] = useState<"direct_upload" | "cloud_link" | "none">("cloud_link");
  const [cloudProvider, setCloudProvider] = useState<"canva" | "gdrive" | "dropbox">("canva");
  const [mediaUrl, setMediaUrl] = useState<string>("https://www.canva.com/design/example-creative");
  const [mediaName, setMediaName] = useState<string>("Canva: Social Post Graphic.png");
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [connectedModalPlatform, setConnectedModalPlatform] = useState<string | null>(null);

  // Sync initial draft from task conversion if provided
  useEffect(() => {
    if (initialPostDraft) {
      const briefText = `${initialPostDraft.title || ""}\n\n${initialPostDraft.description || ""}`.trim();
      setComposerBrief(briefText);
      if (initialPostDraft.client) {
        const matched = clientList.find(
          (c) => c.name.toLowerCase().includes(initialPostDraft.client!.toLowerCase()) ||
                 c.id.toLowerCase().includes(initialPostDraft.client!.toLowerCase())
        );
        if (matched) setActiveClient(matched.id);
      }
      setActiveSubView("composer");
      sound.playPop();
    }
  }, [initialPostDraft]);

  // Persist accounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gim_client_social_accounts", JSON.stringify(clientAccounts));
    }
  }, [clientAccounts]);

  // Persist posts
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gim_social_posts", JSON.stringify(posts));
    }
  }, [posts]);

  // 6 Active Clients + GIM Internal HQ
  const clientList = [
    { id: "we-rock-the-spectrum", name: "We Rock the Spectrum (WRTS)", code: "WRTS", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    { id: "juvibolt-cybertech", name: "Juvibolt Cybertech", code: "JB-CYBER", color: "bg-cyan-50 text-cyan-800 border-cyan-200" },
    { id: "studio-nets", name: "Studio Nets", code: "STUDIO", color: "bg-amber-50 text-amber-800 border-amber-200" },
    { id: "invogue-cleans", name: "InVogue Cleans", code: "INVOGUE", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
    { id: "risewise", name: "Risewise", code: "RISEWISE", color: "bg-teal-50 text-teal-800 border-teal-200" },
    { id: "noirlab", name: "NoirLab", code: "NOIRLAB", color: "bg-purple-50 text-purple-800 border-purple-200" },
    { id: "gim-internal", name: "Grace In Motion (Internal HQ)", code: "GIM-HQ", color: "bg-[#3D5249]/10 text-[#3D5249] border-[#3D5249]/20" },
  ];

  const currentClientData = clientList.find((c) => c.id === activeClient) || clientList[0];

  // Active accounts for this client
  const activeClientAccounts = clientAccounts.filter((a) => a.clientId === activeClient);

  // Toggle platform selection
  const handleTogglePlatform = (platform: "facebook" | "tiktok" | "linkedin" | "youtube") => {
    sound.playClick();
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((p) => p !== platform);
      }
      return [...prev, platform];
    });
  };

  // AI 1-Click Multi-Platform Copy Generation
  const handleGenerateAICopy = () => {
    if (!composerBrief.trim()) {
      sound.playPop();
      return;
    }
    sound.playClick();
    setIsGeneratingCopy(true);

    setTimeout(() => {
      const newAdapted: Record<string, string> = {};
      selectedPlatforms.forEach((p) => {
        newAdapted[p] = generatePlatformCopy(composerBrief, currentClientData.name, p);
      });
      setAdaptedCopies((prev) => ({ ...prev, ...newAdapted }));
      setIsGeneratingCopy(false);
      sound.playSuccessChime();
    }, 600);
  };

  // Schedule Post Action
  const handleSchedulePost = () => {
    if (!composerBrief.trim()) return;
    sound.playClick();
    setIsPublishing(true);

    setTimeout(() => {
      const newPost: SocialPost = {
        id: `post-${Date.now()}`,
        clientId: activeClient,
        clientName: currentClientData.name,
        authorName: currentUserName,
        authorNickname: currentUserNickname,
        platforms: selectedPlatforms,
        rawBrief: composerBrief,
        adaptedCopy: adaptedCopies,
        mediaType,
        mediaUrl: mediaType !== "none" ? mediaUrl : undefined,
        mediaName: mediaType !== "none" ? mediaName : undefined,
        cloudProvider: mediaType === "cloud_link" ? cloudProvider : undefined,
        scheduledFor: scheduledDate,
        status: "Scheduled",
        taskIdRef: initialPostDraft?.taskId,
        createdAt: new Date().toISOString(),
        commentsCount: 0,
      };

      setPosts((prev) => [newPost, ...prev]);
      setIsPublishing(false);
      setSuccessToast(`Post scheduled for ${currentClientData.name} on ${selectedPlatforms.join(", ")}!`);
      sound.playSuccessChime();

      // Reset composer
      setComposerBrief("");
      setAdaptedCopies({});
      if (onClearInitialDraft) onClearInitialDraft();

      setTimeout(() => {
        setSuccessToast(null);
        setActiveSubView("queue");
      }, 1800);
    }, 500);
  };

  // Publish Immediately Action
  const handlePublishNow = (postItem?: SocialPost) => {
    sound.playClick();
    if (postItem) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postItem.id ? { ...p, status: "Published" } : p))
      );
      sound.playSuccessChime();
      setSuccessToast(`Live broadcast sent to ${postItem.platforms.join(", ")}!`);
      setTimeout(() => setSuccessToast(null), 2500);
      return;
    }

    if (!composerBrief.trim()) return;
    const immediatePost: SocialPost = {
      id: `post-${Date.now()}`,
      clientId: activeClient,
      clientName: currentClientData.name,
      authorName: currentUserName,
      authorNickname: currentUserNickname,
      platforms: selectedPlatforms,
      rawBrief: composerBrief,
      adaptedCopy: adaptedCopies,
      mediaType,
      mediaUrl: mediaType !== "none" ? mediaUrl : undefined,
      mediaName: mediaType !== "none" ? mediaName : undefined,
      cloudProvider: mediaType === "cloud_link" ? cloudProvider : undefined,
      scheduledFor: new Date().toISOString(),
      status: "Published",
      taskIdRef: initialPostDraft?.taskId,
      createdAt: new Date().toISOString(),
      commentsCount: 0,
    };

    setPosts((prev) => [immediatePost, ...prev]);
    sound.playSuccessChime();
    setSuccessToast(`Published immediately to ${selectedPlatforms.join(", ")}!`);
    setComposerBrief("");
    setAdaptedCopies({});
    if (onClearInitialDraft) onClearInitialDraft();
    setTimeout(() => {
      setSuccessToast(null);
      setActiveSubView("queue");
    }, 1800);
  };

  // Toggle Connector Connection (Authentic OAuth Login Dialog)
  const handleToggleConnector = (platform: "facebook" | "tiktok" | "linkedin" | "youtube") => {
    sound.playClick();
    const existing = clientAccounts.find((a) => a.clientId === activeClient && a.platform === platform);
    
    if (existing && existing.isConnected) {
      // Disconnect
      setClientAccounts((prev) =>
        prev.map((a) =>
          a.clientId === activeClient && a.platform === platform
            ? { ...a, isConnected: false, accountHandle: "", accountName: "" }
            : a
        )
      );
      sound.playPop();
      setSuccessToast(`Disconnected ${platform.toUpperCase()} from ${currentClientData.name}.`);
      setTimeout(() => setSuccessToast(null), 2500);
    } else {
      // Open Official OAuth Login Dialog (Enter credentials, password, select page/channel)
      setOauthModalPlatform(platform);
    }
  };

  const handleOAuthSuccess = (data: {
    platform: "facebook" | "tiktok" | "linkedin" | "youtube";
    accountHandle: string;
    accountName: string;
    connectedBy: string;
    tokenExpires: string;
  }) => {
    setClientAccounts((prev) => {
      const without = prev.filter((a) => !(a.clientId === activeClient && a.platform === data.platform));
      return [
        ...without,
        {
          clientId: activeClient,
          clientName: currentClientData.name,
          platform: data.platform,
          isConnected: true,
          accountHandle: data.accountHandle,
          accountName: data.accountName,
          connectedAt: "Just now",
          connectedBy: data.connectedBy,
          tokenExpires: data.tokenExpires,
        },
      ];
    });
    setSuccessToast(`✓ Valid OAuth login verified for ${data.accountName} (${data.accountHandle})!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Filter posts by client
  const clientPosts = posts.filter((p) => p.clientId === activeClient);

  return (
    <div className="space-y-6">
      {/* SUCCESS TOAST NOTIFICATION */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#3D5249] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3 border border-white/20 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* TOP HEADER: TITLE, CLIENT SWITCHER & METRICS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#3D5249]/15 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#3D5249] text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-serif text-[#242E29] flex items-center gap-2">
                <span>Social Hub & Auto-Post</span>
                <span className="text-[10px] font-mono uppercase bg-[#518E6A]/15 text-[#3D5249] px-2 py-0.5 rounded-full border border-[#518E6A]/30">
                  v2.0
                </span>
              </h1>
              <p className="text-xs text-[#65746C] mt-0.5">
                Multi-Tenant OAuth Publishing & AI Copywriting for GIM Active Clients
              </p>
            </div>
          </div>
        </div>

        {/* Client Scope Dropdown Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-[#65746C] hidden md:inline">Client Scope:</span>
          <select
            value={activeClient}
            onChange={(e) => {
              setActiveClient(e.target.value);
              sound.playClick();
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#242E29] bg-[#FBF6F3] border border-[#3D5249]/20 focus:outline-none focus:ring-2 focus:ring-[#518E6A] cursor-pointer shadow-xs"
          >
            {clientList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setActiveSubView("composer");
              sound.playClick();
            }}
            className="btn-3d btn-3d-accent text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post</span>
          </Button>
        </div>
      </div>

      {/* SUB-VIEW NAVIGATION TABS */}
      <div className="flex items-center space-x-2 border-b border-[#E8E2DD] pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveSubView("composer");
            sound.playClick();
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeSubView === "composer"
              ? "bg-[#3D5249] text-white shadow-xs"
              : "text-[#65746C] hover:bg-[#FBF6F3] hover:text-[#242E29]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span>Post Composer</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubView("ai_assistant");
            sound.playClick();
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all btn-3d ${
            activeSubView === "ai_assistant"
              ? "bg-[#518E6A] text-white shadow-xs"
              : "text-[#3D5249] bg-[#518E6A]/10 hover:bg-[#518E6A]/20 border border-[#518E6A]/30"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>⚡ AI GDrive Campaign Autopilot</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubView("queue");
            sound.playClick();
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeSubView === "queue"
              ? "bg-[#3D5249] text-white shadow-xs"
              : "text-[#65746C] hover:bg-[#FBF6F3] hover:text-[#242E29]"
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-300" />
          <span>Scheduled Queue ({clientPosts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubView("connectors");
            sound.playClick();
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeSubView === "connectors"
              ? "bg-[#3D5249] text-white shadow-xs"
              : "text-[#65746C] hover:bg-[#FBF6F3] hover:text-[#242E29]"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-300" />
          <span>OAuth Connectors ({activeClientAccounts.filter((a) => a.isConnected).length}/4)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubView("comments");
            sound.playClick();
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeSubView === "comments"
              ? "bg-[#3D5249] text-white shadow-xs"
              : "text-[#65746C] hover:bg-[#FBF6F3] hover:text-[#242E29]"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-rose-300" />
          <span>Live Comments & AI Replies</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* AI GDRIVE CAMPAIGN AUTOPILOT SUB-VIEW                                     */}
      {/* ========================================================================= */}
      {activeSubView === "ai_assistant" && (
        <AiSocialMediaAssistant
          clientName={currentClientData.name}
          clientId={activeClient}
          currentUserName={currentUserName}
          currentUserNickname={currentUserNickname}
          onBatchScheduled={(newPosts) => {
            setPosts((prev) => [...newPosts, ...prev]);
            setSuccessToast(`✓ Scheduled ${newPosts.length} campaign posts for ${currentClientData.name}!`);
            setTimeout(() => {
              setSuccessToast(null);
              setActiveSubView("queue");
            }, 1800);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 1. POST COMPOSER & AI MULTI-PLATFORM COPYWRITER                           */}
      {/* ========================================================================= */}
      {activeSubView === "composer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Input Brief & Multi-Platform Checkboxes (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="card-3d border border-[#3D5249]/15 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-[#242E29] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#518E6A]" />
                    <span>Create Social Media Post</span>
                  </CardTitle>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentClientData.color}`}>
                    {currentClientData.name}
                  </span>
                </div>
                <CardDescription className="text-xs text-[#65746C]">
                  Draft one core idea or upload a design from Canva / Google Drive. Our AI automatically adapts it for Facebook, TikTok, LinkedIn, and YouTube.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* 1. Target Platforms Toggle Bar */}
                <div>
                  <label className="block text-xs font-bold text-[#242E29] mb-1.5">
                    Target Platforms (OAuth Enabled):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["facebook", "tiktok", "linkedin", "youtube"] as const).map((plat) => {
                      const cfg = SOCIAL_PLATFORMS[plat];
                      const isSelected = selectedPlatforms.includes(plat);
                      const acc = activeClientAccounts.find((a) => a.platform === plat);
                      const isConnected = acc?.isConnected;

                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => handleTogglePlatform(plat)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all btn-3d ${
                            isSelected
                              ? `${cfg.badgeBg} border-2 ring-1 ring-black/5`
                              : "bg-[#FBF6F3] border-[#E8E2DD] opacity-60 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-xs font-bold ${cfg.badgeText}`}>
                              {plat === "facebook" ? "Facebook" : plat === "tiktok" ? "TikTok" : plat === "linkedin" ? "LinkedIn" : "YouTube"}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#3D5249]" />}
                          </div>
                          <span className="text-[10px] text-[#65746C] truncate mt-1">
                            {isConnected ? acc?.accountHandle || "Connected" : "Not connected"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Raw Post Brief / Idea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#242E29]">
                      Core Post Brief or Announcement:
                    </label>
                    <span className="text-[10px] text-[#65746C]">
                      {composerBrief.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={composerBrief}
                    onChange={(e) => setComposerBrief(e.target.value)}
                    placeholder="Enter the main announcement, bullet points, client achievement, or promotion (e.g. Sensory Sunday Open Gym in Clovis, Juvibolt Cybertech Cohort 1 kickoff, or Studio Nets brand design showcase)..."
                    className="w-full text-xs p-3 rounded-xl border border-[#3D5249]/20 bg-[#FBF6F3] text-[#242E29] focus:outline-none focus:ring-2 focus:ring-[#518E6A] resize-none"
                  />

                  {/* 1-Click AI Adapt Button */}
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleGenerateAICopy}
                      disabled={isGeneratingCopy || !composerBrief.trim()}
                      className="btn-3d btn-3d-accent px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGeneratingCopy ? "Adapting Copy with AI..." : "⚡ 1-Click AI Copywriter (All Platforms)"}</span>
                    </button>

                    <span className="text-[10px] text-[#65746C] italic">
                      Matched to Camille's SMM Brand Voice
                    </span>
                  </div>
                </div>

                {/* 3. Media Upload / Cloud Link Attachment */}
                <div className="p-3 bg-[#FBF6F3] rounded-xl border border-[#E8E2DD] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#242E29] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#518E6A]" />
                      <span>Creative Asset & Media:</span>
                    </span>

                    {/* Media Type Tabs */}
                    <div className="flex items-center space-x-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setMediaType("cloud_link");
                          sound.playClick();
                        }}
                        className={`px-2 py-0.5 rounded-lg font-medium ${
                          mediaType === "cloud_link"
                            ? "bg-[#3D5249] text-white"
                            : "text-[#65746C] hover:text-[#242E29]"
                        }`}
                      >
                        Cloud Link (Canva/Drive)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaType("direct_upload");
                          sound.playClick();
                        }}
                        className={`px-2 py-0.5 rounded-lg font-medium ${
                          mediaType === "direct_upload"
                            ? "bg-[#3D5249] text-white"
                            : "text-[#65746C] hover:text-[#242E29]"
                        }`}
                      >
                        Direct Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaType("none");
                          sound.playClick();
                        }}
                        className={`px-2 py-0.5 rounded-lg font-medium ${
                          mediaType === "none"
                            ? "bg-[#3D5249] text-white"
                            : "text-[#65746C] hover:text-[#242E29]"
                        }`}
                      >
                        None (Text Only)
                      </button>
                    </div>
                  </div>

                  {mediaType === "cloud_link" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={cloudProvider}
                        onChange={(e) => setCloudProvider(e.target.value as any)}
                        className="text-xs p-1.5 rounded-lg border border-[#3D5249]/20 bg-white text-[#242E29]"
                      >
                        <option value="canva">🎨 Canva Design</option>
                        <option value="gdrive">📁 Google Drive</option>
                        <option value="dropbox">📦 Dropbox Folder</option>
                      </select>

                      <input
                        type="text"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="Paste Canva, Drive, or Dropbox URL..."
                        className="sm:col-span-2 text-xs p-1.5 rounded-lg border border-[#3D5249]/20 bg-white text-[#242E29]"
                      />
                    </div>
                  )}

                  {mediaType === "direct_upload" && (
                    <div className="border-2 border-dashed border-[#3D5249]/20 rounded-xl p-3 text-center bg-white/70">
                      <Upload className="w-5 h-5 text-[#518E6A] mx-auto mb-1" />
                      <p className="text-xs font-semibold text-[#242E29]">
                        Drag & drop images, video clips, or carousels
                      </p>
                      <p className="text-[10px] text-[#65746C]">
                        Supports MP4, MOV, PNG, JPG up to 100MB
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Scheduling Time & Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E8E2DD]">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#65746C]" />
                    <span className="text-xs font-medium text-[#242E29]">Schedule:</span>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="text-xs p-1.5 rounded-lg border border-[#3D5249]/20 bg-[#FBF6F3] text-[#242E29]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePublishNow()}
                      disabled={!composerBrief.trim()}
                      className="btn-3d btn-3d-secondary text-xs font-bold"
                    >
                      <span>Publish Now 🚀</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSchedulePost}
                      disabled={isPublishing || !composerBrief.trim()}
                      className="btn-3d btn-3d-primary text-xs font-bold"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      <span>{isPublishing ? "Saving..." : "Schedule Post"}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: AI Adapted Platform Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="card-3d border border-[#3D5249]/15 shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-[#242E29] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#518E6A]" />
                    <span>Live Platform Preview</span>
                  </CardTitle>
                  <span className="text-[10px] font-mono text-[#65746C]">
                    Camille's SMM Engine
                  </span>
                </div>
                {/* Platform Preview Selector Pills */}
                <div className="flex items-center space-x-1 pt-2 border-b border-[#E8E2DD] pb-2">
                  {selectedPlatforms.map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => {
                        setActivePlatformTab(plat);
                        sound.playClick();
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activePlatformTab === plat
                          ? "bg-[#3D5249] text-white shadow-2xs"
                          : "text-[#65746C] hover:bg-[#FBF6F3]"
                      }`}
                    >
                      {plat === "facebook" ? "Facebook" : plat === "tiktok" ? "TikTok" : plat === "linkedin" ? "LinkedIn" : "YouTube"}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between pt-2">
                {/* Simulated Platform Card */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#E8E2DD] shadow-xs space-y-2.5">
                  {/* Account Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-[#3D5249] text-white flex items-center justify-center font-bold text-xs">
                        {currentClientData.code.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#242E29] leading-none">
                          {currentClientData.name}
                        </p>
                        <p className="text-[10px] text-[#65746C] mt-0.5">
                          {activeClientAccounts.find((a) => a.platform === activePlatformTab)?.accountHandle || "@client_official"} • Just now
                        </p>
                      </div>
                    </div>
                    <Badge variant="neutral" className="text-[10px] font-bold uppercase">
                      {activePlatformTab}
                    </Badge>
                  </div>

                  {/* Copy Area */}
                  <div className="text-xs text-[#242E29] whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto pr-1">
                    {adaptedCopies[activePlatformTab] || (
                      <span className="text-[#65746C]/60 italic">
                        {composerBrief.trim()
                          ? "Click '1-Click AI Copywriter' to automatically generate tailored copy for this platform!"
                          : "Enter a brief on the left to see the AI tailored post preview..."}
                      </span>
                    )}
                  </div>

                  {/* Media Thumbnail Preview */}
                  {mediaType !== "none" && (
                    <div className="rounded-xl overflow-hidden border border-[#E8E2DD] bg-[#FBF6F3] p-2 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <ImageIcon className="w-4 h-4 text-[#518E6A] shrink-0" />
                        <span className="font-semibold text-[#242E29] truncate">
                          {mediaName}
                        </span>
                      </div>
                      {mediaType === "cloud_link" && (
                        <a
                          href={mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#518E6A] hover:underline flex items-center gap-0.5 shrink-0"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E2DD] flex items-center justify-between text-[11px] text-[#65746C]">
                  <span>Status: <strong>Ready to Publish</strong></span>
                  <span>OAuth: <strong>Token Valid</strong></span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SCHEDULED POSTS QUEUE & CALENDAR                                       */}
      {/* ========================================================================= */}
      {activeSubView === "queue" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#242E29] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#518E6A]" />
              <span>Scheduled Posts & Broadcast Pipeline ({clientPosts.length})</span>
            </h2>
            <span className="text-xs text-[#65746C]">
              Filtered by: <strong>{currentClientData.name}</strong>
            </span>
          </div>

          {clientPosts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#3D5249]/15">
              <Calendar className="w-8 h-8 text-[#65746C]/40 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#242E29]">No scheduled posts yet</p>
              <p className="text-xs text-[#65746C] mt-1">
                Use the Post Composer to schedule your first multi-platform broadcast for {currentClientData.name}!
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveSubView("composer")}
                className="btn-3d btn-3d-accent mt-4 text-xs font-bold"
              >
                Create First Post
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientPosts.map((post) => (
                <div
                  key={post.id}
                  className="card-3d p-4 rounded-2xl bg-white border border-[#3D5249]/15 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {post.platforms.map((p) => {
                          const cfg = SOCIAL_PLATFORMS[p];
                          return (
                            <span
                              key={p}
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${cfg.badgeBg} ${cfg.badgeText}`}
                            >
                              {p}
                            </span>
                          );
                        })}
                      </div>

                      <Badge
                        variant={post.status === "Published" ? "brand" : "review"}
                        className="text-[10px] font-bold"
                      >
                        {post.status}
                      </Badge>
                    </div>

                    <p className="text-xs font-semibold text-[#242E29] line-clamp-3">
                      {post.adaptedCopy?.facebook || post.adaptedCopy?.linkedin || post.rawBrief}
                    </p>

                    {post.mediaName && (
                      <div className="text-[10px] text-[#65746C] flex items-center gap-1 bg-[#FBF6F3] p-1.5 rounded-lg border border-[#E8E2DD] truncate">
                        <ImageIcon className="w-3 h-3 text-[#518E6A] shrink-0" />
                        <span className="truncate">{post.mediaName}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#E8E2DD] flex items-center justify-between text-[11px] text-[#65746C]">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#518E6A]" />
                      <span>{new Date(post.scheduledFor).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                    </div>

                    {post.status === "Scheduled" && (
                      <button
                        type="button"
                        onClick={() => handlePublishNow(post)}
                        className="btn-3d btn-3d-accent text-[10px] font-bold px-2 py-0.5 rounded-lg text-white"
                      >
                        Publish Now 🚀
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OAUTH CONNECTORS & APP STORE GRID                                      */}
      {/* ========================================================================= */}
      {activeSubView === "connectors" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#242E29] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#518E6A]" />
                <span>Client OAuth Connectors Vault</span>
              </h2>
              <p className="text-xs text-[#65746C]">
                Air-gapped authorization tokens for <strong>{currentClientData.name}</strong>. Connect official client channels.
              </p>
            </div>

            <span className="text-xs font-bold text-[#3D5249] bg-[#518E6A]/10 px-2.5 py-1 rounded-xl border border-[#518E6A]/20">
              {activeClientAccounts.filter((a) => a.isConnected).length} of 4 Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["facebook", "tiktok", "linkedin", "youtube"] as const).map((plat) => {
              const cfg = SOCIAL_PLATFORMS[plat];
              const acc = activeClientAccounts.find((a) => a.platform === plat);
              const isConnected = acc?.isConnected;

              return (
                <div
                  key={plat}
                  className="card-3d p-5 rounded-2xl bg-white border border-[#3D5249]/15 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                        style={{ backgroundColor: cfg.brandColor }}
                      >
                        {plat === "facebook" ? "f" : plat === "tiktok" ? "d" : plat === "linkedin" ? "in" : "yt"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#242E29]">{cfg.name}</h3>
                        <p className="text-[11px] text-[#65746C] mt-0.5">
                          {isConnected ? acc?.accountName : "No account connected for this client"}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={isConnected ? "brand" : "neutral"}
                      className="text-[10px] font-bold"
                    >
                      {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#65746C] leading-relaxed">
                    {cfg.description}
                  </p>

                  {/* Scopes and Details */}
                  <div className="p-2.5 bg-[#FBF6F3] rounded-xl border border-[#E8E2DD] text-[10px] space-y-1">
                    <div className="flex items-center justify-between text-[#242E29]">
                      <span className="font-semibold">Handle:</span>
                      <span className="font-mono">{isConnected ? acc?.accountHandle : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#65746C]">
                      <span>Authorized Scopes:</span>
                      <span className="font-mono truncate max-w-[200px]">{cfg.oauthScopes.join(", ")}</span>
                    </div>
                    {isConnected && (
                      <div className="flex items-center justify-between text-[#65746C]">
                        <span>Connected By:</span>
                        <span>{acc?.connectedBy || "SMM Lead"}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#65746C]">
                      {isConnected ? "Token: Valid & Active" : "OAuth 2.0 PKCE Ready"}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleConnector(plat)}
                      className={`btn-3d px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isConnected
                          ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                          : "btn-3d-accent text-white"
                      }`}
                    >
                      {isConnected ? "Disconnect" : "Connect via OAuth 2.0 🔗"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LIVE COMMENTS & 1-CLICK AI REPLIES                                     */}
      {/* ========================================================================= */}
      {activeSubView === "comments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#242E29] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#518E6A]" />
                <span>Live Audience Comments & 1-Click AI Replies</span>
              </h2>
              <p className="text-xs text-[#65746C]">
                Real-time comment engagement across Facebook, TikTok, LinkedIn, and YouTube for <strong>{currentClientData.name}</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {posts
              .filter((p) => p.clientId === activeClient && p.recentComments && p.recentComments.length > 0)
              .flatMap((p) => p.recentComments!)
              .map((comm) => (
                <div
                  key={comm.id}
                  className="card-3d p-4 rounded-2xl bg-white border border-[#3D5249]/15 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-[#518E6A]/20 text-[#3D5249] flex items-center justify-center font-bold text-xs">
                        {comm.author.slice(0, 1)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#242E29]">{comm.author}</p>
                        <p className="text-[10px] text-[#65746C]">
                          {comm.timestamp} on <span className="uppercase font-semibold">{comm.platform}</span>
                        </p>
                      </div>
                    </div>

                    <Badge variant="neutral" className="text-[10px]">
                      Verified User
                    </Badge>
                  </div>

                  <p className="text-xs text-[#242E29] bg-[#FBF6F3] p-2.5 rounded-xl border border-[#E8E2DD]">
                    "{comm.text}"
                  </p>

                  {comm.reply && (
                    <div className="pl-4 border-l-2 border-[#518E6A] space-y-1">
                      <p className="text-[11px] font-bold text-[#3D5249]">
                        Official Reply ({currentClientData.name}):
                      </p>
                      <p className="text-xs text-[#242E29] leading-relaxed">
                        {comm.reply}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSuccessChime();
                        setSuccessToast("AI reply sent to " + comm.author + "!");
                        setTimeout(() => setSuccessToast(null), 2000);
                      }}
                      className="btn-3d btn-3d-accent text-[11px] font-bold px-3 py-1 rounded-lg text-white flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{comm.reply ? "Update AI Reply" : "Generate 1-Click AI Reply"}</span>
                    </button>
                  </div>
                </div>
              ))}

            {posts.filter((p) => p.clientId === activeClient && p.recentComments && p.recentComments.length > 0).length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#3D5249]/15">
                <MessageSquare className="w-8 h-8 text-[#65746C]/40 mx-auto mb-2" />
                <p className="text-sm font-bold text-[#242E29]">All caught up!</p>
                <p className="text-xs text-[#65746C] mt-1">
                  No pending unanswered comments for {currentClientData.name}. All social inquiries are answered.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUTHENTIC OAUTH LOGIN DIALOG MODAL */}
      {oauthModalPlatform && (
        <SocialOAuthLoginModal
          isOpen={!!oauthModalPlatform}
          onClose={() => setOauthModalPlatform(null)}
          platform={oauthModalPlatform}
          clientName={currentClientData.name}
          clientId={activeClient}
          currentUserName={currentUserName}
          currentUserNickname={currentUserNickname}
          currentUserRole={currentUserRole}
          onSuccess={handleOAuthSuccess}
        />
      )}
    </div>
  );
}
