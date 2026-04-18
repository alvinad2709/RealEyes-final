/**
 * Auto Cam Monitor
 * Automatically finds the largest <video> element on the page,
 * locks onto its bounding box, records 15s of tab video,
 * sends it to the backend for deepfake analysis,
 * then repeats every 60 seconds until stopped.
 */

import {
  showPanel,
  updatePanelCountdown,
  updatePanelRecording,
  updatePanelResult,
  updatePanelError,
} from "./floatingPanel";
import type { AnalysisResult } from "../shared/types";

const RECORD_DURATION = 15;
const CYCLE_INTERVAL = 60_000; // 60 seconds between scans
const BADGE_ID = "dg-cam-badge";

let monitoring = false;
let cycleTimer: ReturnType<typeof setTimeout> | null = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;
let badge: HTMLElement | null = null;

// ── Listen for results from service worker ───────────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "VIDEO_CAPTURE_RESULT" && monitoring) {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    if (message.success && message.result) {
      updatePanelResult(message.result as AnalysisResult);
    } else {
      updatePanelError(
        message.error || "Cam monitor capture failed."
      );
    }

    // Schedule next cycle
    if (monitoring) {
      updateBadge("next");
      cycleTimer = setTimeout(() => {
        if (monitoring) runScanCycle();
      }, CYCLE_INTERVAL);
    }
  }
});

// ── Public API ───────────────────────────────────────────────────────────────
export function startCamMonitor() {
  if (monitoring) return; // Already running
  monitoring = true;
  createBadge();
  runScanCycle();
}

export function stopCamMonitor() {
  monitoring = false;
  if (cycleTimer) {
    clearTimeout(cycleTimer);
    cycleTimer = null;
  }
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  removeBadge();
}

// ── Core Scan Cycle ──────────────────────────────────────────────────────────
function runScanCycle() {
  if (!monitoring) return;

  const video = findLargestVideo();
  if (!video) {
    updateBadge("no-video");
    // Retry in 10 seconds
    cycleTimer = setTimeout(() => {
      if (monitoring) runScanCycle();
    }, 10_000);
    return;
  }

  // Get the video's exact bounding box relative to the viewport
  const rect = video.getBoundingClientRect();
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  const bbox = {
    x: Math.max(0, rect.left / vw),
    y: Math.max(0, rect.top / vh),
    w: Math.min(1, rect.width / vw),
    h: Math.min(1, rect.height / vh),
  };

  // Position the analysis panel beside the video
  showPanel(null, {
    x: Math.min(rect.right + 12, window.innerWidth - 340),
    y: Math.max(rect.top, 10),
  });

  updateBadge("scanning");

  // Quick 3s countdown then record
  let count = 3;
  updatePanelCountdown(count);

  const countdownInterval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(countdownInterval);
      beginCamRecording(bbox);
    } else {
      updatePanelCountdown(count);
    }
  }, 1000);
}

function beginCamRecording(bbox: object) {
  updatePanelRecording(0, RECORD_DURATION);

  let elapsed = 0;
  progressInterval = setInterval(() => {
    elapsed++;
    updatePanelRecording(elapsed, RECORD_DURATION);
  }, 1000);

  chrome.runtime.sendMessage(
    { type: "START_TAB_VIDEO_CAPTURE", payload: { duration: RECORD_DURATION, bbox } },
    () => {
      if (chrome.runtime.lastError) { /* expected, ignore */ }
    }
  );
}

// ── Find Largest Video ───────────────────────────────────────────────────────
function findLargestVideo(): HTMLVideoElement | null {
  const videos = Array.from(document.querySelectorAll("video"));
  if (videos.length === 0) return null;

  // Sort by visible area (width * height), pick the largest
  let best: HTMLVideoElement | null = null;
  let bestArea = 0;

  for (const v of videos) {
    const rect = v.getBoundingClientRect();
    const area = rect.width * rect.height;
    // Must be visible and reasonably sized
    if (area > bestArea && rect.width > 50 && rect.height > 50 && !v.paused) {
      bestArea = area;
      best = v;
    }
  }

  // Fallback: if no playing video, pick largest even if paused
  if (!best) {
    for (const v of videos) {
      const rect = v.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area > bestArea && rect.width > 50 && rect.height > 50) {
        bestArea = area;
        best = v;
      }
    }
  }

  return best;
}

// ── Floating Badge (persistent indicator) ────────────────────────────────────
function createBadge() {
  removeBadge();
  badge = document.createElement("div");
  badge.id = BADGE_ID;
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2147483647;
    background: linear-gradient(135deg, #2A7EFB, #1a5dc7);
    color: white;
    padding: 10px 18px;
    border-radius: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 4px 24px rgba(42,126,251,0.5);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
  `;
  badge.title = "Click to stop monitoring";
  badge.addEventListener("click", () => {
    stopCamMonitor();
  });
  updateBadge("scanning");
  document.body.appendChild(badge);
}

function updateBadge(state: "scanning" | "next" | "no-video") {
  if (!badge) return;

  const icons: Record<string, string> = {
    scanning: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="white"/></svg>`,
    next: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
    "no-video": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  };

  const labels: Record<string, string> = {
    scanning: "🔴 Cam Monitor Active — Scanning...",
    next: "⏳ Next scan in 60s — Click to stop",
    "no-video": "⚠ No video found — Retrying...",
  };

  badge.innerHTML = `${icons[state]} ${labels[state]}`;
}

function removeBadge() {
  document.getElementById(BADGE_ID)?.remove();
  badge = null;
}
