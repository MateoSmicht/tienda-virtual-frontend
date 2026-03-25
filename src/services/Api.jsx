
export const fetchConToken = async (endpoint, opciones = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...opciones.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Si tu backend está en el puerto 8080, asegurate de que la URL base esté acá
  const urlCompleta = `http://localhost:8080/api${endpoint}`;

  return fetch(urlCompleta, {
    ...opciones,
    headers,
  });
};


// ==========================================
// TUS FUNCIONES EXPORTADAS
// ==========================================

export const traerProductos = async () => {
  try {
    const res = await fetchConToken('/productos?page=0&size=1000'); 
    if (!res.ok) throw new Error("Error al traer productos");
    
    const data = await res.json();
    return data.content || []; 
  } catch (error) {
    console.error(error);
    return []; 
  }
};

export const traerClientes = async () => {
  try {
    // 👇 Usamos el mensajero acá también
    const res = await fetchConToken('/user');
    if (!res.ok) throw new Error("Error al traer clientes");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Podés seguir agregando más funciones acá abajo usando la misma lógica...
// export const crearProducto = async (datos) => { ... }