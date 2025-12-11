import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { RobotOutlined, TrophyOutlined } from '@ant-design/icons';
import '../../Estilos/Css_Comparacion_Individual/AnalisisEficiencia.css';

const { Title, Text } = Typography;

const AnalisisEficiencia = ({ eficienciaData, model }) => {
    // Si no hay datos de eficiencia, no renderizamos nada
    if (!eficienciaData) {
        return null;
    }

    const { analisisBigO, comentarioIA } = eficienciaData;

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
        
        return <div className="analisis-ia-markdown">{elementos}</div>;
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

    return (
        <div className="analisis-eficiencia-container" style={{ paddingTop: '0' }}>
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
                {comentarioIA && (
                    <Card className="analisis-ia-card" style={{ maxHeight: 'none' }}>
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

                        <div className="analisis-ia-content" style={{ maxHeight: 'none', overflow: 'visible' }}>
                            {renderComentarioIA(comentarioIA.comentario || comentarioIA.comentario_preview || comentarioIA.texto)}
                        </div>

                        <div className="analisis-ia-footer">
                            <Tag color="blue">Tokens usados: {comentarioIA.tokens_usados}</Tag>
                            <Tag color="green">{comentarioIA.model_name}</Tag>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AnalisisEficiencia;