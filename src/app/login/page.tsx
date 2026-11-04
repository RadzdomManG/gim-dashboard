"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// Verified personnel credentials database
export const VERIFIED_ACCOUNTS: Record<
  string,
  {
    password: string;
    user: {
      id: string;
      username: string;
      name: string;
      nickname: string;
      email: string;
      role: "Owner" | "Admin" | "Operations Manager" | "Project Owner" | "Team Member" | "Team Specialist" | "Social Media Specialist" | "Client User";
      isCoreAdmin: boolean;
      avatarColor: string;
      title: string;
      clientScope: string;
    };
  }
> = {
  "divine.origines": {
    password: "GIM_2026!OS!",
    user: {
      id: "divine-001",
      username: "divine.origines",
      name: "Divine Origines",
      nickname: "Divine",
      email: "divine@graceinmotion.agency",
      role: "Owner",
      isCoreAdmin: false, // Divine is Owner, Radz & RA are Core Admins
      avatarColor: "bg-[#3D5249]",
      title: "Founder & Strategy Lead",
      clientScope: "all",
    },
  },
  "rdzgllgo": {
    password: "Radzrose012116!",
    user: {
      id: "radz-001",
      username: "rdzgllgo",
      name: "Radzdom Gallego",
      nickname: "Radz",
      email: "radz@graceinmotion.agency",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#466B53]",
      title: "Chief Automation Architect & Platform Systems Lead",
      clientScope: "all",
    },
  },
  "ra.malinao": {
    password: "RA_GIM2026!",
    user: {
      id: "ra-001",
      username: "ra.malinao",
      name: "Ma. Rose Anne (RA) Malinao",
      nickname: "RA",
      email: "ra@graceinmotion.agency",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#518E6A]",
      title: "Core Admin & Commercial Operations / Invoicing",
      clientScope: "all",
    },
  },
  "aneweraa.ai@gmail.com": {
    password: "Password123!",
    user: {
      id: "ra-002",
      username: "aneweraa.ai@gmail.com",
      name: "Ma. Rose Anne (RA) Malinao",
      nickname: "RA",
      email: "aneweraa.ai@gmail.com",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#518E6A]",
      title: "Core Admin & Commercial Operations / Invoicing",
      clientScope: "all",
    },
  },
  "erwin.manaog": {
    password: "Erwin_GIM2026!",
    user: {
      id: "erwin-001",
      username: "erwin.manaog",
      name: "Erwin Manaog",
      nickname: "Erwin",
      email: "erwin@graceinmotion.agency",
      role: "Project Owner",
      isCoreAdmin: false,
      avatarColor: "bg-blue-600",
      title: "Project Owner & Delivery Lead",
      clientScope: "Little Treasures Company",
    },
  },
  "camille.smm": {
    password: "Camille_GIM2026!",
    user: {
      id: "camille-001",
      username: "camille.smm",
      name: "Camille Bautista",
      nickname: "Camille",
      email: "camille.smm@graceinmotion.agency",
      role: "Social Media Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-purple-600",
      title: "Social Media Specialist",
      clientScope: "Little Treasures Company",
    },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authSaved = localStorage.getItem("gim_auth_user");
      if (authSaved) {
        router.replace("/");
      }
    }
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanUsername = username.trim().toLowerCase();

    // 1. Check built-in verified accounts (instant local verification)
    const account = VERIFIED_ACCOUNTS[cleanUsername];
    if (account && account.password === password) {
      if (typeof window !== "undefined") {
        localStorage.setItem("gim_auth_user", JSON.stringify(account.user));
      }
      setTimeout(() => {
        setLoading(false);
        router.push("/");
      }, 400);
      return;
    }

    // 2. Check dynamic accounts in local storage (same browser fast lookup)
    if (typeof window !== "undefined") {
      try {
        const storedCustomLogins = localStorage.getItem("gim_custom_logins");
        if (storedCustomLogins) {
          const customLogins = JSON.parse(storedCustomLogins);
          const userEntry = customLogins[cleanUsername];
          if (userEntry && userEntry.password === password && !userEntry.is_revoked) {
            localStorage.setItem("gim_auth_user", JSON.stringify(userEntry.user));
            setTimeout(() => {
              setLoading(false);
              router.push("/");
            }, 400);
            return;
          }
        }

        const storedInvites = localStorage.getItem("gim_invited_users");
        if (storedInvites) {
          const invites = JSON.parse(storedInvites);
          const matched = invites.find(
            (inv: any) =>
              (inv.username?.toLowerCase() === cleanUsername || inv.name?.toLowerCase() === cleanUsername) &&
              inv.password === password
          );
          if (matched) {
            const userObj = {
              id: matched.id || `usr-${Date.now()}`,
              username: matched.username || cleanUsername,
              name: matched.name,
              nickname: matched.name.split(" ")[0],
              email: matched.email || `${cleanUsername}@graceinmotion.agency`,
              role: matched.role || "Team Member",
              isCoreAdmin: matched.role === "Admin",
              avatarColor: "bg-[#466B53]",
              title: matched.title || matched.role,
              clientScope: matched.clientScope || "all",
            };
            localStorage.setItem("gim_auth_user", JSON.stringify(userObj));
            setTimeout(() => {
              setLoading(false);
              router.push("/");
            }, 400);
            return;
          }
        }
      } catch (err) {
        console.error("Local invite lookup failed:", err);
      }
    }

    // 3. Query Cloud Database (/api/auth/login) for cross-browser, multi-device authentication
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("gim_auth_user", JSON.stringify(data.user));
        }
        setLoading(false);
        router.push("/");
        return;
      }
      if (data && data.error) {
        setLoading(false);
        setError(data.error);
        return;
      }
    } catch (err) {
      console.error("Cloud authentication lookup failed:", err);
    }

    // 4. Fallback Authentication failure
    setTimeout(() => {
      setLoading(false);
      setError("Invalid username or password. Only verified GIM personnel may access Mission Control.");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#FBF6F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Brand Mark */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 relative flex items-center justify-center">
            <Image
              src="/gim-mark-green.png"
              alt="GIM"
              width={44}
              height={44}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#242E29]">
          GIM Mission Control
        </h2>
        <p className="text-xs text-[#65746C]">
          Authorized access portal for Grace in Motion personnel
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E8E2DD] rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[#242E29] mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Enter assigned username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-xl text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A] font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#242E29]">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-xl text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A] transition-all"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 mt-2"
            >
              <span>{loading ? "Verifying Credentials..." : "Sign In to GIM"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          <div className="pt-4 border-t border-[#E8E2DD] text-center">
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#65746C]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#518E6A]" />
              <span>Strict Access Governance: Only authenticated accounts permitted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
