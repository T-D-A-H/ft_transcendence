export interface TournamentInfo {
  id: number;
  creator: string;
  max_size: number;
  current_size: number;
  full: boolean;
}

export type MatchMode = "local" | "online" | "tournament";

export interface UserStats {
  userId: string;
  username: string;
  displayName: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  currentWinStreak: number;
  bestWinStreak: number;
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