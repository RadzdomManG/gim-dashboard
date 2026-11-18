"use client";

import React, { useState } from "react";
import {
  FileText,
  Lock,
  Globe,
  Folder,
  ChevronDown,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ShieldAlert,
} from "lucide-react";

interface HierarchyKnowledgeHubViewProps {
  isExecutive?: boolean;
  currentUserName?: string;
  currentUserNickname?: string;
}

export function HierarchyKnowledgeHubView({
  isExecutive = false,
  currentUserName = "Team Member",
  currentUserNickname = "User",
}: HierarchyKnowledgeHubViewProps) {
  const [selectedPageId, setSelectedPageId] = useState<string>("scope-of-work");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    assets: true,
    playbook: true,
    onboarding_clients: true,
    onboarding: true,
    internal_processes: true,
  });
  const [copiedLink, setCopiedLink] = useState(false);

  // Strict executive isolation guard: Only Divine Origines and RA Malinao (plus Radz Admin)
  if (!isExecutive) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FBF6F3] text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[#242E29]">
          Executive Access Restricted
        </h3>
        <p className="text-xs text-[#65746C] max-w-md mt-1.5 leading-relaxed">
          The GIM Knowledge Hub and internal standard operating procedures are strictly confidential and restricted to Divine Origines and RA Malinao.
        </p>
        <span className="mt-4 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-[11px] font-mono text-[#65746C]">
          Logged in as: {currentUserName} ({currentUserNickname})
        </span>
      </div>
    );
  }

  const toggleFolder = (key: string) => {
    setExpandedFolders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Top Banner */}
      <div className="bg-[#6B46C1] text-white px-4 py-2 text-xs flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-200" />
          <span className="font-semibold">This Doc is shared to the web.</span>
          <span className="text-purple-200 text-[11px] hidden sm:inline">
            Executive Leadership Access Verified &bull; Grace In Motion Operations
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold transition-colors"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedLink ? "Link Copied" : "Share Link"}</span>
        </button>
      </div>

      {/* Main Dual-Pane Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Doc Navigation Tree */}
        <aside className="w-72 border-r border-[#E8E2DD] bg-[#FAF8F6] flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3.5 border-b border-[#E8E2DD] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 rounded bg-[#3D5249] text-white">
                <FileText className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-xs text-[#242E29] uppercase tracking-wider truncate">
                Knowledge Hub
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#3D5249]/10 text-[#3D5249]">
              Executive
            </span>
          </div>

          <div className="p-2 space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#65746C] px-2 py-1 block">
              Pages
            </span>

            {/* Scope of Work */}
            <button
              type="button"
              onClick={() => setSelectedPageId("scope-of-work")}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                selectedPageId === "scope-of-work"
                  ? "bg-[#D97706]/15 text-[#92400E] font-bold border border-[#D97706]/30 shadow-2xs"
                  : "text-[#242E29] hover:bg-black/5"
              }`}
            >
              <span className="text-amber-600">⭐</span>
              <span className="truncate">Scope of Work</span>
            </button>

            {/* Assets & Log-in details */}
            <div>
              <div
                onClick={() => toggleFolder("assets")}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[#242E29] hover:bg-black/5 cursor-pointer font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  {expandedFolders.assets ? (
                    <ChevronDown className="w-3 h-3 text-[#65746C]" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-[#65746C]" />
                  )}
                  <Folder className="w-3.5 h-3.5 text-amber-500" />
                  <span className="truncate">Assets & Log-in details</span>
                </div>
              </div>
              {expandedFolders.assets && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPageId("tool-tracker")}
                    className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left transition-colors ${
                      selectedPageId === "tool-tracker"
                        ? "bg-[#3D5249] text-white font-semibold"
                        : "text-[#65746C] hover:bg-black/5 hover:text-[#242E29]"
                    }`}
                  >
                    <Globe className="w-3 h-3 text-sky-500" />
                    <span className="truncate">Tool Tracker</span>
                  </button>
                </div>
              )}
            </div>

            {/* Implementation Playbook */}
            <div>
              <div
                onClick={() => toggleFolder("playbook")}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[#242E29] hover:bg-black/5 cursor-pointer font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  {expandedFolders.playbook ? (
                    <ChevronDown className="w-3 h-3 text-[#65746C]" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-[#65746C]" />
                  )}
                  <Folder className="w-3.5 h-3.5 text-rose-500" />
                  <span className="truncate">Implementation Playbook</span>
                </div>
              </div>
              {expandedFolders.playbook && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  {[
                    { id: "playbook-phase-1", label: "Phase 1: Preparation" },
                    { id: "playbook-phase-2", label: "Phase 2: Process Documentation" },
                    { id: "playbook-phase-3", label: "Phase 3: Planning" },
                    { id: "playbook-phase-4", label: "Phase 4: Action" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPageId(p.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left transition-colors ${
                        selectedPageId === p.id
                          ? "bg-[#3D5249] text-white font-semibold"
                          : "text-[#65746C] hover:bg-black/5 hover:text-[#242E29]"
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span className="truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Onboarding Clients */}
            <div>
              <div
                onClick={() => toggleFolder("onboarding_clients")}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[#242E29] hover:bg-black/5 cursor-pointer font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  {expandedFolders.onboarding_clients ? (
                    <ChevronDown className="w-3 h-3 text-[#65746C]" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-[#65746C]" />
                  )}
                  <Folder className="w-3.5 h-3.5 text-blue-500" />
                  <span className="truncate">Onboarding Clients</span>
                </div>
              </div>
              {expandedFolders.onboarding_clients && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  {[
                    { id: "onb-step-1", label: "Step 1: Discovery Call & Alignment", dot: "bg-slate-400" },
                    { id: "onb-step-2", label: "Step 2: Proposal, Agreement & Onboarding", dot: "bg-emerald-500" },
                    { id: "onb-step-3", label: "Step 3: Strategy Session & 90-Day Plan", dot: "bg-amber-500" },
                    { id: "onb-step-4", label: "Step 4: Implementation & Team Execution", dot: "bg-sky-500" },
                    { id: "onb-step-5", label: "Step 5: Ongoing Optimization & Reporting", dot: "bg-purple-500" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedPageId(s.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left transition-colors ${
                        selectedPageId === s.id
                          ? "bg-[#3D5249] text-white font-semibold"
                          : "text-[#65746C] hover:bg-black/5 hover:text-[#242E29]"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                      <span className="truncate">{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Onboarding (Operations & Marketing) */}
            <div>
              <div
                onClick={() => toggleFolder("onboarding")}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[#242E29] hover:bg-black/5 cursor-pointer font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  {expandedFolders.onboarding ? (
                    <ChevronDown className="w-3 h-3 text-[#65746C]" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-[#65746C]" />
                  )}
                  <Folder className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="truncate">Onboarding</span>
                </div>
              </div>
              {expandedFolders.onboarding && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  {[
                    { id: "onb-ops", label: "Operations" },
                    { id: "onb-marketing", label: "Marketing" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPageId(item.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left transition-colors ${
                        selectedPageId === item.id
                          ? "bg-[#3D5249] text-white font-semibold"
                          : "text-[#65746C] hover:bg-black/5 hover:text-[#242E29]"
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* GIM Internal Processes */}
            <div>
              <div
                onClick={() => toggleFolder("internal_processes")}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[#242E29] hover:bg-black/5 cursor-pointer font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  {expandedFolders.internal_processes ? (
                    <ChevronDown className="w-3 h-3 text-[#65746C]" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-[#65746C]" />
                  )}
                  <Folder className="w-3.5 h-3.5 text-teal-600" />
                  <span className="truncate">GIM Internal Processes</span>
                </div>
              </div>
              {expandedFolders.internal_processes && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  {[
                    { id: "sop-team", label: "Team & Performance" },
                    { id: "sop-google-admin", label: "Google Admin - User Provisioning" },
                    { id: "sop-ghl-staff", label: "GHL - Adding a New Staff User SOP" },
                    { id: "sop-clickup-newhire", label: "CLICKUP NEW HIRE SOP" },
                    { id: "sop-eod-template", label: "GIM VA End-of-Day (EOD) Template" },
                    { id: "sop-google-calendar", label: "How to Delegate Google Calendar" },
                    { id: "sop-calendly", label: "How to Set Up Calendly" },
                    { id: "sop-ghl-2sync", label: "GHL - 2sync Calendar" },
                  ].map((sop) => (
                    <button
                      key={sop.id}
                      type="button"
                      onClick={() => setSelectedPageId(sop.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left transition-colors ${
                        selectedPageId === sop.id
                          ? "bg-[#3D5249] text-white font-semibold"
                          : "text-[#65746C] hover:bg-black/5 hover:text-[#242E29]"
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span className="truncate">{sop.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-4xl font-sans">
          {/* Scope of Work */}
          {selectedPageId === "scope-of-work" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#EBF5FB] border border-[#BCE2F5] text-xs text-[#1B4F72] leading-relaxed flex items-start gap-3 shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#2980B9] shrink-0 mt-0.5" />
                <p>
                  Scope of work document establishing execution agreements, deliverable specifications, milestones, and review cadences across Grace In Motion client operations.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-[#242E29]">Overview</h2>
                <div className="p-3 rounded-xl bg-[#FEF9E7] border border-[#FAD7A0] text-xs text-[#7D6608] flex items-center gap-2">
                  <span>👉</span>
                  <span className="font-medium">Summary of key project properties and operational contacts.</span>
                </div>

                <div className="border border-[#E8E2DD] rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="w-1/3 p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72]">⭐ Client</td>
                        <td className="p-3 font-bold text-[#242E29] bg-white">Divine Origines</td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72]">⭐ Role/Services</td>
                        <td className="p-3 text-[#242E29] bg-white">Fractional COO & Systems Architecture</td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72]">👤 Client Contact</td>
                        <td className="p-3 text-[#518E6A] font-semibold bg-white">info@divineorigines.com</td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72]">👤 Project Manager</td>
                        <td className="p-3 font-semibold text-[#242E29] bg-white">Erwin Manaog</td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72]">📝 Description</td>
                        <td className="p-3 text-[#242E29] bg-white">Executive operations management, automation systems, and client delivery oversight.</td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72]">📅 Target Start Date</td>
                        <td className="p-3 text-[#242E29] bg-white font-mono">Jan 6, 2025</td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72]">📅 Target End Date</td>
                        <td className="p-3 text-[#242E29] bg-white font-mono">Ongoing / Retainer</td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72]">💲 Overall Budget</td>
                        <td className="p-3 text-[#242E29] bg-white">Retainer & Sprints</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72] align-top">🔗 Key Resources</td>
                        <td className="p-3 text-[#242E29] bg-white">
                          <ul className="space-y-1 text-xs text-[#518E6A]">
                            <li>&bull; [Signed Service Agreement]</li>
                            <li>&bull; [ClickUp Master Roadmap]</li>
                            <li>&bull; [Client Change Request Log]</li>
                            <li>&bull; [Feedback Register]</li>
                            <li>&bull; [SOP Documentation Vault]</li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h2 className="text-xl font-bold text-[#242E29]">Background & Goals</h2>
                <div className="p-4 rounded-xl bg-white border border-[#E8E2DD] space-y-2 text-xs text-[#242E29] leading-relaxed">
                  <p>
                    Grace In Motion standardizes operating architectures, builds reliable automation pipelines, and enforces accountable delivery gates across active clients.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tool Tracker */}
          {selectedPageId === "tool-tracker" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#242E29]">Tool Tracker</h2>
              <div className="border border-[#E8E2DD] rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F6] text-[#3D5249] uppercase font-bold text-[10px] border-b border-[#E8E2DD]">
                    <tr>
                      <th className="p-3">Platform</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Owner</th>
                      <th className="p-3">Access Level</th>
                      <th className="p-3">Security & 2FA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2DD] bg-white">
                    {[
                      { name: "ClickUp", cat: "Project Management", admin: "Divine Origines", access: "Workspace Admin", sec: "Enforced 2FA" },
                      { name: "GoHighLevel (GHL)", cat: "CRM & Automations", admin: "Radzdom Gallego", access: "Agency Admin", sec: "Enforced 2FA" },
                      { name: "Supabase", cat: "Production Database", admin: "Radzdom Gallego", access: "Owner / Full DB", sec: "RLS Policies" },
                      { name: "Google Workspace", cat: "Email & Storage", admin: "Divine Origines", access: "Super Admin", sec: "Enforced 2FA" },
                      { name: "Calendly", cat: "Client Scheduling", admin: "RA Malinao", access: "Org Admin", sec: "Google SSO" },
                      { name: "n8n Self-Hosted", cat: "Workflow Automation", admin: "Radzdom Gallego", access: "Admin / Cloud", sec: "API Tokens" },
                      { name: "Stripe", cat: "Billing & Subscriptions", admin: "Divine Origines", access: "Owner", sec: "Hardware 2FA" },
                      { name: "Vercel", cat: "Application Hosting", admin: "Radzdom Gallego", access: "Team Admin", sec: "GitHub SSO" },
                    ].map((tool, idx) => (
                      <tr key={idx} className="hover:bg-stone-50">
                        <td className="p-3 font-bold text-[#242E29]">{tool.name}</td>
                        <td className="p-3 text-[#65746C]">{tool.cat}</td>
                        <td className="p-3 font-semibold text-[#3D5249]">{tool.admin}</td>
                        <td className="p-3 font-mono text-[11px]">{tool.access}</td>
                        <td className="p-3 font-semibold text-emerald-700">{tool.sec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Implementation Playbook Phases 1-4 */}
          {selectedPageId === "playbook-phase-1" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#242E29]">Phase 1: Preparation</h2>
              <div className="p-4 rounded-xl bg-white border border-[#E8E2DD] space-y-3 text-xs text-[#242E29] leading-relaxed">
                <h4 className="font-bold text-[#3D5249] text-sm">Action Checklist</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Run comprehensive systems and tool audit across client workspaces.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Confirm credential delegations and password manager access.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Set up dedicated client communication channels and internal project lists.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Schedule kickoff call between assigned Operations Manager and client stakeholders.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {selectedPageId === "playbook-phase-2" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#242E29]">Phase 2: Process Documentation</h2>
              <div className="p-4 rounded-xl bg-white border border-[#E8E2DD] space-y-3 text-xs text-[#242E29] leading-relaxed">
                <h4 className="font-bold text-[#3D5249] text-sm">SOP Authoring Standards</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Record 1080p walkthrough videos with clear step annotations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Structure SOPs: Objective, Prerequisites, Step-by-Step, Output Verification.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Store documents inside verified client Knowledge Hub folders.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {selectedPageId === "playbook-phase-3" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#242E29]">Phase 3: Planning</h2>
              <div className="p-4 rounded-xl bg-white border border-[#E8E2DD] space-y-3 text-xs text-[#242E29] leading-relaxed">
                <h4 className="font-bold text-[#3D5249] text-sm">Sprint Configuration</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Establish 90-day milestone goals and 14-day sprint allocations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Slice deliverables into discrete ClickUp tasks with assignees and due dates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Validate team bandwidth and confirm milestone handoff schedule.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {selectedPageId === "playbook-phase-4" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#242E29]">Phase 4: Action</h2>
              <div className="p-4 rounded-xl bg-white border border-[#E8E2DD] space-y-3 text-xs text-[#242E29] leading-relaxed">
                <h4 className="font-bold text-[#3D5249] text-sm">Daily Execution & Cadences</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Execute assigned tasks and post daily End-of-Day reports by 5:00 PM PHT.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Attend Friday Subcon Weekly Meeting facilitated by RA Malinao.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                    <span>Conduct monthly KPI scorecard reviews and client profitability audits.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Onboarding Operations & Marketing */}
          {selectedPageId === "onb-ops" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#242E29]">Operations Onboarding</h2>
              <div className="p-4 rounded-xl bg-white border border-[#E8E2DD] space-y-3 text-xs text-[#242E29] leading-relaxed">
                <h4 className="font-bold text-[#3D5249] text-sm">Operating Rules</h4>
                <ul className="space-y-1.5 list-disc pl-4 text-[#65746C]">
                  <li>Strict client data isolation: Never mix assets, credentials, or workflows across clients.</li>
                  <li>ClickUp is 100% read-only; mutations are stored in Supabase.</li>
                  <li>Submit monthly compensation invoices via Wise by the 7th of each month.</li>
                </ul>
              </div>
            </div>
          )}

          {selectedPageId === "onb-marketing" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#242E29]">Marketing Onboarding</h2>
              <div className="p-4 rounded-xl bg-white border border-[#E8E2DD] space-y-3 text-xs text-[#242E29] leading-relaxed">
                <h4 className="font-bold text-[#3D5249] text-sm">Campaign Standards</h4>
                <ul className="space-y-1.5 list-disc pl-4 text-[#65746C]">
                  <li>Multi-platform paid campaigns across Meta and TikTok Ads Manager.</li>
                  <li>Track ROAS, CPA, and CTR metrics weekly with structured reporting.</li>
                  <li>Maintain verified case study repositories and client outcome portfolios.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Internal SOPs */}
          {selectedPageId.startsWith("sop-") && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#242E29]">Internal SOP Documentation</h2>
              <div className="p-4 rounded-xl bg-white border border-[#E8E2DD] space-y-3 text-xs text-[#242E29] leading-relaxed">
                <h4 className="font-bold text-[#3D5249] text-sm">Protocol Details</h4>
                <p>
                  Follow standardized procedures for Google Workspace provisioning, GoHighLevel staff management, and ClickUp task updating. Any discrepancies must be escalated to Divine Origines or RA Malinao.
                </p>
              </div>
            </div>
          )}

          {/* Onboarding Clients Steps 1-5 */}
          {selectedPageId.startsWith("onb-step-") && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#242E29]">Client Onboarding Steps</h2>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { step: "Step 1", title: "Discovery Call & Alignment", desc: "Evaluate operational scope, team bottlenecks, and tool architectures." },
                  { step: "Step 2", title: "Proposal & Agreement", desc: "Sign service contracts, issue retainer deposit, and initiate welcome communications." },
                  { step: "Step 3", title: "Strategy Session", desc: "Map 90-day milestones and establish project management hierarchies." },
                  { step: "Step 4", title: "Team Execution", desc: "Assign specialist resources, begin sprints, and report daily progress." },
                  { step: "Step 5", title: "Ongoing Optimization", desc: "Review performance metrics weekly and optimize systems monthly." },
                ].map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#E8E2DD] flex items-start gap-3">
                    <span className="px-2 py-1 rounded bg-[#3D5249] text-white font-mono font-bold text-xs">
                      {s.step}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-[#242E29]">{s.title}</h4>
                      <p className="text-xs text-[#65746C] mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
