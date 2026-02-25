import { formatCurrencyFromCents } from '../utils/formatPrice.js';

export async function loadProducts() {
    try {
      // Try to get access token via /refresh (cookies included)
      let token = null;
      try {
        const r = await fetch('https://nilemarket-igqk.onrender.com/refresh', { credentials: 'include' });
        if (r.ok) {
          const d = await r.json();
          token = d?.accessToken || null;
          if (token) localStorage.setItem('accessToken', token);
        }
      } catch (e) {
        console.warn('Refresh failed, falling back to local token', e);
      }

      // Fallback to any token already stored
      if (!token) token = localStorage.getItem('accessToken');

      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};

      const response = await fetch('https://nilemarket-igqk.onrender.com/products', { headers });

      if (!response.ok) {
        console.error('Failed to fetch products:', response.status, response.statusText);
        // optionally show message on page
        document.querySelector('.container').innerHTML = '<p style="color:#a00">Failed to load products. Check console.</p>';
        return;
      }

      // parse JSON safely
      const products = await response.json();

      if (!Array.isArray(products)) {
        console.warn('products response not an array', products);
        document.querySelector('.container').innerHTML = '<p>No products found.</p>';
        return;
      }

      let container = '';
      // Show newest products first without mutating original array
      products.slice().reverse().forEach((product) => {
        container += `
         <div class="product-container">
        <div class="image-container">
          <div class="product-image">
          <img src="${product.image}">
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
             <button class="add-to-cart js-add-to-cart-btn">Add-to-cart</button>
           </div>
        </div>
       </div>
        `;
      });

      document.querySelector('.js-main').innerHTML = container;

    } catch (error) {
      console.error('Error fetching products:', error);
      document.querySelector('.js-main').innerHTML = '<p style="color:#a00">Error loading products. See console.</p>';
    }
  }