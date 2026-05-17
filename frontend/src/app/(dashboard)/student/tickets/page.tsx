'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { ticketService } from '@/services/ticket.service';
import type { Ticket, TicketStatus, TicketCategory, TicketPriority } from '@/types';
import { TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS, TICKET_CATEGORY_LABELS } from '@/types';
import { toast } from 'sonner';
import { Plus, ChevronLeft, MessageSquare, Send } from 'lucide-react';

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  IN_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400',
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export default function StudentTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);

  // Create form
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
      toast.error('Error al cargar tickets');
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
      await ticketService.create({
        category: formCategory,
        priority: formPriority,
        subject: formSubject,
        description: formDescription,
      });
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
      toast.success('Respuesta enviada');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al enviar');
    } finally {
      setSendingResponse(false);
    }
  };

  // Detail view
  if (selectedTicket) {
    return (
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <ChevronLeft size={16} /> Volver
          </button>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h1>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[selectedTicket.status]}`}>
                  {TICKET_STATUS_LABELS[selectedTicket.status]}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                  {TICKET_PRIORITY_LABELS[selectedTicket.priority]}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
              <span>Categoría: <strong className="text-slate-700 dark:text-slate-300">{TICKET_CATEGORY_LABELS[selectedTicket.category]}</strong></span>
              <span>Creado: <strong className="text-slate-700 dark:text-slate-300">{new Date(selectedTicket.createdAt).toLocaleDateString()}</strong></span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>

            {/* Responses */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Conversación</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {selectedTicket.responses?.map((resp) => (
                  <div key={resp.id} className={`p-3 rounded-lg ${resp.user?.role === 'ADMIN' ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30' : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">{resp.user?.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${resp.user?.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                        {resp.user?.role === 'ADMIN' ? 'Soporte' : 'Tú'}
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(resp.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{resp.message}</p>
                  </div>
                ))}
                {(!selectedTicket.responses || selectedTicket.responses.length === 0) && (
                  <p className="text-sm text-slate-400 text-center py-4">Sin respuestas aún. El equipo revisará tu reclamo.</p>
                )}
              </div>

              {selectedTicket.status !== 'CLOSED' && (
                <div className="mt-4 flex gap-2">
                  <input
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Agregar información..."
                    className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendResponse()}
                  />
                  <button
                    onClick={handleSendResponse}
                    disabled={sendingResponse || !responseMessage.trim()}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Create form view
  if (showCreate) {
    return (
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <button onClick={() => setShowCreate(false)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <ChevronLeft size={16} /> Volver
          </button>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Crear Reclamo</h1>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría *</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  <option value="">Selecciona una categoría</option>
                  {(Object.entries(TICKET_CATEGORY_LABELS) as [TicketCategory, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
                <select value={formPriority} onChange={(e) => setFormPriority(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {(Object.entries(TICKET_PRIORITY_LABELS) as [TicketPriority, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asunto *</label>
                <input
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="Describe brevemente tu reclamo"
                  maxLength={100}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <p className="text-xs text-slate-400 mt-1">{formSubject.length}/100</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción *</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explica en detalle tu reclamo, incluye fecha, turno y cualquier información relevante..."
                  rows={5}
                  maxLength={1000}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">{formDescription.length}/1000</p>
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Enviando...' : 'Enviar Reclamo'}
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // List view
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mis Reclamos</h1>
            <p className="text-sm text-slate-500 mt-0.5">Reporta problemas y haz seguimiento</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} /> Nuevo
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === f.value
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tickets list */}
        {loading ? (
          <div className="text-center py-8 text-slate-400">Cargando...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <MessageSquare size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500">No tienes reclamos {statusFilter ? 'con este estado' : 'aún'}</p>
            <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Crear tu primer reclamo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => openDetail(ticket)}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{ticket.subject}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {TICKET_CATEGORY_LABELS[ticket.category]} — {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[ticket.status]}`}>
                      {TICKET_STATUS_LABELS[ticket.status]}
                    </span>
                    {(ticket._count?.responses || 0) > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <MessageSquare size={10} /> {ticket._count?.responses}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
