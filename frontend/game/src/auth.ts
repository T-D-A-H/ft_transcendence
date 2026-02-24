import { show, hide, updateProfileUI, updateSessionButtons} from "./ui.js";
import { getUserSocket, closeUserSocket, setUserSocket} from "./websocket.js";

export async function registerUser(usernameInput: HTMLInputElement, displaynameInput: HTMLInputElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement): 
Promise<{ status: number; userId?: string; setupToken?: string; msg?: string }> {

	const username = usernameInput.value.trim();
    const display_name = displaynameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

	// ! ---- Validate Username ----
	const usernameRegex = /^[a-zA-Z0-9_]+$/;
	
    if (!usernameRegex.test(username)) {
		return { 
			status: 1, 
			msg: "The username can only contain alphanumeric characters and - (no spaces)." 
        };
    }
	
    if (username.length < 3 || username.length > 20) {
		return { 
			status: 1, 
			msg: "The username must contain between 3 and 20 characters." 
        };
    }
	
	// ! ---- Validate Password ----
	const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
	
	if (!PASSWORD_REGEX.test(passwordInput.value)) {
		return {status: 1, msg: "The password must contain at least 8 character, a capital and lowercase character, a number and a symbol"};
	}

	// ! ---- Validate Email ----
	const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!emailRegex.test(email)) {
        return { 
            status: 1, 
            msg: "Incorrect email format (example: user@domain.com)" 
        };
    }
		
	const body = {
        username: username,
        display_name: display_name,
        email: email,
        password: password
    };

	try {

		const res = await fetch("/api/users/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			credentials: "include"
		});

		const result = await res.json();

		if (res.ok && result.status === "ok" && result.userId && result.setupToken) {
			return { status: 0, userId: String(result.userId), setupToken: result.setupToken };
		}

		return { status: 1, msg: result.msg || "Error en el registro"};
	}
	catch (err) {

		console.error("Register error:", err);
		return { status: 1, msg: "Connection error" };
	}
}


export async function loginUser(usernameInput: HTMLInputElement, passwordInput: HTMLInputElement): 
Promise<{ status: number | string; token?: string; tempToken?: string; method?: string; error?: string; }> {

	const body = {
		username: usernameInput.value,
		password: passwordInput.value
	};

	try {

		const res = await fetch("/api/sessions/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			credentials: "include"
		});

		const result = await res.json();

		// Caso 1: Login exitoso (sin 2FA)
		if (result.status === "ok") {
			return { 
				status: 0
				// ✅ Token está en httpOnly cookie, NO lo enviamos al frontend
			};
		}

		// Caso 2: Requiere 2FA
		if (result.status === "requires_2fa") {
			return { 
				status: "requires_2fa",
				method: result.method // "email"
				// ✅ Cookie temporal en el servidor, no aquí
			};
		}

		// Caso 3: Error (credenciales incorrectas u otro error)
		return { status: 1, error: result.error || "User/Password Incorrect" };

	} catch (err) {

		console.error("Error en login:", err);
		return { status: 1, error: "Connection Error!" };
	}
}

export async function logoutUser(logoutButton?: HTMLButtonElement) {

    if (getUserSocket()) {
		closeUserSocket();
         
    }

    setUserSocket(null);

    try {
        const res = await fetch("/api/sessions/current", {
            method: "DELETE",
            credentials: "include" 
        });

        updateProfileUI("", "PONG", "ft_transcendence.pong.com");
		updateSessionButtons(false);

    } catch (err) {
        console.error("Logout error (network):", err);
        updateProfileUI("", "PONG", "ft_transcendence.pong.com");
    }
    updateSessionButtons(false);
}

export async function configure2FA(setupToken: string, method: "2FAmail" | "skip", twoFAOptionModal: HTMLElement, loginModal: HTMLElement, registerModal: HTMLElement) {

	const res = await fetch("/api/users/2FA", {
		method: "PATCH",
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

		alert(data.error);
		hide(twoFAOptionModal);
		show(registerModal);
	}
}

export async function verify2FA(code: string, twoFAModal: HTMLElement, loginModal: HTMLElement) {
	if (!code) {
		alert("Ingresa el código 2FA");
		return;
	}

	try {
		const res = await fetch("/api/sessions/current", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code }),
			credentials: "include"
		});

		const verifyResult = await res.json();

		if (verifyResult.status === "ok") {
			return true;
		} else {
			alert(verifyResult.error);
			return false;
		}
	} catch (err) {
		console.error(err);
		alert("Error al verificar 2FA");
	}
}
