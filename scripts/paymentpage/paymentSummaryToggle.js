// This code handles toggling the payment summary section open and closed.
// When the .js-payment-summary button is clicked, it toggles the text, shows/hides the payment description,
// and adds/removes the 'paid' class for styling.
export function setupPaymentSummaryToggle() {
  const paid = document.querySelector('.js-payment-summary');
  const paymentDescription = document.querySelector('.js-payment-description');
  if (!paid || !paymentDescription) return;
  paid.addEventListener('click', () => {
    if (paid.innerText === 'Open your payment Summary') {
      paid.innerText = 'Close your payment Summary';
      paymentDescription.style.display = 'block';
      paid.classList.add('paid');
    } else if (paid.innerText === 'Close your payment Summary') {
      paid.innerText = 'Open your payment Summary';
      paymentDescription.style.display = 'none';
      paid.classList.remove('paid');
    }
  });
}
