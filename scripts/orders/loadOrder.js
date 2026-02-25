import { buyAgain } from "./buyAgain.js";
import { updateCartBtnCount } from "../Homepage/updateCartBtnCount.js";
import { formatCurrencyNumber } from '../utils/formatPrice.js';

export async function loadOrder(searchTerm) {
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

    // build URL with optional search parameter
    let url = 'https://nilemarket-igqk.onrender.com/orders';
    if (searchTerm && typeof searchTerm === 'string') {
      url += '?productName=' + encodeURIComponent(searchTerm.trim());
    }

    const response = await fetch(url, { headers });

    // if backend returned 204 there are no matching orders
    if (response.status === 204) {
      const out = document.querySelector('.js-order');
      if (out) out.innerHTML = '<div class="no-search-results">' + (searchTerm ? 'Order not found' : 'No orders found.') + '</div>';
      const tSpans = document.querySelectorAll('.sl-div .t');
      if (tSpans.length >= 2) {
        tSpans[0].textContent = '0';
        tSpans[1].textContent = '$0';
      }
      return;
    }

    if (!response.ok) {
      console.error('Failed to fetch orders:', response.status, response.statusText);
      const out = document.querySelector('.js-order');
      if (out) out.innerHTML = '<p style="color:#a00">Failed to load orders. Check console.</p>';
      return;
    }

    // parse JSON safely
    const orders = await response.json();

    if (!Array.isArray(orders)) {
      console.warn('Orders response not an array', orders);
      const out = document.querySelector('.js-order');
      if (out) out.innerHTML = '<div class="no-search-results">' + (searchTerm ? 'Order not found' : 'No orders found.') + '</div>';
      const tSpans = document.querySelectorAll('.sl-div .t');
      if (tSpans.length >= 2) {
        tSpans[0].textContent = '0';
        tSpans[1].textContent = '$0';
      }
      return;
    }

    // Calculate total items and total spent
    let totalItems = 0;
    let totalSpent = 0;
    orders.forEach(order => {
      if (Array.isArray(order.product)) {
        order.product.forEach(item => {
          totalItems += Number(item.quantity) || 0;
        });
      }
      if (order.Total) {
        totalSpent += Number(order.Total) || 0;
      }
    });

    let container = '';
    // Render newest orders first: iterate a reversed copy so original array isn't mutated
    orders.slice().reverse().forEach((order) => {
      // ...existing code for rendering orders...
      // header for each order
      container += `
        <div class="orders-header">
          <div class="order-header js-your-order">Your order</div>
          <div class="order-header js-order-detail">Order details</div>
        </div>
      `;
      // products inside the order
      if (Array.isArray(order.product)) {
        order.product.forEach(item => {
          // derive a priceCents value from whatever data we have
          const itemPriceCents = item.price != null
            ? Math.round(item.price * 100)
            : (item.total != null && item.quantity
                ? Math.round((item.total / item.quantity) * 100)
                : 0);

          container += `
            <div class="order-details js-order-details">
              <div class="order-description">
                <div id="image" class="image-containerd">
                  <div class="order-image">
                  <img src="${item.image}">
                  </div>
                </div>
                <div class="ord">
                  <div id="name" class="product-name">${item.name}</div>
                  <div class="product-quantity">Quantity:<span id="quantity" class="quant">${item.quantity}</span></div>
                  <div class="but">
                    <div class="buy-but">
                      <button class="buy-again-button js-buy-again-button" 
                        data-name="${item.name}"
                        data-image="${item.image}"
                        data-price-cents="${itemPriceCents}"
                        ${item.oneDay ? `data-one-day='${JSON.stringify(item.oneDay)}'` : ''}
                        ${item.threeDay ? `data-three-day='${JSON.stringify(item.threeDay)}'` : ''}
                        ${item.sevenDay ? `data-seven-day='${JSON.stringify(item.sevenDay)}'` : ''}
                      >Buy it again</button>
                    </div>
                    <a href="track.html" class="track-order">
                      <button class="track-package" data-product-id="${item.productId}">Track order</button>
                    </a>
                  </div>
                </div>
                <div class="order-option">
                  <div class="placed"><span class="for">Bought on:</span> ${order.date}</div>
                  <div class="placed"><span class="for">Total:</span> $${formatCurrencyNumber(order.Total)}</div>
                  <div class="placed"><span class="for">OrderId:</span>:${order.orderId}</div>


                 <div class="shipped-to-box">
                    <div>Shipped To:</div>
                    <div>Full Name:</span> <span style="color:#445;">${order.shippingAddress?.fullName || '-'}</span></div>
                    <div>Country:</span> <span style="color:#444;">${order.shippingAddress?.country || '-'}</span></div>
                    <div>City:</span> <span style="color:#444;">${order.shippingAddress?.city || '-'}</span></div>
                    <div><span style="color:#222;font-weight:500;">Subcity:</span> <span style="color:#444;">${order.shippingAddress?.subCity || '-'}</span></div>
                  </div>


              </div>
            </div>
          </div>
          `;
        });
      }
    });

    const out = document.querySelector('.js-order');
    if (out) {
      out.innerHTML = container;
      // update cart count badge
      const cartBtn = document.querySelector('.button-size');
      updateCartBtnCount(cartBtn);
      // update the .t spans in .sl-div
      const tSpans = document.querySelectorAll('.sl-div .t');
      if (tSpans.length >= 2) {
        tSpans[0].textContent = totalItems;
        tSpans[1].textContent = `$${formatCurrencyNumber(totalSpent)}`;
      }
      // attach listeners for every buy-again button that was just inserted
      out.querySelectorAll('.js-buy-again-button').forEach(btn => {
        btn.addEventListener('click', async () => {
          const name = btn.dataset.name || '';
          // always add a single unit when clicking again
          const quantity = 1;
          const image = btn.dataset.image || '';
          const priceCents = parseInt(btn.dataset.priceCents, 10) || 0;
          let oneDay, threeDay, sevenDay;
          try { oneDay = btn.dataset.oneDay ? JSON.parse(btn.dataset.oneDay) : undefined; } catch {};
          try { threeDay = btn.dataset.threeDay ? JSON.parse(btn.dataset.threeDay) : undefined; } catch {};
          try { sevenDay = btn.dataset.sevenDay ? JSON.parse(btn.dataset.sevenDay) : undefined; } catch {};
          const originalText = btn.textContent;
          const success = await buyAgain({ name, quantity, image, priceCents, oneDay, threeDay, sevenDay });
          if (success) {
            // update badge when item added
            updateCartBtnCount(cartBtn);
            btn.textContent = 'Added';
            setTimeout(() => {
              btn.textContent = originalText;
            }, 1000);
          }
        });
      });
      // attach listeners for track order buttons
      out.querySelectorAll('.track-package').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const productId = btn.dataset.productId;
          if (productId) {
            localStorage.setItem('trackProductId', productId);
          }
        });
      });
    }

  } catch (error) {
    console.error('Error fetching orders:', error);
    const out = document.querySelector('.js-order');
    if (out) out.innerHTML = '<p style="color:#a00">Error loading orders. See console.</p>';
  }
}






