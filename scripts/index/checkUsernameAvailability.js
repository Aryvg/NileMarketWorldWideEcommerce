// Real-time username availability check (debounced)
function debounce(fn, delay = 300) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

const usernameInput = document.getElementById('username');
const usernameMsg = document.getElementById('username-msg');

async function checkAvailability(value) {
    try {
        const res = await fetch(`https://nilemarket-igqk.onrender.com/users/exists?user=${encodeURIComponent(value)}`, { cache: 'no-store' });
        if (!res.ok) return false;
        const json = await res.json();
        return !!json.exists;
    } catch (e) {
        console.error('availability check failed', e);
        return false;
    }
}

const checkUsername = debounce(async () => {
    const val = usernameInput.value.trim();
    if (!val) {
        usernameMsg.textContent = '';
        return;
    }
    usernameMsg.textContent = 'checking...';
    const exists = await checkAvailability(val);
    if (exists) {
        usernameMsg.textContent = '❌ username already taken';
        usernameMsg.style.color = 'red';
    } else {
        usernameMsg.textContent = '✅ username available';
        usernameMsg.style.color = 'green';
    }
}, 300);

if (usernameInput) {
    usernameInput.addEventListener('input', checkUsername);
    usernameInput.addEventListener('change', checkUsername);
}
