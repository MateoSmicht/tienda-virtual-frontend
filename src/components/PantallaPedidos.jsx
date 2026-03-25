import { useState, useEffect } from 'react';
import ModalNuevoPedido from './ModalNuevoPedido'; 
import { fetchConToken } from '../services/api'; 

const PantallaPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para los modales
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  
  // Filtros
  const [busqueda, setBusqueda] = useState(''); // Búsqueda local en la página actual
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState(''); 
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const cargarDatos = async (nroPagina = 0) => {
    setCargando(true);
    try {
      let urlPedidos = `/pedidos?page=${nroPagina}&size=10`;
      
      if (fechaInicio && fechaFin) {
        urlPedidos += `&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      }
      if (estadoFiltro) {
        urlPedidos += `&estado=${estadoFiltro}`;
      }
      
      const resPedidos = await fetchConToken(urlPedidos);
      const dataPedidos = await resPedidos.json();
      
      // Guardamos la página que nos devolvió Spring Boot
      setPedidos(dataPedidos.content || []);
      setTotalPaginas(dataPedidos.totalPages || 0);
      setTotalElementos(dataPedidos.totalElements || 0);
      setPaginaActual(dataPedidos.number || 0);
      
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    } finally {
      setCargando(false);
    }
  };

  // Escuchamos los cambios en los filtros para volver a la página 0
  useEffect(() => {
    // Solo busca si ambas fechas están puestas o si ambas están vacías
    if ((fechaInicio && fechaFin) || (!fechaInicio && !fechaFin)) {
      cargarDatos(0);
    }
  }, [fechaInicio, fechaFin, estadoFiltro]);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const response = await fetchConToken(`/pedidos/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ nuevoEstado })
      });
      if (response.ok) {
        cargarDatos(paginaActual); // Refrescamos la página actual
        setPedidoSeleccionado(null);
      }
    } catch (error) {
      alert("Error al actualizar estado");
    }
  };

  const eliminarPedido = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de que querés eliminar este pedido de forma permanente?");
    if (!confirmar) return;
    try {
      const response = await fetchConToken(`/pedidos/${id}`, { method: 'DELETE' });
      if (response.ok || response.status === 204) {
        cargarDatos(paginaActual); // Refrescamos la página actual
        setPedidoSeleccionado(null);
      }
    } catch (error) {
      alert("Error al eliminar pedido");
    }
  };

  // Filtro local (solo sobre los 10 resultados de la vista actual)
  const pedidosTablaFiltrados = pedidos.filter(p => 
    p.id.toString().includes(busqueda) || 
    p.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.usuario?.apellido?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const BadgeEstado = ({ estado }) => {
    const estilos = {
      'PENDIENTE': 'bg-amber-100 text-amber-700 border-amber-200',
      'PAGADO': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'CANCELADO': 'bg-red-100 text-red-700 border-red-200',
      'ENTREGADO': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    return <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border ${estilos[estado] || estilos['PENDIENTE']}`}>{estado}</span>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full font-sans relative pb-24">
      
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Pedidos y Ventas</h1>
            <p className="text-slate-500 mt-1">Haga el seguimiento de las órdenes de compra y facturación.</p>
          </div>
          <button 
            onClick={() => setMostrarModalNuevo(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/30"
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            Nuevo Pedido
          </button>
        </div>
        
        {/* BARRA DE FILTROS */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          
          <div className="w-full md:w-auto flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="px-3 py-1.5 text-sm font-medium outline-none bg-transparent dark:text-white w-full" />
            <span className="text-slate-300">-</span>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="px-3 py-1.5 text-sm font-medium outline-none bg-transparent dark:text-white w-full" />
          </div>

          <div className="w-full md:w-48 relative">
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold text-slate-700 dark:text-slate-200 appearance-none focus:border-teal-500 transition-colors"
            >
              <option value="">Todos los Estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="PAGADO">Pagados</option>
              <option value="ENTREGADO">Entregados</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
          </div>

          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-lg pointer-events-none">search</span>
            <input 
              type="text" 
              placeholder="Buscar por ID o cliente (En esta página)..." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-medium text-slate-700 dark:text-white focus:border-teal-500 transition-colors" 
            />
          </div>

          {(fechaInicio || fechaFin || estadoFiltro || busqueda) && (
            <button onClick={() => {setFechaInicio(''); setFechaFin(''); setEstadoFiltro(''); setBusqueda('');}} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-slate-800/80 rounded-xl transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">close</span> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* TABLA DE PEDIDOS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-5">Orden</th>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5">Fecha y Hora</th>
                <th className="px-6 py-5">Total</th>
                <th className="px-6 py-5">Estado</th>
                <th className="px-6 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {cargando ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-teal-500">sync</span>
                    <p className="font-medium text-sm">Cargando historial de ventas...</p>
                  </td>
                </tr>
              ) : pedidosTablaFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-3 opacity-20">receipt_long</span>
                    <p className="font-medium text-sm">No se encontraron pedidos con estos filtros.</p>
                  </td>
                </tr>
              ) : (
                pedidosTablaFiltrados.map(p => {
                  const total = p.total || (p.items || p.detalles || []).reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-900 dark:text-white">#{p.id}</td>
                      <td className="px-6 py-4">
                        <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">{p.usuario?.nombre} {p.usuario?.apellido}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">
                        {new Date(p.fechaPedido).toLocaleString('es-AR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})} hs
                      </td>
                      <td className="px-6 py-4 font-black text-teal-600 dark:text-teal-400">${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4"><BadgeEstado estado={p.estado} /></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setPedidoSeleccionado(p)} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors" title="Ver Detalle">
                          <span className="material-symbols-outlined text-[22px]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-500">
            Mostrando <span className="font-bold text-slate-700 dark:text-slate-300">{pedidos.length}</span> de <span className="font-bold text-slate-700 dark:text-slate-300">{totalElementos}</span> pedidos
          </p>
          
          <div className="flex gap-2">
            <button
              disabled={paginaActual === 0}
              onClick={() => cargarDatos(paginaActual - 1)}
              className="px-4 py-2 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
            >
              Anterior
            </button>

            <span className="px-4 py-2 text-sm font-black text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
              Pág. {paginaActual + 1} de {totalPaginas > 0 ? totalPaginas : 1}
            </span>

            <button
              disabled={paginaActual >= totalPaginas - 1 || totalPaginas === 0}
              onClick={() => cargarDatos(paginaActual + 1)}
              className="px-4 py-2 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* RENDERIZAMOS EL MODAL EXTERNO DE PUNTO DE VENTA */}
      {mostrarModalNuevo && (
        <ModalNuevoPedido 
          onClose={() => setMostrarModalNuevo(false)} 
          onGuardadoExitoso={() => {
            setMostrarModalNuevo(false);
            cargarDatos(0); // Volvemos a la página 1 para ver el pedido nuevo
          }}
        />
      )}

      {/* MODAL DE DETALLE DE PEDIDO (Solo visualización) */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-600">receipt_long</span>
                  Pedido #{pedidoSeleccionado.id}
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  A nombre de {pedidoSeleccionado.usuario?.nombre} {pedidoSeleccionado.usuario?.apellido}
                </p>
              </div>
              <button onClick={() => setPedidoSeleccionado(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                  Productos Comprados
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  {(pedidoSeleccionado.items || pedidoSeleccionado.detalles || []).map(item => (
                    <div key={item.id} className="p-4 flex justify-between items-center text-sm hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="size-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black text-slate-600 dark:text-slate-400">{item.cantidad}x</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.producto?.nombre}</span>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">${(item.precioUnitario * item.cantidad).toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  Gestionar Estado
                </h3>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {['PENDIENTE', 'PAGADO', 'ENTREGADO', 'CANCELADO'].map(est => (
                      <button 
                        key={est} 
                        onClick={() => actualizarEstado(pedidoSeleccionado.id, est)} 
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${
                          pedidoSeleccionado.estado === est 
                            ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md transform scale-105' 
                            : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {est}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => eliminarPedido(pedidoSeleccionado.id)} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 text-red-600 border border-red-200 dark:border-red-800/50 rounded-xl text-xs font-black tracking-widest transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete_forever</span> 
                    ELIMINAR
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantallaPedidos;