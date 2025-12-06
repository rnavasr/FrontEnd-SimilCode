import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Card, Collapse, Table, Modal, Input, Form, Switch, message, Space } from 'antd';
import {
    ArrowLeftOutlined,
    UserOutlined,
    LockOutlined,
    RobotOutlined,
    CodeOutlined,
    DownOutlined,
    PlusOutlined,
    EditOutlined,
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    EyeInvisibleOutlined
} from '@ant-design/icons';
import { API_ENDPOINTS, getWithAuth, buildApiUrl, getStoredToken } from '../../../../config';
import '../../Estilos/Css_Cofiguracion_Docente/ConfiguracionDocente.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const SettingsView = ({ userProfile, onBack }) => {
    const [activeKeys, setActiveKeys] = useState([]);
    const [lenguajes, setLenguajes] = useState([]);
    const [loadingLenguajes, setLoadingLenguajes] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingLenguaje, setEditingLenguaje] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if (activeKeys.includes('3')) {
            fetchLenguajes();
        }
    }, [activeKeys]);

    const fetchLenguajes = async () => {
        setLoadingLenguajes(true);
        try {
            const token = getStoredToken();
            const response = await getWithAuth(API_ENDPOINTS.LISTAR_LENGUAJES_DOCENTE, token);
            setLenguajes(response.lenguajes || []);
        } catch (error) {
            message.error('Error al cargar lenguajes: ' + error.message);
        } finally {
            setLoadingLenguajes(false);
        }
    };

    const handleCollapseChange = (keys) => {
        setActiveKeys(keys);
    };

    const handleCreateLenguaje = () => {
        setEditingLenguaje(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditLenguaje = (lenguaje) => {
        setEditingLenguaje(lenguaje);
        form.setFieldsValue({
            nombre: lenguaje.nombre,
            extension: lenguaje.extension
        });
        setModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const token = getStoredToken();

            const formData = new FormData();
            formData.append('nombre', values.nombre);
            formData.append('extension', values.extension || '');

            let url;

            if (editingLenguaje) {
                url = `${API_ENDPOINTS.EDITAR_LENGUAJE_DOCENTE}/${editingLenguaje.id}/`;
            } else {
                url = API_ENDPOINTS.CREAR_LENGUAJE_DOCENTE;
            }

            const response = await fetch(buildApiUrl(url), {
                method: editingLenguaje ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                message.success(data.mensaje || 'Operación exitosa');
                setModalVisible(false);
                form.resetFields();
                fetchLenguajes();
            } else {
                message.error(data.error || 'Error en la operación');
            }
        } catch (error) {
            if (error.errorFields) {
                message.error('Por favor completa todos los campos requeridos');
            } else {
                message.error('Error: ' + error.message);
            }
        }
    };

    const handleCambiarEstado = async (lenguaje) => {
        try {
            const token = getStoredToken();
            const url = `${API_ENDPOINTS.CAMBIAR_ESTADO_LENGUAJE_DOCENTE}/${lenguaje.id}/`;

            const response = await fetch(buildApiUrl(url), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                message.success(data.mensaje || 'Estado actualizado');
                fetchLenguajes();
            } else {
                message.error(data.error || 'Error al cambiar estado');
            }
        } catch (error) {
            message.error('Error: ' + error.message);
        }
    };

    const columns = [
        {
            title: 'NOMBRE LENGUAJE',
            dataIndex: 'nombre',
            key: 'nombre',
            render: (text) => <Text strong style={{ color: '#e8e8e8' }}>{text}</Text>
        },
        {
            title: 'EXTENSIÓN',
            dataIndex: 'extension',
            key: 'extension',
            render: (text) => (
                <Text style={{ color: '#a0a0a0', fontFamily: 'monospace' }}>
                    {text || 'N/A'}
                </Text>
            )
        },
        {
            title: 'ACCIONES',
            key: 'acciones',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditLenguaje(record)}
                        className="settings-action-button"
                    />
                    {record.estado ? (
                        <EyeOutlined style={{ fontSize: '20px', color: '#5ebd8f' }} />
                    ) : (
                        <EyeInvisibleOutlined style={{ fontSize: '20px', color: '#707070' }} />
                    )}
                    <Switch
                        checked={record.estado === true || record.estado === 1}
                        onChange={() => handleCambiarEstado(record)}
                    />
                </Space>
            )
        }
    ];

    return (
        <Layout className="settings-view-layout">
            <Content className="settings-view-content">
                {/* Header */}
                <div className="settings-header">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        className="settings-back-button"
                    >
                        Volver
                    </Button>

                    <div className="settings-header-text">
                        <Title level={1} className="settings-title">
                            Configuraciones
                        </Title>
                        <Text className="settings-subtitle">
                            Administra tu cuenta y preferencias
                        </Text>
                    </div>
                </div>

                {/* Grid de configuraciones */}
                <div className="settings-grid">
                    {/* PERFIL DE USUARIO */}
                    <Card className="settings-card settings-card-profile">
                        <div className="settings-card-header">
                            <div className="settings-card-icon-wrapper">
                                <UserOutlined className="settings-card-icon" />
                            </div>
                            <Title level={4} className="settings-card-title">
                                Información del Perfil
                            </Title>
                        </div>

                        <div className="settings-card-divider" />

                        <div className="settings-info-grid">
                            {/* Columna Izquierda */}
                            <div className="settings-info-column">
                                <div className="settings-field">
                                    <Text className="settings-field-label">Institución</Text>
                                    <Text className="settings-field-value">
                                        {userProfile.institucion || 'No especificada'}
                                    </Text>
                                </div>
                                <div className="settings-field">
                                    <Text className="settings-field-label">Facultad / Área</Text>
                                    <Text className="settings-field-value">
                                        {userProfile.facultad_area || 'No especificada'}
                                    </Text>
                                </div>
                            </div>

                            {/* Columna Derecha */}
                            <div className="settings-info-column">
                                <div className="settings-field">
                                    <Text className="settings-field-label">Nombre Completo</Text>
                                    <Text className="settings-field-value">
                                        {`${userProfile.nombres} ${userProfile.apellidos}`}
                                    </Text>
                                </div>
                                <div className="settings-field">
                                    <Text className="settings-field-label">Correo electrónico</Text>
                                    <Text className="settings-field-value">
                                        {userProfile.email || 'No especificado'}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* COLLAPSE SECTIONS */}
                    <div className="settings-collapse-container">
                        <Collapse
                            ghost
                            activeKey={activeKeys}
                            onChange={handleCollapseChange}
                            expandIconPosition="end"
                            expandIcon={({ isActive }) => (
                                <DownOutlined
                                    className="settings-collapse-arrow"
                                    rotate={isActive ? 180 : 0}
                                />
                            )}
                        >
                            {/* SEGURIDAD */}
                            <Panel
                                header={
                                    <div className="settings-collapse-header">
                                        <div className="settings-card-icon-wrapper">
                                            <LockOutlined className="settings-card-icon" />
                                        </div>
                                        <Title level={4} className="settings-card-title">
                                            Seguridad
                                        </Title>
                                    </div>
                                }
                                key="1"
                                className="settings-collapse-panel"
                            >
                                <div className="settings-placeholder">
                                    <LockOutlined className="settings-placeholder-icon" />
                                    <Text className="settings-placeholder-text">
                                        Aquí podrás cambiar tu contraseña
                                    </Text>
                                    <Text className="settings-placeholder-subtext">
                                        Funcionalidad próximamente disponible
                                    </Text>
                                </div>
                            </Panel>

                            {/* MODELOS IA */}
                            <Panel
                                header={
                                    <div className="settings-collapse-header">
                                        <div className="settings-card-icon-wrapper">
                                            <RobotOutlined className="settings-card-icon" />
                                        </div>
                                        <Title level={4} className="settings-card-title">
                                            Modelos de IA
                                        </Title>
                                    </div>
                                }
                                key="2"
                                className="settings-collapse-panel"
                            >
                                <div className="settings-placeholder">
                                    <RobotOutlined className="settings-placeholder-icon" />
                                    <Text className="settings-placeholder-text">
                                        Gestiona tus modelos de inteligencia artificial
                                    </Text>
                                    <Text className="settings-placeholder-subtext">
                                        Funcionalidad próximamente disponible
                                    </Text>
                                </div>
                            </Panel>

                            {/* LENGUAJES */}
                            <Panel
                                header={
                                    <div className="settings-collapse-header">
                                        <div className="settings-card-icon-wrapper">
                                            <CodeOutlined className="settings-card-icon" />
                                        </div>
                                        <Title level={4} className="settings-card-title">
                                            Lenguajes de Programación
                                        </Title>
                                    </div>
                                }
                                key="3"
                                className="settings-collapse-panel"
                            >
                                <div className="settings-lenguajes-content">
                                    <div className="settings-lenguajes-header">
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={handleCreateLenguaje}
                                            className="settings-add-button"
                                        >
                                            Crear lenguaje
                                        </Button>
                                    </div>

                                    <Table
                                        columns={columns}
                                        dataSource={lenguajes}
                                        loading={loadingLenguajes}
                                        rowKey="id"
                                        pagination={{
                                            pageSize: 5,
                                            showSizeChanger: false
                                        }}
                                        locale={{
                                            emptyText: 'No tienes lenguajes registrados'
                                        }}
                                        className="settings-table"
                                    />
                                </div>
                            </Panel>
                        </Collapse>
                    </div>
                </div>

                {/* Modal para Crear/Editar */}
                <Modal
                    title={
                        <span style={{ color: '#e8e8e8', fontSize: '18px', fontWeight: 600 }}>
                            {editingLenguaje ? 'Editar Lenguaje' : 'Nuevo Lenguaje'}
                        </span>
                    }
                    open={modalVisible}
                    onOk={handleModalOk}
                    onCancel={() => {
                        setModalVisible(false);
                        form.resetFields();
                    }}
                    okText={editingLenguaje ? 'Guardar' : 'Crear'}
                    cancelText="Cancelar"
                    className="settings-modal"
                    okButtonProps={{
                        className: 'settings-modal-ok-button'
                    }}
                    cancelButtonProps={{
                        className: 'settings-modal-cancel-button'
                    }}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        className="settings-form"
                    >
                        <Form.Item
                            name="nombre"
                            label={<span style={{ color: '#a0a0a0' }}>Nombre del Lenguaje</span>}
                            rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
                        >
                            <Input
                                placeholder="Ej: Python, JavaScript, Java"
                                className="settings-input"
                            />
                        </Form.Item>

                        <Form.Item
                            name="extension"
                            label={<span style={{ color: '#a0a0a0' }}>Extensión de Archivo</span>}
                        >
                            <Input
                                placeholder="Ej: .py, .js, .java"
                                className="settings-input"
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
};

export default SettingsView;