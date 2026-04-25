/* ============================================================
   Local Market Online Store — app.js
   Single-page application logic (Vanilla JS)
   ============================================================ */

/* ─── Utility ─── */
const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
const catIcon = c => ({grocery:'🥬',electronics:'💻',handicrafts:'🎨',clothing:'👗',food:'🍕',books:'📚',health:'💊',other:'📦'}[c]||'📦');
const statusBadge = s => `<span class="badge badge-${s}">${s}</span>`;
const fallbackImg = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400';

const API = 'http://localhost:3000/api';

/* ─── API Helper ─── */
const Http = {
  headers() {
    const h = { 'Content-Type': 'application/json' };
    const t = localStorage.getItem('lm_token');
    if (t) h['Authorization'] = `Bearer ${t}`;
    return h;
  },
  async get(url) {
    const r = await fetch(API + url, { headers: this.headers() });
    return r.json();
  },
  async post(url, body) {
    const r = await fetch(API + url, { method: 'POST', headers: this.headers(), body: JSON.stringify(body) });
    return r.json();
  },
  async put(url, body) {
    const r = await fetch(API + url, { method: 'PUT', headers: this.headers(), body: JSON.stringify(body) });
    return r.json();
  },
  async del(url) {
    const r = await fetch(API + url, { method: 'DELETE', headers: this.headers() });
    return r.json();
  }
};

/* ─── Toast Notifications ─── */
const Toast = {
  show(msg, type = 'info') {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    t.innerHTML = `${icons[type] || 'ℹ️'} ${msg}`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  },
  success(m) { this.show(m, 'success'); },
  error(m) { this.show(m, 'error'); },
  info(m) { this.show(m, 'info'); }
};

/* ─── Auth Module ─── */
const Auth = {
  user: null,

  init() {
    const u = localStorage.getItem('lm_user');
    const t = localStorage.getItem('lm_token');
    if (u && t) {
      this.user = JSON.parse(u);
      this.updateNav();
    }
  },

  async login(e) {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    btn.disabled = true; btn.textContent = 'Signing in…';
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
      const res = await Http.post('/auth/login', { email, password });
      if (!res.success) { Toast.error(res.message); return; }
      this._setSession(res.data);
      Toast.success('Welcome back, ' + res.data.user.name + '!');
      App.navigate(res.data.user.role === 'vendor' ? 'dashboard' : 'home');
    } catch { Toast.error('Connection error. Is the server running?'); }
    finally { btn.disabled = false; btn.textContent = 'Sign In'; }
  },

  async signup(e) {
    e.preventDefault();
    const btn = document.getElementById('signupBtn');
    btn.disabled = true; btn.textContent = 'Creating account…';
    const body = {
      name: document.getElementById('signupName').value,
      email: document.getElementById('signupEmail').value,
      password: document.getElementById('signupPassword').value,
      role: document.getElementById('signupRole').value,
      phone: document.getElementById('signupPhone').value,
      address: document.getElementById('signupAddress').value
    };
    try {
      const res = await Http.post('/auth/signup', body);
      if (!res.success) { Toast.error(res.message); return; }
      this._setSession(res.data);
      Toast.success('Account created! Welcome, ' + res.data.user.name + '!');
      App.navigate(res.data.user.role === 'vendor' ? 'dashboard' : 'home');
    } catch { Toast.error('Connection error. Is the server running?'); }
    finally { btn.disabled = false; btn.textContent = 'Create Account'; }
  },

  async updateProfile(e) {
    e.preventDefault();
    const body = {
      name: document.getElementById('profileName').value,
      phone: document.getElementById('profilePhone').value,
      address: document.getElementById('profileAddress').value
    };
    try {
      const res = await Http.put('/auth/profile', body);
      if (!res.success) { Toast.error(res.message); return; }
      this.user = { ...this.user, ...res.data };
      localStorage.setItem('lm_user', JSON.stringify(this.user));
      this.updateNav();
      Toast.success('Profile updated!');
    } catch { Toast.error('Failed to update profile'); }
  },

  logout() {
    localStorage.removeItem('lm_token');
    localStorage.removeItem('lm_user');
    this.user = null;
    Cart.clear();
    this.updateNav();
    App.navigate('login');
    Toast.info('Signed out successfully');
  },

  _setSession(data) {
    localStorage.setItem('lm_token', data.token);
    localStorage.setItem('lm_user', JSON.stringify(data.user));
    this.user = data.user;
    this.updateNav();
  },

  updateNav() {
    const loggedIn = !!this.user;
    document.getElementById('authButtons').style.display = loggedIn ? 'none' : 'block';
    document.getElementById('userMenu').style.display = loggedIn ? 'block' : 'none';
    document.getElementById('cartToggleBtn').style.display = loggedIn ? 'flex' : 'none';
    
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
      navLinks.style.display = loggedIn ? 'flex' : 'none';
    }

    if (loggedIn) {
      document.getElementById('userName').textContent = this.user.name.split(' ')[0];
      const isDashboard = this.user.role === 'vendor';
      document.getElementById('navDashboard').style.display = isDashboard ? 'flex' : 'none';
      document.getElementById('navOrders').style.display = !isDashboard ? 'flex' : 'none';
    }
  },

  loadProfile() {
    if (!this.user) { App.navigate('login'); return; }
    document.getElementById('profileName').value = this.user.name || '';
    document.getElementById('profileEmail').value = this.user.email || '';
    document.getElementById('profilePhone').value = this.user.phone || '';
    document.getElementById('profileAddress').value = this.user.address || '';
    document.getElementById('profileRole').textContent =
      this.user.role === 'vendor' ? '🏪 Vendor Account' : '👤 Customer Account';
  },

  isLoggedIn() { return !!this.user; },
  isVendor() { return this.user && this.user.role === 'vendor'; }
};

