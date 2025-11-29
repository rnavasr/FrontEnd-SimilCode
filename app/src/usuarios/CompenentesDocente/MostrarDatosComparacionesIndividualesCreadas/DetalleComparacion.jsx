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
import { API_BASE_URL, API_ENDPOINTS, buildApiUrl, getStoredToken } from '../../../../config';
import '../../Estilos/Css_Comparacion_Individual/ComparisonDetailView.css';

const { Title, Text } = Typography;

const ComparisonDetailView = ({ comparacionId, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [comparacion, setComparacion] = useState(null);
    const [resultados, setResultados] = useState(null);

    useEffect(() => {
        if (comparacionId) {
            fetchComparacionData();
            fetchResultados();
        }
    }, [comparacionId]);

    const fetchComparacionData = async () => {
        try {
            setLoading(true);
            const token = getStoredToken();
            
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

    const fetchResultados = async () => {
        try {
            setLoadingResults(true);
            const token = getStoredToken();
            
            // Usar el endpoint correcto del config
            const url = buildApiUrl(`${API_ENDPOINTS.OBTENER_RESULTADO_COMPARACION_IA}${comparacionId}/`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cargar resultados');
            }

            const data = await response.json();
            
            // Tomar el primer resultado si existe
            if (data.resultados && data.resultados.length > 0) {
                setResultados(data.resultados[0]);
            }

        } catch (error) {
            console.error('Error al cargar resultados:', error);
            // No mostrar error si no hay resultados, es opcional
        } finally {
            setLoadingResults(false);
        }
    };

    const parseIAResponse = (text) => {
        if (!text) return [];
        
        const sections = [];

        const patterns = [
            {
                key: 'lexica',
                title: 'Similitud Léxica',
                color: '#3b82f6',
                regex: /SIMILITUD\s+LÉXICA:\s*(\d+)(?:\s+Justificación:)?\s*(.+?)(?=SIMILITUD\s+|$)/is
            },
            {
                key: 'estructural',
                title: 'Similitud Estructural',
                color: '#8b5cf6',
                regex: /SIMILITUD\s+ESTRUCTURAL:\s*(\d+)(?:\s+Justificación:)?\s*(.+?)(?=SIMILITUD\s+|$)/is
            },
            {
                key: 'estilo',
                title: 'Similitud de Estilo',
                color: '#ec4899',
                regex: /SIMILITUD\s+DE\s+ESTILO:\s*(\d+)(?:\s+Justificación:)?\s*(.+?)(?=SIMILITUD\s+|$)/is
            },
            {
                key: 'funcional',
                title: 'Similitud Funcional',
                color: '#f59e0b',
                regex: /SIMILITUD\s+FUNCIONAL:\s*(\d+)(?:\s+Justificación:)?\s*(.+?)(?=SIMILITUD\s+|$)/is
            },
            {
                key: 'general',
                title: 'Similitud General',
                color: '#10b981',
                regex: /SIMILITUD\s+GENERAL:\s*(\d+)(?:\s+Justificación:)?\s*(.+?)$/is
            }
        ];

        patterns.forEach(pattern => {
            const match = text.match(pattern.regex);
            if (match) {
                let justification = match[2]
                    .trim()
                    .replace(/\s+/g, ' ')
                    .replace(/[\n\r\t]/g, ' ')
                    .trim();

                if (justification.length > 500) {
                    const sentences = justification.split('.');
                    if (sentences.length > 1) {
                        justification = sentences.slice(0, 3).join('.').trim();
                        if (!justification.endsWith('.')) justification += '.';
                    }
                }

                sections.push({
                    key: pattern.key,
                    title: pattern.title,
                    color: pattern.color,
                    percentage: parseInt(match[1]),
                    justification: justification
                });
            }
        });

        return sections;
    };

    const getSimilarityColor = (score) => {
        if (score >= 80) return '#ff6b6b';
        if (score >= 60) return '#ffa726';
        if (score >= 40) return '#66bb6a';
        return '#5ebd8f';
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

    const parsedSections = resultados ? parseIAResponse(resultados.explicacion) : [];

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
            <div className="code-editors-grid" style={{ marginBottom: '0' }}>
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

            {/* Resultados del Análisis */}
            {loadingResults ? (
                <div className="results-container" style={{ padding: '32px', textAlign: 'center' }}>
                    <Spin size="large" tip="Cargando resultados..." />
                </div>
            ) : resultados ? (
                <div className="results-container" style={{ padding: '0 32px 32px 32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <Title level={3} className="results-title" style={{ margin: 0 }}>
                            Resultados del Análisis
                        </Title>
                    </div>

                    <Card className="results-card">
                        {/* Resumen principal */}
                        <div className="similarity-summary-header">
                            <div
                                className="similarity-summary-percentage"
                                style={{
                                    background: `linear-gradient(135deg, ${getSimilarityColor(resultados.porcentaje_similitud)} 0%, ${getSimilarityColor(resultados.porcentaje_similitud)}dd 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    fontSize: '64px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {resultados.porcentaje_similitud}%
                            </div>
                            <h3 className="similarity-summary-title">
                                Similitud detectada
                            </h3>
                        </div>

                        {/* Desglose de similitud */}
                        <div className="similarity-list">
                            {parsedSections.map((section) => {
                                const getPercentageClass = (percentage) => {
                                    if (percentage >= 80) return 'percentage-high';
                                    if (percentage >= 60) return 'percentage-medium';
                                    if (percentage >= 40) return 'percentage-low';
                                    return 'percentage-very-low';
                                };

                                return (
                                    <div key={section.key} className="similarity-list-item">
                                        <div className="similarity-list-header">
                                            <div className="similarity-list-title">
                                                <h4 className="similarity-list-title-text">
                                                    {section.title}
                                                </h4>
                                            </div>
                                            <div
                                                className={`similarity-list-percentage ${getPercentageClass(section.percentage)}`}
                                                style={{ color: section.color }}
                                            >
                                                {section.percentage}%
                                            </div>
                                        </div>

                                        <div className="similarity-list-progress">
                                            <div
                                                className="similarity-list-progress-fill"
                                                style={{
                                                    width: `${section.percentage}%`,
                                                    background: section.color
                                                }}
                                            />
                                        </div>

                                        <div className="similarity-list-body">
                                            <p className="similarity-list-justification">
                                                {section.justification}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="results-container" style={{ padding: '32px', textAlign: 'center' }}>
                    <Text style={{ color: '#808080' }}>
                        No hay resultados de análisis disponibles para esta comparación.
                    </Text>
                </div>
            )}
        </div>
    );
};

export default ComparisonDetailView;