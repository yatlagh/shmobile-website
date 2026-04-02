// ===== DATA =====
const products = [
  {
    id: 1, name: 'SHMO ICON',
    tagline: 'The one that started it all. Literally iconic.',
    price: 0.00, image: 'images/mobile1.png', rating: 5, featured: true, freeTag: true
  },
  {
    id: 2, name: 'SHMO FLIP',
    tagline: "Camera so good, it'll make your flip phone jealous.",
    price: 49.99, image: 'images/mobile2.png', rating: 4, featured: true
  },
  {
    id: 3, name: 'SHMO ULTRA',
    tagline: 'For the overachiever who still uses T9.',
    price: 99.99, image: 'images/mobile3.png', rating: 5, featured: true
  },
  {
    id: 4, name: 'SHMO BRICK',
    tagline: 'Doubles as a doorstop. Literally unbreakable.',
    price: 19.99, image: 'images/mobile4.png', rating: 4, featured: true
  },
  {
    id: 5, name: 'SHMO SLIM',
    tagline: 'Thin enough to slide under a door.',
    price: 79.99, image: null, rating: 3
  },
  {
    id: 6, name: 'SHMO GOLD',
    tagline: 'For ballers on a budget.',
    price: 199.99, image: null, rating: 5
  },
  {
    id: 7, name: 'SHMO MINI',
    tagline: "So small you'll lose it. We guarantee it.",
    price: 29.99, image: null, rating: 2
  },
  {
    id: 8, name: 'SHMO MAX',
    tagline: 'Screen so big it counts as a tablet. And a shield.',
    price: 149.99, image: null, rating: 4
  }
];

const plans = [
  {
    id: 'basic', name: 'SHMO Basic', price: 29.99,
    tagline: 'Who needs internet anyway?',
    details: '500 min, 200 texts, 0 data',
    features: [
      '500 minutes of talk time', '200 text messages', '0 MB of data',
      "Voicemail (we'll check it for you, eventually)", 'Free Snake game (basic edition)'
    ]
  },
  {
    id: 'unlimited', name: 'SHMO Unlimited', price: 49.99,
    tagline: 'Enough to load one webpage per day.',
    featured: true, badge: 'Most Popular',
    details: 'Unlimited talk & text, 2GB data',
    features: [
      'Unlimited talk & text', '2 GB of blazing 3G data', 'Hotspot (for ants)',
      'Snake game with 3 extra levels', 'Priority call to Gary (support)'
    ]
  },
  {
    id: 'godmode', name: 'SHMO GOD MODE', price: 99.99,
    tagline: 'You basically own the company now.',
    badge: 'Ultimate',
    details: 'Unlimited everything, priority support',
    features: [
      'Unlimited everything', '∞ GB data (theoretically)',
      'Priority support (Gary picks up on the first ring)', 'Snake game leaderboard access',
      'Free SHMO sticker (while supplies last)', 'A personal "thank you" voicemail from our CEO'
    ]
  }
];

// ===== STATE =====
let cart = [];
let visitorCount = 1254382;

// ===== DOM HELPERS =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderFeatured();
  renderShop();
  renderPlans();
  initNavigation();
  initVisitorCounter();
  initChat();
  initRadio();
  updateCartBadge();
});

// ===== VISITOR COUNTER =====
function initVisitorCounter() {
  setInterval(() => {
    visitorCount++;
    const el = $('#visitorCount');
    if (el) el.textContent = visitorCount.toLocaleString();
  }, 5000);
}

// ===== NAVIGATION =====
function initNavigation() {
  document.addEventListener('click', (e) => {
    // Page navigation
    const link = e.target.closest('[data-page]');
    if (link) {
      e.preventDefault();
      navigateTo(link.dataset.page);
    }

    // Add product to cart
    const addBtn = e.target.closest('[data-add-product]');
    if (addBtn) {
      e.preventDefault();
      addToCart('product', parseInt(addBtn.dataset.addProduct));
    }

    // Add plan to cart
    const addPlanBtn = e.target.closest('[data-add-plan]');
    if (addPlanBtn) {
      e.preventDefault();
      addToCart('plan', addPlanBtn.dataset.addPlan);
    }

    // Cart qty
    const qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) {
      e.preventDefault();
      const idx = parseInt(qtyBtn.dataset.idx);
      const action = qtyBtn.dataset.qty;
      if (action === 'inc') cart[idx].qty++;
      else if (action === 'dec') {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      }
      renderCart();
      updateCartBadge();
    }

    // Cart remove
    const removeBtn = e.target.closest('[data-remove]');
    if (removeBtn) {
      e.preventDefault();
      cart.splice(parseInt(removeBtn.dataset.remove), 1);
      renderCart();
      updateCartBadge();
    }
  });

  // Checkout form
  $('#checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    processCheckout();
  });
}

function navigateTo(page) {
  $$('.page').forEach(p => p.classList.remove('active'));
  const target = $(`#page-${page}`);
  if (target) target.classList.add('active');

  // Update nav
  $$('.nav-item').forEach(a => a.classList.remove('active'));
  const navLink = $(`.nav-item[data-page="${page}"]`);
  if (navLink) navLink.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'auto' });

  if (page === 'cart') renderCart();
  if (page === 'checkout') renderCheckoutSummary();
}

