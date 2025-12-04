import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Styles
import './styles/style.css';
import './styles/popup.css';
import './styles/dashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Donation from './pages/public/Donation';
import Courses from './pages/public/Courses';
import Contact from './pages/public/Contact';
import Library from './pages/public/Library';
import Admission from './pages/public/Admission';
import AdmissionReceipt from './pages/public/AdmissionReceipt';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import GeneralDashboard from './pages/dashboard/GeneralDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/library" element={<Library />} />
        <Route path="/admission" element={<Admission />} />
        <Route path="/admission/receipt/:id" element={<AdmissionReceipt />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<GeneralDashboard />} />
        <Route path="/general-dashboard" element={<GeneralDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
