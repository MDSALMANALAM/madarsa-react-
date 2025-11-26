// =========================================
// API Configuration (Safe Declaration)
// =========================================

// Declare API_BASE only if not already declared
if (!window.API_BASE) {
    // Auto-detect environment: use current host for production, localhost for development
    const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
    window.API_BASE = isProduction
        ? `http://${window.location.hostname}/api`
        : "http://localhost:5000/api";

    console.log("🌐 FIXED API_BASE =", window.API_BASE);

}

// =========================================
// Helper functions (Define only if missing)
// =========================================

// 🔹 GET Request
if (!window.apiGet) {
    window.apiGet = async function (endpoint) {
        const res = await fetch(`${window.API_BASE}${endpoint}`);
        return await res.json();
    };
}

// 🔹 POST Request (JSON Body)
if (!window.apiPost) {
    window.apiPost = async function (endpoint, data) {
        const res = await fetch(`${window.API_BASE}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    };
}

// 🔹 POST Request (FormData)
if (!window.apiPostForm) {
    window.apiPostForm = async function (endpoint, formData) {
        const res = await fetch(`${window.API_BASE}${endpoint}`, {
            method: "POST",
            body: formData,
        });
        return await res.json();
    };
}

// 🔹 PATCH Request (JSON)
if (!window.apiPatch) {
    window.apiPatch = async function (endpoint, data) {
        const res = await fetch(`${window.API_BASE}${endpoint}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await res.json();
    };
}

// 🔹 DELETE Request
if (!window.apiDelete) {
    window.apiDelete = async function (endpoint) {
        const res = await fetch(`${window.API_BASE}${endpoint}`, { method: "DELETE" });
        return await res.json();
    };
}

// =========================================
// Message Helper
// =========================================
if (!window.showMessage) {
    window.showMessage = function (message, type = "info") {
        const container = document.createElement("div");
        container.className = `alert ${type}`;
        container.innerHTML = `<span>${message}</span>`;
        document.body.appendChild(container);
        setTimeout(() => container.remove(), 4000);
    };
}
