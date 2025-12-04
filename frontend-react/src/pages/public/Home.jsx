import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WhatsAppButton from '../../components/WhatsAppButton';
import '../../styles/popup.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupIcon, setShowPopupIcon] = useState(false);

  const slides = [
    '/images/photo1.jpeg',
    '/images/photo2.jpeg',
    '/images/photo3.jpeg',
    '/images/photo4.jpeg',
    '/images/photo5.jpeg',
    '/images/photo6.jpeg'
  ];

  // Show popup on page load
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
    if (!hasSeenPopup) {
      setTimeout(() => setShowPopup(true), 1000);
    } else {
      setShowPopupIcon(true);
    }
  }, []);

  // Slider interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const closePopup = () => {
    setShowPopup(false);
    setShowPopupIcon(true);
    sessionStorage.setItem('hasSeenPopup', 'true');
  };

  const openPopup = () => {
    setShowPopup(true);
    setShowPopupIcon(false);
  };

  return (
    <>
      <Header />

      {/* Welcome Popup */}
      {showPopup && (
        <div id="popup" style={{ display: 'flex' }}>
          <div className="popup-backdrop">
            <div className="popup-card">
              <button className="popup-close" onClick={closePopup}>&times;</button>
              <div className="popup-body">
                <h2 className="popup-title">🕌 Welcome to Madarsa Imdadul Uloom</h2>
                <p className="popup-text">Stay updated with our latest announcements.</p>

                <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <h4 style={{ color: '#2c5aa0', marginBottom: '10px' }}>📢 Announcements</h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, color: '#555' }}>
                    <li style={{ marginBottom: '8px' }}>🎓 <strong>Admission Open 2025-26</strong> - Apply Now!</li>
                    <li style={{ marginBottom: '8px' }}>📚 New Courses Coming Soon</li>
                    <li style={{ marginBottom: '8px' }}>🏆 Annual Results Announced</li>
                  </ul>
                </div>

                <div className="popup-actions">
                  <Link to="/admission" className="popup-btn popup-btn-primary" onClick={closePopup}>
                    Apply for Admission
                  </Link>
                  <Link to="/courses" className="popup-btn popup-btn-outline" onClick={closePopup}>
                    View Courses
                  </Link>
                  <button className="popup-btn popup-btn-outline" onClick={closePopup}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Announcement Button */}
      {showPopupIcon && (
        <button id="popup-icon" style={{ display: 'flex' }} onClick={openPopup} title="View Announcements">
          <i className="fas fa-bullhorn"></i>
        </button>
      )}
      
      {/* Hero Slider */}
      <section className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide})` }}
          />
        ))}
        
        <div className="hero-text">
          <h1 className="hero-title">Islamic Education with Modern Learning</h1>
          <p className="hero-subtext">
            Join Madarsa Imdadul Uloom for comprehensive Quranic studies, Hadith teachings, and modern skill-based education
          </p>
          <div className="hero-buttons">
            <Link to="/admission" className="btn btn-primary">Admission Now</Link>
            <Link to="/courses" className="btn btn-outline">View Courses</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-title">
            <h2>Our Comprehensive Programs</h2>
            <p>We offer balanced curriculum combining traditional Islamic education with modern skills</p>
          </div>
          <div className="features-grid">
            <FeatureCard icon="fa-quran" title="Quran & Tajweed" desc="Learn proper recitation of Holy Quran with qualified teachers" />
            <FeatureCard icon="fa-book" title="Hadith Studies" desc="Study teachings of Prophet Muhammad (PBUH) with authentic sources" />
            <FeatureCard icon="fa-laptop-code" title="Modern Education" desc="Combine Islamic education with modern subjects and skills" />
            <FeatureCard icon="fa-graduation-cap" title="Classes 1-10" desc="Complete educational program with Islamic values" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <StatItem number="100+" label="Students" />
            <StatItem number="10+" label="Qualified Teachers/Tech Engineer" />
            <StatItem number="13+" label="Years Experience" />
            <StatItem number="16+" label="Modern Courses" />
          </div>

          {/* Donation Box */}
          <DonationBox />
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section" style={{ padding: '4rem 0', background: '#1a2332' }}>
        <div className="container">
          <div className="section-title" style={{ color: '#fff' }}>
            <h2 style={{ color: '#fff' }}>Our Location</h2>
            <p style={{ color: '#ccc' }}>Visit us at Madarsa Imdadul Uloom, Gidhaur, Jharkhand</p>
          </div>
          <div className="map-container" style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            marginTop: '2rem'
          }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d365.23099686467584!2d85.0087248!3d24.1715836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f353ee68624823%3A0xe4cc80b2e8f2b64a!2s52C5%2BMGH%2C%20Gidhaur%2C%20Jharkhand%20825408!5e1!3m2!1sen!2sin!4v1731925639637!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Madarsa Location"
            ></iframe>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, desc }) => (
  <div className="feature-card">
    <div className="feature-icon">
      <i className={`fas ${icon}`}></i>
    </div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

// Stat Item Component
const StatItem = ({ number, label }) => (
  <div className="stat-item">
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);

// Donation Box Component
const DonationBox = () => (
  <div className="stat-item donation-summary-box">
    <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '28px' }}>
      Support the Madarsa – Give Sadaqah
    </h2>
    <div className="donation-grid">
      <div className="donation-hadees">
        <h3>Hadees About Sadaqah</h3>
        <p><strong>Arabic:</strong><br /> «قَالَ رَسُولُ اللَّهِ ﷺ : «مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ»</p>
        <p><strong>Urdu:</strong><br /> صدقہ دینے سے مال کبھی کم نہیں ہوتا۔</p>
        <p><strong>Hindi:</strong><br /> सदका देने से माल कभी कम नहीं होता।</p>
        <p><strong>English:</strong><br /> Charity does not decrease wealth. — <em>Sahih Muslim(2588)</em>.</p>
      </div>
      <div className="donation-bank">
        <h3>Bank Transfer</h3>
        <p><strong>Account:</strong> Trust Madarsa Imdadul Uloom</p>
        <p><strong>Number:</strong> 597420110000157</p>
        <p><strong>IFSC:</strong> BKID0005974</p>
      </div>
      <div className="donation-qr">
        <img 
          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=farsi8@ybl"
          alt="QR Code"
          className="qr-image"
        />
        <br />
        <Link to="/donation" className="donate-btn">Donate Now</Link>
      </div>
    </div>
  </div>
);

export default Home;

