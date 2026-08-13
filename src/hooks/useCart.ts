'use client';

import { create } from 'zustand';
import { CartItem, Taco } from '@/lib/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (taco: Taco, cantidad?: number, especificaciones?: string) => void;
  removeItem: (tacoId: string) => void;
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
    set((state) => {
      const existing = state.items.find(
        (i) => i.taco.id === taco.id && i.especificaciones === especificaciones
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.taco.id === taco.id && i.especificaciones === especificaciones
              ? { ...i, cantidad: i.cantidad + cantidad }
              : i
          ),
        };
      }
      return { items: [...state.items, { taco, cantidad, especificaciones }] };
    });
  },

  removeItem: (tacoId) => {
    set((state) => ({
      items: state.items.filter((i) => i.taco.id !== tacoId),
    }));
  },

  updateQuantity: (tacoId, especificaciones, delta) => {
    set((state) => {
      const updated = state.items.map((i) => {
        if (i.taco.id === tacoId && i.especificaciones === especificaciones) {
          const newQty = i.cantidad + delta;
          return newQty > 0 ? { ...i, cantidad: newQty } : null;
        }
        return i;
      }).filter(Boolean) as CartItem[];
      return { items: updated };
    });
  },

  updateSpecs: (tacoId, oldSpecs, newSpecs) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.taco.id === tacoId && i.especificaciones === oldSpecs
          ? { ...i, especificaciones: newSpecs }
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
