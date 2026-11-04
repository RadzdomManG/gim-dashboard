import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch from profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, nickname, role, is_core_admin, client_id, assigned_clients, is_active, title, avatar_color')
      .order('created_at', { ascending: true });

    // 2. Fetch from invitations to capture newly invited/provisioned members
    const { data: invitations } = await supabase
      .from('invitations')
      .select('id, email, full_name, role, assigned_clients, created_at')
      .eq('is_revoked', false);

    // 3. Fetch from auth.users (cloud users)
    const { data: userList } = await supabase.auth.admin.listUsers();

    const membersMap = new Map<string, any>();

    // Base verified GIM leadership & specialists
    const baseMembers = [
      { id: 'usr-divine', email: 'divine.origines', full_name: 'Divine Origines', nickname: 'Divine', role: 'Owner', is_core_admin: false, assigned_clients: ['All Accounts'], is_active: true, title: 'Owner & Strategy Lead', avatar_color: '#3D5249' },
      { id: 'usr-radz', email: 'rdzgllgo', full_name: 'Radzdom Gallego', nickname: 'Radz', role: 'Admin', is_core_admin: true, assigned_clients: ['All Accounts'], is_active: true, title: 'Chief Automation Architect & Tech Lead', avatar_color: '#466B53' },
      { id: 'usr-ra', email: 'aneweraa.ai@gmail.com', full_name: 'Ma. Rose Anne (RA) Malinao', nickname: 'RA', role: 'Admin', is_core_admin: true, assigned_clients: ['All Accounts'], is_active: true, title: 'Commercial Operations & Billing Lead', avatar_color: '#518E6A' },
      { id: 'usr-erwin', email: 'erwin@gim.com', full_name: 'Erwin Manaog', nickname: 'Erwin', role: 'Specialist', is_core_admin: false, assigned_clients: ['Little Treasures Company', 'Studio Nets'], is_active: true, title: 'Project Owner & Delivery Specialist', avatar_color: '#65746C' },
      { id: 'usr-bj', email: 'bj@gim.com', full_name: 'BJ Ricafrente', nickname: 'BJ', role: 'Specialist', is_core_admin: false, assigned_clients: ['Little Treasures Company', 'Aaron Ofosu Bootcamp'], is_active: true, title: 'Operations Specialist', avatar_color: '#3D5249' },
      { id: 'usr-joy', email: 'joy@gim.com', full_name: 'Joy Fabular', nickname: 'Joy', role: 'Specialist', is_core_admin: false, assigned_clients: ['InVogue Cleans'], is_active: true, title: 'Operations Assistant', avatar_color: '#518E6A' },
      { id: 'usr-camille', email: 'camille@gim.com', full_name: 'Camille Bautista', nickname: 'Camille', role: 'Social Media Specialist', is_core_admin: false, assigned_clients: ['Little Treasures Company'], is_active: true, title: 'Social Media Manager', avatar_color: '#518E6A' },
      { id: 'usr-jedy', email: 'jedy@gim.com', full_name: 'Jedy Caillio', nickname: 'Jedy', role: 'Specialist', is_core_admin: false, assigned_clients: ['Studio Nets'], is_active: true, title: 'Creative Assistant', avatar_color: '#466B53' },
      { id: 'usr-zoe', email: 'zoe@littletreasures.com.au', full_name: 'Zoe Horner', nickname: 'Zoe', role: 'Client User', is_core_admin: false, assigned_clients: ['Little Treasures Company'], is_active: true, title: 'Founder, Little Treasures', avatar_color: '#518E6A' },
    ];

    baseMembers.forEach((m) => membersMap.set((m.email || '').toLowerCase(), m));

    // Merge database profiles
    (profiles || []).forEach((p) => {
      const emailKey = (p.email || '').toLowerCase();
      if (emailKey) {
        membersMap.set(emailKey, {
          ...p,
          nickname: p.nickname || p.full_name?.split(' ')[0] || 'Member',
          assigned_clients: p.assigned_clients || ['All Accounts'],
        });
      }
    });

    // Merge newly invited/added members from invitations
    (invitations || []).forEach((inv) => {
      const emailKey = (inv.email || '').toLowerCase();
      if (emailKey && !membersMap.has(emailKey)) {
        const displayName = inv.full_name || emailKey.split('@')[0];
        membersMap.set(emailKey, {
          id: inv.id || `usr-${Math.random().toString(36).substring(2, 7)}`,
          email: inv.email,
          full_name: displayName,
          nickname: displayName.split(' ')[0],
          role: inv.role || 'Team Member',
          is_core_admin: inv.role === 'admin' || inv.role === 'owner',
          assigned_clients: inv.assigned_clients && inv.assigned_clients.length > 0 ? inv.assigned_clients : ['Little Treasures Company'],
          is_active: true,
          title: inv.role || 'Team Member',
          avatar_color: '#466B53',
        });
      }
    });

    // Merge newly added cloud auth users
    (userList?.users || []).forEach((u) => {
      const emailKey = (u.email || '').toLowerCase();
      const meta = u.user_metadata || {};
      if (emailKey && !membersMap.has(emailKey)) {
        const displayName = meta.full_name || meta.name || emailKey.split('@')[0];
        membersMap.set(emailKey, {
          id: u.id,
          email: u.email,
          full_name: displayName,
          nickname: meta.nickname || displayName.split(' ')[0],
          role: meta.role || 'Team Member',
          is_core_admin: meta.isCoreAdmin ?? (meta.role === 'admin' || meta.role === 'owner'),
          assigned_clients: meta.assigned_clients && meta.assigned_clients.length > 0 ? meta.assigned_clients : ['Little Treasures Company'],
          is_active: true,
          title: meta.title || meta.role || 'Team Member',
          avatar_color: meta.avatarColor || '#466B53',
        });
      }
    });

    return NextResponse.json({ members: Array.from(membersMap.values()) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, assigned_clients, role } = body;

    if (!userId && !email) {
      return NextResponse.json({ error: 'userId or email is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (Array.isArray(assigned_clients)) {
      updates.assigned_clients = assigned_clients;
    }
    if (role) {
      updates.role = role;
    }

    let query = supabase.from('profiles').update(updates);
    if (userId) {
      query = query.eq('id', userId);
    } else {
      query = query.eq('email', email);
    }

    const { data, error } = await query.select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, member: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
