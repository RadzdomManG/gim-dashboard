"use client";

import React, { useState } from "react";
import {
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  FileText,
  DollarSign,
  Search,
  ExternalLink,
  Layers,
  ChevronRight,
  Filter,
  Check,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ClientReportExportModal } from "@/components/reports/ClientReportExportModal";
import { ClientOnboardingModal } from "@/components/clients/ClientOnboardingModal";

export interface ClientProfile {
  id: string;
  name: string;
  code: string;
  industry: string;
  location: string;
  contactName: string;
  contactRole: string;
  accountLead: string;
  specialist: string;
  status: "Active Sprint" | "Proposal Staged" | "Discovery Intake";
  statusVariant: "active" | "review" | "upcoming";
  retainer: string;
  progress: number;
  currentSprint: string;
  targetMilestone: string;
  description: string;
  deliverables: {
    code: string;
    title: string;
    status: "Completed" | "In Review" | "In Progress" | "Queued";
  }[];
  keyTechStack: string[];
}

const CLIENT_PORTFOLIO: ClientProfile[] = [
  {
    id: "little-treasures",
    name: "Little Treasures Company",
    code: "LT-AU",
    industry: "Paediatric Therapy & Education",
    location: "Brisbane, Queensland, AU",
    contactName: "Zoe Horner",
    contactRole: "Founder & Lead Paediatric OT",
    accountLead: "Erwin Manaog",
    specialist: "Radzdom Gallego (Radz)",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "AUD $875 / week",
    progress: 72,
    currentSprint: "GoHighLevel Website, Forms & $99 Course Build",
    targetMilestone: "Summit Launch Ready: Fri 11 Dec 2026",
    description:
      "Comprehensive digital patient intake and clinical course platform for paediatric occupational therapy. Consolidates multi-step consultation bookings, family intake forms, automated SMS notifications, and video training course delivery.",
    deliverables: [
      { code: "G1", title: "Foundation: AUD currency & account defaults", status: "Completed" },
      { code: "G2", title: "Course shell architecture for Zoe's first look", status: "Completed" },
      { code: "G3", title: "Custom fields, tags, pipeline and smart lists", status: "Completed" },
      { code: "G4", title: "Three client forms with privacy notices", status: "Completed" },
      { code: "G5", title: "Website: Six pages in Zoe's brand", status: "In Review" },
      { code: "G6", title: "Wording: Page copy and enquiry reply (A1)", status: "Completed" },
      { code: "G7", title: "Enquiry workflow and Zoe's phone SMS alert", status: "In Review" },
      { code: "G11", title: "Checkout and course access automation", status: "In Progress" },
      { code: "G14", title: "Domain pointing: littletreasurescompany.com", status: "Queued" },
      { code: "G18", title: "Dry run fixes and summit-ready QA check", status: "Queued" },
    ],
    keyTechStack: ["GoHighLevel", "Stripe AUD", "Wix DNS", "Vimeo / Wistia", "G Suite"],
  },
  {
    id: "wrts",
    name: "We Rock the Spectrum (WRTS)",
    code: "WRTS-US",
    industry: "Sensory Gym Franchise",
    location: "Preston, Victoria, AU",
    contactName: "Marcus Vance",
    contactRole: "Operations Director",
    accountLead: "Radzdom Gallego (Radz)",
    specialist: "Radzdom Gallego (Radz)",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "USD $3,200 / month",
    progress: 85,
    currentSprint: "21 n8n Operational Automations & ClassReach Sync",
    targetMilestone: "Live Operational Handover & Uptime Monitoring",
    description:
      "Full operational automation suite for sensory gym franchise operations. Automates parent waiver capture, class attendance logging, webhook dispatching, ClassReach system synchronisation, and automated member lifecycle emails.",
    deliverables: [
      { code: "W01", title: "Parent waiver ingestion & digital storage webhook", status: "Completed" },
      { code: "W05", title: "ClassReach roster synchronization to CRM", status: "Completed" },
      { code: "W12", title: "Failed payment alert and automatic retry sequence", status: "Completed" },
      { code: "W18", title: "Gym floor capacity alerts to manager mobile", status: "In Progress" },
      { code: "W21", title: "Automated end-of-day revenue reconciliation", status: "In Progress" },
    ],
    keyTechStack: ["n8n Enterprise", "ClassReach API", "HubSpot CRM", "Webhooks", "PostgreSQL"],
  },
  {
    id: "studio-nets",
    name: "Studio Nets",
    code: "SN-US",
    industry: "Creative Design & Brand Systems",
    location: "Austin, Texas, US",
    contactName: "Elena Rostova",
    contactRole: "Creative Director",
    accountLead: "Erwin Manaog",
    specialist: "BJ Ricafrente",
    status: "Active Sprint",
    statusVariant: "active",
    retainer: "USD $2,800 / month",
    progress: 60,
    currentSprint: "Creative Production Playbook & Fathom Integrations",
    targetMilestone: "SOP Standardization Complete",
    description:
      "Operational systemization for a boutique digital creative agency. Bridges Figma design asset reviews with client sign-off checklists, ClickUp task generation, and automated Fathom meeting summary transcript extraction.",
    deliverables: [
      { code: "SN-01", title: "Client intake questionnaire and Figma asset folder generator", status: "Completed" },
      { code: "SN-02", title: "Creative production SOP & Fathom call sync", status: "Completed" },
      { code: "SN-03", title: "Client feedback portal and approval states", status: "In Progress" },
      { code: "SN-04", title: "Resource allocation & contractor billing matrix", status: "Queued" },
    ],
    keyTechStack: ["Figma Enterprise", "Fathom AI", "ClickUp", "Google Workspace"],
  },
  {
    id: "invogue-cleans",
    name: "InVogue Cleans",
    code: "IVC-US",
    industry: "Residential & Commercial Cleaning",
    location: "Brisbane, Queensland, AU",
    contactName: "Matthew Robbins",
    contactRole: "Founder & Managing Director",
    accountLead: "Ma. Rose Anne (RA) Malinao",
    specialist: "Joy Fabular",
    status: "Proposal Staged",
    statusVariant: "review",
    retainer: "USD $1,700 / month",
    progress: 35,
    currentSprint: "CRM Follow-up & Retention System Architecture",
    targetMilestone: "90-Day Retention Roadmap Presentation",
    description:
      "Lead conversion and customer retention system for premium cleaning services. Targets recurring subscription churn reduction through automated satisfaction surveys, quote reminders, and cleaner dispatching alerts.",
    deliverables: [
      { code: "IVC-01", title: "30-60-90 Day Retention strategy & lead magnet proposal", status: "Completed" },
      { code: "IVC-02", title: "Instant estimate calculator and SMS quote follow-up", status: "In Progress" },
      { code: "IVC-03", title: "Cleaner dispatch alerts via WhatsApp/SMS", status: "Queued" },
    ],
    keyTechStack: ["GoHighLevel", "Stripe", "Twilio SMS", "Zapier"],
  },
  {
    id: "aaron-ofosu",
    name: "Aaron Ofosu Bootcamp",
    code: "AO-US",
    industry: "Athletic Conditioning & Fitness",
    location: "London, UK / Global",
    contactName: "Aaron Ofosu",
    contactRole: "Founder & Master Trainer",
    accountLead: "BJ Ricafrente",
    specialist: "Radzdom Gallego (Radz)",
    status: "Discovery Intake",
    statusVariant: "upcoming",
    retainer: "USD $4,000 / month",
    progress: 20,
    currentSprint: "Student Onboarding Pipeline & Community Setup",
    targetMilestone: "Cohort 1 Launch Readiness",
    description:
      "Athlete training ecosystem and premium membership portal. Features multi-week fitness program progressions, video accountability check-ins, automated milestone badges, and Stripe recurring memberships.",
    deliverables: [
      { code: "AO-01", title: "Student intake pipeline and welcome video sequence", status: "In Review" },
      { code: "AO-02", title: "Membership portal setup & community channels", status: "In Progress" },
      { code: "AO-03", title: "Weekly workout video delivery workflow", status: "Queued" },
    ],
    keyTechStack: ["Skool / Circle", "GoHighLevel", "Stripe Billing", "Loom"],
  },
  {
    id: "tch2thrive",
    name: "Tch2Thrive",
    code: "T2T-US",
    industry: "Educational Consultancy & Teacher Development",
    location: "California, US",
    contactName: "Dr. Gloria Ramos Gonzalez",
    contactRole: "Executive Director",
    accountLead: "Divine Origines",
    specialist: "Ma. Rose Anne (RA) Malinao",
    status: "Proposal Staged",
    statusVariant: "review",
    retainer: "USD $2,500 / month",
    progress: 40,
    currentSprint: "School District Proposal & ClickUp SOP Library",
    targetMilestone: "District Conference Partnership Pipeline",
    description:
      "Educational consulting delivery platform supporting school district teacher retention initiatives. Manages professional development workshop contracts, attendance verification, and grant compliance tracking.",
    deliverables: [
      { code: "T2T-01", title: "School district proposal & scope document", status: "Completed" },
      { code: "T2T-02", title: "District workshop booking & attendee intake form", status: "In Progress" },
      { code: "T2T-03", title: "Accreditation certificate generation automation", status: "Queued" },
    ],
    keyTechStack: ["ClickUp", "Google Docs / Drive API", "Stripe Invoicing", "Airtable"],
  },
];

