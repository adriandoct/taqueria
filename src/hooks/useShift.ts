'use client';

import { create } from 'zustand';
import { Pedido, TacoSalesBreakdown, CorteTurnoSummary } from '@/lib/types';

const STORAGE_KEY = 'taqueria_pedidos_turno_v1';
const SHIFT_START_KEY = 'taqueria_inicio_turno_v1';

interface ShiftStore {
  orders: Pedido[];
  isLoading: boolean;
  isOpenCorte: boolean;
  shiftStartTime: string;
  openCorte: () => void;
  closeCorte: () => void;
  toggleCorte: () => void;
  fetchOrders: () => Promise<void>;
  registerOrderLocally: (order: Pedido) => void;
  updateOrderStatus: (id: string, estado: Pedido['estado']) => Promise<void>;
  cerrarTurno: () => Promise<CorteTurnoSummary>;
  getSummary: () => CorteTurnoSummary;
}

export const useShift = create<ShiftStore>((set, get) => ({
  orders: [],
  isLoading: false,
  isOpenCorte: false,
  shiftStartTime: typeof window !== 'undefined' 
    ? (localStorage.getItem(SHIFT_START_KEY) || new Date().toISOString())
    : new Date().toISOString(),

  openCorte: () => set({ isOpenCorte: true }),
  closeCorte: () => set({ isOpenCorte: false }),
  toggleCorte: () => set((state) => ({ isOpenCorte: !state.isOpenCorte })),

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      // 1. Fetch from server API
      const res = await fetch('/api/pedidos', { cache: 'no-store' });
      if (res.ok) {
        const serverOrders: Pedido[] = await res.json();
        
        // 2. Merge with localStorage for any offline/local orders
        let localOrders: Pedido[] = [];
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            try {
              localOrders = JSON.parse(raw);
            } catch {
              localOrders = [];
            }
          }
        }

        // Merge without duplicates (by id)
        const orderMap = new Map<string, Pedido>();
        serverOrders.forEach((o) => orderMap.set(o.id, o));
        localOrders.forEach((o) => {
          if (!orderMap.has(o.id)) orderMap.set(o.id, o);
        });

        const merged = Array.from(orderMap.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }

        set({ orders: merged });
      }
    } catch (err) {
      console.warn('Error fetching orders from API, fallback to localStorage:', err);
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            set({ orders: JSON.parse(raw) });
          } catch {
            set({ orders: [] });
          }
        }
      }
    } finally {
      set({ isLoading: false });
    }
  },

  registerOrderLocally: (order: Pedido) => {
    set((state) => {
      const updated = [order, ...state.orders.filter((o) => o.id !== order.id)];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (!localStorage.getItem(SHIFT_START_KEY)) {
          localStorage.setItem(SHIFT_START_KEY, new Date().toISOString());
        }
      }
      return { orders: updated };
    });
  },

  updateOrderStatus: async (id: string, estado: Pedido['estado']) => {
    // Optimistic update
    set((state) => {
      const updated = state.orders.map((o) => (o.id === id ? { ...o, estado } : o));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { orders: updated };
    });

    try {
      await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado }),
      });
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  },

  getSummary: (): CorteTurnoSummary => {
    const { orders, shiftStartTime } = get();

    let totalVentas = 0;
    let totalTacos = 0;
    let pedidosPorVoz = 0;
    const tacoMap = new Map<string, { count: number; total: number; categoria: string }>();

    for (const order of orders) {
      // Don't sum cancelled orders
      if (order.estado === 'cancelado') continue;

      totalVentas += Number(order.total) || 0;
      if (order.transcripcion_voz) pedidosPorVoz++;

      if (Array.isArray(order.detalles_orden)) {
        for (const item of order.detalles_orden) {
          const qty = Number(item.cantidad) || 0;
          const precio = Number(item.taco?.precio) || 0;
          const nombre = item.taco?.nombre || 'Taco Especial';
          const categoria = item.taco?.categoria || 'res';

          totalTacos += qty;

          const existing = tacoMap.get(nombre) || { count: 0, total: 0, categoria };
          existing.count += qty;
          existing.total += qty * precio;
          tacoMap.set(nombre, existing);
        }
      }
    }

    const activeOrders = orders.filter((o) => o.estado !== 'cancelado');
    const ticketPromedio = activeOrders.length > 0 ? totalVentas / activeOrders.length : 0;

    const desgloseTacos: TacoSalesBreakdown[] = Array.from(tacoMap.entries())
      .map(([nombre, data]) => ({
        nombre,
        cantidad: data.count,
        total: data.total,
        categoria: data.categoria,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return {
      totalVentas,
      totalPedidos: activeOrders.length,
      totalTacos,
      ticketPromedio,
      pedidosPorVoz,
      desgloseTacos,
      fechaInicioTurno: shiftStartTime,
      fechaCorte: new Date().toISOString(),
    };
  },

  cerrarTurno: async () => {
    const summary = get().getSummary();

    // Reset local orders
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      const newStartTime = new Date().toISOString();
      localStorage.setItem(SHIFT_START_KEY, newStartTime);
      set({ orders: [], shiftStartTime: newStartTime });
    }

    try {
      await fetch('/api/pedidos', { method: 'DELETE' });
    } catch (err) {
      console.warn('Error clearing server orders:', err);
    }

    return summary;
  },
}));
