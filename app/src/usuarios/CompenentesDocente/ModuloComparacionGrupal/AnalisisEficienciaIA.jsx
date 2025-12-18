import React from 'react';
import { Card, Typography, Tag, Collapse, Badge } from 'antd';
import { RobotOutlined, TrophyOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import '../../Estilos/Css_Comparacion_Grupal/AnalisisEficienciaGrupalIA.css'

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const AnalisisEficienciaIA = ({ analisisData }) => {
    
    const renderInlineFormat = (texto) => {
        if (!texto) return texto;
        
        const elementos = [];
        let key = 0;
        const regex = /(\*\*[^*]+?\*\*|`[^`]+?`|\*[^*\s][^*]*?\*(?!\*))/g;
        let ultimoIndice = 0;
        let match;
        
        regex.lastIndex = 0;
        
        while ((match = regex.exec(texto)) !== null) {
            if (match.index > ultimoIndice) {
                elementos.push(<span key={`text-${key++}`}>{texto.substring(ultimoIndice, match.index)}</span>);
            }
            
            const captura = match[0];
            
            if (captura.startsWith('**') && captura.endsWith('**')) {
                elementos.push(
                    <strong key={`bold-${key++}`} className="analisis-grupal-text-bold">
                        {captura.slice(2, -2)}
                    </strong>
                );
            } else if (captura.startsWith('`') && captura.endsWith('`')) {
                elementos.push(
                    <code key={`code-${key++}`} className="analisis-grupal-text-code">
                        {captura.slice(1, -1)}
                    </code>
                );
            } else if (captura.startsWith('*') && captura.endsWith('*')) {
                elementos.push(
                    <em key={`italic-${key++}`} className="analisis-grupal-text-italic">
                        {captura.slice(1, -1)}
                    </em>
                );
            }
            
            ultimoIndice = regex.lastIndex;
        }
        
        if (ultimoIndice < texto.length) {
            elementos.push(<span key={`text-end-${key++}`}>{texto.substring(ultimoIndice)}</span>);
        }
        
        return elementos.length > 0 ? <>{elementos}</> : texto;
    };

    const renderComentarioIA = (texto) => {
        if (!texto) return null;

        const lineas = texto.split('\n');
        const elementos = [];
        
        for (let idx = 0; idx < lineas.length; idx++) {
            const linea = lineas[idx];
            
            if (linea.startsWith('### ')) {
                elementos.push(
                    <h4 key={idx} className="analisis-grupal-h4">
                        {linea.replace('### ', '')}
                    </h4>
                );
            } else if (linea.startsWith('## ')) {
                elementos.push(
                    <h3 key={idx} className="analisis-grupal-h3">
                        {linea.replace('## ', '')}
                    </h3>
                );
            } else if (linea.trim().startsWith('• ') || linea.trim().startsWith('* ') || linea.trim().startsWith('- ')) {
                const contenido = linea.replace(/^[\s]*[•\*\-]\s/, '');
                elementos.push(
                    <div key={idx} className="analisis-grupal-lista-item">
                        <span className="analisis-grupal-lista-bullet">•</span>
                        <span className="analisis-grupal-lista-text">
                            {renderInlineFormat(contenido)}
                        </span>
                    </div>
                );
            } else if (linea.trim() === '') {
                elementos.push(<div key={idx} className="analisis-grupal-spacer" />);
            } else if (linea.trim() !== '') {
                elementos.push(
                    <p key={idx} className="analisis-grupal-parrafo">
                        {renderInlineFormat(linea)}
                    </p>
                );
            }
        }
        
        return <div>{elementos}</div>;
    };

    if (!analisisData) {
        console.warn('⚠️ No hay datos de análisis de eficiencia IA');
        return null;
    }

    console.log('✅ Renderizando AnalisisEficienciaIA con datos:', analisisData);

    const { analisis_completo, comentarios_individuales, respuesta_completa_ia, estadisticas } = analisisData;

    return (
        <div className="analisis-grupal-container" style={{ marginTop: '24px' }}>
            {/* Header con estadísticas */}
            <Card className="analisis-grupal-card" style={{ marginBottom: '24px' }}>
                <div className="analisis-grupal-header">
                    <div>
                        <Title level={3} className="analisis-grupal-title">
                            🧠 Análisis de Eficiencia con IA
                        </Title>
                        <Text className="analisis-grupal-subtitle">
                            {estadisticas?.total_codigos_analizados || 0} códigos analizados • {estadisticas?.tiempo_respuesta_segundos || 0}s
                        </Text>
                    </div>
                </div>
            </Card>

            {/* Mejor y Peor Código */}
            <div className="analisis-grupal-grid-2">
                <Card className="analisis-grupal-mejor-codigo">
                    <div className="analisis-grupal-codigo-header">
                        <TrophyOutlined className="analisis-grupal-codigo-icon mejor" />
                        <div>
                            <Text className="analisis-grupal-codigo-label">Código Más Eficiente</Text>
                            <Title level={2} className="analisis-grupal-codigo-numero mejor">
                                Código {analisis_completo?.mejor_codigo?.orden}
                            </Title>
                            <Text className="analisis-grupal-codigo-razon">
                                {analisis_completo?.mejor_codigo?.razon}
                            </Text>
                        </div>
                    </div>
                </Card>

                <Card className="analisis-grupal-peor-codigo">
                    <div className="analisis-grupal-codigo-header">
                        <FallOutlined className="analisis-grupal-codigo-icon peor" />
                        <div>
                            <Text className="analisis-grupal-codigo-label">Código Menos Eficiente</Text>
                            <Title level={2} className="analisis-grupal-codigo-numero peor">
                                Código {analisis_completo?.peor_codigo?.orden}
                            </Title>
                            <Text className="analisis-grupal-codigo-razon">
                                {analisis_completo?.peor_codigo?.razon}
                            </Text>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Ranking */}
            <Card 
                title={
                    <span className="analisis-grupal-section-title">
                        <RiseOutlined className="analisis-grupal-section-icon" />
                        Ranking de Eficiencia
                    </span>
                }
                className="analisis-grupal-card"
                style={{ marginBottom: '24px' }}
            >
                <div className="analisis-grupal-ranking-container">
                    {analisis_completo?.ranking_ia?.map((orden, index) => (
                        <Badge 
                            key={index}
                            count={index + 1}
                            style={{ 
                                background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                                color: '#000'
                            }}
                        >
                            <Tag className="analisis-grupal-ranking-tag">
                                Código {orden}
                            </Tag>
                        </Badge>
                    ))}
                </div>
            </Card>

            {/* Resumen Comparativo */}
            <Card 
                title={
                    <span className="analisis-grupal-section-title">
                        <RobotOutlined className="analisis-grupal-section-icon ia" />
                        Resumen Comparativo
                    </span>
                }
                className="analisis-grupal-card"
                style={{ marginBottom: '24px' }}
            >
                <div className="analisis-grupal-resumen-content">
                    {renderComentarioIA(analisis_completo?.resumen_comparativo)}
                </div>
            </Card>

            {/* Patrones */}
            <div className="analisis-grupal-grid-2">
                <Card 
                    title={<span style={{ color: '#52c41a' }}>✓ Patrones Eficientes</span>}
                    className="analisis-grupal-patrones-card"
                >
                    {analisis_completo?.patrones_eficientes?.map((patron, idx) => (
                        <div key={idx} className="analisis-grupal-patron-item analisis-grupal-patron-eficiente">
                            <Text className="analisis-grupal-patron-text">• {patron}</Text>
                        </div>
                    ))}
                </Card>

                <Card 
                    title={<span style={{ color: '#ff4d4f' }}>✗ Patrones Ineficientes</span>}
                    className="analisis-grupal-patrones-card"
                >
                    {analisis_completo?.patrones_ineficientes?.map((patron, idx) => (
                        <div key={idx} className="analisis-grupal-patron-item analisis-grupal-patron-ineficiente">
                            <Text className="analisis-grupal-patron-text">• {patron}</Text>
                        </div>
                    ))}
                </Card>
            </div>

            {/* Recomendaciones Generales */}
            <Card 
                title={<span className="analisis-grupal-section-title">💡 Recomendaciones Generales</span>}
                className="analisis-grupal-card"
                style={{ marginBottom: '24px' }}
            >
                {analisis_completo?.recomendaciones_generales?.map((rec, idx) => (
                    <div key={idx} className="analisis-grupal-recomendacion-item">
                        <Text className="analisis-grupal-recomendacion-text">{rec}</Text>
                    </div>
                ))}
            </Card>

            {/* Comentarios Individuales por Código */}
            <Card 
                title={<span className="analisis-grupal-section-title">📝 Análisis Detallado por Código</span>}
                className="analisis-grupal-card"
            >
                <Collapse ghost style={{ background: 'transparent' }}>
                    {respuesta_completa_ia?.comentarios_individuales?.map((codigo, idx) => (
                        <Panel
                            key={idx}
                            header={
                                <div className="analisis-grupal-collapse-header">
                                    <Badge count={codigo.orden} style={{ background: '#667eea' }} />
                                    <Text className="analisis-grupal-collapse-filename">
                                        {codigo.nombre_archivo}
                                    </Text>
                                    <Tag color="blue" className="analisis-grupal-collapse-nota">
                                        Nota: {codigo.nota_eficiencia}/10
                                    </Tag>
                                </div>
                            }
                            className="analisis-grupal-collapse-panel"
                        >
                            <div className="analisis-grupal-detalle-section">
                                <Title level={5} className="analisis-grupal-detalle-title">Comentario General</Title>
                                <Paragraph className="analisis-grupal-detalle-parrafo">
                                    {codigo.comentario_general}
                                </Paragraph>

                                <Title level={5} style={{ color: '#52c41a' }}>Puntos Fuertes</Title>
                                {codigo.puntos_fuertes?.map((punto, i) => (
                                    <div key={i} className="analisis-grupal-punto-item analisis-grupal-punto-fuerte">
                                        <Text className="analisis-grupal-punto-text">✓ {punto}</Text>
                                    </div>
                                ))}

                                <Title level={5} style={{ color: '#ff4d4f', marginTop: '16px' }}>Puntos Débiles</Title>
                                {codigo.puntos_debiles?.map((punto, i) => (
                                    <div key={i} className="analisis-grupal-punto-item analisis-grupal-punto-debil">
                                        <Text className="analisis-grupal-punto-text">✗ {punto}</Text>
                                    </div>
                                ))}

                                <Title level={5} style={{ color: '#faad14', marginTop: '16px' }}>Recomendaciones</Title>
                                {codigo.recomendaciones?.map((rec, i) => (
                                    <div key={i} className="analisis-grupal-punto-item analisis-grupal-punto-recomendacion">
                                        <Text className="analisis-grupal-punto-text">→ {rec}</Text>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    ))}
                </Collapse>
            </Card>
        </div>
    );
};

export default AnalisisEficienciaIA;