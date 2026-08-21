const app = require("./app");
const config = require("./config");

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log("================================================================================");
  console.log(`  AI-ASSISTED SPORTS TALENT DISCOVERY BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`  API Base URL: http://localhost:${PORT}/api/v1`);
  console.log("================================================================================");
});

module.exports = server;
