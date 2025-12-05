import React, { useState, useEffect } from 'react';
import {
    Button,
    message,
    Switch,
    Spin,
    Tag,
    Input,
    Pagination
} from 'antd';
import {
    ArrowLeftOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { API_ENDPOINTS, getStoredToken, buildApiUrl } from '../../../../config';

import '../../Estilos/ComponentesComparaciones/GestionComparaciones.css';

const GestionComparaciones = ({ onVolver, userProfile }) => {
    const [comparaciones, setComparaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        fetchComparaciones();
    }, []);

    const fetchComparaciones = async () => {
        setLoading(true);
        try {
            const token = getStoredToken();
            
            if (!token) {
                message.error('No hay token de autenticación');
                setLoading(false);
                return;
            }

            const url = buildApiUrl(API_ENDPOINTS.LISTAR_COMPARACIONES);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Comparaciones cargadas:', data);
                setComparaciones(data.comparaciones || []);
            } else {
                const errorData = await response.json();
                message.error(errorData.error || 'Error al cargar comparaciones');
            }
        } catch (error) {
            console.error('Error al cargar comparaciones:', error);
            message.error('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleVolver = () => {
        if (onVolver) {
            onVolver();
        }
    };

    const handleToggleEstado = async (comparacion) => {
        try {
            const token = getStoredToken();
            
            if (!token) {
                message.error('No hay token de autenticación');
                return;
            }

            const url = buildApiUrl(`${API_ENDPOINTS.CAMBIAR_ESTADO_COMPARACION}/${comparacion.id}/`);

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                message.success(data.mensaje || 'Estado actualizado exitosamente');
                
                // Actualizar el estado local
                setComparaciones(comparaciones.map(comp => 
                    comp.id === comparacion.id 
                        ? { ...comp, estado: data.estado } 
                        : comp
                ));
            } else {
                const errorData = await response.json();
                message.error(errorData.error || 'Error al cambiar el estado');
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            message.error('Error al conectar con el servidor');
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filtrar comparaciones según el término de búsqueda
    const comparacionesFiltradas = comparaciones.filter(comp => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (comp.nombre_comparacion || '').toLowerCase().includes(searchLower) ||
            (comp.nombre_usuario || '').toLowerCase().includes(searchLower) ||
            (comp.lenguaje || '').toLowerCase().includes(searchLower) ||
            (comp.modelo_ia || '').toLowerCase().includes(searchLower) ||
            (comp.estado || '').toLowerCase().includes(searchLower)
        );
    });

    // Paginación
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const comparacionesPaginadas = comparacionesFiltradas.slice(startIndex, endIndex);

    // Resetear a página 1 cuando cambia el término de búsqueda
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="gestion-comparaciones-container">
            <div className="gestion-comparaciones-content">
                {/* Header - Solo botón volver */}
                <div className="gestion-comparaciones-header">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleVolver}
                        className="btn-volver"
                    >
                        Volver
                    </Button>
                </div>

                {/* Barra de búsqueda */}
                <div className="search-container">
                    <Input
                        placeholder="Buscar en sus comparaciones..."
                        prefix={<SearchOutlined className="search-icon" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        allowClear
                    />
                </div>

                {/* Tabla */}
                <div className="comparaciones-table-card">
                    {loading ? (
                        <div className="comparaciones-loading">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="comparaciones-table-header">
                                <div className="table-col-nombre-comp">Nombre Comparación</div>
                                <div className="table-col-usuario">Usuario</div>
                                <div className="table-col-lenguaje">Lenguaje</div>
                                <div className="table-col-modelo">Modelo IA</div>
                                <div className="table-col-fecha">Fecha</div>
                                <div className="table-col-estado">Estado</div>
                            </div>

                            {/* Table Body */}
                            <div className="comparaciones-table-body">
                                {comparacionesPaginadas.length === 0 ? (
                                    <div className="tabla-vacia">
                                        {searchTerm 
                                            ? 'No se encontraron comparaciones con ese criterio de búsqueda'
                                            : 'No hay comparaciones registradas'
                                        }
                                    </div>
                                ) : (
                                    comparacionesPaginadas.map((comparacion) => (
                                        <div
                                            key={comparacion.id}
                                            className="comparaciones-table-row"
                                        >
                                            <div className="table-col-nombre-comp">
                                                {comparacion.nombre_comparacion || 'Sin nombre'}
                                            </div>

                                            <div className="table-col-usuario">
                                                {comparacion.nombre_usuario}
                                            </div>

                                            <div className="table-col-lenguaje">
                                                <Tag className="tag-lenguaje">
                                                    {comparacion.lenguaje || 'N/A'}
                                                </Tag>
                                            </div>

                                            <div className="table-col-modelo">
                                                {comparacion.modelo_ia ? comparacion.modelo_ia.split(' ')[0] : 'N/A'}
                                            </div>

                                            <div className="table-col-fecha">
                                                {formatFecha(comparacion.fecha_creacion)}
                                            </div>

                                            <div className="table-col-estado">
                                                {comparacion.estado === 'Reciente' ? (
                                                    <EyeOutlined className="icon-visible" />
                                                ) : (
                                                    <EyeInvisibleOutlined className="icon-oculto" />
                                                )}
                                                
                                                <Switch
                                                    checked={comparacion.estado === 'Reciente'}
                                                    onChange={() => handleToggleEstado(comparacion)}
                                                    className={`switch-estado ${
                                                        comparacion.estado === 'Reciente' 
                                                            ? 'switch-activo' 
                                                            : 'switch-inactivo'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Paginación */}
                            {comparacionesFiltradas.length > pageSize && (
                                <div className="pagination-container">
                                    <Pagination
                                        current={currentPage}
                                        total={comparacionesFiltradas.length}
                                        pageSize={pageSize}
                                        onChange={(page) => setCurrentPage(page)}
                                        showSizeChanger={false}
                                        showTotal={(total, range) => 
                                            `${range[0]}-${range[1]} de ${total} comparaciones`
                                        }
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Info Card */}
                {comparaciones.length > 0 && (
                    <div className="comparaciones-info-card">
                        <div className="info-total">
                            Total de comparaciones: <span className="info-valor">
                                {comparacionesFiltradas.length}
                            </span>
                            {searchTerm && comparacionesFiltradas.length !== comparaciones.length && (
                                <span className="info-filtradas">
                                    {' '}(filtradas de {comparaciones.length})
                                </span>
                            )}
                        </div>
                        <div className="info-estados">
                            Recientes: <span className="info-recientes">
                                {comparacionesFiltradas.filter(c => c.estado === 'Reciente').length}
                            </span>
                            {' | '}
                            Ocultas: <span className="info-ocultas">
                                {comparacionesFiltradas.filter(c => c.estado === 'Oculto').length}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionComparaciones;