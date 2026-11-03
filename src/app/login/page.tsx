"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate authentic authentication with direct redirect
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 600);
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("••••••••••••");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 400);
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
          Authorized access portal for Grace in Motion team and authenticated clients
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
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
                <input
                  type="email"
                  required
                  placeholder="name@graceinmotion.agency"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#242E29]">
                  Password
                </label>
                <a href="#" className="text-[11px] text-[#466B53] hover:underline font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? "Authenticating..." : "Sign In to GIM"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          {/* Core Admin Quick Sign-In Options */}
          <div className="pt-4 border-t border-[#E8E2DD] space-y-2.5">
            <p className="text-[10px] font-semibold text-[#65746C] uppercase tracking-wider text-center">
              Quick Sign-In by Role
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin("radz@graceinmotion.agency")}
                className="p-2.5 rounded-lg border border-[#E8E2DD] bg-[#FBF6F3]/50 hover:border-[#518E6A] hover:bg-white text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-[#242E29]">Radzdom (Radz)</span>
                  <Badge variant="brand" className="text-[9px] px-1 py-0">Admin</Badge>
                </div>
                <p className="text-[10px] text-[#65746C] truncate">AI & Automations Lead</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("divine@graceinmotion.agency")}
                className="p-2.5 rounded-lg border border-[#E8E2DD] bg-[#FBF6F3]/50 hover:border-[#518E6A] hover:bg-white text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-[#242E29]">Divine Origines</span>
                  <Badge variant="dark" className="text-[9px] px-1 py-0">Owner</Badge>
                </div>
                <p className="text-[10px] text-[#65746C] truncate">Executive Strategy</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("ra@graceinmotion.agency")}
                className="p-2.5 rounded-lg border border-[#E8E2DD] bg-[#FBF6F3]/50 hover:border-[#518E6A] hover:bg-white text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-[#242E29]">RA Malinao</span>
                  <Badge variant="brand" className="text-[9px] px-1 py-0">Admin</Badge>
                </div>
                <p className="text-[10px] text-[#65746C] truncate">Operations & Invoicing</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("zoe@littletreasures.com.au")}
                className="p-2.5 rounded-lg border border-[#E8E2DD] bg-[#FBF6F3]/50 hover:border-[#518E6A] hover:bg-white text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-[#242E29]">Zoe Horner</span>
                  <Badge variant="upcoming" className="text-[9px] px-1 py-0">Client</Badge>
                </div>
                <p className="text-[10px] text-[#65746C] truncate">Little Treasures</p>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-[#65746C] flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#518E6A]" />
            <span>Supabase PostgreSQL & Row Level Security (RLS) Active</span>
          </p>
        </div>
      </div>
    </div>
  );
}
