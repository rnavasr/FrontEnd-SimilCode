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
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                    className="comparison-detail-back-button"
                    type="text"
                >
                    Volver
                </Button>

                <div className="comparison-detail-title-section">
                    <div className="comparison-detail-title-text">
                        {comparacion.nombre_comparacion || 'Sin título'}
                    </div>
                    <div className="comparison-detail-meta">
                        <Text className="comparison-detail-meta-item">
                            Usando {comparacion.modelo_ia?.nombre || 'N/A'}
                        </Text>
                    </div>
                </div>

                {comparacion.lenguaje && (
                    <div className="comparison-detail-language-badge">
                        <Text style={{ color: '#b0b0b0', fontSize: '15px', fontWeight: '500' }}>
                            {comparacion.lenguaje.nombre}
                        </Text>
                    </div>
                )}
            </div>

            {/* Code Editors Grid */}
            <div className="code-editors-grid">
                <div className="code-editor-wrapper">
                    <div className="code-editor-header">
                        <span className="code-editor-label">Código 1</span>
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


        </div>
    );
};

export default ComparisonDetailView;