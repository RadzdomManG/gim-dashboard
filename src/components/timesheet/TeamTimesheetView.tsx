"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  Play,
  Pause,
  Square,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
  Edit2,
  History,
  ShieldCheck,
  UserCheck,
  UserX,
  Coffee,
  Check,
  Plus,
  Send,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export type AttendanceStatus = "Online" | "On Break" | "Away" | "Offline";

export interface MemberAttendance {
  id: string;
  name: string;
  nickname: string;
  role: string;
  title: string;
  isOwner?: boolean;
  isCoreAdmin?: boolean;
  avatarColor: string;
  initials: string;
  status: AttendanceStatus;
  shiftStart: string;
  shiftEnd: string;
  hoursLoggedToday: number; // e.g. 6.5
  breakMinutesLogged: number; // e.g. 25
  breakLimitMinutes: number; // default 30
  currentTask: string;
  assignedClient: string;
  latestEos?: {
    id: string;
    completedTasks: string;
    blockers: string;
    prioritiesTomorrow: string;
    publishedAt: string;
    isDraft: boolean;
  } | null;
}

export interface ScheduleAuditRecord {
  id: string;
  memberId: string;
  memberName: string;
  adjustedBy: string; // e.g. "Ma. Rose Anne (RA) Malinao"
  adjustmentDate: string;
  oldShift: string;
  newShift: string;
  reason: string;
  timestamp: string;
}

