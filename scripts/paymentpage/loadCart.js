import { formatCurrencyFromCents } from '../utils/formatPrice.js';

export async function loadCart() {
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

    const response = await fetch('https://nilemarket-igqk.onrender.com/cart', { headers });

    if (!response.ok) {
      console.error('Failed to fetch employees:', response.status, response.statusText);
      // optionally show message on page
      document.querySelector('.container').innerHTML = '<p style="color:#a00">Failed to load employees. Check console.</p>';
      return;
    }

    // parse JSON safely
    const cartContainer = await response.json();

    if (!Array.isArray(cartContainer)) {
      console.warn('Employees response not an array', cartContainer);
      document.querySelector('.container').innerHTML = '<p>No employees found.</p>';
      return;
    }

    let container = '';
    cartContainer.forEach((cart) => {
      // compute which date to show (selectedDelivery preferred, then sevenDay, then fallback)
      let displayDate;
      if (cart.selectedDelivery && cart[cart.selectedDelivery] && cart[cart.selectedDelivery].date) {
        displayDate = cart[cart.selectedDelivery].date;
      } else if (cart.sevenDay && cart.sevenDay.date) {
        displayDate = cart.sevenDay.date;
      } else {
        displayDate = cart.date || '';
      }

      container += `
          <div class="payment-product">
            <div class="delete">Delete</div>
            <div class="container">
             <div class="image-containers">
               <img src="${cart.image}">
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