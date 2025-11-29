import React, { useState, useEffect } from 'react';
import { notification, Spin } from 'antd';
import { API_ENDPOINTS, buildApiUrl, getStoredToken } from '../../../../config';
import ComparisonDetailHeader from './ComparacionDetalleCodigo';
import ComparisonDetailResults from './ComparacionDetalleResultadosIA';

const ComparisonDetailView = ({ comparacionId, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [comparacion, setComparacion] = useState(null);
    const [resultados, setResultados] = useState(null);

    useEffect(() => {
        if (comparacionId) {
            fetchComparacionData();
            fetchResultados();
        }
    }, [comparacionId]);

    const fetchComparacionData = async () => {
        try {
            setLoading(true);
            const token = getStoredToken();
            
            const url = buildApiUrl(`${API_ENDPOINTS.OBTENER_COMPARACION_INDIVIDUAL}/${comparacionId}/`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cargar la comparación');
            }

            const data = await response.json();
            setComparacion(data);

        } catch (error) {
            console.error('Error:', error);
            notification.error({
                message: 'Error al cargar comparación',
                description: error.message || 'No se pudo cargar la información de la comparación.',
                placement: 'topRight',
                duration: 5
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchResultados = async () => {
        try {
            setLoadingResults(true);
            const token = getStoredToken();
            
            const url = buildApiUrl(`${API_ENDPOINTS.OBTENER_RESULTADO_COMPARACION_IA}${comparacionId}/`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cargar resultados');
            }

            const data = await response.json();
            
            if (data.resultados && data.resultados.length > 0) {
                setResultados(data.resultados[0]);
            }

        } catch (error) {
            console.error('Error al cargar resultados:', error);
        } finally {
            setLoadingResults(false);
        }
    };

    if (loading) {
        return (
            <div className="comparison-detail-loading">
                <Spin size="large" tip="Cargando comparación..." />
            </div>
        );
    }

    if (!comparacion) {
        return (
            <div className="comparison-detail-error">
                <h3>No se encontró la comparación</h3>
                <button onClick={onBack}>Volver</button>
            </div>
        );
    }

    return (
        <div className="comparison-detail-container">
            <ComparisonDetailHeader 
                comparacion={comparacion}
                onBack={onBack}
            />

            <ComparisonDetailResults 
                resultados={resultados}
                loadingResults={loadingResults}
            />
        </div>
    );
};

export default ComparisonDetailView;