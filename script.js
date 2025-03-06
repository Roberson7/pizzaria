// Dados iniciais com imagens reais de exemplo
let pizzas = JSON.parse(localStorage.getItem("pizzas")) || [
    { id: "1", name: "Margherita", price: 35.90, description: "Molho de tomate, muçarela e manjericão.", image: "https://images.unsplash.com/photo-1604068549290-dea0e4b45da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", category: "Pizzas Salgadas" },
    { id: "2", name: "Calabresa", price: 38.90, description: "Molho de tomate, calabresa e cebola.", image: "https://images.unsplash.com/photo-1627627331051-703813f99b14?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", category: "Pizzas Salgadas" },
    { id: "3", name: "Chocolate", price: 42.00, description: "Chocolate derretido e granulado.", image: "https://images.unsplash.com/photo-1595877175789-795d5cc88537?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", category: "Pizzas Doces" }
];
let categories = JSON.parse(localStorage.getItem("categories")) || ["Pizzas Salgadas", "Pizzas Doces"];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let carouselImages = JSON.parse(localStorage.getItem("carouselImages")) || [
    "https://images.unsplash.com/photo-1594007654729-407eedc4be65?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1571066811602-716837d9f582?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
];

// Garantir que pizzariaConfig tenha valores padrão se não existir ou estiver corrompido
let pizzariaConfig;
try {
    pizzariaConfig = JSON.parse(localStorage.getItem("pizzariaConfig")) || {
        name: "Pizzaria Italiana",
        logo: "https://via.placeholder.com/50",
        whatsapp: "",
        adminPassword: "admin123"
    };
    // Forçar a senha padrão se adminPassword estiver ausente ou inválido
    if (!pizzariaConfig.adminPassword || typeof pizzariaConfig.adminPassword !== "string") {
        pizzariaConfig.adminPassword = "admin123";
        saveToLocalStorage();
    }
} catch (e) {
    console.error("Erro ao carregar pizzariaConfig do localStorage:", e);
    pizzariaConfig = {
        name: "Pizzaria Italiana",
        logo: "https://via.placeholder.com/50",
        whatsapp: "",
        adminPassword: "admin123"
    };
    saveToLocalStorage();
}

let selectedCategory = 'all';
let currentSlide = 0;
let slideInterval;
let customPizzaSlices = [];
let selectedSlice = null;
let flavorCount = 2;
let editingPizzaId = null;

function saveToLocalStorage() {
    try {
        localStorage.setItem("pizzas", JSON.stringify(pizzas));
        localStorage.setItem("categories", JSON.stringify(categories));
        localStorage.setItem("cart", JSON.stringify(cart));
        localStorage.setItem("carouselImages", JSON.stringify(carouselImages));
        localStorage.setItem("pizzariaConfig", JSON.stringify(pizzariaConfig));
        console.log("Dados salvos no localStorage:", { pizzariaConfig, pizzas, categories, cart, carouselImages });
    } catch (e) {
        console.error("Erro ao salvar no localStorage:", e);
    }
}

