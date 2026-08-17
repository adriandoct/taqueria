'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  Flame,
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Utensils,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useShift } from '@/hooks/useShift';
import { useCart } from '@/hooks/useCart';
import { Pedido } from '@/lib/types';

export function ClientOrdersModal() {
  const { isClientOrdersModalOpen, closeClientOrdersModal, user } = useAuth();
  const { orders, fetchOrders, isLoading } = useShift();
  const { toggleCart } = useCart();

  useEffect(() => {
    if (!isClientOrdersModalOpen) return;
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 8000);
    return () => clearInterval(interval);
  }, [isClientOrdersModalOpen, fetchOrders]);

  if (!isClientOrdersModalOpen) return null;

  // Filter orders for the user (by name or show recent orders)
  const clientName = user?.nombre?.toLowerCase() || '';
  const clientOrders = user
    ? orders.filter(
        (o) =>
          o.cliente_nombre.toLowerCase().includes(clientName) ||
          clientName.includes(o.cliente_nombre.toLowerCase()) ||
          orders.indexOf(o) < 3 // fallback to recent
      )
    : orders.slice(0, 3);

  const getStatusStep = (estado: Pedido['estado']) => {
    switch (estado) {
      case 'pendiente':
        return 1;
      case 'en preparación':
        return 2;
      case 'listo':
        return 3;
      case 'entregado':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeClientOrdersModal}
        />

        {/* Modal Window */}
        <motion.div
          className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-orange-500/20 my-auto"
          style={{
            background: 'linear-gradient(180deg, #18120D 0%, #0D0A08 100%)',
          }}
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between gap-4 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}
              >
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-black text-lg sm:text-xl tracking-tight">
                  Mis Pedidos de Tacos 🌮
                </h2>
                <p className="text-white/50 text-xs">
                  Seguimiento en tiempo real de tu orden · {user?.nombre || 'Cliente'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchOrders()}
                disabled={isLoading}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Actualizar estado"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
              </button>
              <button
                onClick={closeClientOrdersModal}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
            {clientOrders.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-2xl">
                <ShoppingBag className="w-12 h-12 mx-auto text-orange-400/50 mb-3" />
                <h3 className="text-white font-bold text-base mb-1">Aún no tienes pedidos activos</h3>
                <p className="text-white/40 text-xs max-w-sm mx-auto mb-5">
                  Elige tus alambres o tacos favoritos en el menú o pide directamente con tu voz.
                </p>
                <button
                  onClick={() => {
                    closeClientOrdersModal();
                    const el = document.getElementById('menu');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  Ver el Menú
                </button>
              </div>
            ) : (
              clientOrders.map((order) => {
                const step = getStatusStep(order.estado);
                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg space-y-4"
                  >
                    {/* Top Row: Order ID & Date */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-mono font-black text-orange-400">
                          ORDEN #{order.id.slice(0, 6).toUpperCase()}
                        </span>
                        <h4 className="text-white font-bold text-sm">
                          Para: {order.cliente_nombre}
                        </h4>
                      </div>
                      <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                        ${order.total} MXN
                      </span>
                    </div>

                    {/* Stepper Status Bar */}
                    <div className="pt-2">
                      <div className="grid grid-cols-4 gap-1 relative">
                        {[
                          { num: 1, label: 'Recibido', icon: Clock },
                          { num: 2, label: 'En Cocina', icon: Flame },
                          { num: 3, label: '¡Listo!', icon: CheckCircle2 },
                          { num: 4, label: 'Entregado', icon: PackageCheck },
                        ].map((s) => {
                          const isCurrent = step === s.num;
                          const isDone = step >= s.num;
                          const IconComponent = s.icon;
                          return (
                            <div key={s.num} className="flex flex-col items-center text-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-all ${
                                  isDone
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                                    : 'bg-white/5 text-white/30 border border-white/10'
                                } ${isCurrent ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-[#18120D] animate-pulse' : ''}`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-[10px] font-bold ${
                                  isDone ? 'text-white' : 'text-white/30'
                                }`}
                              >
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="bg-black/40 rounded-xl p-3 divide-y divide-white/5">
                      {order.detalles_orden.map((item, idx) => (
                        <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                          <span className="text-white/90">
                            <strong className="text-orange-400 mr-1.5">{item.cantidad}x</strong>
                            {item.taco.nombre}
                            {item.especificaciones && (
                              <span className="text-[11px] text-amber-300 ml-2 block sm:inline font-medium">
                                ({item.especificaciones})
                              </span>
                            )}
                          </span>
                          <span className="text-white/50 font-mono">
                            ${item.taco.precio * item.cantidad}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
