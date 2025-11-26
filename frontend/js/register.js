// Auto-detect environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE = isProduction
    ? `http://${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api';
console.log('🌐 Register API_BASE:', API_BASE);

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const mobile = document.getElementById('mobile').value;
            const password = document.getElementById('password').value;

            if (!name || !email || !mobile || !password) {
                alert('⚠️ Please fill all fields.');
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, mobile, password })
                });

                const data = await response.json();

                if (data.success) {
                    // Save token & user details
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    alert('✅ Account created successfully!');
                    window.location.href = 'dashboard.html'; // redirect
                } else {
                    alert(data.message || '❌ Signup failed.');
                }

            } catch (error) {
                console.error('Signup Error:', error);
                alert('⚠️ Server error. Please try again.');
            }
        });
    }
});
