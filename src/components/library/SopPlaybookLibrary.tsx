"use client";

import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  Search,
  FolderOpen,
  Layers,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Workflow,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export interface SopDocument {
  id: string;
  title: string;
  category: "Strategy" | "Client Delivery" | "Automation & Tech" | "Internal Operations";
  clientScope?: string;
  updatedDate: string;
  author: string;
  summary: string;
  content: string;
}

const SOP_DOCS: SopDocument[] = [
  {
    id: "sop-gim-ops-marketing",
    title: "GIM Operations and Lean Marketing — Working Playbook",
    category: "Strategy",
    updatedDate: "Oct 20, 2026",
    author: "Divine Origines",
    summary:
      "Core operating standard: Business outcome → evidence → constraint → future process → accountable owner → build → test → measured result → handover.",
    content: `# GIM Operations and Lean Marketing — Working Playbook

Prepared for Divine • 20 October 2026 • Version 0.2

## 1. What GIM Should Standardize
Business outcome → evidence → constraint → future process → accountable owner → build → test → measured result → handover.

Standardize this method and its records. Select the actual processes and tools per client. Do not turn every proposal into a new CRM or website build.

Each engagement needs seven records:
1. **Client Brief:** Offer, customers, goals, scope, exclusions, and promised dates.
2. **Evidence Register:** Source links, dates, relevant quotations/timestamps, facts, hypotheses, and unresolved questions.
3. **Current Process Map:** What happens now, with real examples and exceptions.
4. **Decision Log:** Decision, rationale, approver, effective date, and review condition.
5. **Delivery Backlog:** Milestones translated into owned tasks with acceptance evidence.
6. **Automation Register:** Trigger, data, rules, owner, tests, monitoring, and recovery.
7. **Scorecard:** Baseline, current result, target, definition, and data source.

## 2. Before the Kickoff
Project owner assembles a short packet:
- Signed scope, exclusions, success criteria, dates, and available team capacity.
- Discovery notes and recording with relevant timestamps; latest client messages.
- Tool inventory, account owner, and access request list. Store passwords in the approved credential system, never in the brief.

## 3. During Discovery and Kickoff
- Confirm the target metric, current baseline, and reporting period.
- Walk through the customer journey end to end. Note where leads drop or staff intervene.
- Identify the human bottleneck: who makes the decision, who approves exceptions, and who is on call when a webhook breaks?`,
  },
  {
    id: "sop-lt-spec",
    title: "Little Treasures: Paediatric Funnel & $99 Course Specification",
    category: "Client Delivery",
    clientScope: "Little Treasures Company",
    updatedDate: "Nov 02, 2026",
    author: "Erwin Manaog",
    summary:
      "Full delivery roadmap, GoHighLevel account configuration, AUD Stripe tax compliance, and Dec 11 summit timeline.",
    content: `# Little Treasures Company — Master Delivery Specification

## 1. Executive Summary
- **Client:** Zoe Horner (Founder & Lead Paediatric OT)
- **Hard Milestone:** Summit Readiness by Friday 11 Dec 2026 (Working target).
- **Core Deliverable:** GoHighLevel 6-page brand website, intake booking funnels, automated phone SMS alerts, and $99 online video course delivery.

## 2. Gate Verification Sequence (G1 - G18)
- **G1 (Foundation):** Set currency to AUD, GST compliance, receipt as tax invoice.
- **G2 (Course Shell):** 5 video modules, instructor profile cards, completion certificates.
- **G3 (Custom Fields):** Pediatric sensory tags, patient pipeline stages, smart lists.
- **G4 (Clinical Forms):** Three forms with Australian privacy disclosures.
- **G5 (Website):** 6 pages styled in Zoe's authentic warm palette.
- **G7 (Workflow):** Instant SMS alert dispatched to Zoe's mobile upon new enquiry submission.
- **G14 (Domain):** Point littletreasurescompany.com DNS via Wix.
- **G18 (Dry Run):** Full purchase, course enrollment, refund audit, and summit-ready sign-off.`,
  },
  {
    id: "sop-studio-nets-ops",
    title: "Studio Nets: Design Ingestion Systems & Creative Ops Runbook",
    category: "Client Delivery",
    clientScope: "Studio Nets",
    updatedDate: "Oct 31, 2026",
    author: "Erwin Manaog",
    summary:
      "Standard operating procedure for intake questionnaires, Figma design handoff pipelines, and asset revision tracking.",
    content: `# Studio Nets — Design Ingestion & Handoff Runbook

## 1. System Overview
- **Platform:** Figma Enterprise + Supabase Asset Storage + ClickUp Delivery Boards
- **Client Focus:** Studio Nets Design & Creative Systems
- **Primary Goal:** Seamless brand asset intake, Figma file versioning, and client QA approvals.

## 2. Core Creative Pipeline
1. **Intake & Questionnaire:** Automated receipt of client design brief and vector assets.
2. **Figma Canvas Setup:** Grid systems, typography scale tokens, and responsive layout frames.
3. **Internal Review:** Creative lead QA on component states, spacing, and accessibility tokens.
4. **Client Presentation:** Interactive prototype shared with contextual comment pins.
5. **Final Handoff:** Production SVG, PNG, and developer-ready code snippets archived in repository.`,
  },
  {
    id: "sop-auto-testing",
    title: "Automation Design & Testing Protocol",
    category: "Automation & Tech",
    updatedDate: "Oct 30, 2026",
    author: "Radzdom Gallego (Radz)",
    summary:
      "Automated payload schema validation, sandbox dry-runs, error catch blocks, and webhook alerting channels.",
    content: `# Automation Design & Testing Protocol

## 1. Design Principles
1. Every webhook must have an idempotency key to prevent double charging or double SMS delivery.
2. Every external HTTP request must have a 5-second timeout and exponential backoff retry.
3. Catch blocks must alert the internal #ops channel with the failed payload.

## 2. Testing Steps
- Run synthetic test contact with \`gim-test\` prefix.
- Verify status changes in Supabase and notify project owner.
- Confirm client credentials remain isolated in approved secrets vault.`,
  },
  {
    id: "sop-ivc-plan",
    title: "InVogue Cleans: 30-60-90 Day Retention & Lead Magnet Blueprint",
    category: "Client Delivery",
    clientScope: "InVogue Cleans",
    updatedDate: "Nov 02, 2026",
    author: "Ma. Rose Anne (RA) Malinao",
    summary:
      "Lead generation architecture, quote follow-up cadences, and residential cleaning subscription retention.",
    content: `# InVogue Cleans — 30-60-90 Day Retention System

## 1. Objective
Establish an automated lead capture and subscription retention system for premium residential cleaning in Brisbane.

## 2. Phase Breakdown
- **Days 1 - 30 (Foundation):** Multi-step instant estimate calculator, Twilio SMS quote alerts, and GHL pipeline setup.
- **Days 31 - 60 (Retention Engine):** Automated post-cleaning satisfaction surveys and one-click rescheduling links.
- **Days 61 - 90 (Scale):** Referral incentives and automated commercial cleaning proposal generator.`,
  },
];

