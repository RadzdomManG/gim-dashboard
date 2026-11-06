"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Users,
  Target,
  ShieldCheck,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Sliders,
  Sparkles,
  Search,
  X,
  Check,
  Shield,
  Layers,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

interface MembershipAccessManagerProps {
  currentUserName: string;
  currentUserRole: string;
  isCoreAdmin: boolean;
  currentUserNickname: string;
  onEditStaffScope?: (member: any) => void;
  onInviteUser?: () => void;
}

interface StaffLimitState {
  limitGoals: boolean;
  limitFinancials: boolean;
  limitUnassignedClients: boolean;
  isSuspended: boolean;
}

export function MembershipAccessManager({
  currentUserName,
  currentUserRole,
  isCoreAdmin,
  currentUserNickname,
  onEditStaffScope,
  onInviteUser,
}: MembershipAccessManagerProps) {
  // Main Category: "client" vs "gim"
  const [activeCategory, setActiveCategory] = useState<"client" | "gim">("gim");

  // Subtabs
  const [clientSubTab, setClientSubTab] = useState<"details" | "goals" | "accounts">("details");
  const [gimSubTab, setGimSubTab] = useState<"details" | "goals" | "accounts">("accounts");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [staffStatusFilter, setStaffStatusFilter] = useState<"all" | "active" | "restricted" | "suspended">("all");

  // Granular staff limits state (Admins can toggle live)
  const [staffLimits, setStaffLimits] = useState<Record<string, StaffLimitState>>({
    erwin: { limitGoals: false, limitFinancials: true, limitUnassignedClients: false, isSuspended: false },
    smm: { limitGoals: true, limitFinancials: true, limitUnassignedClients: true, isSuspended: false },
    bj: { limitGoals: false, limitFinancials: true, limitUnassignedClients: false, isSuspended: false },
    jerold: { limitGoals: false, limitFinancials: true, limitUnassignedClients: false, isSuspended: false },
    jane: { limitGoals: false, limitFinancials: true, limitUnassignedClients: false, isSuspended: false },
    jedy: { limitGoals: true, limitFinancials: true, limitUnassignedClients: true, isSuspended: false },
    ellyka: { limitGoals: false, limitFinancials: true, limitUnassignedClients: false, isSuspended: false },
    joyce: { limitGoals: false, limitFinancials: true, limitUnassignedClients: false, isSuspended: false },
    joy: { limitGoals: false, limitFinancials: true, limitUnassignedClients: true, isSuspended: false },
    aldwin: { limitGoals: false, limitFinancials: true, limitUnassignedClients: false, isSuspended: false },
    hashim: { limitGoals: false, limitFinancials: true, limitUnassignedClients: false, isSuspended: false },
    kimberly: { limitGoals: false, limitFinancials: true, limitUnassignedClients: false, isSuspended: false },
  });

  // Client Portal Limits
  const [clientPortalLimits, setClientPortalLimits] = useState<
    Record<string, { deliverablesOnly: boolean; isRevoked: boolean }>
  >({
    zoe: { deliverablesOnly: false, isRevoked: false },
    aaron: { deliverablesOnly: false, isRevoked: false },
    nathan: { deliverablesOnly: false, isRevoked: false },
    matthew: { deliverablesOnly: false, isRevoked: false },
  });

  const toggleStaffLimit = (staffKey: string, field: keyof StaffLimitState) => {
    setStaffLimits((prev) => ({
      ...prev,
      [staffKey]: {
        ...prev[staffKey],
        [field]: !prev[staffKey][field],
      },
    }));
  };

  const toggleClientPortalLimit = (clientKey: string, field: "deliverablesOnly" | "isRevoked") => {
    setClientPortalLimits((prev) => ({
      ...prev,
      [clientKey]: {
        ...prev[clientKey],
        [field]: !prev[clientKey][field],
      },
    }));
  };

  // Authentic Specialists List
  const allStaff = useMemo(
    () => [
      {
        key: "erwin",
        name: "Erwin Manaog",
        nickname: "Erwin",
        email: "erwin@graceinmotion.agency",
        role: "Project Owner",
        scope: "Little Treasures & Studio Nets",
        focus: "Sprint Delivery & QA Runbooks",
        avatarBg: "bg-[#65746C]",
      },
      {
        key: "smm",
        name: "Camille Bautista",
        nickname: "Camille",
        email: "camille.smm@graceinmotion.agency",
        role: "Social Media Specialist",
        scope: "Little Treasures Company",
        focus: "30-Day Campaign Batches & Growth",
        avatarBg: "bg-[#518E6A]",
      },
      {
        key: "bj",
        name: "BJ Ricafrente",
        nickname: "BJ",
        email: "bj@graceinmotion.agency",
        role: "Operations Specialist",
        scope: "We Rock the Spectrum & GIM Internal",
        focus: "Tool Onboarding & Franchise Flows",
        avatarBg: "bg-[#3D5249]",
      },
      {
        key: "jerold",
        name: "Jerold Recaplaza",
        nickname: "Jerold",
        email: "jerold@graceinmotion.agency",
        role: "Operations Specialist",
        scope: "Risewise",
        focus: "Multi-channel Funnels & Sprints",
        avatarBg: "bg-[#466B53]",
      },
      {
        key: "jane",
        name: "Jane Caillio",
        nickname: "Jane",
        email: "jane@graceinmotion.agency",
        role: "Project Lead",
        scope: "NoirLab",
        focus: "Brand Digital Systems & Acquisition",
        avatarBg: "bg-[#518E6A]",
      },
      {
        key: "jedy",
        name: "Jedy Caillio",
        nickname: "Jedy",
        email: "jedy@graceinmotion.agency",
        role: "Operations Specialist",
        scope: "InVogue Cleans",
        focus: "Retention Funnels & Asset Reviews",
        avatarBg: "bg-[#466B53]",
      },
      {
        key: "ellyka",
        name: "Ellyka Claire Pama",
        nickname: "Ellyka",
        email: "ellyka@graceinmotion.agency",
        role: "Operations Assistant",
        scope: "InVogue Cleans & Studio Nets",
        focus: "Client Handoffs & Meeting Digests",
        avatarBg: "bg-[#65746C]",
      },
      {
        key: "joyce",
        name: "Joyce Roble",
        nickname: "Joyce",
        email: "joyce@graceinmotion.agency",
        role: "Project Specialist",
        scope: "Studio Nets",
        focus: "Figma Component Ingestion Systems",
        avatarBg: "bg-[#3D5249]",
      },
      {
        key: "joy",
        name: "Joy Fabular",
        nickname: "Joy",
        email: "joy@graceinmotion.agency",
        role: "Operations Assistant",
        scope: "InVogue Cleans",
        focus: "Subcontractor Invoicing & Reconciliations",
        avatarBg: "bg-[#518E6A]",
      },
      {
        key: "aldwin",
        name: "Aldwin",
        nickname: "Aldwin",
        email: "aldwin@graceinmotion.agency",
        role: "Operations Assistant",
        scope: "We Rock the Spectrum (WRTS)",
        focus: "Gym Webhook & Automation Support",
        avatarBg: "bg-[#65746C]",
      },
      {
        key: "hashim",
        name: "Hashim Saudi",
        nickname: "Hashim",
        email: "hashim@graceinmotion.agency",
        role: "Tech Specialist",
        scope: "Studio Nets",
        focus: "API Integrations & Technical Ops",
        avatarBg: "bg-[#466B53]",
      },
      {
        key: "kimberly",
        name: "Kimberly Besa",
        nickname: "Kimberly",
        email: "kimberly@graceinmotion.agency",
        role: "Operations Assistant",
        scope: "Grace In Motion (Internal)",
        focus: "Agency Operations & Scorecards",
        avatarBg: "bg-[#3D5249]",
      },
    ],
    []
  );

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return allStaff.filter((staff) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = staff.name.toLowerCase().includes(q) || staff.nickname.toLowerCase().includes(q);
        const matchesRole = staff.role.toLowerCase().includes(q);
        const matchesEmail = staff.email.toLowerCase().includes(q);
        const matchesScope = staff.scope.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesEmail && !matchesScope) return false;
      }

      const limits = staffLimits[staff.key] || {
        limitGoals: false,
        limitFinancials: true,
        limitUnassignedClients: false,
        isSuspended: false,
      };

      if (staffStatusFilter === "suspended") {
        return limits.isSuspended;
      }
      if (staffStatusFilter === "restricted") {
        return limits.limitGoals || limits.limitFinancials || limits.limitUnassignedClients;
      }
      if (staffStatusFilter === "active") {
        return !limits.isSuspended;
      }
      return true;
    });
  }, [allStaff, searchQuery, staffStatusFilter, staffLimits]);

  return (
    <div className="space-y-6">
      {/* 1. TOP EXECUTIVE STATS STRIP (Clean, Engaging, WCAG AAA) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#3D5249]/15 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D5249]/10 text-[#3D5249] flex items-center justify-center font-bold shrink-0">
            <Shield className="w-5 h-5 text-[#3D5249]" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#65746C] uppercase tracking-wider">Core Admins</div>
            <div className="text-base sm:text-lg font-bold text-[#242E29]">3 Full Authority</div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#3D5249]/15 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#518E6A]/10 text-[#518E6A] flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5 text-[#518E6A]" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#65746C] uppercase tracking-wider">Delivery Squad</div>
            <div className="text-base sm:text-lg font-bold text-[#242E29]">12 Specialists</div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#3D5249]/15 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#466B53]/10 text-[#466B53] flex items-center justify-center font-bold shrink-0">
            <KeyRound className="w-5 h-5 text-[#466B53]" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#65746C] uppercase tracking-wider">Client Portals</div>
            <div className="text-base sm:text-lg font-bold text-[#242E29]">4 RLS Scoped</div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#3D5249]/15 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#65746C] uppercase tracking-wider">Tenant Isolation</div>
            <div className="text-base sm:text-lg font-bold text-emerald-800">100% Protected</div>
          </div>
        </div>
      </div>

      {/* 2. DUAL PILLAR CATEGORY SWITCHER & NAV */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#3D5249]/15 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#242E29]">
                Membership & Access Governance
              </h3>
              <Badge variant="brand" className="bg-[#466B53] text-white">
                Admin Controlled
              </Badge>
            </div>
            <p className="text-xs text-[#65746C] mt-0.5">
              Manage permission scopes, strategic goal access, and role boundaries across Internal GIM Operations and Authentic Client Accounts.
            </p>
          </div>

          {isCoreAdmin && onInviteUser && (
            <Button
              variant="primary"
              size="sm"
              onClick={onInviteUser}
              className="flex items-center gap-1.5 text-xs shadow-xs bg-[#518E6A] hover:bg-[#427457] text-white"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite New Account</span>
            </Button>
          )}
        </div>

        {/* Primary Pillar Buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#3D5249]/10">
          <button
            type="button"
            onClick={() => setActiveCategory("gim")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === "gim"
                ? "bg-[#3D5249] text-white shadow-xs"
                : "bg-[#FBF6F3] text-[#65746C] border border-[#3D5249]/10 hover:text-[#242E29] hover:bg-[#F3EEEA]"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#518E6A]" />
            <span>GIM INTERNAL ACCESS</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">15</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("client")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === "client"
                ? "bg-[#3D5249] text-white shadow-xs"
                : "bg-[#FBF6F3] text-[#65746C] border border-[#3D5249]/10 hover:text-[#242E29] hover:bg-[#F3EEEA]"
            }`}
          >
            <Building2 className="w-4 h-4 text-[#518E6A]" />
            <span>CLIENT DETAILS &amp; PORTALS</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#3D5249]/10 text-[#3D5249] font-mono">4</span>
          </button>
        </div>

        {/* Secondary Subtabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-dashed border-[#3D5249]/10">
          {activeCategory === "gim" ? (
            <>
              {(["accounts", "details", "goals"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setGimSubTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    gimSubTab === tab
                      ? "bg-[#518E6A] text-white shadow-xs"
                      : "text-[#65746C] hover:text-[#242E29] hover:bg-[#FBF6F3]"
                  }`}
                >
                  {tab === "accounts" && "Staff Permissions"}
                  {tab === "details" && "Leadership & Squad"}
                  {tab === "goals" && "Agency OKRs"}
                </button>
              ))}
            </>
          ) : (
            <>
              {(["details", "goals", "accounts"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setClientSubTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    clientSubTab === tab
                      ? "bg-[#518E6A] text-white shadow-xs"
                      : "text-[#65746C] hover:text-[#242E29] hover:bg-[#FBF6F3]"
                  }`}
                >
                  {tab === "details" && "Client Accounts"}
                  {tab === "goals" && "Client Milestones"}
                  {tab === "accounts" && "Portal Access"}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PILLAR 1: GIM INTERNAL ACCESS */}
      {/* ========================================================================= */}
      {activeCategory === "gim" && (
        <div className="space-y-5">
          {/* SUBTAB: STAFF PERMISSIONS (Admin Control: View, Limit, Remove) */}
          {gimSubTab === "accounts" && (
            <Card className="border-[#3D5249]/15 shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2DD] bg-[#FBF6F3]/50">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#518E6A]" />
                    <span>Specialist Access &amp; Permission Boundaries</span>
                  </CardTitle>
                  <CardDescription>
                    Core Admins (Divine, Radz, RA) can click any toggle below to instantly limit strategic visibility or revoke account access.
                  </CardDescription>
                </div>

                {/* Quick Filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["all", "active", "restricted", "suspended"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStaffStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors ${
                        staffStatusFilter === st
                          ? "bg-[#3D5249] text-white shadow-xs"
                          : "bg-white border border-[#E8E2DD] text-[#65746C] hover:text-[#242E29]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </CardHeader>

              {/* Search Bar for Staff */}
              <div className="p-4 border-b border-[#E8E2DD] bg-white">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
                  <input
                    type="text"
                    placeholder="Search specialist by name, role, email, or client scope..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-xl text-xs text-[#242E29] placeholder-[#65746C]/60 focus:outline-none focus:ring-1 focus:ring-[#518E6A] focus:border-[#518E6A]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65746C] hover:text-[#242E29]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Table of Staff Access */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF6F3] text-[#65746C] font-semibold border-b border-[#E8E2DD]">
                    <tr>
                      <th className="py-2.5 px-4">Specialist Member</th>
                      <th className="py-2.5 px-4">Role Title</th>
                      <th className="py-2.5 px-4">Assigned Client Scope</th>
                      <th className="py-2.5 px-4">Active Boundaries</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Admin Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2DD]/70 bg-white">
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-[#65746C] italic">
                          No specialists found matching &quot;{searchQuery}&quot;
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((staff) => {
                        const limits = staffLimits[staff.key] || {
                          limitGoals: false,
                          limitFinancials: true,
                          limitUnassignedClients: false,
                          isSuspended: false,
                        };

                        return (
                          <tr key={staff.key} className="hover:bg-[#FBF6F3]/50 transition-colors">
                            <td className="py-3 px-4 font-semibold text-[#242E29]">
                              <div className="flex items-center space-x-2.5">
                                <div
                                  className={`w-7 h-7 rounded-lg ${staff.avatarBg} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}
                                >
                                  {staff.nickname.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-[#242E29]">
                                    {staff.name}{" "}
                                    <span className="font-normal text-[#65746C]">({staff.nickname})</span>
                                  </div>
                                  <div className="text-[10px] text-[#65746C] font-mono">{staff.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <Badge variant="brand" className="text-[10px]">
                                {staff.role}
                              </Badge>
                            </td>

                            <td className="py-3 px-4 text-[#242E29] font-medium">
                              <span className="px-2 py-0.5 rounded bg-[#466B53]/10 text-[#3D5249] border border-[#466B53]/20 text-[10px] font-semibold">
                                {staff.scope}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                                {limits.limitGoals && (
                                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1">
                                    <EyeOff className="w-3 h-3 text-amber-600" /> Goals Hidden
                                  </span>
                                )}
                                {limits.limitFinancials && (
                                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-rose-600" /> Financials Locked
                                  </span>
                                )}
                                {!limits.limitGoals && !limits.limitFinancials && (
                                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-600" /> Full Scoped Access
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              {limits.isSuspended ? (
                                <Badge variant="critical" dot>
                                  Revoked
                                </Badge>
                              ) : (
                                <Badge variant="active" dot>
                                  Active
                                </Badge>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              {isCoreAdmin ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Goal Toggle Button */}
                                  <button
                                    type="button"
                                    onClick={() => toggleStaffLimit(staff.key, "limitGoals")}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                                      limits.limitGoals
                                        ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                                        : "bg-[#FBF6F3] text-[#3D5249] border-[#E8E2DD] hover:border-[#518E6A]"
                                    }`}
                                    title="Toggle strategic goal visibility for this specialist"
                                  >
                                    {limits.limitGoals ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    <span>{limits.limitGoals ? "Show Goals" : "Hide Goals"}</span>
                                  </button>

                                  {/* Financials Toggle Button */}
                                  <button
                                    type="button"
                                    onClick={() => toggleStaffLimit(staff.key, "limitFinancials")}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                                      limits.limitFinancials
                                        ? "bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200"
                                        : "bg-[#FBF6F3] text-[#3D5249] border-[#E8E2DD] hover:border-[#518E6A]"
                                    }`}
                                    title="Toggle financial and retainer visibility"
                                  >
                                    {limits.limitFinancials ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                    <span>{limits.limitFinancials ? "Unlock Rates" : "Lock Rates"}</span>
                                  </button>

                                  {/* Suspend / Restore Toggle Button */}
                                  <button
                                    type="button"
                                    onClick={() => toggleStaffLimit(staff.key, "isSuspended")}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                                      limits.isSuspended
                                        ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                                        : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
                                    }`}
                                    title="Revoke or restore this account"
                                  >
                                    {limits.isSuspended ? "Restore" : "Revoke"}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-[#65746C]/60 italic">Locked (Admin Only)</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* SUBTAB: LEADERSHIP & SQUAD (Authentic Roster View) */}
          {gimSubTab === "details" && (
            <div className="space-y-5">
              {/* Core Admins Trio */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-[#3D5249]/15 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#466B53]/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#466B53] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      DO
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#242E29]">Divine Origines</h4>
                      <Badge variant="dark" className="mt-0.5">
                        Owner
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[#242E29] font-medium">Founder &amp; Strategy Lead</p>
                  <p className="text-[11px] text-[#65746C] leading-relaxed">
                    Universal administrative authority across all client workspaces, service agreements, and agency revenue architecture.
                  </p>
                  <div className="pt-2 border-t border-[#3D5249]/10 text-[11px] space-y-1 text-[#65746C]">
                    <div className="flex items-center space-x-1.5 text-[#3D5249] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#518E6A]" />
                      <span>Commercial &amp; Financial Governance</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-[#518E6A]" />
                      <span>Executive Client Intake &amp; Retainers</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#518E6A]/30 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#518E6A]/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#518E6A] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      RG
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#242E29]">Radzdom Gallego (Radz)</h4>
                      <Badge variant="brand" className="mt-0.5 bg-[#518E6A] text-white">
                        Core Admin
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[#242E29] font-medium">Chief Automation Architect &amp; Tech Lead</p>
                  <p className="text-[11px] text-[#65746C] leading-relaxed">
                    Platform engineering, Supabase schema governance, GoHighLevel sub-accounts, n8n automations, and AI workflows.
                  </p>
                  <div className="pt-2 border-t border-[#3D5249]/10 text-[11px] space-y-1 text-[#65746C]">
                    <div className="flex items-center space-x-1.5 text-[#3D5249] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#518E6A]" />
                      <span>Full Admin &amp; Operational Authority</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-[#518E6A]" />
                      <span>Client Pipelines &amp; Zero-Leak Systems</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#3D5249]/15 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#3D5249]/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#3D5249] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      RA
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#242E29]">Ma. Rose Anne Malinao (RA)</h4>
                      <Badge variant="brand" className="mt-0.5">
                        Core Admin
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[#242E29] font-medium">Head of Operations &amp; Invoicing Lead</p>
                  <p className="text-[11px] text-[#65746C] leading-relaxed">
                    Commercial operations, contractor billing reconciliations, team KPI scorecards, and SOP enforcement.
                  </p>
                  <div className="pt-2 border-t border-[#3D5249]/10 text-[11px] space-y-1 text-[#65746C]">
                    <div className="flex items-center space-x-1.5 text-[#3D5249] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#518E6A]" />
                      <span>Subcontractor Invoicing Audits</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-[#518E6A]" />
                      <span>Weekly GIM Operational Scorecards</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Squad Grid (All 12 Specialists) */}
              <Card className="border-[#3D5249]/15 shadow-sm">
                <CardHeader className="border-b border-[#E8E2DD] bg-[#FBF6F3]/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#518E6A]" />
                        <span>Dedicated Delivery Squad &amp; Specialists (12 Specialists)</span>
                      </CardTitle>
                      <CardDescription>
                        Active specialists driving sprints, design ops, social media, and client delivery.
                      </CardDescription>
                    </div>
                    <Badge variant="brand">Full Roster</Badge>
                  </div>
                </CardHeader>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allStaff.map((staff) => (
                    <div
                      key={staff.key}
                      className="p-3.5 rounded-xl border border-[#3D5249]/15 bg-white space-y-2 hover:border-[#518E6A] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-7 h-7 rounded-lg ${staff.avatarBg} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}
                          >
                            {staff.nickname.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-[#242E29]">{staff.name}</div>
                            <div className="text-[10px] text-[#65746C]">@{staff.nickname.toLowerCase()}</div>
                          </div>
                        </div>
                        <Badge variant="brand" className="text-[9px]">
                          {staff.role}
                        </Badge>
                      </div>

                      <div className="pt-1.5 border-t border-[#E8E2DD]/70 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#65746C]">Scope:</span>
                          <span className="font-semibold text-[#3D5249]">{staff.scope}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#65746C]">Focus:</span>
                          <span className="text-[#242E29] truncate max-w-[150px]">{staff.focus}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* SUBTAB: AGENCY OKRs */}
          {gimSubTab === "goals" && (
            <Card className="border-[#3D5249]/15 shadow-sm">
              <CardHeader className="border-b border-[#E8E2DD]">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#518E6A]" />
                    <span>Internal GIM Agency Objectives &amp; Platform OKRs</span>
                  </CardTitle>
                  <CardDescription>
                    Agency-wide performance indicators, operational velocity targets, and delivery milestones.
                  </CardDescription>
                </div>
                <Badge variant="dark">Agency Targets</Badge>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {[
                  {
                    pillar: "Platform Engineering",
                    title: "100% Unified Dashboard Adoption — Zero Slack/ClickUp Tab Switching",
                    targetMetric: "All tasks, comments, and client dossiers managed directly in GIM OS",
                    progress: 94,
                    status: "Near Completion",
                  },
                  {
                    pillar: "Commercial Operations",
                    title: "Subcontractor Invoice Reconciliations Within 24 Hours",
                    targetMetric: "Zero delayed subcontractor contractor payouts and 100% AUD tax compliance",
                    progress: 88,
                    status: "On Track",
                  },
                  {
                    pillar: "Client Retention",
                    title: "95%+ Client Sprint Satisfaction & On-Time Delivery Velocity",
                    targetMetric: "Zero missed deadlines across all 6 authentic client workspaces",
                    progress: 96,
                    status: "Optimal",
                  },
                ].map((goal, gIdx) => (
                  <div key={gIdx} className="p-4 rounded-xl border border-[#3D5249]/15 bg-white space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#518E6A]">
                        {goal.pillar}
                      </span>
                      <Badge variant="active" dot>
                        {goal.status}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-sm text-[#242E29]">{goal.title}</h4>
                    <p className="text-xs text-[#65746C]">{goal.targetMetric}</p>
                    <div className="w-full bg-[#E8E2DD] h-2 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-[#466B53] h-full rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PILLAR 2: CLIENT DETAILS & PORTAL ACCESS */}
      {/* ========================================================================= */}
      {activeCategory === "client" && (
        <div className="space-y-5">
          {/* SUBTAB: CLIENT DETAILS */}
          {clientSubTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: "ltc",
                  name: "Little Treasures Company",
                  code: "LT-AU",
                  industry: "Paediatric Therapy & Education",
                  contact: "Zoe Horner (Founder)",
                  lead: "Erwin Manaog",
                  specialist: "Camille Bautista (SMM)",
                  retainer: "AUD $4,500 / mo",
                  status: "Active Sprint",
                  scope: "Dec 11 Global Autism Summit & GoHighLevel Infrastructure",
                },
                {
                  id: "wrts",
                  name: "We Rock the Spectrum (WRTS)",
                  code: "WRTS-AU",
                  industry: "Sensory Gym Franchise",
                  contact: "Marcus & Marcus",
                  lead: "Erwin Manaog",
                  specialist: "BJ Ricafrente",
                  retainer: "AUD $5,200 / mo",
                  status: "Active Retainer",
                  scope: "21 n8n Workflows, GHL Webhooks & Leadly Integration",
                },
                {
                  id: "jb",
                  name: "Juvibolt Cybertech",
                  code: "JB-AU",
                  industry: "Cybersecurity & IT Training",
                  contact: "Aaron Ofosu (Founder)",
                  lead: "Radzdom Gallego",
                  specialist: "Radz Gallego",
                  retainer: "AUD $3,800 / mo",
                  status: "Active Sprint",
                  scope: "Sub-account mg57RFEKUm6nvnSadv2D, LMS & WooCommerce",
                },
                {
                  id: "rw",
                  name: "Risewise",
                  code: "RW-US",
                  industry: "Digital Growth & Consulting",
                  contact: "Executive Team",
                  lead: "Radzdom Gallego",
                  specialist: "Jerold Recaplaza",
                  retainer: "USD $3,200 / mo",
                  status: "Active Retainer",
                  scope: "Automated Appointment Routing & Funnel Tracking",
                },
                {
                  id: "sn",
                  name: "Studio Nets",
                  code: "SN-US",
                  industry: "Design & Creative Systems",
                  contact: "Nathan Blake (Founder)",
                  lead: "Erwin Manaog",
                  specialist: "Joyce Roble & Jedy Caillio",
                  retainer: "USD $2,800 / mo",
                  status: "Active Sprint",
                  scope: "Creative Ingestion Questionnaires & Figma Handoff Runbook",
                },
                {
                  id: "ivc",
                  name: "InVogue Cleans",
                  code: "IVC-US",
                  industry: "Premium Cleaning Services",
                  contact: "Matthew Robbins (Founder)",
                  lead: "RA Malinao",
                  specialist: "Jedy Caillio & Joy Fabular",
                  retainer: "USD $2,400 / mo",
                  status: "Active Retainer",
                  scope: "30-60-90 Day Retention Funnel & Billing Reconciliation",
                },
              ].map((client) => (
                <div
                  key={client.id}
                  className="bg-white rounded-2xl p-5 border border-[#3D5249]/15 shadow-sm space-y-3 flex flex-col justify-between hover:border-[#518E6A] transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#466B53]/10 text-[#3D5249]">
                        {client.code}
                      </span>
                      <Badge variant="active" dot>
                        {client.status}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-sm text-[#242E29]">{client.name}</h4>
                    <p className="text-[11px] text-[#65746C]">{client.industry}</p>

                    <div className="pt-2 border-t border-[#3D5249]/10 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#65746C]">Account Lead:</span>
                        <span className="font-bold text-[#242E29]">{client.lead}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#65746C]">Assigned Specialist:</span>
                        <span className="font-bold text-[#518E6A]">{client.specialist}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#65746C]">Point of Contact:</span>
                        <span className="text-[#242E29]">{client.contact}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FBF6F3] text-[11px] text-[#3D5249] border border-[#E8E2DD]">
                      <span className="font-semibold block text-[10px] uppercase text-[#65746C]">Active Scope</span>
                      {client.scope}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#3D5249]/10 flex items-center justify-between">
                    <span className="text-[11px] font-bold font-mono text-[#3D5249]">{client.retainer}</span>
                    <Badge variant="brand" className="text-[9px]">
                      SLA Active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUBTAB: CLIENT GOALS */}
          {clientSubTab === "goals" && (
            <Card className="border-[#3D5249]/15 shadow-sm">
              <CardHeader className="border-b border-[#E8E2DD]">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#518E6A]" />
                    <span>Client Objectives &amp; Q4 Milestones</span>
                  </CardTitle>
                  <CardDescription>
                    Track goals committed to authentic clients with SLA tracking and delivery velocity.
                  </CardDescription>
                </div>
                <Badge variant="brand">Delivery SLA Active</Badge>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {[
                  {
                    client: "Little Treasures Company",
                    goal: "Dec 11 Global Autism Summit & Ticket Funnel Launch",
                    targetMetric: "100 Early Bird Registrations + Stripe AUD Checkout",
                    progress: 75,
                    dueDate: "11 Dec 2026",
                    owner: "Erwin Manaog",
                    status: "On Track",
                  },
                  {
                    client: "We Rock the Spectrum (WRTS)",
                    goal: "Franchise Automation Sync & Webhook Error Catching",
                    targetMetric: "21 Workflows operational with dead-letter queue recovery",
                    progress: 85,
                    dueDate: "20 Nov 2026",
                    owner: "Radzdom Gallego",
                    status: "On Track",
                  },
                  {
                    client: "Juvibolt Cybertech",
                    goal: "GoHighLevel Sub-Account & WordPress LMS Integration",
                    targetMetric: "Sub-account mg57RFEKUm6nvnSadv2D live with course enrollments",
                    progress: 90,
                    dueDate: "15 Nov 2026",
                    owner: "Radzdom Gallego",
                    status: "Near Completion",
                  },
                  {
                    client: "Studio Nets",
                    goal: "Figma Component Ingestion & Client Questionnaire Handoff",
                    targetMetric: "48-Hour turnkey wireframe delivery pipeline",
                    progress: 60,
                    dueDate: "18 Nov 2026",
                    owner: "Erwin Manaog",
                    status: "Review",
                  },
                  {
                    client: "InVogue Cleans",
                    goal: "30-60-90 Day Retention Funnel & Subcontractor Reconciliations",
                    targetMetric: "25% Recurring booking lift + Weekly payout audits",
                    progress: 45,
                    dueDate: "25 Nov 2026",
                    owner: "RA Malinao",
                    status: "In Progress",
                  },
                ].map((g, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[#3D5249]/15 bg-white space-y-2.5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#518E6A] uppercase tracking-wider">{g.client}</span>
                          <span className="text-[10px] text-[#65746C]">&bull; Target: {g.dueDate}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#242E29] mt-0.5">{g.goal}</h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={g.status === "On Track" || g.status === "Near Completion" ? "active" : "review"} dot>
                          {g.status}
                        </Badge>
                        <span className="text-[10px] font-semibold text-[#65746C] bg-[#FBF6F3] px-2 py-0.5 rounded border border-[#E8E2DD]">
                          Owner: {g.owner}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#65746C]">
                        <span>
                          Key Metric: <strong className="text-[#242E29]">{g.targetMetric}</strong>
                        </span>
                        <span className="font-bold text-[#3D5249]">{g.progress}%</span>
                      </div>
                      <div className="w-full bg-[#E8E2DD] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#518E6A] h-full rounded-full transition-all duration-300"
                          style={{ width: `${g.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SUBTAB: CLIENT PORTAL LOGINS */}
          {clientSubTab === "accounts" && (
            <Card className="border-[#3D5249]/15 shadow-sm">
              <CardHeader className="border-b border-[#E8E2DD]">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#518E6A]" />
                    <span>External Client Portal Logins &amp; Single-Tenant Scopes</span>
                  </CardTitle>
                  <CardDescription>
                    Verified client principals who log in to review their respective deliverables and invoices in strict tenant isolation.
                  </CardDescription>
                </div>
                <Badge variant="dark">RLS Isolated</Badge>
              </CardHeader>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF6F3] text-[#65746C] font-semibold border-b border-[#E8E2DD]">
                    <tr>
                      <th className="py-2.5 px-4">Client Principal</th>
                      <th className="py-2.5 px-4">Authorized Client Scope</th>
                      <th className="py-2.5 px-4">Portal Visibility Mode</th>
                      <th className="py-2.5 px-4">Tenant Boundary</th>
                      <th className="py-2.5 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2DD]/70 bg-white">
                    {[
                      {
                        key: "zoe",
                        name: "Zoe Horner",
                        email: "zoe@littletreasures.com.au",
                        client: "Little Treasures Company",
                        role: "Client Principal / Founder",
                      },
                      {
                        key: "aaron",
                        name: "Aaron Ofosu",
                        email: "aaron@juviboltcybertech.com",
                        client: "Juvibolt Cybertech",
                        role: "Founder / Client Lead",
                      },
                      {
                        key: "nathan",
                        name: "Nathan Blake",
                        email: "nathan@studionets.com.au",
                        client: "Studio Nets",
                        role: "Creative Director / Founder",
                      },
                      {
                        key: "matthew",
                        name: "Matthew Robbins",
                        email: "matthew@invoguecleans.com",
                        client: "InVogue Cleans",
                        role: "Commercial Director / Founder",
                      },
                    ].map((account) => {
                      const limits = clientPortalLimits[account.key] || { deliverablesOnly: false, isRevoked: false };
                      return (
                        <tr key={account.key} className="hover:bg-[#FBF6F3]/50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#242E29]">
                            <div className="font-bold text-[#242E29]">{account.name}</div>
                            <div className="text-[10px] text-[#65746C] font-mono">{account.email}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#242E29]">
                            <span className="px-2 py-0.5 rounded bg-[#466B53]/10 text-[#3D5249] border border-[#466B53]/20 text-[10px] font-bold">
                              {account.client}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {limits.isRevoked ? (
                              <Badge variant="critical" dot>
                                Access Revoked
                              </Badge>
                            ) : limits.deliverablesOnly ? (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                                <Lock className="w-3 h-3" /> Approved Deliverables Only
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                                <CheckCircle2 className="w-3 h-3" /> Full Account &amp; Invoices
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-[#65746C]">
                            Strict Single-Tenant Isolation
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isCoreAdmin ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleClientPortalLimit(account.key, "deliverablesOnly")}
                                  className="text-[11px] text-[#518E6A] hover:underline font-semibold"
                                >
                                  {limits.deliverablesOnly ? "Expand View" : "Limit View"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleClientPortalLimit(account.key, "isRevoked")}
                                  className={`text-[11px] font-semibold hover:underline ${
                                    limits.isRevoked ? "text-emerald-700" : "text-rose-700"
                                  }`}
                                >
                                  {limits.isRevoked ? "Restore Access" : "Revoke"}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#65746C]/60 italic">Locked</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
