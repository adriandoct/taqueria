'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, Edit3, Check } from 'lucide-react';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/lib/types';
import { useCart } from '@/hooks/useCart';

interface CartItemProps {
  item: CartItemType;
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeItem, updateSpecs } = useCart();
  const [editingSpecs, setEditingSpecs] = useState(false);
  const [specsText, setSpecsText] = useState(item.especificaciones);

  const handleSaveSpecs = () => {
    updateSpecs(item.taco.id, item.especificaciones, specsText);
    setEditingSpecs(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-3 p-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Image */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={item.taco.imagen_url}
          alt={item.taco.nombre}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-white font-semibold text-sm truncate pr-2">{item.taco.nombre}</h4>
          <button
            onClick={() => removeItem(item.taco.id)}
            className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Specs */}
        <AnimatePresence mode="wait">
          {editingSpecs ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-1 mb-2"
            >
              <input
                autoFocus
                value={specsText}
                onChange={(e) => setSpecsText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSpecs()}
                className="flex-1 text-xs px-2 py-1 rounded-md outline-none"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(249,115,22,0.4)',
                  color: 'rgba(255,255,255,0.8)',
                }}
              />
              <button
                onClick={handleSaveSpecs}
                className="p-1 rounded-md text-green-400 hover:bg-green-400/10 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 mb-2"
            >
              <p className="text-white/35 text-xs truncate flex-1">
                {item.especificaciones || 'Sin especificaciones'}
              </p>
              <button
                onClick={() => setEditingSpecs(true)}
                className="text-white/20 hover:text-orange-400 transition-colors flex-shrink-0"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quantity + Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.taco.id, item.especificaciones, -1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-white font-bold text-sm w-4 text-center">{item.cantidad}</span>
            <button
              onClick={() => updateQuantity(item.taco.id, item.especificaciones, 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="text-amber-400 font-bold text-sm">
            ${(item.taco.precio * item.cantidad).toFixed(0)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
