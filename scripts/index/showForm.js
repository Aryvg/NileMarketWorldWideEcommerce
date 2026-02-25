export function showForm(formName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('form').forEach(form => form.classList.remove('active'));

    const formEl = document.getElementById(formName);
    if (formEl) formEl.classList.add('active');

    // Pick the corresponding tab element. HTML uses .js-login and .js-sign-up
    const tabSelector = formName === 'signup' ? '.js-sign-up' : '.js-login';
    const tabEl = document.querySelector(tabSelector);
    if (tabEl) tabEl.classList.add('active');
}