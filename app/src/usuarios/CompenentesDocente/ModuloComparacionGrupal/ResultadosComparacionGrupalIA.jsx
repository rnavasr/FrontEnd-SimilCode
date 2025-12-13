import React from 'react';
import { Card, Typography, Tag, Spin } from 'antd';
import { 
    ThunderboltOutlined, 
    ClockCircleOutlined,
    CodeOutlined,
    FileTextOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const CodeComparisonGroupResults = ({ result, model, loading = false }) => {
    if (loading) {
        return (
            <div className="loading-message">
                <Spin size="large" />
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

    // Función para formatear la respuesta de IA con saltos de línea
    const formatIAResponse = (text) => {
        if (!text) return [];
        
        // Dividir por saltos de línea y filtrar líneas vacías
        const lines = text.split('\n').filter(line => line.trim());
        
        // Agrupar líneas en secciones
        const sections = [];
        let currentSection = null;
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            
            // Detectar títulos/encabezados (líneas que terminan con : o están en mayúsculas)
            if (trimmedLine.match(/^[A-ZÁÉÍÓÚÑ\s]+:?$/) || 
                trimmedLine.match(/^#+\s+/) ||
                trimmedLine.match(/^\*\*.*\*\*$/) ||
                trimmedLine.match(/^#{1,6}\s/)) {
                
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = {
                    title: trimmedLine.replace(/^#+\s+|\*\*|:$/g, '').trim(),
                    content: []
                };
            } else if (trimmedLine) {
                if (!currentSection) {
                    currentSection = {
                        title: null,
                        content: []
                    };
                }
                currentSection.content.push(trimmedLine);
            }
        });
        
        if (currentSection) {
            sections.push(currentSection);
        }
        
        return sections;
    };

    const sections = formatIAResponse(result.respuesta_ia);

    return (
        <div className="results-container" style={{ padding: '0 32px 16px 32px' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '12px' 
            }}>
                <Title level={3} className="results-title" style={{ margin: 0 }}>
                    Resultados del Análisis Grupal
                </Title>
            </div>

            {/* Información general */}
            <Card 
                className="results-card" 
                style={{ marginBottom: '20px', background: '#1a1a1a' }}
            >
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px',
                    marginBottom: '16px'
                }}>
                    <div>
                        <Text style={{ color: '#909090', fontSize: '12px', display: 'block' }}>
                            Comparación
                        </Text>
                        <Text strong style={{ color: '#e0e0e0', fontSize: '16px' }}>
                            {result.nombre_comparacion}
                        </Text>
                    </div>
                    
                    <div>
                        <Text style={{ color: '#909090', fontSize: '12px', display: 'block' }}>
                            <CodeOutlined /> Códigos Analizados
                        </Text>
                        <Text strong style={{ color: '#5ebd8f', fontSize: '16px' }}>
                            {result.total_codigos} archivos
                        </Text>
                    </div>
                    
                    <div>
                        <Text style={{ color: '#909090', fontSize: '12px', display: 'block' }}>
                            <ThunderboltOutlined /> Modelo IA
                        </Text>
                        <Text strong style={{ color: '#e0e0e0', fontSize: '16px' }}>
                            {result.modelo_usado}
                        </Text>
                    </div>
                    
                    <div>
                        <Text style={{ color: '#909090', fontSize: '12px', display: 'block' }}>
                            <ClockCircleOutlined /> Tiempo
                        </Text>
                        <Text strong style={{ color: '#e0e0e0', fontSize: '16px' }}>
                            {result.tiempo_respuesta_segundos}s
                        </Text>
                    </div>
                </div>

                {/* Tags de metadatos */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Tag color="blue">{result.lenguaje}</Tag>
                    <Tag color="purple">{result.proveedor}</Tag>
                    <Tag color="green">{result.tokens_usados} tokens</Tag>
                    {result.prompt_usado && (
                        <Tag color="orange">Prompt v{result.prompt_usado.version}</Tag>
                    )}
                </div>
            </Card>

            {/* Códigos comparados */}
            {result.codigos_comparados && result.codigos_comparados.length > 0 && (
                <Card 
                    className="results-card" 
                    style={{ marginBottom: '20px', background: '#1a1a1a' }}
                    title={
                        <span style={{ color: '#e0e0e0', fontSize: '16px' }}>
                            <FileTextOutlined /> Códigos Comparados
                        </span>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {result.codigos_comparados.map((codigo, idx) => (
                            <div 
                                key={idx}
                                style={{
                                    padding: '12px',
                                    background: '#252525',
                                    borderRadius: '8px',
                                    border: '1px solid #333'
                                }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <Text strong style={{ color: '#5ebd8f' }}>
                                        Código {codigo.orden}: {codigo.nombre_archivo}
                                    </Text>
                                    <Text style={{ color: '#909090', fontSize: '12px' }}>
                                        {codigo.longitud} caracteres
                                    </Text>
                                </div>
                                <Text 
                                    style={{ 
                                        color: '#c0c0c0', 
                                        fontSize: '13px',
                                        fontFamily: 'monospace'
                                    }}
                                >
                                    {codigo.preview}
                                </Text>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Análisis de IA */}
            <Card className="results-card" style={{ background: '#1a1a1a' }}>
                <Title level={4} style={{ color: '#e0e0e0', marginBottom: '20px' }}>
                    📊 Análisis de Similitud Grupal
                </Title>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {sections.map((section, index) => (
                        <div key={index} className="similarity-list-item">
                            {section.title && (
                                <div className="similarity-list-header" style={{ marginBottom: '12px' }}>
                                    <h4 
                                        className="similarity-list-title-text"
                                        style={{ 
                                            color: '#5ebd8f',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            margin: 0
                                        }}
                                    >
                                        {section.title}
                                    </h4>
                                </div>
                            )}
                            
                            <div className="similarity-list-body">
                                {section.content.map((paragraph, pIndex) => (
                                    <p 
                                        key={pIndex}
                                        className="similarity-list-justification"
                                        style={{
                                            color: '#c0c0c0',
                                            lineHeight: '1.8',
                                            marginBottom: '12px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {/* Si no hay secciones formateadas, mostrar texto completo */}
                    {sections.length === 0 && result.respuesta_ia && (
                        <div className="similarity-list-body">
                            <p 
                                className="similarity-list-justification"
                                style={{
                                    color: '#c0c0c0',
                                    lineHeight: '1.8',
                                    fontSize: '14px',
                                    whiteSpace: 'pre-wrap'
                                }}
                            >
                                {result.respuesta_ia}
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default CodeComparisonGroupResults;