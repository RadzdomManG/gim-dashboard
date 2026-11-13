"use client";

import React, { useState } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  Lock,
  EyeOff,
  User,
  Phone,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

interface ClientPortalViewProps {
  onExitPreview: () => void;
}

export function ClientPortalView({ onExitPreview }: ClientPortalViewProps) {
  const [activeClient, setActiveClient] = useState<"juvibolt" | "wrts">("juvibolt");

  return (
    <div className="space-y-6">
      {/* 1. RESTRICTED CLIENT MODE BANNER */}
      <div className="bg-[#3D5249] text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-[#2D3D36]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white/10 text-white shrink-0">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white">Client Portal Preview Mode</h3>
              <Badge variant="brand" className="bg-white/20 text-white border-white/30">
                Restricted Isolation Active
              </Badge>
            </div>
            <p className="text-[11px] text-[#FBF6F3]/80 mt-0.5">
              Simulating portal experience for <strong>Aaron Ofosu</strong> (Juvibolt Cybertech). Internal agency retainers, contractor rates, and other client spaces are strictly hidden.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={onExitPreview}
            className="text-xs bg-white text-[#242E29] hover:bg-[#F3EEEA]"
          >
            Exit Client Mode
          </Button>
        </div>
      </div>

      {/* 2. CLIENT WELCOME & PROGRESS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="active" dot>Active Delivery Sprint</Badge>
                <span className="text-xs font-semibold text-[#518E6A]">Progress: 88%</span>
              </div>
              <h2 className="text-xl font-bold text-[#242E29]">
                Juvibolt Cybertech — EdTech & LMS Learning Portal
              </h2>
              <p className="text-xs text-[#65746C] mt-1 leading-relaxed">
                Cybersecurity student training platform, cohort delivery systems, and GHL course funnels.
                Your GoHighLevel digital intake, patient referral workflows, and online video training course. All assets are styled in your authentic brand palette for the December Summit.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#242E29] font-medium">
                <span>Launch Readiness</span>
                <span>Fri 11 Dec 2026 (38 Days Remaining)</span>
              </div>
              <div className="w-full bg-[#E8E2DD] rounded-full h-2 overflow-hidden">
                <div className="bg-[#518E6A] h-2 rounded-full w-[72%]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dedicated Account Lead Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs">Your Dedicated GIM Team</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="flex items-center space-x-3 p-2.5 rounded-lg border border-[#E8E2DD] bg-[#FBF6F3]/40">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                EM
              </div>
              <div>
                <p className="font-bold text-[#242E29]">Erwin Manaog</p>
                <p className="text-[10px] text-[#65746C]">Project Owner & Lead Delivery</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2.5 rounded-lg border border-[#E8E2DD] bg-[#FBF6F3]/40">
              <div className="w-8 h-8 rounded-full bg-[#3D5249] text-white flex items-center justify-center font-bold text-xs shrink-0">
                RG
              </div>
              <div>
                <p className="font-bold text-[#242E29]">Radzdom Gallego (Radz)</p>
                <p className="text-[10px] text-[#466B53]">Technical Specialist & QA</p>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-[#65746C]">
              <span>Next Check-In: <strong>Monday at 10:00 AM (AEST)</strong></span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. SIGNED-OFF DELIVERABLES & UPCOMING RELEASES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Signed-Off Deliverables & Assets</CardTitle>
              <CardDescription>Verified modules ready for clinical patient traffic</CardDescription>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#38A169]" />
          </CardHeader>

          <div className="divide-y divide-[#E8E2DD]/50 p-1 text-xs">
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#242E29]">Foundation: AUD Currency & Custom Values</p>
                <p className="text-[11px] text-[#65746C]">Configured account defaults and Australian tax invoice receipting</p>
              </div>
              <Badge variant="active" dot>Live</Badge>
            </div>

            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#242E29]">Patient Referral & Consultation Booking Forms</p>
                <p className="text-[11px] text-[#65746C]">Three forms built with clinical Australian privacy notices</p>
              </div>
              <Badge variant="active" dot>Live</Badge>
            </div>

            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#242E29]">Course Shell Architecture & Video Player</p>
                <p className="text-[11px] text-[#65746C]">Curriculum modules and instructor profile cards configured</p>
              </div>
              <Badge variant="active" dot>Live</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Current Quality Reviews in Flight</CardTitle>
              <CardDescription>Pending sign-offs before public deployment</CardDescription>
            </div>
            <Clock className="w-4 h-4 text-amber-600" />
          </CardHeader>

          <div className="divide-y divide-[#E8E2DD]/50 p-1 text-xs">
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#242E29]">Gate J1: Cybersecurity Syllabus Video Curriculum</p>
                <p className="text-[11px] text-[#65746C]">Mobile responsiveness review and video CDN streaming check</p>
              </div>
              <Badge variant="review" dot>In Review</Badge>
            </div>

            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#242E29]">Gate J2: Student SMS & Email Onboarding Sequence</p>
                <p className="text-[11px] text-[#65746C]">Automated 5-part drip email campaign with calendar sync</p>
              </div>
              <Badge variant="review" dot>In Review</Badge>
            </div>

            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#242E29]">Gate J3: Custom Domain DNS Configuration</p>
                <p className="text-[11px] text-[#65746C]">juviboltcybertech.com Cloudflare edge SSL & DNS switch</p>
              </div>
              <Badge variant="upcoming" dot>Upcoming</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
