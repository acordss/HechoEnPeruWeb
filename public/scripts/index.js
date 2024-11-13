const modal = document.getElementById("signup__modal");
const buttonCloseModal = document.getElementById("button__modal--signup");
const btnCart = document.querySelector(".container-cart-icon");

buttonCloseModal.addEventListener("click", (e) => {
	modal.setAttribute("close", "");
});

modal.addEventListener("animationend", () => {
	if (modal.hasAttribute("close")) {
		modal.close();
		modal.removeAttribute("close");
	}
});

btnCart.addEventListener("click", (e) => {
	const titleModal = document.querySelector(".titulo__modal--signup");
	const textModal = document.querySelector(".text__modal--signup");

	console.log(textModal);

	titleModal.innerHTML = "Acceso no autorizado";
	textModal.innerHTML = "Debes iniciar sesión";

	modal.showModal();
});
