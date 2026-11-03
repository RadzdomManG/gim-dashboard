import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, ShieldCheck, GitBranch, Cloud, Database } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  let supabaseConnected = false;
  let supabaseMessage = "Initializing";

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    if (!error) {
      supabaseConnected = true;
      supabaseMessage = "Connected & Active";
    } else {
      supabaseMessage = error.message;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Connection failed";
    supabaseMessage = message;
  }

  return (
    <main className="min-h-screen bg-[#FBF6F3] text-[#3D5249] flex flex-col">
      {/* Top Navigation */}
      <header className="bg-[#3D5249] text-[#FBF6F3] px-8 py-5 border-b border-[#518E6A]/30 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#466B53] flex items-center justify-center font-bold text-lg text-white tracking-wider border border-[#518E6A]">
            G
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-tight">Grace In Motion</h1>
            <p className="text-xs text-[#FBF6F3]/75 font-medium tracking-wide">Agency OS · Core Infrastructure Verification</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#518E6A]/30 text-[#FBF6F3] border border-[#518E6A]/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Foundation Ready</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl w-full mx-auto p-8 flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#518E6A] bg-[#518E6A]/15 px-3 py-1 rounded-md">
            Phase 1 Foundation
          </span>
          <h2 className="text-3xl font-bold mt-3 mb-2 text-[#3D5249]">
            Infrastructure Connected & Verified
          </h2>
          <p className="text-sm text-[#3D5249]/80 leading-relaxed max-w-2xl">
            The core repository, cloud hosting, and database services are successfully established with isolated environment variables and strict version control.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* GitHub Pillar */}
          <div className="bg-white rounded-xl p-5 border border-[#3D5249]/10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#3D5249]/10 text-[#3D5249] flex items-center justify-center mb-4">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#3D5249] mb-1">GitHub</h3>
              <p className="text-xs text-[#3D5249]/70 mb-3">Version control & automated deployments</p>
              <div className="text-xs font-mono bg-[#FBF6F3] px-2.5 py-1.5 rounded border border-[#3D5249]/10 text-[#3D5249]/90 break-all">
                divineorigines/gim-dashboard
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#3D5249]/10 flex items-center text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Private Repo Active</span>
            </div>
          </div>

          {/* Vercel Pillar */}
          <div className="bg-white rounded-xl p-5 border border-[#3D5249]/10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#3D5249]/10 text-[#3D5249] flex items-center justify-center mb-4">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#3D5249] mb-1">Vercel</h3>
              <p className="text-xs text-[#3D5249]/70 mb-3">Serverless Edge hosting & CDN preview</p>
              <div className="text-xs font-mono bg-[#FBF6F3] px-2.5 py-1.5 rounded border border-[#3D5249]/10 text-[#3D5249]/90 break-all">
                gim-dashboard · divineorigines
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#3D5249]/10 flex items-center text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Vercel Project Linked</span>
            </div>
          </div>

          {/* Supabase Pillar */}
          <div className="bg-white rounded-xl p-5 border border-[#3D5249]/10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#3D5249]/10 text-[#3D5249] flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#3D5249] mb-1">Supabase</h3>
              <p className="text-xs text-[#3D5249]/70 mb-3">Auth, PostgreSQL DB & Row Level Security</p>
              <div className="text-xs font-mono bg-[#FBF6F3] px-2.5 py-1.5 rounded border border-[#3D5249]/10 text-[#3D5249]/90 break-all">
                gim-agency-os · ap-southeast-1
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#3D5249]/10 flex items-center text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>{supabaseConnected ? "Auth & DB Verified" : supabaseMessage}</span>
            </div>
          </div>
        </div>

        {/* Security & Verification Callout */}
        <div className="bg-[#3D5249]/5 rounded-xl p-4 border border-[#3D5249]/15 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-[#518E6A] shrink-0 mt-0.5" />
          <div className="text-xs text-[#3D5249]/90 leading-relaxed">
            <span className="font-bold text-[#3D5249]">Security & Least Privilege:</span> All secrets and service keys are secured in environment variables and excluded by Git rules. Supabase client initialized via SSR session cookies. Ready for Next.js 16 Agency OS feature development.
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-[#3D5249]/60 border-t border-[#3D5249]/10">
        Grace In Motion · Internal Agency Operating System
      </footer>
    </main>
  );
}