/* ─── App Navigation ─── */
const App = {
  currentPage: 'home',

  navigate(page, data = null) {
    // Force login check
    if (!Auth.isLoggedIn() && page !== 'login' && page !== 'signup') {
      page = 'login';
    }

    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('page-' + page);
    if (!el) return;
    el.classList.add('active');
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.page === page);
    });

    // Close dropdown
    this.closeUserMenu();

    // Page-specific loaders
    const loaders = {
      home: () => { Products.loadFeatured(); Shops.loadFeatured(); },
      products: () => Products.loadAll(),
      shops: () => Shops.loadAll(),
      profile: () => Auth.loadProfile(),
      orders: () => Orders.loadMyOrders(),
      dashboard: () => {
        if (!Auth.isVendor()) { App.navigate('home'); Toast.error('Vendors only'); return; }
        Dashboard.load();
      },
      'product-detail': () => data && Products.loadDetail(data),
      'shop-detail': () => data && Shops.loadDetail(data),
      checkout: () => Cart.renderCheckout(),
      login: () => {},
      signup: () => {}
    };
    if (loaders[page]) loaders[page]();
  },

  toggleUserMenu() {
    document.getElementById('userDropdown').classList.toggle('show');
  },
  closeUserMenu() {
    document.getElementById('userDropdown').classList.remove('show');
  }
};

