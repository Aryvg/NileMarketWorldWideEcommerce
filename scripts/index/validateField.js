import { isStrongPassword } from './CheckPwdStrength.js';
export function validateField(field) {
    const input = document.getElementById(field.id);
    const msg = document.getElementById(field.msg);
    const value = input.value.trim();

    // 👉 IF EMPTY → SHOW NOTHING
    if (value === "") {
        msg.textContent = "";
        return false;
    }

    // Do not override availability messages for username here.
    if (field.id === 'username') {
        // return true as long as it's non-empty; availability is handled separately
        return true;
    }

    if (field.id === 'email') {
        if (!value.endsWith('@gmail.com')) {
            msg.textContent = '❌ Email is not valid';
            msg.style.color = 'red';
            return false;
        }
        msg.textContent = '✅ email is valid';
        msg.style.color = 'green';
        return true;
    }

    if (field.id === 'password') {
        if (!isStrongPassword(value)) {
            msg.textContent = '❌ Password is not strong. It must be 8 characters';
            msg.style.color = 'red';
            return false;
        }
        msg.textContent = '✅ password is strong';
        msg.style.color = 'green';
        return true;
    }
    if (field.id === 'age') {
        if (!/^\d+$/.test(value)) {
            msg.textContent = '❌ Age must be a number';
            msg.style.color = 'red';
            return false;
        }
        msg.textContent = '✅ age is valid';
        msg.style.color = 'green';
        return true;
    }

    msg.textContent = `✅ ${field.name} is valid`;
    msg.style.color = 'green';
    return true;
}
