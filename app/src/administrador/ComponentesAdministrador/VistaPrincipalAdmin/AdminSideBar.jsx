import React from 'react';
import {
    Typography,
    Button,
    Layout
} from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    RobotOutlined
} from '@ant-design/icons';
import '../../Estilos/VistaPrincipalAdmin/AdminSideBar.css';
import logoImage from '../../../img/logo.png';

const { Title, Text } = Typography;
const { Sider } = Layout;

const AdminSidebar = ({ userProfile, onLogout, onChangeVista, vistaActual }) => {
    return (
        <Sider 
            className="admin-sidebar"
            width={320}
        >
            <div className="admin-sidebar-container">
                {/* Logo en la parte superior */}
                <div className="admin-sidebar-header">
                    <div className="admin-sidebar-logo-section">
                        <img
                            src={logoImage}
                            alt="SimiliCode Logo"
                            className="admin-sidebar-logo"
                        />
                        <Title level={4} className="admin-sidebar-title">
                            SimilCode
                        </Title>
                    </div>

                    {/* Sección de opciones de administración */}
                    <div className="admin-sidebar-menu">
                        <div 
                            className={`admin-menu-item ${vistaActual === 'usuarios' ? 'active' : ''}`}
                            onClick={() => onChangeVista('usuarios')}
                        >
                            <Text strong className="admin-menu-text">
                                <UserOutlined className="admin-menu-icon" />
                                Usuarios
                            </Text>
                        </div>

                        <div 
                            className={`admin-menu-item ${vistaActual === 'lenguajes' ? 'active' : ''}`}
                            onClick={() => onChangeVista('lenguajes')}
                        >
                            <Text strong className="admin-menu-text">
                                <svg 
                                    className="admin-menu-code-icon" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2"
                                >
                                    <polyline points="16 18 22 12 16 6"></polyline>
                                    <polyline points="8 6 2 12 8 18"></polyline>
                                </svg>
                                Lenguajes
                            </Text>
                        </div>
                        <div 
                            className={`admin-menu-item ${vistaActual === 'modelos' ? 'active' : ''}`}
                            onClick={() => onChangeVista('modelos')}
                        >
                            <Text strong className="admin-menu-text">
                                <RobotOutlined className="admin-menu-icon" />
                                Modelos de IA
                            </Text>
                        </div>
                    </div>
                </div>

                {/* Usuario y cerrar sesión en la parte inferior */}
                <div className="admin-sidebar-footer">
                    <div className="admin-user-button">
                        <UserOutlined className="admin-user-icon" />
                        <Text className="admin-user-name">
                            {userProfile?.nombre && userProfile?.apellido 
                                ? `${userProfile.nombre} ${userProfile.apellido}`
                                : userProfile?.nombre || 'admin'}
                        </Text>
                    </div>

                    <Button
                        icon={<LogoutOutlined />}
                        onClick={onLogout}
                        block
                        className="logout-button"
                    >
                        Cerrar sesión
                    </Button>
                </div>
            </div>
        </Sider>
    );
};

export default AdminSidebar;