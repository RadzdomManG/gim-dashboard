"use client";

import React, { useState } from "react";
import {
  User,
  ShieldCheck,
  Check,
  X,
  Mail,
  Edit2,
  Sparkles,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface UserProfileData {
  id: string;
  name: string;
  nickname: string;
  email: string;
  role: string;
  isCoreAdmin: boolean;
  avatarColor: string;
  title: string;
  clientScope: string;
}

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfileData;
  onSave: (updated: Partial<UserProfileData>) => void;
}

const AVATAR_COLORS = [
  { name: "GIM Dark Green", class: "bg-[#3D5249]" },
  { name: "GIM Logo Green", class: "bg-[#466B53]" },
  { name: "GIM Accent Green", class: "bg-[#518E6A]" },
  { name: "Dark Charcoal", class: "bg-[#242E29]" },
  { name: "Slate", class: "bg-slate-700" },
  { name: "Amber Gold", class: "bg-amber-700" },
];

export function UserProfileDrawer({
  isOpen,
  onClose,
  user,
  onSave,
}: UserProfileDrawerProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [title, setTitle] = useState(user.title);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nickname: nickname.trim() || user.nickname,
      title: title.trim() || user.title,
      avatarColor,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E8E2DD] max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8E2DD] bg-[#FBF6F3] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-[#518E6A]" />
            <h3 className="font-bold text-sm text-[#242E29]">
              Edit Profile & Nickname
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#65746C] hover:text-[#242E29]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Avatar Preview */}
          <div className="flex items-center space-x-3.5 p-3 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50">
            <div
              className={`w-12 h-12 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0`}
            >
              {(nickname || user.nickname).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-sm text-[#242E29]">{user.name}</p>
              <p className="text-[11px] text-[#65746C]">Displaying as: <strong>{nickname || user.nickname}</strong></p>
              <div className="flex items-center space-x-1.5 mt-1">
                <Badge variant="brand">{user.role}</Badge>
                {user.isCoreAdmin && <Badge variant="dark">Core Admin</Badge>}
              </div>
            </div>
          </div>

          {/* Nickname Input */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#242E29]">
              Nickname / Preferred Display Name *
            </label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Radz"
              className="w-full px-3 py-2 bg-white border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
            />
            <p className="text-[10px] text-[#65746C]">
              Your nickname is displayed across activity feeds, task assignees, and team capacity cards.
            </p>
          </div>

          {/* Professional Role Title */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#242E29]">
              Professional Title / Operational Focus
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operations & Technical Lead"
              className="w-full px-3 py-2 bg-white border border-[#E8E2DD] rounded-lg text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
            />
          </div>

          {/* Email (Read-only System Identity) */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#65746C]">
              System Email (Read-Only)
            </label>
            <div className="px-3 py-2 bg-[#FBF6F3] border border-[#E8E2DD] rounded-lg text-xs text-[#65746C] font-mono">
              {user.email}
            </div>
          </div>

          {/* Avatar Color Picker */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#242E29]">
              Avatar Color Theme
            </label>
            <div className="flex items-center space-x-2">
              {AVATAR_COLORS.map((col) => (
                <button
                  key={col.class}
                  type="button"
                  onClick={() => setAvatarColor(col.class)}
                  title={col.name}
                  className={`w-6 h-6 rounded-full ${col.class} transition-transform ${
                    avatarColor === col.class
                      ? "ring-2 ring-offset-2 ring-[#518E6A] scale-110"
                      : "opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-[#EDFDF5] border border-[#C6F6D5] text-xs text-[#276749] flex items-center space-x-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#38A169]" />
              <span>Nickname saved successfully!</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E8E2DD]">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="flex items-center space-x-1">
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
