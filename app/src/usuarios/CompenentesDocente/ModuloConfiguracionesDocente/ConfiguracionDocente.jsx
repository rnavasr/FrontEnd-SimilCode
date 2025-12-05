import React, { useState } from 'react';
import { Layout, Typography, Button, Card, Collapse } from 'antd';
import { 
    ArrowLeftOutlined, 
    UserOutlined, 
    LockOutlined, 
    RobotOutlined,
    CodeOutlined,
    DownOutlined
} from '@ant-design/icons';
import '../../Estilos/Css_Cofiguracion_Docente/ConfiguracionDocente.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const SettingsView = ({ userProfile, onBack }) => {
    const [activeKeys, setActiveKeys] = useState([]);

    const handleCollapseChange = (keys) => {
        setActiveKeys(keys);
    };

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
                                {/* Institución */}
                                <div className="settings-field">
                                    <Text className="settings-field-label">Institución</Text>
                                    <Text className="settings-field-value">
                                        {userProfile.institucion || 'No especificada'}
                                    </Text>
                                </div>

                                {/* Facultad/Área */}
                                <div className="settings-field">
                                    <Text className="settings-field-label">Facultad / Área</Text>
                                    <Text className="settings-field-value">
                                        {userProfile.facultad_area || 'No especificada'}
                                    </Text>
                                </div>
                            </div>

                            {/* Columna Derecha */}
                            <div className="settings-info-column">
                                {/* Nombre Completo */}
                                <div className="settings-field">
                                    <Text className="settings-field-label">Nombre Completo</Text>
                                    <Text className="settings-field-value">
                                        {`${userProfile.nombres} ${userProfile.apellidos}`}
                                    </Text>
                                </div>
                                
                                {/* Email */}
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
                                <div className="settings-placeholder">
                                    <CodeOutlined className="settings-placeholder-icon" />
                                    <Text className="settings-placeholder-text">
                                        Administra los lenguajes de programación
                                    </Text>
                                    <Text className="settings-placeholder-subtext">
                                        Funcionalidad próximamente disponible
                                    </Text>
                                </div>
                            </Panel>
                        </Collapse>
                    </div>
                </div>
            </Content>
        </Layout>
    );
};

export default SettingsView;