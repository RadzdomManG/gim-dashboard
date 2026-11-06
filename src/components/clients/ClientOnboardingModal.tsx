"use client";

import React, { useState } from "react";
import {
  Building2,
  User,
  Mail,
  DollarSign,
  CheckCircle2,
  X,
  Plus,
  RefreshCw,
  FolderGit2,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ClientOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded?: () => void;
}

export function ClientOnboardingModal({
  isOpen,
  onClose,
  onClientAdded,
}: ClientOnboardingModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [leadName, setLeadName] = useState("Divine Origines");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [retainerAmount, setRetainerAmount] = useState("$4,500/mo");
  const [serviceTier, setServiceTier] = useState("Dedicated Growth Retainer");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setStatusMessage({ type: "error", text: "Client name and unique code are required." });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          lead_name: leadName.trim(),
          contact_name: contactName.trim(),
          contact_email: contactEmail.trim(),
          status: "active",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to onboard client.");
      }

      setStatusMessage({
        type: "success",
        text: `Client "${name}" has been successfully onboarded into GIM portfolio!`,
      });

      if (onClientAdded) onClientAdded();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Onboarding failed.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#242E29]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#3D5249]/15 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-[#3D5249] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif tracking-tight text-white flex items-center gap-2">
                Client Onboarding & Intake
              </h2>
              <p className="text-xs text-[#FBF6F3]/80">
                Register a new client organization in GIM Supabase without modifying ClickUp.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : "bg-red-50 text-red-900 border-red-200"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Client Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Elevate Physio Group"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!code) {
                    const initials = e.target.value
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 4);
                    setCode(initials);
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. EPG"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-[#3D5249]/20 focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Primary Client Stakeholder
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Sarah Jenkins"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Stakeholder Email
              </label>
              <input
                type="email"
                placeholder="e.g. sarah@elevatephysio.com.au"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                GIM Account Lead
              </label>
              <select
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              >
                <option value="Divine Origines">Divine Origines (Owner)</option>
                <option value="Radzdom Gallego">Radzdom Gallego (Admin / Tech Lead)</option>
                <option value="Ma. Rose Anne (RA) Malinao">Ma. Rose Anne (RA) Malinao (Head of Operations)</option>
                <option value="Erwin Manaog">Erwin Manaog (Project Owner)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Monthly Retainer
              </label>
              <input
                type="text"
                placeholder="e.g. $4,500/mo"
                value={retainerAmount}
                onChange={(e) => setRetainerAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Service Tier
              </label>
              <select
                value={serviceTier}
                onChange={(e) => setServiceTier(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              >
                <option value="Dedicated Growth Retainer">Dedicated Growth Retainer</option>
                <option value="Systems & Automation Retainer">Systems & Automation Retainer</option>
                <option value="Full Creative & Web Retainer">Full Creative & Web Retainer</option>
                <option value="Project-Based Sprint">Project-Based Sprint</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#3D5249]/10 flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Save Client to Supabase
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
