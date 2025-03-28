// Dados fornecidos no JSON
const data = {
  pizzas: [
    {
      id: "1",
      name: "Margherita",
      price: 35.9,
      description: "Molho de tomate, muçarela e manjericão.",
      image:
        "https://images.unsplash.com/photo-1604068549290-dea0e4b45da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      category: "Pizzas Tradicionais",
    },
    {
      id: "2",
      name: "Calabresa",
      price: 38.9,
      description: "Molho de tomate, calabresa e cebola.",
      image:
        "https://images.unsplash.com/photo-1627627331051-703813f99b14?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      category: "Pizzas Tradicionais",
    },
    {
      id: "3",
      name: "Chocolate",
      price: 42.0,
      description: "Chocolate derretido e granulado.",
      image:
        "https://images.unsplash.com/photo-1595877175789-795d5cc88537?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      category: "Pizzas Doces",
    },
  ],
  categories: ["Pizzas Tradicionais", "Pizzas Doces", "Pizzas Salgadas"],
  cart: [],
  carouselImages: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1571066811602-716837d9f582?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
  ],
  pizzariaConfig: {
    name: "Pizzaria Sabor da Itália",
    logo: "https://via.placeholder.com/60",
    whatsapp: "5511999999999",
    adminPassword: "Gcipione",
    address: "Rua Icarai, 310 - Vila do Conde - Barueri",
  },
  orders: [],
};

let cart = data.cart;
let currentProduct = null;

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadPizzariaConfig();
  loadCarousel();
  loadCategories();
  loadProducts();
});

// Configuração da pizzaria
function loadPizzariaConfig() {
  document.getElementById("pizzaria-logo").src = data.pizzariaConfig.logo;
  document.getElementById(
    "pizzaria-name"
  ).innerHTML = `<span>${data.pizzariaConfig.name.split(" ")[0]}</span> <span>${
    data.pizzariaConfig.name.split(" ")[1]
  } ${data.pizzariaConfig.name.split(" ")[2]}</span> <span class="flag-icon"></span>`;
  document.getElementById("pizzaria-address").textContent =
    data.pizzariaConfig.address;
  document.getElementById("mobile-address").textContent =
    data.pizzariaConfig.address;
}

// Carrossel
function loadCarousel() {
  const container = document.getElementById("carousel-container");
  container.innerHTML = data.carouselImages
    .map((img) => `<img src="${img.url}" alt="Carrossel ${img.id}">`)
    .join("");
  let currentIndex = 0;
  const images = container.getElementsByTagName("img");
  setInterval(() => {
    images[currentIndex].style.display = "none";
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].style.display = "block";
  }, 3000);
  for (let i = 1; i < images.length; i++) {
    images[i].style.display = "none";
  }
}

// Categorias no menu
function loadCategories() {
  const navList = document.getElementById("nav-list");
  navList.innerHTML = data.categories
    .map(
      (category) =>
        `<li><a href="#" onclick="filterProducts('${category}')">${category}</a></li>`
    )
    .join("");
}

// Produtos
function loadProducts(category = null) {
  const productsSection = document.getElementById("products");
  let filteredPizzas = category
    ? data.pizzas.filter((pizza) => pizza.category === category)
    : data.pizzas;

  productsSection.innerHTML = filteredPizzas
    .map(
      (pizza) => `
    <div class="product-card">
      <img src="${pizza.image}" alt="${pizza.name}">
      <h3>${pizza.name}</h3>
      <p>${pizza.description}</p>
      <p>R$ ${pizza.price.toFixed(2).replace(".", ",")}</p>
      <button onclick="openProductDetail('${pizza.id}')">Ver Detalhes</button>
      <button onclick="addToCart('${pizza.id}')">Adicionar ao Carrinho</button>
    </div>
  `
    )
    .join("");
}

// Filtro por categoria
function filterProducts(category) {
  loadProducts(category);
}

