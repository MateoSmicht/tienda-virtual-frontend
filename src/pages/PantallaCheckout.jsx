import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchConToken } from '../services/api'; 

export const PantallaCheckout = () => {
    const { carrito, subtotal, vaciarCarrito, eliminarDelCarrito, actualizarCantidad } = useCart();
    const [metodoPago, setMetodoPago] = useState('MERCADO_PAGO');
    const [procesando, setProcesando] = useState(false);
    const navigate = useNavigate();

    const costoEnvio = carrito.length > 0 ? 12.00 : 0;
    const totalFinal = subtotal + costoEnvio;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    };

    const manejarCompra = async () => {
        if (carrito.length === 0) return alert("Tu carrito está vacío.");
        
        // ==========================================
        // 1. EL FRENO: VALIDACIÓN DE SESIÓN (NUEVO)
        // ==========================================
        const token = localStorage.getItem('token') || localStorage.getItem('vperfumery_token');
        const usuarioId = localStorage.getItem('usuarioId');

        if (!token || !usuarioId) {
            // No está logueado, lo mandamos al login de clientes.
            // Como después el login hace un navigate(-1), va a volver a esta misma pantalla.
            navigate('/login');
            return; // Cortamos la ejecución acá para que no haga el fetch
        }

        // ==========================================
        // 2. SI ESTÁ LOGUEADO, SEGUIMOS CON LA COMPRA
        // ==========================================
        setProcesando(true);

        // Armamos el JSON según tu DTO de Spring Boot
        const payload = {
            // Ahora sí podemos usar el ID real del usuario con total seguridad
            usuarioId: usuarioId, 
            metodoPago: metodoPago,
            items: carrito.map(item => ({
                productoId: item.id,
                cantidad: item.cantidad
            }))
        };

        try {
            // Le pegamos a tu API
            const response = await fetchConToken('/pedidos', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json(); // data es tu PedidoResponseDTO

                // LA MAGIA DE MERCADO PAGO
                if (data.linkDePago) {
                    // Como es el cliente comprando, lo redirigimos directo a pagar
                    window.location.href = data.linkDePago;
                    
                    // Vaciamos el carrito porque ya se fue a pagar
                    vaciarCarrito(); 
                } else {
                    // Si eligió efectivo o transferencia, le mostramos el éxito
                    alert(`¡Pedido #${data.idPedido} generado con éxito! Nos contactaremos a la brevedad.`);
                    vaciarCarrito();
                    navigate('/'); // Lo mandamos de vuelta a la tienda
                }
            } else {
                alert("Hubo un error al procesar tu pedido en el servidor.");
            }
        } catch (error) {
            console.error("Error al generar pedido:", error);
            alert("Error de conexión. Intentá nuevamente.");
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <header className="flex items-center justify-between border-b border-primary/10 bg-white dark:bg-slate-900 px-6 md:px-40 py-4">
                <div className="flex items-center gap-4">
                    <div className="text-primary"><span className="material-symbols-outlined text-3xl">shopping_cart_checkout</span></div>
                    <h2 className="text-lg font-bold">Finalizar Compra</h2>
                </div>
                <Link to="/" className="flex h-10 items-center justify-center rounded-lg bg-primary/10 px-3 text-primary hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined">close</span> Volver a la tienda
                </Link>
            </header>

            <main className="flex-1 px-6 md:px-40 py-8">
                <div className="max-w-[960px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* RESUMEN DEL PEDIDO */}
                    <div className="flex flex-col gap-6">
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Resumen del Pedido</h2>
                            <div className="space-y-4">
                                {carrito.length === 0 ? (
                                    <p className="text-slate-500 italic">No hay productos en el carrito.</p>
                                ) : (
                                    carrito.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-primary/5 shadow-sm group">
                                            <div 
                                                className="bg-center bg-no-repeat aspect-square bg-contain rounded-lg w-20 h-20 shrink-0 bg-white" 
                                                style={{ backgroundImage: `url("${item.imagenUrl || 'https://via.placeholder.com/150'}")` }}
                                            ></div>
                                            <div className="flex flex-1 flex-col justify-center">
                                                <p className="font-semibold line-clamp-1">{item.nombre}</p>
                                                
                                                {/* CONTROLES DE CANTIDAD */}
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                        <button 
                                                            onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                                            className="px-2.5 py-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">remove</span>
                                                        </button>
                                                        <span className="px-2 text-sm font-bold w-6 text-center">
                                                            {item.cantidad}
                                                        </span>
                                                        <button 
                                                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                                            className="px-2.5 py-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">add</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* PRECIO Y BOTÓN DE ELIMINAR */}
                                            <div className="shrink-0 flex flex-col items-end justify-between h-full py-1">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {formatPrice((item.esOferta ? item.precioOferta : item.precio) * item.cantidad)}
                                                </div>
                                                <button 
                                                    onClick={() => eliminarDelCarrito(item.id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 mt-2"
                                                    title="Eliminar del carrito"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* TOTALES */}
                            <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
                                <div className="flex justify-between py-2 text-sm text-slate-600 dark:text-slate-400">
                                    <p>Subtotal</p>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{formatPrice(subtotal)}</p>
                                </div>
                                <div className="flex justify-between py-2 text-sm text-slate-600 dark:text-slate-400">
                                    <p>Envío</p>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{formatPrice(costoEnvio)}</p>
                                </div>
                                <div className="h-px bg-primary/20 my-4"></div>
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-bold">Total a Pagar</p>
                                    <p className="text-primary text-2xl font-black">{formatPrice(totalFinal)}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* MÉTODOS DE PAGO */}
                    <div className="flex flex-col gap-6">
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Método de Pago</h2>
                            <div className="space-y-4">
                                
                                {/* 1. Opción Mercado Pago */}
                                <label className="relative flex cursor-pointer items-center justify-between rounded-xl border-2 border-primary/10 bg-white dark:bg-slate-800/50 p-4 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5 hover:border-primary/30">
                                    <div className="flex items-center gap-4">
                                        <div className="flex p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                            <span className="material-symbols-outlined">credit_card</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">Mercado Pago</p>
                                            <p className="text-sm text-slate-500">Tarjetas de crédito, débito o dinero en cuenta</p>
                                        </div>
                                    </div>
                                    <input type="radio" name="payment" value="MERCADO_PAGO" checked={metodoPago === 'MERCADO_PAGO'} onChange={() => setMetodoPago('MERCADO_PAGO')} className="w-5 h-5 text-primary focus:ring-primary" />
                                </label>

                                {/* 2. Opción Transferencia */}
                                <label className="relative flex cursor-pointer items-center justify-between rounded-xl border-2 border-primary/10 bg-white dark:bg-slate-800/50 p-4 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5 hover:border-primary/30">
                                    <div className="flex items-center gap-4">
                                        <div className="flex p-2 rounded-full bg-primary/10 text-primary"><span className="material-symbols-outlined">account_balance</span></div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">Transferencia Bancaria</p>
                                            <p className="text-sm text-slate-500">Transferencia directa a nuestra cuenta</p>
                                        </div>
                                    </div>
                                    <input type="radio" name="payment" value="TRANSFERENCIA" checked={metodoPago === 'TRANSFERENCIA'} onChange={() => setMetodoPago('TRANSFERENCIA')} className="w-5 h-5 text-primary focus:ring-primary" />
                                </label>

                                {/* Datos de Transferencia */}
                                {metodoPago === 'TRANSFERENCIA' && (
                                    <div className="mt-4 p-6 bg-slate-100 dark:bg-slate-800 rounded-xl border-l-4 border-primary animate-fade-in">
                                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Datos de la cuenta</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-semibold">CBU / CVU</p>
                                                <p className="font-mono font-medium text-slate-900 dark:text-white">0000003100012345678901</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-semibold">Alias</p>
                                                <p className="font-mono font-medium text-slate-900 dark:text-white">V.PERFUMERY.PAY</p>
                                            </div>
                                            <p className="text-xs text-slate-500 italic mt-2">Enviá el comprobante de pago por WhatsApp con tu número de pedido.</p>
                                        </div>
                                    </div>
                                )}

                                {/* 3. Opción Efectivo */}
                                <label className="relative flex cursor-pointer items-center justify-between rounded-xl border-2 border-primary/10 bg-white dark:bg-slate-800/50 p-4 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5 hover:border-primary/30">
                                    <div className="flex items-center gap-4">
                                        <div className="flex p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"><span className="material-symbols-outlined">payments</span></div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">Efectivo al recibir</p>
                                            <p className="text-sm text-slate-500">Abonás cuando te entregamos el pedido</p>
                                        </div>
                                    </div>
                                    <input type="radio" name="payment" value="EFECTIVO" checked={metodoPago === 'EFECTIVO'} onChange={() => setMetodoPago('EFECTIVO')} className="w-5 h-5 text-primary focus:ring-primary" />
                                </label>

                            </div>
                        </section>

                        <div className="mt-8">
                            <button 
                                onClick={manejarCompra} 
                                disabled={procesando || carrito.length === 0}
                                className="w-full bg-primary text-white py-4 px-6 rounded-xl font-bold text-lg hover:brightness-105 active:scale-[0.98] transition-all flex justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {procesando ? (
                                    <><span className="material-symbols-outlined animate-spin">sync</span> Procesando...</>
                                ) : (
                                    <><span className="material-symbols-outlined">lock</span> Pagar de forma segura</>
                                )}
                            </button>
                            {metodoPago === 'MERCADO_PAGO' && (
                                <p className="text-center text-[10px] text-slate-400 mt-3 font-semibold uppercase tracking-widest">
                                    Serás redirigido a Mercado Pago
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};