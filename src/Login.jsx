import React from 'react';
import { Form, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    navigate('/catalog', { state: values });
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw',
      backgroundColor: '#fee4f1ff' 
    }}>
      <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <Form
          name="login"
          style={{ width: 300 }}
          layout="vertical"
          onFinish={onFinish}
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

          <Form.Item label="Nama Kamu" name="namaKamu" rules={[
            { required: true, message: 'Please input your name!' },
            { min: 3, message: 'Nama terlalu pendek' }
          ]}>
            <Input />
          </Form.Item>
          <Form.Item 
            label="Nomor Handphone" 
            name="nomorHandphone" 
            rules={[
              { required: true, message: 'Isi nomor handphone kamu' },
              { min: 10, message: 'Nomor handphone tidak valid' }
            ]}
          >
            <Input
              type="tel"
              maxLength={12}
              pattern="[0-9]*"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Lihat Produk
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
