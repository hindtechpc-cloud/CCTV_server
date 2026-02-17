
import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { spawn } from "child_process";
import path from "path";
import YAML from "yaml";

const app = express();

/* ===============================
   CONFIG
================================= */

const PORT = 5000;
const MEDIAMTX_PATH = path.join(process.cwd(), "mediamtx");
const CONFIG_PATH = path.join(process.cwd(), "mediamtx.yml");

let mediaProcess = null;

/* ===============================
   MIDDLEWARE
================================= */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

/* ===============================
   START MEDIAMTX
================================= */

const startMediaMTX = () => {
  if (mediaProcess) mediaProcess.kill();

  mediaProcess = spawn(MEDIAMTX_PATH, [CONFIG_PATH]);

  mediaProcess.stdout.on("data", (data) => {
    console.log(`[MediaMTX] ${data.toString()}`);
  });

  mediaProcess.stderr.on("data", (data) => {
    console.error(`[MediaMTX ERROR] ${data.toString()}`);
  });

  mediaProcess.on("error", (err) => {
    console.error("Failed to start MediaMTX:", err);
  });

  mediaProcess.on("close", (code) => {
    console.log(`MediaMTX exited with code ${code}`);
  });
};

/* ===============================
   STREAM READER
================================= */

const getAllStreams = () => {
  const file = readFileSync(CONFIG_PATH, "utf8");
  const parsed = YAML.parse(file);

  if (!parsed.paths) return [];

  // Use standard HTTPS domain without port
  return Object.keys(parsed.paths).map((pathName) => ({
    name: pathName,
    hlsUrl: `https://api.productware.in/${pathName}/index.m3u8`,
  }));
};

/* ===============================
   ROUTES
================================= */

// Change route to /streams to match Nginx proxy
app.get("/streams", (req, res) => {
  try {
    const streams = getAllStreams();
    res.json({ streams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to read streams" });
  }
});

/* ===============================
   START SERVER
================================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  startMediaMTX();
});

/* ===============================
   GRACEFUL SHUTDOWN
================================= */

process.on("SIGINT", () => {
  if (mediaProcess) mediaProcess.kill();
  process.exit();
});