function formatPrice(price) {
    return `R$ ${price.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function loadInitialData() {
    console.log("Carregando dados iniciais...");
    updatePizzariaDisplay();
    renderNavbar();
    renderCarousel();
    startCarousel();
    renderPizzas();
    updateCartCount();
    updateWhatsappDisplay();
}

// Navbar Functions
function renderNavbar() {
    const navbar = document.getElementById("nav-list");
    if (!navbar) return;
    navbar.innerHTML = '<li><a href="#" onclick="filterCategory(\'all\')" class="active">Todas</a></li>';
    categories.forEach(category => {
        navbar.innerHTML += `<li><a href="#" onclick="filterCategory('${category}')">${category}</a></li>`;
    });
}

function filterCategory(category) {
    const links = document.querySelectorAll(".navbar a");
    links.forEach(link => link.classList.remove("active"));
    event.target.classList.add("active");
    selectedCategory = category;
    renderPizzas();
    toggleMenu();
}

function toggleMenu() {
    const navList = document.getElementById("nav-list");
    navList.classList.toggle("show");
}

// Admin Functions
function openAdminModal() {
    const modal = document.getElementById("admin-modal");
    modal.style.display = "block";
    setTimeout(() => modal.classList.add("show"), 10);
    document.getElementById("admin-login").style.display = "block";
    document.getElementById("admin-form").style.display = "none";
    document.getElementById("admin-password").value = "";
    editingPizzaId = null;
}

function closeAdminModal() {
    const modal = document.getElementById("admin-modal");
    modal.classList.remove("show");
    setTimeout(() => modal.style.display = "none", 300);
    resetAdminForm();
}

function adminLogin() {
    const password = document.getElementById("admin-password").value;
    console.log("Senha digitada:", password);
    console.log("Senha esperada (pizzariaConfig.adminPassword):", pizzariaConfig.adminPassword);
    
    if (password === pizzariaConfig.adminPassword) {
        document.getElementById("admin-login").style.display = "none";
        document.getElementById("admin-form").style.display = "block";
        updateAdminForm();
        renderAdminCategories();
        renderAdminProducts();
        renderCarouselImagesAdmin();
        updateWhatsappDisplay();
        updateShareLinkDisplay();
    } else {
        alert("Senha incorreta!");
    }
}

function updateAdminForm() {
    document.getElementById("pizzaria-name-input").value = pizzariaConfig.name;
    document.getElementById("pizzaria-logo-input").value = pizzariaConfig.logo;
    document.getElementById("whatsapp-number-input").value = pizzariaConfig.whatsapp || "";
    const categorySelect = document.getElementById("pizza-category");
    categorySelect.innerHTML = '<option value="">Sem categoria</option>';
    categories.forEach(category => {
        categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
    });
    updateShareLinkDisplay();
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
}

function resetAdminForm() {
    document.getElementById("pizza-name").value = "";
    document.getElementById("pizza-price").value = "";
    document.getElementById("pizza-description").value = "";
    document.getElementById("pizza-image").value = "";
    document.getElementById("pizza-category").value = "";
    document.getElementById("carousel-image-input").value = "";
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
    editingPizzaId = null;
}

function addCategory() {
    const categoryName = document.getElementById("category-name").value.trim();
    if (categoryName && !categories.includes(categoryName)) {
        categories.push(categoryName);
        saveToLocalStorage();
        renderNavbar();
        renderAdminCategories();
        updateAdminForm();
        document.getElementById("category-name").value = "";
        alert("Categoria adicionada com sucesso!");
    } else {
        alert("Digite um nome de categoria válido e único!");
    }
}

function renderAdminCategories() {
    const adminCategories = document.getElementById("admin-categories");
    adminCategories.innerHTML = "<h3>Categorias Existentes</h3>";
    categories.forEach(category => {
        adminCategories.innerHTML += `
            <div class="product-admin-item">
                <span>${category}</span>
                <button onclick="deleteCategory('${category}')">Excluir</button>
            </div>
        `;
    });
}

function deleteCategory(category) {
    if (confirm(`Tem certeza que deseja excluir a categoria "${category}"? Pizzas associadas ficarão sem categoria.`)) {
        categories = categories.filter(c => c !== category);
        pizzas = pizzas.map(p => p.category === category ? { ...p, category: "" } : p);
        saveToLocalStorage();
        renderNavbar();
        renderAdminCategories();
        updateAdminForm();
        renderAdminProducts();
    }
}

function updatePizzaria() {
    const name = document.getElementById("pizzaria-name-input").value;
    const logo = document.getElementById("pizzaria-logo-input").value;

    if (name) pizzariaConfig.name = name;
    if (logo) pizzariaConfig.logo = logo;

    updatePizzariaDisplay();
    saveToLocalStorage();
    alert("Configurações da pizzaria atualizadas com sucesso!");
}

function removeLogo() {
    pizzariaConfig.logo = "https://via.placeholder.com/50"; // Define um logo padrão
    updatePizzariaDisplay();
    saveToLocalStorage();
    document.getElementById("pizzaria-logo-input").value = pizzariaConfig.logo;
    alert("Logo removido e restaurado para o padrão!");
}

function updatePizzariaDisplay() {
    document.getElementById("pizzaria-name").textContent = pizzariaConfig.name;
    document.getElementById("pizzaria-logo").src = pizzariaConfig.logo;
}

function updateWhatsappNumber() {
    const whatsapp = document.getElementById("whatsapp-number-input").value.trim();

    if (!whatsapp) {
        alert("Por favor, insira um número de WhatsApp válido.");
        return;
    }

    if (!/^\d+$/.test(whatsapp)) {
        alert("O número do WhatsApp deve conter apenas dígitos (ex: 5511999999999).");
        return;
    }

    pizzariaConfig.whatsapp = whatsapp; // Salva exatamente o número digitado
    saveToLocalStorage();
    updateWhatsappDisplay();
    alert("Número do WhatsApp atualizado com sucesso!");
}

function updateWhatsappDisplay() {
    const whatsappDisplay = document.getElementById("whatsapp-display");
    whatsappDisplay.textContent = pizzariaConfig.whatsapp || "Nenhum configurado";
}

// Função para gerar o link de divulgação
function generateShareLink() {
    const shareLink = "https://roberson7.github.io/pizzaria/";
    updateShareLinkDisplay(shareLink);
    document.getElementById("copy-share-link").style.display = "block";
    alert("Link de divulgação gerado com sucesso! Clique no botão 'Copiar Link' para copiá-lo.");
}

function updateShareLinkDisplay(link) {
    const shareLinkDisplay = document.getElementById("share-link");
    shareLinkDisplay.textContent = link || "Nenhum gerado ainda";
    if (link) {
        shareLinkDisplay.style.cursor = "pointer";
        shareLinkDisplay.onclick = () => window.open(link, "_blank");
    } else {
        shareLinkDisplay.style.cursor = "default";
        shareLinkDisplay.onclick = null;
    }
}

function copyShareLink() {
    const shareLink = document.getElementById("share-link").textContent;
    if (shareLink && shareLink !== "Nenhum gerado ainda") {
        navigator.clipboard.writeText(shareLink).then(() => {
            alert("Link copiado para a área de transferência!");
        });
    } else {
        alert("Nenhum link disponível para copiar!");
    }
}

// Função para alterar a senha do administrador
function changeAdminPassword() {
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    if (currentPassword !== pizzariaConfig.adminPassword) {
        alert("A senha atual está incorreta!");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("A nova senha e a confirmação não coincidem!");
        return;
    }

    if (newPassword.length < 6) {
        alert("A nova senha deve ter pelo menos 6 caracteres!");
        return;
    }

    pizzariaConfig.adminPassword = newPassword;
    saveToLocalStorage();
    alert("Senha do administrador alterada com sucesso!");
    resetAdminForm();
}

// Carousel Admin Functions
function addCarouselImage() {
    const imageUrl = document.getElementById("carousel-image-input").value.trim();
    if (imageUrl) {
        carouselImages.push(imageUrl);
        saveToLocalStorage();
        renderCarousel();
        renderCarouselImagesAdmin();
        document.getElementById("carousel-image-input").value = "";
        alert("Imagem adicionada ao carrossel com sucesso!");
        startCarousel();
    } else {
        alert("Por favor, insira uma URL válida para a imagem!");
    }
}

function deleteCarouselImage(index) {
    if (confirm("Tem certeza que deseja excluir esta imagem do carrossel?")) {
        carouselImages.splice(index, 1);
        saveToLocalStorage();
        renderCarousel();
        renderCarouselImagesAdmin();
        startCarousel();
    }
}

function renderCarouselImagesAdmin() {
    const carouselImagesDiv = document.getElementById("carousel-images");
    carouselImagesDiv.innerHTML = "<h3>Imagens do Carrossel</h3>";
    carouselImages.forEach((image, index) => {
        carouselImagesDiv.innerHTML += `
            <div class="carousel-admin-item">
                <img src="${image}" alt="Imagem ${index + 1}">
                <span>${image}</span>
                <button onclick="deleteCarouselImage(${index})">Excluir</button>
            </div>
        `;
    });
}

function addPizza() {
    const name = document.getElementById("pizza-name").value;
    const price = parseFloat(document.getElementById("pizza-price").value);
    const description = document.getElementById("pizza-description").value;
    const image = document.getElementById("pizza-image").value || "https://images.unsplash.com/photo-1513104890138-7c749659a680?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";
    const category = document.getElementById("pizza-category").value;

    if (name && price && description) {
        if (editingPizzaId) {
            const pizzaIndex = pizzas.findIndex(p => p.id === editingPizzaId);
            if (pizzaIndex !== -1) {
                pizzas[pizzaIndex] = { id: editingPizzaId, name, price, description, image, category: category || "" };
                alert("Pizza atualizada com sucesso!");
            }
        } else {
            const newPizza = { id: Date.now().toString(), name, price, description, image, category: category || "" };
            pizzas.push(newPizza);
            alert("Pizza adicionada com sucesso!");
        }
        saveToLocalStorage();
        renderPizzas();
        renderAdminProducts();
        resetAdminForm();
    } else {
        alert("Preencha todos os campos obrigatórios (nome, preço e descrição)!");
    }
}

function renderAdminProducts() {
    const adminProducts = document.getElementById("admin-products");
    adminProducts.innerHTML = "<h3>Produtos Existentes</h3>";
    pizzas.forEach(pizza => {
        adminProducts.innerHTML += `
            <div class="product-admin-item">
                <img src="${pizza.image}" alt="${pizza.name}">
                <span>${pizza.name} - ${formatPrice(pizza.price)} ${pizza.category ? `(${pizza.category})` : ""}</span>
                <button class="edit-btn" onclick="editPizza('${pizza.id}')">Editar</button>
                <button onclick="deletePizza('${pizza.id}')">Excluir</button>
            </div>
        `;
    });
}

function deletePizza(pizzaId) {
    if (confirm("Tem certeza que deseja excluir esta pizza?")) {
        pizzas = pizzas.filter(p => p.id !== pizzaId);
        saveToLocalStorage();
        renderPizzas();
        renderAdminProducts();
    }
}

function editPizza(pizzaId) {
    const pizza = pizzas.find(p => p.id === pizzaId);
    if (pizza) {
        editingPizzaId = pizzaId;
        document.getElementById("pizza-name").value = pizza.name;
        document.getElementById("pizza-price").value = pizza.price;
        document.getElementById("pizza-description").value = pizza.description;
        document.getElementById("pizza-image").value = pizza.image;
        document.getElementById("pizza-category").value = pizza.category || "";
    }
}

// Pizzas Functions
function renderPizzas() {
    const productsGrid = document.getElementById("products");
    if (!productsGrid) return;
    productsGrid.innerHTML = "";
    let filteredPizzas = selectedCategory === 'all' ? pizzas : pizzas.filter(pizza => pizza.category === selectedCategory);
    filteredPizzas.forEach((pizza) => {
        const pizzaCard = `
            <div class="product-card">
                <img src="${pizza.image}" alt="${pizza.name}" onclick="showDescription('${pizza.id}')">
                <h3>${pizza.name}</h3>
                <div class="price-container">
                    <span class="single-price">${formatPrice(pizza.price)}</span>
                </div>
                <button onclick="addToCart('${pizza.id}')">Adicionar ao Carrinho</button>
            </div>
        `;
        productsGrid.innerHTML += pizzaCard;
    });
}

// Cart Functions
function addToCart(pizzaId) {
    const cartItem = cart.find((item) => item.pizzaId === pizzaId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ pizzaId, quantity: 1, isCustom: false });
    }
    updateCartCount();
    renderCart();
    saveToLocalStorage();
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
        if (item.isCustom) {
            const customTotal = item.price * item.quantity;
            total += customTotal;
            let flavorList = item.slices.length === 8 ?
                item.slices.map((slice, i) => `<div class="flavor-item">${slice ? `Fatia ${i + 1} foi <span class="flavor-name">${slice}</span>` : `Fatia ${i + 1} (vazia)`}</div>`).join("") :
                item.slices.map((slice, i) => `<div class="flavor-item">${slice ? `${["Primeiro", "Segundo", "Terceiro", "Quarto"][i]} sabor foi <span class="flavor-name">${slice}</span>` : `${["Primeiro", "Segundo", "Terceiro", "Quarto"][i]} sabor (vazio)`}</div>`).join("");
            cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="Custom">
                    <div class="item-details">
                        <span>Pizza montada pelo cliente</span>
                        <div class="flavor-list">${flavorList}</div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                            <button onclick="decreaseQuantity('${item.pizzaId}')">−</button>
                            <span>${item.quantity}x</span>
                            <button onclick="increaseQuantity('${item.pizzaId}')">+</button>
                            <span>${formatPrice(customTotal)}</span>
                            <button onclick="removeFromCart('${item.pizzaId}')">Excluir</button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            const pizza = pizzas.find((p) => p.id === item.pizzaId);
            if (pizza) {
                const itemTotal = pizza.price * item.quantity;
                total += itemTotal;
                cartItems.innerHTML += `
                    <div class="cart-item">
                        <img src="${pizza.image}" alt="${pizza.name}">
                        <div class="item-details">
                            <span>${pizza.name}</span>
                            <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                                <button onclick="decreaseQuantity('${item.pizzaId}')">−</button>
                                <span>${item.quantity}x</span>
                                <button onclick="increaseQuantity('${item.pizzaId}')">+</button>
                                <span>${formatPrice(itemTotal)}</span>
                                <button onclick="removeFromCart('${item.pizzaId}')">Excluir</button>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    });

    document.getElementById("cart-total").textContent = `Total: ${formatPrice(total)}`;
}

