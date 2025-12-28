import React from 'react';
import CodeComparisonGroupDetail from './ComparacionGrupalDetalleCodigo';
import CodeComparisonGroupResultsDetail from './DetalleResultadosSimilitudGrupal';
import DetalleEficienciaGrupal from './DetalleEficienciaGrupal';
import DetalleComentariosEficienciaGrupalIA from './DetalleComentariosEficienciaGrupalIA';

const ComparacionGrupalDetalle = ({
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
            {/* Códigos */}
            <CodeComparisonGroupDetail
                comparacionId={comparacionId}
                onBack={onBack}
                model={model}
            />

            {/* Similitud con IA */}
            <CodeComparisonGroupResultsDetail
                comparacionId={comparacionId}
                model={model}
            />

            {/* Eficiencia Big O */}
            <DetalleEficienciaGrupal
                comparacionId={comparacionId}
            />

            {/* Comentarios de Eficiencia con IA */}
            <DetalleComentariosEficienciaGrupalIA
                comparacionId={comparacionId}
            />
        </div>
    );
};

export default ComparacionGrupalDetalle;