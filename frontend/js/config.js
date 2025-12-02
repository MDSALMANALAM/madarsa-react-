/**
 * =====================================================
 * MADARSA IMDADUL ULOOM - CONFIGURATION FILE
 * =====================================================
 * Yahan se sab contact info change kar sakte ho
 * Ek jagah change karo, sab jagah apply hoga
 */

const MADARSA_CONFIG = {
    // ==================== CONTACT INFO ====================
    contact: {
        whatsapp: "919304767815",        // WhatsApp number (with country code, no +)
        phone: "+91 9304767815",          // Display phone number
        email: "info@madarasaimdadululoom.in",
        address: "Ratanpur, Gidhor, Chatra, Jharkhand, 825408"
    },

    // ==================== SOCIAL MEDIA ====================
    social: {
        facebook: "https://facebook.com/madarasaimdadululoom",
        instagram: "https://instagram.com/madarasaimdadululoom",
        youtube: "https://youtube.com/@madarasaimdadululoom",
        twitter: ""
    },

    // ==================== WHATSAPP SETTINGS ====================
    whatsapp: {
        defaultMessage: "Assalamu Alaikum! I want to know about Madarsa Imdadul Uloom",
        // Full WhatsApp link (auto-generated)
        get link() {
            return `https://wa.me/${MADARSA_CONFIG.contact.whatsapp}?text=${encodeURIComponent(this.defaultMessage)}`;
        }
    },

    // ==================== MADARSA INFO ====================
    info: {
        name: "Madarsa Imdadul Uloom",
        shortName: "MIU",
        tagline: "Illuminating Minds, Nurturing Faith",
        established: "1990",
        website: "https://madarasaimdadululoom.in"
    },

    // ==================== API SETTINGS ====================
    api: {
        baseUrl: window.location.origin + "/api"
    }
};

// ==================== AUTO-UPDATE FUNCTIONS ====================

// Update WhatsApp floating button
function updateWhatsAppButton() {
    const waBtn = document.getElementById('whatsapp-float');
    if (waBtn) {
        waBtn.href = MADARSA_CONFIG.whatsapp.link;
    }
}

// Update footer contact info
function updateFooterContact() {
    // Phone
    const phoneElements = document.querySelectorAll('.footer-phone, [data-config="phone"]');
    phoneElements.forEach(el => el.textContent = MADARSA_CONFIG.contact.phone);
    
    // Email
    const emailElements = document.querySelectorAll('.footer-email, [data-config="email"]');
    emailElements.forEach(el => {
        el.textContent = MADARSA_CONFIG.contact.email;
        if (el.tagName === 'A') el.href = `mailto:${MADARSA_CONFIG.contact.email}`;
    });
    
    // Address
    const addressElements = document.querySelectorAll('.footer-address, [data-config="address"]');
    addressElements.forEach(el => el.textContent = MADARSA_CONFIG.contact.address);
}

// Update social links
function updateSocialLinks() {
    const socialLinks = {
        'facebook': MADARSA_CONFIG.social.facebook,
        'instagram': MADARSA_CONFIG.social.instagram,
        'youtube': MADARSA_CONFIG.social.youtube,
        'twitter': MADARSA_CONFIG.social.twitter
    };
    
    Object.keys(socialLinks).forEach(platform => {
        const links = document.querySelectorAll(`a[data-social="${platform}"], .social-${platform}`);
        links.forEach(link => {
            if (socialLinks[platform]) {
                link.href = socialLinks[platform];
                link.style.display = '';
            } else {
                link.style.display = 'none';
            }
        });
    });
}

// Initialize all config updates
function initConfig() {
    updateWhatsAppButton();
    updateFooterContact();
    updateSocialLinks();
    console.log('✅ Madarsa Config Loaded:', MADARSA_CONFIG.info.name);
}

// Auto-run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConfig);
} else {
    initConfig();
}

