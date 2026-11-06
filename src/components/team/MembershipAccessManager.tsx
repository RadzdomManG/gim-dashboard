"use client";

import React, { useState } from "react";
import {
  Building2,
  Users,
  Target,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  UserPlus,
  Mail,
  Sliders,
  DollarSign,
  TrendingUp,
  Sparkles,
  RefreshCw,
  XCircle,
  ExternalLink,
  Check,
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
  const [activeCategory, setActiveCategory] = useState<"client" | "gim">("client");

  // Subtabs
  const [clientSubTab, setClientSubTab] = useState<"details" | "goals" | "accounts">("details");
  const [gimSubTab, setGimSubTab] = useState<"details" | "goals" | "accounts">("details");

  // Granular staff limits state (Admins can toggle live)
  const [staffLimits, setStaffLimits] = useState<Record<string, StaffLimitState>>({
    erwin: { limitGoals: false, limitFinancials: true, limitUnassignedClients: false, isSuspended: false },
    smm: { limitGoals: true, limitFinancials: true, limitUnassignedClients: true, isSuspended: false },
    bj: { limitGoals: false, limitFinancials: true, limitUnassignedClients: false, isSuspended: false },
    joy: { limitGoals: false, limitFinancials: true, limitUnassignedClients: true, isSuspended: false },
    jedy: { limitGoals: true, limitFinancials: true, limitUnassignedClients: true, isSuspended: false },
  });

  // Client Portal Limits
  const [clientPortalLimits, setClientPortalLimits] = useState<Record<string, { deliverablesOnly: boolean; isRevoked: boolean }>>({
    zoe: { deliverablesOnly: false, isRevoked: false },
    studio_lead: { deliverablesOnly: false, isRevoked: false },
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

  return (
    <div className="space-y-6">
      {/* 1. TOP DUAL PILLAR CATEGORY SWITCHER */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#3D5249]/15 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#242E29]">
                Membership & Access Governance
              </h3>
              <Badge variant="brand">Admin Controlled</Badge>
            </div>
            <p className="text-xs text-[#65746C] mt-0.5">
              Configure visibility scopes, goal access, and account permissions across Authentic Clients and Internal GIM operations.
            </p>
          </div>

          {isCoreAdmin && onInviteUser && (
            <Button
              variant="primary"
              size="sm"
              onClick={onInviteUser}
              className="flex items-center gap-1.5 text-xs shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite New Account</span>
            </Button>
          )}
        </div>

        {/* Primary Category Switcher (CLIENT ACCESS vs GIM ACCESS) */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#3D5249]/10">
          <button
            type="button"
            onClick={() => setActiveCategory("client")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === "client"
                ? "bg-[#3D5249] text-white shadow-xs"
                : "bg-[#FBF6F3] text-[#65746C] border border-[#3D5249]/10 hover:text-[#242E29]"
            }`}
          >
            <Building2 className="w-4 h-4 text-[#518E6A]" />
            <span>CLIENT DETAILS &amp; ACCESS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("gim")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === "gim"
                ? "bg-[#3D5249] text-white shadow-xs"
                : "bg-[#FBF6F3] text-[#65746C] border border-[#3D5249]/10 hover:text-[#242E29]"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#518E6A]" />
            <span>GIM DETAILS &amp; ACCESS</span>
          </button>
        </div>

        {/* Subtabs for Current Category */}
        <div className="flex items-center gap-2 pt-1 border-t border-dashed border-[#3D5249]/10">
          {activeCategory === "client" ? (
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
                  {tab === "details" && "Client Details"}
                  {tab === "goals" && "Client Goals"}
                  {tab === "accounts" && "Client Accounts"}
                </button>
              ))}
            </>
          ) : (
            <>
              {(["details", "goals", "accounts"] as const).map((tab) => (
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
                  {tab === "details" && "GIM Details"}
                  {tab === "goals" && "GIM Goals"}
                  {tab === "accounts" && "GIM Accounts"}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PILLAR 1: CLIENT ACCESS & GOVERNANCE CONTENT */}
      {/* ========================================================================= */}
      {activeCategory === "client" && (
        <div className="space-y-4">
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
                  id: "sn",
                  name: "Studio Nets",
                  code: "SN-US",
                  industry: "Design & Creative Systems",
                  contact: "Samantha Lee",
                  lead: "Erwin Manaog",
                  specialist: "Jedy Caillo",
                  retainer: "USD $2,800 / mo",
                  status: "Active Sprint",
                  scope: "Creative Ingestion Questionnaires & Figma Handoff Runbook",
                },
                {
                  id: "ivc",
                  name: "InVogue Cleans",
                  code: "IVC-US",
                  industry: "Premium Cleaning Services",
                  contact: "Commercial Director",
                  lead: "RA Malinao",
                  specialist: "Joy Fabular",
                  retainer: "USD $2,400 / mo",
                  status: "Active Retainer",
                  scope: "30-60-90 Day Retention Funnel & Billing Reconciliation",
                },
                {
                  id: "ao",
                  name: "Aaron Ofosu Bootcamp",
                  code: "AO-AU",
                  industry: "Fitness & Athletic Training",
                  contact: "Head Coach Aaron",
                  lead: "Divine Origines",
                  specialist: "BJ Ricafrente",
                  retainer: "AUD $1,800 / mo",
                  status: "Active Retainer",
                  scope: "Student Pipeline & Tool Subscriptions Onboarding",
                },
                {
                  id: "t2t",
                  name: "Tch2Thrive",
                  code: "T2T-US",
                  industry: "Education & Teacher Development",
                  contact: "Executive Director",
                  lead: "RA Malinao",
                  specialist: "Joy Fabular",
                  retainer: "USD $2,200 / mo",
                  status: "Active Retainer",
                  scope: "Contractor Log Audits & LMS Integration Scoping",
                },
              ].map((client) => (
                <div
                  key={client.id}
                  className="bg-white rounded-2xl p-5 border border-[#3D5249]/15 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#466B53]/10 text-[#3D5249]">
                        {client.code}
                      </span>
                      <Badge variant="active" dot>{client.status}</Badge>
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

                    <div className="p-2 rounded-xl bg-[#FBF6F3] text-[11px] text-[#3D5249]">
                      <span className="font-semibold block text-[10px] uppercase text-[#65746C]">Active Scope</span>
                      {client.scope}
                    </div>
                  </div>

                  {isCoreAdmin && onEditStaffScope && (
                    <div className="pt-2 border-t border-[#3D5249]/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          onEditStaffScope({
                            id: client.id,
                            name: client.name,
                            role: "Client Account",
                            assignedClients: [client.name],
                          })
                        }
                        className="text-xs font-bold text-[#518E6A] hover:text-[#3D5249] flex items-center gap-1"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Manage Staff Scope</span>
                      </button>
                      <span className="text-[11px] font-bold font-mono text-[#3D5249]">{client.retainer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SUBTAB: CLIENT GOALS */}
          {clientSubTab === "goals" && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#518E6A]" />
                    <span>Client Objectives &amp; Q4 Milestones</span>
                  </CardTitle>
                  <CardDescription>
                    Track goals committed to authentic clients. Admins can limit whether non-admin staff see strategic target details.
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
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#3D5249]/15 bg-[#FBF6F3]/40 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#518E6A] uppercase tracking-wider">{g.client}</span>
                          <span className="text-[10px] text-[#65746C]">&bull; Target: {g.dueDate}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#242E29] mt-0.5">{g.goal}</h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={g.status === "On Track" ? "active" : "review"} dot>
                          {g.status}
                        </Badge>
                        {isCoreAdmin && (
                          <span className="text-[10px] font-semibold text-[#65746C] bg-white px-2 py-0.5 rounded border border-[#E8E2DD]">
                            Owner: {g.owner}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#65746C]">
                        <span>Key Metric: <strong className="text-[#242E29]">{g.targetMetric}</strong></span>
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

          {/* SUBTAB: CLIENT ACCOUNTS */}
          {clientSubTab === "accounts" && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#518E6A]" />
                    <span>External Client Portal Logins &amp; Single-Tenant Scopes</span>
                  </CardTitle>
                  <CardDescription>
                    Manage verified client stakeholders who have portal access to review deliverables and invoices.
                  </CardDescription>
                </div>
                <Badge variant="dark">RLS Isolated</Badge>
              </CardHeader>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF6F3] text-[#65746C] font-semibold border-b border-[#E8E2DD]">
                    <tr>
                      <th className="py-2.5 px-4">Client User</th>
                      <th className="py-2.5 px-4">Authorized Client Scope</th>
                      <th className="py-2.5 px-4">Portal Visibility Mode</th>
                      <th className="py-2.5 px-4">Tenant Boundary</th>
                      <th className="py-2.5 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2DD]/70">
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
                            <div>{account.name}</div>
                            <div className="text-[10px] text-[#65746C] font-normal">{account.email}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#242E29]">
                            <span className="px-2 py-0.5 rounded bg-[#466B53]/10 text-[#3D5249] border border-[#466B53]/20 text-[10px] font-bold">
                              {account.client}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {limits.isRevoked ? (
                              <Badge variant="critical" dot>Access Revoked</Badge>
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
                              <span className="text-[11px] text-[#65746C]/60">Locked</span>
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

      {/* ========================================================================= */}
      {/* 3. PILLAR 2: GIM INTERNAL ACCESS & GOVERNANCE CONTENT */}
      {/* ========================================================================= */}
      {activeCategory === "gim" && (
        <div className="space-y-4">
          {/* SUBTAB: GIM DETAILS */}
          {gimSubTab === "details" && (
            <div className="space-y-4">
              {/* Leadership Trio */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-[#3D5249]/15 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#466B53] text-white font-bold text-sm flex items-center justify-center">
                      DO
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#242E29]">Divine Origines</h4>
                      <Badge variant="dark">Owner</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[#242E29] font-medium">Executive Strategy &amp; Client Discovery</p>
                  <p className="text-[11px] text-[#65746C]">Universal authority across all 6 clients, contracts, and revenue decisions.</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#3D5249]/15 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#518E6A] text-white font-bold text-sm flex items-center justify-center">
                      RG
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#242E29]">Radzdom Gallego (Radz)</h4>
                      <Badge variant="brand">Core Admin</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[#242E29] font-medium">Chief Automation Architect &amp; Systems Lead</p>
                  <p className="text-[11px] text-[#65746C]">Platform engineering, database schema governance, and webhook integrations.</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#3D5249]/15 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3D5249] text-white font-bold text-sm flex items-center justify-center">
                      RA
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#242E29]">Ma. Rose Anne Malinao (RA)</h4>
                      <Badge variant="brand">Core Admin</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[#242E29] font-medium">Commercial Operations &amp; Invoicing Lead</p>
                  <p className="text-[11px] text-[#65746C]">Subcontractor billing, Stripe AUD tax compliance, and commercial project delivery.</p>
                </div>
              </div>

              {/* Operations & Delivery Specialists Grid */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Delivery Specialists &amp; Operations Support</CardTitle>
                    <CardDescription>
                      Staff dedicated to client deliverables, sprint velocity, and content management.
                    </CardDescription>
                  </div>
                </CardHeader>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { name: "Erwin Manaog", role: "Project Owner", focus: "Little Treasures & Studio Nets Sprint Velocity" },
                    { name: "Camille Bautista", role: "SMM Specialist", focus: "Little Treasures 30-Day Campaign Batches" },
                    { name: "BJ Ricafrente", role: "Operations Specialist", focus: "Client Kickoffs & Tool Subscriptions" },
                    { name: "Joy Fabular", role: "Operations Assistant", focus: "Contractor Log Audits & Billing Reconciliations" },
                  ].map((staff, sIdx) => (
                    <div key={sIdx} className="p-3.5 rounded-xl border border-[#3D5249]/10 bg-[#FBF6F3]/50 space-y-1 text-xs">
                      <p className="font-bold text-[#242E29]">{staff.name}</p>
                      <Badge variant="brand" className="text-[10px]">{staff.role}</Badge>
                      <p className="text-[11px] text-[#65746C] pt-1">{staff.focus}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* SUBTAB: GIM GOALS */}
          {gimSubTab === "goals" && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#518E6A]" />
                    <span>Internal GIM Agency Objectives &amp; Platform OKRs</span>
                  </CardTitle>
                  <CardDescription>
                    Agency-wide performance indicators, operational efficiency targets, and delivery milestones.
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
                    progress: 92,
                    status: "Near Completion",
                  },
                  {
                    pillar: "Commercial Operations",
                    title: "Subcontractor Invoice Reconciliations Within 24 Hours",
                    targetMetric: "Zero delayed subcontractor contractor payouts and 100% AUD tax compliance",
                    progress: 85,
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
                  <div
                    key={gIdx}
                    className="p-4 rounded-xl border border-[#3D5249]/15 bg-white space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#518E6A]">
                        {goal.pillar}
                      </span>
                      <Badge variant="active" dot>{goal.status}</Badge>
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

          {/* SUBTAB: GIM ACCOUNTS (Admin Control: View, Limit, Remove) */}
          {gimSubTab === "accounts" && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#518E6A]" />
                    <span>GIM Staff Access &amp; Permission Boundaries</span>
                  </CardTitle>
                  <CardDescription>
                    Core Admins (Divine, Radz, RA) can see, view, limit what staff can see, or remove / revoke account access.
                  </CardDescription>
                </div>
                <Badge variant="brand">Admin Authority</Badge>
              </CardHeader>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF6F3] text-[#65746C] font-semibold border-b border-[#E8E2DD]">
                    <tr>
                      <th className="py-2.5 px-4">Team Member</th>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4">Client Scope</th>
                      <th className="py-2.5 px-4">Visibility Restrictions</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Admin Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2DD]/70">
                    {[
                      { key: "erwin", name: "Erwin Manaog", nickname: "Erwin", email: "erwin@graceinmotion.agency", role: "Project Owner", scope: "Little Treasures & Studio Nets" },
                      { key: "smm", name: "Camille Bautista", nickname: "Camille", email: "camille.smm@graceinmotion.agency", role: "Social Media Specialist", scope: "Little Treasures Company" },
                      { key: "bj", name: "BJ Ricafrente", nickname: "BJ", email: "bj@graceinmotion.agency", role: "Operations Specialist", scope: "We Rock the Spectrum & GIM Internal" },
                      { key: "jerold", name: "Jerold Recaplaza", nickname: "Jerold", email: "jerold@graceinmotion.agency", role: "Operations Specialist", scope: "Risewise" },
                      { key: "jane", name: "Jane Caillio", nickname: "Jane", email: "jane@graceinmotion.agency", role: "Project Lead", scope: "NoirLab" },
                      { key: "jedy", name: "Jedy Caillio", nickname: "Jedy", email: "jedy@graceinmotion.agency", role: "Operations Specialist", scope: "InVogue Cleans" },
                      { key: "ellyka", name: "Ellyka Claire Pama", nickname: "Ellyka", email: "ellyka@graceinmotion.agency", role: "Operations Assistant", scope: "InVogue Cleans & Studio Nets" },
                      { key: "joyce", name: "Joyce Roble", nickname: "Joyce", email: "joyce@graceinmotion.agency", role: "Project Specialist", scope: "Studio Nets" },
                      { key: "joy", name: "Joy Fabular", nickname: "Joy", email: "joy@graceinmotion.agency", role: "Operations Assistant", scope: "InVogue Cleans" },
                      { key: "aldwin", name: "Aldwin", nickname: "Aldwin", email: "aldwin@graceinmotion.agency", role: "Operations Assistant", scope: "We Rock the Spectrum (WRTS)" },
                      { key: "hashim", name: "Hashim Saudi", nickname: "Hashim", email: "hashim@graceinmotion.agency", role: "Tech Specialist", scope: "Studio Nets" },
                      { key: "kimberly", name: "Kimberly Besa", nickname: "Kimberly", email: "kimberly@graceinmotion.agency", role: "Operations Assistant", scope: "Grace In Motion (Internal)" },
                    ].map((staff) => {
                      const limits = staffLimits[staff.key] || { limitGoals: false, limitFinancials: true, limitUnassignedClients: false, isSuspended: false };
                      return (
                        <tr key={staff.key} className="hover:bg-[#FBF6F3]/50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#242E29]">
                            <div>{staff.name} <span className="font-normal text-[#65746C]">({staff.nickname})</span></div>
                            <div className="text-[10px] text-[#65746C] font-normal">{staff.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="brand">{staff.role}</Badge>
                          </td>
                          <td className="py-3 px-4 text-[#242E29] font-medium">
                            <span className="px-2 py-0.5 rounded bg-[#466B53]/10 text-[#3D5249] border border-[#466B53]/20 text-[10px]">
                              {staff.scope}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                              {limits.limitGoals && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold flex items-center gap-0.5">
                                  <EyeOff className="w-2.5 h-2.5" /> Goals Hidden
                                </span>
                              )}
                              {limits.limitFinancials && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-semibold flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> Financials Restricted
                                </span>
                              )}
                              {limits.limitUnassignedClients && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                                  Strict Single Account
                                </span>
                              )}
                              {!limits.limitGoals && !limits.limitUnassignedClients && (
                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Standard Scope
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {limits.isSuspended ? (
                              <Badge variant="critical" dot>Revoked</Badge>
                            ) : (
                              <Badge variant="active" dot>Active</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isCoreAdmin ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleStaffLimit(staff.key, "limitGoals")}
                                  className="text-[11px] text-[#518E6A] hover:underline font-semibold"
                                  title="Toggle whether this member can see strategic client & agency goals"
                                >
                                  {limits.limitGoals ? "Show Goals" : "Limit Goals"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleStaffLimit(staff.key, "isSuspended")}
                                  className={`text-[11px] font-semibold hover:underline ${
                                    limits.isSuspended ? "text-emerald-700" : "text-rose-700"
                                  }`}
                                  title="Remove or restore account access"
                                >
                                  {limits.isSuspended ? "Restore Access" : "Revoke"}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#65746C]/60">Locked</span>
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
