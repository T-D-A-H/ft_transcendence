
import {openLoginButton, openRegisterButton, playAgainstUserButton, createTournamentButton, 
        searchTournamentButton, logoutButton, show, hide, showLoader, hideLoader, incomingPlayRequestText, 
        startMatchButton, incomingPlayRequestModal, incomingPlayRequestAcceptButton, playLocallyButton, SCORES} from "./ui.js"
import {receiveMessages, incomingInviteResponses, incomingInviteRequests, incomingDisconnectMsg, incomingScoreMsg, incomingWinMsg, incomingDrawRequest} from "./receive-events.js"
import { drawWin } from "./draw.js";

function showButtons() {
    hideLoader();
	hide(openLoginButton);
    hide(startMatchButton);
	hide(openRegisterButton);
    show(playLocallyButton);
    show(playAgainstUserButton);
    // show(createTournamentButton);
    // show(searchTournamentButton);
	show(logoutButton);
}

export function initializeWebSocket(token: string) {

    return new Promise<WebSocket>((resolve, reject) => {
        showLoader();
        const ws = new WebSocket(`ws://localhost:4000/proxy-game?token=${token}`);

        ws.onopen = () => {
            showButtons();
            receiveMessages(ws);
            incomingInviteRequests();
            incomingInviteResponses();
            incomingDrawRequest();
            incomingDisconnectMsg();
            incomingScoreMsg();
            incomingWinMsg();
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






