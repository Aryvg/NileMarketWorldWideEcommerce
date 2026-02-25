// checkAuthOnLoad.js
// Purpose: When the signup/login page opens, try to refresh the session.
// If the user already has a valid session, send them to the protected page.
// Simple English: "If you're already logged in, go to the main app page without signing up or logging in." 

export async function checkAuthOnLoad() {
    try {
        const res = await fetch('https://nilemarket-igqk.onrender.com/refresh', {
            method: 'GET',
            credentials: 'include'
        });
        if (res.ok) {
            // we have a valid session — go to the protected page
            window.location.href = 'Homepage.html';
        }
    } catch (e) {
        console.error('Auth check failed', e);
    }
}

// Attach the check to DOMContentLoaded so it runs when the page opens
window.addEventListener('DOMContentLoaded', checkAuthOnLoad);
