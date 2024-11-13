const modal = document.getElementById("signup__modal");
const buttonCloseModal = document.getElementById("button__modal--signup");

document.getElementById("signup__form").addEventListener("submit", async (e) => {
	e.preventDefault();
	const form = e.target;
	const formData = new FormData(form);
	const data = Object.fromEntries(formData);

	fetch("https://hecho-en-peru-4fn1tozy6-accordss-projects.vercel.app/validar", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
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

			if (q.success) {
				modal__title.innerHTML = "Registro exitoso";
				modal__text.innerHTML = q.message;
			} else {
				modal__title.innerHTML = "Error en el registro";
				modal__text.innerHTML = q.message;
			}
			modal.showModal();

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
