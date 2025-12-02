export async function loginUser(
  usernameInput: HTMLInputElement,
  passwordInput: HTMLInputElement
): Promise<{ status: number | string; token?: string; tempToken?: string }> {

	const body = {
		display_name: usernameInput.value,
		password: passwordInput.value
	};

	try {
		const res = await fetch("/verify-2fa", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			credentials: "include"
		});

		const result = await res.json();

		// Cuando ya esta el 2FA required enviaos token JWT Definitivo
		if (res.ok && result.token) {
			return { status: 0, token: result.token };
		}
		
		// Primero enviamos el 2FA required con tu Token temporal
		//! DESCOMENTAR PARA EL 2FA
/* 		if (result.status === "2fa_required" && result.tempToken) {
			return { status: "2fa_required", tempToken: result.tempToken };
		} */

		return { status: 1 };

	} catch (err) {
		console.error(err);
		return { status: 1 };
	}
}
