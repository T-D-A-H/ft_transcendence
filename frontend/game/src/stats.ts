import { oneTimeEvent } from "./events.js";
import { showNotification, greenish, redish, blackish } from "./ui.js";
import { userSocket } from "./websocket.js";
import type { MatchHistoryItem, UserStats } from "./vars.js";

// --- DOM Selectors (Matches new HTML) ---

// General Summary Box
const totalGamesEl = document.getElementById("stats_total_games") as HTMLSpanElement;
const winRateEl = document.getElementById("stats_win_rate") as HTMLSpanElement;
const streakEl = document.getElementById("stats_streak") as HTMLSpanElement;
const bestStreakEl = document.getElementById("stats_best_streak") as HTMLSpanElement;

// Game Modes Details Box (New)
const localPlayedEl = document.getElementById("stat_local_played") as HTMLSpanElement;
const localWonEl = document.getElementById("stat_local_won") as HTMLSpanElement;
const onlinePlayedEl = document.getElementById("stat_online_played") as HTMLSpanElement;
const onlineWonEl = document.getElementById("stat_online_won") as HTMLSpanElement;
const tournPlayedEl = document.getElementById("stat_tournaments_played") as HTMLSpanElement;
const tournWonEl = document.getElementById("stat_tournaments_won") as HTMLSpanElement;

// Charts & History
const winLossCanvas = document.getElementById("stats_winloss_chart") as HTMLCanvasElement;
const historyList = document.getElementById("stats_history_list") as HTMLDivElement;
const refreshButton = document.getElementById("stats_refresh_button") as HTMLButtonElement;

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Optional: draw empty placeholder state
}

/**
 * Renders the top-left "Player Summary" box
 */
function renderSummary(stats: UserStats): void {
  const winRate = stats.totalGames > 0 ? (stats.totalWins / stats.totalGames) * 100 : 0;
  
  if (totalGamesEl) totalGamesEl.textContent = String(stats.totalGames);
  if (winRateEl) winRateEl.textContent = formatPercent(winRate);
  if (streakEl) streakEl.textContent = String(stats.currentWinStreak);
  if (bestStreakEl) bestStreakEl.textContent = String(stats.bestWinStreak);
}

/**
 * Renders the new "Game Modes Details" box using the snake_case vars from vars.ts
 */
function renderModeBreakdown(stats: UserStats): void {
  // Local
  if (localPlayedEl) localPlayedEl.textContent = String(stats.local_played);
  if (localWonEl) localWonEl.textContent = String(stats.local_won);

  // Online
  if (onlinePlayedEl) onlinePlayedEl.textContent = String(stats.online_played);
  if (onlineWonEl) onlineWonEl.textContent = String(stats.online_won);

  // Tournament
  if (tournPlayedEl) tournPlayedEl.textContent = String(stats.tournaments_played);
  if (tournWonEl) tournWonEl.textContent = String(stats.tournaments_won);
}

/**
 * Renders the Win/Loss Chart
 * Calculates losses based on Played - Won since vars.ts only guarantees those two.
 */
function renderWinLossChart(stats: UserStats): void {
  if (!winLossCanvas) return;
  const ctx = winLossCanvas.getContext("2d");
  if (!ctx) return;
  
  ctx.clearRect(0, 0, winLossCanvas.width, winLossCanvas.height);

  const padding = 12;
  const width = winLossCanvas.width - padding * 2;
  const height = winLossCanvas.height - padding * 2;

  // Calculate stats (fallback to 0 if undefined)
  const locPlayed = stats.local_played || 0;
  const locWon = stats.local_won || 0;
  const locLost = locPlayed - locWon;

  const onlPlayed = stats.online_played || 0;
  const onlWon = stats.online_won || 0;
  const onlLost = onlPlayed - onlWon;

  const trnPlayed = stats.tournaments_played || 0;
  const trnWon = stats.tournaments_won || 0;
  const trnLost = trnPlayed - trnWon;

  const categories = [
    { label: "Local", wins: locWon, losses: locLost },
    { label: "Online", wins: onlWon, losses: onlLost },
    { label: "Tourn", wins: trnWon, losses: trnLost },
  ];

  const maxGames = Math.max(1, ...categories.map((cat) => cat.wins + cat.losses));
  // Adjust bar width based on canvas size (320px wide)
  const barWidth = width / categories.length - 20; 

  ctx.font = "8px 'PressStart2P', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  categories.forEach((cat, index) => {
    const total = cat.wins + cat.losses;
    // Distribute bars evenly
    const x = padding + 10 + index * (barWidth + 20);
    
    // Height calculation
    const barMaxHeight = height - 15; // Leave space for text at bottom
    const barCurrentHeight = (total / maxGames) * barMaxHeight;
    
    const winHeight = total > 0 ? (cat.wins / total) * barCurrentHeight : 0;
    const lossHeight = barCurrentHeight - winHeight;

    // Draw Wins (Green) - Top part of the stack
    ctx.fillStyle = greenish;
    // Y position is: TopPadding + (TotalHeightAvailable - ActualHeight) + (EmptySpaceAboveBar)
    const startY = padding + (barMaxHeight - barCurrentHeight);
    
    ctx.fillRect(x, startY, barWidth, winHeight);

    // Draw Losses (Red) - Bottom part of the stack
    ctx.fillStyle = redish;
    ctx.fillRect(x, startY + winHeight, barWidth, lossHeight);

    // Draw Label
    ctx.fillStyle = blackish; // Or white depending on theme, using imported var
    // To make text visible on dark background if blackish is dark:
    ctx.fillStyle = "#c7f6ff"; // forcing pong-white for text visibility on canvas
    ctx.fillText(cat.label, x + barWidth / 2, padding + barMaxHeight + 4);
  });
}

