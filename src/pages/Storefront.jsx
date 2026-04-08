import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/store/ProductCard';
import { CategoriaCard } from '../components/store/CategoriaCard';
import { HeroSection } from '../components/store/HeroSection';
import { fetchConToken } from '../services/api'; 

export const Storefront = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [datosDelBanner, setDatosDelBanner] = useState(null);
    
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [mostrarSoloOfertas, setMostrarSoloOfertas] = useState(false);
    
    const [cargando, setCargando] = useState(true);
    const [cargandoMas, setCargandoMas] = useState(false);
    const [error, setError] = useState(null);

    // ESTADOS PARA PAGINACIÓN
    const [paginaActual, setPaginaActual] = useState(0);
    const [hayMasProductos, setHayMasProductos] = useState(true);

    const [searchParams, setSearchParams] = useSearchParams();
    const busquedaURL = searchParams.get('busqueda') || '';
    

    // ==========================================
    // 1. CARGAMOS BANNER Y CATEGORÍAS (Solo 1 vez)
    // ==========================================
    useEffect(() => {
        const cargarDatosEstaticos = async () => {
            try {
                const [resCategorias, resBanner] = await Promise.all([
                    fetchConToken('/categorias'), 
                    fetchConToken('/banner')
                ]);
                if (resCategorias.ok) setCategorias(await resCategorias.json());
                if (resBanner.ok) setDatosDelBanner(await resBanner.json());
            } catch (err) {
                console.error("Error cargando categorías/banner:", err);
            }
        };
        cargarDatosEstaticos();
    }, []);

    // ==========================================
    // 2. FUNCIÓN MAESTRA DE BÚSQUEDA Y PAGINACIÓN
    // ==========================================
    const buscarProductosBD = async (pagina = 0, esNuevaBusqueda = true) => {
        if (esNuevaBusqueda) setCargando(true);
        else setCargandoMas(true);
        
        setError(null);

        try {
            // Traemos de a 15 productos por página
            let url = `/productos?page=${pagina}&size=15&todos=false`;
            
            if (busquedaURL) url += `&busqueda=${encodeURIComponent(busquedaURL)}`;
            if (categoriaSeleccionada) url += `&categoriaId=${categoriaSeleccionada.id}`;

            const res = await fetchConToken(url);
            if (!res.ok) throw new Error("Error de conexión");
            
            const data = await res.json();
            
            if (esNuevaBusqueda) {
                setProductos(data.content || []); // Reemplaza todo
            } else {
                setProductos(prev => [...prev, ...(data.content || [])]); // Suma a los que ya estaban
            }

            // Avisamos si hay más páginas para mostrar el botón "Cargar Más"
            setHayMasProductos(!data.last); 
            setPaginaActual(pagina);

        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
            setCargandoMas(false);
        }
    };

    // Vuelve a buscar a la base de datos si cambiamos categoría o texto
    useEffect(() => {
        buscarProductosBD(0, true);
    }, [busquedaURL, categoriaSeleccionada]);

    // ==========================================
    // LÓGICA DE INTERFAZ Y SCROLL (Restaurado)
    // ==========================================
    const manejarClickCategoria = (categoria) => {
        setMostrarSoloOfertas(false);
        setCategoriaSeleccionada(categoriaSeleccionada?.id === categoria.id ? null : categoria);
    };

    const cargarMasProductos = () => {
        buscarProductosBD(paginaActual + 1, false);
    };

    // ¡Función mágica restaurada!
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
                const posicionY = seccionCatalogo.getBoundingClientRect().top + window.scrollY - 80;
                scrollLentoYSuave(posicionY, 1000); 
            }
        }, 100);
    };

    const verSoloOfertas = () => {
        setCategoriaSeleccionada(null);
        setMostrarSoloOfertas(true);
        hacerScrollAlCatalogo();
    };

    const verCatalogoCompleto = () => {
        setCategoriaSeleccionada(null);
        setMostrarSoloOfertas(false);
        setSearchParams({}); // <--- ESTO LIMPIA LA BARRA DE BÚSQUEDA Y LA URL
        hacerScrollAlCatalogo();
    };

    // Filtro frontal solo para ofertas
    let productosFiltrados = productos;
    if (mostrarSoloOfertas) {
        productosFiltrados = productos.filter(p => p.esOferta);
    }

    return (
        <>
            {datosDelBanner && (
                <HeroSection 
                    variante={datosDelBanner.variante || 'banner'}
                    datosBanner={datosDelBanner}
                    productosOferta={productos.filter(p => p.esOferta)} 
                    onVerOfertas={verSoloOfertas}
                    onVerTodo={verCatalogoCompleto}
                />
            )}

            <div className="mb-8 flex flex-col gap-6" id="seccion-catalogo">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">
                        {busquedaURL ? `Resultados para "${busquedaURL}"` : mostrarSoloOfertas ? 'Ofertas Especiales' : 'Categorías'}
                    </h3>
                    <button 
                        onClick={verCatalogoCompleto}
                        className={`text-sm font-semibold hover:underline transition-all ${!categoriaSeleccionada && !mostrarSoloOfertas && !busquedaURL ? 'text-primary' : 'text-slate-400'}`}
                    >
                        Ver Todo
                    </button>
                </div>
                
                {!busquedaURL && (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {categorias.length > 0 && categorias.map(cat => (
                            <CategoriaCard 
                                key={cat.id} 
                                categoria={cat} 
                                isActive={categoriaSeleccionada?.id === cat.id}
                                onClick={manejarClickCategoria}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {cargando ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined animate-spin text-5xl mb-4 text-primary">sync</span>
                        <p className="font-medium text-lg">Cargando catálogo...</p>
                    </div>
                ) : productosFiltrados.length > 0 ? (
                    productosFiltrados.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">search_off</span>
                        <p className="text-lg font-medium">No hay productos para mostrar aquí.</p>
                    </div>
                )}
            </div>

            {/* BOTÓN CARGAR MÁS */}
            {!cargando && !error && productosFiltrados.length > 0 && !mostrarSoloOfertas && hayMasProductos && (
                <div className="mt-12 flex flex-col items-center gap-4 rounded-xl border-t border-slate-200 py-10 dark:border-slate-800">
                    <button 
                        onClick={cargarMasProductos}
                        disabled={cargandoMas}
                        className="rounded-full border-2 border-primary px-10 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {cargandoMas ? (
                            <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Cargando...</>
                        ) : 'Cargar Más'}
                    </button>
                </div>
            )}
        </>
    );
};