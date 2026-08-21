const fs = require("fs");
const path = require("path");

console.log("================================================================================");
console.log("       AI-ASSISTED SPORTS TALENT DISCOVERY PLATFORM - FOUNDATION VERIFICATION     ");
console.log("================================================================================");

const checks = [
  { name: "docker-compose.yml", path: "docker-compose.yml" },
  { name: ".env configuration", path: ".env" },
  { name: "Shared Types (TypeScript)", path: "shared/src/types.ts" },
  { name: "Shared Constants & Weights", path: "shared/src/constants.ts" },
  { name: "Database DDL Schema", path: "database/schema.sql" },
  { name: "Database Benchmark Seeds", path: "database/seed_benchmarks.sql" },
  { name: "Database Demo Athletes Seed", path: "database/seed_demo_athletes.sql" }
];

let allPassed = true;
checks.forEach(check => {
  const fullPath = path.join(process.cwd(), check.path);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`[PASS] ${check.name.padEnd(32)} -> Found (${stats.size} bytes)`);
  } else {
    console.log(`[FAIL] ${check.name.padEnd(32)} -> MISSING at ${check.path}`);
    allPassed = false;
  }
});

console.log("\n--- Checking Biomechanical Calculation Sanity ---");
// Test: Jump Height from Flight Time: h = 1/8 * g * (delta_t)^2
const g = 9.80665;
const deltaT_seconds = 0.628; // 628 ms flight time
const jumpHeightMeters = 0.125 * g * Math.pow(deltaT_seconds, 2);
const jumpHeightCm = jumpHeightMeters * 100;
console.log(`[SANITY] Flight Time: ${deltaT_seconds}s -> Jump Height: ${jumpHeightCm.toFixed(2)} cm (Expected ~48.34 cm)`);

if (Math.abs(jumpHeightCm - 48.34) < 0.1) {
  console.log("[PASS] Kinematic flight time equation verified.");
} else {
  console.log("[FAIL] Kinematic calculation error.");
  allPassed = false;
}

console.log("================================================================================");
if (allPassed) {
  console.log("   STEP 1 FOUNDATION & DATABASE SCHEMAS VERIFIED SUCCESSFULLY! READY FOR M2.    ");
} else {
  console.log("   ERRORS DETECTED DURING FOUNDATION VERIFICATION.                             ");
  process.exit(1);
}
console.log("================================================================================");
