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

import '../../Estilos/ComponenteGestionLeguajes/GestionLenguajes.css';

const GestionLenguajes = ({ onVolver }) => {
    const [lenguajes, setLenguajes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingLenguaje, setEditingLenguaje] = useState(null);
    const [form] = Form.useForm();

    // Datos de ejemplo - Reemplazar con llamada a API
    useEffect(() => {
        fetchLenguajes();
    }, []);

    const fetchLenguajes = async () => {
        setLoading(true);
        // Simular llamada a API
        setTimeout(() => {
            setLenguajes([
                { id: 1, nombre: 'JavaScript', extension: '.js', activo: true },
                { id: 2, nombre: 'Python', extension: '.py', activo: true },
                { id: 3, nombre: 'Java', extension: '.java', activo: false },
                { id: 4, nombre: 'C++', extension: '.cpp', activo: true },
            ]);
            setLoading(false);
        }, 500);
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
        form.setFieldsValue(lenguaje);
        setModalVisible(true);
    };

    const handleToggleActivo = (id, currentState) => {
        setLenguajes(lenguajes.map(lang => 
            lang.id === id ? { ...lang, activo: !currentState } : lang
        ));
        message.success(`Lenguaje ${!currentState ? 'activado' : 'desactivado'} exitosamente`);
    };

    const handleSubmit = async (values) => {
        try {
            if (editingLenguaje) {
                // Actualizar lenguaje existente
                setLenguajes(lenguajes.map(lang => 
                    lang.id === editingLenguaje.id ? { ...lang, ...values } : lang
                ));
                message.success('Lenguaje actualizado exitosamente');
            } else {
                // Crear nuevo lenguaje
                const nuevoLenguaje = {
                    id: lenguajes.length + 1,
                    ...values,
                    activo: true
                };
                setLenguajes([...lenguajes, nuevoLenguaje]);
                message.success('Lenguaje creado exitosamente');
            }
            setModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Error al guardar el lenguaje');
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
                                <div className="table-col-nombre">Nombre leguaje</div>
                                <div className="table-col-extension">Extensión</div>
                                <div className="table-col-acciones">Acciones</div>
                            </div>

                            <div className="lenguajes-table-body">
                                {lenguajes.map((lenguaje) => (
                                    <div key={lenguaje.id} className="lenguajes-table-row">
                                        <div className="table-col-nombre">
                                            {lenguaje.nombre}
                                        </div>
                                        <div className="table-col-extension">
                                            {lenguaje.extension}
                                        </div>
                                        <div className="table-col-acciones">
                                            <Button
                                                icon={<EditOutlined />}
                                                onClick={() => handleEditarLenguaje(lenguaje)}
                                                className="btn-editar"
                                                type="text"
                                            />
                                            <Switch
                                                checked={lenguaje.activo}
                                                onChange={() => handleToggleActivo(lenguaje.id, lenguaje.activo)}
                                                className="switch-activo"
                                            />
                                        </div>
                                    </div>
                                ))}
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
                        rules={[{ required: true, message: 'Por favor ingrese el nombre del lenguaje' }]}
                    >
                        <Input placeholder="Ej: JavaScript" />
                    </Form.Item>

                    <Form.Item
                        label="Extensión"
                        name="extension"
                        rules={[{ required: true, message: 'Por favor ingrese la extensión' }]}
                    >
                        <Input placeholder="Ej: .js" />
                    </Form.Item>

                    <Form.Item className="form-actions">
                        <Button onClick={() => setModalVisible(false)}>
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