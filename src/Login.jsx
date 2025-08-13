import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const onFinish = (event) => {
    event.preventDefault();
    const form = event.target;
    const values = {
      namaKamu: form.namaKamu.value,
      nomorHandphone: form.nomorHandphone.value,
    };
    navigate('/catalog', { state: values });
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw',
      backgroundColor: '#fee4f1ff',
      color: '#000',
    }}>
      <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <form
          name="login"
          style={{ width: 300 }}
          onSubmit={onFinish}
        >
          {/* Image at the top */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <img 
              src="/Logo Long White.png" 
              alt="Welcome" 
              style={{ width: '150px', height: '70px', objectFit: 'contain' }} 
            />
          </div>

          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Selamat datang di Byusoul Online!</h2>
          <p style={{ textAlign: 'left', marginBottom: '20px' }}> Silakan isi data berikut untuk melanjutkan order ya Byuties!</p>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="namaKamu" style={{ display: 'block', marginBottom: '4px', color: '#000' }}>Nama Kamu</label>
            <input
              id="namaKamu"
              name="namaKamu"
              required
              minLength={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                color: '#000',
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="nomorHandphone" style={{ display: 'block', marginBottom: '4px', color: '#000' }}>Nomor Handphone</label>
            <input
              id="nomorHandphone"
              name="nomorHandphone"
              type="tel"
              maxLength={12}
              pattern="[0-9]*"
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                color: '#000',
                fontSize: '14px',
              }}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>
          <div>
            <Button type="primary" htmlType="submit" block>
              Lihat Produk
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
