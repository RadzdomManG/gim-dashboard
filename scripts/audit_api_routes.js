const http = require('http');

async function testEndpoint(method, path, body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data.substring(0, 100);
        }
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAudit() {
  console.log('=== API AUDIT BEGIN ===');

  const tests = [
    { name: 'GET /api/tasks', method: 'GET', path: '/api/tasks' },
    { name: 'GET /api/clients', method: 'GET', path: '/api/clients' },
    { name: 'GET /api/team', method: 'GET', path: '/api/team' },
    { name: 'GET /api/messages', method: 'GET', path: '/api/messages?channelId=general' },
    { name: 'GET /api/invitations', method: 'GET', path: '/api/invitations' },
    { name: 'GET /api/approvals', method: 'GET', path: '/api/approvals' },
    { name: 'GET /api/profile', method: 'GET', path: '/api/profile' },
    { name: 'GET /api/search', method: 'GET', path: '/api/search?q=test' },
    { name: 'GET /api/clickup/tasks', method: 'GET', path: '/api/clickup/tasks' },
  ];

  for (const t of tests) {
    const res = await testEndpoint(t.method, t.path);
    const summary = Array.isArray(res.data) 
      ? `array[${res.data.length}]` 
      : typeof res.data === 'object' && res.data !== null 
      ? Object.keys(res.data).map(k => `${k}:${Array.isArray(res.data[k]) ? 'array['+res.data[k].length+']' : typeof res.data[k]}`).join(', ') 
      : res.data;
    console.log(`${t.name} -> Status: ${res.status} | Data: ${summary}`);
  }

  console.log('=== API AUDIT COMPLETE ===');
}

runAudit();
