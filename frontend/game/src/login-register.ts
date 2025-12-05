
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

		if (res.ok && result.status === "ok" && result.userId && result.setupToken) {
			return { 
				status: 0, 
				userId: String(result.userId),
				setupToken: result.setupToken
			};
		}

		return { 
			status: 1,
			error: result.error || "Error en el registro"
		};
	} catch (err) {
		console.error("Register error:", err);
		return { 
			status: 1,
			error: "Error de conexión"
		};
	}
}

export async function loginUser(usernameInput: HTMLInputElement, passwordInput: HTMLInputElement): 
Promise<{ status: number | string; token?: string; tempToken?: string; method?: string; error?: string; }> {

	const body = {
		display_name: usernameInput.value,
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
			return { 
				status: 0, 
				token: result.token 
			};
		}

		// Caso 2: Requiere 2FA
		if (result.status === "requires_2fa") {
			return { 
				status: "requires_2fa",
				method: result.method, // "email" o "totp"
				tempToken: result.tempToken 
			};
		}

		// Caso 3: Error (credenciales incorrectas u otro error)
		return { 
			status: 1,
			error: result.error || "Error en el inicio de sesión" 
		};

	} catch (err) {
		console.error("Error en login:", err);
		return { 
		status: 1,
		error: "Error de conexión" 
		};
	}
}