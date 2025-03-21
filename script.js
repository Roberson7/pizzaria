const initialData = {
    pizzas: [
        { id: "1", name: "Margherita", price: 35.9, description: "Molho de tomate, muçarela e manjericão.", image: "https://images.unsplash.com/photo-1604068549290-dea0e4b45da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", category: "Pizzas Tradicionais" },
        { id: "2", name: "Calabresa", price: 38.9, description: "Molho de tomate, calabresa e cebola.", image: "https://images.unsplash.com/photo-1627627331051-703813f99b14?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", category: "Pizzas Tradicionais" },
        { id: "3", name: "Chocolate", price: 42.0, description: "Chocolate derretido e granulado.", image: "https://images.unsplash.com/photo-1595877175789-795d5cc88537?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80", category: "Pizzas Doces" },
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
        adminPassword: "Gcipione", 
        address: "Rua Icarai, 310 - Vila do Conde - Barueri" 
    }
};

let pizzas = JSON.parse(localStorage.getItem("pizzas")) || initialData.pizzas;
let categories = JSON.parse(localStorage.getItem("categories")) || initialData.categories;
let cart = JSON.parse(localStorage.getItem("cart")) || initialData.cart;
let carouselImages = JSON.parse(localStorage.getItem("carouselImages")) || initialData.carouselImages;
let pizzariaConfig = JSON.parse(localStorage.getItem("pizzariaConfig")) || initialData.pizzariaConfig;
let selectedCategory = "all";
let currentSlide = 0;
let selectedPizzaId = null;
let slideInterval;

const formatPrice = (price) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const formatPhoneNumber = (phone) => {
    phone = phone.replace(/\D/g, '');
    if (phone.length >= 10) {
        return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    }
    return phone;
};

// Função para validar e formatar o número do WhatsApp
const validateAndFormatWhatsAppNumber = (number) => {
    // Remove todos os caracteres não numéricos
    number = number.replace(/\D/g, '');
    
    // Verifica se o número tem pelo menos 10 dígitos (DDD + número)
    if (number.length < 10 || number.length > 13) {
        return { isValid: false, formatted: null, error: "O número do WhatsApp deve ter entre 10 e 13 dígitos (ex.: 5511999999999)." };
    }

    // Adiciona o código do país (55 para Brasil) se não estiver presente
    if (!number.startsWith("55") && number.length <= 11) {
        number = "55" + number;
    }

    return { isValid: true, formatted: number, error: null };
};

const showAlertModal = (message, title = "Aviso", isOrderConfirmation = false) => {
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
    setTimeout(() => modal.style.display = "none", 300);
};

const saveToLocalStorage = () => {
    localStorage.setItem("pizzas", JSON.stringify(pizzas));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("carouselImages", JSON.stringify(carouselImages));
    localStorage.setItem("pizzariaConfig", JSON.stringify(pizzariaConfig));
};

const loadInitialData = () => {
    if (!pizzariaConfig.adminPassword) {
        pizzariaConfig.adminPassword = "Gcipione";
        saveToLocalStorage();
    }
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
    navbar.innerHTML = '<li><a href="#" data-category="all" class="active">Todas</a></li>' +
        categories.map(category => `<li><a href="#" data-category="${category}">${category}</a></li>`).join("");
    document.querySelectorAll(".nav-list a").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            filterCategory(link.getAttribute("data-category"));
        });
    });
};

const filterCategory = (category) => {
    selectedCategory = category;
    renderPizzas();
    document.querySelectorAll(".nav-list a").forEach(link => {
        link.classList.toggle("active", link.getAttribute("data-category") === category);
    });
    if (window.innerWidth <= 768) toggleMenu();
};

const toggleMenu = () => {
    const navList = document.getElementById("nav-list");
    navList.classList.toggle("show");
};

const updatePizzariaDisplay = () => {
    document.getElementById("pizzaria-name").innerHTML = `<span>Sabor</span> <span>da Itália</span> <span class="flag-icon"></span>`;
    document.getElementById("pizzaria-address").textContent = pizzariaConfig.address;
    
    const mobileAddressElement = document.getElementById("mobile-address");
    if (mobileAddressElement) {
        console.log("Atualizando endereço no mobile:", pizzariaConfig.address);
        mobileAddressElement.textContent = pizzariaConfig.address;
    } else {
        console.error("Elemento #mobile-address não encontrado!");
    }
    
    const logoElement = document.getElementById("pizzaria-logo");
    if (logoElement && pizzariaConfig.logo) {
        logoElement.src = pizzariaConfig.logo;
    }
};

