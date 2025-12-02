import { 
	loginModal, openLogin, closeLogin, submitLoginButton,
	usernameInput, passwordInput, logoutButton,
	registerModal, openRegister, closeRegister, submitRegisterButton,
	regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput,
	startMatchButton, waitingPlayers, 
	show, hide, canvas, paddle, twoFAModal,twoFASubmitButton,twoFAInput,} from "./ui.js";
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

let tempToken2FA: string | null = null;
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
if (!token || token === "null") {
    show(openLogin);
    show(openRegister);
    hide(logoutButton);
    hide(startMatchButton);
} else {
    hide(openLogin);
    hide(openRegister);
    show(logoutButton);
    initializeWebSocket(token);
}

submitLoginButton.onclick = async () => {
    const result = await loginUser(usernameInput, passwordInput);

    if (result.status === 0 && result.token) {
        // Esto fuera si quitamos el Token 2FA Ignoramos Siempre de momento
        localStorage.setItem("token", result.token);
        hide(twoFAModal);
        hide(openRegister);
        hide(openLogin);
        hide(loginModal);
        show(logoutButton);
        initializeWebSocket(result.token);
    } 
    //! DESCOMENTAR PARA 2FA
/*     else if (result.status === "2fa_required" && result.tempToken) {
        tempToken2FA = result.tempToken;
        show(twoFAModal);

        twoFASubmitButton.onclick = async () => {
            const code = twoFAInput.value;
            if (!code)
                return alert("Ingresa el código 2FA");

            try {
                // SI esta todo , lo enviamos al back para comprobar y inicar sesion
				const code = twoFAInput.value;
				const res = await fetch("/proxy-login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					 body: JSON.stringify({ tempToken: tempToken2FA, code })
				});

                const verifyResult = await res.json();
                
                // SI esta todo bien iniciamos
                if (verifyResult.status === "ok" && verifyResult.token) {
					localStorage.setItem("token", verifyResult.token);
                    hide(twoFAModal);
                    hide(openRegister);
                    hide(openLogin);
                    hide(loginModal);
                    show(logoutButton);
                    initializeWebSocket(verifyResult.token);
					tempToken2FA = null;
                } else {
                    alert(verifyResult.error || "Código 2FA incorrecto");
                }
            } catch (err) {
                console.error(err);
                alert("Error al verificar 2FA");
            }
        };
    } 
    else {
        alert("Login failed");
    } */
};


submitRegisterButton.onclick = async () => {
	const status = await registerUser(regUsernameInput, regDisplaynameInput, regEmailInput, regPasswordInput);
	if (status === 0) 
		hide(registerModal);
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

