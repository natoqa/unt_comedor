'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { StarRating } from './StarRating';
import { ratingService } from '@/services';
import type { Menu } from '@/types';
import { SHIFT_LABELS } from '@/types';
import { formatMenuDate } from '@/lib/date';

interface RatingModalProps {
  menu: Menu;
  onClose: () => void;
  onRated: () => void;
}

const DIMENSIONS = [
  { key: 'taste' as const, label: 'Sabor', emoji: '😋', desc: '¿Qué tal la sazón?' },
  { key: 'quantity' as const, label: 'Cantidad', emoji: '🍽️', desc: '¿Suficiente porción?' },
  { key: 'variety' as const, label: 'Variedad', emoji: '🥗', desc: '¿Buen surtido de platos?' },
  { key: 'hygiene' as const, label: 'Higiene', emoji: '✨', desc: '¿Limpieza adecuada?' },
  { key: 'service' as const, label: 'Atención', emoji: '🙋', desc: '¿Buen trato del personal?' },
];

export function RatingModal({ menu, onClose, onRated }: RatingModalProps) {
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [ratings, setRatings] = useState({
    taste: 0,
    quantity: 0,
    variety: 0,
    hygiene: 0,
    service: 0,
  });
  const [comment, setComment] = useState('');

  // Verificar si ya valoró este menú
  useEffect(() => {
    const check = async () => {
      try {
        const result = await ratingService.checkUserRating(menu.id);
        if (result.hasRated && result.rating) {
          setAlreadyRated(true);
          setRatings({
            taste: result.rating.taste,
            quantity: result.rating.quantity,
            variety: result.rating.variety,
            hygiene: result.rating.hygiene,
            service: result.rating.service,
          });
        }
      } catch {
        // Si falla la verificación, permitir igual
      } finally {
        setCheckingStatus(false);
      }
    };
    check();
  }, [menu.id]);

  const handleSubmit = async () => {
    // Verificar que todas las dimensiones estén calificadas
    const allRated = Object.values(ratings).every((v) => v > 0);
    if (!allRated) {
      toast.error('Por favor califica todas las dimensiones');
      return;
    }

    setLoading(true);
    try {
      await ratingService.create({
        menuId: menu.id,
        ...ratings,
        comment: comment.trim() || undefined,
      });
      toast.success('¡Gracias por tu valoración!');
      onRated();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al enviar valoración');
    } finally {
      setLoading(false);
    }
  };

  const menuDate = formatMenuDate(menu.date);

  const averageRating =
    Object.values(ratings).filter((v) => v > 0).length > 0
      ? Object.values(ratings).reduce((a, b) => a + b, 0) /
        Object.values(ratings).filter((v) => v > 0).length
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[hsl(var(--card))] rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                {alreadyRated ? 'Tu valoración' : 'Valorar menú'}
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] capitalize">
                {SHIFT_LABELS[menu.shift]} — {menuDate}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-xl leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        {checkingStatus ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {alreadyRated && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  ✅ Ya valoraste este menú. Aquí puedes ver tu calificación.
                </p>
              </div>
            )}

            {/* Nota sobre anonimato */}
            {!alreadyRated && (
              <div className="p-3 rounded-lg bg-[hsl(var(--secondary))]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  🔒 Tu valoración es anónima. Los comentarios no muestran tu nombre.
                </p>
              </div>
            )}

            {/* Dimensiones */}
            <div className="space-y-4">
              {DIMENSIONS.map((dim) => (
                <div
                  key={dim.key}
                  className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.2)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{dim.emoji}</span>
                    <div>
                      <p className="text-sm font-medium">{dim.label}</p>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                        {dim.desc}
                      </p>
                    </div>
                  </div>
                  <StarRating
                    value={ratings[dim.key]}
                    onChange={
                      alreadyRated
                        ? undefined
                        : (v) => setRatings({ ...ratings, [dim.key]: v })
                    }
                    readonly={alreadyRated}
                    size="md"
                  />
                </div>
              ))}
            </div>

            {/* Promedio visual */}
            {averageRating > 0 && (
              <div className="text-center p-3 rounded-lg bg-[hsl(var(--secondary))]">
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">
                  Promedio general
                </p>
                <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                  {averageRating.toFixed(1)} / 5.0
                </p>
              </div>
            )}

            {/* Comentario */}
            {!alreadyRated && (
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Comentario (opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2.5 rounded-lg border border-[hsl(var(--input))] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none transition-shadow"
                  rows={3}
                  maxLength={500}
                  placeholder="¿Algún comentario o sugerencia? Tu opinión es anónima..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] text-right mt-1">
                  {comment.length}/500
                </p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--secondary))] transition-colors"
              >
                {alreadyRated ? 'Cerrar' : 'Cancelar'}
              </button>
              {!alreadyRated && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar valoración'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
