import { hide, show } from "../ui.js";
import {
	openLogin,
	openRegister,
	loginModal,
	twoFAModal,
	twoFAInput,
	twoFAOptionModal,
	registerModal,
	logoutButton,
	createMatchButton,
	searchForMatchButton,
	startMatchButton
} from "../ui.js";
import { set2FA } from "./set2FA.js";
import { startTokenValidationInterval } from "./session.js";
type LoginFlowDeps = {
	initializeWebSocket: () => void;
	showLoader: () => void;
	hideLoader: () => void;
};
let deps: LoginFlowDeps;

export function initLoginFlowDependencies(d: LoginFlowDeps) {
	deps = d;
}

export function onLoginSuccess() {
	hide(twoFAModal);
	hide(openRegister);
	hide(openLogin);
	hide(loginModal);

	show(createMatchButton);
	show(searchForMatchButton);
	show(startMatchButton);
	show(logoutButton);

	deps.initializeWebSocket();
	startTokenValidationInterval();
	deps.hideLoader();
}

/* =========================
   2FA VERIFICATION
========================= */
export async function handle2FAVerification() {
	const code = twoFAInput.value.trim();
	if (!code) {
		alert("Ingresa el código 2FA");
		return;
	}

	deps.showLoader();

	try {
		const res = await fetch("/api/verify-2fa", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code }),
			credentials: "include"
		});

		const verifyResult = await res.json();

		if (verifyResult.status === "ok") {
			twoFAInput.value = "";
			onLoginSuccess();
		} else {
			alert(verifyResult.error || "Código 2FA incorrecto");
			deps.hideLoader();
		}
	} catch (err) {
		console.error(err);
		alert("Error al verificar 2FA");
		deps.hideLoader();
	}
}

/* =========================
   2FA SETUP (REGISTER)
========================= */
export async function handle2FASetup(
	type: "2FAmail" | "skip",
	token: string
) {
	const data = await set2FA(type, token);

	if (data.status === "ok") {
		hide(twoFAOptionModal);
		hide(registerModal);
		show(loginModal);
	} else {
		alert(data.error || "Error al configurar 2FA");
	}
}