function increaseQuantity(pizzaId) {
    const cartItem = cart.find((item) => item.pizzaId === pizzaId);
    if (cartItem) {
        cartItem.quantity++;
        updateCartCount();
        renderCart();
        saveToLocalStorage();
    }
}

function decreaseQuantity(pizzaId) {
    const cartItem = cart.find((item) => item.pizzaId === pizzaId);
    if (cartItem && cartItem.quantity > 1) {
        cartItem.quantity--;
        updateCartCount();
        renderCart();
        saveToLocalStorage();
    }
}

function removeFromCart(pizzaId) {
    cart = cart.filter((item) => item.pizzaId !== pizzaId);
    updateCartCount();
    renderCart();
    saveToLocalStorage();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").textContent = totalItems;
}

function toggleCart() {
    const modal = document.getElementById("cart-modal");
    if (modal.classList.contains("show")) {
        modal.classList.remove("show");
        setTimeout(() => modal.style.display = "none", 300);
    } else {
        modal.style.display = "block";
        setTimeout(() => modal.classList.add("show"), 10);
        renderCart();
    }
}

// Carousel Functions
function renderCarousel() {
    const carouselContainer = document.getElementById("carousel-container");
    if (!carouselContainer) return;
    carouselContainer.innerHTML = "";
    carouselImages.forEach((image) => {
        const slide = `<img src="${image}" class="carousel-slide" alt="Carrossel">`;
        carouselContainer.innerHTML += slide;
    });
    updateCarousel();
}

