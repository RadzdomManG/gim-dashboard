"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  CheckCircle2,
  Calendar,
  MessageSquare,
  FileText,
  Building2,
  Users,
  CornerDownLeft,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  Shield,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface SearchResultItem {
  id: string;
  type: "task" | "message" | "comment" | "client" | "sop" | "team" | "deliverable";
  title: string;
  subtitle?: string;
  snippet?: string;
  metadata?: Record<string, any>;
  url?: string;
  date?: string;
  status?: string;
  badge?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (taskId: string, clientName?: string) => void;
  onSelectMessage: (channelId: string) => void;
  onSelectClient: (clientName: string) => void;
  onSelectSop: (sopId: string) => void;
  onSelectTeam: (memberId: string) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectTask,
  onSelectMessage,
  onSelectClient,
  onSelectSop,
  onSelectTeam,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | "tasks" | "messages" | "comments" | "clients" | "sops" | "team"
  >("all");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    tasks: SearchResultItem[];
    messages: SearchResultItem[];
    comments: SearchResultItem[];
    clients: SearchResultItem[];
    sops: SearchResultItem[];
    team: SearchResultItem[];
  }>({
    tasks: [],
    messages: [],
    comments: [],
    clients: [],
    sops: [],
    team: [],
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults({
        tasks: [],
        messages: [],
        comments: [],
        clients: [],
        sops: [],
        team: [],
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.results) {
            setResults(data.results);
          }
          setIsLoading(false);
          setSelectedIndex(0);
        })
        .catch((err) => {
          console.error("Search API error:", err);
          setIsLoading(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Flattened displayed items according to active category
  const displayedItems: SearchResultItem[] = [];
  if (activeCategory === "all" || activeCategory === "tasks") {
    displayedItems.push(...results.tasks);
  }
  if (activeCategory === "all" || activeCategory === "messages") {
    displayedItems.push(...results.messages);
  }
  if (activeCategory === "all" || activeCategory === "comments") {
    displayedItems.push(...results.comments);
  }
  if (activeCategory === "all" || activeCategory === "clients") {
    displayedItems.push(...results.clients);
  }
  if (activeCategory === "all" || activeCategory === "sops") {
    displayedItems.push(...results.sops);
  }
  if (activeCategory === "all" || activeCategory === "team") {
    displayedItems.push(...results.team);
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < displayedItems.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && displayedItems[selectedIndex]) {
        e.preventDefault();
        handleSelectItem(displayedItems[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, displayedItems, selectedIndex]);

  const handleSelectItem = (item: SearchResultItem) => {
    onClose();
    if (item.type === "task") {
      onSelectTask(item.id, item.metadata?.client);
    } else if (item.type === "comment") {
      onSelectTask(item.metadata?.taskId);
    } else if (item.type === "message") {
      onSelectMessage(item.metadata?.channelId || "general");
    } else if (item.type === "client") {
      onSelectClient(item.metadata?.clientName || item.title);
    } else if (item.type === "sop") {
      onSelectSop(item.metadata?.sopId || item.id);
    } else if (item.type === "team") {
      onSelectTeam(item.metadata?.memberId || item.id);
    }
  };

  const totalResultsCount =
    results.tasks.length +
    results.messages.length +
    results.comments.length +
    results.clients.length +
    results.sops.length +
    results.team.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#242E29]/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#3D5249]/20 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E8E2DD] bg-[#FBF6F3] flex items-center gap-3 shrink-0">
          <Search className="w-5 h-5 text-[#518E6A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, comments, messages, clients, SOPs, team..."
            className="w-full bg-transparent text-sm sm:text-base text-[#242E29] placeholder:text-[#65746C]/60 focus:outline-none font-medium"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-[#518E6A] animate-spin shrink-0" />}
          {query && !isLoading && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-full text-[#65746C] hover:text-[#242E29] hover:bg-[#E8E2DD]/50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-[#65746C] bg-white px-1.5 py-0.5 rounded border border-[#E8E2DD] shadow-2xs shrink-0">
            ESC
          </kbd>
        </div>

        {/* Category Filters Bar */}
        {query.trim().length > 0 && (
          <div className="px-4 py-2 border-b border-[#E8E2DD] bg-white flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none text-xs">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                activeCategory === "all"
                  ? "bg-[#3D5249] text-white"
                  : "bg-[#FBF6F3] text-[#65746C] hover:text-[#242E29]"
              }`}
            >
              All ({totalResultsCount})
            </button>
            <button
              onClick={() => setActiveCategory("tasks")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1 ${
                activeCategory === "tasks"
                  ? "bg-[#3D5249] text-white"
                  : "bg-[#FBF6F3] text-[#65746C] hover:text-[#242E29]"
              }`}
            >
              <Layers className="w-3 h-3" />
              Tasks ({results.tasks.length})
            </button>
            <button
              onClick={() => setActiveCategory("messages")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1 ${
                activeCategory === "messages"
                  ? "bg-[#3D5249] text-white"
                  : "bg-[#FBF6F3] text-[#65746C] hover:text-[#242E29]"
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              Messages ({results.messages.length})
            </button>
            <button
              onClick={() => setActiveCategory("comments")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1 ${
                activeCategory === "comments"
                  ? "bg-[#3D5249] text-white"
                  : "bg-[#FBF6F3] text-[#65746C] hover:text-[#242E29]"
              }`}
            >
              <Clock className="w-3 h-3" />
              Comments ({results.comments.length})
            </button>
            <button
              onClick={() => setActiveCategory("clients")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1 ${
                activeCategory === "clients"
                  ? "bg-[#3D5249] text-white"
                  : "bg-[#FBF6F3] text-[#65746C] hover:text-[#242E29]"
              }`}
            >
              <Building2 className="w-3 h-3" />
              Clients ({results.clients.length})
            </button>
            <button
              onClick={() => setActiveCategory("sops")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1 ${
                activeCategory === "sops"
                  ? "bg-[#3D5249] text-white"
                  : "bg-[#FBF6F3] text-[#65746C] hover:text-[#242E29]"
              }`}
            >
              <FileText className="w-3 h-3" />
              SOPs ({results.sops.length})
            </button>
            <button
              onClick={() => setActiveCategory("team")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1 ${
                activeCategory === "team"
                  ? "bg-[#3D5249] text-white"
                  : "bg-[#FBF6F3] text-[#65746C] hover:text-[#242E29]"
              }`}
            >
              <Users className="w-3 h-3" />
              Team ({results.team.length})
            </button>
          </div>
        )}

        {/* Results List View */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#E8E2DD]/60">
          {!query.trim() ? (
            /* Suggested shortcuts when empty */
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#65746C]">
                <Sparkles className="w-3.5 h-3.5 text-[#518E6A]" />
                <span>Suggested Searches &amp; Shortcuts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setQuery("We Rock the Spectrum")}
                  className="p-2.5 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50 hover:bg-[#FBF6F3] text-left transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#518E6A]" />
                    <span className="font-semibold text-[#242E29]">We Rock the Spectrum (WRTS)</span>
                  </div>
                  <span className="text-[10px] text-[#65746C]">21 flows</span>
                </button>
                <button
                  onClick={() => setQuery("W1 Lead Engine")}
                  className="p-2.5 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50 hover:bg-[#FBF6F3] text-left transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#518E6A]" />
                    <span className="font-semibold text-[#242E29]">W1 | Lead Engine Setup</span>
                  </div>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">In Review</span>
                </button>
                <button
                  onClick={() => setQuery("SOP Specification")}
                  className="p-2.5 rounded-xl border border-[#E8E2DD] bg-[#FBF6F3]/50 hover:bg-[#FBF6F3] text-left transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#518E6A]" />
                    <span className="font-semibold text-[#242E29]">SOP &amp; Playbooks</span>
                  </div>
                  <span className="text-[10px] text-[#65746C]">Guidelines</span>
                </button>
              </div>
            </div>
          ) : displayedItems.length === 0 && !isLoading ? (
            /* No results empty state */
            <div className="p-8 text-center space-y-2">
              <Search className="w-8 h-8 text-[#65746C]/40 mx-auto" />
              <p className="text-sm font-semibold text-[#242E29]">No matching results found</p>
              <p className="text-xs text-[#65746C]">
                Try searching for a client name (e.g. &ldquo;We Rock the Spectrum&rdquo;), gate code (e.g. &ldquo;W1&rdquo;), team member, or comment.
              </p>
            </div>
          ) : (
            /* Item Results */
            displayedItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}-${idx}`}
                  role="button"
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected ? "bg-[#518E6A]/10 border-l-4 border-l-[#518E6A]" : "hover:bg-[#FBF6F3]"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {item.type === "task" && (
                        <div className="w-7 h-7 rounded-lg bg-[#3D5249]/10 text-[#3D5249] flex items-center justify-center">
                          <Layers className="w-4 h-4" />
                        </div>
                      )}
                      {item.type === "message" && (
                        <div className="w-7 h-7 rounded-lg bg-[#518E6A]/10 text-[#518E6A] flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                      )}
                      {item.type === "comment" && (
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}
                      {item.type === "client" && (
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                      )}
                      {item.type === "sop" && (
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      {item.type === "team" && (
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-[#242E29] truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FBF6F3] border border-[#E8E2DD] text-[#65746C]">
                            {item.badge}
                          </span>
                        )}
                        {item.status && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.status === "Closed"
                                ? "bg-purple-100 text-purple-800"
                                : item.status === "Approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "In Review"
                                ? "bg-amber-100 text-amber-800"
                                : item.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>

                      {item.subtitle && (
                        <p className="text-[11px] text-[#65746C] truncate mt-0.5">{item.subtitle}</p>
                      )}

                      {item.snippet && (
                        <p className="text-xs text-[#242E29]/80 line-clamp-2 mt-1 bg-white/60 p-1.5 rounded border border-[#E8E2DD]/50">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-[#65746C]">
                    <span className="hidden sm:inline text-[11px] font-medium">Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-[#FBF6F3] border-t border-[#E8E2DD] flex items-center justify-between text-[11px] text-[#65746C] shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#E8E2DD] rounded font-mono text-[9px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-[#E8E2DD] rounded font-mono text-[9px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#E8E2DD] rounded font-mono text-[9px]">↵</kbd>
              Select
            </span>
          </div>
          <span className="font-medium text-[#518E6A]">Grace in Motion OS</span>
        </div>
      </div>
    </div>
  );
}
