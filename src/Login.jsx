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
      backgroundColor: '#f0f2f5' 
    }}>
      <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
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
              style={{ width: '150px', height: '150px', objectFit: 'contain' }} 
            />
          </div>

          <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Selamat Datang di Byusoul Online!</h2>
          <p style={{ textAlign: 'center', marginBottom: '24px' }}>Isi nama dan nomor kamu untuk memperlancar pesanan ya, Byuties!</p>

          <Form.Item label="Nama Kamu" name="namaKamu" rules={[
            { required: true, message: 'Please input your name!' },
            { min: 2, message: 'Nama terlalu pendek' }
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
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
