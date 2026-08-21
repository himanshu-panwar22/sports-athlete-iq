require("dotenv").config();
const path = require("path");

module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret_key_sih_2026_sports_talent_discovery",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://sih_admin:sih_secure_password_2026@localhost:5432/sports_talent_db",
  USE_LOCAL_STORAGE_FALLBACK: process.env.USE_LOCAL_STORAGE_FALLBACK !== "false",
  LOCAL_STORAGE_DIR: path.resolve(process.cwd(), process.env.LOCAL_STORAGE_DIR || "./uploads"),
  
  S3: {
    ENDPOINT: process.env.S3_ENDPOINT || "http://localhost:9000",
    ACCESS_KEY: process.env.S3_ACCESS_KEY || "minio_admin",
    SECRET_KEY: process.env.S3_SECRET_KEY || "minio_secure_password_2026",
    BUCKET: process.env.S3_BUCKET || "sports-talent-videos",
    REGION: process.env.S3_REGION || "ap-south-1"
  },
  
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:8000"
};
