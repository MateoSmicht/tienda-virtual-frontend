import { useState, useEffect } from 'react';
import { fetchConToken } from '../services/api';

const ModalEditarPerfil = ({ onClose }) => {
  const [pestañaActiva, setPestañaActiva] = useState('datos'); // 'datos' o 'seguridad'

  // Estados Datos Personales
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');

  // Estados Seguridad (Contraseña)
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  
  // Estados UI
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Cargar datos actuales al abrir el modal
  useEffect(() => {
    const cargarMisDatos = async () => {
      try {
        const res = await fetchConToken('/user/me'); // Ajustá si tu ruta base es distinta
        if (res.ok) {
          const data = await res.json();
          setNombre(data.nombre || '');
          setApellido(data.apellido || '');
          setEmail(data.email || '');
          setTelefono(data.telefono || '');
        }
      } catch (err) {
        console.error("Error cargando perfil", err);
      } finally {
        setCargandoDatos(false);
      }
    };
    cargarMisDatos();
  }, []);

  const manejarGuardarDatos = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setCargando(true);

    try {
      const res = await fetchConToken('/user/me', {
        method: 'PUT',
        body: JSON.stringify({ nombre, apellido, email, telefono })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al actualizar perfil');

      setExito('¡Datos personales actualizados!');
      // Actualizamos el localStorage para que el Header cambie el nombre/letra al instante
      localStorage.setItem('usuarioEmail', email);
      
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioPassword = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!passwordActual || !passwordNueva || !confirmarPassword) {
      return setError('Todos los campos son obligatorios.');
    }
    if (passwordNueva !== confirmarPassword) {
      return setError('Las contraseñas nuevas no coinciden.');
    }
    if (passwordNueva.length < 6) {
      return setError('La nueva contraseña debe tener al menos 6 caracteres.');
    }

    setCargando(true);
    try {
      const res = await fetchConToken('/user/me/password', {
        method: 'PUT',
        body: JSON.stringify({ passwordActual, passwordNueva })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al cambiar la contraseña');

      setExito('¡Contraseña actualizada con éxito!');
      setPasswordActual('');
      setPasswordNueva('');
      setConfirmarPassword('');
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Cabecera del Modal */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600">manage_accounts</span>
              Mi Perfil
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Pestañas (Tabs) */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => {setPestañaActiva('datos'); setError(''); setExito('');}}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${pestañaActiva === 'datos' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Datos Personales
          </button>
          <button 
            onClick={() => {setPestañaActiva('seguridad'); setError(''); setExito('');}}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${pestañaActiva === 'seguridad' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Seguridad
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span> {error}
            </div>
          )}
          {exito && (
            <div className="mb-4 p-3 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span> {exito}
            </div>
          )}

          {cargandoDatos ? (
            <div className="py-10 flex justify-center text-teal-500"><span className="material-symbols-outlined animate-spin text-4xl">sync</span></div>
          ) : (
            <>
              {/* FORMULARIO DATOS PERSONALES */}
              {pestañaActiva === 'datos' && (
                <form onSubmit={manejarGuardarDatos} className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nombre</label>
                      <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm focus:border-teal-500 dark:text-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Apellido</label>
                      <input type="text" value={apellido} onChange={e => setApellido(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm focus:border-teal-500 dark:text-white transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Correo Electrónico</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm focus:border-teal-500 dark:text-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Teléfono</label>
                    <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm focus:border-teal-500 dark:text-white transition-colors" />
                  </div>
                  
                  <button type="submit" disabled={cargando} className="w-full mt-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl transition-all shadow-lg shadow-teal-500/30 disabled:opacity-50 flex justify-center items-center gap-2">
                    {cargando ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined text-[20px]">save</span>}
                    Guardar Datos
                  </button>
                </form>
              )}

              {/* FORMULARIO SEGURIDAD */}
              {pestañaActiva === 'seguridad' && (
                <form onSubmit={manejarCambioPassword} className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Contraseña Actual</label>
                    <input type="password" value={passwordActual} onChange={e => setPasswordActual(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm focus:border-teal-500 dark:text-white transition-colors" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nueva Contraseña</label>
                    <input type="password" value={passwordNueva} onChange={e => setPasswordNueva(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm focus:border-teal-500 dark:text-white transition-colors mb-3" />
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Confirmar Contraseña</label>
                    <input type="password" value={confirmarPassword} onChange={e => setConfirmarPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm focus:border-teal-500 dark:text-white transition-colors" />
                  </div>
                  
                  <button type="submit" disabled={cargando} className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-black rounded-xl transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                    {cargando ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined text-[20px]">lock_reset</span>}
                    Actualizar Contraseña
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEditarPerfil;