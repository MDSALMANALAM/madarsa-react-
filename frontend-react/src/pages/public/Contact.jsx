import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WhatsAppButton from '../../components/WhatsAppButton';
import { apiPost } from '../../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '', newsletter: false });
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost('/contact/submit', formData);
      alert('✅ Message sent successfully!');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '', newsletter: false });
    } catch (error) {
      alert('❌ Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { q: 'What are the admission requirements?', a: 'Admission requires a completed application form, previous academic records, and an interview with our admission committee. Specific requirements may vary by class level.' },
    { q: 'What is the fee structure?', a: 'Our fee structure varies by class and program. We offer flexible payment plans and scholarships for deserving students. Please contact our admission office for detailed fee information.' },
    { q: 'Do you offer online classes?', a: 'Yes, we offer both online and offline classes. Our online platform provides live interactive sessions with qualified teachers and access to digital learning resources.' },
    { q: 'What are the school timings?', a: 'Regular school hours are from 8:00 AM to 2:00 PM, Monday through Friday. Evening classes for working students are available from 5:00 PM to 8:00 PM.' }
  ];

  return (
    <>
      <Header />
      <section className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Get in touch with us for any queries or information</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-container">
            <div className="contact-info">
              <div className="contact-header">
                <h2>Get In Touch</h2>
                <p>We're here to help and answer any questions you might have.</p>
              </div>
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-icon"><i className="fas fa-map-marker-alt"></i></div>
                  <div className="contact-details"><h3>Visit Us</h3><p>Ratanpur, Gidhor<br />Chatra, Jharkhand, 825408</p></div>
                </div>
                <div className="contact-method">
                  <div className="contact-icon"><i className="fas fa-phone-alt"></i></div>
                  <div className="contact-details"><h3>Call Us</h3><p>+91 9430194563<br />+91 9304767815</p></div>
                </div>
                <div className="contact-method">
                  <div className="contact-icon"><i className="fas fa-envelope"></i></div>
                  <div className="contact-details"><h3>Email Us</h3><p>info@madarsaiu.com<br />support@madarsaiu.com</p></div>
                </div>
                <div className="contact-method">
                  <div className="contact-icon"><i className="fas fa-clock"></i></div>
                  <div className="contact-details"><h3>Working Hours</h3><p>Monday - Friday: 8:00 AM - 6:00 PM<br />Saturday: 8:00 AM - 2:00 PM</p></div>
                </div>
              </div>
              <div className="social-contact">
                <h3>Follow Us</h3>
                <div className="social-links">
                  <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                  <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
                  <a href="#" className="social-link"><i className="fab fa-youtube"></i></a>
                  <a href="#" className="social-link"><i className="fab fa-whatsapp"></i></a>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <div className="contact-form-card">
                <h3>Send us a Message</h3>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input type="text" className="form-control" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input type="text" className="form-control" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Subject *</label>
                    <select className="form-control" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required>
                      <option value="">Select a subject</option>
                      <option value="admission">Admission Inquiry</option>
                      <option value="courses">Course Information</option>
                      <option value="fees">Fee Structure</option>
                      <option value="donation">Donation Related</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Message *</label>
                    <textarea className="form-control" rows="6" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required></textarea>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-group">
                      <input type="checkbox" checked={formData.newsletter} onChange={e => setFormData({...formData, newsletter: e.target.checked})} />
                      <span>Subscribe to our newsletter for updates</span>
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    <i className={loading ? "fas fa-spinner fa-spin" : "fas fa-paper-plane"}></i> {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="map-section">
        <div className="container">
          <div className="section-title"><h2>Find Us Here</h2><p>Visit our campus for more information</p></div>
          <div className="map-container" style={{ margin: '20px 0' }}>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d365.23099686467584!2d85.0087248!3d24.1715836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f353ee68624823%3A0xe4cc80b2e8f2b64a!2s52C5%2BMGH%2C%20Gidhaur%2C%20Jharkhand%20825408!5e1!3m2!1sen!2sin!4v1731925639637!5m2!1sen!2sin" width="100%" height="300" style={{ border: 0, borderRadius: '10px' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="container">
          <div className="section-title"><h2>Frequently Asked Questions</h2><p>Quick answers to common questions</p></div>
          <div className="faq-container">
            {faqs.map((faq, idx) => (
              <div className={`faq-item ${openFaq === idx ? 'active' : ''}`} key={idx}>
                <div className="faq-question" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                  <h3>{faq.q}</h3>
                  <i className={`fas fa-chevron-${openFaq === idx ? 'up' : 'down'}`}></i>
                </div>
                {openFaq === idx && <div className="faq-answer"><p>{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="emergency-contact">
        <div className="container">
          <div className="emergency-card">
            <div className="emergency-icon"><i className="fas fa-exclamation-triangle"></i></div>
            <div className="emergency-content">
              <h3>Emergency Contact</h3>
              <p>For urgent matters outside working hours, please call our emergency helpline:</p>
              <div className="emergency-number"><i className="fas fa-phone"></i><span>+91 9304767815</span></div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default Contact;

