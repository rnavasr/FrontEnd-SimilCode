import React from 'react';
import { Card, Typography, Table, Tag, Alert } from 'antd';
import { FireOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import '../../Estilos/Css_Comparacion_Grupal/CodeComparisonGroupResults.css';

const { Title, Text, Paragraph } = Typography;

const CodeComparisonGroupResults = ({ result, model, loading = false }) => {
    if (loading) {
        return (
            <div className="loading-message">
                <div className="loading-message-icon">🤖</div>
                <div className="loading-message-text">
                    Analizando códigos con IA...
                </div>
                <div className="loading-message-subtext">
                    Esto puede tomar unos momentos
                </div>
            </div>
        );
    }

    if (!result) {
        console.log('❌ No hay resultado para mostrar');
        return null;
    }

    console.log('✅ Renderizando resultados:', result);
    console.log('📊 Matriz similitud:', result.matriz_similitud);
    console.log('📋 Matriz tabla:', result.matriz_tabla);

    // Función para obtener color según nivel de similitud
    const getNivelColor = (nivel) => {
        const colores = {
            'muy_alta': '#f5222d',
            'alta': '#fa8c16',
            'media': '#faad14',
            'baja': '#52c41a',
            'muy_baja': '#1890ff'
        };
        return colores[nivel] || '#d9d9d9';
    };

    // Función para obtener etiqueta según nivel
    const getNivelTag = (nivel, similitud) => {
        const configs = {
            'muy_alta': { color: 'red', icon: <FireOutlined />, text: 'Muy Alta' },
            'alta': { color: 'orange', icon: <WarningOutlined />, text: 'Alta' },
            'media': { color: 'gold', icon: <InfoCircleOutlined />, text: 'Media' },
            'baja': { color: 'green', icon: <CheckCircleOutlined />, text: 'Baja' },
            'muy_baja': { color: 'blue', icon: <CheckCircleOutlined />, text: 'Muy Baja' }
        };
        
        const config = configs[nivel] || configs['muy_baja'];
        
        return (
            <Tag color={config.color} icon={config.icon}>
                {similitud}% - {config.text}
            </Tag>
        );
    };

    // Obtener lista de códigos únicos de matriz_similitud
    const getCodigosUnicos = () => {
        if (!result.matriz_similitud || result.matriz_similitud.length === 0) {
            return [];
        }

        const codigosMap = new Map();
        
        result.matriz_similitud.forEach(item => {
            if (!codigosMap.has(item.orden_a)) {
                codigosMap.set(item.orden_a, {
                    orden: item.orden_a,
                    nombre_archivo: item.codigo_a_nombre
                });
            }
            if (!codigosMap.has(item.orden_b)) {
                codigosMap.set(item.orden_b, {
                    orden: item.orden_b,
                    nombre_archivo: item.codigo_b_nombre
                });
            }
        });

        const codigos = Array.from(codigosMap.values()).sort((a, b) => a.orden - b.orden);
        console.log('📝 Códigos únicos encontrados:', codigos);
        return codigos;
    };

    const codigos = getCodigosUnicos();

    // Construir datos para la tabla de matriz
    const buildMatrizTable = () => {
        if (!result.matriz_tabla || codigos.length === 0) {
            console.log('⚠️ No hay datos para construir la tabla');
            return [];
        }
        
        const tableData = [];
        
        codigos.forEach((codigoA, indexA) => {
            const row = {
                key: `row_${indexA}`,
                codigo: codigoA.nombre_archivo,
                orden: codigoA.orden
            };
            
            codigos.forEach((codigoB, indexB) => {
                if (indexA === indexB) {
                    row[`col_${indexB}`] = { similitud: '-', nivel: null };
                } else {
                    const key = `${codigoA.orden}-${codigoB.orden}`;
                    const data = result.matriz_tabla[key];
                    row[`col_${indexB}`] = data || { similitud: 0, nivel: 'muy_baja' };
                }
            });
            
            tableData.push(row);
        });
        
        console.log('📊 Datos de tabla construidos:', tableData);
        return tableData;
    };

    // Construir columnas para la tabla
    const buildMatrizColumns = () => {
        if (codigos.length === 0) {
            console.log('⚠️ No hay códigos para construir columnas');
            return [];
        }

        const columns = [
            {
                title: 'Código',
                dataIndex: 'codigo',
                key: 'codigo',
                fixed: 'left',
                width: 200,
                render: (text) => (
                    <div className="codigo-cell" title={text}>
                        <Text strong className="codigo-name">
                            {text}
                        </Text>
                    </div>
                )
            }
        ];
        
        codigos.forEach((codigo, index) => {
            columns.push({
                title: codigo.nombre_archivo,
                dataIndex: `col_${index}`,
                key: `col_${index}`,
                width: 120,
                align: 'center',
                render: (data) => {
                    if (!data) {
                        return <Text style={{ color: '#666' }}>?</Text>;
                    }
                    if (data.similitud === '-') {
                        return (
                            <div className="similarity-cell diagonal">
                                <Text className="diagonal-text">—</Text>
                            </div>
                        );
                    }
                    return (
                        <div 
                            className={`similarity-cell ${data.nivel || 'muy_baja'}`}
                            style={{ 
                                background: `${getNivelColor(data.nivel)}20`,
                                borderLeft: `3px solid ${getNivelColor(data.nivel)}`
                            }}
                        >
                            <Text 
                                strong 
                                className="similarity-value"
                                style={{ color: getNivelColor(data.nivel) }}
                            >
                                {data.similitud}%
                            </Text>
                        </div>
                    );
                }
            });
        });
        
        console.log('📋 Columnas construidas:', columns.length);
        return columns;
    };

    const matrizData = buildMatrizTable();
    const matrizColumns = buildMatrizColumns();

    console.log('🎯 Total de columnas:', matrizColumns.length);
    console.log('🎯 Total de filas:', matrizData.length);

    // Verificar si hay similitudes notables
    const haySimilitudes = result.codigos_mas_similares && 
                          result.codigos_mas_similares.length > 0 &&
                          result.codigos_mas_similares[0]?.par !== 'Ninguno';

    return (
        <div className="results-container">
            {/* Resumen General */}
            {result.resumen_general && (
                <Card className="results-card resumen-card">
                    <div className="card-header">
                        <span className="card-icon">📋</span>
                        <Title level={4} className="card-title">Resumen General</Title>
                    </div>
                    <Paragraph className="resumen-text">
                        {result.resumen_general}
                    </Paragraph>
                </Card>
            )}

            {/* Códigos Más Similares */}
            <Card className="results-card similares-card">
                <div className="card-header">
                    <span className="card-icon">🔥</span>
                    <Title level={4} className="card-title">Códigos Más Similares</Title>
                </div>
                
                {haySimilitudes ? (
                    <div className="similares-list">
                        {result.codigos_mas_similares.map((item, index) => (
                            <Card key={index} className="similar-item-card">
                                <div className="similar-item-content">
                                    <div className="similar-item-info">
                                        <Text strong className="similar-par">
                                            {item.par}
                                        </Text>
                                        <Paragraph className="similar-razon">
                                            {item.razon}
                                        </Paragraph>
                                    </div>
                                    <div className="similar-tag-wrapper">
                                        {getNivelTag(
                                            item.similitud >= 91 ? 'muy_alta' :
                                            item.similitud >= 70 ? 'alta' : 'media',
                                            item.similitud
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Alert
                        message="No se encontraron similitudes notables"
                        description="No se detectaron códigos con similitud superior al 40%"
                        type="info"
                        showIcon
                        className="no-similitudes-alert"
                    />
                )}
            </Card>

            {/* Matriz de Similitud */}
            {codigos.length > 0 && (
                <Card className="results-card matriz-card">
                    <div className="card-header">
                        <span className="card-icon">📊</span>
                        <Title level={4} className="card-title">
                            Matriz de Similitud Completa ({codigos.length} códigos)
                        </Title>
                    </div>
                    
                    <div className="legend-container">
                        <Tag color="red" icon={<FireOutlined />} className="legend-tag">
                            91-100% Muy Alta
                        </Tag>
                        <Tag color="orange" icon={<WarningOutlined />} className="legend-tag">
                            70-90% Alta
                        </Tag>
                        <Tag color="gold" icon={<InfoCircleOutlined />} className="legend-tag">
                            40-69% Media
                        </Tag>
                        <Tag color="green" icon={<CheckCircleOutlined />} className="legend-tag">
                            20-39% Baja
                        </Tag>
                        <Tag color="blue" icon={<CheckCircleOutlined />} className="legend-tag">
                            0-19% Muy Baja
                        </Tag>
                    </div>

                    <div className="table-wrapper">
                        <Table
                            columns={matrizColumns}
                            dataSource={matrizData}
                            pagination={false}
                            scroll={{ x: true }}
                            bordered
                            size="middle"
                            className="matriz-similitud-table"
                            sticky={false}
                        />
                    </div>
                </Card>
            )}
        </div>
    );
};

export default CodeComparisonGroupResults;