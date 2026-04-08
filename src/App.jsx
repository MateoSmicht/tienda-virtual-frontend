import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importaciones del Admin
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
import PantallaBanner from './components/PantallaBanner';
import PantallaLogin from './components/PantallaLogin'; 


// Importaciones de la Tienda 
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Storefront } from './pages/Storefront'; 
import { PantallaCheckout } from './pages/PantallaCheckout'; 
import { PantallaPagoExito } from './pages/PantallaPagoExito';
import { PantallaPagoFallo } from './pages/PantallaPagoFallo';
import { PantallaPagoPendiente } from './pages/PantallaPagoPendiente';
import { PantallaPerfilProduct } from './pages/PantallaPerfilProduct';
import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';
import { PantallaFavoritos } from './pages/PantallaFavoritos';
import { PantallaLoginCliente } from './pages/PantallaLoginCliente';
import { PantallaMisPedidos } from './pages/PantallaMisPedidos';

// ========================================================
// 1. RUTAS ADMINISTRATIVAS
// ========================================================
const RutaProtegida = ({ children }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('usuarioRol'); 

  if (!token) {
      return <Navigate to="/login" replace />;
  }

  if (rol !== 'ADMIN') {
      return <Navigate to="/" replace />;
  }

  return children;
};

// ========================================================
// 2. LAYOUT DEL ADMINISTRADOR (Privado)
// ========================================================
const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// ========================================================
// 3. LAYOUT DE LA TIENDA (Público)
// ========================================================
const StoreLayout = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8">
        {children}
      </main>
      <MobileNav /> 
    </div>
  );
};

// ========================================================
// 4. ENRUTADOR PRINCIPAL
// ========================================================
function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
      <CartProvider>
        <Routes>

          {/* ======================================= */}
          {/* MUNDO 1: LA TIENDA PÚBLICA CON NAVBAR   */}
          {/* ======================================= */}
          <Route path="/" element={<StoreLayout><Storefront /></StoreLayout>} />
          <Route path="/producto/:id" element={<StoreLayout><PantallaPerfilProduct /></StoreLayout>} />
          <Route path="/favoritos" element={<StoreLayout><PantallaFavoritos /></StoreLayout>} />
          <Route path="/checkout" element={<StoreLayout><PantallaCheckout /></StoreLayout>} />
          <Route path="/mis-pedidos" element={<StoreLayout><PantallaMisPedidos /></StoreLayout>} />

          {/* ======================================= */}
          {/* MUNDO 2: PANTALLAS LIMPIAS (Sin Navbar) */}
          {/* ======================================= */}
          {/* Puerta pública: */}
          <Route path="/login" element={<PantallaLoginCliente />} />
          {/* Puerta escondida para vos y tus empleados: */}
          <Route path="/admin/login" element={<PantallaLogin />} />
          
          <Route path="/pago/exito" element={<PantallaPagoExito />} />
          <Route path="/pago/fallo" element={<PantallaPagoFallo />} />
          <Route path="/pago/pendiente" element={<PantallaPagoPendiente />} />
          
          {/* ======================================= */}
          {/* MUNDO 3: EL PANEL DE ADMINISTRACIÓN     */}
          {/* ======================================= */}
          <Route path="/dashboard" element={<RutaProtegida><AdminLayout><PantallaDashboard /></AdminLayout></RutaProtegida>} />
          <Route path="/productos/nuevo" element={<RutaProtegida><AdminLayout><PantallaNuevoProducto /></AdminLayout></RutaProtegida>} />
          <Route path="/productos" element={<RutaProtegida><AdminLayout><PantallaProductos /></AdminLayout></RutaProtegida>} />
          <Route path="/ofertas" element={<RutaProtegida><AdminLayout><PantallaOfertas /></AdminLayout></RutaProtegida>} />
          <Route path="/estadisticas" element={<RutaProtegida><AdminLayout><PantallaEstadisticas /></AdminLayout></RutaProtegida>} />
          <Route path="/clientes" element={<RutaProtegida><AdminLayout><PantallaClientes /></AdminLayout></RutaProtegida>} />
          <Route path="/productos/editar/:id" element={<RutaProtegida><AdminLayout><PantallaEditarProducto /></AdminLayout></RutaProtegida>} />
          <Route path="/productos/stock" element={<RutaProtegida><AdminLayout><PantallaCargaStock /></AdminLayout></RutaProtegida>} />
          <Route path="/categorias" element={<RutaProtegida><AdminLayout><PantallaCategorias /></AdminLayout></RutaProtegida>} />
          <Route path="/pedidos" element={<RutaProtegida><AdminLayout><PantallaPedidos /></AdminLayout></RutaProtegida>} />
          <Route path="/banner" element={<RutaProtegida><AdminLayout><PantallaBanner /></AdminLayout></RutaProtegida>} />

        </Routes>
      </CartProvider>
      </FavoritesProvider>
    </BrowserRouter>
  );
}

export default App;