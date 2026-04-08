// src/components/store/CategoriaCard.jsx

export const CategoriaCard = ({ categoria, isActive, onClick }) => {
    
    // TRUCO TEMPORAL: Mientras agregamos el campo "icono" al backend, 
    // le asignamos uno automáticamente según el nombre.
    const getIconoTemporal = (nombre) => {
        const nom = nombre.toLowerCase();
        if (nom.includes('perfum')) return 'fragrance';
        if (nom.includes('limpieza')) return 'sanitizer';
        if (nom.includes('cuidado') || nom.includes('personal')) return 'face_5';
        if (nom.includes('hogar')) return 'home_repair_service';
        return 'category'; // Ícono por defecto
    };

    // Usamos el icono que venga del backend, o el temporal
    const icono = categoria.icono || getIconoTemporal(categoria.nombre);

    return (
        <button 
            onClick={() => onClick(categoria)}
            className={`flex shrink-0 flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                isActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-transparent bg-white shadow-sm hover:border-primary/20 dark:bg-slate-800'
            }`}
        >
            <div className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm ${
                isActive 
                    ? 'bg-primary text-white' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            }`}>
                <span className="material-symbols-outlined">{icono}</span>
            </div>
            <span className="text-sm font-bold">{categoria.nombre}</span>
        </button>
    );
};