// Pesquisa
function searchPizzas() {
  const query = document.getElementById("search-bar").value.toLowerCase();
  const filteredPizzas = data.pizzas.filter(
    (pizza) =>
      pizza.name.toLowerCase().includes(query) ||
      pizza.description.toLowerCase().includes(query)
  );
  const productsSection = document.getElementById("products");
  productsSection.innerHTML = filteredPizzas
    .map(
      (pizza) => `
    <div class="product-card">
      <img src="${pizza.image}" alt="${pizza.name}">
      <h3>${pizza.name}</h3>
      <p>${pizza.description}</p>
      <p>R$ ${pizza.price.toFixed(2).replace(".", ",")}</p>
      <button onclick="openProductDetail('${pizza.id}')">Ver Detalhes</button>
      <button onclick="addToCart('${pizza.id}')">Adicionar ao Carrinho</button>
    </div>
  `
    )
    .join("");
}

// Detalhes do produto
function openProductDetail(pizzaId) {
  const pizza = data.pizzas.find((p) => p.id === pizzaId);
  currentProduct = pizza;
  document.getElementById("product-detail-name").textContent = pizza.name;
  document.getElementById("product-detail-image").src = pizza.image;
  document.getElementById("product-detail-description").textContent =
    pizza.description;
  document.getElementById(
    "product-detail-price"
  ).textContent = `R$ ${pizza.price.toFixed(2).replace(".", ",")}`;
  document.getElementById("product-detail-modal").style.display = "block";
}

function closeProductDetailModal() {
  document.getElementById("product-detail-modal").style.display = "none";
}

function addToCartFromDetail() {
  if (currentProduct) {
    cart.push(currentProduct);
    updateCart();
    closeProductDetailModal();
  }
}

// Carrinho
function addToCart(pizzaId) {
  const pizza = data.pizzas.find((p) => p.id === pizzaId);
  cart.push(pizza);
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  cartItems.innerHTML = cart
    .map(
      (item, index) => `
    <div>
      <p>${item.name} - R$ ${item.price.toFixed(2).replace(".", ",")}</p>
      <button onclick="removeFromCart(${index})">Remover</button>
    </div>
  `
    )
    .join("");

  cartCount.textContent = cart.length;
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = `Total: R$ ${total.toFixed(2).replace(".", ",")}`;
  checkoutBtn.disabled = cart.length === 0;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function toggleCart() {
  const modal = document.getElementById("cart-modal");
  modal.style.display = modal.style.display === "block" ? "none" : "block";
}

// Checkout
function openCheckoutModal() {
  document.getElementById("cart-modal").style.display = "none";
  document.getElementById("checkout-modal").style.display = "block";
}

function closeCheckoutModal() {
  document.getElementById("checkout-modal").style.display = "none";
}

document.getElementById("checkout-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const order = {
    customer: {
      name: document.getElementById("customer-name").value,
      phone: document.getElementById("customer-phone").value,
      address: document.getElementById("customer-address").value,
    },
    items: [...cart],
    payment: document.getElementById("payment-method").value,
    total: cart.reduce((sum, item) => sum + item.price, 0),
    date: new Date().toLocaleString("pt-BR"),
  };
  data.orders.push(order);
  cart = [];
  updateCart();
  closeCheckoutModal();
  showAlert(
    "Pedido Confirmado",
    `Seu pedido foi enviado com sucesso! Entre em contato pelo WhatsApp: ${data.pizzariaConfig.whatsapp}`
  );
});

// Modal de Alerta
function showAlert(title, message) {
  document.getElementById("alert-title").textContent = title;
  document.getElementById("alert-message").textContent = message;
  document.getElementById("alert-modal").style.display = "block";
}

function closeAlertModal() {
  document.getElementById("alert-modal").style.display = "none";
}

// Admin
function openAdminModal() {
  document.getElementById("admin-modal").style.display = "block";
}

function closeAdminModal() {
  document.getElementById("admin-modal").style.display = "none";
}

function adminLogin() {
  const password = document.getElementById("admin-password").value;
  if (password === data.pizzariaConfig.adminPassword) {
    document.getElementById("admin-login").style.display = "none";
    document.getElementById("admin-form").style.display = "block";
    loadAdminForm();
  } else {
    showAlert("Erro", "Senha incorreta!");
  }
}

