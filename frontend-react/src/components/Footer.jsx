import { Link } from 'react-router-dom';
import { MADARSA_CONFIG } from '../config/config';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{MADARSA_CONFIG.name}</h3>
            <p>Providing quality Islamic education combined with modern skills since {MADARSA_CONFIG.established}.</p>
            <div className="social-links">
              <a href={MADARSA_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href={MADARSA_CONFIG.social.twitter} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href={MADARSA_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href={MADARSA_CONFIG.social.youtube} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/admission">Admission</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Info</h3>
            <ul>
              <li><i className="fas fa-map-marker-alt"></i> {MADARSA_CONFIG.contact.address}</li>
              <li><i className="fas fa-phone"></i> {MADARSA_CONFIG.contact.phone}</li>
              <li><i className="fas fa-envelope"></i> {MADARSA_CONFIG.contact.email}</li>
              <li><i className="fas fa-clock"></i> Established: {MADARSA_CONFIG.established}</li>
            </ul>
          </div>
        </div>
        
        <div className="copyright">
          <p>&copy; {MADARSA_CONFIG.established}-{new Date().getFullYear()} {MADARSA_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

