import React, { useRef, useEffect } from 'react';
import {
    Layout,
    Typography,
    Space,
    Button,
    Divider,
    Spin
} from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    PlusOutlined,
    MessageOutlined,
    StarOutlined,
    ClockCircleOutlined,
    SearchOutlined
} from '@ant-design/icons';
import logo from '../../img/logo.png';
import ComparacionDropdownMenu from './ComparacionDropdownMenu';
import '../Estilos/Css_SideBar_Principal/CssSideBarDocente.css'

const { Sider } = Layout;
const { Title, Text } = Typography;

const DocenteSidebar = ({
    userProfile,
    comparacionesDestacadas,
    comparacionesRecientes,
    loadingComparaciones,
    onNewIndividualComparison,
    onNewGroupComparison,
    onComparacionClick,
    onMarcarDestacado,
    onMarcarReciente,
    onEliminar,
    onLogout,
    onSearchChats,
    formatFecha
}) => {
    const scrollContainerRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const handleScroll = () => {
            // Agregar clase cuando se está scrolleando
            scrollContainer.classList.add('is-scrolling');

            // Limpiar timeout anterior
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            // Remover clase después de 1 segundo de inactividad
            scrollTimeoutRef.current = setTimeout(() => {
                scrollContainer.classList.remove('is-scrolling');
            }, 1000);
        };

        scrollContainer.addEventListener('scroll', handleScroll);

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);
    const renderComparacionItem = (comparacion) => (
        <div
            key={`${comparacion.tipo}-${comparacion.id}`}
            style={{
                padding: '10px 12px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                background: 'transparent',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
            }}
            className="comparacion-item"
        >
            <div 
                onClick={() => onComparacionClick(comparacion)}
                style={{
                    flex: 1,
                    cursor: 'pointer',
                    minWidth: 0
                }}
            >
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '4px'
                }}>
                    <Text 
                        style={{ 
                            color: '#e8e8e8', 
                            fontSize: '13px',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {comparacion.nombre_comparacion}
                    </Text>
                </div>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between'
                }}>
                    <Text style={{ color: '#6b6b6b', fontSize: '11px' }}>
                        {comparacion.tipo === 'individual' ? 'Individual' : 'Grupal'}
                    </Text>
                    <Text style={{ color: '#6b6b6b', fontSize: '11px' }}>
                        {formatFecha(comparacion.fecha_creacion)}
                    </Text>
                </div>
            </div>

            <ComparacionDropdownMenu
                comparacion={comparacion}
                onMarcarDestacado={onMarcarDestacado}
                onMarcarReciente={onMarcarReciente}
                onEliminar={onEliminar}
            />
        </div>
    );

    return (
        <Sider
            width={280}
            className="docente-sidebar"
        >
            {/* HEADER FIJO */}
            <div className="sidebar-header">
                <div style={{
                    padding: '8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px'
                }}>
                    <img
                        src={logo}
                        alt="Logo"
                        style={{
                            width: '30px',
                            height: '30px',
                            objectFit: 'contain',
                            filter: 'brightness(1.1)'
                        }}
                    />
                    <Title
                        level={4}
                        style={{
                            color: '#e8e8e8',
                            margin: 0,
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            fontSize: '20px',
                            fontWeight: '500'
                        }}
                    >
                        SimilCode
                    </Title>
                </div>

                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Button
                        icon={<PlusOutlined />}
                        onClick={onNewIndividualComparison}
                        block
                        className="comparison-button"
                    >
                        Comparación individual
                    </Button>

                    <Button
                        icon={<PlusOutlined />}
                        onClick={onNewGroupComparison}
                        block
                        className="comparison-button"
                    >
                        Comparación grupal
                    </Button>
                </Space>

                <div style={{ marginTop: '22px' }}>
                    {/* Botón de Búsqueda */}
                    <Button
                        icon={<SearchOutlined style={{ color: '#6b6b6b' }} />}
                        onClick={onSearchChats}
                        block
                        style={{
                            height: '36px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: '1px solid #3d3d3d',
                            color: '#6b6b6b',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            paddingLeft: '12px',
                            marginTop: '8px',
                            transition: 'all 0.2s ease'
                        }}
                        className="search-button"
                    >
                        Buscar
                    </Button>
                </div>
            </div>

            {/* ÁREA SCROLLEABLE */}
            <div className="sidebar-content" ref={scrollContainerRef}>
                {/* Sección Destacados */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{
                        padding: '8px 12px',
                        color: '#a0a0a0',
                        fontSize: '13px',
                        fontFamily: "'Playfair Display', 'Georgia', serif",
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span>
                            <StarOutlined style={{ marginRight: '8px' }} />
                            Destacados
                        </span>
                        {loadingComparaciones && <Spin size="small" />}
                    </div>
                    {!loadingComparaciones && comparacionesDestacadas.length === 0 ? (
                        <div style={{ color: '#6b6b6b', fontSize: '13px', padding: '12px 16px' }}>
                            Sin elementos destacados
                        </div>
                    ) : (
                        <div style={{ padding: '4px 0' }}>
                            {comparacionesDestacadas.map(renderComparacionItem)}
                        </div>
                    )}
                </div>

                {/* Sección Recientes */}
                <div>
                    <div style={{
                        padding: '8px 12px',
                        color: '#a0a0a0',
                        fontSize: '13px',
                        fontFamily: "'Playfair Display', 'Georgia', serif",
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span>
                            <ClockCircleOutlined style={{ marginRight: '8px' }} />
                            Comparaciones recientes
                        </span>
                        {loadingComparaciones && <Spin size="small" />}
                    </div>
                    {!loadingComparaciones && comparacionesRecientes.length === 0 ? (
                        <div style={{ color: '#6b6b6b', fontSize: '13px', padding: '12px 16px' }}>
                            No hay comparaciones recientes
                        </div>
                    ) : (
                        <div style={{ padding: '4px 0' }}>
                            {comparacionesRecientes.map(renderComparacionItem)}
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER FIJO */}
            <div className="sidebar-footer">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Button
                        icon={<UserOutlined />}
                        block
                        style={{
                            height: '40px',
                            borderRadius: '8px',
                            background: 'transparent',
                            border: '1px solid #3d3d3d',
                            color: '#e8e8e8',
                            fontSize: '14px',
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            paddingLeft: '16px'
                        }}
                    >
                        {userProfile.usuario}
                    </Button>

                    <Button
                        icon={<LogoutOutlined />}
                        onClick={onLogout}
                        block
                        danger
                        style={{
                            height: '40px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            paddingLeft: '16px'
                        }}
                    >
                        Cerrar sesión
                    </Button>
                </Space>
            </div>
        </Sider>
    );
};

export default DocenteSidebar;