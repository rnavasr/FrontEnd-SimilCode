import React, { useState, useEffect } from 'react';
import {
    Layout,
    Menu,
    Typography,
    Space,
    Button,
    Avatar,
    Divider,
    message,
    Spin,
    Alert,
    Card,
    Modal
} from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    PlusOutlined,
    MessageOutlined,
    StarOutlined,
    ClockCircleOutlined,
    SettingOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { API_ENDPOINTS, getWithAuth, getStoredToken, removeToken } from '../../config';
import logo from '../img/logo.png';
import CodeComparisonView from './CodeComparisonView';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

// Modelos de IA disponibles
const AI_MODELS = [
    {
        id: 'claude-opus-4.1',
        name: 'Claude Opus 4.1',
        description: 'El modelo más avanzado de Anthropic',
        icon: '🧠',
        color: '#D97757',
        provider: 'Anthropic'
    },
    {
        id: 'chatgpt-5',
        name: 'ChatGPT 5',
        description: 'La última generación de OpenAI',
        icon: '✨',
        color: '#10A37F',
        provider: 'OpenAI'
    },
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'El modelo multimodal de Google',
        icon: '💎',
        color: '#4285F4',
        provider: 'Google'
    },
    {
        id: 'deepseek-v3',
        name: 'DeepSeek V3',
        description: 'Modelo optimizado para código',
        icon: '🚀',
        color: '#8B5CF6',
        provider: 'DeepSeek'
    }
];

