import React, { useState, useEffect } from 'react';
import {
    Button,
    message,
    Modal,
    Form,
    Input,
    Select,
    Switch,
    Spin,
    Tag
} from 'antd';
import {
    ArrowLeftOutlined,
    PlusOutlined,
    EditOutlined,
    StarOutlined,
    StarFilled
} from '@ant-design/icons';
import { API_ENDPOINTS, getStoredToken, buildApiUrl, buildApiUrlWithId } from '../../../../config';

import '../../Estilos/ComponenteGestionIA/GestionModelosIA.css';

const { Option } = Select;
const { TextArea } = Input;

const GestionModelos = ({ onVolver, userProfile }) => {
    const [modelos, setModelos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingModelo, setEditingModelo] = useState(null);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [form] = Form.useForm();

    // Mapeo de proveedores
    const PROVEEDORES = {
        1: { nombre: 'Claude', color: '#8B5CF6' },
        2: { nombre: 'DeepSeek', color: '#3B82F6' },
        3: { nombre: 'Gemini', color: '#10B981' },
        4: { nombre: 'OpenAI', color: '#F59E0B' }
    };

    useEffect(() => {
        fetchModelos();
    }, []);

    const fetchModelos = async () => {
        setLoading(true);
        try {
            const token = getStoredToken();
            
            if (!token) {
                message.error('No hay token de autenticación');
                setLoading(false);
                return;
            }

            const url = buildApiUrl(API_ENDPOINTS.LISTAR_MODELOS_IA);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Modelos cargados:', data);
                setModelos(data.modelos || []);
            } else {
                const errorData = await response.json();
                message.error(errorData.error || 'Error al cargar modelos');
            }
        } catch (error) {
            console.error('Error al cargar modelos:', error);
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

    const handleCrearModelo = () => {
        setEditingModelo(null);
        setProveedorSeleccionado(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditarModelo = (modelo) => {
        setEditingModelo(modelo);
        setProveedorSeleccionado(modelo.proveedor_id);
        form.setFieldsValue({
            proveedor_id: modelo.proveedor_id,
            nombre: modelo.nombre,
            version: modelo.version,
            descripcion: modelo.descripcion,
            color_ia: modelo.color_ia
        });
        setModalVisible(true);
    };

    const handleToggleActivo = async (modelo) => {
        try {
            const token = getStoredToken();
            
            if (!token) {
                message.error('No hay token de autenticación');
                return;
            }

            const url = buildApiUrlWithId(API_ENDPOINTS.CAMBIAR_ESTADO_MODELO, modelo.id);

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
                
                // Actualizar el estado local inmediatamente
                setModelos(modelos.map(mod => 
                    mod.id === modelo.id 
                        ? { ...mod, activo: !mod.activo } 
                        : mod
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

    const handleMarcarRecomendado = async (modelo) => {
        try {
            const token = getStoredToken();
            
            if (!token) {
                message.error('No hay token de autenticación');
                return;
            }

            const url = buildApiUrlWithId(API_ENDPOINTS.MARCAR_MODELO_RECOMENDADO, modelo.id);

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                message.success(data.mensaje || 'Modelo marcado como recomendado');
                
                // Actualizar el estado local: desmarcar todos y marcar el seleccionado
                setModelos(modelos.map(mod => ({
                    ...mod,
                    recomendado: mod.id === modelo.id
                })));
            } else {
                const errorData = await response.json();
                message.error(errorData.error || 'Error al marcar como recomendado');
            }
        } catch (error) {
            console.error('Error al marcar recomendado:', error);
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

            const usuarioId = userProfile?.usuario_id || 
                             JSON.parse(localStorage.getItem('userProfile') || '{}').usuario_id;

            if (!usuarioId) {
                message.error('No se pudo obtener el ID de usuario');
                return;
            }

            // Crear FormData
            const formData = new FormData();
            formData.append('nombre', values.nombre);
            formData.append('version', values.version || '');
            formData.append('descripcion', values.descripcion || '');
            formData.append('color_ia', values.color_ia || '');
            formData.append('usuario_id', usuarioId);

            // Campos de configuración (según el proveedor)
            formData.append('endpoint_url', values.endpoint_url || '');
            formData.append('api_key', values.api_key || '');
            formData.append('model_name', values.model_name || '');
            formData.append('max_tokens', values.max_tokens || '');

            // Campos específicos según proveedor
            if (values.proveedor_id === 1) {
                // Claude
                formData.append('anthropic_version', values.anthropic_version || '');
            } else {
                // OpenAI, Gemini, DeepSeek
                formData.append('temperature', values.temperature || '');
            }

            let url, method;
            
            if (editingModelo) {
                // Editar modelo existente
                const endpoints = {
                    1: API_ENDPOINTS.EDITAR_MODELO_CLAUDE,
                    2: API_ENDPOINTS.EDITAR_MODELO_DEEPSEEK,
                    3: API_ENDPOINTS.EDITAR_MODELO_GEMINI,
                    4: API_ENDPOINTS.EDITAR_MODELO_OPENAI
                };
                url = buildApiUrlWithId(endpoints[editingModelo.proveedor_id], editingModelo.id);
                method = 'PUT';
            } else {
                // Crear nuevo modelo
                const endpoints = {
                    1: API_ENDPOINTS.CREAR_MODELO_CLAUDE,
                    2: API_ENDPOINTS.CREAR_MODELO_DEEPSEEK,
                    3: API_ENDPOINTS.CREAR_MODELO_GEMINI,
                    4: API_ENDPOINTS.CREAR_MODELO_OPENAI
                };
                url = buildApiUrl(endpoints[values.proveedor_id]);
                method = 'POST';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                message.success(data.mensaje || 
                    (editingModelo ? 'Modelo actualizado exitosamente' : 'Modelo creado exitosamente'));
                
                setModalVisible(false);
                form.resetFields();
                setEditingModelo(null);
                setProveedorSeleccionado(null);
                
                fetchModelos();
            } else {
                const errorData = await response.json();
                message.error(errorData.error || 'Error al guardar el modelo');
            }
        } catch (error) {
            console.error('Error al guardar modelo:', error);
            message.error('Error al conectar con el servidor');
        }
    };

    return (
        <div className="gestion-modelos-container">
            <div className="gestion-modelos-content">
                {/* Botones superiores */}
                <div className="gestion-modelos-header">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleVolver}
                        className="btn-volver"
                    >
                        Volver
                    </Button>

                    <Button
                        icon={<PlusOutlined />}
                        onClick={handleCrearModelo}
                        className="btn-crear-modelo"
                    >
                        Crear modelo
                    </Button>
                </div>

                {/* Tabla de modelos */}
                <div className="modelos-table-card">
                    {loading ? (
                        <div className="modelos-loading">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            <div className="modelos-table-header">
                                <div className="table-col-nombre">Nombre Modelo</div>
                                <div className="table-col-proveedor">Proveedor</div>
                                <div className="table-col-version">Versión</div>
                                <div className="table-col-acciones">Acciones</div>
                            </div>

                            <div className="modelos-table-body">
                                {modelos.length === 0 ? (
                                    <div style={{ 
                                        padding: '40px', 
                                        textAlign: 'center', 
                                        color: '#6b6b6b' 
                                    }}>
                                        No hay modelos registrados
                                    </div>
                                ) : (
                                    modelos.map((modelo) => (
                                        <div key={modelo.id} className="modelos-table-row">
                                            <div className="table-col-nombre">
                                                {modelo.nombre}
                                                {modelo.recomendado && (
                                                    <Tag color="gold" style={{ marginLeft: 8 }}>
                                                        Recomendado
                                                    </Tag>
                                                )}
                                            </div>
                                            <div className="table-col-proveedor">
                                                <Tag color={PROVEEDORES[modelo.proveedor_id]?.color}>
                                                    {PROVEEDORES[modelo.proveedor_id]?.nombre || 'N/A'}
                                                </Tag>
                                            </div>
                                            <div className="table-col-version">
                                                {modelo.version || 'N/A'}
                                            </div>
                                            <div className="table-col-acciones">
                                                <Button
                                                    icon={<EditOutlined />}
                                                    onClick={() => handleEditarModelo(modelo)}
                                                    className="btn-editar"
                                                    type="text"
                                                />
                                                <Button
                                                    icon={modelo.recomendado ? <StarFilled /> : <StarOutlined />}
                                                    onClick={() => handleMarcarRecomendado(modelo)}
                                                    className="btn-recomendado"
                                                    type="text"
                                                    style={{ color: modelo.recomendado ? '#fadb14' : undefined }}
                                                />
                                                <Switch
                                                    checked={modelo.activo === true || modelo.activo === 1}
                                                    onChange={() => handleToggleActivo(modelo)}
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

            {/* Modal para crear/editar modelo */}
            <Modal
                title={editingModelo ? 'Editar Modelo' : 'Crear Modelo'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingModelo(null);
                    setProveedorSeleccionado(null);
                }}
                footer={null}
                className="modal-modelo"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    onValuesChange={(changedValues) => {
                        if (changedValues.proveedor_id) {
                            setProveedorSeleccionado(changedValues.proveedor_id);
                        }
                    }}
                >
                    <Form.Item
                        label="Proveedor"
                        name="proveedor_id"
                        rules={[{ 
                            required: true, 
                            message: 'Por favor seleccione el proveedor' 
                        }]}
                    >
                        <Select 
                            placeholder="Seleccione un proveedor"
                            disabled={!!editingModelo}
                        >
                            <Option value={1}>Claude</Option>
                            <Option value={2}>DeepSeek</Option>
                            <Option value={3}>Gemini</Option>
                            <Option value={4}>OpenAI</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Nombre del modelo"
                        name="nombre"
                        rules={[{ 
                            required: true, 
                            message: 'Por favor ingrese el nombre del modelo' 
                        }]}
                    >
                        <Input placeholder="Ej: Claude 3.5 Sonnet" />
                    </Form.Item>

                    <Form.Item
                        label="Versión"
                        name="version"
                    >
                        <Input placeholder="Ej: v1.0" />
                    </Form.Item>

                    <Form.Item
                        label="Descripción"
                        name="descripcion"
                    >
                        <TextArea 
                            rows={3} 
                            placeholder="Descripción del modelo" 
                        />
                    </Form.Item>

                    <Form.Item
                        label="Color (hex)"
                        name="color_ia"
                    >
                        <Input placeholder="Ej: #8B5CF6" />
                    </Form.Item>

                    {/* Configuración del modelo - Solo si hay proveedor seleccionado */}
                    {proveedorSeleccionado && (
                        <div style={{ 
                            background: '#f5f5f5', 
                            padding: '16px', 
                            borderRadius: '8px',
                            marginBottom: '16px'
                        }}>
                            <h4 style={{ marginBottom: '16px' }}>
                                Configuración de {PROVEEDORES[proveedorSeleccionado]?.nombre}
                            </h4>

                            {/* Campos comunes a todos los proveedores */}
                            <Form.Item
                                label="Endpoint URL"
                                name="endpoint_url"
                                rules={[{ 
                                    required: !editingModelo, 
                                    message: 'Por favor ingrese el endpoint' 
                                }]}
                            >
                                <Input placeholder="https://api.example.com/v1" />
                            </Form.Item>

                            <Form.Item
                                label="API Key"
                                name="api_key"
                                rules={[{ 
                                    required: !editingModelo, 
                                    message: 'Por favor ingrese la API key' 
                                }]}
                            >
                                <Input.Password placeholder="sk-..." />
                            </Form.Item>

                            <Form.Item
                                label="Model Name"
                                name="model_name"
                                rules={[{ 
                                    required: !editingModelo, 
                                    message: 'Por favor ingrese el model name' 
                                }]}
                            >
                                <Input placeholder={
                                    proveedorSeleccionado === 1 ? "claude-3-5-sonnet-20241022" :
                                    proveedorSeleccionado === 2 ? "deepseek-chat" :
                                    proveedorSeleccionado === 3 ? "gemini-pro" :
                                    "gpt-4"
                                } />
                            </Form.Item>

                            <Form.Item
                                label="Max Tokens"
                                name="max_tokens"
                            >
                                <Input type="number" placeholder="4096" />
                            </Form.Item>

                            {/* Campo específico de Claude */}
                            {proveedorSeleccionado === 1 && (
                                <Form.Item
                                    label="Anthropic Version"
                                    name="anthropic_version"
                                    tooltip="Versión de la API de Anthropic"
                                >
                                    <Input placeholder="2023-06-01" />
                                </Form.Item>
                            )}

                            {/* Campo específico de DeepSeek, Gemini y OpenAI */}
                            {(proveedorSeleccionado === 2 || proveedorSeleccionado === 3 || proveedorSeleccionado === 4) && (
                                <Form.Item
                                    label="Temperature"
                                    name="temperature"
                                    tooltip="Controla la aleatoriedad (0.0 - 2.0)"
                                >
                                    <Input 
                                        type="number" 
                                        step="0.1" 
                                        min="0" 
                                        max="2" 
                                        placeholder="0.7" 
                                    />
                                </Form.Item>
                            )}
                        </div>
                    )}

                    {/* Mensaje si no hay proveedor seleccionado */}
                    {!proveedorSeleccionado && (
                        <div style={{
                            background: '#fff7e6',
                            border: '1px solid #ffd591',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            textAlign: 'center',
                            color: '#d46b08'
                        }}>
                            ⚠️ Selecciona un proveedor para ver los campos de configuración
                        </div>
                    )}

                    <Form.Item className="form-actions">
                        <Button onClick={() => {
                            setModalVisible(false);
                            form.resetFields();
                            setEditingModelo(null);
                            setProveedorSeleccionado(null);
                        }}>
                            Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit" className="btn-submit">
                            {editingModelo ? 'Actualizar' : 'Crear'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default GestionModelos;