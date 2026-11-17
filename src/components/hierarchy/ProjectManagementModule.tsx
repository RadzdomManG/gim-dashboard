"use client";

import React, { useState, useEffect } from "react";
import { HierarchySidebar } from "./HierarchySidebar";
import { HierarchyBreadcrumbs } from "./HierarchyBreadcrumbs";
import { HierarchyListView } from "./views/HierarchyListView";
import { HierarchyBoardView } from "./views/HierarchyBoardView";
import { HierarchyCalendarView } from "./views/HierarchyCalendarView";
import { HierarchyGanttView } from "./views/HierarchyGanttView";
import { HierarchyTimelineView } from "./views/HierarchyTimelineView";
import { HierarchyMyTasksView } from "./views/HierarchyMyTasksView";
import {
  Space,
  Folder,
  List,
  HierarchicalTask,
  PMViewMode,
} from "@/lib/hierarchy/types";
import { CANONICAL_GIM_SPACES } from "@/lib/hierarchy/defaults";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";

interface ProjectManagementModuleProps {
  currentUser: {
    id: string;
    name: string;
    nickname: string;
    role: string;
    isCoreAdmin: boolean;
  };
}

export function ProjectManagementModule({ currentUser }: ProjectManagementModuleProps) {
  const [spaces, setSpaces] = useState<Space[]>(CANONICAL_GIM_SPACES);
  const [selectedSpace, setSelectedSpace] = useState<Space>(CANONICAL_GIM_SPACES[0]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(
    CANONICAL_GIM_SPACES[0].folders?.[0] || null
  );
  const [selectedList, setSelectedList] = useState<List | null>(
    CANONICAL_GIM_SPACES[0].folders?.[0]?.lists?.[0] || null
  );
  const [isMyTasksActive, setIsMyTasksActive] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<PMViewMode>("list");

  // Tasks state
  const [tasks, setTasks] = useState<HierarchicalTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);

  // Selected Task for Detail Modal
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);
  const [createTaskDefaultStatus, setCreateTaskDefaultStatus] = useState<string>("To Do");

  // Fetch Hierarchy Structure from API
  useEffect(() => {
    async function loadHierarchy() {
      try {
        const res = await fetch("/api/hierarchy");
        if (res.ok) {
          const data = await res.json();
          if (data.spaces && data.spaces.length > 0) {
            setSpaces(data.spaces);
          }
        }
      } catch (err) {
        console.error("Failed to load hierarchy:", err);
      }
    }
    loadHierarchy();
  }, []);

  // Fetch Tasks based on selected scope
  useEffect(() => {
    async function loadTasks() {
      setLoadingTasks(true);
      try {
        let url = "/api/hierarchy/tasks";
        if (isMyTasksActive) {
          url += `?my_tasks=true&assignee_id=${encodeURIComponent(currentUser.name)}`;
        } else if (selectedList) {
          url += `?list_id=${encodeURIComponent(selectedList.id)}`;
        } else if (selectedSpace) {
          url += `?space_id=${encodeURIComponent(selectedSpace.id)}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.tasks) {
            setTasks(data.tasks);
          }
        }
      } catch (err) {
        console.error("Failed to load tasks:", err);
      } finally {
        setLoadingTasks(false);
      }
    }
    loadTasks();
  }, [selectedSpace, selectedFolder, selectedList, isMyTasksActive, currentUser.name]);

  // Handlers for Navigation
  const handleSelectSpace = (space: Space) => {
    setSelectedSpace(space);
    setSelectedFolder(null);
    setSelectedList(space.lists?.[0] || null);
    setIsMyTasksActive(false);
  };

  const handleSelectFolder = (folder: Folder, space: Space) => {
    setSelectedSpace(space);
    setSelectedFolder(folder);
    setSelectedList(folder.lists?.[0] || null);
    setIsMyTasksActive(false);
  };

  const handleSelectList = (list: List, space: Space, folder?: Folder) => {
    setSelectedSpace(space);
    setSelectedFolder(folder || null);
    setSelectedList(list);
    setIsMyTasksActive(false);
  };

  const handleSelectMyTasks = () => {
    setIsMyTasksActive(true);
    setViewMode("my-tasks");
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch("/api/hierarchy/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* 1. ClickUp Collapsible Hierarchy Sidebar */}
      <HierarchySidebar
        spaces={spaces}
        selectedSpaceId={selectedSpace?.id}
        selectedFolderId={selectedFolder?.id}
        selectedListId={selectedList?.id}
        isMyTasksActive={isMyTasksActive}
        onSelectSpace={handleSelectSpace}
        onSelectFolder={handleSelectFolder}
        onSelectList={handleSelectList}
        onSelectMyTasks={handleSelectMyTasks}
        onOpenCreateList={(spaceId, folderId) => {
          setIsCreateTaskOpen(true);
        }}
      />

      {/* 2. Main Work Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FBF6F3]/30">
        {/* Breadcrumbs + View Switcher */}
        <HierarchyBreadcrumbs
          space={selectedSpace}
          folder={selectedFolder}
          list={selectedList}
          isMyTasksActive={isMyTasksActive}
          viewMode={viewMode}
          onSwitchViewMode={(mode) => {
            setViewMode(mode);
            if (mode === "my-tasks") setIsMyTasksActive(true);
            else setIsMyTasksActive(false);
          }}
          onOpenCreateTask={() => {
            setCreateTaskDefaultStatus("To Do");
            setIsCreateTaskOpen(true);
          }}
        />

        {/* View Mode Rendering */}
        {loadingTasks ? (
          <div className="flex-1 flex items-center justify-center text-xs text-[#65746C] animate-pulse">
            Loading tasks & deliverables...
          </div>
        ) : viewMode === "list" ? (
          <HierarchyListView
            tasks={tasks}
            statusConfigs={selectedSpace?.status_config}
            onSelectTask={(task) => setSelectedTask(task)}
            onUpdateStatus={handleUpdateStatus}
            onOpenCreateTask={(defStatus) => {
              setCreateTaskDefaultStatus(defStatus || "To Do");
              setIsCreateTaskOpen(true);
            }}
          />
        ) : viewMode === "board" ? (
          <HierarchyBoardView
            tasks={tasks}
            statusConfigs={selectedSpace?.status_config}
            onSelectTask={(task) => setSelectedTask(task)}
            onOpenCreateTask={(defStatus) => {
              setCreateTaskDefaultStatus(defStatus || "To Do");
              setIsCreateTaskOpen(true);
            }}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : viewMode === "calendar" ? (
          <HierarchyCalendarView
            tasks={tasks}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        ) : viewMode === "gantt" ? (
          <HierarchyGanttView
            tasks={tasks}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        ) : viewMode === "timeline" ? (
          <HierarchyTimelineView
            tasks={tasks}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        ) : (
          <HierarchyMyTasksView
            tasks={tasks}
            currentUserName={currentUser.name}
            currentUserNickname={currentUser.nickname}
            onSelectTask={(task) => setSelectedTask(task)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          currentUserName={currentUser.name}
          currentUserNickname={currentUser.nickname}
          isCoreAdmin={currentUser.isCoreAdmin}
          onTaskUpdated={(updated: any) => {
            setTasks((prev) =>
              prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
            );
          }}
        />
      )}

      {/* Create Task Modal */}
      {isCreateTaskOpen && (
        <CreateTaskModal
          isOpen={true}
          onClose={() => setIsCreateTaskOpen(false)}
          defaultClient={selectedList?.name || selectedSpace?.name || "Operations"}
          currentUserName={currentUser.name}
          currentUserRole={currentUser.role}
          onTaskCreated={() => {
            setIsCreateTaskOpen(false);
          }}
        />
      )}
    </div>
  );
}
