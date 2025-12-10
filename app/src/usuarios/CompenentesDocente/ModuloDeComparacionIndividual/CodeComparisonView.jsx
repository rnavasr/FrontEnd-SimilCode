import React, { useState } from 'react';
import CodeComparisonResults from './ResultadoCompacionSimilitud';
import CodeComparisonInput from './ComparacionDeCodigoEntrada';
import AnalisisEficiencia from './AnalisisEficiencia';

/**
 * Wrapper que coordina los tres componentes:
 * - CodeComparisonInput: Entrada de código y ejecución completa del análisis
 * - CodeComparisonResults: Muestra resultados de similitud
 * - AnalisisEficiencia: Muestra análisis de eficiencia Big O y comentarios IA
 */
const CodeComparisonView = ({ model, onBack, userProfile, refreshComparaciones }) => {
    const [result, setResult] = useState(null);
    const [isLocked, setIsLocked] = useState(false);

    const handleAnalysisComplete = (analysisResult) => {
        console.log('✅ Resultado completo recibido en wrapper:', analysisResult);
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
                <div style={{ marginTop: '-60px' }}>
                    {/* Resultados de similitud */}
                    <CodeComparisonResults
                        result={result}
                        model={model}
                        isLocked={isLocked}
                    />
                    
                    {/* Análisis de eficiencia - pasamos los datos desde result.eficiencia */}
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

export default CodeComparisonView;