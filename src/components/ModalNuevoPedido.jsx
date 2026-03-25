import { useState, useEffect, useRef } from 'react';
import { fetchConToken } from '../services/api';

const ModalNuevoPedido = ({ onClose, onGuardadoExitoso }) => {
  // ==========================================
  // ESTADOS
  // ==========================================
  // Clientes (Búsqueda Local)
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [nuevoClienteId, setNuevoClienteId] = useState('');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false);

  // Productos (Backend + Escáner)
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [resultadosBusquedaProducto, setResultadosBusquedaProducto] = useState([]);
  const [mostrarDropdownProducto, setMostrarDropdownProducto] = useState(false);
  
  // Carrito y Pago
  const [nuevosItemsCarrito, setNuevosItemsCarrito] = useState([]);
  const [nuevoMetodoPago, setNuevoMetodoPago] = useState('EFECTIVO');
  const [guardandoPedido, setGuardandoPedido] = useState(false);

  // Calculadora de Vuelto
  const [mostrarModalVuelto, setMostrarModalVuelto] = useState(false);
  const [montoAbonado, setMontoAbonado] = useState('');

  // Link de Pago (Mercado Pago)
  const [linkMercadoPago, setLinkMercadoPago] = useState(null);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const dropdownClienteRef = useRef(null);
  const dropdownProductoRef = useRef(null);


  const totalDelNuevoCarrito = nuevosItemsCarrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const cantidadTotalArticulos = nuevosItemsCarrito.reduce((acc, item) => acc + item.cantidad, 0); // NUEVO CONTADOR

  // ==========================================
  // EFECTOS INICIALES
  // ==========================================
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const res = await fetchConToken('/user'); 
        if (res.ok) {
          const data = await res.json();
          setListaUsuarios(data);
        }
      } catch (error) {
        console.error("Error cargando la lista de clientes:", error);
      }
    };
    cargarUsuarios();

    const handleClickFuera = (e) => {
      if (dropdownClienteRef.current && !dropdownClienteRef.current.contains(e.target)) setMostrarDropdownCliente(false);
      if (dropdownProductoRef.current && !dropdownProductoRef.current.contains(e.target)) setMostrarDropdownProducto(false);
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  // ==========================================
  // LÓGICA DE CLIENTES (Filtro Local)
  // ==========================================
  const manejarBusquedaCliente = (e) => {
    const termino = e.target.value;
    setBusquedaCliente(termino);
    setNuevoClienteId(''); 

    if (termino.trim().length > 0) {
      const filtrados = listaUsuarios.filter(u => 
        (u.nombre || '').toLowerCase().includes(termino.toLowerCase()) ||
        (u.apellido || '').toLowerCase().includes(termino.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(termino.toLowerCase())
      );
      setUsuariosFiltrados(filtrados);
      setMostrarDropdownCliente(true);
    } else {
      setUsuariosFiltrados([]);
      setMostrarDropdownCliente(false);
    }
  };

  const seleccionarCliente = (cliente) => {
    setNuevoClienteId(cliente.id);
    setBusquedaCliente(`${cliente.nombre || ''} ${cliente.apellido || ''} (${cliente.email || ''})`);
    setMostrarDropdownCliente(false);
  };

  // ==========================================
  // LÓGICA DE PRODUCTOS (Backend + Escáner)
  // ==========================================
  useEffect(() => {
    if (!busquedaProducto.trim()) {
      setResultadosBusquedaProducto([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetchConToken(`/productos?todos=true&busqueda=${encodeURIComponent(busquedaProducto)}&page=0&size=10`);
        const data = await res.json();
        setResultadosBusquedaProducto(data.content || []);
      } catch (error) {
        console.error("Error buscando productos:", error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [busquedaProducto]);

  const handleKeyDownProducto = async (e) => {
    if (e.key === 'Enter' && busquedaProducto.trim() !== '') {
      e.preventDefault();
      try {
        const res = await fetchConToken(`/productos?todos=true&busqueda=${encodeURIComponent(busquedaProducto.trim())}&page=0&size=5`);
        const data = await res.json();
        const encontrados = data.content || [];

        setResultadosBusquedaProducto(encontrados);

        if (encontrados.length === 1) {
          agregarItemAlCarrito(encontrados[0]);
        }
      } catch (error) {
        console.error("Error en búsqueda rápida:", error);
      }
    }
  };

  const agregarItemAlCarrito = (producto) => {
    const existe = nuevosItemsCarrito.find(item => item.productoId === producto.id);
    if (existe) {
      setNuevosItemsCarrito(nuevosItemsCarrito.map(item => 
        item.productoId === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setNuevosItemsCarrito([...nuevosItemsCarrito, {
        productoId: producto.id,
        nombre: producto.nombre,
        codigo: producto.codigoBarra || producto.id,
        precio: producto.precioOferta ? producto.precioOferta : producto.precio,
        cantidad: 1
      }]);
    }
    setBusquedaProducto('');
    setResultadosBusquedaProducto([]);
    setMostrarDropdownProducto(false);
  };

  const cambiarCantidadItem = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setNuevosItemsCarrito(nuevosItemsCarrito.map(item => 
      item.productoId === productoId ? { ...item, cantidad: Number(nuevaCantidad) } : item
    ));
  };

  const eliminarItemDelCarrito = (prodId) => {
    setNuevosItemsCarrito(nuevosItemsCarrito.filter(item => item.productoId !== prodId));
  };

  // ==========================================
  // LÓGICA DE COBRO Y VUELTO
  // ==========================================
  const iniciarCheckout = () => {
    if (!nuevoClienteId) return alert("Por favor, selecciona un cliente.");
    if (nuevosItemsCarrito.length === 0) return alert("Debes agregar al menos un producto al pedido.");

    if (nuevoMetodoPago === 'EFECTIVO') {
      setMontoAbonado(totalDelNuevoCarrito);
      setMostrarModalVuelto(true);
    } else {
      guardarEnBackend();
    }
  };

  const guardarEnBackend = async () => {
    setMostrarModalVuelto(false);
    setGuardandoPedido(true);

    const payload = {
      usuarioId: Number(nuevoClienteId),
      metodoPago: nuevoMetodoPago,
      items: nuevosItemsCarrito.map(item => ({ productoId: item.productoId, cantidad: item.cantidad }))
    };

    try {
      const response = await fetchConToken('/pedidos', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.linkDePago) {
          setLinkMercadoPago(data.linkDePago);
        } else {
          onGuardadoExitoso(); 
        }
      } else {
        alert("Error al crear el pedido.");
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    } finally {
      setGuardandoPedido(false);
    }
  };

  const copiarAlPortapapeles = async () => {
    try {
      await navigator.clipboard.writeText(linkMercadoPago);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2000); 
    } catch (err) {
      console.error('Error al copiar: ', err);
    }
  };

  // =========================================================
  // RENDER: PANTALLA DE ÉXITO (MERCADO PAGO)
  // =========================================================
  if (linkMercadoPago) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col p-8 text-center">
          <div className="size-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[40px]">check_circle</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">¡Pedido Generado!</h2>
          <p className="text-slate-500 mb-8">El pedido se registró correctamente. Copiá el link de Mercado Pago y envíaselo al cliente para que pueda abonar.</p>
          
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-8">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-300 truncate font-medium flex-1 text-left select-all">
                {linkMercadoPago}
              </span>
              <button 
                onClick={copiarAlPortapapeles}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  linkCopiado 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {linkCopiado ? 'check' : 'content_copy'}
                </span>
                {linkCopiado ? '¡Copiado!' : 'Copiar Link'}
              </button>
            </div>
          </div>

          <button 
            onClick={onGuardadoExitoso} 
            className="w-full py-4 rounded-xl font-bold text-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            Cerrar y volver al panel
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER: TERMINAL DE PUNTO DE VENTA NORMAL
  // =========================================================
  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col h-[90vh]">
          
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-2xl">point_of_sale</span>
              Terminal de Venta
              {/* 👇 NUEVO: Etiqueta con el contador de artículos arriba */}
              {cantidadTotalArticulos > 0 && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-sm font-bold border border-teal-200 dark:border-teal-800">
                  {cantidadTotalArticulos} {cantidadTotalArticulos === 1 ? 'item' : 'items'}
                </span>
              )}
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            
            {/* COLUMNA IZQUIERDA: BUSCADOR Y TABLA */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden border-r border-slate-100 dark:border-slate-800">
              
              <div className="relative mb-6 z-20" ref={dropdownProductoRef}>
                <div className="relative">
                  <span className="material-symbols-outlined absolute inset-y-0 left-0 pl-4 flex items-center text-teal-600 text-2xl pointer-events-none">barcode_scanner</span>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="Escanea el código o buscá por nombre..."
                    value={busquedaProducto}
                    onChange={(e) => {
                      setBusquedaProducto(e.target.value);
                      setMostrarDropdownProducto(true);
                    }}
                    onFocus={() => setMostrarDropdownProducto(true)}
                    onKeyDown={handleKeyDownProducto}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-lg text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-colors shadow-inner"
                  />
                </div>
                
                {mostrarDropdownProducto && busquedaProducto && (
                  <div className="absolute w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                    {resultadosBusquedaProducto.length === 0 ? (
                      <div className="p-4 text-slate-500 text-center">Buscando producto...</div>
                    ) : (
                      resultadosBusquedaProducto.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => agregarItemAlCarrito(p)} 
                          className="flex justify-between items-center p-4 hover:bg-teal-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                        >
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 text-lg">{p.nombre}</div>
                            <div className="text-sm text-slate-400">Cod: {p.codigoBarra || p.id}</div>
                          </div>
                          <div className="font-black text-teal-600 text-lg">
                            ${p.precioOferta ? p.precioOferta.toLocaleString() : p.precio.toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 sticky top-0 z-10">
                      <tr>
                        <th className="px-5 py-4 font-bold w-20">Cód.</th>
                        <th className="px-5 py-4 font-bold text-base">Producto</th>
                        <th className="px-5 py-4 font-bold w-28">Precio U.</th>
                        <th className="px-5 py-4 font-bold w-32 text-center">Cantidad</th>
                        <th className="px-5 py-4 font-bold w-32 text-right">Subtotal</th>
                        <th className="px-5 py-4 w-14"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {nuevosItemsCarrito.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-20 text-slate-400">
                            <span className="material-symbols-outlined text-6xl mb-4 opacity-30">shopping_cart</span>
                            <p className="text-lg">El ticket está vacío</p>
                            <p className="text-sm mt-1">Escaneá o buscá un producto arriba para empezar</p>
                          </td>
                        </tr>
                      ) : (
                        nuevosItemsCarrito.map(item => (
                          <tr key={item.productoId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="px-5 py-4 text-sm text-slate-400">{item.codigo}</td>
                            <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200 text-base">{item.nombre}</td>
                            <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-medium">${item.precio?.toLocaleString()}</td>
                            <td className="px-5 py-4">
                              <input 
                                type="number" 
                                min="1" 
                                value={item.cantidad} 
                                onChange={(e) => cambiarCantidadItem(item.productoId, e.target.value)} 
                                className="w-full p-2 text-center bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-teal-500 font-bold text-lg" 
                              />
                            </td>
                            <td className="px-5 py-4 font-black text-slate-800 dark:text-white text-right text-lg">
                              ${(item.precio * item.cantidad).toLocaleString()}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button 
                                onClick={() => eliminarItemDelCarrito(item.productoId)} 
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Eliminar producto"
                              >
                                <span className="material-symbols-outlined text-[22px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: CLIENTE, PAGO Y TOTAL */}
            <div className="w-full lg:w-[400px] bg-slate-50 dark:bg-slate-800/30 p-6 flex flex-col shrink-0 overflow-y-auto">
              
              <div className="space-y-6 flex-1">
                
                <div className="relative z-30" ref={dropdownClienteRef}>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Datos del Cliente
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">search</span>
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre, apellido o email..."
                      value={busquedaCliente}
                      onChange={manejarBusquedaCliente} 
                      onFocus={() => {
                          if (usuariosFiltrados.length > 0) setMostrarDropdownCliente(true);
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border ${nuevoClienteId ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl text-slate-700 dark:text-white outline-none focus:border-teal-500 transition-all`}
                    />
                    {nuevoClienteId && (
                      <span className="material-symbols-outlined absolute inset-y-0 right-0 pr-3 flex items-center text-teal-500 pointer-events-none">check_circle</span>
                    )}
                  </div>

                  {mostrarDropdownCliente && (
                    <div className="absolute w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {usuariosFiltrados.length === 0 ? (
                        <div className="p-4 text-sm text-slate-500 text-center">No se encontraron clientes...</div>
                      ) : (
                        usuariosFiltrados.map(u => (
                          <div 
                            key={u.id} 
                            onClick={() => seleccionarCliente(u)} 
                            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0"
                          >
                            <div className="font-bold text-slate-800 dark:text-slate-200">{u.nombre} {u.apellido}</div>
                            <div className="text-sm text-slate-500">{u.email}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                    Método de Pago
                  </label>
                  <select 
                    value={nuevoMetodoPago} 
                    onChange={(e) => setNuevoMetodoPago(e.target.value)} 
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white outline-none focus:border-teal-500 font-medium appearance-none"
                  >
                    <option value="EFECTIVO">Efectivo / Mostrador</option>
                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                    <option value="MERCADO_PAGO">Mercado Pago</option>
                  </select>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-end mb-6">
                  {/* 👇 NUEVO: Mostrar cantidad debajo del Total */}
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-sm block">Total a Cobrar</span>
                    <span className="text-xs font-medium text-slate-400 mt-1">{cantidadTotalArticulos} artículo(s) en total</span>
                  </div>
                  <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                    ${totalDelNuevoCarrito.toLocaleString()}
                  </span>
                </div>
                
                <button 
                  onClick={iniciarCheckout} 
                  disabled={guardandoPedido || nuevosItemsCarrito.length === 0 || !nuevoClienteId} 
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 
                    ${(guardandoPedido || nuevosItemsCarrito.length === 0 || !nuevoClienteId) 
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/40 hover:scale-[1.02] active:scale-95'}`}
                >
                  {guardandoPedido ? (
                    <>Procesando...</>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[24px]">payments</span> 
                      Confirmar Venta
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL SECUNDARIO: CALCULADORA DE VUELTO (Solo para Efectivo) */}
      {/* ========================================================= */}
      {mostrarModalVuelto && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 text-center">Cobro en Efectivo</h3>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-1">Total a Pagar</span>
              <span className="text-3xl font-black text-teal-600">${totalDelNuevoCarrito.toLocaleString()}</span>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Abona con:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-xl">$</span>
                  <input 
                    type="number"
                    autoFocus
                    value={montoAbonado}
                    onChange={(e) => setMontoAbonado(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Su Vuelto:</span>
                <span className={`text-2xl font-black ${Number(montoAbonado) - totalDelNuevoCarrito < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                  ${(Number(montoAbonado) - totalDelNuevoCarrito).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setMostrarModalVuelto(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Volver
              </button>
              <button 
                onClick={guardarEnBackend}
                disabled={Number(montoAbonado) < totalDelNuevoCarrito}
                className="flex-[2] py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 transition-colors shadow-lg shadow-teal-500/30"
              >
                Cerrar Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalNuevoPedido;