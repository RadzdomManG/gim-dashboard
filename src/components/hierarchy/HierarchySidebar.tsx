"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  FolderOpen,
  List as ListIcon,
  Plus,
  Lock,
  Workflow,
  Building2,
  Megaphone,
  FolderKanban,
  DollarSign,
  Users,
  HelpCircle,
  CheckCircle2,
  Inbox,
  Sparkles,
} from "lucide-react";
import { Space, Folder, List } from "@/lib/hierarchy/types";

interface HierarchySidebarProps {
  spaces: Space[];
  selectedSpaceId?: string | null;
  selectedFolderId?: string | null;
  selectedListId?: string | null;
  isMyTasksActive: boolean;
  onSelectSpace: (space: Space) => void;
  onSelectFolder: (folder: Folder, space: Space) => void;
  onSelectList: (list: List, space: Space, folder?: Folder) => void;
  onSelectMyTasks: () => void;
  onOpenCreateSpace?: () => void;
  onOpenCreateFolder?: (spaceId: string) => void;
  onOpenCreateList?: (spaceId: string, folderId?: string) => void;
}

export function HierarchySidebar({
  spaces,
  selectedSpaceId,
  selectedFolderId,
  selectedListId,
  isMyTasksActive,
  onSelectSpace,
  onSelectFolder,
  onSelectList,
  onSelectMyTasks,
  onOpenCreateSpace,
  onOpenCreateFolder,
  onOpenCreateList,
}: HierarchySidebarProps) {
  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>({
    "space-ops": true,
    "space-client-mgmt": true,
  });

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "folder-gim-system": true,
    "folder-active-clients": true,
  });

  const toggleSpace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSpaces((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getSpaceIcon = (iconName?: string) => {
    switch (iconName) {
      case "Building2":
        return <Building2 className="w-4 h-4" />;
      case "Megaphone":
        return <Megaphone className="w-4 h-4" />;
      case "FolderKanban":
        return <FolderKanban className="w-4 h-4" />;
      case "DollarSign":
        return <DollarSign className="w-4 h-4" />;
      case "Users":
        return <Users className="w-4 h-4" />;
      case "HelpCircle":
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <Workflow className="w-4 h-4" />;
    }
  };

  return (
    <aside className="w-72 bg-[#3D5249] text-white flex flex-col h-full border-r border-[#2D3D36] select-none shrink-0 font-sans">
      {/* Workspace Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#518E6A] flex items-center justify-center font-bold text-xs shadow-xs text-white">
            G
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-tight leading-tight">Grace In Motion</h2>
            <span className="text-[10px] text-emerald-300 font-mono block">Agency Workspace</span>
          </div>
        </div>
        {onOpenCreateSpace && (
          <button
            onClick={onOpenCreateSpace}
            title="Create New Space"
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Views */}
      <div className="p-2 border-b border-white/10 space-y-1">
        <button
          onClick={onSelectMyTasks}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isMyTasksActive
              ? "bg-[#518E6A] text-white shadow-xs"
              : "text-white/80 hover:bg-white/5 hover:text-white"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Inbox className="w-4 h-4 text-emerald-300" />
            <span>My Tasks</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
            Assigned
          </span>
        </button>
      </div>

      {/* Spaces Tree Navigation */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
        <div className="px-2 pt-1 pb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/50">
          <span>Spaces</span>
          <span>{spaces.length}</span>
        </div>

        {spaces.map((space) => {
          const isSpaceExpanded = !!expandedSpaces[space.id];
          const isSpaceSelected = selectedSpaceId === space.id && !selectedFolderId && !selectedListId;

          return (
            <div key={space.id} className="space-y-0.5">
              {/* Space Header */}
              <div
                onClick={() => onSelectSpace(space)}
                className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  isSpaceSelected
                    ? "bg-white/15 text-white font-bold"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => toggleSpace(space.id, e)}
                    className="p-0.5 text-white/60 hover:text-white transition-colors"
                  >
                    {isSpaceExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div
                    className="w-4 h-4 flex items-center justify-center shrink-0"
                    style={{ color: space.color || "#518E6A" }}
                  >
                    {getSpaceIcon(space.icon)}
                  </div>

                  <span className="truncate">{space.name}</span>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {space.is_private && (
                    <span title="Private Space">
                      <Lock className="w-3 h-3 text-amber-300" />
                    </span>
                  )}
                  {onOpenCreateList && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCreateList(space.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-white/60 hover:text-white rounded hover:bg-white/10"
                      title="Add List to Space"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Nested Folders & Lists */}
              {isSpaceExpanded && (
                <div className="pl-4 space-y-0.5 border-l border-white/10 ml-3.5 mt-0.5">
                  {/* Folders */}
                  {(space.folders || []).map((folder) => {
                    const isFolderExpanded = !!expandedFolders[folder.id];
                    const isFolderSelected = selectedFolderId === folder.id && !selectedListId;
                    const isFolderPaused = folder.name.toUpperCase().includes("PAUSE") || folder.name.toUpperCase().includes("ARCHIVE");

                    return (
                      <div key={folder.id} className="space-y-0.5">
                        <div
                          onClick={() => onSelectFolder(folder, space)}
                          className={`group flex items-center justify-between px-2 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                            isFolderSelected
                              ? isFolderPaused
                                ? "bg-amber-500/25 text-amber-100 font-semibold border border-amber-400/50"
                                : "bg-white/15 text-white font-semibold"
                              : isFolderPaused
                                ? "text-amber-200/80 hover:bg-amber-500/10 hover:text-amber-100"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <button
                              type="button"
                              onClick={(e) => toggleFolder(folder.id, e)}
                              className="p-0.5 text-white/50 hover:text-white"
                            >
                              {isFolderExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </button>
                            {isFolderExpanded ? (
                              <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${isFolderPaused ? "text-amber-400" : "text-amber-300"}`} />
                            ) : (
                              <FolderIcon className={`w-3.5 h-3.5 shrink-0 ${isFolderPaused ? "text-amber-400" : "text-amber-300"}`} />
                            )}
                            <span className="truncate text-[11px]">{folder.name}</span>
                          </div>

                          {onOpenCreateList && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenCreateList(space.id, folder.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-white/60 hover:text-white rounded hover:bg-white/10"
                              title="Add List to Folder"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Lists Inside Folder */}
                        {isFolderExpanded && (
                          <div className="pl-4 space-y-0.5 border-l border-white/10 ml-2.5">
                            {(folder.lists || []).map((list) => {
                              const isListSelected = selectedListId === list.id;
                              const isListPaused = isFolderPaused || list.name.toLowerCase().includes("little treasures") || list.name.toLowerCase().includes("pause") || list.name.toLowerCase().includes("archive");
                              const dotColor = isListPaused ? "#F59E0B" : (list.color || "#00b884");

                              return (
                                <div
                                  key={list.id}
                                  onClick={() => onSelectList(list, space, folder)}
                                  className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] cursor-pointer transition-all ${
                                    isListSelected
                                      ? isListPaused
                                        ? "bg-amber-500/30 text-amber-100 font-bold border border-amber-400/60 shadow-xs"
                                        : "bg-[#518E6A] text-white font-bold shadow-xs"
                                      : isListPaused
                                        ? "text-amber-200/75 hover:bg-amber-500/10 hover:text-amber-100"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                  }`}
                                >
                                  <div className="flex items-center space-x-1.5 min-w-0">
                                    <span
                                      className="w-1.5 h-1.5 rounded-full shrink-0"
                                      style={{ backgroundColor: dotColor }}
                                    />
                                    <span className="truncate">{list.name}</span>
                                  </div>
                                  {list.tasks_count !== undefined && (
                                    <span className={`text-[9px] font-mono ml-1 ${isListPaused ? "text-amber-300/80" : "text-white/60"}`}>
                                      {list.tasks_count}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Standalone Lists directly in Space */}
                  {(space.lists || []).map((list) => {
                    const isListSelected = selectedListId === list.id;
                    const isListPaused = list.name.toLowerCase().includes("little treasures") || list.name.toLowerCase().includes("pause") || list.name.toLowerCase().includes("archive");
                    const dotColor = isListPaused ? "#F59E0B" : (list.color || "#518E6A");

                    return (
                      <div
                        key={list.id}
                        onClick={() => onSelectList(list, space)}
                        className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] cursor-pointer transition-all ${
                          isListSelected
                            ? isListPaused
                              ? "bg-amber-500/30 text-amber-100 font-bold border border-amber-400/60 shadow-xs"
                              : "bg-[#518E6A] text-white font-bold shadow-xs"
                            : isListPaused
                              ? "text-amber-200/75 hover:bg-amber-500/10 hover:text-amber-100"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: dotColor }}
                          />
                          <span className="truncate">{list.name}</span>
                        </div>
                        {list.tasks_count !== undefined && (
                          <span className={`text-[9px] font-mono ml-1 ${isListPaused ? "text-amber-300/80" : "text-white/60"}`}>
                            {list.tasks_count}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Branding */}
      <div className="p-3 border-t border-white/10 text-[10px] text-white/60 flex items-center justify-between">
        <span className="flex items-center gap-1 font-mono">
          <Sparkles className="w-3 h-3 text-emerald-400" /> ClickUp 7-Tier REA
        </span>
        <span className="font-semibold text-white/80">v2.4 Active</span>
      </div>
    </aside>
  );
}
