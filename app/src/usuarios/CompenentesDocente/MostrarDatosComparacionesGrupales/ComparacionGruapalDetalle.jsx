import React from 'react';
import CodeComparisonGroupDetail from './ComparacionGrupalDetalleCodigo';

const CodeComparisonGroupViewDetail = ({ 
    comparacionId, 
    model, 
    onBack
}) => {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            overflow: 'auto'
        }}>
            {/* Componente de visualización de códigos */}
            <CodeComparisonGroupDetail
                comparacionId={comparacionId}
                onBack={onBack}
                model={model}
            />
        </div>
    );
};

export default CodeComparisonGroupViewDetail;