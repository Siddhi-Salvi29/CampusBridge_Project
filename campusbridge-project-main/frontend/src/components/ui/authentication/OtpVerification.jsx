import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { email, fullname, password, phoneNumber, role } = state;

  // step: 'email' | 'phone'
  const [step, setStep] = useState('email');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      if (step === 'email') {
        const res = await fetch('http://localhost:5000/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setOtp('');
          setError('');
          setResendMsg('');
          setCooldown(0);
          setStep('phone');
        } else {
          setError(data.message || 'Verification failed');
          if (data.message?.includes('Please register again')) {
            setTimeout(() => navigate('/register'), 2000);
          }
        }
      } else {
        const res = await fetch('http://localhost:5000/api/verify-phone-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } else {
          setError(data.message || 'Verification failed');
          if (data.message?.includes('Please register again')) {
            setTimeout(() => navigate('/register'), 2000);
          }
        }
      }
    } catch {
      setError('Server error, try again later.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setError('');
    setResendMsg('');
    try {
      if (step === 'email') {
        const formData = new FormData();
        formData.append('fullname', fullname || '');
        formData.append('email', email);
        formData.append('password', password || '');
        formData.append('phoneNumber', phoneNumber || '');
        formData.append('role', role || 'Student');
        const res = await fetch('http://localhost:5000/api/send-otp', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok && data.success) { setResendMsg('New email OTP sent.'); setCooldown(60); }
        else setError(data.message || 'Failed to resend');
      } else {
        const res = await fetch('http://localhost:5000/api/resend-phone-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (res.ok && data.success) { setResendMsg('New phone OTP sent to your email.'); setCooldown(60); }
        else setError(data.message || 'Failed to resend');
      }
    } catch {
      setError('Server error, try again later.');
    }
  };

  const isEmailStep = step === 'email';

  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-1/2 bg-blue-800 text-white flex flex-col justify-center items-center p-10">
        <img src="/bridge-logo.jpg" alt="Logo" className="w-32 mb-6" />
        <h1 className="text-3xl font-bold mb-3">
          {isEmailStep ? 'Verify Your Email' : 'Verify Your Phone'}
        </h1>
        <p className="text-sm text-blue-200">
          {isEmailStep
            ? 'Step 1 of 2 — Enter the OTP sent to your email.'
            : 'Step 2 of 2 — Enter the OTP sent to your email for phone verification.'}
        </p>

        {/* Step indicator */}
        <div className="flex gap-3 mt-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isEmailStep ? 'bg-white text-blue-800' : 'bg-green-400 text-white'}`}>
            {isEmailStep ? '1' : '✓'}
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${!isEmailStep ? 'bg-white text-blue-800' : 'bg-white/30 text-white'}`}>
            2
          </div>
        </div>
        <div className="flex gap-3 mt-1 text-xs text-blue-200">
          <span className="w-8 text-center">Email</span>
          <span className="w-8 text-center">Phone</span>
        </div>
      </div>

      <div className="w-1/2 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm bg-white shadow-2xl rounded-xl p-6 py-8 border border-gray-200">
          <div className="flex flex-col items-center mb-6">
            <img src="/rmcetlogo1.jpg" alt="RMCET Logo" className="w-16 h-16 mb-2" />
            <h1 className="text-xl font-bold text-gray-800 tracking-wide mt-1">
              {isEmailStep ? 'Email Verification' : 'Phone Verification'}
            </h1>
            <p className="text-sm text-gray-500 text-center mt-1">
              {isEmailStep
                ? <>OTP sent to <span className="font-semibold text-blue-700">{email}</span></>
                : <>Phone OTP sent to <span className="font-semibold text-blue-700">{email}</span> for number <span className="font-semibold">{phoneNumber}</span></>
              }
            </p>
          </div>

          {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
          {resendMsg && <p className="text-green-600 text-center mb-4 text-sm">{resendMsg}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-digit OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full border border-blue-200 rounded-md px-3 py-2 bg-blue-50/70 text-center text-xl tracking-widest outline-none focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-800 text-white rounded-md font-semibold hover:bg-gray-900 transition duration-150 shadow-md mt-2 disabled:opacity-60"
            >
              {loading ? 'Verifying...' : isEmailStep ? 'Verify Email →' : 'Complete Registration'}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="text-sm text-blue-700 hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>

          <p className="text-center text-sm mt-4 text-gray-600">
            <button onClick={() => navigate('/register')} className="text-blue-700 hover:underline">
              ← Back to Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
