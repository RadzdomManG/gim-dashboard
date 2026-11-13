"use client";

import React, { useState } from "react";
import {
  Clock,
  User,
  Building2,
  FileText,
  Calendar,
  CheckCircle2,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TimesheetEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogHours: (entry: {
    memberId: string;
    client: string;
    hours: number;
    deliverable: string;
    notes: string;
    date: string;
  }) => void;
  teamMembers?: { id: string; name: string; nickname: string }[];
}

export function TimesheetEntryModal({
  isOpen,
  onClose,
  onLogHours,
  teamMembers = [
    { id: "radz", name: "Radzdom Gallego", nickname: "Radz" },
    { id: "divine", name: "Divine Origines", nickname: "Divine" },
    { id: "ra", name: "Ma. Rose Anne Malinao", nickname: "RA" },
    { id: "erwin", name: "Erwin Manaog", nickname: "Erwin" },
    { id: "charise", name: "Charise Malinao", nickname: "Charise" },
    { id: "pat", name: "Patrisha Garcia", nickname: "Pat" },
    { id: "bj", name: "BJ Ricafrente", nickname: "BJ" },
  ],
}: TimesheetEntryModalProps) {
  const [selectedMember, setSelectedMember] = useState(teamMembers[0]?.id || "radz");
  const [client, setClient] = useState("We Rock the Spectrum (WRTS)");
  const [hours, setHours] = useState("3.5");
  const [deliverable, setDeliverable] = useState("WRTS Franchise Lead Engine Automation");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numHours = parseFloat(hours);
    if (isNaN(numHours) || numHours <= 0) return;

    onLogHours({
      memberId: selectedMember,
      client,
      hours: numHours,
      deliverable,
      notes,
      date,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#242E29]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#3D5249]/15 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-[#3D5249] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif tracking-tight text-white flex items-center gap-2">
                Log Billable Time
              </h2>
              <p className="text-xs text-[#FBF6F3]/80">
                Record manual project hours against authentic client deliverables.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitted && (
            <div className="p-3.5 rounded-xl text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Time successfully recorded and capacity worksheet updated!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Team Member
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.nickname})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Client
              </label>
              <select
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              >
                <option value="We Rock the Spectrum (WRTS)">We Rock the Spectrum (WRTS)</option>
                <option value="Juvibolt Cybertech">Juvibolt Cybertech</option>
                <option value="Studio Nets">Studio Nets</option>
                <option value="InVogue Cleans">InVogue Cleans</option>
                <option value="Aaron Ofosu Bootcamp">Aaron Ofosu Bootcamp</option>
                <option value="Tch2Thrive">Tch2Thrive</option>
                <option value="GIM Internal Operations">GIM Internal Operations</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Hours Spent
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                required
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
              Deliverable / Gate Reference
            </label>
            <input
              type="text"
              required
              placeholder="e.g. G5 Website Six Pages or G7 GHL Alert"
              value={deliverable}
              onChange={(e) => setDeliverable(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
              Work Notes & Summary
            </label>
            <textarea
              rows={2}
              placeholder="Summary of work completed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
            />
          </div>

          <div className="pt-4 border-t border-[#3D5249]/10 flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              <Plus className="w-4 h-4" />
              Save Time Entry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
