(() => {
  // Elementos
  const addButtons = document.querySelectorAll('.add-btn');
  const cartToggle = document.getElementById('cart-toggle');
  const cartEl = document.getElementById('cart');
  const cartItemsEl = document.getElementById('cart-items');
  const cartCountEl = document.getElementById('cart-count');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkout');
  const yearEl = document.getElementById('year');
  const searchInput = document.getElementById('search');

  const categoryButtons = document.querySelectorAll('.cat-btn');
  const products = document.querySelectorAll('.product');

  let cart = {};

  yearEl.textContent = new Date().getFullYear();

  const money = n => '$' + Number(n).toFixed(2);

  function saveCart() {
    try { localStorage.setItem('demoCart', JSON.stringify(cart)); } catch (e) { /* ignore */ }
  }
  function loadCart(){
    try {
      const s = localStorage.getItem('demoCart');
      if (s) cart = JSON.parse(s);
    } catch(e){}
  }

  function updateCartCount() {
    const count = Object.values(cart).reduce((s,i) => s + i.qty, 0);
    cartCountEl.textContent = count;
  }

  function renderCart(){
    cartItemsEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    let subtotal = 0;

    Object.values(cart).forEach(item => {
      subtotal += item.price * item.qty;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="meta">
          <b>${escapeHtml(item.name)}</b>
          <small>${money(item.price)} × ${item.qty} = ${money(item.price * item.qty)}</small>
        </div>
        <div class="qty-control" data-id="${item.id}">
          <button class="dec">−</button>
          <div>${item.qty}</div>
          <button class="inc">+</button>
          <button class="remove" title="Quitar">✕</button>
        </div>
      `;

      fragment.appendChild(itemEl);
    });

    if (Object.keys(cart).length === 0) {
      cartItemsEl.innerHTML = `<p style="color:var(--muted);">Tu carrito está vacío.</p>`;
    } else {
      cartItemsEl.appendChild(fragment);
    }

    subtotalEl.textContent = money(subtotal);
    totalEl.textContent = money(subtotal); // envío gratis
    updateCartCount();
    saveCart();
  }

  function addProductFromElement(productEl, qty = 1){
    const id = productEl.dataset.id;
    const name = productEl.dataset.name;
    const price = Number(productEl.dataset.price);

    if (!id || !name || !price) return;
    if (!cart[id]) {
      cart[id] = { id, name, price, qty: 0 };
    }
    cart[id].qty += qty;
    renderCart();

    const btn = productEl.querySelector('.add-btn');
    if (btn) {
      const old = btn.textContent;
      btn.textContent = 'Añadido ✓';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 900);
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"'`=\/]/g, function(s) {
      return ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
      })[s];
    });
  }

  // Eventos delegados para botones dentro del carrito
  cartItemsEl.addEventListener('click', (e) => {
    const btn = e.target;
    const parent = btn.closest('.qty-control');
    if (!parent) return;
    const id = parent.dataset.id;
    if (!id || !cart[id]) return;

    if (btn.classList.contains('inc')) {
      cart[id].qty += 1;
    } else if (btn.classList.contains('dec')) {
      cart[id].qty = Math.max(1, cart[id].qty - 1);
    } else if (btn.classList.contains('remove')) {
      delete cart[id];
    }
    renderCart();
  });

  cartToggle.addEventListener('click', () => {
    const expanded = cartToggle.getAttribute('aria-expanded') === 'true';
    cartToggle.setAttribute('aria-expanded', String(!expanded));
    const hidden = cartEl.getAttribute('aria-hidden') === 'true' || cartEl.getAttribute('aria-hidden') === null;
    cartEl.setAttribute('aria-hidden', String(!hidden));
    if (!hidden) {
      cartEl.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });

  checkoutBtn.addEventListener('click', () => {
    if (Object.keys(cart).length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }
    const total = Object.values(cart).reduce((s,i)=> s + i.price * i.qty, 0);
    alert(`Gracias por tu compra!\nTotal: ${money(total)}\n(Esto es una demo — no se procesó ningún pago.)`);
    cart = {};
    renderCart();
  });

  // Botón "Agregar"
  addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const product = btn.closest('.product');
      addProductFromElement(product, 1);
    });
  });

  // Buscador
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.product').forEach(p => {
      const name = p.dataset.name.toLowerCase();
      const desc = (p.dataset.desc || p.querySelector('.product-desc')?.textContent || '').toLowerCase();
      p.style.display = (name.includes(q) || desc.includes(q)) ? '' : 'none';
    });
  });

  // NUEVO FILTRO POR CATEGORÍAS
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;

      // Activar botón seleccionado
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Mostrar / ocultar productos
      products.forEach(prod => {
        if (category === "all" || prod.dataset.category === category) {
          prod.style.display = "block";
        } else {
          prod.style.display = "none";
        }
      });
    });
  });

  // Inicialización
  loadCart();
  renderCart();
})();
