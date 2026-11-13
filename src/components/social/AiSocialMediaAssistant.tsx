"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  FolderOpen,
  Film,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { sound } from "@/lib/audio";
import { SocialPost, SOCIAL_PLATFORMS } from "@/lib/social/connectors";

interface AiSocialMediaAssistantProps {
  clientName: string;
  clientId: string;
  currentUserName: string;
  currentUserNickname: string;
  onBatchScheduled: (posts: SocialPost[]) => void;
}

interface ParsedDayItem {
  dayIndex: number;
  dayLabel: string;
  topic: string;
  driveLink?: string;
  mediaName?: string;
  caption: string;
  scheduledDate: string;
  platforms: ("facebook" | "tiktok" | "linkedin" | "youtube")[];
  adaptedCopies: {
    facebook?: string;
    tiktok?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export function AiSocialMediaAssistant({
  clientName,
  clientId,
  currentUserName,
  currentUserNickname,
  onBatchScheduled,
}: AiSocialMediaAssistantProps) {
  const [promptInput, setPromptInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [parsedDays, setParsedDays] = useState<ParsedDayItem[]>([]);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [previewPlatform, setPreviewPlatform] = useState<"facebook" | "tiktok" | "linkedin" | "youtube">("facebook");
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  // Example Prompt Presets
  const examplePrompts = [
    {
      title: "📁 3-Day GDrive Batch (WRTS Sensory Gym)",
      text: `Hey Camille! Here's our Google Drive folder: https://drive.google.com/drive/folders/wrts-sensory-campaign-nov with Day 1, Day 2, Day 3 assets and captions. 

Day 1: Sensory zip-line video. Caption: Ever wonder why kids love our sensory zip lines? They build core stability and vestibular regulation! Tag a parent who needs to see this. #sensorygym #wrtsclovis
Day 2: Quiet room photo carousel. Caption: Looking for a gentle, calming space? Our sensory rooms are equipped with fiber-optic lighting and weighted blankets.
Day 3: CVRC authorization reminder. Caption: Reminder to Clovis families: CVRC authorizations cover weekly open gym play! DM our front desk to verify your child's authorization today.

Schedule this on Facebook and TikTok every 2 days starting tomorrow at 10 AM!`,
    },
    {
      title: "🛡️ 3-Day Cyber Campaign (Juvibolt)",
      text: `Hey, here is our Google Drive asset folder https://drive.google.com/drive/folders/juvibolt-cohort1-launch. 

Day 1: What is a SOC Analyst? Caption: If you love investigating alerts and stopping hackers, SOC tier 1 is the highest-demand cyber role in 2027.
Day 2: 3 certifications you actually need. Caption: Stop collecting random certificates. Master AWS Cloud Security, CompTIA Security+, and hands-on SIEM triage.
Day 3: Student spotlight from barista to security engineer. Caption: Mark transitioned into cyber in 6 months with Juvibolt's real breach labs.

Post on LinkedIn and YouTube Shorts starting Monday!`,
    },
    {
      title: "🎨 3-Day Brand Design (Studio Nets)",
      text: `Here is our Google Drive design pack: https://drive.google.com/drive/folders/studionets-identity-deck
Day 1: Before and after brand typography reveal. Caption: Minimalist font hierarchy increased our client's CTR by 42%. Good design is good business.
Day 2: WCAG AAA Color contrast rules. Caption: Accessibility isn't an afterthought. Here is how we ensure every button passes contrast audits.
Day 3: PO onboarding wireframes. Caption: 48-hour turnarounds on high-converting client landing pages.

Schedule this on Facebook and LinkedIn!`,
    },
  ];

  const handleRunAiAssistant = async () => {
    if (!promptInput.trim()) {
      sound.playPop();
      return;
    }
    sound.playClick();
    setIsParsing(true);
    setScheduledSuccess(false);

    try {
      const res = await fetch("/api/social/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          clientName,
          defaultPlatforms: ["facebook", "tiktok"],
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.parsedDays)) {
        setParsedDays(data.parsedDays);
        setResponseMessage(data.replyMessage);
        if (data.parsedDays.length > 0) {
          setExpandedDay(data.parsedDays[0].dayIndex);
          setPreviewPlatform(data.parsedDays[0].platforms[0] || "facebook");
        }
        sound.playSuccessChime();
      } else {
        setResponseMessage("Could not parse campaign. Please check the prompt format.");
        sound.playPop();
      }
    } catch {
      setResponseMessage("Network error contacting AI agent. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleApproveAndScheduleAll = () => {
    if (parsedDays.length === 0) return;
    sound.playClick();

    const createdPosts: SocialPost[] = parsedDays.map((day) => ({
      id: `post-ai-${Date.now()}-${day.dayIndex}`,
      clientId,
      clientName,
      authorName: currentUserName,
      authorNickname: currentUserNickname,
      platforms: day.platforms,
      rawBrief: `${day.topic}\n\n${day.caption}`,
      adaptedCopy: day.adaptedCopies,
      mediaType: day.driveLink ? "cloud_link" : "none",
      mediaUrl: day.driveLink,
      mediaName: day.mediaName || `GDrive Asset - ${day.dayLabel}`,
      cloudProvider: "gdrive",
      scheduledFor: day.scheduledDate,
      status: "Scheduled",
      createdAt: new Date().toISOString(),
      commentsCount: 0,
    }));

    onBatchScheduled(createdPosts);
    sound.playSuccessChime();
    setScheduledSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <Card className="card-3d border border-[#3D5249]/15 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-[#242E29] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#518E6A]" />
              <span>AI Social Media Campaign Assistant & GDrive Autopilot</span>
            </CardTitle>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#518E6A]/15 text-[#3D5249] border border-[#518E6A]/30">
              Camille's SMM LLM Engine
            </span>
          </div>
          <CardDescription className="text-xs text-[#65746C]">
            Paste your Google Drive folders, Day 1 / Day 2 / Day 3 creative assets, or multi-day captions. Our AI will automatically parse the schedule, format copy per platform, and stage the posts for 1-click scheduling.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-bold text-[#242E29] block mb-1.5">
              Quick Test Templates (Click to populate):
            </span>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPromptInput(ex.text);
                    sound.playClick();
                  }}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#FBF6F3] text-[#3D5249] border border-[#E8E2DD] hover:border-[#518E6A] hover:bg-white transition-all btn-3d"
                >
                  {ex.title}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#242E29]">
                Campaign Brief, Google Drive Link & Multi-Day Captions:
              </label>
              <span className="text-[10px] text-[#65746C]">
                {promptInput.length} characters
              </span>
            </div>
            <textarea
              rows={6}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Hey! Here is my Google Drive folder https://drive.google.com/... with Day 1, Day 2, Day 3 assets and their captions. I want you to schedule it for Facebook, TikTok, LinkedIn, and YouTube..."
              className="w-full text-xs p-3.5 rounded-xl border border-[#3D5249]/20 bg-[#FBF6F3] text-[#242E29] focus:outline-none focus:ring-2 focus:ring-[#518E6A] leading-relaxed resize-none"
            />
          </div>

          {/* Action Trigger Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#65746C] italic">
              Target Client: <strong>{clientName}</strong>
            </span>

            <button
              type="button"
              onClick={handleRunAiAssistant}
              disabled={isParsing || !promptInput.trim()}
              className="btn-3d btn-3d-accent px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isParsing ? "Analyzing Campaign & GDrive Assets..." : "⚡ Parse & Stage Social Campaign with AI"}</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* PARSED CAMPAIGN STAGING & VERIFICATION RESULTS                             */}
      {/* ========================================================================= */}
      {parsedDays.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#3D5249]/15 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-[#242E29] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#518E6A]" />
                <span>AI Campaign Staged: {parsedDays.length} Scheduled Broadcasts</span>
              </h3>
              <p className="text-xs text-[#65746C] mt-0.5">
                {responseMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={handleApproveAndScheduleAll}
              disabled={scheduledSuccess}
              className={`btn-3d px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm ${
                scheduledSuccess
                  ? "bg-emerald-600 cursor-default"
                  : "btn-3d-primary"
              }`}
            >
              <Check className="w-4 h-4 text-emerald-300" />
              <span>{scheduledSuccess ? "✓ Scheduled into Live Queue!" : `Approve & Schedule All ${parsedDays.length} Posts 🚀`}</span>
            </button>
          </div>

          {/* Staged Days Accordion / Cards List */}
          <div className="space-y-3">
            {parsedDays.map((day) => {
              const isExpanded = expandedDay === day.dayIndex;

              return (
                <div
                  key={day.dayIndex}
                  className="card-3d bg-white rounded-2xl border border-[#3D5249]/15 shadow-xs overflow-hidden"
                >
                  {/* Card Header Strip */}
                  <div
                    onClick={() => {
                      setExpandedDay(isExpanded ? null : day.dayIndex);
                      sound.playPop();
                    }}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FBF6F3]/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-[#3D5249] text-white flex items-center justify-center font-bold text-xs">
                        {day.dayLabel}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#242E29]">{day.topic}</h4>
                        <div className="flex items-center space-x-2 text-[10px] text-[#65746C] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#518E6A]" />
                            {new Date(day.scheduledDate).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#518E6A] font-semibold">
                            <FolderOpen className="w-3 h-3" />
                            {day.mediaName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {day.platforms.map((p) => {
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

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#65746C]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#65746C]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content with Platform Tabs */}
                  {isExpanded && (
                    <div className="p-4 border-t border-[#E8E2DD] bg-[#FBF6F3]/40 space-y-3">
                      {/* GDrive Link Pill */}
                      {day.driveLink && (
                        <div className="p-2.5 bg-white rounded-xl border border-[#E8E2DD] flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2 truncate">
                            <FolderOpen className="w-4 h-4 text-[#518E6A] shrink-0" />
                            <span className="font-semibold text-[#242E29] truncate">
                              Asset: {day.mediaName}
                            </span>
                          </div>
                          <a
                            href={day.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#518E6A] font-bold hover:underline flex items-center gap-1 shrink-0"
                          >
                            <span>Open Drive Folder</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Platform Preview Pills */}
                      <div>
                        <div className="flex items-center space-x-1 pb-2">
                          {day.platforms.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                setPreviewPlatform(p);
                                sound.playClick();
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                previewPlatform === p
                                  ? "bg-[#3D5249] text-white shadow-xs"
                                  : "text-[#65746C] hover:bg-white"
                              }`}
                            >
                              {p === "facebook" ? "Facebook" : p === "tiktok" ? "TikTok" : p === "linkedin" ? "LinkedIn" : "YouTube"}
                            </button>
                          ))}
                        </div>

                        {/* Copy Box */}
                        <div className="p-3 bg-white rounded-xl border border-[#E8E2DD] text-xs text-[#242E29] leading-relaxed whitespace-pre-wrap">
                          {day.adaptedCopies[previewPlatform] || day.caption}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
