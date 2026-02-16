// import express from "express";
// import cors from "cors";
// import { writeFileSync } from "fs";
// import { spawn } from "child_process";
// import path from "path";

// const app = express();
// app.use(cors());
// app.use(express.json());

// // const MEDIAMTX_PATH = path.join(process.cwd(), "mediamtx")
// const MEDIAMTX_PATH = "/usr/local/Cellar/mediamtx/1.16.1/bin/mediamtx";
// ; // MediaMTX binary
// const CONFIG_PATH = path.join(process.cwd(), "mediamtx.yml");

// let mediaProcess = null;

// // Function to create YAML config dynamically
// const createYAML = (rtspUrl) => {
//   const yaml = `
// paths:
//   usercam:
//     source: ${rtspUrl}
//   `;
//   writeFileSync(CONFIG_PATH, yaml, "utf8");
// };

// // Function to start MediaMTX
// const startMediaMTX = () => {
//   return new Promise((resolve, reject) => {
//     if (mediaProcess) {
//       mediaProcess.kill();
//     }

//     mediaProcess = spawn(MEDIAMTX_PATH, [CONFIG_PATH]);

//     mediaProcess.stdout.on("data", (data) => {
//       console.log(`[MediaMTX] ${data}`);
//       // First stdout data received → consider stream started
//       resolve(true);
//     });

//     mediaProcess.stderr.on("data", (data) => {
//       console.error(`[MediaMTX ERROR] ${data}`);
//     });

//     mediaProcess.on("exit", (code) => {
//       console.log(`[MediaMTX] exited with code ${code}`);
//     });
//   });
// };

// // API: submit RTSP URL
// app.post("/api/stream", async (req, res) => {
//   const { rtspUrl } = req.body;
//   if (!rtspUrl) return res.status(400).json({ message: "RTSP URL required" });

//   try {
//     createYAML(rtspUrl);

//     await startMediaMTX(); // wait until process emits first stdout
//     res.json({ message: "Stream started successfully!", streamUrl: "http://localhost:8889/usercam" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to start stream" });
//   }
// });

// // API: return iframe URL
// app.get("/api/stream", (req, res) => {
//   res.json({ streamUrl: "http://localhost:8889/usercam" });
// });

// app.listen(5000, () => console.log("Server running on port 5000"));

// with web rtc

// import express from "express";
// import cors from "cors";
// import { readFileSync } from "fs";
// import { spawn } from "child_process";
// import path from "path";
// import YAML from "yaml";

// const app = express();
// app.use(cors());
// app.use(express.json());

// const MEDIAMTX_PATH = "/usr/local/Cellar/mediamtx/1.16.1/bin/mediamtx";
// const CONFIG_PATH = path.join(process.cwd(), "mediamtx.yml");

// let mediaProcess = null;

// // Start MediaMTX
// const startMediaMTX = () => {
//   if (mediaProcess) mediaProcess.kill();

//   mediaProcess = spawn(MEDIAMTX_PATH, [CONFIG_PATH]);

//   mediaProcess.stdout.on("data", (data) => {
//     console.log(`[MediaMTX] ${data}`);
//   });

//   mediaProcess.stderr.on("data", (data) => {
//     console.error(`[MediaMTX ERROR] ${data}`);
//   });
// };

// // 🔥 NEW: Read all streams from YAML
// const getAllStreams = () => {
//   const file = readFileSync(CONFIG_PATH, "utf8");
//   const parsed = YAML.parse(file);

//   if (!parsed.paths) return [];

//   const streams = Object.keys(parsed.paths).map((pathName) => ({
//     name: pathName,
//     hlsUrl: `http://localhost:8888/${pathName}`,
//   }));

//   return streams;
// };

// // API: get all streams
// app.get("/api/streams", (req, res) => {
//   try {
//     const streams = getAllStreams();
//     res.json({ streams });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to read streams" });
//   }
// });

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
//   startMediaMTX();
// });

// import express from "express";
// import cors from "cors";
// import { readFileSync } from "fs";
// import { spawn } from "child_process";
// import path from "path";
// import YAML from "yaml";

// const app = express();
// app.use(cors());
// app.use(express.json());

// const MEDIAMTX_PATH = "/usr/local/Cellar/mediamtx/1.16.1/bin/mediamtx";
// const CONFIG_PATH = path.join(process.cwd(), "mediamtx.yml");

// let mediaProcess = null;

// // Start MediaMTX
// const startMediaMTX = () => {
//   if (mediaProcess) mediaProcess.kill();

//   mediaProcess = spawn(MEDIAMTX_PATH, [CONFIG_PATH]);

//   mediaProcess.stdout.on("data", (data) => {
//     console.log(`[MediaMTX] ${data}`);
//   });

//   mediaProcess.stderr.on("data", (data) => {
//     console.error(`[MediaMTX ERROR] ${data}`);
//   });
// };

// // Read all streams from YAML
// const getAllStreams = () => {
//   const file = readFileSync(CONFIG_PATH, "utf8");
//   const parsed = YAML.parse(file);

//   if (!parsed.paths) return [];

//   const streams = Object.keys(parsed.paths).map((pathName) => ({
//     name: pathName,
//     hlsUrl: `http://localhost:8888/${pathName}/index.m3u8`,
//   }));

//   return streams;
// };

// // API
// app.get("/api/streams", (req, res) => {
//   try {
//     const streams = getAllStreams();
//     res.json({ streams });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to read streams" });
//   }
// });

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
//   startMediaMTX();
// });
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
