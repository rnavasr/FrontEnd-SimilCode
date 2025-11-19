import React, { useState, useEffect } from 'react';
import { Button, Select, Typography, Space, Card, message, Spin, Divider, Tag, Upload, Radio, Input } from 'antd';
import {
    ArrowLeftOutlined,
    PlayCircleOutlined,
    CodeOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    UploadOutlined,
    FileTextOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CodeComparisonView = ({ model, onBack, userProfile }) => {
    // Estados principales
    const [code1, setCode1] = useState('');
    const [code2, setCode2] = useState('');
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [inputMode1, setInputMode1] = useState('text');
    const [inputMode2, setInputMode2] = useState('text');
    const [languageId, setLanguageId] = useState(null);
    const [languages, setLanguages] = useState([]);
    const [loadingLanguages, setLoadingLanguages] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [comparisonName, setComparisonName] = useState('');

    // Cargar lenguajes disponibles
    useEffect(() => {
        const fetchLanguages = async () => {
            if (!userProfile?.usuario_id) {
                console.log('No hay usuario_id disponible');
                setLoadingLanguages(false);
                return;
            }
            
            try {
                setLoadingLanguages(true);
                const token = localStorage.getItem('token');
                const API_BASE_URL = 'http://localhost:8000';
                const url = `${API_BASE_URL}/app/usuarios/listar_lenguajes/${userProfile.usuario_id}`;
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al cargar lenguajes');
                }

                const data = await response.json();
                setLanguages(data.lenguajes || []);
                
                if (data.lenguajes && data.lenguajes.length > 0) {
                    setLanguageId(data.lenguajes[0].id);
                }
            } catch (error) {
                console.error('Error:', error);
                message.error('No se pudieron cargar los lenguajes');
            } finally {
                setLoadingLanguages(false);
            }
        };

        fetchLanguages();
    }, [userProfile]);

    // Obtener icono del lenguaje
    const getLanguageIcon = (name) => {
        const icons = {
            'python': '🐍',
            'javascript': '📜',
            'java': '☕',
            'cpp': '⚡',
            'c++': '⚡',
            'csharp': '🎯',
            'c#': '🎯',
            'go': '🔷',
            'rust': '🦀',
            'typescript': '💙'
        };
        return icons[name.toLowerCase()] || '📝';
    };

    // Manejar carga de archivo
    const handleFileUpload = (file, codeNumber) => {
        if (codeNumber === 1) {
            setFile1(file);
            setCode1('');
        } else {
            setFile2(file);
            setCode2('');
        }
        return false;
    };

    // Manejar comparación
    const handleCompare = async () => {
        // Validaciones
        if (!languageId) {
            message.warning('Por favor, selecciona un lenguaje de programación');
            return;
        }

        const hasCode1 = (inputMode1 === 'text' && code1.trim()) || (inputMode1 === 'file' && file1);
        const hasCode2 = (inputMode2 === 'text' && code2.trim()) || (inputMode2 === 'file' && file2);

        if (!hasCode1 || !hasCode2) {
            message.warning('Por favor, proporciona ambos códigos (texto o archivo)');
            return;
        }

        if (!model?.id) {
            message.error('No se ha seleccionado un modelo de IA');
            return;
        }

        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            const API_BASE_URL = 'http://localhost:8000';
            
            formData.append('usuario_id', userProfile.usuario_id);
            formData.append('modelo_ia_id', model.id);
            formData.append('lenguaje_id', languageId);
            
            if (comparisonName.trim()) {
                formData.append('nombre_comparacion', comparisonName.trim());
            }
            
            if (inputMode1 === 'text') {
                formData.append('codigo_1', code1);
            } else if (file1) {
                formData.append('archivo_1', file1);
            }
            
            if (inputMode2 === 'text') {
                formData.append('codigo_2', code2);
            } else if (file2) {
                formData.append('archivo_2', file2);
            }

            const url = `${API_BASE_URL}/app/usuarios/crear_comparaciones_individuales/`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear la comparación');
            }

            message.success('¡Comparación creada exitosamente!');
            
            // Simular resultado para mostrar (reemplazar con data real del backend)
            const mockResult = {
                id: data.id,
                nombre_comparacion: data.nombre_comparacion,
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
            
        } catch (error) {
            console.error('Error:', error);
            message.error(error.message || 'Error al comparar códigos. Por favor, intenta nuevamente.');
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
                    value={languageId}
                    onChange={setLanguageId}
                    className="code-comparison-language-select"
                    size="large"
                    loading={loadingLanguages}
                    placeholder="Selecciona lenguaje"
                    disabled={loadingLanguages}
                >
                    {languages.map(lang => (
                        <Option key={lang.id} value={lang.id}>
                            <span style={{ marginRight: '8px' }}>{getLanguageIcon(lang.nombre)}</span>
                            {lang.nombre}
                        </Option>
                    ))}
                </Select>
            </div>

            {/* Campo de nombre de comparación */}
            <div style={{ marginBottom: '24px' }}>
                <Card className="code-editor-card" style={{ borderRadius: '12px' }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                            Nombre de la comparación (opcional)
                        </Text>
                        <Input
                            value={comparisonName}
                            onChange={(e) => setComparisonName(e.target.value)}
                            placeholder="Ej: Comparación algoritmos de búsqueda"
                            size="large"
                            style={{ borderRadius: '8px' }}
                        />
                    </Space>
                </Card>
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
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Radio.Group 
                            value={inputMode1} 
                            onChange={(e) => {
                                setInputMode1(e.target.value);
                                if (e.target.value === 'text') {
                                    setFile1(null);
                                } else {
                                    setCode1('');
                                }
                            }}
                            buttonStyle="solid"
                            style={{ width: '100%' }}
                        >
                            <Radio.Button value="text" style={{ width: '50%', textAlign: 'center' }}>
                                <FileTextOutlined /> Pegar Texto
                            </Radio.Button>
                            <Radio.Button value="file" style={{ width: '50%', textAlign: 'center' }}>
                                <UploadOutlined /> Subir Archivo
                            </Radio.Button>
                        </Radio.Group>

                        {inputMode1 === 'text' ? (
                            <textarea
                                value={code1}
                                onChange={(e) => setCode1(e.target.value)}
                                placeholder={`// Pega aquí tu código en ${languages.find(l => l.id === languageId)?.nombre || 'el lenguaje seleccionado'}...\n\nfunction ejemplo() {\n    // Tu código aquí\n}`}
                                className="code-editor-textarea"
                            />
                        ) : (
                            <Upload
                                beforeUpload={(file) => handleFileUpload(file, 1)}
                                onRemove={() => setFile1(null)}
                                maxCount={1}
                                fileList={file1 ? [{ uid: '1', name: file1.name, status: 'done' }] : []}
                            >
                                <Button 
                                    icon={<UploadOutlined />} 
                                    style={{ width: '100%', height: '45px', borderRadius: '8px' }}
                                    size="large"
                                >
                                    {file1 ? `📄 ${file1.name}` : 'Seleccionar archivo de código'}
                                </Button>
                            </Upload>
                        )}
                    </Space>
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
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Radio.Group 
                            value={inputMode2} 
                            onChange={(e) => {
                                setInputMode2(e.target.value);
                                if (e.target.value === 'text') {
                                    setFile2(null);
                                } else {
                                    setCode2('');
                                }
                            }}
                            buttonStyle="solid"
                            style={{ width: '100%' }}
                        >
                            <Radio.Button value="text" style={{ width: '50%', textAlign: 'center' }}>
                                <FileTextOutlined /> Pegar Texto
                            </Radio.Button>
                            <Radio.Button value="file" style={{ width: '50%', textAlign: 'center' }}>
                                <UploadOutlined /> Subir Archivo
                            </Radio.Button>
                        </Radio.Group>

                        {inputMode2 === 'text' ? (
                            <textarea
                                value={code2}
                                onChange={(e) => setCode2(e.target.value)}
                                placeholder={`// Pega aquí el segundo código para comparar...\n\nfunction ejemplo() {\n    // Tu código aquí\n}`}
                                className="code-editor-textarea"
                            />
                        ) : (
                            <Upload
                                beforeUpload={(file) => handleFileUpload(file, 2)}
                                onRemove={() => setFile2(null)}
                                maxCount={1}
                                fileList={file2 ? [{ uid: '2', name: file2.name, status: 'done' }] : []}
                            >
                                <Button 
                                    icon={<UploadOutlined />} 
                                    style={{ width: '100%', height: '45px', borderRadius: '8px' }}
                                    size="large"
                                >
                                    {file2 ? `📄 ${file2.name}` : 'Seleccionar archivo de código'}
                                </Button>
                            </Upload>
                        )}
                    </Space>
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
                    disabled={loadingLanguages || !languageId}
                    className="compare-button"
                    style={{ 
                        background: model.color,
                        borderColor: model.color,
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderRadius: '10px'
                    }}
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

                    {result.nombre_comparacion && (
                        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
                            <Text strong style={{ fontSize: '15px' }}>
                                📋 {result.nombre_comparacion}
                            </Text>
                        </Card>
                    )}

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
                                    style={{ fontSize: '13px', padding: '4px 12px' }}
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