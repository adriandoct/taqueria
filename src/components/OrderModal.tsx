'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2, User, Receipt, Tag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useShift } from '@/hooks/useShift';
import { Pedido, CartItem } from '@/lib/types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OrderModal({ isOpen, onClose, onSuccess }: OrderModalProps) {
  const { items, total, clearCart } = useCart();
  const { registerOrderLocally } = useShift();
  const [clientName, setClientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [confirmedItems, setConfirmedItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const cartTotal = total();

  const handleSubmit = async () => {
    if (isLoading || isSubmittingRef.current || orderId) return;

    const trimmedName = clientName.trim();
    if (!trimmedName) {
      setError('Por favor ingresa tu nombre para continuar');
      return;
    }

    if (items.length === 0) {
      setError('Tu carrito está vacío');
      return;
    }

    isSubmittingRef.current = true;
    setError(null);
    setIsLoading(true);

    try {
      // Snapshot items before clearing
      const orderItemsSnapshot = [...items];
      const orderTotalSnapshot = cartTotal;

      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nombre: trimmedName,
          detalles_orden: orderItemsSnapshot,
          total: orderTotalSnapshot,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar tu pedido');

      const createdOrder: Pedido = {
        id: data.id || crypto.randomUUID(),
        cliente_nombre: trimmedName,
        detalles_orden: orderItemsSnapshot,
        total: orderTotalSnapshot,
        estado: 'pendiente',
        created_at: data.created_at || new Date().toISOString(),
      };

      // Register immediately in shift store for live sales sum
      registerOrderLocally(createdOrder);

      // Save confirmed items for receipt view
      setConfirmedItems(orderItemsSnapshot);

      // Clear cart immediately so it cannot be submitted twice
      clearCart();

      setOrderId(createdOrder.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
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
    setConfirmedItems([]);
    setError(null);
    isSubmittingRef.current = false;
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
                  className="text-center py-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.5, ease: 'backOut' }}
                    className="inline-block mb-3"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-400" />
                  </motion.div>
                  <h3 className="text-white text-2xl font-bold mb-1">¡Gracias, {clientName}!</h3>
                  <p className="text-white/50 text-xs mb-4">Tu pedido con todas tus especificaciones fue registrado con éxito</p>

                  <div
                    className="rounded-2xl p-4 mb-4 text-left space-y-2"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <div>
                        <p className="text-white/40 text-xs">Número de orden</p>
                        <p className="text-orange-400 font-mono font-bold text-sm">
                          #{orderId.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <span className="text-[10px] text-green-400 font-semibold px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                        ✓ En Cocina
                      </span>
                    </div>

                    {/* Confirmed items list with specs */}
                    <div className="space-y-1.5 pt-1 max-h-36 overflow-y-auto">
                      {confirmedItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs">
                          <div>
                            <span className="text-white/80 font-medium">
                              {item.cantidad}× {item.taco.nombre}
                            </span>
                            {item.especificaciones && (
                              <p className="text-orange-300/80 text-[11px] flex items-center gap-1 mt-0.5">
                                <Tag className="w-2.5 h-2.5" />
                                {item.especificaciones}
                              </p>
                            )}
                          </div>
                          <span className="text-amber-400 font-semibold">
                            ${(item.taco.precio * item.cantidad).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-amber-300/70 text-xs mb-5">
                    <span>⏱</span>
                    <span>Tiempo estimado de preparación: 15–20 minutos</span>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 cursor-pointer"
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
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-white/40 text-xs font-medium mb-3 uppercase tracking-wider">
                      Resumen del pedido
                    </p>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between items-start">
                          <div className="flex-1 pr-2">
                            <span className="text-white/90 text-sm font-medium">
                              {item.cantidad}× {item.taco.nombre}
                            </span>
                            {item.especificaciones ? (
                              <div className="mt-1 flex items-center gap-1 flex-wrap">
                                {item.especificaciones.split(',').map((s, sIdx) => {
                                  const trimmedSpec = s.trim();
                                  const isSin = trimmedSpec.startsWith('sin ');
                                  return (
                                    <span
                                      key={sIdx}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                                      style={{
                                        background: isSin ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)',
                                        color: isSin ? '#FCA5A5' : '#FDBA74',
                                        border: isSin ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(249,115,22,0.25)',
                                      }}
                                    >
                                      <Tag className="w-2.5 h-2.5" />
                                      {trimmedSpec}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-white/25 text-[11px] mt-0.5 italic">Sin especificaciones</p>
                            )}
                          </div>
                          <span className="text-amber-400 text-sm font-semibold whitespace-nowrap">
                            ${(item.taco.precio * item.cantidad).toFixed(0)} MXN
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
                      disabled={isLoading}
                      value={clientName}
                      onChange={(e) => { setClientName(e.target.value); setError(null); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      placeholder="Ej: Juan, María, El Profe..."
                      className="w-full px-4 py-3 rounded-xl outline-none text-white text-sm transition-all disabled:opacity-60"
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
                    disabled={isLoading || items.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
