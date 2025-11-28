
export async function loginUser(usernameInput: HTMLInputElement, passwordInput: HTMLInputElement ): Promise<{ status: number; token?: string }> {

	if (!usernameInput || !passwordInput) {
		console.error("Username or password input is missing");
		return { status: 1 };
	}

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

		if (res.ok && result.token) {
			return { status: 0, token: result.token };
		} else {
			alert(result.error);
			return { status: 1 };
		}
	} catch (err) {
		console.error(err);
		alert("Login failed due to network error");
		return { status: 1 };
	}
};