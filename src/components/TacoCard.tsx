'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus, Star, Flame, Coffee } from 'lucide-react';
import { Taco } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

interface TacoCardProps {
  taco: Taco;
  index: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  alambre: '#F97316',
  taco: '#EF4444',
  suizo: '#8B5CF6',
  sincronizada: '#F59E0B',
  quesadilla: '#22C55E',
  bebida: '#0EA5E9',
  especial: '#EC4899',
};

const CATEGORY_LABELS: Record<string, string> = {
  alambre: '🔥 Alambre',
  taco: '🌮 Taco',
  suizo: '🧀 Suizo',
  sincronizada: '🫓 Sincronizada',
  quesadilla: '🫔 Quesadilla',
  bebida: '🥤 Bebida',
  especial: '⭐ Especial',
};



export function TacoCard({ taco, index }: TacoCardProps) {
  const { addItem, openCart } = useCart();
  const [specs, setSpecs] = useState('');
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(taco, 1, specs);
    setAdded(true);
    setSpecs('');
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 600);
  };

  const categoryColor = CATEGORY_COLORS[taco.categoria] || '#F97316';
  const categoryLabel = CATEGORY_LABELS[taco.categoria] || taco.categoria;
  const isBebida = taco.categoria === 'bebida';

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden cursor-default flex flex-col"
      style={{
        background: 'linear-gradient(145deg, #1A1410, #120E0A)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      whileHover={{
        y: -4,
        boxShadow: `0 20px 60px ${categoryColor}25`,
        borderColor: `${categoryColor}30`,
      }}
    >
      {/* Photo Area */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={taco.imagen_url}
          alt={taco.nombre}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onError={(e) => {
            // Fallback to emoji overlay if image fails
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(13,10,7,0.9) 100%)' }}
        />

        {/* Category Badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white z-10"
          style={{ background: `${categoryColor}CC`, backdropFilter: 'blur(8px)' }}
        >
          {categoryLabel}
        </div>

        {/* Price Badge */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-sm font-bold text-white z-10"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        >
          $<span style={{ color: '#F59E0B' }}>{taco.precio.toFixed(0)}</span>
          {taco.unidad && (
            <span className="text-white/50 text-xs font-normal ml-1">/{taco.unidad}</span>
          )}
        </div>

        {/* Hover icon */}
        {taco.categoria === 'alambre' && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          </div>
        )}
        {isBebida && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Coffee className="w-4 h-4 text-sky-400" />
          </div>
        )}
        {!isBebida && taco.categoria !== 'alambre' && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-white font-bold text-lg mb-1 leading-tight">{taco.nombre}</h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4 flex-1">
          {taco.descripcion}
        </p>

        {/* Specs Input — not shown for bebidas */}
        {!isBebida && (
          <input
            type="text"
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
            placeholder="Personaliza (ej: sin cebolla, extra queso)"
            className="w-full text-xs px-3 py-2 rounded-lg mb-3 outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = `${categoryColor}60`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          />
        )}

        {/* Add Button */}
        <motion.button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
          style={{
            background: added
              ? 'linear-gradient(135deg, #16A34A, #15803D)'
              : `linear-gradient(135deg, ${categoryColor}, ${categoryColor}CC)`,
            boxShadow: added
              ? '0 4px 20px rgba(22,163,74,0.4)'
              : `0 4px 20px ${categoryColor}30`,
          }}
          whileTap={{ scale: 0.95 }}
          animate={added ? { scale: [1, 1.05, 1] } : {}}
        >
          {added ? (
            <>✓ ¡Agregado!</>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {isBebida ? 'Agregar Bebida' : 'Agregar al Carrito'}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
