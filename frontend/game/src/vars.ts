
export interface TournamentInfo {
	id: number;
	creator: string;
	max_size: number;
	current_size: number;
    full: boolean;
}

export interface ProfileInfo {
    id: string;
	display_name: string;
    username: string;
}



export interface StatusMsgTarget {
    status: number; 
    msg: string; 
    target?: string | ProfileInfo[] | ProfileInfo | TournamentInfo[] | null;
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

export interface IncomingInviteResponse {
    type: "INCOMING_INVITE_RESPONSE";
    status: number;
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

export interface InitialVarsMessage {
    type: "VARS";
    PaddleWH: [number, number];
    BallWH: [number, number];
}

export interface WinMessage {
    type: "WIN"; 
    msg: string;
}

export interface NotificationMessage {
    type: "NOTIFICATION";
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




export type ServerMessage = 
SendInviteResponse         | ReplyInviteResponse      |
IncomingInviteRequest      | IncomingInviteResponse   |
StartMatchResponse         | PlayLocallyResponse      | 
ScoresMessage              | DrawMessage			  | 
InitialVarsMessage         | WinMessage               |
NotificationMessage        | CreateTournamentRequest  |
SearchTournamentRequest    | JoinTournamentRequest    |
ExitMatchResponse          | InfoResponse             |
PendingRequest;


