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

  const sendOtp = () => {
    if (!phoneNumber) {
      console.error('Phone number is required');
      return;
    }
    const appVerifier = recaptchaVerifierRef.current;
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        console.log('OTP sent!');
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
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ padding: 20, border: '1px solid #ccc', borderRadius: 4, width: 300 }}>
        <h2>Gabung Byu Member</h2>
        <input
          type="text"
          placeholder="Name"
          style={{ width: '100%', marginBottom: 10 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="date"
          placeholder="Tanggal Lahir"
          style={{ width: '100%', marginBottom: 10 }}
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
        <div style={{ display: 'flex', marginBottom: 10 }}>
          <input
            type="tel"
            placeholder="Phone Number"
            style={{ flex: 1, marginRight: 10 }}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <button onClick={handleGetOtpClick}>Get OTP</button>
        </div>
        <input
          type="text"
          placeholder="Enter OTP"
          style={{ width: '100%', marginBottom: 10 }}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
        />
        <button
          onClick={() => {
            if (!otpCode) {
              console.error('OTP code is required');
              return;
            }
            if (window.confirmationResult) {
              window.confirmationResult.confirm(otpCode)
                .then((result) => {
                  console.log('User signed in successfully:', result.user);
                  setSuccessMessage('Verification successful! You are now signed in.');
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
                })
                .catch((error) => {
                  console.error('Error verifying OTP:', error);
                });
            } else {
              console.error('No OTP request has been made yet');
            }
          }}
          style={{ width: '100%', marginBottom: 10 }}
        >
          Verify OTP
        </button>
        <button
          onClick={() => {
            navigate('/memberlogin');
          }}
          style={{ width: '100%', marginBottom: 10 }}
        >
          Back to Login
        </button>
        {successMessage && (
          <div style={{ color: 'green', marginBottom: 10 }}>
            {successMessage}
          </div>
        )}
        {showRecaptcha && <div id="recaptcha-container" style={{ marginTop: 20 }}></div>}
      </div>
    </div>
  );
}

export default MemberRegister;