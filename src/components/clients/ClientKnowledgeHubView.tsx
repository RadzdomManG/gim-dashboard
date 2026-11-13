"use client";

import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  Link2,
  Video,
  Key,
  HelpCircle,
  Folder,
  ShieldCheck,
  Bot,
  Calendar,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Lock,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Globe,
  Clock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ClientProfile } from "@/components/clients/ClientPortfolioView";

interface ClientKnowledgeHubViewProps {
  client: ClientProfile;
  isCoreAdmin: boolean;
  currentUserNickname: string;
}

export function ClientKnowledgeHubView({
  client,
  isCoreAdmin,
  currentUserNickname,
}: ClientKnowledgeHubViewProps) {
  const [activeSection, setActiveSection] = useState<number>(1);
  const [copiedSection, setCopiedSection] = useState<number | null>(null);

  const handleCopySectionContext = (sectionNum: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionNum);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Section 01-13 Definitions based on Divine & RA's Nov 13 Blueprint
  const sections = [
    {
      num: 1,
      title: "Scope & Where to Start",
      icon: BookOpen,
      badge: "Onboarding",
      content: (
        <div className="space-y-3">
          <p className="text-xs text-[#242E29] leading-relaxed">
            {client.description}
          </p>
          <div className="p-3 rounded-xl bg-[#FBF6F3] border border-[#E8E2DD] space-y-2">
            <h5 className="font-bold text-xs text-[#3D5249]">Immediate Starting Points for Operations Managers</h5>
            <ul className="list-disc pl-4 text-xs text-[#65746C] space-y-1">
              <li>Review the latest weekly plan and call recording in Section 05.</li>
              <li>Check open gates and deliverable deadlines in Section 02.</li>
              <li>Always check Section 08 (Decision Log) before taking action to verify Aaron&apos;s latest decisions.</li>
              <li>All completed tasks must deposit proof in Section 13 (Evidence Register) to avoid AI hallucinations.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      num: 2,
      title: "Plans & Roadmap",
      icon: Calendar,
      badge: `${client.progress}% Complete`,
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Target Milestone</span>
              <p className="font-bold text-xs text-emerald-950 mt-0.5">{client.targetMilestone}</p>
            </div>
            <Badge variant="active">{client.currentSprint}</Badge>
          </div>
          <div className="divide-y divide-[#E8E2DD] border border-[#E8E2DD] rounded-xl overflow-hidden bg-white">
            {client.deliverables.map((del) => (
              <div key={del.code} className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#3D5249] bg-[#3D5249]/10 px-1.5 py-0.5 rounded text-[10px]">
                    {del.code}
                  </span>
                  <span className="font-semibold text-[#242E29]">{del.title}</span>
                </div>
                <Badge variant={del.status === "Completed" ? "active" : del.status === "In Review" ? "review" : "upcoming"}>
                  {del.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      num: 3,
      title: "Comms & Chat Directory",
      icon: MessageSquare,
      badge: "Channels",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#65746C]">Internal Team Chat</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#242E29]">#{client.code.toLowerCase().replace(/[^a-z0-9]/g, "-")}-ops</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">Mission Control</span>
            </div>
            <p className="text-[11px] text-[#65746C]">Real-time shift sync for assigned Operations Managers and Tech Leads.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#65746C]">Client Communication</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#242E29]">WhatsApp &amp; Direct Slack</span>
              <span className="text-[10px] text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded font-mono">Client Link</span>
            </div>
            <p className="text-[11px] text-[#65746C]">Direct comms managed by Divine &amp; {client.accountLead}. Key directives logged in Section 08.</p>
          </div>
        </div>
      ),
    },
    {
      num: 4,
      title: "Client Files & Assets (Drive)",
      icon: Folder,
      badge: "Google Drive",
      content: (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl border border-[#E8E2DD] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                GD
              </div>
              <div>
                <p className="font-bold text-[#242E29]">{client.name} — Master Operating Assets Folder</p>
                <p className="text-[10px] text-[#65746C]">Official brand logos, HTML templates, curriculum modules, and raw media</p>
              </div>
            </div>
            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#518E6A] hover:underline"
            >
              Open Drive <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ),
    },
    {
      num: 5,
      title: "Call Recordings & Transcripts",
      icon: Video,
      badge: "Fathom AI",
      content: (
        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl border border-[#E8E2DD] bg-white flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-[#518E6A] font-bold">Thursday 13 Nov 2026 &bull; 48 mins</span>
              <p className="font-bold text-[#242E29]">Automations Update &amp; Knowledge Hub Architecture Call</p>
              <p className="text-[10px] text-[#65746C]">Divine, RA, Kim, Radzdom &bull; Decoupled invoicing, agreed on Grok API ($20) and timezones.</p>
            </div>
            <a
              href="https://fathom.video/share/jVrinTC5xm8x1yqMBNhMxisEt527VF-d"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#518E6A] hover:underline shrink-0"
            >
              Watch Call <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ),
    },
    {
      num: 6,
      title: "Systems & Client Tech Stack",
      icon: Globe,
      badge: `${client.keyTechStack.length} Tools`,
      content: (
        <div className="space-y-3 text-xs">
          <p className="text-xs text-[#65746C]">Connected operational platforms used for live delivery:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {client.keyTechStack.map((tool) => (
              <div key={tool} className="p-2.5 rounded-xl border border-[#E8E2DD] bg-white font-semibold text-[#242E29] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#518E6A]" />
                <span className="truncate">{tool}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      num: 7,
      title: "Access Register (Secured Logins)",
      icon: Key,
      badge: "Air-Gapped",
      content: (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px]">
              Access register credentials are strictly isolated. Only assigned Operations Managers (<strong>{client.accountLead}</strong>, <strong>{client.specialist}</strong>) and Core Admins hold visibility.
            </p>
          </div>

          <div className="border border-[#E8E2DD] rounded-xl overflow-hidden divide-y divide-[#E8E2DD] bg-white">
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#242E29]">Client Production Portal &amp; Sub-Account</p>
                <p className="text-[10px] text-[#65746C]">Single Sign-On for {client.contactName}</p>
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                Active &bull; SSO Authenticated
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 8,
      title: "Decision & Risk Log",
      icon: ShieldCheck,
      badge: "Latest Directives",
      content: (
        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl border border-[#E8E2DD] bg-white space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#242E29]">Directive: Always Ground Operations on Section 13 Evidence</span>
              <span className="text-[10px] text-[#65746C] font-mono">13 Nov 2026</span>
            </div>
            <p className="text-[11px] text-[#65746C]">
              Confirmed by Divine Origines &bull; Never assume client requests without checking the latest WhatsApp/call decisions. Prevents bot and specialist hallucinations.
            </p>
          </div>
        </div>
      ),
    },
    {
      num: 9,
      title: "Open Questions & Client Blockers",
      icon: HelpCircle,
      badge: "Pending Input",
      content: (
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
            <span className="font-bold text-amber-950">Pending: Final Client Sign-off on Milestone</span>
            <p className="text-[11px] text-amber-900/80">
              Awaiting confirmation from {client.contactName} on delivery scope before releasing live traffic.
            </p>
          </div>
        </div>
      ),
    },
    {
      num: 10,
      title: "Briefs & Creative Specs",
      icon: FileText,
      badge: "Meta & SMM",
      content: (
        <div className="space-y-2 text-xs">
          <p className="text-[11px] text-[#65746C]">
            Active creative copy, ad campaigns, and social media schedules for Kim Besa and the marketing squad.
          </p>
          <div className="p-3 rounded-xl border border-[#E8E2DD] bg-white flex items-center justify-between">
            <span className="font-semibold text-[#242E29]">Meta Ads Creative Brief &bull; Sprint 4</span>
            <Badge variant="active">Production Ready</Badge>
          </div>
        </div>
      ),
    },
    {
      num: 11,
      title: "SOP Notes & Playbooks",
      icon: BookOpen,
      badge: "Playbooks",
      content: (
        <div className="space-y-2 text-xs">
          <p className="text-[11px] text-[#65746C]">Standard operating procedures verified for {client.name}:</p>
          <div className="p-3 rounded-xl border border-[#E8E2DD] bg-white flex items-center justify-between">
            <div>
              <p className="font-bold text-[#242E29]">Weekly Client Status Reporting SOP</p>
              <p className="text-[10px] text-[#65746C]">Standardized Friday EOD summary and milestone delivery check</p>
            </div>
            <span className="text-[10px] font-mono text-[#518E6A] font-bold">Standard #SOP-01</span>
          </div>
        </div>
      ),
    },
    {
      num: 12,
      title: `AI Assistant Blueprint (${client.aiBotName || "Agent"})`,
      icon: Bot,
      badge: "Grok x.ai",
      content: (
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-700" />
                Active Client Bot: {client.aiBotName || "Co-Pilot"}
              </span>
              <span className="text-[10px] font-mono bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-bold">
                x.ai Grok Grounded
              </span>
            </div>
            <p className="text-[11px] text-purple-900/80 leading-relaxed">
              When communicating with the co-pilot for <strong>{client.name}</strong>, the AI reads context directly from Sections 01 through 13. It references authentic decisions, timezones ({client.timezone}), and evidence without inventing claims.
            </p>
          </div>
        </div>
      ),
    },
    {
      num: 13,
      title: "Evidence Register (Zero Hallucination)",
      icon: ShieldCheck,
      badge: "Verified Proof",
      content: (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
            <span className="font-bold text-xs">Strict Zero-Hallucination Standard</span>
            <p className="text-[11px] text-emerald-900/80">
              Divine Origines Directive (@18:26): Every completed task, student enrollment, or client funnel milestone must archive raw evidence here (screenshots, Stripe invoice IDs, transaction hashes, live URL proofs) so the AI bot always speaks truth.
            </p>
          </div>

          <div className="divide-y divide-[#E8E2DD] border border-[#E8E2DD] rounded-xl overflow-hidden bg-white">
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#242E29]">Master Engagement Agreement &amp; Scope Statement</p>
                <p className="text-[10px] text-[#65746C]">Signed retainer contract and milestone schedule</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified Signed
              </span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#242E29]">Production Deployment &amp; QA Checkpoint Proof</p>
                <p className="text-[10px] text-[#65746C]">Automated dry run passes verified by Radzdom Gallego</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Gate Signed Off
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#3D5249] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-base text-white">
              {client.name} — Master Knowledge Hub &amp; Evidence Register
            </h3>
          </div>
          <p className="text-xs text-[#FBF6F3]/80 mt-1">
            Standardized 13-Section Operating Directory &bull; Primary ground truth for <strong>{client.aiBotName}</strong> (Grok AI) &amp; Operations Managers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="brand" className="bg-white/20 text-white border-white/30 text-[11px] font-mono">
            Timezone: {client.timezone} ({client.timezoneCity})
          </Badge>
          <Badge variant="active" className="text-[11px] font-mono">
            Bot: {client.aiBotName}
          </Badge>
        </div>
      </div>

      {/* 13-Section Accordion / Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Navigation Sidebar of Sections */}
        <div className="lg:col-span-4 space-y-1.5">
          {sections.map((sec) => {
            const isCurrent = sec.num === activeSection;
            const Icon = sec.icon;
            return (
              <button
                key={sec.num}
                onClick={() => setActiveSection(sec.num)}
                className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between border text-xs font-semibold ${
                  isCurrent
                    ? "bg-[#3D5249] text-white border-[#3D5249] shadow-xs"
                    : "bg-white text-[#242E29] border-[#E8E2DD] hover:bg-[#FBF6F3] hover:border-[#518E6A]/40"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                      isCurrent ? "bg-white/20 text-white" : "bg-[#3D5249]/10 text-[#3D5249]"
                    }`}
                  >
                    {sec.num.toString().padStart(2, "0")}
                  </span>
                  <span className="truncate">{sec.title}</span>
                </div>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                    isCurrent ? "bg-white/20 text-white" : "bg-[#FBF6F3] text-[#65746C] border border-[#E8E2DD]"
                  }`}
                >
                  {sec.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Section Content Card */}
        <div className="lg:col-span-8">
          {(() => {
            const current = sections.find((s) => s.num === activeSection) || sections[0];
            const CurrentIcon = current.icon;
            return (
              <Card className="h-full flex flex-col justify-between">
                <CardHeader className="p-4 border-b border-[#E8E2DD] bg-[#FBF6F3]/50 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#3D5249]/10 text-[#3D5249] flex items-center justify-center">
                      <CurrentIcon className="w-4 h-4 text-[#518E6A]" />
                    </div>
                    <div>
                      <CardTitle className="text-sm text-[#242E29]">
                        [{current.num.toString().padStart(2, "0")}] {current.title}
                      </CardTitle>
                      <CardDescription className="text-[11px] text-[#65746C]">
                        Verified ground truth for {client.name} &bull; Used by {client.aiBotName}
                      </CardDescription>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleCopySectionContext(
                        current.num,
                        `[GIM KNOWLEDGE HUB — SECTION ${current.num}: ${current.title}]\nClient: ${client.name}\nTimezone: ${client.timezone}\nAI Bot: ${client.aiBotName}\nActive Lead: ${client.accountLead}`
                      )
                    }
                    className="text-[10px] flex items-center gap-1 border-[#E8E2DD]"
                  >
                    {copiedSection === current.num ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Context
                      </>
                    )}
                  </Button>
                </CardHeader>

                <CardContent className="p-5 flex-1">{current.content}</CardContent>

                <div className="p-3 border-t border-[#E8E2DD] bg-[#FBF6F3]/40 flex items-center justify-between text-[11px] text-[#65746C]">
                  <span>Last synced with WhatsApp &amp; ClickUp by Claude</span>
                  <div className="flex items-center gap-1 text-[#3D5249] font-medium font-mono text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Grounded Evidence
                  </div>
                </div>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
