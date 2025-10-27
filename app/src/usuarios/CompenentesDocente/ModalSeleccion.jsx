import React, { useState } from 'react';
import { Modal, Card, Space, Typography, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

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

const ModalSeleccionIA = ({ isVisible, onClose, onModelSelect }) => {
    const [hoveredCard, setHoveredCard] = useState(null);

    const handleModelSelect = (model) => {
        console.log('Seleccionando modelo:', model);
        onModelSelect(model);
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
    );
};

export default ModalSeleccionIA;