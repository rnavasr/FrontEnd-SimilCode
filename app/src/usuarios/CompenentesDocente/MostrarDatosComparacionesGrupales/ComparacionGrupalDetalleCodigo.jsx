import React, { useState, useEffect } from 'react';
import { Button, Typography, notification, Spin } from 'antd';
import { ArrowLeftOutlined, FileOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { API_ENDPOINTS, getStoredToken, buildApiUrlWithId } from '../../../../config';
import '../../Estilos/Css_Comparacion_Individual/CodeComparisonView.css';

const { Text } = Typography;

const CodeComparisonGroupDetail = ({ comparacionId, onBack, model }) => {
    const [comparacionData, setComparacionData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComparacionData = async () => {
            try {
                setLoading(true);
                const token = getStoredToken();
                const url = buildApiUrlWithId(API_ENDPOINTS.OBTENER_COMPARACION_GRUPAL, comparacionId);

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al cargar la comparación grupal');
                }

                const data = await response.json();
                setComparacionData(data);
            } catch (error) {
                console.error('Error:', error);
                notification.error({
                    message: 'Error al cargar datos',
                    description: 'No se pudieron cargar los datos de la comparación grupal.',
                    placement: 'topRight',
                    duration: 4
                });
            } finally {
                setLoading(false);
            }
        };

        if (comparacionId) {
            fetchComparacionData();
        }
    }, [comparacionId]);

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

    if (loading) {
        return (
            <div className="code-comparison-container">
                <div className="loading-message">
                    <Spin size="large" />
                    <div className="loading-message-text">Cargando comparación grupal...</div>
                </div>
            </div>
        );
    }

    if (!comparacionData) {
        return (
            <div className="code-comparison-container">
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p>No se encontraron datos de la comparación</p>
                    <Button onClick={onBack}>Volver</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="code-comparison-container">
            <div className="code-comparison-header">
                <div className="code-comparison-header-content">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        className="code-comparison-back-button"
                        type="text"
                    >
                        Volver
                    </Button>

                    <div className="code-comparison-title-section">
                        <div className="code-comparison-title-display">
                            <span className="code-comparison-title-text">
                                {comparacionData.nombre_comparacion || 'Sin título'}
                            </span>
                        </div>
                        <Text className="code-comparison-subtitle">
                            Comparación Grupal · {comparacionData.total_codigos} códigos · 
                            {comparacionData.modelo_ia && ` Usando ${comparacionData.modelo_ia.nombre}`}
                            {model?.icon && ` ${model.icon}`}
                        </Text>
                    </div>
                </div>

                <div className="code-comparison-language-select" style={{ 
                    padding: '8px 16px',
                    background: '#2a2a2a',
                    borderRadius: '8px',
                    color: '#c0c0c0',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    {comparacionData.lenguaje?.nombre || 'Sin lenguaje'}
                </div>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
                gap: '20px',
                padding: '20px'
            }}>
                {comparacionData.codigos.map((codigo, index) => (
                    <div
                        key={codigo.id}
                        className="code-editor-wrapper locked"
                        style={{ opacity: 1 }}
                    >
                        <div className="code-editor-header">
                            <span className="code-editor-label">Código {codigo.orden}</span>
                            {codigo.nombre_archivo && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileOutlined style={{ color: '#5ebd8f' }} />
                                    <span className="code-editor-hint" style={{ color: '#5ebd8f' }}>
                                        {codigo.nombre_archivo}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="monaco-editor-container">
                            <Editor
                                height="400px"
                                language={getMonacoLanguage(comparacionData.lenguaje?.nombre)}
                                value={codigo.codigo}
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
                ))}
            </div>
        </div>
    );
};

export default CodeComparisonGroupDetail;