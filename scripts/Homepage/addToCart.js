export function setupAddToCart() {
	// Track quantity per product (by name) and total
	const cartQuantities = {};
	const cartTotal = { value: 0 };
	// Set and update button-size to reflect sum of all cart quantities from backend
	const cartBtn = document.querySelector('.button-size');
	import('./updateCartBtnCount.js').then(({ updateCartBtnCount }) => {
		updateCartBtnCount(cartBtn);
	});

	// Event delegation for add-to-cart buttons
	document.querySelector('.js-main').addEventListener('click', 
		async function(e) {
			const btn = e.target.closest('.add-to-cart');
			if (!btn) return;

			// BLOCK ADD TO CART IF PAYMENT PENDING
			const username = localStorage.getItem('currentUsername') || '';
			if (localStorage.getItem('paymentSuccess_' + username) === 'true' && localStorage.getItem('shippingCompleted_' + username) !== 'true') {
				// Show popup (create if not exists)
				let popup = document.getElementById('block-add-popup');
				if (!popup) {
					popup = document.createElement('div');
					popup.id = 'block-add-popup';
					popup.style.position = 'fixed';
					popup.style.top = '50%';
					popup.style.left = '50%';
					popup.style.transform = 'translate(-50%, -50%)';
					popup.style.background = 'white';
					popup.style.color = 'black';
					popup.style.padding = '32px 24px';
					popup.style.borderRadius = '16px';
					popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
					popup.style.zIndex = '99999';
					popup.style.fontSize = '18px';
					popup.style.textAlign = 'center';
					popup.innerHTML = 'You must finish filling your shipping address and place your order before adding new products to your cart.' +
						'<br><br><button id="close-block-add-popup" style="margin-top:18px;padding:8px 22px;background:#0077ff;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;">OK</button>';
					document.body.appendChild(popup);
					document.getElementById('close-block-add-popup').onclick = function() {
						popup.remove();
					};
				}
				return;
			}

			// ...existing code for add to cart...
			const productContainer = btn.closest('.product-container');
			if (!productContainer) return;
			const nameElem = productContainer.querySelector('.product-name');
			const priceElem = productContainer.querySelector('.product-price');
			const imgElem = productContainer.querySelector('img');
			const selectElem = productContainer.querySelector('select');
			if (!nameElem || !priceElem || !imgElem || !selectElem) return;

			const name = nameElem.textContent.trim();
			const priceCents = Math.round(parseFloat(priceElem.textContent.replace(/[^\d.]/g, '')) * 100);
			const image = imgElem.getAttribute('src');
			const quantity = parseInt(selectElem.value, 10) || 1;

			// Increment quantity if already in cartQuantities, else set
			cartQuantities[name] = (cartQuantities[name] || 0) + quantity;
			// Do not update cartTotal or cartBtn here. Only update button-size after cart change using updateCartBtnCount.

			// Find product data for delivery options (if available)
			let oneDay = { priceCents: 999 }, threeDay = { priceCents: 499 }, sevenDay = { priceCents: 0 };
			// Optionally, you can fetch these from the loaded products array if needed

			// Check if product already exists in cart
			let token = localStorage.getItem('accessToken');
			const headers = {
				'Content-Type': 'application/json',
				...(token ? { 'Authorization': 'Bearer ' + token } : {})
			};
			let cartRes;
			try {
				cartRes = await fetch('https://nilemarket-igqk.onrender.com/cart', { headers });
				if (!cartRes.ok) throw new Error('Cart fetch failed');
			} catch (err) {
				cartRes = null;
			}
			let cartArr = [];
			try {
				cartArr = cartRes ? await cartRes.json() : [];
			} catch (err) {}
			const existing = cartArr.find(item => item.name === name);

			// Add selected quantity to existing cart quantity
			let newQuantity = quantity;
			if (existing) {
				newQuantity = (existing.quantity || 0) + quantity;
			}

			cartQuantities[name] = newQuantity;

			// Ensure delivery options are objects with date and priceCents
			let now = new Date();
			const oneDayObj = {
				date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
				priceCents: oneDay.priceCents || 999
			};
			const threeDayObj = {
				date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
				priceCents: threeDay.priceCents || 499
			};
			const sevenDayObj = {
				date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
				priceCents: sevenDay.priceCents || 0
			};
			const body = JSON.stringify({
				name,
				priceCents,
				quantity: newQuantity,
				image,
				oneDay: oneDayObj,
				threeDay: threeDayObj,
				sevenDay: sevenDayObj
			});

			try {
				if (existing) {
					// Update quantity with PUT
					await fetch('https://nilemarket-igqk.onrender.com/cart', {
						method: 'PUT',
						headers,
						body: JSON.stringify({ id: existing._id, quantity: newQuantity })
					});
					import('./updateCartBtnCount.js').then(({ updateCartBtnCount }) => {
						updateCartBtnCount(cartBtn);
					});
				} else {
					// Add new product with POST
					await fetch('https://nilemarket-igqk.onrender.com/cart', {
						method: 'POST',
						headers,
						body
					});
					import('./updateCartBtnCount.js').then(({ updateCartBtnCount }) => {
						updateCartBtnCount(cartBtn);
					});
				}
			} catch (err) {
				// Optionally show error
			}
	});
}
