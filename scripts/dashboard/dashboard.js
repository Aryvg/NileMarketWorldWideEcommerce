

/* USERS */
let users=[];
let lastViewedUserCount = Number(localStorage.getItem('lastViewedUserCount') || 0);

// Helpers for persisting role selections locally
const ROLE_STORAGE_KEY = 'userRoles';
function loadStoredRoles() {
  try { return JSON.parse(localStorage.getItem(ROLE_STORAGE_KEY) || '{}'); } catch (e) { return {}; }
}
function saveStoredRole(key, role) {
  const m = loadStoredRoles();
  m[key] = role;
  localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(m));
}
function mapRolesToName(roles) {
  // roles may be array of numbers, object, or string
  if (!roles) return 'User';
  if (Array.isArray(roles)) {
    if (roles.includes(5150)) return 'Admin';
    if (roles.includes(1984)) return 'Editor';
    if (roles.includes(2001)) return 'User';
    return 'User';
  }
  if (typeof roles === 'object') {
    if (roles.Admin) return 'Admin';
    if (roles.Editor) return 'Editor';
    if (roles.User) return 'User';
  }
  if (typeof roles === 'string') return roles;
  return 'User';
}

// Fetch users from backend
async function fetchUsersFromBackend() {
  try {
    const token = localStorage.getItem('accessToken');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    const res = await fetch('https://nilemarket-igqk.onrender.com/users', { headers });
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    // Map backend user info to dashboard format
    // If backend returns array of usernames only
    if (Array.isArray(data) && typeof data[0] === 'string') {
      users = data.map(name => ({
        username: name,
        email: '',
        age: '',
        job: '',
        country: '',
        role: 'User',
        password: '',
        status: 'Logged Out',
        _id: '',
      }));
    } else if (Array.isArray(data)) {
      const stored = loadStoredRoles();
      users = data.map(u => {
        const idKey = u._id || u.username || '';
        const inferred = mapRolesToName(u.roles);
        const role = stored[idKey] || inferred || 'User';
        return {
          username: u.username || '',
          email: u.email || '',
          age: u.age || '',
          job: u.job || '',
          country: u.country || '',
          role: role,
          password: u.password || '',
          status: 'Logged Out',
          _id: u._id || '',
        };
      });
    } else {
      users = [];
    }
    renderUsers(userSearch.value);
    updateCounts();
    // persist the fresh count so we can display it immediately on next load
    localStorage.setItem('lastUserCount', users.length);
  } catch (e) {
    console.error('Error fetching users:', e);
  }
}

