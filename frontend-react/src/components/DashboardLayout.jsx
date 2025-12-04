import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const DashboardLayout = ({ title, menuItems, children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3><i className="fas fa-mosque"></i> Madarsa</h3>
          <p>{title}</p>
        </div>
        <div className="sidebar-menu">
          <ul>
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <a href="#" className={activeSection === item.id ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveSection(item.id); }}>
                  <i className={`fas fa-${item.icon}`}></i> <span>{item.label}</span>
                </a>
              </li>
            ))}
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="main-content">
        <div className="dashboard-header">
          <h2>{title}</h2>
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div>
              <strong>{user?.name || 'User'}</strong>
              <div className="text-muted">{user?.userType || 'Member'}</div>
            </div>
          </div>
        </div>
        {typeof children === 'function' ? children(activeSection) : children}
      </div>
    </div>
  );
};

export const StatCard = ({ icon, value, label, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `rgba(${color}, 0.2)`, color: `rgb(${color})` }}>
      <i className={`fas fa-${icon}`}></i>
    </div>
    <div className="stat-content">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

export const Card = ({ title, action, children }) => (
  <div className="dashboard-card">
    <div className="card-header">
      <h5>{title}</h5>
      {action && action}
    </div>
    <div className="card-body">{children}</div>
  </div>
);

export const Table = ({ headers, children }) => (
  <div className="table-responsive">
    <table className="table table-hover">
      <thead>
        <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export const Badge = ({ type, children }) => (
  <span className={`badge badge-${type}`}>{children}</span>
);

export const ProgressBar = ({ value, color = 'primary', label }) => (
  <div className="progress-item">
    {label && <div className="d-flex justify-content-between mb-1"><span>{label}</span><span>{value}%</span></div>}
    <div className="progress">
      <div className={`progress-bar bg-${color}`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default DashboardLayout;

