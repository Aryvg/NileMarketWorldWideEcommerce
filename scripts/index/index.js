import { registerHandler } from './registerHandler.js';
import {showForm} from './showForm.js';
import { validateField } from './validateField.js';
import './checkUsernameAvailability.js';
import './checkLogin.js';
import './checkAuthOnLoad.js';

// prevent back-navigation from the login page by redirecting straight to unauthorized
window.addEventListener('DOMContentLoaded', () => {
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', () => {
        // whenever the user tries to go back, send them to unauthorized page
        window.location.href = 'unauthorized.html';
    });
});

document.querySelector('.js-login').addEventListener('click', () => showForm('login'));
document.querySelector('.js-sign-up').addEventListener('click', () => showForm('signup'));


const countries = ["Ethiopia", "Kenya", "Uganda", "Sudan", "Egypt"];
const countrySelect = document.getElementById("country");

countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
});

const fields = [
    { id: 'username', msg: 'username-msg', name: 'username' },
    { id: 'email', msg: 'email-msg', name: 'email' },
    { id: 'password', msg: 'password-msg', name: 'password' },
    { id: 'age', msg: 'age-msg', name: 'age' },
    { id: 'job', msg: 'job-msg', name: 'job' },
    { id: 'country', msg: 'country-msg', name: 'country' }
];

fields.forEach(field => {
    const input = document.getElementById(field.id);
    input.addEventListener('input', () => validateField(field));
    input.addEventListener('change', () => validateField(field));
});

const submit = document.querySelector('.create-account-button');
const loginBtn = document.querySelector('.login-button');
submit.addEventListener('click', ()=> registerHandler(fields, validateField));


// username availability listener moved to `checkUsernameAvailability.js`
// login handler moved to `checkLogin.js`

// auth check moved to `checkAuthOnLoad.js`


//To run it, you will use `npx serve .` in the terminal and open the provided localhost URL in your browser. Make sure your backend server is running on https://nilemarket-igqk.onrender.com for the API calls to work correctly.
