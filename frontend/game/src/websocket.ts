
import {ConstantEvent, receiveMessages, oneTimeEvent} from "./events.js";
import { logoutButton, show} from "./ui.js";
import { getProfileInfo } from "./main.js";
import { ProfileInfo } from "./vars.js";
import { setUserSocket } from "./auth.js";

export let userSocket: WebSocket | null = null;

export function initializeWebSocket() {

    return new Promise<WebSocket>((resolve, reject) => {
    
        const ws = new WebSocket(`wss://localhost:4000/proxy-game`);
        setUserSocket(ws);
        ws.onopen = () => {

            receiveMessages(ws);
            ConstantEvent("INCOMING_INVITE_RESPONSE");
            ConstantEvent("INCOMING_INVITE_REQUEST");
            ConstantEvent("WIN");
            ConstantEvent("MIRROR");
            ConstantEvent("SCORES");
            ConstantEvent("DRAW");
            userSocket = ws;
            resolve(ws);
        };

        ws.onerror = (err) => {

            console.error("WebSocket error:", err);
            setUserSocket(null);
            try { ws.close(); } catch(e) {}
            reject(err);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            userSocket = null;
            setUserSocket(null);
        };
    });
}

export async function restoreSession(): Promise<boolean> {
    try {
        await initializeWebSocket();

        const result = await oneTimeEvent("INFO_REQUEST", "INFO_RESPONSE");
        
        if (!result || result.status !== 200 || !result.target) {
            throw new Error("Could not fetch user profile");
        }
        const info = result.target as ProfileInfo;
        show(logoutButton);
        updateProfileUI(info.display_name, info.username);
        
        return true;
    }
    catch (err) {
        nullWebsocket();
        return false;
    }
}

export function nullWebsocket(): void {
    userSocket = null;
    setUserSocket(null);
}


