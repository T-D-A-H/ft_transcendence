import { httpEvent } from "./events.js";
import { greenish, redish } from "./ui.js";
import { userSocket } from "./websocket.js";
import type { MatchHistoryItem, UserStats } from "./vars.js";
import { showNotification } from "./main.js";
import { BASE_URL, MATCH_URL, GET, USER_URL, INFO_URL } from "./vars.js";

// --- DOM Selectors ---

// General Summary Box
const totalGamesEl = document.getElementById("stats_total_games") as HTMLSpanElement;
const winRateEl = document.getElementById("stats_win_rate") as HTMLSpanElement;
const streakEl = document.getElementById("stats_streak") as HTMLSpanElement;
const bestStreakEl = document.getElementById("stats_best_streak") as HTMLSpanElement;

// Game Modes Details Box
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

// --- Helper Functions ---

function formatPercent(value: number): string {
    if (!Number.isFinite(value)) return "0%";
    return `${Math.round(value)}%`;
}

export function getWinRate(stats: UserStats) {
    const winRate = stats.totalGames > 0 ? (stats.totalWins / stats.totalGames) * 100 : 0;
    return (formatPercent(winRate));
}

function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
    });
}

// --- Render Functions ---

/**
 * Renders the top-left "Player Summary" box
 */
export function renderSummary(stats: UserStats): void {
    let total_games = (stats.online_played + stats.tournaments_played);
    let total_wins = (stats.online_won + stats.tournaments_won);
    const winRate = total_games > 0 ? (total_wins / total_games) * 100 : 0;

    if (totalGamesEl) totalGamesEl.textContent = String(stats.totalGames);
    if (winRateEl) winRateEl.textContent = formatPercent(winRate);
    if (streakEl) streakEl.textContent = String(stats.currentWinStreak);
    if (bestStreakEl) bestStreakEl.textContent = String(stats.bestWinStreak);
}

/**
 * Renders the new "Game Modes Details" box
 */
export function renderModeBreakdown(stats: UserStats): void {
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
 */
export function renderWinLossChart(stats: UserStats): void {
    if (!winLossCanvas) return;
    const ctx = winLossCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, winLossCanvas.width, winLossCanvas.height);

    const padding = 10;
    const width = winLossCanvas.width - padding * 2;
    const height = winLossCanvas.height - padding;
    const baseLineY = padding + height;

    const categories = [
        { wins: stats.local_won || 0, losses: (stats.local_played - stats.local_won) || 0 },
        { wins: stats.online_won || 0, losses: (stats.online_played - stats.online_won) || 0 },
        { wins: stats.tournaments_won || 0, losses: (stats.tournaments_played - stats.tournaments_won) || 0 },
    ];

    const maxGames = Math.max(1, ...categories.map(c => c.wins + c.losses));
    const barWidth = width / categories.length - 20;

    categories.forEach((cat, index) => {
        const total = cat.wins + cat.losses;
        const x = padding + 10 + index * (barWidth + 20);

        const barCurrentHeight = (total / maxGames) * height;
        const winHeight = total > 0 ? (cat.wins / total) * barCurrentHeight : 0;
        const lossHeight = barCurrentHeight - winHeight;
        const startY = baseLineY - barCurrentHeight;

        ctx.fillStyle = greenish;
        ctx.fillRect(x, startY, barWidth, winHeight);

        ctx.fillStyle = redish;
        ctx.fillRect(x, startY + winHeight, barWidth, lossHeight);
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
        const row = document.createElement("div");
        row.className = "flex items-center justify-between gap-2 p-1 border-b border-[rgba(255,255,255,0.1)] last:border-0";

        const left = document.createElement("div");
        left.className = "flex flex-col min-w-0";

        const title = document.createElement("span");
        const resultColor = item.result === "win" ? "text-[#4ade80]" : "text-[#f87171]";
        title.className = `${resultColor} truncate`;
        title.textContent = `${item.result === "win" ? "WIN" : "LOSS"} vs ${item.opponent}`;

        const meta = document.createElement("span");
        meta.className = "opacity-60 text-[6px] truncate";
        meta.textContent = `${item.mode.toUpperCase()} · ${formatDate(item.timestamp)}`;

        left.appendChild(title);
        left.appendChild(meta);

        const right = document.createElement("span");
        right.className = "pong-font text-[8px] whitespace-nowrap";
        right.textContent = `${item.userScore} - ${item.opponentScore}`;

        row.appendChild(left);
        row.appendChild(right);
        historyList.appendChild(row);
    });
}

// --- Main UI Updates ---

export function updateStatsUI(stats: UserStats) {
    if (!stats) return;
    renderSummary(stats);
    renderModeBreakdown(stats);
    renderWinLossChart(stats);
}

export async function loadDashboard(): Promise<void> {
    if (!userSocket) {
        return;
    }

    try {
        // 1. Pedir Stats Generales (Perfil)
        const statsResponse = await httpEvent(GET, `/${BASE_URL}/${USER_URL}/me`);

        // 2. Pedir Historial de Partidas
        const historyResponse = await httpEvent(GET, `/${BASE_URL}/${MATCH_URL}/history`);

        // Procesar Stats
        if (statsResponse && statsResponse.status === 200 && statsResponse.target) {
            const info = statsResponse.target;
            if (info.stats) {
                updateStatsUI(info.stats); // Reutilizamos la función centralizada
            }
        }

        // Procesar Historial
        if (historyResponse && historyResponse.status === 200 && Array.isArray(historyResponse.target)) {
            renderHistory(historyResponse.target);
        } else {
            renderHistory([]);
        }

    } catch (err) {
        console.error("Error loading dashboard:", err);
    }
}

// --- Init & Observers ---

let needsRefresh = false;

export function initStatsDashboard(): void {
    // Cargar al inicio si hay sesión
    if (userSocket) {
        loadDashboard();
    }

    if (refreshButton) {
        refreshButton.onclick = () => {
            loadDashboard();
            needsRefresh = false;
        };
    }

    // Escuchar evento cuando termina una partida
    window.addEventListener("match-finished", () => {
        needsRefresh = true;
        const statsList = document.getElementById("stats_list");
        // Si ya está visible, actualizar inmediatamente
        if (statsList && !statsList.classList.contains("hidden")) {
            loadDashboard();
            needsRefresh = false;
        }
    });

    // Observador: recargar cuando se hace visible la pestaña "Stats"
    const statsList = document.getElementById("stats_list");
    if (statsList) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isVisible = !statsList.classList.contains("hidden");

                    if (isVisible) {
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