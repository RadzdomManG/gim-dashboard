"use client";

import React, { useState, useEffect } from "react";
import {
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
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface ProvisionedUserRecord {
  id: string;
  username: string;
  full_name: string;
  password?: string;
  role: string;
  client_id?: string | null;
  assigned_clients?: string[] | null;
  created_at: string;
  is_revoked: boolean;
}

interface UserInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientsList?: { id: string; name: string; code: string }[];
  onUserProvisioned?: (user: { name: string; username: string; role: string; clientScope: string }) => void;
}

export function UserInvitationModal({
  isOpen,
  onClose,
  clientsList = [
    { id: "ltc-01", name: "Little Treasures Company", code: "LTC" },
    { id: "sn-03", name: "Studio Nets", code: "SN" },
    { id: "ivc-04", name: "InVogue Cleans", code: "IVC" },
    { id: "ao-05", name: "Aaron Ofosu Bootcamp", code: "AO" },
    { id: "t2t-06", name: "Tch2Thrive", code: "T2T" },
  ],
  onUserProvisioned,
}: UserInvitationModalProps) {
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("team_member");
  const [clientId, setClientId] = useState("");
  const [selectedClients, setSelectedClients] = useState<string[]>(["Little Treasures Company"]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string; name: string } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Stored provisioned users list
  const [usersList, setUsersList] = useState<ProvisionedUserRecord[]>([]);

  const loadStoredUsers = () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("gim_custom_logins");
      if (stored) {
        const parsed = JSON.parse(stored);
        const mapped: ProvisionedUserRecord[] = Object.keys(parsed).map((key) => {
          const acc = parsed[key];
          return {
            id: acc.user?.id || `usr-${key}`,
            username: key,
            full_name: acc.user?.name || key,
            password: acc.password,
            role: acc.user?.role || "Team Member",
            assigned_clients: acc.user?.clientScope ? [acc.user.clientScope] : ["Little Treasures Company"],
            created_at: acc.created_at || new Date().toISOString(),
            is_revoked: !!acc.is_revoked,
          };
        });
        setUsersList(mapped);
      } else {
        setUsersList([
          {
            id: "u-camille",
            username: "camille.smm",
            full_name: "Camille Bautista",
            password: "Camille_GIM2026!",
            role: "Social Media Specialist",
            assigned_clients: ["Little Treasures Company"],
            created_at: new Date().toISOString(),
            is_revoked: false,
          },
          {
            id: "u-erwin",
            username: "erwin.manaog",
            full_name: "Erwin Manaog",
            password: "Erwin_GIM2026!",
            role: "Project Owner",
            assigned_clients: ["Little Treasures Company", "Studio Nets"],
            created_at: new Date().toISOString(),
            is_revoked: false,
          },
        ]);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStoredUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !password.trim()) {
      setStatusMessage({ type: "error", text: "Name, Username, and Password are all required." });
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, ".");
    setIsLoading(true);
    setStatusMessage(null);
    setCreatedCredentials(null);

    try {
      // 1. Store in localStorage custom logins for instant login at /login
      const existingRaw = localStorage.getItem("gim_custom_logins");
      const existing = existingRaw ? JSON.parse(existingRaw) : {};

      const primaryClient = selectedClients[0] || "Little Treasures Company";
      const roleDisplayName =
        role === "admin"
          ? "Admin"
          : role === "project_owner"
          ? "Project Owner"
          : role === "smm_specialist"
          ? "Social Media Specialist"
          : role === "client_user"
          ? "Client User"
          : "Team Member";

      existing[cleanUsername] = {
        password: password.trim(),
        user: {
          id: `usr-${cleanUsername}`,
          username: cleanUsername,
          name: fullName.trim(),
          nickname: fullName.trim().split(" ")[0],
          email: `${cleanUsername}@graceinmotion.agency`,
          role: roleDisplayName,
          isCoreAdmin: role === "admin",
          avatarColor: "bg-[#466B53]",
          title: roleDisplayName,
          clientScope: role === "admin" ? "all" : primaryClient,
        },
        created_at: new Date().toISOString(),
        is_revoked: false,
      };

      localStorage.setItem("gim_custom_logins", JSON.stringify(existing));

      // Also persist to invitations API
      try {
        await fetch("/api/invitations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: cleanUsername,
            full_name: fullName.trim(),
            password: password.trim(),
            role,
            client_id: clientId || null,
            assigned_clients: role === "admin" ? ["All Clients"] : selectedClients,
          }),
        });
      } catch (err) {
        // local-first fallback
      }

      setCreatedCredentials({
        name: fullName.trim(),
        username: cleanUsername,
        password: password.trim(),
      });

      setStatusMessage({
        type: "success",
        text: `Account for ${fullName.trim()} (@${cleanUsername}) successfully created!`,
      });

      if (onUserProvisioned) {
        onUserProvisioned({
          name: fullName.trim(),
          username: cleanUsername,
          role: roleDisplayName,
          clientScope: role === "admin" ? "all" : primaryClient,
        });
      }

      // Reset input fields
      setFullName("");
      setUsername("");
      setPassword("");
      loadStoredUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Grace in Motion Access Credentials:\nName: ${createdCredentials.name}\nUsername: ${createdCredentials.username}\nPassword: ${createdCredentials.password}\nLogin URL: ${window.location.origin}/login`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCreds(true);
      setTimeout(() => setCopiedCreds(false), 2500);
    }
  };

  const handleRevokeUser = (targetUsername: string) => {
    try {
      const existingRaw = localStorage.getItem("gim_custom_logins");
      if (existingRaw) {
        const existing = JSON.parse(existingRaw);
        if (existing[targetUsername]) {
          existing[targetUsername].is_revoked = !existing[targetUsername].is_revoked;
          localStorage.setItem("gim_custom_logins", JSON.stringify(existing));
          loadStoredUsers();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#242E29]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#3D5249]/15 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#3D5249] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif tracking-tight text-white flex items-center gap-2">
                Member &amp; Staff Account Provisioning
              </h2>
              <p className="text-xs text-[#FBF6F3]/80">
                Setup new member credentials using Name, Username, and Password (No Gmail/Email required).
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
            onClick={() => setActiveTab("create")}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "create"
                ? "border-[#518E6A] text-[#3D5249]"
                : "border-transparent text-[#65746C] hover:text-[#242E29]"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Member Account
          </button>
          <button
            onClick={() => {
              setActiveTab("manage");
              loadStoredUsers();
            }}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "manage"
                ? "border-[#518E6A] text-[#3D5249]"
                : "border-transparent text-[#65746C] hover:text-[#242E29]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Provisioned Directory ({usersList.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "create" ? (
            <form onSubmit={handleCreateMember} className="space-y-5">
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
                  <p className="font-semibold">{statusMessage.text}</p>
                </div>
              )}

              {/* Created Credentials Card */}
              {createdCredentials && (
                <div className="p-4 rounded-xl bg-[#FBF6F3] border border-[#518E6A]/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3D5249] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#518E6A]" />
                      Member Login Credentials Created
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCredentials}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#518E6A] text-white hover:bg-[#466B53] transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      {copiedCreds ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white" />
                          Copy Credentials
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#3D5249]/15 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-[#65746C] block text-[10px] uppercase font-bold">Full Name</span>
                      <strong className="text-[#242E29]">{createdCredentials.name}</strong>
                    </div>
                    <div>
                      <span className="text-[#65746C] block text-[10px] uppercase font-bold">Username</span>
                      <strong className="text-[#518E6A] font-mono">{createdCredentials.username}</strong>
                    </div>
                    <div>
                      <span className="text-[#65746C] block text-[10px] uppercase font-bold">Password</span>
                      <strong className="text-[#242E29] font-mono">{createdCredentials.password}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#65746C]">
                    Member can sign in immediately at <code>/login</code> using this Username and Password.
                  </p>
                </div>
              )}

              {/* Three Core Required Inputs: Name, Username, Password */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#65746C] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Camille Bautista"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (!username) {
                          setUsername(e.target.value.toLowerCase().replace(/\s+/g, "."));
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#3D5249]/20 focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29]"
                    />
                  </div>
                  <p className="text-[10px] text-[#65746C] mt-1">
                    Display name for dashboards &amp; task cards.
                  </p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="text-[#65746C] font-mono text-xs absolute left-3 top-2.5">@</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. camille.smm"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, "."))}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#3D5249]/20 font-mono focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29]"
                    />
                  </div>
                  <p className="text-[10px] text-[#65746C] mt-1">
                    Used to sign in to Mission Control.
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1.5">
                    Assigned Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#65746C] absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="e.g. Camille_2026!"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#3D5249]/20 font-mono focus:outline-none focus:ring-2 focus:ring-[#518E6A]/30 focus:border-[#518E6A] bg-white text-[#242E29]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-[#65746C] hover:text-[#242E29]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#65746C] mt-1">
                    Set their initial login password.
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
                      badge: "Universal Authority",
                      desc: "Full operational authority across all clients, timesheets, and platform settings.",
                    },
                    {
                      id: "project_owner",
                      title: "Project Owner",
                      badge: "Delivery Lead",
                      desc: "Can manage tasks, assign deliverables, review proofs, and coordinate client sprints.",
                    },
                    {
                      id: "smm_specialist",
                      title: "Social Media Specialist",
                      badge: "SMM Lead",
                      desc: "Dedicated content calendar execution, reel production, and media attachments.",
                    },
                    {
                      id: "team_member",
                      title: "Team Member / Specialist",
                      badge: "Operational Staff",
                      desc: "Standard access to complete assigned tasks, record timesheets, and post comments.",
                    },
                    {
                      id: "client_user",
                      title: "Client Stakeholder",
                      badge: "Portal Only",
                      desc: "Single-tenant portal access to view approved tasks and download invoices.",
                    },
                  ].map((r) => {
                    const isSelected = role === r.id;
                    return (
                      <div
                        key={r.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setRole(r.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-left ${
                          isSelected
                            ? "bg-[#3D5249]/5 border-[#518E6A] ring-2 ring-[#518E6A]"
                            : "bg-white border-[#3D5249]/15 hover:border-[#3D5249]/40 hover:bg-[#FBF6F3]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-[#242E29] flex items-center gap-1.5">
                            <Shield className={`w-3.5 h-3.5 ${isSelected ? "text-[#518E6A]" : "text-[#65746C]"}`} />
                            {r.title}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-[#3D5249]/15 text-[#3D5249]">
                            {r.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#65746C] leading-snug">{r.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Client Tenant Scoping */}
              {role !== "admin" && (
                <div className="p-4 rounded-xl bg-[#FBF6F3] border border-[#518E6A]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249]">
                        Select Assigned Clients (Tenant Scope) <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-[#65746C] mt-0.5">
                        Member will only have access to tasks, calendars, and deliverables for selected accounts.
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
                          onClick={() => {
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
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#3D5249]/10 flex items-center justify-between">
                <div className="text-xs text-[#65746C]">
                  Setup is instant &bull; Username &amp; password active immediately
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={onClose} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>Save &amp; Provision Member</span>
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            /* Manage / Active Directory Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#242E29]">Active Provisioned Members</h3>
                  <p className="text-xs text-[#65746C]">
                    All accounts created via Username &amp; Password.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={loadStoredUsers}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </Button>
              </div>

              <div className="rounded-xl border border-[#3D5249]/15 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#3D5249]/5 border-b border-[#3D5249]/10 font-bold uppercase tracking-wider text-[#3D5249]">
                    <tr>
                      <th className="py-2.5 px-3">Member Name</th>
                      <th className="py-2.5 px-3">Username</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Assigned Password</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3D5249]/10 bg-white">
                    {usersList.map((user) => (
                      <tr key={user.username} className="hover:bg-[#FBF6F3]/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#242E29]">
                          {user.full_name}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#518E6A] font-bold">
                          @{user.username}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="brand">{user.role}</Badge>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#65746C]">
                          {user.password || "••••••••"}
                        </td>
                        <td className="py-3 px-3">
                          {user.is_revoked ? (
                            <Badge variant="critical" dot>Revoked</Badge>
                          ) : (
                            <Badge variant="active" dot>Active</Badge>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRevokeUser(user.username)}
                            className={`text-[11px] font-semibold hover:underline ${
                              user.is_revoked ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {user.is_revoked ? "Restore" : "Revoke Access"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
