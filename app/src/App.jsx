import React, { useState, useEffect } from 'react';
import { Spin, message, Card, Typography } from 'antd';
import LoginForm from './auth/login';
import Admin from './administrador/admin';
import Usuario from './usuarios/usuario';
import { getStoredToken, API_ENDPOINTS, getWithAuth, removeToken } from '../config';

const { Text } = Typography;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Función para verificar la autenticación al cargar la app
  const checkAuthentication = async () => {
    try {
      const token = getStoredToken();

      if (!token) {
        // No hay token, mostrar login
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Verificar si el token es válido haciendo una petición al perfil
      const response = await getWithAuth(API_ENDPOINTS.PROFILE, token);

      // Si llega aquí, el token es válido
      setIsAuthenticated(true);
      setUserRole(response.rol);
      setUserProfile(response);

      console.log('Usuario autenticado:', response);

    } catch (error) {
      console.error('Token inválido o expirado:', error);

      // Token inválido, limpiar y mostrar login
      removeToken();
      setIsAuthenticated(false);
      setUserRole(null);
      setUserProfile(null);

      message.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');

    } finally {
      setLoading(false);
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Función que se ejecuta cuando el login es exitoso
  const handleLoginSuccess = (loginResponse) => {
    console.log('Login exitoso:', loginResponse);

    // El token ya se guarda automáticamente en LoginForm
    // Ahora verificamos la autenticación nuevamente
    setTimeout(() => {
      checkAuthentication();
    }, 500); // Pequeño delay para asegurar que el token se guardó
  };

  // Función para manejar el logout desde cualquier componente
  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
    setUserRole(null);
    setUserProfile(null);
    message.success('Sesión cerrada exitosamente');
  };

  // Mostrar spinner mientras verifica la autenticación
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card style={{
          textAlign: 'center',
          minWidth: '300px',
          background: '#242424',
          border: '1px solid #2d2d2d',
          borderRadius: '12px'
        }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text style={{ 
              color: '#a0a0a0',
              fontSize: '16px',
              fontFamily: "'Playfair Display', 'Georgia', serif"
            }}>
              Verificando autenticación...
            </Text>
          </div>
        </Card>

        {/* Estilos globales para el spinner */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

          .ant-spin-dot-item {
            background-color: #5ebd8f !important;
          }

          .ant-card {
            background: #242424 !important;
            border: 1px solid #2d2d2d !important;
          }
        `}</style>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Si está autenticado, mostrar el componente según el rol
  if (userRole === 'admin') {
    return <Admin userProfile={userProfile} onLogout={handleLogout} />;
  } else {
    return <Usuario userProfile={userProfile} onLogout={handleLogout} />;
  }
}

export default App;