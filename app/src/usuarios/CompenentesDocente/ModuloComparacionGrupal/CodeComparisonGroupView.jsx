import React, { useState } from 'react';
import CodeComparisonGroupInput from './ComparacionGrupalEntrada';
import CodeComparisonGroupResults from './ResultadosComparacionGrupalIA';

/**
 * Wrapper para comparaciones grupales (3+ códigos)
 * Muestra los editores Y los resultados debajo cuando están listos
 */
const CodeComparisonGroupView = ({ model, onBack, userProfile, refreshComparaciones }) => {
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleAnalysisComplete = (result) => {
        console.log('✅ Análisis grupal completado en wrapper:', result);
        setAnalysisResult(result);
    };

    return (
        <div>
            {/* Siempre mostrar los editores */}
            <CodeComparisonGroupInput
                model={model}
                onBack={onBack}
                userProfile={userProfile}
                refreshComparaciones={refreshComparaciones}
                onAnalysisComplete={handleAnalysisComplete}
            />

            {/* Mostrar resultados debajo cuando existan */}
            {analysisResult && (
                <CodeComparisonGroupResults 
                    result={analysisResult}
                    model={model}
                    userProfile={userProfile}
                    loading={false}
                />
            )}
        </div>
    );
};

export default CodeComparisonGroupView;