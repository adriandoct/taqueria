'use client';

import { create } from 'zustand';
import { CartItem, Taco } from '@/lib/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (taco: Taco, cantidad?: number, especificaciones?: string) => void;
  removeItem: (tacoId: string, especificaciones?: string) => void;
  updateQuantity: (tacoId: string, especificaciones: string, delta: number) => void;
  updateSpecs: (tacoId: string, oldSpecs: string, newSpecs: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (taco, cantidad = 1, especificaciones = '') => {
    const cleanSpecs = (especificaciones || '').trim();
    const qty = Math.max(1, Math.floor(cantidad));

    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.taco.id === taco.id && (i.especificaciones || '').trim() === cleanSpecs
      );

      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          cantidad: newItems[existingIndex].cantidad + qty,
        };
        return { items: newItems };
      }

      return {
        items: [...state.items, { taco, cantidad: qty, especificaciones: cleanSpecs }],
      };
    });
  },

  removeItem: (tacoId, especificaciones) => {
    set((state) => ({
      items: state.items.filter((i) => {
        if (especificaciones !== undefined) {
          return !(i.taco.id === tacoId && (i.especificaciones || '').trim() === especificaciones.trim());
        }
        return i.taco.id !== tacoId;
      }),
    }));
  },

  updateQuantity: (tacoId, especificaciones, delta) => {
    const cleanSpecs = (especificaciones || '').trim();
    set((state) => {
      const updated = state.items
        .map((i) => {
          if (i.taco.id === tacoId && (i.especificaciones || '').trim() === cleanSpecs) {
            const newQty = i.cantidad + delta;
            return newQty > 0 ? { ...i, cantidad: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
      return { items: updated };
    });
  },

  updateSpecs: (tacoId, oldSpecs, newSpecs) => {
    const cleanOld = (oldSpecs || '').trim();
    const cleanNew = (newSpecs || '').trim();
    set((state) => ({
      items: state.items.map((i) =>
        i.taco.id === tacoId && (i.especificaciones || '').trim() === cleanOld
          ? { ...i, especificaciones: cleanNew }
          : i
      ),
    }));
  },

  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  total: () => {
    return get().items.reduce((sum, item) => sum + item.taco.precio * item.cantidad, 0);
  },

  itemCount: () => {
    return get().items.reduce((sum, item) => sum + item.cantidad, 0);
  },
}));
