import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Built-in verified personnel credentials database (Updated: Fresh Secure Access Migration)
export const BUILT_IN_ACCOUNTS: Record<string, any> = {
  // 1. Executive Leadership (Universal Full Authority)
  'divine.origines': {
    password: 'GIM_Divine2026!Strategy',
    user: {
      id: 'divine-001',
      username: 'divine.origines',
      name: 'Divine Origines',
      nickname: 'Divine',
      email: 'divine@graceinmotion.agency',
      role: 'Owner',
      isCoreAdmin: false,
      avatarColor: 'bg-[#3D5249]',
      title: 'Founder & Strategy Lead',
      clientScope: 'all',
      assigned_clients: ['All Accounts'],
    },
  },
  'rdzgllgo': {
    password: 'GIM_Radz2026!Architect',
    user: {
      id: 'radz-001',
      username: 'rdzgllgo',
      name: 'Radzdom Gallego',
      nickname: 'Radz',
      email: 'radz@graceinmotion.agency',
      role: 'Admin',
      isCoreAdmin: true,
      avatarColor: 'bg-[#466B53]',
      title: 'Chief Automation Architect & Platform Systems Lead',
      clientScope: 'all',
      assigned_clients: ['All Accounts'],
    },
  },
  'ra.malinao': {
    password: 'GIM_RA2026!Finance',
    user: {
      id: 'ra-001',
      username: 'ra.malinao',
      name: 'Ma. Rose Anne (RA) Malinao',
      nickname: 'RA',
      email: 'ra@graceinmotion.agency',
      role: 'Admin',
      isCoreAdmin: true,
      avatarColor: 'bg-[#518E6A]',
      title: 'Commercial Operations & Billing Lead',
      clientScope: 'all',
      assigned_clients: ['All Accounts'],
    },
  },
  'aneweraa.ai@gmail.com': {
    password: 'GIM_RA2026!Operations',
    user: {
      id: 'ra-002',
      username: 'aneweraa.ai@gmail.com',
      name: 'Ma. Rose Anne (RA) Malinao',
      nickname: 'RA',
      email: 'aneweraa.ai@gmail.com',
      role: 'Admin',
      isCoreAdmin: true,
      avatarColor: 'bg-[#518E6A]',
      title: 'Commercial Operations & Billing Lead',
      clientScope: 'all',
      assigned_clients: ['All Accounts'],
    },
  },

  // 2. Delivery Squad & Client Specialists (Scoped Isolation)
  'erwin.manaog': {
    password: 'GIM_Erwin2026!Sprint',
    user: {
      id: 'erwin-001',
      username: 'erwin.manaog',
      name: 'Erwin Manaog',
      nickname: 'Erwin',
      email: 'erwin@graceinmotion.agency',
      role: 'Project Owner',
      isCoreAdmin: false,
      avatarColor: 'bg-[#65746C]',
      title: 'Project Owner & Delivery Specialist',
      clientScope: 'Little Treasures Company, We Rock the Spectrum (WRTS)',
      assigned_clients: ['Little Treasures Company', 'We Rock the Spectrum (WRTS)'],
    },
  },
  'bj.ricafrente': {
    password: 'GIM_BJ2026!Franchise',
    user: {
      id: 'bj-001',
      username: 'bj.ricafrente',
      name: 'BJ Ricafrente',
      nickname: 'BJ',
      email: 'bj@graceinmotion.agency',
      role: 'Operations Specialist',
      isCoreAdmin: false,
      avatarColor: 'bg-[#3D5249]',
      title: 'Operations Specialist',
      clientScope: 'We Rock the Spectrum (WRTS), Grace In Motion (Internal)',
      assigned_clients: ['We Rock the Spectrum (WRTS)', 'Grace In Motion (Internal)'],
    },
  },
  'camille.smm': {
    password: 'GIM_Camille2026!Social',
    user: {
      id: 'camille-001',
      username: 'camille.smm',
      name: 'Camille Bautista',
      nickname: 'Camille',
      email: 'camille.smm@graceinmotion.agency',
      role: 'Social Media Specialist',
      isCoreAdmin: false,
      avatarColor: 'bg-[#518E6A]',
      title: 'Social Media Specialist',
      clientScope: 'Little Treasures Company',
      assigned_clients: ['Little Treasures Company'],
    },
  },
  'jerold.recaplaza': {
    password: 'GIM_Jerold2026!Growth',
    user: {
      id: 'jerold-001',
      username: 'jerold.recaplaza',
      name: 'Jerold Recaplaza',
      nickname: 'Jerold',
      email: 'jerold@graceinmotion.agency',
      role: 'Operations Specialist',
      isCoreAdmin: false,
      avatarColor: 'bg-[#466B53]',
      title: 'Operations Specialist',
      clientScope: 'Risewise',
      assigned_clients: ['Risewise'],
    },
  },
  'jane.caillio': {
    password: 'GIM_Jane2026!Lead',
    user: {
      id: 'jane-001',
      username: 'jane.caillio',
      name: 'Jane Caillio',
      nickname: 'Jane',
      email: 'jane@graceinmotion.agency',
      role: 'Project Lead',
      isCoreAdmin: false,
      avatarColor: 'bg-[#518E6A]',
      title: 'Project Lead',
      clientScope: 'NoirLab',
      assigned_clients: ['NoirLab'],
    },
  },
  'jedy.caillio': {
    password: 'GIM_Jedy2026!Systems',
    user: {
      id: 'jedy-001',
      username: 'jedy.caillio',
      name: 'Jedy Caillio',
      nickname: 'Jedy',
      email: 'jedy@graceinmotion.agency',
      role: 'Operations Specialist',
      isCoreAdmin: false,
      avatarColor: 'bg-[#466B53]',
      title: 'Operations Specialist',
      clientScope: 'InVogue Cleans',
      assigned_clients: ['InVogue Cleans'],
    },
  },
  'ellyka.pama': {
    password: 'GIM_Ellyka2026!Assist',
    user: {
      id: 'ellyka-001',
      username: 'ellyka.pama',
      name: 'Ellyka Claire Pama',
      nickname: 'Ellyka',
      email: 'ellyka@graceinmotion.agency',
      role: 'Operations Assistant',
      isCoreAdmin: false,
      avatarColor: 'bg-[#65746C]',
      title: 'Operations Assistant',
      clientScope: 'InVogue Cleans, Studio Nets',
      assigned_clients: ['InVogue Cleans', 'Studio Nets'],
    },
  },
  'joyce.roble': {
    password: 'GIM_Joyce2026!Design',
    user: {
      id: 'joyce-001',
      username: 'joyce.roble',
      name: 'Joyce Roble',
      nickname: 'Joyce',
      email: 'joyce@graceinmotion.agency',
      role: 'Project Specialist',
      isCoreAdmin: false,
      avatarColor: 'bg-[#3D5249]',
      title: 'Project Specialist',
      clientScope: 'Studio Nets',
      assigned_clients: ['Studio Nets'],
    },
  },
  'joy.fabular': {
    password: 'GIM_Joy2026!Clean',
    user: {
      id: 'joy-001',
      username: 'joy.fabular',
      name: 'Joy Fabular',
      nickname: 'Joy',
      email: 'joy@graceinmotion.agency',
      role: 'Operations Assistant',
      isCoreAdmin: false,
      avatarColor: 'bg-[#518E6A]',
      title: 'Operations Assistant',
      clientScope: 'InVogue Cleans',
      assigned_clients: ['InVogue Cleans'],
    },
  },
  'aldwin.ops': {
    password: 'GIM_Aldwin2026!Ops',
    user: {
      id: 'aldwin-001',
      username: 'aldwin.ops',
      name: 'Aldwin',
      nickname: 'Aldwin',
      email: 'aldwin@graceinmotion.agency',
      role: 'Operations Assistant',
      isCoreAdmin: false,
      avatarColor: 'bg-[#65746C]',
      title: 'Operations Assistant',
      clientScope: 'We Rock the Spectrum (WRTS)',
      assigned_clients: ['We Rock the Spectrum (WRTS)'],
    },
  },
  'hashim.saudi': {
    password: 'GIM_Hashim2026!Tech',
    user: {
      id: 'hashim-001',
      username: 'hashim.saudi',
      name: 'Hashim Saudi',
      nickname: 'Hashim',
      email: 'hashim@graceinmotion.agency',
      role: 'Tech Specialist',
      isCoreAdmin: false,
      avatarColor: 'bg-[#466B53]',
      title: 'Tech Specialist',
      clientScope: 'Studio Nets',
      assigned_clients: ['Studio Nets'],
    },
  },
  'kimberly.besa': {
    password: 'GIM_Kimberly2026!GIM',
    user: {
      id: 'kimberly-001',
      username: 'kimberly.besa',
      name: 'Kimberly Besa',
      nickname: 'Kimberly',
      email: 'kimberly@graceinmotion.agency',
      role: 'Operations Assistant',
      isCoreAdmin: false,
      avatarColor: 'bg-[#3D5249]',
      title: 'Operations Assistant (Juvibolt & GIM)',
      clientScope: 'Juvibolt Cybertech, Grace In Motion (Internal)',
      assigned_clients: ['Juvibolt Cybertech', 'Grace In Motion (Internal)'],
    },
  },

  // 3. Verified Client Principals (Single-Tenant Portal Isolation)
  'zoe.horner': {
    password: 'Portal_Zoe2026!LTC',
    user: {
      id: 'zoe-001',
      username: 'zoe.horner',
      name: 'Zoe Horner',
      nickname: 'Zoe',
      email: 'zoe@littletreasures.com.au',
      role: 'Client User',
      isCoreAdmin: false,
      avatarColor: 'bg-[#518E6A]',
      title: 'Founder, Little Treasures',
      clientScope: 'Little Treasures Company',
      assigned_clients: ['Little Treasures Company'],
    },
  },
  'aaron.ofosu': {
    password: 'Portal_Aaron2026!JB',
    user: {
      id: 'aaron-001',
      username: 'aaron.ofosu',
      name: 'Aaron Ofosu',
      nickname: 'Aaron',
      email: 'aaron@juviboltcybertech.com',
      role: 'Client User',
      isCoreAdmin: false,
      avatarColor: 'bg-[#466B53]',
      title: 'Founder, Juvibolt Cybertech',
      clientScope: 'Juvibolt Cybertech',
      assigned_clients: ['Juvibolt Cybertech'],
    },
  },
  'matthew.robbins': {
    password: 'Portal_Matthew2026!IVC',
    user: {
      id: 'matthew-001',
      username: 'matthew.robbins',
      name: 'Matthew Robbins',
      nickname: 'Matthew',
      email: 'matthew@invoguecleans.com',
      role: 'Client User',
      isCoreAdmin: false,
      avatarColor: 'bg-[#3D5249]',
      title: 'Founder, InVogue Cleans',
      clientScope: 'InVogue Cleans',
      assigned_clients: ['InVogue Cleans'],
    },
  },
  'nathan.blake': {
    password: 'Portal_Nathan2026!SN',
    user: {
      id: 'nathan-001',
      username: 'nathan.blake',
      name: 'Nathan Blake',
      nickname: 'Nathan',
      email: 'nathan@studionets.com.au',
      role: 'Client User',
      isCoreAdmin: false,
      avatarColor: 'bg-[#65746C]',
      title: 'Creative Director, Studio Nets',
      clientScope: 'Studio Nets',
      assigned_clients: ['Studio Nets'],
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

    // 1. Check built-in verified accounts first (strictly against new credentials)
    const builtIn = BUILT_IN_ACCOUNTS[cleanUsername];
    if (builtIn && builtIn.password === cleanPassword) {
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
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    
    let targetEmail = cleanUsername.includes('@')
      ? cleanUsername
      : `${cleanUsername}@graceinmotion.agency`;

    const matchedUser = userList?.users?.find((u) => {
      const meta = u.user_metadata || {};
      const uEmail = (u.email || '').toLowerCase();
      const prefix = uEmail.split('@')[0];
      return (
        uEmail === targetEmail ||
        uEmail === cleanUsername ||
        prefix === cleanUsername ||
        meta.username?.toLowerCase() === cleanUsername ||
        meta.full_name?.toLowerCase() === cleanUsername ||
        meta.name?.toLowerCase() === cleanUsername ||
        meta.nickname?.toLowerCase() === cleanUsername
      );
    });

    if (matchedUser && matchedUser.email) {
      targetEmail = matchedUser.email;
      if (!matchedUser.email_confirmed_at) {
        try {
          await supabaseAdmin.auth.admin.updateUserById(matchedUser.id, { email_confirm: true });
        } catch {
          // ignore
        }
      }
    }

    // Attempt sign-in with password against Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: targetEmail,
      password: cleanPassword,
    });

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: 'Invalid username or password. All legacy credentials have been revoked. Please use your newly issued GIM Mission Control credentials.' },
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
      clientScope: meta.clientScope || (roleDisplayName === 'Admin' || roleDisplayName === 'Owner' ? 'all' : assignedClients.join(', ')),
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
