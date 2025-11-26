// Auto-detect environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

const API_BASE = isProduction
    ? `http://${window.location.hostname}/api`   // 🔥 FIXED (no :5000)
    : 'http://localhost:5000/api';

console.log("🌐 FIXED Donation API_BASE:", API_BASE);

document.getElementById("donationForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const amount = document.getElementById("donationAmount").value;
    const name = document.getElementById("donorName").value;
    const email = document.getElementById("donorEmail").value;
    const phone = document.getElementById("donorPhone").value;

    const response = await fetch(`${API_BASE}/donation/create-order`, {   // 🔥 FIXED
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            donorName: name,
            donorEmail: email,
            donorPhone: phone,
            amount
        })
    });

    const data = await response.json();
    console.log("ORDER:", data);

    if (!data.success) {
        alert("❌ Server issue: Order not created.");
        return;
    }

    const options = {
        key: "rzp_test_RblgQ2X8PdXSRw",
        amount: data.order.amount,
        currency: "INR",
        name: "Madarsa Imdadul Uloom",
        description: "Donation Payment",
        order_id: data.order.id,
        handler: async function (response) {

            // 🔥 FIXED verify-payment URL
            await fetch(`${API_BASE}/donation/verify-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    donationId: data.donationId
                }),
            });

            alert("✅ Payment Successful! JazakAllah Khair ❤️");
            window.location.reload();
        },
        prefill: { name, email, contact: phone },
        theme: { color: "#0C8E54" },
    };

    new Razorpay(options).open();
});
