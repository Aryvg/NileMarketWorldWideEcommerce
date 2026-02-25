export async function buyAgain(options = {}) {
    // Extract values and provide defaults where appropriate
    const {
        name = '',
        quantity = 1,
        image = '',
        priceCents = 0,
        oneDay = { priceCents: 999 },
        threeDay = { priceCents: 499 },
        sevenDay = { priceCents: 0 }
    } = options;

    // Construct payload as plain object (JSON) matching the server's expectations.
    // Avoid using `fetch` on the image URL, which triggers CORS errors when the
    // front‑end origin (3000) differs from the API origin (3500). Instead, just
    // send the string path/URL and let the backend resolve it when generating the
    // stored record.
    const payload = {
        name,
        priceCents: Number(priceCents) || 0,
        quantity: Number(quantity) || 0,
        image,
        oneDay,
        threeDay,
        sevenDay
    };

    // log for troubleshooting
    console.debug('buyAgain payload', payload);

    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    };

    try {
        const response = await fetch('https://nilemarket-igqk.onrender.com/cart', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // show more descriptive error if available
            const errText = await response.text().catch(() => null);
            console.warn('cart POST failed', response.status, errText);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error adding to cart:', error);
        return false;
    }
}