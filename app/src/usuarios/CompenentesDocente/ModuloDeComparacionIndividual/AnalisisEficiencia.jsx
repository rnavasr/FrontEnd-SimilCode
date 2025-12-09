import React, { useState } from 'react';
import { Button, Card, Typography, Spin, notification, Tag } from 'antd';
import { ThunderboltOutlined, RobotOutlined, CheckCircleFilled, TrophyOutlined } from '@ant-design/icons';
import { API_ENDPOINTS, getStoredToken, buildApiUrl } from '../../../../config';
import '../../Estilos/Css_Comparacion_Individual/AnalisisEficiencia.css';

const { Title, Text } = Typography;

const AnalisisEficiencia = ({ comparacionId, model }) => {
    const [loading, setLoading] = useState(false);
    const [analisisBigO, setAnalisisBigO] = useState(null);
    const [comentarioIA, setComentarioIA] = useState(null);
    const [loadingComentario, setLoadingComentario] = useState(false);

    // Paso 1: Análisis Big O automático
    const handleAnalizarEficiencia = async () => {
        setLoading(true);
        try {
            const token = getStoredToken();
            const url = buildApiUrl(`${API_ENDPOINTS.ANALIZAR_EFICIENCIA_INDIVIDUAL}/${comparacionId}/`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al analizar eficiencia');
            }

            setAnalisisBigO(data);

            notification.success({
                message: '¡Análisis Big O completado!',
                description: `Ganador: ${data.ganador === 'codigo_1' ? 'Código 1' : data.ganador === 'codigo_2' ? 'Código 2' : 'Empate'}`,
                placement: 'topRight',
                duration: 3,
                icon: <CheckCircleFilled style={{ color: '#5ebd8f' }} />
            });

            // Automáticamente iniciar análisis con IA
            await handleGenerarComentarioIA(data);

        } catch (error) {
            console.error('Error:', error);
            notification.error({
                message: 'Error al analizar eficiencia',
                description: error.message,
                placement: 'topRight',
                duration: 4
            });
        } finally {
            setLoading(false);
        }
    };

    // Paso 2: Generar comentario con IA
    const handleGenerarComentarioIA = async (analisisData) => {
        setLoadingComentario(true);
        try {
            const token = getStoredToken();
            
            // Necesitamos el ID del resultado de eficiencia que acabamos de crear
            // Asumiendo que el backend retorna el ID en la respuesta
            const resultadoId = analisisData.resultado_id || comparacionId; // Ajusta según tu backend
            
            const url = buildApiUrl(`${API_ENDPOINTS.CREAR_COMENTARIO_EFICIENCIA}/${resultadoId}/`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al generar comentario');
            }

            setComentarioIA(data);

            notification.success({
                message: '¡Comentario de IA generado!',
                description: `Análisis completado con ${data.proveedor}`,
                placement: 'topRight',
                duration: 3,
                icon: <CheckCircleFilled style={{ color: '#5ebd8f' }} />
            });

        } catch (error) {
            console.error('Error:', error);
            notification.error({
                message: 'Error al generar comentario',
                description: error.message,
                placement: 'topRight',
                duration: 4
            });
        } finally {
            setLoadingComentario(false);
        }
    };

    const getComplejidadColor = (complejidad) => {
        const colores = {
            'O(1)': '#52c41a',
            'O(log n)': '#73d13d',
            'O(n)': '#faad14',
            'O(n log n)': '#ffa940',
            'O(n^2)': '#ff7875',
            'O(n^3)': '#ff4d4f',
            'O(2^n)': '#cf1322'
        };
        return colores[complejidad] || '#a0a0a0';
    };

    const getGanadorIcon = (ganador, codigo) => {
        if (ganador === codigo) {
            return <TrophyOutlined style={{ color: '#ffd700', fontSize: '24px', marginLeft: '8px' }} />;
        }
        return null;
    };

    return (
        <div className="analisis-eficiencia-container">
            {/* Botón inicial */}
            {!analisisBigO && !loading && (
                <div className="analisis-trigger-section">
                    <Button
                        type="primary"
                        size="large"
                        icon={<ThunderboltOutlined />}
                        onClick={handleAnalizarEficiencia}
                        className="analisis-trigger-button"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderColor: 'transparent',
                            height: '48px',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}
                    >
                        Analizar Eficiencia Algorítmica
                    </Button>
                </div>
            )}

            {/* Loading del análisis inicial */}
            {loading && (
                <div className="analisis-loading">
                    <Spin size="large" />
                    <div className="analisis-loading-text">
                        Analizando complejidad algorítmica...
                    </div>
                    <div className="analisis-loading-subtext">
                        Esto puede tomar unos segundos
                    </div>
                </div>
            )}

            {/* Resultados del análisis Big O */}
            {analisisBigO && (
                <div className="analisis-resultados-section">
                    <Title level={3} className="analisis-section-title">
                        Análisis de Eficiencia Algorítmica
                    </Title>

                    {/* Resumen del ganador */}
                    <Card className="analisis-ganador-card">
                        <div className="analisis-ganador-content">
                            <TrophyOutlined style={{ fontSize: '48px', color: '#ffd700' }} />
                            <div className="analisis-ganador-text">
                                <Text className="analisis-ganador-label">Código más eficiente:</Text>
                                <Title level={2} className="analisis-ganador-nombre" style={{ margin: 0 }}>
                                    {analisisBigO.ganador === 'codigo_1' ? 'Código 1' : 
                                     analisisBigO.ganador === 'codigo_2' ? 'Código 2' : 'Empate'}
                                </Title>
                            </div>
                        </div>
                    </Card>

                    {/* Grid de comparación */}
                    <div className="analisis-comparison-grid">
                        {/* Código 1 */}
                        <Card className="analisis-codigo-card">
                            <div className="analisis-codigo-header">
                                <Title level={4} style={{ margin: 0, color: '#c0c0c0' }}>
                                    Código 1
                                    {getGanadorIcon(analisisBigO.ganador, 'codigo_1')}
                                </Title>
                            </div>

                            <div className="analisis-complejidad-section">
                                <div className="analisis-complejidad-item">
                                    <Text className="analisis-complejidad-label">Complejidad Temporal</Text>
                                    <Tag 
                                        className="analisis-complejidad-tag"
                                        style={{ 
                                            background: getComplejidadColor(analisisBigO.codigo_1.complejidad_temporal),
                                            color: '#1a1a1a',
                                            fontSize: '18px',
                                            padding: '8px 16px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {analisisBigO.codigo_1.complejidad_temporal}
                                    </Tag>
                                </div>

                                <div className="analisis-complejidad-item">
                                    <Text className="analisis-complejidad-label">Complejidad Espacial</Text>
                                    <Tag 
                                        className="analisis-complejidad-tag"
                                        style={{ 
                                            background: getComplejidadColor(analisisBigO.codigo_1.complejidad_espacial),
                                            color: '#1a1a1a',
                                            fontSize: '18px',
                                            padding: '8px 16px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {analisisBigO.codigo_1.complejidad_espacial}
                                    </Tag>
                                </div>
                            </div>

                            <div className="analisis-detalles">
                                <div className="analisis-detalle-item">
                                    <Text className="analisis-detalle-label">Nivel de Anidamiento:</Text>
                                    <Text className="analisis-detalle-value">{analisisBigO.codigo_1.nivel_anidamiento}</Text>
                                </div>

                                {analisisBigO.codigo_1.patrones_detectados?.length > 0 && (
                                    <div className="analisis-patrones">
                                        <Text className="analisis-patrones-title">Patrones Detectados:</Text>
                                        {analisisBigO.codigo_1.patrones_detectados.map((patron, idx) => (
                                            <div key={idx} className="analisis-patron-item">
                                                <Tag color="blue">{patron.patron}</Tag>
                                                <Text className="analisis-patron-complejidad">{patron.complejidad}</Text>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {analisisBigO.codigo_1.estructuras_datos?.length > 0 && (
                                    <div className="analisis-estructuras">
                                        <Text className="analisis-estructuras-title">Estructuras de Datos:</Text>
                                        <div className="analisis-estructuras-tags">
                                            {analisisBigO.codigo_1.estructuras_datos.map((est, idx) => (
                                                <Tag key={idx} color="purple">{est}</Tag>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="analisis-confianza">
                                    <Text className="analisis-confianza-label">Confianza del análisis:</Text>
                                    <Tag color={
                                        analisisBigO.codigo_1.confianza_analisis === 'Alta' ? 'green' :
                                        analisisBigO.codigo_1.confianza_analisis === 'Media' ? 'orange' : 'red'
                                    }>
                                        {analisisBigO.codigo_1.confianza_analisis}
                                    </Tag>
                                </div>
                            </div>
                        </Card>

                        {/* Código 2 */}
                        <Card className="analisis-codigo-card">
                            <div className="analisis-codigo-header">
                                <Title level={4} style={{ margin: 0, color: '#c0c0c0' }}>
                                    Código 2
                                    {getGanadorIcon(analisisBigO.ganador, 'codigo_2')}
                                </Title>
                            </div>

                            <div className="analisis-complejidad-section">
                                <div className="analisis-complejidad-item">
                                    <Text className="analisis-complejidad-label">Complejidad Temporal</Text>
                                    <Tag 
                                        className="analisis-complejidad-tag"
                                        style={{ 
                                            background: getComplejidadColor(analisisBigO.codigo_2.complejidad_temporal),
                                            color: '#1a1a1a',
                                            fontSize: '18px',
                                            padding: '8px 16px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {analisisBigO.codigo_2.complejidad_temporal}
                                    </Tag>
                                </div>

                                <div className="analisis-complejidad-item">
                                    <Text className="analisis-complejidad-label">Complejidad Espacial</Text>
                                    <Tag 
                                        className="analisis-complejidad-tag"
                                        style={{ 
                                            background: getComplejidadColor(analisisBigO.codigo_2.complejidad_espacial),
                                            color: '#1a1a1a',
                                            fontSize: '18px',
                                            padding: '8px 16px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {analisisBigO.codigo_2.complejidad_espacial}
                                    </Tag>
                                </div>
                            </div>

                            <div className="analisis-detalles">
                                <div className="analisis-detalle-item">
                                    <Text className="analisis-detalle-label">Nivel de Anidamiento:</Text>
                                    <Text className="analisis-detalle-value">{analisisBigO.codigo_2.nivel_anidamiento}</Text>
                                </div>

                                {analisisBigO.codigo_2.patrones_detectados?.length > 0 && (
                                    <div className="analisis-patrones">
                                        <Text className="analisis-patrones-title">Patrones Detectados:</Text>
                                        {analisisBigO.codigo_2.patrones_detectados.map((patron, idx) => (
                                            <div key={idx} className="analisis-patron-item">
                                                <Tag color="blue">{patron.patron}</Tag>
                                                <Text className="analisis-patron-complejidad">{patron.complejidad}</Text>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {analisisBigO.codigo_2.estructuras_datos?.length > 0 && (
                                    <div className="analisis-estructuras">
                                        <Text className="analisis-estructuras-title">Estructuras de Datos:</Text>
                                        <div className="analisis-estructuras-tags">
                                            {analisisBigO.codigo_2.estructuras_datos.map((est, idx) => (
                                                <Tag key={idx} color="purple">{est}</Tag>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="analisis-confianza">
                                    <Text className="analisis-confianza-label">Confianza del análisis:</Text>
                                    <Tag color={
                                        analisisBigO.codigo_2.confianza_analisis === 'Alta' ? 'green' :
                                        analisisBigO.codigo_2.confianza_analisis === 'Media' ? 'orange' : 'red'
                                    }>
                                        {analisisBigO.codigo_2.confianza_analisis}
                                    </Tag>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Comentario de la IA */}
                    {loadingComentario && (
                        <div className="analisis-ia-loading">
                            <Spin size="large" />
                            <RobotOutlined style={{ fontSize: '48px', color: '#667eea', marginTop: '16px' }} />
                            <div className="analisis-ia-loading-text">
                                Generando análisis detallado con IA...
                            </div>
                            <div className="analisis-ia-loading-subtext">
                                Usando {model?.name || 'modelo de IA'}
                            </div>
                        </div>
                    )}

                    {comentarioIA && (
                        <Card className="analisis-ia-card">
                            <div className="analisis-ia-header">
                                <RobotOutlined style={{ fontSize: '32px', color: '#667eea' }} />
                                <div>
                                    <Title level={4} style={{ margin: 0, color: '#c0c0c0' }}>
                                        Análisis Detallado con IA
                                    </Title>
                                    <Text style={{ color: '#909090', fontSize: '13px' }}>
                                        Generado por {comentarioIA.proveedor} • {comentarioIA.tiempo_respuesta_segundos}s
                                    </Text>
                                </div>
                            </div>

                            <div className="analisis-ia-content">
                                <Text className="analisis-ia-comentario">
                                    {comentarioIA.comentario_preview || 'Análisis completado exitosamente'}
                                </Text>
                            </div>

                            <div className="analisis-ia-footer">
                                <Tag color="blue">Tokens usados: {comentarioIA.tokens_usados}</Tag>
                                <Tag color="green">{comentarioIA.model_name}</Tag>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnalisisEficiencia;