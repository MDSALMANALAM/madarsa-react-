import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiPatch, apiDelete, apiUpload, apiDownload } from '../../services/api';
import '../../styles/dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState({ name: 'Admin', role: 'Administrator', initial: 'A' });
  
  // Data states
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, activeCourses: 0, monthlyRevenue: 0 });
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [parents, setParents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [libraryMaterials, setLibraryMaterials] = useState([]);
  const [financeData, setFinanceData] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  
  // Filter states
  const [admissionFilter, setAdmissionFilter] = useState('pending');
  const [financeYear, setFinanceYear] = useState(new Date().getFullYear());
  const [studentSearch, setStudentSearch] = useState('');
  const [currentStudentPage, setCurrentStudentPage] = useState(1);
  const studentsPerPage = 5;
  
  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  
  // Form states
  const [studentForm, setStudentForm] = useState({ name: '', class: '', parent: '', contact: '' });
  const [teacherForm, setTeacherForm] = useState({ name: '', subject: '', classes: '', contact: '' });
  const [incomeForm, setIncomeForm] = useState({ category: 'Zakat', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [expenseForm, setExpenseForm] = useState({ category: 'Teacher Salary', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [uploadForm, setUploadForm] = useState({ title: '', category: '', classLevel: '', description: '', file: null });

  // Approval stats
  const [approvalStats, setApprovalStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeSection === 'students') loadStudents();
    if (activeSection === 'teachers') loadTeachers();
    if (activeSection === 'admissions') loadAdmissions();
    if (activeSection === 'parents') loadParents();
    if (activeSection === 'courses') loadCourses();
    if (activeSection === 'finance') loadFinanceData();
    if (activeSection === 'library') loadLibraryMaterials();
    if (activeSection === 'userApprovals') loadPendingUsers();
  }, [activeSection]);

  const loadUserData = async () => {
    try {
      // Load from localStorage first
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || 'Admin',
          role: user.userType || 'Administrator',
          initial: user.name?.charAt(0) || 'A'
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      const data = await apiGet('/dashboard/admin');
      if (data.success) {
        setStats({
          totalStudents: data.data?.totalStudents || 0,
          totalTeachers: data.data?.totalTeachers || 0,
          activeCourses: data.data?.totalCourses || 0,
          monthlyRevenue: data.data?.totalDonations || 0,
          pendingApprovals: data.data?.pendingApprovals || 0,
          pendingAdmissions: data.data?.pendingAdmissions || 0,
          totalParents: data.data?.totalParents || 0,
          totalMaterials: data.data?.totalMaterials || 0
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await apiGet('/users/approval/pending');
      if (data.success) {
        const studentUsers = (data.data || []).filter(u => u.userType === 'STUDENT');
        setStudents(studentUsers);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await apiGet('/teachers');
      if (data.success) {
        setTeachers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadAdmissions = async () => {
    try {
      const data = await apiGet('/admission');
      if (data.success) {
        setAdmissions(data.data || []);
      }
    } catch (error) {
      console.error('Error loading admissions:', error);
    }
  };

  const loadParents = async () => {
    try {
      const data = await apiGet('/users/approval/pending');
      if (data.success) {
        const parentUsers = (data.data || []).filter(u => u.userType === 'PARENT');
        setParents(parentUsers);
      }
    } catch (error) {
      console.error('Error loading parents:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await apiGet('/courses');
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadFinanceData = async () => {
    try {
      const data = await apiGet('/finance');
      if (data.success) {
        setFinanceData(data.data || []);
      }
    } catch (error) {
      console.error('Error loading finance data:', error);
    }
  };

  const loadLibraryMaterials = async () => {
    try {
      const data = await apiGet('/library');
      if (data.success) {
        setLibraryMaterials(data.data || []);
      }
    } catch (error) {
      console.error('Error loading library:', error);
    }
  };

  const loadPendingUsers = async () => {
    try {
      const statsData = await apiGet('/users/approval/stats');
      if (statsData.success) {
        setApprovalStats(statsData.data || {});
      }
      const data = await apiGet('/users/approval/pending');
      if (data.success) {
        setPendingUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading pending users:', error);
    }
  };

  // CRUD Operations
  const handleAddStudent = async () => {
    if (!studentForm.name || !studentForm.class || !studentForm.parent || !studentForm.contact) {
      alert('Please fill all fields');
      return;
    }
    try {
      const data = await apiPost('/students', { ...studentForm, status: 'Active' });
      if (data.success) {
        setShowStudentModal(false);
        setStudentForm({ name: '', class: '', parent: '', contact: '' });
        loadStudents();
      }
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleUpdateStudent = async () => {
    try {
      const data = await apiPatch(`/students/${editingStudent.id}`, studentForm);
      if (data.success) {
        setShowStudentModal(false);
        setEditingStudent(null);
        setStudentForm({ name: '', class: '', parent: '', contact: '' });
        loadStudents();
      }
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const data = await apiDelete(`/students/${id}`);
        if (data.success) loadStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleAddTeacher = async () => {
    if (!teacherForm.name || !teacherForm.subject || !teacherForm.classes || !teacherForm.contact) {
      alert('Please fill all fields');
      return;
    }
    try {
      const data = await apiPost('/teachers', { ...teacherForm, status: 'Active' });
      if (data.success) {
        setShowTeacherModal(false);
        setTeacherForm({ name: '', subject: '', classes: '', contact: '' });
        loadTeachers();
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        const data = await apiDelete(`/teachers/${id}`);
        if (data.success) loadTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  const handleApproveAdmission = async (id) => {
    if (window.confirm('Approve this admission?')) {
      try {
        const data = await apiPost(`/admissions/approve/${id}`, {});
        if (data.success) loadAdmissions();
      } catch (error) {
        console.error('Error approving admission:', error);
      }
    }
  };

  const handleRejectAdmission = async (id) => {
    if (window.confirm('Reject this admission?')) {
      try {
        const data = await apiPost(`/admissions/reject/${id}`, {});
        if (data.success) loadAdmissions();
      } catch (error) {
        console.error('Error rejecting admission:', error);
      }
    }
  };

  const handleSaveIncome = async () => {
    try {
      const data = await apiPost('/finance/income', incomeForm);
      if (data.success) {
        setShowIncomeModal(false);
        setIncomeForm({ category: 'Zakat', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
        loadFinanceData();
      }
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const handleSaveExpense = async () => {
    try {
      const data = await apiPost('/finance/expense', expenseForm);
      if (data.success) {
        setShowExpenseModal(false);
        setExpenseForm({ category: 'Teacher Salary', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
        loadFinanceData();
      }
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        const data = await apiDelete(`/finance/${id}`);
        if (data.success) loadFinanceData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleUploadMaterial = async () => {
    if (!uploadForm.title || !uploadForm.category || !uploadForm.classLevel || !uploadForm.file) {
      alert('Please fill all required fields');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('category', uploadForm.category);
      formData.append('class_level', uploadForm.classLevel);
      formData.append('description', uploadForm.description);
      formData.append('file', uploadForm.file);
      formData.append('uploaded_by', currentUser.name);

      const data = await apiUpload('/library/upload', formData);
      if (data.success) {
        setShowUploadModal(false);
        setUploadForm({ title: '', category: '', classLevel: '', description: '', file: null });
        loadLibraryMaterials();
      }
    } catch (error) {
      console.error('Error uploading material:', error);
    }
  };

  const handleApproveUser = async (userId) => {
    if (window.confirm('Approve this user?')) {
      try {
        const data = await apiPost(`/users/approve/${userId}`, {});
        if (data.success) loadPendingUsers();
      } catch (error) {
        console.error('Error approving user:', error);
      }
    }
  };

  const handleRejectUser = async (userId) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      try {
        const data = await apiPost(`/users/reject/${userId}`, { reason });
        if (data.success) loadPendingUsers();
      } catch (error) {
        console.error('Error rejecting user:', error);
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Helper functions
  const getFilteredAdmissions = () => {
    if (admissionFilter === 'all') return admissions;
    return admissions.filter(a => a.status === admissionFilter);
  };

  const getFilteredStudents = () => {
    let filtered = students;
    if (studentSearch) {
      filtered = students.filter(s =>
        (s.name || s.full_name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.class || s.class_name || '').toLowerCase().includes(studentSearch.toLowerCase())
      );
    }
    const start = (currentStudentPage - 1) * studentsPerPage;
    return filtered.slice(start, start + studentsPerPage);
  };

  const getFinanceSummary = () => {
    let income = 0, expense = 0;
    financeData.forEach(item => {
      if (item.type === 'income') income += parseFloat(item.amount);
      if (item.type === 'expense') expense += parseFloat(item.amount);
    });
    const net = income - expense;
    const rate = income > 0 ? ((net / income) * 100).toFixed(1) : 0;
    return { income, expense, net, rate };
  };

  const classOptions = [
    { group: 'Primary (1-5)', options: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'] },
    { group: 'Middle (6-8)', options: ['Class 6', 'Class 7', 'Class 8'] },
    { group: 'Secondary (9-10)', options: ['Class 9', 'Class 10'] },
    { group: 'Islamic Studies', options: ['Quran Studies', 'Hadith Studies', 'Fiqh & Islamic Law', 'Seerah & History', 'Islamic Ethics & Character', 'Arabic Language'] }
  ];

  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { id: 'userApprovals', icon: 'fas fa-user-check', label: 'User Approvals', badge: approvalStats.pending },
    { id: 'whatsapp', icon: 'fab fa-whatsapp', label: 'WhatsApp' },
    { id: 'students', icon: 'fas fa-user-graduate', label: 'Students' },
    { id: 'admissions', icon: 'fas fa-file-alt', label: 'Admissions' },
    { id: 'teachers', icon: 'fas fa-chalkboard-teacher', label: 'Teachers' },
    { id: 'parents', icon: 'fas fa-users', label: 'Parents' },
    { id: 'courses', icon: 'fas fa-book', label: 'Courses' },
    { id: 'attendance', icon: 'fas fa-calendar-check', label: 'Attendance' },
    { id: 'finance', icon: 'fas fa-money-bill-wave', label: 'Finance' },
    { id: 'library', icon: 'fas fa-book-reader', label: 'Library' },
    { id: 'reports', icon: 'fas fa-chart-bar', label: 'Reports' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Settings' }
  ];

  // Render Dashboard Section
  const renderDashboard = () => (
    <div className="dashboard-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(52, 152, 219, 0.2)', color: 'var(--secondary)' }}>
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalStudents || 0}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(40, 167, 69, 0.2)', color: 'var(--success)' }}>
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalTeachers || 0}</h3>
            <p>Total Teachers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 193, 7, 0.2)', color: 'var(--warning)' }}>
            <i className="fas fa-book"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.activeCourses || 0}</h3>
            <p>Active Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(220, 53, 69, 0.2)', color: 'var(--danger)' }}>
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="stat-content">
            <h3>₹{(stats.monthlyRevenue || 0).toLocaleString()}</h3>
            <p>Monthly Revenue</p>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-8">
          <div className="dashboard-card">
            <div className="card-header">
              <h5>Recent Activities</h5>
            </div>
            <div className="card-body">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Activity</th>
                    <th>User</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length === 0 ? (
                    <tr><td colSpan="4" className="text-center text-muted">No recent activities</td></tr>
                  ) : activities.map((activity, idx) => (
                    <tr key={idx}>
                      <td><small>{new Date(activity.date).toLocaleDateString()}</small></td>
                      <td>{activity.activity}</td>
                      <td><small className="text-muted">{activity.user}</small></td>
                      <td>
                        <span className={`badge ${activity.status === 'Completed' ? 'bg-success' : activity.status === 'Pending' ? 'bg-warning' : 'bg-info'}`}>
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h5>Quick Actions</h5>
            </div>
            <div className="card-body">
              <button className="btn btn-primary w-100 mb-2" onClick={() => { setShowStudentModal(true); setEditingStudent(null); }}>
                <i className="fas fa-user-plus me-2"></i>Add Student
              </button>
              <button className="btn btn-success w-100 mb-2" onClick={() => { setShowTeacherModal(true); setEditingTeacher(null); }}>
                <i className="fas fa-chalkboard-teacher me-2"></i>Add Teacher
              </button>
              <button className="btn btn-info w-100 mb-2" onClick={() => setActiveSection('attendance')}>
                <i className="fas fa-calendar-check me-2"></i>Mark Attendance
              </button>
              <button className="btn btn-warning w-100" onClick={() => setActiveSection('finance')}>
                <i className="fas fa-money-bill-wave me-2"></i>View Finance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Students Section
  const renderStudents = () => (
    <div className="students-section">
      <div className="section-header d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-user-graduate me-2"></i>Students Management</h4>
        <button className="btn btn-primary" onClick={() => { setShowStudentModal(true); setEditingStudent(null); setStudentForm({ name: '', class: '', parent: '', contact: '' }); }}>
          <i className="fas fa-plus me-2"></i>Add Student
        </button>
      </div>

      <div className="dashboard-card">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <input type="text" className="form-control" placeholder="Search students..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
            </div>
          </div>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Parent</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredStudents().length === 0 ? (
                <tr><td colSpan="6" className="text-center text-muted">No students found</td></tr>
              ) : getFilteredStudents().map((student, idx) => (
                <tr key={student.id || idx}>
                  <td><strong>{student.name || student.full_name}</strong></td>
                  <td>{student.class || student.class_name}</td>
                  <td>{student.parent || student.parent_name}</td>
                  <td>{student.contact || student.phone}</td>
                  <td><span className={`badge ${student.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>{student.status || 'Active'}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setEditingStudent(student); setStudentForm({ name: student.name || student.full_name, class: student.class || student.class_name, parent: student.parent || student.parent_name, contact: student.contact || student.phone }); setShowStudentModal(true); }}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteStudent(student.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentStudentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentStudentPage(p => p - 1)}>Previous</button>
              </li>
              <li className="page-item active"><span className="page-link">{currentStudentPage}</span></li>
              <li className={`page-item ${getFilteredStudents().length < studentsPerPage ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentStudentPage(p => p + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );

  // Render Teachers Section
  const renderTeachers = () => (
    <div className="teachers-section">
      <div className="section-header d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-chalkboard-teacher me-2"></i>Teachers Management</h4>
        <button className="btn btn-success" onClick={() => { setShowTeacherModal(true); setEditingTeacher(null); setTeacherForm({ name: '', subject: '', classes: '', contact: '' }); }}>
          <i className="fas fa-plus me-2"></i>Add Teacher
        </button>
      </div>

      <div className="dashboard-card">
        <div className="card-body">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>Classes</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr><td colSpan="6" className="text-center text-muted">No teachers found</td></tr>
              ) : teachers.map((teacher, idx) => (
                <tr key={teacher.id || idx}>
                  <td><strong>{teacher.name}</strong></td>
                  <td>{teacher.subject}</td>
                  <td>{teacher.classes}</td>
                  <td>{teacher.contact || teacher.phone}</td>
                  <td><span className={`badge ${teacher.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>{teacher.status || 'Active'}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setEditingTeacher(teacher); setTeacherForm({ name: teacher.name, subject: teacher.subject, classes: teacher.classes, contact: teacher.contact || teacher.phone }); setShowTeacherModal(true); }}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTeacher(teacher.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Admissions Section
  const renderAdmissions = () => (
    <div className="admissions-section">
      <div className="section-header d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-file-alt me-2"></i>Admission Requests</h4>
        <div className="btn-group">
          {['pending', 'approved', 'rejected', 'all'].map(filter => (
            <button key={filter} className={`btn ${admissionFilter === filter ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setAdmissionFilter(filter)}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid mb-4">
        <div className="stat-card"><div className="stat-content"><h3>{admissions.filter(a => a.status === 'pending').length}</h3><p>Pending</p></div></div>
        <div className="stat-card"><div className="stat-content"><h3>{admissions.filter(a => a.status === 'approved').length}</h3><p>Approved</p></div></div>
        <div className="stat-card"><div className="stat-content"><h3>{admissions.filter(a => a.status === 'rejected').length}</h3><p>Rejected</p></div></div>
      </div>

      <div className="dashboard-card">
        <div className="card-body">
          <table className="table table-hover">
            <thead>
              <tr><th>Name</th><th>Class</th><th>Parent</th><th>Contact</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {getFilteredAdmissions().length === 0 ? (
                <tr><td colSpan="7" className="text-center text-muted">No admission requests</td></tr>
              ) : getFilteredAdmissions().map((adm, idx) => (
                <tr key={adm.id || idx}>
                  <td><strong>{adm.student_name || adm.name}</strong></td>
                  <td>{adm.class_applied || adm.class}</td>
                  <td>{adm.parent_name}</td>
                  <td>{adm.contact || adm.phone}</td>
                  <td><small>{new Date(adm.created_at || adm.date).toLocaleDateString()}</small></td>
                  <td><span className={`badge ${adm.status === 'approved' ? 'bg-success' : adm.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>{adm.status}</span></td>
                  <td>
                    {adm.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-success me-1" onClick={() => handleApproveAdmission(adm.id)}><i className="fas fa-check"></i></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleRejectAdmission(adm.id)}><i className="fas fa-times"></i></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Parents Section
  const renderParents = () => (
    <div className="parents-section">
      <div className="section-header d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-users me-2"></i>Parents Management</h4>
      </div>

      <div className="dashboard-card">
        <div className="card-body">
          <table className="table table-hover">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Children</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {parents.length === 0 ? (
                <tr><td colSpan="5" className="text-center text-muted">No parents found</td></tr>
              ) : parents.map((parent, idx) => (
                <tr key={parent.id || idx}>
                  <td><strong>{parent.name}</strong></td>
                  <td>{parent.email}</td>
                  <td>{parent.phone || parent.contact}</td>
                  <td>{parent.children || parent.students || '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-info me-1"><i className="fas fa-eye"></i></button>
                    <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Courses Section
  const renderCourses = () => (
    <div className="courses-section">
      <div className="section-header d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-book me-2"></i>Courses Management</h4>
      </div>

      <div className="row">
        {courses.length === 0 ? (
          <div className="col-12 text-center text-muted">No courses found</div>
        ) : courses.map((course, idx) => (
          <div className="col-md-4 mb-4" key={course.id || idx}>
            <div className="dashboard-card h-100">
              <div className="card-body">
                <h5 className="card-title">{course.name || course.title}</h5>
                <p className="text-muted">{course.description || 'No description'}</p>
                <div className="d-flex justify-content-between">
                  <span><i className="fas fa-users me-1"></i>{course.students || 0} Students</span>
                  <span><i className="fas fa-chalkboard-teacher me-1"></i>{course.teacher || 'TBA'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Finance Section
  const renderFinance = () => {
    const summary = getFinanceSummary();
    return (
      <div className="finance-section">
        <div className="section-header d-flex justify-content-between align-items-center mb-4">
          <h4><i className="fas fa-money-bill-wave me-2"></i>Finance Management</h4>
          <div>
            <select className="form-select d-inline-block w-auto me-2" value={financeYear} onChange={(e) => setFinanceYear(e.target.value)}>
              <option value="all">All Years</option>
              {[2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="btn btn-success me-2" onClick={() => setShowIncomeModal(true)}><i className="fas fa-plus me-1"></i>Add Income</button>
            <button className="btn btn-danger" onClick={() => setShowExpenseModal(true)}><i className="fas fa-minus me-1"></i>Add Expense</button>
          </div>
        </div>

        <div className="stats-grid mb-4">
          <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(40, 167, 69, 0.2)', color: 'var(--success)' }}><i className="fas fa-arrow-up"></i></div><div className="stat-content"><h3>₹{summary.income.toLocaleString()}</h3><p>Total Income</p></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(220, 53, 69, 0.2)', color: 'var(--danger)' }}><i className="fas fa-arrow-down"></i></div><div className="stat-content"><h3>₹{summary.expense.toLocaleString()}</h3><p>Total Expense</p></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(52, 152, 219, 0.2)', color: 'var(--secondary)' }}><i className="fas fa-balance-scale"></i></div><div className="stat-content"><h3>₹{summary.net.toLocaleString()}</h3><p>Net Balance</p></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(255, 193, 7, 0.2)', color: 'var(--warning)' }}><i className="fas fa-percentage"></i></div><div className="stat-content"><h3>{summary.rate}%</h3><p>Savings Rate</p></div></div>
        </div>

        <div className="dashboard-card">
          <div className="card-header"><h5>Transactions</h5></div>
          <div className="card-body">
            <table className="table table-hover">
              <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th><th>Actions</th></tr></thead>
              <tbody>
                {financeData.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted">No transactions found</td></tr>
                ) : financeData.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td><small>{new Date(item.date).toLocaleDateString()}</small></td>
                    <td><span className={`badge ${item.type === 'income' ? 'bg-success' : 'bg-danger'}`}>{item.type}</span></td>
                    <td>{item.category}</td>
                    <td>{item.description || '-'}</td>
                    <td className={item.type === 'income' ? 'text-success' : 'text-danger'}>{item.type === 'income' ? '+' : '-'}₹{parseFloat(item.amount).toLocaleString()}</td>
                    <td><button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTransaction(item.id)}><i className="fas fa-trash"></i></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Library Section
  const renderLibrary = () => (
    <div className="library-section">
      <div className="section-header d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-book-reader me-2"></i>Library Management</h4>
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}><i className="fas fa-upload me-2"></i>Upload Material</button>
      </div>

      <div className="dashboard-card">
        <div className="card-body">
          <table className="table table-hover">
            <thead><tr><th>Title</th><th>Category</th><th>Class</th><th>Type</th><th>Downloads</th><th>Uploaded By</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {libraryMaterials.length === 0 ? (
                <tr><td colSpan="8" className="text-center text-muted">No materials found</td></tr>
              ) : libraryMaterials.map((material, idx) => (
                <tr key={material.id || idx}>
                  <td><i className="fas fa-file-pdf text-danger me-2"></i>{material.title}</td>
                  <td><span className="badge bg-primary">{material.category}</span></td>
                  <td>{material.class_level}</td>
                  <td>{material.file_type || 'PDF'}</td>
                  <td><span className="badge bg-success">{material.download_count || 0}</span></td>
                  <td>{material.uploaded_by || 'Admin'}</td>
                  <td><small>{new Date(material.created_at).toLocaleDateString()}</small></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1"><i className="fas fa-download"></i></button>
                    <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Attendance Section
  const renderAttendance = () => (
    <div className="attendance-section">
      <div className="section-header mb-4">
        <h4><i className="fas fa-calendar-check me-2"></i>Attendance Management</h4>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="dashboard-card">
            <div className="card-header"><h5>Mark Daily Attendance</h5></div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Select Type</label>
                  <select className="form-select"><option value="student">Student</option><option value="teacher">Teacher</option></select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Select Class</label>
                <select className="form-select">
                  {classOptions.map(group => (
                    <optgroup key={group.group} label={group.group}>
                      {group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary w-100">Load Students</button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-card">
            <div className="card-header"><h5>Monthly Report</h5></div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Select Month</label>
                <select className="form-select">
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-info w-100">Generate Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Report download handlers
  const downloadReport = async (type) => {
    const reportTypes = {
      students: { endpoint: '/reports/students', filename: 'student_report.xlsx' },
      teachers: { endpoint: '/reports/teachers', filename: 'teacher_report.xlsx' },
      finance: { endpoint: '/reports/finance', filename: 'finance_report.xlsx' },
      admissions: { endpoint: '/reports/admissions', filename: 'admission_report.xlsx' },
      donations: { endpoint: '/reports/donations', filename: 'donation_report.xlsx' }
    };

    const report = reportTypes[type];
    if (report) {
      await apiDownload(report.endpoint, report.filename);
    }
  };

  // Render Reports Section
  const renderReports = () => (
    <div className="reports-section">
      <div className="section-header mb-4">
        <h4><i className="fas fa-chart-bar me-2"></i>Reports</h4>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="dashboard-card h-100">
            <div className="card-body text-center">
              <i className="fas fa-user-graduate fa-3x text-primary mb-3"></i>
              <h5>Student Report</h5>
              <p className="text-muted">Download all students data in Excel format</p>
              <button className="btn btn-primary" onClick={() => downloadReport('students')}>
                <i className="fas fa-download me-2"></i>Download
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="dashboard-card h-100">
            <div className="card-body text-center">
              <i className="fas fa-chalkboard-teacher fa-3x text-success mb-3"></i>
              <h5>Teacher Report</h5>
              <p className="text-muted">Download all teachers data in Excel format</p>
              <button className="btn btn-success" onClick={() => downloadReport('teachers')}>
                <i className="fas fa-download me-2"></i>Download
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="dashboard-card h-100">
            <div className="card-body text-center">
              <i className="fas fa-money-bill-wave fa-3x text-warning mb-3"></i>
              <h5>Financial Report</h5>
              <p className="text-muted">Download income/expense summary in Excel</p>
              <button className="btn btn-warning" onClick={() => downloadReport('finance')}>
                <i className="fas fa-download me-2"></i>Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="dashboard-card h-100">
            <div className="card-body text-center">
              <i className="fas fa-file-alt fa-3x text-info mb-3"></i>
              <h5>Admission Report</h5>
              <p className="text-muted">Download all admission applications</p>
              <button className="btn btn-info" onClick={() => downloadReport('admissions')}>
                <i className="fas fa-download me-2"></i>Download
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="dashboard-card h-100">
            <div className="card-body text-center">
              <i className="fas fa-hand-holding-heart fa-3x text-danger mb-3"></i>
              <h5>Donation Report</h5>
              <p className="text-muted">Download all donations data</p>
              <button className="btn btn-danger" onClick={() => downloadReport('donations')}>
                <i className="fas fa-download me-2"></i>Download
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="dashboard-card h-100">
            <div className="card-body text-center">
              <i className="fas fa-file-excel fa-3x text-secondary mb-3"></i>
              <h5>All Reports</h5>
              <p className="text-muted">Download all reports in one click</p>
              <button className="btn btn-secondary" onClick={() => {
                downloadReport('students');
                downloadReport('teachers');
                downloadReport('finance');
              }}>
                <i className="fas fa-download me-2"></i>Download All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Settings Section
  const renderSettings = () => (
    <div className="settings-section">
      <div className="section-header mb-4">
        <h4><i className="fas fa-cog me-2"></i>Settings</h4>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <div className="card-header"><h5>General Settings</h5></div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label">Madarsa Name</label><input type="text" className="form-control" defaultValue="Madarsa Imdadul Uloom" /></div>
              <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" defaultValue="info@madarsaimdadululoom.com" /></div>
              <div className="mb-3"><label className="form-label">Contact</label><input type="text" className="form-control" defaultValue="+91 9876543210" /></div>
              <div className="mb-3"><label className="form-label">Address</label><textarea className="form-control" rows="2" defaultValue="123 Main Street, City, State"></textarea></div>
              <button className="btn btn-primary">Save General Settings</button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <div className="card-header"><h5>Academic Settings</h5></div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label">Academic Year</label><input type="text" className="form-control" defaultValue="2024-2025" /></div>
              <div className="mb-3"><label className="form-label">Class Duration (minutes)</label><input type="number" className="form-control" defaultValue="45" /></div>
              <div className="mb-3"><label className="form-label">Attendance Time</label><input type="time" className="form-control" defaultValue="08:00" /></div>
              <button className="btn btn-primary">Save Academic Settings</button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <div className="card-header"><h5>Notification Settings</h5></div>
            <div className="card-body">
              <div className="form-check mb-3"><input type="checkbox" className="form-check-input" id="emailNotif" defaultChecked /><label className="form-check-label" htmlFor="emailNotif">Email Notifications</label></div>
              <div className="form-check mb-3"><input type="checkbox" className="form-check-input" id="smsNotif" /><label className="form-check-label" htmlFor="smsNotif">SMS Notifications</label></div>
              <div className="form-check mb-3"><input type="checkbox" className="form-check-input" id="parentNotif" defaultChecked /><label className="form-check-label" htmlFor="parentNotif">Parent Notifications</label></div>
              <button className="btn btn-primary">Save Notification Settings</button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="dashboard-card">
            <div className="card-header"><h5>Security Settings</h5></div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label">Session Timeout (minutes)</label><input type="number" className="form-control" defaultValue="30" /></div>
              <div className="form-check mb-3"><input type="checkbox" className="form-check-input" id="twoFactor" /><label className="form-check-label" htmlFor="twoFactor">Two-Factor Authentication</label></div>
              <button className="btn btn-primary">Save Security Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render WhatsApp Section
  const renderWhatsApp = () => (
    <div className="whatsapp-section">
      <div className="section-header mb-4">
        <h4><i className="fab fa-whatsapp me-2"></i>WhatsApp Integration</h4>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="dashboard-card">
            <div className="card-header"><h5>Connection Status</h5></div>
            <div className="card-body text-center">
              <span className="badge bg-secondary fs-5 mb-3">⚠️ Checking...</span>
              <p className="text-muted">WhatsApp Cloud API Status</p>
              <button className="btn btn-success me-2"><i className="fas fa-sync me-1"></i>Refresh Status</button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-card">
            <div className="card-header"><h5>Send Test Message</h5></div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label">Phone Number</label><input type="text" className="form-control" placeholder="91XXXXXXXXXX" /></div>
              <div className="mb-3"><label className="form-label">Message</label><textarea className="form-control" rows="3" placeholder="Enter test message..."></textarea></div>
              <button className="btn btn-success w-100"><i className="fab fa-whatsapp me-2"></i>Send Test Message</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render User Approvals Section
  const renderUserApprovals = () => (
    <div className="user-approvals-section">
      <div className="section-header mb-4">
        <h4><i className="fas fa-user-check me-2"></i>User Approvals</h4>
      </div>

      <div className="stats-grid mb-4">
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(255, 193, 7, 0.2)', color: 'var(--warning)' }}><i className="fas fa-clock"></i></div><div className="stat-content"><h3>{approvalStats.pending || 0}</h3><p>Pending</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(40, 167, 69, 0.2)', color: 'var(--success)' }}><i className="fas fa-check"></i></div><div className="stat-content"><h3>{approvalStats.approved || 0}</h3><p>Approved</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(220, 53, 69, 0.2)', color: 'var(--danger)' }}><i className="fas fa-times"></i></div><div className="stat-content"><h3>{approvalStats.rejected || 0}</h3><p>Rejected</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(52, 152, 219, 0.2)', color: 'var(--secondary)' }}><i className="fas fa-users"></i></div><div className="stat-content"><h3>{approvalStats.total || 0}</h3><p>Total</p></div></div>
      </div>

      <div className="dashboard-card">
        <div className="card-header"><h5>Pending Approval Requests</h5></div>
        <div className="card-body">
          <table className="table table-hover">
            <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Type</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {pendingUsers.length === 0 ? (
                <tr><td colSpan="6" className="text-center text-muted">No pending approval requests</td></tr>
              ) : pendingUsers.map((user, idx) => (
                <tr key={user._id || idx}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.mobile}</td>
                  <td><span className={`badge bg-${user.userType === 'student' ? 'primary' : user.userType === 'teacher' ? 'info' : 'secondary'}`}>{user.userType}</span></td>
                  <td><small>{new Date(user.createdAt).toLocaleDateString()}</small></td>
                  <td>
                    <button className="btn btn-sm btn-success me-1" onClick={() => handleApproveUser(user._id)}><i className="fas fa-check"></i> Approve</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleRejectUser(user._id)}><i className="fas fa-times"></i> Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render active section
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'students': return renderStudents();
      case 'teachers': return renderTeachers();
      case 'admissions': return renderAdmissions();
      case 'parents': return renderParents();
      case 'courses': return renderCourses();
      case 'finance': return renderFinance();
      case 'library': return renderLibrary();
      case 'attendance': return renderAttendance();
      case 'reports': return renderReports();
      case 'settings': return renderSettings();
      case 'whatsapp': return renderWhatsApp();
      case 'userApprovals': return renderUserApprovals();
      default: return renderDashboard();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h4>🕌 Madarsa</h4>
          <p>Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <a key={item.id} href="#" className={`nav-link ${activeSection === item.id ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveSection(item.id); }}>
              <i className={item.icon}></i>
              <span>{item.label}</span>
              {item.badge > 0 && <span className="badge bg-danger ms-auto">{item.badge}</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-outline-light w-100" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h5 className="mb-0">{menuItems.find(m => m.id === activeSection)?.label || 'Dashboard'}</h5>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">{currentUser.initial}</div>
              <div className="user-details">
                <span className="user-name">{currentUser.name}</span>
                <small className="user-role">{currentUser.role}</small>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {renderSection()}
        </div>
      </main>

      {/* Student Modal */}
      {showStudentModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingStudent ? 'Edit Student' : 'Add Student'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowStudentModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label">Name</label><input type="text" className="form-control" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} /></div>
                <div className="mb-3"><label className="form-label">Class</label>
                  <select className="form-select" value={studentForm.class} onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}>
                    <option value="">Select Class</option>
                    {classOptions.map(group => <optgroup key={group.group} label={group.group}>{group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</optgroup>)}
                  </select>
                </div>
                <div className="mb-3"><label className="form-label">Parent Name</label><input type="text" className="form-control" value={studentForm.parent} onChange={(e) => setStudentForm({ ...studentForm, parent: e.target.value })} /></div>
                <div className="mb-3"><label className="form-label">Contact</label><input type="text" className="form-control" value={studentForm.contact} onChange={(e) => setStudentForm({ ...studentForm, contact: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStudentModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={editingStudent ? handleUpdateStudent : handleAddStudent}>{editingStudent ? 'Update' : 'Add'} Student</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Modal */}
      {showTeacherModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowTeacherModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label">Name</label><input type="text" className="form-control" value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} /></div>
                <div className="mb-3"><label className="form-label">Subject</label><input type="text" className="form-control" value={teacherForm.subject} onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })} /></div>
                <div className="mb-3"><label className="form-label">Classes</label><input type="text" className="form-control" value={teacherForm.classes} onChange={(e) => setTeacherForm({ ...teacherForm, classes: e.target.value })} /></div>
                <div className="mb-3"><label className="form-label">Contact</label><input type="text" className="form-control" value={teacherForm.contact} onChange={(e) => setTeacherForm({ ...teacherForm, contact: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTeacherModal(false)}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={handleAddTeacher}>{editingTeacher ? 'Update' : 'Add'} Teacher</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title"><i className="fas fa-plus me-2"></i>Add Income</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowIncomeModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label">Category</label>
                  <select className="form-select" value={incomeForm.category} onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}>
                    <option value="Zakat">Zakat</option>
                    <option value="Sadaqah">Sadaqah</option>
                    <option value="Donation">Donation</option>
                    <option value="Fees">Fees</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="mb-3"><label className="form-label">Amount (₹)</label><input type="number" className="form-control" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })} /></div>
                <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="2" value={incomeForm.description} onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}></textarea></div>
                <div className="mb-3"><label className="form-label">Date</label><input type="date" className="form-control" value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowIncomeModal(false)}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={handleSaveIncome}>Save Income</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title"><i className="fas fa-minus me-2"></i>Add Expense</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowExpenseModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label">Category</label>
                  <select className="form-select" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                    <option value="Teacher Salary">Teacher Salary</option>
                    <option value="Staff Salary">Staff Salary</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Books & Materials">Books & Materials</option>
                    <option value="Events">Events</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="mb-3"><label className="form-label">Amount (₹)</label><input type="number" className="form-control" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></div>
                <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="2" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}></textarea></div>
                <div className="mb-3"><label className="form-label">Date</label><input type="date" className="form-control" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleSaveExpense}>Save Expense</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Material Modal */}
      {showUploadModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="fas fa-upload me-2"></i>Upload Material</h5>
                <button type="button" className="btn-close" onClick={() => setShowUploadModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label">Title</label><input type="text" className="form-control" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} /></div>
                <div className="mb-3"><label className="form-label">Category</label>
                  <select className="form-select" value={uploadForm.category} onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}>
                    <option value="">Select Category</option>
                    <option value="Quran">Quran</option>
                    <option value="Hadith">Hadith</option>
                    <option value="Fiqh">Fiqh</option>
                    <option value="Arabic">Arabic</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="mb-3"><label className="form-label">Class Level</label>
                  <select className="form-select" value={uploadForm.classLevel} onChange={(e) => setUploadForm({ ...uploadForm, classLevel: e.target.value })}>
                    <option value="">Select Class</option>
                    {classOptions.map(group => <optgroup key={group.group} label={group.group}>{group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</optgroup>)}
                  </select>
                </div>
                <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="2" value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}></textarea></div>
                <div className="mb-3"><label className="form-label">File (Max 10MB)</label><input type="file" className="form-control" onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleUploadMaterial}>Upload</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

