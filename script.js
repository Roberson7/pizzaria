// Dados iniciais com imagens reais de exemplo
let pizzas = JSON.parse(localStorage.getItem('pizzas')) || [
    { id: '1', name: 'Margherita', price: 35.90, description: 'Molho de tomate, muçarela e manjericão.', image: 'https://images.unsplash.com/photo-1604068549290-dea0e4b45da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', category: 'Pizzas Salgadas' },
    { id: '2', name: 'Calabresa', price: 38.90, description: 'Molho de tomate, calabresa e cebola.', image: 'https://images.unsplash.com/photo-1627627331051-703813f99b14?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', category: 'Pizzas Salgadas' },
    { id: '3', name: 'Chocolate', price: 42.00, description: 'Chocolate derretido e granulado.', image: 'https://images.unsplash.com/photo-1595877175789-795d5cc88537?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', category: 'Pizzas Doces' },
];
let categories = JSON.parse(localStorage.getItem('categories')) || ['Pizzas Salgadas', 'Pizzas Doces'];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let carouselImages = JSON.parse(localStorage.getItem('carouselImages')) || [
    'https://images.unsplash.com/photo-1594007654729-407eedc4be65?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1571066811602-716837d9f582?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
];

// Configuração da pizzaria com senha fixa "Gcipione"
let pizzariaConfig = JSON.parse(localStorage.getItem('pizzariaConfig')) || {
    name: 'Pizzaria Italiana',
    logo: 'https://via.placeholder.com/50',
    whatsapp: '',
    adminPassword: 'Gcipione' // Senha fixa
};

// Forçar a senha padrão se estiver ausente ou inválida
if (!pizzariaConfig.adminPassword || pizzariaConfig.adminPassword !== 'Gcipione') {
    pizzariaConfig.adminPassword = 'Gcipione';
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
        localStorage.setItem('pizzas', JSON.stringify(pizzas));
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('carouselImages', JSON.stringify(carouselImages));
        localStorage.setItem('pizzariaConfig', JSON.stringify(pizzariaConfig));
        console.log('Dados salvos no localStorage:', { pizzariaConfig, pizzas, categories, cart, carouselImages });
    } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
    }
}

