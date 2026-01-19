import {loadAnimation, showLoader, hideLoader} from "./ui.js";
import { loginModal, closeLoginButton, logoutButton,usernameInput, passwordInput, submitLoginButton, dontHaveAnAccountButton} from "./ui.js";
import { registerModal, closeRegisterButton, submitRegisterButton, regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput, alreadyHaveAnAccountButton} from "./ui.js";
import { twoFAModal, twoFAOptionModal, twoFAEmailButton, twoFASubmitButton, twoFASkipButton, twoFAAuthButton, twoFAInput, twoFACancelButton} from "./ui.js";
import { startMatchButton, playLocallyButton, exitMatchButton} from "./ui.js";
import { playRequestModal, playAgainstUserButton, playRequestUsernameInput, playRequestCloseButton, playRequestSendButton} from "./ui.js";
import { incomingPlayRequestModal, incomingPlayRequestText, incomingPlayRequestCloseButton, incomingPlayRequestAcceptButton} from "./ui.js";
import { openCreateTournamentButton, closeCreateTournamentButton, submitTournamentCreationButton, createTournamentModal, aliasTournamentInput, tournamentSizeInput} from "./ui.js";
import { openSearchTournamentButton, closeSearchTournamentButton, searchTournamentsModal, renderTournamentList} from "./ui.js";
import { show, hide, showMenu, showCanvas, showNotification, toggleNightMode, nightModeButton} from "./ui.js";
import { topBarOpponentButton, topBarOpponentPicture, topBarOpponentDisplayName} from "./ui.js";
import { openMenuButton, topBarProfilePicture, topBarDisplayName, menuModal, menuDisplayName, menuUsername, menuButtons, toggleMenu} from "./ui.js";

import {getInviteFrom, TournamentInfo} from "./vars.js";

import {registerUser, loginUser, logoutUser, configure2FA, verify2FA} from "./auth.js";

import { connectWithToken, userSocket } from "./websocket.js";

import { oneTimeEvent, sendKeyPress, send2KeyPress } from "./events.js";

import { drawGame, drawFrame } from "./draw.js";



let tempToken2FA: string | null | undefined = null;

const token = localStorage.getItem("token");


if (token) {
	connectWithToken(token).catch(() => alert("Error connecting to server"));
}



window.requestAnimationFrame(drawFrame);

openMenuButton.onclick = toggleMenu;

alreadyHaveAnAccountButton.onclick = () => {
	hide(registerModal);
	show(loginModal);
	showNotification("You must sign in in order to continue!!!");
};

submitRegisterButton.onclick = async () => {

	const result = await registerUser(regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput);

	if (result.status === 0 && result.setupToken) {
		hide(registerModal);
		show(twoFAOptionModal);
		twoFAEmailButton.onclick = () => {

			configure2FA(result.setupToken!, "2FAmail", twoFAOptionModal, loginModal, registerModal);

		}
		twoFASkipButton.onclick = twoFACancelButton.onclick = () => {

			configure2FA(result.setupToken!, "skip", twoFAOptionModal, loginModal, registerModal);
		};
	} else {
		showNotification("User with that username already exists");
	}
};

closeRegisterButton.onclick = () => hide(registerModal);

// openLoginButton.onclick = () => show(loginModal);

dontHaveAnAccountButton.onclick = () => {
	hide(loginModal);
	show(registerModal);
}

submitLoginButton.onclick = async () => {


	const result = await loginUser(usernameInput, passwordInput);

	if (result.status === 0) {
		hide(loginModal);
		hide(twoFAModal);
		show(logoutButton);
	}
	else if (result.status === "requires_2fa" && result.method === "email") {

		show(twoFAModal);
		tempToken2FA = result.tempToken;

		twoFASubmitButton.onclick = async () => {

			const code = twoFAInput.value.trim();
			if (!code) return alert("Ingresa el código 2FA");

			const success = await verify2FA(tempToken2FA!, code, twoFAModal, loginModal);
			if (success)
				tempToken2FA = null;
			twoFAInput.value = "";
			show(logoutButton);
		};
	}
	else {
		showNotification(result.error || "User/Password Incorrect");
	}
};

closeLoginButton.onclick = () => hide(loginModal);

logoutButton.onclick = () => logoutUser(logoutButton);


menuButtons.forEach(button => {

	button.addEventListener('click', () => {

		const targetId = button.dataset.target;
		if (!targetId)
			return;
		menuButtons.forEach(btn => btn.classList.remove('active-border'));
		button.classList.add('active-border');
		const allLists = document.querySelectorAll<HTMLElement>('.pong-list');
		allLists.forEach(list => {

			if (list.id === targetId)
				show(list);
			else
				hide(list);
		});
	});
});

