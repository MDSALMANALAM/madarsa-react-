import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../../services/api';
import '../../styles/forgot-password.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState({ new: false, confirm: false });
  const [resendTime, setResendTime] = useState(0);

  useEffect(() => {
    let timer;
    if (resendTime > 0) {
      timer = setInterval(() => setResendTime(t => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTime]);

  const sendResetOTP = async () => {
    if (!email) { setError('Please enter your email address'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }
    setLoading(true); setError('');
    try {
      const res = await apiPost('/auth/forgot-password', { email });
      if (res.success) { setSuccess('Reset code sent to your email'); setResendTime(60); setCurrentStep(2); }
      else setError(res.message || 'Failed to send reset code');
    } catch (err) { setError('Failed to send reset code. Please try again.'); }
    finally { setLoading(false); }
  };

  const verifyResetOTP = async () => {
    if (!otp || otp.length !== 6) { setError('Please enter the 6-digit reset code'); return; }
    setLoading(true); setError('');
    try {
      const res = await apiPost('/auth/verify-reset-otp', { email, otp });
      if (res.success) { setResetToken(res.resetToken); setSuccess('Code verified successfully'); setCurrentStep(3); }
      else setError(res.message || 'Invalid reset code');
    } catch (err) { setError('Failed to verify code. Please try again.'); }
    finally { setLoading(false); }
  };

  const resetPassword = async () => {
    if (!newPassword || !confirmPassword) { setError('Please fill in all password fields'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await apiPost('/auth/reset-password', { email, token: resetToken, newPassword });
      if (res.success) { setSuccess('Password reset successfully'); setCurrentStep(4); }
      else setError(res.message || 'Failed to reset password');
    } catch (err) { setError('Failed to reset password. Please try again.'); }
    finally { setLoading(false); }
  };

  const resendOTP = async () => {
    if (resendTime > 0) return;
    try {
      const res = await apiPost('/auth/resend-reset-otp', { email });
      if (res.success) { setSuccess('Reset code sent again'); setResendTime(60); }
      else setError(res.message || 'Failed to resend code');
    } catch (err) { setError('Failed to resend code'); }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="logo">
          <i className="fas fa-lock"></i>
          <h2>Reset Password</h2>
          <p>Follow the steps to reset your password</p>
        </div>

        <div className="step-indicator">
          <div className="step-connector" style={{ background: `linear-gradient(90deg, var(--success) ${((currentStep - 1) / 2) * 100}%, #e9ecef ${((currentStep - 1) / 2) * 100}%)` }}></div>
          {[1, 2, 3].map(step => (
            <div key={step} className={`step-item ${currentStep > step ? 'completed' : ''} ${currentStep === step ? 'active' : ''}`}>
              <div className="step-number">{step}</div>
              <div className="step-label">{step === 1 ? 'Enter Email' : step === 2 ? 'Verify OTP' : 'New Password'}</div>
            </div>
          ))}
        </div>

        {error && <div className="error-message"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        {success && <div className="info-message"><i className="fas fa-check-circle"></i> {success}</div>}

        {currentStep === 1 && (
          <div className="step active">
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your registered email" />
              <i className="fas fa-envelope input-icon"></i>
            </div>
            <button className="btn" onClick={sendResetOTP} disabled={loading}>
              <i className={loading ? "fas fa-spinner fa-spin" : "fas fa-paper-plane"}></i> {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
            <div className="back-link"><Link to="/login"><i className="fas fa-arrow-left"></i> Back to Login</Link></div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step active">
            <div className="input-group">
              <label>Enter Reset Code</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit code" maxLength="6" />
              <i className="fas fa-shield-alt input-icon"></i>
            </div>
            <button className="btn" onClick={verifyResetOTP} disabled={loading}>
              <i className={loading ? "fas fa-spinner fa-spin" : "fas fa-check"}></i> {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <div className="resend-otp">
              {resendTime > 0 ? <span className="countdown">Resend in {resendTime}s</span> : <a onClick={resendOTP}><i className="fas fa-redo"></i> Resend Code</a>}
            </div>
            <button className="btn btn-outline" onClick={() => setCurrentStep(1)}><i className="fas fa-arrow-left"></i> Back</button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step active">
            <div className="input-group">
              <label>New Password</label>
              <input type={showPassword.new ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
              <button type="button" className="input-icon" onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}>
                <i className={`fas fa-eye${showPassword.new ? '-slash' : ''}`}></i>
              </button>
            </div>
            <div className="input-group">
              <label>Confirm New Password</label>
              <input type={showPassword.confirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
              <button type="button" className="input-icon" onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}>
                <i className={`fas fa-eye${showPassword.confirm ? '-slash' : ''}`}></i>
              </button>
            </div>
            <button className="btn" onClick={resetPassword} disabled={loading}>
              <i className={loading ? "fas fa-spinner fa-spin" : "fas fa-lock"}></i> {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button className="btn btn-outline" onClick={() => setCurrentStep(2)}><i className="fas fa-arrow-left"></i> Back</button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="step active success-step">
            <div className="success-icon"><i className="fas fa-check-circle"></i></div>
            <h3>Password Reset Successful!</h3>
            <p>Your password has been reset successfully. You can now login with your new password.</p>
            <button className="btn" onClick={() => navigate('/login')}><i className="fas fa-sign-in-alt"></i> Go to Login</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

