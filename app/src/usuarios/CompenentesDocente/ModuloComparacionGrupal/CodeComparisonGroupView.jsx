import React, { useState } from 'react';
import CodeComparisonGroupInput from './ComparacionGrupalEntrada';

/**
 * Wrapper para comparaciones grupales (3+ códigos)
 * - CodeComparisonGroupInput: Entrada de múltiples códigos y ejecución del análisis
 * - CodeComparisonResults: Muestra resultados de similitud
 * - AnalisisEficiencia: Muestra análisis de eficiencia Big O y comentarios IA
 */
const CodeComparisonGroupView = ({ model, onBack, userProfile, refreshComparaciones }) => {
    const [result, setResult] = useState(null);
    const [isLocked, setIsLocked] = useState(false);

    const handleAnalysisComplete = (analysisResult) => {
        console.log('✅ Resultado completo de comparación grupal:', analysisResult);
        setResult(analysisResult);
        setIsLocked(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <CodeComparisonGroupInput
                model={model}
                onBack={onBack}
                userProfile={userProfile}
                refreshComparaciones={refreshComparaciones}
                onAnalysisComplete={handleAnalysisComplete}
            />

            {result && (
                <div style={{ marginTop: '-60px' }}>
                    {/* Resultados de similitud */}
                    <CodeComparisonResults
                        result={result}
                        model={model}
                        isLocked={isLocked}
                    />
                    
                    {/* Análisis de eficiencia */}
                    {result.eficiencia && (
                        <AnalisisEficiencia
                            eficienciaData={{
                                analisisBigO: result.eficiencia,
                                comentarioIA: result.eficiencia.comentarioIA
                            }}
                            model={model}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default CodeComparisonGroupView;