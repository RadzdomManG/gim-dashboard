"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  FileCheck2,
  RotateCcw,
  UserCheck,
  Building2,
  ChevronRight,
  Filter,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export interface ApprovalItem {
  id: string;
  code: string;
  title: string;
  client: string;
  submittedBy: string;
  assignedReviewer: string;
  submissionDate: string;
  status: "Pending Review" | "Approved" | "Changes Requested";
  priority: "High" | "Critical" | "Normal";
  summary: string;
  deliverableUrl?: string;
  targetMilestone: string;
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: "app-g5",
    code: "G5",
    title: "Website: Six Pages in Zoe's Brand (Copy & Mobile Layout)",
    client: "Little Treasures Company",
    submittedBy: "Radzdom Gallego (Radz)",
    assignedReviewer: "Erwin Manaog",
    submissionDate: "Today at 10:15 AM",
    status: "Pending Review",
    priority: "High",
    summary:
      "All 6 website pages (Home, Course Sales, Enquiries, Waitlist, Privacy, Terms) built in GoHighLevel with brand styling, typography, and responsive mobile padding.",
    deliverableUrl: "https://littletreasurescompany.com",
    targetMilestone: "Summit Ready: Fri 11 Dec 2026",
  },
  {
    id: "app-g7",
    code: "G7",
    title: "Enquiry Workflow, Custom Fields & Phone Notification Alert",
    client: "Little Treasures Company",
    submittedBy: "Radzdom Gallego (Radz)",
    assignedReviewer: "Erwin Manaog",
    submissionDate: "Today at 02:45 PM",
    status: "Pending Review",
    priority: "High",
    summary:
      "Automated enquiry intake routing in GHL: therapy enquiry form submission triggers contact creation, opportunity assignment, automated A1 welcome email, and instant phone alert to Zoe.",
    targetMilestone: "Summit Ready: Fri 11 Dec 2026",
  },
  {
    id: "app-ivc",
    code: "IVC-01",
    title: "InVogue Cleans: 30-60-90 Day Client Retention & Lead Magnet Funnel",
    client: "InVogue Cleans",
    submittedBy: "Ma. Rose Anne (RA) Malinao",
    assignedReviewer: "Divine Origines",
    submissionDate: "Yesterday at 04:30 PM",
    status: "Pending Review",
    priority: "Critical",
    summary:
      "Complete client onboarding roadmap and high-converting lead magnet funnel architecture for residential cleaning subscriptions in Brisbane.",
    targetMilestone: "Q4 Growth Retainer Kickoff",
  },
  {
    id: "app-sn",
    code: "SN-02",
    title: "Studio Nets: Creative Production SOP & Fathom Call Sync Architecture",
    client: "Studio Nets",
    submittedBy: "Erwin Manaog",
    assignedReviewer: "Divine Origines",
    submissionDate: "Oct 31, 2026",
    status: "Pending Review",
    priority: "Normal",
    summary:
      "Standard operating procedure for design asset ingestion, Figma handoff reviews, and Fathom AI meeting summaries mapped directly into client spaces.",
    targetMilestone: "Agency Systems Standardization",
  },
  {
    id: "app-ao",
    code: "AO-01",
    title: "Aaron Ofosu Bootcamp: Student Intake Pipeline & Welcome Sequences",
    client: "Aaron Ofosu Bootcamp",
    submittedBy: "BJ Ricafrente",
    assignedReviewer: "Radzdom Gallego (Radz)",
    submissionDate: "Nov 01, 2026",
    status: "Pending Review",
    priority: "Normal",
    summary:
      "Discovery assessment and student intake form architecture for fitness cohort 1 onboarding.",
    targetMilestone: "Cohort 1 Launch",
  },
];

interface DeliverableSignOffQueueProps {
  currentUserName: string;
  currentUserNickname: string;
  isCoreAdmin: boolean;
}

