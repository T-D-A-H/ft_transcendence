
export const POST: string = "POST";

export const GET: string = "GET";

export const BASE_URL: string = "api";

export const MATCH_URL: string = "matches";

export const TOURNAMENT_URL: string = "tournaments";

export const USER_URL: string = "users";

export const INVITE_URL: string = "invite";

export const RESPOND_URL: string = "respond";

export const START_URL: string = "start";

export const EXIT_URL: string = "exit";

export const JOIN_URL: string = "join";

export const REQUESTS_URL: string = "requests";

export const INFO_URL: string = "info";

export let currentMatchId: string;


export function setCurrentMatchId(id: string): void {
    currentMatchId = id;
}

export function getCurrentMatchId(): string {
    return currentMatchId;
}

export let currentTournamentId: string;


export function setCurrentTournamentId(id: string): void {
    currentTournamentId = id;
}

export function getCurrentTournamentId(): string {
    return currentTournamentId;
}

export let currentOpponentId: string;


export function setCurrentOpponentId(id: string): void {
    currentOpponentId = id;
}

export function getCurrentOpponentId(): string {
    return currentOpponentId;
}


export let SCORES: number[] = [0, 0];


export function setSCORES(scoreA: number, scoreB: number) {

	SCORES[0] = scoreA;
    SCORES[1] = scoreB;
}

export function getSCORES() {

	return (SCORES);
}

export let INVITE_FROM: string | null;

export function setInviteFrom(target: string | null) {
	INVITE_FROM = target;
}

export function getInviteFrom(): string | null{
	return (INVITE_FROM);
}

let displaySide: string = "right";


export function getDisplaySide(): string {
	return (displaySide);
}

export function setDisplaySide(side: string): void {

	displaySide = side;
}

type MatchMode = "single" | "dual";

export let matchMode: MatchMode = "single";

export function setMatchMode(mode: string): void {
    matchMode = mode as MatchMode;
}

export function getMatchMode(): string {
    return (matchMode);
}

export let NOTIFICATION_TIME: number = 2500;


export enum GameType {
    NONE,
    TWO_PLAYER,
    AI,
    MATCH,
    TOURNAMENT
}

export let currentGameType: GameType = GameType.NONE;

export function setGameType(type: GameType): void {
    currentGameType = type;
}

export function getGameType(): GameType {
    return (currentGameType);
}

export enum GameStatus {
    NOT_IN_GAME,
    READY_TO_START,
    IN_GAME
}

export let currentGameStatus: GameStatus = GameStatus.NOT_IN_GAME;

export function setGameStatus(mode: GameStatus): void {
    currentGameStatus = mode;
}

export function getGameStatus(): GameStatus {
    return (currentGameStatus);
}


export interface TournamentInfo {
  id: number;
  creator: string;
  max_size: number;
  current_size: number;
  full: boolean;
}

// export type MatchMode = "local" | "online" | "tournament";

export interface UserStats {
  userId: string;
  username: string;
  displayName: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  currentWinStreak: number;
  bestWinStreak: number;
  winRate: string;
  pointsFor: number;
  pointsAgainst: number;
  lastMatchAt: number | null;
  local_played: number;
  local_won: number;
  online_played: number;
  online_won: number;
  tournaments_played: number;
  tournaments_won: number;
  localGames?: number;
  localWins?: number;
  localLosses?: number;
  onlineGames?: number;
  onlineWins?: number;
  onlineLosses?: number;
  tournamentGames?: number;
  tournamentWins?: number;
  tournamentLosses?: number;
}

export interface MatchHistoryItem {
  id: string;
  timestamp: number;
  durationMs: number;
  mode: MatchMode;
  opponent: string;
  userScore: number;
  opponentScore: number;
  result: "win" | "loss";
  tournamentId?: string | null;
}

export interface ProfileInfo {
  id: string;
  display_name: string;
  username: string;
  avatar?: string;
  stats: UserStats;
}

export interface StatusMsgTarget {
  status: number;
  msg: string;
  target?:
    | string
    | ProfileInfo[]
    | ProfileInfo
    | TournamentInfo[]
    | UserStats
    | MatchHistoryItem[]
    | null;
}

export interface StatsResponse {
  type: "STATS_RESPONSE";
  status: number;
  msg: string;
  target: UserStats | null;
}

export interface MatchHistoryResponse {
  type: "MATCH_HISTORY_RESPONSE";
  status: number;
  msg: string;
  target: MatchHistoryItem[];
}

// ✅ NUEVOS TIPOS AÑADIDOS
export interface PongMessage {
  type: "PONG";
}

export interface MatchSavedMessage {
  type: "MATCH_SAVED";
  status: number;
  msg: string;
}

// ✅ ACTUALIZADO: Añadidos PongMessage y MatchSavedMessage
export type ServerMessage =
  | PongMessage
  | MatchSavedMessage
  | StatsResponse
  | MatchHistoryResponse;