interface ClientPortfolioViewProps {
  onSelectTasks?: (clientName: string) => void;
  clientScope?: string | string[];
}

export function ClientPortfolioView({ onSelectTasks, clientScope = "all" }: ClientPortfolioViewProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>("little-treasures");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);

  const filteredClients = CLIENT_PORTFOLIO.filter((c) => {
    // Client scope enforcement
    if (clientScope && clientScope !== "all") {
      const allowed = Array.isArray(clientScope) ? clientScope : [clientScope];
      const hasAccess = allowed.some((scope) =>
        c.name.toLowerCase().includes(scope.toLowerCase()) || scope.toLowerCase().includes(c.name.toLowerCase())
      );
      if (!hasAccess) return false;
    }

    if (statusFilter !== "all" && c.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedClient =
    CLIENT_PORTFOLIO.find((c) => c.id === selectedClientId) || CLIENT_PORTFOLIO[0];

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-[#242E29]">
              Client Portfolio Command Center
            </h2>
            <Badge variant="brand">{CLIENT_PORTFOLIO.length} Authentic Accounts</Badge>
          </div>
          <p className="text-xs text-[#65746C] mt-0.5">
            Operational client dossiers, delivery roadmaps, retainer metrics, and assigned team leads.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsOnboardModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Onboard Client</span>
          </Button>
          <Badge variant="active" dot>
            3 Active Builds
          </Badge>
          <Badge variant="review" dot>
            2 Proposals Staged
          </Badge>
          <Badge variant="upcoming" dot>
            1 Discovery
          </Badge>
        </div>
      </div>

      {/* 2. MAIN LAYOUT: CLIENT LIST ON LEFT, DOSSIER ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Client List & Filters */}
        <div className="lg:col-span-5 space-y-3">
          <Card>
            <CardContent className="p-3.5 space-y-3">
              {/* Search & Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
                <input
                  type="text"
                  placeholder="Filter clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                />
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    statusFilter === "all"
                      ? "bg-[#3D5249] text-white"
                      : "bg-[#FBF6F3] text-[#65746C] hover:bg-[#E8E2DD]"
                  }`}
                >
                  All (6)
                </button>
                <button
                  onClick={() => setStatusFilter("active sprint")}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    statusFilter === "active sprint"
                      ? "bg-[#466B53] text-white"
                      : "bg-[#FBF6F3] text-[#65746C] hover:bg-[#E8E2DD]"
                  }`}
                >
                  Active (3)
                </button>
                <button
                  onClick={() => setStatusFilter("proposal staged")}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    statusFilter === "proposal staged"
                      ? "bg-amber-600 text-white"
                      : "bg-[#FBF6F3] text-[#65746C] hover:bg-[#E8E2DD]"
                  }`}
                >
                  Proposals (2)
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Client Cards List */}
          <div className="space-y-2">
            {filteredClients.map((client) => {
              const isSelected = client.id === selectedClientId;
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-[#518E6A] ring-2 ring-[#518E6A]/20 shadow-xs"
                      : "bg-white border-[#E8E2DD] hover:border-[#466B53]/40 hover:bg-[#FBF6F3]/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#3D5249] text-[10px] bg-[#466B53]/15 px-1.5 py-0.2 rounded border border-[#466B53]/25">
                      {client.code}
                    </span>
                    <Badge variant={client.statusVariant} dot>
                      {client.status}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-xs text-[#242E29] line-clamp-1">
                    {client.name}
                  </h3>

                  <p className="text-[11px] text-[#65746C] line-clamp-1 mt-0.5">
                    {client.industry}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#E8E2DD]/60 flex items-center justify-between text-[10px] text-[#65746C]">
                    <span>Lead: <strong>{client.accountLead}</strong></span>
                    <span className="font-semibold text-[#466B53]">{client.retainer}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-[#E8E2DD]/60 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-[#518E6A] h-1 rounded-full transition-all"
                      style={{ width: `${client.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 Cols): Detailed Client Dossier */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            {/* Header Strip */}
            <div className="p-5 border-b border-[#E8E2DD] bg-[#FBF6F3]/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#3D5249] text-xs bg-[#466B53]/20 px-2 py-0.5 rounded border border-[#466B53]/30">
                    {selectedClient.code}
                  </span>
                  <Badge variant={selectedClient.statusVariant} dot>
                    {selectedClient.status}
                  </Badge>
                </div>
                <span className="text-xs font-bold text-[#466B53]">
                  {selectedClient.retainer}
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#242E29]">
                {selectedClient.name}
              </h2>
              <p className="text-xs text-[#65746C] mt-0.5">
                {selectedClient.industry} · {selectedClient.location}
              </p>
            </div>

            {/* Strategic Overview */}
            <CardContent className="p-5 space-y-5 text-xs">
              <div>
                <h4 className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider mb-1.5">
                  Strategic Scope & Objective
                </h4>
                <p className="text-xs text-[#242E29] leading-relaxed">
                  {selectedClient.description}
                </p>
              </div>

              {/* Account Stakeholders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/40">
                <div>
                  <span className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider block">
                    Client Contact
                  </span>
                  <p className="font-bold text-xs text-[#242E29] mt-0.5">
                    {selectedClient.contactName}
                  </p>
                  <p className="text-[10px] text-[#65746C]">{selectedClient.contactRole}</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider block">
                    GIM Account Lead
                  </span>
                  <p className="font-bold text-xs text-[#242E29] mt-0.5">
                    {selectedClient.accountLead}
                  </p>
                  <p className="text-[10px] text-[#518E6A] font-medium">Project Owner</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider block">
                    Technical Specialist
                  </span>
                  <p className="font-bold text-xs text-[#242E29] mt-0.5">
                    {selectedClient.specialist}
                  </p>
                  <p className="text-[10px] text-[#466B53] font-medium">Delivery & Systems</p>
                </div>
              </div>

              {/* Current Sprint & Hard Target */}
              <div className="p-3.5 rounded-xl border border-[#518E6A]/30 bg-[#EDFDF5]/60 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-[#38A169] shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <p className="font-bold text-xs text-[#276749]">
                    Current Sprint Focus: {selectedClient.currentSprint}
                  </p>
                  <p className="text-[11px] text-[#276749]/80">
                    Target Milestone: <strong>{selectedClient.targetMilestone}</strong>
                  </p>
                </div>
              </div>

              {/* Deliverables & Quality Gates Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider">
                    Deliverables & Verification Gates
                  </h4>
                  <span className="text-[11px] text-[#65746C]">
                    Overall Progress: <strong>{selectedClient.progress}%</strong>
                  </span>
                </div>

                <div className="divide-y divide-[#E8E2DD]/50 border border-[#E8E2DD] rounded-xl overflow-hidden bg-white">
                  {selectedClient.deliverables.map((del, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 flex items-center justify-between hover:bg-[#FBF6F3]/40 transition-colors text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[10px] text-[#3D5249] bg-[#466B53]/10 px-1.5 py-0.2 rounded">
                          {del.code}
                        </span>
                        <span className="font-medium text-[#242E29] text-xs">
                          {del.title}
                        </span>
                      </div>
                      <Badge
                        variant={
                          del.status === "Completed"
                            ? "active"
                            : del.status === "In Review"
                            ? "review"
                            : del.status === "In Progress"
                            ? "brand"
                            : "upcoming"
                        }
                      >
                        {del.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack Pills */}
              <div>
                <h4 className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider mb-2">
                  Integrated Technologies & Tooling
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedClient.keyTechStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-[#FBF6F3] border border-[#E8E2DD] text-[11px] font-medium text-[#242E29]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>

            {/* Card Footer with Quick Link to Tasks & Report Generator */}
            <div className="p-3.5 border-t border-[#E8E2DD] bg-[#FBF6F3]/60 flex items-center justify-between">
              <span className="text-[11px] text-[#65746C]">
                Operational backlog mirrored from ClickUp
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center space-x-1.5 text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#518E6A]" />
                  <span>Generate Report</span>
                </Button>
                {onSelectTasks && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSelectTasks(selectedClient.name)}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <span>View {selectedClient.code} Tasks</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Client Report Export Modal */}
      <ClientReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        clientName={selectedClient.name}
      />

      {/* Client Onboarding Modal */}
      <ClientOnboardingModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
      />
    </div>
  );
}
