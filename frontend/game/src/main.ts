
import { 
	loginModal, openLogin, closeLogin, submitLoginButton,
	usernameInput, passwordInput, logoutButton,
	registerModal, openRegister, closeRegister, submitRegisterButton,
	regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput,
	startMatchButton, waitingPlayers, 
	show, hide, canvas, paddle, } from "./ui.js";
import { registerUser } from "./register.js"
import { loginUser } from "./login.js"
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

let userSocket: WebSocket | null = null;

openLogin.onclick = () => show(loginModal);
closeLogin.onclick = () => hide(loginModal);
openRegister.onclick = () => show(registerModal);
closeRegister.onclick = () => hide(registerModal);


// Función para inicializar la conexión WebSocket con el token
function initializeWebSocket(token: string) {
    userSocket = new WebSocket(`ws://localhost:4000/proxy-game?token=${token}`);
    userSocket.onopen = () => {
        console.log("User WebSocket connected");
        show(startMatchButton);
    };
    userSocket.onerror = (err) => { 
        console.error(err); 
        userSocket?.close();
        userSocket = null;
        alert("Error de conexión. Por favor, inicia sesión nuevamente.");
        hide(startMatchButton);
    };
    userSocket.onclose = () => {
        console.log("WebSocket disconnected");
        userSocket = null;
        hide(startMatchButton); 
    };
}

// Verificar si hay token al cargar la página
const token = localStorage.getItem("token");
if (token && token !== "null") {
	hide(openRegister);
	hide(openLogin);
	show(logoutButton);
    initializeWebSocket(token);
} else {
    alert("Debes iniciar sesión antes de jugar");
    hide(startMatchButton);
}

submitLoginButton.onclick = async () => {
	const { status, token } = await loginUser(usernameInput, passwordInput);
	if (status === 0 && token) {
		hide(openRegister);
		hide(openLogin);
		hide(loginModal);
		show(logoutButton);
		initializeWebSocket(token);
	}
};

submitRegisterButton.onclick = async () => {
	const status = await registerUser(regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput);
	if (status === 0) 
		hide(registerModal);
};

logoutButton.onclick = () => {
    // Cerrar WebSocket si existe
    if (userSocket) {
        userSocket.close();
        userSocket = null;
    }
    // Limpiar token
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
	console.log("Buscando Partida");
	searchForPlayers(userSocket!).then((start_status) => {

		if (start_status !== 1)
			return;
		if (!userSocket)
			return;

		hide(waitingPlayers);

		sendKeyPressEvents(userSocket!);
		drawGame(userSocket!, canvas!, paddle!);

	});
};

