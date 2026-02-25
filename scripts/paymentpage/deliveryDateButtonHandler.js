// This code sets up event delegation for delivery date buttons in the cart.
// When a ".js-delivery-date" button is clicked, it finds the corresponding product in window.cachedCartData,
// renders delivery options for that product, and displays the delivery options modal.
import { renderDeliveryOptions } from './renderDeliveryOptions.js';

export function setupDeliveryDateButtonHandler() {
  document.querySelector('.pro-container').addEventListener('click', function (e) {
    const btn = e.target.closest('.js-delivery-date');
    if (btn) {
      const productId = btn.dataset.productId;
      const product = window.cachedCartData.find(item => item._id === productId);
      if (product) {
        document.querySelector('.delivery-options-container').innerHTML = renderDeliveryOptions(product);
        document.querySelector('.sixth-contained').style.display = 'block';
      }
    }
  });
}
