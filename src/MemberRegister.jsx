import React, { useEffect, useRef, useState } from 'react';
import { auth } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);

  const sendOtp = () => {
    if (!phoneNumber) {
      console.error('Phone number is required');
      return;
    }
    const appVerifier = recaptchaVerifierRef.current;
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        console.log('OTP sent!');
        setOtpSentMessage('Kode 6 digit sudah dikirim ke SMS');
        setShowOtpInput(true);
        window.confirmationResult = confirmationResult; // Store for verification
      })
      .catch((error) => {
        console.error('Error sending OTP:', error);
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

  const handleGetOtpClick = async () => {
    setButtonPressed(true);
    setTimeout(() => setButtonPressed(false), 150);
    setShowRecaptcha(true);
    initializeRecaptcha();
    if (recaptchaVerifierRef.current) {
      try {
        await recaptchaVerifierRef.current.verify(); // triggers the invisible reCAPTCHA
        // callback will run automatically after successful verification
      } catch (error) {
        console.error("reCAPTCHA verification failed:", error);
      }
    }
  };

  useEffect(() => {
    // Removed initialization from here to only initialize on button click
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2', color: '#000' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .otp-input-container {
          position: relative;
          width: 100%;
          margin-bottom: 10px;
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
        .otp-sent-message {
          animation: fade 1.5s ease-in-out 0s 4;
          color: #000;
          margin-bottom: 10px;
        }
        .pressed-button {
          transform: scale(0.95);
          box-shadow: 0 2px 6px rgba(248, 40, 150, 0.6);
        }
      `}</style>
      <div style={{ padding: '30px 20px', border: '1px solid #ccc', borderRadius: 12, width: '90%', maxWidth: 380, boxSizing: 'border-box', backgroundColor: '#fff', color: '#000' }}>
        <h2>Daftar Member Byu</h2>
        <label style={{ marginBottom: 12 }}>Nama</label>
        <input
          type="text"
          placeholder="Masukkan Nama"
          style={{ width: '100%', marginBottom: 16, padding: '8px', backgroundColor: '#fff', color: '#000', border: '1px solid #ccc', borderRadius: 4 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label style={{ marginBottom: 12 }}>Tanggal Lahir</label>
        <input
          type="date"
          placeholder="Pilih Tanggal Lahir"
          style={{ width: '100%', marginBottom: 16, padding: '8px', backgroundColor: '#fff', color: '#000', border: '1px solid #ccc', borderRadius: 4 }}
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
        <label style={{ marginBottom: 12 }}>Nomor HP Aktif</label>
        <div style={{ display: 'flex', marginBottom: 16, alignItems: 'center' }}>
          <span style={{ padding: '6px 10px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '4px 0 0 4px', fontSize: '0.85rem', userSelect: 'none', flexShrink: 0, color: '#000', backgroundColor: '#fff' }}>+62</span>
          <input
            type="tel"
            placeholder="Masukkan Nomor HP"
            style={{ flex: 1, marginRight: 6, fontSize: '0.85rem', padding: '6px', borderRadius: '0 4px 4px 0', borderLeft: 'none', backgroundColor: '#fff', color: '#000', border: '1px solid #ccc' }}
            value={phoneNumber.startsWith('+62') ? phoneNumber.slice(3) : phoneNumber}
            onChange={(e) => {
              let val = e.target.value;
              // Remove any leading +62 or 62
              val = val.replace(/^(\+62|62)/, '');
              // Remove any leading 0, since +62 is already there
              val = val.replace(/^0+/, '');
              setPhoneNumber('+62' + val);
            }}
          />
          <button 
            onClick={handleGetOtpClick} 
            style={{ 
              fontSize: '0.85rem', 
              backgroundColor: '#f82896ff', 
              color: 'white', 
              border: 'none', 
              padding: '6px 12px', 
              cursor: 'pointer', 
              flexShrink: 0,
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              ...(buttonPressed ? { transform: 'scale(0.95)', boxShadow: '0 2px 6px rgba(248, 40, 150, 0.6)' } : {})
            }}
          >
            Kirim OTP
          </button>
        </div>
        {otpSentMessage && <div className="otp-sent-message">{otpSentMessage}</div>}
        {showOtpInput && (
          <>
            <div className="otp-input-container">
              <input
                type="text"
                placeholder="Masukkan OTP"
                style={{ width: '100%', padding: '8px', backgroundColor: '#fff', color: '#000', border: '1px solid #ccc', borderRadius: 4 }}
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setOtpCode(val);
                  if (val.length === 6) {
                    if (!val) {
                      console.error('OTP code is required');
                      return;
                    }
                    if (window.confirmationResult) {
                      setVerifyingOtp(true);
                      window.confirmationResult.confirm(val)
                        .then((result) => {
                          console.log('User signed in successfully:', result.user);
                          setSuccessMessage('Verifikasi Berhasil! Silakan login ulang untuk mengakses akun kamu');
                          const username = phoneNumber.replace(/^\+62/, '0');
                          const pseudoEmail = username + "@byumember.com";
                          // Format password as DDMMYYYY from dateOfBirth using manual parsing
                          const parts = dateOfBirth.split('-'); // ["YYYY","MM","DD"]
                          const password = parts[2] + parts[1] + parts[0]; // DDMMYYYY
                          const credential = EmailAuthProvider.credential(pseudoEmail, password);
                          linkWithCredential(result.user, credential)
                            .then((usercred) => {
                              console.log("Pseudo-email linked to phone-auth user:", usercred.user.uid);
                            })
                            .catch((error) => {
                              if (error.code === "auth/credential-already-in-use") {
                                console.log("Pseudo-email already linked to another account");
                              } else {
                                console.error("Error linking pseudo-email credential:", error);
                              }
                            });
                          setDoc(doc(db, 'MemberData', result.user.uid), {
                            name: name,
                            birthDate: dateOfBirth,
                            phoneNumber: phoneNumber,
                            username: username
                          })
                          .then(() => {
                            console.log('User data stored in Firestore');
                            // Read back to verify
                            import('firebase/firestore').then(({ getDoc }) => {
                              getDoc(doc(db, 'MemberData', result.user.uid)).then((docSnap) => {
                                if (docSnap.exists()) {
                                  console.log('Firestore document data:', docSnap.data());
                                } else {
                                  console.log('No such document in Firestore');
                                }
                              }).catch((error) => {
                                console.error('Error reading back Firestore data:', error);
                              });
                            });
                          })
                          .catch((error) => {
                            console.error('Error storing user data:', error);
                          });
                          setVerifyingOtp(false);
                        })
                        .catch((error) => {
                          console.error('Error verifying OTP:', error);
                          setVerifyingOtp(false);
                        });
                    } else {
                      console.error('No OTP request has been made yet');
                    }
                  }
                }}
              />
              {verifyingOtp && <div className="otp-spinner"></div>}
            </div>
          </>
        )}
        <button
          onClick={() => {
            navigate('/memberlogin');
          }}
          style={{
            width: '100%',
            marginBottom: 16,
            backgroundColor: '#f82896ff',
            color: 'white',
            border: 'none',
            padding: '6px 0', // Reduced padding for smaller button
            fontSize: '0.9rem', // Smaller font size
            cursor: 'pointer'
          }}
        >
          Kembali ke Login
        </button>
        {successMessage && (
          <div style={{ color: 'green', marginBottom: 10 }}>
            {successMessage}
          </div>
        )}
        <div id="recaptcha-container" style={{ marginTop: 20, display: showRecaptcha ? 'block' : 'none' }}></div>
      </div>
    </div>
  );
}

export default MemberRegister;