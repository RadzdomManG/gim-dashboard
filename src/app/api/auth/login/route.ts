import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Built-in verified personnel credentials
const BUILT_IN_ACCOUNTS: Record<string, any> = {
  "divine.origines": {
    password: "GIM_2026!OS!",
    user: {
      id: "divine-001",
      username: "divine.origines",
      name: "Divine Origines",
      nickname: "Divine",
      email: "divine@graceinmotion.agency",
      role: "Owner",
      isCoreAdmin: false,
      avatarColor: "bg-[#3D5249]",
      title: "Founder & Strategy Lead",
      clientScope: "all",
      assigned_clients: ["All Accounts"],
    },
  },
  "rdzgllgo": {
    password: "Radzrose012116!",
    user: {
      id: "radz-001",
      username: "rdzgllgo",
      name: "Radzdom Gallego",
      nickname: "Radz",
      email: "radz@graceinmotion.agency",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#466B53]",
      title: "Chief Automation Architect & Platform Systems Lead",
      clientScope: "all",
      assigned_clients: ["All Accounts"],
    },
  },
  "aneweraa.ai@gmail.com": {
    password: "Password123!",
    user: {
      id: "ra-001",
      username: "aneweraa.ai@gmail.com",
      name: "Ma. Rose Anne (RA) Malinao",
      nickname: "RA",
      email: "aneweraa.ai@gmail.com",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#518E6A]",
      title: "Commercial Operations & Billing Lead",
      clientScope: "all",
      assigned_clients: ["All Accounts"],
    },
  },
  "ra.malinao": {
    password: "Password123!",
    user: {
      id: "ra-002",
      username: "ra.malinao",
      name: "Ma. Rose Anne (RA) Malinao",
      nickname: "RA",
      email: "ra@graceinmotion.agency",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#518E6A]",
      title: "Commercial Operations & Billing Lead",
      clientScope: "all",
      assigned_clients: ["All Accounts"],
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Check built-in verified accounts first
    const builtIn = BUILT_IN_ACCOUNTS[cleanUsername];
    if (builtIn && (builtIn.password === cleanPassword || (cleanUsername === 'ra.malinao' && cleanPassword === 'RA_GIM2026!'))) {
      return NextResponse.json({
        success: true,
        user: builtIn.user,
      });
    }

    // 2. Query Supabase Auth for cloud-provisioned users
    const supabaseAdmin = createAdminClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Find the user in Supabase Auth to resolve their email
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    let targetEmail = cleanUsername.includes('@')
      ? cleanUsername
      : `${cleanUsername}@graceinmotion.agency`;

    let matchedUser = userList?.users?.find((u) => {
      const meta = u.user_metadata || {};
      return (
        u.email?.toLowerCase() === targetEmail ||
        u.email?.toLowerCase() === cleanUsername ||
        meta.username?.toLowerCase() === cleanUsername
      );
    });

    if (matchedUser && matchedUser.email) {
      targetEmail = matchedUser.email;
    }

    // Attempt sign-in with password against Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: targetEmail,
      password: cleanPassword,
    });

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: 'Invalid username or password. Only verified GIM personnel may access Mission Control.' },
        { status: 401 }
      );
    }

    // Construct unified user profile from metadata
    const user = authData.user;
    const meta = user.user_metadata || {};
    const displayName = meta.full_name || meta.name || cleanUsername;
    const roleDisplayName =
      meta.role === 'admin'
        ? 'Admin'
        : meta.role === 'project_owner'
        ? 'Project Owner'
        : meta.role === 'smm_specialist'
        ? 'Social Media Specialist'
        : meta.role === 'client_user'
        ? 'Client User'
        : (meta.role || 'Team Member');

    const assignedClients = Array.isArray(meta.assigned_clients) && meta.assigned_clients.length > 0
      ? meta.assigned_clients
      : ['Little Treasures Company'];

    const userProfile = {
      id: user.id,
      username: meta.username || cleanUsername,
      name: displayName,
      nickname: meta.nickname || displayName.split(' ')[0],
      email: user.email,
      role: roleDisplayName,
      title: meta.title || roleDisplayName,
      isCoreAdmin: meta.isCoreAdmin ?? (meta.role === 'admin' || meta.role === 'owner'),
      avatarColor: meta.avatarColor || 'bg-[#466B53]',
      avatarUrl: meta.avatarUrl || '',
      clientScope: meta.clientScope || (roleDisplayName === 'Admin' ? 'all' : assignedClients[0]),
      assigned_clients: assignedClients,
    };

    return NextResponse.json({
      success: true,
      user: userProfile,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
