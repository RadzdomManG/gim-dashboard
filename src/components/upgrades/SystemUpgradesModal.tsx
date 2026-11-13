"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  X,
  Bot,
  LayoutGrid,
  ShieldCheck,
  MessageSquare,
  FileText,
  Sliders,
  CheckCircle2,
  Clock,
  KeyRound,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface SystemUpgradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCopilot?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function SystemUpgradesModal({
  isOpen,
  onClose,
  onOpenCopilot,
  onNavigateTab,
}: SystemUpgradesModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const upgrades = [
    {
      number: "01",
      title: "Personalized Internal AI Co-Pilot",
      category: "AI & Automation",
      badgeVariant: "brand" as const,
      desc: "Each member has an isolated AI Assistant on the bottom-right (e.g. Camille's Co-Pilot, Radz's Co-Pilot) strictly bounded to their assigned clients with zero cross-client data drift.",
      actionLabel: "Try Co-Pilot",
      icon: Bot,
    },
    {
      number: "02",
      title: "Natural Language Task Move Commands",
      category: "Task Ops",
      badgeVariant: "active" as const,
      desc: "Members can type 'Move task #[ID] to In Progress' into their Co-Pilot and receive an instant one-click confirmation button right inside the chat bubble.",
      actionLabel: "Open Tasks",
      icon: ArrowRight,
    },
    {
      number: "03",
      title: "1-Click Card Grid vs. Table View Switcher",
      category: "UI Polish",
      badgeVariant: "brand" as const,
      desc: "Easily switch between dense spreadsheet auditing (Table View) and modern 3-column interactive visual cards (Card Grid View) with zero horizontal text collision.",
      actionLabel: "View Backlog",
      icon: LayoutGrid,
    },
    {
      number: "04",
      title: "Scoped Task Creation (+ New Task)",
      category: "Client Isolation",
      badgeVariant: "brand" as const,
      desc: "When specialists click '+ New Task', their client organization is automatically pre-selected and the dropdown is strictly locked to their authorized accounts.",
      actionLabel: "Create Task",
      icon: CheckCircle2,
    },
    {
      number: "05",
      title: "Instant End of Shift (EOS) Generator",
      category: "Shift Tracking",
      badgeVariant: "active" as const,
      desc: "Click 'Draft today's End of Shift note' in Co-Pilot to automatically generate a formal GIM EOS report based on your real-time deliverables with one-click copy.",
      actionLabel: "Open Timesheets",
      icon: FileText,
    },
    {
      number: "06",
      title: "Messenger-Style Chat Bubble Alignment",
      category: "Messaging",
      badgeVariant: "brand" as const,
      desc: "Original sender is right-aligned in GIM Brand Green (#466B53) with white text; other team members are left-aligned in warm cream cards for instant speaker identification.",
      actionLabel: "Open Messaging",
      icon: MessageSquare,
    },
    {
      number: "07",
      title: "Client-Dedicated Messaging Channels",
      category: "Communication",
      badgeVariant: "brand" as const,
      desc: "Dedicated channels for every client (#wrts-automations, #juvibolt-cybertech, #studio-nets-ops, #risewise-growth, etc.) with automatic member routing.",
      actionLabel: "View Channels",
      icon: MessageSquare,
    },
    {
      number: "08",
      title: "Active Deliverables First (Zero Backlog Overwhelm)",
      category: "Performance",
      badgeVariant: "active" as const,
      desc: "Defaults to active work (To Do, In Progress, For Review), shielding specialists from over 1,200 archived ClickUp tasks while keeping search instantaneous.",
      actionLabel: "Inspect Tasks",
      icon: Clock,
    },
    {
      number: "09",
      title: "Executive Admin Governance Dashboard",
      category: "Admin RBAC",
      badgeVariant: "dark" as const,
      desc: "Top executive stats strip (3 Core Admins, 12 Specialists, 4 Client Portals, 100% Zero-Leak) with live toggle switches for Goal visibility and Financial rate locks.",
      actionLabel: "Open Governance",
      icon: Sliders,
    },
    {
      number: "10",
      title: "Full Roster Authenticity & Zero Hardcoded Lag",
      category: "Data Integrity",
      badgeVariant: "brand" as const,
      desc: "All 20 authentic personnel have guaranteed credentials with dynamic Date.now() comparisons, eliminating false overdue warnings.",
      actionLabel: "Team Directory",
      icon: KeyRound,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E8E2DD] max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#2D3D36] bg-[#3D5249] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 p-1 flex items-center justify-center">
              <Image
                src="/gim-mark-white.png"
                alt="GIM"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight leading-none">
                  Top 10 High-Impact Upgrades
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#518E6A] text-white font-mono font-bold">
                  v2.4 Live
                </span>
              </div>
              <p className="text-[11px] text-[#FBF6F3]/70 mt-0.5">
                Grace in Motion Mission Control — Feature Release Notes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Upgrades Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3 bg-[#FBF6F3]/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upgrades.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.number}
                  className="p-4 rounded-2xl bg-white border border-[#3D5249]/15 shadow-2xs hover:border-[#518E6A] hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#466B53]/10 text-[#3D5249]">
                          #{item.number}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#65746C]">
                          {item.category}
                        </span>
                      </div>
                      <Badge variant={item.badgeVariant} className="text-[9px]">
                        Active
                      </Badge>
                    </div>

                    <h4 className="font-bold text-xs text-[#242E29] flex items-center gap-1.5">
                      <IconComp className="w-3.5 h-3.5 text-[#518E6A] shrink-0" />
                      <span>{item.title}</span>
                    </h4>

                    <p className="text-[11px] text-[#65746C] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E8E2DD]/70 flex items-center justify-between">
                    <span className="text-[10px] text-[#466B53] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#518E6A]" /> Verified in Prod
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (item.number === "01" && onOpenCopilot) {
                          onOpenCopilot();
                        } else if (onNavigateTab) {
                          if (item.number === "02" || item.number === "03" || item.number === "04" || item.number === "08") {
                            onNavigateTab("tasks");
                          } else if (item.number === "05") {
                            onNavigateTab("timesheet");
                          } else if (item.number === "06" || item.number === "07") {
                            onNavigateTab("messaging");
                          } else if (item.number === "09" || item.number === "10") {
                            onNavigateTab("team");
                          }
                        }
                      }}
                      className="text-[11px] font-bold text-[#518E6A] hover:text-[#3D5249] flex items-center gap-1"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E8E2DD] bg-white flex items-center justify-between shrink-0">
          <span className="text-xs text-[#65746C]">
            All 10 upgrades pushed to GitHub <code className="text-[#3D5249] font-mono text-[11px]">origin/main</code>
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="bg-[#3D5249] hover:bg-[#2D3D36] text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
