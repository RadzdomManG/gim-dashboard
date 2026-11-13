"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Target,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  Clock,
  Building2,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userRole: string;
  clientScope?: string;
}

export function WelcomeOnboardingModal({
  isOpen,
  onClose,
  userName,
  userRole,
  clientScope = "all",
}: WelcomeOnboardingModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasAgreed, setHasAgreed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPage(1);
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPages = 4;

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem("gim_onboarding_accepted", "true");
      }
      onClose();
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#242E29]/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E8E2DD] max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#3D5249]/15 bg-[#3D5249] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 relative shrink-0 flex items-center justify-center bg-white/10 rounded-lg p-1">
              <Image
                src="/gim-mark-white.png"
                alt="GIM"
                width={26}
                height={26}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight leading-none">
                Grace in Motion (GIM)
              </h2>
              <p className="text-[11px] text-[#FBF6F3]/70 mt-0.5">
                Team Onboarding & Operating Principles
              </p>
            </div>
          </div>

          {/* Step Pill */}
          <div className="flex items-center space-x-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold text-[#FBF6F3]">
            <span>Step {currentPage} of {totalPages}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E8E2DD] h-1.5 overflow-hidden">
          <div
            className="bg-[#518E6A] h-1.5 transition-all duration-300 ease-out"
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          ></div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-[#242E29]">
          {/* ========================================================================= */}
          {/* PAGE 1: WELCOMING & BRAND ETHOS */}
          {/* ========================================================================= */}
          {currentPage === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-lg mx-auto space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-[#466B53]/10 text-[#466B53] mb-1">
                  <Sparkles className="w-7 h-7 text-[#518E6A]" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-[#242E29]">
                  Welcome to GIM, {userName}!
                </h3>
                <p className="text-xs text-[#65746C] leading-relaxed">
                  You are entering the central mission control for Grace in Motion — our unified digital engineering, franchise automation, and operational delivery agency.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-[#FBF6F3] border border-[#E8E2DD] space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#518E6A]/15 text-[#518E6A] flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#242E29]">Bespoke Craft</h4>
                  <p className="text-[11px] text-[#65746C] leading-normal">
                    We deliver high-end, purpose-built systems. No generic cookie-cutter setups.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FBF6F3] border border-[#E8E2DD] space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#466B53]/15 text-[#466B53] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#242E29]">Zero Data Leaks</h4>
                  <p className="text-[11px] text-[#65746C] leading-normal">
                    Strict client isolation. Tasks and assets for one client never cross into another.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FBF6F3] border border-[#E8E2DD] space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-[#3D5249]/15 text-[#3D5249] flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-[#242E29]">Shift Integrity</h4>
                  <p className="text-[11px] text-[#65746C] leading-normal">
                    Transparent attendance, live shift hours tracking, and mandatory End of Shift (EOS) notes.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#466B53]/10 border border-[#466B53]/25 flex items-start space-x-3 text-xs text-[#3D5249]">
                <ShieldCheck className="w-5 h-5 text-[#518E6A] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>One Unified Workspace:</strong> We eliminated the need to log in and out of different ClickUp workspaces and separate Slack windows. Everything you need to work, communicate, and deliver is inside this single dashboard.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAGE 2: TEAM FLOW & LEADERSHIP STRUCTURE */}
          {/* ========================================================================= */}
          {currentPage === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#242E29] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#518E6A]" />
                  <span>Team Structure & Leadership Flow</span>
                </h3>
                <p className="text-xs text-[#65746C]">
                  Clear lines of accountability across strategy, technical automations, and client execution.
                </p>
              </div>

              {/* Chart Hierarchy */}
              <div className="space-y-2.5">
                {/* Executive / Owner */}
                <div className="p-3.5 rounded-2xl bg-[#3D5249] text-white flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center font-bold text-xs">
                      DO
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Divine Origines</span>
                        <Badge variant="brand" className="text-[9px] bg-[#518E6A] text-white border-0">Owner</Badge>
                      </h4>
                      <p className="text-[10px] text-white/70">Founder & Strategy Lead · Overall Scope, Priority & Revenue Architecture</p>
                    </div>
                  </div>
                </div>

                {/* Core Admins */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-[#FBF6F3] border border-[#518E6A]/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#466B53] text-white flex items-center justify-center font-bold text-[10px]">
                          RG
                        </div>
                        <span className="font-bold text-xs text-[#242E29]">Radzdom Gallego (Radz)</span>
                      </div>
                      <Badge variant="brand" className="text-[9px]">Chief Automation Architect</Badge>
                    </div>
                    <p className="text-[10px] text-[#65746C] pl-9">
                      Chief Automation Architect, Platform Systems & Workflow Engineering Lead
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FBF6F3] border border-[#518E6A]/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#518E6A] text-white flex items-center justify-center font-bold text-[10px]">
                          RA
                        </div>
                        <span className="font-bold text-xs text-[#242E29]">Ma. Rose Anne (RA) Malinao</span>
                      </div>
                      <Badge variant="brand" className="text-[9px]">Core Admin</Badge>
                    </div>
                    <p className="text-[10px] text-[#65746C] pl-9">
                      Commercial Operations, Client Retainers, Invoicing & Contractor Audits
                    </p>
                  </div>
                </div>

                {/* Delivery Specialists & POs */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#E8E2DD] space-y-2">
                  <div className="text-[10px] font-bold text-[#65746C] uppercase tracking-wider">
                    Delivery Squad & Client Specialists
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-[#FBF6F3] border border-[#E8E2DD] flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">
                        EM
                      </div>
                      <div>
                        <div className="font-bold text-[11px] text-[#242E29]">Erwin Manaog</div>
                        <div className="text-[10px] text-[#65746C]">Project Owner · WRTS & Studio Nets</div>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#FBF6F3] border border-[#E8E2DD] flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-[#3D5249] text-white flex items-center justify-center font-bold text-[9px]">
                        KB
                      </div>
                      <div>
                        <div className="font-bold text-[11px] text-[#242E29]">Kimberly Besa</div>
                        <div className="text-[10px] text-[#65746C]">Operations Assistant · Juvibolt &amp; InVogue</div>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#FBF6F3] border border-[#E8E2DD] flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[9px]">
                        BR
                      </div>
                      <div>
                        <div className="font-bold text-[11px] text-[#242E29]">BJ Ricafrente</div>
                        <div className="text-[10px] text-[#65746C]">Operations Specialist · Tool Onboarding & Kickoffs</div>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#FBF6F3] border border-[#E8E2DD] flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[9px]">
                        JF
                      </div>
                      <div>
                        <div className="font-bold text-[11px] text-[#242E29]">Joy Fabular & Jedy Caillio</div>
                        <div className="text-[10px] text-[#65746C]">Operations & Creative Design Assistants</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAGE 3: OPERATING GUIDELINES & SHIFT INTEGRITY */}
          {/* ========================================================================= */}
          {currentPage === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#242E29] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#518E6A]" />
                  <span>Operating Protocol & Shift Discipline</span>
                </h3>
                <p className="text-xs text-[#65746C]">
                  Standards all team members must follow to maintain agency velocity and transparency.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#FBF6F3] border border-[#E8E2DD] flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-[#518E6A]/15 text-[#518E6A] flex items-center justify-center font-bold shrink-0 mt-0.5 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#242E29]">Live Shift Tracking & Attendance</h4>
                    <p className="text-[11px] text-[#65746C] mt-0.5 leading-relaxed">
                      Clock in at the start of your shift. Switch status to <strong>On Break</strong> when stepping away to ensure break limits are respected. Admins can adjust times with a recorded audit footprint.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FBF6F3] border border-[#E8E2DD] flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-[#518E6A]/15 text-[#518E6A] flex items-center justify-center font-bold shrink-0 mt-0.5 text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#242E29]">End of Shift (EOS) Reporting</h4>
                    <p className="text-[11px] text-[#65746C] mt-0.5 leading-relaxed">
                      Before clocking out, submit your daily EOS note detailing: (1) Tasks completed today, (2) Blockers encountered, and (3) Priorities for your next shift. Once published, EOS notes cannot be edited.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FBF6F3] border border-[#E8E2DD] flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-[#518E6A]/15 text-[#518E6A] flex items-center justify-center font-bold shrink-0 mt-0.5 text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#242E29]">Communication in Designated Channels</h4>
                    <p className="text-[11px] text-[#65746C] mt-0.5 leading-relaxed">
                      Discuss client-related topics in that client&apos;s channel (e.g. <code>#wrts-automations</code>). All files and discussions are permanent and backreadable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAGE 4: ACTIVE CLIENT GOALS & ACCEPTANCE */}
          {/* ========================================================================= */}
          {currentPage === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#242E29] flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#518E6A]" />
                  <span>Q4 Active Client Deliverables & Targets</span>
                </h3>
                <p className="text-xs text-[#65746C]">
                  {clientScope && clientScope !== "all"
                    ? `Key commitments and milestones for your assigned account (${clientScope}):`
                    : "Key commitments we are currently delivering across our active client accounts:"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs max-h-[280px] overflow-y-auto pr-1">
                {[
                  {
                    name: "We Rock the Spectrum (WRTS)",
                    scopeKey: "We Rock the Spectrum",
                    badge: "21 Automations",
                    badgeVariant: "brand" as const,
                    desc: "Sensory gym franchise workflows, GHL funnel triggers, n8n webhook sync, and SMS routing.",
                  },
                  {
                    name: "Juvibolt Cybertech",
                    scopeKey: "Juvibolt",
                    badge: "GHL Sub-Account",
                    badgeVariant: "brand" as const,
                    desc: "Sub-account mg57RFEKUm6nvnSadv2D setup, WordPress LMS integration, and student onboarding.",
                  },
                  {
                    name: "Risewise",
                    scopeKey: "Risewise",
                    badge: "Client Ops",
                    badgeVariant: "active" as const,
                    desc: "Multi-channel funnel automation, appointment routing, and executive pipeline tracking.",
                  },
                  {
                    name: "NoirLab",
                    scopeKey: "NoirLab",
                    badge: "Digital Growth",
                    badgeVariant: "active" as const,
                    desc: "Brand digital strategy, web asset builds, and client acquisition workflow setup.",
                  },
                  {
                    name: "Studio Nets",
                    scopeKey: "Studio Nets",
                    badge: "Design Ops",
                    badgeVariant: "active" as const,
                    desc: "Figma design review systems, client handoff checklists, and sprint delivery.",
                  },
                  {
                    name: "InVogue Cleans",
                    scopeKey: "InVogue",
                    badge: "Growth Engine",
                    badgeVariant: "upcoming" as const,
                    desc: "Lead retention CRM, cleaner SMS alerts, and subscription portals.",
                  },
                  {
                    name: "Aaron Ofosu Bootcamp",
                    scopeKey: "Aaron Ofosu",
                    badge: "Athlete Funnel",
                    badgeVariant: "upcoming" as const,
                    desc: "Fitness pipeline automations, Stripe memberships, and onboarding sequences.",
                  },
                  {
                    name: "Tch2Thrive",
                    scopeKey: "Tch2Thrive",
                    badge: "Portal Delivery",
                    badgeVariant: "active" as const,
                    desc: "Education portal hosting, client onboarding pipelines, and session management.",
                  },
                ]
                  .filter((cg) => {
                    if (!clientScope || clientScope === "all") return true;
                    return clientScope.toLowerCase().includes(cg.scopeKey.toLowerCase());
                  })
                  .map((clientGoal) => (
                    <div
                      key={clientGoal.name}
                      className="p-3.5 rounded-2xl bg-[#FBF6F3] border border-[#E8E2DD] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#242E29]">{clientGoal.name}</span>
                        <Badge variant={clientGoal.badgeVariant} className="text-[9px]">
                          {clientGoal.badge}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#65746C] leading-relaxed">
                        {clientGoal.desc}
                      </p>
                    </div>
                  ))}
              </div>

              {/* Agreement Checkbox */}
              <div className="p-4 rounded-2xl bg-[#518E6A]/10 border border-[#518E6A]/25 space-y-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAgreed}
                    onChange={(e) => setHasAgreed(e.target.checked)}
                    className="w-4 h-4 rounded mt-0.5 text-[#518E6A] focus:ring-[#518E6A]"
                  />
                  <span className="text-xs font-semibold text-[#242E29]">
                    I have reviewed the GIM Operating System guidelines, team leadership roles, and agree to uphold shift integrity and delivery quality.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-[#E8E2DD] bg-[#FBF6F3] flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBack}
            disabled={currentPage === 1}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Button>

          <div className="flex items-center space-x-2">
            {currentPage < totalPages ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="flex items-center space-x-1"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                disabled={!hasAgreed}
                className="flex items-center space-x-1 bg-[#466B53] hover:bg-[#3D5249]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept & Enter Mission Control</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
