export const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://ehr-api-prod.onrender.com/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Obtener token de localStorage si existe
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    let errorMessage = 'Ocurrió un error en la solicitud';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Ignorar error de parsing
    }
    throw new Error(errorMessage);
  }

  // Si no hay contenido (por ejemplo, 204 No Content), devolvemos null o vacío
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
