
import { 
	loginModal, openLogin, closeLogin, submitLoginButton,
	usernameInput, passwordInput,
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

submitLoginButton.onclick = async () => {
	const { status, token } = await loginUser(usernameInput, passwordInput);
	if (status === 0 && token) {
		hide(loginModal);
		show(startMatchButton);
		userSocket = new WebSocket(`ws://localhost:4000/proxy-game?token=${token}`);
		userSocket.onopen = () => console.log("User WebSocket connected");
		userSocket.onerror = (err) => { console.error(err); userSocket?.close(); };
	}
};


openRegister.onclick = () => show(registerModal);
closeRegister.onclick = () => hide(registerModal);

submitRegisterButton.onclick = async () => {
	const status = await registerUser(regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput);
	if (status === 0) 
		hide(registerModal);
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
	searchForPlayers(userSocket!).then((start_status) => {

		if (start_status !== 1) return;
		if (!userSocket) return;

		hide(waitingPlayers);

		sendKeyPressEvents(userSocket!);
		drawGame(userSocket!, canvas!, paddle!);

	});
};

