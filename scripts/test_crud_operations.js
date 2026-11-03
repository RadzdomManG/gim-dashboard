async function runCrudTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('=== CRUD AUDIT TESTS BEGIN ===');

  // Test 1: Messages POST & DELETE
  try {
    const postMsgRes = await fetch(`${baseUrl}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_id: 'general',
        sender_id: 'usr-radz',
        sender_name: 'Radzdom Gallego (Radz)',
        sender_email: 'rdzgllgo',
        sender_avatar: '#466B53',
        content: 'Automated test message for audit verification',
      })
    });
    const postMsgData = await postMsgRes.json();
    console.log('1. POST /api/messages ->', postMsgRes.status, postMsgData.success ? 'SUCCESS' : postMsgData);
    
    if (postMsgData.message?.id) {
      const delMsgRes = await fetch(`${baseUrl}/api/messages`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postMsgData.message.id })
      });
      const delMsgData = await delMsgRes.json();
      console.log('   DELETE /api/messages ->', delMsgRes.status, delMsgData.success ? 'SUCCESS' : delMsgData);
    }
  } catch (err) {
    console.error('Error in message test:', err.message);
  }

  // Test 2: Tasks POST
  try {
    const postTaskRes = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Audit Verification Task',
        client: 'Little Treasures Company',
        assignee: 'Radzdom Gallego',
        assigneeRole: 'Chief Automation Architect & Tech Lead',
        priority: 'high',
        dueDate: '2026-11-30',
        gateCode: 'AUDIT-01',
        description: 'Comprehensive QA system test',
        attachments: [
          { name: 'audit_spec.pdf', type: 'application/pdf', size: 1024, url: '/audit_spec.pdf' }
        ]
      })
    });
    const postTaskData = await postTaskRes.json();
    console.log('2. POST /api/tasks ->', postTaskRes.status, postTaskData.success ? 'SUCCESS' : postTaskData);
  } catch (err) {
    console.error('Error in task test:', err.message);
  }

  // Test 3: Invitations POST
  try {
    const postInvRes = await fetch(`${baseUrl}/api/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test Member',
        username: 'test_member_audit',
        password: 'Password123!',
        role: 'Specialist',
        title: 'Automation Specialist',
        assigned_clients: ['Little Treasures Company']
      })
    });
    const postInvData = await postInvRes.json();
    console.log('3. POST /api/invitations ->', postInvRes.status, postInvData.success ? 'SUCCESS' : postInvData);
  } catch (err) {
    console.error('Error in invitations test:', err.message);
  }

  // Test 4: Profile GET
  try {
    const profRes = await fetch(`${baseUrl}/api/profile?email=rdzgllgo`);
    const profData = await profRes.json();
    console.log('4. GET /api/profile?email=rdzgllgo ->', profRes.status, profData.success ? 'SUCCESS' : profData);
  } catch (err) {
    console.error('Error in profile test:', err.message);
  }

  console.log('=== CRUD AUDIT TESTS COMPLETE ===');
}

runCrudTests();
