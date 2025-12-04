import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WhatsAppButton from '../../components/WhatsAppButton';
import { apiPost } from '../../services/api';

const Donation = () => {
  const [formData, setFormData] = useState({
    amount: '',
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || formData.amount < 1) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const order = await apiPost('/donation/create-order', {
        amount: formData.amount,
        donorName: formData.name,
        donorEmail: formData.email,
        donorPhone: formData.phone
      });

      if (!order.orderId) {
        throw new Error(order.message || 'Failed to create order');
      }

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        alert('Payment system not loaded. Please refresh the page.');
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: order.razorpayKeyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Madarsa Imdadul Uloom',
        description: 'Donation for Islamic Education',
        image: '/images/logo.png',
        order_id: order.orderId,
        handler: async (response) => {
          try {
            const verifyResult = await apiPost('/donation/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyResult.success) {
              alert('✅ Thank you for your generous donation! May Allah bless you.');
              setFormData({ amount: '', name: '', email: '', phone: '' });
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            alert('Payment completed but verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#2c5aa0'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function(response) {
        alert('Payment failed: ' + response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Donation error:', error);
      alert('Error processing donation: ' + (error.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      
      <section className="page-hero">
        <div className="container">
          <h1>Support Our Mission</h1>
          <p>Your donations help us provide quality Islamic education</p>
        </div>
      </section>

      <section className="donation-section">
        <div className="container">
          <div className="donation-options">
            
            {/* Bank Transfer */}
            <div className="donation-option">
              <h3>Bank Transfer</h3>
              <div className="bank-details">
                <p><strong>Bank:</strong> Bank of India</p>
                <p><strong>Account Name:</strong> Trust Madarsa Imdadul Uloom</p>
                <p><strong>Account Number:</strong> 597420110000157</p>
                <p><strong>IFSC Code:</strong> BKID0005974</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="donation-option">
              <h3>QR Code Payment</h3>
              <div className="qr-code">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=farsi8@ybl" 
                  alt="UPI QR" 
                />
              </div>
            </div>

            {/* Online Donation Form */}
            <div className="donation-option">
              <h3>Online Donation</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="amount">Amount (₹)</label>
                  <input 
                    type="number" 
                    id="amount" 
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required 
                    min="100" 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Donate Now'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default Donation;

