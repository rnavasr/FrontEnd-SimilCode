import React from 'react';
import { Layout, Typography, Button, Card, Space, Divider } from 'antd';
import { ArrowLeftOutlined, UserOutlined, BellOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

const SettingsView = ({ userProfile, onBack }) => {
    return (
        <Layout style={{ 
            minHeight: '100vh', 
            background: '#1a1a1a',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000
        }}>
            <Content style={{
                padding: '40px 80px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        style={{
                            background: 'transparent',
                            border: '1px solid #3d3d3d',
                            color: '#a0a0a0',
                            height: '36px',
                            borderRadius: '6px',
                            marginBottom: '24px'
                        }}
                    >
                        Volver
                    </Button>
                    
                    <Title 
                        level={1} 
                        style={{ 
                            color: '#e8e8e8', 
                            margin: 0,
                            fontSize: '36px',
                            fontFamily: "'Playfair Display', 'Georgia', serif"
                        }}
                    >
                        Configuraciones
                    </Title>
                    <Text style={{ color: '#a0a0a0', fontSize: '14px' }}>
                        Administra tu cuenta y preferencias
                    </Text>
                </div>

                {/* Secciones de configuración */}
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Perfil */}
                    <Card
                        style={{
                            background: '#242424',
                            border: '1px solid #2d2d2d',
                            borderRadius: '12px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <UserOutlined style={{ fontSize: '20px', color: '#5ebd8f' }} />
                            <Title level={4} style={{ color: '#e8e8e8', margin: 0 }}>
                                Información del Perfil
                            </Title>
                        </div>
                        <Divider style={{ borderColor: '#3d3d3d', margin: '16px 0' }} />
                        
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div>
                                <Text style={{ color: '#a0a0a0', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                                    Nombre
                                </Text>
                                <Text style={{ color: '#e8e8e8', fontSize: '15px' }}>
                                    {userProfile.nombres}
                                </Text>
                            </div>
                            
                            <div>
                                <Text style={{ color: '#a0a0a0', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                                    Correo electrónico
                                </Text>
                                <Text style={{ color: '#e8e8e8', fontSize: '15px' }}>
                                    {userProfile.correo_electronico}
                                </Text>
                            </div>

                            <div>
                                <Text style={{ color: '#a0a0a0', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                                    Rol
                                </Text>
                                <Text style={{ color: '#e8e8e8', fontSize: '15px' }}>
                                    {userProfile.rol === 'docente' ? 'Docente' : 'Usuario'}
                                </Text>
                            </div>
                        </Space>
                    </Card>

                    {/* Notificaciones */}
                    <Card
                        style={{
                            background: '#242424',
                            border: '1px solid #2d2d2d',
                            borderRadius: '12px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <BellOutlined style={{ fontSize: '20px', color: '#5ebd8f' }} />
                            <Title level={4} style={{ color: '#e8e8e8', margin: 0 }}>
                                Notificaciones
                            </Title>
                        </div>
                        <Divider style={{ borderColor: '#3d3d3d', margin: '16px 0' }} />
                        <Text style={{ color: '#a0a0a0', fontSize: '14px' }}>
                            Próximamente podrás configurar tus preferencias de notificaciones
                        </Text>
                    </Card>

                    {/* Seguridad */}
                    <Card
                        style={{
                            background: '#242424',
                            border: '1px solid #2d2d2d',
                            borderRadius: '12px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <LockOutlined style={{ fontSize: '20px', color: '#5ebd8f' }} />
                            <Title level={4} style={{ color: '#e8e8e8', margin: 0 }}>
                                Seguridad y Privacidad
                            </Title>
                        </div>
                        <Divider style={{ borderColor: '#3d3d3d', margin: '16px 0' }} />
                        <Text style={{ color: '#a0a0a0', fontSize: '14px' }}>
                            Gestiona la seguridad de tu cuenta y preferencias de privacidad
                        </Text>
                    </Card>

                    {/* Preferencias */}
                    <Card
                        style={{
                            background: '#242424',
                            border: '1px solid #2d2d2d',
                            borderRadius: '12px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <GlobalOutlined style={{ fontSize: '20px', color: '#5ebd8f' }} />
                            <Title level={4} style={{ color: '#e8e8e8', margin: 0 }}>
                                Preferencias Generales
                            </Title>
                        </div>
                        <Divider style={{ borderColor: '#3d3d3d', margin: '16px 0' }} />
                        <Text style={{ color: '#a0a0a0', fontSize: '14px' }}>
                            Personaliza tu experiencia en la plataforma
                        </Text>
                    </Card>
                </Space>
            </Content>
        </Layout>
    );
};

export default SettingsView;