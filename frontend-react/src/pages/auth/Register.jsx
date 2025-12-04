import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../../services/api';
import '../../styles/register.css';

const Register = () => {
  const navigate = useNavigate();
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [emailStored, setEmailStored] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ password: false, confirm: false });
  
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', password: '', confirmPassword: '', userType: '', otp: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getApprovalInfo = () => {
    if (formData.userType === 'general') {
      return { show: true, type: 'success', text: '✅ Instant Access! You can login immediately after registration.' };
    } else if (['student', 'teacher', 'parent'].includes(formData.userType)) {
      return { show: true, type: 'warning', text: '⏳ Approval Required! Admin will verify and approve your account. You will be notified via email.' };
    }
    return { show: false };
  };

  const sendOTP = async () => {
    const { name, email, mobile, password, confirmPassword, userType } = formData;
    if (!name || !email || !mobile || !password || !confirmPassword || !userType) {
      return alert('⚠ Please fill all fields before sending OTP!');
    }
    if (password !== confirmPassword) return alert('❌ Passwords do not match!');
    
    setLoading(true);
    try {
      const data = await apiPost('/auth/send-otp', { email });
      if (!data.success) return alert('❌ ' + (data.message || 'OTP send failed'));
      setEmailStored(email);
      setShowOtpBox(true);
    } catch (error) { alert('❌ Failed to send OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const verifyAndRegister = async () => {
    if (!formData.otp) return alert('⚠ Please enter the OTP!');
    
    setLoading(true);
    try {
      // Verify OTP
      const verify = await apiPost('/auth/verify-otp', { email: emailStored, otp: formData.otp });
      if (!verify.success) return alert('❌ ' + (verify.message || 'Wrong OTP'));

      // Register User
      const register = await apiPost('/auth/register', {
        name: formData.name, email: emailStored, mobile: formData.mobile,
        password: formData.password, userType: formData.userType
      });

      if (!register.success) return alert('❌ ' + (register.message || 'Registration failed'));

      if (register.requiresApproval) {
        alert('✅ Registration successful!\n\n⏳ Your account is pending admin approval.\n\nYou will be notified via email once approved.');
      } else {
        if (register.token) {
          localStorage.setItem('token', register.token);
          localStorage.setItem('user', JSON.stringify(register.user));
        }
        alert('✅ Account created successfully! You can now login.');
      }
      navigate('/login');
    } catch (error) { alert('❌ Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const approvalInfo = getApprovalInfo();

  return (
    <div className="register-page">
      <div className="box">
        <div className="logo">
          <i className="fas fa-mosque"></i>
          <h2>Madarsa Imdadul Uloom</h2>
          <p>Create your account</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <InputField label="Full Name" name="name" type="text" value={formData.name} onChange={handleChange} icon="fa-user" placeholder="Enter your full name" />
          <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} icon="fa-envelope" placeholder="Enter your email" />
          <InputField label="Mobile Number" name="mobile" type="tel" value={formData.mobile} onChange={handleChange} icon="fa-mobile-alt" placeholder="Enter mobile number" />
          
          <PasswordField label="Password" name="password" value={formData.password} onChange={handleChange} show={showPassword.password} toggle={() => setShowPassword(p => ({ ...p, password: !p.password }))} placeholder="Enter password" />
          <PasswordField label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} show={showPassword.confirm} toggle={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))} placeholder="Confirm password" isMatch={formData.confirmPassword && formData.password === formData.confirmPassword} isMismatch={formData.confirmPassword && formData.password !== formData.confirmPassword} />

          <div className="input-group">
            <label>I am a</label>
            <select name="userType" value={formData.userType} onChange={handleChange} required>
              <option value="" disabled>Select user type</option>
              <option value="general">🌐 General Public (Instant Access)</option>
              <option value="student">📚 Madarsa Student (Requires Approval)</option>
              <option value="teacher">👨‍🏫 Teacher (Requires Approval)</option>
              <option value="parent">👨‍👩‍👧 Parent (Requires Approval)</option>
            </select>
            <i className="fas fa-user-tag input-icon" style={{ pointerEvents: 'none' }}></i>
          </div>

          {approvalInfo.show && (
            <div className={`approval-info ${approvalInfo.type}`}>{approvalInfo.text}</div>
          )}

          {!showOtpBox && (
            <button type="button" className="btn" onClick={sendOTP} disabled={loading}>
              <i className="fas fa-paper-plane"></i> {loading ? 'Sending...' : 'Send OTP'}
            </button>
          )}

          {showOtpBox && (
            <div id="otpBox">
              <div className="otp-info"><i className="fas fa-info-circle"></i> OTP sent to your email</div>
              <InputField label="Enter OTP" name="otp" type="text" value={formData.otp} onChange={handleChange} icon="fa-shield-alt" placeholder="Enter 6-digit OTP" maxLength="6" />
              <button type="button" className="btn" onClick={verifyAndRegister} disabled={loading}>
                <i className="fas fa-check"></i> {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </div>
          )}
        </form>

        <p className="login">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
};

const InputField = ({ label, name, type, value, onChange, icon, placeholder, maxLength }) => (
  <div className="input-group">
    <label>{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength} required />
    <i className={`fas ${icon} input-icon`}></i>
  </div>
);

const PasswordField = ({ label, name, value, onChange, show, toggle, placeholder, isMatch, isMismatch }) => (
  <div className="input-group">
    <label>{label}</label>
    <input type={show ? 'text' : 'password'} name={name} value={value} onChange={onChange} placeholder={placeholder} required style={{ borderColor: isMatch ? 'var(--success)' : isMismatch ? 'var(--danger)' : undefined }} />
    <button type="button" className="input-icon" onClick={toggle}><i className={`fas ${show ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
  </div>
);

export default Register;

