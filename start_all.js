const { spawn } = require("child_process");
const path = require("path");

console.log("================================================================================");
console.log("    LAUNCHING ALL SPORTS TALENT AI SERVICES (CORE, SCOUT, MOBILE & CV)         ");
console.log("================================================================================");

const services = [
  { name: "Backend API", cmd: "node", args: ["src/server.js"], cwd: path.join(__dirname, "../backend"), port: 4000 },
  { name: "Scout Dashboard", cmd: "node", args: ["src/server.js"], cwd: path.join(__dirname, "../scout-dashboard"), port: 3000 },
  { name: "Athlete Mobile App", cmd: "node", args: ["src/server.js"], cwd: path.join(__dirname, "../mobile-app"), port: 5000 },
  { name: "AI CV Microservice", cmd: "python", args: ["main.py"], cwd: path.join(__dirname, "../ai-service"), port: 8000 }
];

services.forEach(s => {
  const child = spawn(s.cmd, s.args, { cwd: s.cwd, stdio: "inherit", shell: true });
  console.log(`[STARTED] ${s.name.padEnd(22)} -> Running on http://localhost:${s.port}`);
  child.on("error", err => console.error(`Error in ${s.name}:`, err));
});

console.log("\n--- Active Live Service Endpoints ---");
console.log("1. Scout Pro Discovery Portal: http://localhost:3000");
console.log("2. Athlete Pro Mobile Portal:  http://localhost:5000");
console.log("3. Core Backend REST API:      http://localhost:4000/api/v1");
console.log("4. AI Computer Vision Service: http://localhost:8000/api/v1/cv/health");
console.log("================================================================================");
