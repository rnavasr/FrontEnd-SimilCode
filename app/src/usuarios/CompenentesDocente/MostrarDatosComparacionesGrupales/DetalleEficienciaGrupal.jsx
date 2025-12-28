import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Row, Col, Spin, Alert, notification } from 'antd';
import { TrophyOutlined, CodeOutlined } from '@ant-design/icons';
import { API_ENDPOINTS, getStoredToken, buildApiUrlWithId } from '../../../../config';
import '../../Estilos/Css_Comparacion_Individual/AnalisisEficiencia.css';

const { Title, Text } = Typography;

const DetalleEficienciaGrupal = ({ comparacionId }) => {
    const [eficienciaData, setEficienciaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [noAnalisis, setNoAnalisis] = useState(false);

    useEffect(() => {
        const fetchEficienciaData = async () => {
            try {
                setLoading(true);
                const token = getStoredToken();
                const url = buildApiUrlWithId(API_ENDPOINTS.OBTENER_RESULTADO_EFICIENCIA_GRUPAL, comparacionId);

                console.log('🔍 Cargando análisis de eficiencia para comparación:', comparacionId);
                console.log('📡 URL:', url);

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al cargar el análisis de eficiencia');
                }

                const data = await response.json();
                console.log('✅ Datos de eficiencia recibidos:', data);

                if (!data.existe_analisis) {
                    setNoAnalisis(true);
                    setEficienciaData(null);
                } else {
                    setEficienciaData(data);
                    setNoAnalisis(false);
                }
            } catch (error) {
                console.error('❌ Error:', error);
                notification.error({
                    message: 'Error al cargar análisis',
                    description: 'No se pudo cargar el análisis de eficiencia.',
                    placement: 'topRight',
                    duration: 4
                });
            } finally {
                setLoading(false);
            }
        };

        if (comparacionId) {
            fetchEficienciaData();
        }
    }, [comparacionId]);

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

    const getGanadorTexto = () => {
        if (eficienciaData.tipo_ganador === 'unico') {
            return `Código ${eficienciaData.ganador}`;
        } else if (eficienciaData.tipo_ganador === 'empate_multiple') {
            const ganadoresEmpatados = eficienciaData.codigos_analizados
                .filter(c => c.es_empate)
                .map(c => `Código ${c.orden}`)
                .join(', ');
            return `Empate: ${ganadoresEmpatados}`;
        } else {
            return 'Empate Total';
        }
    };

    const getTipoGanadorColor = () => {
        if (eficienciaData.tipo_ganador === 'unico') {
            return '#ffd700';
        } else if (eficienciaData.tipo_ganador === 'empate_multiple') {
            return '#ffa940';
        } else {
            return '#a0a0a0';
        }
    };

    if (loading) {
        return (
            <div className="loading-message">
                <Spin size="large" />
                <div className="loading-message-icon">📊</div>
                <div className="loading-message-text">
                    Cargando análisis de eficiencia...
                </div>
                <div className="loading-message-subtext">
                    Esto puede tomar unos momentos
                </div>
            </div>
        );
    }

    if (noAnalisis) {
        return (
            <div style={{ padding: '0 32px 16px 32px' }}>
                <Alert
                    message="No hay análisis de eficiencia"
                    description="No se ha realizado análisis de eficiencia Big O para esta comparación grupal."
                    type="info"
                    showIcon
                    style={{ margin: '20px 0' }}
                />
            </div>
        );
    }

    if (!eficienciaData) {
        return null;
    }

    return (
        <div className="analisis-eficiencia-container" style={{ padding: '0 32px 16px 32px' }}>
            <div className="analisis-resultados-section">
                <Title level={3} className="analisis-section-title" style={{ marginTop: '0', marginBottom: '0px' }}>
                    Análisis de Eficiencia Algorítmica Grupal
                </Title>

                {/* Resumen del análisis */}
                <Card className="analisis-ganador-card">
                    <div className="analisis-ganador-content">
                        <TrophyOutlined style={{ fontSize: '48px', color: getTipoGanadorColor() }} />
                        <div className="analisis-ganador-text">
                            <Text className="analisis-ganador-label">Código más eficiente:</Text>
                            <Title level={2} className="analisis-ganador-nombre" style={{ margin: 0 }}>
                                {getGanadorTexto()}
                            </Title>
                        </div>
                    </div>
                    
                    {/* Estadísticas generales */}
                    <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                        <Col xs={24} sm={12} md={6}>
                            <div style={{ textAlign: 'center' }}>
                                <Text style={{ color: '#808080', fontSize: '12px' }}>Total Códigos</Text>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c0c0c0' }}>
                                    {eficienciaData.total_codigos}
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div style={{ textAlign: 'center' }}>
                                <Text style={{ color: '#808080', fontSize: '12px' }}>Mejor Complejidad</Text>
                                <div style={{ marginTop: '4px' }}>
                                    <Tag style={{
                                        background: getComplejidadColor(eficienciaData.complejidad_temporal_mejor),
                                        color: '#1a1a1a',
                                        fontSize: '14px',
                                        padding: '4px 12px',
                                        fontWeight: 'bold'
                                    }}>
                                        {eficienciaData.complejidad_temporal_mejor}
                                    </Tag>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div style={{ textAlign: 'center' }}>
                                <Text style={{ color: '#808080', fontSize: '12px' }}>Peor Complejidad</Text>
                                <div style={{ marginTop: '4px' }}>
                                    <Tag style={{
                                        background: getComplejidadColor(eficienciaData.complejidad_temporal_peor),
                                        color: '#1a1a1a',
                                        fontSize: '14px',
                                        padding: '4px 12px',
                                        fontWeight: 'bold'
                                    }}>
                                        {eficienciaData.complejidad_temporal_peor}
                                    </Tag>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div style={{ textAlign: 'center' }}>
                                <Text style={{ color: '#808080', fontSize: '12px' }}>Confianza General</Text>
                                <div style={{ marginTop: '4px' }}>
                                    <Tag color={
                                        eficienciaData.confianza_analisis_general === 'Alta' ? 'green' :
                                        eficienciaData.confianza_analisis_general === 'Media' ? 'orange' : 'red'
                                    }>
                                        {eficienciaData.confianza_analisis_general}
                                    </Tag>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Grid de comparación de todos los códigos */}
                <div className="analisis-comparison-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '20px'
                }}>
                    {eficienciaData.codigos_analizados.map((codigo) => (
                        <Card key={codigo.id_detalle} className="analisis-codigo-card">
                            <div className="analisis-codigo-header">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CodeOutlined style={{ fontSize: '20px', color: '#667eea' }} />
                                        <Title level={4} style={{ margin: 0, color: '#c0c0c0' }}>
                                            {codigo.nombre_archivo || `Código ${codigo.orden}`}
                                        </Title>
                                    </div>
                                    {codigo.es_ganador && (
                                        <TrophyOutlined style={{ fontSize: '24px', color: '#ffd700' }} />
                                    )}
                                    {codigo.es_empate && (
                                        <Tag color="orange" style={{ margin: 0 }}>Empate</Tag>
                                    )}
                                </div>
                                <Tag 
                                    color="blue" 
                                    style={{ marginTop: '8px', fontSize: '12px' }}
                                >
                                    Ranking: #{codigo.ranking_eficiencia}
                                </Tag>
                            </div>

                            <div className="analisis-complejidad-section">
                                <div className="analisis-complejidad-item">
                                    <Text className="analisis-complejidad-label">Complejidad Temporal</Text>
                                    <Tag
                                        className="analisis-complejidad-tag"
                                        style={{
                                            background: getComplejidadColor(codigo.complejidad_temporal),
                                            color: '#1a1a1a',
                                            fontSize: '18px',
                                            padding: '8px 16px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {codigo.complejidad_temporal}
                                    </Tag>
                                </div>

                                <div className="analisis-complejidad-item">
                                    <Text className="analisis-complejidad-label">Complejidad Espacial</Text>
                                    <Tag
                                        className="analisis-complejidad-tag"
                                        style={{
                                            background: getComplejidadColor(codigo.complejidad_espacial),
                                            color: '#1a1a1a',
                                            fontSize: '18px',
                                            padding: '8px 16px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {codigo.complejidad_espacial}
                                    </Tag>
                                </div>
                            </div>

                            <div className="analisis-detalles">
                                <div className="analisis-detalle-item">
                                    <Text className="analisis-detalle-label">Nivel de Anidamiento:</Text>
                                    <Text className="analisis-detalle-value">{codigo.nivel_anidamiento}</Text>
                                </div>

                                {codigo.patrones_detectados?.length > 0 && (
                                    <div className="analisis-patrones">
                                        <Text className="analisis-patrones-title">Patrones Detectados:</Text>
                                        {codigo.patrones_detectados.map((patron, idx) => (
                                            <div key={idx} className="analisis-patron-item">
                                                <Tag color="blue">{patron.patron}</Tag>
                                                <Text className="analisis-patron-complejidad">{patron.complejidad}</Text>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {codigo.estructuras_datos?.length > 0 && (
                                    <div className="analisis-estructuras">
                                        <Text className="analisis-estructuras-title">Estructuras de Datos:</Text>
                                        <div className="analisis-estructuras-tags">
                                            {codigo.estructuras_datos.map((est, idx) => (
                                                <Tag key={idx} color="purple">{est}</Tag>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="analisis-confianza">
                                    <Text className="analisis-confianza-label">Confianza del análisis:</Text>
                                    <Tag color={
                                        codigo.confianza_analisis === 'Alta' ? 'green' :
                                        codigo.confianza_analisis === 'Media' ? 'orange' : 'red'
                                    }>
                                        {codigo.confianza_analisis}
                                    </Tag>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DetalleEficienciaGrupal;