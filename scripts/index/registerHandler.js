
export async function registerHandler(fields, validateField) {
          const usernameMsg = document.getElementById('username-msg');
          let allValid = true;
    
          // Validate every field first (username presence only; availability is checked separately)
          fields.forEach(field => {
            const isValid = validateField(field);
            if (!isValid) {
              allValid = false;
    
              // If empty, show red warning
              const input = document.getElementById(field.id);
              const msg = document.getElementById(field.msg);
              if (input.value.trim() === "") {
                msg.textContent = `❌ Please fill ${field.name}`;
                msg.style.color = 'red';
              }
            }
          });
    
          if (!allValid) return; // Stop submission if any field is invalid
    
          const username = document.getElementById('username').value.trim();
          const pwd = document.getElementById('password').value.trim();
          const job = document.getElementById('job').value.trim();
          const age = document.getElementById('age').value.trim();
          const country = document.getElementById('country').value.trim();
          const email = document.getElementById('email').value.trim();
    
          // Re-check availability right before submit and block if taken
          try {
            const r = await fetch(`https://nilemarket-igqk.onrender.com/users/exists?user=${encodeURIComponent(username)}`);
            if (r.ok) {
              const j = await r.json();
              if (j.exists) {
                usernameMsg.textContent = '❌ username already taken';
                usernameMsg.style.color = 'red';
                return; // block submission
              }
            }
          } catch (e) {
            console.error('availability check failed', e);
          }
          try {
            const res = await fetch('https://nilemarket-igqk.onrender.com/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                user: username,
                pwd: pwd,
                job: job,
                age: age,
                country: country,
                email: email
              })
            });
           
            if (!res.ok) {
              if (res.status === 401) {
                return await sendRefreshToken();
              }
              throw new Error(`${res.status} ${res.statusText}`);
            } else {
              // After successful registration, perform login to receive auth cookies/tokens
              try {
                const authRes = await fetch('https://nilemarket-igqk.onrender.com/auth', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ user: username, pwd: pwd })
                });
                if (authRes.ok) {
                  // Save accessToken in localStorage for cart count
                  try {
                    const data = await authRes.clone().json();
                    if (data && data.accessToken) {
                      localStorage.setItem('accessToken', data.accessToken);
                    }
                  } catch (e) {}
                  window.location.href = 'Homepage.html';
                  return await authRes.json();
                } else {
                  // If login failed for some reason, still redirect so user can try
                  window.location.href = 'Homepage.html';
                }
              } catch (e) {
                console.error('auto-login after register failed', e);
                window.location.href = 'Homepage.html';
              }
            }
            return await res.json();
          } catch (err) {
            console.error(err);
          }
}