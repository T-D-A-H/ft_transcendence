
import { drawGame } from "./draw.js"
import { registerHandler } from "./receive-events.js"

interface StatusAndMsg {status: number; msg: string;}
interface MsgAndFrom   {from: string; msg: string;}

function sendRequest(userSocket: WebSocket, type: string, payload?: Record<string, any>) {

	const msg = payload ? { type, ...payload } : { type };
	userSocket.send(JSON.stringify(msg));
}

export function sendInviteToPlayer(userSocket: WebSocket, target: string): Promise<StatusAndMsg | null> {

	// SendInviteResponse {type: "SEND_INVITE_RESPONSE"; status: number; to: string; msg: string;}
	return new Promise((resolve) => {

		registerHandler("SEND_INVITE_RESPONSE", (data) => {
			if (data.type !== "SEND_INVITE_RESPONSE") 
				return;
			if (data.to !== target)
				return;
			resolve({status: data.status, msg: data.msg});
		}, true);

		sendRequest(userSocket, "SEND_INVITE_REQUEST", { target });
	});
}


export function incomingInviteResponses(): Promise<StatusAndMsg | null> {

	// IncomingInviteResponse {type: "INCOMING_INVITE_RESPONSE"; from: string; msg: string;}
	return new Promise((resolve) => {

		registerHandler("INCOMING_INVITE_RESPONSE", (data) => {
        	if (data.type !== "INCOMING_INVITE_RESPONSE")
            	return ;
			resolve({status: data.status, msg: data.msg});
		}, false);
	});
}


export function incomingInviteRequests(): Promise<MsgAndFrom | null> {

	//IncomingInviteRequest {type: "INCOMING_INVITE_REQUEST"; from: string; msg: string;}
	return new Promise((resolve) => {
		registerHandler("INCOMING_INVITE_REQUEST", (data) => {
			if (data.type !== "INCOMING_INVITE_REQUEST")
            	return ;
			resolve({from: data.from, msg: data.msg});
		}, false);
	});
}


export function replyToInvite(userSocket: WebSocket, target: string): Promise<StatusAndMsg | null>  {

	//ReplyInviteResponse {type: "REPLY_INVITE_RESPONSE"; status: number; to: string; msg: string;}
	return new Promise((resolve) => {

		registerHandler("REPLY_INVITE_RESPONSE", (data) => {
			if (data.type !== "REPLY_INVITE_RESPONSE") 
				return;
			if (data.to !== target)
				return ;
			resolve({status: data.status, msg: data.msg});
		}, true);

		sendRequest(userSocket, "REPLY_INVITE_REQUEST", { target });
	});
}


export function sendStartMatch(userSocket: WebSocket): Promise<StatusAndMsg | null> {

	// StartMatchResponse {type: "START_MATCH_RESPONSE"; status: number; msg: string;}
	return new Promise((resolve) => {

		registerHandler("START_MATCH_RESPONSE", (data) => {

			if (data.type !== "START_MATCH_RESPONSE")
				return;
			resolve({status: data.status, msg: data.msg});
		}, true);

		sendRequest(userSocket, "START_MATCH_REQUEST");
	});
}

export function sendKeyPress(userSocket: WebSocket, canvas: HTMLCanvasElement, paddle: CanvasRenderingContext2D): void {

	//DrawMessage {type: "DRAW"; playerY1: number; ballY: number, ballX: number, playerY2: number;}
	registerHandler("DRAW", (data) => {

		if (data.type !== "DRAW")
			return;
		drawGame(canvas, paddle, data.playerY1, data.ballY, data.ballX, data.playerY2);
	}, false);

	document.addEventListener("keydown", (e: KeyboardEvent) => {

		if (e.key === "w")
			sendRequest(userSocket, "MOVE", { move: "UP" });
		if (e.key === "s")
			sendRequest(userSocket, "MOVE", { move: "DOWN" });
	});

	document.addEventListener("keyup", (e: KeyboardEvent) => {

		if (e.key === "w" || e.key === "s")
			sendRequest(userSocket, "MOVE", { move: "STOP" });
	});
}



// export function searchForMatch(userSocket: WebSocket): Promise<string[] | null> {

// 	return new Promise((resolve) => {

// 		registerHandler("SEARCH_MATCH_RESPONSE", (data) => {
// 			if (data.type !== "SEARCH_MATCH_RESPONSE")
// 				return;
// 			resolve(data.status === 200 ? data.matches : null);
// 		});

// 		sendRequest(userSocket, "SEARCH_MATCH_REQUEST");
// 	});
// }


