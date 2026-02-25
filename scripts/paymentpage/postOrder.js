export async function placeOrder(event) {
  if (event) event.preventDefault();

  const token = localStorage.getItem('accessToken');

  try {

    // 1️⃣ GET CART DATA
    const cartResponse = await fetch('https://nilemarket-igqk.onrender.com/cart', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!cartResponse.ok) {
      alert('Failed to load cart');
      return false;
    }

    const cartItems = await cartResponse.json();

    // 2️⃣ FORMAT PRODUCTS FOR ORDER API
    // For each product, include deliveryDate from the UI (the text shown in payment page)
    const formattedProducts = cartItems.map(item => {
      // Find the delivery date text from the payment product div
      let deliveryDate = '';
      const productDiv = document.getElementById(item._id);
      if (productDiv) {
        const deliveryDateElem = productDiv.querySelector('.delivery-date');
        if (deliveryDateElem) {
          // Extract the date from the text: 'Reaching you on ...'
          const match = deliveryDateElem.textContent.match(/Reaching you on (.+)/);
          if (match && match[1]) {
            deliveryDate = match[1].trim();
          }
        }
      }
      // fallback to backend logic if not found
      if (!deliveryDate) {
        if (item.selectedDelivery && item[item.selectedDelivery] && item[item.selectedDelivery].date) {
          deliveryDate = item[item.selectedDelivery].date;
        } else if (item.sevenDay && item.sevenDay.date) {
          deliveryDate = item.sevenDay.date;
        } else if (item.threeDay && item.threeDay.date) {
          deliveryDate = item.threeDay.date;
        } else if (item.oneDay && item.oneDay.date) {
          deliveryDate = item.oneDay.date;
        }
      }
      return {
        image: item.image,
        name: item.name,
        quantity: item.quantity,
        price: item.priceCents / 100,
        deliveryDate
      };
    });

    // 3️⃣ CALCULATE TOTAL (Order Total from paymentSummary)
    // Use the same calculation as paymentSummary.js
    let totalItemsPriceCents = 0;
    let totalShippingCents = 0;
    cartItems.forEach(item => {
      const quantity = item.quantity || 0;
      totalItemsPriceCents += (item.priceCents || 0) * quantity;
      // Shipping price logic (match paymentSummary.js)
      let shippingPrice = 0;
      if (item.selectedDelivery && item[item.selectedDelivery] && typeof item[item.selectedDelivery].priceCents === 'number') {
        shippingPrice = item[item.selectedDelivery].priceCents;
      } else if (item.sevenDay && typeof item.sevenDay.priceCents === 'number') {
        shippingPrice = item.sevenDay.priceCents;
      } else if (item.threeDay && typeof item.threeDay.priceCents === 'number') {
        shippingPrice = item.threeDay.priceCents;
      } else if (item.oneDay && typeof item.oneDay.priceCents === 'number') {
        shippingPrice = item.oneDay.priceCents;
      }
      totalShippingCents += shippingPrice * quantity;
    });
    const totalBeforeTaxCents = totalItemsPriceCents + totalShippingCents;
    const taxCents = Math.round(totalBeforeTaxCents * 0.10);
    const orderTotalCents = totalBeforeTaxCents + taxCents;
    let total = orderTotalCents / 100;

    // 4️⃣ GET SHIPPING ADDRESS FROM FORM
    // Get shipping address from input fields inside .shipping-address
    const shippingAddress = {
      fullName: document.getElementById('fullNameInput')?.value || '',
      country: document.getElementById('countryInput')?.value || '',
      city: document.getElementById('cityInput')?.value || '',
      subCity: document.getElementById('subCityInput')?.value || '',
      houseNo: document.getElementById('houseNoInput')?.value || '',
      phone: document.getElementById('shipPhoneInput')?.value || ''
    };

    // 5️⃣ CREATE ORDER OBJECT
    const orderData = {
      Total: total,
      date: new Date().toISOString().split('T')[0],
      product: formattedProducts,
      shippingAddress: shippingAddress
    };

    // 6️⃣ SEND TO ORDERS API
    const orderResponse = await fetch('https://nilemarket-igqk.onrender.com/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      alert('Failed to place order');
      return false;
    }

    // order succeeded – remove the corresponding products from the cart by
    // firing each item's delete button.  the handler already takes care of
    // updating the DOM, cachedCartData and sending the DELETE request.
    // we iterate over the same array we sent to the server earlier so only
    // ordered products are affected.
    cartItems.forEach(item => {
      if (!item._id) return;
      const productDiv = document.getElementById(item._id);
      if (productDiv) {
        const delBtn = productDiv.querySelector('.js-delete-btn');
        if (delBtn) {
          // invoking click triggers the existing handler defined in
          // deleteButtonHandler.js
          delBtn.click();
        }
      }
    });

    //alert('Order placed successfully!');
    document.querySelector('.third-contained').style.display = 'none';
    document.querySelector('.fourth-contained').style.display = 'block';
    return true;

  } catch (error) {
    console.error('Error placing order:', error);
    alert('Something went wrong');
    return false;
  }
}