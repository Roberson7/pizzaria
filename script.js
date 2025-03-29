const initialData = {
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
    "https://images.unsplash.com/photo-1594007654729-407eedc4be65?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1571066811602-716837d9f582?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  ],
  pizzariaConfig: {
    name: "Pizzaria Sabor da Itália",
    logo: "https://via.placeholder.com/60",
    whatsapp: "5511999999999",
    adminPassword: "gcipione",
    ordersPassword: "Gcipione",
    address: "Rua Icarai, 310 - Vila do Conde - Barueri",
  },
};

let pizzas = JSON.parse(localStorage.getItem("pizzas")) || initialData.pizzas;
let categories =
  JSON.parse(localStorage.getItem("categories")) || initialData.categories;
let cart = JSON.parse(localStorage.getItem("cart")) || initialData.cart;
let carouselImages =
  JSON.parse(localStorage.getItem("carouselImages")) ||
  initialData.carouselImages;
let pizzariaConfig =
  JSON.parse(localStorage.getItem("pizzariaConfig")) ||
  initialData.pizzariaConfig;
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let selectedCategory = "all";
let currentSlide = 0;
let selectedPizzaId = null;
let slideInterval;
let editingPizzaIndex = null;

const formatPrice = (price) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const formatPhoneNumber = (phone) => {
  phone = phone.replace(/\D/g, "");
  if (phone.length >= 10) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  }
  return phone;
};

const showAlertModal = (
  message,
  title = "Aviso",
  isOrderConfirmation = false
) => {
  const modal = document.getElementById("alert-modal");
  const alertTitle = document.getElementById("alert-title");
  const alertMessage = document.getElementById("alert-message");
  alertTitle.textContent = title;
  if (isOrderConfirmation) {
    alertMessage.innerHTML = message;
  } else {
    alertMessage.innerHTML = `<p>${message}</p>`;
  }
  modal.style.display = "block";
  setTimeout(() => modal.classList.add("show"), 10);
};

const closeAlertModal = () => {
  const modal = document.getElementById("alert-modal");
  modal.classList.remove("show");
  setTimeout(() => (modal.style.display = "none"), 300);
};

const saveToLocalStorage = () => {
  localStorage.setItem("pizzas", JSON.stringify(pizzas));
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("carouselImages", JSON.stringify(carouselImages));
  localStorage.setItem("pizzariaConfig", JSON.stringify(pizzariaConfig));
  localStorage.setItem("orders", JSON.stringify(orders));
};

const loadInitialData = () => {
  if (!pizzariaConfig.adminPassword) {
    pizzariaConfig.adminPassword = "gcipione";
  }
  if (!pizzariaConfig.ordersPassword) {
    pizzariaConfig.ordersPassword = "Gcipione";
  }
  saveToLocalStorage();
  updatePizzariaDisplay();
  renderNavbar();
  renderCarousel();
  startCarousel();
  renderPizzas();
  updateCartCount();
  setupCheckoutForm();
};

const renderNavbar = () => {
  const navbar = document.getElementById("nav-list");
  navbar.innerHTML =
    '<li><a href="#" data-category="all" class="active">Todas</a></li>' +
    categories
      .map(
        (category) =>
          `<li><a href="#" data-category="${category}">${category}</a></li>`
      )
      .join("");
  document.querySelectorAll(".nav-list a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      filterCategory(link.getAttribute("data-category"));
    });
  });
};

const filterCategory = (category) => {
  selectedCategory = category;
  renderPizzas();
  document.querySelectorAll(".nav-list a").forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("data-category") === category
    );
  });
  if (window.innerWidth <= 768) toggleMenu();
};

const toggleMenu = () => {
  const navList = document.getElementById("nav-list");
  navList.classList.toggle("show");
};

