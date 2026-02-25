// This code handles the logic for the 'Done' button in the delivery options modal.
// When clicked, it hides the modal, finds the selected delivery date and product, updates the UI,
// and sends a PUT request to update the backend with the new delivery date for the product.
export function setupDoneButtonHandler() {
  const doneBtn = document.querySelector('.js-done');
  if (!doneBtn) return;
  doneBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Hide the delivery options modal
    document.querySelector('.sixth-contained').style.display = 'none';

    // Find the selected radio button and its date
    const selectedRadio = document.querySelector('.delivery-options-container .inputradio:checked');
    if (!selectedRadio) return;
    const dateElem = selectedRadio.closest('.delivered-on')?.querySelector('.date');
    if (!dateElem) return;
    const selectedDate = dateElem.textContent.trim();

    // Find the product name from the delivery options
    const productNameElem = document.querySelector('.delivery-options-container .sna');
    if (!productNameElem) return;
    const productName = productNameElem.textContent.trim();


    // Find the product in cachedCartData
    const product = window.cachedCartData.find(item => item.name === productName);
    if (!product) return;

    // Determine which delivery option was selected and update model
    let selectedKey = null;
    if (product.oneDay && product.oneDay.date === selectedDate) selectedKey = 'oneDay';
    if (product.threeDay && product.threeDay.date === selectedDate) selectedKey = 'threeDay';
    if (product.sevenDay && product.sevenDay.date === selectedDate) selectedKey = 'sevenDay';
    if (selectedKey) {
      product.selectedDelivery = selectedKey;
      // Persist selection in localStorage for this product
      let deliveryPrefs = {};
      try {
        deliveryPrefs = JSON.parse(localStorage.getItem('deliveryPrefs') || '{}');
      } catch {}
      deliveryPrefs[product._id] = selectedKey;
      localStorage.setItem('deliveryPrefs', JSON.stringify(deliveryPrefs));
    }

    // Update the delivery date text in the payment product
    const productDiv = document.getElementById(product._id);
    if (productDiv) {
      const deliveryDateElem = productDiv.querySelector('.delivery-date');
      if (deliveryDateElem) {
        deliveryDateElem.textContent = `Reaching you on ${selectedDate}`;
      }
    }

    // Send PUT request to update the backend
    fetch('https://nilemarket-igqk.onrender.com/cart', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('accessToken') ? { 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') } : {})
      },
      body: JSON.stringify({ id: product._id, date: selectedDate })
    }).catch(() => {});

    // Update payment summary view (MVC: update view after model changes)
    import('./paymentSummary.js').then(mod => mod.paymentSummary());
  });
}
