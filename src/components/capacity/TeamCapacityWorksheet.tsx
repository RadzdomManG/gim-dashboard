"use client";

import React, { useState } from "react";
import {
  Users,
  Clock,
  Briefcase,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Building2,
  Filter,
  Search,
  UserCheck,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { TimesheetEntryModal } from "@/components/capacity/TimesheetEntryModal";

export interface TeamMemberCapacity {
  id: string;
  name: string;
  nickname: string;
  role: string;
  isCoreAdmin: boolean;
  avatarColor: string;
  initials: string;
  capacityHours: number;
  allocatedHours: number;
  status: "Optimal" | "At Capacity" | "Heavy Load" | "Available";
  assignedClients: string[];
  primaryFocus: string;
  activeSubtasksCount: number;
}

const TEAM_CAPACITY_DATA: TeamMemberCapacity[] = [
  {
    id: "divine",
    name: "Divine Origines",
    nickname: "Divine",
    role: "Owner & Strategy Lead",
    isCoreAdmin: true,
    avatarColor: "bg-[#466B53]",
    initials: "DO",
    capacityHours: 40,
    allocatedHours: 36,
    status: "At Capacity",
    assignedClients: ["All 6 Accounts", "Executive Strategy"],
    primaryFocus: "Executive Direction, Client Discovery & Revenue Architecture",
    activeSubtasksCount: 6,
  },
  {
    id: "radz",
    name: "Radzdom Gallego",
    nickname: "Radz",
    role: "Admin & Operations / Technical Lead",
    isCoreAdmin: true,
    avatarColor: "bg-[#3D5249]",
    initials: "RG",
    capacityHours: 40,
    allocatedHours: 38,
    status: "At Capacity",
    assignedClients: ["Little Treasures", "WRTS", "Studio Nets"],
    primaryFocus: "GIM Platform Systems, ClickUp Integration & Automation Architecture",
    activeSubtasksCount: 16,
  },
  {
    id: "ra",
    name: "Ma. Rose Anne (RA) Malinao",
    nickname: "RA",
    role: "Admin & Delivery / Project Lead",
    isCoreAdmin: true,
    avatarColor: "bg-[#518E6A]",
    initials: "RM",
    capacityHours: 40,
    allocatedHours: 34,
    status: "Optimal",
    assignedClients: ["InVogue Cleans", "Tch2Thrive", "Internal GIM Operations"],
    primaryFocus: "Client Onboarding SOPs, Resource Allocation & Invoicing Controls",
    activeSubtasksCount: 9,
  },
  {
    id: "erwin",
    name: "Erwin Manaog",
    nickname: "Erwin",
    role: "Project Owner & Delivery Specialist",
    isCoreAdmin: false,
    avatarColor: "bg-slate-700",
    initials: "EM",
    capacityHours: 40,
    allocatedHours: 39,
    status: "Heavy Load",
    assignedClients: ["Little Treasures Company", "Studio Nets"],
    primaryFocus: "GoHighLevel Funnels, Dec 11 Summit Build & Client QA Checks",
    activeSubtasksCount: 18,
  },
  {
    id: "bj",
    name: "BJ Ricafrente",
    nickname: "BJ",
    role: "Operations Specialist",
    isCoreAdmin: false,
    avatarColor: "bg-[#2D3D36]",
    initials: "BR",
    capacityHours: 30,
    allocatedHours: 20,
    status: "Available",
    assignedClients: ["Little Treasures", "Aaron Ofosu Bootcamp"],
    primaryFocus: "Client Weekly Calls, Tool Subscriptions & Student Pipelines",
    activeSubtasksCount: 5,
  },
  {
    id: "joy",
    name: "Joy Fabular",
    nickname: "Joy",
    role: "Operations Assistant",
    isCoreAdmin: false,
    avatarColor: "bg-amber-700",
    initials: "JF",
    capacityHours: 20,
    allocatedHours: 14,
    status: "Optimal",
    assignedClients: ["InVogue Cleans", "Internal GIM Invoicing"],
    primaryFocus: "Contractor Log Audits & Billing Reconciliations",
    activeSubtasksCount: 4,
  },
  {
    id: "jedy",
    name: "Jedy Caillio",
    nickname: "Jedy",
    role: "Creative Assistant",
    isCoreAdmin: false,
    avatarColor: "bg-indigo-700",
    initials: "JC",
    capacityHours: 20,
    allocatedHours: 12,
    status: "Available",
    assignedClients: ["Studio Nets", "Marketing Assets"],
    primaryFocus: "Design Ingestion, Figma Asset Checks & Banner Graphics",
    activeSubtasksCount: 3,
  },
];

export function TeamCapacityWorksheet() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberCapacity[]>(TEAM_CAPACITY_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isTimesheetOpen, setIsTimesheetOpen] = useState(false);

  const handleLogHours = (entry: {
    memberId: string;
    client: string;
    hours: number;
    deliverable: string;
    notes: string;
    date: string;
  }) => {
    setTeamMembers((prev) =>
      prev.map((m) => {
        if (m.id === entry.memberId) {
          const updated = m.allocatedHours + entry.hours;
          const newStatus = updated >= m.capacityHours ? "At Capacity" : "Optimal";
          return {
            ...m,
            allocatedHours: updated,
            status: newStatus,
          };
        }
        return m;
      })
    );
  };

  const totalCapacity = teamMembers.reduce((acc, m) => acc + m.capacityHours, 0);
  const totalAllocated = teamMembers.reduce((acc, m) => acc + m.allocatedHours, 0);
  const utilizationRate = Math.round((totalAllocated / totalCapacity) * 100);

  const filteredMembers = teamMembers.filter((m) => {
    if (statusFilter !== "all" && m.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.nickname.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.primaryFocus.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const renderStatusBadge = (status: TeamMemberCapacity["status"]) => {
    if (status === "Optimal") {
      return <Badge variant="active" dot>Optimal</Badge>;
    }
    if (status === "At Capacity") {
      return <Badge variant="review" dot>At Capacity</Badge>;
    }
    if (status === "Heavy Load") {
      return <Badge variant="critical" dot>Heavy Load</Badge>;
    }
    return <Badge variant="upcoming" dot>Available</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-[#242E29]">
              Team Capacity & Workload Worksheet
            </h2>
            <Badge variant="brand">Internal Resource Ledger</Badge>
          </div>
          <p className="text-xs text-[#65746C] mt-0.5">
            Operational hours allocation, sprint bandwidth, and role utilization across authentic GIM accounts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsTimesheetOpen(true)}
            className="flex items-center space-x-1.5 text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Billable Time</span>
          </Button>
          <Badge variant="dark">7 Active Contributors</Badge>
        </div>
      </div>

      {/* 2. SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#65746C] uppercase tracking-wider">
                Total Team Bandwidth
              </p>
              <p className="text-2xl font-bold text-[#242E29] mt-1">{totalCapacity}h / wk</p>
              <p className="text-[11px] text-[#466B53] font-medium mt-0.5">Across 7 team members</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#466B53]/10 text-[#466B53] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#65746C] uppercase tracking-wider">
                Allocated Hours
              </p>
              <p className="text-2xl font-bold text-[#242E29] mt-1">{totalAllocated}h / wk</p>
              <p className="text-[11px] text-[#518E6A] font-medium mt-0.5">Sprint tasks in progress</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#518E6A]/10 text-[#518E6A] flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#65746C] uppercase tracking-wider">
                Overall Utilization
              </p>
              <p className="text-2xl font-bold text-[#242E29] mt-1">{utilizationRate}%</p>
              <p className="text-[11px] text-[#466B53] font-medium mt-0.5">Healthy agency target (80-85%)</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#466B53]/10 text-[#466B53] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#65746C] uppercase tracking-wider">
                Bandwidth Reserve
              </p>
              <p className="text-2xl font-bold text-[#242E29] mt-1">
                {totalCapacity - totalAllocated}h / wk
              </p>
              <p className="text-[11px] text-[#518E6A] font-medium mt-0.5">Available for new client intake</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#3D5249]/10 text-[#3D5249] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. CAPACITY TABLE */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-4 border-b border-[#E8E2DD] gap-3">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-sm">Workload Distribution Matrix</CardTitle>
            <Badge variant="neutral">{filteredMembers.length} Members</Badge>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Filter by name, role, focus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
            />
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E8E2DD] bg-[#FBF6F3] text-[#65746C]">
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Team Member</th>
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Operational Role</th>
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Weekly Hours</th>
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Utilization</th>
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px] hidden md:table-cell">Primary Focus & Clients</th>
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2DD]/60">
              {filteredMembers.map((member) => {
                const util = Math.round((member.allocatedHours / member.capacityHours) * 100);
                return (
                  <tr key={member.id} className="hover:bg-[#FBF6F3]/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full ${member.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                          {member.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-[#242E29]">
                            {member.name} <span className="text-[#466B53]">({member.nickname})</span>
                          </p>
                          {member.isCoreAdmin && (
                            <span className="text-[9px] font-bold text-[#3D5249] bg-[#466B53]/10 px-1 rounded">
                              Core Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-[#242E29] font-medium">
                      {member.role}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-[#242E29]">{member.allocatedHours}h</span>
                      <span className="text-[#65746C] text-[11px]"> / {member.capacityHours}h</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-[#E8E2DD] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              util >= 95 ? "bg-rose-600" : util >= 85 ? "bg-amber-600" : "bg-[#518E6A]"
                            }`}
                            style={{ width: `${Math.min(util, 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-[#242E29]">{util}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="text-xs text-[#242E29] font-medium line-clamp-1">{member.primaryFocus}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {member.assignedClients.map((c, i) => (
                          <span key={i} className="text-[9px] text-[#65746C] bg-[#FBF6F3] border border-[#E8E2DD] px-1.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      {renderStatusBadge(member.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Timesheet Entry Modal */}
      <TimesheetEntryModal
        isOpen={isTimesheetOpen}
        onClose={() => setIsTimesheetOpen(false)}
        onLogHours={handleLogHours}
      />
    </div>
  );
}
