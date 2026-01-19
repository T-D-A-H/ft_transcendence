
import {ConstantEvent, receiveMessages} from "./events.js";
import { logoutButton, show } from "./ui.js";

export let userSocket: WebSocket | null = null;

export function initializeWebSocket(token: string) {

    return new Promise<WebSocket>((resolve, reject) => {
    
        const ws = new WebSocket(`ws://localhost:4000/proxy-game?token=${token}`);

        ws.onopen = () => {

            receiveMessages(ws);
            ConstantEvent("INCOMING_INVITE_RESPONSE");
            ConstantEvent("INCOMING_INVITE_REQUEST");
            ConstantEvent("WIN");
            ConstantEvent("NOTIFICATION");
            ConstantEvent("SCORES");
            ConstantEvent("DRAW");
            userSocket = ws;
            resolve(ws);
        };

        ws.onerror = (err) => {

            console.error("WebSocket error:", err);
            ws.close();
            reject(err);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");

        };
    });
}

export async function connectWithToken(token: string): Promise<WebSocket> {

	try {

		const ws = await initializeWebSocket(token);
		userSocket = ws;
        show(logoutButton);
		return ws;

	}
    catch (err) {

		console.error("WebSocket connection failed:", err);
		throw err;
	}
}


export function nullWebsocket(): void {
    userSocket = null;
}


