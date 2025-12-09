import { receiveMessages } from "./receive-events.js";
import {openLoginButton, openRegisterButton, playAgainstUserButton, createTournamentButton, searchTournamentButton, logoutButton, 
        show, hide, showLoader, hideLoader, incomingPlayRequestText, startMatchButton, incomingPlayRequestModal, incomingPlayRequestAcceptButton} from "./ui.js"
import {incomingInviteRequests, replyToInvite, incomingInviteResponses, incomingDisconnectMsg} from "./send-events.js"

function showButtons() {
    hideLoader();
	hide(openLoginButton);
    hide(startMatchButton);
	hide(openRegisterButton);
    show(playAgainstUserButton);
    show(createTournamentButton);
    show(searchTournamentButton);
	show(logoutButton);
}

export function initializeWebSocket(token: string) {

    return new Promise<WebSocket>((resolve, reject) => {
        showLoader();
        const ws = new WebSocket(`ws://localhost:4000/proxy-game?token=${token}`);

        ws.onopen = () => {
            showButtons();
            receiveMessages(ws);
            incomingInviteRequestHandler(ws!);
            incomingInviteResponsesHandler();
            incomingDisconnect();
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

function incomingInviteRequestHandler(userSocket: WebSocket) {

    incomingInviteRequests().then((result1) => {

        if (!result1) {
            alert("No reply from server");
            return ;
        }
        const {from, msg} = result1;
        incomingPlayRequestText.textContent = msg;
        show(incomingPlayRequestModal);
        incomingPlayRequestAcceptButton.onclick = () => {
		    replyToInvite(userSocket!, from).then((result2) => {

				if (!result2) {
					alert("No response from server");
					return ;
				}
				const { status, msg } = result2;
                alert(msg);
				if (status === 200)
					show(startMatchButton);
			});
			hide(incomingPlayRequestModal);
		};
    });
}


function incomingInviteResponsesHandler() {

    incomingInviteResponses().then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
        const { from, msg } = result;
        alert(msg);
        show(startMatchButton);
    });
}

function incomingDisconnect() {

    incomingDisconnectMsg().then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
        const msg = result;
        alert(msg);
        showButtons();
    });
}
