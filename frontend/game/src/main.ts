import { 
	loginModal, openLoginButton, closeLoginButton, submitLoginButton,
	usernameInput, passwordInput, logoutButton,
	registerModal, openRegisterButton, closeRegisterButton, submitRegisterButton,
	regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput,
	startMatchButton, searchForMatchButton, createMatchButton, waitingPlayers,
	activeMatchesModal, playersListUL, renderMatchList,
	show, hide, canvas, paddle, twoFAModal, twoFAOptionModal, twoFAEmailButton,
	twoFASkipButton, twoFASubmitButton, twoFAInput, loadAnimation, showLoader, hideLoader} from "./ui.js";

import { registerUser,  loginUser } from "./login-register.js"
import { initializeWebSocket } from "./websocket.js";
import { sendKeyPress, playerJoinedMatch, joinMatch, createNewMatch, searchForMatch } from "./events.js";


if (!loginModal || !openLoginButton || !closeLoginButton || !submitLoginButton || !usernameInput || !passwordInput || !logoutButton ||
	!registerModal || !openRegisterButton || !closeRegisterButton || !submitRegisterButton || !regUsernameInput || !regDisplaynameInput || !regEmailInput || !regPasswordInput ||
	!startMatchButton || !searchForMatchButton || !createMatchButton || !waitingPlayers || !activeMatchesModal || !playersListUL || !renderMatchList ||
	!twoFAModal || !twoFAOptionModal || !twoFAEmailButton || !twoFASkipButton || !twoFASubmitButton || twoFAInput || !loadAnimation ||
	!show || !hide || !canvas || !paddle) {
		console.error("One or more UI elements are missing");
}


let tempToken2FA: string | null | undefined = null;
let userSocket: WebSocket | null = null;

openLoginButton.onclick = () => show(loginModal);
closeLoginButton.onclick = () => hide(loginModal);
openRegisterButton.onclick = () => show(registerModal);
closeRegisterButton.onclick = () => hide(registerModal);

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
		headers: { 
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ token })
	});

	const data = await res.json();
	if (data.status === "ok") {
		localStorage.removeItem("token");
		hide(createMatchButton);
		hide(searchForMatchButton);
		hide(logoutButton);
		hide(startMatchButton);
		show(openLoginButton);
		show(openRegisterButton);
	}
};

createMatchButton.onclick = () => {
    if (!userSocket) {
        alert("WebSocket not ready");
        return;
    }

	createNewMatch(userSocket!).then((new_match_status) => {
		if (new_match_status === 0) {
			alert("Match created");
			hide(createMatchButton);
			hide(searchForMatchButton);
			show(startMatchButton);
			// hide(createMatchButton);
		}
		else if (new_match_status === 1) {
			alert("Match already created.");
		}
		else if (new_match_status === 2) {
			alert("An error occured creating your match.")
		}
	});
}

searchForMatchButton.onclick = () => {
	if (!userSocket) {
        alert("WebSocket not ready");
        return;
    }

	searchForMatch(userSocket!).then((matches) => {

		if (!matches) {
			alert("No Matches found.");
			hide(activeMatchesModal);
			return;
		}
		const joinButtons = renderMatchList(matches!);
		for (const btn of joinButtons) {
			const target = btn.dataset.username!;
			btn.onclick = () => joinMatch(userSocket!, target).then(() => {
				hide(activeMatchesModal);
				hide(createMatchButton);
				hide(searchForMatchButton);
				show(startMatchButton);
			});
		}
		show(activeMatchesModal);
	});
};

startMatchButton.onclick = () => {
    if (!userSocket) {
        alert("WebSocket not ready");
        return;
    }
	hide(startMatchButton);
	show(waitingPlayers);
    playerJoinedMatch(userSocket!).then((joined_status) => {
    	if (joined_status === 0) {
    		hide(waitingPlayers);
    	}
    	else if (joined_status === 1) {
			hide(waitingPlayers);
			show(startMatchButton);
    		alert("Player couldnt join match");
    	}
    });
	hide(waitingPlayers);
	sendKeyPress(userSocket!, canvas!, paddle!);
};