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
    const channel_id = body.channel_id || body.channelId;
    const sender_id = body.sender_id || body.senderId;
    const sender_name = body.sender_name || body.senderName;
    const sender_nickname = body.sender_nickname || body.senderNickname;
    const sender_avatar = body.sender_avatar || body.senderAvatar || '#3D5249';
    const sender_role = body.sender_role || body.senderRole || 'team_member';
    const is_core_admin = body.is_core_admin ?? body.isCoreAdmin ?? false;
    const content = body.content;
    const attachments = body.attachments || [];
    const reply_to = body.reply_to || body.replyTo || null;

    if (!channel_id || (!content && (!attachments || attachments.length === 0))) {
      return NextResponse.json({ error: 'channel_id and content or attachments required.' }, { status: 400 });
    }

    const messageId = body.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('messages')
      .insert({
        id: messageId,
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

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('messages').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
