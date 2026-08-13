'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  DollarSign, 
  ShoppingBag, 
  Flame, 
  Mic, 
  Printer, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  Hourglass, 
  User, 
  TrendingUp, 
  RefreshCw,
  PlusCircle,
  Tag
} from 'lucide-react';
import { useShift } from '@/hooks/useShift';
import { Pedido, Taco } from '@/lib/types';

interface CorteTurnoModalProps {
  tacos?: Taco[];
}

export function CorteTurnoModal({ tacos = [] }: CorteTurnoModalProps) {
  const { 
    isOpenCorte, 
    closeCorte, 
    orders, 
    isLoading, 
    fetchOrders, 
    updateOrderStatus, 
    cerrarTurno, 
    getSummary,
    registerOrderLocally,
    shiftStartTime 
  } = useShift();

  const [activeTab, setActiveTab] = useState<'resumen' | 'pedidos' | 'rapido'>('resumen');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [confirmCerrar, setConfirmCerrar] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Quick manual order form
  const [quickClient, setQuickClient] = useState('');
  const [quickTacoId, setQuickTacoId] = useState(tacos[0]?.id || '');
  const [quickQty, setQuickQty] = useState(1);
  const [quickSpecs, setQuickSpecs] = useState('');

  useEffect(() => {
    if (isOpenCorte) {
      fetchOrders();
    }
  }, [isOpenCorte, fetchOrders]);

  const summary = getSummary();

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  const handleCerrarTurno = async () => {
    await cerrarTurno();
    setConfirmCerrar(false);
  };

  const handleQuickSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTaco = tacos.find((t) => t.id === quickTacoId) || tacos[0];
    if (!selectedTaco) return;

    const total = selectedTaco.precio * quickQty;
    const newOrder: Pedido = {
      id: crypto.randomUUID(),
      cliente_nombre: quickClient.trim() || 'Venta Mostrador',
      detalles_orden: [
        {
          taco: selectedTaco,
          cantidad: quickQty,
          especificaciones: quickSpecs,
        },
      ],
      total,
      estado: 'entregado',
      created_at: new Date().toISOString(),
    };

    registerOrderLocally(newOrder);

    // Call API in background
    fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente_nombre: newOrder.cliente_nombre,
        detalles_orden: newOrder.detalles_orden,
        total: newOrder.total,
      }),
    }).catch(console.error);

    // Reset quick form
    setQuickClient('');
    setQuickQty(1);
    setQuickSpecs('');
    setActiveTab('pedidos');
  };

  const filteredOrders = orders.filter((o) => {
    if (filterEstado === 'todos') return true;
    return o.estado === filterEstado;
  });

  const formatHora = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  const formatFecha = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpenCorte && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={closeCorte}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(145deg, #18130E, #0D0A07)',
              border: '1px solid rgba(249,115,22,0.25)',
              boxShadow: '0 0 80px rgba(249,115,22,0.18)',
            }}
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}
                >
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-white font-black text-xl tracking-tight">
                      Corte de Turno & Ventas
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                      En Vivo
                    </span>
                  </div>
                  <p className="text-white/40 text-xs">
                    Inicio de turno: {formatFecha(shiftStartTime)} a las {formatHora(shiftStartTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchOrders()}
                  title="Actualizar datos"
                  className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={closeCorte}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div 
              className="flex items-center gap-2 px-6 pt-3 pb-2 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <button
                onClick={() => setActiveTab('resumen')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'resumen'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Resumen de Ventas
              </button>

              <button
                onClick={() => setActiveTab('pedidos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'pedidos'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Registro de Pedidos ({orders.length})
              </button>

              <button
                onClick={() => setActiveTab('rapido')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'rapido'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                + Venta Rápida Mostrador
              </button>
            </div>

            {/* Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'resumen' && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {/* Total Sales */}
                    <div 
                      className="p-4 rounded-2xl relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(239,68,68,0.1))',
                        border: '1px solid rgba(249,115,22,0.3)',
                      }}
                    >
                      <p className="text-white/50 text-xs font-medium mb-1 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-orange-400" />
                        Total Ventas Turno
                      </p>
                      <p className="text-2xl sm:text-3xl font-black text-white">
                        $<span className="text-amber-400">{summary.totalVentas.toLocaleString('es-MX')}</span>
                        <span className="text-xs font-normal text-white/40 ml-1">MXN</span>
                      </p>
                    </div>

                    {/* Total Orders */}
                    <div 
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <p className="text-white/50 text-xs font-medium mb-1 flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                        Pedidos Realizados
                      </p>
                      <p className="text-2xl sm:text-3xl font-black text-white">
                        {summary.totalPedidos}
                        <span className="text-xs font-normal text-white/40 ml-1">órdenes</span>
                      </p>
                    </div>

                    {/* Total Tacos */}
                    <div 
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <p className="text-white/50 text-xs font-medium mb-1 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-red-400" />
                        Tacos Servidos
                      </p>
                      <p className="text-2xl sm:text-3xl font-black text-white">
                        {summary.totalTacos}
                        <span className="text-xs font-normal text-white/40 ml-1">tacos</span>
                      </p>
                    </div>

                    {/* Ticket Promedio */}
                    <div 
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <p className="text-white/50 text-xs font-medium mb-1 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-green-400" />
                        Ticket Promedio
                      </p>
                      <p className="text-2xl sm:text-3xl font-black text-white">
                        ${summary.ticketPromedio.toFixed(0)}
                        <span className="text-xs font-normal text-white/40 ml-1">MXN</span>
                      </p>
                    </div>
                  </div>

                  {/* Voice orders stat badge */}
                  <div 
                    className="p-3 rounded-xl flex items-center justify-between text-xs"
                    style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-200">
                        <strong>{summary.pedidosPorVoz}</strong> pedidos realizados mediante reconocimiento de voz
                      </span>
                    </div>
                    <span className="text-purple-400 font-bold">
                      {summary.totalPedidos > 0 ? ((summary.pedidosPorVoz / summary.totalPedidos) * 100).toFixed(0) : 0}% del total
                    </span>
                  </div>

                  {/* Taco Sales Breakdown */}
                  <div>
                    <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                      🌮 Desglose de Ventas por Especialidad
                    </h3>

                    {summary.desgloseTacos.length === 0 ? (
                      <p className="text-white/30 text-xs italic py-4 text-center">
                        Aún no hay tacos registrados en este turno.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {summary.desgloseTacos.map((taco) => {
                          const percentage = summary.totalTacos > 0 
                            ? (taco.cantidad / summary.totalTacos) * 100 
                            : 0;

                          return (
                            <div 
                              key={taco.nombre}
                              className="p-3 rounded-xl"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                            >
                              <div className="flex justify-between items-center text-xs mb-1.5">
                                <span className="font-semibold text-white/90">
                                  {taco.nombre}
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="text-white/50">{taco.cantidad} tacos</span>
                                  <span className="font-bold text-amber-400">${taco.total.toLocaleString('es-MX')} MXN</span>
                                </div>
                              </div>
                              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: 'linear-gradient(90deg, #F97316, #EF4444)' }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.6 }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'pedidos' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-white/40 mr-1">Filtrar:</span>
                      {['todos', 'pendiente', 'en preparación', 'listo', 'entregado'].map((estado) => (
                        <button
                          key={estado}
                          onClick={() => setFilterEstado(estado)}
                          className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                            filterEstado === estado
                              ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30'
                              : 'text-white/40 hover:text-white'
                          }`}
                        >
                          {estado}
                        </button>
                      ))}
                    </div>

                    <span className="text-white/40 text-xs">
                      {filteredOrders.length} orden{filteredOrders.length !== 1 ? 'es' : ''}
                    </span>
                  </div>

                  {/* Orders List */}
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-white/30 text-sm">
                      No hay pedidos registrados en este estado.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 rounded-2xl transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          {/* Order Header */}
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-orange-400" />
                                  {order.cliente_nombre}
                                </h4>
                                <span className="font-mono text-[10px] text-white/30">
                                  #{order.id.slice(0, 6).toUpperCase()}
                                </span>
                                {order.transcripcion_voz && (
                                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/20">
                                    <Mic className="w-2.5 h-2.5" /> Voz
                                  </span>
                                )}
                              </div>
                              <p className="text-white/30 text-[11px] flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {formatHora(order.created_at)}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-amber-400 font-bold text-base">
                                ${Number(order.total).toFixed(0)} MXN
                              </span>
                            </div>
                          </div>

                          {/* Order Details */}
                          <div className="bg-black/30 rounded-xl p-2.5 mb-3 space-y-1.5 text-xs">
                            {order.detalles_orden?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-start text-white/80 border-b border-white/5 pb-1 last:border-0 last:pb-0">
                                <div>
                                  <span className="font-semibold text-white">
                                    <strong className="text-orange-400 font-bold">{item.cantidad}×</strong> {item.taco?.nombre}
                                  </span>
                                  {item.especificaciones && (
                                    <div className="mt-0.5 flex items-center gap-1 flex-wrap">
                                      {item.especificaciones.split(',').map((s, sIdx) => {
                                        const trimmed = s.trim();
                                        const isSin = trimmed.startsWith('sin ');
                                        return (
                                          <span
                                            key={sIdx}
                                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold"
                                            style={{
                                              background: isSin ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.2)',
                                              color: isSin ? '#FCA5A5' : '#FDBA74',
                                              border: isSin ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(249,115,22,0.3)',
                                            }}
                                          >
                                            <Tag className="w-2 h-2" />
                                            {trimmed}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                                <span className="text-white/50 text-xs font-mono">
                                  ${((item.taco?.precio || 0) * item.cantidad).toFixed(0)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Status Pill Controls */}
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <span className="text-[11px] text-white/40">Estado:</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {[
                                { val: 'pendiente', label: 'Pendiente', icon: Hourglass, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                                { val: 'en preparación', label: 'En Cocina', icon: ChefHat, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                                { val: 'listo', label: 'Listo', icon: CheckCircle2, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
                                { val: 'entregado', label: 'Entregado', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' },
                              ].map((st) => (
                                <button
                                  key={st.val}
                                  onClick={() => updateOrderStatus(order.id, st.val as Pedido['estado'])}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 border transition-all ${
                                    order.estado === st.val
                                      ? `${st.color} font-bold ring-1 ring-white/20`
                                      : 'text-white/30 border-transparent hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  <st.icon className="w-3 h-3" />
                                  {st.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rapido' && (
                <form onSubmit={handleQuickSale} className="max-w-md mx-auto space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-white font-bold text-lg">Registrar Venta de Mostrador</h3>
                    <p className="text-white/40 text-xs">
                      Agrega ventas directas en efectivo para sumarlas inmediatamente al corte del turno.
                    </p>
                  </div>

                  <div>
                    <label className="block text-white/50 text-xs font-medium mb-1">
                      Nombre o Identificador del Cliente
                    </label>
                    <input
                      type="text"
                      value={quickClient}
                      onChange={(e) => setQuickClient(e.target.value)}
                      placeholder="Ej: Mostrador 1, Mesa 3, Luis..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/50 text-xs font-medium mb-1">
                        Variedad de Taco
                      </label>
                      <select
                        value={quickTacoId}
                        onChange={(e) => setQuickTacoId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1410] border border-white/10 text-white text-sm outline-none focus:border-orange-500"
                      >
                        {tacos.map((taco) => (
                          <option key={taco.id} value={taco.id}>
                            {taco.nombre} (${taco.precio})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/50 text-xs font-medium mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={quickQty}
                        onChange={(e) => setQuickQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/50 text-xs font-medium mb-1">
                      Especificaciones (opcional)
                    </label>
                    <input
                      type="text"
                      value={quickSpecs}
                      onChange={(e) => setQuickSpecs(e.target.value)}
                      placeholder="Ej: Con todo, sin cebolla..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-white text-sm mt-2 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #EF4444)',
                      boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
                    }}
                  >
                    🌮 Guardar Venta y Sumar al Corte
                  </button>
                </form>
              )}
            </div>

            {/* Footer Actions */}
            <div
              className="p-4 sm:p-6 bg-black/40 flex items-center justify-between gap-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  disabled={isPrinting || summary.totalPedidos === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-30"
                >
                  <Printer className="w-4 h-4 text-orange-400" />
                  Imprimir Ticket de Corte
                </button>
              </div>

              <div>
                {!confirmCerrar ? (
                  <button
                    onClick={() => setConfirmCerrar(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-red-400 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Cerrar Turno
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCerrarTurno}
                      className="px-3 py-2 rounded-xl text-white text-xs font-bold bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Sí, finalizar corte
                    </button>
                    <button
                      onClick={() => setConfirmCerrar(false)}
                      className="px-3 py-2 rounded-xl text-white/50 text-xs hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
