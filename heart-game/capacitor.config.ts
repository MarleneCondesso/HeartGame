import type { CapacitorConfig } from "@capacitor/cli";
import process from "node:process";

const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.valentinedays.heartgame",
  appName: "LoveCard",
  webDir: "dist",
  bundledWebRuntime: false,
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
        },
      }
    : {}),
};

export default config;

