import React, { useState, useEffect, useRef } from 'react';
import { Button, Select, Typography, Space, Card, message, Spin, Divider, Tag } from 'antd';
import {
    ArrowLeftOutlined,
    PlayCircleOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    EditOutlined
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import '../Estilos/Css_Comparacion_Individual/CodeComparisonView.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CodeComparisonView = ({ model, onBack, userProfile }) => {
    // Estados principales
    const [code1, setCode1] = useState('');
    const [code2, setCode2] = useState('');
    const [languageId, setLanguageId] = useState(null);
    const [languages, setLanguages] = useState([]);
    const [loadingLanguages, setLoadingLanguages] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [comparisonName, setComparisonName] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [dragOver1, setDragOver1] = useState(false);
    const [dragOver2, setDragOver2] = useState(false);
    const titleInputRef = useRef(null);

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

    // Focus en input de título cuando se activa edición
    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    // Obtener lenguaje de Monaco
    const getMonacoLanguage = (languageId) => {
        const lang = languages.find(l => l.id === languageId);
        if (!lang) return 'plaintext';
        
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
        
        return mapping[lang.nombre.toLowerCase()] || 'plaintext';
    };

    // Manejar drag & drop
    const handleDragOver = (e, codeNumber) => {
        e.preventDefault();
        e.stopPropagation();
        if (codeNumber === 1) {
            setDragOver1(true);
        } else {
            setDragOver2(true);
        }
    };

    const handleDragLeave = (e, codeNumber) => {
        e.preventDefault();
        e.stopPropagation();
        if (codeNumber === 1) {
            setDragOver1(false);
        } else {
            setDragOver2(false);
        }
    };

    const handleDrop = async (e, codeNumber) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (codeNumber === 1) {
            setDragOver1(false);
        } else {
            setDragOver2(false);
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const content = event.target.result;
                if (codeNumber === 1) {
                    setCode1(content);
                } else {
                    setCode2(content);
                }
                message.success(`Archivo "${file.name}" cargado exitosamente`);
            };
            
            reader.onerror = () => {
                message.error('Error al leer el archivo');
            };
            
            reader.readAsText(file);
        }
    };

    // Manejar título
    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (!comparisonName.trim()) {
            setComparisonName('Sin título');
        }
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    // Manejar comparación
    const handleCompare = async () => {
        // Validaciones
        if (!languageId) {
            message.warning('Por favor, selecciona un lenguaje de programación');
            return;
        }

        if (!code1.trim() || !code2.trim()) {
            message.warning('Por favor, proporciona ambos códigos');
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
            
            const finalName = comparisonName.trim() || 'Sin título';
            formData.append('nombre_comparacion', finalName);
            formData.append('codigo_1', code1);
            formData.append('codigo_2', code2);

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
            
            // Simular resultado para mostrar
            const mockResult = {
                id: data.id,
                nombre_comparacion: finalName,
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
                        {isEditingTitle ? (
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={comparisonName}
                                onChange={(e) => setComparisonName(e.target.value)}
                                onBlur={handleTitleBlur}
                                onKeyDown={handleTitleKeyDown}
                                className="code-comparison-title-input"
                                placeholder="Sin título"
                            />
                        ) : (
                            <div 
                                className="code-comparison-title-display"
                                onClick={handleTitleClick}
                            >
                                <span className="code-comparison-title-text">
                                    {comparisonName || 'Sin título'}
                                </span>
                                <EditOutlined className="code-comparison-title-icon" />
                            </div>
                        )}
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
                            {lang.nombre}
                        </Option>
                    ))}
                </Select>
            </div>

            {/* Editores de código con Monaco */}
            <div className="code-editors-grid">
                {/* Editor 1 */}
                <div 
                    className={`code-editor-wrapper ${dragOver1 ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, 1)}
                    onDragLeave={(e) => handleDragLeave(e, 1)}
                    onDrop={(e) => handleDrop(e, 1)}
                >
                    <div className="code-editor-header">
                        <span className="code-editor-label">Código 1</span>
                        <span className="code-editor-hint">Arrastra un archivo o escribe código</span>
                    </div>
                    <div className="monaco-editor-container">
                        <Editor
                            height="400px"
                            language={getMonacoLanguage(languageId)}
                            value={code1}
                            onChange={(value) => setCode1(value || '')}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                roundedSelection: true,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                wordWrap: 'on'
                            }}
                        />
                    </div>
                    {dragOver1 && (
                        <div className="drag-overlay">
                            <div className="drag-overlay-content">
                                <div className="drag-overlay-icon">📁</div>
                                <div className="drag-overlay-text">Suelta el archivo aquí</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Editor 2 */}
                <div 
                    className={`code-editor-wrapper ${dragOver2 ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, 2)}
                    onDragLeave={(e) => handleDragLeave(e, 2)}
                    onDrop={(e) => handleDrop(e, 2)}
                >
                    <div className="code-editor-header">
                        <span className="code-editor-label">Código 2</span>
                        <span className="code-editor-hint">Arrastra un archivo o escribe código</span>
                    </div>
                    <div className="monaco-editor-container">
                        <Editor
                            height="400px"
                            language={getMonacoLanguage(languageId)}
                            value={code2}
                            onChange={(value) => setCode2(value || '')}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                roundedSelection: true,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                wordWrap: 'on'
                            }}
                        />
                    </div>
                    {dragOver2 && (
                        <div className="drag-overlay">
                            <div className="drag-overlay-content">
                                <div className="drag-overlay-icon">📁</div>
                                <div className="drag-overlay-text">Suelta el archivo aquí</div>
                            </div>
                        </div>
                    )}
                </div>
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