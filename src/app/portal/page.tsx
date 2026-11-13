"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Calendar,
  Building2,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
  HelpCircle,
  FileCheck2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ClientReportExportModal } from "@/components/reports/ClientReportExportModal";

export default function StandaloneClientPortalPage() {
  const [selectedClient, setSelectedClient] = useState("Juvibolt Cybertech");
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBF6F3] text-[#242E29] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#3D5249] text-white px-6 py-4 border-b border-[#3D5249]/20 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-1.5 border border-white/20">
              <Image
                src="/gim-mark-white.png"
                alt="GIM"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-[#FBF6F3]/70 font-semibold">
                Grace in Motion
              </div>
              <h1 className="text-lg font-bold font-serif tracking-tight text-white flex items-center gap-2">
                Client Partner Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="text-xs bg-white/10 text-white border border-white/20 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-white/40 font-medium"
            >
              <option value="Juvibolt Cybertech" className="text-[#242E29]">
                Juvibolt Cybertech (JB)
              </option>
              <option value="Studio Nets" className="text-[#242E29]">
                Studio Nets (SN)
              </option>
              <option value="InVogue Cleans" className="text-[#242E29]">
                InVogue Cleans (IVC)
              </option>
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsReportOpen(true)}
              className="hidden sm:inline-flex"
            >
              <Download className="w-4 h-4" />
              Download Weekly PDF
            </Button>

            <Link
              href="/"
              className="text-xs text-white/70 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Switch to Internal View &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-8 space-y-8">
        {/* Client Welcome Banner */}
        <div className="bg-white rounded-2xl border border-[#3D5249]/15 p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#3D5249]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="active" dot>Active Retainer Partnership</Badge>
                <span className="text-xs text-[#65746C] font-mono">Q4 Sprint Velocity</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#3D5249] tracking-tight">
                Welcome back, {selectedClient.split(" ")[0]} Team
              </h2>
              <p className="text-sm text-[#65746C] max-w-2xl leading-relaxed">
                Here is your live deliverable roadmap, approved assets, and upcoming milestones managed by your dedicated Grace in Motion delivery pod.
              </p>
            </div>

            <div className="p-4 bg-[#FBF6F3] rounded-xl border border-[#3D5249]/10 text-center sm:text-right shrink-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#65746C]">Target Milestone</div>
              <div className="text-lg font-bold font-serif text-[#3D5249] mt-0.5">Summit Launch</div>
              <div className="text-xs text-[#518E6A] font-semibold mt-0.5 flex items-center justify-center sm:justify-end gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Friday, 11 Dec 2026
              </div>
            </div>
          </div>
        </div>

        {/* Deliverables Ready for Client Review */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#3D5249] flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#518E6A]" />
                Deliverables & Approved Milestones
              </h3>
              <p className="text-xs text-[#65746C]">
                Review production-ready assets signed off by Grace in Motion quality assurance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex-col items-start gap-1 pb-3">
                <div className="flex items-center justify-between w-full">
                  <Badge variant="active">Production Ready</Badge>
                  <span className="text-xs font-mono text-[#65746C]">Gate J1</span>
                </div>
                <CardTitle className="text-base text-[#3D5249] mt-2">
                  Juvibolt EdTech Platform & Tutor LMS Architecture
                </CardTitle>
                <CardDescription className="text-xs text-[#65746C]">
                  Full responsive course catalog, Discord sync webhook, and cybersecurity bootcamp registration funnel.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-[#3D5249]/10">
                  <span className="text-xs text-[#65746C]">Lead: Radzdom Gallego</span>
                  <a
                    href="https://juviboltcybertech.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#518E6A] hover:text-[#466B53]"
                  >
                    Preview Live Site
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex-col items-start gap-1 pb-3">
                <div className="flex items-center justify-between w-full">
                  <Badge variant="review">Pending Verification</Badge>
                  <span className="text-xs font-mono text-[#65746C]">Gate G7</span>
                </div>
                <CardTitle className="text-base text-[#3D5249] mt-2">
                  Enquiry Routing & Immediate Phone Alert
                </CardTitle>
                <CardDescription className="text-xs text-[#65746C]">
                  GHL automation routing parent therapy enquiries directly to Zoe with automated confirmation SMS.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-[#3D5249]/10">
                  <span className="text-xs text-[#65746C]">Lead: Radzdom Gallego</span>
                  <span className="text-xs font-semibold text-[#3D5249]">
                    Review in Progress
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Operational Security Isolation Banner */}
        <div className="p-4 rounded-xl bg-[#3D5249]/5 border border-[#3D5249]/15 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-[#3D5249]">
            <ShieldCheck className="w-5 h-5 text-[#518E6A] shrink-0" />
            <span>
              <strong>Secure Client Boundary Active:</strong> All internal financial retainers, GIM team internal capacity notes, and other client environments are strictly isolated from this portal view.
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#65746C] shrink-0">Tenant: LTC-AU-2026</span>
        </div>
      </main>

      {/* Export Report Modal */}
      <ClientReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        clientName={selectedClient}
      />
    </div>
  );
}
