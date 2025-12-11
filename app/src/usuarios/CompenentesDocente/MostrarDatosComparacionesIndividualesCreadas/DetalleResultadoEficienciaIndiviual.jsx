import React, { useEffect } from 'react';
import { Card, Typography, Tag, Spin, Empty } from 'antd';
import { RobotOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const MostrarAnalisisEficienciaIndividual = ({ eficienciaData, comentariosData, loading }) => {
    // Si está cargando, mostrar spinner
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" tip="Cargando análisis de eficiencia..." />
            </div>
        );
    }

    // Si no hay datos de eficiencia, mostrar mensaje
    if (!eficienciaData || eficienciaData.length === 0) {
        return (
            <div style={{ padding: '32px' }}>
                <Empty 
                    description="No hay análisis de eficiencia disponible"
                    style={{ margin: '40px 0' }}
                />
            </div>
        );
    }

    // Tomar el primer resultado (asumiendo que hay uno por comparación)
    const resultado = eficienciaData[0];
    
    // Tomar el primer comentario si existe
    const comentario = comentariosData && comentariosData.length > 0 ? comentariosData[0] : null;

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

    // Función para renderizar formato inline (negrita, código, etc.)
    const renderInlineFormat = (texto) => {
        const elementos = [];
        let key = 0;
        
        const regex = /(\*\*[^*]+?\*\*|`[^`]+?`|\*[^*\s][^*]*?\*(?!\*))/g;
        let ultimoIndice = 0;
        let match;
        
        regex.lastIndex = 0;
        
        while ((match = regex.exec(texto)) !== null) {
            if (match.index > ultimoIndice) {
                elementos.push(
                    <span key={`text-${key++}`}>
                        {texto.substring(ultimoIndice, match.index)}
                    </span>
                );
            }
            
            const captura = match[0];
            
            if (captura.startsWith('**') && captura.endsWith('**')) {
                const contenido = captura.slice(2, -2);
                elementos.push(
                    <strong key={`bold-${key++}`} style={{ color: '#e0e0e0', fontWeight: '600' }}>
                        {contenido}
                    </strong>
                );
            } else if (captura.startsWith('`') && captura.endsWith('`')) {
                const contenido = captura.slice(1, -1);
                elementos.push(
                    <code key={`code-${key++}`} style={{ 
                        background: '#2d2d2d', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        color: '#ffa657',
                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                        fontSize: '13px',
                        border: '1px solid #404040',
                        whiteSpace: 'nowrap'
                    }}>
                        {contenido}
                    </code>
                );
            } else if (captura.startsWith('*') && captura.endsWith('*') && !captura.startsWith('**')) {
                const contenido = captura.slice(1, -1);
                elementos.push(
                    <em key={`italic-${key++}`} style={{ color: '#c0c0c0', fontStyle: 'italic' }}>
                        {contenido}
                    </em>
                );
            }
            
            ultimoIndice = regex.lastIndex;
        }
        
        if (ultimoIndice < texto.length) {
            elementos.push(
                <span key={`text-end-${key++}`}>
                    {texto.substring(ultimoIndice)}
                </span>
            );
        }
        
        return elementos.length > 0 ? <>{elementos}</> : texto;
    };

    // Componente para renderizar el comentario de IA con formato Markdown
    const renderComentarioIA = (texto) => {
        if (!texto) return null;

        const lineas = texto.split('\n');
        const elementos = [];
        let enBloqueCode = false;
        let codigoActual = [];
        
        for (let idx = 0; idx < lineas.length; idx++) {
            const linea = lineas[idx];
            
            // Detectar bloques de código
            if (linea.trim().startsWith('```')) {
                if (!enBloqueCode) {
                    enBloqueCode = true;
                    codigoActual = [];
                } else {
                    // Fin del bloque de código
                    elementos.push(
                        <pre key={`code-${idx}`} style={{
                            background: '#1e1e1e',
                            padding: '16px',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            margin: '16px 0',
                            border: '1px solid #404040'
                        }}>
                            <code style={{
                                color: '#d4d4d4',
                                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                fontSize: '13px',
                                lineHeight: '1.5'
                            }}>
                                {codigoActual.join('\n')}
                            </code>
                        </pre>
                    );
                    enBloqueCode = false;
                    codigoActual = [];
                }
                continue;
            }
            
            // Si estamos dentro de un bloque de código, acumular
            if (enBloqueCode) {
                codigoActual.push(linea);
                continue;
            }
            
            // Detectar headers
            if (linea.startsWith('### ')) {
                elementos.push(
                    <h4 key={idx} style={{ 
                        color: '#c0c0c0', 
                        marginTop: '24px', 
                        marginBottom: '12px',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        {linea.replace('### ', '')}
                    </h4>
                );
                continue;
            }
            
            if (linea.startsWith('## ')) {
                elementos.push(
                    <h3 key={idx} style={{ 
                        color: '#e0e0e0', 
                        marginTop: '28px', 
                        marginBottom: '14px',
                        fontSize: '18px',
                        fontWeight: '600'
                    }}>
                        {linea.replace('## ', '')}
                    </h3>
                );
                continue;
            }
            
            if (linea.startsWith('# ')) {
                elementos.push(
                    <h2 key={idx} style={{ 
                        color: '#ffffff', 
                        marginTop: '32px', 
                        marginBottom: '16px',
                        fontSize: '20px',
                        fontWeight: '700'
                    }}>
                        {linea.replace('# ', '')}
                    </h2>
                );
                continue;
            }
            
            // Detectar listas con bullet points
            if (linea.trim().startsWith('• ')) {
                const contenido = linea.trim().substring(2);
                elementos.push(
                    <div key={idx} style={{ 
                        marginLeft: '24px', 
                        marginBottom: '10px', 
                        display: 'flex',
                        alignItems: 'flex-start'
                    }}>
                        <span style={{ 
                            color: '#667eea', 
                            marginRight: '12px',
                            marginTop: '2px',
                            fontSize: '18px'
                        }}>•</span>
                        <span style={{ color: '#b0b0b0', flex: 1, lineHeight: '1.6' }}>
                            {renderInlineFormat(contenido)}
                        </span>
                    </div>
                );
                continue;
            }
            
            // Detectar listas con * o -
            if (linea.trim().startsWith('* ') || linea.trim().startsWith('- ')) {
                const contenido = linea.replace(/^[\s]*[\*\-]\s/, '');
                elementos.push(
                    <div key={idx} style={{ 
                        marginLeft: '24px', 
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'flex-start'
                    }}>
                        <span style={{ 
                            color: '#667eea', 
                            marginRight: '12px',
                            marginTop: '2px'
                        }}>•</span>
                        <span style={{ color: '#b0b0b0', flex: 1, lineHeight: '1.6' }}>
                            {renderInlineFormat(contenido)}
                        </span>
                    </div>
                );
                continue;
            }
            
            // Líneas vacías
            if (linea.trim() === '') {
                elementos.push(<div key={idx} style={{ height: '8px' }} />);
                continue;
            }
            
            // Líneas separadoras
            if (linea.trim() === '---') {
                elementos.push(
                    <hr key={idx} style={{ 
                        border: 'none', 
                        borderTop: '1px solid #404040', 
                        margin: '24px 0' 
                    }} />
                );
                continue;
            }
            
            // Texto normal (párrafo)
            elementos.push(
                <p key={idx} style={{ 
                    color: '#a0a0a0', 
                    marginBottom: '12px', 
                    lineHeight: '1.7',
                    textAlign: 'justify'
                }}>
                    {renderInlineFormat(linea)}
                </p>
            );
        }
        
        return <div style={{ padding: '8px 0' }}>{elementos}</div>;
    };

    return (
        <div style={{ padding: '0 32px 16px 32px' }}>
            <div>
                <Title level={3} style={{ marginTop: '32px', marginBottom: '24px', color: '#e0e0e0' }}>
                    Análisis de Eficiencia Algorítmica
                </Title>

                {/* Resumen del ganador */}
                <Card style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <TrophyOutlined style={{ fontSize: '48px', color: '#ffd700' }} />
                        <div>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', display: 'block' }}>
                                Código más eficiente:
                            </Text>
                            <Title level={2} style={{ margin: 0, color: '#ffffff' }}>
                                {resultado.ganador === 'codigo_1' ? 'Código 1' :
                                    resultado.ganador === 'codigo_2' ? 'Código 2' : 'Empate'}
                            </Title>
                        </div>
                    </div>
                </Card>

                {/* Grid de comparación */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '24px',
                    marginBottom: '24px'
                }}>
                    {/* Código 1 */}
                    <Card style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <Title level={4} style={{ margin: 0, color: '#c0c0c0', display: 'flex', alignItems: 'center' }}>
                                Código 1
                                {getGanadorIcon(resultado.ganador, 'codigo_1')}
                            </Title>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <Text style={{ color: '#888', display: 'block', marginBottom: '8px' }}>
                                    Complejidad Temporal
                                </Text>
                                <Tag style={{
                                    background: getComplejidadColor(resultado.codigo_1.complejidad_temporal),
                                    color: '#1a1a1a',
                                    fontSize: '18px',
                                    padding: '8px 16px',
                                    fontWeight: 'bold',
                                    border: 'none'
                                }}>
                                    {resultado.codigo_1.complejidad_temporal}
                                </Tag>
                            </div>

                            <div>
                                <Text style={{ color: '#888', display: 'block', marginBottom: '8px' }}>
                                    Complejidad Espacial
                                </Text>
                                <Tag style={{
                                    background: getComplejidadColor(resultado.codigo_1.complejidad_espacial),
                                    color: '#1a1a1a',
                                    fontSize: '18px',
                                    padding: '8px 16px',
                                    fontWeight: 'bold',
                                    border: 'none'
                                }}>
                                    {resultado.codigo_1.complejidad_espacial}
                                </Tag>
                            </div>
                        </div>

                        <div>
                            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#888' }}>Nivel de Anidamiento:</Text>
                                <Text style={{ color: '#c0c0c0', fontWeight: '500' }}>
                                    {resultado.codigo_1.nivel_anidamiento}
                                </Text>
                            </div>

                            {resultado.codigo_1.patrones_detectados?.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <Text style={{ color: '#888', display: 'block', marginBottom: '8px' }}>
                                        Patrones Detectados:
                                    </Text>
                                    {resultado.codigo_1.patrones_detectados.map((patron, idx) => (
                                        <div key={idx} style={{ 
                                            display: 'flex', 
                                            gap: '8px', 
                                            alignItems: 'center',
                                            marginBottom: '6px'
                                        }}>
                                            <Tag color="blue">{patron.patron}</Tag>
                                            <Text style={{ color: '#a0a0a0', fontSize: '13px' }}>
                                                {patron.complejidad}
                                            </Text>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {resultado.codigo_1.estructuras_datos?.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <Text style={{ color: '#888', display: 'block', marginBottom: '8px' }}>
                                        Estructuras de Datos:
                                    </Text>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {resultado.codigo_1.estructuras_datos.map((est, idx) => (
                                            <Tag key={idx} color="purple">{est}</Tag>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: '#888' }}>Confianza del análisis:</Text>
                                <Tag color={
                                    resultado.codigo_1.confianza_analisis === 'Alta' ? 'green' :
                                        resultado.codigo_1.confianza_analisis === 'Media' ? 'orange' : 'red'
                                }>
                                    {resultado.codigo_1.confianza_analisis}
                                </Tag>
                            </div>
                        </div>
                    </Card>

                    {/* Código 2 */}
                    <Card style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <Title level={4} style={{ margin: 0, color: '#c0c0c0', display: 'flex', alignItems: 'center' }}>
                                Código 2
                                {getGanadorIcon(resultado.ganador, 'codigo_2')}
                            </Title>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <Text style={{ color: '#888', display: 'block', marginBottom: '8px' }}>
                                    Complejidad Temporal
                                </Text>
                                <Tag style={{
                                    background: getComplejidadColor(resultado.codigo_2.complejidad_temporal),
                                    color: '#1a1a1a',
                                    fontSize: '18px',
                                    padding: '8px 16px',
                                    fontWeight: 'bold',
                                    border: 'none'
                                }}>
                                    {resultado.codigo_2.complejidad_temporal}
                                </Tag>
                            </div>

                            <div>
                                <Text style={{ color: '#888', display: 'block', marginBottom: '8px' }}>
                                    Complejidad Espacial
                                </Text>
                                <Tag style={{
                                    background: getComplejidadColor(resultado.codigo_2.complejidad_espacial),
                                    color: '#1a1a1a',
                                    fontSize: '18px',
                                    padding: '8px 16px',
                                    fontWeight: 'bold',
                                    border: 'none'
                                }}>
                                    {resultado.codigo_2.complejidad_espacial}
                                </Tag>
                            </div>
                        </div>

                        <div>
                            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#888' }}>Nivel de Anidamiento:</Text>
                                <Text style={{ color: '#c0c0c0', fontWeight: '500' }}>
                                    {resultado.codigo_2.nivel_anidamiento}
                                </Text>
                            </div>

                            {resultado.codigo_2.patrones_detectados?.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <Text style={{ color: '#888', display: 'block', marginBottom: '8px' }}>
                                        Patrones Detectados:
                                    </Text>
                                    {resultado.codigo_2.patrones_detectados.map((patron, idx) => (
                                        <div key={idx} style={{ 
                                            display: 'flex', 
                                            gap: '8px', 
                                            alignItems: 'center',
                                            marginBottom: '6px'
                                        }}>
                                            <Tag color="blue">{patron.patron}</Tag>
                                            <Text style={{ color: '#a0a0a0', fontSize: '13px' }}>
                                                {patron.complejidad}
                                            </Text>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {resultado.codigo_2.estructuras_datos?.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <Text style={{ color: '#888', display: 'block', marginBottom: '8px' }}>
                                        Estructuras de Datos:
                                    </Text>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {resultado.codigo_2.estructuras_datos.map((est, idx) => (
                                            <Tag key={idx} color="purple">{est}</Tag>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: '#888' }}>Confianza del análisis:</Text>
                                <Tag color={
                                    resultado.codigo_2.confianza_analisis === 'Alta' ? 'green' :
                                        resultado.codigo_2.confianza_analisis === 'Media' ? 'orange' : 'red'
                                }>
                                    {resultado.codigo_2.confianza_analisis}
                                </Tag>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Comentario de la IA */}
                {comentario && (
                    <Card style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <RobotOutlined style={{ fontSize: '32px', color: '#667eea' }} />
                            <div>
                                <Title level={4} style={{ margin: 0, color: '#c0c0c0' }}>
                                    Análisis Detallado con IA
                                </Title>
                                <Text style={{ color: '#888', fontSize: '12px' }}>
                                    Generado el {new Date(comentario.fecha_generacion).toLocaleString('es-ES')}
                                </Text>
                            </div>
                        </div>

                        <div style={{ color: '#a0a0a0' }}>
                            {renderComentarioIA(comentario.comentario)}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default MostrarAnalisisEficienciaIndividual;