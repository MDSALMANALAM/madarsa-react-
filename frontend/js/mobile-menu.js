// Mobile Menu Toggle Function
function toggleMobileMenu() {
    const nav = document.getElementById('mobileNav');
    const authButtons = document.getElementById('mobileAuth');
    const body = document.body;
    const menuToggle = document.querySelector('.mobile-menu-toggle i');
    
    nav.classList.toggle('active');
    authButtons.classList.toggle('active');
    body.classList.toggle('menu-open');
    
    // Change icon between bars and times (X)
    if (nav.classList.contains('active')) {
        menuToggle.classList.remove('fa-bars');
        menuToggle.classList.add('fa-times');
    } else {
        menuToggle.classList.remove('fa-times');
        menuToggle.classList.add('fa-bars');
    }
}

// Close menu when clicking on a link
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#mobileNav a').forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.getElementById('mobileNav');
            const authButtons = document.getElementById('mobileAuth');
            const body = document.body;
            const menuToggle = document.querySelector('.mobile-menu-toggle i');
            
            nav.classList.remove('active');
            authButtons.classList.remove('active');
            body.classList.remove('menu-open');
            menuToggle.classList.remove('fa-times');
            menuToggle.classList.add('fa-bars');
        });
    });
    
    // Close menu when clicking overlay
    document.addEventListener('click', (e) => {
        const nav = document.getElementById('mobileNav');
        const authButtons = document.getElementById('mobileAuth');
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const body = document.body;
        
        if (body.classList.contains('menu-open') && 
            !nav.contains(e.target) && 
            !authButtons.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            nav.classList.remove('active');
            authButtons.classList.remove('active');
            body.classList.remove('menu-open');
            menuToggle.querySelector('i').classList.remove('fa-times');
            menuToggle.querySelector('i').classList.add('fa-bars');
        }
    });
});