export function DeliverableSignOffQueue({
  currentUserName,
  currentUserNickname,
  isCoreAdmin,
}: DeliverableSignOffQueueProps) {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [activeAction, setActiveAction] = useState<"approve" | "reject" | null>(null);

  const filteredApprovals = approvals.filter((item) => {
    if (filterStatus === "all") return true;
    return item.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const pendingCount = approvals.filter((a) => a.status === "Pending Review").length;
  const approvedCount = approvals.filter((a) => a.status === "Approved").length;
  const changesCount = approvals.filter((a) => a.status === "Changes Requested").length;

  const handleSignOff = (id: string, newStatus: "Approved" | "Changes Requested") => {
    const reviewerString = `${currentUserName} (${currentUserNickname})`;
    const nowString = new Date().toLocaleString("en-AU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    setApprovals((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: newStatus,
            reviewedBy: reviewerString,
            reviewedAt: nowString,
            reviewNotes: feedbackNote || (newStatus === "Approved" ? "Deliverable approved without notes." : "Revisions requested."),
          };
        }
        return item;
      })
    );

    setSelectedItem(null);
    setFeedbackNote("");
    setActiveAction(null);

    // Sync to Supabase approvals table
    fetch("/api/approvals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: newStatus,
        review_notes: feedbackNote || (newStatus === "Approved" ? "Deliverable approved without notes." : "Revisions requested."),
        reviewed_by: reviewerString,
      }),
    }).catch((err) => console.log("Approvals sync bypass:", err));
  };

  const renderStatusBadge = (status: ApprovalItem["status"]) => {
    if (status === "Pending Review") {
      return (
        <Badge variant="review" dot>
          Pending Review
        </Badge>
      );
    }
    if (status === "Approved") {
      return (
        <Badge variant="active" dot>
          Approved
        </Badge>
      );
    }
    return (
      <Badge variant="critical" dot>
        Changes Requested
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & METRICS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-[#242E29]">
              Deliverable Sign-Off Queue
            </h2>
            <Badge variant="brand">Internal Quality Gate</Badge>
          </div>
          <p className="text-xs text-[#65746C] mt-0.5">
            Internal review, QA validation, and formal sign-offs for client milestones before production release.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#65746C]">Storage Engine:</span>
          <Badge variant="neutral">GIM Database (Supabase)</Badge>
        </div>
      </div>

      {/* 2. SUMMARY COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterStatus("pending review")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === "pending review"
              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
              : "bg-white text-[#242E29] border-[#E8E2DD] hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider ${filterStatus === "pending review" ? "text-white/80" : "text-amber-800"}`}>
              Pending Review
            </p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-1">{pendingCount}</p>
          <p className={`text-[11px] mt-0.5 ${filterStatus === "pending review" ? "text-white/70" : "text-[#65746C]"}`}>
            Requires leadership or PO sign-off
          </p>
        </div>

        <div
          onClick={() => setFilterStatus("approved")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === "approved"
              ? "bg-[#466B53] text-white border-[#466B53] shadow-xs"
              : "bg-white text-[#242E29] border-[#E8E2DD] hover:border-[#466B53]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider ${filterStatus === "approved" ? "text-white/80" : "text-[#466B53]"}`}>
              Approved Deliverables
            </p>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold mt-1">{approvedCount}</p>
          <p className={`text-[11px] mt-0.5 ${filterStatus === "approved" ? "text-white/70" : "text-[#65746C]"}`}>
            Signed off and live in client environments
          </p>
        </div>

        <div
          onClick={() => setFilterStatus("changes requested")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterStatus === "changes requested"
              ? "bg-rose-700 text-white border-rose-700 shadow-xs"
              : "bg-white text-[#242E29] border-[#E8E2DD] hover:border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider ${filterStatus === "changes requested" ? "text-white/80" : "text-rose-700"}`}>
              Changes Requested
            </p>
            <RotateCcw className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold mt-1">{changesCount}</p>
          <p className={`text-[11px] mt-0.5 ${filterStatus === "changes requested" ? "text-white/70" : "text-[#65746C]"}`}>
            Returned to delivery team for revisions
          </p>
        </div>
      </div>

      {/* 3. APPROVAL ITEMS TABLE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3.5 px-4 border-b border-[#E8E2DD]">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-sm">Sign-Off Submissions</CardTitle>
            <Badge variant="neutral">
              {filteredApprovals.length} item{filteredApprovals.length === 1 ? "" : "s"}
            </Badge>
          </div>
          {filterStatus !== "all" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilterStatus("all")}
              className="text-xs"
            >
              Show All Submissions
            </Button>
          )}
        </CardHeader>

        <div className="divide-y divide-[#E8E2DD]/60">
          {filteredApprovals.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-[#FBF6F3]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#3D5249] text-[11px] bg-[#466B53]/15 px-2 py-0.5 rounded border border-[#466B53]/25">
                    {item.code}
                  </span>
                  <h4 className="font-semibold text-sm text-[#242E29] leading-snug">
                    {item.title}
                  </h4>
                  {renderStatusBadge(item.status)}
                </div>

                <p className="text-xs text-[#65746C] line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#65746C] pt-1">
                  <span className="flex items-center space-x-1 font-medium text-[#242E29]">
                    <Building2 className="w-3.5 h-3.5 text-[#518E6A]" />
                    <span>{item.client}</span>
                  </span>
                  <span>Submitted by: <strong>{item.submittedBy}</strong></span>
                  <span>Reviewer: <strong>{item.assignedReviewer}</strong></span>
                  <span>Milestone: <strong>{item.targetMilestone}</strong></span>
                </div>

                {item.reviewedAt && (
                  <div className="p-2.5 rounded-lg bg-[#EDFDF5] border border-[#C6F6D5] text-[11px] text-[#276749] mt-2 flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#38A169]" />
                    <div>
                      <span className="font-bold">Reviewed by {item.reviewedBy} on {item.reviewedAt}:</span>{" "}
                      <span>{item.reviewNotes}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                {item.status === "Pending Review" && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setActiveAction("approve");
                        setFeedbackNote("");
                      }}
                      className="flex items-center space-x-1 text-xs whitespace-nowrap"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Sign Off / Approve</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setActiveAction("reject");
                        setFeedbackNote("");
                      }}
                      className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200 whitespace-nowrap"
                    >
                      <span>Request Changes</span>
                    </Button>
                  </>
                )}
                {item.status !== "Pending Review" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(item);
                      setActiveAction(null);
                    }}
                    className="text-xs"
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* SIGN-OFF & REVISION MODAL */}
      {/* ========================================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8E2DD] max-w-lg w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#E8E2DD] bg-[#FBF6F3] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#3D5249] text-xs bg-[#466B53]/15 px-2 py-0.5 rounded border border-[#466B53]/25">
                  {selectedItem.code}
                </span>
                <span className="font-semibold text-xs text-[#242E29]">
                  {activeAction === "approve"
                    ? "Deliverable Quality Sign-Off"
                    : activeAction === "reject"
                    ? "Request Deliverable Changes"
                    : "Deliverable Details"}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setActiveAction(null);
                }}
                className="p-1 rounded text-[#65746C] hover:text-[#242E29]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-sm text-[#242E29]">{selectedItem.title}</h4>
                <p className="text-[11px] text-[#518E6A] font-semibold mt-0.5">
                  {selectedItem.client} · {selectedItem.targetMilestone}
                </p>
                <p className="text-xs text-[#65746C] mt-2 leading-relaxed">
                  {selectedItem.summary}
                </p>
              </div>

              {activeAction && (
                <div className="space-y-2 pt-2 border-t border-[#E8E2DD]">
                  <label className="block text-[11px] font-semibold text-[#242E29]">
                    {activeAction === "approve"
                      ? "Sign-Off Notes / QA Signatures (Optional):"
                      : "Required Changes & Action Items (Mandatory):"}
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder={
                      activeAction === "approve"
                        ? "e.g., Verified in GoHighLevel test mode. Copy and forms align with client brand."
                        : "e.g., Please fix mobile margins on the consultation booking page and re-verify SMS alert tag."
                    }
                    className="w-full p-2.5 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                  />
                  <div className="p-2.5 rounded-lg bg-[#466B53]/10 border border-[#466B53]/25 text-[11px] text-[#3D5249]">
                    Reviewer signature will be recorded as:{" "}
                    <strong>{currentUserName} ({currentUserNickname})</strong>
                  </div>
                </div>
              )}

              {selectedItem.reviewedAt && !activeAction && (
                <div className="p-3 rounded-lg bg-[#EDFDF5] border border-[#C6F6D5] text-xs text-[#276749] space-y-1">
                  <div className="font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Signed off by {selectedItem.reviewedBy}</span>
                  </div>
                  <p className="text-[11px] text-[#65746C]">{selectedItem.reviewedAt}</p>
                  <p className="pt-1 text-[#242E29]">{selectedItem.reviewNotes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#E8E2DD] bg-[#FBF6F3] flex items-center justify-end space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedItem(null);
                  setActiveAction(null);
                }}
              >
                Close
              </Button>

              {activeAction === "approve" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSignOff(selectedItem.id, "Approved")}
                  className="flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Approval</span>
                </Button>
              )}

              {activeAction === "reject" && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!feedbackNote.trim()}
                  onClick={() => handleSignOff(selectedItem.id, "Changes Requested")}
                  className="bg-rose-700 hover:bg-rose-800 text-white"
                >
                  Submit Revision Request
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
