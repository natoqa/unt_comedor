'use client';

import { useEffect, useState } from 'react';
import { ticketService } from '@/services/ticket.service';
import type { Ticket, TicketStats, TicketStatus, TicketPriority, TicketCategory } from '@/types';
import { TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS, TICKET_CATEGORY_LABELS } from '@/types';
import { toast } from 'sonner';
import { Clock, AlertTriangle, CheckCircle2, XCircle, MessageSquare, ChevronLeft } from 'lucide-react';

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  IN_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400',
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await ticketService.getAll({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
        page,
        limit: 10,
      });
      setTickets(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch {
      toast.error('Error al cargar tickets');
    }
  };

  const fetchStats = async () => {
    try {
      const data = await ticketService.getStats();
      setStats(data);
    } catch {}
  };

  useEffect(() => {
    Promise.all([fetchTickets(), fetchStats()]).finally(() => setLoading(false));
  }, [statusFilter, priorityFilter, categoryFilter, page]);

  const openTicketDetail = async (ticket: Ticket) => {
    try {
      const full = await ticketService.getById(ticket.id);
      setSelectedTicket(full);
    } catch {
      toast.error('Error al cargar detalle');
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await ticketService.updateStatus(ticketId, newStatus);
      toast.success('Estado actualizado');
      if (selectedTicket) {
        const updated = await ticketService.getById(ticketId);
        setSelectedTicket(updated);
      }
      fetchTickets();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al actualizar estado');
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
      toast.error(err?.response?.data?.message || 'Error al enviar respuesta');
    } finally {
      setSendingResponse(false);
    }
  };

  if (selectedTicket) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <ChevronLeft size={16} /> Volver a la lista
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {selectedTicket.user?.name} ({selectedTicket.user?.universityId}) — {new Date(selectedTicket.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[selectedTicket.status]}`}>
                {TICKET_STATUS_LABELS[selectedTicket.status]}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                {TICKET_PRIORITY_LABELS[selectedTicket.priority]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-sm">
            <div><span className="text-slate-500">Categoría:</span> <span className="font-medium text-slate-900 dark:text-white">{TICKET_CATEGORY_LABELS[selectedTicket.category]}</span></div>
            <div><span className="text-slate-500">Creado:</span> <span className="font-medium text-slate-900 dark:text-white">{new Date(selectedTicket.createdAt).toLocaleString()}</span></div>
            {selectedTicket.resolvedAt && <div><span className="text-slate-500">Resuelto:</span> <span className="font-medium text-green-600">{new Date(selectedTicket.resolvedAt).toLocaleString()}</span></div>}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedTicket.description}</p>
          </div>

          {selectedTicket.status !== 'CLOSED' && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cambiar estado:</span>
              {selectedTicket.status === 'OPEN' && (
                <button onClick={() => handleStatusChange(selectedTicket.id, 'IN_REVIEW')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                  En Revisión
                </button>
              )}
              {(selectedTicket.status === 'OPEN' || selectedTicket.status === 'IN_REVIEW') && (
                <button onClick={() => handleStatusChange(selectedTicket.id, 'RESOLVED')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                  Resuelto
                </button>
              )}
              <button onClick={() => handleStatusChange(selectedTicket.id, 'CLOSED')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/30 dark:text-slate-400">
                Cerrar
              </button>
            </div>
          )}

          {/* Responses */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Respuestas ({selectedTicket.responses?.length || 0})</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {selectedTicket.responses?.map((resp) => (
                <div key={resp.id} className={`p-3 rounded-lg ${resp.user?.role === 'ADMIN' ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30' : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{resp.user?.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${resp.user?.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {resp.user?.role === 'ADMIN' ? 'Admin' : 'Estudiante'}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(resp.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{resp.message}</p>
                </div>
              ))}
              {(!selectedTicket.responses || selectedTicket.responses.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">Sin respuestas aún</p>
              )}
            </div>

            {selectedTicket.status !== 'CLOSED' && (
              <div className="mt-4 flex gap-2">
                <input
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Escribe una respuesta..."
                  className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendResponse()}
                />
                <button
                  onClick={handleSendResponse}
                  disabled={sendingResponse || !responseMessage.trim()}
                  className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mesa de Servicio</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gestión de tickets y reclamos de estudiantes</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MessageSquare size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-slate-500">Total tickets</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.byStatus.OPEN + stats.byStatus.IN_REVIEW}</p>
                <p className="text-xs text-slate-500">Pendientes</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.byPriority.HIGH + stats.byPriority.URGENT}</p>
                <p className="text-xs text-slate-500">Alta prioridad</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.averageResolutionHours !== null ? `${stats.averageResolutionHours}h` : '—'}</p>
                <p className="text-xs text-slate-500">Tiempo prom. resolución</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
          <option value="">Todos los estados</option>
          {(Object.entries(TICKET_STATUS_LABELS) as [TicketStatus, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
          <option value="">Todas las prioridades</option>
          {(Object.entries(TICKET_PRIORITY_LABELS) as [TicketPriority, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
          <option value="">Todas las categorías</option>
          {(Object.entries(TICKET_CATEGORY_LABELS) as [TicketCategory, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No hay tickets</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Asunto</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden sm:table-cell">Estudiante</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Categoría</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Prioridad</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Estado</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => openTicketDetail(ticket)}
                    className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{ticket.subject}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MessageSquare size={10} /> {ticket._count?.responses || 0}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-slate-700 dark:text-slate-300">{ticket.user?.name}</p>
                      <p className="text-xs text-slate-400">{ticket.user?.universityId}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-400">
                      {TICKET_CATEGORY_LABELS[ticket.category]}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[ticket.priority]}`}>
                        {TICKET_PRIORITY_LABELS[ticket.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[ticket.status]}`}>
                        {TICKET_STATUS_LABELS[ticket.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 hidden sm:table-cell">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50">
              Anterior
            </button>
            <span className="text-sm text-slate-500">Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50">
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