// Call fetchUsersFromBackend when dashboard loads
// on load, fetch user list and determine current role visibility
async function checkDashboardRole() {
  try {
    const res = await fetch('https://nilemarket-igqk.onrender.com/refresh/status', {
      method: 'GET',
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      const card = document.getElementById('usersCard');
      const userCountEl = document.getElementById('userCount');
      // if we're going to reveal the users card, prefill its count from storage
      if (card && data.isAdmin) {
        const storedUsr = Number(localStorage.getItem('lastUserCount') || 0);
        if (userCountEl) userCountEl.innerText = storedUsr || '';
        card.style.display = '';
      }
      return data;
    }
  } catch (e) {
    console.error('could not check dashboard role', e);
  }
  return null;
}

document.addEventListener('DOMContentLoaded', async () => {
  const status = await checkDashboardRole();
  // store username for persistent per-user state and update local variable
  if (status && status.username) {
    dashboardUser = status.username;
    localStorage.setItem('dashboardUser', dashboardUser);
    // refresh viewed count based on new user
    lastViewedProductCount = Number(localStorage.getItem('lastViewedProductCount_' + dashboardUser) || 0);
  }
  const card = document.getElementById('usersCard');
  if (card && card.style.display !== 'none') {
    fetchUsersFromBackend();
  }
  // ensure counts reflect any new computation after knowing user
  updateCounts();
});

/* PRODUCTS */

// initialize products/orders arrays from storage so we can show counts immediately
let products = JSON.parse(localStorage.getItem('dashboardProducts') || '[]');
let orders = JSON.parse(localStorage.getItem('dashboardOrders') || '[]');
// username used for per-user storage keys; may be set asynchronously
let dashboardUser = localStorage.getItem('dashboardUser') || '';
// count tracking for new products (user-specific)
let lastViewedProductCount = dashboardUser ? Number(localStorage.getItem('lastViewedProductCount_' + dashboardUser) || 0) : 0;

// set counters based on stored values before any network activity
(function initCounts() {
  const storedProd = Number(localStorage.getItem('lastProductCount') || 0);
  const storedOrd = Number(localStorage.getItem('lastOrderCount') || 0);
  if (typeof productCount !== 'undefined') {
    productCount.innerText = products.length || storedProd;
  }
  if (typeof orderCount !== 'undefined') {
    orderCount.innerText = orders.length || storedOrd;
  }
})();

async function fetchProductsFromBackend() {
  try {
    const token = localStorage.getItem('accessToken');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    const res = await fetch('https://nilemarket-igqk.onrender.com/products', { headers });
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    // Store products with _id
    products = Array.isArray(data) ? data.map(p => ({
      image: p.image,
      name: p.name,
      price: p.priceCents,
      _id: p._id
    })) : [];
    localStorage.setItem('dashboardProducts', JSON.stringify(products));
    // store count for future reloads
    localStorage.setItem('lastProductCount', products.length);
    // ensure we have the current dashboard user (might be set by another
    // DOMContentLoaded listener); fall back to stored value if necessary.
    dashboardUser = dashboardUser || localStorage.getItem('dashboardUser') || '';
    if (dashboardUser) {
      lastViewedProductCount = Number(localStorage.getItem('lastViewedProductCount_' + dashboardUser) || 0);
    }
    renderProducts(productSearch.value);
    updateCounts();
  } catch (e) {
    console.error('Error fetching products:', e);
  }
}

document.addEventListener('DOMContentLoaded', fetchProductsFromBackend);

// lastViewedOrderCount already defined earlier (above where orders was originally declared)
let lastViewedOrderCount = Number(localStorage.getItem('lastViewedOrderCount') || 0);

// Fetch orders and users from backend and map them for dashboard
async function fetchOrdersAndUsers() {
  try {
    // Fetch users
    const token = localStorage.getItem('accessToken');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    const usersRes = await fetch('https://nilemarket-igqk.onrender.com/users', { headers });
    let usersData = [];
    if (usersRes.ok) {
      usersData = await usersRes.json();
    }
    // Normalize users array
    let usersArr = [];
    if (Array.isArray(usersData) && typeof usersData[0] === 'string') {
      usersArr = usersData.map(name => ({ username: name}));
    } else if (Array.isArray(usersData)) {
      usersArr = usersData.map(u => ({ username: u.username || '' || u.username || '' }));
    }

    // Fetch orders
    // Add ?all=1 to fetch all orders for dashboard only
    const ordersRes = await fetch('https://nilemarket-igqk.onrender.com/orders?all=1', { headers });
    let ordersData = [];
    if (ordersRes.ok) {
      ordersData = await ordersRes.json();
    }

    // Map orders to dashboard format
    orders = ordersData.map(order => {
      // Find user info by createdBy
      let user = usersArr.find(u => u.username === order.createdBy) || { username: order.createdBy};
      return {
       
        username: user.username,
        total: order.Total,
        date: order.date,
        orderId: order.orderId,
        products: (order.product || []).map(p => ({
          image: p.image,
          name: p.name,
          quantity: p.quantity,
          price: p.price,
          deliveryDate: p.deliveryDate
        })),
        shipping: {
          fullName: order.shippingAddress?.fullName || '',
          country: order.shippingAddress?.country || '',
          city: order.shippingAddress?.city || '',
          subcity: order.shippingAddress?.subCity || '',
          houseNo: order.shippingAddress?.houseNo || '',
          phone: order.shippingAddress?.phone || ''
        }
      };
    });
    renderOrders(orderSearch.value);
    // persist order data and count for display during reloads
    localStorage.setItem('dashboardOrders', JSON.stringify(orders));
    localStorage.setItem('lastOrderCount', orders.length);
    updateCounts();
  } catch (e) {
    console.error('Error fetching orders/users:', e);
  }
}

// Fetch orders and users on dashboard load
document.addEventListener('DOMContentLoaded', fetchOrdersAndUsers);

/* NAVIGATION */
function showPage(page){
["homePage","usersPage","productsPage","ordersPage"]
.forEach(p=>document.getElementById(p).classList.add("hidden"));
document.getElementById(page).classList.remove("hidden");
updateCounts();
}

function updateCounts(){
// show current user total, fall back to last-known value until fetch finishes
const storedUsr = Number(localStorage.getItem('lastUserCount') || 0);
userCount.innerText = users.length || storedUsr;
// show stored counts if array is currently empty (pre-fetch)
const storedProd = Number(localStorage.getItem('lastProductCount') || 0);
const storedOrd = Number(localStorage.getItem('lastOrderCount') || 0);
productCount.innerText = products.length || storedProd;
orderCount.innerText = orders.length || storedOrd;
// Telegram-like new orders logic
let newOrders = 0;
if(Array.isArray(orders)){
  newOrders = orders.length - lastViewedOrderCount;
  if(newOrders < 0) newOrders = 0;
}
newOrderCount.innerText = newOrders;

// Telegram-like new users logic
let newUsers = 0;
if(Array.isArray(users)){
  newUsers = users.length - lastViewedUserCount;
  if(newUsers < 0) newUsers = 0;
}
newUserCount.innerText = newUsers;

// Telegram-like new products logic
let newProducts = 0;
if (dashboardUser && Array.isArray(products)) {
  newProducts = products.length - lastViewedProductCount;
  if (newProducts < 0) newProducts = 0;
}
const newProdEl = document.getElementById('newProductCount');
if (newProdEl) newProdEl.innerText = newProducts;
}

if (usersCard) {
  usersCard.onclick = () => {
    // When user views users, update lastViewedUserCount and persist
    lastViewedUserCount = users.length;
    localStorage.setItem('lastViewedUserCount', lastViewedUserCount);
    showPage("usersPage");
    updateCounts();
  };
}
productsCard.onclick=()=>{
  // mark products viewed per user
  if (dashboardUser) {
    lastViewedProductCount = products.length;
    localStorage.setItem('lastViewedProductCount_' + dashboardUser, lastViewedProductCount);
  }
  showPage("productsPage");
  updateCounts();
};
ordersCard.onclick = () => {
  // When user views orders, update lastViewedOrderCount and persist
  lastViewedOrderCount = orders.length;
  localStorage.setItem('lastViewedOrderCount', lastViewedOrderCount);
  showPage("ordersPage");
  updateCounts();
};
backUsers.onclick=()=>showPage("homePage");
backProducts.onclick=()=>showPage("homePage");
backOrders.onclick=()=>{
  showPage("homePage");
  updateCounts();
};

/* USERS RENDER */
function renderUsers(filter=""){
usersTable.innerHTML="";
// Show newest users first (do not mutate original array)
users.filter(u=>u.username.toLowerCase().includes(filter.toLowerCase())).slice().reverse()
.forEach((u)=>{
let row=document.createElement("tr");
row.innerHTML=`
<td data-label="Username">${u.username}</td>
<td data-label="Email">${u.email}</td>
<td data-label="Age">${u.age}</td>
<td data-label="Job">${u.job}</td>
<td data-label="Country">${u.country}</td>
<td data-label="Password">${u.password}</td>
<td data-label="Status">
<select class="statusSelect">
<option ${u.status==="Logged In"?"selected":""}>Logged In</option>
<option ${u.status==="Logged Out"?"selected":""}>Logged Out</option>
</select>
</td>
<td data-label="Role">
<select class="roleSelect">
<option ${u.role==="User"?"selected":""}>User</option>
<option ${u.role==="Admin"?"selected":""}>Admin</option>
<option ${u.role==="Editor"?"selected":""}>Editor</option>
</select>
</td>
<td data-label="Action">
<button class="deleteBtn">Delete</button>
</td>
`;

  row.querySelector(".deleteBtn").onclick=()=>{
    // Show confirmation popup
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100vw';
    popup.style.height = '100vh';
    popup.style.background = 'rgba(0,0,0,0.18)';
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';
    popup.style.zIndex = '99999';
    popup.innerHTML = `
      <div style="background:white;padding:32px 24px;border-radius:0;box-shadow:0 8px 32px rgba(0,0,0,0.18);font-size:18px;text-align:center;">
        Are you sure you want to delete user <b>${u.username}</b>?<br><br>
        <button id="confirmDeleteYes" style="margin:8px 18px;padding:8px 22px;background:#e74a3b;color:white;border:none;font-size:16px;">Yes</button>
        <button id="confirmDeleteNo" style="margin:8px 18px;padding:8px 22px;background:#4e73df;color:white;border:none;font-size:16px;">No</button>
      </div>
    `;
    document.body.appendChild(popup);
    document.getElementById('confirmDeleteYes').onclick = async function() {
      // Send DELETE request to backend
      try {
        const token = localStorage.getItem('accessToken');
        const headers = token ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
        const res = await fetch(`https://nilemarket-igqk.onrender.com/users/${u._id}`, {
          method: 'DELETE',
          headers
        });
        if (!res.ok) throw new Error('Failed to delete user');
        // remove from original users array by id
        const idx = users.findIndex(x => x._id === u._id);
        if (idx !== -1) users.splice(idx, 1);
        renderUsers(userSearch.value);
        updateCounts();
      } catch (err) {
        alert('Error deleting user: ' + err.message);
      }
      popup.remove();
    };
    document.getElementById('confirmDeleteNo').onclick = function() {
      popup.remove();
    };
  };

  // mutate the user object directly (works regardless of render order) and persist choice
  const roleSel = row.querySelector(".roleSelect");
  roleSel.onchange = async e => {
    const newRole = e.target.value;
    // Update UI immediately
    u.role = newRole;
    const idKey = u._id || u.username || '';

    // Helper: ensure we have an access token. If missing, try to get one via /refresh using cookie.
    async function ensureAccessToken() {
      let token = localStorage.getItem('accessToken');
      if (token) return token;
      try {
        const r = await fetch('https://nilemarket-igqk.onrender.com/refresh', { method: 'GET', credentials: 'include' });
        if (!r.ok) throw new Error('refresh failed');
        const body = await r.json();
        if (body && body.accessToken) {
          localStorage.setItem('accessToken', body.accessToken);
          return body.accessToken;
        }
        throw new Error('no access token');
      } catch (err) {
        return null;
      }
    }

    // If we have a backend id, attempt to persist to DB
    if (u._id) {
      try {
        const token = await ensureAccessToken();
        if (!token) throw new Error('Not authenticated');
        const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
        const res = await fetch(`https://nilemarket-igqk.onrender.com/users/${u._id}/role`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ role: newRole })
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Failed to update role on server');
        }
        const data = await res.json();
        // Persist local override to keep UI consistent
        if (idKey) saveStoredRole(idKey, newRole);
      } catch (err) {
        alert('Could not update role on server: ' + (err.message || err));
        // revert UI selection to previous value
        const stored = loadStoredRoles();
        const prev = stored[idKey] || (u && u.role) || 'User';
        roleSel.value = prev;
        u.role = prev;
      }
    } else {
      // No backend id — persist locally only
      if (idKey) saveStoredRole(idKey, newRole);
    }
  };
  row.querySelector(".statusSelect").onchange = e => { u.status = e.target.value; };

usersTable.appendChild(row);
});
}
userSearch.oninput=e=>renderUsers(e.target.value);
renderUsers();