/* ─── Cart Module ─── */
const Cart = {
  items: [],

  init() {
    const saved = localStorage.getItem('lm_cart');
    if (saved) this.items = JSON.parse(saved);
    this.updateBadge();
  },

  add(product, qty = 1) {
    if (!Auth.isLoggedIn()) { Toast.info('Please sign in to add items to cart'); App.navigate('login'); return; }
    const existing = this.items.find(i => i._id === product._id);
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({ ...product, qty });
    }
    this.save();
    Toast.success(`${product.name} added to cart!`);
  },

  remove(id) {
    this.items = this.items.filter(i => i._id !== id);
    this.save();
    this.renderSidebar();
  },

  updateQty(id, delta) {
    const item = this.items.find(i => i._id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) this.remove(id);
    else { this.save(); this.renderSidebar(); }
  },

  total() {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  },

  save() {
    localStorage.setItem('lm_cart', JSON.stringify(this.items));
    this.updateBadge();
    this.renderSidebar();
  },

  clear() {
    this.items = [];
    localStorage.removeItem('lm_cart');
    this.updateBadge();
  },

  updateBadge() {
    const count = this.items.reduce((s, i) => s + i.qty, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = count;
  },

  toggle() {
    document.getElementById('cartSidebar').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('show');
    this.renderSidebar();
  },

  close() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('show');
  },

  renderSidebar() {
    const el = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');
    if (!el) return;
    if (this.items.length === 0) {
      el.innerHTML = `<div class="cart-empty"><span>🛒</span><p>Your cart is empty</p></div>`;
      footer.style.display = 'none';
      return;
    }
    footer.style.display = 'block';
    el.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.imageUrl}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400'">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
          <div class="cart-item-qty">
            <button onclick="Cart.updateQty('${item._id}',-1)">−</button>
            <span>${item.qty}</span>
            <button onclick="Cart.updateQty('${item._id}',1)">+</button>
            <button class="cart-item-remove" onclick="Cart.remove('${item._id}')">🗑</button>
          </div>
        </div>
      </div>`).join('');
    document.getElementById('cartTotal').textContent = '₹' + this.total().toLocaleString();
  },

  checkout() {
    if (!Auth.isLoggedIn()) { App.navigate('login'); return; }
    if (this.items.length === 0) { Toast.error('Cart is empty'); return; }
    this.close();
    App.navigate('checkout');
  },

  renderCheckout() {
    const el = document.getElementById('checkoutItems');
    if (!el) return;
    el.innerHTML = this.items.map(i => `
      <div class="order-item-row">
        <span>${i.name} × ${i.qty}</span>
        <span>₹${(i.price * i.qty).toLocaleString()}</span>
      </div>`).join('') + '<hr style="border-color:var(--border-glass);margin:.75rem 0">';
    document.getElementById('checkoutTotal').textContent = '₹' + this.total().toLocaleString();
    // Pre-fill address
    if (Auth.user && Auth.user.address) {
      document.getElementById('shippingAddress').value = Auth.user.address;
    }
  },

  async placeOrder(e) {
    e.preventDefault();
    const btn = document.getElementById('placeOrderBtn');
    btn.disabled = true; btn.textContent = 'Placing order…';
    const shippingAddress = document.getElementById('shippingAddress').value;
    const items = this.items.map(i => ({ productId: i._id, quantity: i.qty }));
    try {
      const res = await Http.post('/orders', { items, shippingAddress });
      if (!res.success) { Toast.error(res.message); return; }
      this.clear();
      Toast.success('Order placed successfully! 🎉');
      App.navigate('orders');
    } catch { Toast.error('Failed to place order'); }
    finally { btn.disabled = false; btn.textContent = '🛍️ Place Order'; }
  }
};

/* ─── Products Module ─── */
const Products = {
  _search: '', _cat: 'all',

  productCard(p) {
    return `
    <div class="product-card">
      <div class="product-card-img-wrap">
        <img class="product-card-img" src="${p.imageUrl}" alt="${p.name}" onerror="this.src='${fallbackImg}'">
        <span class="product-card-badge">${catIcon(p.category)} ${p.category}</span>
      </div>
      <div class="product-card-body">
        <div class="product-card-title">${p.name}</div>
        <div class="product-card-shop">🏪 ${p.shop ? p.shop.name : 'Local Shop'}</div>
        <div class="product-card-desc">${p.description}</div>
        <div class="product-card-footer">
          <span class="product-card-price">${fmt(p.price)}</span>
          <div class="product-card-actions">
            <button class="btn btn-outline btn-sm" onclick="App.navigate('product-detail','${p._id}')">View</button>
            <button class="btn btn-primary btn-sm" onclick="Cart.add(${JSON.stringify(p).replace(/"/g,'&quot;')})">+ Cart</button>
          </div>
        </div>
      </div>
    </div>`;
  },

  async loadFeatured() {
    const el = document.getElementById('featuredProducts');
    try {
      const res = await Http.get('/products?limit=4');
      if (!res.success || !res.data.length) { el.innerHTML = '<div class="empty-state"><span>📦</span><p>No products yet</p></div>'; return; }
      el.innerHTML = res.data.map(p => this.productCard(p)).join('');
    } catch { el.innerHTML = '<div class="empty-state"><span>⚠️</span><p>Could not load products</p></div>'; }
  },

  async loadAll() {
    const el = document.getElementById('productsList');
    el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      let url = '/products?limit=50';
      if (this._cat !== 'all') url += `&category=${this._cat}`;
      if (this._search) url += `&search=${encodeURIComponent(this._search)}`;
      const res = await Http.get(url);
      if (!res.success || !res.data.length) { el.innerHTML = '<div class="empty-state"><span>🔍</span><p>No products found</p></div>'; return; }
      el.innerHTML = res.data.map(p => this.productCard(p)).join('');
    } catch { el.innerHTML = '<div class="empty-state"><span>⚠️</span><p>Could not load products</p></div>'; }
  },

  search() {
    this._search = document.getElementById('searchInput').value;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.loadAll(), 350);
  },

  filter() {
    this._cat = document.getElementById('categoryFilter').value;
    this.loadAll();
  },

  async loadDetail(id) {
    const el = document.getElementById('productDetail');
    el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const res = await Http.get('/products/' + id);
      if (!res.success) { el.innerHTML = '<div class="empty-state"><span>❌</span><p>Product not found</p></div>'; return; }
      const p = res.data;
      el.innerHTML = `
        <div class="product-detail-img">
          <img src="${p.imageUrl}" alt="${p.name}" onerror="this.src='${fallbackImg}'">
        </div>
        <div class="product-detail-info">
          <h1>${p.name}</h1>
          <div class="product-detail-meta">
            <span>${catIcon(p.category)} ${p.category}</span>
            <span>🏪 ${p.shop ? p.shop.name : 'Local Shop'}</span>
            <span>👤 ${p.vendor ? p.vendor.name : ''}</span>
          </div>
          <div class="product-detail-price">${fmt(p.price)}</div>
          <div class="product-detail-desc">${p.description}</div>
          <div class="${p.stock > 0 ? 'in-stock' : 'out-of-stock'} stock-info">
            ${p.stock > 0 ? `✅ In Stock (${p.stock} available)` : '❌ Out of Stock'}
          </div>
          <div class="product-detail-actions" style="margin-top:1.5rem">
            <div class="qty-selector" id="qtySelector">
              <button onclick="Products.changeQty(-1)">−</button>
              <span id="qtyVal">1</span>
              <button onclick="Products.changeQty(1)">+</button>
            </div>
            <button class="btn btn-primary" ${p.stock===0?'disabled':''} onclick="Products.addToCartDetail(${JSON.stringify(p).replace(/"/g,'&quot;')})">
              🛒 Add to Cart
            </button>
            <button class="btn btn-outline" onclick="App.navigate('shop-detail','${p.shop ? p.shop._id : ''}')">
              🏪 View Shop
            </button>
          </div>
        </div>`;
    } catch { el.innerHTML = '<div class="empty-state"><span>⚠️</span><p>Failed to load product</p></div>'; }
  },

  changeQty(d) {
    const el = document.getElementById('qtyVal');
    let v = parseInt(el.textContent) + d;
    if (v < 1) v = 1;
    el.textContent = v;
  },

  addToCartDetail(product) {
    const qty = parseInt(document.getElementById('qtyVal').textContent);
    Cart.add(product, qty);
  }
};

/* ─── Shops Module ─── */
const Shops = {
  shopCard(s) {
    return `
    <div class="shop-card" onclick="App.navigate('shop-detail','${s._id}')">
      <img class="shop-card-img" src="${s.logo || fallbackImg}" alt="${s.name}" onerror="this.src='${fallbackImg}'">
      <div class="shop-card-body">
        <div class="shop-card-category">${catIcon(s.category)} ${s.category}</div>
        <div class="shop-card-title">${s.name}</div>
        <div class="shop-card-desc">${s.description}</div>
      </div>
    </div>`;
  },

  async loadFeatured() {
    const el = document.getElementById('featuredShops');
    try {
      const res = await Http.get('/shops');
      if (!res.success || !res.data.length) { el.innerHTML = '<div class="empty-state"><span>🏪</span><p>No shops yet</p></div>'; return; }
      el.innerHTML = res.data.slice(0,3).map(s => this.shopCard(s)).join('');
    } catch { el.innerHTML = '<div class="empty-state"><span>⚠️</span><p>Could not load shops</p></div>'; }
  },

  async loadAll() {
    const el = document.getElementById('shopsList');
    el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const res = await Http.get('/shops');
      if (!res.success || !res.data.length) { el.innerHTML = '<div class="empty-state"><span>🏪</span><p>No shops yet. Be the first vendor!</p></div>'; return; }
      el.innerHTML = res.data.map(s => this.shopCard(s)).join('');
    } catch { el.innerHTML = '<div class="empty-state"><span>⚠️</span><p>Could not load shops</p></div>'; }
  },

  async loadDetail(id) {
    const el = document.getElementById('shopDetail');
    el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const [shopRes, prodsRes] = await Promise.all([Http.get('/shops/'+id), Http.get('/products?shop='+id)]);
      if (!shopRes.success) { el.innerHTML = '<div class="empty-state"><span>❌</span><p>Shop not found</p></div>'; return; }
      const s = shopRes.data;
      const prods = prodsRes.data || [];
      el.innerHTML = `
        <div style="margin:2rem 0">
          <div style="display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;margin-bottom:2rem">
            <img src="${s.logo||fallbackImg}" alt="${s.name}" style="width:100px;height:100px;border-radius:var(--radius);object-fit:cover" onerror="this.src='${fallbackImg}'">
            <div>
              <span class="badge badge-category">${catIcon(s.category)} ${s.category}</span>
              <h1 style="font-size:1.8rem;font-weight:700;margin:.5rem 0">${s.name}</h1>
              <p style="color:var(--text-secondary)">${s.description}</p>
              ${s.address ? `<p style="font-size:.82rem;color:var(--text-muted);margin-top:.3rem">📍 ${s.address}</p>` : ''}
            </div>
          </div>
          <h2 class="section-title">Products from ${s.name}</h2>
          <div class="cards-grid">${prods.length ? prods.map(p => Products.productCard(p)).join('') : '<div class="empty-state"><span>📦</span><p>No products yet</p></div>'}</div>
        </div>`;
    } catch { el.innerHTML = '<div class="empty-state"><span>⚠️</span><p>Failed to load shop</p></div>'; }
  }
};

/* ─── Orders Module ─── */
const Orders = {
  async loadMyOrders() {
    if (!Auth.isLoggedIn()) { App.navigate('login'); return; }
    const el = document.getElementById('ordersList');
    el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const res = await Http.get('/orders/my-orders');
      if (!res.success || !res.data.length) { el.innerHTML = '<div class="empty-state"><span>📦</span><p>No orders yet. Start shopping!</p></div>'; return; }
      el.innerHTML = res.data.map(o => `
        <div class="order-card">
          <div class="order-header">
            <span class="order-id">Order #${o._id.slice(-8).toUpperCase()}</span>
            ${statusBadge(o.status)}
          </div>
          <div class="order-items-list">
            ${o.items.map(i => `<div class="order-item-row"><span>${i.productName} × ${i.quantity}</span><span>${fmt(i.price * i.quantity)}</span></div>`).join('')}
          </div>
          <div class="order-footer">
            <span style="font-size:.8rem;color:var(--text-muted)">📍 ${o.shippingAddress}</span>
            <span class="order-total">${fmt(o.totalAmount)}</span>
          </div>
        </div>`).join('');
    } catch { el.innerHTML = '<div class="empty-state"><span>⚠️</span><p>Failed to load orders</p></div>'; }
  }
};

/* ─── Vendor Dashboard ─── */
const Dashboard = {
  _tab: 'shop', shop: null, products: [],

  async load() {
    await this.loadStats();
    // After loadStats, this._tab might have been forced to 'shop' if no shop exists
    const activeBtn = document.querySelector(`.tab-btn[onclick*="'${this._tab}'"]`);
    this.switchTab(this._tab, activeBtn);
  },

  async loadStats() {
    const el = document.getElementById('dashboardStats');
    try {
      const [shopRes, prodsRes, ordersRes] = await Promise.all([
        Http.get('/shops/my/shop'), Http.get('/products/vendor/my-products'), Http.get('/orders/vendor/orders')
      ]);
      this.shop = shopRes.success ? shopRes.data : null;
      this.products = prodsRes.success ? prodsRes.data : [];
      const orders = ordersRes.success ? ordersRes.data : [];
      const revenue = this.products.reduce((s,p) => {
        orders.forEach(o => o.items.forEach(i => { if(i.product && i.product._id === p._id) s += i.price * i.quantity; }));
        return s;
      }, 0);
      el.innerHTML = `
        <div class="stat-card"><div class="stat-value">${this.shop ? 1 : 0}</div><div class="stat-label">My Shop</div></div>
        <div class="stat-card"><div class="stat-value">${this.products.length}</div><div class="stat-label">Products Listed</div></div>
        <div class="stat-card"><div class="stat-value">${orders.length}</div><div class="stat-label">Total Orders</div></div>
        <div class="stat-card"><div class="stat-value">${fmt(revenue)}</div><div class="stat-label">Est. Revenue</div></div>`;
        
      // Dynamic tab label and forced navigation if no shop exists
      const shopBtn = document.querySelector('.tab-btn[onclick*="\'shop\'"]');
      if (shopBtn) {
        shopBtn.innerHTML = this.shop ? '🏪 My Shop' : '➕ Create Shop';
      }
      if (!this.shop && this._tab !== 'shop') {
        this._tab = 'shop';
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        if (shopBtn) shopBtn.classList.add('active');
      }
    } catch { el.innerHTML = ''; }
  },

  switchTab(tab, btn) {
    this._tab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const el = document.getElementById('dashboardContent');
    if (tab === 'shop') this.renderShopTab(el);
    else if (tab === 'products') this.renderProductsTab(el);
    else this.renderOrdersTab(el);
  },

  renderShopTab(el) {
    if (!this.shop) {
      el.innerHTML = `
        <div style="max-width:520px">
          <p style="color:var(--text-secondary);margin-bottom:1.5rem">You don't have a shop yet. Create one to start selling!</p>
          <form onsubmit="Dashboard.createShop(event)">
            <div class="form-group"><label>Shop Name</label><input id="sName" placeholder="My Awesome Shop" required></div>
            <div class="form-group"><label>Description</label><textarea id="sDesc" placeholder="Describe your shop..." required></textarea></div>
            <div class="form-row">
              <div class="form-group"><label>Category</label>
                <select id="sCat">
                  <option value="grocery">Grocery</option><option value="electronics">Electronics</option>
                  <option value="handicrafts">Handicrafts</option><option value="clothing">Clothing</option>
                  <option value="food">Food</option><option value="books">Books</option>
                  <option value="health">Health</option><option value="other">Other</option>
                </select>
              </div>
              <div class="form-group"><label>Address</label><input id="sAddr" placeholder="Shop address"></div>
            </div>
            <div class="form-group"><label>Logo Image URL</label><input id="sLogo" placeholder="https://..."></div>
            <button type="submit" class="btn btn-primary">🏪 Create Shop</button>
          </form>
        </div>`;
    } else {
      el.innerHTML = `
        <div style="max-width:520px">
          <div style="display:flex;gap:1rem;align-items:center;margin-bottom:1.5rem">
            <img src="${this.shop.logo||fallbackImg}" style="width:70px;height:70px;border-radius:var(--radius-sm);object-fit:cover" onerror="this.src='${fallbackImg}'">
            <div>
              <h3>${this.shop.name}</h3>
              <span class="badge badge-category">${this.shop.category}</span>
            </div>
          </div>
          <form onsubmit="Dashboard.updateShop(event)">
            <div class="form-group"><label>Shop Name</label><input id="sName" value="${this.shop.name}" required></div>
            <div class="form-group"><label>Description</label><textarea id="sDesc">${this.shop.description}</textarea></div>
            <div class="form-row">
              <div class="form-group"><label>Category</label>
                <select id="sCat">
                  ${['grocery','electronics','handicrafts','clothing','food','books','health','other'].map(c=>`<option value="${c}" ${c===this.shop.category?'selected':''}>${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label>Address</label><input id="sAddr" value="${this.shop.address||''}"></div>
            </div>
            <div class="form-group"><label>Logo URL</label><input id="sLogo" value="${this.shop.logo||''}"></div>
            <button type="submit" class="btn btn-primary">💾 Save Changes</button>
          </form>
        </div>`;
    }
  },

  async createShop(e) {
    e.preventDefault();
    const body = { name:document.getElementById('sName').value, description:document.getElementById('sDesc').value, category:document.getElementById('sCat').value, address:document.getElementById('sAddr').value, logo:document.getElementById('sLogo').value };
    const res = await Http.post('/shops', body);
    if (!res.success) { Toast.error(res.message); return; }
    this.shop = res.data;
    Toast.success('Shop created! 🏪');
    this.load();
  },

  async updateShop(e) {
    e.preventDefault();
    const body = { name:document.getElementById('sName').value, description:document.getElementById('sDesc').value, category:document.getElementById('sCat').value, address:document.getElementById('sAddr').value, logo:document.getElementById('sLogo').value };
    const res = await Http.put('/shops/'+this.shop._id, body);
    if (!res.success) { Toast.error(res.message); return; }
    this.shop = res.data;
    Toast.success('Shop updated!');
  },

  renderProductsTab(el) {
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:.75rem">
        <h3>My Products</h3>
        <button class="btn btn-primary btn-sm" onclick="Dashboard.showAddProduct()">+ Add Product</button>
      </div>
      <div id="vendorProductsTable"></div>`;
    this.renderProductsTable();
  },

  renderProductsTable() {
    const el = document.getElementById('vendorProductsTable');
    if (!el) return;
    if (!this.products.length) { el.innerHTML = '<div class="empty-state"><span>📦</span><p>No products yet. Add your first product!</p></div>'; return; }
    el.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${this.products.map(p => `
            <tr>
              <td><div style="display:flex;align-items:center;gap:.75rem"><img src="${p.imageUrl}" style="width:40px;height:40px;border-radius:var(--radius-xs);object-fit:cover" onerror="this.src='${fallbackImg}'"><span>${p.name}</span></div></td>
              <td><span class="badge badge-category">${p.category}</span></td>
              <td>${fmt(p.price)}</td>
              <td>${p.stock}</td>
              <td><span class="badge ${p.isActive?'badge-delivered':'badge-cancelled'}">${p.isActive?'Active':'Inactive'}</span></td>
              <td>
                <button class="btn btn-outline btn-sm" style="margin-right:.3rem" onclick="Dashboard.showEditProduct('${p._id}')">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="Dashboard.deleteProduct('${p._id}')">🗑</button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  },

  showAddProduct() {
    if (!this.shop) { Toast.error('Create a shop first!'); Dashboard.switchTab('shop', document.querySelector('.tab-btn')); return; }
    document.getElementById('modalContent').innerHTML = `
      <button class="modal-close" onclick="Dashboard.closeModal()">✕</button>
      <h3>➕ Add New Product</h3>
      <form onsubmit="Dashboard.addProduct(event)">
        <div class="form-group"><label>Product Name</label><input id="pName" required placeholder="Product name"></div>
        <div class="form-group"><label>Description</label><textarea id="pDesc" required placeholder="Describe your product..."></textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Price (₹)</label><input id="pPrice" type="number" min="0" step="0.01" required placeholder="0.00"></div>
          <div class="form-group"><label>Stock</label><input id="pStock" type="number" min="0" required placeholder="0"></div>
        </div>
        <div class="form-group"><label>Category</label>
          <select id="pCat">
            ${['grocery','electronics','handicrafts','clothing','food','books','health','other'].map(c=>`<option value="${c}">${catIcon(c)} ${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Image URL</label><input id="pImg" placeholder="https://images.unsplash.com/..."></div>
        <button type="submit" class="btn btn-primary btn-block">Add Product</button>
      </form>`;
    document.getElementById('modalOverlay').classList.add('show');
  },

  showEditProduct(id) {
    const p = this.products.find(x => x._id === id);
    if (!p) return;
    document.getElementById('modalContent').innerHTML = `
      <button class="modal-close" onclick="Dashboard.closeModal()">✕</button>
      <h3>✏️ Edit Product</h3>
      <form onsubmit="Dashboard.editProduct(event,'${id}')">
        <div class="form-group"><label>Product Name</label><input id="pName" value="${p.name}" required></div>
        <div class="form-group"><label>Description</label><textarea id="pDesc">${p.description}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Price (₹)</label><input id="pPrice" type="number" min="0" step="0.01" value="${p.price}" required></div>
          <div class="form-group"><label>Stock</label><input id="pStock" type="number" min="0" value="${p.stock}" required></div>
        </div>
        <div class="form-group"><label>Category</label>
          <select id="pCat">${['grocery','electronics','handicrafts','clothing','food','books','health','other'].map(c=>`<option value="${c}" ${c===p.category?'selected':''}>${catIcon(c)} ${c}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>Image URL</label><input id="pImg" value="${p.imageUrl||''}"></div>
        <div class="form-group"><label>Status</label>
          <select id="pActive"><option value="true" ${p.isActive?'selected':''}>Active</option><option value="false" ${!p.isActive?'selected':''}>Inactive</option></select>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Save Changes</button>
      </form>`;
    document.getElementById('modalOverlay').classList.add('show');
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
  },

  async addProduct(e) {
    e.preventDefault();
    const body = { name:document.getElementById('pName').value, description:document.getElementById('pDesc').value, price:parseFloat(document.getElementById('pPrice').value), stock:parseInt(document.getElementById('pStock').value), category:document.getElementById('pCat').value, imageUrl:document.getElementById('pImg').value };
    const res = await Http.post('/products', body);
    if (!res.success) { Toast.error(res.message); return; }
    this.products.unshift(res.data);
    this.closeModal();
    Toast.success('Product added! 📦');
    this.renderProductsTable();
    this.loadStats();
  },

  async editProduct(e, id) {
    e.preventDefault();
    const body = { name:document.getElementById('pName').value, description:document.getElementById('pDesc').value, price:parseFloat(document.getElementById('pPrice').value), stock:parseInt(document.getElementById('pStock').value), category:document.getElementById('pCat').value, imageUrl:document.getElementById('pImg').value, isActive:document.getElementById('pActive').value==='true' };
    const res = await Http.put('/products/'+id, body);
    if (!res.success) { Toast.error(res.message); return; }
    const idx = this.products.findIndex(p => p._id === id);
    if (idx > -1) this.products[idx] = res.data;
    this.closeModal();
    Toast.success('Product updated!');
    this.renderProductsTable();
  },

  async deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    const res = await Http.del('/products/'+id);
    if (!res.success) { Toast.error(res.message); return; }
    this.products = this.products.filter(p => p._id !== id);
    Toast.success('Product deleted');
    this.renderProductsTable();
    this.loadStats();
  },

  async renderOrdersTab(el) {
    el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const res = await Http.get('/orders/vendor/orders');
      if (!res.success || !res.data.length) { el.innerHTML = '<div class="empty-state"><span>📋</span><p>No orders yet</p></div>'; return; }
      el.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>${res.data.map(o => `
              <tr>
                <td class="order-id">#${o._id.slice(-8).toUpperCase()}</td>
                <td>${o.customerName}</td>
                <td>${o.items.length} item(s)</td>
                <td>${fmt(o.totalAmount)}</td>
                <td>${statusBadge(o.status)}</td>
                <td>
                  <select style="background:var(--bg-glass);border:1px solid var(--border-glass);color:var(--text-primary);border-radius:4px;padding:.3rem;font-size:.8rem" onchange="Dashboard.updateOrderStatus('${o._id}',this.value)">
                    ${['pending','confirmed','processing','shipped','delivered','cancelled'].map(s=>`<option value="${s}" ${s===o.status?'selected':''}>${s}</option>`).join('')}
                  </select>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } catch { el.innerHTML = '<div class="empty-state"><span>⚠️</span><p>Failed to load orders</p></div>'; }
  },

  async updateOrderStatus(id, status) {
    const res = await Http.put('/orders/'+id+'/status', { status });
    if (res.success) Toast.success('Order status updated to: ' + status);
    else Toast.error(res.message);
  }
};

/* ─── Bootstrap ─── */
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
  Cart.init();
  App.navigate(Auth.isLoggedIn() ? 'home' : 'login');

  // Close dropdown on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.user-menu')) App.closeUserMenu();
  });

  // Close modal on overlay click
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) Dashboard.closeModal();
  });
});