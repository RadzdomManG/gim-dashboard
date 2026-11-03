import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const channelId = req.nextUrl.searchParams.get('channelId');
    const supabase = createAdminClient();

    let query = supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (channelId) {
      query = query.eq('channel_id', channelId);
    }

    const { data: messages, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      channel_id,
      sender_id,
      sender_name,
      sender_nickname,
      sender_avatar = '#3D5249',
      sender_role = 'team_member',
      is_core_admin = false,
      content,
      attachments = [],
    } = body;

    if (!channel_id || (!content && (!attachments || attachments.length === 0))) {
      return NextResponse.json({ error: 'channel_id and content or attachments required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('messages')
      .insert({
        channel_id,
        sender_id: sender_id || 'radz-001',
        sender_name: sender_name || 'Radzdom Gallego',
        sender_nickname: sender_nickname || 'Radz',
        sender_avatar,
        sender_role,
        is_core_admin,
        content: content || '',
        attachments: attachments || [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
