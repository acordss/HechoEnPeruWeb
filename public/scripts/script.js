const linkDesploy = "https://hecho-en-peru-8n034rrxm-accordss-projects.vercel.app";

const btnCart = document.querySelector(".container-cart-icon");
const containerCartProducts = document.querySelector(".container-cart-products");
const cartInfo = document.querySelector(".cart.product");
const rowInfo = document.querySelector(".row-product");
const productList = document.querySelector(".artesanias__container");
const valorTotal = document.querySelector(".total-pagar");
const countProducts = document.querySelector("#contador-productos");
const cartEmpty = document.querySelector(".cart-empty");
const cartTotal = document.querySelector(".cart-total");

let allProducts = [];

const showHTML = () => {
	if (!allProducts.length) {
		cartEmpty.classList.remove("hidden");
		rowInfo.classList.add("hidden");
		cartTotal.classList.add("hidden");
	} else {
		cartEmpty.classList.add("hidden");
		rowInfo.classList.remove("hidden");
		cartTotal.classList.remove("hidden");
	}

	rowInfo.innerHTML = "";

	let total = 0;
	let cantidadTotal = 0;

	allProducts.forEach((product) => {
		const containerProduct = document.createElement("div");
		containerProduct.classList.add("cart-product");

		containerProduct.innerHTML = `
            <div class="info-cart-product">
                <span class="cantidad-producto-carrito">${product.cantidad}</span>
                <p class="titulo-producto-carrito">${product.titulo}</p>
                <span class="precio-producto-carrito">S/${product.precio}</span>
            </div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="icon-close">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;

		rowInfo.append(containerProduct);

		total = total + parseFloat(product.cantidad * product.precio);
		cantidadTotal = cantidadTotal + product.cantidad;
	});

	valorTotal.innerText = `S/${total.toFixed(2)}`;
	countProducts.innerText = `${cantidadTotal}`;
};

window.addEventListener("DOMContentLoaded", (e) => {
	fetch(`${linkDesploy}/carrito`, {
		method: "GET",
	})
		.then((res) => res.json())
		.then((data) => {
			allProducts = data;
			showHTML();
		});
});

btnCart.addEventListener("click", (e) => {
	containerCartProducts.classList.toggle("hidden-cart");
	console.log(containerCartProducts);

	if (!containerCartProducts.classList.contains("hidden-cart")) {
		fetch(`${linkDesploy}/carrito`, {
			method: "GET",
		})
			.then((res) => res.json())
			.then((data) => {
				allProducts = data;
				showHTML();
			});
	}
});

productList.addEventListener("click", async (e) => {
	if (e.target.classList.contains("producto__green")) {
		const product = e.target.parentElement;

		const infoProduct = {
			cantidad: 1,
			titulo: product.querySelector(".compras__producto").textContent,
			precio: product.querySelector(".compras__precio").textContent,
		};

		console.log(infoProduct);

		fetch(`${linkDesploy}/carrito`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(infoProduct),
		})
			.then(async (res) => {
				if (!res.ok) {
					const errorData = await res.json();
					throw new Error(errorData.message || "Error desconocido");
				}
				return fetch(`${linkDesploy}/carrito`, {
					method: "GET",
				});
			})
			.then((res) => res.json())
			.then((data) => {
				allProducts = data;
				showHTML();
			});
	}
});

rowInfo.addEventListener("click", async (e) => {
	if (e.target.classList.contains("icon-close")) {
		const product = e.target.parentElement;

		const infoProduct = {
			titulo: product.querySelector("p").textContent,
		};

		fetch(`${linkDesploy}/carrito/eliminar`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(infoProduct),
		})
			.then(async (res) => {
				if (!res.ok) {
					const errorData = await res.json();
					throw new Error(errorData.message || "Error desconocido");
				}
				return fetch(`${linkDesploy}/carrito`, {
					method: "GET",
				});
			})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				allProducts = data;
				showHTML();
			});

		showHTML();
	}
});
