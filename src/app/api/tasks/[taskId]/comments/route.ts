import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const supabase = createAdminClient();

    // 1. Fetch Supabase comments
    const { data: supaComments, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase task comments error:', error.message);
    }

    // 2. Fetch ClickUp comments if taskId is a ClickUp task
    let clickupComments: any[] = [];
    if (!taskId.startsWith('tsk-')) {
      try {
        const token = process.env.CLICKUP_API_TOKEN || 'pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD';
        const res = await fetch(`https://api.clickup.com/api/v2/task/${taskId}/comment`, {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 30 },
        });

        if (res.ok) {
          const cuData = await res.json();
          const rawList = cuData.comments || [];
          clickupComments = rawList.map((c: any) => ({
            id: c.id,
            task_id: taskId,
            author_name: c.user?.username || 'ClickUp User',
            author_nickname: c.user?.username?.split(' ')[0] || 'User',
            author_avatar: c.user?.color || '#3D5249',
            content: c.comment_text || '',
            attachments: [],
            reactions: [],
            created_at: c.date ? new Date(parseInt(c.date, 10)).toISOString() : new Date().toISOString(),
            is_clickup: true,
          }));
        }
      } catch (cuErr) {
        console.error('ClickUp comments fetch error:', cuErr);
      }
    }

    // 3. Merge comments sorted chronologically
    const merged = [...clickupComments, ...(supaComments || [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return NextResponse.json({ comments: merged });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await req.json();
    const {
      author_name = 'Radzdom Gallego',
      author_nickname = 'Radz',
      author_avatar = '#3D5249',
      content,
      attachments = [],
      reply_to = null,
      reactions = [],
    } = body;

    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: 'content or attachments required.' }, { status: 400 });
    }

    // Prepare combined attachments including reply_to and reactions metadata
    const finalAttachments = [...attachments];
    if (reply_to) {
      finalAttachments.unshift({
        type: 'reply_to',
        name: `Replying to @${reply_to.author}`,
        url: '',
        meta: reply_to,
      });
    }

    const supabase = createAdminClient();

    const { data: comment, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        author_name,
        author_nickname,
        author_avatar,
        content: content || '',
        attachments: finalAttachments,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, comment });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
