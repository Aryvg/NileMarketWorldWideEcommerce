import './loadCartFunction.js';
import { setupDeliveryDateButtonHandler } from './deliveryDateButtonHandler.js';
import { loadDeliveryDate } from './loadDeliveryDate.js';
import { paymentSummary } from './paymentSummary.js';
import { setupPaymentSummaryToggle } from './paymentSummaryToggle.js';
import { setupDoneButtonHandler } from './doneButtonHandler.js';
import { setupDeleteButtonHandler } from './deleteButtonHandler.js';
import { placeOrder } from './postOrder.js';
window.addEventListener('DOMContentLoaded', () => {
  // cache the original Telebir payment markup so we can restore it later if
  // the user completes the full flow and comes back again
  const telebirEl = document.querySelector('.telebir-payment');
  window.initialTelebirHTML = telebirEl ? telebirEl.innerHTML : '';

  // always load cart data regardless of payment/shipping state
  if (typeof window.loadCart === 'function') {
    window.loadCart();
  } else {
    loadCart();
  }

  // Use per-user payment state
  const username = localStorage.getItem('currentUsername') || '';
  const paymentSuccess = localStorage.getItem('paymentSuccess_' + username) === 'true';
  const shippingDone = localStorage.getItem('shippingCompleted_' + username) === 'true';
  if (paymentSuccess && !shippingDone) {
    showSuccessCard();
    // make sure container is visible and navigation is locked
    document.querySelector('.telebir-payment').style.display = 'block';
    disableBackNavigation();
  }

  // populate country dropdown used in shipping form
  populateCountrySelect();
});

loadDeliveryDate();
// Helper to render delivery options for a single product
// Cache cart data for use in delivery date selection
window.cachedCartData = [];

// *** state helpers for the post-payment flow ***
// list of countries used to populate shipping form
const COUNTRY_LIST = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia",
  "Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium",
  "Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
  "Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad",
  "Chile","China","Colombia","Comoros","Congo, Republic of the","Congo, Democratic Republic of the","Costa Rica",
  "Côte d’Ivoire","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland",
  "France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau",
  "Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
  "Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Korea, North","Korea, South","Kosovo","Kuwait",
  "Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico",
  "Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal",
  "Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Macedonia","Norway","Oman","Pakistan","Palau",
  "Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda",
  "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
  "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands",
  "Somalia","South Africa","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey",
  "Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
  "Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

function populateCountrySelect() {
  const sel = document.getElementById('countryInput');
  if (!sel) return;
  COUNTRY_LIST.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

function showSuccessCard() {
  const telebir = document.querySelector('.telebir-payment');
  telebir.innerHTML = `<div class="success-card">
      <div class="checkmark">✓</div>
      <h2>Payment Successful</h2>
      <p>Your payment has been completed successfully.</p>
      <p class="small-text">
        To complete your order, please fill your shipping address.
      </p>
      <button class="shipping-btn">Fill Your Shipping Address</button>
  </div>`;
}

let _backListener = null;
function disableBackNavigation() {
  if (_backListener) return; // already disabled
  // push a dummy history state and prevent the user from going back
  _backListener = () => {
    window.history.pushState(null, '', window.location.href);
  };
  window.history.pushState(null, '', window.location.href);
  window.addEventListener('popstate', _backListener);
}
function enableBackNavigation() {
  if (!_backListener) return;
  window.removeEventListener('popstate', _backListener);
  _backListener = null;
}

// Set up event delegation for delivery date buttons
setupDeliveryDateButtonHandler();

// helper functions for the empty-cart popup
function showEmptyCartModal(message = 'You have not added any product to the cart.') {
  const modal = document.getElementById('emptyCartModal');
  if (!modal) return;
  const p = modal.querySelector('p');
  if (p) p.textContent = message;
  modal.style.display = 'flex';
}

function hideEmptyCartModal() {
  const modal = document.getElementById('emptyCartModal');
  if (!modal) return;
  modal.style.display = 'none';
}

// attach close handler once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('emptyCartClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideEmptyCartModal);
  }
});


