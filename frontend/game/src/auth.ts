import { show, hide, updateProfileUI} from "./ui.js";
import { nullWebsocket} from "./websocket.js";

export async function registerUser(usernameInput: HTMLInputElement, displaynameInput: HTMLInputElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement): 
Promise<{ status: number; userId?: string; setupToken?: string; error?: string }> {

	const username = usernameInput.value.trim();
    const display_name = displaynameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

	const usernameRegex = /^[a-zA-Z0-9_]+$/;
	
    if (!usernameRegex.test(username)) {
		return { 
			status: 1, 
            error: "El usuario solo puede contener letras, números y guiones bajos (sin espacios)." 
        };
    }
	
    if (username.length < 3 || username.length > 20) {
		return { 
			status: 1, 
            error: "El usuario debe tener entre 3 y 20 caracteres." 
        };
    }
	
	// ! Descomentar cuando este completo
/* 	const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
	
	if (!PASSWORD_REGEX.test(passwordInput.value)) {
		alert("Contraseña insegura");
		return {status: 1};
	} */
		
	const body = {
        username: username,
        display_name: display_name,
        email: email,
        password: password
    };

	try {

		const res = await fetch("/api/sign-up", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			credentials: "include"
		});

		const result = await res.json();

		if (res.ok && result.status === "ok" && result.userId && result.setupToken) {
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

		const res = await fetch("/api/login", {
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

    if (userSocket) {
        userSocket.close(); 
    }

    nullWebsocket();

    try {
        const res = await fetch("/api/logout", {
            method: "POST",
            credentials: "include" 
        });

        updateProfileUI("PONG", "ft_transcendence.pong.com");

    } catch (err) {
        console.error("Logout error (network):", err);
        updateProfileUI("PONG", "ft_transcendence.pong.com");
    }
    if (logoutButton) {
   		hide(logoutButton);
	}
}

export async function configure2FA(setupToken: string, method: "2FAmail" | "skip", twoFAOptionModal: HTMLElement, loginModal: HTMLElement, registerModal: HTMLElement) {

	const res = await fetch("/api/set-2fa", {
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

export async function verify2FA(code: string, twoFAModal: HTMLElement, loginModal: HTMLElement) {
	if (!code) {
		alert("Ingresa el código 2FA");
		return;
	}

	try {
		const res = await fetch("/api/verify-2fa", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code }),
			credentials: "include"
		});

		const verifyResult = await res.json();

		if (verifyResult.status === "ok") {
			return true;
		} else {
			alert(verifyResult.error || "Código 2FA incorrecto");
			return false;
		}
	} catch (err) {
		console.error(err);
		alert("Error al verificar 2FA");
	}
}

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
    const intervalId = setInterval(async () => {
        const isValid = await validateSession();
        if (!isValid) {
            console.log("Session expired or Server restarted, logging out");
            // No pasamos botón porque es un logout automático
            await logoutUser(); 
            // Opcional: Detener el intervalo para que no siga intentando salir
            clearInterval(intervalId); 
        }
    }, 5 * 60 * 1000);
}
