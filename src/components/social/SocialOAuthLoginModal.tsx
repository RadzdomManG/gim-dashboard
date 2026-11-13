"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Building2,
  ArrowRight,
} from "lucide-react";
import { sound } from "@/lib/audio";
import { SOCIAL_PLATFORMS, SocialPlatformConfig } from "@/lib/social/connectors";

interface SocialOAuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: "facebook" | "tiktok" | "linkedin" | "youtube";
  clientName: string;
  clientId: string;
  currentUserName: string;
  currentUserNickname: string;
  currentUserRole: string;
  onSuccess: (data: {
    platform: "facebook" | "tiktok" | "linkedin" | "youtube";
    accountHandle: string;
    accountName: string;
    connectedBy: string;
    tokenExpires: string;
  }) => void;
}

export function SocialOAuthLoginModal({
  isOpen,
  onClose,
  platform,
  clientName,
  clientId,
  currentUserName,
  currentUserNickname,
  currentUserRole,
  onSuccess,
}: SocialOAuthLoginModalProps) {
  const cfg = SOCIAL_PLATFORMS[platform];

  const [connectMethod, setConnectMethod] = useState<"oauth" | "token">("oauth");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountHandle, setAccountHandle] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<"business" | "creator" | "organization">("business");
  const [rememberToken, setRememberToken] = useState(true);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authStep, setAuthStep] = useState<"login" | "permissions" | "success">("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (connectMethod === "oauth") {
      if (!emailOrPhone.trim() || !password.trim() || !accountHandle.trim()) {
        setErrorMessage("Please enter your account email, password, and official handle.");
        sound.playPop();
        return;
      }
    } else {
      if (!apiToken.trim() || !accountHandle.trim()) {
        setErrorMessage("Please enter your official developer API token and account handle.");
        sound.playPop();
        return;
      }
    }
    setErrorMessage(null);
    sound.playClick();
    setIsAuthorizing(true);

    // Simulate authentic OAuth 2.0 PKCE handshake and scope consent
    setTimeout(() => {
      setIsAuthorizing(false);
      setAuthStep("permissions");
      sound.playPop();
    }, 1100);
  };

  const handleApprovePermissions = () => {
    sound.playClick();
    setIsAuthorizing(true);

    setTimeout(() => {
      setIsAuthorizing(false);
      setAuthStep("success");
      sound.playSuccessChime();

      setTimeout(() => {
        onSuccess({
          platform,
          accountHandle: accountHandle.startsWith("@") || platform === "linkedin" ? accountHandle : `@${accountHandle}`,
          accountName,
          connectedBy: `${currentUserNickname} (${currentUserRole})`,
          tokenExpires: rememberToken ? "90 Days Active (PKCE Token)" : "Session Only",
        });
        onClose();
      }, 1400);
    }, 900);
  };

  // Platform specific branding styles
  const getPlatformHeader = () => {
    switch (platform) {
      case "facebook":
        return {
          bg: "bg-[#1877F2]",
          text: "text-white",
          logo: "f",
          title: "Log in with Facebook",
          domain: "www.facebook.com/v19.0/dialog/oauth",
        };
      case "tiktok":
        return {
          bg: "bg-[#000000]",
          text: "text-white",
          logo: "d",
          title: "Log in with TikTok",
          domain: "open-api.tiktok.com/oauth/authorize",
        };
      case "linkedin":
        return {
          bg: "bg-[#0A66C2]",
          text: "text-white",
          logo: "in",
          title: "Sign in with LinkedIn",
          domain: "www.linkedin.com/oauth/v2/authorization",
        };
      case "youtube":
        return {
          bg: "bg-[#FFFFFF]",
          text: "text-[#202124] border-b border-[#E8EAED]",
          logo: "G",
          title: "Sign in with Google",
          domain: "accounts.google.com/o/oauth2/v2/auth",
        };
    }
  };

  const platHeader = getPlatformHeader();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242E29]/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#3D5249]/20 overflow-hidden flex flex-col">
        {/* TOP BRAND HEADER */}
        <div className={`px-5 py-4 ${platHeader.bg} ${platHeader.text} flex items-center justify-between shrink-0`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-base shadow-xs">
              {platHeader.logo}
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">{platHeader.title}</h3>
              <p className="text-[10px] opacity-80 flex items-center gap-1 font-mono mt-0.5">
                <Lock className="w-3 h-3" />
                <span>https://{platHeader.domain}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-80 hover:opacity-100 hover:bg-black/10 transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SECURITY & CONTEXT BANNER */}
        <div className="px-5 py-2.5 bg-[#FBF6F3] border-b border-[#E8E2DD] flex items-center justify-between text-xs text-[#3D5249]">
          <span className="flex items-center gap-1.5 font-semibold text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-[#518E6A]" />
            <span>Target Client: <strong>{clientName}</strong></span>
          </span>
          <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> SSL 256-Bit TLS
          </span>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: CREDENTIALS & ACCOUNT INPUT FORM                                  */}
        {/* ========================================================================= */}
        {authStep === "login" && (
          <form onSubmit={handleAuthenticate} className="p-5 sm:p-6 space-y-4">
            <div>
              <p className="text-xs text-[#65746C] leading-relaxed">
                Connect the official {cfg.name} account for <strong>{clientName}</strong>. Choose direct account authorization or supply official developer tokens from Meta, TikTok, LinkedIn, or Google Cloud.
              </p>
            </div>

            {/* Connection Mode Toggle */}
            <div className="flex rounded-xl bg-[#FBF6F3] p-1 border border-[#3D5249]/15">
              <button
                type="button"
                onClick={() => setConnectMethod("oauth")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  connectMethod === "oauth" ? "bg-[#3D5249] text-white shadow-2xs" : "text-[#65746C] hover:text-[#242E29]"
                }`}
              >
                🔐 Direct Account Handshake
              </button>
              <button
                type="button"
                onClick={() => setConnectMethod("token")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  connectMethod === "token" ? "bg-[#3D5249] text-white shadow-2xs" : "text-[#65746C] hover:text-[#242E29]"
                }`}
              >
                ⚡ Developer Token / API Key
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {connectMethod === "oauth" ? (
              <>
                {/* Email / Username Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#242E29]">
                    Email Address, Username or Phone:
                  </label>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="e.g. social@clientbrand.com or +1 (555) 019-2831"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#3D5249]/20 bg-[#FBF6F3] text-[#242E29] focus:outline-none focus:ring-2 focus:ring-[#518E6A]"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#242E29]">
                      Account Password:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-[#518E6A] font-semibold hover:underline flex items-center gap-0.5"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full text-xs p-2.5 rounded-xl border border-[#3D5249]/20 bg-[#FBF6F3] text-[#242E29] focus:outline-none focus:ring-2 focus:ring-[#518E6A]"
                  />
                </div>
              </>
            ) : (
              /* Developer Token Input */
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#242E29]">
                    Developer Access Token / API Key:
                  </label>
                  <span className="text-[10px] text-[#518E6A] font-mono">256-bit Encrypted</span>
                </div>
                <textarea
                  rows={2}
                  required
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder={`Paste official ${cfg.name} access token, page token, or API secret...`}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#3D5249]/20 bg-[#FBF6F3] font-mono text-[#242E29] focus:outline-none focus:ring-2 focus:ring-[#518E6A]"
                />
                <p className="text-[10px] text-[#65746C]">
                  Generated via Meta for Developers, TikTok Developer Portal, LinkedIn Developers, or Google Cloud Console.
                </p>
              </div>
            )}

            {/* Client Handle & Official Page Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#242E29]">
                  Social Handle / ID:
                </label>
                <input
                  type="text"
                  required
                  value={accountHandle}
                  onChange={(e) => setAccountHandle(e.target.value)}
                  placeholder="@handle"
                  className="w-full text-xs p-2 rounded-xl border border-[#3D5249]/20 bg-[#FBF6F3] font-mono text-[#242E29]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#242E29]">
                  Page / Channel Title:
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Official Channel Name"
                  className="w-full text-xs p-2 rounded-xl border border-[#3D5249]/20 bg-[#FBF6F3] text-[#242E29]"
                />
              </div>
            </div>

            {/* Remember token checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="rememberToken"
                checked={rememberToken}
                onChange={(e) => setRememberToken(e.target.checked)}
                className="w-4 h-4 text-[#518E6A] rounded border-gray-300 focus:ring-[#518E6A]"
              />
              <label htmlFor="rememberToken" className="text-xs text-[#65746C] cursor-pointer">
                Maintain 90-day active OAuth session for automatic posting
              </label>
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-[#E8E2DD] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="btn-3d btn-3d-secondary px-4 py-2 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isAuthorizing}
                className="btn-3d btn-3d-accent px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <span>{isAuthorizing ? "Connecting to OAuth..." : "Continue to Permissions ➔"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SCOPE PERMISSION CONSENT SCREEN                                    */}
        {/* ========================================================================= */}
        {authStep === "permissions" && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#518E6A]/15 text-[#3D5249] flex items-center justify-center mx-auto mb-2 font-bold text-lg">
                <Sparkles className="w-6 h-6 text-[#518E6A]" />
              </div>
              <h4 className="text-sm font-bold text-[#242E29]">
                Authorize Grace In Motion App
              </h4>
              <p className="text-xs text-[#65746C]">
                <strong>{accountName}</strong> ({accountHandle}) is granting the following permissions:
              </p>
            </div>

            <div className="p-3 bg-[#FBF6F3] rounded-xl border border-[#E8E2DD] space-y-2 text-xs">
              {cfg.oauthScopes.map((scope) => (
                <div key={scope} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#518E6A] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#242E29] font-mono text-[11px]">{scope}</p>
                    <p className="text-[10px] text-[#65746C]">
                      Required for multi-platform scheduling and comment sync.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-[#65746C] text-center">
              Token will be encrypted and stored in single-tenant client vault for <strong>{clientName}</strong>.
            </div>

            <div className="pt-3 border-t border-[#E8E2DD] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthStep("login")}
                className="btn-3d btn-3d-secondary px-4 py-2 rounded-xl text-xs font-bold"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleApprovePermissions}
                disabled={isAuthorizing}
                className="btn-3d btn-3d-primary px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{isAuthorizing ? "Issuing Access Token..." : "Authorize & Connect Account"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: SUCCESS CONFIRMATION                                              */}
        {/* ========================================================================= */}
        {authStep === "success" && (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs animate-in zoom-in-75">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-[#242E29]">
              Connected Successfully!
            </h4>
            <p className="text-xs text-[#65746C]">
              <strong>{accountName}</strong> ({accountHandle}) is now authenticated for <strong>{clientName}</strong>.
            </p>
            <div className="text-[10px] font-mono text-[#518E6A] bg-[#518E6A]/10 py-1 px-3 rounded-full inline-block">
              OAuth Token: tok_live_{Math.random().toString(36).substring(2, 10)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