const INITIAL_MEMBERS: MemberAttendance[] = [
  {
    id: "divine",
    name: "Divine Origines",
    nickname: "Divine",
    role: "Owner",
    title: "Founder & Strategy Lead",
    isOwner: true,
    isCoreAdmin: false,
    avatarColor: "bg-[#3D5249]",
    initials: "DO",
    status: "Online",
    shiftStart: "08:00 AM",
    shiftEnd: "05:00 PM",
    hoursLoggedToday: 7.2,
    breakMinutesLogged: 25,
    breakLimitMinutes: 45,
    currentTask: "Executive Strategy & Q4 Revenue Architecture",
    assignedClient: "All Accounts",
    latestEos: {
      id: "eos-d1",
      completedTasks: "Approved WRTS automation sprint scope; reviewed Studio Nets intake roadmap.",
      blockers: "None",
      prioritiesTomorrow: "Client retainer review with RA Malinao.",
      publishedAt: "Yesterday at 05:15 PM",
      isDraft: false,
    },
  },
  {
    id: "radz",
    name: "Radzdom Gallego",
    nickname: "Radz",
    role: "Core Admin",
    title: "Platform Systems & Automation Specialist / Tech Lead",
    isOwner: false,
    isCoreAdmin: true,
    avatarColor: "bg-[#466B53]",
    initials: "RG",
    status: "Online",
    shiftStart: "09:00 AM",
    shiftEnd: "06:00 PM",
    hoursLoggedToday: 6.8,
    breakMinutesLogged: 20,
    breakLimitMinutes: 30,
    currentTask: "WRTS GHL webhook tests & Studio Nets pipeline sync",
    assignedClient: "WRTS & Studio Nets",
    latestEos: null,
  },
  {
    id: "ra",
    name: "Ma. Rose Anne (RA) Malinao",
    nickname: "RA",
    role: "Core Admin",
    title: "Commercial Operations & Invoicing Lead",
    isOwner: false,
    isCoreAdmin: true,
    avatarColor: "bg-[#518E6A]",
    initials: "RA",
    status: "Online",
    shiftStart: "08:30 AM",
    shiftEnd: "05:30 PM",
    hoursLoggedToday: 6.5,
    breakMinutesLogged: 28,
    breakLimitMinutes: 30,
    currentTask: "Client invoice auditing & contractor billing reconciliations",
    assignedClient: "InVogue Cleans & Tch2Thrive",
    latestEos: null,
  },
  {
    id: "erwin",
    name: "Erwin Manaog",
    nickname: "Erwin",
    role: "Project Owner",
    title: "Delivery Lead & QA Auditor",
    isOwner: false,
    isCoreAdmin: false,
    avatarColor: "bg-blue-600",
    initials: "EM",
    status: "On Break",
    shiftStart: "09:00 AM",
    shiftEnd: "06:00 PM",
    hoursLoggedToday: 5.5,
    breakMinutesLogged: 35, // Over break warning
    breakLimitMinutes: 30,
    currentTask: "WRTS GHL form tests & mobile breakpoint check",
    assignedClient: "We Rock the Spectrum (WRTS)",
    latestEos: null,
  },
  {
    id: "kimberly",
    name: "Kimberly Besa",
    nickname: "Kimberly",
    role: "Operations Assistant",
    title: "Operations Assistant",
    isOwner: false,
    isCoreAdmin: false,
    avatarColor: "bg-[#3D5249]",
    initials: "KB",
    status: "Online",
    shiftStart: "10:00 AM",
    shiftEnd: "07:00 PM",
    hoursLoggedToday: 4.2,
    breakMinutesLogged: 15,
    breakLimitMinutes: 30,
    currentTask: "Juvibolt social teaser assets & reels schedule",
    assignedClient: "Juvibolt Cybertech",
    latestEos: null,
  },
  {
    id: "bj",
    name: "BJ Ricafrente",
    nickname: "BJ",
    role: "Operations Specialist",
    title: "Tool Subscriptions & Student Pipeline",
    isOwner: false,
    isCoreAdmin: false,
    avatarColor: "bg-amber-600",
    initials: "BR",
    status: "Away",
    shiftStart: "08:00 AM",
    shiftEnd: "05:00 PM",
    hoursLoggedToday: 5.8,
    breakMinutesLogged: 30,
    breakLimitMinutes: 30,
    currentTask: "Kickoff subscription audit sheet setup for Zoe",
    assignedClient: "Aaron Ofosu Bootcamp",
    latestEos: null,
  },
  {
    id: "joy",
    name: "Joy Fabular",
    nickname: "Joy",
    role: "Operations Assistant",
    title: "Contractor Log Audits & Billing Logs",
    isOwner: false,
    isCoreAdmin: false,
    avatarColor: "bg-teal-600",
    initials: "JF",
    status: "Offline",
    shiftStart: "09:00 AM",
    shiftEnd: "05:00 PM",
    hoursLoggedToday: 8.0,
    breakMinutesLogged: 30,
    breakLimitMinutes: 30,
    currentTask: "Shift concluded - daily audit submitted",
    assignedClient: "InVogue Cleans",
    latestEos: {
      id: "eos-j1",
      completedTasks: "Audited contractor receipts for InVogue Cleans October cycle.",
      blockers: "Missing 1 invoice line item from Matthew.",
      prioritiesTomorrow: "Finalize PDF reconciliation for RA.",
      publishedAt: "Today at 05:02 PM",
      isDraft: false,
    },
  },
  {
    id: "kimberly",
    name: "Kimberly Besa",
    nickname: "Kimberly",
    role: "Operations Assistant",
    title: "Operations Assistant (Juvibolt & GIM)",
    isOwner: false,
    isCoreAdmin: false,
    avatarColor: "bg-[#3D5249]",
    initials: "KB",
    status: "Online",
    shiftStart: "09:00 AM",
    shiftEnd: "06:00 PM",
    hoursLoggedToday: 5.5,
    breakMinutesLogged: 20,
    breakLimitMinutes: 45,
    currentTask: "Juvibolt Cybertech LMS verification and operations sweep",
    assignedClient: "Juvibolt Cybertech, Grace In Motion (Internal)",
    latestEos: {
      id: "eos-k1",
      completedTasks: "Verified Juvibolt student enrollment webhooks; synchronized internal ops checklist.",
      blockers: "None",
      prioritiesTomorrow: "Execute morning comms sweep and update LMS status.",
      publishedAt: "Today at 05:30 PM",
      isDraft: false,
    },
  },
];