const updatePizzariaDisplay = () => {
  document.getElementById(
    "pizzaria-name"
  ).innerHTML = `<span>Sabor</span> <span>da Itália</span> <span class="flag-icon"></span>`;
  document.getElementById("pizzaria-address").textContent =
    pizzariaConfig.address;
  const mobileAddressElement = document.getElementById("mobile-address");
  if (mobileAddressElement) {
    mobileAddressElement.textContent = pizzariaConfig.address;
  }
  const logoElement = document.getElementById("pizzaria-logo");
  if (logoElement && pizzariaConfig.logo) {
    logoElement.src = pizzariaConfig.logo;
  }
};

const renderPizzas = () => {
  const productsGrid = document.getElementById("products");
  let filteredPizzas =
    selectedCategory === "all"
      ? pizzas
      : pizzas.filter((p) => p.category === selectedCategory);

  const searchQuery = document.getElementById("search-bar").value.toLowerCase();
  if (searchQuery) {
    filteredPizzas = filteredPizzas.filter((pizza) =>
      pizza.name.toLowerCase().includes(searchQuery)
    );
  }

  productsGrid.innerHTML = filteredPizzas
    .map(
      (pizza) => `
      <div class="product-card">
          <img src="${pizza.image}" alt="${
        pizza.name
      }" onclick="showProductDetail('${
        pizza.id
      }')" onerror="this.src='https://via.placeholder.com/300'">
          <h3>${pizza.name}</h3>
          <div class="price-container">
              <span class="single-price">${formatPrice(pizza.price)}</span>
          </div>
          <button onclick="addToCart('${
            pizza.id
          }')">Adicionar ao Carrinho</button>
      </div>
      `
    )
    .join("");
};

const searchPizzas = () => {
  renderPizzas();
};

const addToCart = (pizzaId) => {
  const cartItem = cart.find((item) => item.pizzaId === pizzaId);
  if (cartItem) cartItem.quantity++;
  else cart.push({ pizzaId, quantity: 1 });
  updateCartCount();
  renderCart();
  saveToLocalStorage();
};

const renderCart = () => {
  const cartItems = document.getElementById("cart-items");
  let total = 0;
  cartItems.innerHTML = cart
    .map((item) => {
      if (item.isCustom) {
        const flavorNames = item.flavors
          .map((flavorId, index) => {
            const pizza = pizzas.find((p) => p.id === flavorId);
            return `${index + 1}º Sabor: ${
              pizza ? pizza.name : "Desconhecido"
            }`;
          })
          .join("<br>");
        const maxPrice = Math.max(
          ...item.flavors.map((flavorId) => {
            const pizza = pizzas.find((p) => p.id === flavorId);
            return pizza ? pizza.price : 0;
          })
        );
        const itemTotal = maxPrice * item.quantity;
        total += itemTotal;
        return `
              <div class="cart-item">
                  <img src="${
                    pizzas.find((p) => p.id === item.flavors[0])?.image ||
                    "https://via.placeholder.com/50"
                  }" alt="Pizza Personalizada">
                  <div class="item-details">
                      <span class="item-name">Pizza Personalizada (${
                        item.quantity
                      }x)</span>
                      <span class="item-flavors">${flavorNames}</span>
                      <span class="item-price">${formatPrice(itemTotal)}</span>
                  </div>
                  <button class="remove-btn" onclick="removeFromCart('${
                    item.pizzaId
                  }')">Excluir</button>
              </div>
              `;
      } else {
        const pizza = pizzas.find((p) => p.id === item.pizzaId);
        const itemTotal = pizza.price * item.quantity;
        total += itemTotal;
        return `
              <div class="cart-item">
                  <img src="${pizza.image}" alt="${pizza.name}">
                  <div class="item-details">
                      <span class="item-name">${pizza.name} (${
          item.quantity
        }x)</span>
                      <span class="item-price">${formatPrice(itemTotal)}</span>
                  </div>
                  <button class="remove-btn" onclick="removeFromCart('${
                    pizza.id
                  }')">Excluir</button>
              </div>
              `;
      }
    })
    .join("");
  document.getElementById("cart-total").textContent = `Total: ${formatPrice(
    total
  )}`;
  const checkoutButton = document.getElementById("checkout-btn");
  checkoutButton.disabled = cart.length === 0;
};