/* PRODUCTS RENDER + FIXED ADD */
addProductBtn.onclick=()=>{
let file = productImage.files[0];
let name = productName.value.trim();
let priceCents = productPrice.value.trim();

if (!file || !name || !priceCents) {
  alert("Fill all fields");
  return;
}

const formData = new FormData();
formData.append('image', file);
formData.append('name', name);
formData.append('priceCents', priceCents);
formData.append('image', 'upload'); // dummy value for backend validation

const accessToken = localStorage.getItem('accessToken');

fetch('https://nilemarket-igqk.onrender.com/products', {
  method: 'POST',
  body: formData,
  headers: accessToken ? { 'Authorization': 'Bearer ' + accessToken } : {}
})
.then(async res => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
})
  .then(product => {
  // Add product to the end; renderProducts reverses the array to show newest first
  products.push({
    image: product.image,
    name: product.name,
    price: product.priceCents,
    _id: product._id // store backend id
  });
  localStorage.setItem('dashboardProducts', JSON.stringify(products));
  // treat newly added product as already seen by this user
  if (dashboardUser) {
    lastViewedProductCount = products.length;
    localStorage.setItem('lastViewedProductCount_' + dashboardUser, lastViewedProductCount);
  }

  renderProducts(productSearch.value);
  updateCounts();
  productImage.value = "";
  productName.value = "";
  productPrice.value = "";
})
.catch(err => {
  alert('Error adding product: ' + err.message);
});
};

