
export interface StatusMsgTarget {
    status: number; 
    msg: string; 
    target?: string;
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

export interface IncomingInviteRequest {
    type: "INCOMING_INVITE_REQUEST";
    msg: string;
    target: string;
}

export interface IncomingInviteResponse {
    type: "INCOMING_INVITE_RESPONSE";
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

export interface DisconnectMsg {
    type: "DISCONNECT";
    msg: string;
}

export type ServerMessage = 
SendInviteResponse         | ReplyInviteResponse      |
IncomingInviteRequest      | IncomingInviteResponse   |
StartMatchResponse         | PlayLocallyResponse      | 
ScoresMessage              | DrawMessage			  | 
InitialVarsMessage         | WinMessage               | 
DisconnectMsg;

export let SCORES: number[] = [0, 0];


export let INVITE_FROM: string;


export function setInviteFrom(target: string) {
	INVITE_FROM = target;
}

export function getInviteFrom(): string {
	return (INVITE_FROM);
}
