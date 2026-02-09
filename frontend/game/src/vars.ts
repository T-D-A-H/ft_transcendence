export interface TournamentInfo {
  id: number;
  creator: string;
  max_size: number;
  current_size: number;
  full: boolean;
}

export type MatchMode = "local" | "online" | "tournament";

// FUSIÓN: Contiene los datos del sistema antiguo (snake_case) 
// y los del nuevo dashboard (camelCase + streaks)
export interface UserStats {
  // Identificación
  userId: string;
  username: string;
  displayName: string;

  // Totales (Dashboard General)
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  
  // Rachas y Puntos (Dashboard General)
  currentWinStreak: number;
  bestWinStreak: number;
  pointsFor: number;
  pointsAgainst: number;
  lastMatchAt: number | null;

  // Desglose Legacy (Source B - snake_case)
  // Mantengo estos para que funcionen con los IDs 'stat_local_played', etc.
  local_played: number;
  local_won: number;
  online_played: number;
  online_won: number;
  tournaments_played: number;
  tournaments_won: number;

  // Desglose Moderno (Source A - camelCase)
  // Opcionales por si el backend solo envía un formato, 
  // pero útiles si el dashboard nuevo espera estos nombres.
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

// FUSIÓN: Añadidos UserStats y MatchHistoryItem[] al target
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

export interface SendInviteResponse {
  type: "SEND_INVITE_RESPONSE";
  status: number;
  msg: string;
  target: string;
}

export interface ReplyInviteResponse {
  type: "REPLY_INVITE_RESPONSE";
  status: number;
  msg: string;
  target: string;
}

export interface PlayLocallyResponse {
  type: "PLAY_LOCALLY_RESPONSE";
  status: number;
  msg: string;
  target: string;
}

export interface StartMatchResponse {
  type: "START_MATCH_RESPONSE";
  status: number;
  msg: string;
  target: string;
}

export interface ExitMatchResponse {
  type: "EXIT_MATCH_RESPONSE";
  status: number;
  msg: string;
  target: string;
}

export interface InfoResponse {
  type: "INFO_RESPONSE";
  status: number;
  msg: string;
  target: ProfileInfo;
}

export interface IncomingInviteRequest {
  type: "INCOMING_INVITE_REQUEST";
  msg: string;
  target: string;
}

export interface DrawMessage {
  type: "DRAW";
  LeftXY: [number, number];
  RightXY: [number, number];
  BallXY: [number, number];
}

export interface ScoresMessage {
  type: "SCORES";
  scores: [number, number];
}

export interface IncomingNotification {
  type: "NOTIFICATION";
  status: number;
  msg: string;
}

export interface IncomingMatchReady {
  type: "MATCH_READY";
  status: number;
  msg: string;
  target: string;
}

export interface WinMessage {
  type: "WIN";
  msg: string;
}

export interface MirrorCanvasMessage {
  type: "MIRROR";
  msg: string;
}

export interface CreateTournamentRequest {
  type: "CREATE_TOURNAMENT_RESPONSE";
  status: number;
  msg: string;
  target?: null;
}

export interface SearchTournamentRequest {
  type: "SEARCH_TOURNAMENT_RESPONSE";
  status: number;
  msg: string;
  target: TournamentInfo[] | null;
}

export interface JoinTournamentRequest {
  type: "JOIN_TOURNAMENT_RESPONSE";
  status: number;
  msg: string;
  target?: null;
}

export interface PendingRequest {
  type: "GET_PENDING_RESPONSE";
  status: number;
  msg: string;
  target: ProfileInfo[] | null;
}

// NUEVO: Respuesta para estadísticas detalladas
export interface StatsResponse {
  type: "STATS_RESPONSE";
  status: number;
  msg: string;
  target: UserStats | null;
}

// NUEVO: Respuesta para historial de partidas
export interface MatchHistoryResponse {
  type: "MATCH_HISTORY_RESPONSE";
  status: number;
  msg: string;
  target: MatchHistoryItem[];
}

export type ServerMessage =
  | SendInviteResponse
  | ReplyInviteResponse
  | IncomingInviteRequest
  | StartMatchResponse
  | PlayLocallyResponse
  | ScoresMessage
  | DrawMessage
  | IncomingNotification
  | WinMessage
  | MirrorCanvasMessage
  | CreateTournamentRequest
  | SearchTournamentRequest
  | JoinTournamentRequest
  | ExitMatchResponse
  | InfoResponse
  | PendingRequest
  | IncomingMatchReady
  | StatsResponse
  | MatchHistoryResponse;