import { receiveMessages } from "./events.js";
import {openLoginButton, openRegisterButton, createMatchButton, searchForMatchButton, logoutButton, show, hide, showLoader, hideLoader } from "./ui.js"

export function initializeWebSocket(token: string) {

    return new Promise<WebSocket>((resolve, reject) => {
        showLoader();
        const ws = new WebSocket(`ws://localhost:4000/proxy-game?token=${token}`);

        ws.onopen = () => {
            hideLoader();
			hide(openLoginButton);
			hide(openRegisterButton);
			show(createMatchButton);
			show(searchForMatchButton);
			show(logoutButton);
            console.log("WebSocket connected");
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
