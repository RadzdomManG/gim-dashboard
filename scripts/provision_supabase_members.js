const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLines = fs.readFileSync('.env.local', 'utf-8').split('\n');
let url, key;
envLines.forEach(l => {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = l.split('=')[1].trim();
});

if (!url || !key) {
  console.error('Supabase URL or Key not found in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

const MEMBERS = [
  {
    name: 'Divine Origines',
    nickname: 'Divine',
    email: 'divine@graceinmotion.agency',
    username: 'divine',
    password: 'GIM_Divine2026!Strategy',
    role: 'Owner',
    isCoreAdmin: true,
    title: 'Founder & Strategy Lead',
    assigned_clients: ['All Accounts'],
    clientScope: 'all',
  },
  {
    name: 'Radzdom Gallego',
    nickname: 'Radz',
    email: 'radz@graceinmotion.agency',
    username: 'radz',
    password: 'GIM_Radz2026!Architect',
    role: 'Admin',
    isCoreAdmin: true,
    title: 'Chief Automation Architect & Platform Systems Lead',
    assigned_clients: ['All Accounts'],
    clientScope: 'all',
  },
  {
    name: 'Ma. Rose Anne Malinao',
    nickname: 'RA',
    email: 'ra@graceinmotion.agency',
    username: 'ra',
    password: 'GIM_RA2026!Finance',
    role: 'Admin',
    isCoreAdmin: true,
    title: 'Commercial Operations & Billing Lead',
    assigned_clients: ['All Accounts'],
    clientScope: 'all',
  },
  {
    name: 'Erwin Manaog',
    nickname: 'Erwin',
    email: 'em.erwin011@gmail.com',
    username: 'erwin',
    password: 'GIM_Erwin2026!Sprint',
    role: 'Operations Manager (OM)',
    isCoreAdmin: false,
    title: 'Operations Manager (OM) & Delivery Lead',
    assigned_clients: ['We Rock the Spectrum (WRTS)', 'InVogue Cleans', 'Studio Nets', 'NoirLab', 'Risewise', 'Grace In Motion (Internal)'],
    clientScope: 'We Rock the Spectrum (WRTS), InVogue Cleans, Studio Nets, NoirLab, Risewise, Grace In Motion (Internal)',
  },
  {
    name: 'BJ Ricafrente',
    nickname: 'BJ',
    email: 'ricafrente.bjl@gmail.com',
    username: 'bj',
    password: 'GIM_BJ2026!Franchise',
    role: 'Operations Specialist',
    isCoreAdmin: false,
    title: 'Operations Specialist',
    assigned_clients: ['We Rock the Spectrum (WRTS)', 'Studio Nets', 'Grace In Motion (Internal)'],
    clientScope: 'We Rock the Spectrum (WRTS), Studio Nets, Grace In Motion (Internal)',
  },
  {
    name: 'Kimberly Besa',
    nickname: 'Kim',
    email: 'kimberlybesa80@gmail.com',
    username: 'kim',
    password: 'GIM_Kimberly2026!GIM',
    role: 'Operations Assistant',
    isCoreAdmin: false,
    title: 'Operations Assistant (Juvibolt, InVogue & GIM)',
    assigned_clients: ['Juvibolt Cybertech', 'InVogue Cleans', 'Risewise', 'Grace In Motion (Internal)'],
    clientScope: 'Juvibolt Cybertech, InVogue Cleans, Risewise, Grace In Motion (Internal)',
  },
  {
    name: 'Jerold Recaplaza',
    nickname: 'Jerold',
    email: 'recaplazajerold@gmail.com',
    username: 'jerold',
    password: 'GIM_Jerold2026!Growth',
    role: 'Operations Specialist',
    isCoreAdmin: false,
    title: 'Operations Specialist',
    assigned_clients: ['Risewise', 'NoirLab', 'Studio Nets', 'Grace In Motion (Internal)'],
    clientScope: 'Risewise, NoirLab, Studio Nets, Grace In Motion (Internal)',
  },
  {
    name: 'Jane Caillio',
    nickname: 'Jane',
    email: 'hello@theprocessease.com',
    username: 'jane',
    password: 'GIM_Jane2026!Lead',
    role: 'Project Lead',
    isCoreAdmin: false,
    title: 'Project Lead',
    assigned_clients: ['NoirLab', 'Studio Nets', 'Grace In Motion (Internal)'],
    clientScope: 'NoirLab, Studio Nets, Grace In Motion (Internal)',
  },
  {
    name: 'Jedy Caillio',
    nickname: 'Jedy',
    email: 'jedy@theprocessease.com',
    username: 'jedy',
    password: 'GIM_Jedy2026!Systems',
    role: 'Operations Specialist',
    isCoreAdmin: false,
    title: 'Operations Specialist',
    assigned_clients: ['InVogue Cleans', 'Grace In Motion (Internal)'],
    clientScope: 'InVogue Cleans, Grace In Motion (Internal)',
  },
  {
    name: 'Aldwin',
    nickname: 'Aldwin',
    email: 'charlesaldwinlim@gmail.com',
    username: 'aldwin',
    password: 'GIM_Aldwin2026!Ops',
    role: 'Operations Assistant',
    isCoreAdmin: false,
    title: 'Operations Assistant',
    assigned_clients: ['We Rock the Spectrum (WRTS)', 'Grace In Motion (Internal)'],
    clientScope: 'We Rock the Spectrum (WRTS), Grace In Motion (Internal)',
  },
  {
    name: 'Joy Fabular',
    nickname: 'Joy',
    email: 'baluyotjoy89@gmail.com',
    username: 'joy',
    password: 'GIM_Joy2026!Clean',
    role: 'Operations Assistant',
    isCoreAdmin: false,
    title: 'Operations Assistant',
    assigned_clients: ['InVogue Cleans', 'Grace In Motion (Internal)'],
    clientScope: 'InVogue Cleans, Grace In Motion (Internal)',
  },
  {
    name: 'Ellyka Claire Pama',
    nickname: 'Ellyka',
    email: 'ellykaclairepama@gmail.com',
    username: 'ellyka',
    password: 'GIM_Ellyka2026!Assist',
    role: 'Operations Assistant',
    isCoreAdmin: false,
    title: 'Operations Assistant',
    assigned_clients: ['InVogue Cleans', 'Studio Nets', 'Grace In Motion (Internal)'],
    clientScope: 'InVogue Cleans, Studio Nets, Grace In Motion (Internal)',
  },
  {
    name: 'Joyce Roble',
    nickname: 'Joyce',
    email: 'joyceroblevaservices@gmail.com',
    username: 'joyce',
    password: 'GIM_Joyce2026!Design',
    role: 'Project Specialist',
    isCoreAdmin: false,
    title: 'Project Specialist',
    assigned_clients: ['Studio Nets', 'Grace In Motion (Internal)'],
    clientScope: 'Studio Nets, Grace In Motion (Internal)',
  },
  {
    name: 'Hashim Saudi',
    nickname: 'Hashim',
    email: 'hashim3898@gmail.com',
    username: 'hashim',
    password: 'GIM_Hashim2026!Tech',
    role: 'Tech Specialist',
    isCoreAdmin: false,
    title: 'Tech Specialist',
    assigned_clients: ['Studio Nets', 'Grace In Motion (Internal)'],
    clientScope: 'Studio Nets, Grace In Motion (Internal)',
  },
  {
    name: 'Marj Larona',
    nickname: 'Marj',
    email: 'marjoryann.d.larona@gmail.com',
    username: 'marj',
    password: 'GIM_Marj2026!Ops',
    role: 'Operations Specialist',
    isCoreAdmin: false,
    title: 'Operations Specialist',
    assigned_clients: ['Risewise', 'Grace In Motion (Internal)'],
    clientScope: 'Risewise, Grace In Motion (Internal)',
  },
  {
    name: 'Cy Suarilla',
    nickname: 'Cy',
    email: 'cyilsua@gmail.com',
    username: 'cy',
    password: 'GIM_Cy2026!Funnels',
    role: 'Operations Specialist',
    isCoreAdmin: false,
    title: 'Operations Specialist',
    assigned_clients: ['Risewise', 'Grace In Motion (Internal)'],
    clientScope: 'Risewise, Grace In Motion (Internal)',
  },
  {
    name: 'Aaron Ofosu',
    nickname: 'Aaron',
    email: 'aaron@juviboltcybertech.com',
    username: 'aaron',
    password: 'Portal_Aaron2026!JB',
    role: 'Client User',
    isCoreAdmin: false,
    title: 'Founder, Juvibolt Cybertech',
    assigned_clients: ['Juvibolt Cybertech'],
    clientScope: 'Juvibolt Cybertech',
  },
  {
    name: 'Matthew Robbins',
    nickname: 'Matthew',
    email: 'matthew@invoguecleans.com',
    username: 'matthew',
    password: 'Portal_Matthew2026!IVC',
    role: 'Client User',
    isCoreAdmin: false,
    title: 'Founder, InVogue Cleans',
    assigned_clients: ['InVogue Cleans'],
    clientScope: 'InVogue Cleans',
  },
  {
    name: 'Nathan Blake',
    nickname: 'Nathan',
    email: 'nathan@studionets.com.au',
    username: 'nathan',
    password: 'Portal_Nathan2026!SN',
    role: 'Client User',
    isCoreAdmin: false,
    title: 'Creative Director, Studio Nets',
    assigned_clients: ['Studio Nets'],
    clientScope: 'Studio Nets',
  },
];

async function provision() {
  console.log('Fetching existing users from Supabase Auth...');
  const { data: userList, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('List users error:', listErr);
    process.exit(1);
  }

  const existingMap = new Map();
  userList.users.forEach(u => existingMap.set(u.email.toLowerCase(), u));

  console.log(`Found ${userList.users.length} existing users. Provisioning ${MEMBERS.length} members...`);

  for (const m of MEMBERS) {
    const existing = existingMap.get(m.email.toLowerCase());
    const metadata = {
      full_name: m.name,
      name: m.name,
      nickname: m.nickname,
      username: m.username,
      role: m.role,
      title: m.title,
      isCoreAdmin: m.isCoreAdmin,
      clientScope: m.clientScope,
      assigned_clients: m.assigned_clients,
      email_verified: true,
    };

    let userId = null;
    if (existing) {
      console.log(`Updating user: ${m.name} (${m.email})...`);
      const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
        password: m.password,
        user_metadata: metadata,
        email_confirm: true,
      });
      if (error) console.error(`Error updating ${m.email}:`, error.message);
      else userId = data.user.id;
    } else {
      console.log(`Creating user: ${m.name} (${m.email})...`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: m.email,
        password: m.password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (error) console.error(`Error creating ${m.email}:`, error.message);
      else userId = data.user.id;
    }

    if (userId) {
      // Upsert into public.profiles
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          email: m.email,
          full_name: m.name,
          is_core_admin: m.isCoreAdmin,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch (err) {
        // Table might have specific enum requirements or trigger
      }
    }
  }

  console.log('All members successfully provisioned into Supabase!');
}

provision().catch(console.error);
