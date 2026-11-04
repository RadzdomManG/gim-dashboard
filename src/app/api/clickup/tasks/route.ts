import { NextRequest, NextResponse } from 'next/server';
import { fetchClickUpTasks } from '@/lib/clickup/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/clickup/tasks
 * Read-only mirror for ClickUp tasks across Little Treasures & GIM Internal.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientFilter = searchParams.get('client'); // 'all' | 'little-treasures' | 'gim-internal'
    const statusFilter = searchParams.get('status');
    const assigneeFilter = searchParams.get('assignee');
    const search = searchParams.get('search')?.toLowerCase();

    const data = await fetchClickUpTasks();
    let tasks = data.tasks;

    if (clientFilter && clientFilter !== 'all') {
      const clientKeyMap: Record<string, string> = {
        'little-treasures': 'little treasures',
        'we-rock-the-spectrum': 'spectrum',
        'wrts': 'spectrum',
        'studio-nets': 'studio nets',
        'invogue-cleans': 'invogue',
        'aaron-ofosu': 'aaron ofosu',
        'tch2thrive': 'tch2thrive',
        'gim-internal': 'grace in motion',
      };
      const queryKey = clientKeyMap[clientFilter] || clientFilter.toLowerCase();
      tasks = tasks.filter((t) =>
        t.client.toLowerCase().includes(queryKey) ||
        t.listName.toLowerCase().includes(queryKey)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      tasks = tasks.filter((t) => t.status === statusFilter.toLowerCase());
    }

    if (assigneeFilter && assigneeFilter !== 'all') {
      tasks = tasks.filter((t) =>
        t.assignees.some((a) =>
          a.username.toLowerCase().includes(assigneeFilter.toLowerCase())
        )
      );
    }

    if (search) {
      tasks = tasks.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.id.toLowerCase().includes(search) ||
          (t.gateCode && t.gateCode.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        total: tasks.length,
        stats: data.stats,
        lastSynced: data.lastSynced,
      },
    });
  } catch (error: any) {
    console.error('Failed to query ClickUp tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch ClickUp tasks',
      },
      { status: 500 }
    );
  }
}

/**
 * Reject any write/mutation methods with 405 Method Not Allowed.
 * Enforces ClickUp 100% READ-ONLY rule.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'ClickUp is strictly READ-ONLY. Mutations are prohibited.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'ClickUp is strictly READ-ONLY. Mutations are prohibited.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'ClickUp is strictly READ-ONLY. Mutations are prohibited.' },
    { status: 405 }
  );
}
