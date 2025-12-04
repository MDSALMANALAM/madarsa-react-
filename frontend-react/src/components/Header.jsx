import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MADARSA_CONFIG } from '../config/config';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path ? 'active' : '';
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span style={{ fontSize: '1.8rem' }}>🕌</span>
            <h1>{MADARSA_CONFIG.name}</h1>
          </div>
          
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          
          <nav id="mobileNav" className={mobileMenuOpen ? 'active' : ''}>
            <ul>
              <li><Link to="/" className={isActive('/')}>Home</Link></li>
              <li><Link to="/about" className={isActive('/about')}>About</Link></li>
              <li><Link to="/courses" className={isActive('/courses')}>Courses</Link></li>
              <li><Link to="/admission" className={isActive('/admission')}>Admission</Link></li>
              <li><Link to="/library" className={isActive('/library')}>Library</Link></li>
              <li><Link to="/donation" className={isActive('/donation')}>Donate</Link></li>
              <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>
            </ul>
          </nav>
          
          <div className="auth-buttons" id="mobileAuth">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