function formatPrice(price) {
    return `R$ ${price.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

function loadInitialData() {
    console.log('Carregando dados iniciais...');
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
    const navbar = document.getElementById('nav-list');
    if (!navbar) return;
    navbar.innerHTML = '<li><a href="#" data-category="all" class="active">Todas</a></li>';
    categories.forEach(category => {
        navbar.innerHTML += `<li><a href="#" data-category="${category}">${category}</a></li>`;
    });

    const links = document.querySelectorAll('.navbar a');
    links.forEach(link => {
        link.addEventListener('mouseover', function() {
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
        link.addEventListener('mouseout', function() {
            links.forEach(l => l.classList.remove('active'));
            const selectedLink = document.querySelector(`.navbar a[data-category="${selectedCategory}"]`);
            if (selectedLink) selectedLink.classList.add('active');
        });
        link.addEventListener('click', function(e) {
            e.preventDefault();
            filterCategory(this.getAttribute('data-category'));
        });
    });
}

function filterCategory(category) {
    selectedCategory = category;
    renderPizzas();
    toggleMenu();
    const links = document.querySelectorAll('.navbar a');
    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-category') === category) {
            link.classList.add('active');
        }
    });
}

function toggleMenu() {
    const navList = document.getElementById('nav-list');
    navList.classList.toggle('show');
}

// Admin Functions
function openAdminModal() {
    const modal = document.getElementById('admin-modal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-form').style.display = 'none';
    document.getElementById('admin-password').value = '';
    editingPizzaId = null;
}

function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
    resetAdminForm();
}

function adminLogin() {
    const password = document.getElementById('admin-password').value;
    if (password === pizzariaConfig.adminPassword) {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-form').style.display = 'block';
        updateAdminForm();
        renderAdminCategories();
        renderAdminProducts();
        renderCarouselImagesAdmin();
        updateWhatsappDisplay();
    } else {
        alert('Senha incorreta! A senha é "Gcipione".');
    }
}

function updateAdminForm() {
    const adminForm = document.getElementById('admin-form');
    adminForm.innerHTML = `
        <h3>Configurações da Pizzaria</h3>
        <input type="text" id="pizzaria-name-input" placeholder="Nome da Pizzaria" value="${pizzariaConfig.name}">
        <input type="text" id="pizzaria-logo-input" placeholder="URL do Logo" value="${pizzariaConfig.logo}">
        <button onclick="updatePizzaria()">Atualizar Pizzaria</button>
        <button onclick="removeLogo()">Remover Logo</button>

        <h3>Telefone do WhatsApp para Pedidos</h3>
        <input type="text" id="whatsapp-number-input" placeholder="Número do WhatsApp (ex: 5511999999999)" value="${pizzariaConfig.whatsapp || ''}">
        <button onclick="updateWhatsappNumber()">Salvar Número do WhatsApp</button>
        <p id="current-whatsapp">Número atual: <span id="whatsapp-display">${pizzariaConfig.whatsapp || 'Nenhum configurado'}</span></p>

        <h3>Link de Divulgação</h3>
        <button onclick="generateShareLink()">Gerar Link de Divulgação</button>
        <p id="share-link-display">Link: <span id="share-link">Nenhum gerado ainda</span></p>
        <button id="copy-share-link" style="display: none;" onclick="copyShareLink()">Copiar Link</button>

        <h3>Alterar Senha do Administrador</h3>
        <input type="password" id="current-password" placeholder="Senha Atual">
        <input type="password" id="new-password" placeholder="Nova Senha">
        <input type="password" id="confirm-password" placeholder="Confirme a Nova Senha">
        <button onclick="changeAdminPassword()">Alterar Senha</button>

        <h3>Gerenciar Carrossel</h3>
        <input type="text" id="carousel-image-input" placeholder="URL da Imagem do Carrossel">
        <button onclick="addCarouselImage()">Adicionar Imagem</button>
        <div id="carousel-images"></div>

        <h3>Adicionar Categoria</h3>
        <input type="text" id="category-name" placeholder="Nome da Categoria">
        <button onclick="addCategory()">Adicionar Categoria</button>
        <div id="admin-categories"></div>

        <h3>Adicionar/Editar Pizza</h3>
        <input type="text" id="pizza-name" placeholder="Nome da Pizza">
        <input type="number" id="pizza-price" placeholder="Preço">
        <input type="text" id="pizza-description" placeholder="Descrição">
        <input type="text" id="pizza-image" placeholder="URL da Imagem">
        <select id="pizza-category">
            <option value="">Sem categoria</option>
            ${categories.map(category => `<option value="${category}">${category}</option>`).join('')}
        </select>
        <button onclick="addPizza()">Salvar Pizza</button>
        <div id="admin-products"></div>
    `;
}

function resetAdminForm() {
    const formElements = ['pizza-name', 'pizza-price', 'pizza-description', 'pizza-image', 'pizza-category', 'carousel-image-input', 'current-password', 'new-password', 'confirm-password'];
    formElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    editingPizzaId = null;
}

function addCategory() {
    const categoryName = document.getElementById('category-name').value.trim();
    if (categoryName && !categories.includes(categoryName)) {
        categories.push(categoryName);
        saveToLocalStorage();
        renderNavbar();
        renderAdminCategories();
        updateAdminForm();
        alert('Categoria adicionada com sucesso!');
    } else {
        alert('Digite um nome de categoria válido e único!');
    }
}

function renderAdminCategories() {
    const adminCategories = document.getElementById('admin-categories');
    if (!adminCategories) return;
    adminCategories.innerHTML = '<h3>Categorias Existentes</h3>';
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
        pizzas = pizzas.map(p => p.category === category ? { ...p, category: '' } : p);
        saveToLocalStorage();
        renderNavbar();
        renderAdminCategories();
        updateAdminForm();
        renderAdminProducts();
    }
}

function updatePizzaria() {
    const name = document.getElementById('pizzaria-name-input').value;
    const logo = document.getElementById('pizzaria-logo-input').value;

    if (name) pizzariaConfig.name = name;
    if (logo) pizzariaConfig.logo = logo;

    updatePizzariaDisplay();
    saveToLocalStorage();
    alert('Configurações da pizzaria atualizadas com sucesso!');
}

function removeLogo() {
    pizzariaConfig.logo = 'https://via.placeholder.com/50';
    updatePizzariaDisplay();
    saveToLocalStorage();
    document.getElementById('pizzaria-logo-input').value = pizzariaConfig.logo;
    alert('Logo removido e restaurado para o padrão!');
}

function updatePizzariaDisplay() {
    document.getElementById('pizzaria-name').textContent = pizzariaConfig.name;
    document.getElementById('pizzaria-logo').src = pizzariaConfig.logo;
}

function updateWhatsappNumber() {
    const whatsapp = document.getElementById('whatsapp-number-input').value.trim();
    if (!whatsapp) {
        alert('Por favor, insira um número de WhatsApp válido.');
        return;
    }
    if (!/^\d+$/.test(whatsapp)) {
        alert('O número do WhatsApp deve conter apenas dígitos (ex: 5511999999999).');
        return;
    }
    pizzariaConfig.whatsapp = whatsapp;
    saveToLocalStorage();
    updateWhatsappDisplay();
    alert('Número do WhatsApp atualizado com sucesso!');
}

function updateWhatsappDisplay() {
    const whatsappDisplay = document.getElementById('whatsapp-display');
    if (whatsappDisplay) whatsappDisplay.textContent = pizzariaConfig.whatsapp || 'Nenhum configurado';
}

function generateShareLink() {
    const shareLink = 'https://roberson7.github.io/pizzaria/';
    updateShareLinkDisplay(shareLink);
    document.getElementById('copy-share-link').style.display = 'block';
    alert('Link de divulgação gerado com sucesso! Clique no botão "Copiar Link" para copiá-lo.');
}

function updateShareLinkDisplay(link) {
    const shareLinkDisplay = document.getElementById('share-link');
    if (!shareLinkDisplay) return;
    shareLinkDisplay.textContent = link || 'Nenhum gerado ainda';
    if (link) {
        shareLinkDisplay.style.cursor = 'pointer';
        shareLinkDisplay.onclick = () => window.open(link, '_blank');
    } else {
        shareLinkDisplay.style.cursor = 'default';
        shareLinkDisplay.onclick = null;
    }
}

function copyShareLink() {
    const shareLink = document.getElementById('share-link').textContent;
    if (shareLink && shareLink !== 'Nenhum gerado ainda') {
        navigator.clipboard.writeText(shareLink).then(() => {
            alert('Link copiado para a área de transferência!');
        });
    } else {
        alert('Nenhum link disponível para copiar!');
    }
}

function changeAdminPassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    if (currentPassword !== pizzariaConfig.adminPassword) {
        alert('A senha atual está incorreta!');
        return;
    }
    if (newPassword !== confirmPassword) {
        alert('A nova senha e a confirmação não coincidem!');
        return;
    }
    if (newPassword.length < 6) {
        alert('A nova senha deve ter pelo menos 6 caracteres!');
        return;
    }
    pizzariaConfig.adminPassword = newPassword;
    saveToLocalStorage();
    alert('Senha do administrador alterada com sucesso!');
    resetAdminForm();
}

// Carousel Admin Functions
function addCarouselImage() {
    const imageUrl = document.getElementById('carousel-image-input').value.trim();
    if (imageUrl) {
        carouselImages.push(imageUrl);
        saveToLocalStorage();
        renderCarousel();
        renderCarouselImagesAdmin();
        document.getElementById('carousel-image-input').value = '';
        alert('Imagem adicionada ao carrossel com sucesso!');
        startCarousel();
    } else {
        alert('Por favor, insira uma URL válida para a imagem!');
    }
}

function deleteCarouselImage(index) {
    if (confirm('Tem certeza que deseja excluir esta imagem do carrossel?')) {
        carouselImages.splice(index, 1);
        saveToLocalStorage();
        renderCarousel();
        renderCarouselImagesAdmin();
        startCarousel();
    }
}

function renderCarouselImagesAdmin() {
    const carouselImagesDiv = document.getElementById('carousel-images');
    if (!carouselImagesDiv) return;
    carouselImagesDiv.innerHTML = '<h3>Imagens do Carrossel</h3>';
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
    const name = document.getElementById('pizza-name').value;
    const price = parseFloat(document.getElementById('pizza-price').value);
    const description = document.getElementById('pizza-description').value;
    const image = document.getElementById('pizza-image').value || 'https://images.unsplash.com/photo-1513104890138-7c749659a680?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
    const category = document.getElementById('pizza-category').value;

    if (name && price && description) {
        if (editingPizzaId) {
            const pizzaIndex = pizzas.findIndex(p => p.id === editingPizzaId);
            if (pizzaIndex !== -1) {
                pizzas[pizzaIndex] = { id: editingPizzaId, name, price, description, image, category: category || '' };
                alert('Pizza atualizada com sucesso!');
            }
        } else {
            const newPizza = { id: Date.now().toString(), name, price, description, image, category: category || '' };
            pizzas.push(newPizza);
            alert('Pizza adicionada com sucesso!');
        }
        saveToLocalStorage();
        renderPizzas();
        renderAdminProducts();
        resetAdminForm();
    } else {
        alert('Preencha todos os campos obrigatórios (nome, preço e descrição)!');
    }
}

function renderAdminProducts() {
    const adminProducts = document.getElementById('admin-products');
    if (!adminProducts) return;
    adminProducts.innerHTML = '<h3>Produtos Existentes</h3>';
    pizzas.forEach(pizza => {
        adminProducts.innerHTML += `
            <div class="product-admin-item">
                <img src="${pizza.image}" alt="${pizza.name}">
                <span>${pizza.name} - ${formatPrice(pizza.price)} ${pizza.category ? `(${pizza.category})` : ''}</span>
                <button class="edit-btn" onclick="editPizza('${pizza.id}')">Editar</button>
                <button onclick="deletePizza('${pizza.id}')">Excluir</button>
            </div>
        `;
    });
}

function deletePizza(pizzaId) {
    if (confirm('Tem certeza que deseja excluir esta pizza?')) {
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
        document.getElementById('pizza-name').value = pizza.name;
        document.getElementById('pizza-price').value = pizza.price;
        document.getElementById('pizza-description').value = pizza.description;
        document.getElementById('pizza-image').value = pizza.image;
        document.getElementById('pizza-category').value = pizza.category || '';
    }
}

// Pizzas Functions
function renderPizzas() {
    const productsGrid = document.getElementById('products');
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    let filteredPizzas = selectedCategory === 'all' ? pizzas : pizzas.filter(pizza => pizza.category === selectedCategory);
    filteredPizzas.forEach(pizza => {
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
    const cartItem = cart.find(item => item.pizzaId === pizzaId);
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
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        if (item.isCustom) {
            const customTotal = item.price * item.quantity;
            total += customTotal;
            let flavorList = item.slices.length === 8
                ? item.slices.map((slice, i) => `<div class="flavor-item">${slice ? `Fatia ${i+1}: <span class="flavor-name">${slice}</span>` : `Fatia ${i+1} (vazia)`}</div>`).join('')
                : item.slices.map((slice, i) => `<div class="flavor-item">${slice ? `${['Primeiro', 'Segundo', 'Terceiro', 'Quarto'][i]} sabor: <span class="flavor-name">${slice}</span>` : `${['Primeiro', 'Segundo', 'Terceiro', 'Quarto'][i]} sabor (vazio)`}</div>`).join('');
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
            const pizza = pizzas.find(p => p.id === item.pizzaId);
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

    document.getElementById('cart-total').textContent = `Total: ${formatPrice(total)}`;
}

function increaseQuantity(pizzaId) {
    const cartItem = cart.find(item => item.pizzaId === pizzaId);
    if (cartItem) {
        cartItem.quantity++;
        updateCartCount();
        renderCart();
        saveToLocalStorage();
    }
}

function decreaseQuantity(pizzaId) {
    const cartItem = cart.find(item => item.pizzaId === pizzaId);
    if (cartItem && cartItem.quantity > 1) {
        cartItem.quantity--;
        updateCartCount();
        renderCart();
        saveToLocalStorage();
    }
}

function removeFromCart(pizzaId) {
    cart = cart.filter(item => item.pizzaId !== pizzaId);
    updateCartCount();
    renderCart();
    saveToLocalStorage();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal.classList.contains('show')) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    } else {
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        renderCart();
    }
}

// Carousel Functions
function renderCarousel() {
    const carouselContainer = document.getElementById('carousel-container');
    if (!carouselContainer) return;
    carouselContainer.innerHTML = '';
    carouselImages.forEach(image => {
        const slide = `<img src="${image}" class="carousel-slide" alt="Carrossel">`;
        carouselContainer.innerHTML += slide;
    });
    updateCarousel();
}

function updateCarousel() {
    const carouselContainer = document.getElementById('carousel-container');
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
    const modal = document.getElementById('custom-pizza-modal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);

    flavorCount = parseInt(document.getElementById('flavor-count').value);
    customPizzaSlices = Array(flavorCount === 8 ? 8 : flavorCount).fill(null);

    const flavorSelect = document.getElementById('flavor-count');
    flavorSelect.onchange = (e) => {
        flavorCount = parseInt(e.target.value);
        customPizzaSlices = Array(flavorCount === 8 ? 8 : flavorCount).fill(null);
        renderPizzaSVG();
        document.getElementById('selected-flavor-image').style.display = 'none';
    };

    renderPizzaSVG();
    populateFlavorSelect();
    document.getElementById('selected-flavor-image').style.display = 'none';
}

function closeCustomPizzaModal() {
    const modal = document.getElementById('custom-pizza-modal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

function renderPizzaSVG() {
    const svg = document.getElementById('pizza-svg');
    const size = Math.min(svg.clientWidth, svg.clientHeight);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.innerHTML = `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 10}" fill="none" stroke="#F5F5F5" stroke-width="2"/>`;

    const slices = flavorCount === 8 ? 8 : flavorCount;
    let nextEmptySlice = customPizzaSlices.indexOf(null);

    const sliceColors = [
        '#6B8E23', '#FF6347', '#F5F5F5', '#FFD700', '#8B4513', '#FF4500', '#DAA520', '#CD5C5C'
    ];

    for (let i = 0; i < slices; i++) {
        const angle = ((i * (360 / slices) - 180 / slices) * Math.PI) / 180;
        const nextAngle = (((i + 1) * (360 / slices) - 180 / slices) * Math.PI) / 180;
        const x1 = size / 2 + (size / 2 - 10) * Math.cos(angle);
        const y1 = size / 2 + (size / 2 - 10) * Math.sin(angle);
        const x2 = size / 2 + (size / 2 - 10) * Math.cos(nextAngle);
        const y2 = size / 2 + (size / 2 - 10) * Math.sin(nextAngle);

        let fillColor = customPizzaSlices[i] ? sliceColors[i % sliceColors.length] : '#D2B48C';
        if (selectedSlice === i) fillColor = '#333333';

        const slice = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        slice.setAttribute('d', `M ${size / 2} ${size / 2} L ${x1} ${y1} A ${size / 2 - 10} ${size / 2 - 10} 0 0 1 ${x2} ${y2} Z`);
        slice.setAttribute('fill', fillColor);
        slice.setAttribute('stroke', selectedSlice === i ? '#FFFFFF' : '#F5F5F5');
        slice.setAttribute('stroke-width', selectedSlice === i ? '4' : '2');
        slice.setAttribute('data-slice', i);

        if (i === nextEmptySlice && selectedSlice === null) {
            slice.classList.add('blinking');
        } else {
            slice.classList.remove('blinking');
        }

        slice.addEventListener('click', () => selectSlice(i));
        svg.appendChild(slice);

        if (customPizzaSlices[i]) {
            const textX = size / 2 + (size / 3) * Math.cos(angle + (nextAngle - angle) / 2);
            const textY = size / 2 + (size / 3) * Math.sin(angle + (nextAngle - angle) / 2);
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', textX);
            text.setAttribute('y', textY);
            text.setAttribute('fill', '#FFFFFF');
            text.setAttribute('font-size', '12');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.textContent = customPizzaSlices[i];
            svg.appendChild(text);
        }
    }
}

