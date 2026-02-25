// This function fetches the user's cart from the backend, handling authentication via access token (refreshing if needed),
// caches the cart data in window.cachedCartData, and renders the cart items into the .pro-container element. It also handles errors gracefully.
import { formatCurrencyFromCents } from '../utils/formatPrice.js';

window.loadCart = async function() {
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

    if (!token) token = localStorage.getItem('accessToken');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    const response = await fetch('https://nilemarket-igqk.onrender.com/cart', { headers });
    if (!response.ok) {
      document.querySelector('.container').innerHTML = '<p style="color:#a00">Failed to load employees. Check console.</p>';
      return;
    }
    const cartContainer = await response.json();
    window.cachedCartData = Array.isArray(cartContainer) ? cartContainer : [];
    // Restore selectedDelivery from localStorage if present
    let deliveryPrefs = {};
    try {
      deliveryPrefs = JSON.parse(localStorage.getItem('deliveryPrefs') || '{}');
    } catch {}
    window.cachedCartData.forEach(cart => {
      if (deliveryPrefs[cart._id]) cart.selectedDelivery = deliveryPrefs[cart._id];
    });
    let container = '';
    window.cachedCartData.forEach((cart) => {
      // decide what delivery date text to show
      let displayDate;
      // if user has explicitly selected a delivery preference, use it
      if (cart.selectedDelivery && cart[cart.selectedDelivery] && cart[cart.selectedDelivery].date) {
        displayDate = cart[cart.selectedDelivery].date;
      } else if (cart.sevenDay && cart.sevenDay.date) {
        // default to seven-day date when nothing has been chosen yet
        displayDate = cart.sevenDay.date;
      } else {
        // fallback to the generic date field (creation or previously stored)
        displayDate = cart.date || '';
      }

      container += `
          <div class="payment-product" id="${cart._id}">
            <div class="delete js-delete-btn">Delete</div>
            <div class="container">
             <div class="image-containers">
                <div class="product-images">
               <img src="${cart.image}">
               </div>
              </div>
              <div class="payments-product" style="background-color:rgb(204, 204, 204);">
               <div class="payment-product-details">
                 <div class="delivery-date">
                   Reaching you on ${displayDate}
                 </div>
                 <div class="product-name">
                   ${cart.name}
                  </div>
                  <div class="product-price">
                    $${formatCurrencyFromCents(cart.priceCents)}
                  </div>
                  <div class="product-quantity">
                    Quantity:<span class="quant">${cart.quantity}</span>
                 </div>
                 <div class="delivery-button">
                  <button class="deliverbut js-delivery-date js-delivery-date-${cart._id}" data-product-id="${cart._id}">Choose delivery date</button>
                 </div>
                </div>
              </div>
            </div>
          </div>
        `;
    });
    document.querySelector('.pro-container').innerHTML = container;
  } catch (error) {
    console.error('Error fetching cartContainer:', error);
    document.querySelector('.container').innerHTML = '<p style="color:#a00">Error loading employees. See console.</p>';
  }
}
