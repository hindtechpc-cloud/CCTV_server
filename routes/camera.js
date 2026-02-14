import express from "express";

const router = express.Router();

// Test camera RTSP -> MediaMTX static path
// For testing, we just give the frontend the MediaMTX URL
router.get("/test", (req, res) => {
  // Change 'testcam' according to your mediamtx.yml path
  const streamUrl = "http://localhost:8889/testcam";
  res.json({ streamUrl });
});

export default router;
