import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const channelId = req.nextUrl.searchParams.get("channelId");
    if (!channelId) {
      return NextResponse.json({ error: "channelId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) {
      console.error("Failed to fetch messages:", error.message);
      return NextResponse.json({ messages: [] });
    }

    const mappedMessages = (messages || []).map((m: any) => ({
      id: m.id,
      channelId: m.channel_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      senderNickname: m.sender_nickname,
      senderAvatar: m.sender_avatar,
      senderRole: m.sender_role,
      isCoreAdmin: m.is_core_admin,
      content: m.content,
      timestamp: m.created_at
        ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "Just now",
      attachments: m.attachments || [],
      reactions: m.reactions || [],
    }));

    return NextResponse.json({ messages: mappedMessages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      channel_id,
      channelId,
      sender_id,
      senderId,
      sender_name,
      senderName,
      sender_nickname,
      senderNickname,
      sender_avatar,
      senderAvatar,
      sender_role,
      senderRole,
      is_core_admin,
      isCoreAdmin,
      content,
      timestamp,
      reply_to,
      replyTo,
      attachments,
      reactions,
    } = body;

    const targetChannelId = channel_id || channelId;
    const targetSenderId = sender_id || senderId;
    const targetSenderName = sender_name || senderName;
    const targetSenderNickname = sender_nickname || senderNickname;

    if (!targetChannelId || !targetSenderId || !content) {
      return NextResponse.json(
        { error: "channel_id, sender_id, and content are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Ensure target channel exists in public.channels
    try {
      await supabase.from("channels").upsert({
        id: targetChannelId,
        name: targetChannelId,
        type: "channel",
        description: `Operational channel for ${targetChannelId}`,
        is_private: false,
      }, { onConflict: "id" });
    } catch {}

    const payload: Record<string, any> = {
      id: id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      channel_id: targetChannelId,
      sender_id: targetSenderId,
      sender_name: targetSenderName || "Team Member",
      sender_nickname: targetSenderNickname || "Member",
      sender_avatar: sender_avatar || senderAvatar || "bg-[#3D5249]",
      sender_role: sender_role || senderRole || "Specialist",
      is_core_admin: is_core_admin ?? isCoreAdmin ?? false,
      content: content.trim(),
      attachments: attachments || [],
      reactions: reactions || [],
    };

    const { data, error } = await supabase
      .from("messages")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Failed to insert message:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, reactions, content } = body;

    if (!id) {
      return NextResponse.json({ error: "Message id is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updates: Record<string, any> = {};
    if (reactions !== undefined) updates.reactions = reactions;
    if (content !== undefined) updates.content = content;

    const { data, error } = await supabase
      .from("messages")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Message id is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
