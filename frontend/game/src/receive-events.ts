import {showNotification, show, startMatchButton, incomingPlayRequestText, 
		incomingPlayRequestModal, setInviteFrom,  SCORES} from "./ui.js"
import {drawWin, drawGame, clearBackground} from "./draw.js"

interface SendInviteResponse         {type: "SEND_INVITE_RESPONSE"; status: number; to: string; msg: string;}
interface ReplyInviteResponse        {type: "REPLY_INVITE_RESPONSE"; status: number; to: string; msg: string;}
interface IncomingInviteRequest      {type: "INCOMING_INVITE_REQUEST"; from: string; msg: string;}
interface IncomingInviteResponse     {type: "INCOMING_INVITE_RESPONSE"; from: string; msg: string;}


interface StartMatchResponse         {type: "START_MATCH_RESPONSE"; status: number; msg: string;}
interface DrawMessage                {type: "DRAW"; LeftXY: [number, number]; RightXY: [number, number]; BallXY: [number, number];}
interface ScoresMessage              {type: "SCORES"; scores: [number, number];}
interface InitialVarsMessage         {type: "VARS"; PaddleWH: [number, number]; BallWH: [number, number];}
interface WinMessage                 {type: "WIN"; msg: string;}
interface DisconnectMsg  			 {type: "DISCONNECT"; msg: string;}
interface PlayLocallyResponse 		 {type: "PLAY_LOCALLY_RESPONSE", status: number; msg: string;}


interface IncomingTournamentResponse {type: "INCOMING_TOURNAMENT_RESPONSE"; status: number; msg: string;}
interface CreateTournamentResponse   {type: "CREATE_TOURNAMENT_RESPONSE"; status: number; msg: string;}
interface SearchTournamentResponse   {type: "SEARCH_TOURNAMENT_RESPONSE"; status: number; tournaments: string[];}
interface JoinTournamentResponse     {type: "JOIN_TOURNAMENT_RESPONSE"; status: number; msg: string;}
interface StartTournamentResponse    {type: "START_TOURNAMENT_RESPONSE"; status: number; msg: string;}


type ServerMessage = 
SendInviteResponse         | ReplyInviteResponse      |
IncomingInviteRequest      | IncomingInviteResponse   |
StartMatchResponse         | StartTournamentResponse  |
CreateTournamentResponse   | SearchTournamentResponse |
IncomingTournamentResponse | JoinTournamentResponse   |
PlayLocallyResponse		   | ScoresMessage            |
DrawMessage				   | InitialVarsMessage       |
WinMessage                 | DisconnectMsg;


const handlers: Record<string, ((data: ServerMessage) => void)[]> = {};

export function registerHandler<T extends ServerMessage>(type: T["type"], fn: (data: T) => void, oneTime = true) {

	if (!handlers[type])
		handlers[type] = [];

	if (oneTime) {
		const wrapped = (data: ServerMessage) => {
			fn(data as T);
			handlers[type] = handlers[type].filter(h => h !== wrapped);
		};
		handlers[type].push(wrapped);
	} else {

		handlers[type].push(fn as (data: ServerMessage) => void);
	}
}


export function receiveMessages(userSocket: WebSocket) {

	userSocket.addEventListener("message", (event: MessageEvent) => {

		let data: ServerMessage;
		try { 
			data = JSON.parse(event.data); 
		} catch { 

			return; 
		}
		const fns = handlers[data.type];
		if (fns)
			fns.slice().forEach(fn => fn(data));
	});
}

export function incomingInviteResponses() {

	// StatusAndMsg {status: number; msg: string;}
	// IncomingInviteResponse {type: "INCOMING_INVITE_RESPONSE"; from: string; msg: string;}
	registerHandler("INCOMING_INVITE_RESPONSE", (data) => {
    	if (data.type !== "INCOMING_INVITE_RESPONSE")
        	return ;
		const { from, msg } = data;
		showNotification(msg);
    	show(startMatchButton);
	}, false);
}


export function incomingInviteRequests() {

	//IncomingInviteRequest {type: "INCOMING_INVITE_REQUEST"; from: string; msg: string;}
	registerHandler("INCOMING_INVITE_REQUEST", (data) => {
		if (data.type !== "INCOMING_INVITE_REQUEST")
            return ;

		setInviteFrom(data.from);
		incomingPlayRequestText.textContent = data.msg;
		show(incomingPlayRequestModal);
	}, false);
}


export function incomingDisconnectMsg() {

	//IncomingInviteRequest {type: "INCOMING_INVITE_REQUEST"; from: string; msg: string;}
	registerHandler("DISCONNECT", (data) => {
		if (data.type !== "DISCONNECT")
        	return ;
		alert("USer discomnnected");
		clearBackground();
		showNotification(data.msg);
	}, false);
}

export function incomingScoreMsg() {

	registerHandler("SCORES", (data) => {

		if (data.type !== "SCORES")
            return ;
		SCORES[0] = data.scores[0];
        SCORES[1] = data.scores[1];
	}, false);
}

export function incomingWinMsg() {

	registerHandler("WIN", (data) => {
		if (data.type !== "WIN")
            return ;
		drawWin(data.msg);
		showNotification(data.msg);
	}, false);

}

export function incomingDrawRequest() {

	//DrawMessage {type: "DRAW"; playerY1: number; ballY: number, ballX: number, playerY2: number;}
	registerHandler("DRAW", (data) => {

		if (data.type !== "DRAW")
			return;

		const [p1X, p1Y] = data.LeftXY;
		const [p2X, p2Y] = data.RightXY;
		const [ballX, ballY] = data.BallXY;

		drawGame(p1X, p1Y, p2X, p2Y, ballX, ballY);

	}, false);

}









