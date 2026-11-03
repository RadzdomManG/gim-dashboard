import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://api.clickup.com/api/v2';

/**
 * GET /api/clickup/tasks/[taskId]/comments
 * Read-only feed for task comments.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;
    const token = process.env.CLICKUP_API_TOKEN || 'pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD';

    const res = await fetch(`${BASE_URL}/task/${taskId}/comment`, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `ClickUp returned status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawComments = data.comments || [];

    const comments = rawComments.map((c: any) => ({
      id: c.id,
      text: c.comment_text || '',
      date: c.date ? new Date(parseInt(c.date, 10)).toLocaleString('en-AU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }) : '',
      user: {
        id: c.user?.id,
        username: c.user?.username || 'Unknown',
        email: c.user?.email || '',
        initials: c.user?.initials || (c.user?.username || 'U').slice(0, 2).toUpperCase(),
        color: c.user?.color || '#3D5249',
      },
    }));

    return NextResponse.json({
      success: true,
      comments,
      total: comments.length,
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