const INITIAL_AUDITS: ScheduleAuditRecord[] = [
  {
    id: "aud-01",
    memberId: "erwin",
    memberName: "Erwin Manaog",
    adjustedBy: "Ma. Rose Anne (RA) Malinao",
    adjustmentDate: "Nov 02, 2026",
    oldShift: "09:00 AM - 05:00 PM",
    newShift: "09:00 AM - 06:00 PM",
    reason: "Approved overtime for WRTS franchise webhook deployment",
    timestamp: "Nov 02, 2026 at 04:30 PM",
  },
  {
    id: "aud-02",
    memberId: "kimberly",
    memberName: "Kimberly Besa",
    adjustedBy: "Radzdom Gallego (Radz)",
    adjustmentDate: "Nov 03, 2026",
    oldShift: "09:00 AM - 06:00 PM",
    newShift: "10:00 AM - 07:00 PM",
    reason: "Adjusted for client evening Instagram engagement slot",
    timestamp: "Today at 09:15 AM",
  },
];

interface TeamTimesheetViewProps {
  currentUserName?: string;
  currentUserNickname?: string;
  currentUserRole?: string;
  isCoreAdmin?: boolean;
}

export function TeamTimesheetView({
  currentUserName = "Radzdom Gallego",
  currentUserNickname = "Radz",
  currentUserRole = "Core Admin",
  isCoreAdmin = true,
}: TeamTimesheetViewProps) {
  const [members, setMembers] = useState<MemberAttendance[]>(INITIAL_MEMBERS);
  const [auditLog, setAuditLog] = useState<ScheduleAuditRecord[]>(INITIAL_AUDITS);
  const [selectedFilter, setSelectedFilter] = useState<"All" | AttendanceStatus>("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isEosModalOpen, setIsEosModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedMemberForSchedule, setSelectedMemberForSchedule] = useState<MemberAttendance | null>(null);

  // EOS Form state
  const [eosCompleted, setEosCompleted] = useState("");
  const [eosBlockers, setEosBlockers] = useState("");
  const [eosTomorrow, setEosTomorrow] = useState("");
  const [eosIsSavedDraft, setEosIsSavedDraft] = useState(false);

  // Admin Schedule Adjustment Form
  const [newShiftStart, setNewShiftStart] = useState("09:00 AM");
  const [newShiftEnd, setNewShiftEnd] = useState("06:00 PM");
  const [scheduleReason, setScheduleReason] = useState("");

  // Current user's attendance status
  const currentMember = members.find(
    (m) =>
      m.nickname.toLowerCase() === (currentUserNickname || "").toLowerCase() ||
      m.name.toLowerCase() === (currentUserName || "").toLowerCase()
  ) || members[1]; // default Radz

  // Filter members: if not Core Admin (Divine, Radz, RA), 100% strictly limited to their own personal timesheet
  const filteredMembers = members.filter((m) => {
    if (!isCoreAdmin) {
      return (
        m.nickname.toLowerCase() === (currentUserNickname || "").toLowerCase() ||
        m.name.toLowerCase() === (currentUserName || "").toLowerCase() ||
        m.id.toLowerCase() === (currentUserNickname || "").toLowerCase()
      );
    }
    if (selectedFilter !== "All" && m.status !== selectedFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.assignedClient.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Aggregates
  const totalOnline = members.filter((m) => m.status === "Online").length;
  const totalBreak = members.filter((m) => m.status === "On Break").length;
  const totalAway = members.filter((m) => m.status === "Away").length;
  const totalOffline = members.filter((m) => m.status === "Offline").length;
  const totalHoursLogged = members.reduce((acc, m) => acc + m.hoursLoggedToday, 0).toFixed(1);
  const overBreakMembers = members.filter((m) => m.breakMinutesLogged > m.breakLimitMinutes);

  // Status changer for current user
  const handleStatusChange = (newStatus: AttendanceStatus) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === currentMember.id
          ? {
              ...m,
              status: newStatus,
            }
          : m
      )
    );
  };

  // Publish or Draft EOS
  const handleSaveEos = (isPublish: boolean) => {
    if (!eosCompleted.trim()) return;

    const nowString = new Date().toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMembers((prev) =>
      prev.map((m) =>
        m.id === currentMember.id
          ? {
              ...m,
              latestEos: {
                id: `eos-${Date.now()}`,
                completedTasks: eosCompleted,
                blockers: eosBlockers || "None",
                prioritiesTomorrow: eosTomorrow || "Continue sprint velocity",
                publishedAt: `Today at ${nowString}`,
                isDraft: !isPublish,
              },
              status: isPublish ? "Offline" : m.status,
            }
          : m
      )
    );

    if (isPublish) {
      // Broadcast EOS to Slack channel #gim-shift-reports
      fetch("/api/notifications/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "eos",
          payload: {
            memberName: currentMember.name,
            memberNickname: currentMember.nickname,
            role: currentMember.role,
            clientScope: currentMember.assignedClient,
            completedTasks: eosCompleted,
            blockers: eosBlockers,
            prioritiesTomorrow: eosTomorrow,
            hoursLogged: currentMember.hoursLoggedToday,
          },
        }),
      }).catch((err) => console.error("Slack EOS broadcast error:", err));

      setIsEosModalOpen(false);
      setEosIsSavedDraft(false);
    } else {
      setEosIsSavedDraft(true);
    }
  };

  // Admin Schedule Update with Audit Footprint
  const handleSaveScheduleAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForSchedule || !scheduleReason.trim()) return;

    const auditEntry: ScheduleAuditRecord = {
      id: `aud-${Date.now()}`,
      memberId: selectedMemberForSchedule.id,
      memberName: selectedMemberForSchedule.name,
      adjustedBy: `${currentUserName} (${currentUserNickname})`,
      adjustmentDate: new Date().toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" }),
      oldShift: `${selectedMemberForSchedule.shiftStart} - ${selectedMemberForSchedule.shiftEnd}`,
      newShift: `${newShiftStart} - ${newShiftEnd}`,
      reason: scheduleReason,
      timestamp: `Today at ${new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}`,
    };

    setAuditLog([auditEntry, ...auditLog]);

    setMembers((prev) =>
      prev.map((m) =>
        m.id === selectedMemberForSchedule.id
          ? {
              ...m,
              shiftStart: newShiftStart,
              shiftEnd: newShiftEnd,
            }
          : m
      )
    );

    setIsScheduleModalOpen(false);
    setSelectedMemberForSchedule(null);
    setScheduleReason("");
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & ATTENDANCE SUMMARY STRIP */}
      <div className="bg-white rounded-2xl p-5 border border-[#3D5249]/15 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold tracking-tight text-[#242E29]">
                Live Attendance & Timesheet Hub
              </h2>
              <Badge variant="brand">
                {totalOnline} Active In Shift
              </Badge>
            </div>
            <p className="text-xs text-[#65746C] mt-0.5">
              Real-time shift presence, login hours, break limits, and End of Shift (EOS) reports.
            </p>
          </div>

          {/* Quick Shift Status Controls for Logged-In User */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FBF6F3] border border-[#E8E2DD]">
              <span className="text-[11px] font-bold text-[#65746C] px-2">My Status:</span>
              <button
                onClick={() => handleStatusChange("Online")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  currentMember.status === "Online"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-[#242E29] hover:bg-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                <span>Online</span>
              </button>

              <button
                onClick={() => handleStatusChange("On Break")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  currentMember.status === "On Break"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-[#242E29] hover:bg-white"
                }`}
              >
                <Coffee className="w-3 h-3" />
                <span>On Break</span>
              </button>

              <button
                onClick={() => handleStatusChange("Away")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  currentMember.status === "Away"
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-[#242E29] hover:bg-white"
                }`}
              >
                <span>Away</span>
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsEosModalOpen(true)}
              className="text-xs flex items-center gap-1.5 shadow-xs bg-[#466B53] hover:bg-[#3D5249]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Submit EOS Report</span>
            </Button>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#3D5249]/10">
          <div className="p-3 rounded-xl bg-[#FBF6F3] border border-[#E8E2DD] space-y-1">
            <span className="text-[10px] font-bold text-[#65746C] uppercase tracking-wider block">
              Active In Shift
            </span>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xl font-bold text-[#242E29]">{totalOnline} Members</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">Currently online</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FBF6F3] border border-[#E8E2DD] space-y-1">
            <span className="text-[10px] font-bold text-[#65746C] uppercase tracking-wider block">
              On Break
            </span>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-xl font-bold text-[#242E29]">{totalBreak} Members</span>
            </div>
            <span className="text-[10px] text-amber-700 font-medium">
              {overBreakMembers.length > 0 ? `⚠️ ${overBreakMembers.length} Over Break Limit` : "All within 30m limit"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FBF6F3] border border-[#E8E2DD] space-y-1">
            <span className="text-[10px] font-bold text-[#65746C] uppercase tracking-wider block">
              Total Hours Today
            </span>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#518E6A]" />
              <span className="text-xl font-bold text-[#242E29]">{totalHoursLogged} hrs</span>
            </div>
            <span className="text-[10px] text-[#518E6A] font-medium">Recorded team production</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FBF6F3] border border-[#E8E2DD] space-y-1">
            <span className="text-[10px] font-bold text-[#65746C] uppercase tracking-wider block">
              Shift Ended / Offline
            </span>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span className="text-xl font-bold text-[#242E29]">{totalOffline} Members</span>
            </div>
            <span className="text-[10px] text-slate-600 font-medium">EOS reports logged</span>
          </div>
        </div>
      </div>

      {/* 2. ATTENDANCE & TIMESHEET TABLE */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>{isCoreAdmin ? "Team Attendance & Shift Directory" : "My Personal Attendance & Timesheet"}</CardTitle>
            <CardDescription>
              {isCoreAdmin ? "Live operational presence, break tracking, and daily login hour tallies" : "Personal shift status, active break tracking, and logged hours"}
            </CardDescription>
          </div>

          {/* Filter Pills (Admin only) */}
          {isCoreAdmin && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["All", "Online", "On Break", "Away", "Offline"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedFilter === filter
                      ? "bg-[#3D5249] text-white shadow-xs"
                      : "bg-[#FBF6F3] text-[#65746C] hover:bg-[#E8E2DD]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF6F3] text-[#65746C] font-semibold border-b border-[#E8E2DD]">
              <tr>
                <th className="py-2.5 px-4">Team Member</th>
                <th className="py-2.5 px-4">Role & Leadership</th>
                <th className="py-2.5 px-4">Current Status</th>
                <th className="py-2.5 px-4">Shift Schedule</th>
                <th className="py-2.5 px-4">Hours Logged</th>
                <th className="py-2.5 px-4">Active Task / Focus</th>
                <th className="py-2.5 px-4">EOS Report</th>
                {isCoreAdmin && <th className="py-2.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2DD]/70">
              {filteredMembers.map((member) => {
                const isOverBreak = member.breakMinutesLogged > member.breakLimitMinutes;

                return (
                  <tr key={member.id} className="hover:bg-[#FBF6F3]/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#242E29]">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-full ${member.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                        >
                          {member.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{member.name}</span>
                            <span className="text-[#65746C] font-normal">({member.nickname})</span>
                          </div>
                          <div className="text-[10px] text-[#65746C] font-normal">
                            {member.assignedClient}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          {member.isOwner ? (
                            <Badge variant="dark" className="text-[9px] px-1.5 py-0 font-bold bg-[#3D5249] text-white">
                              Owner
                            </Badge>
                          ) : member.isCoreAdmin ? (
                            <Badge variant="brand" className="text-[9px] px-1.5 py-0 font-bold">
                              Core Admin
                            </Badge>
                          ) : (
                            <Badge variant="neutral" className="text-[9px] px-1.5 py-0">
                              {member.role}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-[#65746C] truncate max-w-[160px]">
                          {member.title}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {member.status === "Online" && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Online</span>
                        </div>
                      )}
                      {member.status === "On Break" && (
                        <div
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                            isOverBreak
                              ? "bg-rose-50 text-rose-800 border-rose-300 animate-pulse"
                              : "bg-amber-50 text-amber-900 border-amber-200"
                          }`}
                        >
                          <Coffee className="w-3 h-3" />
                          <span>On Break ({member.breakMinutesLogged}m / {member.breakLimitMinutes}m)</span>
                        </div>
                      )}
                      {member.status === "Away" && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200 font-bold text-[11px]">
                          <Clock className="w-3 h-3" />
                          <span>Away</span>
                        </div>
                      )}
                      {member.status === "Offline" && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span>Shift Concluded</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#242E29]">
                      <div>{member.shiftStart} - {member.shiftEnd}</div>
                    </td>

                    <td className="py-3 px-4 text-[#242E29] font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{member.hoursLoggedToday} hrs</span>
                        <div className="w-16 bg-[#E8E2DD] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#518E6A] h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, (member.hoursLoggedToday / 8) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#242E29] max-w-[200px]">
                      <div className="truncate text-[11px]" title={member.currentTask}>
                        {member.currentTask}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {member.latestEos ? (
                        <div
                          className="cursor-pointer group space-y-0.5"
                          onClick={() => {
                            alert(`EOS Report from ${member.name}:\n\nCompleted:\n${member.latestEos?.completedTasks}\n\nBlockers:\n${member.latestEos?.blockers}\n\nTomorrow:\n${member.latestEos?.prioritiesTomorrow}`);
                          }}
                        >
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#466B53] group-hover:underline">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{member.latestEos.isDraft ? "Draft Saved" : "EOS Submitted"}</span>
                          </span>
                          <p className="text-[9px] text-[#65746C] truncate max-w-[140px]">
                            {member.latestEos.publishedAt}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#65746C] italic">Pending sign-out</span>
                      )}
                    </td>

                    {isCoreAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedMemberForSchedule(member);
                            setNewShiftStart(member.shiftStart);
                            setNewShiftEnd(member.shiftEnd);
                            setIsScheduleModalOpen(true);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-[#518E6A] hover:bg-[#518E6A]/10 rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Adjust schedule with recorded audit footprint"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Adjust Shift</span>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 3. ADMIN SCHEDULE AUDIT FOOTPRINT TRAIL */}
      {isCoreAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-[#518E6A]" />
              <CardTitle>Schedule Modification Footprint & Audit Trail</CardTitle>
            </div>
            <CardDescription>
              Recorded changes to member shift schedules, hours adjustments, and overtime approvals
            </CardDescription>
          </CardHeader>

          <div className="p-4 space-y-2.5">
            {auditLog.map((audit) => (
              <div
                key={audit.id}
                className="p-3 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#242E29]">{audit.memberName}</span>
                    <Badge variant="brand" className="text-[9px]">Shift Adjusted</Badge>
                    <span className="text-[11px] text-[#65746C] font-mono">
                      {audit.oldShift} $\rightarrow$ <strong>{audit.newShift}</strong>
                    </span>
                  </div>
                  <p className="text-[11px] text-[#65746C]">
                    Reason: <em>&ldquo;{audit.reason}&rdquo;</em>
                  </p>
                </div>

                <div className="text-right text-[10px] text-[#65746C] shrink-0">
                  <div>Adjusted by: <strong className="text-[#3D5249]">{audit.adjustedBy}</strong></div>
                  <div>{audit.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 4. EOS REPORT SUBMISSION MODAL */}
      {/* ========================================================================= */}
      {isEosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242E29]/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#E8E2DD] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2DD] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#518E6A]" />
                <h3 className="font-bold text-base text-[#242E29]">End of Shift (EOS) Report</h3>
              </div>
              <Badge variant="brand">{currentMember.name}</Badge>
            </div>

            <p className="text-xs text-[#65746C]">
              Submit your daily operational handover before signing out. Once published, EOS notes are locked to maintain audit integrity.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#242E29] mb-1">
                  1. Tasks & Deliverables Completed Today: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={eosCompleted}
                  onChange={(e) => setEosCompleted(e.target.value)}
                  placeholder="e.g. Completed website QA review for Zoe; verified Stripe checkout in test mode."
                  className="w-full p-2.5 rounded-xl border border-[#E8E2DD] focus:outline-none focus:ring-1 focus:ring-[#518E6A] bg-[#FBF6F3]/50 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#242E29] mb-1">
                  2. Blockers or Items Needing Assistance:
                </label>
                <input
                  type="text"
                  value={eosBlockers}
                  onChange={(e) => setEosBlockers(e.target.value)}
                  placeholder="e.g. Waiting for DNS credentials from Wix; none"
                  className="w-full p-2 rounded-xl border border-[#E8E2DD] focus:outline-none focus:ring-1 focus:ring-[#518E6A] bg-[#FBF6F3]/50 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#242E29] mb-1">
                  3. Key Priorities for Next Shift:
                </label>
                <input
                  type="text"
                  value={eosTomorrow}
                  onChange={(e) => setEosTomorrow(e.target.value)}
                  placeholder="e.g. Launch Batch 1 email sequences and verify enquiry SMS tag."
                  className="w-full p-2 rounded-xl border border-[#E8E2DD] focus:outline-none focus:ring-1 focus:ring-[#518E6A] bg-[#FBF6F3]/50 text-xs"
                />
              </div>
            </div>

            {eosIsSavedDraft && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-600" />
                <span>Draft saved locally. Click Publish to conclude your shift.</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#E8E2DD]">
              <Button variant="secondary" size="sm" onClick={() => setIsEosModalOpen(false)}>
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSaveEos(false)}
                  disabled={!eosCompleted.trim()}
                >
                  Save Draft
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSaveEos(true)}
                  disabled={!eosCompleted.trim()}
                  className="bg-[#466B53] hover:bg-[#3D5249] flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Publish & Conclude Shift</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADMIN SCHEDULE ADJUSTMENT MODAL WITH FOOTPRINT */}
      {/* ========================================================================= */}
      {isScheduleModalOpen && selectedMemberForSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242E29]/70 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveScheduleAdjustment}
            className="bg-white rounded-2xl border border-[#E8E2DD] max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E8E2DD] pb-3">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-[#518E6A]" />
                <h3 className="font-bold text-base text-[#242E29]">Adjust Shift Schedule</h3>
              </div>
              <Badge variant="brand">{selectedMemberForSchedule.nickname}</Badge>
            </div>

            <div className="p-3 rounded-xl bg-[#FBF6F3] border border-[#E8E2DD] text-xs space-y-1">
              <div>Target Member: <strong>{selectedMemberForSchedule.name}</strong></div>
              <div>Current Shift: <span className="font-mono">{selectedMemberForSchedule.shiftStart} - {selectedMemberForSchedule.shiftEnd}</span></div>
              <div className="text-[10px] text-[#518E6A] font-semibold flex items-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Modification recorded by {currentUserNickname}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#242E29] mb-1">New Shift Start:</label>
                <input
                  type="text"
                  required
                  value={newShiftStart}
                  onChange={(e) => setNewShiftStart(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full p-2 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#242E29] mb-1">New Shift End:</label>
                <input
                  type="text"
                  required
                  value={newShiftEnd}
                  onChange={(e) => setNewShiftEnd(e.target.value)}
                  placeholder="06:00 PM"
                  className="w-full p-2 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50 text-xs font-mono"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-[#242E29] mb-1">
                Reason for Adjustment (Recorded in Audit Trail): <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={scheduleReason}
                onChange={(e) => setScheduleReason(e.target.value)}
                placeholder="e.g. Overtime approved for summit launch, adjusted timezone slot, etc."
                className="w-full p-2.5 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50 text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8E2DD]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsScheduleModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Adjustment & Log Footprint</span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
