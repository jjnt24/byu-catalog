import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

function MemberRegister() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const recaptchaVerifier = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth object:', auth);
    let retryTimeout = null;

    const initializeRecaptcha = () => {
      const container = document.getElementById('recaptcha-container');
      console.log('Recaptcha container:', container);
      if (container && auth && !recaptchaVerifier.current) {
        try {
          recaptchaVerifier.current = new RecaptchaVerifier(
            'recaptcha-container',
            {
              size: 'invisible',
              callback: () => {
                // reCAPTCHA solved - will proceed with submit
              },
              'expired-callback': () => {
                setError('reCAPTCHA expired, please try again.');
              },
            },
            auth
          );
          recaptchaVerifier.current.render().then(() => {
            setRecaptchaReady(true);
          }).catch(() => {});
        } catch (err) {
          console.error('Recaptcha initialization error:', err);
          setError('Failed to initialize reCAPTCHA. Retrying...');
          retryTimeout = setTimeout(() => {
            recaptchaVerifier.current = null;
            initializeRecaptcha();
          }, 3000);
        }
      }
    };

    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        initializeRecaptcha();
      });
    }

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
        recaptchaVerifier.current = null;
      }
    };
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || phoneNumber.length < 3) {
      setError('Please enter a valid phone number.');
      return;
    }

    if (!recaptchaVerifier.current) {
      setError('reCAPTCHA not ready. Please refresh the page.');
      return;
    }

    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    const fullPhoneNumber = phoneNumber.startsWith('62') ? '+' + phoneNumber : '+62' + cleanedNumber;

    try {
      const appVerifier = recaptchaVerifier.current;
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setOtpVerified(false);
      setOtp('');
      setError('');
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(
        (typeof window !== 'undefined' && window.location.hostname === 'localhost')
          ? 'Error sending OTP. If you are testing locally, please use Firebase test phone numbers as configured in your Firebase Console to avoid internal errors.'
          : err.message || 'Failed to send OTP'
      );
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    try {
      await confirmationResult.confirm(otp);
      setOtpVerified(true);
      setError('');
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Failed to verify OTP');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!birthDate) {
      setError('Please enter your tanggal lahir.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (password.length < 6 || !/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError('Password must be at least 6 characters long and contain both letters and numbers.');
      return;
    }

    try {
      const cleanedNumber = phoneNumber.replace(/\D/g, '');
      const email = phoneNumber.startsWith('62') ? phoneNumber + '@byu.com' : '62' + cleanedNumber + '@byu.com';
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registration successful:', userCredential);
      navigate('/memberpage');
    } catch (err) {
      console.error('Error registering:', err);
      setError(err.message || 'Failed to register');
    }
  };

  if (!recaptchaReady) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ padding: 20, border: '1px solid #ccc', borderRadius: 4, width: 300, textAlign: 'center' }}>
          <div id="recaptcha-container"></div>
          <p>Loading verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ padding: 20, border: '1px solid #ccc', borderRadius: 4, width: 300 }}>
        <h2>Gabung Byu Member</h2>

        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

        <form
          onSubmit={
            !otpSent
              ? handleSendOtp
              : !otpVerified
              ? handleVerifyOtp
              : handleRegister
          }
        >
          <div style={{ marginBottom: 4, fontWeight: 'bold' }}>Nomor Handphone</div>
          <div style={{ display: 'flex', marginBottom: 10, width: '100%' }}>
            <span
              style={{
                padding: '0 8px',
                lineHeight: '32px',
                border: '1px solid #ccc',
                borderRadius: '4px 0 0 4px',
                backgroundColor: '#eee',
                userSelect: 'none'
              }}
            >
              +62
            </span>
            <input
              type="tel"
              placeholder="Phone number"
              style={{ flex: 1, border: '1px solid #ccc', borderLeft: 'none', borderRadius: '0 4px 4px 0', padding: '6px 8px' }}
              value={phoneNumber.startsWith('62') ? phoneNumber.slice(2) : phoneNumber}
              onChange={e => {
                const input = e.target.value.replace(/\D/g, '');
                setPhoneNumber(input);
              }}
              disabled={otpSent}
            />
          </div>

          {otpSent && !otpVerified && (
            <>
              <div style={{ marginBottom: 4, fontWeight: 'bold' }}>Enter OTP</div>
              <div style={{ marginBottom: 10, width: '100%' }}>
                <input
                  type="text"
                  placeholder="OTP"
                  style={{ width: '100%', border: '1px solid #ccc', borderRadius: 4, padding: '6px 8px' }}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                />
              </div>
            </>
          )}

          {otpVerified && (
            <>
              <div style={{ marginBottom: 4, fontWeight: 'bold' }}>Password</div>
              <div style={{ marginBottom: 10, width: '100%' }}>
                <input
                  type="password"
                  placeholder="Password"
                  style={{ width: '100%', border: '1px solid #ccc', borderRadius: 4, padding: '6px 8px' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 4, fontWeight: 'bold' }}>Tanggal Lahir</div>
              <div style={{ marginBottom: 10, width: '100%' }}>
                <input
                  type="date"
                  placeholder="Tanggal Lahir"
                  style={{ width: '100%', border: '1px solid #ccc', borderRadius: 4, padding: '6px 8px' }}
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                />
              </div>
            </>
          )}

          {!otpSent && <button style={{ width: '100%', marginBottom: 8 }} type="submit" disabled={!recaptchaReady}>Send OTP</button>}
          {otpSent && !otpVerified && <button style={{ width: '100%', marginBottom: 8 }} type="submit">Verify OTP</button>}
          {otpVerified && (
            <button
              style={{ width: '100%', marginBottom: 8 }}
              type="submit"
              disabled={!birthDate || !password}
            >
              Register
            </button>
          )}
          <button
            type="button"
            style={{ width: '100%', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: 4, padding: '6px 8px' }}
            onClick={() => navigate('/memberlogin')}
          >
            Kembali ke Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default MemberRegister;