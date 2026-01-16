import { loadAnimation, showLoader, hideLoader} from "./ui.js";
import { loginModal, openLoginButton, closeLoginButton, logoutButton,usernameInput, passwordInput, submitLoginButton} from "./ui.js";
import { registerModal, openRegisterButton, closeRegisterButton, submitRegisterButton, regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput} from "./ui.js";
import { twoFAModal, twoFAOptionModal, twoFAEmailButton, twoFASubmitButton, twoFASkipButton, twoFAAuthButton, twoFAInput, twoFACancelButton} from "./ui.js";
import { startMatchButton, waitingPlayers, playLocallyButton, exitMatchButton} from "./ui.js";
import { playRequestModal, playAgainstUserButton, playRequestUsernameInput, playRequestCloseButton, playRequestSendButton} from "./ui.js";
import { incomingPlayRequestModal, incomingPlayRequestText, incomingPlayRequestCloseButton, incomingPlayRequestAcceptButton} from "./ui.js";
import { openCreateTournamentButton, closeCreateTournamentButton, submitTournamentCreationButton, createTournamentModal, aliasTournamentInput, tournamentSizeInput} from "./ui.js";
import { openSearchTournamentButton, closeSearchTournamentButton, searchTournamentsModal, renderTournamentList} from "./ui.js";
import { canvas, texture, show, hide, showMenu, showCanvas, showNotification, toggleNightMode, nightModeButton} from "./ui.js";
import {openMenuButton, menuModal, menuDisplayName, menuUsername, menuButtons} from "./ui.js";
import {getInviteFrom, TournamentInfo} from "./vars.js";
import { registerUser,  loginUser } from "./login-register.js"
import { initializeWebSocket } from "./websocket.js";
import { oneTimeEvent, sendKeyPress, send2KeyPress } from "./events.js";
import { drawGame, drawFrame,  } from "./draw.js";


let tempToken2FA: string | null | undefined = null;
export let userSocket: WebSocket | null = null;


window.requestAnimationFrame(drawFrame);

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


// Verificar si hay token al cargar la página
const token = localStorage.getItem("token");
if (!token || token === "null") {
	show(openLoginButton);
	show(openRegisterButton);
	setTimeout(hideLoader, 300);
}
else {
	initializeWebSocket(token).then((ws) => {
		userSocket = ws;
	}).catch(() => alert("Error connecting to server"));
}


openLoginButton.onclick = () => show(loginModal);

submitLoginButton.onclick = async () => {

	showLoader();
	try {
		
		const result = await loginUser(usernameInput, passwordInput); // 1. PRIMERO: Intentar login (backend valida usuario + contraseña)

		if (result.status === "requires_2fa" && result.method === "email") { // 2. El backend decide si necesita 2FA DESPUÉS de validar credenciales
			
			hideLoader();// Usuario válido y necesita 2FA
			show(twoFAModal);
			tempToken2FA = result.tempToken; // Token temporal del backend
			twoFASubmitButton.onclick = async () => { // Configurar el botón de verificación 2FA
				const code = twoFAInput.value.trim();
				if (!code) {
					alert("Ingresa el código 2FA");
					return;
				}
				showLoader();
				try {

					const res = await fetch("/verify-2fa-mail", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ tempToken: tempToken2FA, code 
						})
					});
					
					const verifyResult = await res.json();

					if (verifyResult.status === "ok" && verifyResult.token) { // Login completo
						
						localStorage.setItem("token", verifyResult.token);
						hide(twoFAModal);
						hide(loginModal);
						initializeWebSocket(verifyResult.token).then((ws) => {
							userSocket = ws;
						}).catch(() => alert("Error connecting to server"));
						tempToken2FA = null;
						twoFAInput.value = "";
					} else {

						alert(verifyResult.error || "Código 2FA incorrecto");
						hideLoader();
					}
				} catch (err) {

					console.error(err);
					alert("Error al verificar 2FA");
					hideLoader();
				}
			};
			
		} else if (result.status === 0 && result.token) { // Login exitoso sin 2FA
			
			localStorage.setItem("token", result.token);
			hide(twoFAModal);
			hide(loginModal);
			initializeWebSocket(result.token).then((ws) => {
				userSocket = ws;
    			hideLoader();

			}).catch(() => alert("Error connecting to server"));
			
			
		} else { // Credenciales incorrectas
			
			showNotification("User/Password Incorrect");
			hideLoader();
		}

		} catch (err) {
			console.error(err);
			showNotification("Error trying to sign in");
			hideLoader();
		}
};

