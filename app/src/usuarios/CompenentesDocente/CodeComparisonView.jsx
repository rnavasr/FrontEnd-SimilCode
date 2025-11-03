import React, { useState } from 'react';
import { Button, Select, Typography, Space, Card, message, Spin, Divider, Tag } from 'antd';
import {
    ArrowLeftOutlined,
    PlayCircleOutlined,
    CodeOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined,
    WarningOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const LANGUAGES = [
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'javascript', label: 'JavaScript', icon: '📜' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'csharp', label: 'C#', icon: '🎯' },
    { value: 'go', label: 'Go', icon: '🔷' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'typescript', label: 'TypeScript', icon: '💙' }
];

const CodeComparisonView = ({ model, onBack, userProfile }) => {
    const [code1, setCode1] = useState('');
    const [code2, setCode2] = useState('');
    const [language, setLanguage] = useState('python');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleCompare = async () => {
        if (!code1.trim() || !code2.trim()) {
            message.warning('Por favor, ingresa ambos códigos para comparar');
            return;
        }

        setLoading(true);
        
        try {
            // Simulación de llamada API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const mockResult = {
                similarity: {
                    similarity_score: Math.floor(Math.random() * 40) + 60,
                    explanation: 'Los códigos muestran una estructura similar con algunas variaciones en la implementación.',
                    common_patterns: [
                        'Uso de bucles for para iteración',
                        'Manejo similar de variables',
                        'Estructura de funciones comparable'
                    ],
                    differences: [
                        'Diferentes nombres de variables',
                        'Orden de operaciones distinto',
                        'Comentarios adicionales en el código 2'
                    ],
                    plagiarism_likelihood: 'medio'
                },
                efficiency_code1: {
                    time_complexity: 'O(n²)',
                    space_complexity: 'O(n)',
                    efficiency_score: 75,
                    bottlenecks: ['Bucle anidado innecesario', 'Asignación de memoria repetida'],
                    optimization_suggestions: [
                        'Considerar usar un algoritmo de búsqueda más eficiente',
                        'Reutilizar estructuras de datos existentes'
                    ]
                },
                efficiency_code2: {
                    time_complexity: 'O(n)',
                    space_complexity: 'O(1)',
                    efficiency_score: 88,
                    bottlenecks: ['Posible optimización en validaciones'],
                    optimization_suggestions: [
                        'Agregar más manejo de casos edge',
                        'Considerar caché para resultados frecuentes'
                    ]
                },
                provider_used: model.name
            };

            setResult(mockResult);
            message.success('¡Comparación completada!');
            
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al comparar códigos. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const getSimilarityColor = (score) => {
        if (score >= 80) return '#ff6b6b';
        if (score >= 60) return '#ffa726';
        if (score >= 40) return '#66bb6a';
        return '#5ebd8f';
    };

    const getPlagiarismColor = (likelihood) => {
        const colors = {
            'alto': '#ff6b6b',
            'medio': '#ffa726',
            'bajo': '#66bb6a'
        };
        return colors[likelihood] || '#a0a0a0';
    };

    return (
        <div className="code-comparison-container">
            {/* Header */}
            <div className="code-comparison-header">
                <div className="code-comparison-header-left">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        className="code-comparison-back-button"
                    >
                        Volver
                    </Button>
                    <div>
                        <Title level={3} className="code-comparison-title">
                            Comparación de Código
                        </Title>
                        <Text className="code-comparison-subtitle">
                            Usando {model.name} {model.icon}
                        </Text>
                    </div>
                </div>

                <Select
                    value={language}
                    onChange={setLanguage}
                    className="code-comparison-language-select"
                    size="large"
                >
                    {LANGUAGES.map(lang => (
                        <Option key={lang.value} value={lang.value}>
                            <span style={{ marginRight: '8px' }}>{lang.icon}</span>
                            {lang.label}
                        </Option>
                    ))}
                </Select>
            </div>

            {/* Editores de código */}
            <div className="code-editors-grid">
                {/* Editor 1 */}
                <Card
                    title={
                        <Space>
                            <CodeOutlined />
                            <span>Código 1</span>
                        </Space>
                    }
                    className="code-editor-card"
                >
                    <textarea
                        value={code1}
                        onChange={(e) => setCode1(e.target.value)}
                        placeholder={`// Pega aquí tu código en ${LANGUAGES.find(l => l.value === language)?.label || 'el lenguaje seleccionado'}...\n\nfunction ejemplo() {\n    // Tu código aquí\n}`}
                        className="code-editor-textarea"
                    />
                </Card>

                {/* Editor 2 */}
                <Card
                    title={
                        <Space>
                            <CodeOutlined />
                            <span>Código 2</span>
                        </Space>
                    }
                    className="code-editor-card"
                >
                    <textarea
                        value={code2}
                        onChange={(e) => setCode2(e.target.value)}
                        placeholder={`// Pega aquí el segundo código para comparar...\n\nfunction ejemplo() {\n    // Tu código aquí\n}`}
                        className="code-editor-textarea"
                    />
                </Card>
            </div>

            {/* Botón de comparar */}
            <div className="compare-button-container">
                <Button
                    type="primary"
                    size="large"
                    icon={loading ? <Spin /> : <PlayCircleOutlined />}
                    onClick={handleCompare}
                    loading={loading}
                    disabled={!code1.trim() || !code2.trim()}
                    className="compare-button"
                    style={{ background: model.color }}
                >
                    {loading ? 'Analizando...' : 'Comparar Códigos'}
                </Button>
            </div>

            {/* Resultados */}
            {result && (
                <div className="results-container">
                    <Title level={3} className="results-title">
                        Resultados del Análisis
                    </Title>

                    {/* Similitud */}
                    <Card className="results-card">
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <div className="similarity-score">
                                <div 
                                    className="similarity-percentage"
                                    style={{ color: getSimilarityColor(result.similarity.similarity_score) }}
                                >
                                    {result.similarity.similarity_score}%
                                </div>
                                <Title level={4} className="similarity-title">
                                    Similitud Detectada
                                </Title>
                                <Tag
                                    color={getPlagiarismColor(result.similarity.plagiarism_likelihood)}
                                    className="plagiarism-tag"
                                >
                                    Probabilidad de plagio: {result.similarity.plagiarism_likelihood.toUpperCase()}
                                </Tag>
                            </div>

                            <Divider className="similarity-divider" />

                            <div>
                                <Paragraph className="similarity-explanation">
                                    {result.similarity.explanation}
                                </Paragraph>
                            </div>

                            <div className="patterns-grid">
                                <div>
                                    <Title level={5} className="patterns-section-title common">
                                        <CheckCircleOutlined /> Patrones Comunes
                                    </Title>
                                    <ul className="patterns-list">
                                        {result.similarity.common_patterns.map((pattern, idx) => (
                                            <li key={idx}>{pattern}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <Title level={5} className="patterns-section-title differences">
                                        <WarningOutlined /> Diferencias
                                    </Title>
                                    <ul className="patterns-list">
                                        {result.similarity.differences.map((diff, idx) => (
                                            <li key={idx}>{diff}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Space>
                    </Card>

                    {/* Comparación de Eficiencia */}
                    <div className="efficiency-grid">
                        {/* Eficiencia Código 1 */}
                        <Card
                            title={
                                <Space>
                                    <ThunderboltOutlined />
                                    <span>Eficiencia - Código 1</span>
                                </Space>
                            }
                            className="efficiency-card"
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div className="efficiency-metric">
                                    <Text className="efficiency-metric-label">Puntuación: </Text>
                                    <Tag color={result.efficiency_code1.efficiency_score >= 80 ? 'success' : 'warning'}>
                                        {result.efficiency_code1.efficiency_score}/100
                                    </Tag>
                                </div>

                                <div className="efficiency-metric">
                                    <Text className="efficiency-metric-label">Complejidad Temporal: </Text>
                                    <Tag color="blue">{result.efficiency_code1.time_complexity}</Tag>
                                </div>

                                <div className="efficiency-metric">
                                    <Text className="efficiency-metric-label">Complejidad Espacial: </Text>
                                    <Tag color="cyan">{result.efficiency_code1.space_complexity}</Tag>
                                </div>

                                <Divider className="efficiency-divider" />

                                <div>
                                    <Text className="efficiency-section-title bottlenecks">
                                        Cuellos de Botella:
                                    </Text>
                                    <ul className="efficiency-list">
                                        {result.efficiency_code1.bottlenecks.map((b, idx) => (
                                            <li key={idx}>{b}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <Text className="efficiency-section-title suggestions">
                                        Sugerencias:
                                    </Text>
                                    <ul className="efficiency-list">
                                        {result.efficiency_code1.optimization_suggestions.map((s, idx) => (
                                            <li key={idx}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            </Space>
                        </Card>

                        {/* Eficiencia Código 2 */}
                        <Card
                            title={
                                <Space>
                                    <ThunderboltOutlined />
                                    <span>Eficiencia - Código 2</span>
                                </Space>
                            }
                            className="efficiency-card"
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div className="efficiency-metric">
                                    <Text className="efficiency-metric-label">Puntuación: </Text>
                                    <Tag color={result.efficiency_code2.efficiency_score >= 80 ? 'success' : 'warning'}>
                                        {result.efficiency_code2.efficiency_score}/100
                                    </Tag>
                                </div>

                                <div className="efficiency-metric">
                                    <Text className="efficiency-metric-label">Complejidad Temporal: </Text>
                                    <Tag color="blue">{result.efficiency_code2.time_complexity}</Tag>
                                </div>

                                <div className="efficiency-metric">
                                    <Text className="efficiency-metric-label">Complejidad Espacial: </Text>
                                    <Tag color="cyan">{result.efficiency_code2.space_complexity}</Tag>
                                </div>

                                <Divider className="efficiency-divider" />

                                <div>
                                    <Text className="efficiency-section-title bottlenecks">
                                        Cuellos de Botella:
                                    </Text>
                                    <ul className="efficiency-list">
                                        {result.efficiency_code2.bottlenecks.map((b, idx) => (
                                            <li key={idx}>{b}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <Text className="efficiency-section-title suggestions">
                                        Sugerencias:
                                    </Text>
                                    <ul className="efficiency-list">
                                        {result.efficiency_code2.optimization_suggestions.map((s, idx) => (
                                            <li key={idx}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            </Space>
                        </Card>
                    </div>

                    {/* Footer de resultados */}
                    <div className="results-footer">
                        <Text className="results-footer-text">
                            Análisis realizado con{' '}
                            <strong 
                                className="results-provider-name"
                                style={{ color: model.color }}
                            >
                                {result.provider_used}
                            </strong>
                        </Text>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeComparisonView;