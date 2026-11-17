"use client";

import React, { useState } from "react";
import {
  FileText,
  Lock,
  Globe,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  Copy,
  Check,
  BookOpen,
  HelpCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

interface KnowledgeDocPage {
  id: string;
  title: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  category: string;
  content: React.ReactNode;
}

export function HierarchyKnowledgeHubView() {
  const [selectedPageId, setSelectedPageId] = useState<string>("scope-of-work");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    assets: true,
    playbook: true,
    onboarding_clients: true,
    onboarding: true,
    internal_processes: true,
  });
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Top Web Share Notification Banner */}
      <div className="bg-[#6B46C1] text-white px-4 py-2 text-xs flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-200" />
          <span className="font-semibold">This Doc is shared to the web.</span>
          <span className="text-purple-200 text-[11px] hidden sm:inline">
            Internal GIM team members have full read-access to client playbooks and SOPs.
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold transition-colors"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedLink ? "Link Copied" : "Share Link"}</span>
        </button>
      </div>

      {/* Main Dual-Pane Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Document Navigation Tree */}
        <aside className="w-72 border-r border-[#E8E2DD] bg-[#FAF8F6] flex flex-col shrink-0 overflow-y-auto">
          {/* Doc Header */}
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
              Verified
            </span>
          </div>

          {/* Pages List */}
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

        {/* Right Main Document Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-4xl">
          {selectedPageId === "scope-of-work" && (
            <div className="space-y-6">
              {/* Blue Sparkle Info Callout */}
              <div className="p-4 rounded-xl bg-[#EBF5FB] border border-[#BCE2F5] text-xs text-[#1B4F72] leading-relaxed flex items-start gap-3 shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#2980B9] shrink-0 mt-0.5" />
                <p>
                  A scope of work document acts as the formal agreement between Grace In Motion and the client, defining all operational responsibilities, technical deliverables, milestones, and review cadences. This framework ensures complete clarity and alignment across all stakeholders from day one.
                </p>
              </div>

              {/* Section: Overview */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-[#242E29] font-serif tracking-tight">Overview</h2>

                {/* Yellow Pointer Callout */}
                <div className="p-3.5 rounded-xl bg-[#FEF9E7] border border-[#FAD7A0] text-xs text-[#7D6608] flex items-center gap-2.5">
                  <span className="text-base">👉</span>
                  <span className="font-medium">
                    Provide a summary view of the key project details in this section.
                  </span>
                </div>

                {/* Structured Metadata Table */}
                <div className="border border-[#E8E2DD] rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="w-1/3 p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72] flex items-center gap-2">
                          <span>⭐</span> Client
                        </td>
                        <td className="p-3 font-bold text-[#242E29] bg-white">Divine Origines</td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72] flex items-center gap-2">
                          <span>⭐</span> Role/Services
                        </td>
                        <td className="p-3 text-[#242E29] bg-white">Fractional COO & Systems Architecture</td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72] flex items-center gap-2">
                          <span>👤</span> Client Contact
                        </td>
                        <td className="p-3 text-[#242E29] bg-white">
                          <a href="mailto:info@divineorigines.com" className="text-[#518E6A] font-semibold hover:underline">
                            info@divineorigines.com
                          </a>
                        </td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72] flex items-center gap-2">
                          <span>👤</span> Project Manager
                        </td>
                        <td className="p-3 font-semibold text-[#242E29] bg-white">Erwin Manaog</td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72] flex items-center gap-2">
                          <span>📝</span> Description
                        </td>
                        <td className="p-3 text-[#242E29] bg-white leading-relaxed">
                          Divine works with multiple high-growth clients delivering fractional operations, automation systems, and executive execution standards.
                        </td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72] flex items-center gap-2">
                          <span>📅</span> Target Start Date
                        </td>
                        <td className="p-3 text-[#242E29] bg-white font-mono">Jan 6, 2025</td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72] flex items-center gap-2">
                          <span>📅</span> Target End Date
                        </td>
                        <td className="p-3 text-[#242E29] bg-white font-mono">Ongoing / Retainer</td>
                      </tr>
                      <tr className="border-b border-[#E8E2DD]">
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72] flex items-center gap-2">
                          <span>💲</span> Overall Budget
                        </td>
                        <td className="p-3 text-[#242E29] bg-white">Monthly Retainer &amp; Sprint Allocation</td>
                      </tr>
                      <tr>
                        <td className="p-3 bg-[#EBF5FB]/60 font-semibold text-[#1B4F72] align-top flex items-center gap-2">
                          <span>🔗</span> Key Resources
                        </td>
                        <td className="p-3 text-[#242E29] bg-white">
                          <ul className="space-y-1 text-xs">
                            <li className="flex items-center gap-1.5 text-[#518E6A] hover:underline cursor-pointer">
                              <span>&bull;</span> <span>[Signed Service Agreement]</span>
                            </li>
                            <li className="flex items-center gap-1.5 text-[#518E6A] hover:underline cursor-pointer">
                              <span>&bull;</span> <span>[ClickUp Master Execution Roadmap]</span>
                            </li>
                            <li className="flex items-center gap-1.5 text-[#518E6A] hover:underline cursor-pointer">
                              <span>&bull;</span> <span>[Client Change Request Register]</span>
                            </li>
                            <li className="flex items-center gap-1.5 text-[#518E6A] hover:underline cursor-pointer">
                              <span>&bull;</span> <span>[Executive Stakeholder Feedback Form]</span>
                            </li>
                            <li className="flex items-center gap-1.5 text-[#518E6A] hover:underline cursor-pointer">
                              <span>&bull;</span> <span>[Internal Deliverables &amp; SOP Folder]</span>
                            </li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section: Background & Goals */}
              <div className="space-y-3 pt-2">
                <h2 className="text-xl font-bold text-[#242E29] font-serif tracking-tight">Background &amp; Goals</h2>
                <div className="p-4 rounded-xl bg-white border border-[#E8E2DD] space-y-3 text-xs text-[#242E29] leading-relaxed">
                  <p>
                    Grace In Motion provides executive operations management, automation pipeline architecture, and team delivery oversight. This scope establishes standardized processes across client onboarding, tool inventory, and daily task accountability.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-[#FAF8F6] border border-[#E8E2DD] space-y-1">
                      <span className="font-bold text-[#3D5249] block text-xs">Primary Objectives</span>
                      <ul className="list-disc pl-4 text-[11px] text-[#65746C] space-y-0.5">
                        <li>Eliminate operational bottlenecks across active clients</li>
                        <li>Automate lead intake, CRM synchronization, and notifications</li>
                        <li>Enforce strict quality gates prior to deliverable handoff</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FAF8F6] border border-[#E8E2DD] space-y-1">
                      <span className="font-bold text-[#3D5249] block text-xs">Success Metrics</span>
                      <ul className="list-disc pl-4 text-[11px] text-[#65746C] space-y-0.5">
                        <li>Zero missed client milestones or unassigned blockers</li>
                        <li>100% daily End-of-Day (EOD) submission rate</li>
                        <li>Audit-ready SOP coverage for all recurring operations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPageId === "tool-tracker" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E2DD]">
                <div>
                  <h2 className="text-xl font-bold text-[#242E29] font-serif">Tool Tracker</h2>
                  <p className="text-xs text-[#65746C] mt-0.5">
                    Centralized registry of all agency and client systems, access levels, and security requirements.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                  10 Active Systems
                </span>
              </div>

              <div className="border border-[#E8E2DD] rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F6] text-[#3D5249] uppercase font-bold text-[10px] border-b border-[#E8E2DD]">
                    <tr>
                      <th className="p-3">Platform</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Primary Admin</th>
                      <th className="p-3">Access Level</th>
                      <th className="p-3">Security &amp; 2FA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2DD] bg-white">
                    {[
                      { name: "ClickUp", cat: "Project Management", admin: "Divine Origines", access: "Workspace Admin", sec: "Enforced 2FA" },
                      { name: "GoHighLevel (GHL)", cat: "CRM & Marketing Automation", admin: "Radzdom Gallego", access: "Agency Admin", sec: "Enforced 2FA" },
                      { name: "Supabase", cat: "Production Database", admin: "Radzdom Gallego", access: "Owner / Full DB", sec: "Service Key / RLS" },
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
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            {tool.sec}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedPageId.startsWith("playbook-") && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-[#E8E2DD]">
                <h2 className="text-xl font-bold text-[#242E29] font-serif">
                  {selectedPageId === "playbook-phase-1" && "Phase 1: Preparation"}
                  {selectedPageId === "playbook-phase-2" && "Phase 2: Process Documentation"}
                  {selectedPageId === "playbook-phase-3" && "Phase 3: Planning"}
                  {selectedPageId === "playbook-phase-4" && "Phase 4: Action"}
                </h2>
                <p className="text-xs text-[#65746C] mt-0.5">
                  Standard operating blueprint for client implementation lifecycles.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E8E2DD] space-y-3 text-xs leading-relaxed text-[#242E29]">
                <h4 className="font-bold text-[#3D5249] text-sm">Key Action Checklist</h4>
                <ul className="space-y-2">
                  {[
                    "Complete comprehensive discovery audit across client operations and communication channels.",
                    "Verify all credential delegations and test access permissions before kicking off implementation.",
                    "Document all client-specific rules, tone-of-voice constraints, and sensitive data guardrails.",
                    "Establish weekly review rhythm and designate primary operational point of contact.",
                  ].map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {selectedPageId.startsWith("onb-step-") && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-[#E8E2DD]">
                <h2 className="text-xl font-bold text-[#242E29] font-serif">Client Onboarding Framework</h2>
                <p className="text-xs text-[#65746C] mt-0.5">
                  5-step standardized client intake journey ensuring seamless handoff and execution.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { step: "Step 1", title: "Discovery Call & Alignment", desc: "Understand client goals, team bottlenecks, and technology stack." },
                  { step: "Step 2", title: "Proposal, Agreement & Onboarding", desc: "Execute contracts, secure initial invoices, and trigger welcome emails." },
                  { step: "Step 3", title: "Strategy Session & 90-Day Plan", desc: "Map sprint milestones, establish ClickUp spaces, and configure tool access." },
                  { step: "Step 4", title: "Implementation & Team Execution", desc: "Assign operational specialists, activate workflows, and initiate daily reporting." },
                  { step: "Step 5", title: "Ongoing Optimization & Reporting", desc: "Conduct weekly client check-ins, review KPI scorecards, and iterate systems." },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#E8E2DD] flex items-start gap-3">
                    <span className="px-2 py-1 rounded bg-[#3D5249] text-white font-mono font-bold text-xs">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-[#242E29]">{item.title}</h4>
                      <p className="text-xs text-[#65746C] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedPageId.startsWith("sop-") && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-[#E8E2DD]">
                <h2 className="text-xl font-bold text-[#242E29] font-serif">Internal Standard Operating Procedure</h2>
                <p className="text-xs text-[#65746C] mt-0.5">
                  Mandatory operational protocol for Grace In Motion specialists and leadership.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E8E2DD] space-y-3 text-xs text-[#242E29] leading-relaxed">
                <h4 className="font-bold text-[#3D5249] text-sm">Execution Guidelines</h4>
                <p>
                  Every team member must strictly follow documented SOP steps. If any discrepancy or tool update occurs, submit an SOP update ticket to the Project Manager before taking action.
                </p>
                <div className="p-3 bg-[#FAF8F6] rounded-lg border border-[#E8E2DD] space-y-1">
                  <span className="font-bold text-xs text-[#242E29]">End of Day (EOD) Protocol</span>
                  <p className="text-[11px] text-[#65746C]">
                    All specialists must submit their daily EOD reports in the assigned Slack/Discord channel by 5:00 PM local time detailing completed tasks, open blockers, and next-day priorities.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
