export async function updateCartBtnCount(cartBtn) {
    let token = localStorage.getItem('accessToken');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    try {
      const res = await fetch('https://nilemarket-igqk.onrender.com/cart', { headers });
      if (!res.ok) throw new Error('Cart fetch failed');
      const cartArr = await res.json();
      const total = Array.isArray(cartArr) ? cartArr.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
      if (cartBtn) cartBtn.textContent = String(total);
    } catch {
      if (cartBtn) cartBtn.textContent = '0';
    }
  }