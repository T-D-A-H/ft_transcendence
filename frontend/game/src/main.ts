import { 
	loginModal, openLogin, closeLogin, submitLoginButton,
	usernameInput, passwordInput, logoutButton,
	registerModal, openRegister, closeRegister, submitRegisterButton,
	regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput,
	startMatchButton, searchForMatchButton, createMatchButton, waitingPlayers,
	activeMatchesModal, playersListUL, renderMatchList,
	show, hide, canvas, paddle, twoFAModal, twoFAOptionModal, twoFAEmailButton,
	twoFASkipButton, twoFASubmitButton,twoFAInput, initialLoader, GoogleButton} from "./ui.js";

import { registerUser } from "./auth/register.js"
import { login } from "./auth/login.js"
import { createNewMatch, searchForMatch, joinMatch, playerJoinedMatch} from "./match.js"
import { sendKeyPressEvents } from "./keypress.js";
import { drawGame } from "./draw.js";
import { set2FA } from "./auth/set2FA.js";
import {
	validateSession,
	startTokenValidationInterval,
	performLogout,
	refreshToken,
	setUserSocket
} from "./auth/session.js";


if (!loginModal || !openLogin || !closeLogin || !submitLoginButton ||
	!usernameInput || !passwordInput ||
	!registerModal || !openRegister || !closeRegister || !submitRegisterButton ||
	!regUsernameInput || !regDisplaynameInput || !regEmailInput || !regPasswordInput ||
	!waitingPlayers || !startMatchButton || !searchForMatchButton || !createMatchButton ||
	!activeMatchesModal || !playersListUL || !GoogleButton || !renderMatchList
	|| !canvas || !paddle) {
	console.error("One or more UI elements are missing");
}

let userSocket: WebSocket | null = null;

openLogin.onclick = () => show(loginModal);
closeLogin.onclick = () => hide(loginModal);
openRegister.onclick = () => show(registerModal);
closeRegister.onclick = () => hide(registerModal);

function showLoader() {
	show(initialLoader);
}

function hideLoader() {
	hide(initialLoader);
}

// Inicializar conexión WebSocket
function initializeWebSocket() {
	showLoader();
	userSocket = new WebSocket(`wss://localhost:4000/proxy-game`);
	setUserSocket(userSocket);

	userSocket.onopen = () => {
		console.log("User WebSocket connected");
		show(startMatchButton);
		hideLoader();
	};

	userSocket.onerror = (err) => { 
		console.error(err); 
		userSocket?.close();
		userSocket = null;
		alert("Error de conexión. Por favor, inicia sesión nuevamente.");
		hide(startMatchButton);
		hideLoader();
	};

	userSocket.onclose = () => {
		console.log("WebSocket disconnected");
		userSocket = null;
		hide(startMatchButton);
		hideLoader();
	};
}

// Inicializar UI basado en sesión
async function initializeUI() {
	showLoader();
	const hasSession = await validateSession();

	if (hasSession) {
		// Usuario autenticado
		hide(openLogin);
		hide(openRegister);
		show(logoutButton);
		show(createMatchButton);
		show(searchForMatchButton);
		show(startMatchButton);
		initializeWebSocket();
		startTokenValidationInterval();
	} else {
		// Usuario NO autenticado
		hide(logoutButton);
		hide(createMatchButton);
		hide(searchForMatchButton);
		hide(startMatchButton);
		show(openLogin);
		show(openRegister);
		hideLoader();
	}
}

// Inicializar
initializeUI();

setInterval(refreshToken, 5 * 60 * 1000);

GoogleButton.onclick = async () => {
	window.location.href = "/auth/google";
}