function populateFlavorSelect() {
    const flavorSelect = document.getElementById('flavor-select');
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
        document.getElementById('flavor-select').focus();
    }
}

function selectFlavor(flavor) {
    if (selectedSlice !== null && selectedSlice < flavorCount && flavor) {
        customPizzaSlices[selectedSlice] = flavor;
        selectedSlice = null;
        renderPizzaSVG();

        const selectedPizza = pizzas.find(p => p.name === flavor);
        const flavorImage = document.getElementById('selected-flavor-image');
        if (selectedPizza && selectedPizza.image) {
            flavorImage.src = selectedPizza.image;
            flavorImage.alt = `Pizza ${flavor}`;
            flavorImage.style.display = 'block';
        } else {
            flavorImage.style.display = 'none';
        }
    }
}

function addCustomPizzaToCart() {
    if (customPizzaSlices.includes(null)) {
        alert('Por favor, preencha todas as fatias com sabores antes de adicionar ao carrinho!');
        return;
    }

    let highestPricePizza = null;
    let highestPrice = 0;
    customPizzaSlices.forEach(slice => {
        const pizza = pizzas.find(p => p.name === slice);
        if (pizza && pizza.price > highestPrice) {
            highestPrice = pizza.price;
            highestPricePizza = pizza;
        }
    });

    const customPizza = {
        pizzaId: `custom${Date.now()}`,
        slices: [...customPizzaSlices],
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
    const pizza = pizzas.find(p => p.id === pizzaId);
    if (pizza) {
        const modal = document.getElementById('description-modal');
        const content = document.getElementById('description-content');

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

        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
    }
}

function closeDescriptionModal() {
    const modal = document.getElementById('description-modal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Checkout Functions
function openCheckoutModal() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    const modal = document.getElementById('checkout-modal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);

    document.getElementById('customer-name').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('customer-address').value = '';
    document.getElementById('payment-method').value = '';

    document.getElementById('checkout-form').onsubmit = function(e) {
        e.preventDefault();
        submitCheckout();
    };
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

function submitCheckout() {
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;
    const paymentMethod = document.getElementById('payment-method').value;

    if (!name || !phone || !address || !paymentMethod) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (!pizzariaConfig.whatsapp) {
        alert('O número do WhatsApp da pizzaria não foi configurado. Por favor, configure-o no painel administrativo.');
        return;
    }

    let message = `Olá, pedido de ${name}:\n`;
    message += `Telefone: ${phone}\n`;
    message += `Endereço: ${address}\n`;
    message += `Forma de Pagamento: ${paymentMethod}\n\n`;
    message += 'Itens do pedido:\n';

    let total = 0;
    cart.forEach(item => {
        if (item.isCustom) {
            const customTotal = item.price * item.quantity;
            total += customTotal;
            let flavorList = `*Pizza Montada* (${item.quantity}x):\n`;
            if (item.slices.length === 8) {
                item.slices.forEach((slice, i) => {
                    flavorList += `Fatia ${i + 1}: ${slice || '(vazia)'}\n`;
                });
            } else {
                item.slices.forEach((slice, i) => {
                    const flavorLabels = ['Primeiro Sabor', 'Segundo Sabor', 'Terceiro Sabor', 'Quarto Sabor'];
                    flavorList += `${flavorLabels[i]}: ${slice || '(vazio)'}\n`;
                });
            }
            flavorList += `- ${formatPrice(customTotal)}`;
            message += `${flavorList}\n`;
        } else {
            const pizza = pizzas.find(p => p.id === item.pizzaId);
            if (pizza) {
                const itemTotal = pizza.price * item.quantity;
                total += itemTotal;
                message += `${pizza.name} (${item.quantity}x) - ${formatPrice(itemTotal)}\n`;
            }
        }
    });

    message += `\nTotal: ${formatPrice(total)}`;

    const whatsappUrl = `https://wa.me/${pizzariaConfig.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    cart = [];
    updateCartCount();
    renderCart();
    closeCheckoutModal();
    toggleCart();
    saveToLocalStorage();
}

// Inicialização
window.onload = function() {
    loadInitialData();
};