closeLoginButton.onclick = () => hide(loginModal);

openRegisterButton.onclick = () => show(registerModal);

submitRegisterButton.onclick = async () => {

	const result = await registerUser(regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput);

	if (result.status === 0 && result.userId && result.setupToken) {
		hide(registerModal);
		show(twoFAOptionModal);

		twoFAEmailButton.onclick = async () => {
			const res = await fetch("/set-2fa", {
				method: "POST",
				headers: { 
					"Content-Type": "application/json",
					"Authorization": `Bearer ${result.setupToken}`
				},
				body: JSON.stringify({ method: "2FAmail" })
			});
			const data = await res.json();
			if (data.status === "ok") {
				hide(twoFAOptionModal);
				show(loginModal);
			} else {
				alert(data.error || "Error al configurar 2FA");
				hide(twoFAOptionModal);
				show(registerModal);
			}
		};
		const handleSkip2FA = async (): Promise<void> => {

			const res = await fetch("/set-2fa", {
				method: "POST",
				headers: { 
					"Content-Type": "application/json",
					"Authorization": `Bearer ${result.setupToken}`
				},
				body: JSON.stringify({ method: "skip" })
			});

			const data = await res.json();
			if (data.status === "ok") {
				hide(twoFAOptionModal);
				show(loginModal);
			} else {
				alert(data.error || "Error al configurar 2FA");
				hide(twoFAOptionModal);
				show(registerModal);
			}
		}
		twoFACancelButton.onclick = handleSkip2FA;
		twoFASkipButton.onclick = handleSkip2FA;
	}
	else if (result.status === 1) {
		showNotification("User with that username already exists");

	}
};

closeRegisterButton.onclick = () => hide(registerModal);

logoutButton.onclick = async () => {
	if (userSocket) {
		userSocket.close();
		userSocket = null;
	}
	let token = localStorage.getItem("token");
	const res = await fetch("/logout", {
		method: "POST",
		headers: { "Content-Type": "application/json",},
		body: JSON.stringify({ token })
	});

	const data = await res.json();
	if (data.status === "ok") {
		localStorage.removeItem("token");
		showRegisterMenu();
		drawGame();
	}
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

playAgainstUserButton.onclick = () => show(playRequestModal);

incomingPlayRequestCloseButton.onclick = () => hide(incomingPlayRequestModal);

playRequestCloseButton.onclick = () => hide(playRequestModal);

startMatchButton.onclick = () => {


	hide(startMatchButton);
	show(waitingPlayers);
    oneTimeEvent("START_MATCH_REQUEST", "START_MATCH_RESPONSE").then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
		showNotification(result.msg);
		if (result.status !== 200) {
			return ;
		}
		hide(waitingPlayers);
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
		if (result.status === 200)
			show(startMatchButton);
	});
	hide(incomingPlayRequestModal);
};

openCreateTournamentButton.onclick = () => show(createTournamentModal);

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
		show(startMatchButton);
	});

};

closeCreateTournamentButton.onclick = () => hide(createTournamentModal);


openSearchTournamentButton.onclick = () => {


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
					show(startMatchButton);
				});	
			};
		}
	});	
	
};

closeSearchTournamentButton.onclick = () => hide(searchTournamentsModal);