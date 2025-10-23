import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  Typography,
  Space,
  message,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import { API_ENDPOINTS, postFormData, saveToken } from '../../config';
import logo from '../img/logo.png';

const { Title, Text, Link } = Typography;

const LoginForm = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('usuario', values.usuario);
      formData.append('contraseña', values.password);

      const response = await postFormData(API_ENDPOINTS.LOGIN, formData);

      message.success(response.mensaje || '¡Bienvenido de vuelta!');

      if (response.token) {
        saveToken(response.token);
        console.log('Token guardado:', response.token);
      }

      if (onLoginSuccess) {
        onLoginSuccess(response);
      }

    } catch (error) {
      console.error('Error en login:', error);
      message.error(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = () => {
    message.error('Por favor completa todos los campos requeridos');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row justify="center" style={{ width: '100%', maxWidth: '1200px' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10} xxl={8}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
              border: '1px solid #2d2d2d',
              background: '#242424',
              backdropFilter: 'blur(10px)'
            }}
            styles={{
              body: { padding: '48px 40px' }
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>

              {/* Logo y Header */}
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <img 
                  src={logo} 
                  alt="Logo" 
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain',
                    marginBottom: '24px',
                    filter: 'brightness(1.1)'
                  }}
                />
                <Title 
                  level={2} 
                  style={{ 
                    margin: '0 0 8px 0', 
                    color: '#e8e8e8',
                    fontSize: '32px',
                    fontWeight: '400',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    fontFamily: "'Playfair Display', 'Georgia', serif"
                  }}
                >
                  Iniciar sesión
                </Title>
                <Text style={{ 
                  fontSize: '15px', 
                  color: '#a0a0a0',
                  fontFamily: "'Playfair Display', 'Georgia', serif",
                  fontWeight: '300'
                }}>
                  Ingresa tus credenciales para continuar
                </Text>
              </div>

              {/* Formulario */}
              <Form
                name="login"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                layout="vertical"
                size="large"
                style={{ marginTop: '8px' }}
                requiredMark={false}
              >
                <Form.Item
                  label={<span style={{ 
                    color: '#e8e8e8', 
                    fontSize: '15px', 
                    fontWeight: '400',
                    fontFamily: "'Playfair Display', 'Georgia', serif"
                  }}>Usuario</span>}
                  name="usuario"
                  rules={[
                    { required: true, message: 'Ingresa tu nombre de usuario' },
                    { min: 3, message: 'Mínimo 3 caracteres' }
                  ]}
                  style={{ marginBottom: '20px' }}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#6b6b6b' }} />}
                    placeholder="nombre_usuario"
                    autoComplete="username"
                    style={{
                      borderRadius: '8px',
                      padding: '11px 12px',
                      background: '#1a1a1a',
                      border: '1px solid #3d3d3d',
                      color: '#e8e8e8',
                      fontSize: '15px',
                      fontFamily: "'Inter', -apple-system, sans-serif"
                    }}
                    styles={{
                      input: {
                        background: 'transparent',
                        color: '#e8e8e8'
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ 
                    color: '#e8e8e8', 
                    fontSize: '15px', 
                    fontWeight: '400',
                    fontFamily: "'Playfair Display', 'Georgia', serif"
                  }}>Contraseña</span>}
                  name="password"
                  rules={[
                    { required: true, message: 'Ingresa tu contraseña' },
                  ]}
                  style={{ marginBottom: '20px' }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#6b6b6b' }} />}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    iconRender={(visible) => (
                      visible ? 
                      <EyeTwoTone twoToneColor="#a0a0a0" /> : 
                      <EyeInvisibleOutlined style={{ color: '#6b6b6b' }} />
                    )}
                    style={{
                      borderRadius: '8px',
                      padding: '11px 12px',
                      background: '#1a1a1a',
                      border: '1px solid #3d3d3d',
                      color: '#e8e8e8',
                      fontSize: '15px',
                      fontFamily: "'Inter', -apple-system, sans-serif"
                    }}
                    styles={{
                      input: {
                        background: 'transparent',
                        color: '#e8e8e8'
                      }
                    }}
                  />
                </Form.Item>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '28px' 
                }}>
                  <Form.Item name="remember" valuePropName="checked" style={{ margin: 0 }}>
                    <Checkbox style={{ color: '#a0a0a0' }}>
                      <span style={{ 
                        color: '#a0a0a0', 
                        fontSize: '14px',
                        fontFamily: "'Playfair Display', 'Georgia', serif",
                        fontWeight: '300'
                      }}>Recordarme</span>
                    </Checkbox>
                  </Form.Item>
                  <Link style={{ 
                    color: '#5ebd8f', 
                    fontSize: '14px',
                    textDecoration: 'none',
                    fontFamily: "'Playfair Display', 'Georgia', serif",
                    fontWeight: '300'
                  }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Form.Item style={{ margin: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{
                      height: '48px',
                      borderRadius: '8px',
                      background: '#5ebd8f',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      boxShadow: 'none',
                      color: '#1a1a1a',
                      fontFamily: "'Inter', -apple-system, sans-serif"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#6dd49f'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#5ebd8f'}
                  >
                    {loading ? 'Iniciando sesión...' : 'Continuar'}
                  </Button>
                </Form.Item>
              </Form>

            </Space>
          </Card>
        </Col>
      </Row>

      {/* Estilos globales con fuentes serif */}
      <style jsx global>{`
        /* Importar fuentes de Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

        /* Fix para el autocompletado de Chrome/navegadores */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #1a1a1a inset !important;
          -webkit-text-fill-color: #e8e8e8 !important;
          caret-color: #e8e8e8 !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* Fix para inputs de contraseña con autocompletado */
        input[type="password"]:-webkit-autofill,
        input[type="password"]:-webkit-autofill:hover,
        input[type="password"]:-webkit-autofill:focus,
        input[type="password"]:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #1a1a1a inset !important;
          -webkit-text-fill-color: #e8e8e8 !important;
          caret-color: #e8e8e8 !important;
        }

        /* Estilos de focus y hover normales */
        .ant-input-affix-wrapper-focused,
        .ant-input-affix-wrapper:focus,
        .ant-input:focus {
          border-color: #5ebd8f !important;
          box-shadow: 0 0 0 2px rgba(94, 189, 143, 0.15) !important;
        }

        .ant-input-affix-wrapper:hover,
        .ant-input:hover {
          border-color: #4d4d4d !important;
        }

        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #5ebd8f !important;
          border-color: #5ebd8f !important;
        }

        .ant-checkbox-wrapper:hover .ant-checkbox-inner {
          border-color: #5ebd8f !important;
        }

        .ant-form-item-explain-error {
          color: #ff6b6b !important;
          font-size: 13px !important;
          font-family: 'Inter', -apple-system, sans-serif !important;
        }

        .ant-btn-primary:disabled {
          background: #3d3d3d !important;
          color: #6b6b6b !important;
        }
      `}</style>
    </div>
  );
};

export default LoginForm;