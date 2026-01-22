import { show, hide} from "./ui.js";
import { connectWithToken, nullWebsocket} from "./websocket.js";
import {getProfileInfo} from "./main.js";

export async function registerUser(usernameInput: HTMLInputElement, displaynameInput: HTMLInputElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement): 
Promise<{ status: number; userId?: string; setupToken?: string; error?: string }> {

	const body = {
		username: usernameInput.value,
		display_name: displaynameInput.value,
		email: emailInput.value,
		password: passwordInput.value
	};

	try {
		const res = await fetch("/proxy-register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			credentials: "include"
		});

		const result = await res.json();

		if (result.ok && result.status === "ok" && result.userId && result.setupToken) {
			return { status: 0, userId: String(result.userId), setupToken: result.setupToken };
		}

		return { status: 1, error: result.error || "Error en el registro"};
	}
	catch (err) {

		console.error("Register error:", err);
		return { status: 1, error: "Error de conexión" };
	}
}





export async function loginUser(usernameInput: HTMLInputElement, passwordInput: HTMLInputElement): 
Promise<{ status: number | string; token?: string; tempToken?: string; method?: string; error?: string; }> {

	const body = {
		username: usernameInput.value,
		password: passwordInput.value
	};

	try {

		const res = await fetch("/proxy-login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			credentials: "include"
		});

		const result = await res.json();

		// Caso 1: Login exitoso (sin 2FA o ya validado)
		if (result.status === "ok" && result.token) {

			localStorage.setItem("token", result.token);
			await connectWithToken(result.token);
			return { status: 0, token: result.token };
		}

		// Caso 2: Requiere 2FA
		if (result.status === "requires_2fa") {
			
			return { status: "requires_2fa", method: result.method, tempToken: result.tempToken };
		}

		// Caso 3: Error (credenciales incorrectas u otro error)
		return { status: 1, error: result.error || "User/Password Incorrect" };

	} catch (err) {

		console.error("Error en login:", err);
		return { status: 1, error: "Connection Error!" };
	}
}

export async function logoutUser(logoutButton: HTMLButtonElement) {

	const token = localStorage.getItem("token");

	const res = await fetch("/logout", {

		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ token })
		
	});

	const data = await res.json();

	if (data.status === "ok") {
		hide(logoutButton);
		localStorage.removeItem("token");
		getProfileInfo(false);
		nullWebsocket();

	}
}

export async function configure2FA(setupToken: string, method: "2FAmail" | "skip", twoFAOptionModal: HTMLElement, loginModal: HTMLElement, registerModal: HTMLElement) {

	const res = await fetch("/set-2fa", {
		method: "POST",
		headers: { 
			"Content-Type": "application/json",
			"Authorization": `Bearer ${setupToken}`
		},
		body: JSON.stringify({ method })
	});

	const data = await res.json();

	if (data.status === "ok") {

		hide(twoFAOptionModal);
		show(loginModal);
	}
    else {

		alert(data.error || "Error al configurar 2FA");
		hide(twoFAOptionModal);
		show(registerModal);
	}
}

export async function verify2FA(tempToken: string, code: string, twoFAModal: HTMLElement, loginModal: HTMLElement) {

	const res = await fetch("/verify-2fa-mail", {

		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ tempToken, code })
	});

	const verifyResult = await res.json();

	if (verifyResult.status === "ok" && verifyResult.token) {

		localStorage.setItem("token", verifyResult.token);
		hide(twoFAModal);
		hide(loginModal);
		await connectWithToken(verifyResult.token);
		return true;
	}
    else {

		alert(verifyResult.error || "Código 2FA incorrecto");
		return false;
	}
}