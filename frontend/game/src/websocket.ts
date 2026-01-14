
import {openLoginButton, openRegisterButton, playAgainstUserButton,
        logoutButton, show, hide, showLoader, hideLoader, startMatchButton, playLocallyButton} from "./ui.js"
import {ConstantEvent, receiveMessages} from "./events.js";
import {openCreateTournamentButton, openSearchTournamentButton} from "./main.js";
function showButtons() {
    
    hideLoader();
	hide(openLoginButton);
    hide(startMatchButton);
	hide(openRegisterButton);
    show(playLocallyButton);
    show(playAgainstUserButton);
    
    
    show(openCreateTournamentButton);
    show(openSearchTournamentButton);
    
	show(logoutButton);
}

export function initializeWebSocket(token: string) {

    return new Promise<WebSocket>((resolve, reject) => {
        showLoader();
        const ws = new WebSocket(`ws://localhost:4000/proxy-game?token=${token}`);

        ws.onopen = () => {
            showButtons();
            receiveMessages(ws);
            ConstantEvent("INCOMING_INVITE_RESPONSE");
            ConstantEvent("INCOMING_INVITE_REQUEST");
            ConstantEvent("NOTIFICATION");
            ConstantEvent("SCORES");
            ConstantEvent("DRAW");
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






