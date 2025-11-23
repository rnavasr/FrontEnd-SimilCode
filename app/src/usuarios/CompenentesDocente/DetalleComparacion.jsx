import React, { useState, useEffect } from 'react';
import { Button, Typography, Card, notification, Spin, Tag, Space } from 'antd';
import {
    ArrowLeftOutlined,
    FileOutlined,
    CalendarOutlined,
    UserOutlined,
    CodeOutlined
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { API_BASE_URL, API_ENDPOINTS, buildApiUrl, getStoredToken } from '../../../config';
import '../Estilos/Css_Comparacion_Individual/ComparisonDetailView.css';

const { Title, Text } = Typography;

const ComparisonDetailView = ({ comparacionId, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [comparacion, setComparacion] = useState(null);

    useEffect(() => {
        if (comparacionId) {
            fetchComparacionData();
        }
    }, [comparacionId]);

    const fetchComparacionData = async () => {
        try {
            setLoading(true);
            const token = getStoredToken();
            
            // Usar el endpoint correcto del config
            const url = buildApiUrl(`${API_ENDPOINTS.OBTENER_COMPARACION_INDIVIDUAL}/${comparacionId}/`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cargar la comparación');
            }

            const data = await response.json();
            setComparacion(data);

        } catch (error) {
            console.error('Error:', error);
            notification.error({
                message: 'Error al cargar comparación',
                description: error.message || 'No se pudo cargar la información de la comparación.',
                placement: 'topRight',
                duration: 5
            });
        } finally {
            setLoading(false);
        }
    };

    const getMonacoLanguage = (languageName) => {
        if (!languageName) return 'plaintext';

        const mapping = {
            'python': 'python',
            'javascript': 'javascript',
            'typescript': 'typescript',
            'java': 'java',
            'cpp': 'cpp',
            'c++': 'cpp',
            'csharp': 'csharp',
            'c#': 'csharp',
            'go': 'go',
            'rust': 'rust',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'sql': 'sql'
        };

        return mapping[languageName.toLowerCase()] || 'plaintext';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoTag = (estado) => {
        const estados = {
            'reciente': { color: 'blue', text: 'Reciente' },
            'destacado': { color: 'gold', text: 'Destacado' },
            'oculto': { color: 'default', text: 'Oculto' },
            'normal': { color: 'green', text: 'Normal' }
        };

        const estadoInfo = estados[estado] || estados['normal'];
        return <Tag color={estadoInfo.color}>{estadoInfo.text}</Tag>;
    };

    if (loading) {
        return (
            <div className="comparison-detail-loading">
                <Spin size="large" tip="Cargando comparación..." />
            </div>
        );
    }

    if (!comparacion) {
        return (
            <div className="comparison-detail-error">
                <Title level={3}>No se encontró la comparación</Title>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                    type="primary"
                >
                    Volver
                </Button>
            </div>
        );
    }

    return (
        <div className="comparison-detail-container">
            {/* Header */}
            <div className="comparison-detail-header">
                <div className="comparison-detail-header-content">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        className="comparison-detail-back-button"
                        type="text"
                    >
                        Volver
                    </Button>

                    <div className="comparison-detail-title-section">
                        <div className="comparison-detail-title-display">
                            <span className="comparison-detail-title-text">
                                {comparacion.nombre_comparacion || 'Sin título'}
                            </span>
                        </div>
                        <div className="comparison-detail-meta">
                            <Space size="large" wrap>
                                <Text className="comparison-detail-meta-item">
                                    <CalendarOutlined /> {formatDate(comparacion.fecha_creacion)}
                                </Text>
                                {comparacion.usuario && (
                                    <Text className="comparison-detail-meta-item">
                                        <UserOutlined /> {comparacion.usuario.nombre || comparacion.usuario.email}
                                    </Text>
                                )}
                                {comparacion.lenguaje && (
                                    <Text className="comparison-detail-meta-item">
                                        <CodeOutlined /> {comparacion.lenguaje.nombre}
                                    </Text>
                                )}
                                {getEstadoTag(comparacion.estado)}
                            </Space>
                        </div>
                    </div>
                </div>

                {comparacion.modelo_ia && (
                    <div className="comparison-detail-model-badge">
                        <Text style={{ color: '#909090', fontSize: '14px' }}>
                            Modelo: <strong style={{ color: '#c0c0c0' }}>{comparacion.modelo_ia.nombre}</strong>
                        </Text>
                    </div>
                )}
            </div>

            {/* Code Editors Grid */}
            <div className="code-editors-grid">
                <div className="code-editor-wrapper">
                    <div className="code-editor-header">
                        <span className="code-editor-label">Código 1</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileOutlined style={{ color: '#5ebd8f' }} />
                            <span className="code-editor-hint" style={{ color: '#5ebd8f' }}>
                                Código Original
                            </span>
                        </div>
                    </div>
                    <div className="monaco-editor-container">
                        <Editor
                            height="400px"
                            language={getMonacoLanguage(comparacion.lenguaje?.nombre)}
                            value={comparacion.codigo_1 || '// Sin código'}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                roundedSelection: true,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                wordWrap: 'on',
                                readOnly: true
                            }}
                        />
                    </div>
                </div>

                <div className="code-editor-wrapper">
                    <div className="code-editor-header">
                        <span className="code-editor-label">Código 2</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileOutlined style={{ color: '#5ebd8f' }} />
                            <span className="code-editor-hint" style={{ color: '#5ebd8f' }}>
                                Código Comparado
                            </span>
                        </div>
                    </div>
                    <div className="monaco-editor-container">
                        <Editor
                            height="400px"
                            language={getMonacoLanguage(comparacion.lenguaje?.nombre)}
                            value={comparacion.codigo_2 || '// Sin código'}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                roundedSelection: true,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                wordWrap: 'on',
                                readOnly: true
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <Card className="comparison-info-card">
                <Title level={4} style={{ color: '#d0d0d0', marginBottom: '24px' }}>
                    Información de la Comparación
                </Title>
                <div className="comparison-info-grid">
                    <div className="comparison-info-item">
                        <Text className="comparison-info-label">ID de Comparación:</Text>
                        <Text className="comparison-info-value">{comparacion.id}</Text>
                    </div>
                    
                    {comparacion.usuario && (
                        <>
                            <div className="comparison-info-item">
                                <Text className="comparison-info-label">Usuario:</Text>
                                <Text className="comparison-info-value">
                                    {comparacion.usuario.nombre || 'N/A'}
                                </Text>
                            </div>
                            <div className="comparison-info-item">
                                <Text className="comparison-info-label">Email:</Text>
                                <Text className="comparison-info-value">
                                    {comparacion.usuario.email || 'N/A'}
                                </Text>
                            </div>
                        </>
                    )}

                    {comparacion.lenguaje && (
                        <div className="comparison-info-item">
                            <Text className="comparison-info-label">Lenguaje:</Text>
                            <Text className="comparison-info-value">
                                {comparacion.lenguaje.nombre}
                            </Text>
                        </div>
                    )}

                    {comparacion.modelo_ia && (
                        <div className="comparison-info-item">
                            <Text className="comparison-info-label">Modelo IA:</Text>
                            <Text className="comparison-info-value">
                                {comparacion.modelo_ia.nombre}
                            </Text>
                        </div>
                    )}

                    <div className="comparison-info-item">
                        <Text className="comparison-info-label">Fecha de Creación:</Text>
                        <Text className="comparison-info-value">
                            {formatDate(comparacion.fecha_creacion)}
                        </Text>
                    </div>

                    <div className="comparison-info-item">
                        <Text className="comparison-info-label">Estado:</Text>
                        {getEstadoTag(comparacion.estado)}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ComparisonDetailView;