const renderPizzas = () => {
    const productsGrid = document.getElementById("products");
    const filteredPizzas = selectedCategory === "all" ? pizzas : pizzas.filter(p => p.category === selectedCategory);
    productsGrid.innerHTML = filteredPizzas.map(pizza => `
        <div class="product-card">
            <img src="${pizza.image}" alt="${pizza.name}" onclick="showProductDetail('${pizza.id}')">
            <h3>${pizza.name}</h3>
            <div class="price-container">
                <span class="single-price">${formatPrice(pizza.price)}</span>
            </div>
            <button onclick="addToCart('${pizza.id}')">Adicionar ao Carrinho</button>
        </div>
    `).join("");
};

const addToCart = (pizzaId) => {
    const cartItem = cart.find(item => item.pizzaId === pizzaId);
    if (cartItem) cartItem.quantity++;
    else cart.push({ pizzaId, quantity: 1 });
    updateCartCount();
    renderCart();
    saveToLocalStorage();
};

const renderCart = () => {
    const cartItems = document.getElementById("cart-items");
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        if (item.isCustom) {
            const flavorNames = item.flavors.map((flavorId, index) => {
                const pizza = pizzas.find(p => p.id === flavorId);
                return `${index + 1}º Sabor: ${pizza ? pizza.name : "Desconhecido"}`;
            }).join("<br>");
            const avgPrice = item.flavors.reduce((sum, flavorId) => {
                const pizza = pizzas.find(p => p.id === flavorId);
                return sum + (pizza ? pizza.price : 0);
            }, 0) / item.flavors.length;
            const itemTotal = avgPrice * item.quantity;
            total += itemTotal;
            return `
                <div class="cart-item">
                    <img src="${pizzas.find(p => p.id === item.flavors[0])?.image || 'https://via.placeholder.com/50'}" alt="Pizza Personalizada">
                    <div class="item-details">
                        <span class="item-name">Pizza Personalizada (${item.quantity}x)</span>
                        <span class="item-flavors">${flavorNames}</span>
                        <span class="item-price">${formatPrice(itemTotal)}</span>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${item.pizzaId}')">Excluir</button>
                </div>
            `;
        } else {
            const pizza = pizzas.find(p => p.id === item.pizzaId);
            const itemTotal = pizza.price * item.quantity;
            total += itemTotal;
            return `
                <div class="cart-item">
                    <img src="${pizza.image}" alt="${pizza.name}">
                    <div class="item-details">
                        <span class="item-name">${pizza.name} (${item.quantity}x)</span>
                        <span class="item-price">${formatPrice(itemTotal)}</span>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${pizza.id}')">Excluir</button>
                </div>
            `;
        }
    }).join("");
    document.getElementById("cart-total").textContent = `Total: ${formatPrice(total)}`;
    const checkoutButton = document.getElementById("checkout-btn");
    checkoutButton.disabled = cart.length === 0;
};

const removeFromCart = (pizzaId) => {
    cart = cart.filter(item => item.pizzaId !== pizzaId);
    updateCartCount();
    renderCart();
    saveToLocalStorage();
};

const updateCartCount = () => {
    document.getElementById("cart-count").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
};

const toggleCart = () => {
    const modal = document.getElementById("cart-modal");
    modal.classList.toggle("show");
    if (modal.classList.contains("show")) {
        modal.style.display = "block";
        renderCart();
    } else {
        setTimeout(() => modal.style.display = "none", 300);
    }
};

