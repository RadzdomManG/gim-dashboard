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

    const { data: comments, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: comments || [] });
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
    } = body;

    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: 'content or attachments required.' }, { status: 400 });
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
        attachments,
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
