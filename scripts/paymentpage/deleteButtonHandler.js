// This code sets up event delegation for delete buttons in the cart.
// When a .js-delete-btn is clicked, it removes the product from the DOM and cachedCartData,
// and sends a DELETE request to the backend to remove the item from the cart.
export function setupDeleteButtonHandler() {
  document.querySelector('.pro-container').addEventListener('click', async function (e) {
    const delBtn = e.target.closest('.js-delete-btn');
    if (delBtn) {
      // Find the product div and its id
      const productDiv = delBtn.closest('.payment-product');
      if (!productDiv) return;
      const productId = productDiv.id;
      if (!productId) return;

      // Remove from DOM immediately
      productDiv.remove();

      // Remove from cachedCartData
      window.cachedCartData = window.cachedCartData.filter(item => item._id !== productId);

      // Send DELETE request to backend and wait for it to complete before recalculating
      try {
        await fetch('https://nilemarket-igqk.onrender.com/cart', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('accessToken') ? { 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') } : {})
          },
          body: JSON.stringify({ id: productId })
        });
      } catch {
        // ignore network errors
      }

      // if cache is now empty update count immediately so user sees 0 without needing summary
      if (window.cachedCartData.length === 0) {
        const mid = document.querySelector('.js-middle-section');
        if (mid) mid.innerHTML = `<div class="items">Items selected <span class="quan">0</span></div>`;
      }

      // Update payment summary view (MVC: update view after model changes)
      import('./paymentSummary.js').then(mod => mod.paymentSummary());
    }
  });
}
