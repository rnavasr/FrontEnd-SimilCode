import React, { useState, useEffect } from 'react';
import { notification, Spin } from 'antd';
import { API_ENDPOINTS, buildApiUrl, getStoredToken } from '../../../../config';
import ComparisonDetailHeader from './ComparacionDetalleCodigo';
import ComparisonDetailResults from './ComparacionDetalleResultadosIA';
import MostrarAnalisisEficienciaIndividual from './DetalleResultadoEficienciaIndiviual';

const ComparisonDetailView = ({ comparacionId, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [loadingEficiencia, setLoadingEficiencia] = useState(false);
    const [loadingComentarios, setLoadingComentarios] = useState(false);
    
    const [comparacion, setComparacion] = useState(null);
    const [resultados, setResultados] = useState(null);
    const [eficienciaData, setEficienciaData] = useState(null);
    const [comentariosData, setComentariosData] = useState(null);

    useEffect(() => {
        if (comparacionId) {
            console.log('Cargando datos para comparación:', comparacionId);
            fetchComparacionData();
            fetchResultados();
            fetchEficiencia();
            fetchComentarios();
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

    const fetchEficiencia = async () => {
        try {
            setLoadingEficiencia(true);
            const token = getStoredToken();
            
            // CORREGIDO: Agregar la barra diagonal antes del comparacionId
            const url = buildApiUrl(`${API_ENDPOINTS.MOSTRAR_RESULTADOS_EFICIENCIA_INDIVIDUAL}${comparacionId}/`);
            console.log('URL Eficiencia:', url); // Debug
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response Eficiencia Status:', response.status); // Debug

            if (!response.ok) {
                const errorData = await response.json();
                // Si no hay datos, no es un error crítico
                if (response.status === 404) {
                    console.log('No hay datos de eficiencia para esta comparación');
                    return;
                }
                throw new Error(errorData.error || 'Error al cargar análisis de eficiencia');
            }

            const data = await response.json();
            console.log('Datos de eficiencia recibidos:', data); // Debug
            
            if (data.resultados && data.resultados.length > 0) {
                setEficienciaData(data.resultados);
            }

        } catch (error) {
            console.error('Error al cargar análisis de eficiencia:', error);
            // No mostramos notificación de error para mantener la experiencia fluida
        } finally {
            setLoadingEficiencia(false);
        }
    };

    const fetchComentarios = async () => {
        try {
            setLoadingComentarios(true);
            const token = getStoredToken();
            
            // CORREGIDO: Agregar la barra diagonal antes del comparacionId
            const url = buildApiUrl(`${API_ENDPOINTS.MOSTRAR_COMENTARIOS_EFICIENCIA_INDIVIDUAL}${comparacionId}/`);
            console.log('URL Comentarios:', url); // Debug
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response Comentarios Status:', response.status); // Debug

            if (!response.ok) {
                const errorData = await response.json();
                // Si no hay datos, no es un error crítico
                if (response.status === 404) {
                    console.log('No hay comentarios de eficiencia para esta comparación');
                    return;
                }
                throw new Error(errorData.error || 'Error al cargar comentarios');
            }

            const data = await response.json();
            console.log('Comentarios recibidos:', data); // Debug
            
            if (data.comentarios && data.comentarios.length > 0) {
                setComentariosData(data.comentarios);
            }

        } catch (error) {
            console.error('Error al cargar comentarios:', error);
            // No mostramos notificación de error para mantener la experiencia fluida
        } finally {
            setLoadingComentarios(false);
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

            {/* Nuevo componente de análisis de eficiencia */}
            <MostrarAnalisisEficienciaIndividual 
                eficienciaData={eficienciaData}
                comentariosData={comentariosData}
                loading={loadingEficiencia || loadingComentarios}
            />
        </div>
    );
};

export default ComparisonDetailView;