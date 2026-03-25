import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  
  // Estado para controlar si el menú está abierto en celulares
  const [abierto, setAbierto] = useState(false);
  
  // Obtenemos el email, si no hay, ponemos "Usuario"
  const usuarioEmail = localStorage.getItem('usuarioEmail') || 'Usuario';
  const letraInicial = usuarioEmail.charAt(0).toUpperCase();

  const manejarCerrarSesion = () => {
    const confirmacion = window.confirm("¿Estás seguro que querés cerrar sesión?");
    if (confirmacion) {
      localStorage.clear(); 
      navigate('/login'); 
    }
  };

  return (
    <>
      {/* 1. BOTÓN FLOTANTE MÁGICO (Abre y Cierra el menú en móviles) */}
      <button 
        onClick={() => setAbierto(!abierto)}
        className="fixed top-5 left-5 z-[100] lg:hidden focus:outline-none transition-transform active:scale-95"
      >
        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-3xl drop-shadow-sm">
          {abierto ? 'close' : 'menu'}
        </span>
      </button>

      {/* 2. OVERLAY OSCURO (Para cerrar al tocar el fondo) */}
      {abierto && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setAbierto(false)} 
        />
      )}

      {/* 3. EL SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-screen transform transition-transform duration-300 ease-in-out 
        ${abierto ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:sticky lg:top-0`}
      >
        
        {/* Cabecera del Sidebar (Le dimos más margen izquierdo en móviles (pl-16) para que no se superponga con el botón) */}
        <div className="py-6 pr-6 pl-16 lg:pl-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
            <span className="material-symbols-outlined">S</span>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white truncate">Store Admin</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Perfumeria Virtual</p>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          
          <NavLink 
            to="/dashboard" 
            onClick={() => setAbierto(false)} 
            className={({ isActive }) => isActive ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary transition-colors font-bold" : "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </NavLink>

          <NavLink 
            to="/categorias" 
            onClick={() => setAbierto(false)} 
            className={({ isActive }) => isActive ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary transition-colors font-bold" : "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"}
          >
            <span className="material-symbols-outlined">layers</span>
            <span className="text-sm">Categorías</span>
          </NavLink>

          <NavLink 
            to="/pedidos" 
            onClick={() => setAbierto(false)} 
            className={({ isActive }) => isActive ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary transition-colors font-bold" : "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"}
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="text-sm">Pedidos</span>
          </NavLink>

          <NavLink 
            to="/productos" 
            onClick={() => setAbierto(false)} 
            className={({ isActive }) => isActive ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary transition-colors font-bold" : "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"}
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-sm">Productos</span>
          </NavLink>

          <NavLink 
            to="/ofertas" 
            onClick={() => setAbierto(false)} 
            className={({ isActive }) => isActive ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary transition-colors font-bold" : "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"}
          >
            <span className="material-symbols-outlined">local_offer</span>
            <span className="text-sm">Ofertas</span>
          </NavLink>

          <NavLink 
            to="/clientes" 
            onClick={() => setAbierto(false)} 
            className={({ isActive }) => isActive ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary transition-colors font-bold" : "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm">Clientes</span>
          </NavLink>

          <NavLink 
            to="/estadisticas" 
            onClick={() => setAbierto(false)} 
            className={({ isActive }) => isActive ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary transition-colors font-bold" : "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"}
          >
            <span className="material-symbols-outlined">insights</span>
            <span className="text-sm">Estadísticas</span>
          </NavLink>

        </nav>

        {/* Usuario abajo de todo con la confirmación */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div 
            onClick={manejarCerrarSesion} 
            className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 rounded-lg cursor-pointer transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:bg-red-100 group-hover:text-red-600 transition-colors shrink-0">
              {letraInicial}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{usuarioEmail}</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-red-600 text-sm transition-colors">logout</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;