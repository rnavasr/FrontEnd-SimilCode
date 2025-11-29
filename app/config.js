// config.js - Configuración de la API

// URL base de tu API
export const API_BASE_URL = 'http://localhost:8000'; // Cambia esto por tu URL de API

// Endpoints de la API
export const API_ENDPOINTS = {
  LOGIN: '/app/usuarios/login/',
  PROFILE: '/app/usuarios/perfil/',
  // Puedes agregar más endpoints aquí según necesites
  USERS: '/app/usuarios/',
  REGISTER: '/app/usuarios/register/',
  LISTAR_INDIVIDUAL: '/app/usuarios/listar_individual',
  LISTAR_GRUPAL: '/app/usuarios/listar_grupal',
  MARCAR_INDIVIDUAL_RECIENTE: '/app/usuarios/comparacion_individual_reciente',
  MARCAR_INDIVIDUAL_DESTACADO: '/app/usuarios/comparacion_individual_destacado',
  MARCAR_INDIVIDUAL_OCULTO: '/app/usuarios/comparacion_individual_oculto',
  MARCAR_GRUPAL_RECIENTE: '/app/usuarios/comparacion_grupal_reciente',
  MARCAR_GRUPAL_DESTACADO: '/app/usuarios/comparacion_grupal_destacado',
  MARCAR_GRUPAL_OCULTO: '/app/usuarios/comparacion_grupal_oculto',
  LISTAR_MODELOS_ADMIN: '/app/usuarios/listar_modelos_admin/',
  LISTAR_MODELOS_USUARIO: '/app/usuarios/listar_modelos_usuario',
  LISTAR_LENGUAJES: '/app/usuarios/listar_lenguajes',
  CREAR_COMPARACION_INDIVIDUAL: '/app/usuarios/crear_comparaciones_individuales/',
  OBTENER_COMPARACION_INDIVIDUAL: '/app/usuarios/mostrar_datos_comparacion_individual',
  EJECUTAR_COMPARACION_IA: '/app/usuarios/crear_comparacion_ia'
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Configuración por defecto para las peticiones
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Función helper para hacer peticiones POST con FormData
export const postFormData = async (endpoint, formData) => {
  try {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'POST',
      body: formData,
      // No incluyas Content-Type cuando uses FormData
      // El browser lo establece automáticamente con el boundary correcto
    });

    // Verificar si la respuesta es válida antes de intentar parsear JSON
    if (!response.ok) {
      // Intentar obtener el mensaje de error del servidor
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.mensaje || errorData.message || errorMessage;
      } catch (parseError) {
        // Si no se puede parsear como JSON, usar el mensaje por defecto
        console.error('No se pudo parsear la respuesta de error:', parseError);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    // Si es un error de red (como CORS), el mensaje será más descriptivo
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión. Verifica que el servidor esté ejecutándose y que CORS esté configurado correctamente.');
    }

    throw error;
  }
};

// Función helper para hacer peticiones GET con autenticación
export const getWithAuth = async (endpoint, token) => {
  try {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'GET',
      headers: {
        ...DEFAULT_HEADERS,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.mensaje || errorData.message || errorMessage;
      } catch (parseError) {
        console.error('No se pudo parsear la respuesta de error:', parseError);
      }

      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return responseData;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión. Verifica que el servidor esté ejecutándose y que CORS esté configurado correctamente.');
    }

    throw error;
  }
};

// Función helper para hacer peticiones POST con JSON
export const postJSON = async (endpoint, data) => {
  try {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.mensaje || errorData.message || errorMessage;
      } catch (parseError) {
        console.error('No se pudo parsear la respuesta de error:', parseError);
      }

      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return responseData;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión. Verifica que el servidor esté ejecutándose y que CORS esté configurado correctamente.');
    }

    throw error;
  }
};

// Función helper para obtener el token del localStorage
export const getStoredToken = () => {
  return localStorage.getItem('token');
};

// Función helper para guardar el token en localStorage
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

// Función helper para eliminar el token
export const removeToken = () => {
  localStorage.removeItem('token');
};