
import { drawGame } from "./draw.js"

interface SearchMatchResponse {type: "SEARCH_MATCH_RESPONSE"; status: number; matches: string[];}
interface CreateMatchResponse {type: "CREATE_MATCH_RESPONSE"; status: number; msg: string;}
interface JoinMatchResponse   {type: "JOIN_MATCH_RESPONSE"; status: number; target: string;}
interface JoinedMessage       {type: "PLAYER_JOINED_MATCH"};
interface DrawMessage         {type: "DRAW"; playerY1: number; ballY: number, ballX: number, playerY2: number;};
type ServerMessage = SearchMatchResponse | CreateMatchResponse | JoinMatchResponse | JoinedMessage | DrawMessage;

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

function sendRequest(userSocket: WebSocket, type: string, payload?: Record<string, any>) {

	const msg = payload ? { type, ...payload } : { type };
	userSocket.send(JSON.stringify(msg));
}

export function searchForMatch(userSocket: WebSocket): Promise<string[] | null> {

	return new Promise((resolve) => {

		registerHandler("SEARCH_MATCH_RESPONSE", (data) => {
			if (data.type !== "SEARCH_MATCH_RESPONSE")
				return;
			resolve(data.status === 200 ? data.matches : null);
		});

		sendRequest(userSocket, "SEARCH_MATCH_REQUEST");
	});
}

export function createNewMatch(userSocket: WebSocket): Promise<number> {

	return new Promise((resolve) => {

		registerHandler("CREATE_MATCH_RESPONSE", (data) => {

			if (data.type !== "CREATE_MATCH_RESPONSE")
				return;
			resolve(data.status === 200 ? 0 : 1);
		});

		sendRequest(userSocket, "CREATE_MATCH_REQUEST");
	});
}

export function joinMatch(userSocket: WebSocket, target: string): Promise<void> {

	return new Promise((resolve) => {

		registerHandler("JOIN_MATCH_RESPONSE", (data) => {
			if (data.type !== "JOIN_MATCH_RESPONSE") 
				return;
			if (data.target !== target)
				return;
			resolve();
		});

		sendRequest(userSocket, "JOIN_MATCH_REQUEST", { target });
	});
}

export function playerJoinedMatch(userSocket: WebSocket): Promise<number> {

	return new Promise((resolve) => {

		registerHandler("PLAYER_JOINED_MATCH", (data) => {

			if (data.type !== "PLAYER_JOINED_MATCH")
				return;
			resolve(0);
		});

		sendRequest(userSocket, "READY_TO_JOIN");
	});
}

export function sendKeyPress(userSocket: WebSocket, canvas: HTMLCanvasElement, paddle: CanvasRenderingContext2D): void {

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