const removeFromCart = (pizzaId) => {
  cart = cart.filter((item) => item.pizzaId !== pizzaId);
  updateCartCount();
  renderCart();
  saveToLocalStorage();
};

const updateCartCount = () => {
  document.getElementById("cart-count").textContent = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
};

const toggleCart = () => {
  const modal = document.getElementById("cart-modal");
  modal.classList.toggle("show");
  if (modal.classList.contains("show")) {
    modal.style.display = "block";
    renderCart();
  } else {
    setTimeout(() => (modal.style.display = "none"), 300);
  }
};

const openCheckoutModal = () => {
  if (cart.length === 0) {
    showAlertModal(
      "O carrinho está vazio! Adicione itens antes de finalizar o pedido.",
      "Erro"
    );
    return;
  }
  const modal = document.getElementById("checkout-modal");
  modal.style.display = "block";
  setTimeout(() => modal.classList.add("show"), 10);
  toggleCart();
};

const closeCheckoutModal = () => {
  const modal = document.getElementById("checkout-modal");
  modal.classList.remove("show");
  setTimeout(() => (modal.style.display = "none"), 300);
};

const setupCheckoutForm = () => {
  const form = document.getElementById("checkout-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("customer-name").value;
    const phone = document.getElementById("customer-phone").value;
    const address = document.getElementById("customer-address").value;
    const payment = document.getElementById("payment-method").value;
    if (!name || !phone || !address || !payment) {
      showAlertModal("Por favor, preencha todos os campos!", "Erro");
      return;
    }

    let orderMessage = `📋 *Novo Pedido - ${pizzariaConfig.name}* 📋\n\n`;
    orderMessage += `*Cliente:* ${name}\n`;
    orderMessage += `*Telefone:* ${formatPhoneNumber(phone)}\n`;
    orderMessage += `*Endereço:* ${address}\n`;
    orderMessage += `*Pagamento:* ${payment}\n\n`;
    orderMessage += `*Itens do Pedido:*\n`;
    let total = 0;
    const orderItems = cart.map((item) => {
      if (item.isCustom) {
        const flavorNames = item.flavors
          .map((flavorId, index) => {
            const pizza = pizzas.find((p) => p.id === flavorId);
            const ordinal = ["Primeiro", "Segundo", "Terceiro", "Quarto"];
            return `*${ordinal[index]} Sabor:* ${
              pizza ? pizza.name : "Desconhecido"
            }`;
          })
          .join("\n  ");
        const maxPrice = Math.max(
          ...item.flavors.map((flavorId) => {
            const pizza = pizzas.find((p) => p.id === flavorId);
            return pizza ? pizza.price : 0;
          })
        );
        const itemTotal = maxPrice * item.quantity;
        total += itemTotal;
        return {
          name: "Pizza Personalizada",
          flavors: flavorNames,
          quantity: item.quantity,
          total: itemTotal,
        };
      } else {
        const pizza = pizzas.find((p) => p.id === item.pizzaId);
        const itemTotal = pizza.price * item.quantity;
        total += itemTotal;
        return {
          name: pizza.name,
          quantity: item.quantity,
          total: itemTotal,
        };
      }
    });
    orderMessage += orderItems
      .map(
        (item) =>
          `- ${item.name}\n  Quantidade: ${
            item.quantity
          }x\n  Valor: ${formatPrice(item.total)}\n${item.flavors || ""}`
      )
      .join("");
    orderMessage += `\n*Total:* ${formatPrice(total)}`;

    const newOrder = {
      id: Date.now().toString(),
      customer: { name, phone, address, payment },
      items: orderItems,
      total,
      date: new Date().toLocaleString(),
      status: "Pendente",
    };
    orders.push(newOrder);
    saveToLocalStorage();

    const confirmationMessage = `
      <p class="alert-message">Seu pedido foi enviado com sucesso!</p>
      <div class="order-details">
        <p><span>Nome:</span> ${name}</p>
        <p><span>Telefone:</span> ${formatPhoneNumber(phone)}</p>
        <p><span>Endereço:</span> ${address}</p>
        <p><span>Pagamento:</span> ${payment}</p>
      </div>
      <p class="thank-you">Grazie mille! Em breve, sua pizza estará a caminho!</p>
    `;
    if (pizzariaConfig.whatsapp) {
      const whatsappNumber = pizzariaConfig.whatsapp.replace(/\D/g, "");
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        orderMessage
      )}`;
      showAlertModal(confirmationMessage, "Sucesso", true);
      setTimeout(() => {
        window.location.href = whatsappUrl;
        closeAlertModal();
      }, 2000);
    } else {
      showAlertModal(confirmationMessage, "Sucesso", true);
    }

    cart = [];
    saveToLocalStorage();
    updateCartCount();
    closeCheckoutModal();
  });
};

const openAdminModal = () => {
  const modal = document.getElementById("admin-modal");
  modal.style.display = "block";
  setTimeout(() => modal.classList.add("show"), 10);
  showAdminLogin();
};

const closeAdminModal = () => {
  const modal = document.getElementById("admin-modal");
  modal.classList.remove("show");
  setTimeout(() => (modal.style.display = "none"), 300);
  editingPizzaIndex = null;
};

const showAdminLogin = () => {
  document.getElementById("admin-login").style.display = "block";
  document.getElementById("admin-reset").style.display = "none";
  document.getElementById("admin-form").style.display = "none";
};

const showResetPassword = () => {
  document.getElementById("admin-login").style.display = "none";
  document.getElementById("admin-reset").style.display = "block";
  document.getElementById("admin-form").style.display = "none";
};

const adminLogin = () => {
  const password = document.getElementById("admin-password").value;
  if (password === pizzariaConfig.adminPassword) {
    document.getElementById("admin-login").style.display = "none";
    document.getElementById("admin-form").style.display = "block";
    updateAdminForm();
  } else {
    showAlertModal("Senha incorreta!", "Erro");
  }
};

const resetPassword = () => {
  const keyword = document.getElementById("reset-keyword").value;
  const newPassword = document.getElementById("new-password").value;
  if (keyword === "cavese") {
    if (newPassword) {
      pizzariaConfig.adminPassword = newPassword;
      saveToLocalStorage();
      showAlertModal("Senha redefinida com sucesso!", "Sucesso");
      showAdminLogin();
    } else {
      showAlertModal("Por favor, insira uma nova senha!", "Erro");
    }
  } else {
    showAlertModal("Chave de recuperação incorreta!", "Erro");
  }
};

const updateAdminForm = () => {
  const adminForm = document.getElementById("admin-form");
  adminForm.innerHTML = `
    <h2>Painel de Administração</h2>
    <h3>Configurações da Pizzaria</h3>
    <input type="text" id="pizzaria-name-input" value="${
      pizzariaConfig.name
    }" placeholder="Nome da Pizzaria">
    <input type="text" id="pizzaria-logo-input" value="${
      pizzariaConfig.logo
    }" placeholder="URL do Logo">
    <input type="text" id="pizzaria-address-input" value="${
      pizzariaConfig.address
    }" placeholder="Endereço da Pizzaria">
    <input type="text" id="pizzaria-whatsapp-input" value="${
      pizzariaConfig.whatsapp || ""
    }" placeholder="Número do WhatsApp (ex: 5511999999999)">
    <button onclick="updatePizzaria()">Atualizar Configurações</button>

    <h3>${
      editingPizzaIndex !== null ? "Editar Pizza" : "Adicionar Nova Pizza"
    }</h3>
    <input type="text" id="pizza-name" value="${
      editingPizzaIndex !== null ? pizzas[editingPizzaIndex].name : ""
    }" placeholder="Nome da Pizza">
    <input type="number" id="pizza-price" value="${
      editingPizzaIndex !== null ? pizzas[editingPizzaIndex].price : ""
    }" placeholder="Preço" step="0.01">
    <input type="text" id="pizza-description" value="${
      editingPizzaIndex !== null ? pizzas[editingPizzaIndex].description : ""
    }" placeholder="Descrição">
    <input type="text" id="pizza-image" value="${
      editingPizzaIndex !== null ? pizzas[editingPizzaIndex].image : ""
    }" placeholder="URL da Imagem">
    <select id="pizza-category">
      <option value="" disabled ${
        editingPizzaIndex === null ? "selected" : ""
      }>Selecione uma categoria</option>
      ${categories
        .map(
          (cat) =>
            `<option value="${cat}" ${
              editingPizzaIndex !== null &&
              pizzas[editingPizzaIndex].category === cat
                ? "selected"
                : ""
            }>${cat}</option>`
        )
        .join("")}
    </select>
    <button onclick="addOrUpdatePizza()">${
      editingPizzaIndex !== null ? "Atualizar Pizza" : "Adicionar Pizza"
    }</button>

    <h3>Pizzas Cadastradas</h3>
    <div id="pizza-list">
      ${pizzas
        .map(
          (pizza, index) => `
            <p>${pizza.name} - ${formatPrice(pizza.price)}
              <button onclick="editPizza(${index})">Editar</button>
              <button onclick="deletePizza(${index})">Excluir</button>
            </p>
          `
        )
        .join("")}
    </div>

    <h3>Imagens do Carrossel</h3>
    <input type="text" id="carousel-image-input" placeholder="URL da Imagem">
    <button onclick="addCarouselImage()">Adicionar Imagem</button>
    <div id="carousel-images">
      ${carouselImages
        .map(
          (img, index) => `
            <p>${img}
              <button onclick="deleteCarouselImage(${index})">Excluir</button>
            </p>
          `
        )
        .join("")}
    </div>
    <button class="close-btn" onclick="closeAdminModal()">Fechar</button>
  `;
};

const updatePizzaria = () => {
  pizzariaConfig.name = document.getElementById("pizzaria-name-input").value;
  pizzariaConfig.logo = document.getElementById("pizzaria-logo-input").value;
  pizzariaConfig.address = document.getElementById(
    "pizzaria-address-input"
  ).value;
  pizzariaConfig.whatsapp = document.getElementById(
    "pizzaria-whatsapp-input"
  ).value;
  saveToLocalStorage();
  updatePizzariaDisplay();
  showAlertModal("Configurações atualizadas com sucesso!", "Sucesso");
};

const addOrUpdatePizza = () => {
  const name = document.getElementById("pizza-name").value;
  const price = parseFloat(document.getElementById("pizza-price").value);
  const description = document.getElementById("pizza-description").value;
  const image = document.getElementById("pizza-image").value;
  const category = document.getElementById("pizza-category").value;

  if (!name || !price || !description || !image || !category) {
    showAlertModal("Por favor, preencha todos os campos!", "Erro");
    return;
  }

  if (editingPizzaIndex !== null) {
    pizzas[editingPizzaIndex] = {
      ...pizzas[editingPizzaIndex],
      name,
      price,
      description,
      image,
      category,
    };
    editingPizzaIndex = null;
    showAlertModal("Pizza atualizada com sucesso!", "Sucesso");
  } else {
    const newPizza = {
      id: Date.now().toString(),
      name,
      price,
      description,
      image,
      category,
    };
    pizzas.push(newPizza);
    showAlertModal("Pizza adicionada com sucesso!", "Sucesso");
  }
  saveToLocalStorage();
  renderPizzas();
  updateAdminForm();
};

const editPizza = (index) => {
  editingPizzaIndex = index;
  updateAdminForm();
};

const deletePizza = (index) => {
  pizzas.splice(index, 1);
  saveToLocalStorage();
  renderPizzas();
  updateAdminForm();
  showAlertModal("Pizza excluída com sucesso!", "Sucesso");
};

const addCarouselImage = () => {
  const imageUrl = document.getElementById("carousel-image-input").value;
  if (imageUrl) {
    carouselImages.push(imageUrl);
    saveToLocalStorage();
    renderCarousel();
    updateAdminForm();
    document.getElementById("carousel-image-input").value = "";
    showAlertModal("Imagem adicionada ao carrossel!", "Sucesso");
  } else {
    showAlertModal("Por favor, insira uma URL válida!", "Erro");
  }
};

const deleteCarouselImage = (index) => {
  carouselImages.splice(index, 1);
  saveToLocalStorage();
  renderCarousel();
  updateAdminForm();
  showAlertModal("Imagem excluída do carrossel!", "Sucesso");
};

const openOrdersModal = () => {
  const modal = document.getElementById("orders-modal");
  modal.style.display = "block";
  setTimeout(() => modal.classList.add("show"), 10);
  showOrdersLogin();
};

const closeOrdersModal = () => {
  const modal = document.getElementById("orders-modal");
  modal.classList.remove("show");
  setTimeout(() => (modal.style.display = "none"), 300);
};

const showOrdersLogin = () => {
  document.getElementById("orders-login").style.display = "block";
  document.getElementById("orders-reset").style.display = "none";
  document.getElementById("orders-list").style.display = "none";
};

const showOrdersResetPassword = () => {
  document.getElementById("orders-login").style.display = "none";
  document.getElementById("orders-reset").style.display = "block";
  document.getElementById("orders-list").style.display = "none";
};

const ordersLogin = () => {
  const password = document.getElementById("orders-password").value;
  if (password === pizzariaConfig.ordersPassword) {
    document.getElementById("orders-login").style.display = "none";
    document.getElementById("orders-list").style.display = "block";
    updateOrdersList();
  } else {
    showAlertModal("Senha incorreta!", "Erro");
  }
};

const resetOrdersPassword = () => {
  const keyword = document.getElementById("orders-reset-keyword").value;
  const newPassword = document.getElementById("orders-new-password").value;
  if (keyword === "gabriel") {
    if (newPassword) {
      pizzariaConfig.ordersPassword = newPassword;
      saveToLocalStorage();
      showAlertModal("Senha redefinida com sucesso!", "Sucesso");
      showOrdersLogin();
    } else {
      showAlertModal("Por favor, insira uma nova senha!", "Erro");
    }
  } else {
    showAlertModal("Chave de recuperação incorreta!", "Erro");
  }
};

const updateOrdersList = () => {
  const ordersList = document.getElementById("orders-list");
  ordersList.innerHTML = `
    <h2>Pedidos dos Clientes</h2>
    <div>
      ${orders
        .map(
          (order, index) => `
            <p>
              <strong>Pedido #${String(index + 1).padStart(
                2,
                "0"
              )}</strong> - ${order.customer.name} - ${
            order.date
          } - ${formatPrice(order.total)} - Status: ${order.status}
              <button onclick="updateOrderStatus(${index}, 'Entregue')">Marcar como Entregue</button>
            </p>
          `
        )
        .join("")}
    </div>
    <button class="close-btn" onclick="closeOrdersModal()">Fechar</button>
  `;
};

const updateOrderStatus = (index, status) => {
  orders[index].status = status;
  if (status === "Entregue") {
    orders.splice(index, 1); // Remove o pedido da lista
    showAlertModal(`Pedido entregue e removido da lista!`, "Sucesso");
  } else {
    showAlertModal(`Status do pedido atualizado para "${status}"!`, "Sucesso");
  }
  saveToLocalStorage();
  updateOrdersList();
};

// Função removida: showOrderDetails (não é mais necessária)

const renderCarousel = () => {
  const container = document.getElementById("carousel-container");
  container.innerHTML = carouselImages
    .map(
      (img) =>
        `<img src="${img}" class="carousel-slide" alt="Carrossel" onerror="this.src='https://via.placeholder.com/600'">`
    )
    .join("");
  updateCarousel();
};

const updateCarousel = () => {
  const container = document.getElementById("carousel-container");
  const slideWidth = container.offsetWidth;
  container.style.transform = `translateX(${-currentSlide * slideWidth}px)`;
};

const startCarousel = () => {
  clearInterval(slideInterval);
  if (carouselImages.length > 1) {
    slideInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % carouselImages.length;
      updateCarousel();
    }, 5000);
  }
};

const openCustomPizzaModal = () => {
  const modal = document.getElementById("custom-pizza-modal");
  modal.style.display = "block";
  setTimeout(() => modal.classList.add("show"), 10);
  updateFlavorSelectors();
};

const closeCustomPizzaModal = () => {
  const modal = document.getElementById("custom-pizza-modal");
  modal.classList.remove("show");
  setTimeout(() => (modal.style.display = "none"), 300);
  document.getElementById("flavor-count").selectedIndex = 0;
  document.getElementById("flavor-selectors").innerHTML = "";
  renderPizzaSVG(0);
};

const updateFlavorSelectors = () => {
  const flavorCount = parseInt(
    document.getElementById("flavor-count").value || "0"
  );
  const selectorsDiv = document.getElementById("flavor-selectors");
  selectorsDiv.innerHTML = "";

  for (let i = 0; i < flavorCount; i++) {
    const ordinal = ["Primeiro", "Segundo", "Terceiro", "Quarto"][i];
    const select = document.createElement("select");
    select.innerHTML =
      `<option value="" disabled selected>${ordinal} Sabor</option>` +
      pizzas
        .map((pizza) => `<option value="${pizza.id}">${pizza.name}</option>`)
        .join("");
    select.addEventListener("change", () => {
      updateAvailableFlavors(flavorCount);
      renderPizzaSVG(flavorCount);
    });
    selectorsDiv.appendChild(select);
  }
  renderPizzaSVG(flavorCount);
  updateAvailableFlavors(flavorCount);
};

const updateAvailableFlavors = (flavorCount) => {
  const selectors = document.getElementById("flavor-selectors").children;
  const selectedFlavors = Array.from(selectors)
    .map((select) => select.value)
    .filter((value) => value);

  Array.from(selectors).forEach((select, index) => {
    const currentValue = select.value;
    select.innerHTML = `<option value="" disabled ${
      !currentValue ? "selected" : ""
    }>${["Primeiro", "Segundo", "Terceiro", "Quarto"][index]} Sabor</option>`;

    pizzas.forEach((pizza) => {
      const isSelectedElsewhere =
        selectedFlavors.includes(pizza.id) && pizza.id !== currentValue;
      if (!isSelectedElsewhere) {
        const option = document.createElement("option");
        option.value = pizza.id;
        option.textContent = pizza.name;
        if (pizza.id === currentValue) option.selected = true;
        select.appendChild(option);
      }
    });
  });
};

const renderPizzaSVG = (flavorCount) => {
  const svg = document.getElementById("pizza-svg");
  svg.innerHTML = "";
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", centerX);
  circle.setAttribute("cy", centerY);
  circle.setAttribute("r", radius);
  circle.setAttribute("fill", "#f9e8b7");
  svg.appendChild(circle);

  if (flavorCount > 0) {
    const selectors = document.getElementById("flavor-selectors").children;
    const selectedFlavors = Array.from(selectors)
      .map((select) => select.value)
      .filter((value) => value);

    if (selectedFlavors.length > 0) {
      const angleStep =
        (2 * Math.PI) / Math.max(flavorCount, selectedFlavors.length);

      selectedFlavors.forEach((flavorId, i) => {
        const pizza = pizzas.find((p) => p.id === flavorId);
        if (!pizza) return;

        if (flavorCount === 1) {
          const image = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "image"
          );
          image.setAttribute("href", pizza.image);
          image.setAttribute("x", centerX - radius);
          image.setAttribute("y", centerY - radius);
          image.setAttribute("width", radius * 2);
          image.setAttribute("height", radius * 2);
          image.setAttribute("preserveAspectRatio", "xMidYMid slice");
          svg.appendChild(image);
        } else {
          const startAngle = i * angleStep - Math.PI / 2;
          const endAngle = (i + 1) * angleStep - Math.PI / 2;

          const clipPath = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "clipPath"
          );
          clipPath.setAttribute("id", `clip-${i}`);
          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          const x1 = centerX + radius * Math.cos(startAngle);
          const y1 = centerY + radius * Math.sin(startAngle);
          const x2 = centerX + radius * Math.cos(endAngle);
          const y2 = centerY + radius * Math.sin(endAngle);
          const d = `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`;
          path.setAttribute("d", d);
          clipPath.appendChild(path);
          svg.appendChild(clipPath);

          const image = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "image"
          );
          image.setAttribute("href", pizza.image);
          image.setAttribute("x", centerX - radius);
          image.setAttribute("y", centerY - radius);
          image.setAttribute("width", radius * 2);
          image.setAttribute("height", radius * 2);
          image.setAttribute("clip-path", `url(#clip-${i})`);
          image.setAttribute("preserveAspectRatio", "xMidYMid slice");
          svg.appendChild(image);

          const borderPath = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          borderPath.setAttribute("d", d);
          borderPath.setAttribute("fill", "none");
          borderPath.setAttribute("stroke", "#000");
          borderPath.setAttribute("stroke-width", "1");
          svg.appendChild(borderPath);
        }
      });
    }
  }
};

