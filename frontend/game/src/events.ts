import { showMenu, updateOpponentUI,  showCanvas, mirrorCanvas, savedDisplayName, updateProfileUI } from "./ui.js"
import { setCurrentMatchId,  setCurrentTournamentId, setSCORES, setDisplaySide, getDisplaySide, getMatchMode } from "./vars.js";
import {GameStatus, setGameStatus, getGameStatus, setMatchMode, GameType, setGameType, getGameType} from "./vars.js";
import { drawGame, clearBackground } from "./draw.js"
import { userSocket } from "./websocket.js";
import { showNotification, updateCurrentGame } from "./main.js";
import {MatchData, currentGameButton, hide, startMatchButton, show} from "./ui.js";
import { onFriendWebSocketMessage } from "./friends.js";

export async function httpEvent(method: string, endpoint: string, body?: Record<string, any>) {

	const options: RequestInit = {
		method: method,
		credentials: 'include'
	};

	if (body !== undefined) {
		options.headers = { 'Content-Type': 'application/json' };
		options.body = JSON.stringify(body);
	}

	const res = await fetch(endpoint, options);
	const data = await res.json();

	if (!res.ok)
		throw data;

	return (data);
}

export interface Events {

	type: string;
	msg?: string;
	info?: Record<string, any>;
}

const handlers: Record<string, ((data: Events) => void)[]> = {};

export function registerHandler(type: string, fn: (data: Events) => void) {

	if (!handlers[type])
		handlers[type] = [];
	handlers[type].push(fn);
}

export function receiveMessages(userSocket: WebSocket) {

	userSocket.addEventListener("message", (event: MessageEvent) => {

		let data: Events;
		try {

			data = JSON.parse(event.data);

		} catch {

			console.warn("Invalid JSON from server");
			return;
		}

		const fns = handlers[data.type];
		if (fns)
			fns.forEach(fn => fn(data));
	});
}

function sendMoves(type: string, payload?: Record<string, any>, payload2?: Record<string, any>) {

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

export async function registerEvents() {

	registerHandler("REQUEST", (data) => {

		showNotification(data.msg, data.info?.type, data.info?.id);
	});
	registerHandler("FRIEND_UPDATE", (data) => {
		onFriendWebSocketMessage(data);
	});
	registerHandler("TOURNAMENT_ELIMINATED", (data) => {
		showNotification(data.msg);
		setGameType(GameType.NONE);
		setGameStatus(GameStatus.NOT_IN_GAME);
		setSCORES(0, 0);
		clearBackground();
		hide(currentGameButton);
		showMenu();
	});
	registerHandler("GAME_READY", (data) => {

		setMatchMode("single");
		setGameStatus(GameStatus.READY_TO_START);
		setCurrentMatchId(data.info?.match_id);
		    
		if (data.info?.type === "tournament") {

			setGameType(GameType.TOURNAMENT);
			setCurrentTournamentId(data.info?.tournament_id);
			updateOpponentUI(data.info?.display_name, data.info?.id, data.info?.opponent_avatar);
		}
		else if (data.info?.type === "online") {
			setGameType(GameType.MATCH);
			updateOpponentUI(data.info?.display_name, data.info?.id, data.info?.opponent_avatar);
		}    
		else if (data.info?.type === "ai_easy") {
			setGameType(GameType.AI);
			updateOpponentUI("AI PERRY", "", "▥");
		}
		else if (data.info?.type === "ai_medium") {
			setGameType(GameType.AI);
			updateOpponentUI("AI MORTY", "", "▦");
		}
		else if (data.info?.type === "ai_hard") {
			setGameType(GameType.AI);
			updateOpponentUI("AI RICK", "", "▩");
		}
		else if (data.info?.type === "2player") {
		
			setGameType(GameType.TWO_PLAYER);
			updateOpponentUI("(1)" + data.info?.display_name, data.info?.id, data.info?.opponent_avatar);
			setMatchMode("dual");
		}
		showCanvas();
		updateCurrentGame("matches");
	});
	registerHandler("UPDATE", (data) => {

    	if (data.msg === "matches") {
			setGameType(GameType.MATCH);
			updateCurrentGame("matches");
		}
		else if (data.msg === "tournaments") {
			setGameType(GameType.TOURNAMENT);
    	    updateCurrentGame("tournaments");
    	}

	});
	registerHandler("MIRROR", (data) => {

			mirrorCanvas();
	});
	registerHandler("NOTIFICATION", (data) => {

		showNotification(data.msg);

	});
	registerHandler("SCORES", (data) => {

		setSCORES(data.info?.scores[0], data.info?.scores[1]);
	});
	registerHandler("WIN", (data) => {
		if (getGameType() === GameType.TOURNAMENT)
			updateProfileUI("", savedDisplayName);
		setGameType(GameType.NONE)
		setGameStatus(GameStatus.NOT_IN_GAME);
		showNotification(data.msg);
		setSCORES(0, 0);
		clearBackground();
		showMenu();
	});
	registerHandler("DRAW", (data) => {

		drawGame(data.info?.LeftXY[0], data.info?.LeftXY[1], data.info?.RightXY[0], data.info?.RightXY[1], data.info?.BallXY[0], data.info?.BallXY[1]);				
	});
}

export function initKeyHandling(): void {

	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);
}

function onKeyDown(e: KeyboardEvent): void {

	if (getMatchMode() === "single") {

		if (e.key === "ArrowUp")
			sendMoves("MOVE", { move: "UP" });
		else if (e.key === "ArrowDown")
			sendMoves("MOVE", { move: "DOWN" });
	}
	else {

		if (e.key === "w")
			sendMoves("MOVE2", { move: "UP1" });
		else if (e.key === "s")
			sendMoves("MOVE2", { move: "DOWN1" });
		else if (e.key === "ArrowUp")
			sendMoves("MOVE2", { move: "UP2" });
		else if (e.key === "ArrowDown")
			sendMoves("MOVE2", { move: "DOWN2" });
	}
}

function onKeyUp(e: KeyboardEvent): void {

	if (getMatchMode() === "single") {

		if (e.key === "ArrowUp" || e.key === "ArrowDown")
			sendMoves("MOVE", { move: "STOP" });
	}
	else {

		if (e.key ===  "w" || e.key === "s" )
			sendMoves("MOVE2", { move: "STOP1" });
		else if (e.key === "ArrowUp" || e.key === "ArrowDown")
			sendMoves("MOVE2", { move: "STOP2" });
	}
}