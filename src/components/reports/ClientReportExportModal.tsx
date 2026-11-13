"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Building2,
  X,
  Share2,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ClientReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
}

export function ClientReportExportModal({
  isOpen,
  onClose,
  clientName = "We Rock the Spectrum (WRTS)",
}: ClientReportExportModalProps) {
  const [downloadedCsv, setDownloadedCsv] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const csvContent = `Client,Gate Code,Deliverable,Status,Target Date,Owner
We Rock the Spectrum (WRTS),W1,Franchise Turnstile Webhook Sync,Completed,Oct 25,Radzdom
We Rock the Spectrum (WRTS),W2,Roller POS to Google Sheets Database,Completed,Oct 26,Radzdom
We Rock the Spectrum (WRTS),W3,Birthday Party Deposit & Waiver Automations,Completed,Oct 27,Radzdom
We Rock the Spectrum (WRTS),W4,CVRC Regional Center Vendor Invoicing,Completed,Oct 28,Radzdom
We Rock the Spectrum (WRTS),W5,Dead-Letter Queue Webhook Recovery,In Review,Nov 03,Radzdom
We Rock the Spectrum (WRTS),W6,GoHighLevel Lead Funnel & SMS Routing,Completed,Oct 29,Erwin
We Rock the Spectrum (WRTS),W7,Staff Shift Attendance & Check-In Trigger,In Review,Nov 03,Radzdom
We Rock the Spectrum (WRTS),W8,Customer Feedback & Review Generation,In Progress,Nov 07,Radzdom
We Rock the Spectrum (WRTS),W9,Monthly Franchise Metric Dashboards,Queued,Nov 10,BJ
We Rock the Spectrum (WRTS),W10,Full System Integration Dry Run,Queued,Dec 05,Erwin
`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GIM_Weekly_Report_WRTS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedCsv(true);
    setTimeout(() => setDownloadedCsv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E8E2DD] max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2DD] bg-[#FBF6F3] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#518E6A]" />
            <h3 className="font-bold text-sm text-[#242E29]">
              Client Weekly Progress Report
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#65746C] hover:text-[#242E29]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Preview Body (Printable Area) */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#242E29]">
          <div className="border-b border-[#E8E2DD] pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#466B53] uppercase tracking-wider">
                Grace in Motion · Client Delivery Status
              </span>
              <h2 className="text-xl font-bold text-[#242E29] mt-0.5">{clientName}</h2>
              <p className="text-xs text-[#65746C]">Reporting Period: Week of Nov 03, 2026</p>
            </div>
            <div className="text-right">
              <Badge variant="active" dot>Overall Sprint Progress: 72%</Badge>
              <p className="text-[11px] text-[#518E6A] font-semibold mt-1">Target Launch: Fri 11 Dec 2026</p>
            </div>
          </div>

          {/* Executive Overview */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-xs text-[#242E29]">Executive Summary</h4>
            <p className="text-xs text-[#65746C] leading-relaxed bg-[#FBF6F3]/60 p-3 rounded-xl border border-[#E8E2DD]">
              All core platform foundations (AUD taxation defaults, patient intake forms, and the $99 course shell) are complete. Gates G5 (6-page brand website) and G7 (enquiry workflow with Zoe's mobile SMS alert) have been submitted for QA sign-off prior to domain pointing.
            </p>
          </div>

          {/* Verification Gates Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-[#242E29]">Milestone Gates Summary</h4>
            <div className="border border-[#E8E2DD] rounded-xl overflow-hidden divide-y divide-[#E8E2DD]">
              <div className="p-2.5 bg-[#FBF6F3] flex justify-between font-semibold text-[10px] text-[#65746C] uppercase">
                <span>Gate & Deliverable</span>
                <span>Status</span>
              </div>
              <div className="p-2.5 flex justify-between items-center bg-white">
                <span>G1 Foundation & Currency</span>
                <Badge variant="active">Completed</Badge>
              </div>
              <div className="p-2.5 flex justify-between items-center bg-white">
                <span>G4 Three Client Forms with Privacy</span>
                <Badge variant="active">Completed</Badge>
              </div>
              <div className="p-2.5 flex justify-between items-center bg-white">
                <span>W1 Franchise Lead Engine Setup</span>
                <Badge variant="review">In Review</Badge>
              </div>
              <div className="p-2.5 flex justify-between items-center bg-white">
                <span>W2 n8n Webhook & Booking Sync</span>
                <Badge variant="review">In Review</Badge>
              </div>
              <div className="p-2.5 flex justify-between items-center bg-white">
                <span>W3 Custom Domain & Location Routing (werockthespectrum.com.au)</span>
                <Badge variant="upcoming">Queued (Nov 10)</Badge>
              </div>
            </div>
          </div>

          {/* Immediate Action Items */}
          <div className="p-3.5 rounded-xl border border-[#518E6A]/30 bg-[#EDFDF5]/60 space-y-1">
            <p className="font-bold text-xs text-[#276749]">Immediate Action Items for Client Call</p>
            <ul className="list-disc list-inside text-[11px] text-[#276749]/90 space-y-0.5">
              <li>Confirm mobile test text message received on Zoe's phone.</li>
              <li>Finalize Wix DNS credentials for domain transfer to GoHighLevel.</li>
              <li>Review pricing receipt format for Australian GST compliance.</li>
            </ul>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3.5 border-t border-[#E8E2DD] bg-[#FBF6F3] flex items-center justify-between">
          <span className="text-[11px] text-[#65746C]">Report generated from authentic GIM delivery data</span>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" onClick={handlePrint} className="flex items-center space-x-1.5 text-xs">
              <Printer className="w-3.5 h-3.5 text-[#518E6A]" />
              <span>Print / Save PDF</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownloadCsv} className="flex items-center space-x-1.5 text-xs">
              {downloadedCsv ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadedCsv ? "Downloaded!" : "Export CSV"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
