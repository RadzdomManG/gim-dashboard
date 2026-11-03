"use client";

import React, { useState } from "react";
import {
  Plus,
  Calendar,
  User,
  Clock,
  Building2,
  FileText,
  Tag,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClient?: string;
  defaultDate?: string;
  onTaskCreated?: () => void;
  availableClients?: string[];
}

export function CreateTaskModal({
  isOpen,
  onClose,
  defaultClient = "Little Treasures Company",
  defaultDate,
  onTaskCreated,
  availableClients = [
    "Little Treasures Company",
    "We Rock the Spectrum (WRTS)",
    "Studio Nets",
    "InVogue Cleans",
    "Aaron Ofosu Bootcamp",
    "Tch2Thrive",
  ],
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [client, setClient] = useState(defaultClient);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"To Do" | "In Progress" | "In Review" | "Approved">("To Do");
  const [priority, setPriority] = useState<"Low" | "Normal" | "High" | "Urgent">("Normal");
  const [dueDate, setDueDate] = useState(() => defaultDate || new Date().toISOString().split("T")[0]);
  const [assigneeName, setAssigneeName] = useState("Radzdom Gallego");
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !client.trim()) {
      setErrorMsg("Title and client are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          client: client.trim(),
          description: description.trim(),
          status,
          priority,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          assignee_name: assigneeName,
          assignee_id: assigneeName.toLowerCase().replace(/\s+/g, "-"),
          tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create task.");
      }

      if (onTaskCreated) onTaskCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Creation failed.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#242E29]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#3D5249]/15 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#3D5249] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight text-white">
                Add Client Task / Milestone
              </h2>
              <p className="text-xs text-[#FBF6F3]/80">
                Scheduled deliverable saved in Supabase project without modifying ClickUp.
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-900 border border-red-200 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. G11: SMM Social Reel Batches & Content Calendar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Client Organization <span className="text-red-500">*</span>
              </label>
              <select
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              >
                {availableClients.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Assignee
              </label>
              <select
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              >
                <option value="Radzdom Gallego">Radzdom Gallego (Admin)</option>
                <option value="Divine Origines">Divine Origines (Owner)</option>
                <option value="Ma. Rose Anne Malinao">Ma. Rose Anne (Admin)</option>
                <option value="Erwin Manaog">Erwin Manaog (Senior Specialist)</option>
                <option value="Social Media Manager">Social Media Manager (SMM)</option>
                <option value="BJ Ricafrente">BJ Ricafrente</option>
                <option value="Joy Fabular">Joy Fabular</option>
                <option value="Jedy Caillio">Jedy Caillio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
              Deliverable Brief / Notes
            </label>
            <textarea
              rows={3}
              placeholder="Operational instructions, scope requirements, links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. G11, SMM, Content, Summit"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
            />
          </div>

          <div className="pt-3 border-t border-[#3D5249]/10 flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Save Task to Calendar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
