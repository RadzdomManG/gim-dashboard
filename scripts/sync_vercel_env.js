const fs = require('fs');
const { execSync } = require('child_process');

function syncEnv() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const lines = content.split('\n');

  const envs = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const k = trimmed.substring(0, idx).trim();
      let v = trimmed.substring(idx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.substring(1, v.length - 1);
      }
      envs[k] = v;
    }
  }

  const targets = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'CLICKUP_API_TOKEN',
    'CLICKUP_TEAM_ID',
    'CLICKUP_LIST_LITTLE_TREASURES',
    'CLICKUP_LIST_GIM_INTERNAL'
  ];

  for (const k of targets) {
    const val = envs[k];
    if (!val) {
      console.log('Skipping missing:', k);
      continue;
    }
    console.log(`Setting Vercel env var: ${k}...`);
    try {
      const escapedVal = val.replace(/"/g, '`"');
      const cmd = `npx vercel env add ${k} production,preview,development --value "${escapedVal}" --force --yes --non-interactive --scope radzdoms-projects`;
      const out = execSync(cmd, { shell: 'powershell.exe' });
      console.log(`  Success for ${k}:`, out.toString().trim().split('\n')[0]);
    } catch (err) {
      console.log(`  Failed for ${k}:`, err.stdout?.toString() || err.stderr?.toString() || err.message);
    }
  }
}

syncEnv();