function renderProducts(filter=""){

productList.innerHTML = "";
// Show newest products first without mutating original array
products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase())).slice().reverse()
  .forEach((p) => {
    let box = document.createElement("div");
    box.className = "productBox";
    // Fix image path: prepend backend URL if not already a full URL
    let imgSrc = p.image;
    if (imgSrc && !/^https?:\/\//.test(imgSrc)) {
      imgSrc = `https://nilemarket-igqk.onrender.com/${imgSrc}`;
    }
    box.innerHTML = `
      <img src="${imgSrc}">
      <div><strong>${p.name}</strong><br>Price: ${p.price} cents</div>
      <button class="editBtn">Edit</button>
      <button class="deleteBtn">Delete</button>
    `;

  box.querySelector(".deleteBtn").onclick = () => {
    const accessToken = localStorage.getItem('accessToken');
    const productId = p._id;
    if (productId) {
      fetch('https://nilemarket-igqk.onrender.com/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': 'Bearer ' + accessToken } : {})
        },
        body: JSON.stringify({ id: productId })
      })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        // Remove from local array and UI by id lookup
        const idx = products.findIndex(x => x._id === p._id);
        if (idx !== -1) products.splice(idx, 1);
        localStorage.setItem('dashboardProducts', JSON.stringify(products));
        renderProducts(productSearch.value);
        updateCounts();
      })
      .catch(err => {
        alert('Error deleting product: ' + err.message);
      });
    } else {
      alert('Product cannot be deleted from backend: missing ID.');
      const idx = products.findIndex(x => x === p || x._id === p._id);
      if (idx !== -1) products.splice(idx, 1);
      localStorage.setItem('dashboardProducts', JSON.stringify(products));
      renderProducts(productSearch.value);
      updateCounts();
    }
  };

  box.querySelector(".editBtn").onclick=async ()=>{
  let newName = prompt("New name:", p.name);
  let newPrice = prompt("New price:", p.price);

  // If product has no backend id, update locally only
  if (!p._id) {
    if (newName) p.name = newName;
    if (newPrice) p.price = newPrice;
    localStorage.setItem('dashboardProducts', JSON.stringify(products));
    renderProducts(productSearch.value);
    return;
  }

  // Build FormData so multer-based PUT route can accept fields
  const fd = new FormData();
  fd.append('id', p._id);
  if (newName !== null) fd.append('name', newName);
  if (newPrice !== null) fd.append('priceCents', newPrice);

  const accessToken = localStorage.getItem('accessToken');
  try {
    const res = await fetch('https://nilemarket-igqk.onrender.com/products', {
      method: 'PUT',
      body: fd,
      headers: accessToken ? { 'Authorization': 'Bearer ' + accessToken } : {}
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to update product');
    }
    const updated = await res.json();

    // Update local copy from response by finding the item index
    const idx = products.findIndex(x => x._id === p._id);
    if (idx !== -1) {
      products[idx] = {
        image: updated.image || p.image,
        name: updated.name || p.name,
        price: updated.priceCents !== undefined ? updated.priceCents : p.price,
        _id: updated._id || p._id
      };
    }
    localStorage.setItem('dashboardProducts', JSON.stringify(products));
    renderProducts(productSearch.value);
    updateCounts();
  } catch (err) {
    alert('Error updating product: ' + err.message);
  }
};

productList.appendChild(box);
});
}
productSearch.oninput=e=>renderProducts(e.target.value);
renderProducts();

