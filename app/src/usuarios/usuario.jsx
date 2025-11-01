import React, { useState, useEffect } from 'react';
import {
    Layout,
    Typography,
    Space,
    Button,
    Divider,
    message,
    Spin,
    Alert,
    Card
} from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    PlusOutlined,
    MessageOutlined,
    StarOutlined,
    ClockCircleOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { API_ENDPOINTS, getWithAuth, getStoredToken, removeToken, buildApiUrl } from '../../config';
import logo from '../img/logo.png';
import CodeComparisonView from './CodeComparisonView';
import ModalSeleccionIA from '../usuarios/CompenentesDocente/ModalSeleccion';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const Usuario = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [greeting, setGreeting] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    
    // Estados para las comparaciones
    const [comparacionesDestacadas, setComparacionesDestacadas] = useState([]);
    const [comparacionesRecientes, setComparacionesRecientes] = useState([]);
    const [loadingComparaciones, setLoadingComparaciones] = useState(false);

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

    const fetchComparaciones = async (usuarioId) => {
        try {
            setLoadingComparaciones(true);
            const token = getStoredToken();

            if (!token || !usuarioId) {
                console.warn('⚠️ No hay token o usuario ID');
                return;
            }

            console.log('🔍 Cargando comparaciones para usuario:', usuarioId);

            const endpointIndividual = `${API_ENDPOINTS.LISTAR_INDIVIDUAL}/${usuarioId}/`;
            const endpointGrupal = `${API_ENDPOINTS.LISTAR_GRUPAL}/${usuarioId}/`;

            console.log('📡 Endpoint Individual:', endpointIndividual);
            console.log('📡 Endpoint Grupal:', endpointGrupal);

            const [individuales, grupales] = await Promise.all([
                getWithAuth(endpointIndividual, token).catch(err => {
                    console.error('❌ Error en individuales:', err);
                    return { comparaciones: [] };
                }),
                getWithAuth(endpointGrupal, token).catch(err => {
                    console.error('❌ Error en grupales:', err);
                    return { comparaciones: [] };
                })
            ]);

            console.log('✅ Individuales recibidas:', individuales);
            console.log('✅ Grupales recibidas:', grupales);

            const todasComparaciones = [
                ...(individuales.comparaciones || []).map(comp => ({ ...comp, tipo: 'individual' })),
                ...(grupales.comparaciones || []).map(comp => ({ ...comp, tipo: 'grupal' }))
            ];

            console.log('📊 Total combinadas:', todasComparaciones.length);

            const destacadas = todasComparaciones.filter(comp => 
                comp.estado && comp.estado.toLowerCase() === 'destacado'
            );

            const recientes = todasComparaciones.filter(comp => 
                comp.estado && comp.estado.toLowerCase() === 'reciente'
            ).sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

            console.log('⭐ Destacadas:', destacadas.length);
            console.log('🕐 Recientes:', recientes.length);

            setComparacionesDestacadas(destacadas);
            setComparacionesRecientes(recientes);

        } catch (error) {
            console.error('❌ Error al cargar comparaciones:', error);
        } finally {
            setLoadingComparaciones(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (userProfile && userProfile.usuario_id) {
            console.log('👤 Perfil cargado, obteniendo comparaciones...');
            fetchComparaciones(userProfile.usuario_id);
        }
    }, [userProfile]);

    const handleLogout = () => {
        removeToken();
        message.success('Sesión cerrada exitosamente');
        window.location.reload();
    };

    const handleNewIndividualComparison = () => {
        console.log('Abriendo modal para comparación individual');
        setIsModalVisible(true);
    };

    const handleNewGroupComparison = () => {
        message.info('Comparación grupal - Funcionalidad por implementar');
    };

    const handleModelSelect = (model) => {
        console.log('Modelo seleccionado:', model);
        setSelectedModel(model);
        setIsModalVisible(false);
        message.success(`Modelo ${model.name} seleccionado`);
    };

    const handleBackToHome = () => {
        setSelectedModel(null);
        if (userProfile && userProfile.usuario_id) {
            fetchComparaciones(userProfile.usuario_id);
        }
    };

    const handleComparacionClick = (comparacion) => {
        console.log('🔍 Comparación seleccionada:', comparacion);
        message.info(`Abriendo: ${comparacion.nombre_comparacion}`);
    };

    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);

        hoy.setHours(0, 0, 0, 0);
        ayer.setHours(0, 0, 0, 0);
        const dateToCompare = new Date(date);
        dateToCompare.setHours(0, 0, 0, 0);

        if (dateToCompare.getTime() === hoy.getTime()) {
            return 'Hoy';
        } else if (dateToCompare.getTime() === ayer.getTime()) {
            return 'Ayer';
        } else {
            return date.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        }
    };

    const renderComparacionItem = (comparacion) => (
        <div
            key={`${comparacion.tipo}-${comparacion.id}`}
            onClick={() => handleComparacionClick(comparacion)}
            style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                background: 'transparent',
                marginBottom: '4px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2d2d2d';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
            }}
        >
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '4px'
            }}>
                <FileTextOutlined style={{ color: '#5ebd8f', fontSize: '14px' }} />
                <Text 
                    style={{ 
                        color: '#e8e8e8', 
                        fontSize: '13px',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {comparacion.nombre_comparacion}
                </Text>
            </div>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingLeft: '22px'
            }}>
                <Text style={{ color: '#6b6b6b', fontSize: '11px' }}>
                    {comparacion.tipo === 'individual' ? 'Individual' : 'Grupal'}
                </Text>
                <Text style={{ color: '#6b6b6b', fontSize: '11px' }}>
                    {formatFecha(comparacion.fecha_creacion)}
                </Text>
            </div>
        </div>
    );

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
        <>
            <Layout style={{ minHeight: '100vh', background: '#1a1a1a' }}>
                <Sider
                    width={280}
                    style={{
                        background: '#242424',
                        borderRight: '1px solid #2d2d2d',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden' // ← Sin scroll en el Sider completo
                    }}
                >
                    {/* ✨ HEADER FIJO - No se mueve */}
                    <div style={{
                        padding: '20px 16px',
                        flexShrink: 0 // No se comprime
                    }}>
                        {/* Logo y Título */}
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
                                className="comparison-button"
                            >
                                Comparación individual
                            </Button>

                            <Button
                                icon={<PlusOutlined />}
                                onClick={handleNewGroupComparison}
                                block
                                className="comparison-button"
                            >
                                Comparación grupal
                            </Button>
                        </Space>

                        <Divider style={{ margin: '16px 0 8px 0', borderColor: '#2d2d2d' }} />

                        {/* Sección Chats */}
                        <div style={{ marginTop: '8px' }}>
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

                        <Divider style={{ margin: '8px 0', borderColor: '#2d2d2d' }} />
                    </div>

                    {/* ✨ ÁREA SCROLLEABLE - Solo esta parte tiene scroll */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '0 16px',
                        marginBottom: '120px' // Espacio para el footer
                    }}>
                        {/* Sección Destacados */}
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{
                                padding: '8px 12px',
                                color: '#a0a0a0',
                                fontSize: '13px',
                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span>
                                    <StarOutlined style={{ marginRight: '8px' }} />
                                    Destacados
                                </span>
                                {loadingComparaciones && <Spin size="small" />}
                            </div>
                            {!loadingComparaciones && comparacionesDestacadas.length === 0 ? (
                                <div style={{ color: '#6b6b6b', fontSize: '13px', padding: '12px 16px' }}>
                                    Sin elementos destacados
                                </div>
                            ) : (
                                <div style={{ padding: '4px 0' }}>
                                    {comparacionesDestacadas.map(renderComparacionItem)}
                                </div>
                            )}
                        </div>

                        <Divider style={{ margin: '8px 0', borderColor: '#2d2d2d' }} />

                        {/* Sección Recientes */}
                        <div>
                            <div style={{
                                padding: '8px 12px',
                                color: '#a0a0a0',
                                fontSize: '13px',
                                fontFamily: "'Playfair Display', 'Georgia', serif",
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span>
                                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                                    Comparaciones recientes
                                </span>
                                {loadingComparaciones && <Spin size="small" />}
                            </div>
                            {!loadingComparaciones && comparacionesRecientes.length === 0 ? (
                                <div style={{ color: '#6b6b6b', fontSize: '13px', padding: '12px 16px' }}>
                                    No hay comparaciones recientes
                                </div>
                            ) : (
                                <div style={{ padding: '4px 0' }}>
                                    {comparacionesRecientes.map(renderComparacionItem)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ✨ FOOTER FIJO - No se mueve */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: '#242424',
                        padding: '16px',
                        borderTop: '1px solid #2d2d2d'
                    }}>
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
                </Sider>

                <Layout style={{ marginLeft: 280, background: '#1a1a1a' }}>
                    <Content style={{
                        padding: '60px 80px',
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
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
            </Layout>

            <ModalSeleccionIA
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onModelSelect={handleModelSelect}
            />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

                .comparison-button {
                    height: 44px !important;
                    border-radius: 8px !important;
                    background: #5ebd8f !important;
                    border: none !important;
                    color: #1a1a1a !important;
                    font-size: 15px !important;
                    font-family: 'Playfair Display', 'Georgia', serif !important;
                    font-weight: 600 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    transition: all 0.2s ease !important;
                }

                .comparison-button:hover {
                    background: #6dd4a6 !important;
                    color: #1a1a1a !important;
                }

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
        </>
    );
};

export default Usuario;