'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChefHat,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Volume2,
  Mic,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useShift } from '@/hooks/useShift';
import { Pedido } from '@/lib/types';

export function KitchenDisplayModal() {
  const { isKitchenModalOpen, closeKitchenModal, user } = useAuth();
  const { orders, fetchOrders, updateOrderStatus, isLoading } = useShift();
  const [filter, setFilter] = useState<'all' | 'active' | 'ready'>('active');

  // Auto-refresh orders every 10 seconds when open
  useEffect(() => {
    if (!isKitchenModalOpen) return;
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [isKitchenModalOpen, fetchOrders]);

  if (!isKitchenModalOpen) return null;

  // Filter orders
  const pendientes = orders.filter((o) => o.estado === 'pendiente');
  const enPreparacion = orders.filter((o) => o.estado === 'en preparación');
  const listos = orders.filter((o) => o.estado === 'listo');
  const entregados = orders.filter((o) => o.estado === 'entregado');

  const getFilteredOrders = () => {
    if (filter === 'active') return [...pendientes, ...enPreparacion];
    if (filter === 'ready') return listos;
    return orders;
  };

  const handleNextStatus = async (order: Pedido) => {
    let nextStatus: Pedido['estado'] = 'en preparación';
    if (order.estado === 'pendiente') nextStatus = 'en preparación';
    else if (order.estado === 'en preparación') nextStatus = 'listo';
    else if (order.estado === 'listo') nextStatus = 'entregado';

    await updateOrderStatus(order.id, nextStatus);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getMinutesAgo = (isoString: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
      if (diff <= 0) return 'Hace un momento';
      if (diff === 1) return 'Hace 1 min';
      return `Hace ${diff} min`;
    } catch {
      return '';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeKitchenModal}
        />

        {/* Full Modal Window */}
        <motion.div
          className="relative w-full max-w-7xl h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-orange-500/20 my-auto"
          style={{
            background: 'linear-gradient(180deg, #140E0A 0%, #0A0806 100%)',
          }}
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}
              >
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-black text-xl tracking-tight">
                    Cocina y Comandas KDS
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {user?.role === 'admin' ? '👑 Admin / Taquero' : '👨‍🍳 Taquero'}
                  </span>
                </div>
                <p className="text-white/50 text-xs">
                  Pantalla de preparación en tiempo real · Taquería Jefe de Jefes
                </p>
              </div>
            </div>

            {/* Quick stats and Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
                  ⏳ {pendientes.length} Pendientes
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 font-bold">
                  🔥 {enPreparacion.length} En Comal
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
                  ✅ {listos.length} Listos
                </span>
              </div>

              <button
                onClick={() => fetchOrders()}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Actualizar pedidos"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>

              <button
                onClick={closeKitchenModal}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* KDS Columns Layout */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: Pendientes */}
            <div className="flex flex-col bg-white/[0.02] border border-amber-500/20 rounded-2xl p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <h3 className="text-amber-400 font-black text-sm uppercase tracking-wider">
                    Pendientes ({pendientes.length})
                  </h3>
                </div>
                <span className="text-[11px] text-white/40">Por iniciar</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {pendientes.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl text-white/30 text-xs">
                    <Clock className="w-8 h-8 mb-2 opacity-40" />
                    <span>No hay pedidos pendientes</span>
                  </div>
                ) : (
                  pendientes.map((order) => (
                    <OrderKitchenCard
                      key={order.id}
                      order={order}
                      onAdvance={() => handleNextStatus(order)}
                      advanceLabel="🔥 Pasar al Comal"
                      accentColor="amber"
                      formatTime={formatTime}
                      getMinutesAgo={getMinutesAgo}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 2: En Preparación */}
            <div className="flex flex-col bg-white/[0.02] border border-orange-500/20 rounded-2xl p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <h3 className="text-orange-400 font-black text-sm uppercase tracking-wider">
                    En Comal ({enPreparacion.length})
                  </h3>
                </div>
                <span className="text-[11px] text-white/40">Cocinando</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {enPreparacion.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl text-white/30 text-xs">
                    <Flame className="w-8 h-8 mb-2 opacity-40" />
                    <span>El comal está libre</span>
                  </div>
                ) : (
                  enPreparacion.map((order) => (
                    <OrderKitchenCard
                      key={order.id}
                      order={order}
                      onAdvance={() => handleNextStatus(order)}
                      advanceLabel="✅ ¡Listo para Servir!"
                      accentColor="orange"
                      formatTime={formatTime}
                      getMinutesAgo={getMinutesAgo}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Listos para Despachar */}
            <div className="flex flex-col bg-white/[0.02] border border-emerald-500/20 rounded-2xl p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-emerald-400 font-black text-sm uppercase tracking-wider">
                    Listos ({listos.length})
                  </h3>
                </div>
                <span className="text-[11px] text-white/40">Por entregar</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {listos.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl text-white/30 text-xs">
                    <CheckCircle2 className="w-8 h-8 mb-2 opacity-40" />
                    <span>Sin pedidos en espera de entrega</span>
                  </div>
                ) : (
                  listos.map((order) => (
                    <OrderKitchenCard
                      key={order.id}
                      order={order}
                      onAdvance={() => handleNextStatus(order)}
                      advanceLabel="📦 Despachar Pedido"
                      accentColor="emerald"
                      formatTime={formatTime}
                      getMinutesAgo={getMinutesAgo}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Subcomponent for individual kitchen order ticket
function OrderKitchenCard({
  order,
  onAdvance,
  advanceLabel,
  accentColor,
  formatTime,
  getMinutesAgo,
}: {
  order: Pedido;
  onAdvance: () => void;
  advanceLabel: string;
  accentColor: 'amber' | 'orange' | 'emerald';
  formatTime: (time: string) => string;
  getMinutesAgo: (time: string) => string;
}) {
  const colorBorders = {
    amber: 'border-amber-500/30 hover:border-amber-500/60',
    orange: 'border-orange-500/40 hover:border-orange-500/70',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/60',
  };

  const btnGradients = {
    amber: 'from-amber-500 to-orange-500 text-white',
    orange: 'from-orange-500 to-red-500 text-white',
    emerald: 'from-emerald-500 to-teal-500 text-white',
  };

  const totalTacos = order.detalles_orden.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`p-4 rounded-2xl bg-neutral-900/90 border ${colorBorders[accentColor]} shadow-lg transition-all flex flex-col gap-3`}
    >
      {/* Ticket Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black text-white/50">
              #{order.id.slice(0, 6).toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-bold">
              {totalTacos} piezas
            </span>
          </div>
          <h4 className="text-white font-black text-base tracking-tight mt-0.5">
            {order.cliente_nombre}
          </h4>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-mono text-white/80 block font-bold">
            {formatTime(order.created_at)}
          </span>
          <span className="text-[10px] text-amber-400/90 font-medium">
            {getMinutesAgo(order.created_at)}
          </span>
        </div>
      </div>

      {/* Voice transcription banner if order was made by voice */}
      {order.transcripcion_voz && (
        <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-2">
          <Mic className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-orange-200/90 italic leading-tight">
            &ldquo;{order.transcripcion_voz}&rdquo;
          </p>
        </div>
      )}

      {/* Items list */}
      <div className="divide-y divide-white/5 bg-black/30 rounded-xl p-2.5 border border-white/5">
        {order.detalles_orden.map((item, idx) => (
          <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-md bg-orange-500/20 text-orange-400 font-mono font-black text-xs flex items-center justify-center shrink-0">
                {item.cantidad}
              </span>
              <div>
                <span className="text-white font-bold text-xs block">
                  {item.taco.nombre}
                </span>
                {item.especificaciones && (
                  <span className="text-[11px] text-amber-300 font-medium bg-amber-400/10 px-1.5 py-0.5 rounded inline-block mt-0.5">
                    ✨ {item.especificaciones}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[11px] font-mono text-white/40">
              ${item.taco.precio * item.cantidad}
            </span>
          </div>
        ))}
      </div>

      {/* Total & Action Button */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-xs font-bold text-white/70">
          Total: <strong className="text-white font-black">${order.total} MXN</strong>
        </span>

        <button
          onClick={onAdvance}
          className={`flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r ${btnGradients[accentColor]} font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer`}
        >
          <span>{advanceLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