function updateCarousel() {
    const carouselContainer = document.getElementById("carousel-container");
    if (carouselImages.length > 0) {
        carouselContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
}

function nextSlide() {
    if (carouselImages.length > 1) {
        currentSlide = (currentSlide + 1) % carouselImages.length;
        updateCarousel();
    }
}

function prevSlide() {
    if (carouselImages.length > 1) {
        currentSlide = (currentSlide - 1 + carouselImages.length) % carouselImages.length;
        updateCarousel();
    }
}

function startCarousel() {
    if (carouselImages.length > 1 && !slideInterval) {
        slideInterval = setInterval(nextSlide, 5000);
    } else if (carouselImages.length <= 1 && slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

// Custom Pizza Functions
function openCustomPizzaModal() {
    console.log("Abrindo modal de customização...");
    const modal = document.getElementById("custom-pizza-modal");
    modal.style.display = "block";
    setTimeout(() => modal.classList.add("show"), 10);

    flavorCount = parseInt(document.getElementById("flavor-count").value);
    customPizzaSlices = Array(flavorCount === 8 ? 8 : flavorCount).fill(null);

    const flavorSelect = document.getElementById("flavor-count");
    flavorSelect.onchange = (e) => {
        flavorCount = parseInt(e.target.value);
        customPizzaSlices = Array(flavorCount === 8 ? 8 : flavorCount).fill(null);
        renderPizzaSVG();
        document.getElementById("selected-flavor-image").style.display = "none";
    };

    renderPizzaSVG();
    populateFlavorSelect();
    document.getElementById("selected-flavor-image").style.display = "none";
}

function closeCustomPizzaModal() {
    const modal = document.getElementById("custom-pizza-modal");
    modal.classList.remove("show");
    setTimeout(() => modal.style.display = "none", 300);
}

function renderPizzaSVG() {
    const svg = document.getElementById("pizza-svg");
    const size = Math.min(svg.clientWidth, svg.clientHeight);
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.innerHTML = `<circle cx="${size/2}" cy="${size/2}" r="${size/2 - 10}" fill="none" stroke="#F5F5F5" stroke-width="2"/>`;

    const slices = flavorCount === 8 ? 8 : flavorCount;

    for (let i = 0; i < slices; i++) {
        const angle = (i * (360 / slices) - (180 / slices)) * Math.PI / 180;
        const nextAngle = ((i + 1) * (360 / slices) - (180 / slices)) * Math.PI / 180;
        const x1 = size/2 + (size/2 - 10) * Math.cos(angle);
        const y1 = size/2 + (size/2 - 10) * Math.sin(angle);
        const x2 = size/2 + (size/2 - 10) * Math.cos(nextAngle);
        const y2 = size/2 + (size/2 - 10) * Math.sin(nextAngle);

        let fillColor = "#D2B48C";
        if (customPizzaSlices[i]) {
            fillColor = "#FF6347";
        }
        if (selectedSlice === i) {
            fillColor = "#6B8E23";
        }

        const slice = document.createElementNS("http://www.w3.org/2000/svg", "path");
        slice.setAttribute("d", `M ${size/2} ${size/2} L ${x1} ${y1} A ${size/2 - 10} ${size/2 - 10} 0 0 1 ${x2} ${y2} Z`);
        slice.setAttribute("fill", fillColor);
        slice.setAttribute("stroke", selectedSlice === i ? "#333333" : "#F5F5F5");
        slice.setAttribute("stroke-width", selectedSlice === i ? "4" : "2");
        slice.setAttribute("data-slice", i);
        slice.addEventListener("click", () => selectSlice(i));
        svg.appendChild(slice);
    }
}

function populateFlavorSelect() {
    const flavorSelect = document.getElementById("flavor-select");
    flavorSelect.innerHTML = '<option value="">Selecione um sabor</option>';
    pizzas.forEach(pizza => {
        flavorSelect.innerHTML += `<option value="${pizza.name}">${pizza.name}</option>`;
    });
    flavorSelect.onchange = (e) => selectFlavor(e.target.value);
}

function selectSlice(index) {
    if (index < flavorCount) {
        selectedSlice = index;
        renderPizzaSVG();
        const flavorSelect = document.getElementById("flavor-select");
        flavorSelect.focus();
    }
}

function selectFlavor(flavor) {
    if (selectedSlice !== null && selectedSlice < flavorCount && flavor) {
        customPizzaSlices[selectedSlice] = flavor;
        renderPizzaSVG();

        const selectedPizza = pizzas.find(p => p.name === flavor);
        const flavorImage = document.getElementById("selected-flavor-image");
        if (selectedPizza && selectedPizza.image) {
            console.log("Exibindo imagem para:", flavor, selectedPizza.image);
            flavorImage.src = selectedPizza.image;
            flavorImage.alt = `Pizza ${flavor}`;
            flavorImage.style.display = "block";
        } else {
            flavorImage.style.display = "none";
        }

        selectedSlice = null;
    }
}

function addCustomPizzaToCart() {
    const filledSlices = customPizzaSlices.filter(slice => slice !== null).length;
    if (filledSlices === 0) {
        alert("Escolha pelo menos um sabor para sua pizza!");
        return;
    }

    const finalSlices = [...customPizzaSlices];
    const firstFlavor = finalSlices.find(s => s !== null) || pizzas[0].name;
    for (let i = 0; i < finalSlices.length; i++) {
        if (!finalSlices[i]) finalSlices[i] = firstFlavor;
    }

    let highestPricePizza = null;
    let highestPrice = 0;
    finalSlices.forEach(slice => {
        const pizza = pizzas.find(p => p.name === slice);
        if (pizza && pizza.price > highestPrice) {
            highestPrice = pizza.price;
            highestPricePizza = pizza;
        }
    });

    const customPizza = {
        pizzaId: `custom${Date.now()}`,
        slices: finalSlices,
        quantity: 1,
        isCustom: true,
        price: highestPricePizza.price,
        image: highestPricePizza.image
    };
    cart.push(customPizza);
    updateCartCount();
    renderCart();
    saveToLocalStorage();
    closeCustomPizzaModal();
}

// Description Modal
function showDescription(pizzaId) {
    const pizza = pizzas.find((p) => p.id === pizzaId);
    if (pizza) {
        const modal = document.getElementById("description-modal");
        const content = document.getElementById("description-content");

        content.innerHTML = `
            <span class="close-description" onclick="closeDescriptionModal()">×</span>
            <img src="${pizza.image}" alt="${pizza.name}">
            <h3>${pizza.name}</h3>
            <div class="price-container">
                <span class="single-price">${formatPrice(pizza.price)}</span>
            </div>
            <p>${pizza.description}</p>
            <button onclick="addToCart('${pizza.id}')">Adicionar ao Carrinho</button>
        `;

        modal.style.display = "block";
        setTimeout(() => modal.classList.add("show"), 10);
    }
}

function closeDescriptionModal() {
    const modal = document.getElementById("description-modal");
    modal.classList.remove("show");
    setTimeout(() => modal.style.display = "none", 300);
}

// Checkout Functions
function openCheckoutModal() {
    if (cart.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    const modal = document.getElementById("checkout-modal");
    modal.style.display = "block";
    setTimeout(() => modal.classList.add("show"), 10);

    document.getElementById("customer-name").value = "";
    document.getElementById("customer-phone").value = "";
    document.getElementById("customer-address").value = "";
    document.getElementById("payment-method").value = "";

    document.getElementById("checkout-form").onsubmit = function(e) {
        e.preventDefault();
        submitCheckout();
    };
}

function closeCheckoutModal() {
    const modal = document.getElementById("checkout-modal");
    modal.classList.remove("show");
    setTimeout(() => modal.style.display = "none", 300);
}

function submitCheckout() {
    const name = document.getElementById("customer-name").value;
    const phone = document.getElementById("customer-phone").value;
    const address = document.getElementById("customer-address").value;
    const paymentMethod = document.getElementById("payment-method").value;

    if (!name || !phone || !address || !paymentMethod) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    if (!pizzariaConfig.whatsapp) {
        alert("O número do WhatsApp da pizzaria não foi configurado. Por favor, peça ao administrador para cadastrá-lo no painel administrativo.");
        return;
    }

    let message = `Olá, pedido de ${name}:\n`;
    message += `Telefone: ${phone}\n`;
    message += `Endereço: ${address}\n`;
    message += `Forma de Pagamento: ${paymentMethod}\n\n`;
    message += "Itens do pedido:\n";

    let total = 0;
    cart.forEach((item) => {
        if (item.isCustom) {
            const customTotal = item.price * item.quantity;
            total += customTotal;
            let flavorList = item.slices.length === 8 ?
                item.slices.map((slice, i) => slice ? `Fatia ${i + 1}: ${slice}` : `Fatia ${i + 1} (vazia)`).join(", ") :
                item.slices.map((slice, i) => `${["Primeiro", "Segundo", "Terceiro", "Quarto"][i]} sabor: ${slice || "(vazio)"}`).join(", ");
            message += `Pizza montada (${item.quantity}x): ${flavorList} - ${formatPrice(customTotal)}\n`;
        } else {
            const pizza = pizzas.find((p) => p.id === item.pizzaId);
            if (pizza) {
                const itemTotal = pizza.price * item.quantity;
                total += itemTotal;
                message += `${pizza.name} (${item.quantity}x) - ${formatPrice(itemTotal)}\n`;
            }
        }
    });

    message += `\nTotal: ${formatPrice(total)}`;

    const whatsappNumber = pizzariaConfig.whatsapp;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    cart = [];
    updateCartCount();
    renderCart();
    closeCheckoutModal();
    toggleCart();
    saveToLocalStorage();
}

// Inicialização após o DOM estar carregado
window.onload = function() {
    loadInitialData();
};