function loadAdminForm() {
  const adminForm = document.getElementById("admin-form");
  adminForm.innerHTML = `
    <h2>Pedidos</h2>
    ${
      data.orders.length === 0
        ? "<p>Nenhum pedido ainda.</p>"
        : data.orders
            .map(
              (order, index) => `
      <div>
        <p><strong>Cliente:</strong> ${order.customer.name}</p>
        <p><strong>Telefone:</strong> ${order.customer.phone}</p>
        <p><strong>Endereço:</strong> ${order.customer.address}</p>
        <p><strong>Itens:</strong> ${order.items
          .map((item) => item.name)
          .join(", ")}</p>
        <p><strong>Total:</strong> R$ ${order.total
          .toFixed(2)
          .replace(".", ",")}</p>
        <p><strong>Pagamento:</strong> ${order.payment}</p>
        <p><strong>Data:</strong> ${order.date}</p>
      </div>
      <hr>
    `
            )
            .join("")
    }
  `;
}

function showResetPassword() {
  document.getElementById("admin-login").style.display = "none";
  document.getElementById("admin-reset").style.display = "block";
}

function showAdminLogin() {
  document.getElementById("admin-reset").style.display = "none";
  document.getElementById("admin-login").style.display = "block";
}

function resetPassword() {
  const newPassword = document.getElementById("new-password").value;
  if (newPassword) {
    data.pizzariaConfig.adminPassword = newPassword;
    showAlert("Sucesso", "Senha redefinida com sucesso!");
    showAdminLogin();
  } else {
    showAlert("Erro", "Por favor, insira uma nova senha!");
  }
}

// Menu Mobile
function toggleMenu() {
  const navList = document.getElementById("nav-list");
  navList.style.display = navList.style.display === "flex" ? "none" : "flex";
}

// Pizza Personalizada
function openCustomPizzaModal() {
  document.getElementById("custom-pizza-modal").style.display = "block";
}

function closeCustomPizzaModal() {
  document.getElementById("custom-pizza-modal").style.display = "none";
}

function updateFlavorSelectors() {
  const count = document.getElementById("flavor-count").value;
  const selectors = document.getElementById("flavor-selectors");
  selectors.innerHTML = "";
  for (let i = 0; i < count; i++) {
    selectors.innerHTML += `
      <select id="flavor-${i}">
        <option value="" disabled selected>Escolha um sabor</option>
        ${data.pizzas
          .map((pizza) => `<option value="${pizza.id}">${pizza.name}</option>`)
          .join("")}
      </select>
    `;
  }
  updatePizzaSVG(count);
}

function updatePizzaSVG(count) {
  const svg = document.getElementById("pizza-svg");
  svg.innerHTML = "";
  const radius = 100;
  const center = 100;
  const slices = count ? parseInt(count) : 1;
  for (let i = 0; i < slices; i++) {
    const angle = (i * 360) / slices;
    const nextAngle = ((i + 1) * 360) / slices;
    const x1 = center + radius * Math.cos((angle * Math.PI) / 180);
    const y1 = center + radius * Math.sin((angle * Math.PI) / 180);
    const x2 = center + radius * Math.cos((nextAngle * Math.PI) / 180);
    const y2 = center + radius * Math.sin((nextAngle * Math.PI) / 180);
    const largeArc = slices > 2 ? 1 : 0;
    svg.innerHTML += `
      <path d="M ${center},${center} L ${x1},${y1} A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z" fill="#ffd700" stroke="#8b0000" stroke-width="2"/>
    `;
  }
}

function addCustomPizzaToCart() {
  const count = document.getElementById("flavor-count").value;
  if (!count) {
    showAlert("Erro", "Escolha a quantidade de sabores!");
    return;
  }
  let customPizza = { name: "Pizza Personalizada", price: 0, flavors: [] };
  for (let i = 0; i < count; i++) {
    const pizzaId = document.getElementById(`flavor-${i}`).value;
    if (!pizzaId) {
      showAlert("Erro", "Escolha todos os sabores!");
      return;
    }
    const pizza = data.pizzas.find((p) => p.id === pizzaId);
    customPizza.flavors.push(pizza.name);
    customPizza.price += pizza.price / count;
  }
  customPizza.name += ` (${customPizza.flavors.join(", ")})`;
  cart.push(customPizza);
  updateCart();
  closeCustomPizzaModal();
}
