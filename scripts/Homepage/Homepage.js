// Dashboard button navigation
document.addEventListener('DOMContentLoaded', () => {
  const dashboardBtn = document.getElementById('dashboard-btn');
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
});
import { logout } from './logout.js';
import { loadProducts } from './loadProducts.js';
import { searchFunctionality } from './searchFunctionalities.js';
import { setupAddToCart } from './addToCart.js';

// verify the user still has a valid session on every homepage load
async function verifySession() {
    try {
        const res = await fetch('https://nilemarket-igqk.onrender.com/refresh', {
            method: 'GET',
            credentials: 'include'
        });
        if (!res.ok) {
            // not authenticated anymore, send them to unauthorized
            window.location.href = 'unauthorized.html';
        }
    } catch (e) {
        console.error('session check failed', e);
        window.location.href = 'unauthorized.html';
    }
}

window.addEventListener('DOMContentLoaded', verifySession);

// Check admin status using refresh cookie and show/hide dashboard button
async function checkAdminStatus() {
  try {
    const res = await fetch('https://nilemarket-igqk.onrender.com/refresh/status', {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) {
      // hide dashboard if status request fails
      const btn = document.getElementById('dashboard-btn');
      if (btn) btn.style.display = 'none';
      return;
    }
    const data = await res.json();
    const btn = document.getElementById('dashboard-btn');
    if (btn) {
      // show for admins or editors
      btn.style.display = data && (data.isAdmin || data.isEditor) ? '' : 'none';
    }
  } catch (e) {
    const btn = document.getElementById('dashboard-btn');
    if (btn) btn.style.display = 'none';
  }
}

window.addEventListener('DOMContentLoaded', checkAdminStatus);

searchFunctionality();
setupAddToCart();

// If redirected from track.html with a search term, perform backend search and show results
const homepageSearchTerm = localStorage.getItem('homepageSearchTerm');
const homepageSearchFromTrack = localStorage.getItem('homepageSearchFromTrack');
if (homepageSearchFromTrack === '1' && homepageSearchTerm && homepageSearchTerm.trim()) {
  // Set input value for user feedback
  document.querySelectorAll('.input1, .input3').forEach(input => input.value = homepageSearchTerm);
  import('./searchProducts.js').then(({ searchProducts }) => {
    searchProducts(homepageSearchTerm);
    localStorage.removeItem('homepageSearchTerm');
    localStorage.removeItem('homepageSearchFromTrack');
  });
} else {
  loadProducts();
}
logout();
document.querySelector('.js-menu').addEventListener('click', ()=>{
   document.getElementById('123').style.width="100%";
   document.body.style.paddingTop='114px'
});
document.querySelector('.js-times').addEventListener('click', ()=>{
  document.getElementById('123').style.width="0px";
  document.body.style.paddingTop='70px'
});
document.querySelector('.time').addEventListener('click', ()=>{
  document.querySelector('.first-contained').style.display='none';
});
document.querySelector('.js-time').addEventListener('click', ()=>{
  document.querySelector('.second-contained').style.display='none';
});
document.querySelector('.cancel').addEventListener('click', ()=>{
  document.querySelector('.first-contained').style.display='none';
});
document.querySelector('.js-cancelled').addEventListener('click', ()=>{
  document.querySelector('.second-contained').style.display='none';
});



