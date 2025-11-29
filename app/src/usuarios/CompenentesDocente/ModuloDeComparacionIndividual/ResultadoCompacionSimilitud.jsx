import React from 'react';
import { Card, Typography, Button, Divider } from 'antd';
import { DownloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import '../../Estilos/Css_Comparacion_Individual/CodeComparisonView.css';

const { Title } = Typography;

const CodeComparisonResults = ({ result, model, isLocked }) => {
    const parseIAResponse = (text) => {
        const sections = [];

        const patterns = [
            {
                key: 'lexica',
                title: 'Similitud Léxica',
                color: '#3b82f6',
                regex: /SIMILITUD\s+LÉXICA:\s*(\d+)(?:\s+Justificación:)?\s*(.+?)(?=SIMILITUD\s+|$)/is
            },
            {
                key: 'estructural',
                title: 'Similitud Estructural',
                color: '#8b5cf6',
                regex: /SIMILITUD\s+ESTRUCTURAL:\s*(\d+)(?:\s+Justificación:)?\s*(.+?)(?=SIMILITUD\s+|$)/is
            },
            {
                key: 'estilo',
                title: 'Similitud de Estilo',
                color: '#ec4899',
                regex: /SIMILITUD\s+DE\s+ESTILO:\s*(\d+)(?:\s+Justificación:)?\s*(.+?)(?=SIMILITUD\s+|$)/is
            },
            {
                key: 'funcional',
                title: 'Similitud Funcional',
                color: '#f59e0b',
                regex: /SIMILITUD\s+FUNCIONAL:\s*(\d+)(?:\s+Justificación:)?\s*(.+?)(?=SIMILITUD\s+|$)/is
            },
            {
                key: 'general',
                title: 'Similitud General',
                color: '#10b981',
                regex: /SIMILITUD\s+GENERAL:\s*(\d+)(?:\s+Justificación:)?\s*(.+?)$/is
            }
        ];

        patterns.forEach(pattern => {
            const match = text.match(pattern.regex);
            if (match) {
                let justification = match[2]
                    .trim()
                    .replace(/\s+/g, ' ')
                    .replace(/[\n\r\t]/g, ' ')
                    .trim();

                if (justification.length > 500) {
                    const sentences = justification.split('.');
                    if (sentences.length > 1) {
                        justification = sentences.slice(0, 3).join('.').trim();
                        if (!justification.endsWith('.')) justification += '.';
                    }
                }

                sections.push({
                    key: pattern.key,
                    title: pattern.title,
                    color: pattern.color,
                    percentage: parseInt(match[1]),
                    justification: justification
                });
            }
        });

        return sections;
    };

    const getSimilarityColor = (score) => {
        if (score >= 80) return '#ff6b6b';
        if (score >= 60) return '#ffa726';
        if (score >= 40) return '#66bb6a';
        return '#5ebd8f';
    };

    const handleExportResults = () => {
        const exportData = {
            title: result.nombre_comparacion,
            similarity_score: result.similarity.similarity_score,
            timestamp: new Date().toISOString(),
            metadata: result.metadata,
            details: parseIAResponse(result.similarity.explanation)
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${result.nombre_comparacion}_results.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    if (!result) {
        return null;
    }

    const parsedSections = parseIAResponse(result.similarity.explanation);

    return (
        <div className="results-container" style={{ padding: '0 32px 32px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={3} className="results-title" style={{ margin: 0 }}>
                    Resultados del Análisis
                </Title>
            </div>

            <Card className="results-card">
                {/* Resumen principal */}
                <div className="similarity-summary-header">
                    <div
                        className="similarity-summary-percentage"
                        style={{
                            background: `linear-gradient(135deg, ${getSimilarityColor(result.similarity.similarity_score)} 0%, ${getSimilarityColor(result.similarity.similarity_score)}dd 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontSize: '64px',
                            fontWeight: 'bold'
                        }}
                    >
                        {result.similarity.similarity_score}%
                    </div>
                    <h3 className="similarity-summary-title">
                        Similitud detectada
                    </h3>
                </div>

                {/* Desglose de similitud */}
                <div className="similarity-list">
                    {parsedSections.map((section) => {
                        const getPercentageClass = (percentage) => {
                            if (percentage >= 80) return 'percentage-high';
                            if (percentage >= 60) return 'percentage-medium';
                            if (percentage >= 40) return 'percentage-low';
                            return 'percentage-very-low';
                        };

                        return (
                            <div key={section.key} className="similarity-list-item">
                                <div className="similarity-list-header">
                                    <div className="similarity-list-title">
                                        <h4 className="similarity-list-title-text">
                                            {section.title}
                                        </h4>
                                    </div>
                                    <div
                                        className={`similarity-list-percentage ${getPercentageClass(section.percentage)}`}
                                        style={{ color: section.color }}
                                    >
                                        {section.percentage}%
                                    </div>
                                </div>

                                <div className="similarity-list-progress">
                                    <div
                                        className="similarity-list-progress-fill"
                                        style={{
                                            width: `${section.percentage}%`,
                                            background: section.color
                                        }}
                                    />
                                </div>

                                <div className="similarity-list-body">
                                    <p className="similarity-list-justification">
                                        {section.justification}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default CodeComparisonResults;