function renderHistory(history: MatchHistoryItem[]): void {
  if (!historyList) return;
  
  historyList.innerHTML = "";
  if (!history || history.length === 0) {
    historyList.innerHTML = `<div class="p-2 opacity-50 text-center">No matches recorded.</div>`;
    return;
  }

  history.forEach((item) => {
    // Container row
    const row = document.createElement("div");
    row.className = "flex items-center justify-between gap-2 p-1 border-b border-[rgba(255,255,255,0.1)] last:border-0";

    // Left side (Result + Meta)
    const left = document.createElement("div");
    left.className = "flex flex-col min-w-0"; // min-w-0 for truncation logic
    
    const title = document.createElement("span");
    // Colorize Win/Loss
    const resultColor = item.result === "win" ? "text-[#4ade80]" : "text-[#f87171]";
    title.className = `${resultColor} truncate`;
    title.textContent = `${item.result === "win" ? "WIN" : "LOSS"} vs ${item.opponent}`;
    
    const meta = document.createElement("span");
    meta.className = "opacity-60 text-[6px] truncate";
    meta.textContent = `${item.mode.toUpperCase()} · ${formatDate(item.timestamp)}`;
    
    left.appendChild(title);
    left.appendChild(meta);

    // Right side (Score)
    const right = document.createElement("span");
    right.className = "pong-font text-[8px] whitespace-nowrap";
    right.textContent = `${item.userScore} - ${item.opponentScore}`;

    row.appendChild(left);
    row.appendChild(right);
    historyList.appendChild(row);
  });
}

function renderEmptyState(): void {
  if(totalGamesEl) totalGamesEl.textContent = "0";
  if(winRateEl) winRateEl.textContent = "0%";
  if(streakEl) streakEl.textContent = "0";
  if(bestStreakEl) bestStreakEl.textContent = "0";
  
  // Empty Breakdown
  [localPlayedEl, localWonEl, onlinePlayedEl, onlineWonEl, tournPlayedEl, tournWonEl].forEach(el => {
    if(el) el.textContent = "0";
  });

  if(winLossCanvas) clearCanvas(winLossCanvas);
  if(historyList) historyList.textContent = "No matches recorded.";
}

export async function loadDashboard(): Promise<void> {
  
  if (!userSocket) {
    console.warn("❌ No WebSocket, showing empty state");
    renderEmptyState();
    showNotification("You must sign in to view statistics.");
    return;
  }


  const [statsResult, historyResult] = await Promise.all([
    oneTimeEvent("STATS_REQUEST", "STATS_RESPONSE"),
    oneTimeEvent("MATCH_HISTORY_REQUEST", "MATCH_HISTORY_RESPONSE", "20"),
  ]);


  const stats = statsResult?.target as UserStats | null;
  const history = (historyResult?.target as unknown as MatchHistoryItem[]) || [];

  if (!statsResult || statsResult.status !== 200 || !stats) {
    console.warn("❌ Invalid stats response");
    renderEmptyState();
    showNotification("Could not load your statistics.");
    return;
  }
  renderSummary(stats);
  renderModeBreakdown(stats);
  renderWinLossChart(stats);
  renderHistory(history);
}

let needsRefresh = false;


export function initStatsDashboard(): void {
  if (refreshButton) {
    refreshButton.onclick = () => {
      loadDashboard();
      needsRefresh = false;
    };
  }

  window.addEventListener("match-finished", () => {
    needsRefresh = true;
    
    const statsList = document.getElementById("stats_list");
    if (statsList && !statsList.classList.contains("hidden")) {
      loadDashboard();
      needsRefresh = false;
    }
  });
  
  const statsList = document.getElementById("stats_list");
  if (statsList) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isVisible = !statsList.classList.contains("hidden");
    
          if (isVisible && needsRefresh) {
            loadDashboard();
            needsRefresh = false;
          }
        }
      });
    });
    
    observer.observe(statsList, { 
      attributes: true,
      attributeFilter: ['class']
    });
  }
}