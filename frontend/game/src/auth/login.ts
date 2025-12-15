export async function login(
	usernameInput: HTMLInputElement,
	passwordInput: HTMLInputElement
): Promise<{ 
	status: number | string; 
	method?: string;
	error?: string;
}> {
	const body = {
		display_name: usernameInput.value,
		password: passwordInput.value
	};

	try {
		const res = await fetch("/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			credentials: "include" // ✅ Enviar y recibir cookies
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

		// Caso 3: Error (credenciales incorrectas)
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