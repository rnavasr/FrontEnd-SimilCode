import React, { useState, useEffect, useRef } from 'react';
import { Button, Select, Typography, notification, Spin } from 'antd';
import {
    ArrowLeftOutlined,
    PlayCircleOutlined,
    EditOutlined,
    CheckCircleFilled,
    InfoCircleFilled,
    FileOutlined,
    PlusOutlined,
    CloseOutlined
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { API_ENDPOINTS, getStoredToken, buildApiUrl } from '../../../../config';
import '../../Estilos/Css_Comparacion_Individual/CodeComparisonView.css';

const { Text } = Typography;
const { Option } = Select;

const CodeComparisonGroupInput = ({ model, onBack, userProfile, refreshComparaciones, onAnalysisComplete }) => {
    // Estados principales
    const [codes, setCodes] = useState([
        { id: 1, content: '', fileName: '' },
        { id: 2, content: '', fileName: '' },
        { id: 3, content: '', fileName: '' }
    ]);
    const [languageId, setLanguageId] = useState(null);
    const [languages, setLanguages] = useState([]);
    const [loadingLanguages, setLoadingLanguages] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [comparisonName, setComparisonName] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState(null);
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
                    description: 'No se pudieron cargar los lenguajes de programación.',
                    placement: 'topRight',
                    duration: 4
                });
            } finally {
                setLoadingLanguages(false);
            }
        };

        fetchLanguages();
    }, [userProfile]);

    // Focus en input de título
    useEffect(() => {
        if (isEditingTitle && titleInputRef.current && !isLocked) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle, isLocked]);

    // Drag & drop en contenedor completo
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

            if (files.length > 0) {
                // Encontrar espacios vacíos o agregar nuevos editores
                let fileIndex = 0;
                const newCodes = [...codes];

                for (let i = 0; i < newCodes.length && fileIndex < files.length; i++) {
                    if (!newCodes[i].content.trim()) {
                        await loadFileToIndex(files[fileIndex], i);
                        fileIndex++;
                    }
                }

                // Si aún quedan archivos, agregar nuevos editores
                while (fileIndex < files.length) {
                    const newId = Math.max(...codes.map(c => c.id)) + 1;
                    const newCode = { id: newId, content: '', fileName: '' };
                    setCodes(prev => [...prev, newCode]);
                    
                    // Pequeño delay para que el estado se actualice
                    await new Promise(resolve => setTimeout(resolve, 100));
                    await loadFileToIndex(files[fileIndex], codes.length + (fileIndex - codes.filter(c => !c.content.trim()).length));
                    fileIndex++;
                }

                notification.success({
                    message: 'Archivos cargados',
                    description: `Se cargaron ${files.length} archivo(s) exitosamente`,
                    placement: 'topRight',
                    duration: 3,
                    icon: <CheckCircleFilled style={{ color: '#5ebd8f' }} />
                });
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
    }, [isLocked, codes]);

    // Cargar archivo en índice específico
    const loadFileToIndex = async (file, index) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const content = event.target.result;
                setCodes(prev => {
                    const newCodes = [...prev];
                    if (newCodes[index]) {
                        newCodes[index].content = content;
                        newCodes[index].fileName = file.name;
                    }
                    return newCodes;
                });
                resolve();
            };

            reader.onerror = () => {
                notification.error({
                    message: 'Error al leer archivo',
                    description: `No se pudo leer "${file.name}"`,
                    placement: 'topRight',
                    duration: 4
                });
                reject();
            };

            reader.readAsText(file);
        });
    };

    // Manejar drag & drop individual
    const handleDragOver = (e, index) => {
        if (isLocked) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOverIndex(index);
    };

    const handleDragLeave = (e, index) => {
        if (isLocked) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOverIndex(null);
    };

    const handleDrop = async (e, index) => {
        if (isLocked) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOverIndex(null);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            await loadFileToIndex(files[0], index);
            notification.success({
                message: 'Archivo cargado',
                description: `"${files[0].name}" cargado en Código ${index + 1}`,
                placement: 'topRight',
                duration: 3,
                icon: <CheckCircleFilled style={{ color: '#5ebd8f' }} />
            });
        }
    };

    // Agregar nuevo editor
    const handleAddEditor = () => {
        if (isLocked) return;
        const newId = Math.max(...codes.map(c => c.id)) + 1;
        setCodes([...codes, { id: newId, content: '', fileName: '' }]);
    };

    // Eliminar editor
    const handleRemoveEditor = (index) => {
        if (isLocked || codes.length <= 3) return;
        setCodes(codes.filter((_, i) => i !== index));
    };

    // Eliminar archivo
    const handleRemoveFile = (index) => {
        if (isLocked) return;
        setCodes(prev => {
            const newCodes = [...prev];
            newCodes[index].content = '';
            newCodes[index].fileName = '';
            return newCodes;
        });
    };

    // Actualizar contenido del editor
    const handleEditorChange = (value, index) => {
        if (isLocked) return;
        setCodes(prev => {
            const newCodes = [...prev];
            newCodes[index].content = value || '';
            return newCodes;
        });
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

    // Manejar comparación grupal CON análisis de IA
    const handleCompare = async () => {
        if (!languageId) {
            notification.warning({
                message: 'Lenguaje no seleccionado',
                description: 'Por favor, selecciona un lenguaje de programación.',
                placement: 'topRight',
                duration: 3,
                icon: <InfoCircleFilled style={{ color: '#ffa726' }} />
            });
            return;
        }

        const codesWithContent = codes.filter(c => c.content.trim());
        
        if (codesWithContent.length < 3) {
            notification.warning({
                message: 'Códigos insuficientes',
                description: 'Debes cargar al menos 3 códigos para realizar una comparación grupal.',
                placement: 'topRight',
                duration: 3,
                icon: <InfoCircleFilled style={{ color: '#ffa726' }} />
            });
            return;
        }

        if (!model?.id) {
            notification.error({
                message: 'Modelo no seleccionado',
                description: 'No se ha seleccionado un modelo de IA.',
                placement: 'topRight',
                duration: 4
            });
            return;
        }

        setLoading(true);

        try {
            const token = getStoredToken();

            // PASO 1: Crear la comparación grupal
            setLoadingStage('Creando comparación grupal...');
            
            const formData = new FormData();
            formData.append('id_usuario', userProfile.usuario_id);
            formData.append('id_modelo_ia', model.id);
            formData.append('id_lenguaje', languageId);

            const finalName = comparisonName.trim() || 'Sin título';
            formData.append('nombre_comparacion', finalName);

            // Agregar códigos dinámicamente
            codesWithContent.forEach((code, index) => {
                formData.append(`codigo_${index + 1}`, code.content);
                if (code.fileName) {
                    formData.append(`nombre_archivo_${index + 1}`, code.fileName);
                }
            });

            const createUrl = buildApiUrl(API_ENDPOINTS.CREAR_COMPARACION_GRUPAL);

            const createResponse = await fetch(createUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const createData = await createResponse.json();

            if (!createResponse.ok) {
                throw new Error(createData.error || 'Error al crear la comparación grupal');
            }

            const comparacionId = createData.id;
            console.log('✅ Comparación grupal creada con ID:', comparacionId);
            console.log('📊 Total códigos:', createData.total_codigos);

            // PASO 2: Obtener resultados de la IA
            setLoadingStage('Analizando códigos con IA...');

            const iaUrl = buildApiUrl(`${API_ENDPOINTS.OBTENER_RESULTADO_COMPARACION_IA_GRUPAL}${comparacionId}/`);

            const iaResponse = await fetch(iaUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const iaData = await iaResponse.json();

            if (!iaResponse.ok) {
                throw new Error(iaData.error || 'Error al obtener resultados de IA');
            }

            console.log('✅ Resultados de IA obtenidos:', iaData);

            // Construir resultado completo con respuesta de IA
            const resultadoCompleto = {
                id: comparacionId,
                nombre_comparacion: finalName,
                total_codigos: createData.total_codigos,
                codigos: createData.codigos,
                lenguaje: iaData.lenguaje,
                fecha_creacion: createData.fecha_creacion,
                // Datos de la IA
                respuesta_ia: iaData.respuesta_ia,
                tokens_usados: iaData.tokens_usados,
                tiempo_respuesta_segundos: iaData.tiempo_respuesta_segundos,
                modelo_usado: iaData.modelo_usado,
                proveedor: iaData.proveedor,
                model_name: iaData.model_name,
                prompt_usado: iaData.prompt_usado,
                codigos_comparados: iaData.codigos_comparados,
                resultado_id: iaData.resultado_id
            };

            console.log('📦 Resultado completo construido:', resultadoCompleto);

            setIsLocked(true);

            notification.success({
                message: '¡Análisis completado exitosamente!',
                description: `Se analizaron ${createData.total_codigos} códigos con ${iaData.modelo_usado}`,
                placement: 'topRight',
                duration: 4,
                icon: <CheckCircleFilled style={{ color: '#5ebd8f' }} />
            });

            if (refreshComparaciones) {
                console.log('🔄 Refrescando lista de comparaciones');
                refreshComparaciones();
            }

            if (onAnalysisComplete) {
                console.log('📤 Llamando a onAnalysisComplete con resultado:', {
                    id: resultadoCompleto.id,
                    tiene_respuesta_ia: !!resultadoCompleto.respuesta_ia,
                    tokens: resultadoCompleto.tokens_usados
                });
                onAnalysisComplete(resultadoCompleto);
                console.log('✅ onAnalysisComplete ejecutado');
            } else {
                console.warn('⚠️ onAnalysisComplete NO está definido');
            }

        } catch (error) {
            console.error('❌ Error en el proceso:', error);
            notification.error({
                message: 'Error en el análisis',
                description: error.message || 'Ocurrió un error durante el análisis.',
                placement: 'topRight',
                duration: 5
            });
        } finally {
            setLoading(false);
            setLoadingStage('');
        }
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

    const filledCodesCount = codes.filter(c => c.content.trim()).length;

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
                            Puedes soltar múltiples archivos a la vez
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
                            Comparación Grupal · {filledCodesCount}/{codes.length} códigos · Usando {model.name} {model.icon}
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

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
                gap: '20px',
                padding: '20px'
            }}>
                {codes.map((code, index) => (
                    <div
                        key={code.id}
                        className={`code-editor-wrapper ${dragOverIndex === index ? 'drag-over' : ''} ${isLocked ? 'locked' : ''}`}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={(e) => handleDragLeave(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        style={{ opacity: isLocked ? 0.7 : 1 }}
                    >
                        <div className="code-editor-header">
                            <span className="code-editor-label">Código {index + 1}</span>
                            {code.fileName ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileOutlined style={{ color: '#5ebd8f' }} />
                                    <span className="code-editor-hint" style={{ color: '#5ebd8f' }}>
                                        {code.fileName}
                                    </span>
                                    {!isLocked && (
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={() => handleRemoveFile(index)}
                                            style={{ color: '#ff6b6b', padding: '0 4px' }}
                                        >
                                            ✕
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <span className="code-editor-hint">Arrastra un archivo o escribe código</span>
                            )}
                            {!isLocked && codes.length > 3 && (
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={() => handleRemoveEditor(index)}
                                    style={{ color: '#ff6b6b' }}
                                    title="Eliminar editor"
                                />
                            )}
                        </div>
                        <div className="monaco-editor-container">
                            <Editor
                                height="400px"
                                language={getMonacoLanguage(languageId)}
                                value={code.content}
                                onChange={(value) => handleEditorChange(value, index)}
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
                        {dragOverIndex === index && !isLocked && (
                            <div className="drag-overlay">
                                <div className="drag-overlay-content">
                                    <div className="drag-overlay-icon">📁</div>
                                    <div className="drag-overlay-text">Suelta el archivo aquí</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {!isLocked && !loading && (
                <div style={{ padding: '0 20px 20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Button
                        type="dashed"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={handleAddEditor}
                        style={{
                            borderColor: model.color,
                            color: model.color,
                            height: '48px',
                            fontSize: '14px',
                            borderRadius: '10px'
                        }}
                    >
                        Agregar Código
                    </Button>

                    <Button
                        type="primary"
                        size="large"
                        icon={<PlayCircleOutlined />}
                        onClick={handleCompare}
                        disabled={loadingLanguages || !languageId || filledCodesCount < 3}
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
                        Analizar {filledCodesCount} Códigos con IA
                    </Button>
                </div>
            )}

            {loading && (
                <div className="loading-message">
                    <Spin size="large" />
                    <div className="loading-message-icon">
                        {loadingStage.includes('Analizando') ? '🤖' : '💾'}
                    </div>
                    <div className="loading-message-text">
                        {loadingStage || 'Procesando comparación grupal...'}
                    </div>
                    <div className="loading-message-subtext">
                        {loadingStage.includes('Analizando') 
                            ? 'La IA está analizando los códigos...' 
                            : 'Esto puede tomar unos segundos'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeComparisonGroupInput;