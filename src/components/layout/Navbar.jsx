import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { fetchConToken } from '../../services/api';
import ModalEditarPerfil from '../../components/ModalEditarPerfil'; 

export const Navbar = () => {
    const { cantidadTotal } = useCart();
    const { favoritos } = useFavorites(); 
    const cantidadFavoritos = favoritos.length;

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const busquedaURL = searchParams.get('busqueda') || '';
    const [busquedaLocal, setBusquedaLocal] = useState(busquedaURL);
    const [resultadosRapidos, setResultadosRapidos] = useState([]);
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // ==========================================
    // ESTADOS Y LÓGICA DE SESIÓN (NUEVO)
    // ==========================================
    const token = localStorage.getItem('token') || localStorage.getItem('vperfumery_token');
    const usuarioEmail = localStorage.getItem('usuarioEmail') || '';
    const letraInicial = usuarioEmail ? usuarioEmail.charAt(0).toUpperCase() : 'U';

    const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false);
    const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
    const menuPerfilRef = useRef(null);

    const manejarCerrarSesion = () => {
        // Limpiamos todo rastro de la sesión
        localStorage.removeItem('token');
        localStorage.removeItem('vperfumery_token');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('usuarioEmail');
        localStorage.removeItem('usuarioRol');
        localStorage.removeItem('vperfumery_user');
        
        setMenuPerfilAbierto(false);
        navigate('/'); // Lo mandamos al inicio
        // Opcional: window.location.reload(); si querés que la página se refresque por completo
    };

    // Cerrar menú de perfil al hacer clic afuera
    useEffect(() => {
        const handleClickFueraPerfil = (e) => {
            if (menuPerfilRef.current && !menuPerfilRef.current.contains(e.target)) {
                setMenuPerfilAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickFueraPerfil);
        return () => document.removeEventListener('mousedown', handleClickFueraPerfil);
    }, []);


    // ==========================================
    // MAGIA DE SCROLL LENTO
    // ==========================================
    const scrollLentoYSuave = (destinoY, duracion) => {
        const inicioY = window.scrollY;
        const distancia = destinoY - inicioY;
        let tiempoInicio = null;

        const easeInOutQuad = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return (c / 2) * t * t + b;
            t--;
            return (-c / 2) * (t * (t - 2) - 1) + b;
        };

        const animacion = (tiempoActual) => {
            if (tiempoInicio === null) tiempoInicio = tiempoActual;
            const tiempoTranscurrido = tiempoActual - tiempoInicio;
            const avance = easeInOutQuad(tiempoTranscurrido, inicioY, distancia, duracion);
            window.scrollTo(0, avance);
            if (tiempoTranscurrido < duracion) {
                requestAnimationFrame(animacion);
            } else {
                window.scrollTo(0, destinoY);
            }
        };
        requestAnimationFrame(animacion);
    };

    const hacerScrollAlCatalogo = () => {
        setTimeout(() => {
            const seccionCatalogo = document.getElementById('seccion-catalogo');
            if (seccionCatalogo) {
                const posicionY = seccionCatalogo.getBoundingClientRect().top + window.scrollY - 100;
                scrollLentoYSuave(posicionY, 1000); 
            }
        }, 150);
    };

    // ==========================================
    // LÓGICA DE BÚSQUEDA
    // ==========================================
    useEffect(() => {
        setBusquedaLocal(busquedaURL);
    }, [busquedaURL]);

    useEffect(() => {
        const handleClickFuera = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setMostrarDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, []);

    useEffect(() => {
        if (!busquedaLocal.trim() || busquedaLocal === busquedaURL) {
            setResultadosRapidos([]);
            return;
        }

        const temporizador = setTimeout(async () => {
            try {
                const res = await fetchConToken(`/productos?todos=false&busqueda=${encodeURIComponent(busquedaLocal)}&page=0&size=5`);
                if (res.ok) {
                    const data = await res.json();
                    setResultadosRapidos(data.content || []);
                }
            } catch (error) {
                console.error("Error en búsqueda rápida:", error);
            }
        }, 300);

        return () => clearTimeout(temporizador);
    }, [busquedaLocal, busquedaURL]);

    const manejarEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            ejecutarBusqueda(busquedaLocal);
        }
    };

    const seleccionarProducto = (producto) => {
        setBusquedaLocal(producto.nombre);
        ejecutarBusqueda(producto.nombre);
    };

    const ejecutarBusqueda = (termino) => {
        setMostrarDropdown(false);
        if (location.pathname !== '/') {
            navigate(`/?busqueda=${encodeURIComponent(termino)}`);
            setTimeout(hacerScrollAlCatalogo, 600);
        } else {
            if (termino) setSearchParams({ busqueda: termino });
            else setSearchParams({});
            hacerScrollAlCatalogo();
        }
    };

    const limpiarBusqueda = () => {
        setBusquedaLocal('');
        setMostrarDropdown(false);
        if (location.pathname === '/') setSearchParams({});
    };

    // ==========================================
    // RENDERIZADO
    // ==========================================
    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 backdrop-blur-md dark:bg-background-dark/80">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
                
                <Link to="/" className="flex items-center gap-2 lg:gap-4 hover:opacity-80 transition-opacity">
                    <div className="flex items-center justify-center rounded-lg bg-primary p-1.5 text-white">
                        <span className="material-symbols-outlined text-2xl">fragrance</span>
                    </div>
                    <h1 className="hidden text-xl font-black tracking-tight text-primary sm:block">
                        V-PERFUMERY
                    </h1>
                </Link>

                <div className="flex flex-1 items-center justify-center px-4 lg:px-20">
                    <div className="relative w-full max-w-2xl" ref={dropdownRef}>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10">
                            <span className="material-symbols-outlined text-slate-400">search</span>
                        </div>
                        
                        <input 
                            type="text"
                            value={busquedaLocal}
                            onChange={(e) => {
                                setBusquedaLocal(e.target.value);
                                setMostrarDropdown(true);
                            }}
                            onKeyDown={manejarEnter}
                            onFocus={() => {
                                if (resultadosRapidos.length > 0) setMostrarDropdown(true);
                            }}
                            placeholder="Buscar perfumes, limpieza o cuidado personal..." 
                            className="block w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:bg-slate-800 dark:text-slate-200 outline-none transition-all relative z-10" 
                        />
                        
                        {busquedaLocal && (
                            <button 
                                onClick={limpiarBusqueda}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary transition-colors z-10"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        )}

                        {mostrarDropdown && busquedaLocal.trim().length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in">
                                {resultadosRapidos.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                                        Buscando...
                                    </div>
                                ) : (
                                    <>
                                        {resultadosRapidos.map(p => (
                                            <div 
                                                key={p.id} 
                                                onClick={() => seleccionarProducto(p)} 
                                                className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors"
                                            >
                                                <div 
                                                    className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0 border border-slate-100 dark:border-slate-700 bg-slate-100 dark:bg-slate-900" 
                                                    style={{ backgroundImage: `url("${p.imagenUrl || 'https://via.placeholder.com/150'}")` }}
                                                ></div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{p.nombre}</p>
                                                    <p className="font-black text-primary text-sm">${p.esOferta ? p.precioOferta.toLocaleString() : p.precio.toLocaleString()}</p>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">call_made</span>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => ejecutarBusqueda(busquedaLocal)}
                                            className="w-full p-3 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-colors text-center flex justify-center items-center gap-2"
                                        >
                                            Ver todos los resultados
                                            <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    
                    {/* LÓGICA CONDICIONAL: ¿Está logueado o no? */}
                    {token ? (
                        <div className="relative hidden lg:block" ref={menuPerfilRef}>
                            <button 
                                onClick={() => setMenuPerfilAbierto(!menuPerfilAbierto)}
                                className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 hover:bg-primary/20 transition-colors focus:outline-none"
                                title="Mi Perfil"
                            >
                                {letraInicial}
                            </button>

                            {/* Menú Desplegable del Cliente */}
                           {/* Menú Desplegable del Cliente */}
                            {menuPerfilAbierto && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Hola,</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={usuarioEmail}>{usuarioEmail}</p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => { setMostrarModalPerfil(true); setMenuPerfilAbierto(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">manage_accounts</span> Editar Perfil
                                    </button>

                                    {/* NUEVO BOTÓN ACÁ: MIS PEDIDOS */}
                                    <Link 
                                        to="/mis-pedidos"
                                        onClick={() => setMenuPerfilAbierto(false)}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">receipt_long</span> Mis Pedidos
                                    </Link>
                                    
                                    <button 
                                        onClick={manejarCerrarSesion}
                                        className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors mt-1 border-t border-slate-100 dark:border-slate-700 pt-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span> Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="hidden lg:flex items-center gap-2 rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined">person</span>
                            <span className="text-sm font-semibold">Ingresar</span>
                        </Link>
                    )}

                    {/* BOTÓN DE FAVORITOS */}
                    <Link to="/favoritos" className="relative flex items-center justify-center rounded-full bg-red-500/10 p-2.5 text-red-500 hover:bg-red-500/20 transition-colors" title="Mis Favoritos">
                        <span className="material-symbols-outlined" style={cantidadFavoritos > 0 ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            favorite
                        </span>
                        {cantidadFavoritos > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                                {cantidadFavoritos}
                            </span>
                        )}
                    </Link>

                    {/* BOTÓN DEL CARRITO */}
                    <Link to="/checkout" className="relative flex items-center justify-center rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary/20 transition-colors" title="Mi Carrito">
                        <span className="material-symbols-outlined">shopping_cart</span>
                        {cantidadTotal > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
                                {cantidadTotal}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* MODAL DE EDITAR PERFIL */}
            {mostrarModalPerfil && (
                <ModalEditarPerfil onClose={() => setMostrarModalPerfil(false)} />
            )}
        </header>
    );
};