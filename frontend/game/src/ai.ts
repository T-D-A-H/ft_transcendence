import {
  canvas,
  drawGame,
  getDisplaySide,
  getSCORES,
  hide,
  mirrorCanvas,
  setDisplaySide,
  setSCORES,
  show,
  showCanvas,
  showMenu,
  updateOpponentUI,
  exitMatchButton,
  startMatchButton,
  showNotification,
} from "./ui.js";

let aiDifficulty = 3; // Difficulty level from 1 (easiest) to 5 (hardest)
const aiErrorLevels = [0.35, 0.25, 0.18, 0.1, 0.04];

let aiModeActive = false;
let aiAnimationId: number | null = null;
let aiLastFrame = 0;
let aiNextDecisionAt = 0;

const aiPaddleWidth = 10;
const aiPaddleHeight = 60;
const aiBallSize = 10;
const aiLeftX = 10;
const aiRightX = 580;

let aiLeftY = 170;
let aiRightY = 170;

let aiBallX = 295;
let aiBallY = 195;
let aiBallVX = 220;
let aiBallVY = 140;

const aiPlayerSpeed = 320;
const aiOpponentSpeedSlow = 140;
let aiOpponentSpeed = aiOpponentSpeedSlow;

let aiLastHit: "player" | "ai" | null = null;
let aiTargetY: number | null = null;
let aiHasTarget = false;

const AI_SCORE_MAX = 5;

const aiPlayerKeys = { up: false, down: false };
const aiOpponentKeys = { up: false, down: false };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function reflectY(y: number, min: number, max: number): number {
  const span = max - min;
  if (span <= 0) return min;
  let v = (y - min) % (2 * span);
  if (v < 0) v += 2 * span;
  return v > span ? max - (v - span) : min + v;
}

function predictBallYAtX(
  snapshotX: number,
  snapshotY: number,
  snapshotVX: number,
  snapshotVY: number,
  targetX: number,
): number | null {
  const time = (targetX - snapshotX) / snapshotVX;
  if (time <= 0) return null;
  const rawY = snapshotY + snapshotVY * time;
  const top = 0;
  const bottom = canvas.height - aiBallSize;
  return reflectY(rawY, top, bottom);
}

function updateAiDecision(now: number): void {
  if (now < aiNextDecisionAt) return;

  aiNextDecisionAt = now + 1000;

  if (aiLastHit === "ai" || aiBallVX >= 0) {
    aiOpponentKeys.up = false;
    aiOpponentKeys.down = false;
    aiOpponentSpeed = 0;
    return;
  }

  const midX = canvas.width / 2;
  aiOpponentSpeed = aiBallX <= midX ? aiPlayerSpeed : aiOpponentSpeedSlow;

  const center = canvas.height / 2 - aiPaddleHeight / 2;
  const aimY = aiHasTarget && aiTargetY !== null ? aiTargetY : center;

  const errorPercent = aiErrorLevels[aiDifficulty - 1] ?? 0.18;
  const error = (Math.random() * 2 - 1) * aiPaddleHeight * errorPercent;
  const desired = clamp(aimY + error, 0, canvas.height - aiPaddleHeight);

  const deadZone = 6;

  aiOpponentKeys.up = aiLeftY > desired + deadZone;
  aiOpponentKeys.down = aiLeftY < desired - deadZone;
}

function resetAiBall(direction: 1 | -1): void {
  aiBallX = canvas.width / 2 - aiBallSize / 2;
  aiBallY = canvas.height / 2 - aiBallSize / 2;
  const speed = 240;
  const angle = (Math.random() * 0.6 - 0.3) * Math.PI;
  aiBallVX = Math.cos(angle) * speed * direction;
  aiBallVY = Math.sin(angle) * speed;
  aiLastHit = null;
  aiHasTarget = false;
  aiTargetY = null;
  aiOpponentSpeed = aiOpponentSpeedSlow;
}

