const btnCart = document.querySelector(".container-cart-icon");
const containerCartProducts = document.querySelector(".container-cart-products");

btnCart.addEventListener("click", () => {
	containerCartProducts.classList.toggle("hidden-cart");
});

const cartInfo = document.querySelector(".cart.product");
const rowInfo = document.querySelector(".row-product");

const productList = document.querySelector(".artesanias__container");

let allProducts = [];

const valorTotal = document.querySelector(".total-pagar");

const countProducts = document.querySelector("#contador-productos");

const cartEmpty = document.querySelector(".cart-empty");

const cartTotal = document.querySelector(".cart-total");

productList.addEventListener("click", (e) => {
	if (e.target.classList.contains("producto__green")) {
		const product = e.target.parentElement;

		const infoProduct = {
			cantidad: 1,
			titulo: product.querySelector(".compras__producto").textContent,
			precio: product.querySelector(".compras__precio").textContent,
		};

		const exists = allProducts.some((product) => product.titulo === infoProduct.titulo);

		if (exists) {
			const productos = allProducts.map((product) => {
				if (product.titulo === infoProduct.titulo) {
					product.cantidad++;
					return product;
				} else {
					return product;
				}
			});
			allProducts = [...productos];
		} else {
			allProducts = [...allProducts, infoProduct];
		}

		showHTML();
	}
});

rowInfo.addEventListener("click", (e) => {
	if (e.target.classList.contains("icon-close")) {
		const producto = e.target.parentElement;

		const titulo = producto.querySelector("p").textContent;

		allProducts = allProducts.filter((product) => product.titulo != titulo);

		console.log(allProducts);

		showHTML();
	}
});

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
                <span class="precio-producto-carrito">${product.precio}</span>
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

		total = total + parseFloat(product.cantidad * product.precio.slice(2));
		cantidadTotal = cantidadTotal + product.cantidad;
	});

	valorTotal.innerText = `S/${total.toFixed(2)}`;
	countProducts.innerText = `${cantidadTotal}`;
};
