import React, { useState, useEffect } from 'react';
import { Modal, Card, Space, Typography, Button, Spin, message, Tag, Divider } from 'antd';
import { CheckCircleOutlined, LoadingOutlined, StarFilled, UserOutlined, GlobalOutlined } from '@ant-design/icons';
import { API_BASE_URL, API_ENDPOINTS } from '../../../../config'; 

const { Title, Text } = Typography;

const ModalSeleccionIA = ({ isVisible, onClose, onModelSelect, usuarioId = null }) => {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [modelosUsuario, setModelosUsuario] = useState([]);
    const [modelosAdmin, setModelosAdmin] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isVisible && usuarioId) {
            cargarModelos();
        }
    }, [isVisible, usuarioId]);

    const cargarModelos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                message.error('No hay token de autenticación');
                return;
            }

            if (!usuarioId) {
                message.error('Se requiere ID de usuario');
                return;
            }

            console.log('Cargando modelos para usuario:', usuarioId);

            // Cargar modelos del admin y del usuario en paralelo
            const [responseAdmin, responseUsuario] = await Promise.all([
                // Modelos del admin
                fetch(`${API_BASE_URL}${API_ENDPOINTS.LISTAR_MODELOS_ADMIN}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }).catch(error => {
                    console.warn('Error al cargar modelos admin:', error);
                    return null;
                }),
                // Modelos del usuario
                fetch(`${API_BASE_URL}${API_ENDPOINTS.LISTAR_MODELOS_USUARIO}/${usuarioId}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }).catch(error => {
                    console.warn('Error al cargar modelos usuario:', error);
                    return null;
                })
            ]);

            let modelsAdmin = [];
            let modelsUsuario = [];

            // Procesar respuesta de modelos admin
            if (responseAdmin && responseAdmin.ok) {
                const dataAdmin = await responseAdmin.json();
                modelsAdmin = (dataAdmin.modelos || []).map(modelo => ({
                    id: modelo.id_modelo_ia,
                    name: modelo.nombre,
                    description: modelo.descripcion || 'Sin descripción',
                    icon: modelo.imagen ? `data:image/png;base64,${modelo.imagen}` : '🤖',
                    color: modelo.color || '#6B7280',
                    provider: modelo.nombre_proveedor || 'Sin proveedor',
                    isRecommended: modelo.recomendado || false,
                    origen: 'admin'
                }));
                console.log('Modelos admin cargados:', modelsAdmin.length);
            }

            // Procesar respuesta de modelos usuario
            if (responseUsuario && responseUsuario.ok) {
                const dataUsuario = await responseUsuario.json();
                modelsUsuario = (dataUsuario.modelos || []).map(modelo => ({
                    id: modelo.id_modelo_ia,
                    name: modelo.nombre,
                    description: modelo.descripcion || 'Sin descripción',
                    icon: modelo.imagen ? `data:image/png;base64,${modelo.imagen}` : '🤖',
                    color: modelo.color || '#6B7280',
                    provider: modelo.nombre_proveedor || 'Sin proveedor',
                    isRecommended: modelo.recomendado || false,
                    origen: 'usuario'
                }));
                console.log('Modelos usuario cargados:', modelsUsuario.length);
            }

            // Filtrar modelos admin que no estén en los modelos del usuario
            const idsUsuario = new Set(modelsUsuario.map(m => m.id));
            const modelsAdminFiltrados = modelsAdmin.filter(m => !idsUsuario.has(m.id));

            setModelosUsuario(modelsUsuario);
            setModelosAdmin(modelsAdminFiltrados);

            if (modelsUsuario.length === 0 && modelsAdminFiltrados.length === 0) {
                message.info('No hay modelos de IA disponibles');
            }

        } catch (error) {
            console.error('Error al cargar modelos:', error);
            message.error('Error al cargar los modelos de IA');
        } finally {
            setLoading(false);
        }
    };

    const handleModelSelect = (model) => {
        console.log('Seleccionando modelo:', model);
        onModelSelect(model);
        onClose();
    };

    const renderModelCard = (model) => (
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
                boxShadow: hoveredCard === model.id ? `0 8px 24px ${model.color}40` : 'none',
                position: 'relative'
            }}
            bodyStyle={{
                padding: '24px'
            }}
        >
            {model.isRecommended && (
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 1
                }}>
                    <Tag 
                        icon={<StarFilled />} 
                        color="gold"
                        style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            border: 'none',
                            padding: '4px 10px'
                        }}
                    >
                        Recomendado
                    </Tag>
                </div>
            )}

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{
                    fontSize: '48px',
                    textAlign: 'center',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {model.icon.startsWith('data:image') ? (
                        <img 
                            src={model.icon} 
                            alt={model.name}
                            style={{
                                width: '64px',
                                height: '64px',
                                objectFit: 'contain',
                                borderRadius: '8px'
                            }}
                        />
                    ) : (
                        <span>{model.icon}</span>
                    )}
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
    );

    return (
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
            open={isVisible}
            onCancel={onClose}
            footer={null}
            width={900}
            centered
            style={{
                fontFamily: "'Playfair Display', 'Georgia', serif"
            }}
            bodyStyle={{
                background: '#1a1a1a',
                padding: '30px',
                maxHeight: '80vh',
                overflowY: 'auto'
            }}
        >
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '300px'
                }}>
                    <Spin 
                        indicator={<LoadingOutlined style={{ fontSize: 48, color: '#fff' }} spin />}
                        tip={<span style={{ color: '#e8e8e8', marginTop: '16px' }}>Cargando modelos...</span>}
                    />
                </div>
            ) : modelosUsuario.length === 0 && modelosAdmin.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#a0a0a0'
                }}>
                    <Text style={{ fontSize: '16px', color: '#a0a0a0' }}>
                        No hay modelos de IA disponibles
                    </Text>
                </div>
            ) : (
                <>
                    {/* Sección: Mis Modelos */}
                    {modelosUsuario.length > 0 && (
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '20px'
                            }}>
                                <UserOutlined style={{ 
                                    fontSize: '20px', 
                                    color: '#5ebd8f' 
                                }} />
                                <Title 
                                    level={5} 
                                    style={{
                                        color: '#e8e8e8',
                                        margin: 0,
                                        fontFamily: "'Playfair Display', 'Georgia', serif",
                                        fontSize: '18px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Mis Modelos
                                </Title>
                                <Tag 
                                    color="#5ebd8f"
                                    style={{ 
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        border: 'none'
                                    }}
                                >
                                    {modelosUsuario.length}
                                </Tag>
                            </div>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '20px'
                            }}>
                                {modelosUsuario.map(renderModelCard)}
                            </div>
                        </div>
                    )}

                    {/* Divider entre secciones */}
                    {modelosUsuario.length > 0 && modelosAdmin.length > 0 && (
                        <Divider style={{ 
                            borderColor: '#3d3d3d',
                            margin: '32px 0'
                        }} />
                    )}

                    {/* Sección: Otros Modelos */}
                    {modelosAdmin.length > 0 && (
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '20px'
                            }}>
                                <GlobalOutlined style={{ 
                                    fontSize: '20px', 
                                    color: '#6B7280' 
                                }} />
                                <Title 
                                    level={5} 
                                    style={{
                                        color: '#e8e8e8',
                                        margin: 0,
                                        fontFamily: "'Playfair Display', 'Georgia', serif",
                                        fontSize: '18px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Otros Modelos
                                </Title>
                                <Tag 
                                    color="#6B7280"
                                    style={{ 
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        border: 'none'
                                    }}
                                >
                                    {modelosAdmin.length}
                                </Tag>
                            </div>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '20px'
                            }}>
                                {modelosAdmin.map(renderModelCard)}
                            </div>
                        </div>
                    )}
                </>
            )}
        </Modal>
    );
};

export default ModalSeleccionIA;