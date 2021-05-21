import * as dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/../../../.env` });

const config = {
  PRODUCTION: process.env.NODE_ENV === "production",
  MONGO_URL:
    (process.env.NODE_ENV
      ? process.env.MONGO_URL_PROD
      : process.env.MONGO_URL) || "",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "1y",
  PORT: Number(process.env.PORT) || 5000,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || "",
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || "",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT || "6379",
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "1205",
};

export default config;
