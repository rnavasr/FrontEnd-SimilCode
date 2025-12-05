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
    LogoutOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { API_ENDPOINTS, getWithAuth, getStoredToken, removeToken } from '../../config';
import AdminSidebar from './ComponentesAdministrador/VistaPrincipalAdmin/AdminSideBar';
import GestionLenguajes from './ComponentesAdministrador/ComponentesLenguaje/GestionLeguajes';
import GestionModelosIA from './ComponentesAdministrador/ComponentesModelosIA/GestionModelosIA';
import GestionComparaciones from './ComponentesAdministrador/ComponentesComparaciones/GestionComparaciones';
import '../administrador/Estilos/VistaPrincipalAdmin/Admin.css';
import logoImage from '../img/logo.png';

const { Title, Text } = Typography;
const { Content } = Layout;

const Admin = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [vistaActual, setVistaActual] = useState('inicio'); // 'inicio', 'lenguajes', 'usuarios', 'comparaciones', 'modelos'

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Buenos días';
        if (hour >= 12 && hour < 19) return 'Buenas tardes';
        return 'Buenas noches';
    };

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

            // Guardar el perfil en localStorage para uso en otros componentes
            localStorage.setItem('userProfile', JSON.stringify(response));

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
                localStorage.removeItem('userProfile');
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
        localStorage.removeItem('userProfile');
        message.success('Sesión de administrador cerrada exitosamente');
        window.location.reload();
    };

    const handleRetry = () => {
        fetchUserProfile();
    };

    const handleChangeVista = (vista) => {
        setVistaActual(vista);
    };

    const renderContent = () => {
        switch (vistaActual) {
            case 'lenguajes':
                return (
                    <GestionLenguajes 
                        onVolver={() => setVistaActual('inicio')} 
                        userProfile={userProfile}
                    />
                );
            case 'modelos':
                return (
                    <GestionModelosIA 
                        onVolver={() => setVistaActual('inicio')} 
                        userProfile={userProfile}
                    />
                );
            case 'comparaciones':
                return (
                    <GestionComparaciones 
                        onVolver={() => setVistaActual('inicio')} 
                        userProfile={userProfile}
                    />
                );
            case 'usuarios':
                return (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <Title level={2} style={{ color: '#e8e8e8' }}>
                            Gestión de Usuarios
                        </Title>
                        <Text style={{ color: '#a0a0a0' }}>
                            Módulo en desarrollo...
                        </Text>
                    </div>
                );
            case 'inicio':
            default:
                return (
                    <div className="admin-welcome-container">
                        <div className="admin-welcome-content">
                            <div className="admin-welcome-logo">
                                <img
                                    src={logoImage}
                                    alt="SimiliCode"
                                    className="admin-logo-image"
                                />
                            </div>

                            <Title level={1} className="admin-welcome-title">
                                ¡{userProfile?.nombres}, {getGreeting()}!
                            </Title>
                        </div>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="admin-loading-container">
                <Card className="admin-loading-card">
                    <Spin size="large" />
                    <div className="admin-loading-text">
                        <Text className="admin-loading-message">
                            Verificando autenticación...
                        </Text>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-error-container">
                <Card className="admin-error-card">
                    <Alert
                        message="Error de Acceso"
                        description={error}
                        type="error"
                        showIcon
                        className="admin-error-alert"
                    />
                    <div className="admin-error-actions">
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={handleRetry}
                            className="admin-retry-button"
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
        <Layout className="admin-layout">
            <AdminSidebar 
                userProfile={userProfile}
                onLogout={handleLogout}
                onChangeVista={handleChangeVista}
                vistaActual={vistaActual}
            />

            <Layout className="admin-main-layout">
                <Content className="admin-content">
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
};

export default Admin;