const https = require("https");
const token = process.env.CLICKUP_API_TOKEN || "pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD";

const lists = [
  { id: '1301240000003883', client: 'Little Treasures Company' },
  { id: '1301240000002387', client: 'We Rock the Spectrum (WRTS)' },
  { id: '1301240000005206', client: 'Juvibolt Cybertech' },
  { id: '901617666653', client: 'InVogue Cleans' },
  { id: '901616453524', client: 'NoirLab' },
  { id: '901616174910', client: 'Studio Nets' },
  { id: '901614119824', client: 'Risewise' },
  { id: '901607479883', client: 'Grace In Motion (Internal)' },
  { id: '901605140683', client: 'Origines Biz' },
];

function get(path) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: "api.clickup.com",
      path: "/api/v2" + path,
      method: "GET",
      headers: { "Authorization": token, "Content-Type": "application/json" }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.end();
  });
}

(async () => {
  const clientAssigneeMap = {};

  for (const l of lists) {
    console.log(`Checking list: ${l.client} (${l.id})...`);
    const res = await get(`/list/${l.id}/task?include_closed=true&subtasks=true`);
    if (res && res.tasks) {
      console.log(`  Found ${res.tasks.length} tasks`);
      clientAssigneeMap[l.client] = new Set();
      res.tasks.forEach(t => {
        (t.assignees || []).forEach(a => {
          clientAssigneeMap[l.client].add(`${a.username} (${a.email || 'no-email'})`);
        });
      });
    } else {
      console.log(`  Error or empty:`, res);
    }
  }

  console.log("\n================== ASSIGNEE SUMMARY BY CLIENT ==================");
  for (const [client, assignees] of Object.entries(clientAssigneeMap)) {
    console.log(`\nClient: ${client}`);
    if (assignees.size === 0) {
      console.log("  (No assignees found)");
    } else {
      assignees.forEach(a => console.log(`  - ${a}`));
    }
  }
})();
