"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  UserPlus,
  Shield,
  Building2,
  Copy,
  Check,
  AlertCircle,
  X,
  RefreshCw,
  Clock,
  Trash2,
  ExternalLink,
  Send,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface InvitationRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  client_id?: string | null;
  assigned_clients?: string[] | null;
  token: string;
  expires_at: string;
  accepted_at?: string | null;
  is_revoked: boolean;
  created_at: string;
  clients?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface UserInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientsList?: { id: string; name: string; code: string }[];
}

export function UserInvitationModal({
  isOpen,
  onClose,
  clientsList = [
    { id: "ltc-01", name: "Little Treasures Company", code: "LTC" },
    { id: "wrts-02", name: "We Rock the Spectrum (WRTS)", code: "WRTS" },
    { id: "sn-03", name: "Studio Nets", code: "SN" },
    { id: "ivc-04", name: "InVogue Cleans", code: "IVC" },
    { id: "ao-05", name: "Aaron Ofosu Bootcamp", code: "AO" },
    { id: "t2t-06", name: "Tch2Thrive", code: "T2T" },
  ],
}: UserInvitationModalProps) {
  const [activeTab, setActiveTab] = useState<"send" | "manage">("send");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("team_member");
  const [clientId, setClientId] = useState("");
  const [selectedClients, setSelectedClients] = useState<string[]>(["Little Treasures Company"]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Invitations list
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [isFetchingList, setIsFetchingList] = useState(false);

  const fetchInvitations = async () => {
    setIsFetchingList(true);
    try {
      const res = await fetch("/api/invitations");
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      }
    } catch (e) {
      console.error("Failed to fetch invitations:", e);
    } finally {
      setIsFetchingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInvitations();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStatusMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    setGeneratedLink(null);

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          full_name: fullName.trim() || email.split("@")[0],
          role,
          client_id: role === "client_user" ? clientId || null : null,
          assigned_clients: role === "admin" ? ["All Clients"] : selectedClients,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create invitation");
      }

      setStatusMessage({
        type: "success",
        text: data.message || `Invitation successfully created for ${email}.`,
      });

      if (data.action_link) {
        setGeneratedLink(data.action_link);
      }

      // Reset form fields
      setEmail("");
      setFullName("");
      setRole("team_member");
      setClientId("");

      // Refresh list in background
      fetchInvitations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to dispatch invitation.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (linkToCopy: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(linkToCopy);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInvitations((prev) =>
          prev.map((inv) => (inv.id === id ? { ...inv, is_revoked: true } : inv))
        );
      }
    } catch (e) {
      console.error("Failed to revoke invitation:", e);
    }
  };

  const roleLabelMap: Record<string, string> = {
    owner: "Agency Owner",
    admin: "Admin (Universal Access)",
    operations_manager: "Operations Manager",
    project_owner: "Project Owner",
    team_member: "Team Member / Specialist",
    client_user: "Client Stakeholder (Portal Only)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#242E29]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#3D5249]/15 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#3D5249] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif tracking-tight text-white flex items-center gap-2">
                Supabase User & Client Invitation
              </h2>
              <p className="text-xs text-[#FBF6F3]/80">
                Dispatch official email invitations via Supabase Auth with automated role provisioning.
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

        {/* Tab Switcher */}
        <div className="flex border-b border-[#3D5249]/10 bg-[#FBF6F3]/50 px-6 pt-3">
          <button
            onClick={() => setActiveTab("send")}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "send"
                ? "border-[#518E6A] text-[#3D5249]"
                : "border-transparent text-[#65746C] hover:text-[#242E29]"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Send New Invitation
          </button>
          <button
            onClick={() => {
              setActiveTab("manage");
              fetchInvitations();
            }}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "manage"
                ? "border-[#518E6A] text-[#3D5249]"
                : "border-transparent text-[#65746C] hover:text-[#242E29]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Active & Pending ({invitations.filter((i) => !i.is_revoked && !i.accepted_at).length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "send" ? (
            <form onSubmit={handleSendInvitation} className="space-y-5">
              {/* Status Alert */}
              {statusMessage && (
                <div
                  className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
                    statusMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : "bg-red-50 text-red-900 border-red-200"
                  }`}
                >
                  {statusMessage.type === "success" ? (
                    <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">{statusMessage.text}</p>
                    {statusMessage.type === "success" && (
                      <p className="text-xs text-emerald-700">
                        Supabase has queued an invitation email. You can also copy the direct activation link below for instant testing.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Link Banner */}
              {generatedLink && (
                <div className="p-4 rounded-xl bg-[#FBF6F3] border border-[#518E6A]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3D5249] flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-[#518E6A]" />
                      Direct Activation Link (For Testing / Immediate Use)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(generatedLink)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#518E6A] text-white hover:bg-[#466B53] transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#3D5249]/15 text-xs font-mono text-[#242E29] break-all select-all">
                    {generatedLink}
                  </div>
                  <p className="text-[11px] text-[#65746C]">
                    Open this link in an incognito window to verify the invite flow without signing out of your current session.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1.5">
                    Recipient Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#65746C] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. test@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29]"
                    />
                  </div>
                  <p className="text-[11px] text-[#65746C] mt-1">
                    Supabase Auth will deliver the invite email to this mailbox.
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1.5">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Hunter"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#3D5249]/20 focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29]"
                  />
                  <p className="text-[11px] text-[#65746C] mt-1">
                    Will be stored in their user profile upon account activation.
                  </p>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1.5">
                  Assigned Platform Role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: "admin",
                      title: "Admin",
                      desc: "Full operational & member control across all clients.",
                    },
                    {
                      id: "operations_manager",
                      title: "Operations Manager",
                      desc: "Sprint management, capacity & QA deliverable approvals.",
                    },
                    {
                      id: "team_member",
                      title: "Team Member / Specialist",
                      desc: "Task backlog execution & team collaboration channels.",
                    },
                    {
                      id: "client_user",
                      title: "Client Stakeholder",
                      desc: "Restricted Portal access isolated strictly to their client.",
                    },
                  ].map((item) => (
                    <label
                      key={item.id}
                      onClick={() => setRole(item.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        role === item.id
                          ? "bg-[#3D5249]/5 border-[#518E6A] ring-1 ring-[#518E6A]"
                          : "bg-white border-[#3D5249]/15 hover:border-[#3D5249]/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="invitation_role"
                        value={item.id}
                        checked={role === item.id}
                        onChange={() => setRole(item.id)}
                        className="mt-0.5 text-[#518E6A] focus:ring-[#518E6A]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#242E29]">{item.title}</div>
                        <div className="text-[11px] text-[#65746C]">{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Client Scope Selection (Multi-Client Assignment) */}
              {role === "admin" ? (
                <div className="p-3.5 rounded-xl bg-[#3D5249]/5 border border-[#3D5249]/15 flex items-start gap-2.5 text-xs text-[#3D5249]">
                  <Shield className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                  <span>
                    <strong>Universal Admin Scope:</strong> Admins automatically hold full visibility across all 6 client accounts, automations, and deliverables.
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FBF6F3] border border-[#518E6A]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249]">
                        Select Assigned Clients (Tenant Scope) <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-[#65746C] mt-0.5">
                        Choose which clients this member will handle (e.g., SMM handling Little Treasures &amp; InVogue). They will only see data for these clients.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedClients(clientsList.map((c) => c.name))}
                        className="text-[#518E6A] hover:underline font-semibold text-[11px]"
                      >
                        All
                      </button>
                      <span className="text-[#65746C]">&bull;</span>
                      <button
                        type="button"
                        onClick={() => setSelectedClients([])}
                        className="text-[#65746C] hover:underline text-[11px]"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {clientsList.map((client) => {
                      const isChecked = selectedClients.includes(client.name);
                      return (
                        <div
                          key={client.id}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedClients((prev) =>
                              prev.includes(client.name)
                                ? prev.filter((c) => c !== client.name)
                                : [...prev, client.name]
                            );
                            if (role === "client_user") {
                              setClientId(client.id);
                            }
                          }}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center gap-3 ${
                            isChecked
                              ? "bg-[#3D5249]/5 border-[#518E6A] ring-2 ring-[#518E6A]"
                              : "bg-white border-[#3D5249]/15 hover:border-[#3D5249]/40 hover:bg-[#FBF6F3]/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="pointer-events-none text-[#518E6A] focus:ring-0 rounded border-[#3D5249]/30 h-4 w-4"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#242E29] truncate">
                              {client.name}
                            </div>
                            <span className="text-[10px] text-[#65746C] font-mono">
                              Code: {client.code}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-[11px] text-[#65746C] italic pt-1">
                    * The 3 Core Admins (Divine, Radz, RA) can edit, add, or revoke client access anytime from Settings.
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#3D5249]/10 flex items-center justify-between">
                <div className="text-xs text-[#65746C]">
                  Invitation links expire automatically in 7 days.
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={onClose} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Supabase Invitation
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            /* Manage / Active Invitations Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#242E29]">Supabase Invitation Audit Log</h3>
                  <p className="text-xs text-[#65746C]">
                    Track pending email invites, accepted registrations, and revoke access anytime.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchInvitations}
                  disabled={isFetchingList}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingList ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {invitations.length === 0 ? (
                <div className="p-8 text-center bg-[#FBF6F3] rounded-xl border border-dashed border-[#3D5249]/20 text-[#65746C]">
                  <Mail className="w-8 h-8 mx-auto text-[#65746C]/40 mb-2" />
                  <p className="text-sm font-medium">No invitations sent yet.</p>
                  <p className="text-xs text-[#65746C]/80 mt-1">
                    Switch to &quot;Send New Invitation&quot; to invite your first team member or client.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-[#3D5249]/15 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#3D5249]/5 border-b border-[#3D5249]/10 font-bold uppercase tracking-wider text-[#3D5249]">
                      <tr>
                        <th className="py-2.5 px-3">Recipient</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Sent</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3D5249]/10 bg-white">
                      {invitations.map((inv) => {
                        const isExpired = new Date(inv.expires_at) < new Date();
                        const isAccepted = !!inv.accepted_at;
                        const isRevoked = inv.is_revoked;

                        return (
                          <tr key={inv.id} className="hover:bg-[#FBF6F3]/50 transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-semibold text-[#242E29]">{inv.full_name}</div>
                              <div className="text-[11px] text-[#65746C]">{inv.email}</div>
                              {inv.assigned_clients && inv.assigned_clients.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {inv.assigned_clients.map((c, idx) => (
                                    <span key={idx} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#3D5249]/10 text-[#3D5249]">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              ) : inv.clients ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-[#518E6A] font-medium mt-0.5">
                                  <Building2 className="w-3 h-3" />
                                  {inv.clients.name}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#65746C] font-mono mt-0.5 block">Universal Scope</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <Badge variant="neutral">{roleLabelMap[inv.role] || inv.role}</Badge>
                            </td>
                            <td className="py-3 px-3">
                              {isRevoked ? (
                                <Badge variant="critical">Revoked</Badge>
                              ) : isAccepted ? (
                                <Badge variant="active">Accepted</Badge>
                              ) : isExpired ? (
                                <Badge variant="neutral">Expired</Badge>
                              ) : (
                                <Badge variant="review" dot>
                                  Pending Invite
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[#65746C]">
                              {new Date(inv.created_at).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isRevoked && !isAccepted && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const directLink = `http://localhost:3000/login?invite=accepted&email=${encodeURIComponent(
                                          inv.email
                                        )}&token=${inv.token}`;
                                        handleCopyLink(directLink);
                                      }}
                                      title="Copy Direct Link"
                                      className="p-1.5 rounded-lg border border-[#3D5249]/20 hover:bg-[#3D5249]/10 text-[#3D5249] transition-colors"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRevoke(inv.id)}
                                      title="Revoke Invitation"
                                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
