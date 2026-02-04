import { oneTimeEvent } from "./events.js";
import { showNotification, greenish, redish, blackish } from "./ui.js";
import { userSocket } from "./websocket.js";
import type { MatchHistoryItem, UserStats } from "./vars.js";

const totalGamesEl = document.getElementById(
  "stats_total_games",
) as HTMLSpanElement;
const winRateEl = document.getElementById("stats_win_rate") as HTMLSpanElement;
const streakEl = document.getElementById("stats_streak") as HTMLSpanElement;
const bestStreakEl = document.getElementById(
  "stats_best_streak",
) as HTMLSpanElement;
const tournamentsEl = document.getElementById(
  "stats_tournaments",
) as HTMLSpanElement;
const tournamentsWonEl = document.getElementById(
  "stats_tournaments_won",
) as HTMLSpanElement;
const winLossCanvas = document.getElementById(
  "stats_winloss_chart",
) as HTMLCanvasElement;
const scoreCanvas = document.getElementById(
  "stats_score_chart",
) as HTMLCanvasElement;
const historyList = document.getElementById(
  "stats_history_list",
) as HTMLDivElement;
const refreshButton = document.getElementById(
  "stats_refresh_button",
) as HTMLButtonElement;

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
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function renderSummary(stats: UserStats): void {
  const winRate =
    stats.totalGames > 0 ? (stats.totalWins / stats.totalGames) * 100 : 0;
  totalGamesEl.textContent = String(stats.totalGames);
  winRateEl.textContent = formatPercent(winRate);
  streakEl.textContent = String(stats.currentWinStreak);
  bestStreakEl.textContent = String(stats.bestWinStreak);
  tournamentsEl.textContent = String(stats.tournamentsPlayed);
  tournamentsWonEl.textContent = String(stats.tournamentsWon);
}

function renderWinLossChart(stats: UserStats): void {
  const ctx = winLossCanvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, winLossCanvas.width, winLossCanvas.height);

  const padding = 18;
  const width = winLossCanvas.width - padding * 2;
  const height = winLossCanvas.height - padding * 2;
  const categories = [
    { label: "Local", wins: stats.localWins, losses: stats.localLosses },
    { label: "Online", wins: stats.onlineWins, losses: stats.onlineLosses },
    {
      label: "Tournament",
      wins: stats.tournamentWins,
      losses: stats.tournamentLosses,
    },
  ];
  const maxGames = Math.max(
    1,
    ...categories.map((cat) => cat.wins + cat.losses),
  );
  const barWidth = width / categories.length - 12;

  ctx.font = "8px 'PressStart2P', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  categories.forEach((cat, index) => {
    const total = cat.wins + cat.losses;
    const x = padding + index * (barWidth + 12);
    const barHeight = (total / maxGames) * height;
    const winHeight = total > 0 ? (cat.wins / total) * barHeight : 0;
    const lossHeight = barHeight - winHeight;

    ctx.fillStyle = greenish;
    ctx.fillRect(x, padding + (height - winHeight), barWidth, winHeight);
    ctx.fillStyle = redish;
    ctx.fillRect(
      x,
      padding + (height - winHeight - lossHeight),
      barWidth,
      lossHeight,
    );

    ctx.fillStyle = blackish;
    ctx.fillText(cat.label, x + barWidth / 2, padding + height + 2);
  });
}

function renderHistory(history: MatchHistoryItem[]): void {
  historyList.innerHTML = "";
  if (history.length === 0) {
    historyList.textContent = "No matches recorded.";
    return;
  }

  history.forEach((item) => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between gap-2";

    const left = document.createElement("div");
    left.className = "flex flex-col";
    const title = document.createElement("span");
    title.textContent = `${item.result === "win" ? "Win" : "Loss"} vs ${item.opponent}`;
    const meta = document.createElement("span");
    meta.className = "opacity-70";
    meta.textContent = `${item.mode.toUpperCase()} · ${formatDate(item.timestamp)}`;
    left.appendChild(title);
    left.appendChild(meta);

    const right = document.createElement("span");
    right.className = "pong-font";
    right.textContent = `${item.userScore}-${item.opponentScore}`;

    row.appendChild(left);
    row.appendChild(right);
    historyList.appendChild(row);
  });
}

function renderEmptyState(): void {
  totalGamesEl.textContent = "0";
  winRateEl.textContent = "0%";
  streakEl.textContent = "0";
  bestStreakEl.textContent = "0";
  tournamentsEl.textContent = "0";
  tournamentsWonEl.textContent = "0";
  clearCanvas(winLossCanvas);
  clearCanvas(scoreCanvas);
  historyList.textContent = "No matches recorded.";
}

export async function loadDashboard(): Promise<void> {
  if (!userSocket) {
    renderEmptyState();
    showNotification("You must sign in to view statistics.");
    return;
  }

  const [statsResult, historyResult] = await Promise.all([
    oneTimeEvent("STATS_REQUEST", "STATS_RESPONSE"),
    oneTimeEvent("MATCH_HISTORY_REQUEST", "MATCH_HISTORY_RESPONSE", "20"),
  ]);

  const stats = statsResult?.target as UserStats | null;
  const history =
    (historyResult?.target as unknown as MatchHistoryItem[]) || [];

  if (!statsResult || statsResult.status !== 200 || !stats) {
    renderEmptyState();
    showNotification("Could not load your statistics.");
    return;
  }

  renderSummary(stats);
  renderWinLossChart(stats);
  renderHistory(history);
}

export function initStatsDashboard(): void {
  if (!refreshButton) return;
  refreshButton.onclick = () => {
    loadDashboard();
  };
}
