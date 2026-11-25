// MOON — Product Gallery with a Persistent Cart (Vanilla JS)

// 1. Product data: cards are rendered from this array (not hard-coded in HTML).
const products = [
  { id: 1, name: "Bình gốm Nami", price: 289000, category: "Home", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85" },
  { id: 2, name: "Túi canvas Daily", price: 159000, category: "Accessories", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85" },
  { id: 3, name: "Đèn bàn Sora", price: 649000, category: "Home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85" },
  { id: 4, name: "Sổ tay Atelier", price: 99000, category: "Stationery", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=85" },
  { id: 5, name: "Tai nghe Studio", price: 790000, category: "Tech", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85" },
  { id: 6, name: "Ly thủy tinh Mizu", price: 129000, category: "Home", image: "https://images.unsplash.com/photo-1514228742587-6b1558f?auto=format&fit=crop&w=900&q=85" },
  { id: 7, name: "Ví mini Fold", price: 239000, category: "Accessories", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85" },
  { id: 8, name: "Bút máy Mono", price: 319000, category: "Stationery", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85" }
];

const CART_KEY = "moon-shop-cart";
const productGrid = document.querySelector("#product-grid");
const filterContainer = document.querySelector("#category-filters");
const searchInput = document.querySelector("#search-input");
const cartCount = document.querySelector("#cart-count");
const productCount = document.querySelector("#product-count");
const emptyState = document.querySelector("#empty-state");
const cartDrawer = document.querySelector("#cart-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartFooter = document.querySelector("#cart-footer");
const cartTotal = document.querySelector("#cart-total");
const drawerCount = document.querySelector("#drawer-count");

let activeCategory = "All";
let searchTerm = "";
let cart = loadCart();

function formatVND(amount) {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    if (!Array.isArray(saved)) return [];
    // Keep only valid products and positive integer quantities.
    return saved.filter(item =>
      products.some(product => product.id === Number(item.id)) &&
      Number.isInteger(Number(item.quantity)) &&
      Number(item.quantity) > 0
    ).map(item => ({ id: Number(item.id), quantity: Number(item.quantity) }));
  } catch {
    return [];
  }
}

function saveCart() {
  if (cart.length === 0) {
    localStorage.removeItem(CART_KEY);
  } else {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  renderCart();
}

function renderProducts() {
  const visibleProducts = products.filter(product => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name.toLocaleLowerCase("vi").includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = visibleProducts.map(product => `
    <article class="product-card" data-id="${product.id}">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-category">${product.category}</span>
        <button class="add-button" type="button" aria-label="Thêm ${product.name} vào giỏ hàng">+</button>
      </div>
      <div class="product-info">
        <div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-meta">MOON everyday collection</p>
        </div>
        <span class="product-price">${formatVND(product.price)}</span>
      </div>
    </article>
  `).join("");

  productCount.textContent = `${visibleProducts.length} sản phẩm`;
  emptyState.hidden = visibleProducts.length !== 0;
}

function renderFilters() {
  const categories = ["All", ...new Set(products.map(product => product.category))];
  filterContainer.innerHTML = categories.map(category => `
    <button class="filter-button ${category === activeCategory ? "active" : ""}"
      type="button" data-category="${category}">
      ${category === "All" ? "Tất cả" : category}
    </button>
  `).join("");
}

function addToCart(productId) {
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart();
}

function changeQuantity(productId, change) {
  const item = cart.find(cartItem => cartItem.id === productId);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter(cartItem => cartItem.id !== productId);
  }
  saveCart();
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const product = products.find(productItem => productItem.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  cartCount.textContent = totalItems;
  drawerCount.textContent = `(${totalItems})`;
  cartTotal.textContent = formatVND(totalPrice);
  cartEmpty.classList.toggle("visible", cart.length === 0);
  cartFooter.classList.toggle("hidden", cart.length === 0);
  cartItems.innerHTML = cart.map(item => {
    const product = products.find(productItem => productItem.id === item.id);
    if (!product) return "";
    return `
      <div class="cart-line" data-id="${product.id}">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <span class="line-price">${formatVND(product.price)}</span>
          <div class="quantity-control" aria-label="Số lượng">
            <button type="button" data-action="decrease" aria-label="Giảm số lượng">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-action="increase" aria-label="Tăng số lượng">+</button>
          </div>
        </div>
        <button class="remove-item" type="button" data-action="remove" aria-label="Xóa ${product.name}">×</button>
      </div>
    `;
  }).join("");
}

function openCart() {
  cartDrawer.classList.add("open");
  drawerBackdrop.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartDrawer.classList.remove("open");
  drawerBackdrop.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// 2. One delegated click listener for all product cards.
productGrid.addEventListener("click", event => {
  const card = event.target.closest(".product-card");
  if (!card) return;
  const productId = Number(card.dataset.id);
  if (!Number.isInteger(productId)) return;
  addToCart(productId);
});

// 3. Category filter: one listener on the filter container.
filterContainer.addEventListener("click", event => {
  const button = event.target.closest(".filter-button");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderProducts();
});

// 4. Search updates on every keystroke and combines with category filter.
searchInput.addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLocaleLowerCase("vi");
  renderProducts();
});

// Cart controls use event delegation too.
cartItems.addEventListener("click", event => {
  const actionButton = event.target.closest("[data-action]");
  const line = event.target.closest(".cart-line");
  if (!actionButton || !line) return;
  const productId = Number(line.dataset.id);
  const action = actionButton.dataset.action;
  if (action === "increase") changeQuantity(productId, 1);
  if (action === "decrease") changeQuantity(productId, -1);
  if (action === "remove") {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
  }
});

document.querySelector("#cart-toggle").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
drawerBackdrop.addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);
document.querySelector("#clear-cart").addEventListener("click", () => {
  cart = [];
  localStorage.removeItem(CART_KEY);
  renderCart();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

// Initial render: restore saved cart before showing the badge.
renderFilters();
renderProducts();
renderCart();