/* ORDERS RENDER */
function renderOrders(filter=""){
orderList.innerHTML="";
// Show newest orders first
orders.filter(o=>o.username.toLowerCase().includes(filter.toLowerCase())).slice().reverse()
.forEach(o=>{
let card=document.createElement("div");
card.className="orderCard";
card.innerHTML=`
<strong>Username:</strong> ${o.username}<br>
<strong>Total:</strong> ${o.total}<br>
<strong>Date:</strong> ${o.date}<br>
<strong>OrderId:</strong> ${o.orderId}
<div class="toggle">Toggle Products</div>
<div class="hidden"></div>
<div class="toggle">Toggle Shipping</div>
<div class="hidden">
<strong>Full Name:</strong> ${o.shipping.fullName || ''}<br>
<strong>Country:</strong> ${o.shipping.country}<br>
<strong>City:</strong> ${o.shipping.city}<br>
<strong>Subcity:</strong> ${o.shipping.subcity}<br>
<strong>House:</strong> ${o.shipping.houseNo}<br>
<strong>Phone:</strong> ${o.shipping.phone}<br>
</div>
`;

let productContainer=card.querySelectorAll(".hidden")[0];

o.products.forEach(p=>{
let item=document.createElement("div");
item.className="productItem";
item.innerHTML=`
<img src="${p.image}">
<div>${p.name}<br>Quantity:${p.quantity}<br>Price:${p.price}<br>Delivery:${p.deliveryDate}</div>
`;
productContainer.appendChild(item);
});

let toggles=card.querySelectorAll(".toggle");
toggles[0].onclick=()=>productContainer.classList.toggle("hidden");
toggles[1].onclick=()=>toggles[1].nextElementSibling.classList.toggle("hidden");

orderList.appendChild(card);
});
}
orderSearch.oninput=e=>renderOrders(e.target.value);
renderOrders();

// initial updateCounts call removed; counts populated from storage or fetch results

