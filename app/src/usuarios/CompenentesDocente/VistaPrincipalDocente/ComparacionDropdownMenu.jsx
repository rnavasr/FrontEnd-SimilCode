import React from 'react';
import { Button, Dropdown } from 'antd';
import {
    MoreOutlined,
    StarOutlined,
    ClockCircleOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const ComparacionDropdownMenu = ({
    comparacion,
    onMarcarDestacado,
    onMarcarReciente,
    onEliminar
}) => {
    const esDestacado = comparacion.estado && comparacion.estado.toLowerCase() === 'destacado';

    const getMenuItems = () => {
        if (esDestacado) {
            return [
                {
                    key: 'reciente',
                    label: (
                        <div 
                            className="menu-item-reciente"
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                padding: '4px 0',
                                color: '#e8e8e8'
                            }}
                        >
                            <ClockCircleOutlined style={{ fontSize: '14px', color: '#6b6b6b' }} />
                            <span>Quitar de Destacados</span>
                        </div>
                    ),
                    onClick: () => onMarcarReciente(comparacion)
                },
                {
                    type: 'divider'
                },
                {
                    key: 'eliminar',
                    label: (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '4px 0',
                            color: '#ff6b6b'
                        }}>
                            <DeleteOutlined style={{ fontSize: '14px' }} />
                            <span>Eliminar</span>
                        </div>
                    ),
                    onClick: () => onEliminar(comparacion)
                }
            ];
        } else {
            return [
                {
                    key: 'destacar',
                    label: (
                        <div 
                            className="menu-item-destacar"
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                padding: '4px 0',
                                color: '#e8e8e8'
                            }}
                        >
                            <StarOutlined style={{ fontSize: '14px', color: '#6b6b6b' }} />
                            <span>Destacar</span>
                        </div>
                    ),
                    onClick: () => onMarcarDestacado(comparacion)
                },
                {
                    type: 'divider'
                },
                {
                    key: 'eliminar',
                    label: (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '4px 0',
                            color: '#ff6b6b'
                        }}>
                            <DeleteOutlined style={{ fontSize: '14px' }} />
                            <span>Eliminar</span>
                        </div>
                    ),
                    onClick: () => onEliminar(comparacion)
                }
            ];
        }
    };

    return (
        <Dropdown
            menu={{ items: getMenuItems() }}
            trigger={['click']}
            placement="bottomRight"
        >
            <Button
                type="text"
                icon={<MoreOutlined />}
                style={{
                    color: '#6b6b6b',
                    height: '24px',
                    width: '24px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}
                onClick={(e) => e.stopPropagation()}
                className="menu-button"
            />
        </Dropdown>
    );
};

export default ComparacionDropdownMenu;