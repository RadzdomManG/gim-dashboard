import { ClickUpTask, ClickUpStats, ClickUpAssignee } from './types';

const BASE_URL = 'https://api.clickup.com/api/v2';

interface RawClickUpTask {
  id: string;
  name: string;
  status: {
    status: string;
    color: string;
    type: 'open' | 'custom' | 'done' | 'closed';
  };
  priority?: {
    priority: string;
    color: string;
  } | null;
  assignees?: {
    id: number;
    username: string;
    email: string;
    color: string;
    initials: string;
    profilePicture?: string | null;
  }[];
  due_date?: string | number | null;
  start_date?: string | number | null;
  date_created?: string | number | null;
  date_updated?: string | number | null;
  description?: string;
  url?: string;
  attachments?: {
    id: string;
    title: string;
    url: string;
    size?: number;
    mimetype?: string;
  }[];
  list?: {
    id: string;
    name: string;
  };
}

function extractGateCode(name: string): string | null {
  const match = name.match(/^(G\d+)\s*\|/i);
  return match ? match[1].toUpperCase() : null;
}

function detectClient(raw: RawClickUpTask): string {
  const listName = (raw.list?.name || '').toLowerCase();
  const text = `${raw.name} ${raw.description || ''}`.toLowerCase();

  if (listName.includes('little treasures') || text.includes('little treasures') || text.includes('zoe') || text.includes('paediatric') || text.includes('occupational')) {
    return 'Little Treasures Company';
  }
  if (text.includes('wrts') || text.includes('spectrum') || text.includes('sensory')) {
    return 'We Rock the Spectrum (WRTS)';
  }
  if (text.includes('studio nets') || text.includes('studionets') || text.includes('nets')) {
    return 'Studio Nets';
  }
  if (text.includes('invogue') || text.includes('clean')) {
    return 'InVogue Cleans';
  }
  if (text.includes('aaron ofosu') || text.includes('bootcamp')) {
    return 'Aaron Ofosu Bootcamp';
  }
  if (text.includes('tch2thrive') || text.includes('teach to thrive') || text.includes('thrive')) {
    return 'Tch2Thrive';
  }
  if (listName.includes('grace in motion') || text.includes('gim') || text.includes('internal')) {
    return 'Grace In Motion (Internal)';
  }

  return raw.list?.name || 'Grace In Motion (Internal)';
}

