import React, { useState } from 'react';
import CodeComparisonGroupInput from './ComparacionGrupalEntrada';
import CodeComparisonGroupResults from './ResultadosComparacionGrupalIA';
import AnalisisEficienciaGrupal from './AnalisisEficienciaBigO';
import AnalisisEficienciaIA from './AnalisisEficienciaIA';

const CodeComparisonGroupView = ({ model, onBack, userProfile, refreshComparaciones }) => {
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleAnalysisComplete = (result) => {
        console.log('✅ Análisis grupal completado en wrapper:', result);
        console.log('📊 Datos de eficiencia Big O:', result.analisis_eficiencia);
        console.log('🧠 Datos de eficiencia IA:', result.analisis_eficiencia_ia);
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
                    {/* Análisis de Similitud con IA */}
                    <CodeComparisonGroupResults
                        result={analysisResult}
                        model={model}
                        userProfile={userProfile}
                    />

                    {/* Análisis de Eficiencia Big O */}
                    {analysisResult.analisis_eficiencia && (
                        <AnalisisEficienciaGrupal 
                            eficienciaData={analysisResult.analisis_eficiencia}
                        />
                    )}

                    {/* Análisis de Eficiencia con IA - DIRECTAMENTE con los datos */}
                    {analysisResult.analisis_eficiencia_ia && (
                        <div style={{ marginTop: '24px' }}>
                            <AnalisisEficienciaIA 
                                analisisData={analysisResult.analisis_eficiencia_ia}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CodeComparisonGroupView;