document.querySelector('.js-menu').addEventListener('click', () => {
  document.getElementById('123').style.width = "100%";
  document.body.style.paddingTop = '127px'
});
document.querySelector('.js-times').addEventListener('click', () => {
  document.getElementById('123').style.width = "0px";
  document.body.style.paddingTop = '90px'
});

const placeOrderBtn = document.querySelector('.js-place-your-order');
if (placeOrderBtn) {
  placeOrderBtn.addEventListener('click', async () => {
    // ensure we really have items on the server side before showing the
    // payment panel.  relying purely on cache sometimes failed when the
    // cache had stale data or wasn't populated yet.
    let cartItems = [];
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      const res = await fetch('https://nilemarket-igqk.onrender.com/cart', { headers });
      if (res.ok) {
        cartItems = await res.json();
      }
    } catch (e) {
      console.warn('could not refresh cart before placing order', e);
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      showEmptyCartModal();
      return;
    }

    document.querySelector('.telebir-payment').style.display = 'block';
  });
}

// when the user cancels the shipping form we want to keep them on the
// success-card page if payment has already been confirmed
function handleShippingCancel() {
  document.querySelector('.third-contained').style.display = 'none';
  const username = localStorage.getItem('currentUsername') || '';
  const paymentSuccess = localStorage.getItem('paymentSuccess_' + username) === 'true';
  const shippingDone = localStorage.getItem('shippingCompleted_' + username) === 'true';
  if (paymentSuccess && !shippingDone) {
    showSuccessCard();
    document.querySelector('.telebir-payment').style.display = 'block';
    disableBackNavigation();
  }
}

// cancel button inside third-contained
document.querySelector('.js-cancelled').addEventListener('click', handleShippingCancel);
// if you ever re-enable a close arrow it should use the same handler
// document.querySelector('.js-time').addEventListener('click', handleShippingCancel);


document.querySelector('.tm').addEventListener('click', () => {
  document.querySelector('.fourth-contained').style.display = 'none';
});
document.querySelector('.js-cancels').addEventListener('click', () => {
  document.querySelector('.fourth-contained').style.display = 'none';
});

// Set up payment summary toggle functionality
setupPaymentSummaryToggle();

document.querySelector('.ts').addEventListener('click', () => {
  document.querySelector('.sixth-contained').style.display = 'none';
});
document.querySelector('.js-cance').addEventListener('click', () => {
  document.querySelector('.sixth-contained').style.display = 'none';
});

// Set up done button handler for delivery options
setupDoneButtonHandler();


// Set up delete button handler for cart items
setupDeleteButtonHandler();
paymentSummary();

// document.querySelector('.js-next').addEventListener('click', () => {
//   document.querySelector('.fourth-contained').style.display = 'block';
//   document.querySelector('.third-contained').style.display = 'none';
// });


// helper used when the user clicks the "place your order" button on the
// shipping form. returns true if all validations pass; the click handler
// will abort otherwise.
// helper to show message under an input field
function setFieldMsg(id, text, valid) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('success', valid);
  el.classList.toggle('error', !valid);
  el.style.display = 'block';
}

// individual validators for realtime usage
function validateFullNameField() {
  const val = document.getElementById('fullNameInput')?.value.trim();
  if (!val) {
    setFieldMsg('fullNameMsg', 'fill this input', false);
    return false;
  }
  const hasTwo = /^\S+\s+\S+/.test(val);
  setFieldMsg('fullNameMsg', hasTwo ? 'name is valid' : 'name is not valid', hasTwo);
  return hasTwo;
}

function validatePhoneField() {
  const val = document.getElementById('shipPhoneInput')?.value.trim();
  if (!val) {
    setFieldMsg('shippingPhoneMsg', 'fill this input', false);
    return false;
  }
  const validPhone = /^09\d{8}$/.test(val);
  setFieldMsg('shippingPhoneMsg', validPhone ? 'phone is valid' : 'phone is not valid', validPhone);
  return validPhone;
}

function validateCountryField() {
  const val = document.getElementById('countryInput')?.value;
  if (!val) {
    setFieldMsg('countryMsg', 'fill this input', false);
    return false;
  }
  // no further rules for country beyond selection
  setFieldMsg('countryMsg', 'country selected', true);
  return true;
}