nightModeButton.onclick = () => {
	toggleNightMode();
	drawGame();
};

playRequestSendButton.onclick = () => {

	const target_username = playRequestUsernameInput.value.trim();
		if (target_username.length === 0) {
		alert("Username field empty");
		return ;
	}
	oneTimeEvent("SEND_INVITE_REQUEST", "SEND_INVITE_RESPONSE", target_username).then((result) => {

		if (!result || !result.target) {
			alert("No response from server");
			return ;
		}
		if (result.target !== target_username) {
			alert("Username response doesnt match invitation target");
			return ;
		}
		if (result.status !== 200) {
			showNotification(result.msg);
			return ;
		}
		hide(playRequestModal);
	});
};

playAgainstUserButton.onclick = () => {
	if (!userSocket) {
		show(loginModal);
		showNotification("You must sign in in order to continue!!!");
		return ;
	}
	show(playRequestModal)
};

incomingPlayRequestCloseButton.onclick = () => hide(incomingPlayRequestModal);

playRequestCloseButton.onclick = () => hide(playRequestModal);

startMatchButton.onclick = () => {


	hide(startMatchButton);
	show(openMenuButton);
	show(topBarDisplayName);
	showNotification("Waiting for player...");
    oneTimeEvent("START_MATCH_REQUEST", "START_MATCH_RESPONSE").then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
		showNotification(result.msg);
		if (result.status !== 200) {
			return ;
		}
		showNotification("Waiting for player...");
		show(exitMatchButton);
		sendKeyPress();
    });
};

exitMatchButton.onclick = () => {


	hide(exitMatchButton);
    oneTimeEvent("EXIT_MATCH_REQUEST", "EXIT_MATCH_RESPONSE").then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
		showNotification(result.msg);
		if (result.status !== 200) {
			return ;
		}
		showMenu();
    });
};

playLocallyButton.onclick = () => {

	if (!userSocket) {
		show(loginModal);
		showNotification("You must sign in in order to continue!!!");
		return ;
	}
	oneTimeEvent("PLAY_LOCALLY_REQUEST", "PLAY_LOCALLY_RESPONSE").then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
		showNotification(result.msg);
		if (result.status !== 200) {
			return;
		}
		showCanvas();
		send2KeyPress();
		
	});
};
 
incomingPlayRequestAcceptButton.onclick = () => {

	oneTimeEvent("REPLY_INVITE_REQUEST", "REPLY_INVITE_RESPONSE", getInviteFrom()).then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
		showNotification(result.msg);
		if (result.status === 200) {
			showCanvas();
		}
	});
	hide(incomingPlayRequestModal);
};

openCreateTournamentButton.onclick = () => {
	if (!userSocket) {
		show(loginModal);
		showNotification("You must sign in in order to continue!!!");
		return ;
	}
	show(createTournamentModal);
};

submitTournamentCreationButton.onclick = () => {

	const alias = aliasTournamentInput.value.trim();
	const size = tournamentSizeInput.value;

	if (alias.length === 0 || size.length === 0) {
		return ;
	}

	oneTimeEvent("CREATE_TOURNAMENT_REQUEST", "CREATE_TOURNAMENT_RESPONSE", alias, size).then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
		
		if (result.status !== 200) {
			hide(createTournamentModal);
			showNotification(result.msg);
			return ;
		}
		showNotification(result.msg);
		hide(createTournamentModal);

	});

};

closeCreateTournamentButton.onclick = () => hide(createTournamentModal);


openSearchTournamentButton.onclick = () => {

	if (!userSocket) {
		show(loginModal);
		showNotification("You must sign in in order to continue!!!");
		return ;
	}
	oneTimeEvent("SEARCH_TOURNAMENT_REQUEST", "SEARCH_TOURNAMENT_RESPONSE").then((result) => {
		if (!result) {
			alert("No response from server");
			return ;
		}
		if (result.status !== 200) {
			showNotification(result.msg);
			hide(searchTournamentsModal);
			return ;
		}
		const joinButtons = renderTournamentList(result.target as TournamentInfo[]);
		show(searchTournamentsModal);
		for (const btn of joinButtons) {

	
			const id = btn.dataset.id!;
			const alias = "lolxd";

			btn.onclick = () => {
				oneTimeEvent("JOIN_TOURNAMENT_REQUEST", "JOIN_TOURNAMENT_RESPONSE", id, alias).then((result) => {

					if (!result) {
						alert("No response from server");
						return ;
					}
					showNotification(result.msg);
					if (result.status !== 200) {
						hide(searchTournamentsModal);
						return ;
					}
					hide(searchTournamentsModal);
					showCanvas();
				});	
			};
		}
	});	
	
};

closeSearchTournamentButton.onclick = () => hide(searchTournamentsModal);