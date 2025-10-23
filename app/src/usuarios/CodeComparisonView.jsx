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
            // Aquí iría la llamada a tu API
            // Simulación de llamada API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Resultado simulado
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
        <div style={{ width: '100%', maxWidth: '1400px' }}>
            {/* Header */}
            <div style={{
                marginBottom: '32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Space size="middle">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        style={{
                            background: 'transparent',
                            border: '1px solid #3d3d3d',
                            color: '#e8e8e8',
                            height: '40px',
                            borderRadius: '8px'
                        }}
                    >
                        Volver
                    </Button>
                    <div>
                        <Title
                            level={3}
                            style={{
                                color: '#e8e8e8',
                                margin: 0,
                                fontFamily: "'Playfair Display', 'Georgia', serif"
                            }}
                        >
                            Comparación de Código
                        </Title>
                        <Text style={{ color: '#a0a0a0', fontSize: '14px' }}>
                            Usando {model.name} {model.icon}
                        </Text>
                    </div>
                </Space>

                <Select
                    value={language}
                    onChange={setLanguage}
                    style={{ width: 180 }}
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
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px'
            }}>
                {/* Editor 1 */}
                <Card
                    title={
                        <Space>
                            <CodeOutlined />
                            <span>Código 1</span>
                        </Space>
                    }
                    style={{
                        background: '#242424',
                        border: '1px solid #3d3d3d',
                        height: '500px'
                    }}
                    headStyle={{
                        background: '#2d2d2d',
                        borderBottom: '1px solid #3d3d3d',
                        color: '#e8e8e8',
                        fontFamily: "'Playfair Display', 'Georgia', serif"
                    }}
                    bodyStyle={{
                        padding: 0,
                        height: 'calc(100% - 57px)'
                    }}
                >
                    <textarea
                        value={code1}
                        onChange={(e) => setCode1(e.target.value)}
                        placeholder={`// Pega aquí tu código en ${LANGUAGES.find(l => l.value === language)?.label || 'el lenguaje seleccionado'}...\n\nfunction ejemplo() {\n    // Tu código aquí\n}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            background: '#1a1a1a',
                            border: 'none',
                            color: '#e8e8e8',
                            padding: '20px',
                            fontFamily: "'Fira Code', 'Courier New', monospace",
                            fontSize: '14px',
                            lineHeight: '1.6',
                            resize: 'none',
                            outline: 'none',
                            tabSize: 4
                        }}
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
                    style={{
                        background: '#242424',
                        border: '1px solid #3d3d3d',
                        height: '500px'
                    }}
                    headStyle={{
                        background: '#2d2d2d',
                        borderBottom: '1px solid #3d3d3d',
                        color: '#e8e8e8',
                        fontFamily: "'Playfair Display', 'Georgia', serif"
                    }}
                    bodyStyle={{
                        padding: 0,
                        height: 'calc(100% - 57px)'
                    }}
                >
                    <textarea
                        value={code2}
                        onChange={(e) => setCode2(e.target.value)}
                        placeholder={`// Pega aquí el segundo código para comparar...\n\nfunction ejemplo() {\n    // Tu código aquí\n}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            background: '#1a1a1a',
                            border: 'none',
                            color: '#e8e8e8',
                            padding: '20px',
                            fontFamily: "'Fira Code', 'Courier New', monospace",
                            fontSize: '14px',
                            lineHeight: '1.6',
                            resize: 'none',
                            outline: 'none',
                            tabSize: 4
                        }}
                    />
                </Card>
            </div>

            {/* Botón de comparar */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Button
                    type="primary"
                    size="large"
                    icon={loading ? <Spin /> : <PlayCircleOutlined />}
                    onClick={handleCompare}
                    loading={loading}
                    disabled={!code1.trim() || !code2.trim()}
                    style={{
                        height: '50px',
                        padding: '0 48px',
                        fontSize: '16px',
                        fontWeight: '600',
                        background: model.color,
                        border: 'none',
                        borderRadius: '10px',
                        fontFamily: "'Playfair Display', 'Georgia', serif"
                    }}
                >
                    {loading ? 'Analizando...' : 'Comparar Códigos'}
                </Button>
            </div>

            {/* Resultados */}
            {result && (
                <div style={{ marginTop: '32px' }}>
                    <Title
                        level={3}
                        style={{
                            color: '#e8e8e8',
                            marginBottom: '24px',
                            fontFamily: "'Playfair Display', 'Georgia', serif"
                        }}
                    >
                        Resultados del Análisis
                    </Title>

                    {/* Similitud */}
                    <Card
                        style={{
                            background: '#242424',
                            border: '1px solid #3d3d3d',
                            marginBottom: '24px'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '64px',
                                    fontWeight: 'bold',
                                    color: getSimilarityColor(result.similarity.similarity_score),
                                    marginBottom: '8px'
                                }}>
                                    {result.similarity.similarity_score}%
                                </div>
                                <Title level={4} style={{ color: '#e8e8e8', margin: 0 }}>
                                    Similitud Detectada
                                </Title>
                                <Tag
                                    color={getPlagiarismColor(result.similarity.plagiarism_likelihood)}
                                    style={{
                                        marginTop: '12px',
                                        padding: '4px 12px',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Probabilidad de plagio: {result.similarity.plagiarism_likelihood.toUpperCase()}
                                </Tag>
                            </div>

                            <Divider style={{ borderColor: '#3d3d3d' }} />

                            <div>
                                <Paragraph style={{ color: '#d0d0d0', fontSize: '15px', lineHeight: '1.6' }}>
                                    {result.similarity.explanation}
                                </Paragraph>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <Title level={5} style={{ color: '#66bb6a', marginBottom: '12px' }}>
                                        <CheckCircleOutlined /> Patrones Comunes
                                    </Title>
                                    <ul style={{ color: '#d0d0d0', paddingLeft: '20px' }}>
                                        {result.similarity.common_patterns.map((pattern, idx) => (
                                            <li key={idx} style={{ marginBottom: '8px' }}>{pattern}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <Title level={5} style={{ color: '#ffa726', marginBottom: '12px' }}>
                                        <WarningOutlined /> Diferencias
                                    </Title>
                                    <ul style={{ color: '#d0d0d0', paddingLeft: '20px' }}>
                                        {result.similarity.differences.map((diff, idx) => (
                                            <li key={idx} style={{ marginBottom: '8px' }}>{diff}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Space>
                    </Card>

                    {/* Comparación de Eficiencia */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '24px'
                    }}>
                        {/* Eficiencia Código 1 */}
                        <Card
                            title={
                                <Space>
                                    <ThunderboltOutlined />
                                    <span>Eficiencia - Código 1</span>
                                </Space>
                            }
                            style={{
                                background: '#242424',
                                border: '1px solid #3d3d3d'
                            }}
                            headStyle={{
                                background: '#2d2d2d',
                                borderBottom: '1px solid #3d3d3d',
                                color: '#e8e8e8',
                                fontFamily: "'Playfair Display', 'Georgia', serif"
                            }}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div>
                                    <Text strong style={{ color: '#a0a0a0' }}>Puntuación: </Text>
                                    <Tag color={result.efficiency_code1.efficiency_score >= 80 ? 'success' : 'warning'}>
                                        {result.efficiency_code1.efficiency_score}/100
                                    </Tag>
                                </div>

                                <div>
                                    <Text strong style={{ color: '#a0a0a0' }}>Complejidad Temporal: </Text>
                                    <Tag color="blue">{result.efficiency_code1.time_complexity}</Tag>
                                </div>

                                <div>
                                    <Text strong style={{ color: '#a0a0a0' }}>Complejidad Espacial: </Text>
                                    <Tag color="cyan">{result.efficiency_code1.space_complexity}</Tag>
                                </div>

                                <Divider style={{ margin: '12px 0', borderColor: '#3d3d3d' }} />

                                <div>
                                    <Text strong style={{ color: '#ffa726', display: 'block', marginBottom: '8px' }}>
                                        Cuellos de Botella:
                                    </Text>
                                    <ul style={{ color: '#d0d0d0', paddingLeft: '20px', margin: 0 }}>
                                        {result.efficiency_code1.bottlenecks.map((b, idx) => (
                                            <li key={idx} style={{ marginBottom: '4px' }}>{b}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <Text strong style={{ color: '#66bb6a', display: 'block', marginBottom: '8px' }}>
                                        Sugerencias:
                                    </Text>
                                    <ul style={{ color: '#d0d0d0', paddingLeft: '20px', margin: 0 }}>
                                        {result.efficiency_code1.optimization_suggestions.map((s, idx) => (
                                            <li key={idx} style={{ marginBottom: '4px' }}>{s}</li>
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
                            style={{
                                background: '#242424',
                                border: '1px solid #3d3d3d'
                            }}
                            headStyle={{
                                background: '#2d2d2d',
                                borderBottom: '1px solid #3d3d3d',
                                color: '#e8e8e8',
                                fontFamily: "'Playfair Display', 'Georgia', serif"
                            }}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div>
                                    <Text strong style={{ color: '#a0a0a0' }}>Puntuación: </Text>
                                    <Tag color={result.efficiency_code2.efficiency_score >= 80 ? 'success' : 'warning'}>
                                        {result.efficiency_code2.efficiency_score}/100
                                    </Tag>
                                </div>

                                <div>
                                    <Text strong style={{ color: '#a0a0a0' }}>Complejidad Temporal: </Text>
                                    <Tag color="blue">{result.efficiency_code2.time_complexity}</Tag>
                                </div>

                                <div>
                                    <Text strong style={{ color: '#a0a0a0' }}>Complejidad Espacial: </Text>
                                    <Tag color="cyan">{result.efficiency_code2.space_complexity}</Tag>
                                </div>

                                <Divider style={{ margin: '12px 0', borderColor: '#3d3d3d' }} />

                                <div>
                                    <Text strong style={{ color: '#ffa726', display: 'block', marginBottom: '8px' }}>
                                        Cuellos de Botella:
                                    </Text>
                                    <ul style={{ color: '#d0d0d0', paddingLeft: '20px', margin: 0 }}>
                                        {result.efficiency_code2.bottlenecks.map((b, idx) => (
                                            <li key={idx} style={{ marginBottom: '4px' }}>{b}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <Text strong style={{ color: '#66bb6a', display: 'block', marginBottom: '8px' }}>
                                        Sugerencias:
                                    </Text>
                                    <ul style={{ color: '#d0d0d0', paddingLeft: '20px', margin: 0 }}>
                                        {result.efficiency_code2.optimization_suggestions.map((s, idx) => (
                                            <li key={idx} style={{ marginBottom: '4px' }}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            </Space>
                        </Card>
                    </div>

                    {/* Footer de resultados */}
                    <div style={{
                        textAlign: 'center',
                        marginTop: '24px',
                        padding: '16px',
                        background: '#242424',
                        borderRadius: '8px',
                        border: '1px solid #3d3d3d'
                    }}>
                        <Text style={{ color: '#a0a0a0', fontStyle: 'italic' }}>
                            Análisis realizado con <strong style={{ color: model.color }}>{result.provider_used}</strong>
                        </Text>
                    </div>
                </div>
            )}

            {/* Estilos adicionales para el textarea */}
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap');
                
                textarea::placeholder {
                    color: #6b6b6b;
                    opacity: 1;
                }

                textarea::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                textarea::-webkit-scrollbar-track {
                    background: #1a1a1a;
                }

                textarea::-webkit-scrollbar-thumb {
                    background: #3d3d3d;
                    border-radius: 4px;
                }

                textarea::-webkit-scrollbar-thumb:hover {
                    background: #5ebd8f;
                }
            `}</style>
        </div>
    );
};

export default CodeComparisonView;