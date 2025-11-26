// =========================================
//           POPUP SCRIPT - FIXED
// =========================================

function showPopup(config){
    const popup = document.getElementById("popup");
    if(!config || !config.active) return;

    const img = config.imageUrl 
        ? `<img src="${config.imageUrl}" alt="${config.title || 'Popup Image'}" />` 
        : "";

    // Download IMAGE button
    const imageDownloadBtn = config.imageUrl
        ? `<a class="popup-btn popup-btn-outline" href="${config.imageUrl}" download>Download Image</a>`
        : "";

    // Download PDF button
    const pdfDownloadBtn = config.fileUrl
        ? `<a class="popup-btn popup-btn-outline" href="${config.fileUrl}" download>Download PDF</a>`
        : "";

    // Link button
    const linkBtn = config.link 
        ? `<a class="popup-btn popup-btn-primary" href="${config.link}" target="_blank">${config.linkText || "Open"}</a>` 
        : "";

    popup.innerHTML = `
    <div class="popup-backdrop">
      <div class="popup-card">
        <button class="popup-close" id="popup-close" title="Close">&times;</button>
        <div class="popup-body">

          ${img}

          <div class="popup-content">
            <div class="popup-title">${config.title || ""}</div>
            <div class="popup-text">${config.text || ""}</div>

            <div class="popup-actions">

              ${imageDownloadBtn}     <!-- ⭐ IMAGE DOWNLOAD -->
              ${pdfDownloadBtn}       <!-- ⭐ PDF DOWNLOAD -->
              ${linkBtn}              <!-- LINK BUTTON -->
              
              <button class="popup-btn popup-btn-outline" id="popup-later">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    popup.style.display = "flex";

    // Add event listeners
    document.getElementById("popup-close").addEventListener("click", closePopup);
    document.getElementById("popup-later").addEventListener("click", closePopup);
    
    // Close when clicking on backdrop
    popup.addEventListener("click", function(e) {
        if (e.target === this) closePopup();
    });
}

function closePopup(){
    const popup = document.getElementById("popup");
    popup.style.display = "none";
    
    // Always show floating icon
    const icon = document.getElementById("popup-icon");
    if (icon) icon.style.display = "flex";
}

function openPopupFromIcon() {
    loadPopupConfig(); // reload popup
}

// Load popup config - ALWAYS SHOW POPUP ON PAGE LOAD
function loadPopupConfig() {
    const icon = document.getElementById("popup-icon");
    if (icon) {
        icon.style.display = "flex";
        icon.onclick = openPopupFromIcon;
    }

    fetch("/api/popup")
        .then(res => {
            if(!res.ok) throw new Error('Failed to fetch popup config');
            return res.json();
        })
        .then(config => showPopup(config))
        .catch(error => {
            console.error('Error loading popup config:', error);

            const fallback = {
                active: true,
                title: "Welcome to Madarsa Imdadul Uloom",
                text: "Stay updated with our latest announcements.",
                link: "/announcements",
                linkText: "View Announcements"
            };
            showPopup(fallback);
        });
}

// Initialize popup on DOM load
document.addEventListener("DOMContentLoaded", () => {

    if (!document.getElementById("popup")) {
        const pop = document.createElement("div");
        pop.id = "popup";
        document.body.appendChild(pop);
    }

    if (!document.getElementById("popup-icon")) {
        const icon = document.createElement("div");
        icon.id = "popup-icon";
        icon.innerHTML = "📢";
        document.body.appendChild(icon);
    }

    loadPopupConfig();
});

// Close popup with ESC key
document.addEventListener("keydown", e => {
    if (e.key === "Escape") closePopup();
});
