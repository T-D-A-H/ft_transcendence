import { 
	loadAnimation, showLoader, hideLoader, 
	loginModal, openLoginButton, closeLoginButton, logoutButton,
	usernameInput, passwordInput, submitLoginButton,
	registerModal, openRegisterButton, closeRegisterButton, submitRegisterButton, 
	regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput,
	twoFAModal, twoFAOptionModal, twoFAEmailButton, twoFASubmitButton, twoFASkipButton, twoFAAuthButton, twoFAInput,
	startMatchButton, waitingPlayers, playLocallyButton,
	playRequestModal, playAgainstUserButton, playRequestUsernameInput, playRequestCloseButton, playRequestSendButton,
	incomingPlayRequestModal, incomingPlayRequestText, incomingPlayRequestCloseButton, incomingPlayRequestAcceptButton,
	createTournamentButton, searchTournamentButton, activeTournamentsModal, tournamentsListUL, renderTournamentList,
	canvas, texture, show, hide,
	testGameButton
} from "./ui.js";

import { registerUser,  loginUser } from "./login-register.js"
import { initializeWebSocket } from "./websocket.js";
import { sendKeyPress, send2KeyPress, sendInviteToPlayer, sendStartMatch, playLocallyRequest} from "./send-events.js";


if (!loadAnimation || !showLoader || !hideLoader ||
	!loginModal || !openLoginButton || !closeLoginButton || !logoutButton ||
	!usernameInput || !passwordInput || !submitLoginButton ||
	!registerModal || !openRegisterButton || !closeRegisterButton || !submitRegisterButton || !
	!regUsernameInput || !regDisplaynameInput || !regEmailInput || !regPasswordInput ||
	!twoFAModal || !twoFAOptionModal || !twoFAEmailButton || !twoFASubmitButton || !twoFASkipButton || !twoFAAuthButton || !twoFAInput ||
	!startMatchButton || !waitingPlayers || !playLocallyButton ||
	!playRequestModal || !playAgainstUserButton || !playRequestUsernameInput || !playRequestCloseButton || !playRequestSendButton ||
	!incomingPlayRequestModal || !incomingPlayRequestText || !incomingPlayRequestCloseButton || !incomingPlayRequestAcceptButton ||
	!createTournamentButton || !searchTournamentButton || !activeTournamentsModal || !tournamentsListUL || !renderTournamentList ||
	!canvas || !texture || !show || !hide) {
		console.error("One or more UI elements are missing");
}


let tempToken2FA: string | null | undefined = null;
let userSocket: WebSocket | null = null;

openLoginButton.onclick = () => show(loginModal);
closeLoginButton.onclick = () => hide(loginModal);
openRegisterButton.onclick = () => show(registerModal);
closeRegisterButton.onclick = () => hide(registerModal);
playAgainstUserButton.onclick = () => show(playRequestModal);
incomingPlayRequestCloseButton.onclick = () => hide(incomingPlayRequestModal);
playRequestCloseButton.onclick = () => hide(playRequestModal);

showLoader();

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
			
			alert(result.error || "Usuario o contraseña incorrectos");
			hideLoader();
		}

		} catch (err) {
			console.error(err);
			alert("Error al iniciar sesión");
			hideLoader();
		}
};

submitRegisterButton.onclick = async () => {

	const result = await registerUser(regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput);

	if (result.status === 0 && result.userId && result.setupToken) {
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
				hide(registerModal);
				show(loginModal);
			} else {
				alert(data.error || "Error al configurar 2FA");
			}
			hide(twoFAOptionModal);
			hide(registerModal);
			show(loginModal);
		};

		twoFASkipButton.onclick = async () => {
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
				hide(registerModal);
				show(loginModal);
			} else {
				alert(data.error || "Error al configurar 2FA");
			}
		};
	}
	else if (result.status === 1) {
		alert("User with that username already exists");
	}
};

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
		hide(logoutButton);
		hide(startMatchButton);
		hide(playAgainstUserButton);
		hide(createTournamentButton);
		hide(searchTournamentButton);
		show(openLoginButton);
		show(openRegisterButton);
	}
};

playRequestSendButton.onclick = () => {

	const target_username = playRequestUsernameInput.value.trim();
		if (target_username.length === 0) {
		alert("Username field empty");
		return ;
	}
	sendInviteToPlayer(userSocket!, target_username).then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
		const { status, msg } = result;
		if (status !== 200) {
			alert(msg);
			return ;
		}
		hide(playRequestModal);
	});
};


startMatchButton.onclick = () => {

    if (!userSocket) {
        alert("WebSocket not ready");
        return;
    }
	hide(startMatchButton);
	show(waitingPlayers);
    sendStartMatch(userSocket!).then((result) => {

		if (!result) {
			alert("No response from server");
			return ;
		}
		const { status, msg } = result;
		if (status !== 200) {
			alert(msg);
			return ;
		}
		hide(waitingPlayers);
		sendKeyPress(userSocket!);
    });
};

playLocallyButton.onclick = () => {

    if (!userSocket) {
        alert("WebSocket not ready");
        return;
    }
	playLocallyRequest(userSocket!).then((result) => {


		if (!result) {
			alert("No response from server");
			return ;
		}
		const {status, msg} = result;
		alert(msg);
		if (status !== 200) {
			return;
		}
		hide(playLocallyButton);
		hide(playAgainstUserButton);
		hide(createTournamentButton);
		hide(searchTournamentButton);
		send2KeyPress(userSocket!);
	});
};

// import { gameKeyPresses } from "./testgame.js";
// testGameButton.onclick = () => {
// 	gameKeyPresses();
// };

// createTournamentButton.onclick = () => {
//     if (!userSocket) {
//         alert("WebSocket not ready");
//         return;
//     }
// 	alert("No code written for this.");

// };
// searchTournamentButton.onclick = () => {
//     if (!userSocket) {
//         alert("WebSocket not ready");
//         return;
//     }
// 	alert("No code written for this.");

// };

// searchForMatchButton.onclick = () => {
// 	if (!userSocket) {
//         alert("WebSocket not ready");
//         return;
//     }

// 	searchForMatch(userSocket!).then((matches) => {

// 		if (!matches) {
// 			alert("No Matches found.");
// 			hide(activeMatchesModal);
// 			return;
// 		}
// 		const joinButtons = renderMatchList(matches!);
// 		for (const btn of joinButtons) {
// 			const target = btn.dataset.username!;
// 			btn.onclick = () => joinMatch(userSocket!, target).then(() => {
// 				hide(activeMatchesModal);
// 				hide(createMatchButton);
// 				hide(searchForMatchButton);
// 				show(startMatchButton);
// 			});
// 		}
// 		show(activeMatchesModal);
// 	});
// };
