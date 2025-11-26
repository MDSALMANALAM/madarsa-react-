// Common JavaScript for all pages
document.addEventListener('DOMContentLoaded', function() {
    // Add current year to copyright
    const copyrightElement = document.querySelector('.copyright p');
    if (copyrightElement) {
        copyrightElement.innerHTML = `&copy; ${new Date().getFullYear()} Madarsa Imdadul Uloom. All rights reserved.`;
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Show message function
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 10000;
        background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// API Configuration


// Check authentication status
function checkAuth() {
    return localStorage.getItem('token') && localStorage.getItem('user');
}

function getAuthToken() {
    return localStorage.getItem('token');
}

function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}