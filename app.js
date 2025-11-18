
const products = [
  { id: 'p1', name: 'Parfum 1', price: 79, image: 'images/parfum1.svg', desc: 'Agrumes, Lavande, Bois de santal' },
  { id: 'p2', name: 'Parfum 2', price: 89, image: 'images/parfum2.svg', desc: 'Menthe, Jasmin, Musc' },
  { id: 'p3', name: 'Parfum 3', price: 99, image: 'images/parfum3.svg', desc: 'Bergamote, Rose, Patchouli' }
];

const CART_KEY = 'layeressence_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, qty });
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  renderCartPage();
}

function updateQty(productId, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart(cart);
  renderCartPage();
}

function clearCart() {
  saveCart([]);
  renderCartPage();
}

function formatPrice(value) {
  return `${value.toFixed(2)}€`;
}

function updateCartCount() {
  const countEl = document.querySelector('.cart-count');
  if (!countEl) return;
  const totalQty = getCart().reduce((sum, i) => sum + i.qty, 0);
  countEl.textContent = totalQty;
}


function renderCatalog() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  const html = products.map(p => `
    <article class="parfum">
      <img class="perfume-image" src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <p><strong>${formatPrice(p.price)}</strong></p>
      <button class="btn btn-primary" data-add="${p.id}">Ajouter au panier</button>
    </article>
  `).join('');
  grid.innerHTML = html;


  grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-add');
      addToCart(id, 1);
    });
  });
}


function renderCartPage() {
  const container = document.getElementById('cart-items');
  if (!container) return;
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `<p>Votre panier est vide.</p>`;
  } else {
    const rows = cart.map(item => {
      const product = products.find(p => p.id === item.id);
      const lineTotal = product.price * item.qty;
      return `
        <div class="parfum" data-id="${item.id}">
          <img class="perfume-image" src="${product.image}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p><strong>${formatPrice(product.price)}</strong> / unité</p>
          <div style="margin: 8px 0;">
            <label for="qty-${item.id}">Quantité</label>
            <input type="number" id="qty-${item.id}" min="1" value="${item.qty}" style="width:80px;margin-left:8px;">
          </div>
          <p>Sous-total: <strong>${formatPrice(lineTotal)}</strong></p>
          <button class="btn btn-danger" data-remove="${item.id}">Retirer</button>
        </div>
      `;
    }).join('');
    container.innerHTML = rows;
  }

  const total = cart.reduce((sum, i) => {
    const p = products.find(pr => pr.id === i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = formatPrice(total);

  container.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const parent = e.target.closest('.parfum');
      const id = parent.getAttribute('data-id');
      updateQty(id, parseInt(e.target.value, 10) || 1);
    });
  });


  container.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-remove');
      removeFromCart(id);
    });
  });
}
