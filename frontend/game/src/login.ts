export async function login(
	usernameInput: HTMLInputElement,
	passwordInput: HTMLInputElement,
	option: "skip" | "2FAmail"
): Promise<{ status: number | string; token?: string; tempToken?: string }> {

	const body = {
		display_name: usernameInput.value,
		password: passwordInput.value
	};

	let url: string;

	if (option === "skip") {
		url = "/proxy-login";
	} else {
		url = "/login-2fa-mail";
	}

	try {
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			credentials: "include"
		});

		const result = await res.json();

		if (res.ok && result.token) {
			return { status: 0, token: result.token };
		}

		if (option === "2FAmail" && result.status === "2fa_required" && result.tempToken) {
			return { status: "2fa_required", tempToken: result.tempToken };
		}

		return { status: 1 };
	} catch (err) {
		console.error(err);
		return { status: 1 };
	}
}
