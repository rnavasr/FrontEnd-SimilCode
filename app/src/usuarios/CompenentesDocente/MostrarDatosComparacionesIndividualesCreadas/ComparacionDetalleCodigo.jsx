import React from 'react';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import '../../Estilos/Css_Comparacion_Individual/ComparisonDetailView.css';

const { Text } = Typography;

const ComparisonDetailHeader = ({ comparacion, onBack }) => {
    const getMonacoLanguage = (languageName) => {
        if (!languageName) return 'plaintext';

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

        return mapping[languageName.toLowerCase()] || 'plaintext';
    };

    return (
        <>
            {/* Header */}
            <div className="comparison-detail-header">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                    className="comparison-detail-back-button"
                    type="text"
                >
                    Volver
                </Button>

                <div className="comparison-detail-title-section">
                    <div className="comparison-detail-title-text">
                        {comparacion.nombre_comparacion || 'Sin título'}
                    </div>
                    <div className="comparison-detail-meta">
                        <Text className="comparison-detail-meta-item">
                            Usando {comparacion.modelo_ia?.nombre || 'N/A'}
                        </Text>
                    </div>
                </div>

                {comparacion.lenguaje && (
                    <div className="comparison-detail-language-badge">
                        <Text style={{ color: '#b0b0b0', fontSize: '15px', fontWeight: '500' }}>
                            {comparacion.lenguaje.nombre}
                        </Text>
                    </div>
                )}
            </div>

            {/* Code Editors Grid */}
            <div className="code-editors-grid" style={{ marginBottom: '0' }}>
                <div className="code-editor-wrapper">
                    <div className="code-editor-header">
                        <span className="code-editor-label">Código 1</span>
                    </div>
                    <div className="monaco-editor-container">
                        <Editor
                            height="400px"
                            language={getMonacoLanguage(comparacion.lenguaje?.nombre)}
                            value={comparacion.codigo_1 || '// Sin código'}
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
                                readOnly: true
                            }}
                        />
                    </div>
                </div>

                <div className="code-editor-wrapper">
                    <div className="code-editor-header">
                        <span className="code-editor-label">Código 2</span>
                    </div>
                    <div className="monaco-editor-container">
                        <Editor
                            height="400px"
                            language={getMonacoLanguage(comparacion.lenguaje?.nombre)}
                            value={comparacion.codigo_2 || '// Sin código'}
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
                                readOnly: true
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ComparisonDetailHeader;