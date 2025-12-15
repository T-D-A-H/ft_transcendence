// src/auth/session.ts
import { hide, show } from "../ui.js";
import {
	logoutButton,
	waitingPlayers,
	createMatchButton,
	searchForMatchButton,
	startMatchButton,
	openLogin,
	openRegister
} from "../ui.js";

let userSocket: WebSocket | null = null;

export function setUserSocket(socket: WebSocket | null) {
	userSocket = socket;
}

// Validar si el usuario tiene sesión activa
export async function validateSession(): Promise<boolean> {
	try {
		const res = await fetch("/api/validate-token", {
			method: "GET",
			credentials: "include"
		});

		if (res.ok) {
			const data = await res.json();
			return data.valid === true;
		}
		return false;
	} catch (err) {
		console.error("Error validating session:", err);
		return false;
	}
}

// Validar token periódicamente
export function startTokenValidationInterval() {
	setInterval(async () => {
		const isValid = await validateSession();
		if (!isValid) {
			console.log("Session expired, logging out");
			await performLogout();
		}
	}, 5 * 60 * 1000);
}

// Función reutilizable para hacer logout
export async function performLogout() {
	if (userSocket) {
		userSocket.close();
		userSocket = null;
	}

	try {
		const res = await fetch("/api/logout", {
			method: "POST",
			credentials: "include"
		});

		const data = await res.json();
		if (data.status === "ok") {
			// Cookies eliminadas automáticamente por el servidor
			hide(logoutButton);
			hide(waitingPlayers);
			hide(createMatchButton);
			hide(searchForMatchButton);
			hide(startMatchButton);
			show(openLogin);
			show(openRegister);
		}
	} catch (err) {
		console.error("Logout error:", err);
	}
}

// Refrescar token antes de que expire
export async function refreshToken(): Promise<boolean> {
	try {
		const res = await fetch("/api/refresh-token", {
			method: "POST",
			credentials: "include"
		});

		if (res.ok) {
			console.log("Token refreshed");
			return true;
		}
		return false;
	} catch (err) {
		console.error("Error refreshing token:", err);
		return false;
	}
}
