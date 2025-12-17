import React, { useState } from 'react';
import CodeComparisonGroupInput from './ComparacionGrupalEntrada';
import CodeComparisonGroupResults from './ResultadosComparacionGrupalIA';
import AnalisisEficienciaGrupal from './AnalisisEficienciaBigO';

/**
 * Wrapper para comparaciones grupales (3+ códigos)
 * Muestra los editores Y los resultados debajo cuando están listos
 */
const CodeComparisonGroupView = ({ model, onBack, userProfile, refreshComparaciones }) => {
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleAnalysisComplete = (result) => {
        console.log('✅ Análisis grupal completado en wrapper:', result);
        console.log('📊 Datos de eficiencia recibidos:', result.analisis_eficiencia);
        setAnalysisResult(result);
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            overflow: 'auto'
        }}>
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
                <>
                    {/* Análisis de IA */}
                    <CodeComparisonGroupResults
                        result={analysisResult}
                        model={model}
                        userProfile={userProfile}
                    />

                    {/* Análisis de Eficiencia */}
                    {analysisResult.analisis_eficiencia && (
                        <AnalisisEficienciaGrupal 
                            eficienciaData={analysisResult.analisis_eficiencia}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default CodeComparisonGroupView;