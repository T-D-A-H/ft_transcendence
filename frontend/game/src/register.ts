export async function registerUser(usernameInput: HTMLInputElement, displaynameInput: HTMLInputElement, emailInput: HTMLInputElement, passwordInput: HTMLInputElement ): Promise<number> {

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

		if (res.ok) {
			alert("Registration successful! You can now log in.");
			return 0;
		} else {
			alert(result.error);
			return 1;
		}
	} catch (err) {
		console.error(err);
		alert("Registration failed due to network error");
		return 1;
	}
}