function stepAiPhysics(dt: number): void {
  if (aiPlayerKeys.up) aiRightY -= aiPlayerSpeed * dt;
  if (aiPlayerKeys.down) aiRightY += aiPlayerSpeed * dt;

  if (aiOpponentKeys.up) aiLeftY -= aiOpponentSpeed * dt;
  if (aiOpponentKeys.down) aiLeftY += aiOpponentSpeed * dt;

  if (aiHasTarget && aiTargetY !== null) {
    if (aiOpponentKeys.up && aiLeftY <= aiTargetY) {
      aiLeftY = aiTargetY;
      aiOpponentKeys.up = false;
    }
    if (aiOpponentKeys.down && aiLeftY >= aiTargetY) {
      aiLeftY = aiTargetY;
      aiOpponentKeys.down = false;
    }
  }

  aiLeftY = clamp(aiLeftY, 0, canvas.height - aiPaddleHeight);
  aiRightY = clamp(aiRightY, 0, canvas.height - aiPaddleHeight);

  aiBallX += aiBallVX * dt;
  aiBallY += aiBallVY * dt;

  if (aiBallY <= 0) {
    aiBallY = 0;
    aiBallVY *= -1;
  }
  if (aiBallY >= canvas.height - aiBallSize) {
    aiBallY = canvas.height - aiBallSize;
    aiBallVY *= -1;
  }

  const leftHit =
    aiBallX <= aiLeftX + aiPaddleWidth &&
    aiBallX + aiBallSize >= aiLeftX &&
    aiBallY + aiBallSize >= aiLeftY &&
    aiBallY <= aiLeftY + aiPaddleHeight &&
    aiBallVX < 0;

  if (leftHit) {
    const impact =
      (aiBallY + aiBallSize / 2 - (aiLeftY + aiPaddleHeight / 2)) /
      (aiPaddleHeight / 2);
    const angle = impact * 0.6;
    const speed = Math.min(420, Math.hypot(aiBallVX, aiBallVY) + 12);
    aiBallVX = Math.cos(angle) * speed;
    aiBallVY = Math.sin(angle) * speed;
    aiBallX = aiLeftX + aiPaddleWidth + 1;
    aiLastHit = "ai";
    aiOpponentKeys.up = false;
    aiOpponentKeys.down = false;
    aiOpponentSpeed = 0;
    aiHasTarget = false;
    aiTargetY = null;
  }

  const rightHit =
    aiBallX + aiBallSize >= aiRightX &&
    aiBallX <= aiRightX + aiPaddleWidth &&
    aiBallY + aiBallSize >= aiRightY &&
    aiBallY <= aiRightY + aiPaddleHeight &&
    aiBallVX > 0;

  if (rightHit) {
    const impact =
      (aiBallY + aiBallSize / 2 - (aiRightY + aiPaddleHeight / 2)) /
      (aiPaddleHeight / 2);
    const angle = Math.PI - impact * 0.6;
    const speed = Math.min(420, Math.hypot(aiBallVX, aiBallVY) + 12);
    aiBallVX = Math.cos(angle) * speed;
    aiBallVY = Math.sin(angle) * speed;
    aiBallX = aiRightX - aiBallSize - 1;
    aiLastHit = "player";
    aiOpponentSpeed = aiOpponentSpeedSlow;
    const targetX = aiLeftX + aiPaddleWidth;
    const hitY = predictBallYAtX(aiBallX, aiBallY, aiBallVX, aiBallVY, targetX);
    if (hitY !== null) {
      aiTargetY = clamp(
        hitY - aiPaddleHeight / 2,
        0,
        canvas.height - aiPaddleHeight,
      );
      aiHasTarget = true;
    } else {
      aiTargetY = null;
      aiHasTarget = false;
    }
  }

  if (aiBallX + aiBallSize < 0) {
    const scores = getSCORES();
    setSCORES(scores[0], scores[1] + 1);
    resetAiBall(1);
    checkAiWin();
  }
  if (aiBallX > canvas.width) {
    const scores = getSCORES();
    setSCORES(scores[0] + 1, scores[1]);
    resetAiBall(-1);
    checkAiWin();
  }
}

function checkAiWin(): void {
  const [aiScore, playerScore] = getSCORES();
  if (aiScore >= AI_SCORE_MAX || playerScore >= AI_SCORE_MAX) {
    finishAiMatch(playerScore >= AI_SCORE_MAX ? "player" : "ai");
  }
}

async function saveAiMatch(
  playerScore: number,
  aiScore: number,
): Promise<void> {
  try {
    await fetch("/api/match-result", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scorePlayer: playerScore,
        scoreOpponent: aiScore,
        opponentId: null,
      }),
    });
  } catch {
    // ignore
  }
}

function finishAiMatch(winner: "player" | "ai"): void {
  const [aiScore, playerScore] = getSCORES();
  stopAiMode();
  hide(exitMatchButton);
  showNotification(
    winner === "player" ? "You won against AI!" : "AI won the match.",
  );
  saveAiMatch(playerScore, aiScore);
  setSCORES(0, 0);
}

function aiRenderFrame(now: number): void {
  if (!aiModeActive) return;

  if (!aiLastFrame) aiLastFrame = now;
  const dt = Math.min(0.032, (now - aiLastFrame) / 1000);
  aiLastFrame = now;

  updateAiDecision(now);
  stepAiPhysics(dt);

  drawGame(aiLeftX, aiLeftY, aiRightX, aiRightY, aiBallX, aiBallY);
  aiAnimationId = requestAnimationFrame(aiRenderFrame);
}

function onAiKeyDown(e: KeyboardEvent): void {
  if (!aiModeActive) return;
  if (e.key === "ArrowUp") {
    aiPlayerKeys.up = true;
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    aiPlayerKeys.down = true;
    e.preventDefault();
  }
}

function onAiKeyUp(e: KeyboardEvent): void {
  if (!aiModeActive) return;
  if (e.key === "ArrowUp") {
    aiPlayerKeys.up = false;
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    aiPlayerKeys.down = false;
    e.preventDefault();
  }
}

export function isAiModeActive(): boolean {
  return aiModeActive;
}

export function setAiDifficulty(level: number): void {
  aiDifficulty = Math.max(1, Math.min(5, Math.round(level)));
}

export function startAiMode(): void {
  aiModeActive = true;
  aiPlayerKeys.up = false;
  aiPlayerKeys.down = false;
  aiOpponentKeys.up = false;
  aiOpponentKeys.down = false;
  aiLeftY = 170;
  aiRightY = 170;
  aiLastFrame = 0;
  aiNextDecisionAt = 0;
  setSCORES(0, 0);
  updateOpponentUI("AI");

  resetAiBall(1);

  if (getDisplaySide() !== "right") {
    setDisplaySide("right");
    mirrorCanvas();
  }

  showCanvas();
  hide(startMatchButton);
  show(exitMatchButton);

  document.addEventListener("keydown", onAiKeyDown);
  document.addEventListener("keyup", onAiKeyUp);

  if (aiAnimationId !== null) cancelAnimationFrame(aiAnimationId);
  aiAnimationId = requestAnimationFrame(aiRenderFrame);
}

export function stopAiMode(): void {
  if (!aiModeActive) return;
  aiModeActive = false;
  if (aiAnimationId !== null) {
    cancelAnimationFrame(aiAnimationId);
    aiAnimationId = null;
  }
  document.removeEventListener("keydown", onAiKeyDown);
  document.removeEventListener("keyup", onAiKeyUp);
  showMenu();
}
