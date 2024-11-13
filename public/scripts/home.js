const linkDesploy = process.env.LINK_DESPLOY;

window.addEventListener("load", (e) => {
	fetch(`${linkDesploy}/session`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
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
	});

	setTimeout(() => {
		window.location.href = "/views/index.html";
	}, 2000);
});
