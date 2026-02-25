// dayjs is loaded globally from CDN in track.html
import { formatCurrencyNumber } from '../utils/formatPrice.js';

export async function loadTrack() {
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

      const response = await fetch('https://nilemarket-igqk.onrender.com/orders', { headers });

      if (!response.ok) {
        console.error('Failed to fetch orders:', response.status, response.statusText);
        // optionally show message on page
        document.querySelector('.track-mains').innerHTML = '<p style="color:#a00">Failed to load orders. Check console.</p>';
        return;
      }

      // parse JSON safely
      const orders = await response.json();

      // Update .t spans in .sl-div with totals
      const tSpans = document.querySelectorAll('.sl-div .t');
      if (!Array.isArray(orders)) {
        console.warn('orders response not an array', orders);
        document.querySelector('.track-mains').innerHTML = '<p>No orders found.</p>';
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
      if (tSpans.length >= 2) {
        tSpans[0].textContent = totalItems;
        tSpans[1].textContent = `$${formatCurrencyNumber(totalSpent)}`;
      }

      // Find the productId to track
      const trackProductId = localStorage.getItem('trackProductId');
      let trackedProduct = null;
      let trackedOrder = null;
      for (const order of orders) {
        if (Array.isArray(order.product)) {
          for (const prod of order.product) {
            if (prod.productId === trackProductId) {
              trackedProduct = prod;
              trackedOrder = order;
              break;
            }
          }
        }
        if (trackedProduct) break;
      }
      let container = '';
      if (trackedProduct && trackedOrder) {
        // Calculate total: price * quantity

        const total = (trackedProduct.price * trackedProduct.quantity).toFixed(2);
        // Parse dates correctly
        const today = dayjs();
        const orderTime = dayjs(trackedOrder.date);
        const deliveryTime = dayjs(trackedProduct.deliveryDate);
        //added
        // Show values for debugging
        console.log('today:', today.format('YYYY-MM-DD'));
        console.log('orderTime:', orderTime.format('YYYY-MM-DD'));
        console.log('deliveryTime:', deliveryTime.format('YYYY-MM-DD'));

        let percentProgress = 0;
        if (deliveryTime.isValid() && orderTime.isValid()) {
          const totalDuration = deliveryTime.diff(orderTime, 'day');
          const elapsed = today.diff(orderTime, 'day');
          if (totalDuration > 0) {
            percentProgress = (elapsed / totalDuration) * 100;
            percentProgress = Math.max(0, Math.min(percentProgress, 100));
          } else {
            percentProgress = 100;
          }
        } else {
          percentProgress = 0;
        }

       //added
        container += `
          <div class="tracked">Track your order</div>
      <div class="track-headers">
        <div class="arrived">Reaching on ${trackedProduct.deliveryDate}</div>
        <div class="Quantity">Quantity: ${trackedProduct.quantity}</div>
        <div class="Quantity">Total:$${formatCurrencyNumber(total)}</div>
      </div>
      <div class="track-main">
        <div class="con">
          <div class="track-image-container">
            <div class="track-image">
            <img src="${trackedProduct.image}">
            </div>
           </div>
           <div class="product-name">
            ${trackedProduct.name}
           </div>
        </div>
        <div class="table">
          <div class="provided">
            <div class="prod">
             Provided by:
            </div>
            <div class="by">
              ${trackedOrder.shippingAddress?.fullName || 'Unknown'}
            </div>
          </div>
          <div class="provided">
           <div class="prod">
             Shipping method:
           </div>
           <div class="by">
              Express
           </div>
         </div>


        <div class="timeline">
          <div class="prod">Delivery progress:</div>
          <div class="delivery-pro">
            <div class="progress">
              <div class="pl1
              ${percentProgress<50 ?'current-status' :''}
              ">
                Order placed
              </div>
              <div class="pl1
              ${percentProgress>=50 && percentProgress<95.8 ?'current-status' :''}
              ">
                Dispatched
              </div>
              <div class="pl1
              ${percentProgress>=95.8 ?'current-status' :''}
              ">
                Delivered
              </div>
            </div>
            <div class="progress-bar" style="width:100%">
              <div class="inside"
              style="margin-left:min(${percentProgress}%, 93%);"
              ></div>
            </div>
          </div>


        </div>
      </div>
        `;
      } else {
        container = '<p style="color:#a00">No tracked product found.</p>';
      }
      document.querySelector('.track-mains').innerHTML = container;

    } catch (error) {
      console.error('Error fetching orders:', error);
      document.querySelector('.track-mains').innerHTML = '<p style="color:#a00">Error loading orders. See console.</p>';
    }
  }