export async function registerUser(
  usernameInput: HTMLInputElement,
  displaynameInput: HTMLInputElement,
  emailInput: HTMLInputElement,
  passwordInput: HTMLInputElement
): Promise<{ status: number; userId?: string; setupToken?: string; error?: string }> {
	const body = {
		username: usernameInput.value,
		display_name: displaynameInput.value,
		email: emailInput.value,
		password: passwordInput.value
	};

	try {
		// ! Descomentar cuando este completo
/* 		const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

		if (!PASSWORD_REGEX.test(passwordInput.value)) {
			alert("Contraseña insegura");
			return { 
				status: 1
			};
		} */

		const res = await fetch("/api/sign-up", {
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