// Define the async function separately



// Call the function on button click




/**
 <div class="shipped-to-box" style="background:#f7f8fa;border-radius:10px;padding:14px 18px;margin:6px 0 0 0;box-shadow:0 2px 8px rgba(0,0,0,0.04);max-width:340px;">
                    <div style="font-weight:600;color:#1a73e8;margin-bottom:7px;font-size:1.08em;">Shipped To:</div>
                    <div style="margin-bottom:5px;"><span style="color:#222;font-weight:500;">Full Name:</span> <span style="color:#444;">${order.shippingAddress?.fullName || '-'}</span></div>
                    <div style="margin-bottom:5px;"><span style="color:#222;font-weight:500;">Country:</span> <span style="color:#444;">${order.shippingAddress?.country || '-'}</span></div>
                    <div style="margin-bottom:5px;"><span style="color:#222;font-weight:500;">City:</span> <span style="color:#444;">${order.shippingAddress?.city || '-'}</span></div>
                    <div><span style="color:#222;font-weight:500;">Subcity:</span> <span style="color:#444;">${order.shippingAddress?.subCity || '-'}</span></div>
                  </div>
 */
/**
 <div class="shipped-to-box">
                    <div>Shipped To:</div>
                    <div>Full Name:</span> <span style="color:#444;">${order.shippingAddress?.fullName || '-'}</span></div>
                    <div>Country:</span> <span style="color:#444;">${order.shippingAddress?.country || '-'}</span></div>
                    <div>City:</span> <span style="color:#444;">${order.shippingAddress?.city || '-'}</span></div>
                    <div><span style="color:#222;font-weight:500;">Subcity:</span> <span style="color:#444;">${order.shippingAddress?.subCity || '-'}</span></div>
                  </div>
 */