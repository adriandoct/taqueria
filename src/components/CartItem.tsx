'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, Edit3, Check, Tag } from 'lucide-react';
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
    updateSpecs(item.taco.id, item.especificaciones, specsText.trim());
    setEditingSpecs(false);
  };

  const specsList = (item.especificaciones || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-3 p-3.5 rounded-2xl"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Image */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
        <Image
          src={item.taco.imagen_url}
          alt={item.taco.nombre}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-1.5">
          <h4 className="text-white font-bold text-sm leading-tight pr-2">{item.taco.nombre}</h4>
          <button
            onClick={() => removeItem(item.taco.id, item.especificaciones)}
            className="text-white/30 hover:text-red-400 transition-colors p-1 flex-shrink-0 cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Specifications / Characteristics Display & Edit */}
        <AnimatePresence mode="wait">
          {editingSpecs ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-1.5 mb-2.5"
            >
              <input
                autoFocus
                value={specsText}
                onChange={(e) => setSpecsText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveSpecs();
                  }
                }}
                placeholder="Ej: sin cebolla, con salsa verde..."
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg outline-none text-white"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(249,115,22,0.5)',
                }}
              />
              <button
                onClick={handleSaveSpecs}
                className="px-2 py-1 rounded-lg text-green-400 bg-green-500/15 border border-green-500/30 hover:bg-green-500/25 transition-colors cursor-pointer flex items-center justify-center"
                title="Guardar notas"
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
              className="mb-2.5"
            >
              {specsList.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {specsList.map((spec, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                      style={{
                        background: spec.startsWith('sin ')
                          ? 'rgba(239,68,68,0.15)'
                          : 'rgba(249,115,22,0.15)',
                        color: spec.startsWith('sin ') ? '#FCA5A5' : '#FDBA74',
                        border: spec.startsWith('sin ')
                          ? '1px solid rgba(239,68,68,0.3)'
                          : '1px solid rgba(249,115,22,0.3)',
                      }}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {spec}
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      setSpecsText(item.especificaciones);
                      setEditingSpecs(true);
                    }}
                    className="text-white/40 hover:text-orange-400 transition-colors p-0.5 cursor-pointer inline-flex items-center"
                    title="Editar notas"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSpecsText('');
                    setEditingSpecs(true);
                  }}
                  className="text-white/30 hover:text-orange-300 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Agregar notas (ej: sin cebolla)</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quantity + Price */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-0.5 border border-white/5">
            <button
              onClick={() => updateQuantity(item.taco.id, item.especificaciones, -1)}
              className="w-5 h-5 rounded flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-white font-bold text-sm w-4 text-center">{item.cantidad}</span>
            <button
              onClick={() => updateQuantity(item.taco.id, item.especificaciones, 1)}
              className="w-5 h-5 rounded flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="text-amber-400 font-bold text-sm">
            ${(item.taco.precio * item.cantidad).toFixed(0)} MXN
          </span>
        </div>
      </div>
    </motion.div>
  );
}