// LOGIN
submitLoginButton.onclick = async () => {
	showLoader();

	try {
		const result = await login(usernameInput, passwordInput);

		// Caso 1: Requiere 2FA
		if (result.status === "requires_2fa" && result.method === "email") {
			hideLoader();
			show(twoFAModal);

			twoFASubmitButton.onclick = async () => {
				const code = twoFAInput.value.trim();
				if (!code) {
					alert("Ingresa el código 2FA");
					return;
				}

				showLoader();

				try {
					const res = await fetch("/api/verify-2fa", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ code }),
						credentials: "include" // Enviar cookies
					});

					const verifyResult = await res.json();

					if (verifyResult.status === "ok") {
						// Login completo, sesión en cookie
						hide(twoFAModal);
						hide(openRegister);
						hide(openLogin);
						hide(loginModal);
						show(createMatchButton);
						show(searchForMatchButton);
						show(startMatchButton);
						show(logoutButton);
						initializeWebSocket();
						startTokenValidationInterval();
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

		} else if (result.status === 0) {
			// Login exitoso sin 2FA
			hide(twoFAModal);
			hide(openRegister);
			hide(openLogin);
			hide(loginModal);
			show(createMatchButton);
			show(searchForMatchButton);
			show(startMatchButton);
			show(logoutButton);
			initializeWebSocket();
			startTokenValidationInterval();
			hideLoader();

		} else {
			// Credenciales incorrectas
			alert(result.error || "Usuario o contraseña incorrectos");
			hideLoader();
		}

	} catch (err) {
		console.error(err);
		alert("Error al iniciar sesión");
		hideLoader();
	}
};

// REGISTRO
submitRegisterButton.onclick = async () => {
	const result = await registerUser(
		regUsernameInput,
		regDisplaynameInput,
		regEmailInput,
		regPasswordInput
	);

	if (result.status !== 0 || !result.userId || !result.setupToken) return;

	show(twoFAOptionModal);

	twoFAEmailButton.onclick = async () => {
		const data = await set2FA("2FAmail", result.setupToken);
		if (data.status === "ok") {
			hide(twoFAOptionModal);
			hide(registerModal);
			show(loginModal);
		} else {
			alert(data.error || "Error al configurar 2FA");
		}
	};

	twoFASkipButton.onclick = async () => {
		const data = await set2FA("skip", result.setupToken);
		if (data.status === "ok") {
			hide(twoFAOptionModal);
			hide(registerModal);
			show(loginModal);
		} else {
			alert(data.error || "Error al configurar 2FA");
		}
	};
};

// LOGOUT
logoutButton.onclick = async () => {
	await performLogout();
};

// CREAR MATCH
createMatchButton.onclick = () => {
	if (!userSocket || userSocket.readyState !== WebSocket.OPEN) {
		alert("WebSocket not ready. Try again in a moment.");
		return;
	}

	createNewMatch(userSocket!).then((new_match_status) => {
		if (new_match_status === 0) {
			alert("Match created");
		} else if (new_match_status === 1) {
			alert("Match already created.");
		} else if (new_match_status === 2) {
			alert("An error occured creating your match.");
		}
	});
}

// BUSCAR MATCH
searchForMatchButton.onclick = () => {
	if (!userSocket || userSocket.readyState !== WebSocket.OPEN) {
		alert("WebSocket not ready. Try again in a moment.");
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

			btn.onclick = () => {
				if (!userSocket || userSocket.readyState !== WebSocket.OPEN) {
					userSocket!.onopen = () => joinMatch(userSocket!, target);
				} else {
					joinMatch(userSocket!, target);
				}
				hide(activeMatchesModal);
			};
		}
		show(activeMatchesModal);
	});
};

// INICIAR MATCH
startMatchButton.onclick = () => {
	if (!userSocket || userSocket.readyState !== WebSocket.OPEN) {
		alert("WebSocket not ready. Try again in a moment.");
		return;
	}

	show(waitingPlayers);
	playerJoinedMatch(userSocket!).then((joined_status) => {
		if (joined_status === 0) {
			hide(waitingPlayers);
		} else if (joined_status === 1) {
			alert("Error joining match");
		}
	});
	sendKeyPressEvents(userSocket!);
	drawGame(userSocket!, canvas!, paddle!);
};
