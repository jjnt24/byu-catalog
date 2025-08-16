import React, { useEffect, useRef, useState } from 'react';
import { auth } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword, fetchSignInMethodsForEmail, updateProfile, PhoneAuthProvider, updatePassword, updateEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  height: "100dvh", // Use dynamic viewport height for mobile browser bars
  width: "100vw",
  overflow: "hidden",
  background: "#f7f9fb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  padding: "0 8px",
  boxSizing: "border-box",
};

function MemberRegister() {
  const navigate = useNavigate();
  const recaptchaVerifierRef = useRef(null);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const db = getFirestore();
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  // Claim account state
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimPhone, setClaimPhone] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimResult, setClaimResult] = useState(null); // null | 'notfound' | { ...data }
  // Track if registration is from claim and the claimed phone number
  const [registerFromClaim, setRegisterFromClaim] = useState(false);
  const [claimedPhone, setClaimedPhone] = useState('');

  // Add state to track signed-in user for claim flow
  const [claimSignedInUser, setClaimSignedInUser] = useState(null);

  // Dropdown state for belanja status
  const [belanjaStatus, setBelanjaStatus] = useState(''); // '' | 'sudah' | 'belum'

  const functions = getFunctions();

  const sendOtp = () => {
    if (!phoneNumber) {
      console.error('Phone number is required');
      setLoadingOtp(false);
      return;
    }
    const appVerifier = recaptchaVerifierRef.current;
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        console.log('OTP sent!');
        setOtpSentMessage('Kode 6 digit sudah dikirim ke SMS');
        setShowOtpVerification(true);
        setShowRegisterForm(false);
        window.confirmationResult = confirmationResult; // Store for verification
        setLoadingOtp(false);
      })
      .catch((error) => {
        console.error('Error sending OTP:', error);
        setLoadingOtp(false);
      });
  };

  const initializeRecaptcha = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: (response) => {
            console.log('Invisible reCAPTCHA solved:', response);
            sendOtp();
          },
          'expired-callback': () => {
            console.log('Invisible reCAPTCHA expired');
          }
        }
      );
      recaptchaVerifierRef.current.render();
    }
  };

  const handleLanjutClick = async () => {
    setButtonPressed(true);
    setTimeout(() => setButtonPressed(false), 150);
    setShowRecaptcha(true);
    initializeRecaptcha();
    setLoadingOtp(true);
    if (recaptchaVerifierRef.current) {
      try {
        await recaptchaVerifierRef.current.verify(); // triggers the invisible reCAPTCHA
        // callback will run automatically after successful verification
      } catch (error) {
        console.error("reCAPTCHA verification failed:", error);
        setLoadingOtp(false);
      }
    } else {
      setLoadingOtp(false);
    }
  };

  useEffect(() => {
    // Removed initialization from here to only initialize on button click
  }, []);

  // Handle OTP input as 6 separate digits (refactored)
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only allow digits

    // Convert otpCode to array of 6 elements
    let otpArray = otpCode.split('');
    while (otpArray.length < 6) otpArray.push('');
    otpArray[index] = value;
    // Only keep first 6
    otpArray = otpArray.slice(0, 6);
    setOtpCode(otpArray.join(''));

    // Auto focus next input if value entered and not last index
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // If all 6 digits are filled, auto verify
    if (otpArray.every(d => d.length === 1)) {
      const newOtp = otpArray.join('');
      if (!newOtp) {
        console.error('OTP code is required');
        return;
      }
      handleOtpVerification(newOtp, phoneNumber, dateOfBirth, name);
    }
  };

  // OTP verification handler
  const handleOtpVerification = async (newOtp, phoneNumber, dateOfBirth, name) => {
    if (!window.confirmationResult) {
      console.error('No OTP request has been made yet');
      return;
    }
    setVerifyingOtp(true);
    try {
      // For claim flow: user is already signed in, just link phone credential
      if (registerFromClaim && claimSignedInUser) {
        // Get phone credential from the OTP
        let phoneCredential = null;
        try {
          phoneCredential = window.confirmationResult.verificationId
            ? PhoneAuthProvider.credential(
                window.confirmationResult.verificationId,
                newOtp
              )
            : null;
          if (phoneCredential) {
            await linkWithCredential(claimSignedInUser, phoneCredential);
          }
        } catch (err) {
          if (err.code !== "auth/credential-already-in-use") {
            setVerifyingOtp(false);
            setSuccessMessage('');
            console.error('Gagal menghubungkan nomor HP ke akun lama. Silakan hubungi admin.\n' + (err.message || ''));
            return;
          }
        }
        // Optionally update profile
        await updateProfile(claimSignedInUser, { displayName: name });
        // Store/update Firestore data
        const localPhone = phoneNumber.replace(/^\+62/, '0');
        await setDoc(doc(db, 'MemberData', claimSignedInUser.uid), {
          name: name,
          birthDate: dateOfBirth,
          phoneNumber: phoneNumber,
          localPhone: localPhone,
          status_phone: "verified"
        }, { merge: true });

        // --- Change password to birth date in DDMMYYYY format ---
        const parts = dateOfBirth.split('-'); // ["YYYY","MM","DD"]
        const newPassword = parts[2] + parts[1] + parts[0]; // DDMMYYYY
        if (newPassword && newPassword.length >= 6) {
          try {
            await updatePassword(claimSignedInUser, newPassword);
            console.log('Password updated to birth date (DDMMYYYY)');
          } catch (err) {
            console.error('Gagal mengubah password ke tanggal lahir. Silakan hubungi admin.\n' + (err.message || ''));
          }
        } else {
          console.error('Format tanggal lahir tidak valid untuk password.');
        }
        // --- End password change ---

        setVerifyingOtp(false);
        setSuccessMessage('Akun berhasil diklaim, nomor HP terhubung, dan password diubah!');
        return;
      }

      // --- NEW ACCOUNT REGISTRATION LOGIC ---
      // 1. Confirm OTP to sign in the user
      const userCredential = await window.confirmationResult.confirm(newOtp);
      const user = userCredential.user;

      // 2. Prepare pseudoEmail and password
      const localPhone = phoneNumber.replace(/^\+62/, '0');
      const pseudoEmail = localPhone + "@byumember.com";
      // Generate password from birth date
      const parts = dateOfBirth.split('-'); // ["YYYY","MM","DD"]
      const password = parts[2] + parts[1] + parts[0]; // DDMMYYYY

      // 3. Link pseudo-email/password to phone user
      const credential = EmailAuthProvider.credential(pseudoEmail, password);
      try {
        await linkWithCredential(user, credential);
        // After successful link, update email explicitly
        try {
          await updateEmail(user, pseudoEmail);
        } catch (emailError) {
          console.log('Email update failed, but account still created:', emailError);
          // Non-blocking error - continue with account creation
        }
      } catch (error) {
        if (error.code === "auth/credential-already-in-use") {
          // Already linked, ignore
        } else {
          setVerifyingOtp(false);
          setSuccessMessage('');
          console.error('Gagal menghubungkan email ke akun baru. Silakan hubungi admin.\n' + (error.message || ''));
          return;
        }
      }
      // For new accounts, set the creation date
      await setDoc(doc(db, 'MemberData', user.uid), {
        name: name,
        birthDate: dateOfBirth,
        phoneNumber: phoneNumber,
        localPhone: localPhone,
        accountCreationDate: new Date(), // Add creation timestamp for new accounts
        status_phone: "verified"
      }, { merge: true });
      setVerifyingOtp(false);
      setSuccessMessage('Akun baru berhasil dibuat!');
    } catch (error) {
      console.error('Error verifying OTP or linking:', error);
      setVerifyingOtp(false);
      setSuccessMessage('');
      console.error('Gagal verifikasi OTP atau pembuatan akun. Silakan coba lagi atau hubungi admin.\n' + (error.message || ''));
    }
  };

    return (
      <div style={containerStyle}>
        {/* Info Box for Byuties Benefits - only show on initial state */}
      {/* CLAIM FORM BLOCK */}
      {showClaimForm && (
        <>
          <style>{`
            .claim-spinner {
              margin-top: 8px;
              width: 20px;
              height: 20px;
              border: 3px solid #ccc;
              border-top: 3px solid #f82896ff;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-left: auto;
              margin-right: auto;
            }
          `}</style>
          <div style={{ padding: 30, border: '1px solid #ccc', borderRadius: 12, backgroundColor: '#fff', textAlign: 'center', width: '90%', maxWidth: 400 }}>
            <h2>Klaim Akun Byu</h2>
            <div style={{ marginTop: 24, textAlign: 'left' }}>
              <label style={{ marginBottom: 8, display: 'block', fontWeight: 500 }}>Nomor Handphone</label>
              <input
                type="tel"
                placeholder="Masukkan nomor HP"
                value={claimPhone}
                onChange={e => setClaimPhone(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: 16,
                  padding: '8px',
                  backgroundColor: '#fff',
                  color: '#000',
                  border: '1px solid #ccc',
                  borderRadius: 4
                }}
              />
            </div>
            <button
              onClick={async () => {
                setClaimLoading(true);
                setClaimResult(null);
                // Phone normalization for claim form:
                // 1. If input is +62xxxxxxxxxx, convert to 0xxxxxxxxxx.
                // 2. If input is 0xxxxxxxxxx, keep as is (just trim spaces).
                // Any other format: trim spaces and try best effort.
                function normalizePhone(str) {
                  let s = str.trim();
                  // Remove all spaces
                  s = s.replace(/\s+/g, '');
                  // If starts with +62, replace with 0
                  if (s.startsWith('+62')) {
                    return '0' + s.slice(3);
                  }
                  // If starts with 0 and length 11-13, keep as is (just trim)
                  if (/^0\d{9,12}$/.test(s)) {
                    return s;
                  }
                  // Fallback: just return trimmed string
                  return s;
                }
                const localPhone = normalizePhone(claimPhone);
                console.log('[Cek Akun] Searched phone:', localPhone);
                // Convert phone to pseudo-email
                const pseudoEmail = localPhone + "@byumember.com";
                const password = localPhone;
                try {
                  // Use Firebase Auth to sign in with email and password
                  const { signInWithEmailAndPassword } = await import('firebase/auth');
                  const userCredential = await signInWithEmailAndPassword(auth, pseudoEmail, password);
                  setClaimResult({ UID: userCredential.user.uid });
                } catch (err) {
                  // If login fails, treat as not found
                  setClaimResult('notfound');
                }
                setClaimLoading(false);
              }}
              disabled={claimLoading || !claimPhone}
              style={{
                backgroundColor: '#f82896ff',
                color: 'white',
                border: 'none',
                padding: '12px 0',
                fontSize: '1rem',
                cursor: claimLoading || !claimPhone ? 'not-allowed' : 'pointer',
                borderRadius: 6,
                width: '100%',
                fontWeight: 500,
                marginBottom: 0
              }}
            >
              Cek Akun
            </button>
            {claimLoading && <div className="claim-spinner"></div>}
            {claimResult === 'notfound' && (
              <div style={{ color: '#f82896ff', marginTop: 16, fontWeight: 500 }}>
                Akun tidak ditemukan.
              </div>
            )}
            {claimResult && claimResult !== 'notfound' && (
              <div style={{ color: '#333', marginTop: 16, fontWeight: 500 }}>
                Akun ditemukan. Poin Byu anda sebesar: <b>0 poin</b>.{' '}
                <button
                  onClick={async () => {
                    // 1. Hide claim form
                    setShowClaimForm(false);
                    // 2. Show register form
                    setShowRegisterForm(true);
                    // 3. Pre-fill phone number with claimed phone
                    function toPlus62Format(str) {
                      let s = str.trim().replace(/\s+/g, '');
                      if (s.startsWith('+62')) return s;
                      if (s.startsWith('0')) return '+62' + s.slice(1);
                      if (!s.startsWith('+')) return '+62' + s;
                      return s;
                    }
                    const plus62Phone = toPlus62Format(claimPhone);
                    setPhoneNumber(plus62Phone);
                    setRegisterFromClaim(true);
                    setClaimedPhone(plus62Phone);

                    // 4. Sign out any current user before claim sign-in
                    try {
                      await auth.signOut();
                    } catch (e) {
                      // ignore signout error
                    }
                    // 5. Sign in with pseudo-email and password (phone number)
                    //    and store the user for linking after OTP
                    function normalizePhone(str) {
                      let s = str.trim();
                      s = s.replace(/\s+/g, '');
                      if (s.startsWith('+62')) return '0' + s.slice(3);
                      if (/^0\d{9,12}$/.test(s)) return s;
                      return s;
                    }
                    const localPhone = normalizePhone(claimPhone);
                    const pseudoEmail = localPhone + "@byumember.com";
                    const password = localPhone;
                    try {
                      const { signInWithEmailAndPassword } = await import('firebase/auth');
                      const userCredential = await signInWithEmailAndPassword(auth, pseudoEmail, password);
                      setClaimSignedInUser(userCredential.user);
                    } catch (err) {
                      setClaimSignedInUser(null);
                      console.error('Gagal login ke akun lama. Silakan hubungi admin.\n' + (err.message || ''));
                    }
                  }}
                  style={{
                    display: 'inline-block',
                    background: 'none',
                    border: 'none',
                    color: '#f82896ff',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: 0,
                    marginLeft: 4
                  }}
                >
                  Klaim sekarang
                </button>
                {/* Optionally display UID for debugging/internal use */}
                {claimResult.UID && (
                  <span style={{ display: 'none' }}>
                    {console.log('[DEBUG] Firestore UID:', claimResult.UID)}
                  </span>
                )}
              </div>
            )}

          </div>
        </>
      )}

      {/* WELCOME SCREEN */}
      {!showClaimForm && !showRegisterForm && !showOtpVerification ? (
        <div style={{ padding: 30, border: '1px solid #ccc', borderRadius: 12, backgroundColor: '#fff', textAlign: 'center', width: '90%', maxWidth: 400 }}>
          <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 18, color: '#222' }}>
            Sudah pernah belanja di Byusoul?
          </div>
          <div style={{ marginBottom: 18 }}>
            <select
              value={belanjaStatus}
              onChange={e => setBelanjaStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 6,
                border: '1px solid #ccc',
                fontSize: '1rem',
                marginTop: 4,
                backgroundColor: '#fff',
                color: '#222'
              }}
            >
              <option value="">Pilih status belanja...</option>
              <option value="sudah">Sudah</option>
              <option value="belum">Belum</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {belanjaStatus === 'sudah' && (
              <button
                onClick={() => { setShowClaimForm(true); }}
                style={{
                  backgroundColor: '#f82896ff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 0',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  borderRadius: 6,
                  width: '100%',
                  marginBottom: 0,
                  fontWeight: 600
                }}
              >
                Klaim Akun dan Poin
              </button>
            )}
            {belanjaStatus === 'belum' && (
              <button
                onClick={() => setShowRegisterForm(true)}
                style={{
                  backgroundColor: '#f82896ff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 0',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  borderRadius: 6,
                  width: '100%',
                  fontWeight: 600
                }}
              >
                Buat Akun Sekarang
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Back to Login link - only shown on initial state */}
      {!showClaimForm && !showRegisterForm && !showOtpVerification && (
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <a
            href="#"
            onClick={e => { e.preventDefault(); navigate("/memberlogin"); }}
            style={{
              color: "#6c757d",
              textDecoration: "none",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            Kembali ke Login
          </a>
        </div>
      )}

      {showRegisterForm && !showOtpVerification && (
        <>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .otp-spinner {
              position: absolute;
              right: 10px;
              top: 50%;
              transform: translateY(-50%);
              width: 16px;
              height: 16px;
              border: 2px solid #ccc;
              border-top: 2px solid #333;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            .pressed-button {
              transform: scale(0.95);
              box-shadow: 0 2px 6px rgba(248, 40, 150, 0.6);
            }
          `}</style>
          <div style={{ padding: '30px 20px', border: '1px solid #ccc', borderRadius: 12, width: '90%', maxWidth: 400, boxSizing: 'border-box', backgroundColor: '#fff', color: '#000' }}>
            <h2>Daftar Member Byu</h2>
            <label style={{ marginBottom: 12, display: 'block' }}>Nama</label>
            <input
              type="text"
              placeholder="Masukkan Nama"
              style={{ width: '100%', marginBottom: 16, padding: '8px', backgroundColor: '#fff', color: '#000', border: '1px solid #ccc', borderRadius: 4 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label style={{ marginBottom: 12, display: 'block' }}>Tanggal Lahir</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              style={{ width: '100%', marginBottom: 16, padding: '8px', backgroundColor: '#fff', color: '#000', border: '1px solid #ccc', borderRadius: 4 }}
              value={dateOfBirth.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')} // Convert YYYY-MM-DD to DD/MM/YYYY for display
              onChange={(e) => {
                let val = e.target.value;
                // Only allow numbers and /
                val = val.replace(/[^0-9/]/g, '');
                
                // Auto-insert / as user types
                if (val.length === 2 && dateOfBirth.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1').length === 1) val += '/';
                if (val.length === 5 && dateOfBirth.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1').length === 4) val += '/';
                
                // Convert DD/MM/YYYY to YYYY-MM-DD for storage
                const parts = val.split('/');
                if (parts.length === 3 && parts[2]?.length === 4) {
                  const newDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                  setDateOfBirth(newDate);
                } else if (val.length <= 10) {
                  // Store the formatted display value temporarily
                  setDateOfBirth(val);
                }
              }}
              maxLength={10}
            />
            <label style={{ marginBottom: 12, display: 'block' }}>Nomor HP Aktif</label>
            <input
              type="tel"
              placeholder="Masukkan Nomor HP"
              style={{ width: '100%', marginBottom: 16, padding: '8px', backgroundColor: '#fff', color: '#000', border: '1px solid #ccc', borderRadius: 4 }}
              value={phoneNumber}
              onChange={(e) => {
                if (registerFromClaim) return; // Prevent editing if from claim
                let val = e.target.value;
                // Ensure it starts with +62 and remove any other prefix
                if (!val.startsWith('+62')) {
                  val = val.replace(/^(\+?0*)/, '');
                  val = '+62' + val;
                }
                setPhoneNumber(val);
              }}
              readOnly={registerFromClaim}
            />
            {loadingOtp && <div className="otp-spinner" style={{ marginBottom: 10 }}></div>}
            <button 
              onClick={handleLanjutClick} 
              disabled={loadingOtp || successMessage !== ''}
              style={{ 
                fontSize: '1rem', 
                backgroundColor: '#f82896ff', 
                color: 'white', 
                border: 'none', 
                padding: '12px 0', 
                cursor: loadingOtp || successMessage !== '' ? 'not-allowed' : 'pointer', 
                width: '100%',
                borderRadius: 6,
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                ...(buttonPressed ? { transform: 'scale(0.95)', boxShadow: '0 2px 6px rgba(248, 40, 150, 0.6)' } : {})
              }}
            >
              Lanjut
            </button>
            <div id="recaptcha-container" style={{ marginTop: 20, display: showRecaptcha ? 'block' : 'none' }}></div>
          </div>
        </>
      )}

      {showOtpVerification && (
        <>
          <style>{`
            .otp-verification-box {
              background-color: #fff;
              border-radius: 12px;
              padding: 30px 20px;
              width: 90%;
              max-width: 400px;
              box-sizing: border-box;
              text-align: center;
              color: #000;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .otp-inputs {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
            }
            .otp-input {
              width: 40px;
              height: 48px;
              font-size: 1.5rem;
              text-align: center;
              border: 1px solid #ccc;
              border-radius: 6px;
              background-color: #fff;
              color: #000;
              outline: none;
              transition: border-color 0.2s;
            }
            .otp-input:focus {
              border-color: #f82896ff;
              box-shadow: 0 0 5px #f82896ff;
            }
            .otp-sent-text {
              font-size: 1rem;
            }
            .otp-sent-number {
              font-weight: bold;
              color: #000;
            }
            .otp-spinner {
              margin-top: 10px;
              width: 24px;
              height: 24px;
              border: 3px solid #ccc;
              border-top: 3px solid #333;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-left: auto;
              margin-right: auto;
            }
          `}</style>
          <div className="otp-verification-box">
            <div className="otp-sent-text">
              Kode verifikasi sudah terkirim lewat SMS ke nomor <span className="otp-sent-number">{phoneNumber}</span>
            </div>
            <div className="otp-inputs" style={{ marginTop: 16 }}>
              {[0,1,2,3,4,5].map(i => (
                <input
                  key={i}
                  id={`otp-input-${i}`}
                  type="text"
                  maxLength={1}
                  className="otp-input"
                  value={otpCode[i] || ''}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otpCode[i] && i > 0) {
                      const prevInput = document.getElementById(`otp-input-${i-1}`);
                      if (prevInput) prevInput.focus();
                    }
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {successMessage && (
              <div style={{ color: 'green', marginTop: 16, fontWeight: 'bold' }}>
                {successMessage}
              </div>
            )}
            {verifyingOtp && <div className="otp-spinner"></div>}
            <button
              onClick={() => {
                setShowOtpVerification(false);
                setShowRegisterForm(true);
                setOtpCode('');
                setOtpSentMessage('');
                setSuccessMessage('');
              }}
              style={{
                marginTop: 20,
                backgroundColor: '#f82896ff',
                color: 'white',
                border: 'none',
                padding: '10px 0',
                width: '100%',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Kembali ke Form Registrasi
            </button>
          </div>
        </>
      )}

      {/* Back navigation links outside all forms */}
      {(showRegisterForm || showOtpVerification || showClaimForm) && (
        <div style={{ marginTop: "16px", textAlign: "center", display: "flex", flexDirection: "column", gap: "12px" }}>
          {showClaimForm && (
            <a href="#" 
              onClick={e => { 
                e.preventDefault(); 
                setShowClaimForm(false);
                setClaimPhone('');
                setClaimResult(null);
                setClaimLoading(false);
              }}
              style={{ 
                color: "#6c757d",
                textDecoration: "none",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Kembali ke Halaman Sebelumnya
            </a>
          )}
          {showRegisterForm && (
            <a href="#" 
              onClick={e => { 
                e.preventDefault();
                setShowRegisterForm(false);
                setRegisterFromClaim(false);
                setClaimedPhone('');
              }}
              style={{ 
                color: "#6c757d",
                textDecoration: "none",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Kembali ke Halaman Sebelumnya
            </a>
          )}
          <a href="#" 
            onClick={e => { e.preventDefault(); navigate("/memberlogin"); }}
            style={{ 
              color: "#6c757d",
              textDecoration: "none",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            Kembali ke Login
          </a>
        </div>
      )}
    </div>
  );
}

export default MemberRegister;