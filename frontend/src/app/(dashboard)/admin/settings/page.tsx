'use client';

import { useState } from 'react';
import { Save, Bell, Shield, Paintbrush, Globe, Smartphone, Check } from 'lucide-react';
import { toast } from 'sonner';

type SettingsTab = 'general' | 'notifications' | 'security' | 'appearance' | 'student-app';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { key: 'general' as const, label: 'General', icon: Globe },
    { key: 'notifications' as const, label: 'Notificaciones', icon: Bell },
    { key: 'security' as const, label: 'Seguridad', icon: Shield },
    { key: 'appearance' as const, label: 'Apariencia', icon: Paintbrush },
    { key: 'student-app' as const, label: 'App Estudiante', icon: Smartphone },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Configuracion guardada correctamente');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configuracion del Sistema</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Administra las preferencias generales del comedor y la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Navigation */}
        <div className="flex flex-wrap md:flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-lg font-medium transition-colors text-xs md:text-sm ${
                  activeTab === tab.key
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={16} className="md:w-[18px] md:h-[18px]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 sm:p-8 transition-colors">
          {/* General */}
          {activeTab === 'general' && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">Configuracion General</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nombre de la Institucion</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      defaultValue="Universidad Nacional de Trujillo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nombre del Sistema</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      defaultValue="UNT Comedor"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Horarios por Defecto</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Desayuno', start: '07:00', end: '09:00' },
                      { label: 'Almuerzo', start: '12:00', end: '14:00' },
                      { label: 'Cena', start: '19:00', end: '21:00' },
                    ].map((shift) => (
                      <div key={shift.label} className="p-4 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">{shift.label}</span>
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          <input type="time" defaultValue={shift.start} className="px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm min-w-0" />
                          <span className="text-slate-400 text-xs">a</span>
                          <input type="time" defaultValue={shift.end} className="px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm min-w-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Capacidad del Comedor</label>
                  <input
                    type="number"
                    className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    defaultValue={200}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Numero maximo de comensales por turno</p>
                </div>
              </div>
            </div>
          )}

          {/* Notificaciones */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">Notificaciones</h2>
              <div className="space-y-5">
                {[
                  { id: 'new-rating', label: 'Nueva valoracion recibida', desc: 'Notificar cuando un estudiante deja una valoracion', defaultChecked: true },
                  { id: 'low-rating', label: 'Alerta de valoracion baja', desc: 'Notificar cuando un menu recibe calificacion menor a 2 estrellas', defaultChecked: true },
                  { id: 'daily-summary', label: 'Resumen diario', desc: 'Enviar resumen de valoraciones al final del dia', defaultChecked: false },
                  { id: 'menu-reminder', label: 'Recordatorio de menu', desc: 'Notificar si no se ha publicado el menu del dia antes de las 8am', defaultChecked: true },
                  { id: 'new-user', label: 'Nuevo registro', desc: 'Notificar cuando un nuevo estudiante se registra', defaultChecked: false },
                  { id: 'weekly-report', label: 'Reporte semanal', desc: 'Enviar reporte de metricas cada lunes', defaultChecked: true },
                ].map((item) => (
                  <label key={item.id} className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={item.defaultChecked}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </label>
                ))}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Canal de notificacion</label>
                  <select className="w-full sm:w-64 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                    <option>Solo en plataforma</option>
                    <option>Email + plataforma</option>
                    <option>Solo email</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Seguridad */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">Seguridad</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Expiracion del token JWT</label>
                  <select defaultValue="7d" className="w-full sm:w-64 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                    <option value="1d">1 dia</option>
                    <option value="3d">3 dias</option>
                    <option value="7d">7 dias</option>
                    <option value="30d">30 dias</option>
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tiempo antes de que el usuario deba iniciar sesion nuevamente</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Intentos maximos de login</label>
                  <input
                    type="number"
                    defaultValue={5}
                    min={3}
                    max={10}
                    className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bloquear cuenta temporalmente tras superar este limite</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rate limiting (requests/15min)</label>
                  <input
                    type="number"
                    defaultValue={100}
                    min={50}
                    className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Numero maximo de requests por IP cada 15 minutos</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Politicas de contrasena</h3>
                  {[
                    { id: 'min-length', label: 'Minimo 6 caracteres', defaultChecked: true },
                    { id: 'uppercase', label: 'Requiere mayuscula', defaultChecked: true },
                    { id: 'number', label: 'Requiere numero', defaultChecked: true },
                    { id: 'special', label: 'Requiere caracter especial', defaultChecked: false },
                  ].map((policy) => (
                    <label key={policy.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={policy.defaultChecked}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500/20"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{policy.label}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">CORS - Origenes permitidos</h3>
                  <textarea
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-mono"
                    rows={3}
                    defaultValue={"http://localhost:3000\nhttps://unt-comedor.vercel.app"}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Un origen por linea</p>
                </div>
              </div>
            </div>
          )}

          {/* Apariencia */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">Apariencia</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Tema del panel admin</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'dark', label: 'Oscuro', desc: 'Tema oscuro por defecto', color: 'bg-slate-900' },
                      { key: 'light', label: 'Claro', desc: 'Tema claro', color: 'bg-white border border-slate-200' },
                      { key: 'system', label: 'Sistema', desc: 'Seguir preferencia del sistema', color: 'bg-gradient-to-r from-slate-900 to-white' },
                    ].map((theme) => (
                      <label key={theme.key} className="relative flex flex-col items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 cursor-pointer transition-colors">
                        <input type="radio" name="theme" value={theme.key} defaultChecked={theme.key === 'dark'} className="sr-only peer" />
                        <div className={`w-12 h-8 rounded-md ${theme.color} mb-3 shadow-sm`} />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{theme.label}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{theme.desc}</span>
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white items-center justify-center hidden peer-checked:flex">
                          <Check size={12} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Color primario</label>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { color: '#4f46e5', name: 'Indigo' },
                      { color: '#2563eb', name: 'Azul' },
                      { color: '#7c3aed', name: 'Violeta' },
                      { color: '#059669', name: 'Esmeralda' },
                      { color: '#dc2626', name: 'Rojo' },
                      { color: '#d97706', name: 'Ambar' },
                    ].map((c) => (
                      <label key={c.color} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                        <input type="radio" name="primary-color" value={c.color} defaultChecked={c.color === '#4f46e5'} className="sr-only peer" />
                        <div
                          className="w-10 h-10 rounded-full shadow-sm ring-2 ring-transparent peer-checked:ring-offset-2 peer-checked:ring-indigo-500 transition-all group-hover:scale-110"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Densidad de la interfaz</label>
                  <select defaultValue="normal" className="w-full sm:w-64 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                    <option value="compact">Compacta</option>
                    <option value="normal">Normal</option>
                    <option value="comfortable">Espaciosa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Logo del sistema</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
                      <img src="/admin-logo.png" alt="Logo actual" className="w-12 h-12 object-contain" />
                    </div>
                    <button type="button" className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      Cambiar logo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* App Estudiante */}
          {activeTab === 'student-app' && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">Configuracion App Estudiante</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Funciones habilitadas</h3>
                  {[
                    { id: 'ratings', label: 'Valoraciones', desc: 'Permitir que los estudiantes valoren los menus', defaultChecked: true },
                    { id: 'comments', label: 'Comentarios', desc: 'Permitir comentarios en las valoraciones', defaultChecked: true },
                    { id: 'history', label: 'Historial de menus', desc: 'Mostrar menus de dias anteriores', defaultChecked: true },
                    { id: 'nutrition', label: 'Informacion nutricional', desc: 'Mostrar calorias y macronutrientes', defaultChecked: true },
                    { id: 'images', label: 'Imagenes del menu', desc: 'Mostrar fotos de los platos', defaultChecked: true },
                  ].map((feat) => (
                    <label key={feat.id} className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={feat.defaultChecked}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500/20"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{feat.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{feat.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Limite de valoracion por menu</label>
                  <select className="w-full sm:w-64 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                    <option value="1">1 valoracion por menu (actual)</option>
                    <option value="edit">Permitir editar valoracion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mensaje de bienvenida</label>
                  <textarea
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                    rows={3}
                    defaultValue="Bienvenido al comedor universitario. Consulta el menu del dia y dejanos tu valoracion para mejorar el servicio."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Enlace para generar codigo</label>
                  <input
                    type="url"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    defaultValue="https://bigbarcode.11zon.com/es/barcode-generator/"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">URL del generador de codigos de barras para estudiantes</p>
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
