import React, { useState, useEffect } from 'react';
import { Modal, Card, Space, Typography, Button, Spin, message } from 'antd';
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config'; 

const { Title, Text } = Typography;

const ModalSeleccionIA = ({ isVisible, onClose, onModelSelect, usuarioId = null, esAdmin = false }) => {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [modelos, setModelos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isVisible) {
            cargarModelos();
        }
    }, [isVisible, usuarioId, esAdmin]);

    const cargarModelos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                message.error('No hay token de autenticación');
                return;
            }

            let url;
            if (esAdmin) {
                // Cargar modelos del admin (visibles para todos)
                url = `${API_BASE_URL}${API_ENDPOINTS.LISTAR_MODELOS_ADMIN}`;
            } else if (usuarioId) {
                // Cargar modelos del usuario específico
                url = `${API_BASE_URL}${API_ENDPOINTS.LISTAR_MODELOS_USUARIO}/${usuarioId}/`;
            } else {
                message.error('Se requiere ID de usuario o rol admin');
                return;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar los modelos');
            }

            const data = await response.json();
            
            // Transformar los datos de la API al formato del componente
            const modelosTransformados = data.modelos.map(modelo => ({
                id: modelo.id_modelo_ia,
                name: modelo.nombre,
                description: modelo.descripcion || 'Sin descripción',
                icon: modelo.imagen ? `data:image/png;base64,${modelo.imagen}` : '🤖',
                color: modelo.color || '#6B7280',
                provider: modelo.nombre_proveedor || 'Sin proveedor'
            }));

            setModelos(modelosTransformados);

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
                padding: '30px'
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
            ) : modelos.length === 0 ? (
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
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px'
                }}>
                    {modelos.map((model) => (
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
                    ))}
                </div>
            )}
        </Modal>
    );
};

export default ModalSeleccionIA;