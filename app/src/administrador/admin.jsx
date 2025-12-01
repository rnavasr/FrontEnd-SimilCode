import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Button,
    message,
    Spin,
    Alert,
    Layout
} from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { API_ENDPOINTS, getWithAuth, getStoredToken, removeToken } from '../../config';
import logoImage from '../img/logo.png';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

const Admin = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getStoredToken();

            if (!token) {
                setError('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
                return;
            }

            const response = await getWithAuth(API_ENDPOINTS.PROFILE, token);
            setUserProfile(response);

            // Verificar si realmente es admin
            if (response.rol !== 'admin') {
                setError('Acceso denegado. No tienes permisos de administrador.');
                return;
            }

        } catch (error) {
            console.error('Error al obtener perfil:', error);
            setError(error.message || 'Error al cargar la información del perfil');

            // Si es error de autenticación, eliminar token
            if (error.message.includes('401') || error.message.includes('token')) {
                removeToken();
                message.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        removeToken();
        message.success('Sesión de administrador cerrada exitosamente');
        window.location.reload();
    };

    const handleRetry = () => {
        fetchUserProfile();
    };

    if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card style={{
          textAlign: 'center',
          minWidth: '300px',
          background: '#242424',
          border: '1px solid #2d2d2d',
          borderRadius: '12px'
        }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text style={{ 
              color: '#a0a0a0',
              fontSize: '16px',
              fontFamily: "'Playfair Display', 'Georgia', serif"
            }}>
              Verificando autenticación...
            </Text>
          </div>
        </Card>

        {/* Estilos globales para el spinner */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

          .ant-spin-dot-item {
            background-color: #5ebd8f !important;
          }

          .ant-card {
            background: #242424 !important;
            border: 1px solid #2d2d2d !important;
          }
        `}</style>
      </div>
    );
  }

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #6bcf7f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <Card style={{ maxWidth: '500px', width: '100%' }}>
                    <Alert
                        message="Error de Acceso"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: '16px' }}
                    />
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={handleRetry}
                            style={{ marginRight: '8px' }}
                        >
                            Reintentar
                        </Button>
                        <Button
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                        >
                            Volver al Login
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider
                width={280}
                style={{
                    background: '#2b2b2b',
                    position: 'fixed',
                    height: '100vh',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    overflow: 'auto',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
                }}
            >
                <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    {/* Logo en la parte superior */}
                    <div style={{ padding: '15px 16px' }}>
                        <div style={{
                            padding: '8px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px'
                        }}>
                            <img
                                src={logoImage}
                                alt="SimiliCode Logo"
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    objectFit: 'contain',
                                    filter: 'brightness(1.1)'
                                }}
                            />
                            <Title
                                level={4}
                                style={{
                                    color: '#e8e8e8',
                                    margin: 0,
                                    fontFamily: "'Playfair Display', 'Georgia', serif",
                                    fontSize: '20px',
                                    fontWeight: '500'
                                }}
                            >
                                SimilCode
                            </Title>
                        </div>

                        {/* Sección de opciones de administración */}
                        <div style={{ marginTop: '20px' }}>
                            <div 
                                className="admin-menu-item"
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s ease'
                                }}
                                onClick={() => message.info('Gestión de usuarios')}
                            >
                                <Text strong style={{ 
                                    color: '#e8e8e8', 
                                    display: 'block',
                                    fontSize: '14px',
                                    marginBottom: '4px'
                                }}>
                                    <UserOutlined style={{ marginRight: '8px' }} />
                                    Usuarios
                                </Text>
                            </div>

                            <div 
                                className="admin-menu-item"
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s ease'
                                }}
                                onClick={() => message.info('Gestión de lenguajes')}
                            >
                                <Text strong style={{ 
                                    color: '#e8e8e8', 
                                    display: 'block',
                                    fontSize: '14px',
                                    marginBottom: '4px'
                                }}>
                                    <svg 
                                        style={{ 
                                            width: '14px', 
                                            height: '14px', 
                                            marginRight: '8px',
                                            verticalAlign: 'middle'
                                        }} 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2"
                                    >
                                        <polyline points="16 18 22 12 16 6"></polyline>
                                        <polyline points="8 6 2 12 8 18"></polyline>
                                    </svg>
                                    Lenguajes
                                </Text>
                            </div>
                        </div>
                    </div>

                    {/* Usuario y cerrar sesión en la parte inferior */}
                    <div style={{
                        padding: '16px',
                        borderTop: '1px solid #404040'
                    }}>
                        <div 
                            className="admin-user-button"
                            style={{
                                height: '40px',
                                borderRadius: '8px',
                                background: 'transparent',
                                border: '1px solid #3d3d3d',
                                color: '#e8e8e8',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                paddingLeft: '16px',
                                gap: '12px',
                                marginBottom: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <UserOutlined style={{ fontSize: '18px', color: '#e8e8e8' }} />
                            <Text style={{ color: '#e8e8e8', fontSize: '14px' }}>
                                {userProfile?.nombre || 'admin'}
                            </Text>
                        </div>

                        <Button
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            block
                            className="logout-button"
                            style={{
                                borderRadius: '8px',
                                background: 'transparent',
                                border: '1px solid #5c3535',
                                color: '#ff6b6b',
                                height: '40px',
                                fontSize: '14px',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            Cerrar sesión
                        </Button>
                    </div>
                </div>
            </Sider>

            {/* Contenido principal */}
            <Layout style={{ marginLeft: 280 }}>
                <Content style={{
                    background: '#1a1a1a',
                    minHeight: '100vh',
                    padding: '0'
                }}>
                    <div style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 20px'
                    }}>
                        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
                            {/* Logo/Icono central */}
                            <div style={{ marginBottom: '32px' }}>
                                <img
                                    src={logoImage}
                                    alt="SimiliCode"
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        filter: 'brightness(0) invert(1)',
                                        opacity: 0.9
                                    }}
                                />
                            </div>

                            {/* Mensaje de bienvenida */}
                            <Title level={1} style={{
                                color: '#e8e8e8',
                                fontSize: '48px',
                                fontWeight: 400,
                                margin: '0 0 16px 0',
                                fontFamily: 'serif'
                            }}>
                                ¡{userProfile?.nombre}, Buenos días!
                            </Title>
                        </div>
                    </div>
                </Content>
            </Layout>

            <style>{`
                /* Botón de usuario con hover */
                .admin-user-button:hover {
                    background: rgba(255,255,255,0.05) !important;
                    border-color: #5ebd8f !important;
                }

                /* Botón de cerrar sesión */
                .logout-button:hover {
                    background: rgba(255, 107, 107, 0.1) !important;
                    border-color: #ff6b6b !important;
                    color: #ff8787 !important;
                }

                /* Items del menú de administración */
                .admin-menu-item {
                    transition: all 0.2s ease;
                }

                .admin-menu-item:hover {
                    background: #2d2d2d !important;
                }
            `}</style>
        </Layout>
    );
};

export default Admin;