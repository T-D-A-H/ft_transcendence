
import { drawGame } from "./draw.js"
import { registerHandler } from "./receive-events.js"
import { getInviteFrom } from "./ui.js"

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


export function replyToInvite(userSocket: WebSocket): Promise<StatusAndMsg | null>  {

	//ReplyInviteResponse {type: "REPLY_INVITE_RESPONSE"; status: number; to: string; msg: string;}
	return new Promise((resolve) => {

		registerHandler("REPLY_INVITE_RESPONSE", (data) => {
			if (data.type !== "REPLY_INVITE_RESPONSE") 
				return;
			if (data.to !== getInviteFrom())
				return ;
			resolve({status: data.status, msg: data.msg});
		}, true);

		sendRequest(userSocket, "REPLY_INVITE_REQUEST", { target: getInviteFrom() });
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


export function playLocallyRequest(userSocket: WebSocket): Promise<StatusAndMsg | null> {

	// SendInviteResponse {type: "SEND_INVITE_RESPONSE"; status: number; to: string; msg: string;}
	return new Promise((resolve) => {

		registerHandler("PLAY_LOCALLY_RESPONSE", (data) => {
			if (data.type !== "PLAY_LOCALLY_RESPONSE") 
				return;

			resolve({status: data.status, msg: data.msg});
		}, true);

		sendRequest(userSocket, "PLAY_LOCALLY_REQUEST");
	});
}


export function sendKeyPress(userSocket: WebSocket): void {

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


export function send2KeyPress(userSocket: WebSocket): void {

	document.addEventListener("keydown", (e: KeyboardEvent) => {

		if (e.key === "w")
			sendRequest(userSocket, "MOVE2", { move: "UP1" });
		if (e.key === "s")
			sendRequest(userSocket, "MOVE2", { move: "DOWN1" });
		if (e.key === "ArrowUp")
			sendRequest(userSocket, "MOVE2", { move: "UP2" });
		if (e.key === "ArrowDown")
			sendRequest(userSocket, "MOVE2", { move: "DOWN2" });

	});

	document.addEventListener("keyup", (e: KeyboardEvent) => {

		if (e.key === "w" || e.key === "s")
			sendRequest(userSocket, "MOVE2", { move: "STOP1" });
		if (e.key === "ArrowUp" || e.key === "ArrowDown")
			sendRequest(userSocket, "MOVE2", { move: "STOP2" });
	});
}



