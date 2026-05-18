'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ticketService } from '@/services/ticket.service';
import type { Ticket, TicketStatus, TicketCategory, TicketPriority } from '@/types';
import { TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS, TICKET_CATEGORY_LABELS } from '@/types';
import { toast } from 'sonner';
import { Plus, ChevronLeft, MessageSquare, Send, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  IN_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400',
};

const STATUS_ICONS: Record<TicketStatus, React.ReactNode> = {
  OPEN: <AlertCircle size={12} />,
  IN_REVIEW: <Clock size={12} />,
  RESOLVED: <CheckCircle2 size={12} />,
  CLOSED: <CheckCircle2 size={12} />,
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-400',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function StudentTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);

  const [formCategory, setFormCategory] = useState<string>('');
  const [formPriority, setFormPriority] = useState<string>('MEDIUM');
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await ticketService.getMyTickets({ status: statusFilter || undefined });
      setTickets(res.data);
    } catch {
      toast.error('Error al cargar reclamos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [statusFilter]);

  const handleCreate = async () => {
    if (!formCategory || !formSubject || !formDescription) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    setCreating(true);
    try {
      await ticketService.create({ category: formCategory, priority: formPriority, subject: formSubject, description: formDescription });
      toast.success('Reclamo creado exitosamente');
      setShowCreate(false);
      setFormCategory('');
      setFormPriority('MEDIUM');
      setFormSubject('');
      setFormDescription('');
      fetchTickets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear reclamo');
    } finally {
      setCreating(false);
    }
  };

  const openDetail = async (ticket: Ticket) => {
    try {
      const full = await ticketService.getById(ticket.id);
      setSelectedTicket(full);
    } catch {
      toast.error('Error al cargar detalle');
    }
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || !responseMessage.trim()) return;
    setSendingResponse(true);
    try {
      await ticketService.addResponse(selectedTicket.id, responseMessage.trim());
      setResponseMessage('');
      const updated = await ticketService.getById(selectedTicket.id);
      setSelectedTicket(updated);
      toast.success('Mensaje enviado');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al enviar');
    } finally {
      setSendingResponse(false);
    }
  };

  // ── Detail View ──
  if (selectedTicket) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-400 mb-6 font-medium">
          <ChevronLeft size={16} /> Volver a mis reclamos
        </button>

        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {TICKET_CATEGORY_LABELS[selectedTicket.category]} — {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${STATUS_COLORS[selectedTicket.status]}`}>
                  {STATUS_ICONS[selectedTicket.status]} {TICKET_STATUS_LABELS[selectedTicket.status]}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                  {TICKET_PRIORITY_LABELS[selectedTicket.priority]}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-5 sm:p-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
            </div>
          </div>

          {/* Responses */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare size={14} /> Conversación ({selectedTicket.responses?.length || 0})
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {selectedTicket.responses?.map((resp) => (
                <div key={resp.id} className={`p-4 rounded-xl ${
                  resp.user?.role === 'ADMIN'
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 ml-0 sm:ml-8'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 mr-0 sm:mr-8'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      resp.user?.role === 'ADMIN' ? 'bg-indigo-200 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {resp.user?.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{resp.user?.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      resp.user?.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {resp.user?.role === 'ADMIN' ? 'Soporte' : 'Tú'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">{new Date(resp.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{resp.message}</p>
                </div>
              ))}
              {(!selectedTicket.responses || selectedTicket.responses.length === 0) && (
                <div className="text-center py-8">
                  <MessageSquare size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">Sin respuestas aún</p>
                  <p className="text-xs text-slate-400 mt-1">El equipo de soporte revisará tu reclamo pronto</p>
                </div>
              )}
            </div>

            {selectedTicket.status !== 'CLOSED' && (
              <div className="mt-4 flex gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                <input
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Agregar información adicional..."
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendResponse()}
                />
                <button
                  onClick={handleSendResponse}
                  disabled={sendingResponse || !responseMessage.trim()}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            )}

            {selectedTicket.status === 'CLOSED' && (
              <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-700/30 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Este reclamo ha sido cerrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Create Form ──
  if (showCreate) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <button onClick={() => setShowCreate(false)} className="flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-400 mb-6 font-medium">
          <ChevronLeft size={16} /> Volver a mis reclamos
        </button>

        <div className="max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nuevo Reclamo</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Describe tu problema y lo atenderemos lo antes posible</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 p-5 sm:p-6">
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Categoría *</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                    <option value="">Selecciona</option>
                    {(Object.entries(TICKET_CATEGORY_LABELS) as [TicketCategory, string][]).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Prioridad</label>
                  <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                    {(Object.entries(TICKET_PRIORITY_LABELS) as [TicketPriority, string][]).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Asunto *</label>
                <input
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="Ej: Comida en mal estado en el almuerzo"
                  maxLength={100}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{formSubject.length}/100</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descripción *</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explica en detalle tu reclamo. Incluye fecha, turno y cualquier información relevante..."
                  rows={5}
                  maxLength={1000}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{formDescription.length}/1000</p>
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 dark:hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {creating ? 'Enviando...' : 'Enviar Reclamo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List View ──
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-6 flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mis Reclamos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reporta problemas del comedor y haz seguimiento</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 dark:hover:shadow-none transition-all"
        >
          <Plus size={16} /> Nuevo Reclamo
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit overflow-x-auto">
        {[
          { value: '', label: 'Todos' },
          { value: 'OPEN', label: 'Abiertos' },
          { value: 'IN_REVIEW', label: 'En Revisión' },
          { value: 'RESOLVED', label: 'Resueltos' },
          { value: 'CLOSED', label: 'Cerrados' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === f.value
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg font-medium text-slate-900 dark:text-white">
            {statusFilter ? 'No hay reclamos con este estado' : 'Aún no tienes reclamos'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Si tienes algún problema con el servicio, crea un reclamo
          </p>
          {!statusFilter && (
            <button onClick={() => setShowCreate(true)} className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Crear mi primer reclamo →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => openDetail(ticket)}
              className="group border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 p-4 sm:p-5 hover:border-indigo-500/50 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{ticket.subject}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-3">
                    <span>{TICKET_CATEGORY_LABELS[ticket.category]}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    {(ticket._count?.responses || 0) > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="flex items-center gap-1"><MessageSquare size={10} /> {ticket._count?.responses}</span>
                      </>
                    )}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shrink-0 ${STATUS_COLORS[ticket.status]}`}>
                  {STATUS_ICONS[ticket.status]} {TICKET_STATUS_LABELS[ticket.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
