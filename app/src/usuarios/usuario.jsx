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
    Card,
    Dropdown,
    Modal
} from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    PlusOutlined,
    MessageOutlined,
    StarOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    MoreOutlined,
    StarFilled,
    DeleteOutlined,
    ExclamationCircleOutlined
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

    // Estado para el modal de confirmación de eliminación
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [comparacionToDelete, setComparacionToDelete] = useState(null);

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

    // Función para marcar como destacado
    const marcarComoDestacado = async (comparacion) => {
        try {
            const token = getStoredToken();
            const endpoint = comparacion.tipo === 'individual' 
                ? `${API_ENDPOINTS.MARCAR_INDIVIDUAL_DESTACADO}/${comparacion.id}/`
                : `${API_ENDPOINTS.MARCAR_GRUPAL_DESTACADO}/${comparacion.id}/`;

            const response = await fetch(buildApiUrl(endpoint), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                message.success('Marcado como destacado');
                fetchComparaciones(userProfile.usuario_id);
            } else {
                message.error('Error al marcar como destacado');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al procesar la solicitud');
        }
    };

    // Función para marcar como reciente
    const marcarComoReciente = async (comparacion) => {
        try {
            const token = getStoredToken();
            const endpoint = comparacion.tipo === 'individual' 
                ? `${API_ENDPOINTS.MARCAR_INDIVIDUAL_RECIENTE}/${comparacion.id}/`
                : `${API_ENDPOINTS.MARCAR_GRUPAL_RECIENTE}/${comparacion.id}/`;

            const response = await fetch(buildApiUrl(endpoint), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                message.success('Marcado como reciente');
                fetchComparaciones(userProfile.usuario_id);
            } else {
                message.error('Error al marcar como reciente');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al procesar la solicitud');
        }
    };

    // Función para eliminar (ocultar)
    const eliminarComparacion = async () => {
        if (!comparacionToDelete) return;

        try {
            const token = getStoredToken();
            const endpoint = comparacionToDelete.tipo === 'individual' 
                ? `${API_ENDPOINTS.MARCAR_INDIVIDUAL_OCULTO}/${comparacionToDelete.id}/`
                : `${API_ENDPOINTS.MARCAR_GRUPAL_OCULTO}/${comparacionToDelete.id}/`;

            const response = await fetch(buildApiUrl(endpoint), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                message.success('Comparación eliminada');
                fetchComparaciones(userProfile.usuario_id);
                setDeleteModalVisible(false);
                setComparacionToDelete(null);
            } else {
                message.error('Error al eliminar la comparación');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al procesar la solicitud');
        }
    };

    // Función para mostrar el modal de confirmación
    const confirmarEliminacion = (comparacion) => {
        setComparacionToDelete(comparacion);
        setDeleteModalVisible(true);
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

    // Función para generar los items del menú según el estado
    const getMenuItems = (comparacion) => {
        const esDestacado = comparacion.estado && comparacion.estado.toLowerCase() === 'destacado';

        if (esDestacado) {
            // Si está destacado: mostrar opción para marcarlo como reciente
            return [
                {
                    key: 'reciente',
                    label: (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '4px 0',
                            color: '#e8e8e8'
                        }}>
                            <ClockCircleOutlined style={{ fontSize: '14px' }} />
                            <span>Marcar como reciente</span>
                        </div>
                    ),
                    onClick: () => marcarComoReciente(comparacion)
                },
                {
                    type: 'divider'
                },
                {
                    key: 'eliminar',
                    label: (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '4px 0',
                            color: '#ff6b6b'
                        }}>
                            <DeleteOutlined style={{ fontSize: '14px' }} />
                            <span>Eliminar</span>
                        </div>
                    ),
                    onClick: () => confirmarEliminacion(comparacion)
                }
            ];
        } else {
            // Si está en recientes: mostrar opción para destacar
            return [
                {
                    key: 'destacar',
                    label: (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '4px 0',
                            color: '#e8e8e8'
                        }}>
                            <StarFilled style={{ fontSize: '14px', color: '#ffd700' }} />
                            <span>Destacar</span>
                        </div>
                    ),
                    onClick: () => marcarComoDestacado(comparacion)
                },
                {
                    type: 'divider'
                },
                {
                    key: 'eliminar',
                    label: (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '4px 0',
                            color: '#ff6b6b'
                        }}>
                            <DeleteOutlined style={{ fontSize: '14px' }} />
                            <span>Eliminar</span>
                        </div>
                    ),
                    onClick: () => confirmarEliminacion(comparacion)
                }
            ];
        }
    };

    const renderComparacionItem = (comparacion) => (
        <div
            key={`${comparacion.tipo}-${comparacion.id}`}
            style={{
                padding: '10px 12px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                background: 'transparent',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
            }}
            className="comparacion-item"
        >
            <div 
                onClick={() => handleComparacionClick(comparacion)}
                style={{
                    flex: 1,
                    cursor: 'pointer',
                    minWidth: 0
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

            <Dropdown
                menu={{ items: getMenuItems(comparacion) }}
                trigger={['click']}
                placement="bottomRight"
                overlayStyle={{
                    minWidth: '200px'
                }}
                dropdownRender={(menu) => (
                    <div style={{
                        background: '#2d2d2d',
                        borderRadius: '8px',
                        border: '1px solid #3d3d3d',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                        padding: '4px'
                    }}>
                        {menu}
                    </div>
                )}
            >
                <Button
                    type="text"
                    icon={<MoreOutlined />}
                    style={{
                        color: '#6b6b6b',
                        height: '24px',
                        width: '24px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="menu-button"
                />
            </Dropdown>
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
                        overflow: 'hidden'
                    }}
                >
                    {/* HEADER FIJO */}
                    <div style={{
                        padding: '20px 16px',
                        flexShrink: 0
                    }}>
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

                    {/* ÁREA SCROLLEABLE */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '0 16px',
                        marginBottom: '120px'
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

                    {/* FOOTER FIJO */}
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

            {/* Modal de confirmación de eliminación */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e8e8e8' }}>
                        <ExclamationCircleOutlined style={{ color: '#ff6b6b', fontSize: '20px' }} />
                        <span>Confirmar eliminación</span>
                    </div>
                }
                open={deleteModalVisible}
                onOk={eliminarComparacion}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setComparacionToDelete(null);
                }}
                okText="Eliminar"
                cancelText="Cancelar"
                okButtonProps={{
                    danger: true,
                    style: {
                        background: '#ff6b6b',
                        borderColor: '#ff6b6b',
                        height: '36px',
                        borderRadius: '6px'
                    }
                }}
                cancelButtonProps={{
                    style: {
                        height: '36px',
                        borderRadius: '6px',
                        borderColor: '#3d3d3d',
                        color: '#e8e8e8'
                    }
                }}
            >
                <Text style={{ color: '#a0a0a0', fontSize: '14px' }}>
                    ¿Estás seguro de que deseas eliminar "{comparacionToDelete?.nombre_comparacion}"? 
                    Esta acción no se puede deshacer.
                </Text>
            </Modal>

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

                .comparacion-item:hover {
                    background: #2d2d2d !important;
                }

                .menu-button {
                    opacity: 0;
                    transition: all 0.2s ease !important;
                }

                .comparacion-item:hover .menu-button {
                    opacity: 1;
                }

                .menu-button:hover {
                    background: #3d3d3d !important;
                    color: #e8e8e8 !important;
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
                    background: #242424 !important;
                    border: 1px solid #2d2d2d !important;
                }

                .ant-modal-header {
                    background: #242424 !important;
                    border-bottom: 1px solid #2d2d2d !important;
                }

                .ant-modal-title {
                    color: #e8e8e8 !important;
                }

                .ant-modal-close {
                    color: #a0a0a0 !important;
                }

                .ant-modal-close:hover {
                    color: #e8e8e8 !important;
                }

                .ant-modal-body {
                    background: #242424 !important;
                }

                .ant-modal-footer {
                    background: #242424 !important;
                    border-top: 1px solid #2d2d2d !important;
                }

                .ant-dropdown-menu {
                    background: #2d2d2d !important;
                    border: 1px solid #3d3d3d !important;
                }

                .ant-dropdown-menu-item {
                    color: #e8e8e8 !important;
                }

                .ant-dropdown-menu-item:hover {
                    background: #3d3d3d !important;
                }

                .ant-dropdown-menu-item-divider {
                    background: #3d3d3d !important;
                }
            `}</style>
        </>
    );
};

export default Usuario;