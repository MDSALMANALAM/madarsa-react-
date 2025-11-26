// frontend/js/admission.js

// Auto-detect environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE = isProduction
    ? `http://${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api';
console.log('🌐 Admission API_BASE:', API_BASE);

document.addEventListener("DOMContentLoaded", function () {
  const admissionForm = document.getElementById("admissionForm");
  if (!admissionForm) return;

  admissionForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validate required fields
    const requiredFields = admissionForm.querySelectorAll("[required]");
    let ok = true;
    requiredFields.forEach((f) => {
      if (!String(f.value || "").trim()) {
        ok = false;
        f.style.borderColor = "red";
      } else {
        f.style.borderColor = "#ddd";
      }
    });
    if (!ok) {
      showMessage("Please fill all required fields", "error");
      return;
    }

    // Prepare formData
    const formData = new FormData(admissionForm);

    // HTML field name = "class"
    // Backend required field = "className"
    if (formData.get("class")) {
      formData.set("className", formData.get("class"));
    }

    const submitBtn = admissionForm.querySelector('button[type="submit"]');
    const prev = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    try {
      // 🔥 CORRECT API ROUTE
      const response = await fetch(`${API_BASE}/admissions/submit`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Server Response:", data);

      if (!data.success) {
        showMessage(data.message || "Server error", "error");
      } else {
        showMessage("Admission form submitted successfully!", "success");
        admissionForm.reset();

        if (data.receiptUrl) {
          window.open(data.receiptUrl, "_blank");
        }
      }
    } catch (err) {
      console.error("Admission Submit Error:", err);
      showMessage("Network/Server error while submitting form", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = prev;
    }
  });
});
