import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet } from '../../services/api';
import '../../styles/dashboard.css';

const GeneralDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, totalTeachers: 0, totalStudents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadPublicData();
  }, []);

  const loadPublicData = async () => {
    try {
      setLoading(true);
      // Load public courses
      const coursesData = await apiGet('/courses/public');
      if (coursesData.success) {
        setCourses(coursesData.data || []);
        setStats(prev => ({ ...prev, totalCourses: (coursesData.data || []).length }));
      }
      // Load active teachers
      const teachersData = await apiGet('/teachers/active');
      if (teachersData.success) {
        setTeachers(teachersData.data || []);
        setStats(prev => ({ ...prev, totalTeachers: (teachersData.data || []).length }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getApprovalStatusBadge = () => {
    if (!user) return null;
    if (user.approved) {
      return <span className="badge bg-success">✓ Approved</span>;
    }
    return <span className="badge bg-warning text-dark">⏳ Pending Approval</span>;
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h4>🕌 Madarsa</h4>
          <p>General Portal</p>
        </div>
        <nav className="sidebar-nav">
          <a href="#overview" className="nav-link active"><i className="fas fa-home"></i><span>Overview</span></a>
          <a href="#courses" className="nav-link"><i className="fas fa-book"></i><span>Courses</span></a>
          <a href="#teachers" className="nav-link"><i className="fas fa-chalkboard-teacher"></i><span>Teachers</span></a>
          <Link to="/library" className="nav-link"><i className="fas fa-book-open"></i><span>Library</span></Link>
          <Link to="/admission" className="nav-link"><i className="fas fa-user-plus"></i><span>Admission</span></Link>
          <Link to="/donation" className="nav-link"><i className="fas fa-hand-holding-heart"></i><span>Donation</span></Link>
          <Link to="/contact" className="nav-link"><i className="fas fa-envelope"></i><span>Contact</span></Link>
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-outline-light w-100" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="header">
          <div className="header-left">
            <h2>Welcome, {user?.name || 'Guest'}!</h2>
            {getApprovalStatusBadge()}
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">{user?.name?.charAt(0) || 'G'}</div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'Guest User'}</span>
                <span className="user-role">{user?.userType || 'Member'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Notice */}
        {user && !user.approved && (
          <div className="alert alert-info mb-4">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Account Pending:</strong> Your account is awaiting admin approval. 
            You can browse public information. Full dashboard access will be granted after approval.
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(52, 152, 219, 0.2)', color: 'rgb(52, 152, 219)' }}>
              <i className="fas fa-book"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalCourses}</h3>
              <p>Available Courses</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(40, 167, 69, 0.2)', color: 'rgb(40, 167, 69)' }}>
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalTeachers}</h3>
              <p>Expert Teachers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(255, 193, 7, 0.2)', color: 'rgb(255, 193, 7)' }}>
              <i className="fas fa-mosque"></i>
            </div>
            <div className="stat-content">
              <h3>🕌</h3>
              <p>Madarsa Imdadul Uloom</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(220, 53, 69, 0.2)', color: 'rgb(220, 53, 69)' }}>
              <i className="fas fa-heart"></i>
            </div>
            <div className="stat-content">
              <h3>24/7</h3>
              <p>Online Support</p>
            </div>
          </div>
        </div>

        {/* Quick Links for Pending Users */}
        {user && !user.approved && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="dashboard-card">
                <div className="card-header"><h5>Quick Actions</h5></div>
                <div className="card-body">
                  <div className="quick-actions d-flex flex-wrap gap-2">
                    <Link to="/courses" className="btn btn-primary"><i className="fas fa-book me-2"></i>View All Courses</Link>
                    <Link to="/library" className="btn btn-outline-primary"><i className="fas fa-book-open me-2"></i>Browse Library</Link>
                    <Link to="/admission" className="btn btn-outline-primary"><i className="fas fa-user-plus me-2"></i>Apply for Admission</Link>
                    <Link to="/contact" className="btn btn-outline-primary"><i className="fas fa-envelope me-2"></i>Contact Us</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses Section */}
        <div className="row" id="courses">
          <div className="col-12">
            <div className="dashboard-card">
              <div className="card-header">
                <h5><i className="fas fa-book me-2"></i>Available Courses</h5>
                <Link to="/courses" className="btn btn-sm btn-primary">View All</Link>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4"><i className="fas fa-spinner fa-spin fa-2x"></i></div>
                ) : courses.length > 0 ? (
                  <div className="row">
                    {courses.slice(0, 6).map((course, idx) => (
                      <div className="col-md-4 mb-3" key={course.id || idx}>
                        <div className="card h-100">
                          <div className="card-body text-center">
                            <i className={`fas fa-${['quran', 'language', 'mosque', 'book', 'graduation-cap', 'pen'][idx % 6]} fa-3x mb-3`}
                               style={{ color: ['#3498db', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'][idx % 6] }}></i>
                            <h5>{course.name}</h5>
                            <p className="text-muted small">{course.description?.substring(0, 80) || 'Islamic Education Course'}...</p>
                            <span className="badge bg-primary">{course.duration || 'Ongoing'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-book fa-3x mb-3"></i>
                    <p>Courses will be available soon</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Section */}
        <div className="row mt-4" id="teachers">
          <div className="col-12">
            <div className="dashboard-card">
              <div className="card-header">
                <h5><i className="fas fa-chalkboard-teacher me-2"></i>Our Teachers</h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4"><i className="fas fa-spinner fa-spin fa-2x"></i></div>
                ) : teachers.length > 0 ? (
                  <div className="row">
                    {teachers.slice(0, 4).map((teacher, idx) => (
                      <div className="col-md-3 mb-3" key={teacher.id || idx}>
                        <div className="card text-center h-100">
                          <div className="card-body">
                            <div className="user-avatar mx-auto mb-3" style={{
                              width: '60px', height: '60px', fontSize: '1.5rem',
                              background: ['#3498db', '#27ae60', '#f39c12', '#9b59b6'][idx % 4]
                            }}>
                              {teacher.name?.charAt(0) || 'T'}
                            </div>
                            <h6>{teacher.name}</h6>
                            <p className="text-muted small mb-1">{teacher.subject || teacher.specialization || 'Islamic Studies'}</p>
                            <span className="badge bg-success">Active</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-chalkboard-teacher fa-3x mb-3"></i>
                    <p>Teacher information will be available soon</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Madarsa */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="dashboard-card h-100">
              <div className="card-header"><h5><i className="fas fa-info-circle me-2"></i>About Madarsa</h5></div>
              <div className="card-body">
                <p>Madarsa Imdadul Uloom is dedicated to providing quality Islamic education combining traditional teachings with modern methodology.</p>
                <ul className="list-unstyled">
                  <li><i className="fas fa-check text-success me-2"></i>Quran Memorization (Hifz)</li>
                  <li><i className="fas fa-check text-success me-2"></i>Arabic Language</li>
                  <li><i className="fas fa-check text-success me-2"></i>Islamic Studies</li>
                  <li><i className="fas fa-check text-success me-2"></i>Tajweed & Qirat</li>
                </ul>
                <Link to="/about" className="btn btn-outline-primary btn-sm">Learn More</Link>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="dashboard-card h-100">
              <div className="card-header"><h5><i className="fas fa-calendar-alt me-2"></i>Important Notices</h5></div>
              <div className="card-body">
                <div className="event-item primary mb-2">
                  <strong>Admissions Open 2024-25</strong>
                  <div className="text-muted small">Apply Now for New Session</div>
                </div>
                <div className="event-item success mb-2">
                  <strong>Quran Competition</strong>
                  <div className="text-muted small">Annual Hifz Competition - Coming Soon</div>
                </div>
                <div className="event-item warning mb-2">
                  <strong>Online Classes Available</strong>
                  <div className="text-muted small">Learn from anywhere</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default GeneralDashboard;

