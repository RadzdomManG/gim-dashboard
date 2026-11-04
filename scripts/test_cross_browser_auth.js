async function testCrossBrowserAuth() {
  const baseUrl = 'http://localhost:3000';
  console.log('=== TESTING CROSS-BROWSER AUTHENTICATION ===');

  const testUser = {
    username: 'test_cross_browser',
    password: 'CrossPassword2026!',
    full_name: 'Cross Browser Specialist',
    role: 'team_member',
    assigned_clients: ['Little Treasures Company']
  };

  // Step 1: Radz registers member via /api/invitations (simulating Browser A)
  console.log('1. Provisioning member via POST /api/invitations...');
  const invRes = await fetch(`${baseUrl}/api/invitations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  const invData = await invRes.json();
  console.log('   /api/invitations status:', invRes.status, invData.success ? 'SUCCESS' : invData);

  // Step 2: Member logs in on Browser B via POST /api/auth/login (Zero localStorage)
  console.log('\n2. Simulating login on Browser B via POST /api/auth/login...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: testUser.username,
      password: testUser.password
    })
  });
  const loginData = await loginRes.json();
  console.log('   /api/auth/login status:', loginRes.status);
  console.log('   Logged-in User Name:', loginData.user?.name);
  console.log('   User Role:', loginData.user?.role);
  console.log('   Client Scope:', loginData.user?.clientScope);

  // Step 3: Test invalid password rejection
  console.log('\n3. Testing invalid password rejection...');
  const failRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: testUser.username,
      password: 'WrongPassword999!'
    })
  });
  const failData = await failRes.json();
  console.log('   Fail response status:', failRes.status, failData.error ? 'CORRECTLY REJECTED' : failData);

  // Step 4: Test built-in accounts (e.g. Radz)
  console.log('\n4. Testing built-in Radz login...');
  const radzRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'rdzgllgo',
      password: 'Radzrose012116!'
    })
  });
  const radzData = await radzRes.json();
  console.log('   Radz login status:', radzRes.status, radzData.user?.name);

  console.log('\n=== CROSS-BROWSER AUTH TEST COMPLETE ===');
}

testCrossBrowserAuth();
