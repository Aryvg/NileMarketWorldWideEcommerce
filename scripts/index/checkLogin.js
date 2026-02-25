// Login handler moved from html.js
const loginBtn = document.querySelector('.login-button');

if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('usernamel').value.trim();
    const pwd = document.getElementById('passwordl').value.trim();

    try {
      const res = await fetch('https://nilemarket-igqk.onrender.com/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user: username,
          pwd: pwd
        })
      });

      if (!res.ok) {
        if (res.status === 401) {
          document.querySelector('.notfound').textContent = '❌ Not found — try again';
          document.querySelector('.notfound').style.color = 'red';
          return;
        }
        throw new Error(`${res.status} ${res.statusText}`);
      } else {
        document.querySelector('.notfound').textContent = '';
        // Save username in localStorage for per-user state
        localStorage.setItem('currentUsername', username);
        // Save accessToken in localStorage for cart count
        try {
          const data = await res.clone().json();
          if (data && data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
          }
        } catch (e) {}
        // If the user had an unfinished post-payment state, open the payment
        // page so they can finish shipping info. Otherwise go to homepage.
        try {
          const paymentPending = localStorage.getItem('paymentSuccess_' + username) === 'true' && localStorage.getItem('shippingCompleted_' + username) !== 'true';
          if (paymentPending) {
            window.location.href = 'Paymentpage.html';
          } else {
            window.location.href = 'Homepage.html';
          }
        } catch (e) {
          window.location.href = 'Homepage.html';
        }
      }

      return await res.json();

    } catch (err) {
      console.error(err);
    }
  });
}