interface SopPlaybookLibraryProps {
  clientScope?: string | string[];
  isCoreAdmin?: boolean;
}

export function SopPlaybookLibrary({ clientScope = "all", isCoreAdmin = true }: SopPlaybookLibraryProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>("sop-gim-ops-marketing");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  // Client scoping rule: Admins see all. Members only see general SOPs + their assigned clients.
  const accessibleDocs = SOP_DOCS.filter((doc) => {
    if (isCoreAdmin) return true;
    if (!doc.clientScope || doc.category === "Internal Operations" || doc.category === "Strategy") {
      return true;
    }
    if (clientScope && clientScope !== "all") {
      const allowed = Array.isArray(clientScope) ? clientScope : [clientScope];
      return allowed.some(
        (scope) =>
          doc.clientScope?.toLowerCase().includes(scope.toLowerCase()) ||
          scope.toLowerCase().includes(doc.clientScope?.toLowerCase() || "")
      );
    }
    return true;
  });

  const filteredDocs = accessibleDocs.filter((d) => {
    if (selectedCategory !== "all" && d.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        (d.clientScope && d.clientScope.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const selectedDoc = accessibleDocs.find((d) => d.id === selectedDocId) || filteredDocs[0] || SOP_DOCS[0];

  const handleCopy = () => {
    if (!selectedDoc) return;
    navigator.clipboard.writeText(selectedDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold font-serif tracking-tight text-[#242E29]">
              Internal SOP & Playbook Library
            </h2>
            <Badge variant="brand">Operational Intake Archives</Badge>
          </div>
          <p className="text-xs text-[#65746C] mt-0.5">
            Verified delivery playbooks, client discovery dossiers, and automation architecture specifications.
          </p>
        </div>

        <Badge variant="neutral">
          <BookOpen className="w-3.5 h-3.5 mr-1 inline text-[#518E6A]" />
          <span>{accessibleDocs.length} Master Specifications</span>
        </Badge>
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E8E2DD] shadow-xs">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {["all", "Strategy", "Client Delivery", "Automation & Tech", "Internal Operations"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-[#3D5249] text-white shadow-xs"
                  : "bg-[#FBF6F3] text-[#65746C] hover:bg-[#E8E2DD] hover:text-[#242E29]"
              }`}
            >
              {cat === "all" ? "All Playbooks" : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#65746C]" />
          <input
            type="text"
            placeholder="Search playbooks, SOPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E8E2DD] bg-white text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
          />
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN VIEW: DOCUMENT LIST + VIEWER OR EMPTY STATE */}
      {filteredDocs.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-dashed border-[#3D5249]/30 rounded-3xl max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#FBF6F3] border border-[#E8E2DD] flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">
            🍜
          </div>
          <h3 className="font-serif font-black text-xl text-[#242E29] tracking-tight">
            WALA PANG LAMAN KASI GUTOM PA YUNG BUILDER
          </h3>
          <p className="text-xs text-[#65746C] mt-2 max-w-md mx-auto leading-relaxed">
            Kasalukuyan pang inihahanda at niluluto ang playbook para sa kategoryang ito. Magkape muna tayo o pumili ng ibang kategorya sa itaas!
          </p>
          <div className="mt-5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="text-xs"
            >
              Bumalik sa Lahat ng Playbooks
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Document List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="space-y-2">
              {filteredDocs.map((doc) => {
                const isSelected = doc.id === selectedDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-[#518E6A] ring-2 ring-[#518E6A]/20 shadow-xs"
                        : "bg-white border-[#E8E2DD] hover:border-[#466B53]/40 hover:bg-[#FBF6F3]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#466B53] uppercase tracking-wider">
                        {doc.category}
                      </span>
                      <span className="text-[10px] text-[#65746C]">{doc.updatedDate}</span>
                    </div>

                    <h3 className="font-bold text-xs text-[#242E29] line-clamp-1">
                      {doc.title}
                    </h3>

                    <p className="text-[11px] text-[#65746C] line-clamp-2 mt-1 leading-relaxed">
                      {doc.summary}
                    </p>

                    {doc.clientScope && (
                      <div className="mt-2 pt-2 border-t border-[#E8E2DD]/60 flex items-center justify-between text-[10px] text-[#65746C]">
                        <span>Client: <strong>{doc.clientScope}</strong></span>
                        <span>By: {doc.author}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Markdown Viewer (8 Cols) */}
          <div className="lg:col-span-8">
            <Card className="h-full flex flex-col bg-white border border-[#E8E2DD]">
              {/* Header */}
              <div className="p-4 border-b border-[#E8E2DD] bg-[#FBF6F3]/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="brand">{selectedDoc.category}</Badge>
                    {selectedDoc.clientScope && (
                      <Badge variant="neutral">{selectedDoc.clientScope}</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-[#242E29]">{selectedDoc.title}</h3>
                  <p className="text-[11px] text-[#65746C] mt-0.5">
                    Author: <strong>{selectedDoc.author}</strong> · Last Updated: {selectedDoc.updatedDate}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-xs shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#518E6A]" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Document Content View */}
              <div className="p-6 overflow-y-auto max-h-[640px] font-sans text-xs text-[#242E29] space-y-4 leading-relaxed whitespace-pre-wrap bg-white">
                {selectedDoc.content}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[#E8E2DD] bg-[#FBF6F3]/40 text-center text-[11px] text-[#65746C]">
                Archived from local GIM Operating System intake repository.
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