const Usuario = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [greeting, setGreeting] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);

    // Determinar saludo según la hora
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
            setGreeting(getGreeting());

        } catch (error) {
            console.error('Error al obtener perfil:', error);
            setError(error.message || 'Error al cargar la información del perfil');

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
        message.success('Sesión cerrada exitosamente');
        window.location.reload();
    };

    const handleNewIndividualComparison = () => {
        message.info('Iniciando comparación individual...');
    };

    const handleNewGroupComparison = () => {
        setIsModalVisible(true);
    };

    const handleModelSelect = (model) => {
        setSelectedModel(model);
        setIsModalVisible(false);
        message.success(`Modelo ${model.name} seleccionado`);
    };

    const handleBackToHome = () => {
        setSelectedModel(null);
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
                    border: '1px solid #2d2d2d'
                }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>
                        <Text style={{ color: '#a0a0a0' }}>Cargando información del perfil...</Text>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
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
                    maxWidth: '500px',
                    width: '100%',
                    background: '#242424',
                    border: '1px solid #2d2d2d'
                }}>
                    <Alert
                        message="Error al cargar el perfil"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: '16px', background: '#2d1f1f', border: '1px solid #5c3535' }}
                    />
                    <div style={{ textAlign: 'center' }}>
                        <Button
                            onClick={handleLogout}
                            style={{
                                background: '#5ebd8f',
                                border: 'none',
                                color: '#1a1a1a',
                                height: '40px',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}
                        >
                            Volver al Login
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#1a1a1a' }}>
            {/* Sidebar Izquierdo */}
            <Sider
                width={280}
                style={{
                    background: '#242424',
                    borderRight: '1px solid #2d2d2d',
                    padding: '20px 16px',
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0
                }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>

                    {/* Logo/Header */}
                    <div style={{ 
                        padding: '8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        <img
                            src={logo}
                            alt="Logo"
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

                    {/* Botones de Nueva Comparación */}
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Button
                            icon={<PlusOutlined />}
                            onClick={handleNewIndividualComparison}
                            block
                            style={{
                                height: '44px',
                                borderRadius: '8px',
                                background: '#5ebd8f',
                                border: 'none',
                                color: '#1a1a1a',
                                fontSize: '15px',
                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#6dd4a6'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#5ebd8f'}
                        >
                            Comparación individual
                        </Button>

                        <Button
                            icon={<PlusOutlined />}
                            onClick={handleNewGroupComparison}
                            block
                            style={{
                                height: '44px',
                                borderRadius: '8px',
                                background: '#5ebd8f',
                                border: 'none',
                                color: '#1a1a1a',
                                fontSize: '15px',
                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#6dd4a6'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#5ebd8f'}
                        >
                            Comparación grupal
                        </Button>
                    </Space>

                    <Divider style={{ margin: '8px 0', borderColor: '#2d2d2d' }} />

                    {/* Sección Chats */}
                    <div>
                        <div style={{
                            padding: '8px 12px',
                            color: '#a0a0a0',
                            fontSize: '13px',
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            fontWeight: '500'
                        }}>
                            <MessageOutlined style={{ marginRight: '8px' }} />
                            Chats
                        </div>
                        <div style={{ color: '#6b6b6b', fontSize: '13px', padding: '12px 16px' }}>
                            No hay conversaciones recientes
                        </div>
                    </div>

                    {/* Sección Destacados */}
                    <div>
                        <div style={{
                            padding: '8px 12px',
                            color: '#a0a0a0',
                            fontSize: '13px',
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            fontWeight: '500'
                        }}>
                            <StarOutlined style={{ marginRight: '8px' }} />
                            Destacados
                        </div>
                        <div style={{ color: '#6b6b6b', fontSize: '13px', padding: '12px 16px' }}>
                            Sin elementos destacados
                        </div>
                    </div>

                    {/* Sección Comparaciones Recientes */}
                    <div>
                        <div style={{
                            padding: '8px 12px',
                            color: '#a0a0a0',
                            fontSize: '13px',
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            fontWeight: '500'
                        }}>
                            <ClockCircleOutlined style={{ marginRight: '8px' }} />
                            Comparaciones recientes
                        </div>
                        <div style={{ color: '#6b6b6b', fontSize: '13px', padding: '12px 16px' }}>
                            No hay comparaciones recientes
                        </div>
                    </div>

                    {/* Usuario y Cerrar Sesión al final */}
                    <div style={{ position: 'absolute', bottom: '20px', left: '16px', right: '16px' }}>
                        <Divider style={{ margin: '16px 0', borderColor: '#2d2d2d' }} />

                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Button
                                icon={<UserOutlined />}
                                block
                                style={{
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
                            >
                                {userProfile.usuario}
                            </Button>

                            <Button
                                icon={<LogoutOutlined />}
                                onClick={handleLogout}
                                block
                                danger
                                style={{
                                    height: '40px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: "'Playfair Display', 'Georgia', serif",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    paddingLeft: '16px'
                                }}
                            >
                                Cerrar sesión
                            </Button>
                        </Space>
                    </div>

                </Space>
            </Sider>

            {/* Contenido Principal */}
            <Layout style={{ marginLeft: 280, background: '#1a1a1a' }}>
                <Content style={{
                    padding: '60px 80px',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {/* Mostrar el componente de comparación o el saludo */}
                    {selectedModel ? (
                        <CodeComparisonView 
                            model={selectedModel} 
                            onBack={handleBackToHome}
                            userProfile={userProfile}
                        />
                    ) : (
                        <div style={{
                            maxWidth: '900px',
                            width: '100%',
                            textAlign: 'center'
                        }}>
                            {/* Saludo grande */}
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div>
                                    <div style={{
                                        fontSize: '48px',
                                        marginBottom: '8px'
                                    }}>
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
                                    </div>
                                    <Title
                                        level={1}
                                        style={{
                                            color: '#e8e8e8',
                                            fontSize: '48px',
                                            fontWeight: '400',
                                            margin: '0 0 16px 0',
                                            fontFamily: "'Playfair Display', 'Georgia', serif",
                                            letterSpacing: '0.5px'
                                        }}
                                    >
                                        ¡{userProfile.nombre}, {greeting}!
                                    </Title>
                                </div>
                            </Space>
                        </div>
                    )}
                </Content>
            </Layout>

            {/* Modal de Selección de Modelo de IA */}
            <Modal
                title={
                    <div style={{
                        textAlign: 'center',
                        fontSize: '24px',
                        fontFamily: "'Playfair Display', 'Georgia', serif",
                        fontWeight: '600',
                        color: '#e8e8e8'
                    }}>
                        Selecciona un Modelo de IA
                    </div>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={900}
                centered
                style={{
                    fontFamily: "'Playfair Display', 'Georgia', serif"
                }}
                bodyStyle={{
                    background: '#1a1a1a',
                    padding: '30px'
                }}
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px'
                }}>
                    {AI_MODELS.map((model) => (
                        <Card
                            key={model.id}
                            hoverable
                            onClick={() => handleModelSelect(model)}
                            onMouseEnter={() => setHoveredCard(model.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{
                                background: hoveredCard === model.id ? '#2d2d2d' : '#242424',
                                border: `2px solid ${hoveredCard === model.id ? model.color : '#3d3d3d'}`,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: hoveredCard === model.id ? 'translateY(-5px)' : 'translateY(0)',
                                boxShadow: hoveredCard === model.id ? `0 8px 24px ${model.color}40` : 'none'
                            }}
                            bodyStyle={{
                                padding: '24px'
                            }}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div style={{
                                    fontSize: '48px',
                                    textAlign: 'center',
                                    marginBottom: '8px'
                                }}>
                                    {model.icon}
                                </div>
                                
                                <div style={{ textAlign: 'center' }}>
                                    <Title
                                        level={4}
                                        style={{
                                            color: model.color,
                                            margin: '0 0 8px 0',
                                            fontFamily: "'Playfair Display', 'Georgia', serif",
                                            fontSize: '20px'
                                        }}
                                    >
                                        {model.name}
                                    </Title>
                                    
                                    <Text style={{
                                        color: '#a0a0a0',
                                        fontSize: '13px',
                                        display: 'block',
                                        marginBottom: '12px'
                                    }}>
                                        {model.provider}
                                    </Text>
                                </div>

                                <Text style={{
                                    color: '#d0d0d0',
                                    fontSize: '14px',
                                    textAlign: 'center',
                                    display: 'block',
                                    lineHeight: '1.6'
                                }}>
                                    {model.description}
                                </Text>

                                <Button
                                    type="primary"
                                    block
                                    icon={<CheckCircleOutlined />}
                                    style={{
                                        marginTop: '12px',
                                        height: '40px',
                                        background: model.color,
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        fontFamily: "'Playfair Display', 'Georgia', serif"
                                    }}
                                >
                                    Seleccionar
                                </Button>
                            </Space>
                        </Card>
                    ))}
                </div>
            </Modal>

            {/* Estilos globales */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

                /* Scrollbar personalizado para el sidebar */
                ::-webkit-scrollbar {
                    width: 6px;
                }

                ::-webkit-scrollbar-track {
                    background: #1a1a1a;
                }

                ::-webkit-scrollbar-thumb {
                    background: #3d3d3d;
                    border-radius: 3px;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: #5ebd8f;
                }

                /* Ant Design overrides */
                .ant-layout-sider {
                    background: #242424 !important;
                }

                .ant-btn-dangerous {
                    background: transparent !important;
                    border-color: #5c3535 !important;
                    color: #ff6b6b !important;
                }

                .ant-btn-dangerous:hover {
                    background: #2d1f1f !important;
                    border-color: #ff6b6b !important;
                    color: #ff8787 !important;
                }

                /* Modal overrides */
                .ant-modal-content {
                    background: #1a1a1a !important;
                    border: 1px solid #2d2d2d !important;
                }

                .ant-modal-header {
                    background: #1a1a1a !important;
                    border-bottom: 1px solid #2d2d2d !important;
                }

                .ant-modal-close {
                    color: #a0a0a0 !important;
                }

                .ant-modal-close:hover {
                    color: #e8e8e8 !important;
                }
            `}</style>
        </Layout>
    );
};

export default Usuario;