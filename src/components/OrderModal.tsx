'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2, User, Receipt } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useShift } from '@/hooks/useShift';
import { Pedido } from '@/lib/types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OrderModal({ isOpen, onClose, onSuccess }: OrderModalProps) {
  const { items, total } = useCart();
  const { registerOrderLocally } = useShift();
  const [clientName, setClientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cartTotal = total();

  const handleSubmit = async () => {
    if (!clientName.trim()) {
      setError('Por favor ingresa tu nombre para continuar');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nombre: clientName.trim(),
          detalles_orden: items,
          total: cartTotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar tu pedido');

      const createdOrder: Pedido = {
        id: data.id || crypto.randomUUID(),
        cliente_nombre: clientName.trim(),
        detalles_orden: items,
        total: cartTotal,
        estado: 'pendiente',
        created_at: data.created_at || new Date().toISOString(),
      };

      // Register immediately in shift store for live sales sum!
      registerOrderLocally(createdOrder);

      setOrderId(createdOrder.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (orderId) {
      onSuccess();
    } else {
      onClose();
    }
    setClientName('');
    setOrderId(null);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1A1410, #0D0A07)',
              border: '1px solid rgba(249,115,22,0.2)',
              boxShadow: '0 0 80px rgba(249,115,22,0.12)',
            }}
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(249,115,22,0.15)' }}
                >
                  <Receipt className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-white font-bold text-lg">
                  {orderId ? '¡Pedido Confirmado!' : 'Confirmar Pedido'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {orderId ? (
                /* Success State */
                <motion.div
                  className="text-center py-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.5, ease: 'backOut' }}
                    className="inline-block mb-4"
                  >
                    <CheckCircle2 className="w-20 h-20 text-green-400" />
                  </motion.div>
                  <h3 className="text-white text-2xl font-bold mb-2">¡Gracias, {clientName}!</h3>
                  <p className="text-white/50 text-sm mb-4">Tu pedido fue registrado exitosamente en el sistema</p>

                  <div
                    className="rounded-2xl p-4 mb-6 text-left"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-white/40 text-xs">Número de pedido</p>
                      <span className="text-[10px] text-green-400 font-semibold px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                        ✓ Sumado al turno
                      </span>
                    </div>
                    <p className="text-orange-400 font-mono font-bold text-sm">
                      #{orderId.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-amber-300/60 text-sm mb-6">
                    <span>⏱</span>
                    <span>Tiempo estimado: 15–20 minutos</span>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}
                  >
                    Volver al Menú
                  </button>
                </motion.div>
              ) : (
                /* Form State */
                <>
                  {/* Order Summary */}
                  <div
                    className="rounded-2xl p-4 mb-5"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <p className="text-white/40 text-xs font-medium mb-3 uppercase tracking-wider">
                      Resumen del pedido
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div>
                            <span className="text-white/80 text-sm">
                              {item.cantidad}× {item.taco.nombre}
                            </span>
                            {item.especificaciones && (
                              <p className="text-white/30 text-xs">{item.especificaciones}</p>
                            )}
                          </div>
                          <span className="text-amber-400 text-sm font-semibold">
                            ${(item.taco.precio * item.cantidad).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div
                      className="flex justify-between items-center mt-3 pt-3"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <span className="text-white/60 font-medium">Total</span>
                      <span className="text-white font-bold text-xl">
                        $<span style={{ color: '#F59E0B' }}>{cartTotal.toFixed(0)}</span> MXN
                      </span>
                    </div>
                  </div>

                  {/* Name Input */}
                  <label className="block mb-4">
                    <p className="text-white/50 text-xs font-medium mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Tu nombre (para llamarte cuando esté listo)
                    </p>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => { setClientName(e.target.value); setError(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="Ej: Juan, María, El Profe..."
                      className="w-full px-4 py-3 rounded-xl outline-none text-white text-sm transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(249,115,22,0.5)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)';
                      }}
                      autoFocus
                    />
                    {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
                  </label>

                  {/* Submit */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #EF4444)',
                      boxShadow: '0 4px 24px rgba(249,115,22,0.35)',
                    }}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      '🌮 Confirmar Pedido'
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
