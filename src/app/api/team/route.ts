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

    // Base verified GIM leadership, specialists & client founders mapped to real ClickUp assignments
    const baseMembers = [
      { id: 'usr-divine', email: 'divine.origines', full_name: 'Divine Origines', nickname: 'Divine', role: 'Owner', is_core_admin: true, assigned_clients: ['All Accounts'], is_active: true, title: 'Owner & Strategy Lead', avatar_color: '#3D5249' },
      { id: 'usr-radz', email: 'rdzgllgo', full_name: 'Radzdom Gallego', nickname: 'Radz', role: 'Admin', is_core_admin: true, assigned_clients: ['All Accounts'], is_active: true, title: 'Chief Automation Architect & Tech Lead', avatar_color: '#466B53' },
      { id: 'usr-ra', email: 'aneweraa.ai@gmail.com', full_name: 'Ma. Rose Anne (RA) Malinao', nickname: 'RA', role: 'Admin', is_core_admin: true, assigned_clients: ['All Accounts'], is_active: true, title: 'Head of Operations & Billing Lead', avatar_color: '#518E6A' },
      { id: 'usr-erwin', email: 'em.erwin011@gmail.com', full_name: 'Erwin Manaog', nickname: 'Erwin', role: 'Operations Manager', is_core_admin: false, assigned_clients: ['We Rock the Spectrum (WRTS)', 'InVogue Cleans', 'Studio Nets', 'NoirLab', 'Grace In Motion (Internal)'], is_active: true, title: 'Operations Manager & Delivery Specialist', avatar_color: '#65746C' },
      { id: 'usr-bj', email: 'ricafrente.bjl@gmail.com', full_name: 'BJ Ricafrente', nickname: 'BJ', role: 'Specialist', is_core_admin: false, assigned_clients: ['We Rock the Spectrum (WRTS)', 'Grace In Motion (Internal)'], is_active: true, title: 'Operations Specialist', avatar_color: '#3D5249' },
      { id: 'usr-jerold', email: 'recaplazajerold@gmail.com', full_name: 'Jerold Recaplaza', nickname: 'Jerold', role: 'Specialist', is_core_admin: false, assigned_clients: ['Risewise', 'NoirLab', 'Studio Nets', 'Grace In Motion (Internal)'], is_active: true, title: 'Operations Specialist', avatar_color: '#466B53' },
      { id: 'usr-jane', email: 'hello@theprocessease.com', full_name: 'Jane Caillio', nickname: 'Jane', role: 'Specialist', is_core_admin: false, assigned_clients: ['NoirLab', 'Studio Nets', 'Grace In Motion (Internal)'], is_active: true, title: 'Project Lead', avatar_color: '#518E6A' },
      { id: 'usr-jedy', email: 'jedy@theprocessease.com', full_name: 'Jedy Caillio', nickname: 'Jedy', role: 'Specialist', is_core_admin: false, assigned_clients: ['InVogue Cleans', 'Grace In Motion (Internal)'], is_active: true, title: 'Operations Specialist', avatar_color: '#466B53' },
      { id: 'usr-ellyka', email: 'ellykaclairepama@gmail.com', full_name: 'Ellyka Claire Pama', nickname: 'Ellyka', role: 'Specialist', is_core_admin: false, assigned_clients: ['InVogue Cleans', 'Studio Nets'], is_active: true, title: 'Operations Assistant', avatar_color: '#65746C' },
      { id: 'usr-joyce', email: 'joyceroblevaservices@gmail.com', full_name: 'Joyce Roble', nickname: 'Joyce', role: 'Specialist', is_core_admin: false, assigned_clients: ['Studio Nets'], is_active: true, title: 'Project Specialist', avatar_color: '#3D5249' },
      { id: 'usr-joy', email: 'baluyotjoy89@gmail.com', full_name: 'Joy Fabular', nickname: 'Joy', role: 'Specialist', is_core_admin: false, assigned_clients: ['InVogue Cleans', 'Grace In Motion (Internal)'], is_active: true, title: 'Operations Assistant', avatar_color: '#518E6A' },
      { id: 'usr-aldwin', email: 'charlesaldwinlim@gmail.com', full_name: 'Aldwin', nickname: 'Aldwin', role: 'Specialist', is_core_admin: false, assigned_clients: ['We Rock the Spectrum (WRTS)', 'Grace In Motion (Internal)'], is_active: true, title: 'Operations Assistant', avatar_color: '#65746C' },
      { id: 'usr-hashim', email: 'hashim3898@gmail.com', full_name: 'Hashim Saudi', nickname: 'Hashim', role: 'Specialist', is_core_admin: false, assigned_clients: ['Studio Nets'], is_active: true, title: 'Tech Specialist', avatar_color: '#466B53' },
      { id: 'usr-kimberly', email: 'kimberlybesa80@gmail.com', full_name: 'Kimberly Besa', nickname: 'Kimberly', role: 'Operations Assistant', is_core_admin: false, assigned_clients: ['Juvibolt Cybertech', 'InVogue Cleans', 'Grace In Motion (Internal)'], is_active: true, title: 'Operations Assistant (Juvibolt, InVogue & GIM)', avatar_color: '#3D5249' },
      { id: 'usr-aaron', email: 'aaron@juviboltcybertech.com', full_name: 'Aaron Ofosu', nickname: 'Aaron', role: 'Client User', is_core_admin: false, assigned_clients: ['Juvibolt Cybertech'], is_active: true, title: 'Founder, Juvibolt Cybertech', avatar_color: '#466B53' },
      { id: 'usr-matthew', email: 'matthew@invoguecleans.com', full_name: 'Matthew Robbins', nickname: 'Matthew', role: 'Client User', is_core_admin: false, assigned_clients: ['InVogue Cleans'], is_active: true, title: 'Founder, InVogue Cleans', avatar_color: '#3D5249' },
      { id: 'usr-nathan', email: 'nathan@studionets.com.au', full_name: 'Nathan Blake', nickname: 'Nathan', role: 'Client User', is_core_admin: false, assigned_clients: ['Studio Nets'], is_active: true, title: 'Creative Director, Studio Nets', avatar_color: '#65746C' },
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
          assigned_clients: inv.assigned_clients && inv.assigned_clients.length > 0 ? inv.assigned_clients : ['We Rock the Spectrum (WRTS)'],
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
          assigned_clients: meta.assigned_clients && meta.assigned_clients.length > 0 ? meta.assigned_clients : ['We Rock the Spectrum (WRTS)'],
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
    const clientList = Array.isArray(assigned_clients) ? assigned_clients : [];
    const targetEmail = (email || '').toLowerCase().trim();

    // 1. Update invitations table (if previously invited/provisioned)
    if (targetEmail) {
      await supabase
        .from('invitations')
        .update({
          assigned_clients: clientList,
          ...(role ? { role } : {}),
        })
        .ilike('email', targetEmail);
    }

    // 2. Check and update Supabase Auth User metadata (so cloud login reflects the new scope)
    const { data: userList } = await supabase.auth.admin.listUsers();
    const matchedAuthUser = userList?.users?.find(
      (u) =>
        u.id === userId ||
        (targetEmail && u.email?.toLowerCase() === targetEmail) ||
        (targetEmail && u.email?.toLowerCase().startsWith(targetEmail.split('@')[0])) ||
        (u.user_metadata?.username && targetEmail.includes(u.user_metadata.username.toLowerCase()))
    );

    if (matchedAuthUser) {
      await supabase.auth.admin.updateUserById(matchedAuthUser.id, {
        user_metadata: {
          ...matchedAuthUser.user_metadata,
          assigned_clients: clientList,
          clientScope: clientList.join(', '),
          ...(role ? { role } : {}),
        },
      });

      // Upsert into profiles table
      await supabase.from('profiles').upsert({
        id: matchedAuthUser.id,
        email: matchedAuthUser.email,
        full_name: matchedAuthUser.user_metadata?.full_name || matchedAuthUser.email?.split('@')[0],
        role: (role || matchedAuthUser.user_metadata?.role || 'team_member') as any,
        is_core_admin: role === 'admin' || role === 'owner' || matchedAuthUser.user_metadata?.isCoreAdmin,
        assigned_clients: clientList,
        is_active: true,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      member: {
        id: userId || matchedAuthUser?.id || `usr-${Date.now()}`,
        email: targetEmail || matchedAuthUser?.email,
        assigned_clients: clientList,
        role: role || matchedAuthUser?.user_metadata?.role,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