function validateCityField() {
  const val = document.getElementById('cityInput')?.value.trim();
  if (!val) {
    setFieldMsg('cityMsg', 'fill this input', false);
    return false;
  }
  const validCity = !/\d/.test(val);
  setFieldMsg('cityMsg', validCity ? 'city looks okay' : 'city is not valid', validCity);
  return validCity;
}

function validateSubCityField() {
  const val = document.getElementById('subCityInput')?.value.trim();
  if (!val) {
    setFieldMsg('subCityMsg', 'fill this input', false);
    return false;
  }
  const validSub = !/\d/.test(val);
  setFieldMsg('subCityMsg', validSub ? 'subcity looks okay' : 'subCity is not valid', validSub);
  return validSub;
}

function validateHouseNoField() {
  const val = document.getElementById('houseNoInput')?.value.trim();
  if (!val) {
    setFieldMsg('houseNoMsg', 'fill this input', false);
    return false;
  }
  const valid = /^[0-9]+$/.test(val);
  setFieldMsg('houseNoMsg', valid ? 'house number is valid' : 'house number must be only number', valid);
  return valid;
}

// main validation used when user clicks the next button
function validateShipping() {
  let okay = true;
  if (!validateFullNameField()) okay = false;
  if (!validatePhoneField()) okay = false;
  if (!validateCountryField()) okay = false;
  if (!validateCityField()) okay = false;
  if (!validateSubCityField()) okay = false;
  if (!validateHouseNoField()) okay = false;
  return okay;
}

// wire up realtime validation listeners
(function setupShippingRealtime() {
  const validators = {
    fullNameInput: validateFullNameField,
    shipPhoneInput: validatePhoneField,
    countryInput: validateCountryField,
    cityInput: validateCityField,
    subCityInput: validateSubCityField,
    houseNoInput: validateHouseNoField
  };

  Object.entries(validators).forEach(([inputId, validator]) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const event = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
    input.addEventListener(event, () => {
      validator();
    });
  });
})();

// SELECT THE BUTTON

document.querySelector('.js-next').addEventListener('click', async (e) => {
  // run shipping validation first
  if (!validateShipping()) {
    e.preventDefault();
    return;
  }

  const success = await placeOrder(e);
  if (!success) {
    // do not clear the payment state; keep the user on the shipping form
    return;
  }
  // after placing an order we assume the process is finished and the user
  // should be able to start over later, so clear the payment state
  const username = localStorage.getItem('currentUsername') || '';
  localStorage.removeItem('paymentSuccess_' + username);
  localStorage.removeItem('shippingCompleted_' + username);
  // re-enable back button behavior that was disabled earlier
  enableBackNavigation();
  // restore telebir markup in case the user opens it again later
  if (window.initialTelebirHTML) {
    const telebirEl = document.querySelector('.telebir-payment');
    telebirEl.innerHTML = window.initialTelebirHTML;
  }
  // show confirmation popup from previous UI (fourth-contained)
  // document.querySelector('.third-contained').style.display = 'none';
  // document.querySelector('.fourth-contained').style.display = 'block';
});



// helper to read the numeric total from the UI
function getTotalPrice() {
  const span = document.querySelector('.telebirx-amount-box span');
  if (!span) return 0;
  const text = span.textContent.replace(/[^0-9.]/g, '');
  const n = parseFloat(text);
  return isNaN(n) ? 0 : n;
}

