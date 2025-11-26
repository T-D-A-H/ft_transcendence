const form = document.getElementById("loginForm") as HTMLFormElement;

if (!form) {
  throw new Error("No se encontró el formulario de login");
}

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const data = new FormData(form);
	const body = {
		display_name: data.get("display_name"),
		password: data.get("password")
	};

	const res = await fetch("/proxy-login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
		credentials: "include"
	});

	const result = await res.json();
	if (res.ok) {
		window.location.href = "/";
	} else {
		alert(result.error);
	}
});