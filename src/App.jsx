import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PantallaOfertas from './components/PantallaOfertas';
import PantallaProductos from './components/PantallaProductos';
import PantallaNuevoProducto from './components/PantallaNuevoProducto';   
import PantallaEditarProducto from './components/PantallaEditarProducto';
import PantallaEstadisticas from './components/PantallaEstadisticas';
import PantallaClientes from './components/PantallaClientes';
import PantallaCargaStock from './components/PantallaCargaStock'; 
import PantallaCategorias from './components/PantallaCategorias';
import PantallaPedidos from './components/PantallaPedidos';
import PantallaDashboard from './components/PantallaDashboard';
import PantallaLogin from './components/PantallaLogin';

// 1. Revisa si tenés el pasaporte (token)
const RutaProtegida = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // Si no hay token guardado, te manda al login directo
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Si hay token, te deja ver la pantalla
  return children;
};

// 2. EL LAYOUT INTELIGENTE: Decide qué menús mostrar
const Layout = () => {
  const location = useLocation();
  const esLogin = location.pathname === '/login'; // ¿Estamos en la pantalla de login?

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display overflow-hidden">
      
      {/* Solo mostramos el Sidebar si NO estamos en Login */}
      {!esLogin && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Solo mostramos el Header si NO estamos en Login */}
        {!esLogin && <Header />}
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* RUTA PÚBLICA (No necesita patovica) */}
            <Route path="/login" element={<PantallaLogin />} />

            {/* RUTAS PROTEGIDAS (Envueltas en <RutaProtegida>) */}
            <Route path="/" element={<RutaProtegida><PantallaDashboard /></RutaProtegida>} />
            <Route path="/dashboard" element={<RutaProtegida><PantallaDashboard /></RutaProtegida>} />
            <Route path="/productos/nuevo" element={<RutaProtegida><PantallaNuevoProducto /></RutaProtegida>} />
            <Route path="/productos" element={<RutaProtegida><PantallaProductos /></RutaProtegida>} />
            <Route path="/ofertas" element={<RutaProtegida><PantallaOfertas /></RutaProtegida>} />
            <Route path="/estadisticas" element={<RutaProtegida><PantallaEstadisticas /></RutaProtegida>} />
            <Route path="/clientes" element={<RutaProtegida><PantallaClientes /></RutaProtegida>} />
            <Route path="/productos/editar/:id" element={<RutaProtegida><PantallaEditarProducto /></RutaProtegida>} />
            <Route path="/productos/stock" element={<RutaProtegida><PantallaCargaStock /></RutaProtegida>} />
            <Route path="/categorias" element={<RutaProtegida><PantallaCategorias /></RutaProtegida>} />
            <Route path="/pedidos" element={<RutaProtegida><PantallaPedidos /></RutaProtegida>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;