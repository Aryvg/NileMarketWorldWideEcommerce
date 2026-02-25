
const orderSearchInput1 = document.querySelector('.input1');
const orderSearchButton1 = document.querySelector('.search-button');
const orderSearchButton1_alt = document.querySelector('.search-button1');
if (orderSearchInput1) {
  const doSearch = () => start(orderSearchInput1.value);
  if (orderSearchButton1) orderSearchButton1.addEventListener('click', doSearch);
  if (orderSearchButton1_alt) orderSearchButton1_alt.addEventListener('click', doSearch);
  orderSearchInput1.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doSearch();
  });
}

const orderSearchInput3 = document.querySelector('.input3');
const orderSearchButton3 = document.querySelector('.search-button3');
if (orderSearchInput3 && orderSearchButton3) {
  const doSearch3 = () => start(orderSearchInput3.value);
  orderSearchButton3.addEventListener('click', doSearch3);
  orderSearchInput3.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doSearch3();
  });
}

import { loadOrder } from "./loadOrder.js";

// UI setup helpers -------------------------------------------------------
function attachMenuHandlers() {
  const menu = document.querySelector('.js-menu');
  const times = document.querySelector('.js-times');
  if (menu) {
    menu.addEventListener('click', () => {
      const el = document.getElementById('123');
      if (el) el.style.width = "100%";
      document.body.style.paddingTop = '200px';
    });
  }
  if (times) {
    times.addEventListener('click', () => {
      const el = document.getElementById('123');
      if (el) el.style.width = "0";
      document.body.style.paddingTop = '150px';
    });
  }
}

function attachSignUpToggle() {
  const MoreButton = document.querySelector('.js-sign-up-button');
  if (!MoreButton) return;
  MoreButton.addEventListener('click', () => {
    if (MoreButton.innerText === 'More') {
      const div = document.querySelector('.sl-div');
      if (div) div.style.visibility = 'visible';
      MoreButton.innerText = 'Cancel';
    } else {
      const div = document.querySelector('.sl-div');
      if (div) div.style.visibility = 'hidden';
      MoreButton.innerText = 'More';
    }
  });
}

function initOrderPage() {
  // make sure any static elements have their handlers
  attachMenuHandlers();
  attachSignUpToggle();

  // For each order group, create a summary-order-option and scoped toggling
  const orderGroups = document.querySelectorAll('.orders-header');
  orderGroups.forEach((header, idx) => {
    // Find all order-details for this group (next siblings)
    let groupOrderDetails = [];
    let next = header.nextElementSibling;
    while (next && next.classList.contains('order-details')) {
      groupOrderDetails.push(next);
      next = next.nextElementSibling;
    }
    // Create summary-order-option for this group
    let summaryOption = document.createElement('div');
    summaryOption.className = 'summary-order-option';
    summaryOption.style.display = 'none';
    summaryOption.style.justifyContent = 'center';
    summaryOption.style.alignItems = 'center';
    summaryOption.style.height = '200px';
    summaryOption.style.fontSize = '20px';
    summaryOption.style.background = 'white';
    summaryOption.style.borderRadius = '10px';
    summaryOption.style.margin = '40px auto';
    summaryOption.style.maxWidth = '400px';
    summaryOption.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    summaryOption.innerHTML = '<div class="summary-content"></div>';
    // Insert summary-order-option before the first order-details in group
    if (groupOrderDetails.length > 0) {
      groupOrderDetails[0].before(summaryOption);
    } else {
      header.after(summaryOption);
    }
    // Setup event listeners for this group's buttons
    const groupButtons = header.querySelectorAll('.order-header');
    groupButtons[0].classList.add('active');
    groupButtons.forEach((button) => {
      button.addEventListener('click', () => {
        groupButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
        // Find all .ord, .order-description, .order-option in this group
        groupOrderDetails.forEach(od => {
          const ord = od.querySelector('.ord');
          const desc = od.querySelector('.order-description');
          const option = od.querySelector('.order-option');
          if (button.innerText === 'Your order') {
            od.style.display = '';
            if (ord) ord.style.visibility = 'visible';
            if (desc) desc.style.display = '';
            if (option) option.style.display = 'none';
          } else if (button.innerText === 'Order details') {
            od.style.display = 'none';
            if (ord) ord.style.visibility = 'hidden';
            if (desc) desc.style.display = 'none';
            if (option) option.style.display = 'none';
          }
        });
        if (button.innerText === 'Your order') {
          summaryOption.style.display = 'none';
        } else if (button.innerText === 'Order details') {
          // Show only the summary order option for this group
          // Gather summary info from the first .order-option in this group
          let firstOption = null;
          for (let od of groupOrderDetails) {
            firstOption = od.querySelector('.order-option');
            if (firstOption) break;
          }
          if (firstOption) {
            summaryOption.querySelector('.summary-content').innerHTML = firstOption.innerHTML;
          }
          summaryOption.style.display = 'flex';
        }
      });
    });
  });
}



// load orders (optionally with a search term) then initialize UI
// once DOM and content are ready
// `fromPop` indicates the call came from a popstate event; if false we
// push a new history entry so the browser back/forward buttons cycle
// through previous searches (including empty = all orders).
async function start(searchTerm = '', fromPop = false) {
  // sync the two search inputs to the current term so back/forward
  // navigation visibly restores the query.
  if (orderSearchInput1) orderSearchInput1.value = searchTerm || '';
  if (orderSearchInput3) orderSearchInput3.value = searchTerm || '';

  await loadOrder(searchTerm);
  initOrderPage();
  if (!fromPop) {
    history.pushState({ term: searchTerm }, '', '');
  }
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // initialise history state with empty term so back button returns here
    history.replaceState({ term: '' }, '', '');
    start('', true);
  });
} else {
  history.replaceState({ term: '' }, '', '');
  start('', true);
}

// respond when the user navigates via back/forward buttons
window.addEventListener('popstate', (e) => {
  const term = e.state && typeof e.state.term === 'string' ? e.state.term : '';
  start(term, true);
});

// adapt 'Market' text for small widths (orders page)
(function() {
  function updateMarketText() {
    var marketSpans = document.querySelectorAll('.Market-class');
    if (window.innerWidth <= 334) {
      marketSpans.forEach(function(span) {
        if (span.textContent.trim() !== 'M') {
          span.textContent = 'M';
        }
      });
    } else if (window.innerWidth <= 358) {
      marketSpans.forEach(function(span) {
        if (span.textContent.trim() !== 'Mar') {
          span.textContent = 'Mar';
        }
      });
    } else {
      marketSpans.forEach(function(span) {
        if (span.textContent.trim() !== 'Market') {
          span.textContent = 'Market';
        }
      });
    }
  }
  document.addEventListener('DOMContentLoaded', function() {
    updateMarketText();
    window.addEventListener('resize', updateMarketText);
  });
})();


