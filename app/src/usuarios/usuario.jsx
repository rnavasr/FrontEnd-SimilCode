import React, { useState, useEffect } from 'react';
import {
    Layout,
    Typography,
    Space,
    message,
    Spin,
    Alert,
    Card,
    Modal
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { API_ENDPOINTS, getWithAuth, getStoredToken, removeToken, buildApiUrl } from '../../config';
import logo from '../img/logo.png';
import CodeComparisonView from './CompenentesDocente/ModuloDeComparacionIndividual/CodeComparisonView';
import ModalSeleccionIA from '../usuarios/CompenentesDocente/ModalSeleccion';
import DocenteSidebar from './CompenentesDocente/DocenteSidebar';
import ChatManagerView from './CompenentesDocente/GestionDeComparaciones';
import ComparisonDetailView from './CompenentesDocente/MostrarDatosComparacionesIndividualesCreadas/DetalleComparacion';
import './globalStyles.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const Usuario = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [greeting, setGreeting] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    const [showChatManager, setShowChatManager] = useState(false);
    
    // Estado para manejar la comparación seleccionada
    const [selectedComparacion, setSelectedComparacion] = useState(null);

    const [comparacionesDestacadas, setComparacionesDestacadas] = useState([]);
    const [comparacionesRecientes, setComparacionesRecientes] = useState([]);
    const [loadingComparaciones, setLoadingComparaciones] = useState(false);

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

            if (!token || !usuarioId) return;

            const endpointIndividual = `${API_ENDPOINTS.LISTAR_INDIVIDUAL}/${usuarioId}/`;
            const endpointGrupal = `${API_ENDPOINTS.LISTAR_GRUPAL}/${usuarioId}/`;

            const [individuales, grupales] = await Promise.all([
                getWithAuth(endpointIndividual, token).catch(() => ({ comparaciones: [] })),
                getWithAuth(endpointGrupal, token).catch(() => ({ comparaciones: [] }))
            ]);

            const todasComparaciones = [
                ...(individuales.comparaciones || []).map(comp => ({ ...comp, tipo: 'individual' })),
                ...(grupales.comparaciones || []).map(comp => ({ ...comp, tipo: 'grupal' }))
            ];

            const destacadas = todasComparaciones.filter(comp =>
                comp.estado && comp.estado.toLowerCase() === 'destacado'
            );

            const recientes = todasComparaciones.filter(comp =>
                comp.estado && comp.estado.toLowerCase() === 'reciente'
            ).sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

            setComparacionesDestacadas(destacadas);
            setComparacionesRecientes(recientes);
        } catch (error) {
            console.error('Error al cargar comparaciones:', error);
        } finally {
            setLoadingComparaciones(false);
        }
    };

    const refreshComparaciones = () => {
        if (userProfile && userProfile.usuario_id) {
            console.log('🔄 Actualizando lista de comparaciones...');
            fetchComparaciones(userProfile.usuario_id);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (userProfile && userProfile.usuario_id) {
            fetchComparaciones(userProfile.usuario_id);
        }
    }, [userProfile]);

    const handleLogout = () => {
        removeToken();
        message.success('Sesión cerrada exitosamente');
        window.location.reload();
    };

    const handleNewIndividualComparison = () => {
        setIsModalVisible(true);
    };

    const handleNewGroupComparison = () => {
        message.info('Comparación grupal - Funcionalidad por implementar');
    };

    const handleModelSelect = (model) => {
        setSelectedModel(model);
        setIsModalVisible(false);
        setShowChatManager(false);
        setSelectedComparacion(null);
        message.success(`Modelo ${model.name} seleccionado`);
    };

    const handleBackToHome = () => {
        setSelectedModel(null);
        setShowChatManager(false);
        setSelectedComparacion(null);
        refreshComparaciones();
    };

    const handleSearchChats = () => {
        setShowChatManager(true);
        setSelectedModel(null);
        setSelectedComparacion(null);
    };

    const handleComparacionClick = (comparacion) => {
        console.log('📋 Comparación seleccionada:', comparacion);
        setSelectedComparacion(comparacion);
        setSelectedModel(null);
        setShowChatManager(false);
    };

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
                refreshComparaciones();
            } else {
                message.error('Error al marcar como destacado');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al procesar la solicitud');
        }
    };

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
                refreshComparaciones();
            } else {
                message.error('Error al marcar como reciente');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al procesar la solicitud');
        }
    };

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
                refreshComparaciones();
                setDeleteModalVisible(false);
                setComparacionToDelete(null);
                
                // Si la comparación eliminada es la que está siendo vista, volver al home
                if (selectedComparacion && selectedComparacion.id === comparacionToDelete.id) {
                    setSelectedComparacion(null);
                }
            } else {
                message.error('Error al eliminar la comparación');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al procesar la solicitud');
        }
    };

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

        if (dateToCompare.getTime() === hoy.getTime()) return 'Hoy';
        if (dateToCompare.getTime() === ayer.getTime()) return 'Ayer';

        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
                        <button
                            onClick={handleLogout}
                            style={{
                                background: '#5ebd8f',
                                border: 'none',
                                color: '#1a1a1a',
                                height: '40px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                padding: '0 24px',
                                cursor: 'pointer'
                            }}
                        >
                            Volver al Login
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <>
            <Layout style={{ minHeight: '100vh', background: '#1a1a1a' }}>
                <DocenteSidebar
                    userProfile={userProfile}
                    comparacionesDestacadas={comparacionesDestacadas}
                    comparacionesRecientes={comparacionesRecientes}
                    loadingComparaciones={loadingComparaciones}
                    onNewIndividualComparison={handleNewIndividualComparison}
                    onNewGroupComparison={handleNewGroupComparison}
                    onComparacionClick={handleComparacionClick}
                    onMarcarDestacado={marcarComoDestacado}
                    onMarcarReciente={marcarComoReciente}
                    onEliminar={confirmarEliminacion}
                    onSearchChats={handleSearchChats}
                    onLogout={handleLogout}
                    formatFecha={formatFecha}
                />

                <Layout style={{ marginLeft: 280, background: '#1a1a1a' }}>
                    <Content style={{
                        padding: selectedModel || selectedComparacion
                            ? '0'
                            : showChatManager 
                                ? '40px 60px'
                                : '60px 80px',
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: selectedModel || selectedComparacion ? 'flex-start' : showChatManager ? 'flex-start' : 'center',
                        alignItems: selectedModel || selectedComparacion ? 'stretch' : 'center',
                        width: '100%',
                        maxWidth: '100%',
                        overflow: selectedModel || selectedComparacion ? 'auto' : 'visible'
                    }}>
                        {selectedComparacion ? (
                            <div style={{ 
                                width: '100%', 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <ComparisonDetailView
                                    comparacionId={selectedComparacion.id}
                                    onBack={handleBackToHome}
                                />
                            </div>
                        ) : showChatManager ? (
                            <ChatManagerView
                                comparacionesDestacadas={comparacionesDestacadas}
                                comparacionesRecientes={comparacionesRecientes}
                                onBack={handleBackToHome}
                                onComparacionClick={handleComparacionClick}
                                onMarcarDestacado={marcarComoDestacado}
                                onMarcarReciente={marcarComoReciente}
                                onEliminar={confirmarEliminacion}
                                formatFecha={formatFecha}
                            />
                        ) : selectedModel ? (
                            <div style={{ 
                                width: '100%', 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <CodeComparisonView
                                    model={selectedModel}
                                    onBack={handleBackToHome}
                                    userProfile={userProfile}
                                    refreshComparaciones={refreshComparaciones}
                                />
                            </div>
                        ) : (
                            <div style={{
                                maxWidth: '900px',
                                width: '100%',
                                textAlign: 'center'
                            }}>
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    <div>
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
                        color: '#a0a0a0',
                        background: '#242424'
                    }
                }}
            >
                <Text style={{ color: '#a0a0a0', fontSize: '14px' }}>
                    ¿Estás seguro de que deseas eliminar "{comparacionToDelete?.nombre_comparacion}"?
                </Text>
            </Modal>
            
            <ModalSeleccionIA
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onModelSelect={handleModelSelect}
                usuarioId={userProfile?.usuario_id}
            />
        </>
    );
};

export default Usuario;