const addCustomPizzaToCart = () => {
  const flavorCount = parseInt(document.getElementById("flavor-count").value);
  const selectors = document.getElementById("flavor-selectors").children;
  const flavors = Array.from(selectors)
    .map((select) => select.value)
    .filter((value) => value);

  if (flavors.length !== flavorCount) {
    showAlertModal("Por favor, selecione todos os sabores!", "Erro");
    return;
  }

  const customPizzaId = `custom-${Date.now()}`;
  cart.push({ pizzaId: customPizzaId, isCustom: true, flavors, quantity: 1 });
  saveToLocalStorage();
  updateCartCount();
  closeCustomPizzaModal();
  showAlertModal("Pizza personalizada adicionada ao carrinho!", "Sucesso");
};

const showProductDetail = (pizzaId) => {
  const pizza = pizzas.find((p) => p.id === pizzaId);
  if (!pizza) return;

  selectedPizzaId = pizzaId;
  const modal = document.getElementById("product-detail-modal");
  document.getElementById("product-detail-name").textContent = pizza.name;
  document.getElementById("product-detail-image").src = pizza.image;
  document.getElementById("product-detail-description").textContent =
    pizza.description;
  document.getElementById("product-detail-price").textContent = formatPrice(
    pizza.price
  );
  modal.style.display = "block";
  setTimeout(() => modal.classList.add("show"), 10);
};

const closeProductDetailModal = () => {
  const modal = document.getElementById("product-detail-modal");
  modal.classList.remove("show");
  setTimeout(() => (modal.style.display = "none"), 300);
  selectedPizzaId = null;
};

const addToCartFromDetail = () => {
  if (selectedPizzaId) {
    addToCart(selectedPizzaId);
    closeProductDetailModal();
    showAlertModal("Pizza adicionada ao carrinho!", "Sucesso");
  }
};

window.addEventListener("load", loadInitialData);
window.addEventListener("resize", updateCarousel);
