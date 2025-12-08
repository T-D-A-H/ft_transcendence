import { receiveMessages } from "./receive-events.js";
import {openLoginButton, openRegisterButton, playAgainstUserButton,
        logoutButton, show, hide, showLoader, hideLoader} from "./ui.js"

function showButtons() {
    hideLoader();
	hide(openLoginButton);
	hide(openRegisterButton);
    show(playAgainstUserButton);
	show(logoutButton);
}

export function initializeWebSocket(token: string) {

    return new Promise<WebSocket>((resolve, reject) => {
        showLoader();
        const ws = new WebSocket(`ws://localhost:4000/proxy-game?token=${token}`);

        ws.onopen = () => {
            showButtons();
            receiveMessages(ws);
            resolve(ws);
        };

        ws.onerror = (err) => {
            hideLoader();
            console.error("WebSocket error:", err);
            ws.close();
            reject(err);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            hideLoader();
        };
    });
}

