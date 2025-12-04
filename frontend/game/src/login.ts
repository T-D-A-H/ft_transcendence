export async function login(
  usernameInput: HTMLInputElement,
  passwordInput: HTMLInputElement
): Promise<{ 
  status: number | string; 
  token?: string; 
  tempToken?: string;
  method?: string;
  error?: string;
}> {
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