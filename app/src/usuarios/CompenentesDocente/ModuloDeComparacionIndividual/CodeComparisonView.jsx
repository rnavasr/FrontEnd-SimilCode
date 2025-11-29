import React, { useState } from 'react';
import CodeComparisonResults from './ResultadoCompacionSimilitud';
import CodeComparisonInput from './ComparacionDeCodigoEntrada';
/**
 * Wrapper que coordina los dos componentes
 * - CodeComparisonInput: Entrada de código (~ 300 líneas)
 * - CodeComparisonResults: Muestra resultados (~ 200 líneas)
 */
const CodeComparisonView = ({ model, onBack, userProfile, refreshComparaciones }) => {
    const [result, setResult] = useState(null);
    const [isLocked, setIsLocked] = useState(false);

    const handleAnalysisComplete = (analysisResult) => {
        console.log('✅ Resultado recibido en wrapper:', analysisResult);
        setResult(analysisResult);
        setIsLocked(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <CodeComparisonInput
                model={model}
                onBack={onBack}
                userProfile={userProfile}
                refreshComparaciones={refreshComparaciones}
                onAnalysisComplete={handleAnalysisComplete}
            />

            {result && (
                <div style={{ marginTop: '-60px' }}> {/* Ajusta este valor */}
                    <CodeComparisonResults
                        result={result}
                        model={model}
                        isLocked={isLocked}
                    />
                </div>
            )}
        </div>
    );
};

export default CodeComparisonView;