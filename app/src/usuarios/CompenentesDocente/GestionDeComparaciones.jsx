import React, { useState, useMemo } from 'react';
import {
    Typography,
    Input,
    Button,
    Space,
    Checkbox,
    message,
    Empty
} from 'antd';
import {
    SearchOutlined,
    ArrowLeftOutlined,
    StarOutlined,
    ClockCircleOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import '../Estilos/Css_Historial_Comparaciones/ComparisonManager.css';

const { Title, Text } = Typography;

const ChatManagerView = ({
    comparacionesDestacadas,
    comparacionesRecientes,
    onBack,
    onMarcarDestacado,
    onMarcarReciente,
    onEliminar,
    formatFecha
}) => {
    const [searchText, setSearchText] = useState('');
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedChats, setSelectedChats] = useState([]);

    // Combinar todos los chats
    const todosLosChats = useMemo(() => {
        return [
            ...comparacionesDestacadas,
            ...comparacionesRecientes
        ];
    }, [comparacionesDestacadas, comparacionesRecientes]);

    // Filtrar chats según el texto de búsqueda
    const chatsFiltrados = useMemo(() => {
        if (!searchText.trim()) return todosLosChats;

        const searchLower = searchText.toLowerCase();
        return todosLosChats.filter(chat =>
            chat.nombre_comparacion.toLowerCase().includes(searchLower)
        );
    }, [todosLosChats, searchText]);

    const handleSelectAll = (checked) => {
        if (checked) {
            const allIds = chatsFiltrados.map(chat => `${chat.tipo}-${chat.id}`);
            setSelectedChats(allIds);
        } else {
            setSelectedChats([]);
        }
    };

    const handleSelectChat = (chat, checked) => {
        const chatId = `${chat.tipo}-${chat.id}`;
        if (checked) {
            setSelectedChats([...selectedChats, chatId]);
        } else {
            setSelectedChats(selectedChats.filter(id => id !== chatId));
        }
    };

    const isSelected = (chat) => {
        return selectedChats.includes(`${chat.tipo}-${chat.id}`);
    };

    const handleMarcarDestacados = () => {
        if (selectedChats.length === 0) {
            message.warning('Selecciona al menos un chat');
            return;
        }

        selectedChats.forEach(chatId => {
            const [tipo, id] = chatId.split('-');
            const chat = todosLosChats.find(c => c.tipo === tipo && c.id === parseInt(id));
            if (chat && chat.estado?.toLowerCase() !== 'destacado') {
                onMarcarDestacado(chat);
            }
        });

        setSelectedChats([]);
        setIsSelectMode(false);
    };

    const handleQuitarDestacados = () => {
        if (selectedChats.length === 0) {
            message.warning('Selecciona al menos un chat');
            return;
        }

        selectedChats.forEach(chatId => {
            const [tipo, id] = chatId.split('-');
            const chat = todosLosChats.find(c => c.tipo === tipo && c.id === parseInt(id));
            if (chat && chat.estado?.toLowerCase() === 'destacado') {
                onMarcarReciente(chat);
            }
        });

        setSelectedChats([]);
        setIsSelectMode(false);
    };

    const handleEliminarSeleccionados = () => {
        if (selectedChats.length === 0) {
            message.warning('Selecciona al menos un chat');
            return;
        }

        selectedChats.forEach(chatId => {
            const [tipo, id] = chatId.split('-');
            const chat = todosLosChats.find(c => c.tipo === tipo && c.id === parseInt(id));
            if (chat) {
                onEliminar(chat);
            }
        });

        setSelectedChats([]);
        setIsSelectMode(false);
    };

    return (
        <div className="chat-manager-container" style={{
            width: '100%',
            maxWidth: '800px',
            padding: '0',
            margin: '0 auto'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                    className="chat-manager-back-button"
                />
                <Title
                    level={2}
                    className="chat-manager-title"
                >
                    Historial de Comparaciones
                </Title>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '16px' }}>
                <Input
                    placeholder="Buscar en sus comparaciones..."
                    prefix={<SearchOutlined style={{ color: '#6b6b6b' }} />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="chat-manager-search-input"
                />
            </div>

            {/* Select Button / Action Buttons */}
            <div style={{
                marginBottom: '24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
            }}>
                <Button
                    onClick={() => {
                        setIsSelectMode(!isSelectMode);
                        if (isSelectMode) {
                            setSelectedChats([]);
                        }
                    }}
                    className={isSelectMode ? "chat-manager-cancel-button-small" : "chat-manager-select-button-small"}
                >
                    {isSelectMode ? 'Cancelar' : 'Seleccionar'}
                </Button>

                {isSelectMode && (
                    <>
                        <Button
                            type="text"
                            icon={<StarOutlined />}
                            onClick={handleMarcarDestacados}
                            className="chat-action-button star-button"
                            title="Destacar"
                        />
                        <Button
                            type="text"
                            icon={<ClockCircleOutlined />}
                            onClick={handleQuitarDestacados}
                            className="chat-action-button clock-button"
                            title="Quitar de destacados"
                        />
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={handleEliminarSeleccionados}
                            className="chat-action-button delete-button"
                            title="Eliminar"
                        />
                    </>
                )}
            </div>

            {/* Chat Count and Select All */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                paddingLeft: '4px'
            }}>
                <Text style={{ color: '#6b6b6b', fontSize: '14px' }}>
                    {chatsFiltrados.length} {chatsFiltrados.length === 1 ? 'comparación' : 'comparaciones'}
                </Text>
                {isSelectMode && chatsFiltrados.length > 0 && (
                    <Checkbox
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={selectedChats.length === chatsFiltrados.length}
                        style={{ color: '#a0a0a0' }}
                    >
                        <Text style={{ color: '#a0a0a0', fontSize: '14px' }}>
                            Seleccionar todo
                        </Text>
                    </Checkbox>
                )}
            </div>

            {/* Chat List */}
            <div className="chat-manager-list-container">
                {chatsFiltrados.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <Empty
                            description={
                                <Text style={{ color: '#6b6b6b' }}>
                                    {searchText ? 'No se encontraron chats' : 'No hay chats disponibles'}
                                </Text>
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                ) : (
                    chatsFiltrados.map((chat, index) => (
                        <div
                            key={`${chat.tipo}-${chat.id}`}
                            className={`chat-manager-item ${isSelected(chat) ? 'selected' : ''}`}
                            style={{
                                borderBottom: index < chatsFiltrados.length - 1 ? '1px solid #2d2d2d' : 'none'
                            }}
                            onClick={() => {
                                if (isSelectMode) {
                                    handleSelectChat(chat, !isSelected(chat));
                                }
                            }}
                        >
                            {isSelectMode && (
                                <Checkbox
                                    checked={isSelected(chat)}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        handleSelectChat(chat, e.target.checked);
                                    }}
                                />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '4px'
                                }}>
                                    <Text className="chat-manager-item-title">
                                        {chat.nombre_comparacion}
                                    </Text>
                                    {chat.estado?.toLowerCase() === 'destacado' && (
                                        <StarOutlined style={{ color: '#5ebd8f', fontSize: '14px' }} />
                                    )}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'center'
                                }}>
                                    <Text className="chat-manager-item-meta">
                                        {chat.tipo === 'individual' ? 'Individual' : 'Grupal'}
                                    </Text>
                                    <Text className="chat-manager-item-meta">
                                        •
                                    </Text>
                                    <Text className="chat-manager-item-meta">
                                        {formatFecha(chat.fecha_creacion)}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatManagerView;