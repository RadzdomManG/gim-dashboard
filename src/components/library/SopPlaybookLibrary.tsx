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
- **Hard Milestone:** Summit Readiness by Friday 11 Dec 2026 (38 Days).
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
    id: "sop-wrts-n8n",
    title: "WRTS: 21 n8n Operational Automations & Webhook Architecture",
    category: "Automation & Tech",
    clientScope: "We Rock the Spectrum (WRTS)",
    updatedDate: "Oct 31, 2026",
    author: "Radzdom Gallego (Radz)",
    summary:
      "Technical specifications for 21 active n8n nodes syncing parent waivers, ClassReach rosters, and gym floor capacity.",
    content: `# We Rock the Spectrum — 21 n8n Workflows Specification

## 1. System Overview
- **Platform:** n8n Enterprise Self-Hosted + PostgreSQL
- **CRM Integration:** ClassReach System API + HubSpot
- **Primary Goal:** 100% automated gym check-ins, waiver archiving, and failed payment retry sequences.

## 2. Core Workflow Breakdown
1. **W01 - Parent Waiver Ingestion:** Webhook listener decrypts digital signature and writes record to Supabase.
2. **W05 - ClassReach Roster Sync:** Hourly cron job synchronizes attendance rosters into HubSpot.
3. **W12 - Failed Payment Retry:** 3-stage dunning cadence (Day 1 SMS, Day 3 Email, Day 5 Manager Alert).
4. **W18 - Floor Capacity Sentinel:** Triggers push notifications to manager mobile when gym floor capacity exceeds 85%.
5. **W21 - Revenue Reconciliation:** Automated daily settlement report dispatched at 11:30 PM AEST.`,
  },
  {
    id: "sop-cc-spec",
    title: "GIM Command Center & Operations Specification",
    category: "Strategy",
    updatedDate: "Nov 01, 2026",
    author: "Divine Origines",
    summary:
      "Core operating architecture for GIM: client delivery pipelines, gate sign-off protocols, and team workload matrices.",
    content: `# Grace in Motion — Command Center Specification

## 1. Core Operating Pillars
1. **Portfolio Outcomes:** Real-time visibility into every client's active sprint velocity and launch targets.
2. **Delivery Backlog:** Read-only connection to ClickUp mirroring tasks without write contamination.
3. **Internal Sign-Off Queue:** Quality gates must be formally signed off by Divine, Radz, or RA before production deployment.
4. **Team Capacity:** Weekly hours monitoring to prevent consultant burnout and maintain 80-85% utilization.

## 2. Security & Boundaries
- ClickUp is strictly read-only.
- Production deployments on Vercel are frozen until verified locally on localhost.
- RLS policies isolate client data completely.`,
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
  const [selectedDocId, setSelectedDocId] = useState<string>("sop-lt-spec");
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

  const selectedDoc = accessibleDocs.find((d) => d.id === selectedDocId) || accessibleDocs[0] || SOP_DOCS[0];

  const handleCopy = () => {
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
            <h2 className="text-xl font-bold tracking-tight text-[#242E29]">
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
          <span>{SOP_DOCS.length} Master Specifications</span>
        </Badge>
      </div>

      {/* 2. MAIN 2-COLUMN VIEW: DOCUMENT LIST + VIEWER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <Card>
            <CardContent className="p-3.5 space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
                <input
                  type="text"
                  placeholder="Search playbooks & specs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1 text-[10px]">
                {["all", "Strategy", "Client Delivery", "Automation & Tech"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-[#3D5249] text-white"
                        : "bg-[#FBF6F3] text-[#65746C] hover:bg-[#E8E2DD]"
                    }`}
                  >
                    {cat === "all" ? "All Documents" : cat}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document Cards */}
          <div className="space-y-2">
            {filteredDocs.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
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
          <Card className="h-full flex flex-col">
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
    </div>
  );
}
