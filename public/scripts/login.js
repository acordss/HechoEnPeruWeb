const linkDesploy = "https://hecho-en-peru-qrudeuega-accordss-projects.vercel.app/views";

const modal = document.getElementById("signup__modal");
const buttonCloseModal = document.getElementById("button__modal--signup");

document.getElementById("login__form").addEventListener("submit", async (e) => {
	e.preventDefault();

	const form = e.target;
	const formData = new FormData(form);
	const data = Object.fromEntries(formData);

	console.log(data);

	fetch(`${linkDesploy}/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
		mode: "no-cors",
	})
		.then(async (res) => {
			if (!res.ok) {
				return res.json().then((errorData) => {
					throw new Error(errorData.message || "Error desconocido");
				});
			}
			return res.json();
		})
		.then((q) => {
			const modal__title = document.querySelector(".titulo__modal--signup");
			const modal__text = document.querySelector(".text__modal--signup");

			console.log(q.message);

			if (q.success) {
				modal__title.innerHTML = "Inicio de sesión exitoso";
				modal__text.innerHTML = q.message;

				modal.showModal();

				setTimeout(() => {
					window.location.href = "/views/private/home.html";
				}, 2000);
			} else {
				modal__title.innerHTML = "Error en el inicio de sesión";
				modal__text.innerHTML = q.message;
				modal.showModal();
			}

			buttonCloseModal.addEventListener("click", (e) => {
				modal.setAttribute("close", "");
			});

			modal.addEventListener("animationend", () => {
				if (modal.hasAttribute("close")) {
					modal.close();
					modal.removeAttribute("close");
				}
			});
		});
});
