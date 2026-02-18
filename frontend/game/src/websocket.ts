
import { updateSessionButtons} from "./ui.js";
import { getProfileInfo } from "./main.js";
import { receiveMessages, registerEvents} from "./events.js";


export let userSocket: WebSocket | null = null;

let pingInterval: any = null;

export function initializeWebSocket() {

    return new Promise<WebSocket>((resolve, reject) => {
    
        const ws = new WebSocket(`wss://localhost:4000/api/games/`);
        setUserSocket(ws);
        ws.onopen = () => {
            updateSessionButtons(true);
            receiveMessages(ws);
            registerEvents();
            userSocket = ws;
            if (pingInterval)
                clearInterval(pingInterval);
            pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "PING" }));
                }
            }, 30000);
            resolve(ws);
        };

        ws.onerror = (err) => {

            console.error("WebSocket error:", err);
            setUserSocket(null);
            updateSessionButtons(false);
            try { ws.close(); } catch(e) {}
            reject(err);
        };

        ws.onclose = async (event) => {
            console.log("WebSocket disconnected");
            if (pingInterval)
                clearInterval(pingInterval);
            setUserSocket(null);
            if (event.reason === "New login detected") {
                
                alert("Tu sesión se ha cerrado porque has entrado desde otro dispositivo o pestaña.");
                try {
                    await fetch('/api/sessions/current?soft=true', { 
                        method: "DELETE",
                        credentials: "include" 
                    });
                } catch (e) {
                    console.error("Error limpiando cookies:", e);
                }
                window.location.reload(); 
            }
        };
    });
}

export async function restoreSession(): Promise<boolean> {
    try {
        await initializeWebSocket();

        await getProfileInfo(false);
        
        updateSessionButtons(true);
        return true;
    }
    catch (err) {
        setUserSocket(null);
        return false;
    }
}

export function setUserSocket(socket: WebSocket | null) {

	userSocket = socket;
}

export function getUserSocket(): WebSocket | null {
    
    return userSocket;
}

export function closeUserSocket(): void {

    const socket: WebSocket = userSocket as WebSocket;
    socket.close();
}