// ===== RENDERING =====
function createProductCard(product) {
  const stars = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
  const imageHTML = product.image
    ? `<img src="${product.image}" alt="${product.name}">`
    : `<div class="placeholder">${product.name}</div>`;
  const priceDisplay = product.price === 0
    ? `$0.00 <span class="free-tag">FREE</span>`
    : `$${product.price.toFixed(2)}`;

  return `
    <div class="product-card-retro">
      <div class="product-card-img">${imageHTML}</div>
      <div class="product-card-name">${product.name}</div>
      <div class="product-card-tagline">${product.tagline}</div>
      <div class="product-card-rating">${stars}</div>
      <div class="product-card-price">${priceDisplay}</div>
      <button class="btn-retro btn-red-3d btn-sm" data-add-product="${product.id}">ADD TO CART</button>
    </div>
  `;
}

function renderFeatured() {
  $('#featuredGrid').innerHTML = products.filter(p => p.featured).map(createProductCard).join('');
}

function renderShop() {
  $('#shopGrid').innerHTML = products.map(createProductCard).join('');
}

function renderPlans() {
  // Table
  $('#plansBody').innerHTML = plans.map(plan => `
    <tr${plan.featured ? ' style="background:#FFFDE6; font-weight:bold;"' : ''}>
      <td class="feature-name">${plan.name}${plan.badge ? ` <span style="color:#CC0000; font-size:9px;">[${plan.badge}]</span>` : ''}</td>
      <td>${plan.details}</td>
      <td class="plan-price-cell">$${plan.price.toFixed(2)}/mo</td>
      <td><button class="btn-retro btn-red-3d btn-sm" data-add-plan="${plan.id}">SIGN UP</button></td>
    </tr>
  `).join('');

  // Detail cards
  $('#plansGrid').innerHTML = plans.map(plan => `
    <div class="plan-card-retro${plan.featured ? ' featured' : ''}">
      <div class="plan-card-header">
        ${plan.badge ? `<div class="plan-badge-retro">${plan.badge}</div>` : ''}
        <div class="plan-card-name">${plan.name}</div>
        <div class="plan-card-price">$${plan.price.toFixed(2)}<span>/mo</span></div>
      </div>
      <div class="plan-card-body">
        <div class="plan-card-tagline">"${plan.tagline}"</div>
        <ul class="plan-card-features">
          ${plan.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
        <button class="btn-retro btn-red-3d" data-add-plan="${plan.id}">SIGN UP</button>
      </div>
    </div>
  `).join('');
}

