// const form = document.getElementById("loginForm");

// if (!form) {
//   throw new Error("No se encontró el formulario de login");
// }

// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const data = new FormData(form as HTMLFormElement); // forzamos el tipo
//   const body = {
//     username: data.get("username"),
//     password: data.get("password")
//   };

//   const res = await fetch("http://backend:3000/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//     credentials: "include"
//   });

//   const result = await res.json();
//   if (res.ok) {
//     window.location.href = "/";
//   } else {
//     alert(result.error);
//   }
// });