function formatEpochDate(epochMs?: string | number | null): string | null {
  if (!epochMs) return null;
  try {
    const num = typeof epochMs === 'string' ? parseInt(epochMs, 10) : epochMs;
    if (isNaN(num)) return null;
    const date = new Date(num);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

function normalizeTask(raw: RawClickUpTask, clientName?: string, listId?: string, listName?: string): ClickUpTask {
  const assignees: ClickUpAssignee[] = (raw.assignees || []).map((a) => ({
    id: a.id,
    username: a.username,
    email: a.email,
    color: a.color || '#466B53',
    initials: a.initials || a.username.slice(0, 2).toUpperCase(),
    avatar: a.profilePicture || null,
  }));

  const isRadzTask = assignees.some(
    (a) =>
      a.username.toLowerCase().includes('radz') ||
      a.email.toLowerCase().includes('radzdom')
  );

  const dueDateNum = raw.due_date ? parseInt(String(raw.due_date), 10) : null;
  const startDateNum = raw.start_date ? parseInt(String(raw.start_date), 10) : null;
  const createdNum = raw.date_created ? parseInt(String(raw.date_created), 10) : null;
  const updatedNum = raw.date_updated ? parseInt(String(raw.date_updated), 10) : null;

  const resolvedClient = clientName || detectClient(raw);
  const resolvedListId = listId || raw.list?.id || 'list-team';
  const resolvedListName = raw.list?.name || listName || resolvedClient;

  return {
    id: raw.id,
    name: raw.name,
    status: raw.status?.status?.toLowerCase() || 'to do',
    statusColor: raw.status?.color || '#87909e',
    statusType: raw.status?.type || 'open',
    priority: raw.priority?.priority || null,
    priorityColor: raw.priority?.color || null,
    listId: resolvedListId,
    listName: resolvedListName,
    client: resolvedClient,
    assignees,
    dueDate: dueDateNum,
    dueDateFormatted: formatEpochDate(dueDateNum),
    startDate: startDateNum,
    dateCreated: createdNum,
    dateUpdated: updatedNum,
    description: raw.description || '',
    url: raw.url || `https://app.clickup.com/t/${raw.id}`,
    gateCode: extractGateCode(raw.name),
    isRadzTask,
    attachments: (raw.attachments || []).map((att) => ({
      id: att.id,
      name: att.title || 'Attachment',
      url: att.url,
      size: att.size ? `${(att.size / 1024).toFixed(0)} KB` : undefined,
      type: att.mimetype?.includes('image') ? 'image' : att.mimetype?.includes('video') ? 'video' : 'document',
    })),
  };
}

let cachedClickupData: {
  tasks: ClickUpTask[];
  stats: ClickUpStats;
  lastSynced: string;
} | null = null;
let lastCacheTime = 0;

/**
 * Server-side read-only fetcher for ClickUp tasks across the entire team workspace.
 * STRICTLY READ-ONLY (GET requests only).
 */
export async function fetchClickUpTasks(): Promise<{
  tasks: ClickUpTask[];
  stats: ClickUpStats;
  lastSynced: string;
}> {
  // Return in-memory cached copy if fresh within 45 seconds
  if (cachedClickupData && Date.now() - lastCacheTime < 45000) {
    return cachedClickupData;
  }

  const token = process.env.CLICKUP_API_TOKEN || 'pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD';
  const teamId = process.env.CLICKUP_TEAM_ID || '9016642965';
  const listLittleTreasures = process.env.CLICKUP_LIST_LITTLE_TREASURES || '1301240000003883';
  const listGim = process.env.CLICKUP_LIST_GIM_INTERNAL || '901607479883';

  const headers = {
    Authorization: token,
    'Content-Type': 'application/json',
  };

  const allRawTasks: RawClickUpTask[] = [];

  // 1. Fetch team-wide tasks across all lists and subtasks with pagination
  try {
    const res0 = await fetch(
      `${BASE_URL}/team/${teamId}/task?include_closed=true&subtasks=true&page=0`,
      { headers }
    );

    if (res0.ok) {
      const data0 = await res0.json();
      const page0Tasks: RawClickUpTask[] = data0.tasks || [];
      allRawTasks.push(...page0Tasks);

      // If page 0 returned a full page (100 items), fetch subsequent pages in parallel
      if (page0Tasks.length >= 100) {
        const nextPages = [1, 2, 3, 4, 5];
        const pagePromises = nextPages.map(async (page) => {
          try {
            const pRes = await fetch(
              `${BASE_URL}/team/${teamId}/task?include_closed=true&subtasks=true&page=${page}`,
              { headers }
            );
            if (pRes.ok) {
              const pData = await pRes.json();
              return (pData.tasks || []) as RawClickUpTask[];
            }
            return [];
          } catch {
            return [];
          }
        });

        const subsequentResults = await Promise.all(pagePromises);
        subsequentResults.forEach((tasks) => {
          allRawTasks.push(...tasks);
        });
      }
    }
  } catch (err) {
    console.error('Error fetching team tasks from ClickUp:', err);
  }

  // 2. Deduplicate raw tasks by ID
  const seenIds = new Set<string>();
  const uniqueRawTasks: RawClickUpTask[] = [];
  for (const raw of allRawTasks) {
    if (!seenIds.has(raw.id)) {
      seenIds.add(raw.id);
      uniqueRawTasks.push(raw);
    }
  }

  let allTasks: ClickUpTask[] = uniqueRawTasks.map((raw) => normalizeTask(raw));

  // 3. Fallback: if team fetch was empty, query explicit list endpoints
  if (allTasks.length === 0) {
    try {
      const [resLT, resGIM] = await Promise.all([
        fetch(`${BASE_URL}/list/${listLittleTreasures}/task?include_closed=true&subtasks=true`, { headers }),
        fetch(`${BASE_URL}/list/${listGim}/task?include_closed=true&subtasks=true`, { headers }),
      ]);

      if (resLT.ok) {
        const dLT = await resLT.json();
        (dLT.tasks || []).forEach((raw: RawClickUpTask) => {
          allTasks.push(normalizeTask(raw, 'Little Treasures Company', listLittleTreasures, 'Little Treasures'));
        });
      }
      if (resGIM.ok) {
        const dGIM = await resGIM.json();
        (dGIM.tasks || []).forEach((raw: RawClickUpTask) => {
          allTasks.push(normalizeTask(raw, 'Grace In Motion (Internal)', listGim, 'Grace In Motion'));
        });
      }
    } catch (fallbackErr) {
      console.error('ClickUp list fallback error:', fallbackErr);
    }
  }

  // Sort: Tasks needing review first, then in progress, then to do, then closed
  const statusRank: Record<string, number> = {
    'for review': 1,
    'in review': 1,
    'in progress': 2,
    'blocked': 3,
    'to do': 4,
    'open': 5,
    'closed': 6,
  };

  allTasks.sort((a, b) => {
    const rankA = statusRank[a.status] || 99;
    const rankB = statusRank[b.status] || 99;
    if (rankA !== rankB) return rankA - rankB;
    return (b.dateUpdated || 0) - (a.dateUpdated || 0);
  });

  const stats: ClickUpStats = {
    totalTasks: allTasks.length,
    openCount: allTasks.filter((t) => t.status === 'to do' || t.status === 'open').length,
    inProgressCount: allTasks.filter((t) => t.status === 'in progress').length,
    reviewCount: allTasks.filter((t) => t.status === 'for review' || t.status === 'in review').length,
    closedCount: allTasks.filter((t) => t.status === 'closed' || t.statusType === 'closed').length,
    blockedCount: allTasks.filter((t) => t.status === 'blocked').length,
  };

  const result = {
    tasks: allTasks,
    stats,
    lastSynced: new Date().toISOString(),
  };

  cachedClickupData = result;
  lastCacheTime = Date.now();

  return result;
}
