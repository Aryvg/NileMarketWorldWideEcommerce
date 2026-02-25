import { formatCurrencyFromCents } from '../utils/formatPrice.js';

export async function loadDeliveryDate() {
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
    const deliveryDate = await response.json();

    if (!Array.isArray(deliveryDate)) {
      console.warn('Employees response not an array', cartContainer);
      document.querySelector('.container').innerHTML = '<p>No employees found.</p>';
      return;
    }

    let container = '';
    deliveryDate.forEach((date) => {
      const oneDay = date.oneDay || { date: 'N/A', priceCents: 0 };
      const threeDay = date.threeDay || { date: 'N/A', priceCents: 0 };
      const sevenDay = date.sevenDay || { date: 'N/A', priceCents: 0 };
      container += `
          <div class="delivery-options">
                  <div class="delivery-option">
                    Choose a delivery date for <span class="sna">${date.name}</span>
                  </div>
                <div class="delivery-rate">
                 <div class="delivered-on">
                   <div>
                     <input name="delivery-date" checked class="inputradio" type="radio">
                   </div>
                   <div class="dates">
                     <div class="date">${sevenDay.date}</div>
                     <div class="date-price">$${formatCurrencyFromCents(sevenDay.priceCents)}</div>
                   </div>
                </div>
                <div class="delivered-on">
                 <div>
                   <input  class="inputradio" type="radio" name="delivery-date">
                 </div>
                 <div class="dates">
                   <div class="date">${threeDay.date}</div>
                   <div class="date-price">$${formatCurrencyFromCents(threeDay.priceCents)}</div>
                 </div>
              </div>
              <div class="delivered-on">
               <div>
                 <input name="delivery-date" class="inputradio" type="radio">
               </div>
               <div class="dates">
                 <div class="date">${oneDay.date}</div>
                 <div class="date-price">$${formatCurrencyFromCents(oneDay.priceCents)}</div>
               </div>
            </div>
                </div>
             </div>
        `;
    });

    document.querySelector('.delivery-options-container').innerHTML = container;

  } catch (error) {
    console.error('Error fetching cartContainer:', error);
    document.querySelector('.delivery-options-container').innerHTML = '<p style="color:#a00">Error loading employees. See console.</p>';
  }


}