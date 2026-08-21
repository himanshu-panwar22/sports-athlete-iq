const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log("================================================================================");
  console.log(`  SCOUT & INSTITUTIONAL DISCOVERY WEB PORTAL RUNNING ON PORT ${PORT}`);
  console.log(`  Access URL: http://localhost:${PORT}`);
  console.log("================================================================================");
});
