const form = document.getElementById("RegisterForm") as HTMLFormElement;

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const body = {
        username: data.get("username"),
        display_name: data.get("display_name"),
        email: data.get("email"),
        password: data.get("password")
    };

    const res = await fetch("/proxy-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include"
    });

    const result = await res.json();
    if (res.ok) {
        window.location.href = "/login";
    } else {
        alert(result.error);
    }
});
