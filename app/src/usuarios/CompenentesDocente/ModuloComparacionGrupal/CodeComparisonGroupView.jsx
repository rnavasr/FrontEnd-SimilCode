import React, { useState } from 'react';
import CodeComparisonGroupInput from './ComparacionGrupalEntrada';

/**
 * Wrapper para comparaciones grupales (3+ códigos)
 * Solo guarda los códigos sin mostrar pantalla de resultados
 */
const CodeComparisonGroupView = ({ model, onBack, userProfile, refreshComparaciones }) => {
    const handleAnalysisComplete = (analysisResult) => {
        console.log('✅ Comparación grupal guardada:', analysisResult);
        // No hacemos nada más, los editores quedan bloqueados y eso es todo
    };

    return (
        <CodeComparisonGroupInput
            model={model}
            onBack={onBack}
            userProfile={userProfile}
            refreshComparaciones={refreshComparaciones}
            onAnalysisComplete={handleAnalysisComplete}
        />
    );
};

export default CodeComparisonGroupView;