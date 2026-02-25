export function logout() {
    const logoutBtn = document.querySelector('.js-logout-button');
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('https://nilemarket-igqk.onrender.com/logout', {
          method: 'GET',
          credentials: 'include'
        });

        if (res.ok) {
          // remove any lingering token from storage
          localStorage.removeItem('accessToken');
          window.location.href = 'index.html';
          return;
        }

        console.error('Logout failed', res.status, res.statusText);
      } catch (err) {
        console.error(err);
      }
});
}