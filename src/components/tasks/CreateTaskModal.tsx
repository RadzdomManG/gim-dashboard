"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Calendar,
  AlertCircle,
  User,
  Clock,
  Building2,
  FileText,
  Tag,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Video as VideoIcon,
  Link2,
  Paperclip,
  Trash2,
  UploadCloud,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { soundManager } from "@/lib/audio/sounds";

interface MediaAttachment {
  id: string;
  type: "image" | "video" | "pdf" | "document" | "link";
  url: string;
  name: string;
  size?: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClient?: string;
  defaultDate?: string;
  onTaskCreated?: () => void;
  availableClients?: string[];
  currentUserName?: string;
  currentUserRole?: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  defaultClient = "Little Treasures Company",
  defaultDate,
  onTaskCreated,
  availableClients = [
    "Little Treasures Company",
    "Studio Nets",
    "InVogue Cleans",
    "Aaron Ofosu Bootcamp",
    "Tch2Thrive",
  ],
  currentUserName = "Radzdom Gallego",
  currentUserRole = "Admin",
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [client, setClient] = useState(defaultClient);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"To Do" | "In Progress" | "In Review" | "Approved">("To Do");
  const [priority, setPriority] = useState<"Low" | "Normal" | "High" | "Urgent">("Normal");
  const [dueDate, setDueDate] = useState(() => defaultDate || new Date().toISOString().split("T")[0]);
  const [assigneeName, setAssigneeName] = useState(currentUserName);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Assignee options loaded dynamically from team & newly added members
  const [assigneeOptions, setAssigneeOptions] = useState<{ name: string; nickname?: string }[]>([
    { name: "Radzdom Gallego", nickname: "Radz" },
    { name: "Divine Origines", nickname: "Divine" },
    { name: "Ma. Rose Anne Malinao", nickname: "RA" },
    { name: "Erwin Manaog", nickname: "Erwin" },
    { name: "BJ Ricafrente", nickname: "BJ" },
    { name: "Joy Fabular", nickname: "Joy" },
    { name: "Camille Bautista", nickname: "Camille" },
    { name: "Jedy Caillio", nickname: "Jedy" },
  ]);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((data) => {
        if (data.members && Array.isArray(data.members)) {
          const list = data.members.map((m: any) => ({
            name: m.full_name || m.name,
            nickname: m.nickname || (m.full_name || m.name)?.split(" ")[0],
          }));
          setAssigneeOptions(list);
        }
      })
      .catch(() => {});
  }, []);

  // Attachments state
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accessibility: Escape key close (Design Standard 7.4)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle local file uploads from PC (Images, Videos, PDFs, Docs)
  const handleLocalFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const fileSizeKB = Math.round(file.size / 1024);
      const sizeStr = fileSizeKB > 1024 ? `${(fileSizeKB / 1024).toFixed(1)} MB` : `${fileSizeKB} KB`;

      let fileType: "image" | "video" | "pdf" | "document" = "document";
      if (file.type.startsWith("image/")) {
        fileType = "image";
      } else if (file.type.startsWith("video/")) {
        fileType = "video";
      } else if (file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf")) {
        fileType = "pdf";
      }

      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newAtt: MediaAttachment = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: fileType,
          url: dataUrl,
          name: file.name,
          size: sizeStr,
        };
        setAttachments((prev) => [...prev, newAtt]);
      };

      reader.readAsDataURL(file);
    });

    // Reset input value so the same file can be re-uploaded if needed
    e.target.value = "";
  };

  const handleAddLinkAttachment = () => {
    if (!linkUrl.trim()) return;
    const newAtt: MediaAttachment = {
      id: `link-${Date.now()}`,
      type: "link",
      url: linkUrl.trim(),
      name: linkLabel.trim() || linkUrl.trim(),
    };
    setAttachments((prev) => [...prev, newAtt]);
    setLinkUrl("");
    setLinkLabel("");
    setShowLinkInput(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

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

    // Format attachments into description if present
    let finalDescription = description.trim();
    if (attachments.length > 0) {
      const attachmentsBlock = attachments
        .map((a) => {
          if (a.type === "link") return `[LINK: ${a.name}](${a.url})`;
          return `[${a.type.toUpperCase()}: ${a.name} (${a.size || "File"})]`;
        })
        .join("\n");
      finalDescription = finalDescription
        ? `${finalDescription}\n\n**Media & Attachments:**\n${attachmentsBlock}`
        : `**Media & Attachments:**\n${attachmentsBlock}`;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          client: client.trim(),
          description: finalDescription,
          status,
          priority,
          due_date: dueDate,
          assignee_name: assigneeName.trim(),
          tags,
          attachments,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create task");
      }

      // Play success chime
      soundManager.play("task");

      // Broadcast task change for real-time views
      try {
        window.dispatchEvent(new CustomEvent("gim:task-mutated", { detail: { action: "create" } }));
      } catch (err) {
        console.error("Failed to broadcast task mutation:", err);
      }

      if (onTaskCreated) onTaskCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-[#E8E2DD] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Hidden File Input for PC uploads */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
          onChange={handleLocalFilesUpload}
          className="hidden"
        />

        {/* Header */}
        <div className="bg-[#3D5249] p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="modal-title" className="font-bold text-base leading-tight">
                Create New Deliverable Task
              </h3>
              <p className="text-xs text-white/80">
                Direct Supabase creation with local PC file attachments and client scoping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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

          {/* Large Bold Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. G11: SMM Social Reel Batches & Content Calendar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-base font-bold rounded-xl border border-[#3D5249]/25 focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29] placeholder:font-normal placeholder:text-sm shadow-xs"
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
                {assigneeOptions.map((opt, i) => (
                  <option key={i} value={opt.name}>
                    {opt.name} {opt.nickname ? `(${opt.nickname})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved / Done</option>
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
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#3D5249]/20 bg-white text-[#242E29]"
              />
            </div>
          </div>

          {/* Local File Uploads & Media Attachments (NOT URL - Direct PC Upload) */}
          <div className="p-3.5 bg-[#FBF6F3] rounded-xl border border-[#E8E2DD] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-[#3D5249]">
                  Attachments & Media
                </label>
                <p className="text-[11px] text-[#65746C]">
                  Upload pictures, videos, PDFs, and files directly from your computer
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* 1-Click Upload from Local PC */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#518E6A] hover:bg-[#466B53] text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload from PC</span>
                </button>

                {/* Optional Web Link */}
                <button
                  type="button"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#E8E2DD] hover:border-[#518E6A] text-[#242E29] flex items-center gap-1 transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Attach Link</span>
                </button>
              </div>
            </div>

            {/* Optional URL prompt only if Attach Link is clicked */}
            {showLinkInput && (
              <div className="p-2.5 bg-white rounded-lg border border-[#518E6A] space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#3D5249]">
                  <span>Attach Web Link / Loom / Google Doc</span>
                  <button
                    type="button"
                    onClick={() => setShowLinkInput(false)}
                    className="text-[#65746C] hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    placeholder="https://... (Loom, Figma, Drive)"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded border border-[#E8E2DD] bg-white text-[#242E29]"
                  />
                  <input
                    type="text"
                    placeholder="Title / Description (optional)"
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded border border-[#E8E2DD] bg-white text-[#242E29]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddLinkAttachment}
                    disabled={!linkUrl.trim()}
                    className="px-3 py-1 bg-[#518E6A] text-white rounded text-xs font-semibold hover:bg-[#466B53] disabled:opacity-50"
                  >
                    Add Link
                  </button>
                </div>
              </div>
            )}

            {/* Uploaded Files Previews */}
            {attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 bg-white border border-[#E8E2DD] rounded-xl text-xs text-[#242E29] shadow-2xs hover:border-[#518E6A]/50 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      {att.type === "image" ? (
                        att.url.startsWith("data:") ? (
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#518E6A]/30 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#518E6A] flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )
                      ) : att.type === "video" ? (
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <VideoIcon className="w-4 h-4" />
                        </div>
                      ) : att.type === "pdf" ? (
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-[9px] shrink-0 border border-rose-200">
                          PDF
                        </div>
                      ) : att.type === "link" ? (
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Link2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-[#242E29] truncate">{att.name}</p>
                        <p className="text-[10px] text-[#65746C]">
                          {att.size || (att.type === "link" ? "External Link" : "Attached File")}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1 rounded-md text-[#65746C] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-[#518E6A]/40 rounded-xl p-3 text-center bg-white/70 hover:bg-white hover:border-[#518E6A] transition-colors cursor-pointer"
              >
                <UploadCloud className="w-5 h-5 text-[#518E6A] mx-auto mb-1" />
                <p className="text-xs font-semibold text-[#242E29]">Click to browse files from your computer</p>
                <p className="text-[10px] text-[#65746C]">Supports PNG, JPG, MP4, PDF, DOCX, XLSX, ZIP</p>
              </div>
            )}
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