const openCheckoutModal = () => {
    if (cart.length === 0) {
        showAlertModal("O carrinho está vazio! Adicione itens antes de finalizar o pedido.", "Erro");
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
    setTimeout(() => modal.style.display = "none", 300);
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
        cart.forEach(item => {
            if (item.isCustom) {
                const flavorNames = item.flavors.map((flavorId, index) => {
                    const pizza = pizzas.find(p => p.id === flavorId);
                    const ordinal = ["Primeiro", "Segundo", "Terceiro", "Quarto", "Quinto", "Sexto", "Sétimo", "Oitavo"];
                    return `*${ordinal[index]} Sabor:* ${pizza ? pizza.name : "Desconhecido"}`;
                }).join("\n  ");
                const avgPrice = item.flavors.reduce((sum, flavorId) => {
                    const pizza = pizzas.find(p => p.id === flavorId);
                    return sum + (pizza ? pizza.price : 0);
                }, 0) / item.flavors.length;
                const itemTotal = avgPrice * item.quantity;
                total += itemTotal;
                orderMessage += `*- Pizza Personalizada*\n  ${flavorNames}\n  Quantidade: ${item.quantity}x\n  Valor: ${formatPrice(itemTotal)}\n`;
            } else {
                const pizza = pizzas.find(p => p.id === item.pizzaId);
                const itemTotal = pizza.price * item.quantity;
                total += itemTotal;
                orderMessage += `- ${pizza.name}\n  Quantidade: ${item.quantity}x\n  Valor: ${formatPrice(itemTotal)}\n`;
            }
        });
        orderMessage += `\n*Total:* ${formatPrice(total)}`;

        const confirmationMessage = `
            <p class="alert-message">Seu pedido foi enviado com sucesso!</p>
            <div class="order-details">
                <p><span>Nome:</span> ${name}</p>
                <p><span>Telefone:</span> ${formatPhoneNumber(phone)}</p>
                <p><span>Endereço:</span> ${address}</p>
                <p><span>Pagamento:</span> ${payment}</p>
            </div>
            <p class="thank-you">Você será redirecionado automaticamente para o WhatsApp...</p>
            <p class="thank-you">Grazie mille! Em breve, sua pizza estará a caminho!</p>
        `;

        if (pizzariaConfig.whatsapp) {
            const whatsappNumber = pizzariaConfig.whatsapp.replace(/\D/g, '');
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
            
            showAlertModal(confirmationMessage, "Sucesso", true);
            setTimeout(() => {
                window.location.href = whatsappUrl;
                closeAlertModal();
            }, 2000);
        } else {
            showAlertModal("Número de WhatsApp não configurado pelo administrador!", "Erro");
            return;
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
    setTimeout(() => modal.style.display = "none", 300);
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

    if (keyword === "chave") {
        if (newPassword) {
            pizzariaConfig.adminPassword = newPassword;
            saveToLocalStorage();
            showAlertModal("Senha redefinida com sucesso!", "Sucesso");
            showAdminLogin();
        } else {
            showAlertModal("Por favor, insira uma nova senha!", "Erro");
        }
    } else {
        showAlertModal("Palavra-chave incorreta!", "Erro");
    }
};

const updateAdminForm = () => {
    const adminForm = document.getElementById("admin-form");
    adminForm.innerHTML = `
        <h2>Painel de Administração</h2>
        <h3>Configurações da Pizzaria</h3>
        <input type="text" id="pizzaria-name-input" value="${pizzariaConfig.name}" placeholder="Nome da Pizzaria">
        <input type="text" id="pizzaria-logo-input" value="${pizzariaConfig.logo}" placeholder="URL do Logo">
        <input type="text" id="pizzaria-address-input" value="${pizzariaConfig.address}" placeholder="Endereço da Pizzaria">
        <input type="text" id="pizzaria-whatsapp-input" value="${pizzariaConfig.whatsapp || ''}" placeholder="Número do WhatsApp (ex: 5511999999999)">
        <button onclick="updatePizzaria()">Atualizar Configurações</button>

        <h3>Adicionar Nova Pizza</h3>
        <input type="text" id="pizza-name" placeholder="Nome da Pizza">
        <input type="number" id="pizza-price" placeholder="Preço" step="0.01">
        <input type="text" id="pizza-description" placeholder="Descrição">
        <input type="text" id="pizza-image" placeholder="URL da Imagem">
        <select id="pizza-category">
            <option value="">Selecione a Categoria</option>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join("")}
        </select>
        <button onclick="addPizza()">Adicionar Pizza</button>

        <h3>Gerenciar Pizzas</h3>
        <div id="pizza-list">
            ${pizzas.map((pizza, index) => `
                <p>${pizza.name} - ${formatPrice(pizza.price)} 
                <button onclick="deletePizza(${index})">Excluir</button></p>
            `).join("")}
        </div>

        <h3>Imagens do Carrossel</h3>
        <input type="text" id="carousel-image-input" placeholder="URL da Imagem">
        <button onclick="addCarouselImage()">Adicionar Imagem</button>
        <div id="carousel-images">
            ${carouselImages.map((img, i) => `<p>${img} <button onclick="deleteCarouselImage(${i})">Excluir</button></p>`).join("")}
        </div>

        <button class="close-btn" onclick="closeAdminModal()">Fechar</button>
    `;
};

const updatePizzaria = () => {
    const newName = document.getElementById("pizzaria-name-input").value;
    const newLogo = document.getElementById("pizzaria-logo-input").value;
    const newAddress = document.getElementById("pizzaria-address-input").value;
    const newWhatsApp = document.getElementById("pizzaria-whatsapp-input").value;

    // Valida o número do WhatsApp
    const whatsappValidation = validateAndFormatWhatsAppNumber(newWhatsApp);
    if (!whatsappValidation.isValid) {
        showAlertModal(whatsappValidation.error, "Erro");
        return;
    }

    // Atualiza as configurações
    pizzariaConfig.name = newName;
    pizzariaConfig.logo = newLogo;
    pizzariaConfig.address = newAddress;
    pizzariaConfig.whatsapp = whatsappValidation.formatted; // Salva o número formatado

    saveToLocalStorage();
    updatePizzariaDisplay();
    showAlertModal("Configurações atualizadas com sucesso!", "Sucesso");
};

const addPizza = () => {
    const name = document.getElementById("pizza-name").value;
    const price = parseFloat(document.getElementById("pizza-price").value);
    const description = document.getElementById("pizza-description").value;
    const image = document.getElementById("pizza-image").value || "https://via.placeholder.com/300";
    const category = document.getElementById("pizza-category").value;

    if (!name || !price || !category) {
        showAlertModal("Por favor, preencha nome, preço e categoria!", "Erro");
        return;
    }

    const pizza = {
        id: Date.now().toString(),
        name,
        price,
        description,
        image,
        category
    };
    pizzas.push(pizza);
    saveToLocalStorage();
    renderPizzas();
    updateAdminForm();
    showAlertModal("Pizza adicionada com sucesso!", "Sucesso");
};

const deletePizza = (index) => {
    if (confirm("Tem certeza que deseja excluir esta pizza?")) {
        pizzas.splice(index, 1);
        saveToLocalStorage();
        renderPizzas();
        updateAdminForm();
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
    setTimeout(() => modal.style.display = "none", 300);
};

const updateFlavorSelectors = () => {
    const flavorCount = parseInt(document.getElementById("flavor-count").value);
    const flavorSelectorsDiv = document.getElementById("flavor-selectors");
    flavorSelectorsDiv.innerHTML = "";

    for (let i = 0; i < flavorCount; i++) {
        const select = document.createElement("select");
        select.id = `flavor-select-${i}`;
        select.innerHTML = '<option value="">Selecione o sabor ' + (i + 1) + '</option>' +
            pizzas.map(pizza => `<option value="${pizza.id}">${pizza.name}</option>`).join("");
        select.onchange = () => {
            updateFlavorOptions();
            updatePizzaPreview();
        };
        flavorSelectorsDiv.appendChild(select);
    }

    updateFlavorOptions();
    updatePizzaPreview();
};

const updateFlavorOptions = () => {
    const flavorCount = parseInt(document.getElementById("flavor-count").value);
    const selectedFlavors = [];

    for (let i = 0; i < flavorCount; i++) {
        const select = document.getElementById(`flavor-select-${i}`);
        if (select && select.value) {
            selectedFlavors.push(select.value);
        }
    }

    for (let i = 0; i < flavorCount; i++) {
        const select = document.getElementById(`flavor-select-${i}`);
        const currentValue = select.value;
        select.innerHTML = '<option value="">Selecione o sabor ' + (i + 1) + '</option>' +
            pizzas
                .filter(pizza => !selectedFlavors.includes(pizza.id) || pizza.id === currentValue)
                .map(pizza => `<option value="${pizza.id}">${pizza.name}</option>`).join("");
        select.value = currentValue;
    }
};

const updatePizzaPreview = () => {
    const flavorCount = parseInt(document.getElementById("flavor-count").value);
    const svg = document.getElementById("pizza-svg");
    svg.innerHTML = "";

    const radius = 90;
    const centerX = 100;
    const centerY = 100;
    const angleStep = 360 / flavorCount;

    svg.innerHTML += `<circle cx="${centerX}" cy="${centerY}" r="${radius + 10}" fill="#e6c84f" />`;
    svg.innerHTML += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#fff8e1" />`;

    for (let i = 0; i < flavorCount; i++) {
        const startAngle = i * angleStep;
        const endAngle = (i + 1) * angleStep;
        const startRad = startAngle * Math.PI / 180;
        const endRad = endAngle * Math.PI / 180;
        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);
        const largeArcFlag = (endAngle - startAngle <= 180) ? 0 : 1;

        const pathD = `M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
        svg.innerHTML += `<path d="${pathD}" fill="#ccc" stroke="#8a1c1c" stroke-width="2" />`;

        const flavorSelect = document.getElementById(`flavor-select-${i}`);
        if (flavorSelect && flavorSelect.value) {
            const selectedPizza = pizzas.find(p => p.id === flavorSelect.value);
            if (selectedPizza) {
                svg.innerHTML += `<defs><clipPath id="clip-${i}"><path d="${pathD}" /></clipPath></defs>`;
                const imgSize = radius * 2;
                const offsetX = centerX - radius;
                const offsetY = centerY - radius;
                svg.innerHTML += `<image xlink:href="${selectedPizza.image}" x="${offsetX}" y="${offsetY}" width="${imgSize}" height="${imgSize}" clip-path="url(#clip-${i})" preserveAspectRatio="xMidYMid slice" />`;
            }
        }
    }
};

const addCustomPizzaToCart = () => {
    const flavorCount = parseInt(document.getElementById("flavor-count").value);
    const flavors = [];

    for (let i = 0; i < flavorCount; i++) {
        const flavorSelect = document.getElementById(`flavor-select-${i}`);
        if (flavorSelect && flavorSelect.value) {
            flavors.push(flavorSelect.value);
        }
    }

    if (flavors.length !== flavorCount) {
        showAlertModal(`Por favor, selecione todos os ${flavorCount} sabores para sua pizza personalizada!`, "Erro");
        return;
    }

    const customPizzaId = "custom-" + Date.now().toString();
    const avgPrice = flavors.reduce((sum, flavorId) => {
        const pizza = pizzas.find(p => p.id === flavorId);
        return sum + (pizza ? pizza.price : 0);
    }, 0) / flavors.length;

    const cartItem = cart.find(item => item.pizzaId === customPizzaId && JSON.stringify(item.flavors) === JSON.stringify(flavors));
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({
            pizzaId: customPizzaId,
            flavors: flavors,
            quantity: 1,
            isCustom: true
        });
    }

    updateCartCount();
    renderCart();
    saveToLocalStorage();
    closeCustomPizzaModal();
};

const renderCarousel = () => {
    const carousel = document.getElementById("carousel-container");
    if (!carousel) return;
    carousel.style.width = `${carouselImages.length * 100}%`;
    carousel.innerHTML = carouselImages.map((img, index) => `
        <img src="${img}" alt="Slide ${index + 1}" class="carousel-slide" style="width: ${100 / carouselImages.length}%;">
    `).join("");
    updateCarouselPosition();
};

const updateCarouselPosition = () => {
    const carousel = document.getElementById("carousel-container");
    if (!carousel) return;
    carousel.style.transform = `translateX(-${currentSlide * (100 / carouselImages.length)}%)`;
};

const startCarousel = () => {
    clearInterval(slideInterval);
    if (carouselImages.length > 1) slideInterval = setInterval(nextSlide, 5000);
};

const nextSlide = () => {
    currentSlide = (currentSlide + 1) % carouselImages.length;
    updateCarouselPosition();
};

const prevSlide = () => {
    currentSlide = (currentSlide - 1 + carouselImages.length) % carouselImages.length;
    updateCarouselPosition();
};

const addCarouselImage = () => {
    const imageUrl = document.getElementById("carousel-image-input").value.trim();
    if (imageUrl) {
        carouselImages.push(imageUrl);
        saveToLocalStorage();
        renderCarousel();
        updateAdminForm();
        startCarousel();
    }
};

const deleteCarouselImage = (index) => {
    if (confirm("Tem certeza que deseja excluir esta imagem?")) {
        carouselImages.splice(index, 1);
        if (currentSlide >= carouselImages.length) currentSlide = carouselImages.length - 1;
        if (currentSlide < 0) currentSlide = 0;
        saveToLocalStorage();
        renderCarousel();
        updateAdminForm();
        startCarousel();
    }
};

const showProductDetail = (pizzaId) => {
    const pizza = pizzas.find(p => p.id === pizzaId);
    if (!pizza) return;

    selectedPizzaId = pizzaId;
    document.getElementById("product-detail-name").textContent = pizza.name;
    document.getElementById("product-detail-image").src = pizza.image;
    document.getElementById("product-detail-description").textContent = pizza.description;
    document.getElementById("product-detail-price").textContent = formatPrice(pizza.price);

    const modal = document.getElementById("product-detail-modal");
    modal.style.display = "block";
    setTimeout(() => modal.classList.add("show"), 10);
};

const closeProductDetailModal = () => {
    const modal = document.getElementById("product-detail-modal");
    modal.classList.remove("show");
    setTimeout(() => modal.style.display = "none", 300);
};

const addToCartFromDetail = () => {
    if (selectedPizzaId) {
        addToCart(selectedPizzaId);
        closeProductDetailModal();
    }
};

document.addEventListener("DOMContentLoaded", loadInitialData);
