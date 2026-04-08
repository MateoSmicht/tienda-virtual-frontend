import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchConToken } from '../services/api';

export const PantallaMisPedidos = () => {
    const [misPedidos, setMisPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarPedidos = async () => {
            try {
                const res = await fetchConToken('/pedidos/mis-pedidos');
                if (res.ok) {
                    const data = await res.json();
                    setMisPedidos(data);
                }
            } catch (err) {
                console.error("Error cargando pedidos", err);
            } finally {
                setCargando(false);
            }
        };
        cargarPedidos();
        window.scrollTo(0, 0);
    }, []);

    const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

    const getColorEstado = (estado) => {
        switch(estado?.toUpperCase()) {
            case 'PENDIENTE': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'PAGADO': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'ENVIADO': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'ENTREGADO': return 'bg-green-100 text-green-700 border-green-200';
            case 'CANCELADO': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display pt-8 pb-20">
            <div className="max-w-4xl mx-auto px-4 md:px-8">
                
                {/* Encabezado */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-2 text-base text-slate-500 font-medium">
                        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[22px]">home</span> Inicio
                        </Link>
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        <span className="text-slate-800 dark:text-slate-200">Mis Pedidos</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-4xl">receipt_long</span>
                        Historial de Compras
                    </h1>
                </div>

                {/* Lista de Pedidos */}
                {cargando ? (
                    <div className="py-20 flex justify-center text-primary">
                        <span className="material-symbols-outlined animate-spin text-5xl">sync</span>
                    </div>
                ) : misPedidos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl p-12 py-20 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-6xl text-primary/50">shopping_bag</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Aún no tenés compras</h2>
                        <p className="text-slate-500 mb-8 max-w-md">Tu historial de pedidos aparecerá acá una vez que realices tu primera compra.</p>
                        <Link to="/" className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-1">
                            Ir a la tienda
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {misPedidos.map(pedido => (
                            <div key={pedido.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                                <div className="flex flex-wrap justify-between items-start gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-sm font-black text-slate-400">PEDIDO #{pedido.id}</p>
                                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${getColorEstado(pedido.estado)}`}>
                                                {pedido.estado}
                                            </span>
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {new Date(pedido.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 font-medium mb-1">{pedido.items?.length || 0} artículos</p>
                                        <p className="text-xl font-black text-primary">{formatPrice(pedido.total)}</p>
                                    </div>
                                </div>
                                
                                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
                                    <p className="text-sm text-slate-500">Método de pago: <strong className="text-slate-700 dark:text-slate-300">{pedido.metodoPago}</strong></p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};