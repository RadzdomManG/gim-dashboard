"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Building2,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface TeamMemberAccess {
  id: string;
  name: string;
  nickname: string;
  email: string;
  role: string;
  assignedClients: string[];
}

const AUTHENTIC_CLIENTS = [
  { id: "wrts", name: "We Rock the Spectrum (WRTS)", code: "WRTS", description: "Sensory Gym Franchise (US)" },
  { id: "jb", name: "Juvibolt Cybertech", code: "JB", description: "Cybersecurity EdTech & LMS (AU/Global)" },
  { id: "sn", name: "Studio Nets", code: "SN", description: "Design & Creative Systems (AU)" },
  { id: "ivc", name: "InVogue Cleans", code: "IVC", description: "Premium Cleaning Services (AU)" },
  { id: "rw", name: "Risewise", code: "RW", description: "Executive Advisory & Growth (Global)" },
  { id: "nl", name: "NoirLab", code: "NL", description: "Studio & Production Systems (US)" },
  { id: "gim", name: "Grace In Motion (Internal)", code: "GIM", description: "Agency HQ Operations (Global)" },
];

interface EditClientAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMemberAccess | null;
  onSaved: (memberId: string, updatedClients: string[]) => void;
}

export function EditClientAccessModal({
  isOpen,
  onClose,
  member,
  onSaved,
}: EditClientAccessModalProps) {
  const [selectedClients, setSelectedClients] = useState<string[]>(() => member?.assignedClients || []);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync when member changes
  React.useEffect(() => {
    if (member) {
      setSelectedClients(member.assignedClients || []);
      setMessage(null);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const toggleClient = (clientName: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientName)
        ? prev.filter((c) => c !== clientName)
        : [...prev, clientName]
    );
  };

  const selectAll = () => {
    setSelectedClients(AUTHENTIC_CLIENTS.map((c) => c.name));
  };

  const clearAll = () => {
    setSelectedClients([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: member.id,
          email: member.email,
          assigned_clients: selectedClients,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update client permissions.");
      }

      setMessage({ type: "success", text: "Client access boundaries updated successfully!" });
      onSaved(member.id, selectedClients);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update permissions.";
      setMessage({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#242E29]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#3D5249]/15 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-[#3D5249] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif tracking-tight text-white flex items-center gap-2">
                Manage Client Tenant Scope
              </h2>
              <p className="text-xs text-[#FBF6F3]/80">
                Grant or revoke client dashboard access for {member.name} ({member.nickname}).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : "bg-red-50 text-red-900 border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Member Overview Box */}
          <div className="p-3.5 bg-[#FBF6F3] rounded-xl border border-[#3D5249]/10 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-[#242E29]">{member.name}</div>
              <div className="text-[#65746C] text-[11px]">{member.email} &bull; {member.role}</div>
            </div>
            <Badge variant="brand">
              {selectedClients.length} of {AUTHENTIC_CLIENTS.length} Clients Assigned
            </Badge>
          </div>

          {/* Quick Select Actions */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#3D5249]">
              Assigned Client Portfolios
            </label>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={selectAll}
                className="text-[#518E6A] hover:underline font-semibold text-[11px]"
              >
                Select All
              </button>
              <span className="text-[#65746C]">&bull;</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-[#65746C] hover:underline text-[11px]"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Client Checkbox Cards */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {AUTHENTIC_CLIENTS.map((client) => {
              const isSelected = selectedClients.includes(client.name);
              return (
                <div
                  key={client.id}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleClient(client.name);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                    isSelected
                      ? "bg-[#3D5249]/5 border-[#518E6A] ring-2 ring-[#518E6A]"
                      : "bg-white border-[#3D5249]/15 hover:border-[#3D5249]/40 hover:bg-[#FBF6F3]/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="pointer-events-none mt-0.5 text-[#518E6A] focus:ring-0 rounded border-[#3D5249]/30 h-4 w-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#242E29] truncate">
                        {client.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#3D5249]/15 text-[#3D5249]">
                        {client.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#65746C] mt-0.5">
                      {client.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin Boundary Notice */}
          <div className="p-3 rounded-xl bg-[#3D5249]/5 border border-[#3D5249]/15 flex items-start gap-2.5 text-[11px] text-[#3D5249]">
            <ShieldCheck className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
            <span>
              <strong>Core Admin Authority:</strong> Only Divine, Radz, and RA hold permission to change client assignments. This member will only see tasks, deliverables, and briefs for the checked clients above.
            </span>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-[#3D5249]/10 flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSaving}>
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Save Client Access
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
