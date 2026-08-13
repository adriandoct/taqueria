'use client';

import { motion } from 'framer-motion';
import { DollarSign, BarChart2, ArrowRight } from 'lucide-react';
import { useShift } from '@/hooks/useShift';

export function ShiftBanner() {
  const { openCorte, getSummary } = useShift();
  const summary = getSummary();

  return (
    <motion.div
      onClick={openCorte}
      className="group p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 text-left"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        backdropFilter: 'blur(10px)',
      }}
      whileHover={{ 
        scale: 1.02,
        borderColor: 'rgba(245, 158, 11, 0.5)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}
        >
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-bold">
              Control de Ventas del Turno
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-green-500/20 text-green-400 font-semibold">
              {summary.totalPedidos} pedidos
            </span>
          </div>
          <p className="text-white/40 text-[11px]">
            Total acumulado: <strong className="text-amber-400 font-bold">${summary.totalVentas.toLocaleString('es-MX')} MXN</strong> ({summary.totalTacos} tacos)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
        <span>Corte</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </motion.div>
  );
}
