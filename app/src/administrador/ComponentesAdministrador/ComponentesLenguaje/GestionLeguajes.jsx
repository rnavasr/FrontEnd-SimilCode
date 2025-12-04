import React, { useState, useEffect } from 'react';
import {
    Button,
    message,
    Modal,
    Form,
    Input,
    Switch,
    Spin
} from 'antd';
import {
    ArrowLeftOutlined,
    PlusOutlined,
    EditOutlined
} from '@ant-design/icons';
import { API_ENDPOINTS, getStoredToken, buildApiUrl } from '../../../../config';

import '../../Estilos/ComponenteGestionLeguajes/GestionLenguajes.css';

const GestionLenguajes = ({ onVolver, userProfile }) => {
    const [lenguajes, setLenguajes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingLenguaje, setEditingLenguaje] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchLenguajes();
    }, []);

    const fetchLenguajes = async () => {
        setLoading(true);
        try {
            const token = getStoredToken();
            
            if (!token) {
                message.error('No hay token de autenticación');
                setLoading(false);
                return;
            }

            // Obtener usuario_id del userProfile o del localStorage
            const usuarioId = userProfile?.usuario_id || 
                             JSON.parse(localStorage.getItem('userProfile') || '{}').usuario_id;

            if (!usuarioId) {
                message.error('No se pudo obtener el ID de usuario');
                setLoading(false);
                return;
            }

            // Construir URL: /app/administrador/listar_lenguajes/{usuario_id}
            const url = buildApiUrl(`${API_ENDPOINTS.LISTAR_LENGUAJE_ADMIN}/${usuarioId}/`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Lenguajes cargados:', data);
                setLenguajes(data.lenguajes || []);
            } else {
                const errorData = await response.json();
                message.error(errorData.error || 'Error al cargar lenguajes');
            }
        } catch (error) {
            console.error('Error al cargar lenguajes:', error);
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

    const handleCrearLenguaje = () => {
        setEditingLenguaje(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditarLenguaje = (lenguaje) => {
        setEditingLenguaje(lenguaje);
        form.setFieldsValue({
            nombre: lenguaje.nombre,
            extension: lenguaje.extension
        });
        setModalVisible(true);
    };

    const handleToggleActivo = async (lenguaje) => {
        try {
            const token = getStoredToken();
            
            if (!token) {
                message.error('No hay token de autenticación');
                return;
            }

            // Construir URL: /app/administrador/cambiar_estado_lenguaje/{lenguaje_id}/
            const url = buildApiUrl(`${API_ENDPOINTS.CAMBIAR_ESTADO_LENGUAJE_ADMIN}/${lenguaje.id}/`);

            const response = await fetch(url, {
                method: 'PUT', // Cambiar a PUT para que coincida con el log
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                message.success(data.mensaje || 'Estado actualizado exitosamente');
                
                // Actualizar el estado local inmediatamente
                setLenguajes(lenguajes.map(lang => 
                    lang.id === lenguaje.id 
                        ? { ...lang, estado: !lang.estado } 
                        : lang
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

    const handleSubmit = async (values) => {
        try {
            const token = getStoredToken();
            
            if (!token) {
                message.error('No hay token de autenticación');
                return;
            }

            // Obtener usuario_id
            const usuarioId = userProfile?.usuario_id || 
                             JSON.parse(localStorage.getItem('userProfile') || '{}').usuario_id;

            if (!usuarioId) {
                message.error('No se pudo obtener el ID de usuario');
                return;
            }

            // Crear FormData para enviar al backend
            const formData = new FormData();
            formData.append('nombre', values.nombre);
            formData.append('extension', values.extension || '');
            
            // Agregar usuario_id al crear un nuevo lenguaje
            if (!editingLenguaje) {
                formData.append('usuario_id', usuarioId);
            }

            let url, method;
            
            if (editingLenguaje) {
                // Editar lenguaje existente
                // URL: /app/administrador/editar_lenguajes/{lenguaje_id}/
                url = buildApiUrl(`${API_ENDPOINTS.EDITAR_LENGUAJE_ADMIN}/${editingLenguaje.id}/`);
                method = 'PUT'; // Cambiar a PUT
            } else {
                // Crear nuevo lenguaje
                // URL: /app/administrador/crear_lenguajes/
                url = buildApiUrl(API_ENDPOINTS.CREAR_LENGUAJE_ADMIN);
                method = 'POST';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                    // NO incluir 'Content-Type' cuando usas FormData
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                message.success(data.mensaje || 
                    (editingLenguaje ? 'Lenguaje actualizado exitosamente' : 'Lenguaje creado exitosamente'));
                
                setModalVisible(false);
                form.resetFields();
                setEditingLenguaje(null);
                
                // Recargar la lista de lenguajes
                fetchLenguajes();
            } else {
                const errorData = await response.json();
                message.error(errorData.error || 'Error al guardar el lenguaje');
            }
        } catch (error) {
            console.error('Error al guardar lenguaje:', error);
            message.error('Error al conectar con el servidor');
        }
    };

    return (
        <div className="gestion-lenguajes-container">
            <div className="gestion-lenguajes-content">
                {/* Botones superiores */}
                <div className="gestion-lenguajes-header">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleVolver}
                        className="btn-volver"
                    >
                        Volver
                    </Button>

                    <Button
                        icon={<PlusOutlined />}
                        onClick={handleCrearLenguaje}
                        className="btn-crear-lenguaje"
                    >
                        Crear lenguaje
                    </Button>
                </div>

                {/* Tabla de lenguajes */}
                <div className="lenguajes-table-card">
                    {loading ? (
                        <div className="lenguajes-loading">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            <div className="lenguajes-table-header">
                                <div className="table-col-nombre">Nombre lenguaje</div>
                                <div className="table-col-extension">Extensión</div>
                                <div className="table-col-acciones">Acciones</div>
                            </div>

                            <div className="lenguajes-table-body">
                                {lenguajes.length === 0 ? (
                                    <div style={{ 
                                        padding: '40px', 
                                        textAlign: 'center', 
                                        color: '#6b6b6b' 
                                    }}>
                                        No hay lenguajes registrados
                                    </div>
                                ) : (
                                    lenguajes.map((lenguaje) => (
                                        <div key={lenguaje.id} className="lenguajes-table-row">
                                            <div className="table-col-nombre">
                                                {lenguaje.nombre}
                                            </div>
                                            <div className="table-col-extension">
                                                {lenguaje.extension || 'N/A'}
                                            </div>
                                            <div className="table-col-acciones">
                                                <Button
                                                    icon={<EditOutlined />}
                                                    onClick={() => handleEditarLenguaje(lenguaje)}
                                                    className="btn-editar"
                                                    type="text"
                                                />
                                                <Switch
                                                    checked={lenguaje.estado === true || lenguaje.estado === 1}
                                                    onChange={() => handleToggleActivo(lenguaje)}
                                                    className="switch-activo"
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal para crear/editar lenguaje */}
            <Modal
                title={editingLenguaje ? 'Editar Lenguaje' : 'Crear Lenguaje'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingLenguaje(null);
                }}
                footer={null}
                className="modal-lenguaje"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Nombre del lenguaje"
                        name="nombre"
                        rules={[{ 
                            required: true, 
                            message: 'Por favor ingrese el nombre del lenguaje' 
                        }]}
                    >
                        <Input placeholder="Ej: JavaScript" />
                    </Form.Item>

                    <Form.Item
                        label="Extensión"
                        name="extension"
                        rules={[{ 
                            required: true, 
                            message: 'Por favor ingrese la extensión' 
                        }]}
                    >
                        <Input placeholder="Ej: .js" />
                    </Form.Item>

                    <Form.Item className="form-actions">
                        <Button onClick={() => {
                            setModalVisible(false);
                            form.resetFields();
                            setEditingLenguaje(null);
                        }}>
                            Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit" className="btn-submit">
                            {editingLenguaje ? 'Actualizar' : 'Crear'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default GestionLenguajes;