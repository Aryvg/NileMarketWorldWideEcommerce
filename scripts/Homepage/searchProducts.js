import { formatCurrencyFromCents } from '../utils/formatPrice.js';

export async function searchProducts(query) {
  try {
    let token = null;
    try {
      const r = await fetch('https://nilemarket-igqk.onrender.com/refresh', { credentials: 'include' });
      if (r.ok) {
        const d = await r.json();
        token = d?.accessToken || null;
        if (token) localStorage.setItem('accessToken', token);
      }
    } catch (e) {}
    if (!token) token = localStorage.getItem('accessToken');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    // Use backend search endpoint
    const response = await fetch(`https://nilemarket-igqk.onrender.com/products/search?name=${encodeURIComponent(query)}`, { headers });
    if (!response.ok) {
      document.querySelector('.js-main').innerHTML = '<p style="color:#a00">Failed to load products. Check console.</p>';
      return;
    }
    const products = await response.json();
    if (!products || products.length === 0) {
      document.querySelector('.js-main').innerHTML = '<p style="color:#a00">Product not found.</p>';
      return;
    }
    let container = '';
    products.forEach((product) => {
      container += `
       <div class="product-container">
      <div class="image-container">
              <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
              </div>
      </div>
      <div class="product-description">
         <div class="product-name">
            ${product.name}
         </div>
         <div class="product-price">
           $${formatCurrencyFromCents(product.priceCents)}
         </div>
         <div class="Quantity-selection">
           <select>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
           </select>
           <button class="add-to-cart">Add-to-cart</button>
         </div>
      </div>
     </div>
      `;
    });
    document.querySelector('.js-main').innerHTML = container;
  } catch (error) {
    document.querySelector('.js-main').innerHTML = '<p style="color:#a00">Error loading products. See console.</p>';
  }
}