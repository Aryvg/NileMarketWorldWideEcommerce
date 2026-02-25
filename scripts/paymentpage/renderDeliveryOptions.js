import { formatCurrencyFromCents } from '../utils/formatPrice.js';

export function renderDeliveryOptions(product) {
  const oneDay = product.oneDay || { date: 'N/A', priceCents: 0 };
  const threeDay = product.threeDay || { date: 'N/A', priceCents: 0 };
  const sevenDay = product.sevenDay || { date: 'N/A', priceCents: 0 };
  const priceText = p => p.priceCents === 0 ? 'FREE' : `$${formatCurrencyFromCents(p.priceCents)}`;
  // Determine which delivery option should be checked, using localStorage if available
  let checked = {
    oneDay: false,
    threeDay: false,
    sevenDay: false
  };
  let deliveryPrefs = {};
  try {
    deliveryPrefs = JSON.parse(localStorage.getItem('deliveryPrefs') || '{}');
  } catch {}
  let selected = product.selectedDelivery || deliveryPrefs[product._id] || 'sevenDay';
  checked[selected] = true;

  return `
    <div class="delivery-options">
      <div class="delivery-option">
        Choose a delivery date for <span class="sna">${product.name}</span>
      </div>
      <div class="delivery-rate">
        <div class="delivered-on">
          <div>
            <input name="delivery-date" class="inputradio" type="radio" ${checked.oneDay ? 'checked' : ''}>
          </div>
          <div class="dates">
            <div class="date">${oneDay.date}</div>
            <div class="date-price">${priceText(oneDay)}</div>
          </div>
        </div>
        <div class="delivered-on">
          <div>
            <input class="inputradio" type="radio" name="delivery-date" ${checked.threeDay ? 'checked' : ''}>
          </div>
          <div class="dates">
            <div class="date">${threeDay.date}</div>
            <div class="date-price">${priceText(threeDay)}</div>
          </div>
        </div>
        <div class="delivered-on">
          <div>
            <input name="delivery-date" class="inputradio" type="radio" ${checked.sevenDay ? 'checked' : ''}>
          </div>
          <div class="dates">
            <div class="date">${sevenDay.date}</div>
            <div class="date-price">${priceText(sevenDay)}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}