function payNow() {
  const phone = document.getElementById("phone").value;
  const pin = document.getElementById("pin").value;
  const phoneMsgEl = document.getElementById("phoneMsg");
  const pinMsgEl = document.getElementById("pinMsg");
  const msgEl = document.getElementById("successMsg");

  // clear any previous messages so they don't persist between clicks
  if (msgEl) msgEl.style.display = 'none';
  if (phoneMsgEl) phoneMsgEl.style.display = 'none';
  if (pinMsgEl) pinMsgEl.style.display = 'none';

  // basic empty check
  if (phone === "" || pin === "") {
    msgEl.textContent = "Please fill all fields";
    msgEl.style.color = "red";
    msgEl.style.borderBottom = "1px solid red";
    msgEl.style.display = "block";
    return;
  }

  // phone validity (expects 10 digits starting with 09)
  const phoneValid = /^09\d{8}$/.test(phone);
  if (!phoneValid) {
    phoneMsgEl.textContent = 'Phone number is not valid';
    phoneMsgEl.classList.add('error');
    phoneMsgEl.classList.remove('success');
    phoneMsgEl.style.display = 'block';
    return;
  }

  // pin length requirement
  if (pin.length < 9) {
    pinMsgEl.textContent = 'Pin should be at least 9 characters';
    pinMsgEl.classList.add('error');
    pinMsgEl.classList.remove('success');
    pinMsgEl.style.display = 'block';
    return;
  }

  // pin structural check - characters after the 8th position must match the
  // total price shown on the page
  const total = getTotalPrice();
  const suffix = pin.slice(8);
  // convert to string using same toFixed as displayed (two decimal places)
  const expected = total.toFixed(2).replace(/\.00$/, '');
  if (suffix !== expected) {
    msgEl.textContent = "Wrong PIN. Payment unsuccessful, try again";
    msgEl.style.color = "red";
    msgEl.style.borderBottom = "1px solid red";
    msgEl.style.display = "block";
    return;
  }

  // success path
  msgEl.textContent = "✔ Payment Successful! Redirecting...";
  msgEl.style.color = "green";
  msgEl.style.borderBottom = "";
  msgEl.style.display = "block";

  setTimeout(() => {
    // once payment is confirmed we record that state so it persists
    const username = localStorage.getItem('currentUsername') || '';
    localStorage.setItem('paymentSuccess_' + username, 'true');
    localStorage.setItem('shippingCompleted_' + username, 'false');

    document.querySelector(".telebir-payment").style.display = "none";
    document.querySelector(".third-contained").style.display = "block";
    // lock navigation while user is on shipping form and push a history
    // entry so the back button will return from third-contained to telebir
    disableBackNavigation();
    try { window.history.pushState({ third: true }, '', window.location.href); } catch (e) {}
  }, 2000);
}

// dynamic validation for phone & pin inputs
(function setupFieldValidation() {
  const phoneInput = document.getElementById('phone');
  const pinInput = document.getElementById('pin');
  const phoneMsgEl = document.getElementById('phoneMsg');
  const pinMsgEl = document.getElementById('pinMsg');

  if (phoneInput && phoneMsgEl) {
    phoneInput.addEventListener('input', () => {
      const v = phoneInput.value;
      if (v === '') {
        phoneMsgEl.style.display = 'none';
        return;
      }
      const valid = /^09\d{8}$/.test(v);
      phoneMsgEl.textContent = valid ? 'Phone number is valid' : 'Phone number is not valid';
      phoneMsgEl.classList.toggle('success', valid);
      phoneMsgEl.classList.toggle('error', !valid);
      phoneMsgEl.style.display = 'block';
    });
  }

  if (pinInput && pinMsgEl) {
    pinInput.addEventListener('input', () => {
      const v = pinInput.value;
      if (v === '') {
        pinMsgEl.style.display = 'none';
        return;
      }
      const valid = v.length >= 9;
      pinMsgEl.textContent = valid ? 'Pin is valid' : 'Pin should be at least 9 characters';
      pinMsgEl.classList.toggle('success', valid);
      pinMsgEl.classList.toggle('error', !valid);
      pinMsgEl.style.display = 'block';
    });
  }
})();

// handle clicks on the dynamically generated "Fill Your Shipping Address" button
// by showing the shipping form again and keeping the back button disabled
document.addEventListener('click', (e) => {
  if (e.target.matches('.shipping-btn')) {
    document.querySelector('.telebir-payment').style.display = 'none';
    document.querySelector('.third-contained').style.display = 'block';
    disableBackNavigation();
    try { window.history.pushState({ third: true }, '', window.location.href); } catch (e) {}
  }
});
document.querySelector('.js-confirm-payment').addEventListener('click', payNow);

