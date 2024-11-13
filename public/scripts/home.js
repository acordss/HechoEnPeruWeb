const linkDesploy = "https://hecho-en-peru-8n034rrxm-accordss-projects.vercel.app";

window.addEventListener("load", (e) => {
	fetch(`${linkDesploy}/session`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		mode: "no-cors",
	})
		.then((res) => res.json())
		.then((q) => {
			console.log(q.session);
			const msj = document.getElementById("welcome__message");
			msj.innerText = `¡Bienvenido ${q.session.Nombre}!`;
		});
});

document.getElementById("logout__session").addEventListener("click", async (e) => {
	e.preventDefault();
	fetch(`${linkDesploy}/logout`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		mode: "no-cors",
	});

	setTimeout(() => {
		window.location.href = "/views/index.html";
	}, 2000);
});
