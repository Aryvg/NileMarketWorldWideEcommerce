import { formatCurrencyFromCents } from '../utils/formatPrice.js';

export async function paymentSummary() {
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
      document.querySelector('.payment-description').innerHTML = '<p style="color:#a00">Failed to load employees. Check console.</p>';
      return;
    }
    const cartContainer = await response.json();
    window.cachedCartData = Array.isArray(cartContainer) ? cartContainer : [];
    // restore previously chosen delivery options from localStorage
    let deliveryPrefs = {};
    try {
      deliveryPrefs = JSON.parse(localStorage.getItem('deliveryPrefs') || '{}');
    } catch { }
    window.cachedCartData.forEach(cart => {
      if (deliveryPrefs[cart._id]) {
        cart.selectedDelivery = deliveryPrefs[cart._id];
      }
    });
    // Aggregate values for the entire cart
    let totalItems = 0;
    let totalItemsPriceCents = 0;
    let totalShippingCents = 0;

    window.cachedCartData.forEach((cart) => {
      const quantity = cart.quantity || 0;
      totalItems += quantity;
      totalItemsPriceCents += (cart.priceCents || 0) * quantity;

      // Determine selected delivery price for this product; default to sevenDay (free) when no
      // explicit choice has been made. The price is in cents.
      let shippingPrice = 0;
      if (cart.selectedDelivery && cart[cart.selectedDelivery] && typeof cart[cart.selectedDelivery].priceCents === 'number') {
        shippingPrice = cart[cart.selectedDelivery].priceCents;
      } else if (cart.sevenDay && typeof cart.sevenDay.priceCents === 'number') {
        shippingPrice = cart.sevenDay.priceCents;
      } else if (cart.threeDay && typeof cart.threeDay.priceCents === 'number') {
        shippingPrice = cart.threeDay.priceCents;
      } else if (cart.oneDay && typeof cart.oneDay.priceCents === 'number') {
        shippingPrice = cart.oneDay.priceCents;
      }

      // multiply shipping by this product's quantity (not totalItems)
      totalShippingCents += shippingPrice * quantity;
    });

    const totalBeforeTaxCents = totalItemsPriceCents + totalShippingCents;
    const taxCents = Math.round(totalBeforeTaxCents * 0.10);
    const orderTotalCents = totalBeforeTaxCents + taxCents;
    document.querySelector('.js-middle-section').innerHTML = `
     <div class="items">Items selected <span class="quan">${totalItems}</span></div>
    `;
    document.querySelector('.telebirx-amount-box').innerHTML = `
    Pay <span>$${formatCurrencyFromCents(orderTotalCents)}</span>`;

    const container = `
      <div class="pay-item">
        <div class="ite">
          Items(${totalItems})
        </div>
        <div class="itep">
          $${formatCurrencyFromCents(totalItemsPriceCents)}
        </div>
      </div>
      <div class="pay-item">
        <div class="ite">
          Price for shipping
        </div>
        <div class="itep">
          $${formatCurrencyFromCents(totalShippingCents)}
        </div>
      </div>
      <div class="pay-item">
        <div class="ite">
          Total before tax
        </div>
        <div class="itep ites">
          $${formatCurrencyFromCents(totalBeforeTaxCents)}
        </div>
      </div>
      <div class="underlines"></div>
      <div class="pay-item">
        <div class="ite">
          Estimated Tax(10%)
        </div>
        <div class="itep">
          $${formatCurrencyFromCents(taxCents)}
        </div>
      </div>
      <div class="underline"></div>
      <div class="pay-item">
        <div class="ite">
          Order Total
        </div>
        <div class="itep">
          $${formatCurrencyFromCents(orderTotalCents)}
        </div>
      </div>
    `;
    document.querySelector('.payment-description').innerHTML = container;
  } catch (error) {
    console.error('Error fetching cartContainer:', error);
    document.querySelector('.payment-description').innerHTML = `<div class="pay-item">
      <div class="ite">Items(0)</div>
      <div class="itep">$0.00</div>
    </div>
    <div class="pay-item">
      <div class="ite">Price for shipping</div>
      <div class="itep">$0.00</div>
    </div>
    <div class="pay-item">
      <div class="ite">Total before tax</div>
      <div class="itep ites">$0.00</div>
    </div>
    <div class="underlines"></div>
    <div class="pay-item">
      <div class="ite">Estimated Tax(10%)</div>
      <div class="itep">$0.00</div>
    </div>
    <div class="underline"></div>
    <div class="pay-item">
      <div class="ite">Order Total</div>
      <div class="itep">$0.00</div>
    </div>`;
  }
}