// Library page functionality
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE = isProduction
    ? `http://${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api';
console.log('🌐 Library API_BASE:', API_BASE);
let allMaterials = [];

document.addEventListener('DOMContentLoaded', function() {
    const categoryFilter = document.getElementById('categoryFilter');
    const classFilter = document.getElementById('classFilter');
    const searchInput = document.getElementById('searchMaterial');
    const uploadForm = document.getElementById('uploadForm');

    // Load materials on page load
    loadMaterials();

    // Event listeners for filters
    if (categoryFilter) categoryFilter.addEventListener('change', filterMaterials);
    if (classFilter) classFilter.addEventListener('change', filterMaterials);
    if (searchInput) searchInput.addEventListener('input', filterMaterials);
    
    // Upload form handling (Hidden - only admin can upload from admin dashboard)
    if (uploadForm) {
        uploadForm.style.display = 'none'; // Hide upload form from public library
    }
});

// Load materials from API
async function loadMaterials() {
    try {
        const response = await fetch(`${API_BASE}/library/materials`);
        const data = await response.json();

        if (data.success) {
            allMaterials = data.materials || [];
            console.log('📚 Materials loaded:', allMaterials.length);
            displayMaterials(allMaterials);
        } else {
            console.error('Failed to load materials');
        }
    } catch (error) {
        console.error('Error loading materials:', error);
    }
}

// Display materials in grid
function displayMaterials(materials) {
    const materialsGrid = document.querySelector('.materials-grid');

    if (!materialsGrid) return;

    if (materials.length === 0) {
        materialsGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; width: 100%;">
                <i class="fas fa-book-open" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #666;">No materials available yet</h3>
                <p style="color: #999;">Check back later for study materials</p>
            </div>
        `;
        return;
    }

    materialsGrid.innerHTML = materials.map(material => {
        const categoryLabels = {
            'quran': 'Quran & Tajweed',
            'hadith': 'Hadith Studies',
            'fiqh': 'Fiqh & Aqeedah',
            'seerah': 'Seerah',
            'modern': 'Modern Subjects'
        };

        return `
            <div class="material-card" data-category="${material.category}" data-class="${material.class_level}">
                <div class="material-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <h4>${material.title}</h4>
                <p>${material.description || 'No description available'}</p>
                <div class="material-meta">
                    <span class="badge">${categoryLabels[material.category] || material.category}</span>
                    <span class="badge">Class ${material.class_level}</span>
                </div>
                <div class="material-meta">
                    <span class="file-size">${material.file_size || 'N/A'}</span>
                    <span class="file-type">${material.file_type || 'PDF'}</span>
                    <span class="downloads"><i class="fas fa-download"></i> ${material.download_count || 0}</span>
                </div>
                <div class="material-actions">
                    <a href="${API_BASE}/library/download/${material.id}" class="btn btn-primary" target="_blank">
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

// Filter materials
function filterMaterials() {
    const categoryFilter = document.getElementById('categoryFilter');
    const classFilter = document.getElementById('classFilter');
    const searchInput = document.getElementById('searchMaterial');

    const category = categoryFilter ? categoryFilter.value : 'all';
    const classValue = classFilter ? classFilter.value : 'all';
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const filtered = allMaterials.filter(material => {
        const categoryMatch = category === 'all' || material.category === category;
        const classMatch = classValue === 'all' || material.class_level === classValue;
        const searchMatch = searchTerm === '' ||
                          material.title.toLowerCase().includes(searchTerm) ||
                          (material.description && material.description.toLowerCase().includes(searchTerm));

        return categoryMatch && classMatch && searchMatch;
    });

    displayMaterials(filtered);
}