import React, { useState, useEffect, useRef } from 'react';
import { Button, Select, Typography, Space, Card, notification, Spin, Divider, Tag } from 'antd';
import {
    ArrowLeftOutlined,
    PlayCircleOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    EditOutlined,
    CheckCircleFilled,
    InfoCircleFilled,
    FileOutlined
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { API_ENDPOINTS, getStoredToken, buildApiUrl } from '../../../config';
import '../Estilos/Css_Comparacion_Individual/CodeComparisonView.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CodeComparisonView = ({ model, onBack, userProfile, refreshComparaciones }) => {
    // Estados principales
    const [code1, setCode1] = useState('');
    const [code2, setCode2] = useState('');
    const [file1Name, setFile1Name] = useState('');
    const [file2Name, setFile2Name] = useState('');
    const [languageId, setLanguageId] = useState(null);
    const [languages, setLanguages] = useState([]);
    const [loadingLanguages, setLoadingLanguages] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [comparisonName, setComparisonName] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [dragOver1, setDragOver1] = useState(false);
    const [dragOver2, setDragOver2] = useState(false);
    const [dragOverContainer, setDragOverContainer] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const titleInputRef = useRef(null);
    const containerRef = useRef(null);

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
                const token = getStoredToken();
                const url = buildApiUrl(`${API_ENDPOINTS.LISTAR_LENGUAJES}/${userProfile.usuario_id}`);

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
            } catch (error) {
                console.error('Error:', error);
                notification.error({
                    message: 'Error al cargar lenguajes',
                    description: 'No se pudieron cargar los lenguajes de programación. Por favor, intenta nuevamente.',
                    placement: 'topRight',
                    duration: 4
                });
            } finally {
                setLoadingLanguages(false);
            }
        };

        fetchLanguages();
    }, [userProfile]);

    // Focus en input de título cuando se activa edición
    useEffect(() => {
        if (isEditingTitle && titleInputRef.current && !isLocked) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle, isLocked]);

    // Event listeners para drag & drop en el contenedor completo
    useEffect(() => {
        const container = containerRef.current;
        if (!container || isLocked) return;

        const handleContainerDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverContainer(true);
        };

        const handleContainerDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.target === container) {
                setDragOverContainer(false);
            }
        };

        const handleContainerDrop = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverContainer(false);

            const files = Array.from(e.dataTransfer.files);
            
            if (files.length === 2) {
                await loadFile(files[0], 1);
                await loadFile(files[1], 2);
            } else if (files.length === 1) {
                if (!code1) {
                    await loadFile(files[0], 1);
                } else if (!code2) {
                    await loadFile(files[0], 2);
                } else {
                    notification.warning({
                        message: 'Editores completos',
                        description: 'Ambos editores ya tienen código. Elimina uno primero.',
                        placement: 'topRight',
                        duration: 3
                    });
                }
            } else if (files.length > 2) {
                notification.warning({
                    message: 'Demasiados archivos',
                    description: 'Solo puedes cargar hasta 2 archivos. Se cargarán los primeros 2.',
                    placement: 'topRight',
                    duration: 3
                });
                await loadFile(files[0], 1);
                await loadFile(files[1], 2);
            }
        };

        container.addEventListener('dragover', handleContainerDragOver);
        container.addEventListener('dragleave', handleContainerDragLeave);
        container.addEventListener('drop', handleContainerDrop);

        return () => {
            container.removeEventListener('dragover', handleContainerDragOver);
            container.removeEventListener('dragleave', handleContainerDragLeave);
            container.removeEventListener('drop', handleContainerDrop);
        };
    }, [isLocked, code1, code2]);

    // Cargar archivo
    const loadFile = async (file, codeNumber) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const content = event.target.result;
            if (codeNumber === 1) {
                setCode1(content);
                setFile1Name(file.name);
            } else {
                setCode2(content);
                setFile2Name(file.name);
            }
            notification.success({
                message: 'Archivo cargado',
                description: `"${file.name}" cargado en el Código ${codeNumber}`,
                placement: 'topRight',
                duration: 3,
                icon: <CheckCircleFilled style={{ color: '#5ebd8f' }} />
            });
        };

        reader.onerror = () => {
            notification.error({
                message: 'Error al leer archivo',
                description: 'No se pudo leer el contenido del archivo. Por favor, intenta con otro archivo.',
                placement: 'topRight',
                duration: 4
            });
        };

        reader.readAsText(file);
    };

    // Manejar drag & drop individual
    const handleDragOver = (e, codeNumber) => {
        if (isLocked) return;
        e.preventDefault();
        e.stopPropagation();
        if (codeNumber === 1) {
            setDragOver1(true);
        } else {
            setDragOver2(true);
        }
    };

    const handleDragLeave = (e, codeNumber) => {
        if (isLocked) return;
        e.preventDefault();
        e.stopPropagation();
        if (codeNumber === 1) {
            setDragOver1(false);
        } else {
            setDragOver2(false);
        }
    };

    const handleDrop = async (e, codeNumber) => {
        if (isLocked) return;
        e.preventDefault();
        e.stopPropagation();

        if (codeNumber === 1) {
            setDragOver1(false);
        } else {
            setDragOver2(false);
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            await loadFile(files[0], codeNumber);
        }
    };

    // Eliminar archivo
    const handleRemoveFile = (codeNumber) => {
        if (isLocked) return;
        if (codeNumber === 1) {
            setCode1('');
            setFile1Name('');
        } else {
            setCode2('');
            setFile2Name('');
        }
    };

    // Manejar título
    const handleTitleClick = () => {
        if (!isLocked) {
            setIsEditingTitle(true);
        }
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
        if (!languageId) {
            notification.warning({
                message: 'Lenguaje no seleccionado',
                description: 'Por favor, selecciona un lenguaje de programación antes de continuar.',
                placement: 'topRight',
                duration: 3,
                icon: <InfoCircleFilled style={{ color: '#ffa726' }} />
            });
            return;
        }

        if (!code1.trim() || !code2.trim()) {
            notification.warning({
                message: 'Códigos incompletos',
                description: 'Por favor, carga ambos archivos de código para poder realizar la comparación.',
                placement: 'topRight',
                duration: 3,
                icon: <InfoCircleFilled style={{ color: '#ffa726' }} />
            });
            return;
        }

        if (!model?.id) {
            notification.error({
                message: 'Modelo no seleccionado',
                description: 'No se ha seleccionado un modelo de IA. Por favor, recarga la página.',
                placement: 'topRight',
                duration: 4
            });
            return;
        }

        setLoading(true);

        try {
            const token = getStoredToken();
            const formData = new FormData();

            formData.append('usuario_id', userProfile.usuario_id);
            formData.append('modelo_ia_id', model.id);
            formData.append('lenguaje_id', languageId);

            const finalName = comparisonName.trim() || 'Sin título';
            formData.append('nombre_comparacion', finalName);
            formData.append('codigo_1', code1);
            formData.append('codigo_2', code2);

            const url = buildApiUrl(API_ENDPOINTS.CREAR_COMPARACION_INDIVIDUAL);

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

            notification.success({
                message: '¡Comparación creada!',
                description: `La comparación "${finalName}" se ha creado y guardado exitosamente.`,
                placement: 'topRight',
                duration: 4,
                icon: <CheckCircleFilled style={{ color: '#5ebd8f' }} />
            });

            setIsLocked(true);

            if (refreshComparaciones) {
                refreshComparaciones();
            }

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
            notification.error({
                message: 'Error al crear comparación',
                description: error.message || 'Ocurrió un error al comparar los códigos. Por favor, intenta nuevamente.',
                placement: 'topRight',
                duration: 5
            });
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

    return (
        <div 
            ref={containerRef}
            className={`code-comparison-container ${dragOverContainer ? 'drag-over-container' : ''}`}
        >
            {dragOverContainer && !isLocked && (
                <div className="global-drag-overlay">
                    <div className="global-drag-content">
                        <FileOutlined style={{ fontSize: '80px', color: '#5ebd8f', marginBottom: '20px' }} />
                        <div style={{ fontSize: '24px', fontWeight: '600', color: '#c0c0c0', marginBottom: '8px' }}>
                            Suelta los archivos aquí
                        </div>
                        <div style={{ fontSize: '16px', color: '#909090' }}>
                            {!code1 && !code2 && 'Puedes soltar 2 archivos a la vez'}
                            {(code1 && !code2) && 'Se cargará en el Código 2'}
                            {(!code1 && code2) && 'Se cargará en el Código 1'}
                        </div>
                    </div>
                </div>
            )}

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
                        {isEditingTitle && !isLocked ? (
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
                                style={{ cursor: isLocked ? 'default' : 'pointer' }}
                            >
                                <span className="code-comparison-title-text">
                                    {comparisonName || 'Sin título'}
                                </span>
                                {!isLocked && <EditOutlined className="code-comparison-title-icon" />}
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
                    placeholder="Selecciona un lenguaje"
                    disabled={loadingLanguages || isLocked}
                >
                    {languages.map(lang => (
                        <Option key={lang.id} value={lang.id}>
                            {lang.nombre}
                        </Option>
                    ))}
                </Select>
            </div>

            <div className="code-editors-grid">
                <div
                    className={`code-editor-wrapper ${dragOver1 ? 'drag-over' : ''} ${isLocked ? 'locked' : ''}`}
                    onDragOver={(e) => handleDragOver(e, 1)}
                    onDragLeave={(e) => handleDragLeave(e, 1)}
                    onDrop={(e) => handleDrop(e, 1)}
                    style={{ opacity: isLocked ? 0.7 : 1 }}
                >
                    <div className="code-editor-header">
                        <span className="code-editor-label">Código 1</span>
                        {file1Name ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileOutlined style={{ color: '#5ebd8f' }} />
                                <span className="code-editor-hint" style={{ color: '#5ebd8f' }}>
                                    {file1Name}
                                </span>
                                {!isLocked && (
                                    <Button
                                        type="text"
                                        size="small"
                                        onClick={() => handleRemoveFile(1)}
                                        style={{ color: '#ff6b6b', padding: '0 4px' }}
                                    >
                                        ✕
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <span className="code-editor-hint">Arrastra un archivo o escribe código</span>
                        )}
                    </div>
                    <div className="monaco-editor-container">
                        <Editor
                            height="400px"
                            language={getMonacoLanguage(languageId)}
                            value={code1}
                            onChange={(value) => !isLocked && setCode1(value || '')}
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
                                readOnly: isLocked
                            }}
                        />
                    </div>
                    {dragOver1 && !isLocked && (
                        <div className="drag-overlay">
                            <div className="drag-overlay-content">
                                <div className="drag-overlay-icon">📁</div>
                                <div className="drag-overlay-text">Suelta el archivo aquí</div>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className={`code-editor-wrapper ${dragOver2 ? 'drag-over' : ''} ${isLocked ? 'locked' : ''}`}
                    onDragOver={(e) => handleDragOver(e, 2)}
                    onDragLeave={(e) => handleDragLeave(e, 2)}
                    onDrop={(e) => handleDrop(e, 2)}
                    style={{ opacity: isLocked ? 0.7 : 1 }}
                >
                    <div className="code-editor-header">
                        <span className="code-editor-label">Código 2</span>
                        {file2Name ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileOutlined style={{ color: '#5ebd8f' }} />
                                <span className="code-editor-hint" style={{ color: '#5ebd8f' }}>
                                    {file2Name}
                                </span>
                                {!isLocked && (
                                    <Button
                                        type="text"
                                        size="small"
                                        onClick={() => handleRemoveFile(2)}
                                        style={{ color: '#ff6b6b', padding: '0 4px' }}
                                    >
                                        ✕
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <span className="code-editor-hint">Arrastra un archivo o escribe código</span>
                        )}
                    </div>
                    <div className="monaco-editor-container">
                        <Editor
                            height="400px"
                            language={getMonacoLanguage(languageId)}
                            value={code2}
                            onChange={(value) => !isLocked && setCode2(value || '')}
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
                                readOnly: isLocked
                            }}
                        />
                    </div>
                    {dragOver2 && !isLocked && (
                        <div className="drag-overlay">
                            <div className="drag-overlay-content">
                                <div className="drag-overlay-icon">📁</div>
                                <div className="drag-overlay-text">Suelta el archivo aquí</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!isLocked && (
                <div className="compare-button-container">
                    <Button
                        type="primary"
                        size="large"
                        icon={loading ? <Spin /> : <PlayCircleOutlined />}
                        onClick={handleCompare}
                        loading={loading}
                        disabled={loadingLanguages || !languageId || !code1.trim() || !code2.trim()}
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
            )}

            {result && (
                <div className="results-container">
                    <Title level={3} className="results-title">
                        Resultados del Análisis
                    </Title>

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

                    <div className="efficiency-grid">
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