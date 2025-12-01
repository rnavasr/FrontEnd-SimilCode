import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Space,
    Row,
    Col,
    Avatar,
    Divider,
    Button,
    message,
    Spin,
    Tag,
    Alert,
    Statistic,
    Badge,
    Layout
} from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    IdcardOutlined,
    CrownOutlined,
    ReloadOutlined,
    DashboardOutlined,
    TeamOutlined,
    SettingOutlined,
    SafetyOutlined
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

    const handleAdminAction = (action) => {
        message.info(`Funcionalidad de ${action} en desarrollo...`);
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #6bcf7f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <Card style={{ textAlign: 'center', minWidth: '300px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>
                        <Text>Cargando panel de administración...</Text>
                    </div>
                </Card>
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
                    </div>

                    {/* Usuario y cerrar sesión en la parte inferior */}
                    <div style={{
                        padding: '24px',
                        borderTop: '1px solid #404040'
                    }}>
                        <div style={{
                            height: '40px',
                            borderRadius: '8px',
                            background: 'transparent',
                            border: '1px solid #3d3d3d',
                            color: '#e8e8e8',
                            fontSize: '14px',
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            paddingLeft: '16px'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            <UserOutlined style={{ fontSize: '20px', color: '#ffffff' }} />
                            <Text strong style={{ color: '#ffffff', fontSize: '15px' }}>
                                {userProfile?.nombre || 'admin'}
                            </Text>
                        </div>

                        <Button
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            block
                            style={{
                                borderRadius: '8px',
                                background: 'transparent',
                                border: '1px solid #ff4d4f',
                                color: '#ff4d4f',
                                height: '40px',
                                fontSize: '14px',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#ff4d4f';
                                e.currentTarget.style.color = '#e8e8e8';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#ff4d4f';
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
        </Layout>
    );
};

export default Admin;