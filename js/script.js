/* Simple cart with localStorage persistence */
/* Data model: cart = { productId: { id, name, price, qty, img } } */

const STORAGE_KEY = 'bml_cart_v1';

function formatUGX(n){
  return 'UGX ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function loadCart(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch(e){
    console.error('Failed to parse cart from storage', e);
    return {};
  }
}

function saveCart(cart){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  updateCartCount(cart);
}

function updateCartCount(cart){
  const totalCount = Object.values(cart).reduce((s,i)=>s + (i.qty||0), 0);
  const els = [document.getElementById('cart-count'), document.getElementById('cart-count-2')];
  els.forEach(el => { if(el) el.textContent = totalCount; });
}

/* Add product to cart */
function addToCart(product){
  const cart = loadCart();
  const existing = cart[product.id];
  if(existing){
    existing.qty += 1;
  } else {
    cart[product.id] = {...product, qty:1};
  }
  saveCart(cart);
  renderCartItems();
}

/* Remove product from cart */
function removeFromCart(id){
  const cart = loadCart();
  if(cart[id]){
    delete cart[id];
    saveCart(cart);
    renderCartItems();
  }
}

/* Change qty */
function changeQty(id, delta){
  const cart = loadCart();
  if(!cart[id]) return;
  cart[id].qty += delta;
  if(cart[id].qty <= 0) delete cart[id];
  saveCart(cart);
  renderCartItems();
}

/* Render cart UI */
function renderCartItems(){
  const cart = loadCart();
  const container = document.querySelectorAll('#cart-items');
  container.forEach(el => {
    el.innerHTML = '';
    const entries = Object.values(cart);
    if(entries.length === 0){
      el.innerHTML = '<p class="muted">Your cart is empty.</p>';
    } else {
      entries.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
          <img src="${item.img || 'images/product1.jpg'}" alt="${item.name}">
          <div class="meta">
            <div><strong>${item.name}</strong></div>
            <div class="muted">${formatUGX(item.price)}</div>
            <div class="qty-controls">
              <button onclick="changeQty('${item.id}', -1)">-</button>
              <div style="min-width:28px;text-align:center">${item.qty}</div>
              <button onclick="changeQty('${item.id}', 1)">+</button>
              <button style="margin-left:8px;" onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
          </div>
        `;
        el.appendChild(div);
      });
    }
  });

  // update total
  const total = Object.values(cart).reduce((s,i) => s + (i.price * i.qty), 0);
  const totalEl = document.querySelectorAll('#cart-total');
  totalEl.forEach(t => { if(t) t.textContent = formatUGX(total); });
}

/* Wire up add-to-cart buttons on shop page */
function wireShopButtons(){
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price,10);
      const img = card.querySelector('img') ? card.querySelector('img').src : 'images/product1.jpg';
      addToCart({id,name,price,img});
    });
  });
}

/* Cart panel open/close */
function openCart(){
  document.getElementById('cart-panel').classList.add('open');
  document.getElementById('cart-panel').setAttribute('aria-hidden','false');
}
function closeCart(){
  document.getElementById('cart-panel').classList.remove('open');
  document.getElementById('cart-panel').setAttribute('aria-hidden','true');
}

/* Checkout (mock) */
function checkout(){
  const cart = loadCart();
  if(Object.keys(cart).length === 0){ alert('Cart is empty'); return; }
  alert('Checkout demo: cart total ' + document.getElementById('cart-total').textContent + '\n\nThis is a demo. Implement payment backend to process real orders.');
  // clear cart after checkout demo
  localStorage.removeItem(STORAGE_KEY);
  renderCartItems();
  updateCartCount({});
  closeCart();
}

/* Clear cart */
function clearCart(){
  if(confirm('Clear the cart?')){
    localStorage.removeItem(STORAGE_KEY);
    renderCartItems();
    updateCartCount({});
  }
}

/* Init */
document.addEventListener('DOMContentLoaded', () => {
  // wire buttons present on pages
  wireShopButtons();

  // attach cart buttons
  const cartBtn = document.getElementById('cart-btn');
  const cartBtn2 = document.getElementById('cart-btn-2');
  [cartBtn, cartBtn2].forEach(b => { if(b) b.addEventListener('click', ()=>{ openCart(); }); });

  const closeBtn = document.querySelectorAll('#close-cart');
  closeBtn.forEach(b => b.addEventListener('click', closeCart));

  document.getElementById('checkout-btn')?.addEventListener('click', checkout);
  document.getElementById('clear-cart')?.addEventListener('click', clearCart);

  // ensure cart panel node for pages that included it
  renderCartItems();
  updateCartCount(loadCart());
});

// Hamburger menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.hamburger');
  const nav = document.querySelector('.main-nav');
  if(burger && nav){
    burger.addEventListener('click', ()=>{
      nav.classList.toggle('open');
      burger.classList.toggle('active');
    });
  }
});
