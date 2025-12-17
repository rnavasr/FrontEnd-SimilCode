import React from 'react';
import { Card, Typography, Spin } from 'antd';

const { Title } = Typography;

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
        
        const lines = text.split('\n').filter(line => line.trim());
        const sections = [];
        let currentSection = null;
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            
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
            {/* Análisis de IA */}
            <Card className="results-card" style={{ background: '#1a1a1a', marginTop: '20px' }}>
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