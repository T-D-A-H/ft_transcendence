import {showNotification, show, startMatchButton, incomingPlayRequestText, incomingPlayRequestModal} from "./ui.js"
import {setInviteFrom,  SCORES} from "./vars.js"
import type {ServerMessage, StatusMsgTarget} from "./vars.js"
import {drawWin, drawGame, clearBackground} from "./draw.js"
import { userSocket } from "./main.js"


const handlers: Record<string, ((data: ServerMessage) => void)[]> = {};

export function registerHandler<T extends ServerMessage>(type: T["type"], fn: (data: T) => void, Constant: boolean) {

	if (!handlers[type])
		handlers[type] = [];

	if (Constant) {

		handlers[type].push(fn as (data: ServerMessage) => void);
	}
	else {

		const wrapped = (data: ServerMessage) => {

			fn(data as T);
			handlers[type] = handlers[type].filter(h => h !== wrapped);
		};
		handlers[type].push(wrapped);
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


function sendRequest(type: string, payload?: Record<string, any>, payload2?: Record<string, any>) {

	if (!userSocket) {
		alert("websocket not ready");
		return ;
	}
	const msg = {
		type,
		...(payload || {}),
		...(payload2 || {})
	};
	userSocket.send(JSON.stringify(msg));
}


export function oneTimeEvent(request: string, response: ServerMessage["type"], target?: string, target2?: string): Promise<StatusMsgTarget | null> {

	return new Promise((resolve) => {

		registerHandler(response, (data) => {

			if (data.type === "SEND_INVITE_RESPONSE"       || 
				data.type === "REPLY_INVITE_RESPONSE"      || 
				data.type === "START_MATCH_RESPONSE"       || 
				data.type === "PLAY_LOCALLY_RESPONSE"      ||
				data.type === "CREATE_TOURNAMENT_RESPONSE" ||
				data.type === "SEARCH_TOURNAMENT_RESPONSE" ||
				data.type === "JOIN_TOURNAMENT_RESPONSE") {

				resolve({status: data.status, msg: data.msg, target: data.target});
			}
			
			resolve(null);

		}, false);

		sendRequest(request, {target, target2});
	});
}


export function ConstantEvent(response: ServerMessage["type"]){

	
	registerHandler(response, (data) => {

		if (data.type === "INCOMING_INVITE_RESPONSE") {

			showNotification(data.msg);
    		show(startMatchButton);
		}
		else if (data.type === "INCOMING_INVITE_REQUEST") {

			setInviteFrom(data.target.trim());
			incomingPlayRequestText.textContent = data.msg;
			show(incomingPlayRequestModal);
		}
		else if (data.type === "SCORES") {

			SCORES[0] = data.scores[0];
        	SCORES[1] = data.scores[1];
		}
		else if (data.type === "NOTIFICATION") {

			showNotification(data.msg);
			show(startMatchButton);
		}
		else if (data.type === "DRAW") {

			drawGame(data.LeftXY[0], data.LeftXY[1], data.RightXY[0], data.RightXY[1], data.BallXY[0], data.BallXY[1]);
		}
	}, true);

}

export function sendKeyPress(): void {

	document.addEventListener("keydown", (e: KeyboardEvent) => {

		if (e.key === "w")
			sendRequest("MOVE", { move: "UP" });
		if (e.key === "s")
			sendRequest("MOVE", { move: "DOWN" });

	});

	document.addEventListener("keyup", (e: KeyboardEvent) => {

		if (e.key === "w" || e.key === "s")
			sendRequest("MOVE", { move: "STOP" });
	});
}

export function send2KeyPress(): void {

	document.addEventListener("keydown", (e: KeyboardEvent) => {

		if (e.key === "w")
			sendRequest("MOVE2", { move: "UP1" });
		if (e.key === "s")
			sendRequest("MOVE2", { move: "DOWN1" });
		if (e.key === "ArrowUp")
			sendRequest("MOVE2", { move: "UP2" });
		if (e.key === "ArrowDown")
			sendRequest("MOVE2", { move: "DOWN2" });

	});

	document.addEventListener("keyup", (e: KeyboardEvent) => {

		if (e.key === "w" || e.key === "s")
			sendRequest("MOVE2", { move: "STOP1" });
		if (e.key === "ArrowUp" || e.key === "ArrowDown")
			sendRequest("MOVE2", { move: "STOP2" });
	});
}












