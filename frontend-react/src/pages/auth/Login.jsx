import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../../services/api';
import '../../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(1); // 1: Email, 2: Mobile, 3: OTP
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [emailStored, setEmailStored] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '', passwordEmail: '', rememberEmail: false,
    mobile: '', passwordMobile: '', rememberMobile: false,
    emailOTP: '', otp: ''
  });
  
  const [showPassword, setShowPassword] = useState({ email: false, mobile: false });

  useEffect(() => {
    // Load remembered credentials
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedMobile = localStorage.getItem('rememberedMobile');
    if (rememberedEmail) setFormData(prev => ({ ...prev, email: rememberedEmail, rememberEmail: true }));
    if (rememberedMobile) setFormData(prev => ({ ...prev, mobile: rememberedMobile, rememberMobile: true }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const redirectToDashboard = (user) => {
    // If user is not approved, redirect to general dashboard
    if (!user.approved && user.userType !== 'ADMIN') {
      navigate('/general-dashboard');
      return;
    }
    // Map userType to dashboard routes
    const userType = (user.userType || '').toLowerCase();
    const routes = {
      admin: '/admin-dashboard',
      teacher: '/teacher-dashboard',
      parent: '/parent-dashboard',
      student: '/student-dashboard'
    };
    navigate(routes[userType] || '/general-dashboard');
  };

  const handleLoginSuccess = (data, identifier, mode) => {
    if (mode === 1 && formData.rememberEmail) localStorage.setItem('rememberedEmail', identifier);
    if (mode === 2 && formData.rememberMobile) localStorage.setItem('rememberedMobile', identifier);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    redirectToDashboard(data.user);
  };

  const loginEmailPass = async () => {
    if (!formData.email || !formData.passwordEmail) return alert('Please fill all fields');
    setLoading(true);
    try {
      const data = await apiPost('/auth/login-email', { email: formData.email, password: formData.passwordEmail });
      if (!data.success) {
        alert(data.approvalStatus === 'pending' ? `⏳ ${data.message}\n\nPlease wait for admin approval.` : data.message);
        return;
      }
      handleLoginSuccess(data, formData.email, 1);
    } catch (error) { alert('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const loginMobilePass = async () => {
    if (!formData.mobile || !formData.passwordMobile) return alert('Please fill all fields');
    setLoading(true);
    try {
      const data = await apiPost('/auth/login-mobile', { mobile: formData.mobile, password: formData.passwordMobile });
      if (!data.success) {
        alert(data.approvalStatus === 'pending' ? `⏳ ${data.message}\n\nPlease wait for admin approval.` : data.message);
        return;
      }
      handleLoginSuccess(data, formData.mobile, 2);
    } catch (error) { alert('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const sendLoginOTP = async () => {
    if (!formData.emailOTP) return alert('Please enter your email');
    setLoading(true);
    try {
      const data = await apiPost('/auth/send-login-otp', { email: formData.emailOTP });
      if (!data.success) return alert(data.message || 'Failed to send OTP');
      setEmailStored(formData.emailOTP);
      setShowOtpInput(true);
    } catch (error) { alert('Failed to send OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const verifyLoginOTP = async () => {
    if (!formData.otp) return alert('Please enter the OTP');
    setLoading(true);
    try {
      const data = await apiPost('/auth/verify-otp-login', { email: emailStored, otp: formData.otp });
      if (!data.success) return alert(data.message || 'Invalid OTP');
      alert('✅ Login Successful');
      handleLoginSuccess(data, emailStored, 3);
    } catch (error) { alert('OTP verification failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2><i className="fas fa-user-graduate"></i> Login</h2>
        
        <div className="mode-switch">
          <button className={mode === 1 ? 'active' : ''} onClick={() => { setMode(1); setShowOtpInput(false); }}>
            <i className="fas fa-envelope"></i> Email
          </button>
          <button className={mode === 2 ? 'active' : ''} onClick={() => { setMode(2); setShowOtpInput(false); }}>
            <i className="fas fa-mobile-alt"></i> Mobile
          </button>
          <button className={mode === 3 ? 'active' : ''} onClick={() => { setMode(3); setShowOtpInput(false); }}>
            <i className="fas fa-key"></i> Email OTP
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {mode === 1 && <EmailPassSection formData={formData} handleChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} onSubmit={loginEmailPass} loading={loading} />}
          {mode === 2 && <MobilePassSection formData={formData} handleChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} onSubmit={loginMobilePass} loading={loading} />}
          {mode === 3 && <OTPSection formData={formData} handleChange={handleChange} showOtpInput={showOtpInput} onSendOTP={sendLoginOTP} onVerifyOTP={verifyLoginOTP} loading={loading} />}
        </form>

        <div className="register-link">
          Don't have an account? <Link to="/register">Sign up now</Link>
        </div>
      </div>
    </div>
  );
};

const EmailPassSection = ({ formData, handleChange, showPassword, setShowPassword, onSubmit, loading }) => (
  <div id="emailPassSection">
    <div className="input-group">
      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter Email" required />
      <i className="fas fa-envelope input-icon"></i>
    </div>
    <div className="input-group">
      <input type={showPassword.email ? 'text' : 'password'} name="passwordEmail" value={formData.passwordEmail} onChange={handleChange} placeholder="Enter Password" required />
      <i className={`fas ${showPassword.email ? 'fa-eye-slash' : 'fa-eye'} input-icon`} onClick={() => setShowPassword(p => ({ ...p, email: !p.email }))}></i>
    </div>
    <div className="remember-forgot">
      <label className="remember-me"><input type="checkbox" name="rememberEmail" checked={formData.rememberEmail} onChange={handleChange} /> Remember me</label>
      <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
    </div>
    <button type="button" className="btn" onClick={onSubmit} disabled={loading}><i className="fas fa-sign-in-alt"></i> {loading ? 'Loading...' : 'Login'}</button>
  </div>
);

const MobilePassSection = ({ formData, handleChange, showPassword, setShowPassword, onSubmit, loading }) => (
  <div id="mobilePassSection">
    <div className="input-group">
      <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Enter Mobile Number" required />
      <i className="fas fa-mobile-alt input-icon"></i>
    </div>
    <div className="input-group">
      <input type={showPassword.mobile ? 'text' : 'password'} name="passwordMobile" value={formData.passwordMobile} onChange={handleChange} placeholder="Enter Password" required />
      <i className={`fas ${showPassword.mobile ? 'fa-eye-slash' : 'fa-eye'} input-icon`} onClick={() => setShowPassword(p => ({ ...p, mobile: !p.mobile }))}></i>
    </div>
    <div className="remember-forgot">
      <label className="remember-me"><input type="checkbox" name="rememberMobile" checked={formData.rememberMobile} onChange={handleChange} /> Remember me</label>
      <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
    </div>
    <button type="button" className="btn" onClick={onSubmit} disabled={loading}><i className="fas fa-sign-in-alt"></i> {loading ? 'Loading...' : 'Login'}</button>
  </div>
);

const OTPSection = ({ formData, handleChange, showOtpInput, onSendOTP, onVerifyOTP, loading }) => (
  <>
    {!showOtpInput ? (
      <div id="otpRequestSection">
        <div className="input-group">
          <input type="email" name="emailOTP" value={formData.emailOTP} onChange={handleChange} placeholder="Enter Email" required />
          <i className="fas fa-envelope input-icon"></i>
        </div>
        <button type="button" className="btn" onClick={onSendOTP} disabled={loading}><i className="fas fa-paper-plane"></i> {loading ? 'Sending...' : 'Send OTP'}</button>
      </div>
    ) : (
      <div id="otpSection">
        <div className="otp-info"><i className="fas fa-info-circle"></i> OTP sent to your email</div>
        <div className="input-group">
          <input type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="Enter 6-digit OTP" maxLength="6" required />
          <i className="fas fa-shield-alt input-icon"></i>
        </div>
        <button type="button" className="btn" onClick={onVerifyOTP} disabled={loading}><i className="fas fa-check"></i> {loading ? 'Verifying...' : 'Verify & Login'}</button>
      </div>
    )}
  </>
);

export default Login;