function renderCart() {
  const container = $('#cartContent');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-retro">
        <h3>Your Cart is Empty</h3>
        <p>Looks like you haven't SHMO'd anything yet. Let's fix that.</p>
        <button class="btn-retro btn-red-3d" data-page="shop">START SHOPPING</button>
      </div>
    `;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.0869;
  const total = subtotal + tax;

  container.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th style="width:60px">Item</th>
          <th>Name</th>
          <th>Type</th>
          <th style="width:100px">Qty</th>
          <th style="width:80px">Price</th>
          <th style="width:50px"></th>
        </tr>
      </thead>
      <tbody>
        ${cart.map((item, i) => `
          <tr>
            <td>
              <div class="cart-item-img-sm">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : `<div style="font-size:8px;color:#CC0000;font-weight:bold;text-align:center;">${item.name}</div>`}
              </div>
            </td>
            <td class="feature-name">${item.name}</td>
            <td>${item.type === 'plan' ? 'Monthly Plan' : 'Phone'}</td>
            <td>
              <div class="qty-controls">
                <button class="qty-btn-retro" data-qty="dec" data-idx="${i}">-</button>
                <span style="min-width:20px;text-align:center;font-weight:bold;">${item.qty}</span>
                <button class="qty-btn-retro" data-qty="inc" data-idx="${i}">+</button>
              </div>
            </td>
            <td style="font-weight:bold;color:#CC0000;">$${(item.price * item.qty).toFixed(2)}</td>
            <td><a class="remove-link" data-remove="${i}">[Remove]</a></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="cart-summary-retro">
      <div class="cart-summary-row">
        <span>Subtotal:</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="cart-summary-row">
        <span>Shmoville Tax (8.69%):</span>
        <span>$${tax.toFixed(2)}</span>
      </div>
      <div class="cart-summary-row">
        <span>Shipping:</span>
        <span>FREE (via pigeon)</span>
      </div>
      <div class="cart-summary-row total-row">
        <span>Total:</span>
        <span style="color:#CC0000;">$${total.toFixed(2)}</span>
      </div>
    </div>
    <div class="cart-actions-retro">
      <button class="btn-retro btn-grey-3d" data-page="shop">CONTINUE SHOPPING</button>
      <button class="btn-retro btn-red-3d" data-page="checkout">PROCEED TO CHECKOUT</button>
    </div>
  `;
}

function renderCheckoutSummary() {
  const container = $('#checkoutSummary');
  if (cart.length === 0) {
    navigateTo('cart');
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.0869;
  const total = subtotal + tax;

  container.innerHTML = `
    <div class="checkout-summary-inner">
      ${cart.map(item => `
        <div class="checkout-row">
          <span>${item.name} x${item.qty}</span>
          <span>$${(item.price * item.qty).toFixed(2)}</span>
        </div>
      `).join('')}
      <div class="checkout-row">
        <span>Tax:</span>
        <span>$${tax.toFixed(2)}</span>
      </div>
      <div class="checkout-row">
        <span>Shipping:</span>
        <span>FREE</span>
      </div>
      <div class="checkout-row total-row">
        <span>Total:</span>
        <span style="color:#CC0000;">$${total.toFixed(2)}</span>
      </div>
    </div>
  `;
}

// ===== CART LOGIC =====
function addToCart(type, id) {
  let item;

  if (type === 'product') {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(c => c.type === 'product' && c.productId === id);
    if (existing) { existing.qty++; }
    else { cart.push({ type: 'product', productId: id, name: product.name, price: product.price, image: product.image, qty: 1 }); }
    item = product;
  } else if (type === 'plan') {
    const plan = plans.find(p => p.id === id);
    if (!plan) return;
    const existing = cart.find(c => c.type === 'plan' && c.planId === id);
    if (existing) { existing.qty++; }
    else { cart.push({ type: 'plan', planId: id, name: plan.name, price: plan.price, image: null, qty: 1 }); }
    item = plan;
  }

  updateCartBadge();
  showToast(`${item.name} added to cart!`);
}

function updateCartBadge() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  $('#cartBadge').textContent = total;
}

// ===== CHECKOUT =====
function processCheckout() {
  const orderNum = 'SHMO-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.floor(Math.random() * 9000 + 1000);
  $('#orderNumber').textContent = 'Order #' + orderNum;
  cart = [];
  updateCartBadge();
  $('#checkoutForm').reset();
  navigateTo('confirmation');
}

// ===== LIVE CHAT =====
const chatResponses = [
  "lol idk tbh 😂 try turning it off and on again??",
  "omg ur so funny 🤣🤣 but srsly the SHMO BRICK is AMAZING",
  "brb gary is microwaving fish in the break room again 🐟",
  "haha nice!! u should totally get the SHMO GOLD its like sooo worth it",
  "wait hold on... *checks notes*... yeah i have no idea lol 😅",
  "thats what SHE said 😏 jk jk but fr tho check out our plans page",
  "omgggg i literally just spilled mountain dew on my keyboard brb",
  "r u still there?? anyway the SHMO ULTRA has T9 AND a flashlight 🔦",
  "lolol sorry i was playing snake... new high score tho!! 🐍🏆",
  "uhhh have u tried the SHMO FLIP?? its got a camera AND everything",
  "rofl 😂😂 ok ok but srsly our plans start at like $29.99/mo thats like nothing",
  "g2g my mom needs the phone line 📞 jk we have unlimited lmaooo",
  "duuude the SHMO BRICK survived being thrown off a building. a BUILDING.",
  "aww thx 4 chatting w me!! nobody ever chats w me 😢 lol jk... unless? 👀",
  "ooh great question!! lemme ask gary... UPDATE: gary is asleep 😴",
  "haha ya i feel that. anyway wanna hear about our GOD MODE plan?? its epic",
  "*~*~* did u know SHMOBILE was founded in a garage?? how cool is that *~*~*",
  "sry lag... this computer runs on windows ME 💀 anyway whats ur question again",
  "OMG YESSS!! add everything 2 ur cart rn!! do it do it do it 🛒",
  "fun fact: the SHMO ICON is FREE. like actually $0. im not even lying this time"
];

function initChat() {
  const toggle = $('#chatToggle');
  const win = $('#chatWindow');
  const close = $('#chatClose');
  const input = $('#chatInput');
  const send = $('#chatSend');

  toggle.addEventListener('click', () => {
    win.classList.toggle('open');
    if (win.classList.contains('open')) toggle.style.display = 'none';
  });

  close.addEventListener('click', () => {
    win.classList.remove('open');
    toggle.style.display = 'flex';
  });

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    const messages = $('#chatMessages');

    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg me';
    userMsg.innerHTML = `<span class="chat-name">You:</span> ${text}`;
    messages.appendChild(userMsg);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Bot reply after delay
    setTimeout(() => {
      const reply = chatResponses[Math.floor(Math.random() * chatResponses.length)];
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-msg buddy';
      botMsg.innerHTML = `<span class="chat-name">SHMObot_Gary42:</span> ${reply}`;
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;
    }, 800 + Math.random() * 1500);
  }

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

// ===== RADIO =====
function initRadio() {
  const btn = $('#radioBtn');
  const player = $('#radioPlayer');
  const audio = $('#radioAudio');

  btn.addEventListener('click', () => {
    player.classList.toggle('open');
    if (player.classList.contains('open')) {
      audio.play();
    } else {
      audio.pause();
    }
  });
}

// ===== TOAST =====
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = '★ ' + message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
