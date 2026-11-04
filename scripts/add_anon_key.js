const fs = require('fs');
const { execSync } = require('child_process');

const content = fs.readFileSync('.env.local', 'utf8');
const match = content.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
if (match) {
  const val = match[1].trim();
  const cmd = `npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production,preview,development --type config --value "${val}" --yes --force --non-interactive --scope radzdoms-projects`;
  const out = execSync(cmd, { shell: 'powershell.exe' });
  console.log(out.toString());
}
