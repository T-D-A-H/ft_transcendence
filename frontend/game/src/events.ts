import {setDisplaySide, showNotification, showMenu, updateOpponentUI, setInviteFrom, setSCORES, showCanvas, mirrorCanvas, getDisplaySide} from "./ui.js"
import type {ServerMessage, StatusMsgTarget} from "./vars.js"
import {drawGame, clearBackground} from "./draw.js"
import { userSocket } from "./websocket.js"


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
				data.type === "EXIT_MATCH_RESPONSE"        ||
				data.type === "PLAY_LOCALLY_RESPONSE"      ||
				data.type === "CREATE_TOURNAMENT_RESPONSE" ||
				data.type === "SEARCH_TOURNAMENT_RESPONSE" ||
				data.type === "JOIN_TOURNAMENT_RESPONSE"   ||
				data.type === "INFO_RESPONSE"			   ||
				data.type === "GET_PENDING_RESPONSE") {

				resolve({status: data.status, msg: data.msg, target: data.target});
				return ;
			}

		}, false);

		sendRequest(request, {target, target2});
	});
}


export function ConstantEvent(response: ServerMessage["type"]){

	
	registerHandler(response, (data) => {

		if (data.type === "MATCH_READY") {
			showNotification(data.msg);
			updateOpponentUI(data.target);
			showCanvas();
		}
		if (data.type === "NOTIFICATION") {

			showNotification(data.msg);
		}
		else if (data.type === "INCOMING_INVITE_REQUEST") {

			setInviteFrom(data.target.trim());
			showNotification(data.msg, true);
		}
		else if (data.type === "SCORES") {

			setSCORES(data.scores[0], data.scores[1]);
		}
		else if (data.type === "WIN") {

			setSCORES(0, 0);
			clearBackground();
			showNotification(data.msg);
			showMenu();

		}
		else if (data.type === "MIRROR") {

			if (data.msg !== getDisplaySide()) {

				setDisplaySide(data.msg);
				mirrorCanvas();
			}
		}
		else if (data.type === "DRAW") {
	
			drawGame(data.LeftXY[0], data.LeftXY[1], data.RightXY[0], data.RightXY[1], data.BallXY[0], data.BallXY[1]);
		}
	}, true);

}

type MatchMode = "single" | "dual";

export let matchMode: MatchMode = "single";

export function setMatchMode(mode: string): void {
	matchMode = mode as MatchMode;
}

export function initKeyHandling(): void {

	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);
}

function onKeyDown(e: KeyboardEvent): void {

	if (matchMode === "single") {

		if (e.key === "w")
			sendRequest("MOVE", { move: "UP" });
		else if (e.key === "s")
			sendRequest("MOVE", { move: "DOWN" });
	}
	else {

		if (e.key === "w")
			sendRequest("MOVE2", { move: "UP1" });
		else if (e.key === "s")
			sendRequest("MOVE2", { move: "DOWN1" });
		else if (e.key === "ArrowUp")
			sendRequest("MOVE2", { move: "UP2" });
		else if (e.key === "ArrowDown")
			sendRequest("MOVE2", { move: "DOWN2" });
	}
}

function onKeyUp(e: KeyboardEvent): void {

	if (matchMode === "single") {

		if (e.key === "w" || e.key === "s")
			sendRequest("MOVE", { move: "STOP" });
	}
	else {

		if (e.key === "w" || e.key === "s")
			sendRequest("MOVE2", { move: "STOP1" });
		else if (e.key === "ArrowUp" || e.key === "ArrowDown")
			sendRequest("MOVE2", { move: "STOP2" });
	}
}














