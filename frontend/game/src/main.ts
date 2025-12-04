import { 
	loginModal, openLogin, closeLogin, submitLoginButton,
	usernameInput, passwordInput, logoutButton,
	registerModal, openRegister, closeRegister, submitRegisterButton,
	regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput,
	startMatchButton, waitingPlayers, 
	show, hide, canvas, paddle, twoFAModal,  twoFAOptionModal, twoFAEmailButton,
	twoFASkipButton, twoFASubmitButton,twoFAInput,initialLoader,} from "./ui.js";
import { registerUser } from "./register.js"
import { login } from "./login.js"
import { searchForPlayers } from "./search.js"
import { sendKeyPressEvents } from "./keypress.js";
import { drawGame } from "./draw.js";


if (!loginModal || !openLogin || !closeLogin || !submitLoginButton ||
	!usernameInput || !passwordInput ||
	!registerModal || !openRegister || !closeRegister || !submitRegisterButton ||
	!regUsernameInput || !regDisplaynameInput || !regEmailInput || !regPasswordInput ||
	!waitingPlayers || !startMatchButton || !canvas || !paddle) {
	console.error("One or more UI elements are missing");
}

let tempToken2FA: string | null | undefined = null;
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

// Función para inicializar la conexión WebSocket con el token
function initializeWebSocket(token: string) {
	showLoader();
	userSocket = new WebSocket(`ws://localhost:4000/proxy-game?token=${token}`);
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

showLoader();

// Verificar si hay token al cargar la página
const token = localStorage.getItem("token");
if (!token || token === "null") {
	// Usuario NO autenticado
	hide(openLogin);
	hide(openRegister);
	hide(logoutButton);
	// Mostrar solo después de ocultar todo
	show(openLogin);
	show(openRegister);
	setTimeout(hideLoader, 300)
} else {
	// Usuario autenticado
	hide(openLogin);
	hide(openRegister);
	show(logoutButton);
	initializeWebSocket(token);
}


submitLoginButton.onclick = async () => {
	showLoader();
  
	try {
		// 1. PRIMERO: Intentar login (backend valida usuario + contraseña)
		const result = await login(usernameInput, passwordInput);

		// 2. El backend decide si necesita 2FA DESPUÉS de validar credenciales
		if (result.status === "requires_2fa" && result.method === "email") {
			// Usuario válido y necesita 2FA
			hideLoader();
			show(twoFAModal);
			tempToken2FA = result.tempToken; // Token temporal del backend
			
			// Configurar el botón de verificación 2FA
			twoFASubmitButton.onclick = async () => {
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
						body: JSON.stringify({ 
							tempToken: tempToken2FA, 
							code 
						})
					});
					
					const verifyResult = await res.json();
					
					if (verifyResult.status === "ok" && verifyResult.token) {
						// Login completo
						localStorage.setItem("token", verifyResult.token);
						hide(twoFAModal);
						hide(openRegister);
						hide(openLogin);
						hide(loginModal);
						show(logoutButton);
						initializeWebSocket(verifyResult.token);
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
			
		} else if (result.status === 0 && result.token) {
			// Login exitoso sin 2FA
			localStorage.setItem("token", result.token);
			hide(twoFAModal);
			hide(openRegister);
			hide(openLogin);
			hide(loginModal);
			show(logoutButton);
			initializeWebSocket(result.token);
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

submitRegisterButton.onclick = async () => {
	const result = await registerUser(regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput);

	if (result.status === 0 && result.userId && result.setupToken) {
		show(twoFAOptionModal);

		twoFAEmailButton.onclick = async () => {
			const res = await fetch("/set-2fa", {
				method: "POST",
				headers: { 
					"Content-Type": "application/json",
					"Authorization": `Bearer ${result.setupToken}`   // <- aquí
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
};


logoutButton.onclick = () => {
	if (userSocket) {
		userSocket.close();
		userSocket = null;
	}
	localStorage.removeItem("token");
	hide(startMatchButton);
	hide(waitingPlayers);
	hide(logoutButton);
	show(openLogin);
	show(openRegister);
};

startMatchButton.onclick = () => {
	if (!userSocket) {
		alert("No WebSocket connection. Please log in again.");
		return;
	}
	if (userSocket.readyState !== WebSocket.OPEN) {
		alert("WebSocket not ready. Try again in a moment.");
		return;
	}
	hide(startMatchButton);
	show(waitingPlayers);
	//showLoader();
	console.log("Buscando Partida");
	searchForPlayers(userSocket!).then((start_status) => {
		//hideLoader();
		if (start_status !== 1)
			return;
		if (!userSocket)
			return;

		hide(waitingPlayers);

		sendKeyPressEvents(userSocket!);
		drawGame(userSocket!, canvas!, paddle!);

	});
};

