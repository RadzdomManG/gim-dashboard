const https = require("https");
const token = process.env.CLICKUP_API_TOKEN || "pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD";

function get(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.clickup.com",
      path: "/api/v2" + path,
      method: "GET",
      headers: { "Authorization": token, "Content-Type": "application/json" }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

(async () => {
  try {
    const teams = await get("/team");
    if (!teams.teams || !teams.teams[0]) {
      console.log("No teams found:", teams);
      return;
    }
    const team = teams.teams[0];
    console.log("Team:", team.name, "ID:", team.id);
    console.log("Members count:", team.members.length);
    console.log("Members list:");
    team.members.forEach(m => {
      console.log(`- ${m.user.username} (${m.user.email}) [ID: ${m.user.id}, Role: ${m.user.role}]`);
    });

    const spaces = await get(`/team/${team.id}/space`);
    console.log("\nSpaces:", spaces.spaces?.map(s => `${s.name} (${s.id})`));

    // For each space, get folders and lists
    for (const space of (spaces.spaces || [])) {
      console.log(`\n=== SPACE: ${space.name} (${space.id}) ===`);
      const folders = await get(`/space/${space.id}/folder`);
      for (const folder of (folders.folders || [])) {
        console.log(`  Folder: ${folder.name} (${folder.id})`);
        for (const list of (folder.lists || [])) {
          console.log(`    List: ${list.name} (${list.id})`);
        }
      }
      const folderlessLists = await get(`/space/${space.id}/list`);
      for (const list of (folderlessLists.lists || [])) {
        console.log(`  Folderless List: ${list.name} (${list.id})`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
})();
